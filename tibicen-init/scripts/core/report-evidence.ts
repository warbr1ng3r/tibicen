import type { ScanResult } from './types.ts';
import { validateRelativePath } from './paths.ts';
import { exclusionReason } from '../scan/index.ts';

export function isEvidencePath(value: unknown): value is string {
  if (
    typeof value !== 'string' ||
    value.length > 4096 ||
    /[\p{C}\u2028\u2029]/u.test(value)
  )
    return false;
  try {
    validateRelativePath(value);
    return true;
  } catch {
    return false;
  }
}

export const isEvidenceHash = (value: unknown): value is string =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);

const covers = (parent: string, relative: string) =>
  parent === '.' || parent === relative || relative.startsWith(`${parent}/`);

export function inspectInventoryFile(
  scan: ScanResult,
  relative: string,
  forbiddenPaths: string[] = [],
): {
  status: 'observed' | 'missing' | 'unverified';
  hash?: string;
  reason?: string;
} {
  if (!isEvidencePath(relative))
    return { status: 'unverified', reason: 'invalid-path' };
  const file = scan.files.find((item) => item.path === relative);
  const reason =
    exclusionReason(relative, forbiddenPaths) ??
    scan.excluded.find((item) => item.path && covers(item.path, relative))
      ?.reason ??
    scan.gaps.find(
      (item) =>
        item.path &&
        covers(item.path, relative) &&
        !['agent-version-unverified', 'invalid-package-json'].includes(
          item.reason,
        ) &&
        !(file && item.path === '.' && item.reason === 'scan-limit'),
    )?.reason;
  if (reason) return { status: 'unverified', reason };
  if (file) return { status: 'observed', hash: file.hash };
  return scan.complete
    ? { status: 'missing', reason: 'not-in-permitted-inventory' }
    : { status: 'unverified', reason: 'scan-incomplete' };
}
