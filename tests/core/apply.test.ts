import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
  mkdir,
  chmod,
  stat,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { digest } from '../../scripts/core/contracts.ts';
import { runCommand } from '../../scripts/core/execute.ts';
import {
  createSnapshot,
  prepareFinalSnapshot,
  cleanupSnapshot,
} from '../../scripts/verify/index.ts';

async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-apply-'));
  const home = await mkdtemp(path.join(os.tmpdir(), 'tibicen-home-'));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  });
  return { root, home };
}
const check = async () => ({
  infrastructure: { kind: 'infrastructure', status: 'passed' },
});
const input = {
  mode: 'init',
  changes: [
    {
      path: 'AGENTS.md',
      content: '# Project\n',
      reason: 'Project entry point',
    },
  ],
};

test('proposal and missing/wrong consent leave project and user profile untouched', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, input, { home });
  assert.deepEqual(await readdir(root), []);
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: 'a'.repeat(64) }),
    { code: 'consent-required' },
  );
  assert.deepEqual(await readdir(root), []);
  assert.deepEqual(await readdir(home), []);
});

test('approved apply preserves the application and keeps resume in one session', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, 'app.js'), 'application');
  const plan = await createProposal(root, input, { home });
  const first = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw Object.assign(new Error('simulated interruption'), {
        code: 'interrupted',
      });
    },
    verify: check,
  });
  assert.equal(first.status, 'incomplete');
  const status = await getStatus(root);
  assert.equal(status.state!.originals['AGENTS.md'], null);
  assert.equal(
    await readFile(path.join(root, 'app.js'), 'utf8'),
    'application',
  );
  await assert.rejects(applyPlan(root, plan, { home, resume: true }), {
    code: 'consent-required',
  });
  const resumed = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    resume: true,
    verify: check,
  });
  assert.equal(resumed.status, 'complete');
  assert.equal(resumed.id, first.id);
  assert.equal((await getStatus(root)).state, null);
  const usage = JSON.parse(
    await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'),
  );
  assert.equal(usage.sessions.length, 1);
});

test('stale hashes, application edits and symlink writes fail before state creation', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, 'app.js'), 'application');
  await assert.rejects(
    createProposal(
      root,
      {
        mode: 'improve',
        changes: [{ path: 'app.js', content: 'changed', reason: 'no' }],
      },
      { home },
    ),
    { code: 'application-protected' },
  );
  await writeFile(path.join(root, 'AGENTS.md'), 'old');
  const plan = await createProposal(root, input, { home });
  await writeFile(path.join(root, 'AGENTS.md'), 'user edit');
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-plan' },
  );
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'user edit',
  );
});

test('original bytes survive a partial failure, and untrusted edits block resume', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, 'AGENTS.md'), 'original');
  const plan = await createProposal(root, input, { home });
  await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('stop');
    },
    verify: check,
  });
  assert.equal(
    (await getStatus(root)).state!.originals['AGENTS.md'],
    'original',
  );
  await writeFile(path.join(root, 'AGENTS.md'), 'concurrent user edit');
  await assert.rejects(
    applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      resume: true,
      verify: check,
    }),
    { code: 'tamper-suspect' },
  );
});

test('an executable update preserves its mode in the plan, copy and actual file', async (t) => {
  const { root, home } = await fixture(t);
  const target = '.agents/skills/demo/run.sh';
  await mkdir(path.dirname(path.join(root, target)), { recursive: true });
  await writeFile(path.join(root, target), '#!/bin/sh\nexit 0\n');
  await chmod(path.join(root, target), 0o755);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: target,
          content: '#!/bin/sh\n# Updated\nexit 0\n',
          reason: 'Update the helper.',
        },
      ],
    },
    { home },
  );
  assert.equal(plan.proposal.changes[0].beforeMode, 0o755);
  assert.equal(plan.proposal.changes[0].fileMode, 0o755);
  const baseline = await createSnapshot(root, { approvedDigest: plan.digest });
  const final = await prepareFinalSnapshot(baseline, plan.proposal.changes, {
    approvedDigest: plan.digest,
  });
  try {
    assert.equal(
      (await stat(path.join(final.root, target))).mode & 0o777,
      0o755,
    );
  } finally {
    await cleanupSnapshot(final);
    await cleanupSnapshot(baseline);
  }
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'complete',
  );
  assert.equal((await stat(path.join(root, target))).mode & 0o777, 0o755);
  assert.equal(
    (await stat(path.join(root, '.tibicen/manifest.yml'))).mode & 0o777,
    0o600,
  );
  assert.equal(
    (
      await runCommand(
        {
          id: 'helper',
          kind: 'test',
          executable: path.join(root, target),
          argv: [],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
        { root, approvedDigest: plan.digest },
      )
    ).exitCode,
    0,
  );
});

test('permission-only changes survive planning, digest binding and interrupted recovery', async (t) => {
  const { root, home } = await fixture(t);
  const target = 'AGENTS.md';
  await writeFile(path.join(root, target), '# Existing\n');
  await chmod(path.join(root, target), 0o644);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: target,
          content: '# Existing\n',
          fileMode: 0o755,
          reason: 'Show a permission-only change.',
        },
      ],
    },
    { home },
  );
  assert.equal(plan.proposal.changes.length, 1);
  const other = structuredClone(plan.proposal);
  other.changes[0].fileMode = 0o700;
  assert.notEqual(digest(other), plan.digest);
  const first = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Stop after the mode change.');
    },
  });
  assert.equal(first.status, 'incomplete');
  assert.equal(
    (await getStatus(root)).recovery!.files[0].state,
    'matches-approved-result',
  );
  await chmod(path.join(root, target), 0o644);
  assert.equal((await getStatus(root)).recovery!.files[0].state, 'pending');
  assert.equal(
    (
      await applyPlan(root, plan, {
        home,
        approvedDigest: plan.digest,
        resume: true,
      })
    ).status,
    'complete',
  );
  assert.equal((await stat(path.join(root, target))).mode & 0o777, 0o755);
});

test('unsupported modes and a concurrent chmod fail before writes; legacy plans retain ordinary permissions', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, 'AGENTS.md'), '# Old\n');
  await chmod(path.join(root, 'AGENTS.md'), 0o755);
  for (const fileMode of [-1, 0o4755, 1.5])
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [
            {
              path: 'AGENTS.md',
              content: '# New\n',
              fileMode,
              reason: 'Invalid permissions.',
            },
          ],
        },
        { home },
      ),
      { code: 'invalid-file-mode' },
    );
  const plan = await createProposal(root, input, { home });
  await chmod(path.join(root, 'AGENTS.md'), 0o700);
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-plan' },
  );
  assert.deepEqual(await readdir(home), []);
  await chmod(path.join(root, 'AGENTS.md'), 0o755);
  delete plan.proposal.changes[0].fileMode;
  delete plan.proposal.changes[0].beforeMode;
  plan.digest = digest(plan.proposal);
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'complete',
  );
  assert.equal((await stat(path.join(root, 'AGENTS.md'))).mode & 0o777, 0o755);
});

test('a permission change immediately before deletion preserves the changed file', async (t) => {
  const { root, home } = await fixture(t);
  const target = path.join(root, 'AGENTS.md');
  await writeFile(target, '# Owner rules\n');
  await chmod(target, 0o644);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          action: 'delete',
          reason: 'Remove the approved obsolete entrypoint.',
        },
      ],
    },
    { home },
  );
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    async checkpoint(point) {
      if (point === 'before-file-write') await chmod(target, 0o755);
    },
  });
  assert.equal(result.status, 'incomplete');
  assert.equal(result.reason, 'stale-plan');
  assert.equal(await readFile(target, 'utf8'), '# Owner rules\n');
  assert.equal((await stat(target)).mode & 0o777, 0o755);
});

test('an input below eight MiB cannot begin writing an unreadable combined state', async (t) => {
  const { root, home } = await fixture(t);
  const original = 'old line\n'.repeat(200000);
  await writeFile(path.join(root, 'AGENTS.md'), original);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: 'new line\n'.repeat(200000),
          reason: 'Large but individually supported text.',
        },
      ],
    },
    { home },
  );
  assert(Buffer.byteLength(JSON.stringify(plan)) < 8 * 1024 * 1024);
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'invalid-data' },
  );
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), original);
  await assert.rejects(readdir(path.join(root, '.tibicen')), {
    code: 'ENOENT',
  });
  assert.deepEqual(await readdir(home), []);
});
