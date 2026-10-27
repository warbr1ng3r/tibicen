import path from 'node:path';
import { spawn } from 'node:child_process';
import { StringDecoder } from 'node:string_decoder';
import { assert, digest } from '../core/contracts.ts';
import {
  executorScenario,
  validateEvent,
  validateExperiment,
  validatePreflight,
  validateRun,
  validateScenario,
} from './contracts.ts';
import type {
  EvalEvent,
  EvalProfile,
  EvalProfileSpec,
  EvalScenario,
  Experiment,
} from './contracts.ts';
import type { Stage } from './results.ts';
import { observationGuard } from './observations.ts';

type Phase = 'setup' | 'task';
type ReplyRequest = Parameters<Parameters<EvalProfile['run']>[2]>[0];
type HumanReply = Awaited<ReturnType<Parameters<EvalProfile['run']>[2]>>;
export type HostObserve = (
  kind: 'checkpoint' | 'approval' | 'host-command' | 'assertion',
  data: unknown,
) => void;
export interface ProcessProfile {
  specification: EvalProfileSpec;
  preflight: EvalProfile['preflight'];
  command(stage: Phase): {
    executable: string;
    argv: string[];
    cwd: string;
    env: NodeJS.ProcessEnv;
  };
}
export interface ProcessRunInput {
  experiment: Experiment;
  scenario: EvalScenario;
  attemptId: string;
  profile: ProcessProfile;
  signal?: AbortSignal;
  reviewReply?: (
    request: ReplyRequest,
    scriptedText: string,
  ) => Promise<HumanReply>;
  sensitiveValues?: readonly string[];
  beforeStage?: (stage: Phase, observe: HostObserve) => Promise<void>;
  afterStage?: (
    stage: Phase,
    observe: HostObserve,
    events: readonly EvalEvent[],
  ) => Promise<void | { status: 'fail' | 'error'; reason: string }>;
  hostObserve?: (observe: HostObserve) => void;
}
const skip = (reason: string): Stage => ({
  status: 'skip',
  durationMs: 0,
  reason,
});
const error = (reason: string, durationMs: number): Stage => ({
  status: 'error',
  durationMs,
  reason,
});
const reasonCode = (value: unknown): value is string =>
  typeof value === 'string' &&
  /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(value);

// Only trusted offline drivers use this protocol. Native agent output needs a separately verified profile/parser.
async function session(
  command: ReturnType<ProcessProfile['command']>,
  input: unknown,
  options: {
    phase: Phase;
    launchMs: number;
    stageMs: number;
    signal?: AbortSignal;
    guard(value: unknown): void;
    ready(): void;
    observe(message: { kind: string; data: unknown }): void;
    reply(request: Omit<ReplyRequest, 'stage'>): Promise<HumanReply>;
  },
) {
  assert(
    path.isAbsolute(command.executable) &&
      path.isAbsolute(command.cwd) &&
      Array.isArray(command.argv) &&
      command.argv.every(
        (arg) => typeof arg === 'string' && !arg.includes('\0'),
      ) &&
      command.env &&
      typeof command.env === 'object',
    'invalid-eval-driver',
    'Use an absolute executable/cwd, literal argv and explicit environment.',
  );
  options.guard(command);
  assert(
    !Object.keys(command.env).some((name) =>
      /TOKEN|SECRET|PASSWORD|API_KEY|CREDENTIAL|AUTH/i.test(name),
    ),
    'unsafe-eval-driver',
    'Offline project processes cannot receive authorization environment variables.',
  );
  const began = performance.now();
  if (options.signal?.aborted)
    return { ready: false, outcome: error('aborted', 0) };
  return new Promise<{ ready: boolean; outcome: Stage }>((resolve) => {
    let ready = false,
      finished: Stage | undefined,
      failure: string | undefined,
      pendingReply = false;
    let buffer = '',
      bytes = 0,
      readyAt = began,
      endedAt: number | undefined,
      stopping = false,
      settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const decoder = new StringDecoder('utf8');
    const child = spawn(command.executable, command.argv, {
      cwd: command.cwd,
      env: command.env,
      shell: false,
      detached: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const groupSignal = (signal: NodeJS.Signals) => {
      if (!child.pid) return false;
      try {
        process.kill(-child.pid, signal);
        return true;
      } catch (caught) {
        if ((caught as NodeJS.ErrnoException).code === 'ESRCH') return false;
        failure = 'process-tree-uncontrolled';
        return true;
      }
    };
    const finish = () => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
      child.stdin.destroy();
      child.stdout.destroy();
      child.stderr.destroy();
      const durationMs = Math.max(
        0,
        (endedAt ?? performance.now()) -
          (options.phase === 'setup' && ready ? readyAt : began),
      );
      const outcome = failure
        ? error(failure, durationMs)
        : finished
          ? {
              ...finished,
              durationMs: finished.status === 'skip' ? 0 : durationMs,
            }
          : error('incomplete-output', durationMs);
      resolve({ ready, outcome });
    };
    const stop = () => {
      if (stopping) return;
      stopping = true;
      endedAt = performance.now();
      clearTimeout(timer);
      const groupExisted = groupSignal('SIGTERM');
      // Do not cancel escalation when the leader exits: its descendants may still be running.
      if (child.pid)
        setTimeout(() => {
          if (groupExisted) groupSignal('SIGKILL');
          finish();
        }, 100);
      else finish();
    };
    const fail = (reason: string) => {
      failure ??= reason;
      stop();
    };
    const abort = () => fail('aborted');
    const arm = (ms: number, reason: string) => {
      if (!stopping) {
        clearTimeout(timer);
        timer = setTimeout(() => fail(reason), ms);
      }
    };
    arm(
      options.launchMs,
      options.phase === 'setup' ? 'launch-timeout' : 'task-timeout',
    );
    options.signal?.addEventListener('abort', abort, { once: true });
    if (options.signal?.aborted) abort();
    const keys = (
      message: Record<string, unknown>,
      required: string[],
      optional: string[] = [],
    ) => {
      assert(
        required.every((key) => Object.hasOwn(message, key)) &&
          Object.keys(message).every((key) =>
            [...required, ...optional].includes(key),
          ),
        'invalid-eval-output',
        'Invalid process protocol fields.',
      );
    };
    const receive = (line: string) => {
      const message = JSON.parse(line) as Record<string, unknown>;
      options.guard(message);
      assert(
        message &&
          typeof message === 'object' &&
          !Array.isArray(message) &&
          !finished &&
          !pendingReply,
        'invalid-eval-output',
        'Out-of-order process message.',
      );
      if (message.kind === 'ready') {
        keys(message, ['kind']);
        assert(!ready, 'invalid-eval-output', 'Duplicate ready observation.');
        ready = true;
        readyAt = performance.now();
        options.ready();
        arm(
          options.phase === 'setup'
            ? options.stageMs
            : Math.max(1, options.stageMs - (readyAt - began)),
          options.phase + '-timeout',
        );
      } else if (message.kind === 'error') {
        keys(message, ['kind', 'reason']);
        assert(
          reasonCode(message.reason),
          'invalid-eval-output',
          'Expected a bounded reason code.',
        );
        fail(message.reason);
      } else {
        assert(
          ready,
          'invalid-eval-output',
          'A stage must be observably ready.',
        );
        if (message.kind === 'finished') {
          keys(message, ['kind', 'status'], ['reason']);
          const data = {
            status: message.status,
            durationMs: 0,
            ...(Object.hasOwn(message, 'reason')
              ? { reason: message.reason }
              : {}),
          };
          const checked = validateEvent({
            schema: 1,
            experimentId: 'protocol',
            attemptId: 'protocol',
            seq: 0,
            elapsedMs: 0,
            stage: 'setup',
            kind: 'stage-finished',
            data,
          });
          if (checked.kind === 'stage-finished') finished = checked.data;
        } else if (message.kind === 'observation') {
          keys(message, ['kind', 'observation', 'data']);
          assert(
            ['artifact', 'command', 'instructions-loaded', 'usage'].includes(
              message.observation as string,
            ),
            'invalid-eval-output',
            'Unknown observation.',
          );
          options.observe({
            kind: message.observation as string,
            data: message.data,
          });
        } else if (message.kind === 'reply') {
          keys(message, ['kind', 'when'], ['proposalDigest']);
          assert(
            ['clarification', 'proposal', 'review'].includes(
              message.when as string,
            ) &&
              (!Object.hasOwn(message, 'proposalDigest') ||
                /^[a-f0-9]{64}$/.test(message.proposalDigest as string)),
            'invalid-eval-output',
            'Invalid human reply request.',
          );
          pendingReply = true;
          void options
            .reply({
              when: message.when as ReplyRequest['when'],
              ...(Object.hasOwn(message, 'proposalDigest')
                ? { proposalDigest: message.proposalDigest as string }
                : {}),
            })
            .then(
              (reply) => {
                if (stopping) return;
                pendingReply = false;
                try {
                  options.guard(reply);
                  child.stdin.write(
                    JSON.stringify({ kind: 'reply', data: reply }) + '\n',
                  );
                } catch {
                  fail('reply-rejected');
                }
              },
              () => fail('reply-rejected'),
            );
        } else assert(false, 'invalid-eval-output', 'Unknown process message.');
      }
    };
    child.stdout.on('data', (chunk: Buffer) => {
      if (failure || settled) return;
      bytes += chunk.length;
      if (bytes > 1024 * 1024) {
        fail('output-limit');
        return;
      }
      buffer += decoder.write(chunk);
      let newline: number;
      while ((newline = buffer.indexOf('\n')) !== -1) {
        const line = buffer.slice(0, newline);
        buffer = buffer.slice(newline + 1);
        if (Buffer.byteLength(line) > 64 * 1024) {
          fail('output-limit');
          return;
        }
        try {
          receive(line);
        } catch {
          fail('invalid-output');
        }
        if (failure) return;
      }
      if (Buffer.byteLength(buffer) > 64 * 1024) fail('output-limit');
    });
    child.stdout.on('end', () => {
      if (!failure && (buffer + decoder.end()).length) fail('invalid-output');
    });
    child.stdout.on('error', () => fail('output-unavailable'));
    child.stderr.on('error', () => fail('output-unavailable'));
    // Raw stdout/stderr and native errors are never returned as observations.
    child.stderr.resume();
    child.stdin.on('error', () => fail('input-unavailable'));
    child.on('error', () => fail('execution-unavailable'));
    child.on('exit', (code, signal) => {
      if (!failure && (code !== 0 || signal)) failure = 'process-exit';
      if (pendingReply) failure ??= 'incomplete-output';
      stop();
    });
    child.stdin.write(JSON.stringify(input) + '\n');
  });
}

export async function runProcessAttempt(input: ProcessRunInput) {
  const guard = observationGuard(input.sensitiveValues);
  guard({ experiment: input.experiment, scenario: input.scenario });
  const experiment = structuredClone(validateExperiment(input.experiment));
  const scenario = structuredClone(validateScenario(input.scenario));
  const binding = experiment.order.find((item) => item.id === input.attemptId);
  const specification = structuredClone(input.profile.specification);
  assert(
    binding &&
      binding.scenarioId === scenario.id &&
      experiment.scenarios.some(
        (item) => item.id === scenario.id && item.hash === digest(scenario),
      ) &&
      experiment.profiles.some(
        (item) =>
          item.id === binding.profileId &&
          digest(item) === digest(specification),
      ),
    'invalid-eval-run',
    'Run differs from frozen inputs/profile.',
  );
  const began = performance.now(),
    events: EvalEvent[] = [];
  let started = false;
  const stages = {
    launch: skip('not-started'),
    setup: skip('not-started'),
    task: skip('setup-not-passed'),
  };
  const observe = (stage: 'launch' | Phase, kind: string, data: unknown) => {
    assert(
      events.length < (kind === 'stage-finished' ? 10_000 : 9997),
      'invalid-eval-output',
      'Too many observations.',
    );
    const event = validateEvent({
      schema: 1,
      experimentId: experiment.id,
      attemptId: binding.id,
      seq: events.length,
      elapsedMs: performance.now() - began,
      stage,
      kind,
      data: structuredClone(data),
    });
    guard(event);
    events.push(event);
  };
  const complete = () =>
    validateRun(
      experiment,
      scenario,
      {
        schema: 1,
        id: binding.id,
        scenarioId: scenario.id,
        profileId: binding.profileId,
        variant: binding.variant,
        started,
        ...stages,
      },
      events,
    );
  const noLaunch = (status: 'skip' | 'error', reason: string) => {
    stages.launch =
      status === 'skip'
        ? skip(reason)
        : error(reason, performance.now() - began);
    observe('launch', 'stage-finished', stages.launch);
    return complete();
  };
  if (input.signal?.aborted) return noLaunch('skip', 'aborted');
  if (process.platform === 'win32')
    return noLaunch('skip', 'process-tree-unavailable');
  if (scenario.isolation === 'hostile')
    return noLaunch('skip', 'isolation-unavailable');
  if (specification.auth !== 'none' || specification.paid)
    return noLaunch('skip', 'external-profile-unavailable');
  let preflightTimer: ReturnType<typeof setTimeout> | undefined;
  let removeAbort = () => {};
  try {
    const boundary = await Promise.race([
      Promise.resolve().then(() =>
        input.profile.preflight(structuredClone(experiment.limits)),
      ),
      new Promise<never>((_, reject) => {
        preflightTimer = setTimeout(
          () => reject(new Error('preflight-timeout')),
          experiment.limits.launchMs,
        );
      }),
      new Promise<never>((_, reject) => {
        const abort = () => reject(new Error('aborted'));
        removeAbort = () => input.signal?.removeEventListener('abort', abort);
        input.signal?.addEventListener('abort', abort, { once: true });
        if (input.signal?.aborted) abort();
      }),
    ]);
    const preflight = validatePreflight(boundary);
    if (preflight.status !== 'ready')
      return noLaunch(
        'skip',
        [
          'startup-uncontrolled',
          'auth-unprotected',
          'process-tree-uncontrolled',
          'isolation-unavailable',
          'auth-unavailable',
        ].includes(preflight.reason ?? '')
          ? preflight.reason!
          : 'preflight-blocked',
      );
  } catch (caught) {
    const message = caught instanceof Error ? caught.message : '';
    return noLaunch(
      'error',
      ['preflight-timeout', 'aborted'].includes(message)
        ? message
        : 'preflight-unavailable',
    );
  } finally {
    clearTimeout(preflightTimer);
    removeAbort();
  }
  if (performance.now() - began >= experiment.limits.launchMs)
    return noLaunch('error', 'launch-timeout');
  const publicScenario = executorScenario(scenario);
  for (const phase of ['setup', 'task'] as const) {
    const replies = [...scenario[phase].replies];
    const before: { kind: Parameters<HostObserve>[0]; data: unknown }[] = [];
    let acceptingHost = false;
    let readyAt = 0;
    let observed: Awaited<ReturnType<typeof session>>;
    try {
      await input.beforeStage?.(phase, (kind, data) => {
        before.push({ kind, data: structuredClone(data) });
      });
      const publicStage = publicScenario[phase];
      observed = await session(
        input.profile.command(phase),
        {
          schema: 1,
          attempt: binding,
          stage: phase,
          scenario: {
            id: scenario.id,
            dialogue: publicScenario.dialogue,
            ...publicStage,
          },
        },
        {
          phase,
          launchMs:
            phase === 'setup'
              ? Math.max(
                  1,
                  experiment.limits.launchMs - (performance.now() - began),
                )
              : experiment.limits.taskMs,
          stageMs:
            phase === 'setup'
              ? experiment.limits.setupMs
              : experiment.limits.taskMs,
          signal: input.signal,
          guard,
          ready() {
            readyAt = performance.now();
            if (phase === 'setup') {
              started = true;
              observe('launch', 'scenario-started', {});
              stages.launch = { status: 'pass', durationMs: readyAt - began };
              observe('launch', 'stage-finished', stages.launch);
            }
            for (const event of before) observe(phase, event.kind, event.data);
            acceptingHost = true;
            input.hostObserve?.((kind, data) => {
              assert(
                acceptingHost,
                'late-eval-observation',
                'The stage has already stopped.',
              );
              observe(phase, kind, data);
            });
          },
          observe(message) {
            observe(phase, message.kind, message.data);
          },
          async reply(request) {
            const index = replies.findIndex(
              (reply) => reply.when === request.when,
            );
            if (index < 0 || !input.reviewReply) return null;
            const [scripted] = replies.splice(index, 1);
            const response = await input.reviewReply(
              { stage: phase, ...request },
              scripted.text,
            );
            if (response === null) return null;
            const { text, approvedDigest } = response;
            const approved = Object.hasOwn(response, 'approvedDigest');
            assert(
              typeof text === 'string' &&
                text.length > 0 &&
                text.length <= 100_000 &&
                Reflect.ownKeys(response).every(
                  (key) => key === 'text' || key === 'approvedDigest',
                ),
              'invalid-eval-reply',
              'Invalid reviewed response.',
            );
            if (approved)
              assert(
                request.when !== 'clarification' &&
                  /^[a-f0-9]{64}$/.test(request.proposalDigest ?? '') &&
                  approvedDigest === request.proposalDigest,
                'invalid-eval-reply',
                'Approval must bind the reviewed exact proposal.',
              );
            return { text, ...(approved ? { approvedDigest } : {}) };
          },
        },
      );
    } catch {
      observed = { ready: false, outcome: error('driver-unavailable', 0) };
    }
    acceptingHost = false;
    if (phase === 'setup' && !started) {
      stages.launch = {
        ...observed.outcome,
        durationMs: performance.now() - began,
      };
      if (stages.launch.status !== 'error')
        stages.launch = error('unobserved-start', performance.now() - began);
      observe('launch', 'stage-finished', stages.launch);
      break;
    }
    if (started) {
      try {
        if (input.afterStage)
          observe(phase, 'driver-finished', observed.outcome);
        const verdict = await input.afterStage?.(
          phase,
          (kind, data) => observe(phase, kind, data),
          events,
        );
        if (verdict && observed.outcome.status === 'pass')
          observed = {
            ...observed,
            outcome: { ...verdict, durationMs: observed.outcome.durationMs },
          };
      } catch {
        observed = {
          ...observed,
          outcome: error(
            'host-observation-unavailable',
            observed.outcome.durationMs,
          ),
        };
      }
    }
    stages[phase] = observed.outcome;
    observe(phase, 'stage-finished', stages[phase]);
    if (stages[phase].status !== 'pass') break;
  }
  return complete();
}
