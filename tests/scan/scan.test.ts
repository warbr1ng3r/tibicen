import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readdir,
  readFile,
  symlink,
  rm,
  chmod,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { scanProject } from '../../scripts/scan/index.ts';
import { MAX_DATA_BYTES } from '../../scripts/core/contracts.ts';

async function fixture(t: TestContext, files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-scan-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

test('routes empty, existing app and existing infrastructure without writing or executing scripts', async (t) => {
  const empty = await fixture(t);
  assert.equal((await scanProject(empty)).kind, 'empty');
  assert.deepEqual(await readdir(empty), []);
  const app = await fixture(t, {
    'package.json': JSON.stringify({
      scripts: {
        test: 'touch SCAN_MUST_NOT_EXECUTE',
        build: 'echo API_TOKEN=private-value',
        postinstall: 'touch BAD',
      },
    }),
    'src/app.ts': 'export const value = 1;',
  });
  const before = await readdir(app, { recursive: true });
  const scan = await scanProject(app);
  assert.equal(scan.kind, 'existing');
  assert.equal(scan.mode, 'init');
  assert.deepEqual(scan.languages, ['javascript', 'typescript']);
  assert.equal(scan.commands.length, 2);
  assert(scan.commands.every((command) => !command.trusted));
  assert(!JSON.stringify(scan).includes('private-value'));
  assert.deepEqual(await readdir(app, { recursive: true }), before);
  assert.equal(
    await readFile(path.join(app, 'src/app.ts'), 'utf8'),
    'export const value = 1;',
  );
  const configured = await fixture(t, {
    'AGENTS.md': '# Project',
    '.cursor/rules/main.mdc': '---\nalwaysApply: true\n---\nBe concise.',
  });
  const improved = await scanProject(configured);
  assert.equal(improved.mode, 'improve');
  assert.deepEqual(improved.agents, ['cursor']);
  assert(
    improved.gaps.some((gap) => gap.reason === 'agent-version-unverified'),
  );
});

test('native harness markers are observations with unverified versions and no project changes', async (t) => {
  const rules = {
    '.claude/settings.json': '{}',
    '.codex/config.toml': '# Existing configuration',
    '.cursor/rules/main.mdc': 'Existing Cursor rule',
    '.opencode/skills/review/SKILL.md': '# Existing skill',
    'GEMINI.md': '# Existing Gemini instructions',
    'packages/ui/GEMINI.md': '# Component instructions',
    '.github/copilot-instructions.md': '# Existing Copilot instructions',
    '.aider.conf.yml': 'read: CONVENTIONS.md',
    '.zcode/config.json': '{}',
    '.cline/rules/main.md': 'Existing Cline rule',
    '.devin/rules/main.md': 'Existing Devin Local rule',
    '.continue/rules/main.md': 'Existing Continue rule',
    '.roo/rules/main.md': 'Existing legacy Roo rule',
    '.windsurf/rules/main.md': 'Existing legacy Windsurf rule',
  };
  const root = await fixture(t, {
    ...rules,
    'src/app.js': 'throw new Error("Do not execute");',
  });
  const before = await readdir(root, { recursive: true });
  const scan = await scanProject(root);
  assert.equal(scan.mode, 'improve');
  assert.deepEqual(scan.agents, [
    'aider',
    'claude-code',
    'cline',
    'codex',
    'continue-ide',
    'copilot-cli',
    'cursor',
    'devin-local',
    'gemini-cli',
    'opencode',
    'roo-code',
    'windsurf',
    'zcode',
  ]);
  assert.deepEqual(
    [...scan.gaps].sort((a, b) => a.agent!.localeCompare(b.agent!)),
    scan.agents.map((agent) => ({
      agent,
      reason: 'agent-version-unverified',
    })),
  );
  assert(
    scan.files
      .filter((file) => file.path in rules)
      .every((file) => file.infrastructure),
  );
  assert.equal(
    scan.files.find((file) => file.path === 'src/app.js')!.infrastructure,
    false,
  );
  assert.deepEqual(scan.commands, []);
  assert.deepEqual(await readdir(root, { recursive: true }), before);
  for (const [relative, content] of Object.entries(rules))
    assert.equal(await readFile(path.join(root, relative), 'utf8'), content);
});

test('shared instruction and skill files do not identify a particular harness', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': '# Shared instructions',
    'packages/ui/AGENTS.md': '# Shared component instructions',
    '.agents/skills/review/SKILL.md': '# Shared skill',
    'packages/ui/.agents/skills/review/SKILL.md': '# Shared component skill',
  });
  const scan = await scanProject(root);
  assert.equal(scan.mode, 'improve');
  assert.deepEqual(scan.agents, []);
  assert.deepEqual(scan.gaps, []);
  assert(scan.files.every((file) => file.infrastructure));
});

test('new native markers retain forbidden, sensitive, metadata and symlink exclusions', async (t) => {
  const outside = await fixture(t, { 'GEMINI.md': 'OUTSIDE_PRIVATE' });
  const root = await fixture(t, {
    'private/GEMINI.md': 'FORBIDDEN_PRIVATE',
    'secrets/.zcode/config.json': 'SECRET_PRIVATE',
    '.git/.aider.conf.yml': 'METADATA_PRIVATE',
    'public.txt': 'safe',
  });
  await symlink(path.join(outside, 'GEMINI.md'), path.join(root, 'GEMINI.md'));
  const scan = await scanProject(root, { forbiddenPaths: ['private'] });
  assert.deepEqual(
    scan.files.map((file) => file.path),
    ['public.txt'],
  );
  assert.deepEqual(scan.agents, []);
  assert.equal(scan.complete, false);
  assert.deepEqual(scan.excluded.map(({ reason }) => reason).sort(), [
    'cache-or-metadata',
    'forbidden-path',
    'sensitive-path',
    'symlink',
  ]);
  assert(!JSON.stringify(scan).includes('PRIVATE'));
  assert.equal(
    await readFile(path.join(outside, 'GEMINI.md'), 'utf8'),
    'OUTSIDE_PRIVATE',
  );
});

test('excludes secret paths, forbidden trees, metadata and symlinks without returning their contents', async (t) => {
  const outside = await fixture(t, { 'outside.txt': 'OUTSIDE_PRIVATE' });
  const root = await fixture(t, {
    '.env.local': 'PRIVATE_VALUE',
    'secrets/token': 'SECRET_VALUE',
    '.npmrc': '//registry/:_authToken=TOKEN',
    '.git/hooks/post-checkout': 'HOOK',
    'data/raw/private.txt': 'PRIVATE_DATA',
    'node_modules/pkg/index.js': 'PRIVATE_DEP',
    'public.txt': 'safe',
  });
  await symlink(
    path.join(outside, 'outside.txt'),
    path.join(root, 'linked.txt'),
  );
  await symlink(outside, path.join(root, 'linked-directory'), 'dir');
  const scan = await scanProject(root, { forbiddenPaths: ['data/raw/'] });
  assert.deepEqual(
    scan.files.map((file) => file.path),
    ['public.txt'],
  );
  assert.equal(scan.complete, false);
  assert.equal(
    scan.excluded.filter((item) => item.reason === 'symlink').length,
    2,
  );
  assert(
    !/PRIVATE_VALUE|SECRET_VALUE|PRIVATE_DATA|PRIVATE_DEP|OUTSIDE_PRIVATE|authToken/.test(
      JSON.stringify(scan),
    ),
  );
  assert.equal(
    await readFile(path.join(outside, 'outside.txt'), 'utf8'),
    'OUTSIDE_PRIVATE',
  );
});

test('partial scans cannot claim complete coverage and unsafe constraints are rejected', async (t) => {
  const root = await fixture(t, {
    'big.txt': 'x'.repeat(32),
    'normal.txt': 'okay',
    'package.json': '{broken',
  });
  const scan = await scanProject(root, { maxFileBytes: 20 });
  assert.equal(scan.complete, false);
  assert(
    scan.gaps.some(
      (gap) => gap.path === 'big.txt' && gap.reason === 'file-too-large',
    ),
  );
  assert(scan.gaps.some((gap) => gap.reason === 'invalid-package-json'));
  const limited = await scanProject(root, { maxFiles: 1 });
  assert(limited.gaps.some((gap) => gap.reason === 'scan-limit'));
  assert.equal(limited.complete, false);
  await assert.rejects(scanProject(root, { forbiddenPaths: ['../outside'] }), {
    code: 'unsafe-path',
  });
});

test('memory discovery does not read a forbidden project manifest', async (t) => {
  const root = await fixture(t, {
    '.tibicen/manifest.yml': 'Not permitted to parse this manifest.',
    'MEMORY.md': 'User notes.\n',
  });
  const scan = await scanProject(root, { forbiddenPaths: ['.tibicen'] });
  assert.deepEqual(scan.memoryCandidates, ['MEMORY.md']);
  assert.equal(
    scan.files.find((file) => file.path === 'MEMORY.md')!.infrastructure,
    false,
  );
  assert(
    scan.excluded.some(
      (file) => file.path === '.tibicen' && file.reason === 'forbidden-path',
    ),
  );
});

for (const kind of ['fifo', 'directory', 'oversized', 'malformed']) {
  test(`scan and direct manifest reads reject a ${kind} manifest within a bounded child`, async (t) => {
    if (kind === 'fifo' && process.platform === 'win32')
      return t.skip('FIFO requires POSIX');
    const root = await fixture(t, { 'app.js': 'unchanged\n' });
    await mkdir(path.join(root, '.tibicen'));
    const filename = path.join(root, '.tibicen/manifest.yml');
    if (kind === 'fifo') {
      const made = spawnSync('mkfifo', [filename], { timeout: 3000 });
      assert.equal(made.status, 0);
    } else if (kind === 'directory') await mkdir(filename);
    else
      await writeFile(
        filename,
        kind === 'oversized' ? Buffer.alloc(MAX_DATA_BYTES + 1, 32) : '{broken',
      );
    const source = `import {scanProject} from ${JSON.stringify(pathToFileURL(path.resolve('scripts/scan/index.ts')).href)};import {readManifest} from ${JSON.stringify(pathToFileURL(path.resolve('scripts/core/components.ts')).href)};const results=await Promise.allSettled([scanProject(${JSON.stringify(root)}),readManifest(${JSON.stringify(root)})]);console.log(JSON.stringify(results.map(result=>result.status==='rejected'?result.reason.code:'accepted')));`;
    const result = spawnSync(
      process.execPath,
      ['--input-type=module', '-e', source],
      { encoding: 'utf8', timeout: 3000 },
    );
    assert.equal(
      result.error,
      undefined,
      'Neither read may hang on a special file.',
    );
    assert.equal(result.status, 0, result.stderr);
    const expected =
      kind === 'oversized'
        ? 'file-too-large'
        : kind === 'malformed'
          ? 'invalid-data'
          : 'unsupported-file';
    assert.deepEqual(JSON.parse(result.stdout), [expected, expected]);
    assert.equal(
      await readFile(path.join(root, 'app.js'), 'utf8'),
      'unchanged\n',
    );
    assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
      'manifest.yml',
    ]);
  });
}

test('partially unreadable directories produce a gap without hiding readable files', async (t) => {
  const root = await fixture(t, {
    'readable.txt': 'public',
    'locked/private.txt': 'private',
  });
  const locked = path.join(root, 'locked');
  await chmod(locked, 0);
  let scan;
  try {
    scan = await scanProject(root);
  } finally {
    await chmod(locked, 0o700);
  }
  if (scan.files.some((file) => file.path === 'locked/private.txt')) {
    t.skip('Host privileges bypass directory permissions.');
    return;
  }
  assert(scan.files.some((file) => file.path === 'readable.txt'));
  assert(
    scan.gaps.some(
      (gap) => gap.path === 'locked' && gap.reason === 'unreadable-directory',
    ),
  );
  assert.equal(scan.complete, false);
});
