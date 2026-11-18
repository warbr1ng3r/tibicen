# Proposal

## Why

The portable workflow already supports uncatalogued hosts, but its handoff scatters the working directory, instruction selection and optional memory across separate instructions. A user should receive one usable first-task request without reconstructing those details or mistaking file presence for native loading.

## What Changes

- Consolidate the shared handoff into one copyable request using actual task context, reviewed applicable entrypoints and the selected memory when enabled.
- Preserve existing native or custom entrypoints and explain unavailable operations separately; available reading remains the agent's work.
- Keep structural verification, explicit reading, native discovery and fresh-task behavior distinct.
- Correct stale release/context descriptions in the paired portability guide and document the new handoff as Unreleased.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: a concrete first-task handoff from the existing capability-based workflow.

## Impact

Shared installed handoff reference, paired portability guide and focused resource-contract tests. No runtime report/status/schema changes, new registry, host adapter, memory store, dependency or paid observation. Windows execution is a separate change. No version bump, commit or publication belongs to this package.
