# Observe native instructions without expanding writes

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Implement OpenSpec tasks2.1–2.2 against the agreed catalog exports. Own scripts/scan/index.ts, scripts/core/diagnosis.ts, scripts/core/memory.ts, scripts/verify/index.ts only if needed for candidate recognition, and related scan/diagnosis/memory/report/verify tests. Core lane owns catalog helper implementation; use exports instructionCandidate(relative), observedHarnesses(relative), harnessInfrastructurePath(relative), HARNESS_PROFILES/getHarnessProfile. Metadata API details arrive early from core. Keep checked adapterContracts unchanged; new catalog profile facts separate. Shared AGENTS/.agents do not identify one harness. Native instruction references are structural only; no new automatic write targets. Tests prove native observation/memory references, denied native writes, existing exclusions/symlinks/protected application preservation. No core/paths, compatibility, process, MCP, installer or eval edits. Root owns task checkboxes/trackers. Wait for actual shared module before running dependent checks; prepare edits against contract in parallel.

Canonical requirements and verification criteria are in the [change](../../../openspec/changes/archive/2026-11-05-catalog-harness-capabilities/tasks.md).

## Answer

Implemented shared native instruction observation, separate descriptive diagnosis
profiles and structural memory-reference recognition. Existing checked adapter
contracts and write authority remain unchanged. Focused checks passed: 74/74
scan/diagnosis/memory/report tests; 29/29 scope/apply tests; final10/10 diagnosis;
ESLint, Prettier, core typecheck and diff checks. No skips or native model calls.
Root retains full integration and independent review before final completion.
