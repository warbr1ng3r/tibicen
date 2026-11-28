import type { ScanResult } from './types.ts';
import { assert } from './contracts.ts';
import {
  inspectInventoryFile,
  isEvidenceHash,
  isEvidencePath,
} from './report-evidence.ts';

export interface InstructionSource {
  path: string;
  hash: string;
}

export function validateInstructionSources(
  input: unknown,
): InstructionSource[] {
  assert(
    Array.isArray(input) && input.length <= 16,
    'invalid-task-context',
    'Instruction sources must be a list of at most sixteen unique paths and hashes.',
  );
  const seen = new Set<string>();
  return Array.from(input, (item, index) => {
    assert(
      Object.hasOwn(input, index) &&
        item &&
        typeof item === 'object' &&
        !Array.isArray(item) &&
        [Object.prototype, null].includes(Object.getPrototypeOf(item)) &&
        Reflect.ownKeys(item).every(
          (key) => typeof key === 'string' && ['path', 'hash'].includes(key),
        ) &&
        Object.hasOwn(item, 'path') &&
        Object.hasOwn(item, 'hash') &&
        isEvidencePath(item.path) &&
        isEvidenceHash(item.hash) &&
        !seen.has(item.path),
      'invalid-task-context',
      'Each instruction source needs only a unique canonical relative path and a lowercase SHA-256 hash.',
    );
    seen.add(item.path);
    return { path: item.path, hash: item.hash };
  });
}

export function summarizeInstructionSources(
  scan: ScanResult,
  sources: InstructionSource[],
  forbiddenPaths: string[] = [],
): {
  path: string;
  basis: 'caller-supplied';
  status: 'matched-current-file' | 'stale' | 'unavailable';
  hash?: string;
  reason?: string;
}[] {
  return validateInstructionSources(sources)
    .sort((a, b) => a.path.localeCompare(b.path))
    .map(({ path, hash }) => {
      const current = inspectInventoryFile(scan, path, forbiddenPaths);
      if (current.status !== 'observed')
        return {
          path,
          basis: 'caller-supplied',
          status: 'unavailable',
          reason: current.reason,
        };
      return {
        path,
        basis: 'caller-supplied',
        status: current.hash === hash ? 'matched-current-file' : 'stale',
        hash: current.hash,
        ...(current.hash === hash ? {} : { reason: 'source-hash-mismatch' }),
      };
    });
}
