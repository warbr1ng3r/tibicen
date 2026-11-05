# Guides and acceptance cases

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

First inspect canonical guides and existing evaluation routes read-only. Propose
concise EN/RU guide updates and bounded acceptance cases for new and existing
projects, intentional subtree differences, unknown harness and later memory use.
Distinguish offline mechanics from native loading and actual model behavior.
Wait for the root's OpenSpec-bound edit contract.

Allowed edit paths: docs/ADOPT_DIAGNOSIS.md + _ru.md,
docs/HARNESS_PORTABILITY.md + _ru.md, docs/PROJECT_MEMORY.md + _ru.md.
Implement tasks 1.3 and 2.2. CLI input is a direct JSON context object
{ agent, agentVersion?, cwd, targetPath? }; project-relative paths, cwd may be dot.
Document Unreleased scope and do not claim new native observations. Root owns
CHANGELOG, roadmap, tracker, OpenSpec and integration results. No skills, core,
version, lockfile, commits or native sessions.

## OpenSpec contract

[Requirements and tasks](../../../openspec/changes/explain-task-aware-setup/tasks.md)
own the final behavior. Root alone updates task checkboxes.

## Answer

Three guide pairs updated. Agent checked 36 local links/anchors and executed both stdin examples, file input and legacy report against a preserved five-file fixture. New context is explicitly Unreleased; loading/use remain unverified.

