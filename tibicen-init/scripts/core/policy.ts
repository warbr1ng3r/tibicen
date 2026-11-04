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
