# Target users: maintainers at a concrete setup change

Research/access date: **6 November 2026, Europe/Moscow**. Baseline: published **Tibicen 1.4.1**. This is qualitative primary-source research and proposed strategy, not interviews, measured benefit, market sizing or an approved implementation queue. The [effort map](../../../.scratch/product-strategy-20261106/map.md) defines ownership; the [product vision](../../PRODUCT_VISION.md) and [addendum](../../PRODUCT_VISION_ADDENDUM.md) remain authoritative.

## Recommendation

Choose a **hands-on repository maintainer about to change an existing agent setup** as the first recruitment hypothesis. The person may be a solo developer or a small-team technical owner. Qualify by an immediate event: adding another agent, returning to an unfamiliar repository, or updating a locally customized skill/rules setup before a real task. Do not qualify merely by the number of repositories or enthusiasm for agents.

The proposed job is: **“Prepare this repository for my next task in this agent, keep the useful decisions, and show what is actually ready.”** A secondary job is **“Update this customized setup without losing my changes.”** Both fit the existing adopt lifecycle. The strategic question after 1.4.1 is whether that lifecycle removes enough work compared with native tools; these sources do not establish a need for another product subsystem.

This choice is an inference from specific maintenance and configuration incidents below. No original report says that its author adopted Tibicen, wanted this exact bundle, would return to it or would pay. Selecting maintainers avoids treating solo, open-source and team labels as different products before comparative value has been observed.

## What the original evidence does and does not say

| Signal | Original report and later qualification | Strategic implication |
| --- | --- | --- |
| Source attribution matters | Codex [#29535](https://github.com/openai/codex/issues/29535) reports global relative links resolving from the workspace. An October commenter supplies a patch proposal; the issue remains open. | Inspect the actual source/path before suggesting more prose. A proposed upstream patch is not a shipped fix or a Tibicen opportunity by itself. |
| Accessible repositories can have different instruction scope | Codex [#38065](https://github.com/openai/codex/issues/38065) reports missing secondary-repository guidance in a multi-root workspace. | A repository owner can have a concrete scope problem. This does not authorize Tibicen to become a cross-repository execution orchestrator. |
| An apparent loading defect can be a different problem | In Codex [#8759](https://github.com/openai/codex/issues/8759), the author confirms global content was injected after checking session evidence; re-reading remained distinct. Closed as not planned. | Diagnosing “not loaded” from the model's answer would produce a wrong repair. Later unresolved replies do not reverse the original correction. |
| Local customization can be valuable | [skills #455](https://github.com/vercel-labs/skills/issues/455) reports update loss. The August confirmation distinguishes unchanged upstream from replacement after upstream moves. Still open. | Preservation is a specific job; “every update destroys edits” would be false. This is rechecked evidence, not newly discovered demand. |
| Multi-repo teams have working alternatives | A [small-team question](https://www.reddit.com/r/ClaudeAI/comments/1qdt91d/multirepo_in_claude_code_how_do_you_handle_it/) receives firsthand meta-repo/submodule workflows and a suggestion to use `/add-dir`. | These users may need execution context rather than setup. Existing workflows constrain any proposed multi-repo feature. |
| Team requirements can exceed setup | In Claude [#97907](https://github.com/anthropics/claude-code/issues/97907), the author narrows a role-bundle request after reporting hooks/settings remedies. Bash and instruction isolation remain concerns; later comments qualify hook coverage. | Do not translate a role-enforcement request into instruction generation. The promotional vendor reply is excluded as independent validation. |
| Cross-project uniformity is optional | In the [instruction-sprawl discussion](https://www.reddit.com/r/ClaudeAI/comments/1rq1o1p/is_anyone_else_struggling_to_manage_claudemd/), one respondent reports dotfiles/symlinks; another reports no reusable project overlap. The OP is proposing a competing tool. | Existing maintenance methods and deliberate project differences are counterevidence to universal presets. Promotion is not an independent customer signal. |

These are selected cases, not a representative sample or independent reproductions. Their count cannot estimate frequency, urgency across the population, retention or willingness to pay. The inferred commonality is **a change with existing decisions at risk**, rather than a universal preference for more infrastructure.

## Segment comparison and exclusions

| Candidate segment | Qualifying trigger | Smallest current alternative | Decision |
| --- | --- | --- | --- |
| Solo developer working across repositories | A specific repo needs a different agent or an update now; a real next task exists | Native initialization, a short instruction file, personal rules/dotfiles | Recruit conditionally. Multiple repos alone is weak qualification; reject an already sufficient setup. |
| Maintainer, including an open-source maintainer | Existing local policy, skills or agent files must survive a change | Read the current files, review a diff, back up customized folders and use native audit | **First hypothesis.** One person can judge preservation and whether the next task became easier. OSS status itself provides no demand or budget evidence. |
| Small mixed-tool team | A named owner is onboarding a second tool into one repo | Shared source-controlled guidance and native configuration | Secondary recruitment only when the bounded maintenance job matches. Do not normalize deliberate role differences. |
| Enterprise/platform team | Fleet propagation, policy enforcement, centralized access or audit guarantees | Managed deployment, permissions and organization controls | Defer. The requested outcome needs operational and enforcement contracts outside the lightweight skill boundary. |

Disqualify projects whose only complaint is that a model disobeyed correctly loaded guidance, users needing guaranteed writes confined by role, and users seeking coordinated implementation across many repositories. Also disqualify a first experiment with an undefined task, unavailable owner approval, sensitive data that cannot be minimized, or an environment that cannot support an observable native session. These are experiment boundaries, not claims that those users have unimportant problems.

## Native alternatives set the comparison

OpenAI's [workflow cookbook](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) already describes `/init` generating repository guidance from directory context. Claude's [memory documentation](https://code.claude.com/docs/en/memory) describes a reviewable multistage `/init` behind `CLAUDE_CODE_NEW_INIT=1`, and `/doctor prompt-audit` from v2.1.283. Direct AGENTS loading is conditional from v2.1.277. These are documented capabilities, not trials conducted here.

The strongest countercase is therefore simple: the owner runs the native tool, fixes a pointer or keeps a short file, and completes the task without Tibicen. Tibicen would have added installation, approvals and another handoff. “One recommended setup” and “files generated” are insufficient success criteria against this baseline.

The viable difference to test is **less owner work across diagnosis, a preservation-conscious approved change and a truthful handoff**. This is a comparative hypothesis, not an established moat. Prefer native configuration when it already meets the task; a useful no-change answer can be successful only if it does not take materially more effort than the alternative.

## What 1.4.1 already supplies

The [current capability guide](../../CURRENT_CAPABILITIES.md), [installation guide](../../INSTALLATION.md) and [project-memory contract](../../PROJECT_MEMORY.md) already cover task-aware setup/adopt, preservation, optional one-store project memory, bounded local MCP diagnosis and portable delivery. Those are the starting assets for this segment, not proposed new features. A setup issue is not automatically an MCP issue; choose a connection only when the stated task requires it.

The [native first-use effort](../../../.scratch/native-first-use/map.md) records a passed setup recommendation followed by an uncorrelated process exit in the useful task; later native phases stopped. Its separate diagnostic work does not prove a root cause or customer outcome. Publication, offline checks and assisted mechanical cases do not establish repeat use or benefit. Resolve the observation route within its own scope before recruiting people into a comparison that cannot finish.

## Smallest falsifiable experiment — proposed, not run

Participation is conditional: [PILOT](../../PILOT.md) records that the owner is currently unavailable for assessment or recruitment. Nothing is scheduled or delegated to the owner here. Without willing participants, retain these as unobserved hypotheses; lack of recruitment is neither demand failure nor a technical release blocker. The numbers below are suggested decision rules for a future agreed protocol, not replacements for PILOT's cohort rules.

First perform an **artifact-only screening exercise** with six voluntarily supplied, minimized setup cases from six different owners. Ask only for the actual change trigger, current files, chosen agent/version and the next task. Do not request credentials or complete transcripts. This is future voluntary research; no outreach or recruitment was performed here.

Prepare two comparable, reviewable recommendations for each case: the shortest native/current-method route and existing Tibicen 1.4.1. Blind the order where practical. Have the owner identify missing decisions, unnecessary changes and whether either proposal is worth applying. Count a case as qualified only when an immediate task and preservation requirement existed before seeing the Tibicen proposal. Recruit by that criterion rather than persuading an initially indifferent user that infrastructure is missing.

**Proposed screening go rule:** at least four of six cases qualify; in at least three qualified cases the owner chooses Tibicen's proposal because it removes a named manual step or protects a named local decision. Stop/reposition if fewer qualify, or if native tools are preferred in at least half the qualified cases. These are deliberately small decision thresholds, not statistically powered population estimates or measured results. Proposal preference alone cannot prove benefit.

Only after a separately approved finite native protocol can complete, compare four qualified cases on paired, similar tasks or minimized copies. Alternate order; record assistance, resets, agent versions and task differences. Each route gets the same approved write scope and a 30-minute cap. Count time spent approving, repairing output and recovering failures as owner work. A familiar maintainer's existing method is a valid control; do not handicap it by forcing unfamiliar native commands.

**Proposed behavioral go rule:** at least three of four owners complete a fresh useful task through Tibicen; at least three spend 25% less active owner time than their control; no protected-file loss or false success claim occurs. Report all failures and unequal cases. Any preservation breach or materially false handoff stops expansion pending diagnosis. No stronger performance or causality claim follows from this small study.

Observe whether an owner independently requests the same job for another repository or update within 30 days; separate this from prompted return. Report the actual denominator and cases with no new change opportunity. A one-off setup utility can still be useful without frequent recurrence; absence of a second occasion is different from rejecting it when needed. No recurring service, pricing test or team control plane should be justified by the screening result.

## Source ledger and freshness limits

All originals below were opened and relevant bodies/replies read on **6 November 2026**. Dates are source dates, not access dates. “New” means URL absent from previous research Markdown at the time checked; it does not mean a new incident. Nine substantive sources were used.

| Source | Date/version/status at access | Freshness and limits |
| --- | --- | --- |
| [Codex #29535](https://github.com/openai/codex/issues/29535) | 23 June; CLI 0.141.0/macOS; open; October replies | New. Original plus later patch discussion; no accepted fix established. |
| [Codex #38065](https://github.com/openai/codex/issues/38065) | 11 August; app 26.803.10989.0/Windows; open | New. Reporter reproduction; bot duplicate links are not confirmation. |
| [Codex #8759](https://github.com/openai/codex/issues/8759) | 5 January; CLI 0.77/0.78; closed 7 January, not planned | Rechecked. Original correction and later replies; later untriaged claims remain separate. |
| [skills #455](https://github.com/vercel-labs/skills/issues/455) | 1 March; 9 August confirmation 1.5.22; open | Rechecked. Report/confirmation, not an execution or claim about all current installers. |
| [Multi-repo question](https://www.reddit.com/r/ClaudeAI/comments/1qdt91d/multirepo_in_claude_code_how_do_you_handle_it/) | Displays 9mo ago; version/exact timestamp absent | New. OP and original remedies read; self-promotion excluded from outcome evidence. |
| [Claude #97907](https://github.com/anthropics/claude-code/issues/97907) | 28 September; updates 2/13/22 October; open | New. Author's correction read; same user's cross-post is not another affected team. |
| [Instruction-sprawl discussion](https://www.reddit.com/r/ClaudeAI/comments/1rq1o1p/is_anyone_else_struggling_to_manage_claudemd/) | Displays 8mo ago; versions/timestamp absent | Rechecked. Promotional OP and contrary original replies distinguished. |
| [Claude memory docs](https://code.claude.com/docs/en/memory) | Living docs; update date absent; stated version thresholds above | Rechecked. Initialization/audit/loading sections; not native session evidence. |
| [OpenAI workflow cookbook](https://developers.openai.com/cookbook/examples/codex/iterating-development-workflows-with-codex) | Page date/version binding not established | New. Agents/plans section only; not proof of universal generated-file quality. |

Searches emphasized repository transitions, instruction provenance, local changes and small-team alternatives. The selected English-language reports do not represent all users. Earlier [instruction](../2026-11-05-user-problems/instructions.md) and [reuse](../2026-11-05-post-1.3-priorities/reuse-and-updates.md) studies remain context; rechecked URLs are not counted again as new demand. No installations, runtime evaluations, paid APIs, outreach, implementation or publication occurred in this lane.
