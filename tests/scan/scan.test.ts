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
import { scanProject } from '../../scripts/scan/index.ts';

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
