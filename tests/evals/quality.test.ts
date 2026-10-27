import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { digest } from '../../scripts/core/contracts.ts';
import {
  assessQuality,
  prepareJudgePacket,
} from '../../scripts/evals/quality.ts';
import {
  basePlan,
  calibrationCases,
  calibrationRecord,
  recordedExperiment,
  recordedReview,
  recordedRun,
  reviewed,
  selectedEvidence,
} from './helpers/recorded-quality.ts';

test('saved calibration preserves control labels, observations and disagreements', async () => {
  const saved = JSON.parse(
    await readFile(
      new URL('../../docs/evals/calibration-quality.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(saved, calibrationRecord());
});

for (const example of calibrationCases())
  test('recorded rubric calibration: ' + example.id, () => {
    const grade = example.assessment.grades.find((g) =>
      g.id.endsWith('-' + example.criterion),
    )!;
    assert.equal(
      grade.verdict,
      example.id === 'disagreement' ? 'unverified' : example.reference,
    );
    assert.equal(example.assessment.mode, 'calibration');
    assert.equal(example.assessment.humanRequired, true);
    if (example.id === 'disagreement') {
      assert.deepEqual(example.assessment.disagreements, [
        { stage: 'setup', criterion: 'fit', judge: 'pass', human: 'fail' },
      ]);
      assert.equal(grade.reason, 'judge-human-disagreement');
    }
  });

test('judge sees one blinded result without oracle, profile, variant or reference labels', () => {
  const run = recordedRun(),
    evidence = selectedEvidence(run),
    packet = prepareJudgePacket(run, basePlan, evidence, 'calibration');
  const text = JSON.stringify(packet.request);
  for (const hidden of [
    'private-reference',
    'recorded-executor',
    run.experiment.sourceSha,
    run.result.id,
    'baseline',
    'judgements',
  ])
    assert(!text.includes(hidden));
  assert.deepEqual(Object.keys(packet.request).sort(), [
    'evidence',
    'plan',
    'rubric',
    'schema',
  ]);
  evidence[0].text = 'Mutated after selection';
  assert.notEqual(packet.request.evidence[0].text, evidence[0].text);
});

test('incomplete, duplicate, unknown and cross-stage reviews cannot manufacture a grade', () => {
  const {
    run,
    quality: { packet, judge, human },
  } = reviewed(recordedRun());
  const invalids = [
    { ...judge, judgements: judge.judgements.slice(1) },
    { ...judge, judgements: [...judge.judgements, judge.judgements[0]] },
    { ...judge, rawLog: 'forbidden' },
    {
      ...judge,
      judgements: judge.judgements.map((j, i) =>
        i ? j : { ...j, evidence: ['missing'] },
      ),
    },
    {
      ...judge,
      judgements: judge.judgements.map((j, i) =>
        i ? j : { ...j, evidence: ['action'] },
      ),
    },
  ];
  for (const invalid of invalids)
    assert.throws(() => assessQuality(run, packet, invalid, human), {
      code: 'invalid-quality-review',
    });
});

test('binding, rubric, plan, evidence stage and request shape are validated again before grading', () => {
  const {
    run,
    quality: { packet, judge, human },
  } = reviewed(recordedRun());
  assert.throws(
    () =>
      assessQuality(
        run,
        { ...packet, bindingHash: 'a'.repeat(64) },
        judge,
        human,
      ),
    { code: 'invalid-quality-review' },
  );
  const changed = structuredClone(packet);
  Object.assign(changed.request.rubric, { instructions: 'Replaced rubric' });
  changed.packetHash = digest(changed.request);
  assert.throws(() => assessQuality(run, changed, judge, human), {
    code: 'invalid-quality-review',
  });
  assert.throws(
    () =>
      prepareJudgePacket(
        run,
        { setup: ['fit'], task: ['application'] },
        selectedEvidence(run),
        'calibration',
      ),
    { code: 'invalid-quality-review' },
  );
  const evidence = selectedEvidence(run);
  evidence[0].events = [0];
  assert.throws(
    () => prepareJudgePacket(run, basePlan, evidence, 'calibration'),
    { code: 'invalid-quality-review' },
  );
  const extra = structuredClone(packet);
  Object.assign(extra.request, { expected: 'pass' });
  extra.packetHash = digest(extra.request);
  assert.throws(() => assessQuality(run, extra, judge, human), {
    code: 'invalid-quality-review',
  });
});

test('first repeat and every non-pass require review; a missing human is explicitly unverified', () => {
  const {
    run,
    quality: { packet, judge },
  } = reviewed(recordedRun());
  const result = assessQuality(run, packet, judge);
  assert(result.humanRequired);
  assert(
    result.grades.every(
      (g) => g.verdict === 'unverified' && g.reason === 'human-review-required',
    ),
  );
  const other = reviewed(recordedRun(recordedExperiment(3), 4));
  other.quality.judge.judgements[0].verdict = 'fail';
  assert(
    assessQuality(other.run, other.quality.packet, other.quality.judge)
      .humanRequired,
  );
  const gap = reviewed(recordedRun(recordedExperiment(3), 4));
  gap.quality.judge.judgements[0].evidence = ['recommendation'];
  assert(
    assessQuality(gap.run, gap.quality.packet, gap.quality.judge).humanRequired,
  );
});

test('additional sampling is stable and reviews remain separate from recorded controls', () => {
  const {
    run,
    quality: { packet, judge, human },
  } = reviewed(recordedRun(recordedExperiment(2), 2));
  assert.deepEqual(
    assessQuality(run, packet, judge, human),
    assessQuality(run, packet, judge, human),
  );
  assert.throws(
    () => assessQuality(run, packet, { ...judge, kind: 'model' }, human),
    { code: 'invalid-quality-review' },
  );
  assert.throws(
    () => assessQuality(run, packet, judge, { ...human, id: judge.id }),
    { code: 'invalid-quality-review' },
  );
  const observed = prepareJudgePacket(
    run,
    basePlan,
    selectedEvidence(run),
    'observed',
  );
  assert.throws(() => assessQuality(run, observed, judge, human), {
    code: 'invalid-quality-review',
  });
  assert.equal(
    assessQuality(
      run,
      observed,
      { ...judge, kind: 'model' },
      { ...human, kind: 'human' },
    ).mode,
    'observed',
  );
});

test('a human citation cannot supply missing independent evidence for a positive judge claim', () => {
  const {
    run,
    quality: { packet, judge, human },
  } = reviewed(recordedRun());
  judge.judgements[0].evidence = ['recommendation'];
  const result = assessQuality(run, packet, judge, human);
  assert.equal(result.grades[0].verdict, 'unverified');
  assert.equal(result.grades[0].reason, 'insufficient-independent-evidence');
});

test('process needs observed stages in order; final success or CLI init is insufficient', () => {
  const run = recordedRun(),
    plan = { ...basePlan, task: ['process', 'application'] as const };
  const requirements = { ...plan, task: [...plan.task] },
    facts = selectedEvidence(run);
  const spec = facts.find((f) => f.id === 'specification')!,
    implementation = facts.find((f) => f.id === 'implementation')!;
  [spec.events, implementation.events] = [implementation.events, spec.events];
  const packet = prepareJudgePacket(run, requirements, facts, 'calibration');
  const result = assessQuality(
    run,
    packet,
    recordedReview(packet),
    recordedReview(packet, 'reference'),
  );
  assert.equal(
    result.grades.find((g) => g.id === 'quality-task-process')!.verdict,
    'unverified',
  );
});

test('known sensitive values cannot enter a judge packet', () => {
  const run = recordedRun(),
    facts = selectedEvidence(run);
  facts[0].text = 'opaque control value 42-secret';
  assert.throws(
    () =>
      prepareJudgePacket(run, basePlan, facts, 'calibration', ['42-secret']),
    { code: 'unsafe-eval-observation' },
  );
});

test('a review cannot be replayed after its observations or selected evidence change', () => {
  const {
    run,
    quality: { packet, judge, human },
  } = reviewed(recordedRun());
  const altered = structuredClone(run);
  const artifact = altered.events.find((event) => event.kind === 'artifact')!;
  if (artifact.kind === 'artifact') artifact.data.afterHash = 'd'.repeat(64);
  assert.throws(() => assessQuality(altered, packet, judge, human), {
    code: 'invalid-quality-review',
  });
  const differentResult = structuredClone(run);
  differentResult.result.task.durationMs += 1;
  const finished = differentResult.events.find(
    (event) => event.stage === 'task' && event.kind === 'stage-finished',
  )!;
  if (finished.kind === 'stage-finished')
    finished.data = differentResult.result.task;
  assert.throws(() => assessQuality(differentResult, packet, judge, human), {
    code: 'invalid-quality-review',
  });
  const differentGrade = structuredClone(run);
  differentGrade.grades[0].reason = 'different-mechanical-check';
  assert.throws(() => assessQuality(differentGrade, packet, judge, human), {
    code: 'invalid-quality-review',
  });
  const facts = selectedEvidence(run);
  facts[0].text = 'Changed constraints require a different recommendation.';
  const otherPacket = prepareJudgePacket(run, basePlan, facts, 'calibration');
  assert.throws(() => assessQuality(run, otherPacket, judge, human), {
    code: 'invalid-quality-review',
  });
});
