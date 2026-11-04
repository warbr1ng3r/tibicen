import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  realpath,
  rm,
  symlink,
  lstat,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import {
  digest,
  validateProposal,
  validatePreset,
} from '../../scripts/core/contracts.ts';
import {
  MEMORY_PATHS,
  referencesMemory,
  memoryAllows,
} from '../../scripts/core/memory.ts';
import { scanProject } from '../../scripts/scan/index.ts';
import { verifyInfrastructure } from '../../scripts/verify/index.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';

async function fixture(t: TestContext, files: Record<string, string> = {}) {
  const base = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-memory-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  for (const [relative, content] of Object.entries({
    'app.js': 'application\n',
    ...files,
  })) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  return { root, home };
}

function setup(memoryPath = '.agents/memory.md') {
  return {
    mode: 'improve',
    memory: { path: memoryPath },
    changes: [
      {
        path: 'AGENTS.md',
        content: `# Instructions\nRead relevant decisions in \`${memoryPath}\` before work; retain accepted corrections.\n`,
        reason: 'Connect project memory.',
      },
      {
        path: memoryPath,
        content: '# Decisions\n- Keep the application intact.\n',
        reason: 'Retain the accepted constraint.',
      },
    ],
  };
}

function cli(root: string, command: string) {
  const result = spawnSync(
    process.execPath,
    [path.resolve('scripts/tibicen.ts'), command, '--root', root],
    { encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(result.stderr, '');
  return { exitCode: result.status, result: JSON.parse(result.stdout) };
}

async function fileState(root: string) {
  return Promise.all(
    (await readdir(root, { recursive: true })).sort().map(async (relative) => {
      const filename = path.join(root, relative);
      const stat = await lstat(filename);
      return {
        path: relative,
        mode: stat.mode & 0o777,
        ...(stat.isFile() ? { content: await readFile(filename) } : {}),
      };
    }),
  );
}

test('init in an empty directory approves memory without inventing an application', async (t) => {
  const { root, home } = await fixture(t);
  await rm(path.join(root, 'app.js'));
  const plan = await createProposal(
    root,
    { ...setup(), mode: 'init' },
    { home },
  );
  assert.equal(plan.proposal.emptyProject, true);
  assert.deepEqual(await readdir(root), []);
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'complete',
  );
  assert.deepEqual((await readdir(root)).sort(), [
    '.agents',
    '.tibicen',
    'AGENTS.md',
  ]);
});

for (const memoryPath of MEMORY_PATHS) {
  test(`approved setup binds only ${memoryPath}, then accepts later notes`, async (t) => {
    const { root, home } = await fixture(t);
    const plan = await createProposal(root, setup(memoryPath), { home });
    assert.equal(plan.proposal.schema, 2);
    assert.equal(plan.proposal.components.toSchema, 3);
    assert.deepEqual(plan.proposal.memory, {
      path: memoryPath,
      ownership: 'user-memory',
    });
    assert.deepEqual(await readdir(root), ['app.js']);
    await assert.rejects(applyPlan(root, plan, { home }), {
      code: 'consent-required',
    });
    const hooks = runtimeHooks(root, plan.proposal, plan.digest);
    const result = await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      verify: hooks.verify,
    });
    assert.equal(result.status, 'complete');
    assert.equal((await getStatus(root)).manifest!.schema, 3);
    const initial = await readFile(path.join(root, memoryPath), 'utf8');
    const later = `${initial}- Verified: tests use Node's built-in runner.\n`;
    await writeFile(path.join(root, memoryPath), later);
    assert.equal((await verifyInfrastructure(root)).status, 'passed');
    const repeat = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          { path: memoryPath, content: later, reason: 'Keep current memory.' },
        ],
      },
      { home },
    );
    assert.equal(repeat.proposal.schema, 2);
    assert.deepEqual(repeat.proposal.changes, []);
    assert.equal(
      (await applyPlan(root, repeat, { home, approvedDigest: repeat.digest }))
        .status,
      'complete',
    );
    const status = await getStatus(root);
    assert.equal(status.manifest!.sessions.length, 2);
    assert.deepEqual(status.manifest!.sessions[0].memory, plan.proposal.memory);
    assert.equal(await readFile(path.join(root, memoryPath), 'utf8'), later);
    assert.equal(
      await readFile(path.join(root, 'app.js'), 'utf8'),
      'application\n',
    );
    const scan = await scanProject(root);
    assert.equal(
      scan.files.find((file) => file.path === memoryPath)!.infrastructure,
      true,
    );
    assert(scan.memoryCandidates!.includes(memoryPath));
  });
}

test('decline and ambiguous unbound stores remain ordinary untouched inputs', async (t) => {
  const { root, home } = await fixture(t, {
    'AGENTS.md': '# Existing\n',
    'MEMORY.md': 'Prefer SQL.\n',
    'docs/memory.md': 'Prefer files.\n',
  });
  const scan = await scanProject(root);
  assert.deepEqual(scan.memoryCandidates, ['docs/memory.md', 'MEMORY.md']);
  assert(
    scan.files
      .filter((file) => scan.memoryCandidates!.includes(file.path))
      .every((file) => !file.infrastructure),
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      gaps: ['Conflicting stores: preserve both; no memory choice authorized.'],
    },
    { home },
  );
  assert.equal(plan.proposal.schema, 1);
  assert.equal(plan.proposal.memory, undefined);
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'complete',
  );
  assert.equal((await getStatus(root)).manifest!.schema, 2);
  assert.equal(
    await readFile(path.join(root, 'MEMORY.md'), 'utf8'),
    'Prefer SQL.\n',
  );
  assert.equal(
    await readFile(path.join(root, 'docs/memory.md'), 'utf8'),
    'Prefer files.\n',
  );
});

test('a supported binding grants no other Markdown, app or global write permission', async (t) => {
  const { root, home } = await fixture(t);
  assert.equal(memoryAllows(undefined, undefined as unknown as string), false);
  assert.throws(
    () =>
      validatePreset({
        schema: 1,
        name: 'project',
        answers: {},
        preferred_sources: [],
        memory: { path: 'MEMORY.md' },
      }),
    { code: 'invalid-preset' },
  );
  await assert.rejects(
    createProposal(
      root,
      {
        mode: 'improve',
        changes: [{ content: 'no path', reason: 'Malformed raw input.' }],
      },
      { home },
    ),
    { code: 'application-protected' },
  );
  for (const memory of [
    null,
    {},
    { path: '../MEMORY.md' },
    { path: 'notes.md' },
    { path: '.agents/memory.md', ownership: 'user-memory' },
  ]) {
    await assert.rejects(
      createProposal(root, { ...setup(), memory }, { home }),
      { code: 'invalid-memory' },
    );
  }
  for (const relative of ['docs/other.md', 'MEMORY.md', 'app.js']) {
    const input = setup();
    input.changes.push({
      path: relative,
      content: 'changed',
      reason: 'Not the bound memory.',
    });
    await assert.rejects(createProposal(root, input, { home }), {
      code: 'application-protected',
    });
  }
  await assert.rejects(
    createProposal(root, { ...setup(), forbiddenPaths: ['.agents'] }, { home }),
    { code: 'forbidden-path' },
  );
  const plan = await createProposal(root, setup(), { home });
  const forged = structuredClone(plan.proposal);
  forged.memory!.path = 'docs/other.md';
  await assert.rejects(
    applyPlan(root, forged, { home, approvedDigest: digest(forged) }),
    { code: 'invalid-memory' },
  );
  assert.throws(() => validateProposal({ ...plan.proposal, schema: 1 }), {
    code: 'invalid-memory',
  });
  assert.throws(
    () =>
      validateProposal({
        ...plan.proposal,
        memory: { ...plan.proposal.memory, extra: true },
      }),
    { code: 'invalid-memory' },
  );
  assert.deepEqual(await readdir(root), ['app.js']);
  assert.deepEqual(await readdir(home), []);
});

test('existing memory can be bound without rewriting or claiming third-party ownership', async (t) => {
  const body = '# User notes\r\nPreserve spaces.  \r\n';
  const { root, home } = await fixture(t, {
    'docs/memory.md': body,
    'AGENTS.md': 'Read [memory](docs/memory.md) before relevant work.\n',
  });
  const plan = await createProposal(
    root,
    { mode: 'improve', memory: { path: 'docs/memory.md' }, changes: [] },
    { home },
  );
  assert.deepEqual(plan.proposal.changes, []);
  assert.deepEqual(plan.proposal.components.files, []);
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'complete',
  );
  assert.equal(await readFile(path.join(root, 'docs/memory.md'), 'utf8'), body);
  assert.deepEqual((await getStatus(root)).manifest!.installed, []);
});

for (const instructionPath of [
  '.cursor/rules/notes.mdc',
  '.claude/rules/notes.md',
  '.cursorrules',
  'packages/ui/.cursor/rules/notes.mdc',
  'packages/ui/.claude/rules/notes.md',
  'packages/ui/.cursorrules',
  'packages/ui/AGENTS.md',
  'packages/ui/CLAUDE.md',
]) {
  test(`existing ${instructionPath} connects memory without a redundant root pointer`, async (t) => {
    const memoryPath = 'docs/memory.md';
    const pointer = `Read relevant decisions in \`${memoryPath}\`, resolved from the project root.\n`;
    const { root, home } = await fixture(t, {
      [memoryPath]: '# Decisions\r\nPreserve unrelated notes.  \r\n',
      'AGENTS.md': pointer,
      [instructionPath]: pointer,
    });
    const plan = await createProposal(
      root,
      { mode: 'improve', memory: { path: memoryPath }, changes: [] },
      { home },
    );
    assert.deepEqual(plan.proposal.changes, []);
    assert.deepEqual(plan.proposal.commands, []);
    assert.equal(
      (await applyPlan(root, plan, { home, approvedDigest: plan.digest }))
        .status,
      'complete',
    );
    await rm(path.join(root, 'AGENTS.md'));
    const before = await fileState(root);
    const homeBefore = await fileState(home);
    const scan = await scanProject(root);
    assert(scan.files.some((file) => file.path === instructionPath));
    const checked = cli(root, 'verify');
    assert.equal(checked.exitCode, 0);
    assert.equal(checked.result.status, 'passed');
    assert.deepEqual(checked.result.issues, []);
    const report = cli(root, 'report').result;
    assert.equal(report.status, 'complete');
    assert.equal(report.diagnosis.structure.status, 'passed');
    assert.deepEqual(report.diagnosis.instructions.candidates, [
      { path: instructionPath, directory: path.posix.dirname(instructionPath) },
    ]);
    assert.equal(report.diagnosis.instructions.applicability, 'unverified');
    assert.equal(report.diagnosis.instructions.loading.status, 'unverified');
    assert.equal(report.diagnosis.instructions.use.status, 'unverified');
    if (
      instructionPath.startsWith('packages/ui/.cursor') ||
      instructionPath.startsWith('packages/ui/.claude')
    )
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [
              {
                path: instructionPath,
                content: 'Replacement\n',
                reason: 'Protected nested rule.',
              },
            ],
          },
          { home },
        ),
        { code: 'application-protected' },
      );
    assert.deepEqual(await fileState(root), before);
    assert.deepEqual(await fileState(home), homeBefore);
  });
}

for (const sample of [
  { name: 'unrelated Markdown', path: 'packages/ui/notes.md' },
  {
    name: 'unsupported extension',
    path: 'packages/ui/.cursor/rules/notes.json',
  },
  {
    name: 'missing pointer',
    path: 'packages/ui/.cursor/rules/notes.mdc',
    content: '# Local rules\n',
  },
  {
    name: 'relative-to-rule pointer',
    path: 'packages/ui/.claude/rules/notes.md',
    content: 'Read ../../../docs/memory.md.\n',
  },
  {
    name: 'backup suffix',
    path: 'packages/ui/.cursorrules',
    content: 'Read docs/memory.md.backup.\n',
  },
  {
    name: 'forbidden rule',
    path: 'packages/ui/.cursor/rules/notes.mdc',
    forbiddenPaths: ['packages/ui'],
  },
  {
    name: 'symlink rule',
    path: 'packages/ui/.claude/rules/notes.md',
    symlink: true,
  },
]) {
  test(`non-connecting ${sample.name} cannot satisfy structural memory checks`, async (t) => {
    const memory = {
      path: 'docs/memory.md',
      ownership: 'user-memory' as const,
    };
    const pointer = 'Read `docs/memory.md`, resolved from the project root.\n';
    const { root, home } = await fixture(t, {
      [memory.path]: '# Decisions\nPreserve unrelated notes.\n',
      [sample.path]: sample.content ?? pointer,
    });
    if (sample.symlink) {
      const target = path.join(home, 'rule.md');
      await writeFile(target, pointer);
      await rm(path.join(root, sample.path));
      await symlink(target, path.join(root, sample.path));
    }
    const before = await fileState(root);
    const homeBefore = await fileState(home);
    const scan = await scanProject(root, {
      memory,
      forbiddenPaths: sample.forbiddenPaths,
    });
    const checked = await verifyInfrastructure(root, {
      memory,
      observedFiles: scan.files,
      forbiddenPaths: sample.forbiddenPaths,
    });
    assert.equal(checked.status, 'issues-found');
    assert(
      checked.issues!.some(
        (issue) => issue.reason === 'missing-memory-connection',
      ),
    );
    if (sample.forbiddenPaths || sample.symlink)
      assert(!scan.files.some((file) => file.path === sample.path));
    assert.deepEqual(await fileState(root), before);
    assert.deepEqual(await fileState(home), homeBefore);
  });
}

test('stale memory edits and symlinks refuse before writing state', async (t) => {
  const { root, home } = await fixture(t, {
    '.agents/memory.md': 'Original notes\n',
  });
  const plan = await createProposal(root, setup(), { home });
  await writeFile(
    path.join(root, '.agents/memory.md'),
    'Concurrent owner note\n',
  );
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-plan' },
  );
  assert.equal((await getStatus(root)).state, null);
  assert.equal(
    await readFile(path.join(root, '.agents/memory.md'), 'utf8'),
    'Concurrent owner note\n',
  );
  await rm(path.join(root, '.agents/memory.md'));
  await symlink(
    path.join(root, 'app.js'),
    path.join(root, '.agents/memory.md'),
  );
  await assert.rejects(createProposal(root, setup(), { home }), {
    code: 'unsafe-path',
  });
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'unsafe-path' },
  );
  assert.equal(
    await readFile(path.join(root, 'app.js'), 'utf8'),
    'application\n',
  );
});

test('interrupted memory writes remain exact and newly approved repair preserves the latest note', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, setup(), { home });
  const first = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange(change) {
      if (change.path === '.agents/memory.md') throw new Error('interrupted');
    },
  });
  assert.equal(first.status, 'incomplete');
  assert.equal((await getStatus(root)).state!.schema, 4);
  const later = '# Decisions\nOwner added this while paused.\n';
  await writeFile(path.join(root, '.agents/memory.md'), later);
  const pendingCheck = cli(root, 'verify');
  assert.equal(pendingCheck.exitCode, 1);
  assert(
    pendingCheck.result.issues.some(
      (issue: { reason: string }) => issue.reason === 'pending-memory-conflict',
    ),
  );
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest, resume: true }),
    { code: 'tamper-suspect' },
  );
  const repair = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: '.agents/memory.md',
          content: later,
          reason: 'Approve and preserve the concurrent owner note.',
        },
      ],
    },
    { home },
  );
  const completed = await applyPlan(root, repair, {
    home,
    approvedDigest: repair.digest,
    resume: true,
  });
  assert.equal(completed.status, 'complete');
  assert.equal(completed.id, first.id);
  assert.equal(
    await readFile(path.join(root, '.agents/memory.md'), 'utf8'),
    later,
  );
});

for (const point of ['before-file-write', 'after-file-write'] as const) {
  test(`memory recovery at ${point} retains exact pending writes`, async (t) => {
    const { root, home } = await fixture(t);
    const plan = await createProposal(root, setup(), { home });
    const first = await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      checkpoint(current, _session, change) {
        if (current === point && change?.path === '.agents/memory.md')
          throw new Error('paused');
      },
    });
    assert.equal(first.status, 'incomplete');
    const recovery = (await getStatus(root)).recovery!.files.find(
      (file) => file.path === '.agents/memory.md',
    )!;
    assert.equal(
      recovery.state,
      point === 'before-file-write' ? 'pending' : 'matches-approved-result',
    );
    let memoryWrites = 0;
    const completed = await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      resume: true,
      checkpoint(current, _session, change) {
        if (
          current === 'after-file-write' &&
          change?.path === '.agents/memory.md'
        )
          memoryWrites++;
      },
    });
    assert.equal(completed.status, 'complete');
    assert.equal(memoryWrites, point === 'before-file-write' ? 1 : 0);
  });
}

test('CLI binds pending memory before a manifest exists and accepts completed later notes', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, setup(), { home });
  const worker = path.join(home, 'interrupt.mjs');
  const planFile = path.join(home, 'plan.json');
  await writeFile(planFile, JSON.stringify(plan));
  await writeFile(
    worker,
    `import {applyPlan} from ${JSON.stringify(pathToFileURL(path.resolve('scripts/core/apply.ts')).href)};import {readFile} from 'node:fs/promises';const plan=JSON.parse(await readFile(${JSON.stringify(planFile)},'utf8'));await applyPlan(${JSON.stringify(root)},plan,{home:${JSON.stringify(home)},approvedDigest:plan.digest,checkpoint(point,_session,change){if(point==='before-file-write'&&change?.path==='.agents/memory.md')process.exit(86);}});`,
  );
  assert.equal(
    spawnSync(process.execPath, [worker], { timeout: 10000 }).status,
    86,
  );
  await assert.rejects(readFile(path.join(root, '.tibicen/manifest.yml')), {
    code: 'ENOENT',
  });
  const pending = cli(root, 'verify');
  assert.equal(pending.exitCode, 1);
  assert(
    pending.result.issues.some(
      (issue: { path: string; reason: string }) =>
        issue.path === '.agents/memory.md' && issue.reason === 'missing-file',
    ),
  );
  assert.deepEqual(cli(root, 'status').result.memory, plan.proposal.memory);
  assert.deepEqual(cli(root, 'report').result.memory, plan.proposal.memory);
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
  await writeFile(
    path.join(root, '.agents/memory.md'),
    '# Decisions\nLater verified project fact.\n',
  );
  const final = cli(root, 'verify');
  assert.equal(final.exitCode, 0);
  assert.equal(final.result.status, 'passed');
  for (const command of ['status', 'report']) {
    const observed = cli(root, command);
    assert.equal(observed.exitCode, 0);
    assert.equal(observed.result.status, 'complete');
    assert.deepEqual(observed.result.memory, plan.proposal.memory);
  }
  await writeFile(path.join(root, '.agents/memory.md'), '');
  assert.equal(cli(root, 'verify').result.status, 'passed');
  await rm(path.join(root, '.agents/memory.md'));
  assert(
    cli(root, 'verify').result.issues.some(
      (issue: { reason: string }) => issue.reason === 'missing-file',
    ),
  );
  await symlink(
    path.join(root, 'app.js'),
    path.join(root, '.agents/memory.md'),
  );
  assert(
    cli(root, 'verify').result.issues.some(
      (issue: { reason: string }) => issue.reason === 'unsafe-path',
    ),
  );
  await rm(path.join(root, '.agents/memory.md'));
  await writeFile(
    path.join(root, '.agents/memory.md'),
    '# Decisions\nStill retained.\n',
  );
  await writeFile(path.join(root, 'AGENTS.md'), '# Lost pointer\n');
  const disconnected = cli(root, 'verify');
  assert.equal(disconnected.exitCode, 1);
  assert(
    disconnected.result.issues.some(
      (issue: { reason: string }) =>
        issue.reason === 'missing-memory-connection',
    ),
  );
});

test('an approved legacy migration keeps history and a pending legacy session completes first', async (t) => {
  const { root, home } = await fixture(t, { 'AGENTS.md': '# Legacy\n' });
  const legacy = await createProposal(root, { mode: 'improve' }, { home });
  await applyPlan(root, legacy, { home, approvedDigest: legacy.digest });
  const id = (await getStatus(root)).manifest!.sessions[0].id;
  await assert.rejects(createProposal(root, setup(), { home }), {
    code: 'manifest-migration-required',
  });
  const migration = await createProposal(
    root,
    { ...setup(), migrateManifest: true },
    { home },
  );
  assert.equal(migration.proposal.components.fromSchema, 2);
  assert.equal(migration.proposal.components.toSchema, 3);
  await applyPlan(root, migration, { home, approvedDigest: migration.digest });
  const status = await getStatus(root);
  assert.equal(status.manifest!.sessions[0].id, id);
  assert.deepEqual(status.manifest!.sessions[1].manifestMigration, {
    from: 2,
    to: 3,
  });
  await assert.rejects(
    createProposal(
      root,
      { mode: 'improve', memory: { path: 'MEMORY.md' } },
      { home },
    ),
    { code: 'invalid-memory' },
  );

  const other = await fixture(t, { 'AGENTS.md': '# Before\n' });
  const pending = await createProposal(
    other.root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: '# After\n', reason: 'Legacy update.' },
      ],
    },
    { home: other.home },
  );
  await applyPlan(other.root, pending, {
    home: other.home,
    approvedDigest: pending.digest,
    afterChange() {
      throw new Error('paused');
    },
  });
  await assert.rejects(
    createProposal(
      other.root,
      { ...setup(), migrateManifest: true },
      { home: other.home },
    ),
    { code: 'resume-required' },
  );
  assert.equal(
    (
      await applyPlan(other.root, pending, {
        home: other.home,
        approvedDigest: pending.digest,
        resume: true,
      })
    ).status,
    'complete',
  );
});

test('instruction removal and restoration preserve later notes; direct memory deletion is refused', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, setup(), { home });
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  const later = '# Decisions\nUser notes after setup.\n';
  await writeFile(path.join(root, '.agents/memory.md'), later);
  await assert.rejects(
    createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: '.agents/memory.md',
            action: 'delete',
            reason: 'Remove infrastructure.',
          },
        ],
      },
      { home },
    ),
    { code: 'memory-protected' },
  );
  const removal = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          action: 'delete',
          reason: 'Remove the agent entrypoint.',
        },
      ],
    },
    { home },
  );
  const removed = await applyPlan(root, removal, {
    home,
    approvedDigest: removal.digest,
  });
  assert.equal(removed.status, 'incomplete');
  assert(
    removed.checks.infrastructure.issues!.some(
      (issue) => issue.reason === 'missing-memory-connection',
    ),
  );
  assert.equal(
    await readFile(path.join(root, '.agents/memory.md'), 'utf8'),
    later,
  );
  const restore = await createProposal(
    root,
    { mode: 'improve', changes: [setup().changes[0]] },
    { home },
  );
  assert.equal(
    (
      await applyPlan(root, restore, {
        home,
        approvedDigest: restore.digest,
        resume: true,
      })
    ).status,
    'complete',
  );
  assert.equal(
    await readFile(path.join(root, '.agents/memory.md'), 'utf8'),
    later,
  );
});

test('missing or unsafe memory and damaged policy remain separate structural issues', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, setup(), { home });
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  await writeFile(path.join(root, 'AGENTS.md'), '# Damaged instructions\n');
  let checked = await verifyInfrastructure(root);
  assert(
    checked.issues!.some(
      (issue) =>
        issue.path === 'AGENTS.md' && issue.reason === 'content-mismatch',
    ),
  );
  assert(
    checked.issues!.some(
      (issue) => issue.reason === 'missing-memory-connection',
    ),
  );
  await rm(path.join(root, '.agents/memory.md'));
  checked = await verifyInfrastructure(root);
  assert(
    checked.issues!.some(
      (issue) =>
        issue.path === '.agents/memory.md' && issue.reason === 'missing-file',
    ),
  );
  await symlink(
    path.join(root, 'app.js'),
    path.join(root, '.agents/memory.md'),
  );
  checked = await verifyInfrastructure(root);
  assert(
    checked.issues!.some(
      (issue) =>
        issue.path === '.agents/memory.md' && issue.reason === 'unsafe-path',
    ),
  );
  assert.equal(
    referencesMemory('Read .agents/memory.md.backup', plan.proposal.memory!),
    false,
  );
  assert.equal(
    referencesMemory(
      'Read [memory](.agents/memory.md).',
      plan.proposal.memory!,
    ),
    true,
  );
});

test('malformed or downgraded memory passports refuse before any new write', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, setup(), { home });
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  const filename = path.join(root, '.tibicen/manifest.yml');
  const original = JSON.parse(await readFile(filename, 'utf8'));
  for (const manifest of [
    { ...original, schema: 2 },
    { ...original, memory: { path: 'app.js', ownership: 'user-memory' } },
    { ...original, memory: null },
  ]) {
    const content = JSON.stringify(manifest);
    await writeFile(filename, content);
    await assert.rejects(createProposal(root, { mode: 'improve' }, { home }), {
      code: 'invalid-memory',
    });
    assert.equal(await readFile(filename, 'utf8'), content);
  }
});
