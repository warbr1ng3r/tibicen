import test from 'node:test';
import assert from 'node:assert/strict';
import { hashContent } from '../../scripts/core/contracts.ts';
import type { ScanResult } from '../../scripts/core/types.ts';
import {
  summarizeInstructionSources,
  validateInstructionSources,
} from '../../scripts/core/instruction-sources.ts';
import {
  inspectInventoryFile,
  isEvidenceHash,
  isEvidencePath,
} from '../../scripts/core/report-evidence.ts';

function scan(files: Record<string, string> = {}): ScanResult {
  return {
    schema: 1,
    root: '/project',
    kind: 'existing',
    mode: 'init',
    files: Object.entries(files).map(([path, content]) => ({
      path,
      hash: hashContent(content),
      mode: 0o644,
      infrastructure: false,
    })),
    languages: [],
    commands: [],
    agents: [],
    gaps: [],
    excluded: [],
    complete: true,
  };
}

test('evidence paths and hashes accept only bounded canonical printable values', () => {
  for (const value of ['RULES.md', 'docs/правила.md', 'a'.repeat(4096)])
    assert.equal(isEvidencePath(value), true, value);
  for (const value of [
    '',
    '.',
    '/RULES.md',
    'C:RULES.md',
    'C:/RULES.md',
    '../RULES.md',
    'docs/../RULES.md',
    './RULES.md',
    'docs/./RULES.md',
    'docs//RULES.md',
    'docs/RULES.md/',
    'docs\\RULES.md',
    'rules\u0000.md',
    'rules\n.md',
    'rules\u200b.md',
    'rules\u2028.md',
    'a'.repeat(4097),
    null,
    12,
    undefined,
  ])
    assert.equal(isEvidencePath(value), false, String(value));
  assert.equal(isEvidenceHash(hashContent('rules')), true);
  for (const value of [
    'a'.repeat(63),
    'a'.repeat(65),
    'A'.repeat(64),
    'g'.repeat(64),
    `${'a'.repeat(64)}\n`,
    null,
    undefined,
    12,
  ])
    assert.equal(isEvidenceHash(value), false, String(value));
});

test('custom instruction sources compare bytes without changing discovery or input', () => {
  const inventory = scan({
    'RULES.md': 'Read the project commands.',
    'docs/JAN.md': 'Preserve review decisions.',
  });
  const sources = [
    { path: 'docs/JAN.md', hash: hashContent('Earlier instructions') },
    { path: 'RULES.md', hash: hashContent('Read the project commands.') },
  ];
  const before = JSON.stringify({ inventory, sources });
  Object.freeze(sources);
  for (const source of sources) Object.freeze(source);
  const result = summarizeInstructionSources(inventory, sources);
  assert.deepEqual(result, [
    {
      path: 'docs/JAN.md',
      basis: 'caller-supplied',
      status: 'stale',
      hash: hashContent('Preserve review decisions.'),
      reason: 'source-hash-mismatch',
    },
    {
      path: 'RULES.md',
      basis: 'caller-supplied',
      status: 'matched-current-file',
      hash: hashContent('Read the project commands.'),
    },
  ]);
  assert.equal(JSON.stringify({ inventory, sources }), before);
  assert.equal(inventory.mode, 'init');
  assert(inventory.files.every((file) => !file.infrastructure));
  assert.deepEqual(inventory.agents, []);
  assert(!JSON.stringify(result).includes('Earlier instructions'));
  assert(!Object.hasOwn(result[0], 'loading'));
  assert(!Object.hasOwn(result[0], 'targetRelation'));
});

test('inventory exclusions and unsafe ancestor coverage win without returning hashes', () => {
  const inventory = scan({
    'private/RULES.md': 'Private instructions',
    '.env/RULES.md': 'Secret instructions',
    '.npmrc': 'Private registry credentials',
    'alias/RULES.md': 'Linked instructions',
    'unreadable/RULES.md': 'Unreadable instructions',
  });
  inventory.excluded = [{ path: 'alias', reason: 'symlink' }];
  inventory.gaps = [{ path: 'unreadable', reason: 'unreadable-directory' }];
  const expected = [
    ['private/RULES.md', 'forbidden-path'],
    ['.env/RULES.md', 'sensitive-path'],
    ['.npmrc', 'sensitive-path'],
    ['.git/RULES.md', 'cache-or-metadata'],
    ['alias/RULES.md', 'symlink'],
    ['unreadable/RULES.md', 'unreadable-directory'],
  ];
  for (const [path, reason] of expected) {
    assert.deepEqual(inspectInventoryFile(inventory, path, ['private/']), {
      status: 'unverified',
      reason,
    });
    const suppliedHash = hashContent(`supplied:${path}`);
    const [source] = summarizeInstructionSources(
      inventory,
      [{ path, hash: suppliedHash }],
      ['private/'],
    );
    assert.deepEqual(source, {
      path,
      basis: 'caller-supplied',
      status: 'unavailable',
      reason,
    });
    assert(!JSON.stringify(source).includes(suppliedHash));
    assert(!Object.hasOwn(source, 'hash'));
  }
});

test('complete permitted absence differs from partial coverage without erasing observed bytes', () => {
  const inventory = scan({ 'RULES.md': 'Current rules' });
  assert.deepEqual(inspectInventoryFile(inventory, 'missing.md'), {
    status: 'missing',
    reason: 'not-in-permitted-inventory',
  });
  assert.equal(
    summarizeInstructionSources(inventory, [
      { path: 'missing.md', hash: hashContent('missing') },
    ])[0].status,
    'unavailable',
  );
  inventory.complete = false;
  inventory.gaps = [{ path: 'other', reason: 'depth-limit' }];
  assert.deepEqual(inspectInventoryFile(inventory, 'missing.md'), {
    status: 'unverified',
    reason: 'scan-incomplete',
  });
  assert.deepEqual(inspectInventoryFile(inventory, 'other/RULES.md'), {
    status: 'unverified',
    reason: 'depth-limit',
  });
  inventory.gaps.push({ path: '.', reason: 'scan-limit' });
  assert.deepEqual(inspectInventoryFile(inventory, 'RULES.md'), {
    status: 'observed',
    hash: hashContent('Current rules'),
  });
  assert.deepEqual(inspectInventoryFile(inventory, 'missing.md'), {
    status: 'unverified',
    reason: 'scan-limit',
  });
  inventory.gaps = [{ path: '.', reason: 'directory-unavailable' }];
  assert.deepEqual(inspectInventoryFile(inventory, 'RULES.md'), {
    status: 'unverified',
    reason: 'directory-unavailable',
  });
});

test('file parsing and agent metadata do not negate observed instruction bytes', () => {
  const inventory = scan({ 'package.json': '{ malformed' });
  inventory.gaps = [
    { path: 'package.json', reason: 'invalid-package-json' },
    { agent: 'future-tool', reason: 'agent-version-unverified' },
  ];
  assert.deepEqual(inspectInventoryFile(inventory, 'package.json'), {
    status: 'observed',
    hash: hashContent('{ malformed'),
  });
  assert.deepEqual(inspectInventoryFile(inventory, '../outside'), {
    status: 'unverified',
    reason: 'invalid-path',
  });
});

test('source lists are strict, bounded, unique and copied independently', () => {
  assert.deepEqual(validateInstructionSources([]), []);
  const maximum = Array.from({ length: 16 }, (_, index) => ({
    path: `docs/rules-${index}.md`,
    hash: hashContent(`rules:${index}`),
  }));
  const validated = validateInstructionSources(maximum);
  assert.deepEqual(validated, maximum);
  validated[0].path = 'changed.md';
  assert.equal(maximum[0].path, 'docs/rules-0.md');
  const valid = { path: 'RULES.md', hash: hashContent('rules') };
  const invalid: unknown[] = [
    null,
    undefined,
    {},
    'RULES.md',
    [null],
    [[]],
    [{}],
    [{ path: valid.path }],
    [{ hash: valid.hash }],
    [{ ...valid, loading: 'confirmed' }],
    [{ ...valid, [Symbol('hidden')]: true }],
    [Object.create(valid)],
    [valid, { ...valid, hash: hashContent('other') }],
    [...maximum, { path: 'extra.md', hash: valid.hash }],
    Array(1),
  ];
  for (const path of ['../RULES.md', '.', '/RULES.md', 'bad\nname', null])
    invalid.push([{ ...valid, path }]);
  for (const hash of [null, '', 'A'.repeat(64), `${valid.hash}\n`])
    invalid.push([{ ...valid, hash }]);
  for (const input of invalid)
    assert.throws(() => validateInstructionSources(input), {
      code: 'invalid-task-context',
    });
});
