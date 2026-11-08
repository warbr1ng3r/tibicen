# Proposal

## Why

The recommended read-only CLI cannot receive user-forbidden project paths. A disposable CLI reproduction confirmed that a completed plan's exclusions are not implicitly retained, yet the next report inventories that subtree and rejects an explicit exclusion in its task-context input.

## What Changes

- Add an optional literal JSON array `--forbidden-paths` to target-project inspection commands: scan, status, report, verify, MCP diagnosis and project-local MCP verification.
- Validate the complete request before project reads, combine it with active-plan exclusions and propagate it through recovery, inventory, structural checks and report evidence.
- Keep report task-context input, completed manifests and consent/schema contracts unchanged. Exclusions are explicit per-operation limits, not a persistent ACL.
- Explain how agents carry known constraints to every read-only invocation; preserve skipped/unreadable outcomes and existing unscoped behavior.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `verification-and-delivery`: explicit read-only project scopes and honest constrained diagnosis.

## Impact

The CLI, status/recovery read path, focused regression tests and short installed-stage guidance. No dependencies, model/auth/network probes, project writes, manifest migration, global-config policy or published artifact replacement. Explicit global Codex MCP configuration remains a separate selected-file operation; it must not silently accept a project-only scope.
