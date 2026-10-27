import { assert } from '../core/contracts.ts';

export type StageStatus = 'pass' | 'fail' | 'error' | 'skip';
export interface Stage<S extends StageStatus = StageStatus> {
  status: S;
  durationMs: number;
  reason?: string;
}
export type EvalAttempt = {
  schema: number;
  id: string;
  scenarioId: string;
  profileId: string;
  variant: 'tibicen' | 'baseline';
  setup: Stage;
  task: Stage;
} & (
  | { started: true; launch: Stage<'pass' | 'error'> }
  | { started: false; launch: Stage<'error' | 'skip'> }
);

const code = 'invalid-eval-result';
const stageStatuses = ['pass', 'fail', 'error', 'skip'];

function record(
  value: unknown,
  required: string[],
  optional: string[],
  label: string,
): asserts value is Record<string, unknown> {
  assert(
    value && typeof value === 'object' && !Array.isArray(value),
    code,
    `${label} must be an object.`,
  );
  assert(
    required.every((key) => Object.hasOwn(value, key)),
    code,
    `${label} is incomplete.`,
  );
  assert(
    Reflect.ownKeys(value).every(
      (key) =>
        typeof key === 'string' &&
        (required.includes(key) || optional.includes(key)),
    ),
    code,
    `Unknown ${label} field.`,
  );
}

function nonempty(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validateStage(
  input: unknown,
  label: string,
  statuses = stageStatuses,
) {
  const stage = input as Stage;
  record(stage, ['status', 'durationMs'], ['reason'], label);
  assert(statuses.includes(stage.status), code, `Unknown ${label} status.`);
  assert(
    typeof stage.durationMs === 'number' &&
      Number.isFinite(stage.durationMs) &&
      stage.durationMs >= 0,
    code,
    `${label}.durationMs must be finite, nonnegative milliseconds.`,
  );
  if (stage.status === 'pass')
    assert(
      !Object.hasOwn(stage, 'reason'),
      code,
      `${label} pass cannot have a failure reason.`,
    );
  else
    assert(
      Object.hasOwn(stage, 'reason') && nonempty(stage.reason),
      code,
      `${label} ${stage.status} needs a reason.`,
    );
  if (stage.status === 'skip')
    assert(
      stage.durationMs === 0,
      code,
      `${label} skip cannot have execution time.`,
    );
}

// These are reported observations, not proof of agent behavior or a product grader.
// started means the scenario was observably begun, not merely that a process spawned.
// launch covers startup only; later errors belong to setup/task and retain prior passes.
export function validateAttempt(input: unknown): EvalAttempt {
  const result = input as Omit<EvalAttempt, 'launch' | 'started'> & {
    started: boolean;
    launch: Stage;
  };
  record(
    result,
    [
      'schema',
      'id',
      'scenarioId',
      'profileId',
      'variant',
      'started',
      'launch',
      'setup',
      'task',
    ],
    [],
    'attempt',
  );
  assert(result.schema === 1, code, 'Unsupported eval result schema.');
  for (const key of ['id', 'scenarioId', 'profileId'] as const)
    assert(
      nonempty(result[key]),
      code,
      `attempt.${key} must be a nonempty string.`,
    );
  assert(
    ['tibicen', 'baseline'].includes(result.variant),
    code,
    'Unknown eval variant.',
  );
  assert(
    typeof result.started === 'boolean',
    code,
    'attempt.started must be boolean.',
  );
  validateStage(result.launch, 'launch', ['pass', 'error', 'skip']);
  validateStage(result.setup, 'setup');
  validateStage(result.task, 'task');

  if (!result.started) {
    assert(
      ['error', 'skip'].includes(result.launch.status),
      code,
      'A scenario without an observed start cannot have a launch pass.',
    );
    assert(
      result.setup.status === 'skip' && result.task.status === 'skip',
      code,
      'Unstarted scenarios must skip setup and task.',
    );
  } else {
    assert(
      result.launch.status !== 'skip',
      code,
      'A started scenario cannot skip launch.',
    );
    if (result.launch.status === 'error')
      assert(
        result.setup.status === 'skip' && result.task.status === 'skip',
        code,
        'A launch error must skip setup and task.',
      );
  }
  if (result.setup.status !== 'pass')
    assert(
      result.task.status === 'skip',
      code,
      'A task can run only after setup passes.',
    );
  return result as EvalAttempt;
}

function ratio(numerator: number, denominator: number) {
  return {
    numerator,
    denominator,
    rate: denominator === 0 ? null : numerator / denominator,
  };
}

// Aggregate counters only: callers must select comparable cohorts for a paired report.
export function summarizeAttempts(results: unknown) {
  assert(Array.isArray(results), code, 'Expected an array of eval attempts.');
  const ids = new Set();
  const summary = {
    schema: 1,
    total: results.length,
    started: 0,
    notStarted: { error: 0, skip: 0 },
    outcomes: {
      launch: { pass: 0, error: 0, skip: 0 },
      setup: { pass: 0, fail: 0, error: 0, skip: 0 },
      task: { pass: 0, fail: 0, error: 0, skip: 0 },
    },
  };
  let setupPasses = 0;
  let bothPasses = 0;
  for (const value of results) {
    const result = validateAttempt(value);
    assert(
      !ids.has(result.id),
      code,
      'Duplicate attempt id; a repeat needs its own id.',
    );
    ids.add(result.id);
    if (result.started) summary.started++;
    else summary.notStarted[result.launch.status]++;
    summary.outcomes.launch[result.launch.status]++;
    summary.outcomes.setup[result.setup.status]++;
    summary.outcomes.task[result.task.status]++;
    if (result.setup.status === 'pass') setupPasses++;
    if (result.setup.status === 'pass' && result.task.status === 'pass')
      bothPasses++;
  }
  return {
    ...summary,
    setupSuccess: ratio(setupPasses, summary.started),
    taskSuccessGivenSetup: ratio(bothPasses, setupPasses),
    endToEndSuccess: ratio(bothPasses, summary.started),
  };
}
