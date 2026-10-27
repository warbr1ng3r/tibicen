import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { digest, hashContent } from '../core/contracts.ts';
import { observationGuard, writeEvalArtifact } from './observations.ts';
import type { Experiment, EvalScenario } from './contracts.ts';
import type { ExternalRun } from './external.ts';

export type DiagnosticMode = 'dry-run' | 'offline' | 'native';
interface DiagnosticConfig {
  schema: 1;
  profile: string;
  provider: string;
  model: string;
  auth: string;
  sourceSha: string;
  experimentId: string;
  repeats: number;
  maxModelSessions: number;
  limits: Experiment['limits'];
  preflightPath?: string;
}
// The existing Codex diagnostic wrapper owns this fixed subscription contract.
const nativeBudget = {
  repeats: 1,
  maxModelSessions: 16,
  limits: {
    launchMs: 45000,
    setupMs: 180000,
    taskMs: 120000,
    maxCostUsd: null,
  },
};
const offlineConfig: DiagnosticConfig = {
  schema: 1,
  profile: 'fake',
  provider: 'none',
  model: 'none',
  auth: 'none',
  sourceSha: '0'.repeat(40),
  experimentId: 'offline-diagnostic',
  repeats: 1,
  maxModelSessions: 0,
  limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
};
function validConfig(input: unknown): input is DiagnosticConfig {
  try {
    observationGuard()(input);
    if (!input || typeof input !== 'object' || Array.isArray(input))
      return false;
    const config = input as DiagnosticConfig;
    return (
      config.schema === 1 &&
      Object.keys(config).every((key) =>
        [...Object.keys(offlineConfig), 'preflightPath'].includes(key),
      ) &&
      ['profile', 'provider', 'model', 'auth', 'experimentId'].every(
        (key) =>
          typeof config[key as keyof DiagnosticConfig] === 'string' &&
          /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,159}$/.test(
            config[key as keyof DiagnosticConfig] as string,
          ),
      ) &&
      /^[a-f0-9]{40}$/.test(config.sourceSha) &&
      config.repeats === 1 &&
      Number.isSafeInteger(config.maxModelSessions) &&
      config.maxModelSessions >= 0 &&
      config.limits &&
      Object.keys(config.limits).length === 4 &&
      config.limits.maxCostUsd === null &&
      ['launchMs', 'setupMs', 'taskMs'].every((key) => {
        const value = config.limits[key as keyof Experiment['limits']];
        return (
          Number.isSafeInteger(value) &&
          Number(value) > 0 &&
          Number(value) <= 600000
        );
      }) &&
      (config.preflightPath === undefined ||
        (typeof config.preflightPath === 'string' &&
          path.isAbsolute(config.preflightPath)))
    );
  } catch {
    return false;
  }
}

async function offlineRun(
  config: DiagnosticConfig,
  directory: string,
): Promise<ExternalRun> {
  const { runProcessAttempt } = await import('./runner.ts');
  const fake = new URL('./diagnostic-fake.mjs', import.meta.url);
  const profile = {
    id: 'diagnostic-fake',
    agent: 'fake',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: hashContent(await readFile(fake)),
    permissionsHash: digest({ env: {}, driver: 'built-in-fake' }),
  };
  const phase = {
    prompt: 'Complete the synthetic offline protocol handshake.',
    allowedPaths: [],
    allowedCommands: [],
    replies: [],
  };
  const scenario: EvalScenario = {
    schema: 1,
    id: 'offline-protocol',
    isolation: 'controlled',
    files: [],
    dialogue: [],
    setup: phase,
    task: phase,
    oracle: { id: 'offline-protocol', hash: digest('synthetic-protocol-only') },
  };
  const experiment: Experiment = {
    schema: 1,
    id: config.experimentId,
    sourceSha: config.sourceSha,
    conditionsHash: digest(config),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [profile],
    repeats: 1,
    limits: config.limits,
    order: (['tibicen', 'baseline'] as const).map((variant) => ({
      id: 'offline-' + variant,
      scenarioId: scenario.id,
      profileId: profile.id,
      variant,
      repeat: 1,
    })),
  };
  const runs = [];
  for (const slot of experiment.order)
    runs.push({
      run: await runProcessAttempt({
        experiment,
        scenario,
        attemptId: slot.id,
        profile: {
          specification: profile,
          preflight: async () => ({
            status: 'ready',
            startupControlled: true,
            authProtected: true,
            processTreeControlled: true,
            isolation: 'controlled',
          }),
          command: () => ({
            executable: process.execPath,
            argv: [fileURLToPath(fake)],
            cwd: directory,
            env: {},
          }),
        },
      }),
    });
  return {
    experiments: [
      {
        experiment,
        mode: 'calibration',
        plans: {
          [scenario.id]: {
            setup: ['grounding', 'fit', 'sufficiency', 'consistency'],
            task: ['application'],
          },
        },
        runs,
      },
    ],
  };
}

export async function runDiagnostic(
  mode: DiagnosticMode,
  input: unknown,
  directory: string,
) {
  const blocked = (reason: string) => ({
    schema: 1,
    kind: 'diagnostic',
    mode,
    status: 'blocked',
    reason,
    modelRequests: 0,
  });
  const config =
    mode === 'offline' && input === undefined ? offlineConfig : input;
  if (!validConfig(config))
    return blocked('diagnostic-config-incomplete-or-invalid');
  const native =
    config.profile === 'codex' &&
    config.provider === 'openai' &&
    config.auth === 'subscription';
  const fake =
    config.profile === 'fake' &&
    config.provider === 'none' &&
    config.model === 'none' &&
    config.auth === 'none' &&
    config.maxModelSessions === 0 &&
    config.preflightPath === undefined;
  if ((mode === 'offline' && !fake) || (mode !== 'offline' && !native))
    return blocked('diagnostic-route-unsupported');
  if (
    native &&
    (digest({
      repeats: config.repeats,
      maxModelSessions: config.maxModelSessions,
      limits: config.limits,
    }) !== digest(nativeBudget) ||
      !config.preflightPath)
  )
    return blocked('diagnostic-native-contract-required');
  const { preflightPath: _preflightPath, ...conditions } = config;
  if (native) {
    try {
      observationGuard()(
        JSON.parse(await readFile(config.preflightPath!, 'utf8')),
      );
      const { loadNativeProfile } = await import('./profiles/index.ts');
      const profile = await loadNativeProfile('codex', config.preflightPath!);
      if (profile.state === 'blocked')
        return { ...blocked(profile.preflight.reason!), conditions };
      if (
        profile.specification.model !== config.model ||
        profile.specification.auth !== config.auth
      )
        return blocked('diagnostic-profile-mismatch');
    } catch {
      return blocked('diagnostic-preflight-unavailable');
    }
  }
  if (mode === 'dry-run')
    return { ...blocked('diagnostic-dry-run'), conditions };
  try {
    const result =
      mode === 'offline'
        ? await offlineRun(config, directory)
        : await (
            await import('./codex-diagnostic.ts')
          ).runCodexDiagnostics({
            preflightPath: config.preflightPath!,
            artifactDirectory: path.join(directory, 'native'),
            sourceSha: config.sourceSha,
            experimentId: config.experimentId,
          });
    const { buildPairedReport } = await import('./report.ts');
    await writeEvalArtifact(
      path.join(directory, 'paired-report.json'),
      buildPairedReport(result.experiments),
    );
    return {
      schema: 1,
      kind: 'diagnostic',
      mode,
      status: 'recorded',
      reason:
        mode === 'offline'
          ? 'diagnostic-calibration-recorded'
          : 'diagnostic-native-recorded',
      modelRequests: mode === 'offline' ? 0 : null,
      conditions,
    };
  } catch {
    return {
      schema: 1,
      kind: 'diagnostic',
      mode,
      status: 'error',
      reason: 'diagnostic-run-failed',
      modelRequests: mode === 'offline' ? 0 : null,
    };
  }
}
