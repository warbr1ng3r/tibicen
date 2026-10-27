import { assert, digest, validateData } from '../core/contracts.ts';
import { validateRelativePath } from '../core/paths.ts';
import { validateAttempt } from './results.ts';
import type { EvalAttempt, Stage } from './results.ts';

export interface EvalProfileSpec {
  id: string;
  agent: string;
  version: string;
  model: string;
  auth: 'subscription' | 'api' | 'none';
  paid: boolean;
  startupHash: string;
  permissionsHash: string;
}
export interface Experiment {
  schema: 1;
  setupOnlyTibicen?: true;
  id: string;
  sourceSha: string;
  conditionsHash: string;
  scenarios: { id: string; hash: string }[];
  profiles: EvalProfileSpec[];
  repeats: number;
  limits: {
    launchMs: number;
    setupMs: number;
    taskMs: number;
    maxCostUsd: number | null;
  };
  order: {
    id: string;
    scenarioId: string;
    profileId: string;
    variant: 'tibicen' | 'baseline';
    repeat: number;
  }[];
}
export interface ScenarioStage {
  prompt: string;
  allowedPaths: string[];
  allowedCommands: string[];
  replies: { when: 'clarification' | 'proposal' | 'review'; text: string }[];
}
export interface EvalScenario {
  schema: 1;
  id: string;
  isolation: 'controlled' | 'hostile';
  files: { path: string; content: string }[];
  dialogue: { role: 'user' | 'assistant'; text: string }[];
  setup: ScenarioStage;
  task: ScenarioStage;
  oracle: { id: string; hash: string };
}
type StageName = 'launch' | 'setup' | 'task';
type EventData = {
  'scenario-started': Record<string, never>;
  artifact: {
    path: string;
    beforeHash: string | null;
    afterHash: string | null;
  };
  command: { id: string; commandHash: string; exitCode: number | null };
  'instructions-loaded': {
    path: string;
    contentHash: string;
    toolUseId: string;
  };
  'stage-finished': Stage;
  'driver-finished': Stage;
  usage: {
    costUsd: number | null;
    inputTokens: number | null;
    outputTokens: number | null;
  };
  checkpoint: {
    point: 'start' | 'approval' | 'end';
    complete: boolean;
    files: { path: string; contentHash: string; fileMode: number }[];
  };
  approval: {
    planHash: string;
    changes: {
      path: string;
      beforeHash: string | null;
      afterHash: string | null;
    }[];
    commandHashes: string[];
  };
  'host-command': { commandHash: string; exitCode: number | null };
  assertion: { id: string; expectedHash: string; actualHash: string | null };
};
export type EvalEvent = {
  [K in keyof EventData]: {
    schema: 1;
    experimentId: string;
    attemptId: string;
    seq: number;
    elapsedMs: number;
    stage: StageName;
    kind: K;
    data: EventData[K];
  };
}[keyof EventData];
export interface Grade {
  schema: 1;
  id: string;
  attemptId: string;
  stage: 'setup' | 'task';
  scope: 'invariants' | 'quality' | 'loading' | 'task';
  verdict: 'pass' | 'fail' | 'unverified';
  reason: string;
  evidence: number[];
}
export interface Preflight {
  status: 'ready' | 'blocked';
  startupControlled: boolean;
  authProtected: boolean;
  processTreeControlled: boolean;
  isolation: 'controlled' | 'hostile';
  reason?: string;
}
export type ExecutorScenario = Omit<
  EvalScenario,
  'oracle' | 'setup' | 'task'
> & {
  setup: Omit<ScenarioStage, 'replies'>;
  task: Omit<ScenarioStage, 'replies'>;
};
// Implementations own process/auth handles; neither credentials nor hidden oracle data enter executor inputs.
export interface EvalProfile {
  specification: EvalProfileSpec;
  preflight(limits: Experiment['limits']): Promise<Preflight>;
  run(
    input: {
      attempt: Experiment['order'][number];
      scenario: ExecutorScenario;
      limits: Experiment['limits'];
      signal: AbortSignal;
    },
    observe: (event: EvalEvent) => void,
    reply: (request: {
      stage: 'setup' | 'task';
      when: 'clarification' | 'proposal' | 'review';
      proposalDigest?: string;
    }) => Promise<{ text: string; approvedDigest?: string } | null>,
  ): Promise<EvalAttempt>;
}
export interface EvalGrader {
  id: string;
  grade(input: {
    scenario: EvalScenario;
    attempt: EvalAttempt;
    events: readonly EvalEvent[];
    oracle: unknown;
  }): Promise<Grade[]>;
}

const code = 'invalid-eval-contract';
function record(
  value: unknown,
  required: string[],
  optional: string[] = [],
): asserts value is Record<string, unknown> {
  assert(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      required.every((key) => Object.hasOwn(value, key)) &&
      Reflect.ownKeys(value).every(
        (key) =>
          typeof key === 'string' && [...required, ...optional].includes(key),
      ),
    code,
    'Unknown or missing evaluation contract field.',
  );
}
const text = (value: unknown) =>
  typeof value === 'string' &&
  value.trim().length > 0 &&
  value.length <= 100_000;
const id = (value: unknown) =>
  typeof value === 'string' &&
  /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(value);
const hash = (value: unknown) =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const number = (value: unknown, positive = false) =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  (positive ? value > 0 : value >= 0);
function unique<T>(items: T[], key: (item: T) => unknown) {
  try {
    return new Set(items.map(key)).size === items.length;
  } catch {
    return false;
  }
}
function stage(input: unknown): asserts input is ScenarioStage {
  record(input, ['prompt', 'allowedPaths', 'allowedCommands', 'replies']);
  assert(
    text(input.prompt) &&
      Array.isArray(input.allowedPaths) &&
      Array.isArray(input.allowedCommands) &&
      Array.isArray(input.replies),
    code,
    'Invalid scenario stage.',
  );
  for (const file of input.allowedPaths) {
    assert(typeof file === 'string', code, 'Expected a literal relative path.');
    validateRelativePath(file);
  }
  assert(
    unique(input.allowedPaths, (file) => file) &&
      unique(input.allowedCommands, (command) => command) &&
      input.allowedCommands.every(hash),
    code,
    'Commands must be exact reviewed command hashes, paths unique.',
  );
  for (const reply of input.replies) {
    record(reply, ['when', 'text']);
    assert(
      ['clarification', 'proposal', 'review'].includes(reply.when as string) &&
        text(reply.text),
      code,
      'Invalid staged human reply.',
    );
  }
}
export function validateScenario(input: unknown): EvalScenario {
  validateData(input);
  record(input, [
    'schema',
    'id',
    'isolation',
    'files',
    'dialogue',
    'setup',
    'task',
    'oracle',
  ]);
  const scenario = input as unknown as EvalScenario;
  assert(
    scenario.schema === 1 &&
      id(scenario.id) &&
      ['controlled', 'hostile'].includes(scenario.isolation),
    code,
    'Unsupported scenario schema or isolation.',
  );
  assert(
    Array.isArray(scenario.files) &&
      scenario.files.length <= 200 &&
      unique(scenario.files, (file) => file.path) &&
      Array.isArray(scenario.dialogue),
    code,
    'Invalid fixture input.',
  );
  let bytes = 0;
  for (const file of scenario.files) {
    record(file, ['path', 'content']);
    validateRelativePath(file.path);
    assert(
      typeof file.content === 'string' && !file.content.includes('\0'),
      code,
      'Fixture files must be text.',
    );
    bytes += Buffer.byteLength(file.content);
  }
  assert(bytes <= 2 * 1024 * 1024, code, 'Fixture exceeds its contract limit.');
  for (const message of scenario.dialogue) {
    record(message, ['role', 'text']);
    assert(
      ['user', 'assistant'].includes(message.role) && text(message.text),
      code,
      'Invalid available dialogue.',
    );
  }
  stage(scenario.setup);
  stage(scenario.task);
  record(scenario.oracle, ['id', 'hash']);
  assert(
    id(scenario.oracle.id) && hash(scenario.oracle.hash),
    code,
    'Expected a hidden oracle reference, not its solution.',
  );
  return scenario;
}
export function executorScenario(input: unknown): ExecutorScenario {
  const {
    oracle: _oracle,
    setup,
    task,
    ...visible
  } = structuredClone(validateScenario(input));
  const { replies: _setupReplies, ...publicSetup } = setup;
  const { replies: _taskReplies, ...publicTask } = task;
  return { ...visible, setup: publicSetup, task: publicTask };
}
export function validateExperiment(input: unknown): Experiment {
  validateData(input);
  record(
    input,
    [
      'schema',
      'id',
      'sourceSha',
      'conditionsHash',
      'scenarios',
      'profiles',
      'repeats',
      'limits',
      'order',
    ],
    ['setupOnlyTibicen'],
  );
  const experiment = input as unknown as Experiment;
  assert(
    experiment.schema === 1 &&
      id(experiment.id) &&
      /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(experiment.sourceSha) &&
      hash(experiment.conditionsHash),
    code,
    'Unsupported experiment schema or source conditions.',
  );
  assert(
    Number.isSafeInteger(experiment.repeats) &&
      experiment.repeats > 0 &&
      experiment.repeats <= 100,
    code,
    'Freeze bounded repeats before execution.',
  );
  assert(
    Array.isArray(experiment.scenarios) &&
      experiment.scenarios.length > 0 &&
      unique(experiment.scenarios, (item) => item.id),
    code,
    'Expected unique scenarios.',
  );
  for (const scenario of experiment.scenarios) {
    record(scenario, ['id', 'hash']);
    assert(
      id(scenario.id) && hash(scenario.hash),
      code,
      'Invalid scenario reference.',
    );
  }
  assert(
    Array.isArray(experiment.profiles) &&
      experiment.profiles.length > 0 &&
      unique(experiment.profiles, (item) => item.id),
    code,
    'Expected unique profiles.',
  );
  for (const profile of experiment.profiles) {
    record(profile, [
      'id',
      'agent',
      'version',
      'model',
      'auth',
      'paid',
      'startupHash',
      'permissionsHash',
    ]);
    assert(
      [profile.id, profile.agent, profile.version, profile.model].every(id) &&
        ['subscription', 'api', 'none'].includes(profile.auth) &&
        typeof profile.paid === 'boolean' &&
        hash(profile.startupHash) &&
        hash(profile.permissionsHash),
      code,
      'Invalid frozen profile; credentials and argv do not belong here.',
    );
  }
  record(experiment.limits, ['launchMs', 'setupMs', 'taskMs', 'maxCostUsd']);
  assert(
    [
      experiment.limits.launchMs,
      experiment.limits.setupMs,
      experiment.limits.taskMs,
    ].every((value) => number(value, true)) &&
      (experiment.limits.maxCostUsd === null ||
        number(experiment.limits.maxCostUsd)),
    code,
    'Invalid explicit limits.',
  );
  assert(
    !experiment.profiles.some((profile) => profile.paid) ||
      number(experiment.limits.maxCostUsd, true),
    code,
    'A paid profile needs an explicit positive cost cap.',
  );
  assert(
    Array.isArray(experiment.order) &&
      unique(experiment.order, (attempt) => attempt.id),
    code,
    'Each attempt needs a new id.',
  );
  const slots = new Set();
  for (const attempt of experiment.order) {
    record(attempt, ['id', 'scenarioId', 'profileId', 'variant', 'repeat']);
    assert(
      id(attempt.id) &&
        experiment.scenarios.some((item) => item.id === attempt.scenarioId) &&
        experiment.profiles.some((item) => item.id === attempt.profileId) &&
        ['tibicen', 'baseline'].includes(attempt.variant) &&
        Number.isSafeInteger(attempt.repeat) &&
        attempt.repeat >= 1 &&
        attempt.repeat <= experiment.repeats,
      code,
      'Attempt does not belong to the frozen experiment.',
    );
    const slot = JSON.stringify([
      attempt.scenarioId,
      attempt.profileId,
      attempt.variant,
      attempt.repeat,
    ]);
    assert(!slots.has(slot), code, 'Duplicate paired experiment slot.');
    slots.add(slot);
  }
  const setupOnly = experiment.setupOnlyTibicen === true;
  assert(
    experiment.setupOnlyTibicen === undefined || setupOnly,
    code,
    'Invalid setup-only selection.',
  );
  if (setupOnly)
    assert(
      experiment.repeats === 1 &&
        experiment.scenarios.length === 2 &&
        experiment.scenarios[0].id === 'contained-init' &&
        experiment.scenarios[1].id === 'contained-adopt' &&
        experiment.profiles.length === 1 &&
        experiment.profiles[0].id === 'codex-contained-tibicen-setup' &&
        experiment.profiles[0].agent === 'codex' &&
        experiment.profiles[0].version === '0.157.0' &&
        experiment.profiles[0].model === 'gpt-6-astra' &&
        ['none', 'subscription'].includes(experiment.profiles[0].auth) &&
        !experiment.profiles[0].paid &&
        experiment.limits.maxCostUsd === null &&
        experiment.limits.launchMs <= 45000 &&
        experiment.limits.setupMs <= 180000 &&
        experiment.order.length === 2 &&
        experiment.order.every(
          (item, index) =>
            item.variant === 'tibicen' &&
            item.scenarioId === experiment.scenarios[index].id,
        ),
      code,
      'Setup-only selection is the fixed contained init/adopt sequence.',
    );
  assert(
    slots.size ===
      experiment.scenarios.length *
        experiment.profiles.length *
        experiment.repeats *
        (setupOnly ? 1 : 2),
    code,
    'Freeze both variants for every scenario/profile/repeat.',
  );
  return experiment;
}
export function validatePreflight(input: unknown): Preflight {
  record(
    input,
    [
      'status',
      'startupControlled',
      'authProtected',
      'processTreeControlled',
      'isolation',
    ],
    ['reason'],
  );
  const preflight = input as unknown as Preflight;
  assert(
    ['ready', 'blocked'].includes(preflight.status) &&
      ['controlled', 'hostile'].includes(preflight.isolation) &&
      [
        preflight.startupControlled,
        preflight.authProtected,
        preflight.processTreeControlled,
      ].every((value) => typeof value === 'boolean'),
    code,
    'Invalid preflight observation.',
  );
  assert(
    preflight.status === 'ready'
      ? preflight.startupControlled &&
          preflight.authProtected &&
          preflight.processTreeControlled &&
          !Object.hasOwn(preflight, 'reason')
      : text(preflight.reason),
    code,
    'A blocked boundary cannot be declared ready.',
  );
  return preflight;
}
export function validateEvent(input: unknown): EvalEvent {
  validateData(input);
  record(input, [
    'schema',
    'experimentId',
    'attemptId',
    'seq',
    'elapsedMs',
    'stage',
    'kind',
    'data',
  ]);
  const event = input as unknown as EvalEvent;
  assert(
    event.schema === 1 &&
      id(event.experimentId) &&
      id(event.attemptId) &&
      Number.isSafeInteger(event.seq) &&
      event.seq >= 0 &&
      number(event.elapsedMs) &&
      ['launch', 'setup', 'task'].includes(event.stage),
    code,
    'Unsupported event schema or identity.',
  );
  if (event.kind === 'scenario-started') {
    record(event.data, []);
    assert(
      event.stage === 'launch',
      code,
      'Observed scenario start belongs to launch.',
    );
  } else if (event.kind === 'artifact') {
    record(event.data, ['path', 'beforeHash', 'afterHash']);
    validateRelativePath(event.data.path);
    assert(
      [event.data.beforeHash, event.data.afterHash].every(
        (value) => value === null || hash(value),
      ),
      code,
      'Artifacts contain hashes, never raw content.',
    );
  } else if (event.kind === 'command') {
    record(event.data, ['id', 'commandHash', 'exitCode']);
    assert(
      id(event.data.id) &&
        hash(event.data.commandHash) &&
        (event.data.exitCode === null ||
          Number.isSafeInteger(event.data.exitCode)),
      code,
      'Invalid command observation.',
    );
  } else if (event.kind === 'instructions-loaded') {
    record(event.data, ['path', 'contentHash', 'toolUseId']);
    validateRelativePath(event.data.path);
    assert(
      hash(event.data.contentHash) && id(event.data.toolUseId),
      code,
      'Loading needs a concrete observed file and tool event.',
    );
  } else if (
    event.kind === 'stage-finished' ||
    event.kind === 'driver-finished'
  ) {
    record(event.data, ['status', 'durationMs'], ['reason']);
    assert(
      ['pass', 'fail', 'error', 'skip'].includes(event.data.status) &&
        number(event.data.durationMs),
      code,
      'Invalid stage observation.',
    );
    assert(
      event.data.status === 'pass'
        ? !Object.hasOwn(event.data, 'reason')
        : id(event.data.reason),
      code,
      'Use bounded reason codes, not raw model output.',
    );
    if (event.data.status === 'skip')
      assert(
        event.data.durationMs === 0,
        code,
        'Skipped stages have zero execution time.',
      );
  } else if (event.kind === 'usage') {
    record(event.data, ['costUsd', 'inputTokens', 'outputTokens']);
    assert(
      event.data.costUsd === null || number(event.data.costUsd),
      code,
      'Unknown cost must be null, not invented zero.',
    );
    assert(
      [event.data.inputTokens, event.data.outputTokens].every(
        (value) =>
          value === null || (number(value) && Number.isSafeInteger(value)),
      ),
      code,
      'Unknown token counts must be null.',
    );
  } else if (event.kind === 'checkpoint') {
    record(event.data, ['point', 'complete', 'files']);
    assert(
      ['start', 'approval', 'end'].includes(event.data.point) &&
        typeof event.data.complete === 'boolean' &&
        Array.isArray(event.data.files) &&
        event.data.files.length <= 10000,
      code,
      'Invalid host checkpoint.',
    );
    for (const file of event.data.files) {
      record(file, ['path', 'contentHash', 'fileMode']);
      validateRelativePath(file.path);
      assert(
        hash(file.contentHash) &&
          Number.isInteger(file.fileMode) &&
          file.fileMode >= 0 &&
          file.fileMode <= 0o777,
        code,
        'Invalid host file observation.',
      );
    }
    assert(
      unique(event.data.files, (file) => file.path),
      code,
      'Duplicate checkpoint file.',
    );
  } else if (event.kind === 'approval') {
    record(event.data, ['planHash', 'changes', 'commandHashes']);
    assert(
      hash(event.data.planHash) &&
        Array.isArray(event.data.changes) &&
        Array.isArray(event.data.commandHashes) &&
        event.data.commandHashes.every(hash),
      code,
      'Invalid host approval.',
    );
    for (const change of event.data.changes) {
      record(change, ['path', 'beforeHash', 'afterHash']);
      validateRelativePath(change.path);
      assert(
        [change.beforeHash, change.afterHash].every(
          (value) => value === null || hash(value),
        ),
        code,
        'Invalid approved file hashes.',
      );
    }
    assert(
      unique(event.data.changes, (change) => change.path),
      code,
      'Duplicate approved path.',
    );
    assert(
      event.data.planHash ===
        digest({
          changes: event.data.changes,
          commandHashes: event.data.commandHashes,
        }),
      code,
      'Approval differs from the exact reviewed hashes.',
    );
  } else if (event.kind === 'host-command') {
    record(event.data, ['commandHash', 'exitCode']);
    assert(
      hash(event.data.commandHash) &&
        (event.data.exitCode === null ||
          Number.isSafeInteger(event.data.exitCode)),
      code,
      'Invalid host check result.',
    );
  } else if (event.kind === 'assertion') {
    record(event.data, ['id', 'expectedHash', 'actualHash']);
    assert(
      id(event.data.id) &&
        hash(event.data.expectedHash) &&
        (event.data.actualHash === null || hash(event.data.actualHash)),
      code,
      'Invalid host artifact assertion.',
    );
  } else assert(false, code, 'Unknown event kind.');
  return event;
}
export function validateGrade(input: unknown): Grade {
  validateData(input);
  record(input, [
    'schema',
    'id',
    'attemptId',
    'stage',
    'scope',
    'verdict',
    'reason',
    'evidence',
  ]);
  const grade = input as unknown as Grade;
  assert(
    grade.schema === 1 &&
      id(grade.id) &&
      id(grade.attemptId) &&
      ['setup', 'task'].includes(grade.stage) &&
      ['invariants', 'quality', 'loading', 'task'].includes(grade.scope) &&
      ['pass', 'fail', 'unverified'].includes(grade.verdict) &&
      id(grade.reason) &&
      Array.isArray(grade.evidence) &&
      grade.evidence.every((seq) => Number.isSafeInteger(seq) && seq >= 0) &&
      unique(grade.evidence, (seq) => seq),
    code,
    'Invalid independent grade.',
  );
  assert(
    grade.verdict === 'unverified' || grade.evidence.length > 0,
    code,
    'A verdict requires observed evidence.',
  );
  return grade;
}
// Link metadata to the existing exact schema 1. This validates consistency, not truth or grader quality.
export function validateRun(
  experimentInput: unknown,
  scenarioInput: unknown,
  resultInput: unknown,
  eventsInput: unknown,
  gradesInput: unknown = [],
) {
  const experiment = validateExperiment(experimentInput),
    scenario = validateScenario(scenarioInput),
    result = validateAttempt(resultInput);
  const binding = experiment.order.find((item) => item.id === result.id);
  assert(
    binding &&
      binding.scenarioId === result.scenarioId &&
      binding.profileId === result.profileId &&
      binding.variant === result.variant &&
      result.scenarioId === scenario.id &&
      experiment.scenarios.some(
        (item) => item.id === scenario.id && item.hash === digest(scenario),
      ),
    code,
    'Result or scenario differs from the frozen attempt.',
  );
  assert(
    Array.isArray(eventsInput) && Array.isArray(gradesInput),
    code,
    'Events and grades must be arrays.',
  );
  const events = eventsInput.map(validateEvent),
    grades = gradesInput.map(validateGrade);
  const started = events.filter((event) => event.kind === 'scenario-started');
  assert(
    started.length === Number(result.started),
    code,
    'Process spawn is not observed scenario start.',
  );
  let elapsed = -1,
    phase = 0,
    observedStart = false;
  const finished = new Set<StageName>();
  for (const [index, event] of events.entries()) {
    assert(
      event.attemptId === result.id &&
        event.experimentId === experiment.id &&
        event.seq === index &&
        event.elapsedMs >= elapsed,
      code,
      'Event order or attempt identity differs.',
    );
    const nextPhase = ['launch', 'setup', 'task'].indexOf(event.stage);
    assert(
      nextPhase >= phase && !finished.has(event.stage),
      code,
      'Observation follows a final outcome or moves stages backwards.',
    );
    phase = nextPhase;
    elapsed = event.elapsedMs;
    if (event.kind === 'scenario-started') observedStart = true;
    if (event.stage !== 'launch')
      assert(
        observedStart && result.launch.status === 'pass',
        code,
        'A stage cannot precede observed startup.',
      );
    if (event.stage === 'task')
      assert(
        result.setup.status === 'pass',
        code,
        'Task observations require setup pass.',
      );
    if (event.kind === 'stage-finished')
      assert(
        digest(event.data) === digest(result[event.stage]),
        code,
        'Observed outcome differs from result schema 1.',
      );
    if (event.kind === 'stage-finished') {
      if (event.stage === 'launch' && event.data.status === 'pass')
        assert(observedStart, code, 'Launch pass requires observed start.');
      finished.add(event.stage);
    }
  }
  for (const stage of ['launch', 'setup', 'task'] as const)
    assert(
      result[stage].status === 'skip' || finished.has(stage),
      code,
      'An executed stage needs its final observation.',
    );
  assert(
    unique(grades, (grade) => grade.id),
    code,
    'Duplicate grader result id.',
  );
  for (const grade of grades)
    assert(
      grade.attemptId === result.id &&
        grade.evidence.every((seq) => events[seq]?.stage === grade.stage),
      code,
      'Grade refers to absent or unrelated evidence.',
    );
  return { experiment, scenario, result, events, grades };
}
