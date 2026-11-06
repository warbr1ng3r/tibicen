# Native working task and memory: 6 November 2026

The useful task failed before completion. The later correction and fresh memory
read were stopped. This is a bounded development observation of published skills
1.4.1, not a product update, human usefulness study or compatibility claim.

## Starting project and requested work

The owned example is a dependency-free Node ticket formatter. It already has
working source and one test. The earlier accepted setup added AGENTS.md and one
memory store. Accepted decisions limit export batches to seven tickets and
require approval before adding dependencies. CSV export remains an unaccepted
idea. Seven project files are supplied; older receipts, runtime and checkers are
not supplied to the agent.

The request, in ordinary language, asks the agent to read AGENTS.md, add
chunkTickets(tickets), preserve order and the existing formatter, add tests and
run node --test. Only source and test edits are allowed. The current batch size
is deliberately absent from the request: the agent needs project context. Both
README and memory contain that decision; memory-use acceptance separately
requires an observed read of the actual memory body.
Reading AGENTS.md is explicit assistance, not proof of automatic discovery.

## Actual observations

| Phase | Observed result |
| --- | --- |
| Useful task M1 | Failed after 23.96 seconds; two commands completed successfully |
| Change the accepted limit to four, M2 | Not run; stopped after M1 |
| Fresh read of the corrected decision, M3 | Not run; stopped after M1 |

M1 used one actual Codex 0.157.0 / gpt-6-astra subscription-backed session with a
180-second deadline and a pinned network-isolated executor. It confirmed the
project working directory and read the exact AGENTS.md, source, test and package
bodies. No memory-body read, completed implementation or completed test run was
observed. An accepted executor process exited 127 with sandboxDenied false. Its
command and underlying cause remain unknown; that code alone proves neither a
missing executable nor an instruction-following defect.

The container stopped and was removed. No candidate files were collected, so
container changes and task quality are unverified. The original host project,
staged inputs and 74 earlier evidence files remained unchanged. Independent
review accepted the accuracy of this failure report, not the task.

Before M1, 21 model-free behavioral, preservation and negative controls passed in
a separate owned container. Those controls use Docker exec; they do not establish
the native process/start route or memory use. Native success, independent grading,
memory reading and human benefit remain separate observations.

## Demonstrated evaluator obstacle

Source review found a separate defect: the evaluator kills the entire session on
any nonzero command result, preventing normal agent recovery after a failing test
or mistaken command. Pinned upstream Codex treats ordinary exits as tool results.
The [separate recovery change](../../../../openspec/changes/preserve-recoverable-command-results/tasks.md)
owns the fix. A focused regression failed before the runtime edit; 73 focused
checks pass afterward, including byte-transparent forwarding, diagnostic limits
and terminal fault handling. The same independently reviewed model-free driver
ran once on each source: the first killed its container after an accepted exit1;
the second returned that exit1 and completed a later command with exit0 and exact
recovery-ok output in the same container. Both verified cleanup. The first
driver's wait ended before filling its ordinaryExit field; raw frames and the
matched first-failure receipt retain the actual exit1/no-denial evidence.

Only the session policy source changed among the 20 runtime files between those
controls. Each owned container had a 30-second bound, no network or mounts, and
no model or credentials. The full gate passed: 981 tests, no failures and one
existing manual skip. It included lint, formatting, types, site build, strict
spec validation and offline Node tests. After reconciling the specification text,
strict active/archived validation passed again; runtime and test hashes stayed
unchanged. All 100 distributed payload hashes/modes and the manifest match 1.4.1.
Independent source and final evidence integration reviews: Ship.
This regression proves ordinary-command recovery, not M1's command,
native task completion or memory use. M1 remains failed.

Later prelaunch review found a second stop in the native CLI event handler. The
owner-socket proof above bypasses that layer and therefore does not establish
recovery through the complete caller. The next native task was not launched;
the [separate CLI fix](../../../../openspec/changes/preserve-cli-command-results/tasks.md)
owns that regression and repair. The original reviews and source freezes retain
their exact earlier scope; private predecessor receipts remain untouched.

The [packet dashboard](../../../../.scratch/native-memory-followup/dashboard.md)
owns detailed status. Private receipts retain exact source/input hashes, raw
events and cleanup. No paid API, credential mutation, alternate route, automatic
retry, host writeback, commit, push or release occurred in this packet.
