import test from 'node:test';
import assert from 'node:assert/strict';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { summarizeRun } from '../../scripts/evals/run-summary.ts';
import type { SessionSummary } from '../../scripts/evals/run-summary.ts';
import { recordedExperiment, recordedRun } from './helpers/recorded-quality.ts';

const processor = {
  collectorHash: 'a'.repeat(64),
  summaryHash: 'b'.repeat(64),
  frozenHash: 'c'.repeat(64),
};
const session: SessionSummary = {
  stage: 'setup',
  phase: 'setup-proposal',
  file: 'attempt-setup-proposal.json',
  sourceHash: 'd'.repeat(64),
  timing: {
    startedAt: '2026-11-14T08:00:00.000Z',
    endedAt: '2026-11-14T08:00:01.000Z',
    durationMs: 1000,
  },
  exitCode: 0,
  timedOut: false,
};

test('summary binds retained inputs, exact consent and outcomes without copying private inputs', () => {
  const fixture = recordedExperiment();
  fixture.scenario.files.push({
    path: 'README.md',
    content: 'Private fixture.',
  });
  fixture.experiment.scenarios[0].hash = digest(fixture.scenario);
  const run = recordedRun(fixture),
    plan = { changes: [], commandHashes: [] };
  run.events.splice(
    2,
    0,
    {
      ...run.events[1],
      stage: 'setup',
      kind: 'checkpoint',
      data: {
        point: 'start',
        complete: true,
        files: [
          { path: 'README.md', contentHash: 'e'.repeat(64), fileMode: 0o600 },
        ],
      },
    },
    {
      ...run.events[1],
      stage: 'setup',
      kind: 'approval',
      data: { ...plan, planHash: digest(plan) },
    },
  );
  run.events.forEach((event, index) => {
    event.seq = index;
    event.elapsedMs = index;
  });
  run.grades.forEach((grade) => {
    grade.evidence = grade.evidence.map((seq) => (seq >= 2 ? seq + 2 : seq));
  });
  const sourceHash = digest(run),
    summary = summarizeRun(run, [session], processor, 'verified');
  assert.equal(summary.sourceRunHash, sourceHash);
  assert.equal(summary.evidenceStatus, 'complete');
  assert.equal(summary.source.sha, run.experiment.sourceSha);
  assert.equal(summary.source.scenarioHash, digest(run.scenario));
  assert.equal(
    summary.source.setupPromptHash,
    hashContent(run.scenario.setup.prompt),
  );
  assert.deepEqual(summary.source.oracle, run.scenario.oracle);
  assert.deepEqual(
    summary.source.files,
    run.scenario.files.map((file) => ({
      path: file.path,
      contentHash: hashContent(file.content),
    })),
  );
  const approval = run.events.find((event) => event.kind === 'approval')!;
  assert(approval);
  assert.deepEqual(
    summary.timeline.find((event) => event.seq === approval.seq)?.data,
    approval.data,
  );
  assert.deepEqual(summary.result, run.result);
  assert.deepEqual(summary.grades, run.grades);
  for (const event of summary.timeline.filter(
    (event) => event.kind === 'checkpoint',
  )) {
    assert('treeHash' in event.data);
    assert(!('files' in event.data));
  }
  const serialized = JSON.stringify(summary);
  for (const field of ['prompt', 'content', 'argv', 'env', 'stdout', 'stderr'])
    assert(!serialized.includes(`"${field}":`));
  summary.result.id = 'changed';
  summary.sessions[0].timing!.durationMs = 0;
  assert.equal(digest(run), sourceHash);
  assert.equal(session.timing!.durationMs, 1000);
});

test('summary retains missing traces and unknown retry, nested-call and cost data as unknown', () => {
  const missing = { ...session, sourceHash: null, timing: null };
  const summary = summarizeRun(recordedRun(), [missing], processor, 'verified');
  assert.equal(summary.sessions[0].sourceHash, null);
  assert.equal(summary.sessions[0].timing, null);
  assert.equal(summary.evidenceStatus, 'incomplete');
  assert.equal(
    summarizeRun(recordedRun(), [session], processor, 'legacy').evidenceStatus,
    'unverified',
  );
  assert.equal(
    summarizeRun(recordedRun(), [], processor, 'missing').evidenceStatus,
    'incomplete',
  );
  assert.deepEqual(summary.limitsOfObservation, {
    approvalIdentity: 'not-established-by-digest',
    modelComputeMs: null,
    networkMs: null,
    internalRetryCount: null,
    nestedModelCalls: null,
    costRub: null,
    pendingCostRub: null,
    settlement: 'unknown',
  });
});

test('summary rejects malformed retained timing rather than inventing a duration', () => {
  assert.throws(
    () =>
      summarizeRun(
        recordedRun(),
        [{ ...session, timing: { ...session.timing!, durationMs: Infinity } }],
        processor,
        'verified',
      ),
    { code: 'invalid-native-timing' },
  );
});
