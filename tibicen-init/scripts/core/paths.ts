import type { PathOptions } from './types.ts';
import path from 'node:path';
import { lstat, realpath } from 'node:fs/promises';
import { assert } from './contracts.ts';

export function isSensitivePath(relative: string) {
  return (
    relative
      .split('/')
      .some((part) =>
        /^(?:\.env(?:\..*)?|secrets?|credentials?|id_(?:rsa|ed25519)|\.git|\.ssh|\.aws|\.gnupg)$/i.test(
          part,
        ),
      ) || /\.(?:pem|key|p12|pfx)$/i.test(relative)
  );
}

export function validateRelativePath(
  relative: string,
  { allowDot = false }: PathOptions = {},
) {
  assert(
    typeof relative === 'string' &&
      relative &&
      !relative.includes('\0') &&
      !relative.includes('\\'),
    'unsafe-path',
    'Expected a relative slash-separated path.',
  );
  assert(
    !path.isAbsolute(relative) &&
      !/^[a-z]:/i.test(relative) &&
      relative
        .split('/')
        .every((part) => part && part !== '..' && (allowDot || part !== '.')),
    'unsafe-path',
    'Path escapes its project.',
  );
  return relative;
}

export function isInfrastructurePath(relative: string) {
  return (
    /(?:^|\/)(?:AGENTS\.md|CLAUDE\.md)$/.test(relative) ||
    relative === '.cursorrules' ||
    relative === '.mcp.json' ||
    /^\.(?:claude|cursor)\/(?:rules|skills)\//.test(relative) ||
    /^\.agents\/skills\//.test(relative) ||
    relative === '.cursor/mcp.json'
  );
}

export async function safePath(
  root: string,
  relative: string,
  {
    forbiddenPaths = [],
    allowSensitive = false,
    allowDot = false,
  }: PathOptions = {},
) {
  validateRelativePath(relative, { allowDot });
  assert(
    allowSensitive || !isSensitivePath(relative),
    'forbidden-path',
    'Secret or repository metadata path is excluded.',
  );
  assert(
    !forbiddenPaths.some(
      (item) =>
        relative === item.replace(/\/$/, '') ||
        relative.startsWith(`${item.replace(/\/$/, '')}/`),
    ),
    'forbidden-path',
    'Path is forbidden by project constraints.',
  );
  const base = await realpath(root);
  let current = base;
  for (const part of relative.split('/')) {
    current = path.join(current, part);
    try {
      const stat = await lstat(current);
      assert(
        !stat.isSymbolicLink(),
        'unsafe-path',
        'Symlinks are not followed.',
      );
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      if (error.code !== 'ENOENT') throw error;
    }
  }
  return current;
}
