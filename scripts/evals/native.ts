import { assert } from '../core/contracts.ts';
import { loadAcceptanceMatrix } from './matrix.ts';
import { runNativeExperiment } from './native-runner.ts';
import { loadTrustedCodexFixture } from './profiles/codex/profile.ts';
import type { NativeProfile } from './profiles/contracts.ts';
import type { NativeRunOptions } from './native-runner.ts';
export { firstWaveProfiles } from './profiles/index.ts';
export { captureNativeSources } from './native-sources.ts';
export { preflightCodex } from './profiles/codex/preflight.ts';
export { preflightZCode } from './profiles/zcode/preflight.ts';
export { preflightClaude } from './profiles/claude/preflight.ts';

type AcceptanceOptions = NativeRunOptions & { scenarioIds: string[] };
export const runNativeAcceptance = (options: AcceptanceOptions) =>
  acceptance(options);

// Explicit trusted offline controls only; never exposed through CLI/profile JSON.
export async function runTrustedNativeFixtureAcceptance(
  options: AcceptanceOptions,
) {
  assert(
    options.profile === 'codex',
    'invalid-native-profile',
    'Codex fixture only.',
  );
  return acceptance(
    options,
    await loadTrustedCodexFixture(options.preflightPath),
  );
}

async function acceptance(
  options: AcceptanceOptions,
  trustedFixtureProfile?: NativeProfile,
) {
  assert(
    Array.isArray(options.scenarioIds) &&
      options.scenarioIds.length > 0 &&
      new Set(options.scenarioIds).size === options.scenarioIds.length &&
      options.scenarioIds.every(
        (id) => typeof id === 'string' && /^(?:skill|pref|proc)-/.test(id),
      ),
    'invalid-native-selection',
    'Explicitly select prepared SKILL/PREF/PROC scenarios.',
  );
  const all = await loadAcceptanceMatrix();
  const fixtures = options.scenarioIds.map((id) => {
    const item = all.find((item) => item.scenario.id === id);
    assert(item, 'invalid-native-selection', 'Unknown prepared scenario.');
    return item;
  });
  return runNativeExperiment(options, fixtures, true, trustedFixtureProfile);
}

// Explicit AGENTS-only setup route; generic profiles and serialized ready flags stay blocked.
export async function describeContainedTibicenSetup(
  input: import('./profiles/codex/tibicen-setup.ts').ContainedTibicenSetupInput,
) {
  const { createContainedTibicenSetup } =
    await import('./profiles/codex/tibicen-setup.ts');
  const driver = await createContainedTibicenSetup(input);
  return { freeze: driver.freeze, freezeHash: driver.freezeHash };
}

export async function runContainedTibicenSetup(
  options: Pick<
    NativeRunOptions,
    'artifactDirectory' | 'sourceSha' | 'experimentId'
  > &
    import('./profiles/codex/tibicen-setup.ts').ContainedTibicenSetupInput,
) {
  const { createContainedTibicenSetup, setupLimits } =
    await import('./profiles/codex/tibicen-setup.ts');
  const driver = await createContainedTibicenSetup(options);
  return runNativeExperiment(
    {
      ...options,
      profile: 'codex',
      preflightPath: '',
      repeats: 1,
      maxModelSessions: 4,
      limits: setupLimits,
    },
    driver.fixtures,
    true,
    undefined,
    driver,
  );
}
