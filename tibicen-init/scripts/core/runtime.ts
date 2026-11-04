import type {
  Proposal,
  Session,
  Snapshot,
  CheckResult,
  CheckRun,
  Checks,
  Runner,
} from './types.ts';
import { readFile } from 'node:fs/promises';
import { scanProject } from '../scan/index.ts';
import {
  createSnapshot,
  prepareFinalSnapshot,
  cleanupSnapshot,
  runProjectChecks,
  compareChecks,
  verifyInfrastructure,
  runBehaviorCheck,
} from '../verify/index.ts';
import { runCompatProbe } from '../compat/index.ts';
import { validateMcpConfig } from '../mcp/index.ts';
import { isInfrastructurePath } from './paths.ts';
import { safePath } from './paths.ts';
import { bindRunner, availableNames } from './checks.ts';
import { digest } from './contracts.ts';

export function runtimeHooks(
  root: string,
  proposal: Proposal,
  approvedDigest: string,
) {
  let baseline: Snapshot | undefined;
  let baselineResult: (CheckResult & { runs: CheckRun[] }) | undefined;
  const owned: Snapshot[] = [];
  const commands = proposal.commands.filter((command) =>
    ['build', 'test', 'lint'].includes(command.kind),
  );
  let execute: Runner = bindRunner(proposal, approvedDigest);
  const runner: Runner = (command, options) => execute(command, options);
  const settings = {
    approvedDigest,
    forbiddenPaths: proposal.forbiddenPaths,
    environmentReady: proposal.checks?.environmentReady === true,
    ...(proposal.checks?.environmentReady && proposal.checks.environment
      ? { environment: proposal.checks.environment }
      : {}),
    profile: proposal.checks?.profile ?? 'unsupported',
    runner,
  };
  const needsCopy =
    commands.length ||
    proposal.checks?.task ||
    proposal.checks?.quiz ||
    (proposal.compat?.pairs?.length && proposal.compat.enabled !== false);
  return {
    async beforeApply(_plan?: Proposal, execution?: { runner?: Runner }) {
      if (execution?.runner) execute = execution.runner;
      if (!needsCopy) return null;
      baseline = await createSnapshot(root, settings);
      owned.push(baseline);
      if (!proposal.emptyProject && commands.length)
        baselineResult = await runProjectChecks(baseline, commands, settings);
      return {
        id: baseline.id,
        complete: baseline.complete,
        runs: baselineResult?.runs ?? [],
        reason: baselineResult?.reason ?? 'new-project',
      };
    },
    async verify(
      plan: Proposal,
      session: Session,
      execution?: { runner: Runner },
    ) {
      if (execution?.runner) execute = execution.runner;
      const scanned = await scanProject(root, {
        forbiddenPaths: plan.forbiddenPaths,
      });
      let infrastructure = await verifyInfrastructure(root, {
        observedFiles: scanned.files,
        components: plan.components,
        expectedFiles: session.applied.filter((item) =>
          isInfrastructurePath(item.path),
        ),
        forbiddenPaths: plan.forbiddenPaths,
        sharedRules: plan.sharedRules ?? [],
        process: plan.process,
      });
      if (
        infrastructure.reason === 'no-check-scope' &&
        !plan.manualActions.some(
          (action) => action.required !== false && action.status === 'pending',
        )
      )
        infrastructure = {
          kind: 'infrastructure',
          status: 'issues-found',
          scope: 'structure-only',
          issues: [{ path: '.', reason: 'no-agent-infrastructure' }],
        };
      let verify: CheckResult = {
        kind: 'verify',
        status: 'unverified',
        reason: commands.length ? 'baseline-unavailable' : 'no-project-checks',
      };
      let final;
      if (baseline) {
        final = await prepareFinalSnapshot(baseline, plan.changes, settings);
        owned.push(final);
        if (commands.length) {
          const finalResult = await runProjectChecks(final, commands, settings);
          const complete = (result?: typeof finalResult) =>
            result?.reason === 'comparison-required' &&
            result.runs.length === commands.length &&
            commands.every(
              (command, index) =>
                result.runs[index].id === command.id &&
                result.runs[index].commandHash === digest(command),
            );
          if (
            (plan.emptyProject || complete(baselineResult)) &&
            complete(finalResult)
          )
            verify = compareChecks(baselineResult?.runs, finalResult.runs, {
              comparable: baseline.complete && final.complete,
              firstAttempt: session.attempts.length === 1,
              knownRegressions: session.attempts.flatMap(
                (attempt) => attempt.newRegressions ?? [],
              ),
              newProject: plan.emptyProject,
            });
          else {
            const incomplete =
              !plan.emptyProject && !complete(baselineResult)
                ? baselineResult
                : finalResult;
            verify = {
              kind: 'verify',
              status: 'unverified',
              reason:
                incomplete?.reason === 'comparison-required'
                  ? 'checks-not-comparable'
                  : (incomplete?.reason ?? 'baseline-unavailable'),
            };
          }
        }
      }
      const checks: Checks = { infrastructure, verify };
      if (!final && needsCopy) {
        final = await createSnapshot(root, settings);
        owned.push(final);
      }
      for (const kind of ['task', 'quiz'] as const) {
        const requested = plan.checks?.[kind];
        if (!requested) continue;
        const execution = requested.execution ?? {};
        checks[kind] = await runBehaviorCheck(final, requested.specification, {
          ...execution,
          approvedDigest,
          availableEnvNames: availableNames(execution.envNames),
          runner,
        });
      }
      const compat = plan.compat ?? { enabled: true };
      const pairs: NonNullable<Checks['compat']>['pairs'] = [];
      for (const pair of compat.pairs ?? []) {
        if (compat.enabled === false) {
          pairs.push({
            skill: pair.skill,
            ref: pair.ref,
            agent: pair.agent,
            loading: 'unverified',
            reason: 'skipped-by-user',
          });
          continue;
        }
        const execution = compat.execution ?? {};
        if (execution.trusted !== true) {
          pairs.push({
            skill: pair.skill,
            ref: pair.ref,
            agent: pair.agent,
            loading: 'unverified',
            reason: 'trust-required',
          });
          continue;
        }
        if (!final?.complete) {
          pairs.push({
            skill: pair.skill,
            ref: pair.ref,
            agent: pair.agent,
            loading: 'unverified',
            reason: 'snapshot-incomplete',
          });
          continue;
        }
        const copy = await prepareFinalSnapshot(final, [], settings);
        owned.push(copy);
        const result = await runCompatProbe(pair, {
          ...execution,
          copyRoot: copy.root,
          availableEnvNames: availableNames(execution.envNames),
          runner: (command) => runner(command, { root: copy.root }),
        });
        pairs.push(result);
      }
      checks.compat = {
        enabled: compat.enabled !== false,
        ...(compat.enabled === false ? { reason: 'skipped-by-user' } : {}),
        pairs,
      };
      const mcp = [];
      for (const connection of plan.mcp ?? []) {
        const text = await readFile(
          await safePath(root, connection.path!),
          'utf8',
        ).catch((error) => {
          if (error.code === 'ENOENT') return '{}';
          throw error;
        });
        mcp.push(
          validateMcpConfig(connection.agent, text, {
            targetContextKnown: false,
          }),
        );
      }
      checks.mcp = mcp;
      return checks;
    },
    async cleanup() {
      for (const snapshot of owned.reverse()) await cleanupSnapshot(snapshot);
    },
  };
}
