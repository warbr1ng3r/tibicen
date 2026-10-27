import { assert } from '../../../core/contracts.ts';
import { loadBlockedProfile } from '../probe-cli.ts';
import type { NativeOutput } from '../contracts.ts';

const record = (value: unknown): Record<string, unknown> | undefined =>
  value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;
const text = (value: unknown): value is string =>
  typeof value === 'string' && value.length > 0;

// Installed 0.16.9 stream-json: mapped session events, then one terminal result.
export function parseZCode(output: string): NativeOutput {
  const rows = output
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch {
        /* Reject without echoing native data. */
      }
      const parsed = record(value);
      assert(
        parsed && text(parsed.type),
        'invalid-native-output',
        'Expected ZCode stream-json objects.',
      );
      return parsed;
    });
  const results = rows.filter((row) => row.type === 'result');
  assert(
    results.length <= 1 && (!results.length || rows.at(-1) === results[0]),
    'invalid-native-output',
    'ZCode result must terminate the stream.',
  );
  const events = rows.filter((row) => row.type !== 'result');
  const starts = events.filter((row) => row.type === 'turn.started');
  assert(
    starts.length <= 1,
    'invalid-native-output',
    'Select one ZCode turn per native session.',
  );
  const start = starts[0];
  if (start)
    assert(
      text(start.sessionId) && text(start.turnId),
      'invalid-native-output',
      'ZCode start requires session and turn identities.',
    );
  let sequence = -1;
  for (const event of events) {
    assert(
      text(event.sessionId) &&
        Number.isSafeInteger(event.seq) &&
        Number(event.seq) > sequence &&
        record(event.payload),
      'invalid-native-output',
      'ZCode events require ordered session envelopes.',
    );
    sequence = Number(event.seq);
    if (start)
      assert(
        event.sessionId === start.sessionId &&
          (!event.turnId || event.turnId === start.turnId) &&
          (![
            'turn.started',
            'turn.completed',
            'turn.failed',
            'tool.updated',
          ].includes(String(event.type)) ||
            event.turnId === start.turnId),
        'invalid-native-output',
        'ZCode events must belong to the selected session and turn.',
      );
  }
  const summary = results[0];
  if (start && summary)
    assert(
      summary.sessionId === start.sessionId &&
        summary.turnId === start.turnId &&
        typeof summary.response === 'string',
      'invalid-native-output',
      'ZCode result must match the observed turn.',
    );
  const ends = events.filter((row) => row.type === 'turn.completed');
  const completed = Boolean(
    start &&
    summary &&
    ends.length === 1 &&
    Number(ends[0].seq) > Number(start.seq) &&
    record(ends[0].payload)?.resultType === 'success' &&
    record(ends[0].payload)?.response === summary.response &&
    !events.some((row) => row.type === 'turn.failed'),
  );
  const commands: NativeOutput['commands'] = [];
  const scheduled = new Map<string, { command: string; started: boolean }>();
  for (const event of events) {
    if (
      !start ||
      event.type !== 'tool.updated' ||
      Number(event.seq) <= Number(start.seq) ||
      (ends.length === 1 && Number(event.seq) >= Number(ends[0].seq))
    )
      continue;
    const payload = record(event.payload)!;
    if (
      !text(payload.toolCallId) ||
      payload.source === 'subagent' ||
      payload.background === true
    )
      continue;
    if (payload.kind === 'scheduled') {
      const input = record(payload.input);
      assert(
        !scheduled.has(payload.toolCallId),
        'invalid-native-output',
        'Duplicate ZCode tool identity.',
      );
      if (payload.toolName === 'Bash' && text(input?.command))
        scheduled.set(payload.toolCallId, {
          command: input.command,
          started: false,
        });
    } else if (payload.kind === 'started') {
      const item = scheduled.get(payload.toolCallId);
      if (item) item.started = true;
    } else if (payload.kind === 'result') {
      const item = scheduled.get(payload.toolCallId),
        result = record(payload.result);
      scheduled.delete(payload.toolCallId);
      if (
        !item?.started ||
        result?.success !== true ||
        typeof result.content !== 'string'
      )
        continue;
      let value: unknown;
      try {
        value = JSON.parse(result.content);
      } catch {
        /* Text-only output has no verified command result shape. */
      }
      const bash = record(value);
      if (
        bash &&
        typeof bash.stdout === 'string' &&
        typeof bash.stderr === 'string' &&
        bash.interrupted === false &&
        ['completed', 'failed'].includes(String(bash.status)) &&
        Number.isSafeInteger(bash.exitCode) &&
        (bash.status !== 'failed' || bash.exitCode !== 0) &&
        ['timedOut', 'cancelled', 'stdoutTruncated', 'stderrTruncated'].every(
          (key) => bash[key] === undefined || bash[key] === false,
        ) &&
        (result.truncated === undefined || result.truncated === false)
      ) {
        commands.push({
          command: item.command,
          output: bash.stdout,
          exitCode: Number(bash.exitCode),
          toolUseId: payload.toolCallId,
        });
      }
    } else if (payload.kind === 'error') {
      scheduled.delete(payload.toolCallId);
    }
  }
  const usage = record(summary?.usage);
  const count = (key: string) =>
    start && Number.isSafeInteger(usage?.[key]) && Number(usage?.[key]) >= 0
      ? Number(usage![key])
      : null;
  return {
    started: Boolean(start),
    completed,
    messages: start && summary ? [String(summary.response)] : [],
    // Keep the lifecycle projection; raw model inputs and arbitrary metadata are not copied.
    records: events
      .filter((event) =>
        ['turn.started', 'turn.completed', 'turn.failed'].includes(
          String(event.type),
        ),
      )
      .map((event) => ({
        type: event.type,
        sessionId: event.sessionId,
        turnId: event.turnId,
      })),
    commands,
    usage: {
      inputTokens: count('inputTokens'),
      outputTokens: count('outputTokens'),
    },
  };
}

// A parser is not evidence of protected subscription startup or filesystem isolation.
export const loadZCodeProfile = (filename: string) =>
  loadBlockedProfile('zcode', filename);
