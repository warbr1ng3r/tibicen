# Public evidence about agent setup

**Research date: 2026-11-03.** This replaces further requests for the owner's questionnaire time with public-source product research. It is a qualitative investigation, not a survey, a Tibicen benchmark or completed human calibration.

## Recommendation

Keep both init and adopt, but demonstrate the smallest useful change to an actual setup. Generating another instructions file is a weak value proposition: native tools already offer initialization, auditing and migration. Even a reviewable repair is overlapping capability. Tibicen's stronger hypothesis is the convenience of a task/version-aware lifecycle: preserve useful decisions through setup, update and recovery, check the installed result and explain the next working step, across selected tools when needed. This is an inference from the sources, not measured Tibicen benefit or proven differentiation.

The owner need not fill in the prepared form for this research. Their earlier volunteering is historical; current availability is unconfirmed. The existing [readiness requirements](../evals/V1_READINESS.md) are unchanged. A concrete alternative evidence sequence is proposed below so that research does not turn into another indefinite waiting period.

## What the sources support

| Finding | Implication for Tibicen | Limit |
| --- | --- | --- |
| People report being overwhelmed by workflows, servers and templates; some use only native init or no dedicated instructions file. [C1](https://www.reddit.com/r/ClaudeAI/comments/1m0gqro/claude_code_too_many_workflows/), [C4](https://www.reddit.com/r/ClaudeAI/comments/1vdzdgi/delete_claudemd/) | Start from the repository and recommend the minimum; a no-change result is valid | Self-reports, often with other documentation already present; no prevalence or adoption estimate |
| Some want decisions and their reasons retained across sessions, with personal and project rules kept distinct. [C2](https://www.reddit.com/r/ClaudeAI/comments/1wx8vcm/how_do_you_stop_claude_code_from_undoing_things/), [C3](https://www.reddit.com/r/ClaudeAI/comments/1mrr3nm/whats_in_your_global_claudeclaudemd_share_your/) | Preserve owner decisions and explain each proposed removal or scope change | Not every inconsistency is accidental; public discussion cannot select a private team's policy |
| “Instructions ignored” can mean a fixed loading regression, a size/precedence limit, a mistaken diagnosis or actual noncompliance. [I1](https://forum.cursor.com/t/agents-md-not-automatically-injected/158448), [I3](https://github.com/openai/codex/issues/8759), [I4](https://github.com/openai/codex/issues/43075) | Distinguish files found, content loaded and behavior observed; check native diagnostics before adding rules | Historical reports do not establish a current defect in every installation |
| Configuration changes and updates can overwrite settings owned elsewhere. [I6](https://github.com/anthropics/claude-code/issues/24578), [I7](https://github.com/anthropics/claude-plugins-official/issues/6796) | Show exact ownership/diff and a recovery route; avoid writing managed caches or live private state | Reported incidents were not reproduced; inferred mechanisms remain uncertain |
| Experiments report conditional efficiency benefits and no general correctness gain; results measure different things. [E1](https://arxiv.org/html/2601.20404v2), [E2](https://arxiv.org/html/2602.11988v3), [E3](https://arxiv.org/html/2607.27250v1) | Compare useful completed work and effort against a small native baseline; do not optimize file count | None studies Tibicen's complete workflow; shorter files and more skills are not universal remedies |

The strongest inference is to foreground **adopt/repair**, while retaining init in the full MVP. “We generate AGENTS.md” has substantial native overlap. “We safely put this particular setup in order and show what is ready” is a testable product hypothesis. Neither demand nor superiority is established by this research.

## Native alternatives and changing guidance

The [AGENTS.md format](https://agents.md/) already provides a plain-file starting point. Current [Claude Code guidance](https://code.claude.com/docs/en/best-practices) describes native `/init`, `/doctor prompt-audit` and checks; it also distinguishes prose guidance from harness enforcement. The [Codex guide](https://learn.chatgpt.com/docs/agent-configuration/agents-md) documents scoped instructions, discovery and diagnostics. [Gemini CLI source](https://github.com/google-gemini/gemini-cli/blob/main/packages/cli/src/ui/commands/initCommand.ts) declares a tailored-context init command. These are available alternatives, not independently tested outcomes in this investigation.

Current [Claude memory documentation](https://code.claude.com/docs/en/memory) qualifies direct AGENTS support by version, configuration and precedence: v2.1.277+ is required, and project/ancestor CLAUDE files can select a different loading path. Do not promise interchangeable behavior from a filename alone or remove an existing bridge on this research alone. Tibicen's installed adapters still need their own exact-version checks.

That [same documentation](https://code.claude.com/docs/en/memory#set-up-a-project-claudemd) describes reviewable init proposals with `CLAUDE_CODE_NEW_INIT=1`, and instruction audits on v2.1.283+. A proposal or audit alone is therefore insufficient differentiation.

[HumanLayer's practitioner guide](https://www.humanlayer.dev/blog/writing-a-good-claude-md) and [Matt Pocock's guide](https://www.aihero.dev/a-complete-guide-to-agents-md) favor concise common instructions and task-specific references. Pocock's January statement that Claude does not use AGENTS is stale against the current vendor documentation. His [February anti-init article](https://www.aihero.dev/never-run-claude-init) is a useful objection to indiscriminate generation, not proof that every generated file is harmful. No universal line count or instruction budget is adopted here.

Creator accounts disagree about the right amount of context. [Peter Steinberger](https://steipete.me/posts/just-talk-to-it), 2025-10-14, argues against elaborate wrappers yet describes an approximately 800-line agent file. [Armin Ronacher](https://lucumr.pocoo.org/2025/6/12/agentic-coding/), 2025-06-12, favors usable existing tools while retaining non-obvious local instructions. Both original articles were read; their linked recordings were not watched. These are personal practices, not matched comparisons or current adapter contracts.

## What a user should see

These are **new illustrative prompts**, synthesized from the needs below, not quotations or newly executed tests. They do not alter the preserved responses in the local assessment page.

| User says | Agent should do | Visible result |
| --- | --- | --- |
| “Set this project up so I can work with an agent.” | Read the repository and existing guidance; infer commands and constraints; recommend only what is missing | One short proposal, exact optional details, then an approved applied result and a first useful prompt |
| “I have rules everywhere. Put them in order.” | Identify which files actually apply; show concrete conflicts and preserve team decisions | A small diff with reasons, preservation checks and a report; no wholesale template replacement |
| “It already works. Do I need to change anything?” | Compare actual setup with the task and current version guidance | An explicit no-change result when sufficient; no components added merely to show activity |

This follows the existing [product scope](../PRODUCT_VISION.md#3-principles-and-infrastructure-quality); it does not introduce a universal process, mandatory MCP or a new adapter.

## Evidence sequence for 1.0 — proposal, not adopted

1. Use this public research for needs, terminology and realistic scenarios. Stop repeatedly requesting the owner's questionnaire or participant recruitment. Preserve blank forms and old observations as history.
2. Keep functional scope and mechanical safety requirements: exact approved changes, application/owner-rule preservation, truthful status, recovery, installed-resource checks and candidate-specific delivery. Keep real native setup/loading/use evidence separate from file tests and model opinion. A known mandatory violation remains a failure.
3. Keep agent critique labeled agent critique. It can identify defects and challenge recommendations; it is not a participant's preference or measured time saving. Under the current protocol, absent human cross-checks still mean unverified.
4. Recommend moving the initial human usefulness pilot and human rubric calibration out of the prerelease critical path, while publishing their absence and collecting voluntary feedback after release. Retain the full product feature scope. Make no claim of proven effort savings, universal instruction compliance or superiority to native init. This changes the evidence policy; it is not a reinterpretation of completed work.

To adopt step 4, revise the relevant requirements/tasks together: [Product Vision §13–14](../PRODUCT_VISION.md#13-target-product-first-release-and-implementation-order), [release tasks 3.3–3.4 and 4.1](../../openspec/changes/prepare-first-public-release/tasks.md), the [evaluation specification](../../openspec/changes/build-agent-evaluation-harness/specs/agent-evaluation-harness/spec.md), [quality protocol](../evals/QUALITY_AND_REPORTS.md), [pilot](../PILOT.md), readiness and their translations. A human record must never be backfilled with an agent answer. Neither policy revision nor publication is performed by this research.

## Immediate work derived from the research

| Order | Work | Completion evidence |
| --- | --- | --- |
| 1 | Refresh the native-alternative and instruction-precedence checks for supported versions | Dated primary sources and a bounded exact-version check; no broad compatibility claim |
| 2 | Compare a minimal native setup with Tibicen on concrete init/adopt tasks, including sufficient existing setup | Same starting state, preserved decisions, exact diff and fresh useful-task evidence; report cost/time only when observed |
| 3 | Make the result understandable in product copy and demonstrations | Starting project → ordinary request → actual questions/actions → proposed diff → checked result/limits; hide internal evaluation vocabulary from the main story |
| 4 | Reconcile the proposed evidence sequence before a stable release | One coherent change to requirements and readiness, preserving every old failure and missing human observation |

These are priorities, not new executed trials. Existing executor usage remains 24/24; a new live comparison requires a separately frozen plan and limit. Ordinary research/review subagents are not benchmark executors.

## Method and source access

Five subagents investigated community discussions, original issues/forums, empirical studies, creator material and product implications in two waves; root integrated findings and checked native alternatives and key original sources. Source validation and independent synthesis review are recorded in the research ticket. Only public read access was used: no messages, logins, recruitment, paid model calls or access to owner browser answers.

Searches deliberately included negative experiences and “no setup needed” alternatives. This is a selected, predominantly English-language sample, not a systematic review. Original public posts establish what an author reported, not their identity, representativeness, willingness to pay or reproducible causality; some text is disclosed as AI-generated. Vendor documentation establishes documented behavior at access, not a replay. Papers retain their own tasks, versions and statistical limits. Sources may be outdated or commercially motivated. Multiple posts repeating one claim are not independent experiments.

YouTube direct watch/embed requests for Web Dev Simplified, NeuralNine, Theo and Samuel Gregory were throttled or returned 429. No full videos were watched or transcripts verified; mirror summaries and search snippets are excluded from findings. Gregory's [own video page](https://www.samuelgregory.co.uk/videos/having-the-right-agentic-coding-setup-is-crucial) confirms chapters only. The [NetworkChuck repository companion](https://github.com/theNetworkChuck/ai-in-the-terminal/blob/main/docs/03-gemini-cli.md) was directly read: it teaches a context-file/new-session workflow. That is original teaching material, not a verified video replay or an efficacy measurement.

## Public source ledger

All sources below were directly opened on 2026-11-03. Dates belong to the original material, not a fresh reproduction. Read scopes exclude linked raw session logs, uninspected images, collapsed branches and supplementary datasets. No long transcripts or private project material are reproduced.

### Community accounts

| ID / original source | Date | Read scope and bounded result |
| --- | --- | --- |
| C1 — [Too many workflows](https://www.reddit.com/r/ClaudeAI/comments/1m0gqro/claude_code_too_many_workflows/) | 2025-07-15 | OP, edit and selected replies: wants less setup thought; edit confirms native init, so this is minimal setup rather than no context |
| C2 — [Undoing team decisions](https://www.reddit.com/r/ClaudeAI/comments/1wx8vcm/how_do_you_stop_claude_code_from_undoing_things/) | 2026-10-04 | OP and selected decision-index exchange: preserve reasons; proposed remedy is untested with a human team |
| C3 — [Global rules](https://www.reddit.com/r/ClaudeAI/comments/1mrr3nm/whats_in_your_global_claudeclaudemd_share_your/) | 2025-08-16 | OP/example and selected replies: personal defaults versus project facts; preferences differ |
| C4 — [Delete CLAUDE.md](https://www.reddit.com/r/ClaudeAI/comments/1vdzdgi/delete_claudemd/) | 2026-08-03 | OP and selected no-file/context replies: some projects reportedly work without it but retain other docs; bot summary and linked-video attribution excluded |
| C5 — [Subagent workflow discussion](https://news.ycombinator.com/item?id=45181577) | 2025-09-13–14 | Selected context/handoff and role-agent exchanges: both positive and negative personal experiences; no controlled comparison |
| C6 — [AGENTS.md discussion](https://news.ycombinator.com/item?id=44957443) | 2025-08-20 | Selected hierarchy/maintenance exchanges: topic maps preferred by one author; tiny-project and duplication counterexamples retained |
| C7 — [Configuration directory reference, #26168](https://github.com/anthropics/claude-code/issues/26168) | 2026-02-16; follow-up 06-27 | Body and resolution exchange: inventory/backup/migration need; author later reports documentation available, so not an open capability gap |

### Original issues and forums

| ID / original source | Date / reported version | Read scope and status boundary |
| --- | --- | --- |
| I1 — [Cursor AGENTS loading](https://forum.cursor.com/t/agents-md-not-automatically-injected/158448) | 2026-04-19–26; 3.1.x | Body and support/user replies: staff-confirmed regression; user reports 3.2.11 fixed it |
| I2 — [Cursor rule priority](https://forum.cursor.com/t/cursor-system-prompt-conflicts-with-user-system-prompt/156051) | 2026-03-27–28; 2.6.21 | Body and support exchange: user rules cannot replace built-in instructions; expectation mismatch rather than proven loading failure |
| I3 — [Codex global instructions, #8759](https://github.com/openai/codex/issues/8759) | 2026-01; 0.77/0.78 | Body and contributor/author clarification: content was injected; re-reading/retention complaint is distinct; later untriaged reports not resolved by that explanation |
| I4 — [Codex truncation, #43075](https://github.com/openai/codex/issues/43075) | 2026-09-05; 0.153.4 | Body and later replies: firsthand missing-tail symptom, community size-budget diagnosis; exact reported bytes not independently explained |
| I5 — [Claude scoped loading, #96361](https://github.com/anthropics/claude-code/issues/96361) | 2026-09–10; 2.1.280 and later | Body and follow-ups: conflicting new-file results, including 2.1.296; no universal current defect established |
| I6 — [Claude live config editing, #24578](https://github.com/anthropics/claude-code/issues/24578) | 2026-02-10; 2.1.38 | Body/duplicate closure and [older target #2593](https://github.com/anthropics/claude-code/issues/2593): reported loss after editing internal config; closure does not prove a shipped repair |
| I7 — [Plugin configuration overwritten, #6796](https://github.com/anthropics/claude-plugins-official/issues/6796) | 2026-10-18; version absent | Body/activity: cached launch settings reportedly overwritten by update; requested patch explicitly untested |
| I8 — [Skill context overgrowth, #1487](https://github.com/anthropics/skills/issues/1487) | 2026-07-27; 2.1.220 | Body/replies: author reports oversized irrelevant skill loading; approximate tokens and failure explanation not independently reproduced; promotional reply claims excluded |

### Empirical studies and counterevidence

| ID / original study | Setting / revision read | Result and limitation |
| --- | --- | --- |
| E1 — [Lulla et al.](https://arxiv.org/html/2601.20404v2) | v2, 2026-03-30; 124 small PR tasks / 10 repositories; Codex | Reports lower median runtime/output tokens with existing AGENTS; median total tokens rose. Functional correctness was outside scope. Methods/results/Table 1 read |
| E2 — [Gloaguen et al.](https://arxiv.org/html/2602.11988v3) | v3, 2026-09-29; 300 SWE-bench Lite + 138 CTXbench Python tasks | No general success gain and higher cost; generated contexts raised mean inference cost 20%/23%. Developer files outperformed generated files. Methods/results/limitations read; not a universal file-deletion rule |
| E3 — [Khatri](https://arxiv.org/html/2607.27250v1) | v1, 2026-07-28; 17 tasks / 3 repositories, 288 reported runs; two agents | No detectable strategy effect; task is the statistical unit. Small sample, low power and unequal selective content prevent proving equivalence. Methods/results/power/triage read |
| E4 — [METR real-work trial](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) and [2026 follow-up](https://metr.org/blog/2026-02-24-uplift-update/) | 2025 trial: 16 maintainers / 246 tasks; paper sections and both author reports read | Observed effort differed from perceived benefit in the early trial. Follow-up says current effect is unreliable due to selection/timing problems. Neither is a current universal productivity estimate |
| E5 — [Zheng et al., LLM-as-judge](https://arxiv.org/html/2306.05685v1) | v1, 2023-06-09; historical chat benchmarks | Methods/results/Tables 2–5: order, verbosity and denominator choices affect agreement. Not modern coding-task calibration or proof that model judgments equal human benefit |

Research supports a better set of hypotheses and comparisons now. It establishes neither a measured Tibicen advantage nor a completed participant assessment, and it does not justify additional components merely because sources mention them.
