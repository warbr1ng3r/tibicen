# Audit installation beyond three agent choices

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read-only pinned skills@1.7.4 code and landing audit. Establish actual installer behavior and a small generic installation flow with an honest fallback. No speculative agent flags, installation, tracked edits or public writes.

## Answer

Pinned skills@1.7.4 explicitly supports universal into the common user-scope .agents/skills folder. Omitting --agent can select all targets. Generic entry must retain --agent universal, complete resources, explicit loading and archive/manual-folder fallback. Private audit: `.evals-private/harness-portability-20261105/installation-audit.md`.
