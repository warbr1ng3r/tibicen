# Implement pure current diagnosis

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Own only scripts/core/diagnosis.ts and tests/core/diagnosis.test.ts, OpenSpec group 2. Pure projection of fresh scan/structure and minimal recorded session facts; return deterministic current findings, instruction candidates/directories, bounded matrix facts, explicit loading/use unknowns and conservative next action. No filesystem/network/commands inside projection, new schemas or dependencies. Root owns CLI/types/integration. Begin edits only after root confirms common artifacts ready; send tested result and changed paths.

## Answer

Pure projection and nine focused tests passed after review fixes; CLI diagnosis adds four integration regressions. Full types and repository gate passed. A later explicit scope extension updated the contained-setup profile's exact count from 45 to 46 assets per skill and required-resource exact hash assertions, including the new diagnosis module; its focused suite passed 9/9 and independent re-review returned Ship. See [verification](../../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/verification.md).
