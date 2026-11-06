import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  realpath,
  rename,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  summarizeMemorySources,
  validateMemorySources,
} from '../../scripts/core/memory-sources.ts';
import type { MemorySource } from '../../scripts/core/memory-sources.ts';
import type { ScanResult } from '../../scripts/core/types.ts';
import { scanProject } from '../../scripts/scan/index.ts';

const baselineHash = 'a'.repeat(64);
const currentHash = 'b'.repeat(64);

function relation(overrides: Partial<MemorySource> = {}): MemorySource {
  return {
    id: 'build-command',
    memoryPath: '.agents/memory.md',
    noteReference: 'Build command',
    sourcePath: 'config.json',
    baselineHash,
    ...overrides,
  };
}

function inventory(paths = ['.agents/memory.md', 'config.json']): ScanResult {
  return {
    schema: 1,
    root: '/project',
    kind: 'existing',
    mode: 'improve',
    files: paths.map((relative) => ({
      path: relative,
      hash: baselineHash,
      mode: 0o600,
    })),
    languages: [],
    commands: [],
    agents: [],
    gaps: [],
    excluded: [],
    complete: true,
  };
}

async function fixture(t: TestContext) {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-memory-sources-')),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, '.agents'));
  await writeFile(
    path.join(root, '.agents/memory.md'),
    '# Decisions\n- Dependencies need approval.\n',
  );
  await writeFile(path.join(root, 'config.json'), '{"runner":"node"}\n');
  return root;
}

async function treeState(root: string) {
  return Promise.all(
    (await readdir(root, { recursive: true })).sort().map(async (relative) => {
      const filename = path.join(root, relative);
      const stat = await lstat(filename);
      return {
        path: relative,
        mode: stat.mode & 0o777,
        ...(stat.isFile() ? { bytes: await readFile(filename) } : {}),
      };
    }),
  );
}

test('memory relations are optional, bounded explicit data for one store', () => {
  assert.deepEqual(validateMemorySources([]), []);
  const input = Array.from({ length: 16 }, (_, index) =>
    relation({ id: `fact-${index}` }),
  );
  assert.deepEqual(validateMemorySources(input), input);
  assert.notEqual(validateMemorySources(input)[0], input[0]);
  assert.deepEqual(
    validateMemorySources([Object.assign(Object.create(null), relation())]),
    [relation()],
  );
  assert.deepEqual(summarizeMemorySources(inventory(), []).entries, []);
});

test('invalid relations cannot invent fields, stores, paths or hash syntax', () => {
  const invalid: unknown[] = [
    undefined,
    null,
    {},
    new Array(1),
    [null],
    [new Date()],
    [Object.create(relation())],
    [Object.assign(relation(), { extra: 'field' })],
    [Object.assign(relation(), { [Symbol('extra')]: true })],
    [{ ...relation(), baselineHash: undefined }],
    [relation({ baselineHash: baselineHash.toUpperCase() })],
    [relation({ baselineHash: 'not-an-observed-hash' })],
    [relation({ id: '' })],
    [relation({ id: 'x'.repeat(65) })],
    [relation({ id: ' spaced ' })],
    [relation({ id: 'line\nbreak' })],
    [relation({ noteReference: '' })],
    [relation({ noteReference: 'x'.repeat(257) })],
    [relation({ noteReference: 'hidden\u200btext' })],
    [relation({ memoryPath: 'other-memory.md' })],
    [relation(), relation({ id: 'other', memoryPath: 'MEMORY.md' })],
    [relation(), relation()],
    Array.from({ length: 17 }, (_, index) => relation({ id: `fact-${index}` })),
    ...[
      '/outside',
      '../outside',
      './config.json',
      'a//b',
      'a\\b',
      'a\nfile',
      'x'.repeat(4097),
    ].map((sourcePath) => [relation({ sourcePath })]),
  ];
  for (const input of invalid)
    assert.throws(() => validateMemorySources(input), {
      code: 'invalid-memory-sources',
    });
  assert.throws(
    () => summarizeMemorySources(inventory(), [relation({ id: '' })]),
    { code: 'invalid-memory-sources' },
  );
});

test('actual retained scan hashes detect source changes without editing notes', async (t) => {
  const root = await fixture(t);
  const initial = await scanProject(root);
  const bound = relation({
    baselineHash: initial.files.find((file) => file.path === 'config.json')!
      .hash,
  });
  let before = await treeState(root);
  const unchanged = summarizeMemorySources(initial, [bound]);
  assert.equal(unchanged.entries[0].status, 'unchanged');
  assert.equal(unchanged.entries[0].action, 'keep');
  assert.equal(unchanged.entries[0].memoryFileStatus, 'observed');
  // The supplied label is absent from the actual notes; byte equality proves no note.
  assert.equal(unchanged.notePresence, 'unverified');
  assert.deepEqual(await treeState(root), before);

  await writeFile(path.join(root, 'unrelated.txt'), 'Another task.\n');
  await writeFile(
    path.join(root, '.agents/memory.md'),
    '# Decisions\n- Dependencies still need approval.\n- Keep unrelated notes.\n',
  );
  assert.equal(
    summarizeMemorySources(await scanProject(root), [bound]).entries[0].status,
    'unchanged',
  );
  await writeFile(path.join(root, 'config.json'), '{"runner":"pnpm"}\n');
  before = await treeState(root);
  const changed = summarizeMemorySources(await scanProject(root), [bound]);
  assert.equal(changed.entries[0].status, 'changed');
  assert.equal(changed.entries[0].action, 'review');
  assert.equal(changed.entries[0].reason, 'source-bytes-changed');
  assert.equal(Object.hasOwn(changed.entries[0], 'baselineHash'), false);
  assert.equal(JSON.stringify(changed).includes(bound.baselineHash), false);
  assert.deepEqual(await treeState(root), before);
});

test('a renamed source is missing rather than automatically rebound', async (t) => {
  const root = await fixture(t);
  const scan = await scanProject(root);
  const bound = relation({
    baselineHash: scan.files.find((file) => file.path === 'config.json')!.hash,
  });
  await rename(
    path.join(root, 'config.json'),
    path.join(root, 'new-config.json'),
  );
  const before = await treeState(root);
  const entry = summarizeMemorySources(await scanProject(root), [bound])
    .entries[0];
  assert.equal(entry.status, 'missing');
  assert.equal(entry.currentHash, null);
  assert.equal(entry.action, 'review');
  assert.deepEqual(await treeState(root), before);
});

test('memory-file availability stays separate from source bytes and note presence', () => {
  const result = summarizeMemorySources(inventory(['config.json']), [
    relation(),
  ]);
  assert.equal(result.entries[0].memoryFileStatus, 'missing');
  assert.equal(result.entries[0].status, 'unchanged');
  assert.equal(result.entries[0].action, 'inspect');
  assert.equal(result.notePresence, 'unverified');
  const hiddenMemory = summarizeMemorySources(
    inventory(),
    [relation()],
    ['.agents'],
  );
  assert.equal(hiddenMemory.entries[0].memoryFileStatus, 'unverified');
  assert.equal(hiddenMemory.entries[0].status, 'unchanged');
  assert.equal(hiddenMemory.entries[0].action, 'inspect');
});

test('an explicit reference cannot register or override the active memory store', () => {
  const scan = inventory();
  const before = structuredClone(scan);
  const entry = summarizeMemorySources(scan, [relation()], [], 'MEMORY.md')
    .entries[0];
  assert.equal(entry.status, 'unverified');
  assert.equal(entry.memoryFileStatus, 'unverified');
  assert.equal(entry.currentHash, null);
  assert.equal(entry.reason, 'registered-memory-mismatch');
  assert.equal(entry.action, 'inspect');
  assert.deepEqual(scan, before);
  assert.equal(
    summarizeMemorySources(scan, [relation()]).entries[0].status,
    'unchanged',
  );
});

test('forbidden, sensitive and excluded source hashes are never returned', () => {
  for (const sourcePath of [
    'private/config.json',
    '.env',
    'node_modules/config.json',
  ]) {
    const scan = inventory(['.agents/memory.md', sourcePath]);
    const entry = summarizeMemorySources(
      scan,
      [relation({ sourcePath })],
      ['private'],
    ).entries[0];
    assert.equal(entry.status, 'unverified');
    assert.equal(entry.currentHash, null);
    assert.equal(entry.action, 'inspect');
    assert.equal(Object.hasOwn(entry, 'baselineHash'), false);
  }
  const scan = inventory();
  scan.excluded.push({ path: 'config.json', reason: 'symlink' });
  assert.equal(
    summarizeMemorySources(scan, [relation()]).entries[0].status,
    'unverified',
  );
  assert.equal(
    summarizeMemorySources(scan, [relation()]).entries[0].currentHash,
    null,
  );
});

test('incomplete coverage does not turn absent evidence into a missing source', () => {
  const scan = inventory(['.agents/memory.md']);
  scan.complete = false;
  scan.gaps.push({ path: '.', reason: 'scan-limit' });
  const entry = summarizeMemorySources(scan, [relation()]).entries[0];
  assert.equal(entry.status, 'unverified');
  assert.equal(entry.currentHash, null);
  assert.equal(entry.action, 'inspect');
});

test('unrelated scan gaps preserve observed evidence but ancestor gaps hide it', () => {
  const scan = inventory();
  scan.complete = false;
  scan.gaps.push({ path: 'unrelated', reason: 'unreadable-directory' });
  assert.equal(
    summarizeMemorySources(scan, [relation()]).entries[0].status,
    'unchanged',
  );
  scan.gaps.push({ path: 'config.json', reason: 'unreadable-file' });
  const entry = summarizeMemorySources(scan, [relation()]).entries[0];
  assert.equal(entry.status, 'unverified');
  assert.equal(entry.currentHash, null);
});

test('only the explicitly bound source affects its review action', () => {
  const scan = inventory(['.agents/memory.md', 'config.json', 'README.md']);
  scan.files.find((file) => file.path === 'README.md')!.hash = currentHash;
  const result = summarizeMemorySources(scan, [
    relation(),
    relation({
      id: 'readme-fact',
      noteReference: 'README fact',
      sourcePath: 'README.md',
    }),
  ]);
  assert.deepEqual(
    result.entries.map((entry) => entry.status),
    ['unchanged', 'changed'],
  );
  assert.deepEqual(
    result.entries.map((entry) => entry.action),
    ['keep', 'review'],
  );
});
