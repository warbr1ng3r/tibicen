import test from 'node:test';
import assert from 'node:assert/strict';
import { digest } from '../../scripts/core/contracts.ts';
import {
  summarizeAttempts,
  validateAttempt,
} from '../../scripts/evals/results.ts';
import {
  executorScenario,
  validateExperiment,
  validateScenario,
  validateEvent,
  validateGrade,
  validatePreflight,
  validateRun,
} from '../../scripts/evals/contracts.ts';
import type {
  Experiment,
  EvalScenario,
  EvalEvent,
  Grade,
} from '../../scripts/evals/contracts.ts';
import type { EvalAttempt } from '../../scripts/evals/results.ts';

const hash = 'a'.repeat(64);
function fixture() {
  const stage = {
    prompt: 'Perform the agreed work.',
    allowedPaths: ['AGENTS.md'],
    allowedCommands: [hash],
    replies: [
      {
        when: 'proposal' as const,
        text: 'Review the shown exact proposal before consent.',
      },
    ],
  };
  const scenario: EvalScenario = {
    schema: 1,
    id: 'case-1',
    isolation: 'controlled',
    files: [
      { path: 'src/math.js', content: 'export const double = n => n * 2;\n' },
    ],
    dialogue: [],
    setup: structuredClone(stage),
    task: { ...structuredClone(stage), allowedPaths: ['src/math.js'] },
    oracle: { id: 'hidden-1', hash },
  };
  const experiment: Experiment = {
    schema: 1,
    id: 'experiment-1',
    sourceSha: 'b'.repeat(40),
    conditionsHash: hash,
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [
      {
        id: 'codex-1',
        agent: 'codex',
        version: '0.157.0',
        model: 'frozen-model',
        auth: 'subscription',
        paid: false,
        startupHash: hash,
        permissionsHash: hash,
      },
    ],
    repeats: 1,
    limits: { launchMs: 1000, setupMs: 10000, taskMs: 10000, maxCostUsd: null },
    order: ['tibicen', 'baseline'].map((variant, i) => ({
      id: 'attempt-' + i,
      scenarioId: scenario.id,
      profileId: 'codex-1',
      variant: variant as 'tibicen' | 'baseline',
      repeat: 1,
    })),
  };
  const result: EvalAttempt = {
    schema: 1,
    id: 'attempt-0',
    scenarioId: scenario.id,
    profileId: 'codex-1',
    variant: 'tibicen',
    started: true,
    launch: { status: 'pass', durationMs: 10 },
    setup: { status: 'pass', durationMs: 20 },
    task: { status: 'error', durationMs: 30, reason: 'task-timeout' },
  };
  const base = {
    schema: 1 as const,
    experimentId: experiment.id,
    attemptId: result.id,
  };
  const events: EvalEvent[] = [
    {
      ...base,
      seq: 0,
      elapsedMs: 0,
      stage: 'launch',
      kind: 'scenario-started',
      data: {},
    },
    {
      ...base,
      seq: 1,
      elapsedMs: 10,
      stage: 'launch',
      kind: 'stage-finished',
      data: result.launch,
    },
    {
      ...base,
      seq: 2,
      elapsedMs: 15,
      stage: 'setup',
      kind: 'artifact',
      data: { path: 'AGENTS.md', beforeHash: null, afterHash: hash },
    },
    {
      ...base,
      seq: 3,
      elapsedMs: 30,
      stage: 'setup',
      kind: 'stage-finished',
      data: result.setup,
    },
    {
      ...base,
      seq: 4,
      elapsedMs: 60,
      stage: 'task',
      kind: 'stage-finished',
      data: result.task,
    },
  ];
  const grade: Grade = {
    schema: 1,
    id: 'invariants-1',
    attemptId: result.id,
    stage: 'setup',
    scope: 'invariants',
    verdict: 'pass',
    reason: 'protected-files-preserved',
    evidence: [2],
  };
  return { scenario, experiment, result, events, grade };
}

test('frozen metadata and observed stages link to the unchanged result schema and denominators', () => {
  const { scenario, experiment, result, events, grade } = fixture();
  const linked = validateRun(experiment, scenario, result, events, [grade]);
  assert.deepEqual(validateAttempt(linked.result), result);
  assert.equal(summarizeAttempts([linked.result]).setupSuccess.rate, 1);
  assert.equal(summarizeAttempts([linked.result]).endToEndSuccess.rate, 0);
  assert.throws(
    () => validateAttempt({ ...result, experimentId: experiment.id }),
    { code: 'invalid-eval-result' },
  );
});

test('executor view is a detached copy without oracle or future human replies', () => {
  const { scenario } = fixture();
  const visible = executorScenario(scenario);
  assert(!Object.hasOwn(visible, 'oracle'));
  assert(!Object.hasOwn(visible.setup, 'replies'));
  assert(!Object.hasOwn(visible.task, 'replies'));
  assert(!JSON.stringify(visible).includes(scenario.setup.replies[0].text));
  visible.files[0].content = 'Changed copy';
  assert.notEqual(visible.files[0].content, scenario.files[0].content);
});

test('unknown observed usage remains explicit rather than becoming zero', () => {
  const { events } = fixture();
  const usage = validateEvent({
    ...events[2],
    kind: 'usage',
    data: { costUsd: null, inputTokens: 20, outputTokens: null },
  });
  assert.deepEqual(usage.data, {
    costUsd: null,
    inputTokens: 20,
    outputTokens: null,
  });
  assert.throws(
    () =>
      validateEvent({
        ...usage,
        data: { costUsd: -1, inputTokens: null, outputTokens: null },
      }),
    { code: 'invalid-eval-contract' },
  );
});

for (const [label, validator, field] of [
  ['experiment', validateExperiment, 'experiment'],
  ['scenario', validateScenario, 'scenario'],
  ['event', validateEvent, 'event'],
  ['grade', validateGrade, 'grade'],
] as const)
  test(label + ' rejects unknown schema and fields', () => {
    const f = fixture();
    const input = field === 'event' ? f.events[0] : f[field];
    assert.throws(() => validator({ ...input, schema: 99 }), {
      code: 'invalid-eval-contract',
    });
    assert.throws(() => validator({ ...input, approved: true }), {
      code: 'invalid-eval-contract',
    });
  });

test('setup-only selection is explicit and cannot relax ordinary paired experiments', () => {
  const original = fixture().experiment;
  const scenarios = ['contained-init', 'contained-adopt'].map((id) => ({
    id,
    hash,
  }));
  const profile = {
    ...original.profiles[0],
    id: 'codex-contained-tibicen-setup',
    model: 'gpt-6-astra',
    auth: 'none' as const,
    paid: false,
  };
  const selected: Experiment = {
    ...original,
    setupOnlyTibicen: true,
    scenarios,
    profiles: [profile],
    repeats: 1,
    order: scenarios.map((scenario) => ({
      id: scenario.id + '-tibicen-1',
      scenarioId: scenario.id,
      profileId: profile.id,
      variant: 'tibicen',
      repeat: 1,
    })),
  };
  assert.equal(validateExperiment(selected), selected);
  const paired = structuredClone(selected);
  delete paired.setupOnlyTibicen;
  assert.throws(() => validateExperiment(paired), /Freeze both variants/);
  for (const damage of [
    'profile',
    'model',
    'order',
    'variant',
    'repeat',
  ] as const) {
    const invalid = structuredClone(selected);
    if (damage === 'profile') invalid.profiles[0].id = 'ordinary-profile';
    if (damage === 'model') invalid.profiles[0].model = 'gpt-5.5';
    if (damage === 'order') invalid.order.reverse();
    if (damage === 'variant') invalid.order[1].variant = 'baseline';
    if (damage === 'repeat') invalid.repeats = 2;
    assert.throws(
      () => validateExperiment(invalid),
      { code: 'invalid-eval-contract' },
      damage,
    );
  }
  assert.throws(
    () => validateExperiment({ ...original, setupOnlyTibicen: true }),
    { code: 'invalid-eval-contract' },
  );
});

test('nested fields cannot smuggle raw logs, credentials or hidden answers through an event', () => {
  const { experiment, scenario, events } = fixture();
  assert.throws(
    () =>
      validateExperiment({
        ...experiment,
        profiles: [
          { ...experiment.profiles[0], env: { API_KEY: 'synthetic-secret' } },
        ],
      }),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateScenario({
        ...scenario,
        setup: { ...scenario.setup, expectedAnswer: 'Hidden solution' },
      }),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateEvent({
        ...events[2],
        data: { ...events[2].data, stdout: 'synthetic-secret' },
      }),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateEvent({
        ...events[4],
        data: {
          status: 'error',
          durationMs: 10,
          reason: 'raw output with secret',
        },
      }),
    { code: 'invalid-eval-contract' },
  );
});

test('both variants and exact repeat slots are required; paid profiles need an explicit budget', () => {
  const { experiment } = fixture();
  assert.throws(
    () =>
      validateExperiment({
        ...experiment,
        order: experiment.order.slice(0, 1),
      }),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateExperiment({
        ...experiment,
        order: [experiment.order[0], { ...experiment.order[0], id: 'another' }],
      }),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(() => validateExperiment({ ...experiment, profiles: [null] }), {
    code: 'invalid-eval-contract',
  });
  assert.throws(
    () =>
      validateExperiment({
        ...experiment,
        profiles: [{ ...experiment.profiles[0], paid: true, auth: 'api' }],
      }),
    { code: 'invalid-eval-contract' },
  );
  assert(
    validateExperiment({
      ...experiment,
      limits: { ...experiment.limits, maxCostUsd: 1 },
      profiles: [{ ...experiment.profiles[0], paid: true, auth: 'api' }],
    }),
  );
});

test('preflight cannot declare an uncontrolled startup or exposed auth ready', () => {
  const ready = {
    status: 'ready',
    startupControlled: true,
    authProtected: true,
    processTreeControlled: true,
    isolation: 'controlled',
  };
  assert.equal(validatePreflight(ready).status, 'ready');
  assert.throws(() => validatePreflight({ ...ready, authProtected: false }), {
    code: 'invalid-eval-contract',
  });
  assert.throws(
    () => validatePreflight({ ...ready, startupControlled: false }),
    { code: 'invalid-eval-contract' },
  );
  assert.equal(
    validatePreflight({
      ...ready,
      status: 'blocked',
      startupControlled: false,
      reason: 'startup-uncontrolled',
    }).status,
    'blocked',
  );
  assert.throws(() => validatePreflight({ ...ready, env: {} }), {
    code: 'invalid-eval-contract',
  });
});

test('result linkage refuses swapped inputs, unrelated observations and invented start/outcomes', () => {
  const { scenario, experiment, result, events, grade } = fixture();
  assert.throws(
    () =>
      validateRun(
        experiment,
        {
          ...scenario,
          dialogue: [{ role: 'user', text: 'Changed condition' }],
        },
        result,
        events,
      ),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateRun(
        experiment,
        scenario,
        { ...result, profileId: 'another' },
        events,
      ),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () => validateRun(experiment, scenario, result, events.slice(1)),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateRun(
        experiment,
        scenario,
        result,
        events.map((event) => ({ ...event, attemptId: 'other' })),
      ),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () => validateRun(experiment, scenario, result, events.slice(0, 4)),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(
    () =>
      validateRun(experiment, scenario, result, events, [
        { ...grade, evidence: [4] },
      ]),
    { code: 'invalid-eval-contract' },
  );
  assert.throws(() => validateGrade({ ...grade, evidence: [] }), {
    code: 'invalid-eval-contract',
  });
});

test('launch failure retains an unstarted attempt without fabricating setup or task observations', () => {
  const { scenario, experiment, result } = fixture();
  const failed = {
    ...result,
    started: false,
    launch: { status: 'error', durationMs: 10, reason: 'auth-unavailable' },
    setup: { status: 'skip', durationMs: 0, reason: 'not-started' },
    task: { status: 'skip', durationMs: 0, reason: 'not-started' },
  };
  const event = {
    schema: 1,
    experimentId: experiment.id,
    attemptId: result.id,
    seq: 0,
    elapsedMs: 10,
    stage: 'launch',
    kind: 'stage-finished',
    data: failed.launch,
  };
  assert.equal(
    validateRun(experiment, scenario, failed, [event]).result.started,
    false,
  );
  assert.equal(summarizeAttempts([failed]).started, 0);
});
