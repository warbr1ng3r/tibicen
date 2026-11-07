# First-run investigation — 7 November 2026

**Fresh observation: the agent applied both setup proposals through Tibicen.
Initial setup also passed a fresh useful task. The useful task after improvement
ended with a native session error and is not accepted.** Published 1.5.0 is unchanged.

## What the projects were and what actually happened

These are two small synthetic JavaScript modules, with no dependencies or database.
Both already had source code, two tests, a README and a Node CI check. They are
technical fixtures, not recruited users' projects. The short requests below are
English translations of the Russian prompts; additional evaluation instructions
specified explicit skill reading, allowed files and consent boundaries.

| Step | Initial setup: Tiny tasks | Improvement: Notes service |
| --- | --- | --- |
| Before | Creates and lists tasks. No agent instructions, skills or memory | Creates and lists notes. Existing instructions, accepted decisions in `.agents/memory.md`, and a local workflow skill with a stale `npm run check` command |
| User asks | “Prepare this project for work with an agent. I want to add small features without extra fuss. Show what you will change first.” | “Sort out the agent setup in this project. We will add note search soon. Show what you will change first.” |
| Agent proposes | Add one `AGENTS.md` with project rules. No memory file, extra skills or MCP | Correct the workflow to `node --test`; append memory maintenance rules to `AGENTS.md` and register the existing memory store |
| Consent | Agent initially offered a direct-write alternative because the evaluation demanded full bytes even for generated journals. Root rejected that route and approved the existing, unchanged CLI proposal and its generated service records | Agent showed both diffs, disclosed generated service records and requested consent to the full plan. Root approved it without an extra route correction |
| Agent applies | Actual CLI apply, verify, status and report completed. Instructions matched the approved content | Actual CLI apply, verify, status and report completed. Existing decisions and memory bytes were preserved |
| Fresh user task | Add an option to show only unfinished tasks, preserving order and old behavior | Add case-insensitive note text search; an empty query returns all notes |
| Fresh agent actions | Read the instructions, changed only source/tests, retained old checks and ran `node --test` | Read instructions, memory and workflow, changed only source/tests and ran `node --test` |
| Accepted result | Independent functional checks and the project test run passed: **5/5 named tests** | Native test command exited 0, reporting **one test file**. A terminal error followed before completion/final answer. No independent task grade ran; **task not accepted** |

Application itself did not run project tests: those proposals authorized no
project commands. Their reports correctly said project checks were unverified.
The later source/test tasks had separate explicit authorization. They were
preselected tasks, not unchanged execution of the agents' suggested next requests.

## What was measured and what remains unknown

The new execution effort (`../../../.scratch/first-run-execution-20261107/map.md`; private development record; excluded from public source)
and dashboard (`../../../.scratch/first-run-execution-20261107/dashboard.md`; private development record; excluded from public source) are
closed. Six native calls ran on the pinned contained Codex 0.157.0 subscription
route, requesting gpt-6-astra: five phases were accepted; the sixth stopped on a
terminal error. Native command intervals totaled **404.76 seconds**; whole
runner intervals totaled **421.18 seconds**, excluding preparation and reviews.
These are elapsed technical intervals, not active human time. Backend request
counts and the served model were not independently verified.

There were 55 shell command results, including seven ordinary nonzero search/read
results that recovered within their sessions. They are separate from the final
terminal session failure. Two model-free containers ran: task controls (2 positive /
6 negative) and the actual initial-setup task grade. Both were removed, as were
all six native containers. The third model-free allowance was not used after STOP.
All 20 frozen runner sources and 130 prepared assets remained unchanged.

Count assistance explicitly: two exact root approvals, two proposal extractions
into continuation inputs, and one additional initial-setup route correction.
Every setup session explicitly read the staged skill; fresh tasks explicitly
read project instructions. This does not establish automatic discovery, unaided
conversation retention, a causal benefit from those instructions, other harness
compatibility or saved human effort. There was no direct comparison in this packet.
The previous equal-result comparison remains counterevidence below.

Both repeat checks were omitted **before launch** after finding that the evaluator
restages files as `0644` while the initial manifest records approved `0600`.
A resulting permission mismatch would confound a sufficiency check. Neither the
manifest nor criteria were rewritten to get a pass. Repeats/no-change remain
unobserved; they are not successful or failed product checks in this packet.

The last native session emitted `error` and `turn.failed`; its exact cause is
unknown. Recorded HTTP/server/retry diagnostics were empty. Source, configuration,
collection and cleanup checks remained intact; seven protected project files
were unchanged. The plausible returned search implementation and successful test
command are partial evidence, not a completed second workflow. No retry,
post-failure task grade or repair run followed.

## Decision

The missing host-driven application has now been observed for both cases, with
explicit assistance and the initial consent friction retained. The complete
setup-to-useful-task path is accepted only for the initial-setup fixture.
Independent method and workflow reviews checked these distinctions and the final
documentation. Raw events, exact proposals, consent, outcomes, reviews and STOP
remain private in the effort's bound evidence.

The smallest follow-up is to clarify consent for generated service records in
agent guidance while keeping the actual CLI apply path. The same strict request
worked in improvement, so no general core consent defect is established. A later
repeat observation first needs faithful file modes in the evaluator. Neither
change was implemented here. No product/runtime source, published artifact,
version, Git history or unrelated Agensi work changed; no commit or push was made.

## Earlier preparation-only study — closed historical record

Everything below describes the two earlier packets, before this separately
requested observation. Their zero-model counters and stops remain unchanged;
they do not include the six calls above. The linked workflow/method reviews also
retain that earlier scope.

**The remaining question is whether the host agent completes the ordinary
proposal → approval → application → useful task flow. This investigation did not
answer it.** Both attempted observation packets stopped in evaluation preparation
before any model received a request. Neither failure is a Tibicen product result.
Published 1.5.0 and its earlier acceptance remain unchanged.

### What the product already promises

| User request | Agent responsibility | Person's part |
| --- | --- | --- |
| “Set this project up for my agent.” | Inspect the project, recommend sufficient rules, show exact changes, then apply and explain the result after consent | Review the proposal and approve it |
| “Our instructions are a mess. Sort them out.” | Find an actual problem, preserve useful rules and memory, propose a correction or justify no change | Approve an actual correction |
| “Check it again.” | Reassess the current setup; leave a sufficient setup unchanged | Act only if a real decision or external step remains |

JSON construction, hashes and CLI calls belong to the agent. A person is not
supposed to assemble them. These are documented responsibilities, rather than
newly observed successful behavior. The [workflow review](workflow.md) traces
the actual skill, CLI and handoff instructions.

The closest completed [direct comparison](../../evals/results/2026-11-06-repair-comparison/README.md)
found the same repair, useful-task result and no-change behavior with direct Codex
and Tibicen. Its application was performed by a separate operator. The three
[1.5.0 observations](../../evals/results/2026-11-07-release-1.5/README.md#fresh-guidance-observations)
used real read-only CLI commands; they did not test ordinary application after
consent. Neither record establishes saved human effort.

### What happened in this investigation

The prospective design used two synthetic projects, equivalent direct/Tibicen
requests, actual agent application after exact operator approval, a fresh useful
task and balanced repeated adopt checks. Full staged-skill reading and a fresh
continuation carrying the operator-extracted proposal were explicit assistance;
even success would not prove unaided conversational retention or automatic discovery.

| Attempt | Actual result | What it establishes |
| --- | --- | --- |
| Original preparation controls | Collection controls: 2 positive / 10 negative. Isolated task controls: 2 positive / 6 negative; 13 fixture files restored and container removed | Those controlled preservation/task checks worked |
| First caller | Failed while creating its fresh temporary home: the private preparation omitted its parent directory | A preparation defect; zero model starts, auth projections or native-session containers |
| Separately reviewed correction | Created the owned parent; five data-only regression checks passed. Original failure remained intact | The narrow directory correction worked |
| Correction's prelaunch task control | Rejected the longer workspace path during input validation, before Docker creation. A nested file's ustar parent was 159 bytes; the supported limit is 155 | A second preparation/route limit; no model or project code ran in this attempt |
| Subsequent observation phases | Not run; the corrected packet stopped and no third correction was opened | No new init/adopt/application/task/repeat result |

The actual totals are **one failed pre-model caller, zero native observation model sessions and zero
auth projections**. There were two task-control attempts: one successful created
container and one rejected before creation. The first container was removed;
there is no second container to clean up. Metadata inspections and local
preparation did run, so this is not “zero execution.” The explicit correction
amended the overall ceiling to 15 callers including the first failure, with
1,650 seconds of allocated caller deadlines and 1,500 seconds of model deadlines;
that allocation was not consumed. It does not make the original study failure-free.
Raw records, source bindings and both stops remain private. The [method review](method.md)
records the independent checks and limits.

### Decision and smallest next step

No new product feature, compatibility claim, release or version bump is justified
by these attempts. Do not treat an evaluator failure as evidence that Tibicen
failed, or the earlier test suite as proof that the ordinary conversation worked.

The next technical observation needs a compact owned workspace and pure input
validation of **all** staged runtime/control inputs before any model launch, not
another orchestration layer. Offline checks reproduced the long-path rejection
and showed the same input can fit a compact path; they are not native acceptance.
The first question remains actual host application of its unchanged proposal after
consent, followed by a truthful handoff and useful task. Keep direct competent
behavior as the comparison. Count operator intervention separately; human
usefulness, active time and demand remain unmeasured.

The effort map (`../../../.scratch/first-run-value-20261107/map.md`; private development record; excluded from public source) preserves scope,
independent reviews, the prospective amendment and the closed execution limits.
Unrelated Agensi research was not included. No product/runtime source or published
artifact changed, and no commit or publication was performed for this investigation.
