# Recognize existing nested memory connections

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

The owner's autonomous continuation permits this reproduced defect repair.
[Change](../../../openspec/changes/archive/2026-11-05-detect-nested-memory-connections/proposal.md),
[tasks](../../../openspec/changes/archive/2026-11-05-detect-nested-memory-connections/tasks.md).
Agent owns only `scripts/core/memory.ts` and `tests/core/memory.test.ts` (or one
new focused `tests/verify/memory-connections.test.ts` if existing fixture reuse is
unsuitable; report choice before writing). Root owns artifacts, guide/changelog
copies and integration. Fix recognition of safely observed existing nested native
rules without changing the write allowlist, pointer resolution, scan policy or
loading claims. Add meaningful regressions and pass focused tests/types/lint;
no native/model/network calls, version edits, commits or publication. Begin only
after root confirms strict contract validation and CLI apply readiness.

## Answer

Pre-fix reproduction confirmed root/nested inconsistency in 13 controlled cases,
with three real protected-write refusals. Original observations and one fixture
harness correction retained under `.evals-private/nested-memory-instructions-20261105/`.

Implementation changed only the two predicate patterns and added 15 focused
real-scan/verification cases in the existing memory test file. Positive tests
before the fix: 5 passed / 3 failed, exactly on the three nested native forms.
After the fix, memory/diagnosis/report suites passed 45/45 with zero skips; pinned
core types, scoped lint/format and whitespace checks passed. Write allowlist,
pointer matcher, scanner and native-loading claims are unchanged. Independent
review and changed-byte integration remain with ticket 09.
