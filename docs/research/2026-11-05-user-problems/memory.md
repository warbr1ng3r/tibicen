# Project memory: user problems and a small utility's boundary

Research snapshot: **5 November 2026, Europe/Moscow**. Product comparison: published
Tibicen **1.1.0**. This is qualitative public-source research, not a survey,
reproduction, prevalence estimate or measured Tibicen benefit. Nothing proposed
below has been implemented by this investigation.

## Recommendation

Keep one readable, project-owned decision file and make its connection to the
working agent understandable. The opportunity worth testing is **“put the decisions
we already made in order, preserve them, and show what the next agent can actually
use.”** Do not expand this into an automatic cross-project memory service on this
evidence. The two community discussions below include both a wish to avoid
re-explaining preferences and a wish to prevent old or unrelated preferences from
affecting new work. These are different requirements, not votes for remembering
everything. [M1](https://www.reddit.com/r/ClaudeAI/comments/1tyszhi/how_are_people_giving_claude_useful_memory/),
[M2](https://www.reddit.com/r/ClaudeAI/comments/1w3cqcn/memory_on_or_off_i_dont_see_any_advantage_for/)

M1/M2 mix general Claude, Projects and Cowork experiences; their clients are not
consistently specified. They motivate needs, not coding-agent runtime claims.

The existing [1.1 memory contract](../../PROJECT_MEMORY.md) already addresses much
of the file-selection, preservation and maintenance-policy problem. The main
remaining product question is whether its small setup makes ordinary later work
more reliable than a short native setup. Public complaints cannot answer that.

## Three problems that should not be merged

| User problem                                                         | Direct evidence                                                                                                                                                                                                                                                                    | Consequence for a small utility                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| “I keep explaining the same things; what should actually be saved?”  | M1's author describes repeated setup and stale/noisy context. A replying builder says selecting useful technical decisions remains difficult even with custom infrastructure. [M1](https://www.reddit.com/r/ClaudeAI/comments/1tyszhi/how_are_people_giving_claude_useful_memory/) | Make the retention policy explicit; storage alone is insufficient.                                 |
| “That was another project's rule, or an old decision.”               | M2's author prefers editable project documents and worries about applying previous decisions out of context; replies also defend native project isolation. [M2](https://www.reddit.com/r/ClaudeAI/comments/1w3cqcn/memory_on_or_off_i_dont_see_any_advantage_for/)                 | Support declining memory and preserving scope; do not infer demand for global synchronization.     |
| “The rule was written down and the agent still forgot or disobeyed.” | A Claude user reports lost constraints after compaction and violations immediately after reading; this is not a Tibicen trial. [M3](https://github.com/anthropics/claude-code/issues/28469)                                                                                        | Separate existence, loading, application and enforcement. More prose is not a demonstrated repair. |

These reports give concrete failure scenarios, not their frequency. “Memory” can
mean durable team decisions, personal preferences, task progress, transcript recall
or a tool's generated recall store. A utility should identify which of these the
person means before selecting a mechanism. This distinction is a synthesis for
product design; it is not a claim that the sources share one diagnosis.

## Counterevidence and native overlap

The Codex context-duplication report M5 was **closed as completed on 29 June 2026**
after a contributor described a compaction implementation change. M4 is a later,
open report, not proof that M5's exact defect persists. A utility must retain
version and report state instead of presenting every historical complaint as an
unfixed configuration gap. [M5](https://github.com/openai/codex/issues/21269),
[M4](https://github.com/openai/codex/issues/35669)

Anthropic's April postmortem traces some apparently forgetful/repetitive behavior
to repeated removal of older reasoning in resumed sessions; it reports the fix
and resolution by v2.1.116. That is an important alternative to “your memory file
is wrong,” not an explanation of every report or a fresh reproduction.
[M6](https://www.anthropic.com/research/april-23-postmortem)

Claude already documents automatic project memory; its loading/audit distinctions
are summarized in the [instruction lane](instructions.md#native-alternatives-constrain-the-opportunity).
No native trial was run. [M7](https://code.claude.com/docs/en/memory)
Codex documents local recall with per-chat controls and background generation;
required team rules belong in checked-in guidance rather than solely in recall.
Its generated memory is not intended for manual editing as the main control
surface. [M8](https://learn.chatgpt.com/docs/customization/memories?surface=app)

Consequently, Tibicen should not position “there is a Markdown memory file” as a
unique feature. Its useful hypothesis is a reviewable connection to project-owned
decisions across setup and later maintenance. Native systems may already be
sufficient; a no-change recommendation must remain valid. These conclusions are
product inferences, not comparative performance findings.

An original Anthropic engineering article describes external notes and selective
retrieval, while warning that aggressive compaction can lose important context.
It motivates testing a simple file workflow, but does not validate Tibicen or
justify a vector database, new server or universal context-size rule.
[M9](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)

## What Tibicen 1.1.0 currently covers

The following is the current contract, not new research-derived functionality.
It is grounded in the [user guide](../../PROJECT_MEMORY.md),
[distributed memory instructions](../../../references/project-memory.md) and
[verification instructions](../../../references/stage-verify.md).

| Mechanism already present                           | Practical meaning                                                                                                                                                | Boundary                                                                                                             |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Optional memory in the ordinary init/adopt workflow | A user can request retained decisions without a separate mandatory questionnaire; declining it does not block setup.                                             | The agent still needs sufficient grounds to distinguish a permanent rule from a temporary request.                   |
| One selected file                                   | Supported locations are `.agents/memory.md`, `MEMORY.md`, `docs/memory.md` and `docs/decisions.md`; default is the first when a new store is useful.             | This is an exact supported-path list, not permission to merge every Markdown document or edit private native stores. |
| Preserve useful existing content                    | Reuse suitable notes; preserve unrelated material; ask about significant unresolved conflicts or leave an explicit gap.                                          | File age does not establish which decision is current. Semantic conflict recognition remains agent work.             |
| Short read/update/correction policy                 | Read relevant decisions before choosing an approach; retain explicit accepted decisions and verified facts, distinguish assumptions, correct replaced decisions. | No daemon watches sessions or verifies that every agent follows these instructions.                                  |
| Concrete proposal and approved application          | Initial notes and instruction changes are shown before writes. Pending apply/resume remains bound to exact reviewed content.                                     | Memory content is data, not authority to execute commands or override the user.                                      |
| User-owned content after completed setup            | Later notes may change without being restored to the original template. Safe location, presence and instruction connection remain checkable.                     | Passing structural checks does not prove semantic freshness or correct use.                                          |

Memory-aware records use proposal schema 2, manifest 3 and recovery 4. Published
1.0 readers refuse these formats before writes; memory-enabled projects need a
compatible runtime. That migration safeguard is separate from improving the
agent's recall. See the [memory guide](../../PROJECT_MEMORY.md#updating-a-10-project).

The [release observations](../../evals/results/2026-11-04-project-memory/README.md)
record two controlled fresh Codex working sessions reading, using and updating or
correcting configured memory. Setup was assisted. They do not establish automatic
startup loading in every tool, behavior across arbitrary compactions, measured
human usefulness or superiority over native memory. No new live trial was run
for this research.

## Small mechanisms worth considering next

These are bounded hypotheses for prioritization, not approved implementation.
They reuse the existing proposal → approved change → check → report lifecycle.
The objective is a simple experience with careful internal checks, not another
catalog of memory technologies.

1. **Show a short decision preview.** In an ordinary adopt result, list the
   selected file, the few durable decisions relevant to the requested work, and
   any ambiguity that blocks a safe correction. Label each as confirmed, verified
   or inferred using existing evidence. An answer should explain why the decision
   matters, not introduce a mandatory new metadata schema. This extends the
   presentation of the existing contract; it is not automatic truth discovery.
2. **Show corrections as replacements.** Present “current wording → proposed
   wording → reason” and preserve unrelated notes. Never decide that newer mtime
   wins. Where no current decision can be established, retain the conflict and
   state what is missing. This mostly makes an existing 1.1 requirement visible;
   it does not require a new memory service or append-only transcript archive.
3. **Report three separate outcomes.** Say whether the file/connection is valid,
   whether a fresh agent actually read and used a relevant decision, and whether
   an explicitly tested action was mechanically blocked. Do not turn the last
   category into a universal new gate. Use “not checked” when appropriate and
   show assistance. An ordinary user should understand the result without
   learning manifest schema numbers.
4. **Prefer the native minimum when sufficient.** If existing project guidance
   already meets the request, keep it. If a symptom concerns a known native
   regression or loading limit, explain the version-specific diagnostic before
   proposing duplicate notes. Optional integration with enforcement would need
   its own explicit scope, adapter checks and approval; it is not conferred by a
   sentence in memory.

The first two are good candidates for a small improvement if an audit shows the
current handoff fails to expose them. They may require only clearer outputs, so
verify the actual gap before adding runtime fields. The last two protect against
selling unsupported reliability. No priority here assumes willingness to pay.

## A realistic next check

Use ordinary requests such as “We already decided this. Stop changing it,” or
“Keep the reasons, but don't turn every chat message into a rule.” These are
illustrative prompts synthesized for future evaluation, not quotations or new
observations. Start with a project containing one accepted decision, a superseded
decision, unrelated useful notes and an existing agent entry point.

Compare a short native setup with Tibicen on the same starting files and task.
Inspect the exact proposed diff, preserved notes, questions actually asked, and
the next fresh session's decision and correction. Include an already-sufficient
setup where the correct output is no change. Record runtime versions, assistance
and failures; a compaction claim needs an observed compaction, not a new-chat test.
No participant preference, saved time or increased reliability should be claimed
without observing it. This paragraph proposes a future check and authorizes none.

## Source ledger and access limits

All nine sources were directly opened on **5 November 2026, Moscow date**. Eight
are new URLs relative to the [3 November study](../PUBLIC_AGENT_SETUP_EVIDENCE.md);
M7 refreshes previously read native documentation. Exact Reddit publication dates were
not exposed reliably by the returned public page, so none was reconstructed from
relative labels. “Open” describes the issue at access, not a confirmed current
runtime defect. Searches/read access were public; no login, contact, paid query,
native-model trial or private conversation was used.

| ID / exact source title and original URL                                                                                                                                                   | Date / version / state                                                                     | Scope actually read                                                                                                                 |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| M1 — [how are people giving Claude useful memory without overdoing it?](https://www.reddit.com/r/ClaudeAI/comments/1tyszhi/how_are_people_giving_claude_useful_memory/)                    | Exact date unavailable; relative label about five months; version unspecified              | OP and selected replies, especially ZoneDeadEnded's qualification; excluded bot synthesis and vendor-promotion claims.              |
| M2 — [Memory On or Off? I dont see any advantage for professional work with memory on.](https://www.reddit.com/r/ClaudeAI/comments/1w3cqcn/memory_on_or_off_i_dont_see_any_advantage_for/) | Exact date unavailable; relative labels varied between returned views; version unspecified | OP and selected scope/editability/native-project counterarguments; no inference about every Claude product's behavior.              |
| M3 — [Opus 4.6 comprehensive regression: loops, memory loss, ignored instructions - daily professional user report](https://github.com/anthropics/claude-code/issues/28469)                | 2026-02-25; Opus 4.6, Windows 11; Claude Code version absent; open                         | Body, environment, problems 2–4 and visible activity; no linked private logs, performance percentages or promoted remedies adopted. |
| M4 — [RemoteCompactionV2 repeat-compaction loop and state loss in ephemeral side conversations](https://github.com/openai/codex/issues/35669)                                              | 2026-07-27; desktop 26.721.41059 / embedded CLI 0.146.0-alpha.3.1; open                    | Body and selected July follow-up; report-level evidence, no independent log reproduction or current-version generalization.         |
| M5 — [Compacted replacement_history retains active startup/context packets, duplicating AGENTS/developer/memory/skills context](https://github.com/openai/codex/issues/21269)              | 2026-05-05; desktop 26.429.61741; closed completed 2026-06-29                              | Body and contributor closure; reported packet duplication and later remedy, not a current baseline defect.                          |
| M6 — [An update on recent Claude Code quality reports](https://www.anthropic.com/research/april-23-postmortem)                                                                             | 2026-04-23; vendor says resolved by 2.1.116                                                | Article, especially caching/reasoning-loss section; vendor attribution retained as such.                                            |
| M7 — [How Claude remembers your project](https://code.claude.com/docs/en/memory)                                                                                                           | Date unknown                                                                               | Memory/loading sections; no trial.                                                                                                  |
| M8 — [Memories](https://learn.chatgpt.com/docs/customization/memories?surface=app)                                                                                                         | Living documentation; publication date absent; contracts accessed today                    | Local Codex recall, generation/storage and controls; no local memory inspection or configuration changes.                           |
| M9 — [Effective context engineering for AI agents](https://www.anthropic.com/research/effective-context-engineering-for-ai-agents)                                                         | 2025-09-29; historical engineering guidance                                                | Minimal-context, retrieval, compaction and note-taking sections; linked studies/demos not independently examined.                   |

The sample deliberately includes rejection of memory, native overlap and resolved
defects. It remains selected, English-language and coding-tool-heavy. Self-reports
establish reported experiences, not representative incidence or a causal remedy;
vendor articles have their own perspective. Author identity and possible
AI assistance were not independently authenticated. No videos, collapsed replies or raw
diagnostic attachments were treated as inspected evidence. The defensible output
is a set of problems and bounded hypotheses, not a claim that Tibicen solves
forgetting generally.
