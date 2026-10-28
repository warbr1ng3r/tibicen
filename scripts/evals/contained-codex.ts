import path from 'node:path';
import { mkdir, realpath, rm } from 'node:fs/promises';
import { assert, digest, hashContent } from '../core/contracts.ts';
import {
  generateContainerCodexHome,
  validateContainerOutputSchema,
} from './container/codex-config.ts';
import { createContainerOwner } from './container/owner.ts';
import {
  accessOnlySubscriptionAuth,
  readAccessOnlySubscriptionAuth,
} from './container/subscription.ts';
import { inspectContainedCodexProfile } from './profiles/codex/contained.ts';
import type { ContainedCodexProfileInput } from './profiles/codex/contained.ts';
import { parseCodex } from './profiles/codex/profile.ts';
import { createProcessSupervisor } from './process-supervisor.ts';
import {
  stageContainerCodeMode,
  linuxCodeModeHost,
  linuxCodeModeHash,
} from './container/code-mode.ts';

export interface ContainedCodexRunInput extends ContainedCodexProfileInput {
  home: string;
  prompt: string;
  outputSchema?: string;
  onStart?: () => void;
  onRecord?: (record: Record<string, unknown>) => void;
  route:
    | { kind: 'synthetic'; baseUrl: string }
    | { kind: 'subscription'; authPath: string };
  expectedFreezeHash?: string;
}

export function containedCodexFailure(record: Record<string, unknown>) {
  const item = record.item as Record<string, unknown> | undefined;
  return (
    typeof record.type !== 'string' ||
    ['error', 'turn.failed'].includes(record.type) ||
    (record.type === 'item.completed' &&
      (['failed', 'declined', 'cancelled'].includes(String(item?.status)) ||
        (item?.type === 'command_execution' &&
          typeof item.exit_code === 'number' &&
          item.exit_code !== 0)))
  );
}

/** Metadata only. A returned freeze is not a model-availability/readiness claim. */
export async function describeContainedCodexRun(input: ContainedCodexRunInput) {
  const outputSchema = validateContainerOutputSchema(input.outputSchema);
  assert(
    (input.model === 'gpt-6-astra' ||
      (input.model === 'gpt-5.5' && input.route.kind === 'synthetic')) &&
      typeof input.prompt === 'string' &&
      Buffer.byteLength(input.prompt) > 0 &&
      Buffer.byteLength(input.prompt) <= 65536 &&
      path.isAbsolute(input.home) &&
      path.resolve(input.home) === input.home &&
      input.home !== input.workspace &&
      !input.home.startsWith(input.workspace + path.sep) &&
      !input.workspace.startsWith(input.home + path.sep) &&
      (input.onStart === undefined || typeof input.onStart === 'function') &&
      (input.onRecord === undefined || typeof input.onRecord === 'function'),
    'invalid-contained-codex-run',
    'Use a bounded prompt, pinned model, and separate generated host home.',
  );
  const route =
    input.route.kind === 'synthetic'
      ? {
          kind: 'synthetic',
          provider: 'tibicen_offline',
          endpoint: input.route.baseUrl,
        }
      : {
          kind: 'subscription',
          provider: 'tibicen_subscription',
          endpoint: 'https://chatgpt.com/backend-api/codex',
        };
  assert(
    input.route.kind === 'subscription' ||
      /^http:\/\/127\.0\.0\.1:[1-9]\d{0,4}\/v1$/.test(route.endpoint),
    'invalid-contained-codex-run',
    'Synthetic transport must be a literal loopback Responses endpoint.',
  );
  const profile = await inspectContainedCodexProfile(input);
  const freeze = {
    schema: 1,
    profile: {
      ...profile.specification,
      auth: input.route.kind === 'subscription' ? 'subscription' : 'none',
    },
    imageId: profile.imageId,
    imageHash: profile.imageHash,
    binaryHash: profile.binaryHash,
    sourceHashes: profile.sourceHashes,
    workspace: profile.workspace,
    filesHash: profile.filesHash,
    resultPaths: profile.resultPaths,
    promptHash: hashContent(input.prompt),
    outputSchemaHash:
      outputSchema === undefined ? null : hashContent(outputSchema),
    deadlineMs: input.deadlineMs,
    launchMs: Math.min(45000, input.deadlineMs),
    maxHostSessions: 1,
    requestMaxRetries: 0,
    streamMaxRetries: 0,
    authRecoveryRequestCount: 'not bounded by provider retry settings',
    httpRequestCount: 'unverified',
    paidApi: false,
    modelAvailability: 'unverified',
    observedEndpoint: 'unverified',
    route,
    codeMode:
      input.model === 'gpt-6-astra'
        ? {
            route: 'owned-container-stdio',
            companion: linuxCodeModeHost,
            companionHash: linuxCodeModeHash,
            hostFallback: false,
          }
        : null,
  };
  return { profile, freeze, freezeHash: digest(freeze) };
}

/** One closed-scope native session. No automatic extraction into a host project. */
export async function runContainedCodexSession(input: ContainedCodexRunInput) {
  const began = performance.now();
  assert(
    input.signal === undefined || input.signal instanceof AbortSignal,
    'invalid-contained-codex-run',
    'Expected an AbortSignal.',
  );
  const parentSignal = input.signal;
  // Capture bytes before inspection; neither caller nor model supplies later paths.
  input = {
    ...input,
    files: Object.fromEntries(
      Object.entries(input.files).map(([name, bytes]) => [
        name,
        Buffer.from(bytes),
      ]),
    ),
    resultPaths: [...input.resultPaths],
  };
  const supervisor = createProcessSupervisor();
  const abort = () => supervisor.cancel();
  parentSignal?.addEventListener('abort', abort, { once: true });
  if (parentSignal?.aborted) abort();
  input = {
    ...input,
    signal: supervisor.signal,
    deadlineAt: Math.min(
      input.deadlineAt ?? Infinity,
      began + input.deadlineMs,
    ),
  };
  const remaining = (minimum = 1) => {
    const ms = Math.floor(input.deadlineAt! - performance.now());
    assert(
      !supervisor.signal.aborted && ms >= minimum,
      'contained-codex-cancelled',
      'Session cancelled or its whole deadline elapsed.',
    );
    return ms;
  };
  let owner: Awaited<ReturnType<typeof createContainerOwner>> | undefined;
  let auth: Buffer | undefined;
  let codeMode: Awaited<ReturnType<typeof stageContainerCodeMode>> | undefined;
  // Only remove a home created by this caller, never a pre-existing path.
  let homeCreated = false;
  try {
    remaining();
    const { profile, freeze, freezeHash } =
      await describeContainedCodexRun(input);
    if (input.route.kind === 'subscription')
      assert(
        input.expectedFreezeHash === freezeHash,
        'contained-live-freeze-required',
        'Record and review the exact prospective protocol before subscription execution.',
      );
    await profile.validate();
    remaining();
    await mkdir(input.home, { mode: 0o700 });
    homeCreated = true;
    assert(
      (await realpath(input.home)) === input.home,
      'invalid-contained-codex-home',
      'Use a canonical new home.',
    );
    owner = await createContainerOwner(
      { ...input, deadlineMs: remaining(1000) },
      input.resultPaths,
    );
    void owner.session.failure.then(() => supervisor.cancel());
    void owner.finished.then(
      (receipt) => {
        if (
          !['completed', 'host-finished', 'owner-end'].includes(receipt.reason)
        )
          supervisor.cancel();
      },
      () => supervisor.cancel(),
    );
    if (input.model === 'gpt-6-astra')
      codeMode = await stageContainerCodeMode(
        profile.binary,
        profile.binaryHash,
        owner.session.cid,
      );
    remaining();
    if (input.route.kind === 'subscription')
      auth = await readAccessOnlySubscriptionAuth(
        input.route.authPath,
        input.deadlineMs,
        supervisor.signal,
      );
    remaining();
    const config = await generateContainerCodexHome({
      home: input.home,
      workspace: input.workspace,
      launcher: process.execPath,
      launcherArgs: [
        new URL('./container/bridge.mjs', import.meta.url).pathname,
        owner.manifestPath,
      ],
      outputSchema: input.outputSchema,
      ...(input.route.kind === 'synthetic'
        ? {
            modelProvider: { baseUrl: input.route.baseUrl, model: input.model },
          }
        : { subscription: { auth: auth!, model: 'gpt-6-astra' as const } }),
    });
    await profile.validate();
    await config.validate();
    await codeMode?.validate();
    // Setup consumes time; verify the access-only copy again at the launch edge.
    if (auth) accessOnlySubscriptionAuth(auth, input.deadlineMs).fill(0);
    assert(
      !supervisor.signal.aborted,
      'contained-codex-cancelled',
      'Session cancelled.',
    );
    let pending = '',
      failed = false,
      observedStart = false;
    const commandBegan = performance.now();
    const startedAt = new Date().toISOString();
    const output = await supervisor.run({
      executable: codeMode?.executable ?? profile.binary,
      argv: config.argv,
      cwd: input.workspace,
      env: config.env,
      timeoutMs: Math.min(45000, remaining()),
      stdoutLimit: 1024 * 1024,
      stderrLimit: 65536,
      stdin: { text: input.prompt },
      onStdout(chunk, controls) {
        pending += chunk;
        let end: number;
        while ((end = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, end);
          pending = pending.slice(end + 1);
          try {
            const record = JSON.parse(line);
            if (record?.type === 'turn.started' && !observedStart) {
              observedStart = true;
              controls.deadlineIn(
                Math.max(1, input.deadlineAt! - performance.now()),
              );
              input.onStart?.();
            }
            if (!record || containedCodexFailure(record)) {
              failed = true;
              controls.stop();
              return;
            }
            input.onRecord?.(record);
          } catch {
            failed = true;
            controls.stop();
            return;
          }
        }
      },
    });
    const timing = {
      startedAt,
      endedAt: new Date().toISOString(),
      durationMs: performance.now() - commandBegan,
    };
    const receipt = await owner.stop(input.resultPaths, 'host-finished');
    let parseError = false;
    const parsed = (() => {
      try {
        return parseCodex(output.stdout, output.stderr);
      } catch {
        parseError = true;
        return {
          started: false,
          completed: false,
          messages: [],
          records: [],
          commands: [],
          usage: { inputTokens: null, outputTokens: null },
        };
      }
    })();
    const configUnchanged = await config.validate(true).then(
      () => true,
      () => false,
    );
    const sourceUnchanged = await profile.validate().then(
      () => true,
      () => null,
    );
    const codeModeUnchanged =
      (await codeMode?.validate().then(
        () => true,
        () => false,
      )) ?? true;
    const pass =
      !supervisor.signal.aborted &&
      performance.now() < input.deadlineAt! &&
      output.status === 0 &&
      !output.timedOut &&
      !output.spawnError &&
      !failed &&
      !parseError &&
      parsed.started &&
      parsed.completed &&
      receipt.stopped &&
      receipt.removed &&
      configUnchanged &&
      sourceUnchanged === true &&
      codeModeUnchanged &&
      ['completed', 'host-finished', 'owner-end'].includes(receipt.reason);
    return {
      pass,
      freeze,
      freezeHash,
      durationMs: performance.now() - began,
      timing,
      hostSessions: 1,
      realModelSessions: input.route.kind === 'subscription' ? 'attempted' : 0,
      exitCode: output.status,
      timedOut: output.timedOut,
      spawnError: output.spawnError,
      parseError,
      configUnchanged,
      sourceUnchanged,
      codeModeUnchanged,
      codeModeWrapperHash: codeMode?.wrapperHash ?? null,
      stderrHash: hashContent(output.stderr),
      parsed,
      receipt,
    };
  } finally {
    parentSignal?.removeEventListener('abort', abort);
    supervisor.cancel();
    try {
      await owner?.stop(input.resultPaths, 'caller-finally');
    } finally {
      try {
        auth?.fill(0);
        try {
          await codeMode?.dispose();
        } finally {
          if (homeCreated)
            await rm(input.home, { recursive: true, force: true });
        }
      } finally {
        supervisor.dispose();
      }
    }
  }
}
