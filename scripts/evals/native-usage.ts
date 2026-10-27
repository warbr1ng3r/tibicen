import { assert } from '../core/contracts.ts';
import { validateRun, validateEvent } from './contracts.ts';
import type { EvalEvent } from './contracts.ts';
import type { LinkedRun } from './quality.ts';

// The first native driver started the task duration after readiness. Its retained host boundaries
// cover the fresh task startup too. Apply only to that identified source snapshot, keeping raw data.
export function restoreNativeTaskStartup(input: LinkedRun) {
  const run = structuredClone(
    validateRun(
      input.experiment,
      input.scenario,
      input.result,
      input.events,
      input.grades,
    ),
  );
  if (run.result.task.status === 'skip') return run;
  const before = run.events.find(
    (event) => event.stage === 'setup' && event.kind === 'stage-finished',
  );
  const end = run.events.find(
    (event) => event.stage === 'task' && event.kind === 'stage-finished',
  );
  assert(
    before && end,
    'invalid-native-timing',
    'Executed task needs observed host boundaries.',
  );
  run.result.task = {
    ...run.result.task,
    durationMs: end.elapsedMs - before.elapsedMs,
  };
  for (const event of run.events)
    if (
      event.stage === 'task' &&
      (event.kind === 'stage-finished' || event.kind === 'driver-finished')
    )
      event.data = { ...event.data, durationMs: run.result.task.durationMs };
  return validateRun(
    run.experiment,
    run.scenario,
    run.result,
    run.events,
    run.grades,
  );
}

// Read-only enrichment of already observed runs, not another model call or a changed outcome.
export function attachNativeUsage(
  input: LinkedRun,
  sessions: {
    stage: 'setup' | 'task';
    records?: unknown[];
    usage?: { inputTokens: number | null; outputTokens: number | null };
  }[],
) {
  const run = structuredClone(
    validateRun(
      input.experiment,
      input.scenario,
      input.result,
      input.events,
      input.grades,
    ),
  );
  const totals = new Map<
    'setup' | 'task',
    { inputTokens: number | null; outputTokens: number | null }
  >();
  for (const stage of ['setup', 'task'] as const) {
    const records = sessions.filter((session) => session.stage === stage);
    if (!records.length) continue;
    const values = records.map((session) => {
      if (session.usage) {
        const { inputTokens, outputTokens } = session.usage;
        return typeof inputTokens === 'number' &&
          typeof outputTokens === 'number' &&
          Number.isSafeInteger(inputTokens) &&
          inputTokens >= 0 &&
          Number.isSafeInteger(outputTokens) &&
          outputTokens >= 0
          ? { inputTokens, outputTokens }
          : null;
      }
      const completed = (session.records ?? []).filter(
        (record): record is { type: string; usage?: Record<string, unknown> } =>
          !!record &&
          typeof record === 'object' &&
          'type' in record &&
          record.type === 'turn.completed',
      );
      const usage = completed.length === 1 ? completed[0].usage : undefined;
      return usage &&
        [usage.input_tokens, usage.output_tokens].every(
          (value) => Number.isSafeInteger(value) && Number(value) >= 0,
        )
        ? {
            inputTokens: Number(usage.input_tokens),
            outputTokens: Number(usage.output_tokens),
          }
        : null;
    });
    assert(
      run.result[stage].status !== 'skip' ||
        run.events.some(
          (event) =>
            event.stage === stage &&
            event.kind === 'checkpoint' &&
            event.data.point === 'start',
        ),
      'invalid-native-usage',
      'Usage needs an observed stage, including a proposal later refused.',
    );
    totals.set(
      stage,
      values.every((value) => value !== null)
        ? {
            inputTokens: values.reduce(
              (sum, value) => sum + value!.inputTokens,
              0,
            ),
            outputTokens: values.reduce(
              (sum, value) => sum + value!.outputTokens,
              0,
            ),
          }
        : { inputTokens: null, outputTokens: null },
    );
  }
  const events: EvalEvent[] = [],
    mapping = new Map<number, number>();
  for (const event of run.events) {
    const total =
      event.stage === 'launch' ? undefined : totals.get(event.stage);
    if (event.kind === 'stage-finished' && total) {
      assert(
        !run.events.some(
          (other) => other.stage === event.stage && other.kind === 'usage',
        ),
        'invalid-native-usage',
        'Do not double count an existing usage snapshot.',
      );
      events.push(
        validateEvent({
          ...event,
          seq: events.length,
          kind: 'usage',
          data: { costUsd: null, ...total },
        }),
      );
    }
    mapping.set(event.seq, events.length);
    events.push({ ...event, seq: events.length });
  }
  const grades = run.grades.map((grade) => ({
    ...grade,
    evidence: grade.evidence.map((seq) => mapping.get(seq)!),
  }));
  return validateRun(run.experiment, run.scenario, run.result, events, grades);
}
