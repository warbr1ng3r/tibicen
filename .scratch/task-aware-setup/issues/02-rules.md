# Simple init/adopt behavior and memory handoff

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

First inspect installed skills, shared rules, memory behavior and relevant tests
read-only. Find concrete gaps on simple init/adopt requests; do not restate
already-shipped features as new. Read ponytail and writing-for-agents skills.
Propose minimal exact edits and verification; wait for the root's OpenSpec-bound
edit contract. Preserve approval, application files and useful existing rules.

Allowed edit paths: references/stage-scan.md, stage-inventory.md,
stage-agent-arch.md, stage-verify.md and stage-handoff.md; tests/skills/.
Implement task 2.1. Use report --input - with direct JSON context
{ agent, agentVersion?, cwd, targetPath? }, paths relative to root. Omit
unknown version/target; if selected identity is unavailable use legacy report
and describe the missing context, do not invent an ID.
No project docs, core, version, lockfile, commits or native sessions.

## OpenSpec contract

[Requirements and tasks](../../../openspec/changes/explain-task-aware-setup/tasks.md)
own the final behavior. Root alone updates task checkboxes.

## Answer

Five shared stage references now carry one context across both entry flows, recommendation, verification and handoff. Resource reachability includes anchors; targeted lane checks 7/7 and root integration 25/25 pass. No new memory schema or mandatory interview.

