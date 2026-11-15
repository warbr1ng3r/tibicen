import test from 'node:test';
import assert from 'node:assert/strict';
import {
  attachNativeUsage,
  restoreNativeTaskStartup,
} from '../../scripts/evals/native-usage.ts';
import { validateRun } from '../../scripts/evals/contracts.ts';
import { loadDiagnostic } from '../../scripts/evals/fixtures.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { collectNative } from '../../scripts/evals/collect-native.ts';
import {
  basePlan,
  recordedRun,
  recordedSetupExperiment,
  skipped,
} from './helpers/recorded-quality.ts';

async function recorded() {
  const { scenario } = await loadDiagnostic('diagnostic-bare');
  const profile = {
    id: 'stub',
    agent: 'stub',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: digest('none'),
    permissionsHash: digest('controlled'),
  };
  const experiment = {
    schema: 1 as const,
    id: 'usage-control',
    sourceSha: 'a'.repeat(40),
    conditionsHash: digest('recorded'),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [profile],
    repeats: 1,
    limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
    order: (['tibicen', 'baseline'] as const).map((variant) => ({
      id: variant,
      scenarioId: scenario.id,
      profileId: profile.id,
      variant,
      repeat: 1,
    })),
  };
  const pass = { status: 'pass' as const, durationMs: 10 };
  const result = {
    schema: 1 as const,
    id: 'tibicen',
    scenarioId: scenario.id,
    profileId: profile.id,
    variant: 'tibicen' as const,
    started: true,
    launch: pass,
    setup: pass,
    task: pass,
  };
  const event = (
    seq: number,
    stage: 'launch' | 'setup' | 'task',
    kind: string,
    data: unknown,
  ) => ({
    schema: 1,
    experimentId: experiment.id,
    attemptId: result.id,
    seq,
    elapsedMs: seq,
    stage,
    kind,
    data,
  });
  return validateRun(
    experiment,
    scenario,
    result,
    [
      event(0, 'launch', 'scenario-started', {}),
      event(1, 'launch', 'stage-finished', pass),
      event(2, 'setup', 'stage-finished', pass),
      event(3, 'task', 'assertion', {
        id: 'task',
        expectedHash: digest('x'),
        actualHash: digest('x'),
      }),
      event(4, 'task', 'stage-finished', pass),
    ],
    [
      {
        schema: 1,
        id: 'task-result',
        attemptId: result.id,
        stage: 'task',
        scope: 'task',
        verdict: 'pass',
        reason: 'recorded-only',
        evidence: [3],
      },
    ],
  );
}
test('native usage adds cumulative stage tokens, retains outcomes and remaps linked grade evidence', async () => {
  const run = await recorded(),
    before = digest(run);
  const enriched = attachNativeUsage(run, [
    {
      stage: 'setup',
      records: [
        {
          type: 'turn.completed',
          usage: { input_tokens: 10, output_tokens: 2, cached_input_tokens: 7 },
        },
      ],
    },
    {
      stage: 'setup',
      records: [
        {
          type: 'turn.completed',
          usage: { input_tokens: 20, output_tokens: 3 },
        },
      ],
    },
    {
      stage: 'task',
      records: [
        {
          type: 'turn.completed',
          usage: { input_tokens: 5, output_tokens: 1 },
        },
      ],
    },
  ]);
  assert.equal(digest(run), before);
  assert.deepEqual(enriched.result, run.result);
  const usage = enriched.events.filter((event) => event.kind === 'usage');
  assert.deepEqual(
    usage.map((event) => event.data),
    [
      { costUsd: null, inputTokens: 30, outputTokens: 5 },
      { costUsd: null, inputTokens: 5, outputTokens: 1 },
    ],
  );
  assert.equal(
    enriched.events[enriched.grades[0].evidence[0]].kind,
    'assertion',
  );
  assert.throws(
    () => attachNativeUsage(enriched, [{ stage: 'task', records: [] }]),
    { code: 'invalid-native-usage' },
  );
});
test('missing, duplicate, negative or failed session usage cannot invent a complete total', async () => {
  for (const records of [
    [],
    [{ type: 'turn.failed' }],
    [{ type: 'turn.completed', usage: { input_tokens: -1, output_tokens: 2 } }],
    [
      { type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } },
      { type: 'turn.completed', usage: { input_tokens: 1, output_tokens: 1 } },
    ],
  ]) {
    const run = attachNativeUsage(await recorded(), [
      {
        stage: 'setup',
        records: [
          {
            type: 'turn.completed',
            usage: { input_tokens: 10, output_tokens: 2 },
          },
        ],
      },
      { stage: 'setup', records },
    ]);
    assert.deepEqual(run.events.find((event) => event.kind === 'usage')!.data, {
      costUsd: null,
      inputTokens: null,
      outputTokens: null,
    });
  }
});

test('native task timing restores startup from retained host boundaries without replacing raw records', async () => {
  const original = await recorded(),
    hash = digest(original);
  const corrected = restoreNativeTaskStartup(original);
  assert.equal(corrected.result.task.durationMs, 2);
  assert.equal(
    corrected.result.setup.durationMs,
    original.result.setup.durationMs,
  );
  const end = corrected.events.find(
    (event) => event.stage === 'task' && event.kind === 'stage-finished',
  );
  assert(end?.kind === 'stage-finished');
  assert.equal(end.data.durationMs, 2);
  assert.equal(digest(original), hash);
});

test('model-free collection retains original runs and links both paired rows to usage evidence', async (t) => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-native-collection-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'raw'),
    output = path.join(directory, 'reports');
  await mkdir(input);
  const source = await recorded();
  const conditions = { harnessFiles: [] };
  source.experiment.conditionsHash = digest(conditions);
  await writeFile(
    path.join(input, 'frozen.json'),
    JSON.stringify({ experiment: source.experiment, conditions }),
  );
  for (const variant of ['tibicen', 'baseline'] as const) {
    const run = structuredClone(source);
    run.result.id = variant;
    run.result.variant = variant;
    for (const event of run.events) event.attemptId = variant;
    for (const grade of run.grades) grade.attemptId = variant;
    await writeFile(
      path.join(input, variant + '-run.json'),
      JSON.stringify(run),
    );
    for (const stage of ['setup', 'task'])
      for (const phase of ['proposal', 'apply'])
        await writeFile(
          path.join(input, `${variant}-${stage}-${phase}.json`),
          JSON.stringify({
            exitCode: 0,
            timedOut: false,
            records: [
              {
                type: 'turn.completed',
                usage: {
                  input_tokens: 10,
                  output_tokens: 2,
                  cached_input_tokens: 4,
                },
              },
            ],
          }),
        );
  }
  const original = await readFile(path.join(input, 'tibicen-run.json'), 'utf8');
  assert.deepEqual(await collectNative(input, output, 'unit'), {
    schema: 1,
    attempts: 2,
    sessions: 8,
    cohorts: 1,
  });
  assert.equal(
    await readFile(path.join(input, 'tibicen-run.json'), 'utf8'),
    original,
  );
  const summary = JSON.parse(
    await readFile(path.join(output, 'tibicen-unit-summary.json'), 'utf8'),
  );
  assert.equal(summary.evidenceStatus, 'unverified');
  assert.equal(summary.sessionIndex, 'legacy');
  assert.equal(summary.sourceRunHash, digest(JSON.parse(original)));
  assert.equal(
    summary.processor.frozenHash,
    digest({ experiment: source.experiment, conditions }),
  );
  assert.equal(summary.sessions.length, 4);
  assert.equal(
    summary.sessions[0].sourceHash,
    hashContent(await readFile(path.join(input, summary.sessions[0].file))),
  );
  assert.equal(summary.sessions[0].timing, null);
  assert.equal(summary.limitsOfObservation.pendingCostRub, null);
  const data = JSON.parse(
    await readFile(
      path.join(output, 'observations-unit-enriched.json'),
      'utf8',
    ),
  );
  assert.equal(data.runs.length, 2);
  assert(
    data.runs.every(
      (run: { events: { kind: string }[] }) =>
        run.events.filter((event) => event.kind === 'usage').length === 2,
    ),
  );
  const saved = await readFile(
    path.join(output, 'report-unit-enriched.json'),
    'utf8',
  );
  await assert.rejects(collectNative(input, output, 'unit'), {
    code: 'EEXIST',
  });
  assert.equal(
    await readFile(path.join(output, 'report-unit-enriched.json'), 'utf8'),
    saved,
  );
  await rm(path.join(input, 'tibicen-task-apply.json'));
  await collectNative(input, output, 'missing-session');
  const missing = JSON.parse(
    await readFile(
      path.join(output, 'observations-missing-session-enriched.json'),
      'utf8',
    ),
  );
  const missingSummary = JSON.parse(
    await readFile(
      path.join(output, 'tibicen-missing-session-summary.json'),
      'utf8',
    ),
  );
  assert.equal(missingSummary.evidenceStatus, 'incomplete');
  assert.equal(
    missingSummary.sessions.find(
      (session: { file: string }) => session.file === 'tibicen-task-apply.json',
    ).sourceHash,
    null,
  );
  assert.deepEqual(
    missing.runs[0].events.find(
      (event: { stage: string; kind: string }) =>
        event.stage === 'task' && event.kind === 'usage',
    ).data,
    { costUsd: null, inputTokens: null, outputTokens: null },
  );
  const other = await readFile(path.join(input, 'baseline-run.json'), 'utf8');
  await writeFile(path.join(input, 'tibicen-run.json'), other);
  await writeFile(path.join(input, 'baseline-run.json'), original);
  await assert.rejects(collectNative(input, output, 'swapped-slots'), {
    code: 'invalid-native-cohort',
  });
  await assert.rejects(
    readFile(path.join(output, 'report-swapped-slots-enriched.json')),
    { code: 'ENOENT' },
  );
  await writeFile(
    path.join(input, 'frozen.json'),
    JSON.stringify({
      experiment: source.experiment,
      conditions: { harnessFiles: [], changed: true },
    }),
  );
  await assert.rejects(collectNative(input, output, 'changed-conditions'), {
    code: 'invalid-native-cohort',
  });
});

test('collector enriches setup-only records without inventing baseline or task results', async (t) => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-setup-collection-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'raw'),
    output = path.join(directory, 'reports');
  await mkdir(input);
  const { experiment, scenarios } = recordedSetupExperiment();
  const conditions = {
    plans: Object.fromEntries(
      scenarios.map((scenario) => [scenario.id, basePlan]),
    ),
  };
  experiment.conditionsHash = digest(conditions);
  await writeFile(
    path.join(input, 'frozen.json'),
    JSON.stringify({ experiment, conditions }),
  );
  const originals = [];
  for (const [index, scenario] of scenarios.entries()) {
    const run = recordedRun({ experiment, scenario }, index, {
      task: { ...skipped, reason: 'contained-setup-only' },
    });
    const filename = path.join(input, run.result.id + '-run.json');
    const original = JSON.stringify(run);
    await writeFile(filename, original);
    originals.push({ filename, original });
    for (const phase of ['proposal', 'apply'])
      await writeFile(
        path.join(input, `${run.result.id}-setup-${phase}.json`),
        JSON.stringify({
          exitCode: 0,
          timedOut: false,
          records: [
            {
              type: 'turn.completed',
              usage: { input_tokens: 10, output_tokens: 2 },
            },
          ],
        }),
      );
  }
  assert.deepEqual(await collectNative(input, output, 'setup-only'), {
    schema: 1,
    attempts: 2,
    sessions: 4,
    cohorts: 2,
  });
  const report = JSON.parse(
    await readFile(
      path.join(output, 'report-setup-only-enriched.json'),
      'utf8',
    ),
  );
  assert.equal(report.meaning, 'experimental-observations');
  for (const cohort of report.cohorts) {
    assert.equal(cohort.setupOnlyTibicen, true);
    assert.deepEqual(cohort.pairs, []);
    assert.equal(cohort.variants.baseline.planned, 0);
    assert.equal(cohort.variants.baseline.observed.setupSuccess.rate, null);
    assert.equal(cohort.attempts.length, 1);
    const row = cohort.attempts[0].record;
    assert.equal(row.observed.setup.status, 'pass');
    assert.equal(row.observed.task.status, 'skip');
    assert.equal(row.evaluated.setup.reason, 'missing-quality-review');
    assert.deepEqual(row.measurements.usage.setup, {
      costUsd: null,
      inputTokens: 20,
      outputTokens: 4,
    });
  }
  for (const { filename, original } of originals)
    assert.equal(await readFile(filename, 'utf8'), original);
  for (const { filename } of originals) {
    const id = path.basename(filename, '-run.json'),
      summary = JSON.parse(
        await readFile(
          path.join(output, id + '-setup-only-summary.json'),
          'utf8',
        ),
      );
    assert.equal(summary.evidenceStatus, 'unverified');
    assert.equal(summary.sessions.length, 2);
    assert(
      summary.sessions.every(
        (session: { stage: string }) => session.stage === 'setup',
      ),
    );
  }
});

test('indexed summaries bind session wall observations and never call missing or altered traces complete', async (t) => {
  const directory = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-summary-index-'),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const input = path.join(directory, 'raw'),
    output = path.join(directory, 'reports');
  await mkdir(input);
  const source = await recorded(),
    conditions = { nativeProtocol: 2, maxModelSessions: 2, harnessFiles: [] };
  source.experiment.conditionsHash = digest(conditions);
  await writeFile(
    path.join(input, 'frozen.json'),
    JSON.stringify({ experiment: source.experiment, conditions }),
  );
  const timing = {
    startedAt: '2026-11-14T08:00:00.000Z',
    endedAt: '2026-11-14T08:00:01.000Z',
    durationMs: 1000,
    privateMetadata: 'Must not enter the compact summary.',
  };
  for (const variant of ['tibicen', 'baseline'] as const) {
    const run = structuredClone(source);
    run.result.id = variant;
    run.result.variant = variant;
    const file = `${variant}-setup-proposal-0.json`,
      trace = JSON.stringify({ exitCode: 0, timedOut: false, timing }),
      entry = {
        stage: 'setup',
        phase: 'setup-proposal',
        file,
        hash: hashContent(trace),
      };
    run.events.splice(2, 0, {
      ...run.events[2],
      kind: 'assertion',
      data: {
        id: 'native-session-0',
        expectedHash: digest(entry),
        actualHash: digest(entry),
      },
    });
    run.events.forEach((event, index) => {
      event.attemptId = variant;
      event.seq = index;
      event.elapsedMs = index;
    });
    run.grades.forEach((grade) => {
      grade.attemptId = variant;
      grade.evidence = grade.evidence.map((seq) => (seq >= 2 ? seq + 1 : seq));
    });
    await writeFile(path.join(input, file), trace);
    await writeFile(
      path.join(input, variant + '-run.json'),
      JSON.stringify(run),
    );
    await writeFile(
      path.join(input, variant + '-sessions.json'),
      JSON.stringify({ schema: 1, runHash: digest(run), sessions: [entry] }),
    );
    await writeFile(
      path.join(input, variant + '-evidence.json'),
      JSON.stringify({ schema: 1, runHash: digest(run), evidence: [] }),
    );
  }
  await collectNative(input, output, 'complete');
  const summary = JSON.parse(
    await readFile(path.join(output, 'tibicen-complete-summary.json'), 'utf8'),
  );
  assert.equal(summary.evidenceStatus, 'complete');
  assert.equal(summary.sessionIndex, 'verified');
  assert.deepEqual(summary.sessions[0].timing, {
    startedAt: timing.startedAt,
    endedAt: timing.endedAt,
    durationMs: timing.durationMs,
  });
  assert(!JSON.stringify(summary).includes('privateMetadata'));
  const file = path.join(input, 'tibicen-setup-proposal-0.json');
  await writeFile(
    file,
    JSON.stringify({ exitCode: 0, timedOut: false, timing: null }),
  );
  await assert.rejects(collectNative(input, output, 'altered'), {
    code: 'invalid-native-cohort',
  });
  await assert.rejects(
    readFile(path.join(output, 'tibicen-altered-summary.json')),
    { code: 'ENOENT' },
  );
  await rm(file);
  await collectNative(input, output, 'missing-indexed-trace');
  const missing = JSON.parse(
    await readFile(
      path.join(output, 'tibicen-missing-indexed-trace-summary.json'),
      'utf8',
    ),
  );
  assert.equal(missing.evidenceStatus, 'incomplete');
  assert.equal(missing.sessions[0].sourceHash, null);
  assert.deepEqual(missing.result, summary.result);
});
