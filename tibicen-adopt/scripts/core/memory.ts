import type { ProjectMemory } from './types.ts';
import { assert } from './contracts.ts';
export { instructionCandidate as memoryInstructionPath } from '../agents/profiles.ts';

export const MEMORY_PATHS = [
  '.agents/memory.md',
  'MEMORY.md',
  'docs/memory.md',
  'docs/decisions.md',
];

export function validateMemory(value: unknown): asserts value is ProjectMemory {
  const memory = value as ProjectMemory;
  assert(
    memory &&
      Object.keys(memory).sort().join(',') === 'ownership,path' &&
      MEMORY_PATHS.includes(memory.path) &&
      memory.ownership === 'user-memory',
    'invalid-memory',
    'Memory needs one supported project path and user-memory ownership.',
  );
}

export function resolveMemory(
  input: { path: string } | undefined,
  previous?: ProjectMemory,
): ProjectMemory | undefined {
  if (previous) validateMemory(previous);
  if (input === undefined) return previous;
  assert(
    input && Object.keys(input).join(',') === 'path',
    'invalid-memory',
    'Memory input accepts only its canonical path.',
  );
  const memory: ProjectMemory = { path: input.path, ownership: 'user-memory' };
  validateMemory(memory);
  assert(
    !previous || previous.path === memory.path,
    'invalid-memory',
    'Preserve the registered canonical memory; changing stores needs a separate migration.',
  );
  return memory;
}

export function memoryAllows(
  memory: ProjectMemory | undefined,
  relative: string,
) {
  return !!memory && memory.path === relative;
}

export function referencesMemory(content: string, memory: ProjectMemory) {
  const escaped = memory.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(
    `(^|[\\s\\x60("'])${escaped}(?=$|[\\s\\x60)"',;:]|\\.(?=$|\\s))`,
    'm',
  ).test(content);
}
