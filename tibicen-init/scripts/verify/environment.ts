import type { Stats } from 'node:fs';
import path from 'node:path';
import { constants } from 'node:fs';
import {
  chmod,
  lstat,
  mkdir,
  open,
  opendir,
  readlink,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { assert } from '../core/contracts.ts';
import {
  isSensitivePath,
  safePath,
  validateRelativePath,
} from '../core/paths.ts';

export interface NodeEnvironment {
  kind: 'local-node-modules';
  roots: string[];
  hash: string;
  files: number;
  bytes: number;
  platform: string;
  arch: string;
  nodeVersion: string;
}

type EnvironmentOptions = { forbiddenPaths?: string[] };
const MAX_ENTRIES = 50000;
const MAX_BYTES = 512 * 1024 * 1024;
const MAX_FILE_BYTES = 64 * 1024 * 1024;
const EXCLUDED_NAMES = new Set([
  '.bin',
  '.astro',
  '.vite',
  '.cache',
  '.modules.yaml',
  '.pnpm-workspace-state-v1.json',
  '.package-lock.json',
  '.yarn-integrity',
  '.yarn-state.yml',
]);
const inside = (root: string, candidate: string) =>
  candidate === root || candidate.startsWith(`${root}${path.sep}`);
const sameFile = (before: Stats, after: Stats) =>
  before.dev === after.dev &&
  before.ino === after.ino &&
  before.mode === after.mode &&
  before.size === after.size &&
  before.mtimeMs === after.mtimeMs &&
  before.ctimeMs === after.ctimeMs;

function selectedRoots(roots: string[]) {
  assert(
    Array.isArray(roots) && roots.length > 0 && roots.length <= MAX_ENTRIES,
    'invalid-node-environment',
    'A dependency environment requires explicit node_modules roots.',
  );
  for (const relative of roots) {
    validateRelativePath(relative);
    assert(
      path.posix.basename(relative) === 'node_modules',
      'invalid-node-environment',
      'Dependency roots must name node_modules directories.',
    );
  }
  const sorted = [...roots].sort();
  const selected = new Set(sorted);
  assert(
    selected.size === sorted.length &&
      sorted.every(
        (root) =>
          !root
            .split('/')
            .some(
              (_, index, parts) =>
                index > 0 && selected.has(parts.slice(0, index).join('/')),
            ),
      ),
    'invalid-node-environment',
    'Dependency roots must not overlap.',
  );
  return sorted;
}

function excluded(relative: string, forbiddenPaths: string[]) {
  return (
    isSensitivePath(relative) ||
    relative.split('/').some((name) => EXCLUDED_NAMES.has(name)) ||
    /(?:^|\/)\.pnpm\/lock\.yaml$/.test(relative) ||
    /(?:^|\/)(?:\.npmrc|\.netrc|\.pypirc|\.git-credentials|[^/]*credentials[^/]*\.json)$/i.test(
      relative,
    ) ||
    forbiddenPaths.some(
      (forbidden) =>
        relative === forbidden || relative.startsWith(`${forbidden}/`),
    )
  );
}

async function projectRoot(root: string) {
  const base = await realpath(root);
  assert(
    (await lstat(base)).isDirectory(),
    'invalid-node-environment',
    'The dependency project must be a directory.',
  );
  return base;
}

async function dependencyPath(base: string, relative: string) {
  return safePath(base, relative, { allowSensitive: true });
}

async function checkedLink(
  base: string,
  relative: string,
  target: string,
  forbiddenPaths: string[],
) {
  const linkTarget = (filename: string, value: string) => {
    assert(
      value.length > 0 &&
        !value.includes('\0') &&
        !value.includes('\\') &&
        !path.isAbsolute(value) &&
        !/^[a-z]:/i.test(value),
      'unsafe-node-environment',
      'Dependency links must be relative to the copied project.',
    );
    const resolved = path.resolve(path.dirname(filename), value);
    assert(
      inside(base, resolved) &&
        !excluded(
          path.relative(base, resolved).split(path.sep).join('/'),
          forbiddenPaths,
        ),
      'unsafe-node-environment',
      'Dependency links must stay within the permitted project paths.',
    );
    return resolved;
  };
  let pending = path
    .relative(base, linkTarget(path.join(base, relative), target))
    .split(path.sep);
  let current = base;
  let followed = 0;
  while (pending.length) {
    const part = pending.shift()!;
    if (!part) continue;
    const ancestor = path.relative(base, current).split(path.sep).join('/');
    if (ancestor) await dependencyPath(base, ancestor);
    current = path.join(current, part);
    let stat;
    try {
      stat = await lstat(current);
    } catch (caught) {
      // Capture-only trees can omit workspace source; execution checks its presence.
      if ((caught as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw caught;
    }
    if (stat.isSymbolicLink()) {
      assert(
        ++followed <= 40,
        'unsafe-node-environment',
        'Dependency links contain a cycle or excessive indirection.',
      );
      const resolved = linkTarget(current, await readlink(current));
      assert(
        !excluded(
          path
            .relative(base, path.join(resolved, ...pending))
            .split(path.sep)
            .join('/'),
          forbiddenPaths,
        ),
        'unsafe-node-environment',
        'Dependency links must stay within the permitted project paths.',
      );
      pending = [...path.relative(base, resolved).split(path.sep), ...pending];
      current = base;
    } else
      assert(
        stat.isDirectory() || (!pending.length && stat.isFile()),
        'unsafe-node-environment',
        'Dependency links cannot traverse special files.',
      );
  }
}

async function readPayload(base: string, relative: string, expected: Stats) {
  const filename = await dependencyPath(base, relative);
  const handle = await open(
    filename,
    constants.O_RDONLY |
      (constants.O_NOFOLLOW ?? 0) |
      (constants.O_NONBLOCK ?? 0),
  );
  try {
    const before = await handle.stat();
    assert(
      before.isFile() && sameFile(expected, before),
      'node-environment-changed',
      'A dependency file changed during inspection.',
    );
    assert(
      before.size <= MAX_FILE_BYTES,
      'node-environment-limit',
      'A dependency file exceeds the 64 MiB limit.',
    );
    const chunks: Buffer[] = [];
    let bytes = 0;
    for await (const chunk of handle.createReadStream({ autoClose: false })) {
      bytes += chunk.length;
      assert(
        bytes <= MAX_FILE_BYTES,
        'node-environment-limit',
        'A dependency file exceeds the 64 MiB limit.',
      );
      chunks.push(chunk);
    }
    const after = await handle.stat();
    assert(
      sameFile(before, after) &&
        sameFile(before, await lstat(await dependencyPath(base, relative))) &&
        bytes === before.size,
      'node-environment-changed',
      'A dependency file changed during inspection.',
    );
    return Buffer.concat(chunks, bytes);
  } finally {
    await handle.close();
  }
}

async function walkEnvironment(
  base: string,
  roots: string[],
  forbiddenPaths: string[],
  target?: string,
  created?: string[],
) {
  const hash = createHash('sha256');
  let entries = 0,
    files = 0,
    bytes = 0;
  const directories: { relative: string; mode: number }[] = [];
  const record = (value: unknown) => hash.update(`${JSON.stringify(value)}\n`);

  async function visit(relative: string) {
    const filename = await dependencyPath(base, relative);
    const before = await lstat(filename);
    assert(
      before.isDirectory(),
      'unsafe-node-environment',
      'Dependency roots and their ancestors must be real directories.',
    );
    record([relative, 'directory', before.mode & 0o777]);
    if (target) {
      const destination = await dependencyPath(target, relative);
      await mkdir(destination, { mode: 0o700 });
      if (roots.includes(relative)) created?.push(relative);
      directories.push({ relative, mode: before.mode & 0o777 });
    }
    const names: string[] = [];
    const directory = await opendir(filename);
    for await (const entry of directory) {
      assert(
        ++entries <= MAX_ENTRIES,
        'node-environment-limit',
        'The dependency environment exceeds the 50,000 entry limit.',
      );
      names.push(entry.name);
    }
    for (const name of names.sort()) {
      const child = `${relative}/${name}`;
      validateRelativePath(child);
      if (excluded(child, forbiddenPaths)) continue;
      // The leaf may be a link; every ancestor must still be a real directory.
      const parent = await dependencyPath(base, relative);
      const source = path.join(parent, name);
      const stat = await lstat(source);
      if (stat.isDirectory()) await visit(child);
      else if (stat.isSymbolicLink()) {
        const link = await readlink(source);
        await checkedLink(base, child, link, forbiddenPaths);
        assert(
          sameFile(
            stat,
            await lstat(path.join(await dependencyPath(base, relative), name)),
          ) && link === (await readlink(source)),
          'node-environment-changed',
          'A dependency link changed during inspection.',
        );
        record([child, 'link', link]);
        if (target)
          await symlink(
            link,
            path.join(await dependencyPath(target, relative), name),
          );
      } else {
        assert(
          stat.isFile(),
          'unsafe-node-environment',
          'Dependency environments accept only directories, files and internal links.',
        );
        assert(
          bytes + stat.size <= MAX_BYTES,
          'node-environment-limit',
          'The dependency environment exceeds the 512 MiB limit.',
        );
        const content = await readPayload(base, child, stat);
        files++;
        bytes += content.length;
        record([
          child,
          'file',
          stat.mode & 0o777,
          content.length,
          createHash('sha256').update(content).digest('hex'),
        ]);
        if (target) {
          const destination = await dependencyPath(target, child);
          await writeFile(destination, content, { flag: 'wx', mode: 0o600 });
          await chmod(destination, stat.mode & 0o777);
        }
      }
    }
    assert(
      sameFile(before, await lstat(await dependencyPath(base, relative))),
      'node-environment-changed',
      'A dependency directory changed during inspection.',
    );
  }

  for (const root of roots) {
    assert(
      ++entries <= MAX_ENTRIES,
      'node-environment-limit',
      'The dependency environment exceeds the 50,000 entry limit.',
    );
    assert(
      !excluded(root, forbiddenPaths),
      'unsafe-node-environment',
      'A dependency root is excluded by project constraints.',
    );
    await visit(root);
  }
  for (const { relative, mode } of directories.reverse())
    await chmod(await dependencyPath(target!, relative), mode);
  return {
    kind: 'local-node-modules' as const,
    roots,
    hash: hash.digest('hex'),
    files,
    bytes,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  };
}

function forbidden(options: EnvironmentOptions) {
  return (options.forbiddenPaths ?? []).map((relative) =>
    validateRelativePath(relative.replace(/\/$/, '')),
  );
}

export async function inspectNodeEnvironment(
  root: string,
  roots: string[],
  options: EnvironmentOptions = {},
): Promise<NodeEnvironment> {
  return walkEnvironment(
    await projectRoot(root),
    selectedRoots(roots),
    forbidden(options),
  );
}

export async function copyNodeEnvironment(
  sourceRoot: string,
  targetRoot: string,
  expected: NodeEnvironment,
  options: EnvironmentOptions = {},
): Promise<void> {
  assert(
    expected?.kind === 'local-node-modules' &&
      /^[a-f0-9]{64}$/.test(expected.hash) &&
      Number.isInteger(expected.files) &&
      expected.files >= 0 &&
      expected.files <= MAX_ENTRIES &&
      Number.isInteger(expected.bytes) &&
      expected.bytes >= 0 &&
      expected.bytes <= MAX_BYTES,
    'invalid-node-environment',
    'A dependency copy requires its approved environment identity.',
  );
  assert(
    expected.platform === process.platform &&
      expected.arch === process.arch &&
      expected.nodeVersion === process.version,
    'node-environment-runtime-mismatch',
    'The approved dependency runtime differs from this Node runtime.',
  );
  const roots = selectedRoots(expected.roots);
  const source = await projectRoot(sourceRoot);
  const target = await projectRoot(targetRoot);
  assert(
    !inside(source, target) && !inside(target, source),
    'unsafe-node-environment',
    'A dependency copy requires a separate destination project.',
  );
  const forbiddenPaths = forbidden(options);
  const unchanged = (actual: NodeEnvironment) =>
    assert(
      actual.hash === expected.hash &&
        actual.files === expected.files &&
        actual.bytes === expected.bytes,
      'node-environment-changed',
      'The dependency environment differs from its approved identity.',
    );
  for (const root of roots) {
    const destination = await dependencyPath(target, root);
    try {
      await lstat(destination);
      assert(
        false,
        'unsafe-node-environment',
        'Dependency destination roots must be absent.',
      );
    } catch (caught) {
      if ((caught as NodeJS.ErrnoException).code !== 'ENOENT') throw caught;
    }
  }
  const created: string[] = [];
  try {
    for (const root of roots) {
      const parts = root.split('/');
      for (let count = 1; count < parts.length; count++) {
        const ancestor = await dependencyPath(
          target,
          parts.slice(0, count).join('/'),
        );
        try {
          await mkdir(ancestor, { mode: 0o700 });
        } catch (caught) {
          if ((caught as NodeJS.ErrnoException).code !== 'EEXIST') throw caught;
          assert(
            (await lstat(ancestor)).isDirectory(),
            'unsafe-node-environment',
            'Dependency destination ancestors must be directories.',
          );
        }
      }
    }
    unchanged(
      await walkEnvironment(source, roots, forbiddenPaths, target, created),
    );
  } catch (caught) {
    for (const root of created)
      await rm(await dependencyPath(target, root), {
        recursive: true,
        force: true,
      });
    throw caught;
  }
}
