# Policy implementation verification

Policy implementation authorized on 2026-11-03. This map distinguishes preserved technical requirements from deferred voluntary research. Evidence audit and independent integration review are recorded as they complete; this document does not declare the release ready.

## Requirement map

| Requirement | Canonical implementation | Result |
| --- | --- | --- |
| Init and adopt apply approved changes | [Product Vision §1–5](../../../docs/PRODUCT_VISION.md#1-purpose-and-product-boundaries) | Both routes and their exact approval/application boundaries retained |
| Minimal setup and no-questions autopilot | [Product Vision §3/§5](../../../docs/PRODUCT_VISION.md#5-a-simple-user-flow-and-approval) | Sufficient/no-change outcomes and zero interview questions in autopilot retained |
| First-release features | [Product Vision §13](../../../docs/PRODUCT_VISION.md#13-target-product-first-release-and-implementation-order) | Presets/builder, current sources/provenance/core version, manifest/history, stdio MCP, infrastructure/compatibility checks retained |
| Positive additional skill and optional process | [Product Vision §13](../../../docs/PRODUCT_VISION.md#13-target-product-first-release-and-implementation-order) | Installation, loading/use and process init/adopt/new-session work remain technical obligations; OpenSpec stays optional per target project |
| Strict invariants and functional quality | [Product Vision §10.11](../../../docs/PRODUCT_VISION.md#10-engineering-layer) | L0 strict + L1 hard invariants/quality, at-most-two soft attempts and non-cancellation of invariant failures retained |
| Exact delivery and maintenance | [RELEASING](../../../docs/RELEASING.md) | Candidate bytes/install/update/backup restoration/recovery/removal, private/support/advisory routes and explicit publication remain required |
| Engineering evidence level | [QUALITY_AND_REPORTS](../../../docs/evals/QUALITY_AND_REPORTS.md#engineering-release-assessment) | Candidate binding and independent review required; missing mandatory observations remain open |
| Human usefulness and calibration | [Product Vision §14](../../../docs/PRODUCT_VISION.md#14-usefulness-and-quality-metrics), [PILOT](../../../docs/PILOT.md) | Deferred voluntary postpublication work, not completed trials; unmeasured benefit, privacy, baseline/denominators,50-session/8-week checkpoint and30-day reuse retained |
| Historical graded experiments | [QUALITY_AND_REPORTS](../../../docs/evals/QUALITY_AND_REPORTS.md) | Existing human-calibrated protocol/grader and old outcomes retain their meanings; no new human grade |

## Executed checks — 3 November 2026

- All seven implementation tasks were carried through the selected change. The policy and evidence audit do not complete missing product observations or authorize publication.
- Reconciled Product Vision, pilot/release/quality/readiness guidance, roadmap/current tracker, README/CONTRIBUTING and the two active release/harness change sets, with adjacent Russian translations. Their 48 existing task identities/checkbox states and old requirement/scenario names are preserved; deferred human work remains unchecked. Historical verification/review records are unchanged.
- The [engineering assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md) accounts for all 67 frozen IDs once, in order, in both languages. It separately marks reusable subcriteria, insufficient evidence and missing observations; it declares no overall semantic pass.
- The audit rechecked 1,101 indexed historical evidence hashes and inspected 57 selected original records. Current mechanical bindings cover 23 mapped inputs, 17 supplemental inputs, 43 runtime-source bindings, 31 unchanged fixture-construction inputs, and 80 + 5 + 13 saved passing test-name lines. The three mapped guide hashes changed only by the dated policy banner: removing exactly that banner reproduces each frozen hash. The initial strict hash-check failure and explicit documentation-only impact analysis are retained. Fixture digests were not dynamically recomputed and saved tests were not rerun.
- All 86 current payload hashes and 84 non-package source copies match. Conditional local 1.0 differs only in the two package-version fields; its archive bytes/modes match the retained distribution. This is reviewed impact analysis, not current-candidate agent execution or public delivery.
- Root independently spot-checked corrected PREF-06's actual question/reply, the assisted process completion/independent checks and the corrected conditional-candidate/cwd receipts. Unknown app/model builds, missing full traces, root assistance and original failed attempts remain explicit.
- Synced the product-scope delta: one modified and three added requirements; Purpose and three unrelated requirements preserved. Strict main-spec validation passes all six specs.
- `OPENSPEC_TELEMETRY=0 pnpm spec:check`: **23 current specs/changes and 6 archived changes passed**, zero failures. `git diff --check` passed. Relative file links and fragments resolve; both languages target English canonical documents.
- All 187 protected runtime/reference/test/build inputs and three frozen navigation-history files match the implementation baseline. No runtime/grader/control/fixture change, fresh executor/judge run or human grade occurred. The existing 24/24 executor freeze remains closed; the retained 728-pass/one-skip runtime gate was not rerun for documentation edits.

## Independent integration review

Reviewer `/root/review_public_research`, separate from the documentation/audit authors: **Ship; no actionable findings**. Reviewed integrated policy, active release/harness artifacts, translations, navigation and synced main spec. Independently checked both 67-ID lists, four sampled mechanical passed-log claims, sample artifact bindings, all three policy-banner equivalences, unrelated main-spec preservation and final ledger receipt hashes. The verdict covers this policy implementation, not 1.0 readiness. Every raw trajectory, fresh live behavior and public delivery were outside this review.

The original and corrected audit receipts, read-only inspection failures, task-progress snapshots and final integration record are retained under the local `release-evidence-implementation-20261103` audit directory. No historical experiment is regraded.

## Remaining work

The assessment's technical worklist remains open: exact candidate/profile applicability; missing input-bound decisions and traces; positive selected-version skill/process loading/use; immutable public delivery and maintenance routes. Tickets 96/98/99 retain these obligations. Human usefulness/calibration is deferred voluntary postpublication research with unknown benefit, not an unresolved prerelease questionnaire. No release, commit or public candidate is created by this change.
