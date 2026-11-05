# Shared environment and scope explanation

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

First inspect shared diagnosis, scan, callers and tests read-only. Identify the
smallest concrete extension useful for init and adopt: selected host/version,
working directory and target path, expected instruction applicability with
honest uncertainty. Do not add a universal graph or infer loading. Report an
API proposal and exact files; wait for the root's OpenSpec-bound edit contract.

Allowed edit paths: scripts/core/diagnosis.ts and tests/core/diagnosis.test.ts.
Implement task 1.1. Export validateTaskContext(input: unknown) and TaskContext.
Root owns scripts/tibicen.ts and report CLI tests. No docs, skills, version, lockfile, commits or native sessions.

## OpenSpec contract

[Requirements and tasks](../../../openspec/changes/explain-task-aware-setup/tasks.md)
own the final behavior. Root alone updates task checkboxes.

## Answer

Implemented validated optional context and lexical taskScope without changing legacy fields or native evidence. Root independently ran diagnosis/report/resources: 25/25 pass; core lane also ran memory regressions and type/lint checks. Exact native loading remains unverified.

