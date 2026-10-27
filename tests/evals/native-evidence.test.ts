import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { createNativeEvidence } from '../../scripts/evals/native-evidence.ts';
import {
  assessQuality,
  prepareJudgePacket,
} from '../../scripts/evals/quality.ts';
import type {
  QualityPlan,
  QualityReview,
} from '../../scripts/evals/quality.ts';
import type { EvalEvent } from '../../scripts/evals/contracts.ts';
import {
  basePlan,
  recordedRun,
  recordedReview,
  selectedEvidence,
} from './helpers/recorded-quality.ts';

const sessionHash = 'd'.repeat(64);
const plan: QualityPlan = {
  ...basePlan,
  task: ['application', 'loading', 'process'],
};
function observations() {
  const run = recordedRun();
  run.events = run.events.filter((event) => event.stage === 'launch');
  run.grades = [];
  let stage: 'setup' | 'task' = 'setup';
  const emit = (
    phase: 'setup' | 'task',
    kind: EvalEvent['kind'],
    data: unknown,
  ) => {
    const seq = run.events.length;
    run.events.push({
      ...run.events[0],
      stage: phase,
      seq,
      elapsedMs: seq,
      kind,
      data,
    } as EvalEvent);
    return seq;
  };
  return {
    run,
    observe:
      (phase: 'setup' | 'task') =>
      (kind: 'assertion' | 'instructions-loaded', data: unknown) => {
        if (stage !== phase) {
          emit(stage, 'stage-finished', run.result[stage]);
          stage = phase;
        }
        return emit(phase, kind, data);
      },
    finish() {
      emit(stage, 'stage-finished', run.result[stage]);
      if (stage === 'setup') emit('task', 'stage-finished', run.result.task);
      return run;
    },
  };
}

test('selection links source reads, intermediate messages, commands and actual user replies to applicable criteria', () => {
  const host = observations(),
    selected = createNativeEvidence(plan, [['/private/control', '[project]']]);
  const source = {
    path: 'available-sources/ponytail/skills/SKILL.md',
    content: 'Keep changes focused. Run the agreed tests.',
  };
  selected.observeCommand(
    'setup',
    {
      command: 'cat /private/control/' + source.path,
      output: source.content,
      exitCode: 0,
      toolUseId: 'read-source',
    },
    [source],
    { root: '/private/control', sessionHash },
    host.observe('setup'),
  );
  selected.observeMessages(
    'setup',
    [
      'The existing rules already cover this task.',
      JSON.stringify({
        observation:
          'The source was read; installation is still a separate decision.',
      }),
      JSON.stringify({
        summary: 'Preserve sufficient rules.',
        question: 'Keep owner review?',
        kernelPlan: 'private-oracle-not-for-judge',
      }),
    ],
    sessionHash,
    host.observe('setup'),
  );
  const reply = 'Keep separate owner review before edits.',
    replyHash = hashContent(reply),
    seq = host.observe('setup')('assertion', {
      id: 'user-reply',
      expectedHash: replyHash,
      actualHash: replyHash,
    });
  selected.add('setup', 'context', reply, [seq], undefined, {
    origin: 'user-reply',
  });
  const packet = prepareJudgePacket(
    host.finish(),
    plan,
    selected.select(),
    'calibration',
  );
  const facts = packet.request.evidence;
  assert(
    facts.some(
      (item) =>
        item.provenance?.origin === 'file-read' &&
        item.provenance.path === source.path &&
        item.provenance.contentHash === hashContent(source.content) &&
        item.kind === 'context',
    ),
  );
  assert(
    facts.some(
      (item) =>
        item.provenance?.toolUseId === 'read-source' &&
        item.provenance.sessionHash === sessionHash,
    ),
  );
  assert(
    facts.some(
      (item) =>
        item.source === 'executor' && item.text.includes('already cover'),
    ),
  );
  assert(
    facts.some((item) =>
      item.text.includes('installation is still a separate decision'),
    ),
  );
  assert(
    facts.some(
      (item) =>
        item.provenance?.origin === 'user-reply' &&
        item.text === reply &&
        item.events.includes(seq),
    ),
  );
  assert(
    facts.every((item) =>
      item.criteria!.every((criterion) => plan[item.stage].includes(criterion)),
    ),
  );
  const text = JSON.stringify(packet.request);
  for (const hidden of [
    '/private/control',
    'private-oracle-not-for-judge',
    host.run.result.id,
    host.run.experiment.sourceSha,
  ])
    assert(!text.includes(hidden));
});

test('loading requires the matched command, exact content, tool call and same-stage provenance', () => {
  const host = observations(),
    selected = createNativeEvidence(plan, []),
    read = {
      path: '.agents/skills/workflow/SKILL.md',
      content: 'Preserve the public export.',
    };
  selected.observeCommand(
    'task',
    {
      command: 'cat ' + read.path,
      output: read.content,
      exitCode: 0,
      toolUseId: 'read-installed',
    },
    [read],
    { root: '/project', sessionHash },
    host.observe('task'),
  );
  const run = host.finish(),
    facts = selected.select();
  const packet = prepareJudgePacket(run, plan, facts, 'calibration');
  const loaded = packet.request.evidence.find(
    (item) => item.kind === 'loading',
  )!;
  assert.equal(loaded.provenance!.contentHash, hashContent(read.content));
  assert(loaded.criteria!.includes('loading'));
  for (const change of [
    { contentHash: 'b'.repeat(64) },
    { path: 'AGENTS.md' },
    { toolUseId: 'other-read' },
  ]) {
    const altered = structuredClone(facts);
    Object.assign(
      altered.find((item) => item.kind === 'loading')!.provenance!,
      change,
    );
    assert.throws(() => prepareJudgePacket(run, plan, altered, 'calibration'), {
      code: 'invalid-quality-review',
    });
  }
});

test('wrong, failed, partial and compound reads retain command excerpts without inventing loading', () => {
  const host = observations(),
    selected = createNativeEvidence(plan, []),
    read = {
      path: 'AGENTS.md',
      content: 'Keep owner review. Preserve exports.',
    };
  for (const item of [
    { command: 'echo AGENTS.md', output: read.content, exitCode: 0 },
    { command: 'cat AGENTS.md', output: 'Keep owner review.', exitCode: 0 },
    { command: 'cat AGENTS.md', output: read.content, exitCode: 1 },
    {
      command: 'if true; then cat AGENTS.md; fi',
      output: read.content,
      exitCode: 0,
    },
  ])
    selected.observeCommand(
      'task',
      { ...item, toolUseId: 'incomplete-' + item.exitCode },
      [read],
      { root: '/project', sessionHash },
      host.observe('task'),
    );
  assert(!selected.select().some((item) => item.kind === 'loading'));
  assert.equal(
    selected
      .select()
      .filter((item) => item.provenance?.origin === 'executor-command').length,
    4,
  );
});

test('text and item caps report omitted evidence without losing the other stage or process steps', () => {
  const host = observations(),
    selected = createNativeEvidence(plan, []);
  selected.add('setup', 'context', 'x'.repeat(9000), [], undefined, {
    origin: 'scenario',
  });
  for (let i = 0; i < 140; i++)
    selected.observeMessages(
      'setup',
      ['Intermediate reply ' + i],
      sessionHash,
      host.observe('setup'),
    );
  for (const step of [
    'specification',
    'plan',
    'implementation',
    'verification',
  ] as const) {
    const hash = digest(step),
      seq = host.observe('task')('assertion', {
        id: step,
        expectedHash: hash,
        actualHash: hash,
      });
    selected.add('task', 'process', step, [seq], step);
  }
  const facts = selected.select();
  const packet = prepareJudgePacket(host.finish(), plan, facts, 'calibration');
  const truncated = facts.find(
    (item) => item.truncation && 'originalLength' in item.truncation,
  )!;
  assert(truncated.text.length <= 4000);
  assert(truncated.text.includes('[truncated:'));
  const notice = facts.find((item) => item.provenance?.origin === 'selection')!;
  assert.deepEqual(notice.truncation, { omittedItems: 42 });
  assert.deepEqual(
    facts.filter((item) => item.kind === 'process').map((item) => item.step),
    ['specification', 'plan', 'implementation', 'verification'],
  );
  assert(packet.request.evidence.length <= 200);
  const bad = structuredClone(facts);
  bad.find((item) => item.provenance?.origin === 'selection')!.text =
    'Everything was observed.';
  assert.throws(() => prepareJudgePacket(host.run, plan, bad, 'calibration'), {
    code: 'invalid-quality-review',
  });
});

test('known secrets are rejected before truncation; provenance is cleaned and validated', () => {
  const selected = createNativeEvidence(
    plan,
    [['/Users/person/project', '[project]']],
    ['opaque-secret'],
  );
  assert.throws(
    () =>
      selected.add('setup', 'context', 'x'.repeat(5000) + 'opaque-secret', []),
    { code: 'unsafe-eval-observation' },
  );
  assert.throws(
    () =>
      selected.add('setup', 'context', 'ordinary text', [], undefined, {
        toolUseId: 'opaque-secret',
      }),
    { code: 'unsafe-eval-observation' },
  );
  selected.add(
    'setup',
    'context',
    '/Users/person/project/AGENTS.md',
    [],
    undefined,
    { path: '/Users/person/project/AGENTS.md' },
  );
  const facts = selected.select();
  assert.equal(facts[0].provenance!.path, '[project]/AGENTS.md');
  assert.equal(facts[0].provenance!.redacted, true);
  const run = recordedRun();
  prepareJudgePacket(run, plan, facts, 'calibration');
  for (const change of [
    { contentHash: 'not-a-hash' },
    { sessionHash: 'not-a-hash' },
    { redacted: 'yes' },
    { path: '../private' },
    { rawTrace: 'forbidden' },
  ]) {
    const invalid = structuredClone(facts);
    Object.assign(invalid[0].provenance!, change);
    assert.throws(() => prepareJudgePacket(run, plan, invalid, 'calibration'));
  }
});

test('legacy packets remain valid; new criterion links reject a mismatched judge or human citation', () => {
  const run = recordedRun(),
    legacy = prepareJudgePacket(
      run,
      basePlan,
      selectedEvidence(run),
      'calibration',
    );
  assert.doesNotThrow(() =>
    assessQuality(
      run,
      legacy,
      recordedReview(legacy),
      recordedReview(legacy, 'reference'),
    ),
  );
  const facts = selectedEvidence(run);
  facts[0].criteria = ['grounding'];
  const packet = prepareJudgePacket(run, basePlan, facts, 'calibration');
  for (const who of ['judge', 'human']) {
    const judge = recordedReview(packet),
      human = recordedReview(packet, 'reference');
    if (who === 'judge')
      human.judgements = human.judgements.map((item) => ({
        ...item,
        evidence: item.evidence.filter((id) => id !== 'context'),
      }));
    else
      judge.judgements = judge.judgements.map((item) => ({
        ...item,
        evidence: item.evidence.filter((id) => id !== 'context'),
      }));
    assert.throws(() => assessQuality(run, packet, judge, human), {
      code: 'invalid-quality-review',
    });
  }
});

test('irrelevant evidence does not create invalid empty criterion links', () => {
  const selected = createNativeEvidence({ setup: [], task: ['loading'] }, []);
  selected.add('setup', 'context', 'Not applicable.', []);
  selected.add('task', 'action', 'An action cannot establish loading.', []);
  selected.add(
    'task',
    'recommendation',
    'A self-report cannot establish loading.',
    [],
  );
  assert.deepEqual(selected.select(), []);
});

test('sanitized historical reads can be selected; missing historical actions stay unverified', async () => {
  const saved = JSON.parse(
    await readFile(
      new URL(
        '../../docs/evals/results/2026-10-23-codex/loading-evidence-corrected.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const read = saved.evidence.find(
    (item: { sanitizedCommand: string }) =>
      item.sanitizedCommand === "/bin/zsh -c 'cat AGENTS.md'",
  );
  const host = observations(),
    selected = createNativeEvidence(plan, []);
  selected.observeCommand(
    'task',
    {
      command: read.sanitizedCommand,
      output: read.sanitizedOutput,
      exitCode: read.exitCode,
      toolUseId: read.toolUseId,
    },
    [{ path: read.path, content: read.sanitizedOutput }],
    { root: '/sanitized/project', sessionHash },
    host.observe('task'),
  );
  const packet = prepareJudgePacket(
    host.finish(),
    plan,
    selected.select(),
    'calibration',
  );
  assert.equal(
    packet.request.evidence.find((item) => item.kind === 'loading')!.provenance!
      .contentHash,
    read.contentHash,
  );
  const reviews = JSON.parse(
    await readFile(
      new URL(
        '../../docs/evals/results/2026-10-23-codex-acceptance/model-reviews.json',
        import.meta.url,
      ),
      'utf8',
    ),
  );
  const missing = reviews.reviews.find(
    (item: { attemptId: string }) =>
      item.attemptId === 'skill-01-refusal-tibicen-1',
  );
  assert(
    missing.judge.judgements.some(
      (item: { reason: string; verdict: string }) =>
        item.reason === 'source_read_unobserved' &&
        item.verdict === 'unverified',
    ),
  );
  const noActions = createNativeEvidence(basePlan, []);
  noActions.add(
    'setup',
    'context',
    'Only the supplied context is available.',
    [],
    undefined,
    { origin: 'scenario' },
  );
  const run = recordedRun(),
    incomplete = prepareJudgePacket(
      run,
      basePlan,
      noActions.select(),
      'calibration',
    );
  const review = (kind: 'recorded' | 'reference'): QualityReview => ({
    ...recordedReview(incomplete, kind),
    judgements: recordedReview(incomplete, kind).judgements.map((item) => ({
      ...item,
      evidence:
        item.stage === 'setup' ? [incomplete.request.evidence[0].id] : [],
      verdict: item.stage === 'setup' ? 'pass' : 'unverified',
    })),
  });
  const assessment = assessQuality(
    run,
    incomplete,
    review('recorded'),
    review('reference'),
  );
  assert(assessment.grades.every((grade) => grade.verdict === 'unverified'));
});
