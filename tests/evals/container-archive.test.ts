import test from 'node:test';
import assert from 'node:assert/strict';
import {
  encodeFiles,
  decodeArchive,
  decodeFiles,
  transferLimits,
} from '../../scripts/evals/container/archive.ts';

test('container archive retains only declared bytes and encodes unprivileged ownership', () => {
  const files = {
    'src/math.js': Buffer.from('export const value = 3;'),
    'AGENTS.md': Buffer.from('fixture'),
  };
  const tar = encodeFiles(files);
  assert.deepEqual({ ...decodeFiles(tar, Object.keys(files)) }, files);
  const decoded = decodeArchive(tar, Object.keys(files));
  assert.deepEqual(decoded.files, decodeFiles(tar, Object.keys(files)));
  assert.deepEqual(
    { ...decoded.modes },
    { 'AGENTS.md': 0o644, 'src/math.js': 0o644 },
  );
  assert.equal(parseInt(tar.subarray(108, 115).toString(), 8), 1000);
  assert.throws(() => decodeFiles(tar, ['AGENTS.md']));
});

function checksum(tar: Buffer) {
  tar.fill(32, 148, 156);
  const sum = tar.subarray(0, 512).reduce((a, b) => a + b, 0);
  tar.write(sum.toString(8).padStart(6, '0') + '\0 ', 148, 8);
  return tar;
}

test('container collection observes ordinary file permissions without changing bytes', () => {
  for (const mode of [0o600, 0o644, 0o755]) {
    const tar = encodeFiles({ file: Buffer.from('same bytes') });
    tar.write(mode.toString(8).padStart(7, '0') + '\0', 100, 8);
    const decoded = decodeArchive(checksum(tar), ['file', 'absent']);
    assert.deepEqual({ ...decoded.files }, { file: Buffer.from('same bytes') });
    assert.deepEqual({ ...decoded.modes }, { file: mode });
    assert.deepEqual(decodeFiles(tar, ['file']), decoded.files);
  }
});

test('container archive rejects malformed and special file or directory modes', () => {
  for (const mode of [
    '0004755\0',
    '0002755\0',
    '0001755\0',
    '0100644\0',
    '7777777\0',
    '0000888\0',
    '-000644\0',
    'invalid\0',
  ]) {
    for (const file of ['file', 'directory/file']) {
      const tar = encodeFiles({ [file]: Buffer.from('data') });
      tar.write(mode, 100, 8);
      checksum(tar);
      assert.throws(() => decodeArchive(tar, [file]));
      assert.throws(() => decodeFiles(tar, [file]));
    }
  }
  const binaryMode = encodeFiles({ file: Buffer.from('data') });
  binaryMode.fill(0, 100, 108);
  binaryMode[100] = 0x80;
  binaryMode[107] = 0x44;
  assert.throws(() => decodeArchive(checksum(binaryMode), ['file']));
});

test('container archive rejects traversal, links, duplicate headers and limits', () => {
  for (const name of [
    '../escape',
    '/escape',
    'a/../escape',
    'a\\escape',
    'a//escape',
    'a' + String.fromCharCode(0) + 'escape',
    'a' + String.fromCharCode(31) + 'escape',
  ])
    assert.throws(() => encodeFiles({ [name]: Buffer.from('no') }));
  assert.throws(() =>
    encodeFiles({ large: Buffer.alloc(transferLimits.file + 1) }),
  );
  assert.throws(() =>
    encodeFiles({
      src: Buffer.from('file'),
      'src/math.js': Buffer.from('collision'),
    }),
  );
  const regular = encodeFiles({ file: Buffer.from('data') });
  const change = (type: number) => {
    const tar = Buffer.from(regular);
    tar[156] = type;
    return checksum(tar);
  };
  for (const type of [49, 50, 51, 52, 54, 120, 103])
    assert.throws(() => decodeFiles(change(type), ['file']));
  const duplicate = Buffer.concat([regular.subarray(0, 1024), regular]);
  assert.throws(() => decodeFiles(duplicate, ['file']));
  assert.throws(() => decodeFiles(regular.subarray(0, 700), ['file']));
  const traversal = Buffer.from(regular);
  traversal.fill(0, 0, 100);
  traversal.write('../escape', 0);
  assert.throws(() => decodeArchive(checksum(traversal), ['../escape']));
  assert.throws(() => decodeArchive(traversal, ['file']));
});
