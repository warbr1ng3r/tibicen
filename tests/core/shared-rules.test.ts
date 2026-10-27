import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { hashContent, digest } from '../../scripts/core/contracts.ts';
import { verifyInfrastructure } from '../../scripts/verify/index.ts';
import { resolveSharedRules } from '../../scripts/core/shared-rules.ts';
import type { SharedRuleInput } from '../../scripts/core/types.ts';

const targets = [
  { agent: 'codex', agentVersion: '0.157.0', path: 'AGENTS.md' },
  { agent: 'claude-code', agentVersion: '2.1.283', path: 'CLAUDE.md' },
];
const rules =
  '# Shared project rules\nKeep application behavior.\n\n## Process\nRead the task, propose a change, implement, verify.\n';
const owner = '# Owner rules\r\nKeep local decisions.  \r\n';
const group = (content = rules): SharedRuleInput => ({
  id: 'project-process',
  content,
  targets,
  reason: 'Use one agreed project process in both tools.',
});
const input = (content = rules) => ({
  mode: 'improve',
  sharedRules: [group(content)],
});

async function fixture(t: TestContext) {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-shared-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home');
  await Promise.all([mkdir(root), mkdir(home)]);
  await writeFile(path.join(root, 'AGENTS.md'), owner);
  await writeFile(
    path.join(root, 'CLAUDE.md'),
    '# Owner Claude\nKeep the existing restrictions.\n',
  );
  await writeFile(path.join(root, 'app.ts'), 'Unchanged application.\n');
  return { base, root, home };
}

test('shared proposal links both native entrypoints, preserves owner bytes and requires exact consent', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, input(), { home });
  assert.equal(plan.proposal.sharedRules[0].revision, hashContent(rules));
  assert.deepEqual(
    plan.summary.files.map((file) => file.path),
    ['AGENTS.md', 'CLAUDE.md'],
  );
  assert.equal(plan.summary.sharedRules.status, 'passed');
  assert.deepEqual(plan.proposal.commands, []);
  assert(plan.proposal.changes[0].content!.startsWith(owner));
  assert(plan.proposal.changes[0].diff!.includes('+<!-- tibicen:begin v1 -->'));
  assert.deepEqual(await readdir(root), ['AGENTS.md', 'CLAUDE.md', 'app.ts']);
  assert.deepEqual(await readdir(home), []);
  await assert.rejects(applyPlan(root, plan, { home }), {
    code: 'consent-required',
  });
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), owner);
  const applied = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  assert.equal(applied.status, 'complete');
  assert.deepEqual(applied.manifest!.sharedRules, plan.proposal.sharedRules);
  assert.equal(applied.checks.infrastructure.sharedRules!.copies.length, 2);
  assert(
    applied.checks.infrastructure.sharedRules!.copies.every(
      (copy) => copy.status === 'current',
    ),
  );
  assert(
    (await readFile(path.join(root, 'AGENTS.md'), 'utf8')).includes(
      rules.replaceAll('\n', '\r\n'),
    ),
  );
  assert(
    (await readFile(path.join(root, 'CLAUDE.md'), 'utf8')).includes(rules),
  );
  assert.equal(
    await readFile(path.join(root, 'app.ts'), 'utf8'),
    'Unchanged application.\n',
  );
});

test('updating common rules inherits both targets, detects a restored old copy and retains revisions', async (t) => {
  const { root, home } = await fixture(t);
  const first = await createProposal(root, input(), { home });
  await applyPlan(root, first, { home, approvedDigest: first.digest });
  const oldClaude = await readFile(path.join(root, 'CLAUDE.md'), 'utf8');
  const nextContent = rules + 'Require a focused review before handoff.\n';
  const nextInput = {
    mode: 'improve',
    sharedRules: [
      {
        id: group().id,
        content: nextContent,
        reason: 'Update the common process.',
      },
    ],
  };
  const next = await createProposal(root, nextInput, { home });
  assert.deepEqual(next.proposal.sharedRules[0].targets, targets);
  assert.equal(next.proposal.changes.length, 2);
  const applied = await applyPlan(root, next, {
    home,
    approvedDigest: next.digest,
  });
  assert.equal(applied.status, 'complete');
  assert.equal(
    applied.manifest!.sessions[0].sharedRules![0].revision,
    first.proposal.sharedRules[0].revision,
  );
  assert.equal(
    applied.manifest!.sessions[1].sharedRules![0].revision,
    next.proposal.sharedRules[0].revision,
  );
  assert.deepEqual(
    (await createProposal(root, nextInput, { home })).proposal.changes,
    [],
  );
  await writeFile(path.join(root, 'CLAUDE.md'), oldClaude);
  const snapshot = await readFile(
    path.join(root, '.tibicen/manifest.yml'),
    'utf8',
  );
  const checked = await verifyInfrastructure(root);
  assert.equal(checked.status, 'issues-found');
  assert.deepEqual(checked.issues, [
    {
      path: 'CLAUDE.md',
      agent: 'claude-code',
      reason: 'shared-rule-copy-outdated',
    },
  ]);
  const proposal = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(proposal.summary.sharedRules.status, 'issues-found');
  assert.equal(
    proposal.summary.sharedRules.copies[1].actualRevision,
    first.proposal.sharedRules[0].revision,
  );
  assert.deepEqual(
    proposal.proposal.changes,
    [],
    'Inspection never silently repairs a copy.',
  );
  assert.equal(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    snapshot,
  );
  assert.equal(await readFile(path.join(root, 'CLAUDE.md'), 'utf8'), oldClaude);
});

test('owner edits and equivalent line endings do not change the common revision', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, input(), { home });
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  const filename = path.join(root, 'CLAUDE.md');
  const content = await readFile(filename, 'utf8');
  await writeFile(
    filename,
    ('# Another owner decision\n' + content).replaceAll('\n', '\r\n'),
  );
  assert.equal((await verifyInfrastructure(root)).status, 'passed');
  const equivalent = await createProposal(
    root,
    input(rules.replaceAll('\n', '\r\n')),
    { home },
  );
  assert.equal(
    equivalent.proposal.sharedRules[0].revision,
    plan.proposal.sharedRules[0].revision,
  );
  assert.deepEqual(equivalent.proposal.changes, []);
});

for (const [name, mutate, code] of [
  [
    'unknown agent',
    (rule: SharedRuleInput) => {
      rule.targets![0].agent = 'other';
    },
    'unsupported-agent',
  ],
  [
    'unverified version',
    (rule: SharedRuleInput) => {
      rule.targets![0].agentVersion = 'newer';
    },
    'unsupported-agent-version',
  ],
  [
    'foreign entrypoint',
    (rule: SharedRuleInput) => {
      rule.targets![0].path = 'app.ts';
    },
    'unsupported-shared-rule-path',
  ],
  [
    'unverified Cursor adapter',
    (rule: SharedRuleInput) => {
      rule.targets![0] = {
        agent: 'cursor',
        agentVersion: '1.0',
        path: 'AGENTS.md',
      };
    },
    'unsupported-agent-version',
  ],
] as const) {
  test(`${name} refuses a shared plan without writes`, async (t) => {
    const { root, home } = await fixture(t);
    const rule = structuredClone(group());
    mutate(rule);
    await assert.rejects(
      createProposal(root, { mode: 'improve', sharedRules: [rule] }, { home }),
      { code },
    );
    assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), owner);
    assert.deepEqual(await readdir(home), []);
    assert(!(await readdir(root)).includes('.tibicen'));
  });
}

test('malformed metadata, multiple block owners and competing file edits fail before writes', async (t) => {
  const { root, home } = await fixture(t);
  for (const bad of [
    null,
    {},
    { ...group(), targets: null },
    { ...group(), targets: [targets[0]] },
    { ...group(), targets: [null, targets[1]] },
    { ...group(), surprise: true },
  ]) {
    await assert.rejects(
      createProposal(root, { mode: 'improve', sharedRules: [bad] }, { home }),
      { code: 'invalid-shared-rules' },
    );
  }
  await assert.rejects(
    createProposal(
      root,
      { mode: 'improve', sharedRules: [group(), { ...group(), id: 'other' }] },
      { home },
    ),
    { code: 'shared-rule-path-conflict' },
  );
  await assert.rejects(
    createProposal(
      root,
      {
        ...input(),
        changes: [
          {
            path: 'AGENTS.md',
            content: 'Competing replacement',
            reason: 'Conflict',
          },
        ],
      },
      { home },
    ),
    { code: 'shared-rule-path-conflict' },
  );
  await assert.rejects(
    createProposal(root, input('api_key = "a-secret-value"'), { home }),
    { code: 'secret-content' },
  );
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), owner);
  assert.deepEqual(await readdir(home), []);
});

test('an approved raw plan cannot forge a revision or silently drop registered copies', async (t) => {
  const { root, home } = await fixture(t);
  const first = await createProposal(root, input(), { home });
  await applyPlan(root, first, { home, approvedDigest: first.digest });
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  for (const sharedRules of [
    [],
    [{ ...plan.proposal.sharedRules[0], revision: 'a'.repeat(64) }],
  ]) {
    const forged = { ...plan.proposal, sharedRules };
    await assert.rejects(
      applyPlan(root, forged, { home, approvedDigest: digest(forged) }),
      { code: 'invalid-shared-rules' },
    );
  }
  const registry = resolveSharedRules([group()]);
  assert.throws(
    () => resolveSharedRules([{ ...group(), targets: [targets[0]] }], registry),
    { code: 'invalid-shared-rules' },
  );
  assert.equal((await getStatus(root)).state, null);
});

test('missing or malformed copies fail verification independently of file hash equality', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, input(), { home });
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  const filename = path.join(root, 'CLAUDE.md');
  await rm(filename);
  assert(
    (await verifyInfrastructure(root)).issues!.some(
      (issue) => issue.reason === 'shared-rule-copy-missing',
    ),
  );
  const damaged = '<!-- tibicen:begin v1 -->\nUnclosed\n';
  await writeFile(filename, damaged);
  const checked = await verifyInfrastructure(root, {
    expectedFiles: [{ path: 'CLAUDE.md', hash: hashContent(damaged) }],
  });
  assert.equal(checked.status, 'issues-found');
  assert(
    checked.issues!.some((issue) => issue.reason === 'invalid-managed-block'),
  );
  assert(!checked.issues!.some((issue) => issue.reason === 'content-mismatch'));
});

test('a custom verifier cannot hide an outdated copy after an interrupted update', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, input(), { home });
  const failed = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange: async (change) => {
      if (change.path === 'CLAUDE.md')
        await writeFile(
          path.join(root, 'CLAUDE.md'),
          '# Owner Claude\nKeep the existing restrictions.\n',
        );
    },
    verify: async () => ({
      infrastructure: { kind: 'infrastructure', status: 'passed' },
    }),
  });
  assert.equal(failed.status, 'incomplete');
  assert(
    failed.checks.infrastructure.issues!.some(
      (issue) => issue.path === 'CLAUDE.md',
    ),
  );
  const resumed = await applyPlan(root, plan, {
    home,
    resume: true,
    approvedDigest: plan.digest,
  });
  assert.equal(resumed.status, 'complete');
  assert.equal(resumed.id, failed.id);
});

test('a hard exit retains the shared revision for a newly approved remaining plan', async (t) => {
  const { root, home, base } = await fixture(t);
  const plan = await createProposal(root, input(), { home });
  const runner = path.join(base, 'interrupt.mjs');
  await writeFile(
    runner,
    `import { applyPlan } from ${JSON.stringify(new URL('../../scripts/core/apply.ts', import.meta.url).href)};
let input = ''; for await (const chunk of process.stdin) input += chunk;
const plan = JSON.parse(input);
await applyPlan(process.argv[2], plan, { home: process.argv[3], approvedDigest: plan.digest, checkpoint(point) { if (point === 'after-file-write') process.exit(73); } });`,
  );
  const exited = spawnSync(process.execPath, [runner, root, home], {
    input: JSON.stringify(plan),
    encoding: 'utf8',
    timeout: 15000,
  });
  assert.equal(exited.status, 73, exited.stderr);
  const originalSession = (await getStatus(root)).state!;
  assert.deepEqual(originalSession.applied, []);
  const inspected = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(
    inspected.proposal.sharedRules[0].revision,
    plan.proposal.sharedRules[0].revision,
  );
  assert.equal(
    inspected.summary.sharedRules.copies[1].reason,
    'shared-rule-copy-missing',
  );
  const remaining = await createProposal(
    root,
    {
      mode: 'improve',
      sharedRules: [
        {
          id: group().id,
          content: rules,
          reason: 'Finish both linked copies.',
        },
      ],
    },
    { home },
  );
  assert.deepEqual(
    remaining.proposal.changes.map((change) => change.path),
    ['CLAUDE.md'],
  );
  const final = await applyPlan(root, remaining, {
    home,
    resume: true,
    approvedDigest: remaining.digest,
  });
  assert.equal(final.status, 'complete');
  assert.equal(final.id, originalSession.id);
  assert.equal((await verifyInfrastructure(root)).status, 'passed');
  assert(
    final.manifest!.sessions[0].sharedRules!.some(
      (rule) => rule.revision === plan.proposal.sharedRules[0].revision,
    ),
  );
});

test('forbidden or symlinked entrypoints cannot be read or replaced by shared updates', async (t) => {
  const { root, home, base } = await fixture(t);
  await assert.rejects(
    createProposal(
      root,
      { ...input(), forbiddenPaths: ['CLAUDE.md'] },
      { home },
    ),
    { code: 'forbidden-path' },
  );
  const foreign = path.join(base, 'foreign.md');
  await writeFile(foreign, 'Foreign instructions');
  await rm(path.join(root, 'CLAUDE.md'));
  await symlink(foreign, path.join(root, 'CLAUDE.md'));
  await assert.rejects(createProposal(root, input(), { home }), {
    code: 'unsafe-path',
  });
  assert.equal(await readFile(foreign, 'utf8'), 'Foreign instructions');
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), owner);
});
