import type {
  ScanOptions,
  PathOptions,
  FileRecord,
  PathReason,
  Command,
} from '../core/types.ts';
import path from 'node:path';
import { constants } from 'node:fs';
import { open, readdir, realpath, lstat } from 'node:fs/promises';
import { assert, hashContent, validateScanResult } from '../core/contracts.ts';
import {
  isSensitivePath,
  isInfrastructurePath,
  safePath,
  validateRelativePath,
} from '../core/paths.ts';

const IGNORED = new Set([
  '.git',
  'node_modules',
  '.next',
  '.nuxt',
  '.venv',
  'venv',
  '__pycache__',
  '.pytest_cache',
  '.DS_Store',
]);
const LANGUAGES: Record<string, string> = {
  '.js': 'javascript',
  '.jsx': 'javascript',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.ts': 'typescript',
  '.tsx': 'typescript',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.cs': 'csharp',
  '.java': 'java',
  '.rb': 'ruby',
  '.php': 'php',
};

export function infrastructurePath(relative: string) {
  return (
    isInfrastructurePath(relative) ||
    /(?:^|\/)\.cursorrules$/.test(relative) ||
    /(?:^|\/)\.(?:claude|cursor|codex)\/(?:settings(?:\.local)?\.json|config\.toml|commands\/|agents\/|skills\/|rules\/)/.test(
      relative,
    ) ||
    relative === '.tibicen/manifest.yml'
  );
}

export function exclusionReason(
  relative: string,
  forbiddenPaths: string[] = [],
) {
  if (
    forbiddenPaths.some(
      (item) =>
        relative === item.replace(/\/$/, '') ||
        relative.startsWith(`${item.replace(/\/$/, '')}/`),
    )
  )
    return 'forbidden-path';
  if (
    relative.split('/').some((part) => IGNORED.has(part)) ||
    relative === '.tibicen/state' ||
    relative.startsWith('.tibicen/state/')
  )
    return 'cache-or-metadata';
  if (
    isSensitivePath(relative) ||
    /(?:^|\/)(?:\.npmrc|\.netrc|\.pypirc|\.git-credentials|[^/]*credentials[^/]*\.json)$/i.test(
      relative,
    )
  )
    return 'sensitive-path';
  return null;
}

// Shared by scanning and snapshots: never read a symlink or a special device.
export async function readProjectFile(
  root: string,
  relative: string,
  options: PathOptions = {},
) {
  const filename = await safePath(root, relative, options);
  const handle = await open(
    filename,
    constants.O_RDONLY |
      (constants.O_NOFOLLOW ?? 0) |
      (constants.O_NONBLOCK ?? 0),
  );
  try {
    const before = await handle.stat();
    assert(
      before.isFile(),
      'unsupported-file',
      'Only regular files can be read.',
    );
    assert(
      before.size <= (options.maxFileBytes ?? 16 * 1024 * 1024),
      'file-too-large',
      'File exceeds the read limit.',
    );
    const content = await handle.readFile();
    const after = await handle.stat();
    assert(
      content.length <= (options.maxFileBytes ?? 16 * 1024 * 1024),
      'file-too-large',
      'File exceeds the read limit.',
    );
    assert(
      before.size === after.size &&
        before.mtimeMs === after.mtimeMs &&
        before.ctimeMs === after.ctimeMs,
      'tree-changed',
      'File changed while being read.',
    );
    return { content, mode: before.mode & 0o777 };
  } finally {
    await handle.close();
  }
}

export async function scanProject(
  root: string,
  {
    forbiddenPaths = [],
    maxFileBytes = 16 * 1024 * 1024,
    maxFiles = 10000,
    maxTotalBytes = 128 * 1024 * 1024,
    maxDepth = 40,
  }: ScanOptions = {},
) {
  for (const relative of forbiddenPaths)
    validateRelativePath(relative.replace(/\/$/, ''));
  const base = await realpath(root);
  assert(
    (await lstat(base)).isDirectory(),
    'invalid-root',
    'Project root must be a directory.',
  );
  const files: FileRecord[] = [],
    gaps: PathReason[] = [],
    excluded: PathReason[] = [],
    commands: Command[] = [];
  const languages = new Set<string>(),
    agents = new Set<string>();
  let entriesSeen = 0,
    totalBytes = 0,
    existing = false,
    limited = false;
  const gap = (relative: string, reason: string) =>
    gaps.push({ path: relative, reason });

  async function visit(relative = '', depth = 0) {
    if (depth > maxDepth) {
      gap(relative, 'depth-limit');
      return;
    }
    let entries;
    try {
      const directory = relative
        ? await safePath(base, relative, { forbiddenPaths })
        : base;
      entries = await readdir(directory, { withFileTypes: true });
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      gap(
        relative || '.',
        ['EACCES', 'EPERM'].includes(error.code ?? '')
          ? 'unreadable-directory'
          : 'directory-unavailable',
      );
      return;
    }
    entries.sort((a, b) => a.name.localeCompare(b.name));
    for (const entry of entries) {
      const name = relative ? `${relative}/${entry.name}` : entry.name;
      if (++entriesSeen > maxFiles) {
        limited = true;
        return;
      }
      const reason = exclusionReason(name, forbiddenPaths);
      if (reason) {
        excluded.push({ path: name, reason });
        if (reason !== 'cache-or-metadata') existing = true;
        continue;
      }
      existing = true;
      if (entry.isSymbolicLink()) {
        excluded.push({ path: name, reason: 'symlink' });
        gap(name, 'symlink-excluded');
        continue;
      }
      if (entry.isDirectory()) {
        await visit(name, depth + 1);
        if (limited) return;
        continue;
      }
      if (!entry.isFile()) {
        gap(name, 'unsupported-file');
        continue;
      }
      try {
        const { content, mode } = await readProjectFile(base, name, {
          forbiddenPaths,
          maxFileBytes,
        });
        totalBytes += content.length;
        if (totalBytes > maxTotalBytes) {
          limited = true;
          return;
        }
        const infrastructure = infrastructurePath(name);
        files.push({
          path: name,
          hash: hashContent(content),
          size: content.length,
          mode,
          infrastructure,
        });
        const language = LANGUAGES[path.posix.extname(name)];
        if (language && !infrastructure) languages.add(language);
        if (
          /(?:^|\/)(?:CLAUDE\.md|\.claude\/)/.test(name) ||
          name === '.mcp.json'
        )
          agents.add('claude-code');
        if (/(?:^|\/)(?:\.cursor\/|\.cursorrules$)/.test(name))
          agents.add('cursor');
        if (/(?:^|\/)\.codex\//.test(name)) agents.add('codex');
        if (!infrastructure && path.posix.basename(name) === 'package.json') {
          let manifest;
          try {
            manifest = JSON.parse(content.toString('utf8'));
          } catch {
            gap(name, 'invalid-package-json');
            continue;
          }
          if (
            !manifest ||
            typeof manifest !== 'object' ||
            Array.isArray(manifest)
          ) {
            gap(name, 'invalid-package-json');
            continue;
          }
          languages.add('javascript');
          const manager =
            /^(npm|pnpm|yarn)@/.exec(manifest.packageManager ?? '')?.[1] ??
            'npm';
          for (const [key, value] of Object.entries(manifest.scripts ?? {})) {
            if (
              !/^(?:build|test|lint)(?::[a-z0-9_-]+)?$/i.test(key) ||
              typeof value !== 'string'
            )
              continue;
            // Return a reference and hash, never a script body that may contain credentials.
            commands.push({
              id: `${name}:${key}`,
              kind: key.split(':')[0].toLowerCase(),
              executable: manager,
              argv: ['run', key],
              cwd: path.posix.dirname(name),
              envNames: [],
              trusted: false,
              source: {
                path: name,
                script: key,
                scriptHash: hashContent(value),
              },
            });
          }
        }
        if (
          ['pyproject.toml', 'requirements.txt', 'setup.py'].includes(
            path.posix.basename(name),
          )
        )
          languages.add('python');
        if (path.posix.basename(name) === 'go.mod') languages.add('go');
        if (path.posix.basename(name) === 'Cargo.toml') languages.add('rust');
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        gap(
          name,
          ['EACCES', 'EPERM'].includes(error.code ?? '')
            ? 'unreadable-file'
            : error.code === 'file-too-large'
              ? 'file-too-large'
              : 'file-unavailable',
        );
      }
    }
  }
  await visit();
  if (limited) gap('.', 'scan-limit');
  for (const agent of agents)
    gaps.push({ agent, reason: 'agent-version-unverified' });
  const complete = !gaps.some(
    (item) =>
      !['agent-version-unverified', 'invalid-package-json'].includes(
        item.reason,
      ),
  );
  return validateScanResult({
    schema: 1,
    root: base,
    kind: existing || gaps.length ? 'existing' : 'empty',
    mode: files.some((file) => file.infrastructure) ? 'improve' : 'init',
    files,
    languages: [...languages].sort(),
    commands,
    agents: [...agents].sort(),
    gaps,
    excluded,
    complete,
  });
}
