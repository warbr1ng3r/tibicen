# Proposal

## Why

An instruction link to `docs/decisions.md#accepted` targets the registered memory file, but structural verification reports `missing-memory-connection`. The same link without the fragment passes. This false warning can prompt an unnecessary repair of working instructions.

## What Changes

- Recognize a fragment after an exact canonical project-memory path in the existing shared pointer matcher.
- Keep different filenames, prefixed/absolute/external paths and query-only destinations outside recognition.
- Exercise the actual read-only verifier and preserve the file, permission and native-loading boundaries.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `project-memory`: structural pointers may identify a section of the same canonical file.

## Impact

The change affects `scripts/core/memory.ts`, the connected memory regression tests and the English/Russian project-memory guide. There is no dependency, store/schema change, new write permission or native-agent claim. Published 1.5.2 remains unchanged until a separately prepared release.
