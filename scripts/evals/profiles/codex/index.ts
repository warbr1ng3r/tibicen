import { diagnosticScenarios, loadDiagnostic } from '../../fixtures.ts';
import type { AcceptanceFixture } from '../../matrix.ts';
import type { MechanicalOracle } from '../../mechanical.ts';
import { loadTrustedCodexFixture } from './profile.ts';
import type { NativeProfile } from '../contracts.ts';
import { runNativeExperiment } from '../../native-runner.ts';
import type { NativeRunOptions } from '../../native-runner.ts';
import { runNativeAcceptance } from '../../native.ts';
export { parseCodex as parseNative } from './profile.ts';
export {
  reviewNativeProposal,
  isNativeNodeTest,
} from '../../native-workflow.ts';
export { captureNativeSources } from '../../native-sources.ts';

type DiagnosticOptions = {
  preflightPath: string;
  artifactDirectory: string;
  sourceSha: string;
  experimentId?: string;
};
export const runCodexDiagnostics = (options: DiagnosticOptions) =>
  diagnostics(options);

export async function runTrustedCodexFixtureDiagnostics(
  options: DiagnosticOptions,
) {
  return diagnostics(
    options,
    await loadTrustedCodexFixture(options.preflightPath),
  );
}

async function diagnostics(
  options: DiagnosticOptions,
  trustedFixtureProfile?: NativeProfile,
) {
  const fixtures: AcceptanceFixture[] = await Promise.all(
    diagnosticScenarios.map(async (id) => {
      const { scenario, oracle } = await loadDiagnostic(id);
      return {
        scenario,
        oracle: oracle as MechanicalOracle,
        coverage: ['diagnostic'],
        interaction: { proposal: 'approve', process: false },
        quality: {
          setup: ['grounding', 'fit', 'sufficiency', 'consistency'],
          task: ['application', 'loading'],
        },
        controls: { sufficient: 'Host only.', violation: 'Host only.' },
      };
    }),
  );
  return runNativeExperiment(
    {
      ...options,
      profile: 'codex',
      experimentId: options.experimentId ?? 'codex-diagnostic-2026-10-23',
      repeats: 1,
      maxModelSessions: 16,
      limits: {
        launchMs: 45000,
        setupMs: 180000,
        taskMs: 120000,
        maxCostUsd: null,
      },
    },
    fixtures,
    false,
    trustedFixtureProfile,
  );
}
export const runCodexAcceptance = (
  options: Omit<NativeRunOptions, 'profile'> & { scenarioIds: string[] },
) => runNativeAcceptance({ ...options, profile: 'codex' });
