import type { TestContext } from 'node:test';
import type { NodeEnvironment } from '../../scripts/verify/environment.ts';
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  open,
  readFile,
  readlink,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {
  copyNodeEnvironment,
  inspectNodeEnvironment,
} from '../../scripts/verify/environment.ts';

const execute = promisify(execFile);
const roots = ['landing/node_modules', 'node_modules'];
async function fixture(
  t: TestContext,
  files: Record<string, string | Buffer> = {},
) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-node-environment-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  return root;
}

async function packageFixture(t: TestContext) {
  const root = await fixture(t, {
    'node_modules/.pnpm/answer@1.0.0/node_modules/answer/package.json':
      '{"name":"answer","version":"1.0.0","type":"module","exports":"./index.js"}',
    'node_modules/.pnpm/answer@1.0.0/node_modules/answer/index.js':
      'export const answer = 42;\n',
    'node_modules/.pnpm/answer@1.0.0/node_modules/answer/grammar.js':
      'export const example = "api_key=example-grammar-literal";\n',
    'workspace/package.json':
      '{"name":"workspace","type":"module","exports":"./index.js"}',
    'workspace/index.js': 'export const value = 7;\n',
  });
  await mkdir(path.join(root, 'landing/node_modules'), { recursive: true });
  await symlink(
    '.pnpm/answer@1.0.0/node_modules/answer',
    path.join(root, 'node_modules/answer'),
  );
  await symlink(
    '../../node_modules/.pnpm/answer@1.0.0/node_modules/answer',
    path.join(root, 'landing/node_modules/answer'),
  );
  await symlink('../workspace', path.join(root, 'node_modules/workspace'));
  return root;
}

test('copies a pnpm package and workspace links as independent executable payload', async (t) => {
  const source = await packageFixture(t);
  const packagePath = 'node_modules/.pnpm/answer@1.0.0/node_modules/answer';
  const native = Buffer.alloc(16 * 1024 * 1024 + 1, 0xa5);
  await writeFile(path.join(source, packagePath, 'binding.node'), native);
  await chmod(path.join(source, packagePath, 'index.js'), 0o755);
  const expected = await inspectNodeEnvironment(source, roots);
  assert.deepEqual(expected.roots, roots);
  assert.equal(expected.files, 4);
  assert(expected.bytes > native.length);
  assert.equal(expected.platform, process.platform);
  assert.equal(expected.arch, process.arch);
  assert.equal(expected.nodeVersion, process.version);

  const retained = await fixture(t);
  await copyNodeEnvironment(source, retained, expected);
  assert.deepEqual(await inspectNodeEnvironment(retained, roots), expected);
  assert.equal(
    await readlink(path.join(retained, 'node_modules/workspace')),
    '../workspace',
  );
  await assert.rejects(lstat(path.join(retained, 'workspace')), {
    code: 'ENOENT',
  });

  const execution = await fixture(t, {
    'workspace/package.json': await readFile(
      path.join(source, 'workspace/package.json'),
    ),
    'workspace/index.js': await readFile(
      path.join(source, 'workspace/index.js'),
    ),
  });
  await copyNodeEnvironment(retained, execution, expected);
  const result = await execute(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      'import { answer } from "answer"; import { value } from "workspace"; console.log(answer + value);',
    ],
    { cwd: execution },
  );
  assert.equal(result.stdout.trim(), '49');
  assert.equal(
    (await lstat(path.join(execution, packagePath, 'index.js'))).mode & 0o777,
    0o755,
  );
  assert.deepEqual(
    await readFile(path.join(execution, packagePath, 'binding.node')),
    native,
  );

  await writeFile(path.join(execution, packagePath, 'index.js'), 'mutated');
  await mkdir(path.join(execution, 'node_modules/.astro'));
  await writeFile(
    path.join(execution, 'node_modules/.astro/cache'),
    'generated',
  );
  assert.deepEqual(await inspectNodeEnvironment(source, roots), expected);
  assert.deepEqual(await inspectNodeEnvironment(retained, roots), expected);
  const next = await fixture(t);
  await copyNodeEnvironment(retained, next, expected);
  assert.equal(
    await readFile(path.join(next, packagePath, 'index.js'), 'utf8'),
    'export const answer = 42;\n',
  );
  await assert.rejects(lstat(path.join(next, 'node_modules/.astro')), {
    code: 'ENOENT',
  });
});

test('excludes credential paths, host shims, manager metadata, caches and explicit forbidden paths', async (t) => {
  const source = await packageFixture(t);
  const excluded = [
    'node_modules/.bin/host-shim',
    'node_modules/.modules.yaml',
    'node_modules/.pnpm-workspace-state-v1.json',
    'node_modules/.pnpm/lock.yaml',
    'node_modules/.package-lock.json',
    'node_modules/.astro/generated',
    'node_modules/.vite/generated',
    'node_modules/.cache/generated',
    'node_modules/answer-config/.env.local',
    'node_modules/answer-config/.npmrc',
    'node_modules/answer-config/.netrc',
    'node_modules/answer-config/private.key',
    'node_modules/answer-config/.git/index',
    'node_modules/answer-config/credentials.json',
    'node_modules/owner-config/keep-private',
  ];
  for (const relative of excluded) {
    await mkdir(path.dirname(path.join(source, relative)), { recursive: true });
    await writeFile(path.join(source, relative), 'excluded-payload');
  }
  await symlink(
    '/original/checkout/node',
    path.join(source, 'node_modules/.bin/absolute'),
  );
  const options = { forbiddenPaths: ['node_modules/owner-config/'] };
  const expected = await inspectNodeEnvironment(source, roots, options);
  const target = await fixture(t);
  await copyNodeEnvironment(source, target, expected, options);
  for (const relative of excluded)
    await assert.rejects(lstat(path.join(target, relative)), {
      code: 'ENOENT',
    });
  assert.equal(expected.files, 3);
  const before = await inspectNodeEnvironment(source, roots, options);
  await writeFile(path.join(source, 'node_modules/.npmrc'), 'changed-excluded');
  assert.deepEqual(
    await inspectNodeEnvironment(source, roots, options),
    before,
  );
});

test('rejects noncanonical, overlapping, sensitive and symlinked roots', async (t) => {
  const source = await packageFixture(t);
  for (const invalid of [
    [],
    ['node_modules', 'node_modules'],
    ['node_modules', 'node_modules/nested/node_modules'],
    ['node_modules/../node_modules'],
    ['./node_modules'],
    ['node_modules/'],
    ['/node_modules'],
    ['landing'],
    ['C:/node_modules'],
    ['landing\\node_modules'],
    ['.env/node_modules'],
  ])
    await assert.rejects(inspectNodeEnvironment(source, invalid));
  await assert.rejects(
    inspectNodeEnvironment(source, roots, { forbiddenPaths: ['node_modules'] }),
    { code: 'unsafe-node-environment' },
  );
  await symlink('landing', path.join(source, 'alias'));
  await assert.rejects(inspectNodeEnvironment(source, ['alias/node_modules']), {
    code: 'unsafe-path',
  });
  await symlink('node_modules', path.join(source, 'landing/dependencies'));
  await mkdir(path.join(source, 'linked'));
  await symlink('../node_modules', path.join(source, 'linked/node_modules'));
  await assert.rejects(
    inspectNodeEnvironment(source, ['linked/node_modules']),
    { code: 'unsafe-path' },
  );
});

test('rejects absolute, external, cyclic, sensitive and indirectly external links', async (t) => {
  const source = await packageFixture(t);
  const outside = await fixture(t, { 'outside.js': 'outside' });
  const location = path.join(source, 'node_modules/unsafe');
  const targets = [
    path.join(source, 'workspace'),
    '../../outside',
    '../.env',
    '.pnpm/../.npmrc',
    'unsafe',
    'C:/outside',
    '..\\outside',
  ];
  for (const target of targets) {
    await symlink(target, location);
    await assert.rejects(inspectNodeEnvironment(source, roots), {
      code: 'unsafe-node-environment',
    });
    await rm(location);
  }
  await symlink(outside, path.join(source, 'workspace/escape'));
  await symlink('../workspace/escape/outside.js', location);
  await assert.rejects(inspectNodeEnvironment(source, roots), {
    code: 'unsafe-node-environment',
  });
  await rm(location);
  await symlink('../workspace', path.join(source, 'node_modules/alias'));
  await symlink('alias/private/file', location);
  await assert.rejects(
    inspectNodeEnvironment(source, roots, {
      forbiddenPaths: ['workspace/private'],
    }),
    { code: 'unsafe-node-environment' },
  );
});

test('rejects special files without reading them', async (t) => {
  if (process.platform === 'win32') return t.skip('FIFO requires POSIX');
  const source = await packageFixture(t);
  await execute('mkfifo', [path.join(source, 'node_modules/fifo')]);
  await assert.rejects(inspectNodeEnvironment(source, roots), {
    code: 'unsafe-node-environment',
  });
});

test('rejects stale file, mode, link, count and runtime identities before use', async (t) => {
  const source = await packageFixture(t);
  const expected = await inspectNodeEnvironment(source, roots);
  const target = await fixture(t);
  for (const update of [
    { hash: '0'.repeat(64) },
    { files: expected.files + 1 },
    { bytes: expected.bytes + 1 },
  ])
    await assert.rejects(
      copyNodeEnvironment(source, target, { ...expected, ...update }),
      { code: 'node-environment-changed' },
    );
  for (const update of [
    { platform: 'other' },
    { arch: 'other' },
    { nodeVersion: 'v0.0.0' },
  ])
    await assert.rejects(
      copyNodeEnvironment(source, target, { ...expected, ...update }),
      { code: 'node-environment-runtime-mismatch' },
    );
  for (const update of [
    { files: 50001 },
    { bytes: 512 * 1024 * 1024 + 1 },
    { hash: 'invalid' },
  ])
    await assert.rejects(
      copyNodeEnvironment(source, target, {
        ...expected,
        ...update,
      } as NodeEnvironment),
      { code: 'invalid-node-environment' },
    );
  const packageFile = path.join(
    source,
    'node_modules/.pnpm/answer@1.0.0/node_modules/answer/index.js',
  );
  await chmod(packageFile, 0o755);
  await assert.rejects(copyNodeEnvironment(source, target, expected), {
    code: 'node-environment-changed',
  });
  await chmod(packageFile, 0o644);
  await writeFile(packageFile, 'export const answer = 43;\n');
  await assert.rejects(copyNodeEnvironment(source, target, expected), {
    code: 'node-environment-changed',
  });
  await writeFile(packageFile, 'export const answer = 42;\n');
  await rm(path.join(source, 'node_modules/answer'));
  await symlink('../workspace', path.join(source, 'node_modules/answer'));
  await assert.rejects(copyNodeEnvironment(source, target, expected), {
    code: 'node-environment-changed',
  });
  await assert.rejects(lstat(path.join(target, 'node_modules')), {
    code: 'ENOENT',
  });
});

test('requires absent destination roots and rejects destination ancestor links and project overlap', async (t) => {
  const source = await packageFixture(t);
  const expected = await inspectNodeEnvironment(source, roots);
  const target = await fixture(t, { 'node_modules/owner-file': 'preserve' });
  await assert.rejects(copyNodeEnvironment(source, target, expected), {
    code: 'unsafe-node-environment',
  });
  assert.equal(
    await readFile(path.join(target, 'node_modules/owner-file'), 'utf8'),
    'preserve',
  );
  await assert.rejects(lstat(path.join(target, 'landing')), { code: 'ENOENT' });
  const linked = await fixture(t);
  const outside = await fixture(t);
  await symlink(outside, path.join(linked, 'landing'));
  await assert.rejects(copyNodeEnvironment(source, linked, expected), {
    code: 'unsafe-path',
  });
  await assert.rejects(lstat(path.join(outside, 'node_modules')), {
    code: 'ENOENT',
  });
  await assert.rejects(copyNodeEnvironment(source, source, expected), {
    code: 'unsafe-node-environment',
  });
  await mkdir(path.join(source, 'nested'));
  await assert.rejects(
    copyNodeEnvironment(source, path.join(source, 'nested'), expected),
    { code: 'unsafe-node-environment' },
  );
});

test('bounds individual and total binary payload before reading oversized files', async (t) => {
  const source = await fixture(t);
  await mkdir(path.join(source, 'node_modules'));
  const handle = await open(path.join(source, 'node_modules/large.node'), 'w');
  await handle.truncate(64 * 1024 * 1024 + 1);
  await handle.close();
  await assert.rejects(inspectNodeEnvironment(source, ['node_modules']), {
    code: 'node-environment-limit',
  });
  await rm(path.join(source, 'node_modules/large.node'));
  for (let index = 0; index < 9; index++) {
    const file = await open(
      path.join(source, `node_modules/${index}.node`),
      'w',
    );
    await file.truncate(64 * 1024 * 1024);
    await file.close();
  }
  await assert.rejects(inspectNodeEnvironment(source, ['node_modules']), {
    code: 'node-environment-limit',
  });
});
