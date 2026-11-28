import type { ScanResult } from './types.ts';
import { assert } from './contracts.ts';
import { MEMORY_PATHS } from './memory.ts';
import {
  inspectInventoryFile,
  isEvidenceHash,
  isEvidencePath,
} from './report-evidence.ts';

export interface MemorySource {
  id: string;
  memoryPath: string;
  noteReference: string;
  sourcePath: string;
  baselineHash: string;
}

function label(value: unknown, maxLength: number): value is string {
  return (
    typeof value === 'string' &&
    value.length > 0 &&
    value.length <= maxLength &&
    value.trim() === value &&
    !/[\p{C}\u2028\u2029]/u.test(value)
  );
}

export function validateMemorySources(input: unknown): MemorySource[] {
  assert(
    Array.isArray(input) && input.length <= 16,
    'invalid-memory-sources',
    'Memory sources need at most sixteen explicit relations.',
  );
  const ids = new Set<string>();
  let memoryPath: string | undefined;
  return Array.from(input, (value: unknown) => {
    assert(
      value &&
        typeof value === 'object' &&
        !Array.isArray(value) &&
        [Object.prototype, null].includes(Object.getPrototypeOf(value)),
      'invalid-memory-sources',
      'Each memory source needs a plain relation object.',
    );
    const relation = value as Record<string, unknown>;
    const keys = Reflect.ownKeys(relation);
    assert(
      keys.length === 5 &&
        keys.every(
          (key) =>
            typeof key === 'string' &&
            [
              'id',
              'memoryPath',
              'noteReference',
              'sourcePath',
              'baselineHash',
            ].includes(key),
        ) &&
        label(relation.id, 64) &&
        !ids.has(relation.id) &&
        typeof relation.memoryPath === 'string' &&
        MEMORY_PATHS.includes(relation.memoryPath) &&
        (memoryPath === undefined || memoryPath === relation.memoryPath) &&
        label(relation.noteReference, 256) &&
        isEvidencePath(relation.sourcePath) &&
        isEvidenceHash(relation.baselineHash),
      'invalid-memory-sources',
      'Memory sources need unique IDs, one supported store, note references, relative sources and baseline SHA-256 hashes.',
    );
    ids.add(relation.id);
    memoryPath = relation.memoryPath;
    return {
      id: relation.id,
      memoryPath: relation.memoryPath,
      noteReference: relation.noteReference,
      sourcePath: relation.sourcePath,
      baselineHash: relation.baselineHash,
    };
  });
}

export function summarizeMemorySources(
  scan: ScanResult,
  relations: MemorySource[],
  forbiddenPaths: string[] = [],
  registeredMemoryPath?: string,
) {
  return {
    basis: 'caller-supplied-relations-and-current-project-scan' as const,
    notePresence: 'unverified' as const,
    entries: validateMemorySources(relations).map(
      ({ baselineHash, ...relation }) => {
        if (
          registeredMemoryPath !== undefined &&
          registeredMemoryPath !== relation.memoryPath
        ) {
          return {
            ...relation,
            memoryFileStatus: 'unverified' as const,
            status: 'unverified' as const,
            currentHash: null,
            reason: 'registered-memory-mismatch',
            action: 'inspect' as const,
          };
        }
        const memory = inspectInventoryFile(
          scan,
          relation.memoryPath,
          forbiddenPaths,
        );
        const source = inspectInventoryFile(
          scan,
          relation.sourcePath,
          forbiddenPaths,
        );
        const status =
          source.status === 'observed'
            ? source.hash === baselineHash
              ? ('unchanged' as const)
              : ('changed' as const)
            : source.status;
        return {
          ...relation,
          memoryFileStatus: memory.status,
          status,
          currentHash: source.status === 'observed' ? source.hash! : null,
          reason:
            status === 'unchanged' || status === 'changed'
              ? `source-bytes-${status}`
              : status === 'missing'
                ? 'source-missing'
                : (source.reason ?? 'source-unverified'),
          action:
            status === 'changed' || status === 'missing'
              ? ('review' as const)
              : status === 'unchanged' && memory.status === 'observed'
                ? ('keep' as const)
                : ('inspect' as const),
        };
      },
    ),
  };
}
