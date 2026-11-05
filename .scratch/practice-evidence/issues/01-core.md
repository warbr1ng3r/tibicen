# Implement core version input and offline delivery checks

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Own scripts/tibicen.ts, scripts/discovery/practices.ts,
tests/discovery/practices.test.ts and a dedicated tests/core/practices-cli.test.ts.
Implement OpenSpec tasks 1.1–1.2. Read the frozen proposal/spec/design/tasks before
editing. Reuse shared validation and inputData. Match validated optional
agentVersions shape, old invocation, read-only boundaries and applicability.
Run focused tests and check standalone init/adopt outside a checkout with offline
fetch. Do not edit shared docs/tracker/OpenSpec/package or commit. Return exact
checks and any failures/limits. Root marks tasks after inspecting evidence.

## Answer

Implemented optional version input with shared map/envelope validation before HTTP; old invocation and requires-agent-assessment preserved. Focused discovery/standalone tests9/9 and existing CLI5/5 pass, no skips; core typecheck, targeted ESLint/Prettier and diff checks pass. Built init/adopt execute outside a removed checkout using offline fetch; stdin/file, missing/partial versions, invalid inputs, failures and unchanged app/home/install checked. Root inspected code/tests. No native runs or schema/package/dependency/version changes.
