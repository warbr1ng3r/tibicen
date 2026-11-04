# Recognize existing nested memory connections

## Why

A permitted nested Cursor/Claude rule can contain the same explicit project-root
memory pointer accepted in a root rule, appear in diagnosis, and still produce
`missing-memory-connection`. Disposable real-scan/verification fixtures reproduced
this false positive; it can lead adopt to suggest an unnecessary replacement.

## What Changes

- Recognize existing nested `.cursorrules` and `.cursor/rules/` / `.claude/rules/`
  files with the same supported extensions during structural memory checks.
- Keep exact root-relative memory-pointer matching, safe reads, forbidden paths,
  symlink protection, scan limits and write permissions unchanged.
- Regress the observed false positive and negative controls. Loading, behavioral
  use and task-wide applicability remain unverified.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `project-memory`: permitted existing nested instruction pointers count as
  structural connections without authorizing writes or proving native loading.

## Impact

One read-only path predicate in `scripts/core/memory.ts`, focused memory tests,
existing EN/RU guides and Unreleased entries. No new CLI, schema, memory store,
dependency, native-agent run or version/publication change. The owner's autonomous
continuation covers this bounded defect repair; Git commits remain separately
controlled by the repository instructions. Pre-fix observations and harness
correction history are retained under
`.evals-private/nested-memory-instructions-20261105/`.
