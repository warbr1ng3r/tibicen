# Real CLI acceptance

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

[Task 2.1](../../../openspec/changes/decouple-mcp-formats-from-harnesses/tasks.md),
CLI portion. Own tests/core/mcp-diagnosis-cli.test.ts and, only if necessary,
tests/core/mcp-portability-cli.test.ts. Runtime CLI changes require root agreement.
Exercise general observations, explicit formats under unknown IDs, native
fixtures, no writer escalation, stale hashes, no writes/leaks/launch. Root owns
frozen standalone, bundle pins and full gate.

## Answer

Extended the existing CLI suite to 11 tests without changing CLI runtime code.
An unknown host can select a supported reader; neither that selection nor a
known host selecting a different format grants a writer. Unknown/new host names
without an explicit contract remain manual. The real subprocess CLI exercises
all four new native contracts, both valid records and literal-env limits, plus
matching, stale and unavailable observations of a Python configuration.

Each native/observation run checks redacted output, unverified native activation
and connection, unchanged fixture bytes/modes and the complete project tree.
The Node server and Python source contain side-effect sentinels; neither was
executed. Invalid observation command/value fields and inconsistent disabled
state are rejected before malformed project state can be inspected.

Executed checks: Prettier write and focused ESLint passed; after the core agent
reported a complete implementation, `node --test
tests/core/mcp-diagnosis-cli.test.ts` passed 11/11 without skips. An earlier run
while the core implementation was in progress returned 4 pass / 7 fail and is
not treated as final regression evidence. These tests include 11 new real CLI
subprocess cases (eight native, three observation), alongside the prior stdin
case. No native host, model behavior or server connection was tested. Root owns
full-gate, frozen standalone, map/dashboard and task integration.
