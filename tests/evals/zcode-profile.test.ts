import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {
  parseZCode,
  loadZCodeProfile,
} from '../../scripts/evals/profiles/zcode/profile.ts';
import { preflightZCode } from '../../scripts/evals/profiles/zcode/preflight.ts';

const event = (
  type: string,
  seq: number,
  payload: Record<string, unknown>,
) => ({
  type,
  seq,
  sessionId: 'synthetic-session',
  turnId: 'synthetic-turn',
  payload,
});
const response = '{"summary":"Synthetic proposal"}';
function transcript(): Record<string, unknown>[] {
  return [
    event('turn.started', 1, {
      turnNumber: 1,
      input: 'Synthetic prompt, not a model call.',
    }),
    event('tool.updated', 2, {
      kind: 'scheduled',
      toolCallId: 'bash-1',
      toolName: 'Bash',
      input: { command: 'cat AGENTS.md' },
    }),
    event('tool.updated', 3, {
      kind: 'started',
      toolCallId: 'bash-1',
      startedAt: 1,
    }),
    event('tool.updated', 4, {
      kind: 'result',
      toolCallId: 'bash-1',
      duration: 1,
      result: {
        success: true,
        content: JSON.stringify({
          stdout: 'Known synthetic rules.\n',
          stderr: '',
          status: 'completed',
          exitCode: 0,
          interrupted: false,
          stdoutTruncated: false,
          stderrTruncated: false,
        }),
      },
    }),
    event('turn.completed', 5, { response, resultType: 'success' }),
    {
      type: 'result',
      sessionId: 'synthetic-session',
      turnId: 'synthetic-turn',
      response,
      usage: { inputTokens: 7, outputTokens: 3 },
      eventCount: 5,
    },
  ];
}
const stream = (rows: unknown[]) =>
  rows.map((row) => JSON.stringify(row)).join('\n') + '\n';

test('ZCode stream-json binds observed start, successful completion, messages and structured Bash results', () => {
  const parsed = parseZCode(stream(transcript()));
  assert.equal(parsed.started, true);
  assert.equal(parsed.completed, true);
  assert.deepEqual(parsed.messages, [response]);
  assert.deepEqual(parsed.usage, { inputTokens: 7, outputTokens: 3 });
  assert.deepEqual(parsed.commands, [
    {
      command: 'cat AGENTS.md',
      output: 'Known synthetic rules.\n',
      exitCode: 0,
      toolUseId: 'bash-1',
    },
  ]);
  assert.deepEqual(
    parsed.records.map((row) => row.type),
    ['turn.started', 'turn.completed'],
  );
  assert(!JSON.stringify(parsed.records).includes('Synthetic prompt'));
});

test('result-only, partial and cancelled streams cannot invent successful execution', () => {
  const rows = transcript();
  assert.equal(parseZCode(stream([rows.at(-1)])).started, false);
  for (const partial of [
    rows.slice(0, -1),
    [rows[0], rows.at(-1)],
    rows.slice(1),
  ])
    assert.equal(parseZCode(stream(partial)).completed, false);
  const cancelled = transcript();
  cancelled[4] = event('turn.completed', 5, {
    response,
    resultType: 'cancelled',
  });
  assert.equal(parseZCode(stream(cancelled)).completed, false);
  const failed = transcript();
  failed[4] = event('turn.failed', 5, { error: { code: 'synthetic-error' } });
  assert.equal(parseZCode(stream(failed)).completed, false);
});

test('an explicitly failed Bash result cannot confirm successful reading with exit zero', () => {
  const rows = transcript();
  const payload = rows[3].payload as Record<string, unknown>;
  const result = payload.result as Record<string, unknown>;
  const bash = JSON.parse(String(result.content));
  bash.status = 'failed';
  result.content = JSON.stringify(bash);
  assert.deepEqual(parseZCode(stream(rows)).commands, []);
  bash.exitCode = 1;
  result.content = JSON.stringify(bash);
  assert.equal(parseZCode(stream(rows)).commands[0].exitCode, 1);
});

test('malformed, cross-session, reordered and ambiguous streams reject with a fixed error', () => {
  for (const rows of [
    [null],
    [[]],
    ['not-an-object'],
    [{ method: 'session/event', params: {} }],
  ])
    assert.throws(() => parseZCode(stream(rows)), {
      code: 'invalid-native-output',
    });
  const secret = 'sk-synthetic-private-value-1234567890';
  assert.throws(
    () => parseZCode(secret),
    (error: unknown) => {
      assert(!String(error).includes(secret));
      return true;
    },
  );
  for (const mutation of [
    (rows: Record<string, unknown>[]) => {
      rows[2].sessionId = 'other-session';
    },
    (rows: Record<string, unknown>[]) => {
      rows[4].turnId = 'other-turn';
    },
    (rows: Record<string, unknown>[]) => {
      rows[4].seq = 0;
    },
    (rows: Record<string, unknown>[]) => {
      rows.push(rows[0]);
    },
    (rows: Record<string, unknown>[]) => {
      rows.push(rows.at(-1)!);
    },
    (rows: Record<string, unknown>[]) => {
      rows.splice(1, 0, event('turn.started', 2, {}));
    },
  ]) {
    const rows = transcript();
    mutation(rows);
    assert.throws(() => parseZCode(stream(rows)), {
      code: 'invalid-native-output',
    });
  }
});

test('proposal text, missing tool start and unstructured or truncated results are not command/loading evidence', () => {
  assert.deepEqual(
    parseZCode(stream([transcript()[0], transcript().at(-1)])).commands,
    [],
  );
  for (const mutation of [
    (rows: Record<string, unknown>[]) => {
      rows.splice(2, 1);
    },
    (rows: Record<string, unknown>[]) => {
      rows[3].payload = {
        kind: 'result',
        toolCallId: 'bash-1',
        result: { success: true, content: 'Self-reported cat AGENTS.md' },
      };
    },
    (rows: Record<string, unknown>[]) => {
      rows[3].payload = {
        kind: 'result',
        toolCallId: 'bash-1',
        result: {
          success: true,
          truncated: true,
          content: JSON.stringify({
            stdout: 'partial',
            stderr: '',
            exitCode: 0,
            status: 'completed',
            interrupted: false,
          }),
        },
      };
    },
  ]) {
    const rows = transcript();
    mutation(rows);
    assert.deepEqual(parseZCode(stream(rows)).commands, []);
  }
  const missingUsage = transcript();
  delete missingUsage[5].usage;
  assert.deepEqual(parseZCode(stream(missingUsage)).usage, {
    inputTokens: null,
    outputTokens: null,
  });
});

test('ZCode fake discovery runs only version/help in an empty data home and stays blocked even with a parser', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-zcode-profile-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const entry = path.join(root, 'fake-zcode.cjs'),
    log = path.join(root, 'calls.jsonl');
  await writeFile(
    entry,
    `const fs=require('node:fs');fs.appendFileSync(${JSON.stringify(log)},JSON.stringify({argv:process.argv.slice(2),home:process.env.HOME,data:process.env.ZCODE_DATA_BASE_DIR,entries:fs.readdirSync(process.env.HOME),names:Object.keys(process.env)})+'\\n');console.log(process.argv[2]==='--version'?'0.16.9':'Synthetic ZCode help');\n`,
  );
  const probe = await preflightZCode(entry);
  assert.equal(probe.modelRequests, 0);
  assert.equal(probe.preflight.status, 'blocked');
  assert.equal(probe.preflight.authProtected, false);
  assert(probe.blockedBy.includes('zcode-auth-read-boundary-unverified'));
  assert(
    probe.blockedBy.includes('zcode-filesystem-write-boundary-unverified'),
  );
  const calls = (await readFile(log, 'utf8'))
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.deepEqual(
    calls.map((call) => call.argv),
    [['--version'], ['--help']],
  );
  for (const call of calls) {
    assert.notEqual(call.home, os.homedir());
    assert.equal(call.data, call.home);
    assert.deepEqual(call.entries, []);
    assert(
      !call.names.some((name: string) =>
        /TOKEN|SECRET|PASSWORD|API_KEY|CREDENTIAL|AUTH/i.test(name),
      ),
    );
  }
  const file = path.join(root, 'preflight.json');
  await writeFile(file, JSON.stringify(probe));
  const profile = await loadZCodeProfile(file);
  assert.equal(profile.state, 'blocked');
  assert(!('invocation' in profile));
  assert(!('prepare' in profile));
  await writeFile(
    file,
    JSON.stringify({
      ...probe,
      preflight: {
        status: 'ready',
        startupControlled: true,
        authProtected: true,
        processTreeControlled: true,
        isolation: 'controlled',
      },
    }),
  );
  const cached = await loadZCodeProfile(file);
  assert.equal(cached.state, 'blocked');
  assert.equal(
    cached.preflight.reason,
    'native-process-containment-unavailable',
  );
});
