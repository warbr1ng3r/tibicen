# Issue tracker

**Current status — 5 November 2026 (Moscow):** [1.2.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.2.0) is published at `2026-11-05T03:46:37Z`. The [release report](../evals/results/2026-11-05-release-1.2/README.md) preserves exact bindings, the original native failure, scoped supplied-context observations and delivery results. The 804-test gate and current normal CI passed; six platform cells apply through unchanged inputs; mechanical full-SHA delivery matched 92 payloads for Codex, Claude Code and Cursor. Combined D03/D04 observations / engineering verdict: actual subcriteria of stopped D03 and the separate D04 report accepted / Ship for the frozen candidate and exact publication packet. Assets: passed: all three downloaded files match the exact release notes, tag and frozen candidate; 93 archive files/modes and 92 payload checksums match. Pages: deployment passed and all 18 returned bodies matched the official artifact; exact bindings are in [MAINTENANCE](../MAINTENANCE.md). Historical queues retain their old outcomes and grant no new execution budget.

Development in this repository uses Local Markdown. Git remote origin points to the public warbr1ng3r/tibicen repository; no external tracker is configured. The canonical tracker is in `.scratch/`; this directory is not excluded from Git. This setup is not part of the Tibicen distribution.

## Wayfinding operations

- Effort map: `.scratch/<effort>/map.md`; label `wayfinder:map`.
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`. Its path is its identifier. Link text uses the ticket title.
- Fields: `Type: grilling|prototype|research|task`, `Labels: wayfinder:<type>`, `Status: open|claimed|resolved`, `Assignee: none|<session>`, `Blocked by: none|NN, NN`. A map may use only `wayfinder:map`; tickets may use only `wayfinder:<type>`.
- Before starting, set `Status: claimed` and `Assignee`. Allowed paths and checks come from the ticket contract and linked OpenSpec tasks.
- A dependency is complete only when its ticket has `Status: resolved`. The frontier consists of open, unassigned, unblocked tickets, ordered by number. Run different batches sequentially; within a batch, run only tasks with ready inputs and non-overlapping allowed paths.
- On completion, add the result and evidence to `## Answer`, set `Status: resolved`, clear the assignee and add one link with a short result to the map's `Decisions so far`. A human decision requires the owner's response.
- Substantial change details and implementation checkboxes live in OpenSpec. A ticket holds the question/result, responsibility boundaries and a link to the exact task group. The roadmap holds stage order.
- `dashboard.md` is a view of the tickets, updated after status/dependency changes. A visual in chat is a snapshot, not a second tracker.

## Completed local effort — descriptive harness profiles (Unreleased)

The owner's autonomous continuation activated the [coverage map](../../.scratch/harness-coverage/map.md)
and [dashboard](../../.scratch/harness-coverage/dashboard.md). The strictly validated
[change](../../openspec/changes/archive/2026-11-05-catalog-harness-capabilities/proposal.md) owns
requirements/tasks; three disjoint lanes own core/catalog, read-only observation
and rules/docs/preset UI. Root integrated the lanes: 835/835 offline tests without skips, both portable lifecycles and independent code/source Ship.
Profiles are descriptive; write/adapter/installer/native evidence stays separate.
The work is local Unreleased; [verification](../../openspec/changes/archive/2026-11-05-catalog-harness-capabilities/verification.md) records actual results and retained corrections.

## Completed effort — 1.2.0 release and Pages

The owner delegated the release after the reviewed feature packet. The
[release map](../../.scratch/release-1.2/map.md) and
[dashboard](../../.scratch/release-1.2/dashboard.md) retain actual attempt accounting,
completed publication checks and integration results. Version-aware practice
evidence, adopt diagnosis and nested memory-pointer recognition are included;
broader harness coverage is now the separate [completed local effort](../../.scratch/harness-coverage/map.md).
Paid APIs, credential changes and rewriting published tags/assets remain outside scope.

## Latest completed local effort — version-bound practice evidence

The owner's “Поехали” approved the next implementation packet described after
the technology-refresh study: requirements, parallel core/rules/docs work,
integration and independent Ponytail review. The [map](../../.scratch/practice-evidence/map.md),
[dashboard](../../.scratch/practice-evidence/dashboard.md) and
[change tasks](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/tasks.md)
own the scope and actual progress. All tickets and six change tasks are complete.
[Verification](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/verification.md)
records independent Ship, 801/801 offline tests with portable lifecycle, both
self-tests and 92/92 checksums. Supplied versions remain context, not proved
compatibility. The completed change is synced/archived and included in 1.2.0 through the later
release packet. The original implementation packet included no version bump,
new native/model budget, push or publication.

## Completed research — technology refresh

The owner requested another public-source study of SDD, mem0, Ponytail, an
uncertain Netflix-related context tool and other current tools, including whether
self-updating recommendations would improve Tibicen. The
[map](../../.scratch/technology-refresh-research/map.md) and
[dashboard](../../.scratch/technology-refresh-research/dashboard.md) separate three
research lanes and root synthesis. All lanes and independent evidence/synthesis
review are complete in the [study](../research/2026-11-05-technology-refresh/README.md).
It recommends bounded version-aware evidence refresh before new integrations.
Scope is primary-source research and paired documentation, not implementation,
installation, native evaluation or publication.

## Earlier completed local effort — adopt diagnosis follow-up

The owner's 5 November instruction authorized this packet with parallel
core/rules/docs agents. Implementation and independent review are complete;
the work is Unreleased. Use the [map](../../.scratch/adopt-diagnosis/map.md),
[dashboard](../../.scratch/adopt-diagnosis/dashboard.md) and
[change tasks](../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/tasks.md). Scope is
existing report/current structure, instruction-scope explanation and clear
repair/no-change handoff. It includes offline checks and independent Ponytail
review, but no commit, publication, version bump or fresh native-agent budget.
Actual checks and retained correction history are in [verification](../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/verification.md).

The owner's autonomous continuation closed that change and extended offline
lifecycle acceptance. It also reproduced a false missing-memory-connection in
permitted existing nested native rules. The [bounded correction](../../openspec/changes/archive/2026-11-05-detect-nested-memory-connections/proposal.md)
is complete through [core](../../.scratch/adopt-diagnosis/issues/07-nested-memory-connections.md),
[docs](../../.scratch/adopt-diagnosis/issues/08-nested-memory-docs.md) and
[integration](../../.scratch/adopt-diagnosis/issues/09-nested-memory-integration.md).
It changes structural recognition only. All tasks/tickets and sync/archive are
complete; [verification](../../openspec/changes/archive/2026-11-05-detect-nested-memory-connections/verification.md)
records independent Ship, 798/798 tests without skips and changed-byte standalone
checks. No release or commit is implied by local completion.

## Completed research — current capabilities and public user problems

The owner requested a factual snapshot and public-source research on 5 November.
The [research map](../../.scratch/user-problems-20261105/map.md) and
[dashboard](../../.scratch/user-problems-20261105/dashboard.md) record three completed parallel
source lanes, root synthesis and independent review. The deliverables are the
[current-capability snapshot](../CURRENT_CAPABILITIES.md) and
[opportunity study](../research/2026-11-05-user-problems/README.md). Scope is
documentation and read-only research; no product changes, commit/publication,
new native evaluations or paid APIs follow from this instruction.

## Completed effort — project memory 1.1 release closure

The memory map (`../../.scratch/project-memory/map.md`; private development record; excluded from public source) and dashboard (`../../.scratch/project-memory/dashboard.md`; private development record; excluded from public source) record implementation, independent review and the owner's later release instruction. Core/rules/docs and landing L1–L6 are complete; exact publication evidence is in the [report](../evals/results/2026-11-04-project-memory/README.md). All 24 memory tasks and all six landing tasks are complete; Pages matched all 18 official artifact bodies. No new native contexts or paid API budget are granted. The released 1.0 effort remains historical. Future landing L7–L10 and voluntary usefulness research are separate work, with no inferred success.

## Historical prerelease effort — through 3 November 2026

The destination is the **full original MVP →1.0**. For technical release work, read the [engineering assessment](../evals/ENGINEERING_ACCEPTANCE.md) for missing observations and source/version/candidate bindings, and the [readiness ledger](../evals/V1_READINESS.md) for remaining technical and support gates. Use the map (`../../.scratch/codex-zcode-acceptance/map.md`; private development record; excluded from public source) for decisions and the dashboard (`../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source) for the active work view. Detailed behavior tasks stay in OpenSpec; milestone order stays in [the roadmap](../DEVELOPMENT_PLAN.md).

Under the 2026-11-03 policy, technical acceptance requires independent engineering review and observable positive SKILL/PROC loading/use on the applicable versions and candidate. Human usefulness observations and rubric calibration are voluntary postpublication work; measured benefit remains unknown. Continue technical evidence and support work without scheduling an owner questionnaire.

The owner requested autonomous work without routine approval pauses. Continue ready work in separate owned scopes, integrate results and obtain independent review. Root may approve concrete synthetic fixture proposals; no human rating or pilot result may be inferred from that approval. Current execution details and finite limits belong to the claimed ticket. Paid API, personal auth changes, commits and publication require their own explicit authorization; old stage-specific approvals do not grant it now.

The owner's new delegation is tracked in 139 (`../../.scratch/codex-zcode-acceptance/issues/139-complete-delegated-release-acceptance.md`; private development record; excluded from public source). Its named finite scopes govern new technical observations; current results, failures and attempt accounting are in the dashboard. Historical24/24stays closed. No paid API, personal auth change, commit or publication follows from this delegation.

Root retains full product acceptance (`../../.scratch/codex-zcode-acceptance/issues/96-complete-full-mvp-product-acceptance.md`; private development record; excluded from public source). The latest [integration status corrections](../evals/results/2026-10-31-integration-status-fixes/README.md) are complete and independently reviewed. [Earlier preference observations](../evals/results/2026-10-31-preference-decisions/README.md) retain their original failures and limits. Executor usage is 24/24; no further executor work under this freeze.

The [preview report](../evals/results/2026-10-31-private-rc-preview/README.md) keeps rc.1 lifecycle/source-gate evidence separate from rc.2 archive/local-replacement checks. Both previews predate the latest runtime corrections. Their outcomes remain historical; mandatory technical evidence, support decisions and final immutable public-candidate checks remain open.

A [conditional local 1.0 draft](../evals/results/2026-10-31-private-rc-preview/README.md#conditional-10-candidate) packages the latest corrections with checked local delivery. It is preparation, not accepted/public 1.0. Its prepared human-assessment page is an optional resource for voluntary postpublication research; missing human answers retain their meaning and do not block technical release work.

Read [historical effort notes](issue-tracker-history.md) only when tracing an older result or permission. Historical "next" and "current" wording describes its recorded stage.
