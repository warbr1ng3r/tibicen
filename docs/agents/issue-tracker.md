# Issue tracker

**Current status — 5 November 2026 (Moscow):** [1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0) is published. CI, six platform cells, public Git install/update/removal and downloaded assets passed. The [memory/release report](../evals/results/2026-11-04-project-memory/README.md) records exact bindings, assisted fresh-session results and the separate Pages verification. Historical queues below retain their old outcomes; they are not a new execution budget.

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

## Current effort — project memory 1.1 release closure

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
