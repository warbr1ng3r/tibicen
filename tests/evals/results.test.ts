import test from 'node:test';
import assert from 'node:assert/strict';
import {
  summarizeAttempts,
  validateAttempt,
} from '../../scripts/evals/results.ts';

const pass = () => ({ status: 'pass', durationMs: 12.5 });
const skip = (reason: string) => ({ status: 'skip', durationMs: 0, reason });
const error = (reason: string) => ({ status: 'error', durationMs: 30, reason });
const fail = (reason: string) => ({ status: 'fail', durationMs: 20, reason });
const attempt = (id: string, overrides: Record<string, unknown> = {}) => ({
  schema: 1,
  id,
  scenarioId: 'new-web-project',
  profileId: 'codex-fixed-profile',
  variant: 'tibicen',
  started: true,
  launch: pass(),
  setup: pass(),
  task: pass(),
  ...overrides,
});

test('separate stages retain setup success after a task timeout or skip', () => {
  const results = [
    attempt('success'),
    attempt('task-timeout', { task: error('timeout') }),
    attempt('task-not-run', { task: skip('budget-exhausted') }),
  ];
  const before = structuredClone(results);
  assert.strictEqual(validateAttempt(results[0]), results[0]);
  const summary = summarizeAttempts(results);
  assert.deepEqual(summary.setupSuccess, {
    numerator: 3,
    denominator: 3,
    rate: 1,
  });
  assert.deepEqual(summary.taskSuccessGivenSetup, {
    numerator: 1,
    denominator: 3,
    rate: 1 / 3,
  });
  assert.deepEqual(summary.endToEndSuccess, {
    numerator: 1,
    denominator: 3,
    rate: 1 / 3,
  });
  assert.deepEqual(summary.outcomes.task, {
    pass: 1,
    fail: 0,
    error: 1,
    skip: 1,
  });
  assert.deepEqual(results, before);
});

test('startup exclusions stay visible; every post-start failure remains in the denominator', () => {
  const results = [
    attempt('success'),
    attempt('auth-missing', {
      started: false,
      launch: error('auth-unavailable'),
      setup: skip('launch-error'),
      task: skip('setup-not-passed'),
    }),
    attempt('profile-disabled', {
      started: false,
      launch: skip('profile-disabled'),
      setup: skip('not-started'),
      task: skip('setup-not-passed'),
    }),
    attempt('startup-timeout', {
      launch: error('timeout-after-observed-start'),
      setup: skip('launch-error'),
      task: skip('setup-not-passed'),
    }),
    attempt('setup-timeout', {
      setup: error('timeout'),
      task: skip('setup-not-passed'),
    }),
    attempt('setup-failed', {
      setup: fail('changed-application-code'),
      task: skip('setup-not-passed'),
    }),
    attempt('setup-not-run', {
      setup: skip('subscription-limit-after-start'),
      task: skip('setup-not-passed'),
    }),
    attempt('task-failed', { task: fail('hidden-check-failed') }),
  ];
  const summary = summarizeAttempts(results);
  assert.equal(summary.total, 8);
  assert.equal(summary.started, 6);
  assert.deepEqual(summary.notStarted, { error: 1, skip: 1 });
  assert.deepEqual(summary.outcomes.launch, { pass: 5, error: 2, skip: 1 });
  assert.deepEqual(summary.outcomes.setup, {
    pass: 2,
    fail: 1,
    error: 1,
    skip: 4,
  });
  assert.deepEqual(summary.setupSuccess, {
    numerator: 2,
    denominator: 6,
    rate: 1 / 3,
  });
  assert.deepEqual(summary.taskSuccessGivenSetup, {
    numerator: 1,
    denominator: 2,
    rate: 0.5,
  });
  assert.deepEqual(summary.endToEndSuccess, {
    numerator: 1,
    denominator: 6,
    rate: 1 / 6,
  });
});

test('empty and unstarted-only cohorts have no success rate; no setup pass means no conditional rate', () => {
  for (const results of [
    [],
    [
      attempt('disabled', {
        started: false,
        launch: skip('disabled'),
        setup: skip('not-started'),
        task: skip('setup-not-passed'),
      }),
    ],
  ]) {
    const summary = summarizeAttempts(results);
    for (const metric of [
      'setupSuccess',
      'taskSuccessGivenSetup',
      'endToEndSuccess',
    ] as const)
      assert.deepEqual(summary[metric], {
        numerator: 0,
        denominator: 0,
        rate: null,
      });
  }
  const failed = summarizeAttempts([
    attempt('failed', {
      setup: fail('bad-plan'),
      task: skip('setup-not-passed'),
    }),
  ]);
  assert.deepEqual(failed.setupSuccess, {
    numerator: 0,
    denominator: 1,
    rate: 0,
  });
  assert.deepEqual(failed.taskSuccessGivenSetup, {
    numerator: 0,
    denominator: 0,
    rate: null,
  });
  assert.deepEqual(failed.endToEndSuccess, {
    numerator: 0,
    denominator: 1,
    rate: 0,
  });
});

test('repeated scenarios stay separate attempts and duplicate ids are rejected', () => {
  const failed = attempt('first', {
    setup: fail('bad-plan'),
    task: skip('setup-not-passed'),
  });
  const summary = summarizeAttempts([
    failed,
    attempt('repeat'),
    attempt('baseline', { variant: 'baseline' }),
  ]);
  assert.equal(summary.total, 3);
  assert.deepEqual(summary.setupSuccess, {
    numerator: 2,
    denominator: 3,
    rate: 2 / 3,
  });
  assert.throws(() => summarizeAttempts([failed, attempt('first')]), {
    code: 'invalid-eval-result',
  });
});

test('unknown, partial, malformed and nonfinite data cannot become a passing result', () => {
  const missingTask: Partial<ReturnType<typeof attempt>> =
    attempt('missing-task');
  delete missingTask.task;
  const malformed = [
    null,
    [],
    {},
    missingTask,
    attempt('wrong-schema', { schema: 2 }),
    attempt('empty-profile', { profileId: ' ' }),
    attempt('missing-scenario', { scenarioId: undefined }),
    attempt('bad-variant', { variant: 'best-of-retries' }),
    attempt('truthy-start', { started: 1 }),
    attempt('unknown-field', { success: true }),
    attempt('unknown-symbol', { [Symbol('hidden')]: true }),
    attempt('unknown-status', { setup: { status: 'passed', durationMs: 0 } }),
    attempt('unknown-stage-field', { task: { ...pass(), score: 100 } }),
    attempt('missing-duration', { task: { status: 'pass' } }),
    attempt('string-duration', { task: { status: 'pass', durationMs: '12' } }),
    attempt('negative-duration', { task: { status: 'pass', durationMs: -1 } }),
    attempt('infinite-duration', {
      task: { status: 'pass', durationMs: Infinity },
    }),
    attempt('nan-duration', { task: { status: 'pass', durationMs: NaN } }),
    attempt('no-reason', { task: { status: 'error', durationMs: 1 } }),
    attempt('inherited-reason', {
      task: Object.assign(Object.create({ reason: 'not-serialized' }), {
        status: 'error',
        durationMs: 1,
      }),
    }),
    attempt('blank-reason', { task: fail(' ') }),
    attempt('pass-with-reason', { task: { ...pass(), reason: 'timeout' } }),
    attempt('timed-skip', { task: { ...skip('not-run'), durationMs: 1 } }),
  ];
  for (const value of malformed) {
    assert.throws(() => validateAttempt(value), {
      code: 'invalid-eval-result',
    });
    assert.throws(() => summarizeAttempts([attempt('valid'), value]), {
      code: 'invalid-eval-result',
    });
  }
  assert.throws(() => summarizeAttempts({}), { code: 'invalid-eval-result' });
});

test('contradictory stage ordering or launch status is rejected', () => {
  for (const value of [
    attempt('unstarted-pass', { started: false }),
    attempt('started-skip', { launch: skip('disabled') }),
    attempt('launch-fail', { launch: fail('invalid-launch-status') }),
    attempt('launch-error-setup-pass', { launch: error('startup-failure') }),
    attempt('unstarted-setup-error', {
      started: false,
      launch: error('auth-unavailable'),
      setup: error('setup-started'),
      task: skip('setup-not-passed'),
    }),
    ...['fail', 'error', 'skip'].flatMap((status) =>
      ['pass', 'fail', 'error'].map((taskStatus) =>
        attempt(`${status}-${taskStatus}`, {
          setup: {
            status,
            durationMs: status === 'skip' ? 0 : 1,
            reason: 'setup-not-passed',
          },
          task:
            taskStatus === 'pass'
              ? pass()
              : { status: taskStatus, durationMs: 1, reason: 'should-not-run' },
        }),
      ),
    ),
  ])
    assert.throws(() => validateAttempt(value), {
      code: 'invalid-eval-result',
    });
});
