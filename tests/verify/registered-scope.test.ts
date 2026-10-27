import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  chmod,
  mkdtemp,
  mkdir,
  readFile,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import type {
  ApplyOptions,
  CheckResult,
  Proposal,
} from '../../scripts/core/types.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import { hashContent } from '../../scripts/core/contracts.ts';
import { main } from '../../scripts/tibicen.ts';

const skillPath = '.agents/skills/example/SKILL.md';
const skill = '# Example workflow\nRead the project first.\n';

async function execute(
  root: string,
  home: string,
  envelope: { proposal: Proposal; digest: string },
  options: Pick<ApplyOptions, 'checkpoint' | 'resume'> = {},
) {
  const hooks = runtimeHooks(root, envelope.proposal, envelope.digest);
  try {
    return await applyPlan(root, envelope, {
      ...options,
      home,
      approvedDigest: envelope.digest,
      beforeApply: hooks.beforeApply,
      verify: hooks.verify,
    });
  } finally {
    await hooks.cleanup();
  }
}

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-recorded-scope-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  const initial = await createProposal(
    root,
    {
      mode: 'init',
      changes: [
        { path: 'AGENTS.md', content: '# Project rules\n', reason: 'Rules' },
        { path: skillPath, content: skill, reason: 'Skill' },
      ],
    },
    { home },
  );
  await execute(root, home, initial);
  return { root, home, passport: path.join(root, '.tibicen/manifest.yml') };
}

function missingSkill(result: CheckResult) {
  assert.equal(result.status, 'issues-found');
  assert.ok(
    result.issues?.some(
      (issue) => issue.path === skillPath && issue.reason === 'missing-file',
    ),
  );
}

test('standalone verify reports a missing previously applied skill without writing', async (t) => {
  const { root, passport } = await fixture(t);
  const before = await readFile(passport, 'utf8');
  await rm(path.join(root, skillPath));
  missingSkill((await main(['verify', '--root', root])) as CheckResult);
  assert.equal(await readFile(passport, 'utf8'), before);
  await assert.rejects(readFile(path.join(root, skillPath)), {
    code: 'ENOENT',
  });
});

async function registerSource(passport: string) {
  const manifest = JSON.parse(await readFile(passport, 'utf8'));
  manifest.changes = [];
  for (const session of manifest.sessions) session.changes = [];
  manifest.installed = [
    {
      repo: 'owner/example',
      sha: 'a'.repeat(40),
      license: 'MIT',
      skillPath: 'SKILL.md',
      files: [
        {
          path: skillPath,
          sourcePath: 'SKILL.md',
          contentHash: hashContent(skill),
          installedHash: hashContent(skill),
          installedMode:
            (
              await stat(
                path.join(path.dirname(path.dirname(passport)), skillPath),
              )
            ).mode & 0o777,
        },
      ],
    },
  ];
  await writeFile(passport, JSON.stringify(manifest));
}

test('local component edits stay visible after a no-change session records actual installed bytes', async (t) => {
  const { root, home, passport } = await fixture(t);
  await registerSource(passport);
  const edited = skill + 'A local restriction.\n';
  await writeFile(path.join(root, skillPath), edited);
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(plan.proposal.components.files[0].resolution, 'drift');
  assert.equal((await execute(root, home, plan)).status, 'incomplete');
  const checked = (await main(['verify', '--root', root])) as CheckResult;
  assert.ok(
    checked.issues?.some(
      (issue) =>
        issue.path === skillPath && issue.reason === 'content-mismatch',
    ),
  );
  assert.equal(await readFile(path.join(root, skillPath), 'utf8'), edited);
});

test('local permission changes remain issues after a no-change session', async (t) => {
  const { root, home, passport } = await fixture(t);
  await registerSource(passport);
  await chmod(path.join(root, skillPath), 0o755);
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(plan.proposal.components.files[0].resolution, 'drift');
  assert.equal((await execute(root, home, plan)).status, 'incomplete');
  const checked = (await main(['verify', '--root', root])) as CheckResult;
  assert.ok(
    checked.issues?.some(
      (issue) =>
        issue.path === skillPath && issue.reason === 'permission-mismatch',
    ),
  );
  assert.equal((await stat(path.join(root, skillPath))).mode & 0o777, 0o755);
});

test('direct apply uses the same recorded scope without runtime hooks', async (t) => {
  const { root, home, passport } = await fixture(t);
  await registerSource(passport);
  await rm(path.join(root, skillPath));
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  missingSkill(result.checks.infrastructure!);
  assert.equal(result.status, 'incomplete');
});

test('latest approved changes supersede prior additions, modifications and deletions', async (t) => {
  const { root, home } = await fixture(t);
  for (const change of [
    {
      path: skillPath,
      content: skill + 'Approved revision.\n',
      reason: 'Revise',
    },
    { path: skillPath, action: 'delete', reason: 'Remove optional skill' },
    {
      path: skillPath,
      content: skill + 'New installation.\n',
      reason: 'Add again',
    },
  ]) {
    const plan = await createProposal(
      root,
      { mode: 'improve', changes: [change] },
      { home },
    );
    assert.equal((await execute(root, home, plan)).status, 'complete');
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
  }
});

test('a local entrypoint edit is reported until its new content is explicitly approved', async (t) => {
  const { root, home } = await fixture(t);
  const edited = '# Project rules\nKeep local decisions.\n';
  await writeFile(path.join(root, 'AGENTS.md'), edited);
  const checked = (await main(['verify', '--root', root])) as CheckResult;
  assert.ok(
    checked.issues?.some(
      (issue) =>
        issue.path === 'AGENTS.md' && issue.reason === 'content-mismatch',
    ),
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: edited + 'Approved rule.\n',
          reason: 'Approve exact new instructions',
        },
      ],
    },
    { home },
  );
  assert.equal((await execute(root, home, plan)).status, 'complete');
  assert.equal(
    ((await main(['verify', '--root', root])) as CheckResult).status,
    'passed',
  );
});

test('an unregistered project still checks observed infrastructure without inventing a passport', async (t) => {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-unregistered-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(path.join(root, 'AGENTS.md'), '# Existing rules\n');
  assert.equal(
    ((await main(['verify', '--root', root])) as CheckResult).status,
    'passed',
  );
  await assert.rejects(readFile(path.join(root, '.tibicen/manifest.yml')), {
    code: 'ENOENT',
  });
});

for (const point of ['before-file-write', 'after-file-write'] as const) {
  test(`verify distinguishes pending and observed writes at ${point}, then resumes`, async (t) => {
    const { root, home } = await fixture(t);
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: skillPath,
            content: skill + 'Approved update.\n',
            reason: 'Update',
          },
        ],
      },
      { home },
    );
    let interrupted = false;
    const result = await execute(root, home, plan, {
      checkpoint(current) {
        if (current === point && !interrupted) {
          interrupted = true;
          throw new Error('Simulated interruption');
        }
      },
    });
    assert.equal(result.status, 'incomplete');
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
    assert.equal(
      await readFile(path.join(root, skillPath), 'utf8'),
      point === 'before-file-write' ? skill : skill + 'Approved update.\n',
    );
    assert.equal(
      (await execute(root, home, plan, { resume: true })).status,
      'complete',
    );
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
  });
}

test('a no-change improvement cannot forget a missing installed resource, even on another resume', async (t) => {
  const { root, home, passport } = await fixture(t);
  await registerSource(passport);
  await rm(path.join(root, skillPath));
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(plan.proposal.components.files[0].resolution, 'missing');
  const result = await execute(root, home, plan);
  missingSkill(result.checks.infrastructure!);
  assert.equal(result.status, 'incomplete');
  missingSkill((await main(['verify', '--root', root])) as CheckResult);
  const saved = JSON.parse(await readFile(passport, 'utf8'));
  assert.equal(
    saved.installed.length,
    0,
    'Absent files are not called installed',
  );
  assert.equal(
    saved.sessions.at(-1).components[0].previous.installedHash,
    hashContent(skill),
  );
  const again = await createProposal(root, { mode: 'improve' }, { home });
  missingSkill(
    (await execute(root, home, again, { resume: true })).checks.infrastructure!,
  );
  await assert.rejects(readFile(path.join(root, skillPath)), {
    code: 'ENOENT',
  });
});

for (const point of ['before-file-write', 'after-file-write'] as const)
  test(`permission-only recovery keeps observed scope at ${point}`, async (t) => {
    const { root, home, passport } = await fixture(t);
    await registerSource(passport);
    const beforeMode = (await stat(path.join(root, skillPath))).mode & 0o777;
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: skillPath,
            content: skill,
            fileMode: 0o755,
            reason: 'Approve executable permission',
          },
        ],
      },
      { home },
    );
    const result = await execute(root, home, plan, {
      checkpoint(current) {
        if (current === point)
          throw new Error('Interrupted permission-only write');
      },
    });
    assert.equal(result.status, 'incomplete');
    assert.equal(
      (await stat(path.join(root, skillPath))).mode & 0o777,
      point === 'before-file-write' ? beforeMode : 0o755,
    );
    assert.equal(
      (await getStatus(root)).recovery!.files.find(
        (file) => file.path === skillPath,
      )!.state,
      point === 'before-file-write' ? 'pending' : 'matches-approved-result',
    );
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
    assert.equal(
      (await execute(root, home, plan, { resume: true })).status,
      'complete',
    );
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
  });

for (const component of [false, true])
  test(`resumed history preserves the last repeated operation for ${component ? 'owned component' : 'entrypoint'}`, async (t) => {
    const { root, home, passport } = await fixture(t);
    if (component) await registerSource(passport);
    const relative = component ? skillPath : 'AGENTS.md';
    const original = await readFile(path.join(root, relative), 'utf8');
    const changed = original + 'Approved owner rule.\n';
    for (const [index, content] of [changed, original, changed].entries()) {
      const plan = await createProposal(
        root,
        {
          mode: 'improve',
          changes: [{ path: relative, content, reason: 'Reviewed revision' }],
        },
        { home },
      );
      const result = await execute(root, home, plan, {
        resume: index > 0,
        checkpoint(point) {
          if (index < 2 && point === 'before-state-cleanup')
            throw new Error('Interrupted cleanup');
        },
      });
      assert.equal(result.status, index < 2 ? 'incomplete' : 'complete');
    }
    const empty = await createProposal(root, { mode: 'improve' }, { home });
    assert.equal((await execute(root, home, empty)).status, 'complete');
    const verified = (await main(['verify', '--root', root])) as CheckResult;
    assert.equal(verified.status, 'passed', JSON.stringify(verified.issues));
    assert.equal(await readFile(path.join(root, relative), 'utf8'), changed);
  });

test('an older same-hash receipt cannot complete a new permission change', async (t) => {
  const { root, home, passport } = await fixture(t);
  await registerSource(passport);
  const first = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: skillPath,
          content: skill,
          fileMode: 0o755,
          reason: 'First permission',
        },
      ],
    },
    { home },
  );
  assert.equal(
    (
      await execute(root, home, first, {
        checkpoint(point) {
          if (point === 'before-state-cleanup')
            throw new Error('Interrupted cleanup');
        },
      })
    ).status,
    'incomplete',
  );
  const next = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: skillPath,
          content: skill,
          fileMode: 0o644,
          reason: 'Next permission',
        },
      ],
    },
    { home },
  );
  assert.equal(
    (
      await execute(root, home, next, {
        resume: true,
        checkpoint(point) {
          if (point === 'before-file-write') throw new Error('Still pending');
        },
      })
    ).status,
    'incomplete',
  );
  assert.equal((await stat(path.join(root, skillPath))).mode & 0o777, 0o755);
  assert.equal(
    ((await main(['verify', '--root', root])) as CheckResult).status,
    'passed',
  );
  assert.equal(
    (await execute(root, home, next, { resume: true })).status,
    'complete',
  );
  assert.equal((await stat(path.join(root, skillPath))).mode & 0o777, 0o644);
  assert.equal(
    ((await main(['verify', '--root', root])) as CheckResult).status,
    'passed',
  );
});

for (const component of [false, true])
  test(`explicit approval accepts current owner content for ${component ? 'owned component' : 'entrypoint'}`, async (t) => {
    const { root, home, passport } = await fixture(t);
    if (component) await registerSource(passport);
    const relative = component ? skillPath : 'AGENTS.md';
    const changed =
      (await readFile(path.join(root, relative), 'utf8')) +
      'A useful local rule.\n';
    await writeFile(path.join(root, relative), changed);
    const request = {
      mode: 'improve',
      changes: [
        {
          path: relative,
          content: changed,
          reason: 'Accept exact current owner rules',
        },
      ],
    };
    const plan = await createProposal(root, request, { home });
    assert.equal(
      plan.proposal.changes.length,
      1,
      'Explicit owner acceptance must be shown before consent',
    );
    assert.equal((await execute(root, home, plan)).status, 'complete');
    assert.equal(
      ((await main(['verify', '--root', root])) as CheckResult).status,
      'passed',
    );
    assert.equal(await readFile(path.join(root, relative), 'utf8'), changed);
    const clean = await createProposal(root, request, { home });
    assert.deepEqual(
      clean.proposal.changes,
      [],
      'Already accepted content remains a clean no-op',
    );
    const stale = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: relative,
            content: changed + 'Next rule.\n',
            reason: 'Next proposal',
          },
        ],
      },
      { home },
    );
    await writeFile(path.join(root, relative), changed + 'Concurrent edit.\n');
    await assert.rejects(execute(root, home, stale), { code: 'stale-plan' });
  });
