import assert from 'node:assert/strict';

export const transferLimits = {
  entries: 512,
  file: 1024 * 1024,
  total: 16 * 1024 * 1024,
};

export function relativeFile(value: string) {
  assert(typeof value === 'string' && value.length > 0 && value.length <= 255);
  assert(
    !value.startsWith('/') &&
      !/[\\:]/.test(value) &&
      [...value].every((character) => character.charCodeAt(0) >= 32),
  );
  assert(
    value.split('/').every((part) => part && part !== '.' && part !== '..'),
  );
  return value;
}

function number(header: Buffer, offset: number, width: number) {
  const text = header
    .subarray(offset, offset + width)
    .toString('utf8')
    .replace(/\0.*$/, '')
    .trim();
  assert(/^[0-7]*$/.test(text), 'invalid-container-archive');
  return text ? parseInt(text, 8) : 0;
}

function checksum(header: Buffer) {
  let sum = 0;
  for (let i = 0; i < 512; i++) sum += i >= 148 && i < 156 ? 32 : header[i];
  return sum;
}

// Fixed ustar subset. No archive is extracted into the host filesystem.
export function encodeFiles(files: Record<string, Buffer>, prefix = '') {
  const parts: Buffer[] = [],
    dirs = new Set<string>(),
    written = new Set<string>();
  let total = 0,
    entries = 0;
  const add = (name: string, bytes: Buffer, directory = false) => {
    relativeFile(name);
    assert(!written.has(name), 'duplicate-container-input-path');
    written.add(name);
    assert(
      ++entries <= transferLimits.entries &&
        bytes.length <= transferLimits.file,
    );
    total += bytes.length;
    assert(total <= transferLimits.total);
    const h = Buffer.alloc(512);
    let leaf = name,
      parent = '';
    if (Buffer.byteLength(name) > 100) {
      const split = name.lastIndexOf('/');
      parent = name.slice(0, split);
      leaf = name.slice(split + 1);
      assert(
        split > 0 &&
          Buffer.byteLength(parent) <= 155 &&
          Buffer.byteLength(leaf) <= 100,
      );
    }
    h.write(leaf, 0, 100);
    const octal = (value: number, offset: number, width: number) => {
      const text = value.toString(8).padStart(width - 1, '0') + '\0';
      assert(text.length === width);
      h.write(text, offset, width, 'ascii');
    };
    octal(directory ? 0o755 : 0o644, 100, 8);
    octal(1000, 108, 8);
    octal(1000, 116, 8);
    octal(bytes.length, 124, 12);
    octal(0, 136, 12);
    h[156] = directory ? 53 : 48;
    h.write('ustar\0', 257);
    h.write('00', 263);
    h.write(parent, 345, 155);
    h.write(checksum(h).toString(8).padStart(6, '0') + '\0 ', 148, 8);
    parts.push(h, bytes, Buffer.alloc((512 - (bytes.length % 512)) % 512));
  };
  const names = Object.keys(files).sort();
  for (const name of names) {
    relativeFile(name);
    assert(Buffer.isBuffer(files[name]));
    const full = prefix ? relativeFile(prefix) + '/' + name : name;
    const segments = full.split('/');
    for (let i = 1; i < segments.length; i++) {
      const dir = segments.slice(0, i).join('/');
      if (!dirs.has(dir)) {
        add(dir, Buffer.alloc(0), true);
        dirs.add(dir);
      }
    }
    add(full, files[name]);
  }
  parts.push(Buffer.alloc(1024));
  return Buffer.concat(parts);
}

export function decodeArchive(archive: Buffer, allowed: readonly string[]) {
  assert(
    archive.length <= transferLimits.total + transferLimits.entries * 1024,
  );
  const allow = new Set(allowed.map(relativeFile)),
    seen = new Set<string>();
  assert(allow.size === allowed.length && allow.size <= transferLimits.entries);
  const files: Record<string, Buffer> = Object.create(null);
  const modes: Record<string, number> = Object.create(null);
  let offset = 0,
    total = 0,
    entries = 0,
    ended = false;
  while (offset + 512 <= archive.length) {
    const h = archive.subarray(offset, offset + 512);
    offset += 512;
    if (h.every((byte) => byte === 0)) {
      ended = true;
      break;
    }
    assert(
      ++entries <= transferLimits.entries && number(h, 148, 8) === checksum(h),
      'invalid-container-archive',
    );
    const text = (start: number, width: number) =>
      h
        .subarray(start, start + width)
        .toString('utf8')
        .replace(/\0.*$/, '');
    const prefix = text(345, 155),
      leaf = text(0, 100);
    const raw = (prefix ? prefix + '/' : '') + leaf;
    const name = raw.replace(/^\.\//, '').replace(/\/$/, '');
    const mode = number(h, 100, 8),
      size = number(h, 124, 12),
      type = h[156];
    assert(mode <= 0o777, 'unsafe-container-archive-mode');
    assert(
      size <= transferLimits.file && offset + size <= archive.length,
      'invalid-container-archive',
    );
    assert(
      type === 0 || type === 48 || type === 53,
      'unsafe-container-archive-type',
    );
    if (name) {
      relativeFile(name);
      assert(!seen.has(name), 'duplicate-container-archive-path');
      seen.add(name);
      if (type === 53) {
        assert(
          size === 0 && [...allow].some((file) => file.startsWith(name + '/')),
          'unexpected-container-directory',
        );
      } else {
        assert(allow.has(name), 'unexpected-container-file');
        total += size;
        assert(total <= transferLimits.total);
        files[name] = Buffer.from(archive.subarray(offset, offset + size));
        modes[name] = mode;
      }
    } else assert(type === 53 && size === 0);
    offset += Math.ceil(size / 512) * 512;
  }
  assert(
    ended && archive.subarray(offset).every((byte) => byte === 0),
    'invalid-container-archive-end',
  );
  return { files, modes };
}

export function decodeFiles(archive: Buffer, allowed: readonly string[]) {
  return decodeArchive(archive, allowed).files;
}
