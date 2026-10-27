import type { Command, RunOptions } from '../../scripts/core/types.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  createSnapshot,
  cleanupSnapshot,
  runBehaviorCheck,
  evaluateQuiz,
} from '../../scripts/verify/index.ts';

const approvedDigest = 'a'.repeat(64);
const success = (result: string) => ({
  exitCode: 0,
  stdout: JSON.stringify({
    type: 'result',
    subtype: 'success',
    result,
    is_error: false,
  }),
  stderr: '',
  timedOut: false,
});
const questions = Array.from({ length: 5 }, (_, index) => ({
  id: `q${index}`,
  question: `Project fact ${index}?`,
  answer: `answer ${index}`,
}));

test('quiz grades five observed answers and never treats exit zero as evidence of success', () => {
  const answers = questions.map(({ id, answer }) => ({ id, answer }));
  assert.equal(
    evaluateQuiz(questions, success(JSON.stringify({ answers }))).score,
    5,
  );
  answers[0].answer = 'wrong';
  assert.equal(
    evaluateQuiz(questions, success(JSON.stringify({ answers }))).status,
    'passed',
  );
  answers[1].answer = 'also wrong';
  assert.equal(
    evaluateQuiz(questions, success(JSON.stringify({ answers }))).status,
    'failed',
  );
  assert.equal(
    evaluateQuiz(questions, {
      exitCode: 0,
      stdout: 'I answered everything correctly.',
    }).status,
    'unverified',
  );
  assert.equal(evaluateQuiz(questions, success('not json')).status, 'failed');
});

test('task/quiz execute only on their own controlled copy; unsupported startup and auth skip execution', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-behavior-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'AGENTS.md'), 'Use local instructions.');
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const task = {
    kind: 'task',
    prompt:
      'Read the project instructions, then write result.txt with the word ready.',
    expectedArtifacts: [{ path: 'result.txt', contains: 'ready' }],
  };
  let calls = 0;
  const runner = async (command: Command, options: RunOptions) => {
    calls++;
    assert.equal(command.executable, 'claude');
    assert.equal(command.cwd, '.');
    assert.notEqual(options.root, snapshot.root);
    assert(command.argv.includes('--bare'));
    assert(command.argv.includes('--strict-mcp-config'));
    assert.equal(
      command.argv[command.argv.indexOf('--add-dir') + 1],
      options.root,
    );
    assert.deepEqual(command.envNames, ['ANTHROPIC_API_KEY']);
    assert(!command.argv.some((argument) => argument === 'Bash'));
    if (command.kind === 'quiz')
      return success(
        JSON.stringify({
          answers: questions.map(({ id, answer }) => ({ id, answer })),
        }),
      );
    await writeFile(path.join(options.root, 'result.txt'), 'ready');
    return success('Done');
  };
  const options = {
    agent: 'claude-code',
    agentVersion: '2.1.283',
    approvedDigest,
    trusted: true,
    startupControlled: true,
    envNames: ['ANTHROPIC_API_KEY'],
    availableEnvNames: ['ANTHROPIC_API_KEY'],
    maxBudgetUsd: 0.1,
    runner,
  };
  assert.equal(
    (await runBehaviorCheck(snapshot, task, { ...options, agent: 'cursor' }))
      .reason,
    'unsupported-agent',
  );
  assert.equal(
    (
      await runBehaviorCheck(snapshot, task, {
        ...options,
        startupControlled: false,
      })
    ).reason,
    'startup-uncontrolled',
  );
  assert.equal(
    (
      await runBehaviorCheck(snapshot, task, {
        ...options,
        availableEnvNames: [],
      })
    ).reason,
    'auth-unavailable',
  );
  assert.equal(calls, 0);
  for (const specification of [
    task,
    {
      kind: 'quiz',
      prompt: 'Answer the five project questions as JSON.',
      questions,
    },
  ]) {
    const unknown = await runBehaviorCheck(snapshot, specification, {
      ...options,
      runner: async () => ({
        exitCode: null,
        reason: 'command-outcome-unknown',
        stdout: '',
        stderr: '',
        timedOut: false,
      }),
    });
    assert.equal(unknown.status, 'unverified');
    assert.equal(unknown.reason, 'command-outcome-unknown');
  }
  const passed = await runBehaviorCheck(snapshot, task, options);
  assert.equal(passed.status, 'passed');
  assert.equal(passed.scope, 'agreed-artifact-assertions');
  assert.equal(
    (
      await runBehaviorCheck(
        snapshot,
        {
          kind: 'quiz',
          prompt: 'Answer the five project questions as JSON.',
          questions,
        },
        options,
      )
    ).score,
    5,
  );
  const failed = await runBehaviorCheck(
    snapshot,
    {
      ...task,
      expectedArtifacts: [{ path: 'missing.txt', contains: 'ready' }],
    },
    options,
  );
  assert.equal(failed.status, 'failed');
  assert.equal(calls, 3);
  await assert.rejects(readFile(path.join(root, 'result.txt')), {
    code: 'ENOENT',
  });
  await assert.rejects(readFile(path.join(snapshot.root, 'result.txt')), {
    code: 'ENOENT',
  });
  await mkdir(path.join(root, '.claude/skills/risky'), { recursive: true });
  await writeFile(
    path.join(root, '.claude/skills/risky/SKILL.md'),
    '---\nname: risky\ncontext: fork\n---\nRun a separate agent.',
  );
  const risky = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(risky));
  assert.equal(
    (await runBehaviorCheck(risky, task, options)).reason,
    'skill-command-execution-required',
  );
  assert.equal(calls, 3);
});
