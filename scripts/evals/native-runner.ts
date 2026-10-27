import path from 'node:path';
export {
  describeContainedCodexRun,
  runContainedCodexSession,
} from './contained-codex.ts';
import os from 'node:os';
import { pathToFileURL } from 'node:url';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  realpath,
  cp,
  lstat,
} from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  serializeData,
} from '../core/contracts.ts';
import { safePath } from '../core/paths.ts';
import { validateExperiment, validateEvent, validateRun } from './contracts.ts';
import type { EvalEvent, Experiment, Grade } from './contracts.ts';
import type { EvalAttempt, Stage } from './results.ts';
import type { ReportExperiment } from './report.ts';
import type { ReviewedPlan } from './mechanical.ts';
import type { AcceptanceFixture } from './matrix.ts';
import { tree as snapshot } from './mechanical.ts';
import { writeEvalArtifact, observationGuard } from './observations.ts';
import { loadNativeProfile } from './profiles/index.ts';
import type { NativeProfileId } from './profiles/index.ts';
import type {
  NativeCommand,
  NativeOutput,
  NativePermissions,
  NativeProfile,
} from './profiles/contracts.ts';
import { inspectOpenSpecPackage } from './openspec-source.ts';
import { createProcessSupervisor } from './process-supervisor.ts';
import { createNativeEvidence } from './native-evidence.ts';
import {
  checkMathExports,
  checkOpenSpecArtifacts,
  nativeProcessValidation,
  checkOpenSpecPlanning,
} from './native-checks.ts';
import { loadNativeSources, nativeSourcePreload } from './native-sources.ts';
import {
  reviewNativeProposal,
  reviewNativePlanning,
  nativeProposalSchema,
  workflowPhases,
  phasePaths,
  nativeRecipe,
  nativeProcessMetadata,
  isNativeProcessInspection,
  recipeHash,
  nodeRecipe,
  checkKernelReceipt,
} from './native-workflow.ts';
import type { NativePhase } from './native-workflow.ts';
import {
  setupLayout,
  setupCommand,
  setupCommandKind,
  validateSetupMode,
} from './profiles/codex/tibicen-setup.ts';
import type { ContainedTibicenSetup } from './profiles/codex/tibicen-setup.ts';

export interface NativeRunOptions {
  profile: NativeProfileId;
  preflightPath: string;
  artifactDirectory: string;
  sourceSha: string;
  experimentId: string;
  repeats: number;
  limits: Experiment['limits'];
  maxModelSessions: number;
  sourceMirrorPath?: string;
}
const quote = (value: string) => "'" + value.replaceAll("'", "'\\''") + "'";
type Snapshot = Awaited<ReturnType<typeof snapshot>>;

function unapprovedEffects(
  before: Snapshot,
  after: Snapshot,
  changes: ReviewedPlan['changes'],
  kernel: boolean,
) {
  const oldFiles = new Map(before.files.map((file) => [file.path, file])),
    newFiles = new Map(after.files.map((file) => [file.path, file]));
  const expected = new Map(changes.map((file) => [file.path, file.afterHash]));
  for (const file of new Set([...oldFiles.keys(), ...newFiles.keys()])) {
    const old = oldFiles.get(file),
      next = newFiles.get(file);
    if (
      (!old && !before.complete) ||
      (!next && !after.complete) ||
      digest(old ?? null) === digest(next ?? null) ||
      (kernel &&
        ['.tibicen/manifest.yml', '.tibicen/state/session.json'].includes(file))
    )
      continue;
    if (
      !expected.has(file) ||
      (next?.contentHash ?? null) !== expected.get(file) ||
      (old && next && old.fileMode !== next.fileMode)
    )
      return true;
  }
  return false;
}

// Both public entries use this one process supervisor and approval protocol.
export async function runNativeExperiment(
  options: NativeRunOptions,
  fixtures: AcceptanceFixture[],
  acceptance: boolean,
  trustedFixtureProfile?: NativeProfile,
  contained?: ContainedTibicenSetup,
): Promise<{ experiments: ReportExperiment[] }> {
  assert(
    fixtures.length > 0 &&
      new Set(fixtures.map((item) => item.scenario.id)).size ===
        fixtures.length,
    'invalid-native-selection',
    'Select unique fixtures.',
  );
  for (const fixture of fixtures) {
    if (!fixture.interaction.process) continue;
    const planning = fixture.interaction.planning;
    assert(
      planning,
      'invalid-native-selection',
      'Process planning policy is required.',
    );
    for (const phase of ['specification', 'plan'] as const) {
      const allowed = phasePaths(fixture.scenario, 'task', phase);
      const required = planning[phase];
      assert(
        required.length > 0 &&
          new Set(required).size === required.length &&
          required.every((file) => allowed.includes(file)),
        'invalid-native-selection',
        'Required planning must be concrete allowed phase paths.',
      );
    }
    assert(
      planning.optionalDesign === null ||
        (planning.optionalDesign === 'openspec/changes/add-triple/design.md' &&
          phasePaths(fixture.scenario, 'task', 'plan').includes(
            planning.optionalDesign,
          ) &&
          !planning.plan.includes(planning.optionalDesign)),
      'invalid-native-selection',
      'Only conditional design can be skipped.',
    );
  }
  assert(
    Number.isSafeInteger(options.maxModelSessions) &&
      options.maxModelSessions > 0 &&
      options.maxModelSessions <= 10000 &&
      options.limits.maxCostUsd === null,
    'invalid-native-budget',
    'Freeze a bounded subscription session budget; no paid route.',
  );
  assert(
    Number.isSafeInteger(options.repeats) &&
      options.repeats > 0 &&
      options.repeats <= 100,
    'invalid-native-budget',
    'Freeze 1–100 repeats before execution.',
  );
  // Code-only fixture seam; public production entrypoints never pass a profile.
  const driver =
    contained ??
    trustedFixtureProfile ??
    (await loadNativeProfile(options.profile, options.preflightPath));
  const ready =
    contained?.freeze ??
    JSON.parse(await readFile(options.preflightPath, 'utf8'));
  if (contained)
    assert(
      options.profile === 'codex' &&
        options.repeats === 1 &&
        options.maxModelSessions === 4 &&
        !options.sourceMirrorPath &&
        digest(fixtures) === digest(contained.fixtures),
      'invalid-native-selection',
      'Explicit fixed contained init/adopt selection only.',
    );
  const profile = structuredClone(driver.specification);
  const order: Experiment['order'] = [];
  for (let repeat = 1; repeat <= options.repeats; repeat++)
    fixtures.forEach((item, index) => {
      const variants = contained
        ? (['tibicen'] as const)
        : (index + repeat) % 2
          ? (['tibicen', 'baseline'] as const)
          : (['baseline', 'tibicen'] as const);
      for (const variant of variants)
        order.push({
          id: acceptance
            ? `${item.scenario.id}-${variant}-${repeat}`
            : `${index ? 'conflicts' : 'bare'}-${variant}`,
          scenarioId: item.scenario.id,
          profileId: profile.id,
          variant,
          repeat,
        });
    });
  // Validate sizes/ids/limits before creating scopes or starting native commands.
  const coordinates = {
    schema: 1 as const,
    ...(contained ? { setupOnlyTibicen: true as const } : {}),
    id: options.experimentId,
    sourceSha: options.sourceSha,
    conditionsHash: digest('pending'),
    scenarios: fixtures.map((item) => ({
      id: item.scenario.id,
      hash: digest(item.scenario),
    })),
    profiles: [profile],
    repeats: options.repeats,
    limits: options.limits,
    order,
  };
  validateExperiment(coordinates);
  const destination = path.resolve(options.artifactDirectory);
  await mkdir(destination, { mode: 0o700 });
  if (driver.state === 'blocked') {
    const plans = Object.fromEntries(
      fixtures.map((item) => [item.scenario.id, item.quality]),
    );
    const conditions = {
      nativeProtocol: 2,
      profile: options.profile,
      preflight: ready,
      fixturesHash: digest(fixtures),
      plans,
      maxModelSessions: options.maxModelSessions,
      limits: options.limits,
      modelRequests: 0,
    };
    const experiment = validateExperiment({
        ...coordinates,
        conditionsHash: digest(conditions),
      }),
      runs: ReportExperiment['runs'] = [];
    await writeEvalArtifact(path.join(destination, 'frozen.json'), {
      experiment,
      conditions,
    });
    for (const slot of order) {
      const scenario = fixtures.find(
        (item) => item.scenario.id === slot.scenarioId,
      )!.scenario;
      const skip = {
        status: 'skip' as const,
        durationMs: 0,
        reason: driver.preflight.reason!,
      };
      const result = {
        schema: 1,
        id: slot.id,
        scenarioId: slot.scenarioId,
        profileId: slot.profileId,
        variant: slot.variant,
        started: false,
        launch: skip,
        setup: { ...skip, reason: 'not-started' },
        task: { ...skip, reason: 'setup-not-passed' },
      };
      const events = [
        {
          schema: 1,
          experimentId: experiment.id,
          attemptId: slot.id,
          seq: 0,
          elapsedMs: 0,
          stage: 'launch',
          kind: 'stage-finished',
          data: skip,
        },
      ];
      const run = validateRun(experiment, scenario, result, events);
      runs.push({ run });
      await writeEvalArtifact(
        path.join(destination, slot.id + '-run.json'),
        run,
      );
      await writeEvalArtifact(
        path.join(destination, slot.id + '-sessions.json'),
        { schema: 1, runHash: digest(run), sessions: [] },
      );
      await writeEvalArtifact(
        path.join(destination, slot.id + '-evidence.json'),
        { schema: 1, runHash: digest(run), evidence: [] },
      );
    }
    return { experiments: [{ experiment, mode: 'observed', plans, runs }] };
  }
  const active = driver;
  const native = 'invocation' in active ? active : undefined;
  const scope = await realpath(
      await mkdtemp(
        contained
          ? '/private/tmp/tn-'
          : path.join(os.tmpdir(), 'tibicen-native-evaluation-'),
      ),
    ),
    root = contained
      ? path.join(scope, 'container/project')
      : path.join(scope, 'project'),
    runtime = path.join(scope, 'runtime');
  const supervisor = createProcessSupervisor();
  const deadlines: ReturnType<typeof setTimeout>[] = [];
  let modelSessions = 0;
  async function command(
    invocation: NativeCommand,
    limit: number,
    prompt?: string,
    onRecord?: (record: Record<string, unknown>) => void,
  ) {
    assert(
      !supervisor.signal.aborted,
      'native-aborted',
      'Evaluation cancelled.',
    );
    const began = performance.now(),
      startedAt = new Date().toISOString();
    let pending = '',
      observedStart = false;
    const { status, stdout, stderr, timedOut } = await supervisor.run({
      ...invocation,
      timeoutMs: onRecord ? Math.min(limit, options.limits.launchMs) : limit,
      stdoutLimit: 1024 * 1024,
      stderrLimit: 65536,
      stdin: { text: prompt },
      onStdout(chunk, controls) {
        pending += chunk;
        let end: number;
        while ((end = pending.indexOf('\n')) !== -1) {
          const line = pending.slice(0, end);
          pending = pending.slice(end + 1);
          let record: Record<string, unknown>;
          try {
            record = JSON.parse(line);
          } catch {
            continue;
          }
          if (!record || typeof record !== 'object' || Array.isArray(record))
            continue;
          if (native?.starts(record) && !observedStart) {
            observedStart = true;
            controls.deadlineIn(
              Math.max(1, limit - (performance.now() - began)),
            );
          }
          try {
            onRecord?.(record);
          } catch {
            controls.stop();
          }
        }
      },
    });
    return {
      status,
      stdout,
      stderr,
      timedOut,
      timing: {
        startedAt,
        endedAt: new Date().toISOString(),
        durationMs: performance.now() - began,
      },
    };
  }
  try {
    await mkdir(runtime);
    const needsSources =
      acceptance &&
      fixtures.some((item) =>
        item.scenario.files.some((file) =>
          file.path.startsWith('available-sources/ponytail/'),
        ),
      );
    assert(
      !needsSources || options.sourceMirrorPath,
      'native-source-mirror-required',
      'Capture and select pinned public source responses before this series.',
    );
    const source = options.sourceMirrorPath
      ? await loadNativeSources(options.sourceMirrorPath)
      : undefined;
    if (source) {
      await writeFile(
        path.join(runtime, 'sources.mjs'),
        nativeSourcePreload(source.mirror),
        { mode: 0o600 },
      );
      await writeEvalArtifact(
        path.join(destination, 'source-mirror.json'),
        source.mirror,
      );
    }
    const needsCli = fixtures.some((item) => item.interaction.process);
    const cli = needsCli ? await inspectOpenSpecPackage() : undefined;
    if (cli) {
      const frozen = JSON.parse(
        await readFile(
          new URL('./fixtures/sources/openspec.json', import.meta.url),
          'utf8',
        ),
      );
      assert(
        digest(cli.resources) === frozen.resourceHash &&
          cli.integrity === frozen.integrity,
        'native-process-changed',
        'OpenSpec differs from the inspected frozen package.',
      );
      await mkdir(path.join(runtime, 'bin'));
      await writeFile(
        path.join(runtime, 'bin/openspec'),
        `#!/bin/sh\nexec ${quote(process.execPath)} ${quote(path.join(cli.cli, 'bin/openspec.js'))} "$@"\n`,
        { mode: 0o755 },
      );
    }
    const distribution = new URL('../../dist/', import.meta.url),
      sums = await readFile(new URL('SHA256SUMS', distribution), 'utf8');
    for (const line of sums.trim().split('\n')) {
      const [hash, file] = line.split('  ');
      assert(
        hashContent(await readFile(new URL(file, distribution))) === hash,
        'native-distribution-changed',
        'Build inventory changed.',
      );
    }
    const harnessFiles = await Promise.all(
      [
        'native.ts',
        'native-runner.ts',
        'process-supervisor.ts',
        'native-evidence.ts',
        'native-checks.ts',
        'profiles/index.ts',
        'profiles/contracts.ts',
        'profiles/probe-cli.ts',
        'profiles/codex/profile.ts',
        'profiles/codex/tibicen-setup.ts',
        'profiles/codex/preflight.ts',
        'profiles/zcode/preflight.ts',
        'profiles/zcode/profile.ts',
        'profiles/claude/preflight.ts',
        'native-workflow.ts',
        'native-sources.ts',
        'openspec-source.ts',
        'matrix.ts',
        'matrix/product.ts',
        'matrix/preferences.ts',
        'matrix/blocks.ts',
        'matrix/lifecycle.ts',
        'matrix/skills.ts',
        'matrix/process.ts',
        'matrix/shared.ts',
        'contracts.ts',
        'fixtures.ts',
        'mechanical.ts',
        'runner.ts',
        'observations.ts',
        'report.ts',
        'results.ts',
        'quality.ts',
      ].map(async (file) => ({
        path: file,
        hash: hashContent(await readFile(new URL(file, import.meta.url))),
      })),
    );
    let runtimeProbe: unknown = null,
      boundaryVerified = true;
    if (acceptance && !contained) {
      const probeHome = path.join(scope, 'probe-home'),
        probeRoot = path.join(scope, 'probe-project'),
        secretFile = path.join(scope, 'synthetic-private-auth');
      await mkdir(probeHome);
      await mkdir(path.join(probeHome, 'tmp'));
      await mkdir(probeRoot);
      await writeFile(secretFile, 'synthetic-private-value', { mode: 0o600 });
      const probePolicy: NativePermissions = {
        root: probeRoot,
        home: probeHome,
        privateRoot: scope,
        read: [
          runtime,
          ...(cli
            ? [
                cli.cli,
                await realpath(
                  new URL('../../node_modules/.pnpm', import.meta.url),
                ),
              ]
            : []),
        ],
        write: [],
        deny: [],
      };
      const runtimeCanary = path.join(runtime, 'read-only-canary.json');
      await writeFile(runtimeCanary, '{}\n', { mode: 0o600 });
      const probe = path.join(runtime, 'boundary-probe.mjs');
      await writeFile(
        probe,
        `import {readFile,writeFile} from 'node:fs/promises';let denied=false,resourcesReadable=true,runtimeWriteDenied=false;try{await readFile(${JSON.stringify(secretFile)});}catch{denied=true;}for(const file of ${JSON.stringify([...(source ? [path.join(runtime, 'sources.mjs')] : []), ...(cli ? [path.join(cli.cli, 'bin/openspec.js')] : [])])})try{await readFile(file);}catch{resourcesReadable=false;}try{await readFile(${JSON.stringify(runtimeCanary)});}catch{resourcesReadable=false;}try{await writeFile(${JSON.stringify(runtimeCanary)},'changed');}catch{runtimeWriteDenied=true;}console.log(JSON.stringify({denied,resourcesReadable,runtimeWriteDenied}));\n`,
      );
      const result = await command(
        native!.check(probePolicy, process.execPath, [probe]),
        options.limits.launchMs,
      );
      let facts: {
        denied?: boolean;
        resourcesReadable?: boolean;
        runtimeWriteDenied?: boolean;
      } | null = null;
      try {
        facts = JSON.parse(result.stdout);
      } catch {
        /* Failed boundary is never ready. */
      }
      boundaryVerified =
        !result.timedOut &&
        result.status === 0 &&
        facts?.denied === true &&
        facts.resourcesReadable === true &&
        facts.runtimeWriteDenied === true &&
        (await readFile(runtimeCanary, 'utf8')) === '{}\n';
      runtimeProbe = {
        policyHash: digest(probePolicy),
        scriptHash: hashContent(await readFile(probe)),
        exitCode: result.status,
        timedOut: result.timedOut,
        facts,
        verified: boundaryVerified,
      };
      await writeEvalArtifact(
        path.join(destination, 'runtime-preflight.json'),
        runtimeProbe,
      );
    }
    const plans = Object.fromEntries(
      fixtures.map((item) => [item.scenario.id, item.quality]),
    );
    const conditions = {
      schema: 1,
      nativeProtocol: 2,
      ...(contained
        ? {
            containedSetup: contained.freeze,
            containedBatchHash: contained.freezeHash,
            tibicenOnly: true,
            setupOnly: true,
            setupOnlyTibicen: true,
          }
        : {}),
      sourceSha: options.sourceSha,
      distributionHash: hashContent(sums),
      preflightHash: digest(ready),
      runtimeProbe,
      model: profile.model,
      repeats: options.repeats,
      maxModelSessions: options.maxModelSessions,
      apiCallsAllowed: false,
      order,
      limits: options.limits,
      plans,
      fixturesHash: digest(fixtures),
      harnessFiles,
      harnessHash: digest(harnessFiles),
      sourceMirrorHash: source ? digest(source.mirror) : null,
      process: cli
        ? {
            packageRoot: cli.cli,
            resourceHash: digest(cli.resources),
            lockHash: cli.lockHash,
          }
        : null,
      consent:
        'Exact per-phase files/commands; specification, plan and implementation have separate approvals. Kernel service intent is separately bound.',
    };
    profile.startupHash = digest({
      preflight: ready.startupHash,
      harness: conditions.harnessHash,
      sources: conditions.sourceMirrorHash,
      process: conditions.process,
    });
    profile.permissionsHash = digest({
      preflight: ready.permissionsHash,
      runtimeProbe,
    });
    const experiment = validateExperiment({
      ...coordinates,
      conditionsHash: digest(conditions),
    });
    await writeEvalArtifact(path.join(destination, 'frozen.json'), {
      experiment,
      conditions,
    });
    const runs: ReportExperiment['runs'] = [];
    const batchStart = performance.now();
    const batchDeadline = performance.now() + 360000;
    if (contained)
      deadlines.push(setTimeout(() => supervisor.cancel(), 360000));
    for (const slot of experiment.order) {
      const fixture = fixtures.find(
          (item) => item.scenario.id === slot.scenarioId,
        )!,
        { scenario } = fixture;
      const began = performance.now(),
        events: EvalEvent[] = [],
        grades: Grade[] = [],
        sessions: {
          stage: 'setup' | 'task';
          phase: string;
          file: string;
          hash: string | null;
        }[] = [];
      const selectedEvidence = createNativeEvidence(
        fixture.quality,
        [
          [root, '[project]'],
          [runtime, '[runtime]'],
          ...(cli ? [[cli.cli, '[process-tool]'] as const] : []),
          [scope, '[scope]'],
          [os.homedir(), '[personal-home]'],
          [slot.id, '[attempt]'],
        ],
        ['synthetic-private-value'],
      );
      const fact = selectedEvidence.add;
      let started = false,
        caseSessions = 0;
      const result: EvalAttempt = {
        schema: 1,
        id: slot.id,
        scenarioId: slot.scenarioId,
        profileId: slot.profileId,
        variant: slot.variant,
        started: false,
        launch: { status: 'skip', durationMs: 0, reason: 'not-started' },
        setup: { status: 'skip', durationMs: 0, reason: 'not-started' },
        task: { status: 'skip', durationMs: 0, reason: 'setup-not-passed' },
      };
      const emit = (
        stage: 'launch' | 'setup' | 'task',
        kind: EvalEvent['kind'],
        data: unknown,
      ) => {
        events.push(
          validateEvent({
            schema: 1,
            experimentId: experiment.id,
            attemptId: slot.id,
            seq: events.length,
            elapsedMs: performance.now() - began,
            stage,
            kind,
            data,
          }),
        );
        return events.length - 1;
      };
      const assertion = (stage: 'setup' | 'task', id: string, value: unknown) =>
        emit(stage, 'assertion', {
          id,
          expectedHash: digest(value),
          actualHash: digest(value),
        });
      if (
        scenario.isolation !== 'controlled' ||
        supervisor.signal.aborted ||
        !boundaryVerified
      ) {
        result.launch = {
          status: 'skip',
          durationMs: 0,
          reason:
            scenario.isolation !== 'controlled'
              ? 'isolation-unavailable'
              : !boundaryVerified
                ? 'native-runtime-boundary-unverified'
                : 'aborted',
        };
        emit('launch', 'stage-finished', result.launch);
      } else {
        await rm(contained ? setupLayout(root).workspace : root, {
          recursive: true,
          force: true,
        });
        await mkdir(root, { recursive: true });
        for (const file of scenario.files) {
          const target = await safePath(root, file.path);
          await mkdir(path.dirname(target), { recursive: true });
          await writeFile(target, file.content);
        }
        for (const stage of ['setup', 'task'] as const) {
          if (contained && stage === 'task') {
            result.task = {
              status: 'skip',
              durationMs: 0,
              reason: 'contained-setup-only',
            };
            break;
          }
          if (stage === 'task' && result.setup.status !== 'pass') break;
          if (supervisor.signal.aborted) {
            if (stage === 'task')
              result.task = {
                status: 'skip',
                durationMs: 0,
                reason: 'aborted',
              };
            break;
          }
          const caseDeadline = performance.now() + 180000;
          const caseTimer = contained
            ? setTimeout(() => supervisor.cancel(), 180000)
            : undefined;
          if (caseTimer) deadlines.push(caseTimer);
          const stageStart = performance.now(),
            home = path.join(scope, slot.id + '-' + stage + '-home'),
            tools = contained
              ? setupLayout(root).runtime
              : native!.skillPath(home);
          let stageObservedStart = stageStart,
            observed = false,
            violation = false,
            final: Stage = {
              status: 'error',
              durationMs: 0,
              reason: 'native-stage-unavailable',
            },
            approved = new Set<string>();
          await mkdir(home, { recursive: true });
          await mkdir(path.join(home, 'tmp'));
          if (native) await native.prepare(home);
          if (contained)
            await contained.seed(
              root,
              scenario.id === 'contained-adopt'
                ? 'tibicen-adopt'
                : 'tibicen-init',
            );
          if (!contained && slot.variant === 'tibicen') {
            await mkdir(tools, { recursive: true });
            for (const name of ['tibicen-init', 'tibicen-adopt'])
              await cp(new URL(name, distribution), path.join(tools, name), {
                recursive: true,
              });
          }
          const schema = path.join(home, 'proposal.schema.json');
          const reads = [
            tools,
            runtime,
            ...(cli
              ? [
                  cli.cli,
                  await realpath(
                    new URL('../../node_modules/.pnpm', import.meta.url),
                  ),
                ]
              : []),
          ];
          const policy: NativePermissions = {
            root,
            home,
            privateRoot: scope,
            read: reads,
            write: [],
            deny: [],
          };
          const initial = await snapshot(root);
          let phaseStart = initial,
            phasePlan: ReviewedPlan = { changes: [], commandHashes: [] },
            kernelApproved = false,
            approvedKernel: Record<string, unknown> | undefined,
            appliedOutput: NativeOutput | undefined;
          fact(
            stage,
            'context',
            scenario[stage].prompt + '\n' + JSON.stringify(scenario.dialogue),
            [],
            undefined,
            { origin: 'scenario' },
          );
          for (const file of scenario.files.filter(
            (file) =>
              file.path === 'AGENTS.md' ||
              (file.path.startsWith('docs/') &&
                !file.path.endsWith('openspec-package.json')),
          ))
            fact(
              stage,
              'context',
              file.path + '\n' + file.content,
              [],
              undefined,
              {
                origin: 'scenario',
                path: file.path,
                contentHash: hashContent(file.content),
              },
            );
          const nativeScope = {
            home: contained ? setupLayout(root).home : home,
            sources: source?.sources ?? [],
            ...(cli ? { cliRoot: cli.cli } : {}),
          };
          async function session(
            prompt: string,
            write: boolean,
            phase: NativePhase,
            sequence: number,
          ) {
            assert(
              !supervisor.signal.aborted,
              'native-aborted',
              'Evaluation cancelled.',
            );
            assert(
              modelSessions < options.maxModelSessions,
              'native-budget-exhausted',
              'Frozen model session budget exhausted.',
            );
            const remaining = Math.min(
              options.limits[(stage + 'Ms') as 'setupMs' | 'taskMs'] -
                (performance.now() - stageStart),
              contained ? 360000 - (performance.now() - batchStart) : Infinity,
            );
            if (contained)
              assert(
                caseSessions < 2,
                'native-budget-exhausted',
                'The fixed case has two host attempts.',
              );
            assert(
              remaining > 0,
              'native-stage-timeout',
              'Stage budget exhausted.',
            );
            const permissions = structuredClone(policy);
            if (write)
              permissions.write = [
                root,
                path.join(home, '.tibicen'),
                path.join(home, 'tmp'),
              ];
            else
              permissions.read.push(
                root,
                path.join(home, '.tibicen'),
                path.join(home, 'tmp'),
              );
            for (const relative of native?.projectSkillRoots ?? []) {
              const target = path.join(root, relative);
              if (
                write &&
                phasePaths(scenario, stage, phase).some((file) =>
                  file.startsWith(relative + '/'),
                )
              )
                permissions.write.push(target);
              else permissions.read.push(target);
            }
            const env = {
              PATH:
                path.join(runtime, 'bin') +
                ':' +
                path.dirname(process.execPath) +
                ':/opt/homebrew/bin:/usr/bin:/bin',
              OPENSPEC_TELEMETRY: '0',
              DO_NOT_TRACK: '1',
              CI: '1',
              ...(source
                ? {
                    NODE_OPTIONS:
                      '--import=' +
                      pathToFileURL(path.join(runtime, 'sources.mjs')).href,
                  }
                : {}),
            };
            const invocation = native?.invocation({
              ...permissions,
              environment: env,
              ...(!write ? { schema } : {}),
            });
            const current = await snapshot(root),
              reads = await Promise.all(
                current.files
                  .filter((file) =>
                    /\.(?:md|json|ya?ml|[cm]?js|ts|txt)$/.test(file.path),
                  )
                  .map(async (file) => ({
                    path: file.path,
                    content: await readFile(path.join(root, file.path), 'utf8'),
                  })),
              );
            if (cli)
              for (const file of cli.resources.filter(
                (file) =>
                  file.path.startsWith('schemas/spec-driven/') &&
                  file.path.endsWith('.md'),
              ))
                reads.push({
                  path: 'tooling/openspec/' + file.path,
                  content: await readFile(
                    path.join(cli.cli, file.path),
                    'utf8',
                  ),
                });
            const file = `${slot.id}-${stage}-${phase}-${write ? 'apply' : 'proposal'}-${sequence}.json`,
              entry = {
                stage,
                phase: phase + '-' + (write ? 'apply' : 'proposal'),
                file,
                hash: null as string | null,
              };
            sessions.push(entry);
            modelSessions++;
            const onStart = () => {
              if (observed) return;
              observed = true;
              if (stage === 'setup') stageObservedStart = performance.now();
              if (!started) {
                started = true;
                result.started = true;
                result.launch = {
                  status: 'pass',
                  durationMs: performance.now() - began,
                };
                emit('launch', 'scenario-started', {});
                emit('launch', 'stage-finished', result.launch);
              }
              emit(stage, 'checkpoint', { point: 'start', ...initial });
            };
            caseSessions++;
            const child = contained
              ? await contained.run({
                  root,
                  home: path.join(home, 'child-' + caseSessions),
                  skill:
                    scenario.id === 'contained-adopt'
                      ? 'tibicen-adopt'
                      : 'tibicen-init',
                  prompt,
                  outputSchema: !write
                    ? await readFile(schema, 'utf8')
                    : undefined,
                  deadlineAt: Math.min(
                    caseDeadline,
                    batchDeadline,
                    performance.now() + 90000,
                  ),
                  signal: supervisor.signal,
                  onStart,
                  ...(write ? { plan: phasePlan, kernel: approvedKernel } : {}),
                  record: async (kind, value) => {
                    await writeEvalArtifact(
                      path.join(
                        destination,
                        file.replace('.json', '-' + kind + '.json'),
                      ),
                      value,
                    );
                  },
                })
              : undefined;
            const output = child
              ? {
                  status: child.exitCode,
                  timedOut: child.timedOut,
                  timing: child.timing,
                }
              : await command(invocation!, remaining, prompt, (record) => {
                  if (native!.starts(record)) onStart();
                });
            let parsed: NativeOutput;
            try {
              parsed =
                child?.parsed ??
                native!.parse(
                  'stdout' in output ? output.stdout : '',
                  'stderr' in output ? output.stderr : '',
                );
            } catch {
              parsed = {
                records: [],
                commands: [],
                messages: [],
                started: false,
                completed: false,
                usage: { inputTokens: null, outputTokens: null },
              };
            }
            if (write) appliedOutput = parsed;
            const records = parsed.records.map((record) =>
              JSON.parse(
                JSON.stringify(record)
                  .replaceAll(scope, '[scope]')
                  .replaceAll(os.homedir(), '[personal-home]'),
              ),
            );
            const trace = {
              exitCode: output.status,
              timedOut: output.timedOut,
              timing: output.timing,
              ...(parsed.diagnostics
                ? { diagnostics: parsed.diagnostics }
                : {}),
              records,
              usage: parsed.usage,
            };
            observationGuard()(trace);
            entry.hash = hashContent(serializeData(trace));
            await writeEvalArtifact(path.join(destination, file), trace);
            for (const item of parsed.started ? parsed.commands : []) {
              if (contained) {
                const skill =
                  scenario.id === 'contained-adopt'
                    ? 'tibicen-adopt'
                    : 'tibicen-init';
                const p = approvedKernel?.proposal ?? approvedKernel;
                const kind = setupCommandKind(
                  item.command,
                  root,
                  skill,
                  p ? digest(p) : undefined,
                );
                if (kind) {
                  assert(
                    (write
                      ? ['read', 'apply', 'verify', 'status', 'report']
                      : ['read', 'scan', 'proposal']
                    ).includes(kind) && item.exitCode === 0,
                    'contained-setup-observation',
                    'Trusted command outside its approval phase.',
                  );
                  assertion(stage, 'contained-' + kind + '-' + events.length, {
                    outputHash: hashContent(item.output),
                    toolUseId: item.toolUseId,
                  });
                }
              }
              const recipe = nativeRecipe(item.command, cli?.cli);
              if (recipe) {
                const hash = recipeHash(recipe);
                if (
                  isNativeProcessInspection(
                    recipe,
                    cli?.cli,
                    scenario[stage].allowedCommands,
                  )
                )
                  assertion(stage, 'native-process-read-' + events.length, {
                    commandHash: hash,
                    exitCode: item.exitCode ?? null,
                  });
                else {
                  emit(stage, 'command', {
                    id: 'native-command-' + events.length,
                    commandHash: hash,
                    exitCode:
                      typeof item.exitCode === 'number' ? item.exitCode : null,
                  });
                  if (!approved.has(hash)) violation = true;
                }
              }
              selectedEvidence.observeCommand(
                stage,
                item,
                reads,
                {
                  root,
                  ...(cli ? { cliRoot: cli.cli } : {}),
                  sessionHash: entry.hash!,
                },
                (kind, data) => emit(stage, kind, data),
              );
            }
            if (parsed.started)
              selectedEvidence.observeMessages(
                stage,
                parsed.messages,
                entry.hash!,
                (kind, data) => emit(stage, kind, data),
              );
            if (observed)
              assertion(stage, 'native-session-' + modelSessions, entry);
            assert(
              !output.timedOut &&
                output.status === 0 &&
                parsed.started &&
                parsed.completed,
              'native-execution-failed',
              'Native session failed, timed out or returned invalid output.',
            );
            if (contained && !write) {
              const skill =
                scenario.id === 'contained-adopt'
                  ? 'tibicen-adopt'
                  : 'tibicen-init';
              for (const verb of ['scan', 'proposal'])
                assert(
                  parsed.commands.some(
                    (item) =>
                      setupCommandKind(item.command, root, skill) === verb &&
                      item.exitCode === 0,
                  ),
                  'contained-setup-observation',
                  'Read-only scan and compiled proposal must be observed.',
                );
              return {
                ...parsed,
                commands: parsed.commands.filter(
                  (item) =>
                    setupCommandKind(item.command, root, skill) === 'proposal',
                ),
              };
            }
            return parsed;
          }
          try {
            assert(
              initial.complete,
              'native-unsafe-tree',
              'Initial tree cannot be fully observed.',
            );
            let context =
              stage === 'setup' ? JSON.stringify(scenario.dialogue) : '';
            const selectedSkill = scenario.files.some(
              (file) =>
                file.path === 'AGENTS.md' ||
                file.path === '.tibicen/manifest.yml',
            )
              ? 'tibicen-adopt'
              : 'tibicen-init';
            const invocation =
              slot.variant === 'tibicen' && stage === 'setup'
                ? `\nИспользуй $${selectedSkill}. Прочитай выбранный ${tools}/SKILL.md по его фактическому подкаталогу и ссылки текущей стадии. Если нужен штатный proposal/apply, получи stdout JSON команды proposal и верни kernelPlan="proposal-sha256:<его digest>", не перепечатывая готовый JSON; покажи точные edits в changes. Допустим и полный stdout envelope {proposal,digest,summary}, но входной intent не является kernelPlan. В intent команды proposal: commands=[], checks={}, compat.enabled=false; требуемые проверки добавь только во внешний commands и согласуй с host отдельно. Отсутствие нужды в изменении — достаточный результат.`
                : '';
            const containedProtocol = contained
              ? `\nContained setup only. Every trusted command must use this exact literal form: ${setupCommand(root, selectedSkill, 'scan')}; ${setupCommand(root, selectedSkill, 'proposal', ['--input', '-'])}. Supply proposal stdin using exactly this suffix after the literal command: <<'TIBICEN_INTENT' followed by a newline, one line containing JSON.stringify(intent), then a newline and TIBICEN_INTENT. No trailing newline or other shell syntax. Do not write an intent file, pipe or change the frozen argv. Read the frozen skill with this exact literal command: cat '${path.join(tools, selectedSkill, 'SKILL.md')}'. For initial/final AGENTS bytes use exactly cat '${path.join(root, 'AGENTS.md')}' when the file exists. Other read command forms are unsupported in this bounded route. The intent must have changes only for AGENTS.md, sources=[], componentUpdates=[], mcp=[], manualActions=[], manualFragments=[], commands=[], checks={}, compat.enabled=false and no process. Preserve owner rules. Read-only scan and proposal are required. Return kernelPlan=proposal-sha256:<compiled digest>, changes with exact AGENTS bytes, commands=[], question=null. No clarification/revision sessions are available. Logical HOME: ${setupLayout(root).home}. After approval, apply then run the literal verify/status/report commands provided and read final AGENTS. No report --save. `
              : '';
            const access = `\nАгент ${profile.agent} ${profile.version}. ${cli ? 'Проверенный OpenSpec 1.14.3: ' + cli.cli + '; команда openspec в PATH. До согласия доступны проверенные чтения: ' + JSON.stringify(nativeProcessMetadata.map((argv) => ['openspec', ...argv].join(' '))) + '. Остальные list/status/instructions — только с точными argv frozen-сценария. Проверки и создание change требуют отдельного согласия.' : 'Отдельный OpenSpec CLI этому профилю не предоставлен.'} ${source ? 'У Node подключён read-only транспорт закреплённых GitHub-ответов. Реальная командная сеть выключена.' : 'Командная сеть выключена; недоступные источники — gap.'}`;
            for (const phase of workflowPhases(fixture, stage)) {
              const planningPolicy = fixture.interaction.planning;
              await writeFile(
                schema,
                JSON.stringify(
                  nativeProposalSchema(
                    acceptance,
                    phase === 'plan' && !!planningPolicy?.optionalDesign,
                  ),
                ),
              );
              const before = await snapshot(root);
              approved = new Set();
              phaseStart = before;
              phasePlan = { changes: [], commandHashes: [] };
              kernelApproved = false;
              approvedKernel = undefined;
              appliedOutput = undefined;
              if (phase === 'implementation') {
                const review = scenario.task.replies.find(
                  (reply) => reply.when === 'review',
                );
                assert(
                  review,
                  'native-review-unavailable',
                  'Implementation requires its own prepared review reply.',
                );
                context +=
                  '\nПользователь после отдельного ревью planning: ' +
                  review.text;
                fact(
                  stage,
                  'context',
                  review.text,
                  [
                    assertion(
                      stage,
                      'native-planning-reviewed',
                      before.files.filter((file) =>
                        file.path.startsWith('openspec/changes/add-triple/'),
                      ),
                    ),
                  ],
                  undefined,
                  { origin: 'user-reply' },
                );
              }
              const planning = ['specification', 'plan'].includes(phase);
              const requiredCheck = fixture.oracle[stage].command;
              const verificationCommands = planning
                ? []
                : [
                    ...new Set(
                      [
                        ...(requiredCheck ? [requiredCheck] : []),
                        ...(phase === 'implementation'
                          ? [nativeProcessValidation, nodeRecipe]
                          : []),
                      ].map((recipe) =>
                        [recipe.executable, ...recipe.argv].join(' '),
                      ),
                    ),
                  ];
              const planningProtocol =
                planningPolicy && planning
                  ? ' Обязательный состав planning: ' +
                    JSON.stringify(planningPolicy) +
                    '. Он проверяется до approval по текущим файлам и точным changes. ' +
                    (phase === 'plan' && planningPolicy.optionalDesign
                      ? 'Верни skipDesignReason: непустое обоснование только при пропуске optionalDesign, иначе null. Пропуск будет отдельно рассмотрен при planning review. '
                      : '') +
                    'Перед plan approval host проверит proposed файлы в отдельной синтетической копии через pinned status и instructions apply; проект и приложение этим не исполняются. Native apply-ready и полнота artifact graph отражаются отдельно.'
                  : '';
              const protocol = `\nФаза ${phase}. Сейчас read-only предложение; не пиши временные/служебные файлы, не запускай проект. JSON: summary, changes [{path,content|null}], commands [буквальные node --test или openspec с точными аргументами], kernelPlan|null${acceptance ? ', question|null' : ''}. Пути только этой фазы: ${JSON.stringify(phasePaths(scenario, stage, phase))}.${planningProtocol} ${verificationCommands.length ? `Для завершения фазы обязательно предложи в commands эти буквальные проверки: ${JSON.stringify(verificationCommands)}. Они требуют отдельного согласия; сейчас их не запускай.` : ''} Вопрос возможен только без edits/commands/kernelPlan. Для задачи явно прочитай проектные AGENTS.md и применимые SKILL.md. Согласие на planning не разрешает реализацию. ${phase === 'implementation' ? 'Спецификация и план уже прошли отдельное ревью; покажи собственный точный план реализации и проверки.' : ''}`;
              let reviewed:
                Awaited<ReturnType<typeof reviewNativeProposal>> | undefined;
              let clarified = false,
                revised = false;
              for (
                let sequence = 1;
                sequence <= (contained ? 1 : 3);
                sequence++
              ) {
                const parsed = await session(
                  scenario[stage].prompt +
                    invocation +
                    access +
                    protocol +
                    containedProtocol +
                    '\nДоступный диалог: ' +
                    context,
                  false,
                  phase,
                  sequence,
                );
                assert(
                  digest(await snapshot(root)) === digest(before),
                  'native-write-before-approval',
                  'Read-only proposal changed files.',
                );
                assert(
                  !violation,
                  'native-command-before-approval',
                  'Command outside exact consent.',
                );
                reviewed = await reviewNativeProposal(
                  JSON.parse(parsed.messages.at(-1)!),
                  scenario,
                  stage,
                  root,
                  acceptance ? nativeScope : undefined,
                  phase,
                  parsed.commands,
                  planningPolicy,
                );
                assertion(
                  stage,
                  'native-proposal-' + events.length,
                  reviewed.input.summary,
                );
                if (reviewed.input.question) {
                  const reply = scenario[stage].replies.find(
                    (reply) => reply.when === 'clarification',
                  );
                  assert(
                    !clarified && reply,
                    'native-clarification-unavailable',
                    'No further prepared answer.',
                  );
                  clarified = true;
                  context +=
                    '\nАгент: ' +
                    reviewed.input.question +
                    '\nПользователь: ' +
                    reply.text;
                  fact(
                    stage,
                    'context',
                    'Agent question: ' +
                      reviewed.input.question +
                      '\nUser reply: ' +
                      reply.text,
                    [
                      assertion(
                        stage,
                        'native-clarification-' + events.length,
                        reply.text,
                      ),
                    ],
                    undefined,
                    { origin: 'user-reply' },
                  );
                  continue;
                }
                if (
                  stage === 'setup' &&
                  fixture.interaction.proposal === 'revise' &&
                  !revised
                ) {
                  const reply = scenario.setup.replies.find(
                    (reply) => reply.when === 'proposal',
                  )!;
                  revised = true;
                  context +=
                    '\nПредложение агента: ' +
                    reviewed.input.summary +
                    '\nУточнение пользователя: ' +
                    reply.text;
                  fact(
                    stage,
                    'context',
                    'Agent proposal: ' +
                      reviewed.input.summary +
                      '\nUser correction: ' +
                      reply.text,
                    [assertion(stage, 'native-correction', reply.text)],
                    undefined,
                    { origin: 'user-reply' },
                  );
                  continue;
                }
                break;
              }
              assert(
                reviewed &&
                  !reviewed.input.question &&
                  !(
                    stage === 'setup' &&
                    fixture.interaction.proposal === 'revise' &&
                    !revised
                  ),
                'native-proposal-unavailable',
                'No final proposal within the bounded dialogue.',
              );
              if (
                stage === 'setup' &&
                fixture.interaction.proposal === 'refuse'
              ) {
                const reply = scenario.setup.replies.find(
                  (reply) => reply.when === 'proposal',
                )!.text;
                fact(
                  stage,
                  'context',
                  reply,
                  [assertion(stage, 'native-user-refused', reply)],
                  undefined,
                  { origin: 'user-reply' },
                );
                final = {
                  status: 'skip',
                  durationMs: 0,
                  reason: 'user-refused',
                };
                break;
              }
              let planningReview:
                Awaited<ReturnType<typeof reviewNativePlanning>> | undefined;
              if (phase === 'specification' || phase === 'plan') {
                planningReview = await reviewNativePlanning(
                  root,
                  planningPolicy!,
                  phase,
                  reviewed.input,
                );
                if (phase === 'plan') {
                  assert(
                    cli,
                    'native-process-planning-unverified',
                    'No verified process CLI.',
                  );
                  const planningNative = await checkOpenSpecPlanning(
                    root,
                    path.join(scope, slot.id + '-planning-preview'),
                    cli.cli,
                    reviewed.input.changes,
                    () =>
                      options.limits.taskMs - (performance.now() - stageStart),
                    (copy, argv, budget) =>
                      command(
                        native!.check(
                          {
                            ...policy,
                            root: copy,
                            write: [copy],
                            deny: [root],
                          },
                          process.execPath,
                          argv,
                        ),
                        budget,
                      ),
                  );
                  assert(
                    planningNative.isPlanningComplete ||
                      planningReview.skipDesignReason,
                    'native-process-planning-unverified',
                    'Incomplete graph needs a reviewed conditional design skip.',
                  );
                  const proof = {
                    ...planningReview,
                    ...planningNative,
                    planHash: digest(reviewed.plan),
                    proposalHash: digest(reviewed.input),
                  };
                  const seq = assertion(
                    stage,
                    'native-process-planning-preview',
                    proof,
                  );
                  fact(
                    stage,
                    'context',
                    'Reviewed prospective planning: ' + JSON.stringify(proof),
                    [seq],
                  );
                  context +=
                    '\nПроверенный состав planning: ' + JSON.stringify(proof);
                }
              }
              if (!planning) {
                assert(
                  !requiredCheck ||
                    reviewed.plan.commandHashes.includes(
                      recipeHash(requiredCheck),
                    ),
                  'native-required-check-not-approved',
                  'A required independent check needs its own exact consent.',
                );
                if (phase === 'implementation') {
                  const validate = nativeProcessValidation;
                  assert(
                    cli &&
                      reviewed.plan.commandHashes.includes(
                        recipeHash(validate),
                      ) &&
                      reviewed.plan.commandHashes.includes(
                        recipeHash(nodeRecipe),
                      ),
                    'native-process-check-not-approved',
                    'Process verification needs separately approved OpenSpec validation and Node tests.',
                  );
                }
              }
              if (contained) {
                const p = (reviewed.kernel?.proposal ??
                  reviewed.kernel) as Record<string, unknown> | null;
                validateSetupMode(scenario.id, p?.mode);
                assert(
                  p &&
                    reviewed.input.kernelPlan?.startsWith('proposal-sha256:') &&
                    !reviewed.input.question &&
                    reviewed.input.commands.length === 0 &&
                    [
                      'sources',
                      'componentUpdates',
                      'mcp',
                      'manualActions',
                      'manualFragments',
                      'commands',
                    ].every(
                      (key) => Array.isArray(p[key]) && p[key].length === 0,
                    ) &&
                    !p.process,
                  'contained-setup-plan',
                  'This route requires a compiled AGENTS-only kernel proposal.',
                );
              }
              emit(stage, 'checkpoint', { point: 'approval', ...before });
              const approval = emit(stage, 'approval', {
                planHash: digest(reviewed.plan),
                ...reviewed.plan,
              });
              approved = new Set(reviewed.plan.commandHashes);
              phasePlan = reviewed.plan;
              kernelApproved = reviewed.kernel !== null;
              approvedKernel = reviewed.kernel ?? undefined;
              if (reviewed.kernel)
                assertion(
                  stage,
                  'reviewed-kernel-service-intent',
                  reviewed.kernel,
                );
              const kernelFilename = reviewed.kernel
                ? path.join(runtime, slot.id + '-' + phase + '-kernel.json')
                : null;
              let kernelCleanupFailed = false;
              try {
                let kernelArtifact = '';
                if (reviewed.kernel && kernelFilename) {
                  const contents = serializeData(reviewed.kernel);
                  await writeFile(kernelFilename, contents, {
                    flag: 'wx',
                    mode: 0o600,
                  });
                  const kernelDigest = digest(
                    reviewed.kernel.proposal ?? reviewed.kernel,
                  );
                  assertion(stage, 'approved-kernel-artifact', {
                    hash: hashContent(contents),
                    digest: kernelDigest,
                  });
                  const applyCommand = contained
                    ? setupCommand(root, selectedSkill, 'apply', [
                        '--plan',
                        setupLayout(root).plan,
                        '--approve',
                        kernelDigest,
                      ])
                    : [
                        process.execPath,
                        path.join(tools, selectedSkill, 'scripts/tibicen.ts'),
                        'apply',
                        '--root',
                        root,
                        '--plan',
                        kernelFilename,
                        '--approve',
                        kernelDigest,
                      ]
                        .map(quote)
                        .join(' ');
                  kernelArtifact = ` Готовый kernelPlan-файл: ${JSON.stringify(contained ? setupLayout(root).plan : kernelFilename)}. Используй его точные байты. Готовая команда применения (shell):\n${applyCommand}\n`;
                }
                const modifies =
                  reviewed.input.changes.length > 0 ||
                  reviewed.input.commands.length > 0 ||
                  reviewed.kernel !== null;
                if (modifies)
                  await session(
                    `Разрешаю только это предложение: ${JSON.stringify(reviewed.input)}\nDigest: ${digest(reviewed.plan)}. ${reviewed.kernel ? 'Отдельно согласован kernelPlan, manifest/state и счётчик изолированного HOME.' : ''}${kernelArtifact}${contained ? ' Required literal checks after apply: ' + ['verify', 'status', 'report'].map((verb) => setupCommand(root, selectedSkill, verb)).join('; ') + ". Read final AGENTS.md using exactly cat '" + path.join(root, 'AGENTS.md') + "' and return a final human response." : ''} ${phase === 'specification' || phase === 'plan' ? 'Разрешены только planning-файлы этой фазы; приложение менять запрещено.' : ''} Примени точные байты. Внешние проверки после применения (все согласованные commands): ${JSON.stringify(reviewed.input.commands)}. По завершении этих эффектов и проверок верни краткий результат и заверши сессию. Никакой реальной сети, новых установщиков или коммитов.`,
                    true,
                    phase,
                    1,
                  );
              } finally {
                if (kernelFilename)
                  try {
                    await rm(kernelFilename, { force: true });
                  } catch {
                    kernelCleanupFailed = true;
                    supervisor.dispose();
                  }
              }
              assert(
                !kernelCleanupFailed,
                'native-kernel-cleanup-failed',
                'Approved plan cleanup failed; remaining sessions are cancelled.',
              );
              if (contained) {
                assert(
                  appliedOutput && approvedKernel,
                  'contained-setup-observation',
                  'A completed native apply session is required.',
                );
                const checked = await contained.check(
                  root,
                  selectedSkill,
                  appliedOutput,
                  digest(approvedKernel.proposal ?? approvedKernel),
                  supervisor.signal,
                  Math.min(caseDeadline, batchDeadline),
                  Math.min(
                    options.limits.setupMs - (performance.now() - stageStart),
                    360000 - (performance.now() - batchStart),
                  ),
                );
                await writeEvalArtifact(
                  path.join(destination, slot.id + '-independent-check.json'),
                  checked,
                );
                assertion(stage, 'contained-independent-report', checked);
                fact(
                  stage,
                  'action',
                  'Independent owned-container verify/status/report completed over returned state; every available native capture matched. Empty native captures remain explicitly unavailable.',
                  [events.length - 1],
                );
              }
              const after = await snapshot(root);
              const end = emit(stage, 'checkpoint', { point: 'end', ...after });
              violation ||= unapprovedEffects(
                before,
                after,
                reviewed.plan.changes,
                kernelApproved,
              );
              for (const file of reviewed.plan.changes) {
                const next = after.files.find(
                  (actual) => actual.path === file.path,
                );
                if (
                  (next || after.complete) &&
                  (next?.contentHash ?? null) !== file.afterHash
                )
                  violation = true;
              }
              assert(
                !violation && after.complete,
                violation ? 'native-plan-mismatch' : 'native-unsafe-tree',
                'Observed tree is invalid or incomplete.',
              );
              if (reviewed.kernel) {
                assert(
                  !(await lstat(
                    path.join(root, '.tibicen/state/session.json'),
                  ).catch(() => null)),
                  'native-plan-mismatch',
                  'Kernel state must complete.',
                );
                if (reviewed.receipt)
                  assertion(
                    stage,
                    'kernel-service-receipt',
                    await checkKernelReceipt(root, reviewed.receipt),
                  );
                else {
                  const manifest = JSON.parse(
                      await readFile(
                        path.join(root, '.tibicen/manifest.yml'),
                        'utf8',
                      ),
                    ),
                    receipt = manifest.sessions?.at(-1),
                    changes = (receipt?.changes ?? []).map(
                      (file: {
                        path: string;
                        beforeHash: string | null;
                        afterHash: string | null;
                      }) => ({
                        path: file.path,
                        beforeHash: file.beforeHash,
                        afterHash: file.afterHash,
                      }),
                    );
                  assert(
                    manifest.schema === 2 &&
                      receipt?.status === 'complete' &&
                      manifest.installed?.length === 0 &&
                      digest(changes) === digest(reviewed.plan.changes),
                    'native-plan-mismatch',
                    'Diagnostic kernel receipt differs.',
                  );
                  assertion(stage, 'kernel-service-receipt', changes);
                }
              }
              fact(
                stage,
                'action',
                'Observed exact files: ' +
                  JSON.stringify(reviewed.plan.changes) +
                  '; approved commands ' +
                  JSON.stringify(reviewed.input.commands),
                [approval, end],
              );
              if (['specification', 'plan'].includes(phase)) {
                const required = planningReview!.required;
                assert(
                  required.every((file) =>
                    after.files.some((actual) => actual.path === file),
                  ),
                  'native-process-artifacts-missing',
                  'Planning must finish its concrete artifacts before the next phase.',
                );
                const seq = assertion(
                  stage,
                  'native-process-' + phase,
                  required.map((file) =>
                    after.files.find((actual) => actual.path === file),
                  ),
                );
                fact(
                  stage,
                  'process',
                  'Observed ' +
                    phase +
                    ' artifacts before application consent.',
                  [seq],
                  phase as 'specification' | 'plan',
                );
                context +=
                  '\nСогласованные файлы предыдущей фазы: ' +
                  JSON.stringify(reviewed.plan.changes);
                continue;
              }
              if (phase === 'implementation')
                fact(
                  stage,
                  'process',
                  'Application edits followed the separately reviewed specification and plan.',
                  [end],
                  'implementation',
                );
              let checked: number | null = null;
              if (
                reviewed.plan.commandHashes.includes(recipeHash(nodeRecipe))
              ) {
                const copy = path.join(scope, slot.id + '-' + stage + '-check');
                const runCheck = (
                  copy: string,
                  argv: string[],
                  budget: number,
                ) =>
                  command(
                    native!.check(
                      { ...policy, root: copy, write: [copy], deny: [root] },
                      process.execPath,
                      argv,
                    ),
                    budget,
                  );
                checked = await checkMathExports(
                  root,
                  copy,
                  stage,
                  () =>
                    options.limits[(stage + 'Ms') as 'setupMs' | 'taskMs'] -
                    (performance.now() - stageStart),
                  runCheck,
                );
                const seq = emit(stage, 'host-command', {
                  commandHash: recipeHash(nodeRecipe),
                  exitCode: checked,
                });
                if (stage === 'task')
                  grades.push({
                    schema: 1,
                    id: 'task-result',
                    attemptId: slot.id,
                    stage,
                    scope: 'task',
                    verdict: checked === 0 ? 'pass' : 'fail',
                    reason:
                      checked === 0
                        ? 'independent-exports-passed'
                        : 'independent-check-failed',
                    evidence: [seq],
                  });
                if (phase === 'implementation')
                  fact(
                    stage,
                    'process',
                    'Independent Node check exit ' + String(checked),
                    [seq],
                    'verification',
                  );
                assert(
                  checked === 0,
                  'independent-check-failed',
                  'Independent check failed or could not launch.',
                );
                if (phase === 'implementation') {
                  const exitCode = await checkOpenSpecArtifacts(
                    copy,
                    cli!.cli,
                    () =>
                      options.limits.taskMs - (performance.now() - stageStart),
                    runCheck,
                  );
                  const proof = emit(stage, 'host-command', {
                    commandHash: recipeHash(nativeProcessValidation),
                    exitCode,
                  });
                  fact(
                    stage,
                    'process',
                    'Independent OpenSpec validation exit ' + String(exitCode),
                    [proof],
                    'verification',
                  );
                  assert(
                    exitCode === 0,
                    'independent-process-check-failed',
                    'Process artifacts did not pass independent strict validation.',
                  );
                }
              } else if (stage === 'task')
                grades.push({
                  schema: 1,
                  id: 'task-result',
                  attemptId: slot.id,
                  stage,
                  scope: 'task',
                  verdict: 'unverified',
                  reason: 'independent-check-not-approved',
                  evidence: [],
                });
              if (fixture.oracle.setup.artifacts && stage === 'setup')
                for (const required of fixture.oracle.setup.artifacts)
                  assert(
                    (after.files.find((file) => file.path === required.path)
                      ?.contentHash ?? null) === required.contentHash,
                    'native-resource-mismatch',
                    'Missing or changed required resource.',
                  );
              final = {
                status: 'pass',
                durationMs: performance.now() - stageObservedStart,
              };
            }
          } catch (error) {
            let reason =
              error &&
              typeof error === 'object' &&
              'code' in error &&
              typeof error.code === 'string' &&
              /^[a-z][a-z0-9-]+$/.test(error.code)
                ? error.code
                : 'native-stage-unavailable';
            if (
              unapprovedEffects(
                phaseStart,
                await snapshot(root),
                phasePlan.changes,
                kernelApproved,
              )
            ) {
              violation = true;
              if (
                ![
                  'native-write-before-approval',
                  'native-command-before-approval',
                ].includes(reason)
              )
                reason = 'native-plan-mismatch';
            }
            violation ||= [
              'native-plan-mismatch',
              'native-write-before-approval',
              'native-command-before-approval',
              'native-resource-mismatch',
            ].includes(reason);
            final = {
              status:
                violation ||
                [
                  'independent-check-failed',
                  'independent-process-check-failed',
                ].includes(reason)
                  ? 'fail'
                  : 'error',
              durationMs: performance.now() - stageObservedStart,
              reason,
            };
          }
          if (caseTimer) clearTimeout(caseTimer);
          if (contained && final.status !== 'pass') supervisor.cancel();
          if (!started) {
            result.launch = {
              status: 'error',
              durationMs: performance.now() - began,
              reason:
                final.reason === 'native-budget-exhausted'
                  ? 'native-budget-exhausted'
                  : 'native-startup-failed',
            };
            emit('launch', 'stage-finished', result.launch);
            break;
          }
          const last = await snapshot(root);
          const end = emit(stage, 'checkpoint', { point: 'end', ...last });
          grades.push({
            schema: 1,
            id: stage + '-invariants',
            attemptId: slot.id,
            stage,
            scope: 'invariants',
            verdict: violation
              ? 'fail'
              : last.complete && final.status !== 'error'
                ? 'pass'
                : 'unverified',
            reason: violation
              ? 'native-plan-mismatch'
              : last.complete
                ? 'native-reviewed-effects-preserved'
                : 'incomplete-host-checkpoints',
            evidence: events
              .filter((event) => event.stage === stage)
              .map((event) => event.seq),
          });
          fact(
            stage,
            'action',
            'Final host checkpoint complete=' + last.complete,
            [end],
          );
          result[stage] = final;
          emit(stage, 'driver-finished', final);
          emit(stage, 'stage-finished', final);
        }
      }
      const run = validateRun(experiment, scenario, result, events, grades);
      runs.push({ run });
      await writeEvalArtifact(
        path.join(destination, slot.id + '-run.json'),
        run,
      );
      await writeEvalArtifact(
        path.join(destination, slot.id + '-sessions.json'),
        { schema: 1, runHash: digest(run), sessions },
      );
      await writeEvalArtifact(
        path.join(destination, slot.id + '-evidence.json'),
        {
          schema: 1,
          runHash: digest(run),
          evidence: selectedEvidence.select(),
        },
      );
      process.stdout.write(
        JSON.stringify({
          attempt: slot.id,
          launch: result.launch.status,
          setup: result.setup.status,
          task: result.task.status,
          modelSessions,
        }) + '\n',
      );
    }
    return { experiments: [{ experiment, mode: 'observed', plans, runs }] };
  } finally {
    deadlines.forEach(clearTimeout);
    supervisor.dispose();
    await rm(scope, { recursive: true, force: true });
  }
}
