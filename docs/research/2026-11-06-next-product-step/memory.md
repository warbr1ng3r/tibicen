# Memory and context: make the current source clear before adding storage

Checked **6 November 2026, Europe/Moscow**. Decision research only. English is canonical; memory_ru.md is the adjacent translation. Ten primary-source entries below include original complaints and sufficient native alternatives. They do not establish prevalence or Tibicen benefit.

## Decision

**Keep the existing one-file memory model. No backend integration or immediate code change is justified by this lane.** The strongest small candidate is a concise task-specific instruction-to-memory map in the existing report/handoff. A lower-priority candidate is source-change visibility for explicitly referenced project facts. Both can first be rejected by a bounded desk check, without recruitment or model runs.

The important distinctions are: stored, applicable here, read by this session, still true, and actually followed. Adding persistence does not make those states equivalent.

## What 1.4.1 already covers

The [current inventory](../../CURRENT_CAPABILITIES.md), [memory contract](../../PROJECT_MEMORY.md) and [task-context diagnosis](../../ADOPT_DIAGNOSIS.md#task-context-for-init-and-adopt) already provide one optional project store, accepted-decision/correction rules, preserved unrelated notes, structural instruction links, host/CWD/target context and explicit-reading handoff. Working agents maintain the notes; Tibicen leaves no daemon. Four exact store locations are supported; other paths retain a limitation/manual connection.

Do not propose these as absent features. The [native observations](../../evals/results/2026-11-06-native-memory-recovery/README.md) show assisted reading, use and correction on one fixture, while retaining the original failed grade and its separate after-observation assessment. They do not isolate memory causality or general host behavior. The [repair comparison](../../evals/results/2026-11-06-repair-comparison/README.md) found equal task outcomes, not saved human work.

## What the complaints actually add

Two worktree reports express competing goals. One prefers shared repository knowledge; another wants branch-specific isolation. Both are closed, with different dispositions. Neither licenses a universal memory-sharing default. ([M1](https://github.com/anthropics/claude-code/issues/34975), [M2](https://github.com/anthropics/claude-code/issues/39920))

A staleness report found an outdated repository description, but explicitly says automatic memory was disabled, avoiding the reported risk. This is not an observed downstream failure rate. File age alone cannot invalidate a long-lived owner decision; that is our inference, not a measured result. ([M3](https://github.com/anthropics/claude-code/issues/85075))

A Codex user reports losing operational constraints during long sessions despite persisting rules in repository files. This supports separating storage from use, not a claim that another file or memory server fixes the harness. We did not reproduce the incident. ([M4](https://github.com/openai/codex/issues/51672))

The mixed Visual Studio/VS Code/OpenCode monorepo discussion asks which file is authoritative and where nested guidance applies. Its replies disagree; this is a useful problem statement, not a reliable compatibility matrix. It is shared with the first-use research lane, not an independent corroborating sample. ([M5](https://www.reddit.com/r/GithubCopilot/comments/1wre0j7/agentsmd_vs_githubcopilotinstructionsmd_when/))

## Sufficient native and plain-file paths

Claude currently documents repository-shared auto memory, inspection through `/memory`, and context rather than enforcement. A project file and its native tools may already suffice. Git supports separate branch checkouts, so versioned notes can retain deliberate branch differences without a synchronization service. Neither fact proves actual instruction use. ([M6](https://code.claude.com/docs/en/memory), [M10](https://git-scm.com/docs/git-worktree))

GitHub's current support matrix distinguishes Visual Studio Chat from VS Code and CLI. OpenCode V2 documents AGENTS-only discovery, unlike the older fallback assumption. Gemini exposes loaded context through `/memory show`. Check the selected surface/version instead of generalizing from an agent brand. These are declared contracts, not locally tested installations. ([M7](https://docs.github.com/en/copilot/reference/custom-instructions-support), [M8](https://dev.opencode.ai/v2/docs/instructions/), [M9](https://geminicli.com/docs/cli/gemini-md/))

A natural-language pointer is not universally an import. Current Tibicen already makes explicit reading a valid route; do not add native copies or rewrite personal memory just to make every host look identical.

## Candidate 1: one small context map in the existing answer

**Ordinary request:** “I moved this task to another agent/worktree. Which decisions should it read?”

**Visible result:** one short chain for this task, for example `project instructions → applicable local rules → docs/decisions.md`, with the supplied working/target paths, reading condition and unresolved native scope. Say “files connected; session reading unverified” when appropriate. Show a missing or ambiguous link where it occurs. No new report file unless requested.

**Residual gap:** today's report lists candidates and lexical scope; the user still assembles the relationship between those candidates, the chosen memory and the next reading step. This is the already-described [context-map extension](../../PRODUCT_VISION_ADDENDUM.md#5-connected-context-map), not a new context engine. A map is useful only if it changes a concrete next action.

**Smallest scope / upkeep:** low-to-medium: an answer/report view over already collected facts, preserving unsupported-host and loading unknowns. No new scan, global-memory inspection, backend, watcher or mandatory question. Host-specific claims still need source/version maintenance. Main risks are invented precedence, exposing forbidden content, and adding noise to a sufficient handoff.

**No-change alternative:** use the current task-context report, one explicit read request, or a native context inspector.

**Bounded falsification:** inspect six owned saved layouts once: sufficient shared file, missing pointer, legitimate nested exception, unsupported host, two ambiguous stores, and branch-specific notes. Compare the current output with a hand-written compact map. Reject implementation if each needed action is already clear, or if the map requires guessing active instructions. This is a deterministic coverage/editorial check, not proof of user savings. No new model execution is needed.

## Candidate 2: show source changes, not an automatic memory expiry

**Ordinary request:** “Our setup changed. Which saved project facts need checking?”

**Visible result:** only for an explicitly known note-to-source relation, show “referenced source changed; recheck this fact,” with the source path and limited evidence. An accepted dependency-approval policy remains accepted until replaced. Do not declare memory wrong because its timestamp is old, or silently overwrite notes.

**Residual gap:** existing rules already ask agents to retain reasons/sources and correct disproved facts; there is no general mechanical check that a project's remembered fact still matches its cited source. Thus this candidate is not “add provenance” again. Free-text interpretation remains an agent judgment.

**Smallest scope / upkeep:** medium and less justified than candidate 1. Reuse a deliberately supplied local source relation; do not infer bindings from arbitrary prose, introduce a mandatory entry schema, or add a second store. Path moves, unrelated source changes and optional metadata introduce maintenance and false-alarm risks. Preserve memory ownership and approval boundaries.

**No-change alternative:** read current files, the note's existing reference and Git diff during ordinary adopt; leave unsupported relations unknown.

**Bounded falsification:** manually review six trusted notes against saved source snapshots: changed relevant fact, unrelated edit, rename, missing source, old still-valid policy, and unsupported/private source. Reject a feature if current review gives the same action, if harmless edits are labeled invalid decisions, or if maintaining bindings costs more work than checking the note. No software prototype or live agent is necessary for this first rejection check.

## Exclusions and conclusion

No inspected case establishes a need for vector retrieval, chat ingestion, cross-project synchronization or a resident service. Therefore mem0/Letta integration is not selected; their SDKs were not evaluated here. SDD or a context catalog is not a remedy merely because it can store more artifacts. Host compaction/runtime defects remain upstream problems; Tibicen cannot guarantee obedience after setup.

Existing useful memory remains available. Rank the optional context map first, source-change visibility second, and no change ahead of either when the current/native explanation is sufficient. These are candidate decisions, not an implementation or study queue. The [earlier strategy](../2026-11-06-product-strategy/README.md) and [previous context study](../2026-11-05-post-1.3-priorities/context-and-memory.md) remain dated context; this lane creates no new release gate.

## Primary-source ledger

Bodies/relevant documentation sections opened on **6 November 2026**. “New” means absent from the earlier repository research inspected before this lane; it does not mean a new incident or independent demand. Living docs establish no installed-version guarantee. No quoted user paths or transcripts are copied.

| Source | Date/status/version at access | Reuse and evidence limit |
| --- | --- | --- |
| [M1: shared-memory preference](https://github.com/anthropics/claude-code/issues/34975) | 16 March 2026; closed duplicate; 2.1.76/Linux | New URL; reporter account, not reproduced. |
| [M2: isolation preference](https://github.com/anthropics/claude-code/issues/39920) | 27 March 2026; closed not planned/stale; 2.1.77/macOS | New; closure is not proof the requested behavior shipped. |
| [M3: stale notes](https://github.com/anthropics/claude-code/issues/85075) | 8 August 2026; open; 2.1.219/221/222, Windows | New; reported risk avoided with memory disabled. |
| [M4: long-session drift](https://github.com/openai/codex/issues/51672) | 7 October 2026; open; 0.160.1, gpt-6.1-sol/macOS | New; broad self-report, no independent reproduction. |
| [M5: mixed-tool monorepo](https://www.reddit.com/r/GithubCopilot/comments/1wre0j7/agentsmd_vs_githubcopilotinstructionsmd_when/) | Displays one month ago; VS 2026; exact builds absent | Shared root/first-use lead; contrary replies retained. |
| [M6: Claude memory](https://code.claude.com/docs/en/memory) | Living page; no single tested version | Rechecked source family; declared native alternative. |
| [M7: Copilot support matrix](https://docs.github.com/en/copilot/reference/custom-instructions-support) | Living page; feature/surface-specific | Newly inspected here; does not settle every nested-resolution detail. |
| [M8: OpenCode V2 instructions](https://dev.opencode.ai/v2/docs/instructions/) | Living V2 page; redirected to current instructions URL | Rechecked exact earlier source; no native run. |
| [M9: Gemini project context](https://geminicli.com/docs/cli/gemini-md/) | Living page; no release bound | Newly inspected here; native inspection is a sufficient countercase. |
| [M10: Git worktrees](https://git-scm.com/docs/git-worktree) | Manual last changed in 2.56.0, 28 September 2026 | Newly inspected here; branch mechanics, not memory-effect evidence. |

No installs, private/global memory reads, live agents, paid APIs, authentication changes, project experiments, Git operations or old-artifact writes were performed. Checks here are source reading and owned-document link/language validation, not runtime acceptance or human research.
