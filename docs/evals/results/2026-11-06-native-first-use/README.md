# Native first-use observations — 6 November 2026

**Packet closed: Pages and offline fixes passed; native execution stopped after failed S1.**
Published skills remain [1.4.1](../2026-11-06-release-1.4.1/README.md).
The [work packet](../../../../.scratch/native-first-use/map.md) owns execution and
the [dashboard](../../../../.scratch/native-first-use/dashboard.md) owns status.
This is a technical observation on one owned synthetic Node project, not a human
pilot or a test of every harness/model combination.

## What was asked and observed

The project initially had package metadata, a README, one `formatTicket` function
and one built-in Node test. It had no agent instructions or memory. The simulated
owner selected project memory, a seven-ticket export limit and approval before
dependencies; CSV was an unconfirmed idea.

| Step | Request or action | Actual result |
| --- | --- | --- |
| Setup recommendation | Set up the agent and retain those decisions; show changes first. | One real Codex CLI session completed. It read the complete published skill and relevant resources, then used the actual CLI to propose `AGENTS.md` and `.agents/memory.md`. No application edits, extra tools or apply. |
| Operator application | Independently review and apply the exact proposal in an owned container. | Exact approved files were applied once; verify passed structure-only and status/report retained the required manual reading step. Operator approval is separate from the native recommender and is not human end-user consent. |
| Fresh working task — S1 | Add ticket batching using the project decisions. | Failed/incomplete after 20.856 seconds. Exact `AGENTS.md` reading and file inventory were observed; memory reading, implementation and task acceptance remain unverified. |
| Later correction — S2 | Replace the batch-limit decision and update the implementation. | Not run; stopped after S1 failure. Draft caller/prompt only, with no freeze, approval or attempt. |
| Fresh memory read — S3 | Explain the result using the corrected decision. | Not run; stopped after S1 failure. Draft caller/prompt only, with no freeze, approval or attempt. |

The configured route uses Codex CLI 0.157.0, `gpt-6-astra`, existing subscription
authentication and the repository's pinned container boundary. S0 completed in
116 seconds including caller setup; 14 native commands exited zero. The exact
proposal digest is `f8544e6a16bf080c183681ae878399127178aa9a6348aaea836f9d62a85b0300`.
Independent review verified full-body reads, the actual proposal invocation,
54 protected input files and all 55 unchanged host inputs. The container stopped
and was removed. The plan retains a required pending instruction/memory-reading
step; structural success must not be reported as completed activation.

Before inference, one model-free container round-tripped all 55 inputs, passed
the initial application test and rejected the unimplemented future export in a
held-out check. Those are separate preparation results. Native execution was
bounded to four total sequential launches, 570 seconds, no retry or paid API
route, stopping at the first failed stage. **Two native attempts actually ran:
S0 and S1.** The single operator apply was model-free and is not a third native
attempt. S1 failure stopped the packet; no repeat, replacement task, alternate
native route or S2/S3 launch followed.

The first operator checker incorrectly required the temporary session-state file
after finalization. Its original failing result is retained. Source inspection
and independent review confirmed that successful finalization removes transient
state while preserving `manual-action-required` in the manifest. The same 63-file
receipt passed corrected offline checks; apply was not repeated. All four actual
CLI calls had exited zero, approved content/modes and protected files matched,
and manifest/usage session identities agreed. Root explicitly staged only the
seven resulting project files for the fresh task; runtime, old proposal and
operator artifacts are excluded from its model context.

## Fresh-task failure and independent diagnosis

S1 used a new session with only the seven actual project files. Its prompt
explicitly requested reading `AGENTS.md` and adding `chunkTickets(tickets)`;
it did not supply the batch limit, memory path or memory content. The retained
trajectory has two completed commands, both exiting zero:

- `cat project/AGENTS.md`: its complete output matches the approved body.
- `pwd; rg --files project`: it reported the working directory and file inventory.

No explicit memory-body read, application edit, test execution or completed turn
is observed. The memory pointer in `AGENTS.md` is not evidence of reading memory.
The whole caller took 20,855.904292 ms; native CLI time was 17,199.418666 ms.
The raw result remains `pass: false`, `timedOut: false`, outer CLI exit code
`null`, `sourceUnchanged: null`. The container receipt reports `tool-failure`
with `toolFailure: {kind: process-exit, exitCode: 1}`; stop/removal succeeded.
The numeric process exit is not the outer CLI exit code.

Read-only source inspection and independent review establish the stopping
mechanism: a nonzero `process/exited` notification triggers the existing observer
to stop with an empty collection allowlist. The retained record lacks the process,
request and command correlation needed to identify the failed operation. Neither
of the two recorded successful commands may be blamed. The underlying cause is
unknown; no model, credential, rate-limit or Tibicen defect is inferred.

**Zero container files were collected.** Container writes, protected bytes and
modes therefore remain unverified. The original caller's five `protectedChanges`
and seven `invalidModes` labels arise from missing files/modes, as independently
reproduced offline; they are not evidence of mutation or permission changes.
The original projections and failed result are preserved. Separately, all seven
host input files retained their bytes/modes with no host writeback, and all twenty
runtime source hashes matched the freeze during later offline inspection. This
does not replace the original unavailable complete profile check.

Private primary records are `s1-outcome.json`, `s1-events.jsonl`,
`s1-collection.json` and `s1-host-preservation.json`. Independent assessment is
in `s1-result-review.md`/`.json`; the finite read-only diagnosis is in
`s1-failure-diagnosis.md`/`.json`. The original outcome SHA256 is
`71385b9ffd443d07205d7b21820c6e6056ba8afd2656200e364b34625eb04f2a`;
events SHA256 is `7094f91cf64f57c9ab1fe930f374ef5e6ef9bd02aeff48a852e4054d32bd4bb2`.
Review accepted the accurate report of failure, not the working task. The earlier
operator records (`operator-raw.json`, original `operator-outcome.json`, separate
`operator-independent-review.json`, `operator-corrected-review.json` and root
acceptance) retain the original checker failure and same-receipt correction.

No candidate task code was graded. Model-free oracle controls establish only
that the separate checker rejects its baseline and accepts its known-good
control; they are not native acceptance. S2/S3 drafts remain unexecuted, without
new controls, frozen inputs or grading. Diagnosis performed no new native,
Docker, auth or model calls. No new live attempt followed.

## Offline diagnostic follow-up

The [bounded change](../../../../openspec/changes/correlate-contained-tool-failures/tasks.md)
adds development-only request/start-response/exit matching with session-scoped
hashed identities and validated exit facts. Input observation is bounded; raw
commands, paths, environment, output and error text are not retained in the
diagnostic context. First-failure stopping, empty failure collection and cleanup
remain unchanged. The direct session freeze covers the owner/session sources;
the setup batch's recursive freeze covers its own result projection. The standard
profile now preserves the safe context in its existing collection artifact before
reporting a failed child; file bodies still become hashes/modes there.

This context can establish an internally matched accepted `process/start` and
exit; it cannot recover command text, join a CLI command string or explain the
underlying cause by itself. The original S1 result remains failed and its missing
command/collection remain unknown. Verification uses mocked transport only;
the [verification record](../../../../openspec/changes/correlate-contained-tool-failures/verification.md)
records the final 954-pass/one-skip repository gate, independent Ponytail Ship,
separate documentation review and all 100 unchanged published skill payloads.
All 74 original native records remain unchanged. These offline results do not
upgrade the failed working task or unperformed memory phases.

## Landing and current guides

[Pages 42245531201](https://github.com/warbr1ng3r/tibicen/actions/runs/42245531201)
deployed reviewed source `4ed6009071036f709793d052ff03ce3661901017`.
Fresh EN/RU browser and HTTP checks showed six preview rows, no redundant caption,
a working language switch and the unchanged 1.4.1 installation pin. Artifact
download timed out; no local official-ZIP equality comparison is claimed.

Current portability/capability-guide pointers were corrected to 1.4.1. Independent
Ponytail review passed; dated 1.1 snapshot bodies remained unchanged. Installed
skills still require Node ≥22.20; repository/site tooling has separate requirements.

## Limits

Explicit skill-file reading is assistance; automatic discovery is unverified.
Claude Code and bundled ZCode were identified, but no native session was launched
through them. MCP connection, broad compatibility and measured human benefit
remain unverified. No new skill release, credential change or additional source
commit is part of this packet. Raw prompts, events and receipts remain private.
