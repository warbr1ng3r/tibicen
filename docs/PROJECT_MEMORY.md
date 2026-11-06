# Project memory

**Status:** available in published [1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0).
The older 1.0.0 distribution does not include this workflow. Two controlled fresh
Codex sessions read, used and updated configured memory; setup assistance and
limits are recorded in the [candidate checks and release follow-up](evals/results/2026-11-04-project-memory/README.md).
Examples below are illustrative, not transcripts of those runs.

Project memory helps later agents find the decisions that matter to you. Tibicen
sets up one project file and short rules for reading and maintaining it. Your
working agents maintain the notes afterward; Tibicen leaves no running service.

## Start with an ordinary request

### A project without memory

You have a small application with no agent instructions or memory file. Ask:

> Use tibicen-init. Set this project up for agents. Remember why we make decisions,
> and ask before adding dependencies.

The agent examines the project and the request. It proposes `.agents/memory.md`
plus a short connection from the applicable agent instructions. The proposal
shows the exact files and initial text. A question is needed only if an important
choice remains unclear; it stays within the ordinary interview limits.

You review and approve the concrete plan. Only then does Tibicen apply it and
report the checks. A possible result is:

```text
AGENTS.md             # applicable agent rules and a pointer to memory
.agents/memory.md     # accepted project decisions and useful reasons
.tibicen/manifest.yml # Tibicen's setup record, not the working memory
```

For example, memory might retain “New dependencies need approval — the owner wants
to keep this CLI small.” It must not invent an approval or infer a permanent rule
from a one-off “keep this answer short.” Applicable instruction files depend on
the selected agent; the example does not require every agent to use `AGENTS.md`.

### A project with existing notes

You already have instructions and `docs/decisions.md` containing useful decisions.
Ask:

> Use tibicen-adopt. Sort out the agent setup. Keep our existing decisions and make
> sure agents use them.

The agent reads the permitted current setup and notes. It proposes connecting the
existing file rather than creating another store. Useful unrelated notes stay
unchanged. If two stores disagree and the current decision is unclear, it shows
the conflict and asks within the normal limits. With questions disabled, an
unresolved choice remains an explicit gap; it is not silently decided by file age.

After approval, later additions to that memory are normal working content. A
repeat adopt uses those current notes; it does not restore the original template.

## What the rules ask working agents to do

| When                                                          | Expected action                                           |
| ------------------------------------------------------------- | --------------------------------------------------------- |
| Before a task affected by an earlier decision                 | Read the relevant memory before choosing an approach.     |
| A lasting decision is explicitly accepted                     | Retain the decision and its useful reason or source.      |
| A project fact is verified                                    | Retain it when it will help later work.                   |
| A preference or explanation is only inferred                  | Keep it distinguishable from confirmed knowledge.         |
| The user replaces a decision or a fact is disproved           | Correct its current meaning and preserve unrelated notes. |
| Information is temporary, sensitive or a full chat transcript | Leave it out of durable memory by default.                |

For example, if you later say “A small date library is fine now; keep the reason,”
the working agent should correct the affected decision rather than leave two
contradictory rules marked current. Existing approval and execution boundaries
still apply: a memory note cannot authorize a command or override your instruction.

The notes are readable Markdown. There is no mandatory entry schema, timestamp
format or separate questionnaire, and the full history need not be copied into
every instruction file.

<a id="check-the-first-task-and-later-memory-use--unreleased"></a>

## Check the first task and later memory use

The handoff in 1.4.0 reuses the reviewed host, working directory and target
path from [task-context diagnosis](ADOPT_DIAGNOSIS.md#task-context-for-init-and-adopt--unreleased),
or explains what changed. This adds a scoped check to the memory workflow
available since 1.1; it adds no store, schema or background memory service.

For example, both init with new notes and adopt with existing notes can hand
off a small price-formatting task. These are illustrative steps, not new run
results:

1. Start a fresh working session with the approved instructions and one selected
   memory file in place. Record the candidate, available host/version and any
   explicit reading help. Use an ordinary request such as “Show prices in the
   order summary”; the stored decision says amounts are integer kopecks in RUB
   and zero is displayed as “0 ₽”. An unrelated note forbids unapproved dependencies.
2. Check whether the agent actually read that decision before choosing the
   representation and whether the resulting work used it. A statement that the
   notes exist, or a good answer alone, does not prove the read.
3. Give an explicit correction: “Show zero as ‘Free’ now; remember that decision.”
   Check that “0 ₽” is replaced by “Free”, while integer kopecks, RUB and the
   dependency note remain. Application edits in this working task need their own authorization;
   setup approval covers infrastructure only.

Report structural connection, observed reading, use and correction separately.
Supplying instruction or memory text to an observer is assistance and must be
recorded. An observation with that help does not establish native autodiscovery;
an unperformed step stays `unverified`, with its reason. No new observation is
claimed by these examples, and the historical 1.1 sessions retain their limits.

## One supported location

The initial scope supports these exact project-relative paths:

- `.agents/memory.md` — default when no suitable existing store is found.
- `MEMORY.md`.
- `docs/memory.md`.
- `docs/decisions.md`.

Only one selected path is bound to the reviewed plan. The list is not permission
to rewrite every listed file. Custom stores remain untouched with an explicit
limitation or manual connection. Forbidden paths, symlinks and unavailable files
retain the normal safety checks. Declining memory leaves the ordinary init/adopt
workflow available without adding a memory file.

## Updating a 1.0 project

Memory is opt-in. Use the compatible new Tibicen runtime and review the proposed
memory migration and exact changes. Existing non-memory workflows retain their
legacy formats. An unfinished legacy session is completed through its existing
recovery path before proposing memory.

Memory-aware records use proposal schema 2, manifest schema 3 and recovery schema 4. Product versions and schema numbers are separate. A 1.0 runtime refuses those
new formats before writes; continue a memory-enabled project with a compatible
runtime, rather than downgrading its record.

Initial apply and interrupted-session resume still require the approved
before-content. If the file changes, obtain a fresh plan and approval. After
completed setup, the memory body is user-owned: adding a note does not have to
match its initial hash. The file's safe location, presence and managed instruction
connection remain independently checkable.

Updating or removing installed Tibicen is separate from changing project notes.
Keep useful later notes when reviewing recovery or removal. Follow the
[installation/update instructions](../README.md#update-or-remove-an-installation)
and the exact release's compatibility notes.

## What a check proves

Published 1.5.0 adds optional [source-change review](PROJECT_CONTEXT_REVIEW.md)
when an agent retained a genuine earlier source hash for a remembered fact.
The report compares source bytes without changing notes or claiming
that a fact is true or false.

Published 1.2 recognizes permitted existing nested `.cursorrules`
and rule files under `.cursor/rules/` or `.claude/rules/` found by the bounded
scan as structural connections when they contain the exact selected memory
path relative to the project root, such as `docs/memory.md`. This does not
establish task applicability or native loading, or authorize editing protected
nested rules.

Structural checks can establish a safe file and intact instruction connection.
They cannot establish that an agent read, used or updated memory. Fresh-session
observations must identify the tested distribution, agent/tool versions,
assistance and actual outcome. Missing controlled execution stays `unverified`;
success in one agent does not establish behavior in another.

Reports disclose those observations separately from structure
and from human usefulness, which remains unmeasured. This feature adds no account,
server, global/private agent-memory editing, cross-project synchronization or
memory fields in saved presets. See [release preparation](RELEASING.md) for the
candidate and publication gates.
