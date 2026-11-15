import { assert, digest, hashContent } from '../core/contracts.ts';
import { validateRun } from './contracts.ts';

export interface SessionSummary {
  stage: 'setup' | 'task';
  phase: string;
  file: string;
  sourceHash: string | null;
  timing: {
    startedAt: string;
    endedAt: string;
    durationMs: number;
  } | null;
  exitCode: number | null;
  timedOut: boolean | null;
}

// A small index into retained evidence, not a replacement for the bound originals.
export function summarizeRun(
  input: ReturnType<typeof validateRun>,
  sessions: SessionSummary[],
  processor: { collectorHash: string; summaryHash: string; frozenHash: string },
  sessionIndex: 'verified' | 'missing' | 'legacy',
) {
  const run = validateRun(
    input.experiment,
    input.scenario,
    input.result,
    input.events,
    input.grades,
  );
  for (const session of sessions)
    assert(
      (session.exitCode === null || Number.isSafeInteger(session.exitCode)) &&
        (session.timedOut === null || typeof session.timedOut === 'boolean') &&
        (!session.timing ||
          (typeof session.timing.startedAt === 'string' &&
            typeof session.timing.endedAt === 'string' &&
            Number.isFinite(Date.parse(session.timing.startedAt)) &&
            Number.isFinite(Date.parse(session.timing.endedAt)) &&
            Number.isFinite(session.timing.durationMs) &&
            session.timing.durationMs >= 0)),
      'invalid-native-timing',
      'Retained timing must contain observed timestamps and a finite duration.',
    );
  return structuredClone({
    schema: 1,
    meaning: 'retained-observation-index',
    evidenceStatus:
      sessionIndex === 'missing' ||
      sessions.some((session) => !session.sourceHash)
        ? 'incomplete'
        : sessionIndex === 'legacy'
          ? 'unverified'
          : 'complete',
    sessionIndex,
    sourceRunHash: digest(run),
    processor,
    source: {
      sha: run.experiment.sourceSha,
      experimentHash: digest(run.experiment),
      conditionsHash: run.experiment.conditionsHash,
      scenarioHash: digest(run.scenario),
      profileHash: digest(
        run.experiment.profiles.find(
          (profile) => profile.id === run.result.profileId,
        ),
      ),
      files: run.scenario.files.map((file) => ({
        path: file.path,
        contentHash: hashContent(file.content),
      })),
      setupPromptHash: hashContent(run.scenario.setup.prompt),
      taskPromptHash: hashContent(run.scenario.task.prompt),
      dialogueHash: digest(run.scenario.dialogue),
      oracle: run.scenario.oracle,
    },
    limits: run.experiment.limits,
    result: run.result,
    grades: run.grades,
    timeline: run.events.map((event) => ({
      seq: event.seq,
      elapsedMs: event.elapsedMs,
      stage: event.stage,
      kind: event.kind,
      data:
        event.kind === 'checkpoint'
          ? {
              point: event.data.point,
              complete: event.data.complete,
              treeHash: digest(event.data.files),
            }
          : event.data,
    })),
    sessions,
    limitsOfObservation: {
      approvalIdentity: 'not-established-by-digest',
      modelComputeMs: null,
      networkMs: null,
      internalRetryCount: null,
      nestedModelCalls: null,
      costRub: null,
      pendingCostRub: null,
      settlement: 'unknown',
    },
  });
}
