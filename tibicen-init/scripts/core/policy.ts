import type { Blocklist } from './types.ts';
import { readFile } from 'node:fs/promises';
import { assert, parseData } from './contracts.ts';

export async function loadBlocklist() {
  const blocklist = parseData(
    await readFile(
      new URL('../../references/blocklist.json', import.meta.url),
      'utf8',
    ),
  ) as { schema: number; entries: Extract<Blocklist, unknown[]> };
  assert(
    blocklist.schema === 1 && Array.isArray(blocklist.entries),
    'invalid-blocklist',
    'Unsupported advisory blocklist.',
  );
  return blocklist;
}

export function isSecretKey(key: string): boolean {
  return /token|password|api[_-]?key|secret|authorization|credential/i.test(
    key,
  );
}

export function isSecretPlaceholder(value: string): boolean {
  return /^(?:\$\{[^}]+\}|<[a-zA-Z0-9_-]+>|\[redacted\]|\*{3,})$/.test(
    value.trim(),
  );
}

export function containsLiteralSecret(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(
    ([key, child]) =>
      (isSecretKey(key) &&
        typeof child === 'string' &&
        !!child.trim() &&
        !isSecretPlaceholder(child)) ||
      containsLiteralSecret(child),
  );
}
