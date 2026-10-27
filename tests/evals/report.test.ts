import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { digest } from '../../scripts/core/contracts.ts';
import { buildPairedReport } from '../../scripts/evals/report.ts';
import type { ReportExperiment } from '../../scripts/evals/report.ts';
import {
  basePlan,
  pairedExample,
  recordedExperiment,
  recordedRun,
  recordedSetupExperiment,
  reviewed,
  skipped,
} from './helpers/recorded-quality.ts';

test('saved paired example preserves every outcome, missing pair and invariant failure', async () => {
  const saved = JSON.parse(
    await readFile(
      new URL('../../docs/evals/calibration-paired.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(saved, pairedExample());
});

function input(repeats = 1, name = 'report'): ReportExperiment {
  const fixture = recordedExperiment(repeats, name);
  return {
    experiment: fixture.experiment,
    mode: 'calibration',
    plans: { control: structuredClone(basePlan) },
    runs: fixture.experiment.order.map((_, i) =>
      reviewed(recordedRun(fixture, i)),
    ),
  };
}

test('setup-only observations retain standalone rows and missing slots without comparison pairs', () => {
  const { experiment, scenarios } = recordedSetupExperiment();
  const run = recordedRun({ experiment, scenario: scenarios[0] }, 0, {
    task: { ...skipped, reason: 'contained-setup-only' },
  });
  const source: ReportExperiment = {
    experiment,
    mode: 'observed',
    plans: Object.fromEntries(scenarios.map((item) => [item.id, basePlan])),
    runs: [{ run }],
  };
  const report = buildPairedReport([source]);
  assert.equal(report.meaning, 'experimental-observations');
  assert(report.cohorts.every((cohort) => cohort.setupOnlyTibicen));
  assert(report.cohorts.every((cohort) => cohort.pairs.length === 0));
  const [recorded, missing] = report.cohorts;
  assert.deepEqual(recorded.attempts?.[0].record?.observed, run.result);
  assert.equal(recorded.attempts?.[0].record?.quality, null);
  assert.equal(
    recorded.attempts?.[0].record?.evaluated.setup.reason,
    'missing-quality-review',
  );
  assert.deepEqual(missing.attempts, [
    { id: experiment.order[1].id, record: null },
  ]);
  assert.equal(missing.variants.tibicen.missing, 1);
  assert(
    report.cohorts.every((cohort) => cohort.variants.baseline.planned === 0),
  );
  assert(
    report.cohorts.every(
      (cohort) => cohort.variants.baseline.observed.setupSuccess.rate === null,
    ),
  );
  const mixed = buildPairedReport([source, input()]);
  assert.equal(mixed.meaning, 'experimental-observations');
  assert.equal(mixed.cohorts.at(-1)?.pairs.length, 1);
  assert.equal(mixed.cohorts.at(-1)?.setupOnlyTibicen, undefined);
});

test('pairs keep every repeat and all three exact numerators/denominators', () => {
  const source = input(3),
    report = buildPairedReport([source]),
    cohort = report.cohorts[0];
  assert.equal(cohort.pairs.length, 3);
  assert(cohort.pairs.every((pair) => pair.complete));
  assert.deepEqual(cohort.variants.tibicen.evaluated.setupSuccess, {
    numerator: 3,
    denominator: 3,
    rate: 1,
  });
  assert.deepEqual(cohort.variants.baseline.evaluated.taskSuccessGivenSetup, {
    numerator: 3,
    denominator: 3,
    rate: 1,
  });
  assert.deepEqual(cohort.variants.tibicen.evaluated.endToEndSuccess, {
    numerator: 3,
    denominator: 3,
    rate: 1,
  });
  assert.deepEqual(cohort.pairs[0].delta, {
    setupMs: 0,
    taskMs: 0,
    costUsd: null,
  });
  assert.equal(report.meaning, 'experimental-comparison');
  assert.equal(cohort.sourceSha, source.experiment.sourceSha);
  assert.equal(cohort.experimentHash, digest(source.experiment));
});

test('before-start failure, after-start error, success and missing record remain distinct', () => {
  const source = input(3),
    fixture = recordedExperiment(3, 'report');
  source.runs = [
    {
      run: recordedRun(fixture, 0, {
        started: false,
        launch: { status: 'error', durationMs: 4, reason: 'auth-unavailable' },
        setup: skipped,
        task: skipped,
      }),
    },
    source.runs[1],
    {
      run: recordedRun(fixture, 2, {
        setup: { status: 'error', durationMs: 7, reason: 'setup-timeout' },
        task: skipped,
      }),
    },
    source.runs[3],
    source.runs[4],
  ];
  const cohort = buildPairedReport([source]).cohorts[0],
    a = cohort.variants.tibicen,
    b = cohort.variants.baseline;
  assert.equal(a.recorded, 3);
  assert.equal(a.observed.started, 2);
  assert.equal(a.observed.notStarted.error, 1);
  assert.deepEqual(a.evaluated.setupSuccess, {
    numerator: 1,
    denominator: 2,
    rate: 0.5,
  });
  assert.deepEqual(a.evaluated.taskSuccessGivenSetup, {
    numerator: 1,
    denominator: 1,
    rate: 1,
  });
  assert.deepEqual(a.evaluated.endToEndSuccess, {
    numerator: 1,
    denominator: 2,
    rate: 0.5,
  });
  assert.equal(b.planned, 3);
  assert.equal(b.recorded, 2);
  assert.equal(b.missing, 1);
  assert.equal(b.observed.notStarted.error, 0);
  assert.equal(cohort.pairs[2].baseline.record, null);
  assert.equal(cohort.pairs[2].complete, false);
  assert.equal(cohort.pairs[2].delta.setupMs, null);
  assert.equal(
    cohort.pairs[0].tibicen.record!.measurements.durationMs.setup,
    null,
  );
});

test('observed driver pass needs independent checks and never overrides an invariant failure', () => {
  const source = input(2),
    run = source.runs[0].run;
  run.grades[0] = {
    ...run.grades[0],
    verdict: 'fail',
    reason: 'write-before-approval',
  };
  source.runs[0] = reviewed(run);
  const original = structuredClone(source);
  const cohort = buildPairedReport([source]).cohorts[0];
  assert.equal(cohort.variants.tibicen.observed.endToEndSuccess.numerator, 2);
  assert.equal(cohort.variants.tibicen.evaluated.endToEndSuccess.numerator, 1);
  assert.equal(cohort.pairs[0].tibicen.record!.evaluated.setup.status, 'fail');
  assert.equal(cohort.pairs[0].tibicen.record!.observed.task.status, 'pass');
  assert.equal(cohort.pairs[0].tibicen.record!.evaluated.task.status, 'skip');
  assert.equal(cohort.invariantFailures.length, 1);
  assert.equal(cohort.invariantFailures[0].attemptId, run.result.id);
  assert.deepEqual(source, original);
});

test('missing quality or mechanical evidence cannot turn a recorded pass into acceptance', () => {
  for (const missing of ['quality', 'invariants', 'task'] as const) {
    const source = input();
    if (missing === 'quality') delete source.runs[0].quality;
    else {
      source.runs[0].run.grades = source.runs[0].run.grades.filter(
        (g) => g.scope !== missing,
      );
      source.runs[0] = reviewed(source.runs[0].run);
    }
    const row = buildPairedReport([source]).cohorts[0].pairs[0].tibicen.record!;
    assert.equal(row.observed.task.status, 'pass');
    assert.notEqual(row.evaluated.task.status, 'pass');
  }
});

test('disagreement and required missing human review remain visible, with no quality success', () => {
  const source = input();
  source.runs[0].quality!.human = structuredClone(
    source.runs[0].quality!.judge,
  );
  const human = source.runs[0].quality!.human as {
    id: string;
    kind: string;
    judgements: { verdict: string }[];
  };
  human.id = 'reference-2';
  human.kind = 'reference';
  human.judgements[0].verdict = 'fail';
  delete source.runs[1].quality!.human;
  const pair = buildPairedReport([source]).cohorts[0].pairs[0];
  assert.equal(pair.tibicen.record!.quality!.disagreements.length, 1);
  assert.equal(pair.tibicen.record!.evaluated.setup.status, 'error');
  assert(pair.baseline.record!.quality!.humanRequired);
  assert.equal(pair.baseline.record!.evaluated.setup.status, 'error');
});

for (const field of [
  'sourceSha',
  'conditions',
  'profile-version',
  'model',
  'limits',
  'scenario',
  'plan',
  'mode',
] as const)
  test('cohorts do not merge different ' + field, () => {
    const a = input(1, 'experiment-a'),
      b = input(1, 'experiment-b');
    // Empty records isolate the cohort binding without relabelling old observations.
    a.runs = [];
    b.runs = [];
    if (field === 'sourceSha') b.experiment.sourceSha = 'c'.repeat(40);
    if (field === 'conditions') b.experiment.conditionsHash = 'd'.repeat(64);
    if (field === 'profile-version') b.experiment.profiles[0].version = '2';
    if (field === 'model') b.experiment.profiles[0].model = 'different-model';
    if (field === 'limits') b.experiment.limits.taskMs = 500;
    if (field === 'scenario') b.experiment.scenarios[0].hash = 'e'.repeat(64);
    if (field === 'plan') b.plans.control.task.push('process');
    if (field === 'mode') b.mode = 'observed';
    const report = buildPairedReport([a, b]);
    assert.equal(report.cohorts.length, 2);
    assert.notEqual(report.cohorts[0].id, report.cohorts[1].id);
    assert(
      report.cohorts.every(
        (c) => c.variants.tibicen.evaluated.endToEndSuccess.rate === null,
      ),
    );
  });

test('duplicate ids, foreign runs, changed plans and mixed observation modes are rejected', () => {
  const source = input();
  assert.throws(() => buildPairedReport([source, source]), {
    code: 'invalid-eval-report',
  });
  assert.throws(
    () =>
      buildPairedReport([
        { ...source, runs: [source.runs[0], source.runs[0]] },
      ]),
    { code: 'invalid-eval-report' },
  );
  assert.throws(
    () =>
      buildPairedReport([{ ...source, runs: [input(1, 'foreign').runs[0]] }]),
    { code: 'invalid-eval-report' },
  );
  assert.throws(() => buildPairedReport([{ ...source, mode: 'observed' }]), {
    code: 'invalid-eval-report',
  });
  const changed = input();
  changed.plans.control.task.push('loading');
  assert.throws(() => buildPairedReport([changed]), {
    code: 'invalid-eval-report',
  });
  assert.throws(() => buildPairedReport([{ ...source, plans: {} }]), {
    code: 'invalid-eval-report',
  });
});

test('profiles within one frozen experiment have separate pairs and denominators', () => {
  const fixture = recordedExperiment(),
    { experiment } = fixture;
  experiment.profiles.push({
    ...experiment.profiles[0],
    id: 'stub-2',
    version: '2',
  });
  experiment.order.push(
    ...experiment.order.map((s) => ({
      ...s,
      id: s.id + '-profile-2',
      profileId: 'stub-2',
    })),
  );
  const cohorts = buildPairedReport([
    {
      experiment,
      mode: 'calibration',
      plans: { control: basePlan },
      runs: experiment.order.map((_, i) => reviewed(recordedRun(fixture, i))),
    },
  ]).cohorts;
  assert.equal(cohorts.length, 2);
  assert.notEqual(cohorts[0].profileHash, cohorts[1].profileHash);
  assert(
    cohorts.every(
      (c) => c.variants.tibicen.evaluated.setupSuccess.denominator === 1,
    ),
  );
  assert(cohorts[1].pairs[0].tibicen.id.endsWith('-profile-2'));
});

test('scenarios within one frozen experiment have separate pairs and rubric plans', () => {
  const fixture = recordedExperiment(),
    { experiment } = fixture;
  const second = { ...structuredClone(fixture.scenario), id: 'second-control' };
  experiment.scenarios.push({ id: second.id, hash: digest(second) });
  experiment.order.push(
    ...experiment.order.map((s) => ({
      ...s,
      id: s.id + '-second',
      scenarioId: second.id,
    })),
  );
  const plan = { ...basePlan, task: [...basePlan.task, 'process' as const] };
  const cohorts = buildPairedReport([
    {
      experiment,
      mode: 'calibration',
      plans: { control: basePlan, 'second-control': plan },
      runs: experiment.order.map((_, i) =>
        reviewed(
          recordedRun(i < 2 ? fixture : { experiment, scenario: second }, i),
          i < 2 ? basePlan : plan,
        ),
      ),
    },
  ]).cohorts;
  assert.equal(cohorts.length, 2);
  assert.notEqual(cohorts[0].scenarioHash, cohorts[1].scenarioHash);
  assert(
    cohorts.every(
      (c) => c.variants.baseline.evaluated.endToEndSuccess.denominator === 1,
    ),
  );
  assert.equal(
    cohorts[1].pairs[0].tibicen.record!.quality!.plan.task.includes('process'),
    true,
  );
});

test('agreed negative quality or independent task failure prevents evaluated success', () => {
  for (const failure of ['quality', 'task', 'prior-quality']) {
    const source = input();
    if (failure === 'task')
      source.runs[0].run.grades.find((g) => g.scope === 'task')!.verdict =
        'fail';
    else if (failure === 'prior-quality')
      source.runs[0].run.grades.push({
        ...source.runs[0].run.grades[0],
        id: 'prior-negative-quality',
        scope: 'quality',
        verdict: 'fail',
      });
    else
      for (const reviewer of ['judge', 'human'] as const)
        (
          source.runs[0].quality![reviewer] as {
            judgements: { verdict: string }[];
          }
        ).judgements[0].verdict = 'fail';
    if (failure !== 'quality') source.runs[0] = reviewed(source.runs[0].run);
    const row = buildPairedReport([source]).cohorts[0].pairs[0].tibicen.record!;
    assert.equal(row.observed.task.status, 'pass');
    assert.equal(
      failure === 'task'
        ? row.evaluated.task.status
        : row.evaluated.setup.status,
      'fail',
    );
    if (failure === 'prior-quality')
      assert(row.observedGrades.some((g) => g.id === 'prior-negative-quality'));
  }
});

test('cost uses latest cumulative stage snapshots, keeps unknowns and accepts explicit zero', () => {
  const fixture = recordedExperiment(),
    source: ReportExperiment = {
      experiment: fixture.experiment,
      plans: { control: basePlan },
      mode: 'calibration',
      runs: [],
    };
  const usage = (costUsd: number | null) => ({
    costUsd,
    inputTokens: null,
    outputTokens: null,
  });
  source.runs = [
    reviewed(
      recordedRun(
        fixture,
        0,
        {},
        { launch: [usage(0)], setup: [usage(1), usage(2)], task: [usage(3)] },
      ),
    ),
    reviewed(
      recordedRun(
        fixture,
        1,
        {},
        { launch: [usage(0)], setup: [usage(0)], task: [usage(0)] },
      ),
    ),
  ];
  let cohort = buildPairedReport([source]).cohorts[0];
  assert.equal(cohort.pairs[0].tibicen.record!.measurements.costUsd, 5);
  assert.equal(cohort.pairs[0].baseline.record!.measurements.costUsd, 0);
  assert.equal(cohort.pairs[0].delta.costUsd, 5);
  source.runs[0] = reviewed(
    recordedRun(
      fixture,
      0,
      {},
      { launch: [usage(0)], setup: [usage(2), usage(null)], task: [usage(3)] },
    ),
  );
  cohort = buildPairedReport([source]).cohorts[0];
  assert.equal(cohort.pairs[0].tibicen.record!.measurements.costUsd, null);
  assert.equal(cohort.variants.tibicen.costUsd.total, null);
  assert.equal(cohort.variants.tibicen.costUsd.unknownCount, 1);
  assert.equal(cohort.pairs[0].delta.costUsd, null);
});

test('refusing setup after a charged proposal retains its known or unknown cost', () => {
  for (const costUsd of [5, null]) {
    const fixture = recordedExperiment(),
      run = recordedRun(
        fixture,
        0,
        {
          setup: { status: 'skip', durationMs: 0, reason: 'user-refused' },
          task: skipped,
        },
        { launch: [{ costUsd: 0, inputTokens: 0, outputTokens: 0 }] },
      );
    const common = {
      schema: 1 as const,
      experimentId: run.experiment.id,
      attemptId: run.result.id,
      stage: 'setup' as const,
    };
    run.events.push({
      ...common,
      seq: 3,
      elapsedMs: 3,
      kind: 'checkpoint',
      data: { point: 'start', complete: true, files: [] },
    });
    run.events.push({
      ...common,
      seq: 4,
      elapsedMs: 4,
      kind: 'usage',
      data: { costUsd, inputTokens: 10, outputTokens: 2 },
    });
    run.events.push({
      ...common,
      seq: 5,
      elapsedMs: 5,
      kind: 'stage-finished',
      data: run.result.setup,
    });
    const source: ReportExperiment = {
      experiment: fixture.experiment,
      mode: 'calibration',
      plans: { control: basePlan },
      runs: [{ run }],
    };
    const row = buildPairedReport([source]).cohorts[0].pairs[0].tibicen.record!;
    assert.equal(row.measurements.usage.setup!.costUsd, costUsd);
    assert.equal(row.measurements.costUsd, costUsd);
    assert.equal(row.measurements.usage.task, null);
  }
});

test('time distinguishes unknown, non-executed and a genuine measured zero', () => {
  const source = input(),
    fixture = recordedExperiment(1, 'report');
  source.runs[0] = reviewed(
    recordedRun(fixture, 0, { setup: { status: 'pass', durationMs: 0 } }),
  );
  source.runs[1] = {
    run: recordedRun(fixture, 1, {
      started: false,
      launch: skipped as { status: 'skip'; durationMs: number; reason: string },
      setup: skipped,
      task: skipped,
    }),
  };
  const cohort = buildPairedReport([source]).cohorts[0];
  assert.equal(cohort.variants.tibicen.durationMs.setup.total, 0);
  assert.equal(cohort.variants.baseline.durationMs.setup.total, null);
  assert.equal(cohort.variants.baseline.durationMs.setup.notExecutedCount, 1);
  source.runs = [];
  assert.equal(
    buildPairedReport([source]).cohorts[0].variants.tibicen.durationMs.setup
      .unknownCount,
    1,
  );
});

test('partial cost coverage exposes the known subtotal without inventing a full total', () => {
  const source = input(2),
    fixture = recordedExperiment(2, 'report'),
    u = { costUsd: 1, inputTokens: 2, outputTokens: 3 };
  source.runs[0] = reviewed(
    recordedRun(fixture, 0, {}, { launch: [u], setup: [u], task: [u] }),
  );
  const cost = buildPairedReport([source]).cohorts[0].variants.tibicen.costUsd;
  assert.deepEqual(cost, {
    knownSubtotal: 3,
    knownCount: 1,
    unknownCount: 1,
    notExecutedCount: 0,
    total: null,
  });
});

test('report contains selected outcomes and grades without prompts, oracle or raw logs', () => {
  const report = buildPairedReport([input()]),
    text = JSON.stringify(report);
  for (const forbidden of [
    'private-reference',
    'Use the agreed rules.',
    'Наблюдаемое действие',
    'rawLog',
    'allowedCommands',
  ])
    assert(!text.includes(forbidden));
  assert.throws(() => buildPairedReport([input()], ['reference-fit']), {
    code: 'unsafe-eval-observation',
  });
});

test('a later rubric edit cannot mutate an earlier report or its cohort binding', () => {
  const source = input(),
    report = buildPairedReport([source]),
    saved = JSON.stringify(report);
  source.plans.control.task.push('process');
  assert.equal(JSON.stringify(report), saved);
});
