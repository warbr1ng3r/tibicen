# Ordinary first-run workflow: evidence and remaining bridges

This is the earlier source/preparation review. The separately requested fresh observation is recorded in the [current report](README.md).

**7 November 2026, Europe/Moscow. Source review; no new agent or installer run.**
Tibicen already delegates technical configuration to the user's host agent.
The open question is whether that delegation works with ordinary requests and
less intervention than a competent direct request. A missing convenience feature
has not been reproduced by this review.

## What the current product asks of the user

The [product contract](../../PRODUCT_VISION.md#5-a-simple-user-flow-and-approval)
is describe the task → one recommended plan → approve → applied result. The
agent resolves technical choices itself. Up to four compound questions are
allowed only for consequential missing information; “use your judgment” removes
interview questions, while preserving approval of the exact plan. These are
instructions to the host agent, rather than behavior enforced by a dialogue UI.
See the [interview stage](../../../references/stage-interview.md).

| Ordinary request, after explicitly loading the installed skill | What the agent should do | What remains for the person |
| --- | --- | --- |
| “Set this project up for my agent.” | Inspect the actual project, select sufficient instructions, explain assumptions and show exact changes; apply only after approval. Existing infrastructure redirects to improvement. | Correct an important unknown if needed; review and approve the shown plan. |
| “Our instructions are a mess. Sort them out.” | Read existing rules and retained decisions, explain a concrete problem, preserve useful material, propose and apply the exact correction. No actual problem permits a no-change result. | Review the correction and any required external action. |
| “Check it again. Change only what is needed.” | Inspect the current files and history, distinguish later owner notes from damage, and justify keep/change/unknown. A sufficient setup needs no new session or manifest write. | Decide only when a real change or external action is proposed. |

These short requests are examples for investigation, **not observations**.
Routing and preservation are specified by the [init entry](../../../skills/tibicen-init/SKILL.md),
[adopt entry](../../../skills/tibicen-adopt/SKILL.md),
[scan](../../../references/stage-scan.md),
[inventory](../../../references/stage-inventory.md) and
[no-change proposal rule](../../../references/stage-proposal.md).

## Concrete boundaries and handoffs

1. **Installation and explicit entry are real prerequisites.** The documented
   route installs both complete skills, then asks the host to read the actual
   `SKILL.md` path. Node ≥22.20 and access to the complete resources are required.
   Expanding `~` or pointing to a manually selected folder can require user action.
   A text-only/no-Node host needs a local operator. This is documented supported
   entry, not a defect inferred from absent automatic discovery.
   [Installation](../../INSTALLATION.md#first-project-session).
2. **JSON is the agent's job.** The host prepares `proposal --input -`; the CLI
   fills actual hashes/diffs and returns `{proposal, digest, summary}`. After the
   displayed plan receives real consent, the host passes that unchanged proposal
   or envelope to `apply --plan - --approve DIGEST`. The user need not author JSON
   or type the digest. The exact envelope must survive the conversational approval
   boundary without an unauthorized temporary file. That is a concrete host
   responsibility; loss or manual reconstruction is a hypothesis to test, not an
   observed failure here. The CLI checks digest equality; the host is responsible
   for obtaining actual user consent rather than treating its own data as approval.
   [Proposal stage](../../../references/stage-proposal.md),
   [build stage](../../../references/stage-build.md),
   [input/envelope contract](../../../references/proposal-format.md),
   [compiler](../../../scripts/core/plan.ts),
   [apply gate](../../../scripts/core/apply.ts).
3. **A useful handoff requires translation from machine data.** `report` returns
   structured JSON. Its outer session status/checks are retained history, while
   `diagnosis` freshly inspects current files; an earlier `complete` can coexist
   with a new defect. The host must explain what changed, what was checked, what
   remains unknown and one next step. Showing the raw JSON alone does not satisfy
   the handoff instructions. Saved reports are separately requested, not automatic.
   [Report implementation](../../../scripts/tibicen.ts),
   [handoff stage](../../../references/stage-handoff.md).
4. **Fresh work still needs instruction activation.** The portable route gives
   the next agent the real `AGENTS.md` path and a useful task. When automatic
   loading is unknown, explicitly reading that file is an activation step.
   Required activation not yet performed remains `manual-action-required`.
   Unsupported automatic task/quiz/loading probes remain separately unverified;
   they do not force a new provider, credential or model.
   [Portable workflow](../../HARNESS_PORTABILITY.md#one-shared-instruction-file-can-be-sufficient),
   [verification stage](../../../references/stage-verify.md).
5. **1.5.0 evidence needs grounding, not a new user questionnaire.** The agent
   should collect optional instruction hashes, genuine earlier source hashes for
   remembered facts, or an actually read upstream source when relevant. Missing
   history stays unknown; current bytes cannot invent it. The current report
   neither fetches upstream content nor maintains a background source registry.
   Asking the user to manually assemble these fields would add work beyond the
   intended flow. Whether hosts can collect/retain them reliably is unmeasured.
   [Context-evidence instructions](../../../references/report-context-evidence.md),
   [user guide](../../PROJECT_CONTEXT_REVIEW.md).

## What actual observations establish

The [1.4.1 repair comparison](../../evals/results/2026-11-06-repair-comparison/README.md)
is the closest existing direct comparison. Direct Codex and Tibicen corrected the
same obsolete command; their fresh tasks produced identical source/tests. Both
kept a sufficient setup unchanged. Tibicen used actual proposal/apply and added
its manifest for the repair, but demonstrated no extra functional outcome on
that fixture. Its proposal phases took longer in the single recorded ordering:
69.55 versus 53.33 CLI seconds for repair, 88.00 versus 37.88 for the sufficient
case. These are scoped elapsed observations, not estimates of general speed or
human time.

That study staged the skill and explicitly invoked it. Root reviewed proposals,
approved exact changes, applied them in model-free operator containers and
performed semantic acceptance. Proposal artifacts and the direct arm's JSON
format were study instrumentation. They do **not** establish that ordinary users
must prepare JSON, or that an ordinary host carried the proposal through approval
and application without operator help. Installation, total active human work and
human usefulness were not observed.

The [1.5.0 release observations](../../evals/results/2026-11-07-release-1.5/README.md#fresh-guidance-observations)
successfully used actual read-only scan/report for a custom instruction file,
changed memory source and supplied Node guidance. All three explicitly required
full staged-skill reading and particular CLI capture forms. The private prompts
and assessments were inspected for this review. They did not exercise ordinary
init, exact approval followed by host-driven apply, a subsequent useful task or
repeat setup. Their success therefore does not answer the current first-run
question. Public delivery separately established mechanical installation,
replacement, recovery and removal, not that conversational bridge.

## What to observe next

Use simple requests and equivalent project copies. Keep legitimate skill loading
explicit and count it as assistance. Record separately: interview questions,
plan revisions, exact approvals, user/operator actions, manual JSON or digest
reconstruction, execution failures, elapsed phases, resulting files and the first
useful task. Retain a justified no-change answer. Do not introduce a user-facing
schema or tell the model the hidden defect simply to make grading easier.

The decisive technical check is whether the host can construct, explain, retain
and apply its actual plan after one fixture-operator approval, then hand off a
usable first task. Direct competent behavior remains the comparison. Workload
counts can locate friction; they cannot establish saved human minutes, demand or
human usefulness without human observations. No new product mechanism is justified
solely by this source review.

## Review provenance

Read the canonical installation/portability guides, both skill entries, stages,
proposal/core/CLI owners and the two result records above. The two entries and
13 inspected runtime/reference files matched the frozen 1.5.0 candidate-02
distribution byte for byte. Its published full-SHA identity
`0706d7caf6a93b79a117379c1cd5f8cd95effb04` and returned-byte acceptance remain
owned by the [release report](../../evals/results/2026-11-07-release-1.5/README.md).
This review used existing local records; it launched no model, installer, project
command, authentication operation or network request, and changed no product code.
