# Native memory recovery: 6 November 2026

**Status: this bounded observation effort is complete.** C2 completed once in
35.98 seconds, passed deterministic grading and independent review, and received
root acceptance. C1 is accepted. R1's original frozen memory grade remains
failed; a separate corrected assessment accepted the same immutable result after
observation, without repeating the model session.
The earlier [failed working session](../2026-11-06-native-memory-followup/README.md)
remains failed. This report records evaluator repairs and actual observations, not a
predeclared overall grading pass or a new product release.

## The observed user-to-agent flow

The requests below are shortened English translations of the frozen prompts.

| User asks | Agent does | Observed result |
| --- | --- | --- |
| “Add ticket batching, keep the order and existing formatter, and add tests.” No batch size is supplied. | Reads project instructions, memory and README; uses the existing seven-ticket decision and changes source/tests. | Seven-ticket batching works. R1 completed; its original memory grade failed, and a separate corrected assessment was accepted after observation. |
| “Now use at most four. Update the project memory, implementation, tests and README.” | Replaces the current decision, updates those files and preserves dependency approval and the unaccepted CSV idea. | C1 completed; project tests, independent behavior checks and semantic review passed. |
| “How will the exporter split 13 tickets?” | Reads current memory, calls the actual chunkTickets function and explains the current decision without editing files. | C2 returned `[4,4,4,1]`; native completion, grading and independent acceptance passed. |

This is one small owned fixture on the configured Codex 0.157.0 / gpt-6-astra
subscription route. Every request explicitly instructs reading AGENTS.md. README
and code also carry the cap, so this observation does not isolate memory as the
cause of the answer or establish automatic discovery, general compatibility or
human usefulness.

## Project, request and intended actions

The example is a small Node ticket formatter with working source, one test and
no dependencies. Its seven files already include AGENTS.md and one project
memory file. Accepted decisions allow seven tickets per batch and require
approval for new dependencies; CSV export is only an idea.

The first request asks the agent to read AGENTS.md, add chunkTickets(tickets),
preserve order and the existing formatter, add tests and run node --test. It
does not supply the batch size. The agent should read the project context and
edit only source/tests. Reading AGENTS.md is explicit assistance; automatic
instruction discovery is not being tested.

Later, a separate request changes the limit to four and allows the corresponding
memory, source, test and obsolete README edits. A fresh read-only session should
then explain the current batching of 13 tickets from the current project
context. Those frozen R2/R3 phases were stopped after the original grade failure.

## What actually happened

| Check or phase | Current result |
| --- | --- |
| Original preparation controls | 23 model-free positive and negative cases passed; cleanup and input preservation verified |
| First R1 launch review | Needs changes; a second ordinary-command stop was found before launch |
| Original native phases | R1 completed once in 50 seconds; R2/R3 stopped |
| CLI caller regression | Failed before the fix; 34 focused checks passed afterward |
| Source validation | Full gate: 1002 passed, zero failed, one existing manual skip; independent Ponytail review: Ship; strict specifications: 35 current and 13 archived items passed |
| Revised controls | Fresh 23/23 passed; 13 input files/modes and cleanup verified |
| R1 original automated grade | Failed: its exit0-only proxy rejected a complete memory body from a compound command |
| Read-evidence amendment controls | 32 model-free cases passed |
| R1 corrected assessment | Accepted after observation using the same immutable bytes/events; original grade remains failed |
| C1 decision correction | Native session completed once in about 50 seconds; deterministic grade and independent semantic review passed; root accepted |
| C2 fresh read | Completed once in 35.98 seconds; deterministic grade and independent review passed; root accepted |

The first recovery proof used a real owner socket and an isolated executor: an
ordinary exit one could be followed by a successful command in the same
container. That proof bypassed the native CLI event handler. Earlier source
reviews missed a second stop there: a command item with failed status or a
nonzero exit still killed the caller before the agent could recover.

The new offline regression exercises that caller with synthetic events. Its
ordinary-command recovery case failed before the edit and passes afterward.
The 34 focused checks also retain terminal error/turn failure, failed file
patch, declined command, malformed result, cancellation and cleanup behavior.
They make no model or auth call and do not establish a completed native task.
The [CLI recovery change](../../../../openspec/changes/preserve-cli-command-results/tasks.md)
owns the source fix and remaining integration checks.

## Actual R1 actions and outcome

The agent read AGENTS.md, source/tests and package.json, then read the complete
current memory body. That output preceded its limit decision and first file
change. Its compound shell command ended 127 because a later git command was
unavailable; the separate cat exit status was not recorded. The agent recovered,
read README, added batching by seven and tests, then ran node --test after the
file change. The native turn completed successfully. Only the two allowed files
changed; all seven files were collected and cleanup/preservation passed.

The original frozen grader ran once and failed at its memory filter, which
requires the entire shell command to exit zero. All 19 grading inputs and modes
were preserved and its container cleaned up. Independent review confirms exact
ordered body delivery and sound code; this does not change the original grade
or turn it into a predeclared phase pass.

An explicit, separate **after-observation instrument amendment** was applied to
the same immutable R1 bytes and events. Its 32 controls passed. Complete body
output from a compound command requires independent read-command and ordering
review; it does not become automatic read success. That independent review
accepted the corrected R1 assessment, explicitly after observation. The original
grade remains failed and the R1 model session was not repeated.

## C1 correction and final fresh read

C1 used the amended rule fixed before its launch. The agent was asked to change
the maximum to four, update the one memory store, source/tests and obsolete
README statement, then run tests. It completed once in about 50 seconds. The
returned correction passed all eight project tests and 14 independent batching
cases; the seven-file collection and protected-file checks passed.

The checker left read attribution/ordering and the memory/README meaning for
independent review. That review passed and root accepted the exact C1 result;
deterministic signals alone were not used as semantic acceptance. The accepted
seven returned buffers seeded C2 after its independent launch review.

C2 completed once in 35.98 seconds. It read the complete current memory before
directly executing chunkTickets for 13 tickets, observed `[4,4,4,1]`, and explained
that the accepted four-ticket decision replaces seven. It also read the
dependency/CSV notes and kept all seven file bytes and modes unchanged. The
answer distinguished earlier successful tests from not rerunning the suite in
this read-only native session. Separately, the isolated grader passed all eight
project tests and 14 behavior cases. Host/staged preservation, the 106 closed
old-packet files and cleanup passed. Final independent read-attribution, ordering
and answer review returned Ship; root accepted the result.

## Preserved evidence and final acceptance

The unexecuted first revision's 25 metadata, control and readiness artifacts,
including its NeedsChanges review, were archived with their original bytes,
relative paths and modes. Archive index SHA-256:
`9e74b9065920842058a32d1d8bf54127e63b5b989891e902c3f5c6a9c3021a71`.
The 90 closed predecessor records, 74 original native artifacts, original host
project and 100 published 1.4.1 payloads remain preserved. Earlier failures and
reviews retain their actual scope; nothing was regraded as native success.

Revision two bound the current source gate, independent review and fresh controls
before the actual R1 launch. Its original R2/R3 remain stopped. The explicit
amendment used the two remaining observations: decision correction with a
150-second cap and fresh read with a 90-second cap, once each. Together with R1's
original 180-second cap this retains the original three-session/420-second limit, with no
automatic retries, fallback or paid API. Returned candidate code is checked only
inside owned network-isolated grading containers, never executed on the host.

Implementation, native completion and exact ordered R1 memory-body delivery were
observed; original overall phase acceptance failed on the measurement proxy and
the corrected assessment is explicitly separate. C1 adds a completed correction
with passing deterministic checks and independent semantic acceptance. C2 adds
the observed read-only answer with passing deterministic checks and final
independent acceptance. All three configured native sessions were
used once; no further native runs are planned by this packet. Human usefulness
and wider harness compatibility are unmeasured. No commit, push, version change
or publication is part of this report.
