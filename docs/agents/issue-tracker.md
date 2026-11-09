# Issue tracker

## Current effort — first use and adoption

The owner approved the three post-1.5.4 fronts. The effort map (`../../.scratch/first-use-and-adoption-20261109/map.md`; private development record; excluded from public source) and dashboard (`../../.scratch/first-use-and-adoption-20261109/dashboard.md`; private development record; excluded from public source) own the current work. Priorities live in the [roadmap](../DEVELOPMENT_PLAN.md).

| Work | Owner | State |
| --- | --- | --- |
| Observe ordinary init and adopt (`../../.scratch/first-use-and-adoption-20261109/issues/01-ordinary-path.md`; private development record; excluded from public source) | none | Resolved: six native phases, both fresh tasks passed; cleanup verified |
| Find an available second-harness route (`../../.scratch/first-use-and-adoption-20261109/issues/02-second-harness.md`; private development record; excluded from public source) | none | Discovery complete; live route not established, native coverage open |
| Prepare clear user entry materials (`../../.scratch/first-use-and-adoption-20261109/issues/03-user-entry.md`; private development record; excluded from public source) | none | Resolved: README, recorded example and preview metadata |
| Keep one current roadmap (`../../.scratch/first-use-and-adoption-20261109/issues/04-current-plan.md`; private development record; excluded from public source) | none | Complete: current plan separated from intact history |
| Integrate reviewed findings and entry materials (`../../.scratch/first-use-and-adoption-20261109/issues/05-integration.md`; private development record; excluded from public source) | none | Complete: final pnpm test/build passed; individual lane reviews accepted |

The [first-use report](../evals/results/2026-11-09-first-use-1.5.4/README.md) records actual outcomes and limits. All prior native packets remain closed. A new live observation needs its own frozen finite protocol and root consent. The second-harness investigation does not read credentials or change logins/settings. Paid APIs, external posts, purchases and a new release are outside this packet.

## Latest completed release

[1.5.4](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.4) and Pages are published and verified. The [release report](../evals/results/2026-11-09-release-1.5.4/README.md) retains exact source/distribution identities, technical checks and narrow native-observation limits.

## History

The complete preceding tracker is preserved in [issue history](issue-history.md), at the same directory level to retain its links. Old “current” headings and stage-specific authorizations are historical records, not an active assignment or permission to repeat a closed packet.

## Wayfinding operations

- Effort map: `.scratch/<effort>/map.md`; label `wayfinder:map`.
- Child ticket: `.scratch/<effort>/issues/NN-<slug>.md`. Its path is its identifier. Link text uses the ticket title.
- Fields: `Type: grilling|prototype|research|task`, `Labels: wayfinder:<type>`, `Status: open|claimed|resolved`, `Assignee: none|<session>`, `Blocked by: none|NN, NN`. A map may use only `wayfinder:map`; tickets may use only `wayfinder:<type>`.
- Before starting, set `Status: claimed` and `Assignee`. Allowed paths and checks come from the ticket contract and linked OpenSpec tasks.
- A dependency is complete only when its ticket has `Status: resolved`. The frontier consists of open, unassigned, unblocked tickets, ordered by number. Run different batches sequentially; within a batch, run only tasks with ready inputs and non-overlapping allowed paths.
- On completion, add the result and evidence to `## Answer`, set `Status: resolved`, clear the assignee and add one link with a short result to the map's `Decisions so far`. A human decision requires the owner's response.
- Substantial change details and implementation checkboxes live in OpenSpec. A ticket holds the question/result, responsibility boundaries and a link to the exact task group. The roadmap holds stage order.
- `dashboard.md` is a view of the tickets, updated after status/dependency changes. A visual in chat is a snapshot, not a second tracker.
