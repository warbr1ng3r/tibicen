import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { hashContent } from '../../scripts/core/contracts.ts';
import {
  prepareClaudeRun,
  prepareCompatCommand,
  prepareCompatProbe,
  evaluateCompatEvidence,
  runCompatProbe,
} from '../../scripts/compat/index.ts';

const content =
  '---\nname: useful\ndescription: A workflow\n---\nRead project conventions before making a change.';
const pair = {
  skill: 'useful',
  ref: 'a'.repeat(40),
  agent: 'claude-code',
  agentVersion: '2.1.283',
  path: '.claude/skills/useful/SKILL.md',
  contentHash: hashContent(content),
};
const options = {
  agentVersion: '2.1.283',
  copyRoot: '/tmp/controlled-copy',
  prompt: 'Read the conventions',
  startupControlled: true,
  envNames: ['ANTHROPIC_API_KEY'],
  availableEnvNames: ['ANTHROPIC_API_KEY'],
  maxBudgetUsd: 0.1,
};

async function copy(t: TestContext, text = content) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-compat-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.claude/skills/useful'), { recursive: true });
  await writeFile(path.join(root, pair.path), text);
  return root;
}

test('Claude command fixes startup and only prepares the common executor shape', () => {
  const result = prepareClaudeRun(options);
  assert.equal(result.status, 'ready');
  assert.equal(result.command.executable, 'claude');
  assert.equal(result.command.cwd, '.');
  assert.ok(result.command.argv.includes('--bare'));
  assert.ok(result.command.argv.includes('--strict-mcp-config'));
  assert.ok(!result.command.argv.includes('--dangerously-skip-permissions'));
  assert.deepEqual(result.command.envNames, ['ANTHROPIC_API_KEY']);
});

test('unknown version, uncontrolled startup and unavailable auth never launch', () => {
  assert.equal(
    prepareClaudeRun({ ...options, agentVersion: '9.0.0' }).reason,
    'unsupported-agent-version',
  );
  assert.equal(
    prepareClaudeRun({ ...options, startupControlled: false }).reason,
    'startup-uncontrolled',
  );
  assert.equal(
    prepareClaudeRun({ ...options, availableEnvNames: [] }).reason,
    'auth-unavailable',
  );
  assert.equal(
    prepareClaudeRun({ ...options, tools: ['Bash'] }).reason,
    'unsupported-task-tools',
  );
});

test('the pure pre-consent factory needs no copy and matches the runtime command', async (t) => {
  const beforeConsent = prepareCompatCommand(pair, options);
  assert.equal(beforeConsent.status, 'ready');
  const copyRoot = await copy(t);
  const runtime = await prepareCompatProbe(pair, { ...options, copyRoot });
  const expected = prepareCompatCommand(pair, { ...options, copyRoot });
  assert.deepEqual(runtime.command, expected.command);
  const normalized = runtime.command!.argv.map((arg) =>
    arg === copyRoot ? options.copyRoot : arg,
  );
  assert.deepEqual(normalized, beforeConsent.command.argv);
});

test('native loading requires observed full instruction result and pinned file hash', async (t) => {
  const copyRoot = await copy(t);
  const probe = await prepareCompatProbe(pair, { ...options, copyRoot });
  assert.equal(probe.status, 'ready');
  const stdout = [
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: 'tool-1',
            name: 'Skill',
            input: { skill: 'useful' },
          },
        ],
      },
    },
    {
      type: 'user',
      message: {
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'tool-1',
            content: 'Base directory:\n' + probe.expected.instructions,
          },
        ],
      },
    },
  ]
    .map((value) => JSON.stringify(value))
    .join('\n');
  const result = evaluateCompatEvidence(probe, { exitCode: 0, stdout });
  assert.equal(result.loading, 'verified');
  assert.equal(result.evidence!.contentHash, pair.contentHash);
  assert.ok(!JSON.stringify(result).includes(probe.expected.instructions));
  await writeFile(path.join(copyRoot, pair.path), 'modified');
  await assert.rejects(prepareCompatProbe(pair, { ...options, copyRoot }), {
    code: 'skill-hash-mismatch',
  });
});

test('metadata and prose claims are never reported as loading evidence', async (t) => {
  const probe = await prepareCompatProbe(pair, {
    ...options,
    copyRoot: await copy(t),
  });
  const listed = evaluateCompatEvidence(probe, {
    exitCode: 0,
    stdout: JSON.stringify({
      type: 'system',
      subtype: 'init',
      skills: ['useful'],
    }),
  });
  assert.equal(listed.loading, 'unverified');
  assert.equal(listed.reason, 'discovered-only');
  const prose = evaluateCompatEvidence(probe, {
    exitCode: 0,
    stdout: JSON.stringify({
      type: 'result',
      result: 'I loaded the skill successfully.',
    }),
  });
  assert.equal(prose.loading, 'unverified');
});

test('failed native tool result is unverified, even with matching text', async (t) => {
  const probe = await prepareCompatProbe(pair, {
    ...options,
    copyRoot: await copy(t),
  });
  const stdout = [
    {
      type: 'assistant',
      message: {
        content: [
          {
            type: 'tool_use',
            id: 'x',
            name: 'Skill',
            input: { skill: 'useful' },
          },
        ],
      },
    },
    {
      type: 'user',
      message: {
        content: [
          {
            type: 'tool_result',
            tool_use_id: 'x',
            is_error: true,
            content: probe.expected!.instructions,
          },
        ],
      },
    },
  ]
    .map((value) => JSON.stringify(value))
    .join('\n');
  assert.equal(
    evaluateCompatEvidence(probe, { exitCode: 0, stdout }).loading,
    'unverified',
  );
});

test('skill preprocessor execution is skipped rather than hidden inside a loader probe', async (t) => {
  const text = '---\nname: useful\n---\n!`git status`';
  const updated = { ...pair, contentHash: hashContent(text) };
  const result = await prepareCompatProbe(updated, {
    ...options,
    copyRoot: await copy(t, text),
  });
  assert.equal(result.reason, 'skill-command-execution-required');
});

test('other agents, disabled probes and absent executor retain honest reasons', async (t) => {
  assert.equal(
    (await prepareCompatProbe({ ...pair, agent: 'codex' }, options)).reason,
    'headless-method-unverified',
  );
  assert.equal(
    (await prepareCompatProbe(pair, { enabled: false })).reason,
    'skipped-by-user',
  );
  assert.equal(
    (await runCompatProbe(pair, { ...options, copyRoot: await copy(t) }))
      .reason,
    'executor-unavailable',
  );
});

test('an unsafe sibling skill cannot be invoked through the native loader', async (t) => {
  const copyRoot = await copy(t);
  await mkdir(path.join(copyRoot, '.claude/skills/unsafe'), {
    recursive: true,
  });
  await writeFile(
    path.join(copyRoot, '.claude/skills/unsafe/SKILL.md'),
    '---\nname: unsafe\ncontext: fork\n---\nRun arbitrary commands.',
  );
  const result = await prepareCompatProbe(pair, { ...options, copyRoot });
  assert.equal(result.reason, 'skill-command-execution-required');
});
