# Trust and sustainable quality after 1.4.1

Research checked **6 November 2026 (Moscow)**. Recommendation, not an approved implementation plan. Scope: a small maintainer of two temporary setup skills, not a security platform. Canonical English; Russian translation (`trust_ru.md`).

## Decision

**Hold integration breadth steady; earn trust through one reproducible useful route and preservation evidence.** Tibicen already has detailed mechanical controls. More harness names, security badges or evaluation machinery would increase upkeep before establishing incremental user value. The strategic asset to test is careful improvement of an existing setup while retaining the user's decisions. That is a hypothesis, not measured demand.

The minimum trustworthy core is the existing init/adopt workflow, exact approved change plan, bounded infrastructure writes, source/version provenance, preservation/recovery, and an honest handoff. Preserve the generic explicit-reading route for uncatalogued hosts. Keep native adapters narrowly versioned; a documented format can remain useful without a supported native-execution promise.

## Baseline and evidence limits

The [1.4.1 release report](../../evals/results/2026-11-06-release-1.4.1/README.md), [release procedure](../../RELEASING.md), [security contract](../../../SECURITY.md) and [maintenance guide](../../MAINTENANCE.md) record immutable source/distribution bindings, six platform cells, actual public delivery, edited-backup restoration, removal and preserved neighboring files. These are existing capabilities: do not turn them into a duplicate feature backlog. The separate checksum origin shares GitHub administration; matching bytes establish artifact identity within that trust boundary, not independent source safety.

The current [native report](../../evals/results/2026-11-06-native-first-use/README.md) records a successful setup recommendation, an assisted exact mechanical application and a failed fresh task with an uncorrelated child-process exit; later phases did not run. The failing command and cause remain unknown. This is an evaluation-observability gap, **not a demonstrated Tibicen product defect**. Internal assistance, loading, command success, useful work and human benefit remain distinct. No new evaluations were run for this study.

## What the fresh sources change

**Native functionality is strong counterevidence to a second trust layer.** Official OpenAI documentation describes explicit and implicit skill invocation, discovery through repository/user locations and automatic change detection. It also says discovery starts with metadata; full instructions load on selection. Thus an installed folder or visible skill name cannot prove that Tibicen's selected instructions affected work. A crowded catalog can even truncate descriptions or omit entries from the initial list. [Build skills][S1]

Codex documents separate technical sandbox controls and approval policy; the actual host configuration matters. Tibicen should explain applicable controls and defer to them, rather than promise an additional sandbox. A source-refresh trap appeared during this research: the old `/codex/security` URL now redirects to the **Codex Security code-scanning product**, whose page points elsewhere for agent permissions. URL reachability alone therefore cannot establish that a saved recommendation is still about the same capability. [Agent approvals and security][S2]

Claude Code provides permissions and workspace/server trust controls, but its documentation distinguishes interactive prompts from `-p` execution and notes that MCP servers can originate outside the repository. Reading `.mcp.json` alone is not a complete session inventory. These documented mechanisms are alternatives to extra Tibicen machinery; they do not establish behavior on the repository's historical Claude Code 2.1.283 contract. [Claude security][S3]

Native recovery also reduces Tibicen's differentiation. Claude checkpoints can undo tracked edits, while documented exclusions include some shell-only changes, subagent edits, external changes and linked paths. This supports testing Tibicen's exact owned-file preservation and interruption accounting against native recovery on the relevant task, not claiming native recovery is generally inadequate. [Checkpointing][S4]

**Scanning has become a baseline, with bounded coverage.** Claude's Enterprise upload/edit scanning explicitly excludes MCP servers and some existing or specially configured content, and says passing is no comprehensive safety guarantee. It is not a universal Claude Code local-skill gate. Vercel's 17 February 2026 announcement describes public partner audit results and installer risk displays from `skills@1.4.0`. These are vendor capability claims, not independently measured detection rates. They weaken a scanner-led Tibicen positioning. [Claude scanning][S5], [Vercel audits][S6]

## Risks grounded in Tibicen's actual surface

| Surface | Relevant risk and existing countercontrol | Residual boundary / strategic response |
| --- | --- | --- |
| Third-party skill selection and scripts | Untrusted instructions or executable resources; existing SHA/license/source/blocklist checks, heuristic injection scan and exact-plan consent | A pinned malicious revision stays malicious. Scanner output is a warning signal, not code audit or safety certification. Keep source identity visible; do not sell “safe skills.” |
| Infrastructure application and resume | Local edits, conflicting ownership, interrupted writes; existing hashes, path checks, backups, three-state recovery and approved scope | Preserve actual restoration receipts. Do not imply a native `/rewind` or Git reset safely understands Tibicen ownership. |
| MCP configuration/diagnosis | A recommended external executable inherits access; metadata-only diagnosis and explicit source/command consent already exist | A config-format check is not server containment, connectivity, tool correctness or upstream patch verification. Add components only for an observed task need. |
| Native loading and checks | Host startup, instructions, hooks, model and version drift | Record exact host/version/provider, launch mode and observed loading/use. Generic skill readability does not inherit native-adapter acceptance. |
| Releases and advice | Stale pages, installer changes, shared release administration | Keep immutable releases and existing warnings; review page meaning and affected contracts, not just HTTP status or a newer date. |

Two original upstream advisories show why versions and composition matter without establishing a Tibicen vulnerability. `mcp-server-git` before **2026.1.14** allowed `git_add` traversal; the published fix changed the Git operation. A later, distinct advisory covers a nested `.git` indirection bypass of `--repository`, patched in **2026.10.28**. The latter requires tool invocation, attacker-controlled content inside the allowed directory and an accessible outside repository; it is not an unauthenticated standalone remote exploit. Neither package is established here as bundled or installed by Tibicen. Their relevance is conditional selection and review of that external server; an earlier patch cannot substantiate a timeless “safe server” recommendation. [February advisory][S7], [October advisory][S8]

## Sustainable scope and release economics

The actual maintainer hours, incoming support volume and acceptable monthly budget are **unknown**. A defensible budget cannot be inferred from automated-test count, rapid releases or agent parallelism. Each adapter adds source review, native startup/auth knowledge, init/adopt behavior, preservation/update/recovery coverage and evidence translation. Cost grows with affected combinations and changes; a descriptive catalog entry is cheaper than an executable support promise but still needs review.

Ranked decisions:

1. **Complete one bounded native evidence route before adding adapters.** Reuse the active effort and its diagnostics; authorize any further live trial separately. If behavior cannot be observed, mark the route unverified instead of broadening claims.
2. **Present a compact proof package over existing records.** One user-facing example should show the original setup, the approved change, what stayed untouched, useful next work, and the recovery path. Link exact release/host versions and separately label “bytes checked,” “native instructions used,” “task completed,” and “human benefit unknown.” This is an editorial view, not another evidence store or telemetry service.
3. **Measure the upkeep of current promises.** During the next existing monthly/material-change review, record active review time, affected sources, changed contracts, failed checks, repair time and translation time. Keep no-change outcomes. Use observed totals to decide scope before promising more support.
4. **Release by demonstrated need.** Retain SemVer, immutable assets and existing candidate gates. Batch compatible nonurgent work when gates and support capacity justify it; handle a reproduced material defect or advisory through a bounded patch decision. Do not advertise weekly releases, 24/7 coverage, universal model compatibility or a response-time SLA without staffing evidence.

The existing next review is due **3 December 2026**, with earlier material-change triggers. A missed review should make the date/scope visible and pause new compatibility claims; it should not silently rewrite old evidence or disable a sufficient installed setup. This study creates no automation or service commitment. [Maintenance](../../MAINTENANCE.md)

Stop adding harness adapters, process integrations, new memory backends, a marketplace, automatic upgrades or a proprietary sandbox until a concrete user task beats the native route. Continue narrowly fixing demonstrated problems in existing contracts. Avoid a growing matrix of every model × host × version: publish tested observations and explicit unknowns, with generic portable use still available. This is a proposed expansion gate, not removal of published compatibility contracts.

## Smallest falsifiable experiment

**Proposal only:** after executor diagnostics are resolved and a finite protocol is approved, compare frozen Tibicen 1.4.1 with the chosen host's documented native setup/recovery on **two cloned synthetic repositories**: one already sufficient, one with a deliberately stale instruction link and a local owner edit. Use the same host/model/settings/task and equal bounded operator help; keep credentials and live services out. Rotate order if repeated. First validate that the reference task and grader work, then inspect actual resulting files and fresh instruction use.

Grade time/manual decisions to the first useful task, unnecessary modifications, exact owner-edit preservation, no-change correctness and interrupted-update recovery. Log assistance and failed attempts separately; inspect final state rather than rewarding a prescribed tool-call sequence. Anthropic's evaluation guidance explicitly warns that environments and graders can create apparent agent failures and recommends balanced positive/negative cases. This experiment tests direction, not population reliability. [Agent evaluations][S9]

**Stop rules:** stop immediately on an unauthorized change or lost owner edit; an uncorrelated runtime failure is inconclusive for product comparison. If native behavior achieves the same useful outcome with equal or less intervention, do not expand a Tibicen adapter for this job. If Tibicen improves the stale case while preserving the sufficient case, repeat narrowly on a genuinely volunteered real project before making a value claim. No participant recruitment, trial, installation or spending is authorized by this document.

## Source ledger and unknowns

All nine primary sources below were freshly opened on **6 November 2026 (Moscow)**. “Documented” means vendor text, not local observation. Advisories are first-party published findings/fixes, not reproduced here.

| ID | Source and original date/status | Finding / counterevidence retained |
| --- | --- | --- |
| S1 | [OpenAI Build skills][S1]; mutable, no release binding supplied | Native discovery/invocation already exists; metadata differs from full loading. |
| S2 | [OpenAI Agent approvals and security][S2]; mutable; legacy security URL changed topic | Native permissions/isolation; page migration needs semantic review. |
| S3 | [Claude Code security][S3]; mutable, no exact CLI bound | Native controls; noninteractive startup and extra MCP scopes limit assumptions. |
| S4 | [Claude checkpointing][S4]; mutable | Native recovery exists, with documented exclusions. |
| S5 | [Claude skill/plugin scanning][S5]; page says updated over two weeks ago; default policy names 2 October 2026 | Enterprise capability; exclusions and no-guarantee warning retained. |
| S6 | [Vercel automated audits][S6]; 17 February 2026 announcement | Existing audit displays; vendor scale/detection not validated. |
| S7 | [GHSA-vjqx-cfc4-9h6v][S7]; published 25 February 2026; patched 2026.1.14 | Corrected historical traversal, not current all-version vulnerability. |
| S8 | [GHSA-w766-5x43-whvw][S8]; published 28 October 2026; patched 2026.10.28 | Distinct composition risk, explicit attacker preconditions. |
| S9 | [Anthropic agent evals][S9]; 9 January 2026, engineering guidance | Balanced tasks and environment/grade attribution; not evidence of Tibicen benefit. |

Strongest countercase: native skill management, permission controls, recovery and audit displays may already satisfy the target developer. What remains unknown is whether Tibicen's preservation/explanation saves meaningful work, which routes users actually need, their tolerance for manual action, defect frequency, upkeep hours and willingness to support upkeep. The strategy should be withdrawn or narrowed if the proposed comparison finds no incremental benefit.

[S1]: https://learn.chatgpt.com/docs/build-skills
[S2]: https://learn.chatgpt.com/docs/agent-approvals-security
[S3]: https://code.claude.com/docs/en/security
[S4]: https://code.claude.com/docs/en/checkpointing
[S5]: https://support.claude.com/en/articles/15927065-get-started-with-skill-and-plugin-scanning
[S6]: https://vercel.com/changelog/automated-security-audits-now-available-for-skills-sh
[S7]: https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-vjqx-cfc4-9h6v
[S8]: https://github.com/modelcontextprotocol/servers/security/advisories/GHSA-w766-5x43-whvw
[S9]: https://www.anthropic.com/research/demystifying-evals-for-ai-agents
