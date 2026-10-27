import type { TestContext } from 'node:test';
import test from 'node:test';
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
import { fileURLToPath } from 'node:url';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import { runCommand } from '../../scripts/core/execute.ts';
import { hashContent } from '../../scripts/core/contracts.ts';

const cli = fileURLToPath(new URL('../../scripts/tibicen.ts', import.meta.url));
const protectedFiles = {
  'src/application.js': 'export const value = 42;\n',
  'package.json': '{"name":"existing-app","private":true,"type":"module"}\n',
  '.github/workflows/check.yml': 'name: existing-check\n',
};

async function fixture(t: TestContext) {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-adversarial-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'application');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  for (const [relative, content] of Object.entries({
    ...protectedFiles,
    'AGENTS.md': '# Existing project\nKeep the useful project rules.\n',
    '.cursor/rules/old.mdc': 'Outdated duplicate instructions.\n',
  })) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  return { base, root, home };
}

async function preserved(root: string) {
  for (const [relative, content] of Object.entries(protectedFiles))
    assert.equal(
      await readFile(path.join(root, relative), 'utf8'),
      content,
      `Application file changed: ${relative}`,
    );
  assert.ok(
    !(await readdir(root)).includes('.git'),
    'Infrastructure work must not create Git history.',
  );
}

const upgrade = () => ({
  mode: 'improve',
  changes: [
    {
      path: 'AGENTS.md',
      action: 'modify',
      content: '# Improved project\nKeep the useful project rules.\n',
      reason: 'Keep useful rules and clarify the entry point',
    },
    {
      path: '.cursor/rules/old.mdc',
      action: 'delete',
      reason: 'Remove the explicitly approved duplicate',
    },
  ],
});

test('existing application upgrade and approved deletion preserve application and require no Git', async (t) => {
  const { root, home } = await fixture(t);
  const envelope = await createProposal(root, upgrade(), { home });
  assert.equal((await getStatus(root)).status, 'not-configured');
  assert.deepEqual(await readdir(home), []);
  const result = await applyPlan(root, envelope, {
    home,
    approvedDigest: envelope.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.checks.infrastructure.status, 'passed');
  assert.match(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    /^# Improved project/,
  );
  await assert.rejects(readFile(path.join(root, '.cursor/rules/old.mdc')), {
    code: 'ENOENT',
  });
  assert.equal((await getStatus(root)).state, null);
  await preserved(root);
});

test('a concurrent edit before apply stops without changing project or profile', async (t) => {
  const { root, home } = await fixture(t);
  const envelope = await createProposal(root, upgrade(), { home });
  await writeFile(
    path.join(root, 'AGENTS.md'),
    '# Edited by user after review\n',
  );
  await assert.rejects(
    applyPlan(root, envelope, { home, approvedDigest: envelope.digest }),
    { code: 'stale-plan' },
  );
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    '# Edited by user after review\n',
  );
  assert.equal((await getStatus(root)).status, 'not-configured');
  assert.deepEqual(await readdir(home), []);
  assert.equal(
    await readFile(path.join(root, '.cursor/rules/old.mdc'), 'utf8'),
    'Outdated duplicate instructions.\n',
  );
  await preserved(root);
});

test('mid-plan interruption preserves originals and resumes only a newly approved remaining plan', async (t) => {
  const { root, home } = await fixture(t);
  const envelope = await createProposal(root, upgrade(), { home });
  const first = await applyPlan(root, envelope, {
    home,
    approvedDigest: envelope.digest,
    afterChange(change) {
      if (change.path === 'AGENTS.md')
        throw Object.assign(new Error('simulated process interruption'), {
          code: 'interrupted',
        });
    },
  });
  assert.equal(first.status, 'incomplete');
  const interrupted = await getStatus(root);
  assert.equal(
    interrupted.state!.originals['AGENTS.md'],
    '# Existing project\nKeep the useful project rules.\n',
  );
  assert.equal(
    interrupted.state!.originals['.cursor/rules/old.mdc'],
    'Outdated duplicate instructions.\n',
  );
  assert.deepEqual(first.applied, [
    { path: 'AGENTS.md', action: 'modify', evidence: 'written' },
  ]);

  await writeFile(
    path.join(root, '.cursor/rules/old.mdc'),
    'User updated the remaining file.\n',
  );
  const remaining = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: '.cursor/rules/old.mdc',
          action: 'delete',
          reason:
            'User explicitly reviewed removal of the newly edited duplicate',
        },
      ],
    },
    { home },
  );
  await assert.rejects(
    applyPlan(root, remaining, {
      home,
      resume: true,
      approvedDigest: envelope.digest,
    }),
    { code: 'consent-required' },
  );
  assert.equal(
    await readFile(path.join(root, '.cursor/rules/old.mdc'), 'utf8'),
    'User updated the remaining file.\n',
  );
  const resumed = await applyPlan(root, remaining, {
    home,
    resume: true,
    approvedDigest: remaining.digest,
  });
  assert.equal(resumed.status, 'complete');
  assert.equal(resumed.id, first.id);
  assert.equal(resumed.manifest!.sessions.length, 1);
  assert.equal(resumed.manifest!.sessions[0].attempts.length, 2);
  assert.equal((await getStatus(root)).state, null);
  const usage = JSON.parse(
    await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'),
  );
  assert.equal(usage.sessions.length, 1);
  await preserved(root);
});

test('a symlink introduced after the first operation cannot redirect the second write', async (t) => {
  const { base, root, home } = await fixture(t);
  const outside = path.join(base, 'outside');
  await mkdir(outside);
  await writeFile(
    path.join(outside, 'old.mdc'),
    'Outside content must stay unchanged.\n',
  );
  const input = upgrade();
  input.changes[1] = {
    path: '.cursor/rules/old.mdc',
    action: 'modify',
    content: 'New scoped instructions.\n',
    reason: 'Update only the approved project rule',
  };
  const envelope = await createProposal(root, input, { home });
  const result = await applyPlan(root, envelope, {
    home,
    approvedDigest: envelope.digest,
    async afterChange(change) {
      if (change.path !== 'AGENTS.md') return;
      await rm(path.join(root, '.cursor/rules'), { recursive: true });
      await symlink(
        outside,
        path.join(root, '.cursor/rules'),
        process.platform === 'win32' ? 'junction' : 'dir',
      );
    },
  });
  assert.equal(result.status, 'incomplete');
  assert.equal(result.reason, 'unsafe-path');
  assert.equal(
    await readFile(path.join(outside, 'old.mdc'), 'utf8'),
    'Outside content must stay unchanged.\n',
  );
  assert.deepEqual(await readdir(outside), ['old.mdc']);
  assert.deepEqual(result.applied, [
    { path: 'AGENTS.md', action: 'modify', evidence: 'written' },
  ]);
  assert.ok((await getStatus(root)).state);
  await preserved(root);
});

test('direct and wrapped commit commands are rejected before any process or Git data is created', async (t) => {
  const { root } = await fixture(t);
  for (const [executable, argv] of [
    ['git', ['commit', '-m', 'forbidden']],
    ['git', ['-C', root, 'commit', '-m', 'forbidden']],
    ['sh', ['-c', 'git commit -m forbidden']],
    ['env', ['git', 'commit', '-m', 'forbidden']],
  ] as [string, string[]][])
    await assert.rejects(
      runCommand(
        {
          id: 'prohibited',
          kind: 'git-init',
          executable,
          argv,
          cwd: '.',
          envNames: [],
          trusted: true,
        },
        { root, approvedDigest: 'a'.repeat(64) },
      ),
      { code: 'forbidden-command' },
    );
  await preserved(root);
});

test('public CLI handles existing upgrade/delete through stdin without touching the real home', async (t) => {
  const { base, root, home } = await fixture(t);
  const invoke = (args: string[], input?: unknown) => {
    const execution = spawnSync(process.execPath, [cli, ...args], {
      cwd: base,
      input: input === undefined ? undefined : JSON.stringify(input),
      encoding: 'utf8',
      timeout: 15000,
      env: {
        PATH: process.env.PATH,
        HOME: home,
        USERPROFILE: home,
        SystemRoot: process.env.SystemRoot,
      },
    });
    assert.equal(execution.stderr, '');
    assert.ok(
      execution.stdout,
      `CLI did not produce a result: ${execution.error?.message ?? execution.status}`,
    );
    return { code: execution.status, result: JSON.parse(execution.stdout) };
  };
  const envelope = invoke(
    ['proposal', '--root', root, '--input', '-'],
    upgrade(),
  ).result;
  assert.deepEqual(await readdir(home), []);
  assert.equal(
    invoke(['apply', '--root', root, '--plan', '-'], envelope).result.error
      .code,
    'consent-required',
  );
  const applied = invoke(
    ['apply', '--root', root, '--plan', '-', '--approve', envelope.digest],
    envelope,
  );
  assert.equal(applied.code, 0);
  assert.equal(applied.result.status, 'complete');
  assert.deepEqual(invoke(['status', '--root', root]).result.applied, [
    { path: 'AGENTS.md', action: 'modify' },
    { path: '.cursor/rules/old.mdc', action: 'delete' },
  ]);
  assert.ok((await readdir(home)).includes('.tibicen'));
  await preserved(root);
});

test('a real regression discovered on the controlled copy remains in manifest attempt history', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(
    path.join(root, 'check.mjs'),
    "import { readFileSync } from 'node:fs';\nconst rules = readFileSync(new URL('AGENTS.md', import.meta.url), 'utf8');\nconsole.log(rules.includes('new-behavior') ? 'new regression' : 'baseline passed');\nprocess.exitCode = rules.includes('new-behavior') ? 1 : 0;\n",
  );
  const input = {
    mode: 'improve',
    changes: [
      {
        path: 'AGENTS.md',
        content: '# new-behavior\nKeep the useful project rules.\n',
        reason:
          'Exercise a real comparison of original and changed infrastructure',
      },
    ],
    commands: [
      {
        id: 'fixture-test',
        kind: 'test',
        executable: process.execPath,
        argv: ['check.mjs'],
        cwd: '.',
        envNames: [],
        trusted: true,
      },
    ],
    checks: { profile: 'web', environmentReady: true },
  };
  const envelope = await createProposal(root, input, { home });
  const hooks = runtimeHooks(root, envelope.proposal, envelope.digest);
  let result;
  try {
    result = await applyPlan(root, envelope, {
      home,
      approvedDigest: envelope.digest,
      beforeApply: hooks.beforeApply,
      verify: hooks.verify,
    });
  } finally {
    await hooks.cleanup();
  }
  assert.equal(result.checks.verify.status, 'unverified');
  assert.equal(result.checks.verify.reason, 'new-regression');
  assert.ok(result.checks.verify.newRegressions!.length > 0);
  assert.deepEqual(
    result.manifest!.sessions[0].attempts[0].newRegressions,
    result.checks.verify.newRegressions,
    'Known regressions must survive in the permanent attempt history.',
  );
  await preserved(root);
});

test('deleting the sole file of an installed skill removes the obsolete installed record', async (t) => {
  const { root, home } = await fixture(t);
  const skillPath = '.claude/skills/old-helper/SKILL.md';
  const content =
    '---\nname: old-helper\ndescription: An existing project skill.\n---\nUse the existing project rules.\n';
  await mkdir(path.dirname(path.join(root, skillPath)), { recursive: true });
  await writeFile(path.join(root, skillPath), content);
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify({
      schema: 1,
      tibicen: { status: 'complete' },
      sessions: [],
      installed: [
        {
          repo: 'example/old-helper',
          sha: 'a'.repeat(40),
          ref: 'a'.repeat(40),
          license: 'MIT',
          provenance: 'provenance-verified',
          files: [
            {
              path: skillPath,
              sourcePath: 'SKILL.md',
              contentHash: hashContent(content),
            },
          ],
        },
      ],
    }),
  );
  const envelope = await createProposal(
    root,
    {
      mode: 'improve',
      migrateManifest: true,
      changes: [
        {
          path: skillPath,
          action: 'delete',
          reason: 'Remove the explicitly approved obsolete skill',
        },
      ],
    },
    { home },
  );
  const result = await applyPlan(root, envelope, {
    home,
    approvedDigest: envelope.digest,
  });
  assert.equal(result.status, 'complete');
  await assert.rejects(readFile(path.join(root, skillPath)), {
    code: 'ENOENT',
  });
  assert.ok(
    !result.manifest!.installed.some((source) =>
      source.files?.some((file) => file.path === skillPath),
    ),
    'The passport must not claim that a deleted skill is still installed.',
  );
  await preserved(root);
});
