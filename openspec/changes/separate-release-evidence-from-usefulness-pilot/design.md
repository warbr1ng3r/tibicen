# Design

## Context

See [proposal](proposal.md) for motivation. Implementation was authorized on 3 November 2026. The previous release/harness contract required human calibration and an initial pilot before publication. The adopted policy separates that voluntary research; technical acceptance, public candidate binding and support work remain open. See the [verification record](verification.md). The [research](../../../docs/research/PUBLIC_AGENT_SETUP_EVIDENCE.md) supplies external needs evidence, not those missing observations.

The latest [runtime integration](../../../docs/evals/results/2026-10-31-integration-status-fixes/README.md) has a recorded full gate of 728 passed/zero failed/one intentional skip. A [conditional local 1.0 draft](../../../docs/evals/results/2026-10-31-private-rc-preview/README.md#conditional-10-candidate) includes those fixes and checked local delivery. Neither proves accepted current-candidate agent quality or immutable public delivery. No new runtime defect was established by this planning inspection.

## Goals / Non-Goals

**Goals:** make the release decision possible from explicit technical evidence; keep all feature, safety, loading/use and maintenance obligations; make unknown human benefit visible; produce a finite evidence audit before deciding which checks need new execution.

**Non-Goals:** changing distributed behavior, suppressing failed attempts, rewriting the grader, adding an orchestration/probe framework, new adapters, repairing an optional external runner, enrolling the owner, or launching evaluations/publication through a planning action.

## Decisions

### 1. Use two assessments with different claims

The existing research protocol continues to govern human-calibrated experimental results. Add an engineering release assessment in the existing readiness documentation, not a second database or new runtime status. Each row records the requirement/case, candidate source and payload binding, agent/tool version where relevant, direct observation, independent reviewer/context, conclusion and limitations.

Engineering review can judge a concrete recommendation against repository facts, preserved decisions and the approved task. A review cannot create a missing loading trace, resolve an unknown version by assertion, prove participant preference or turn unobserved work into a completed task. Mandatory insufficient evidence remains open. An explicit unsupported path is acceptable only where the existing product contract permits it.

Alternative rejected: changing the old grader to accept missing human fields. That would alter historical evaluated results and confuse evidence levels. Also rejected: treating public anecdotes, a model playing the user or test counts as user benefit.

### 2. Reuse evidence by scope and binding before new execution

Inspect the existing mechanical mapping and raw observations first. Reuse only evidence whose inputs, relevant candidate bytes and claim scope match, or record a reviewed impact analysis of changed files and its limit. An older observation stays attributed to its original build; an impact analysis is not a newly executed candidate trial. Preserve rejected attempts and the candidate's at-most-two soft attempts; a hard invariant violation is not cancelled by a successful retry.

The current 24/24 executor freeze remains closed. An audit can identify a necessary fresh observation without starting it. Such a run needs its own finite, separately authorized freeze, exact versions/inputs and stop conditions; no paid fallback or hidden retry follows from this policy.

### 3. Keep usefulness research voluntary and time-bounded

After publication, report zero/unknown observations honestly until participants exist. Retain the current 50 sessions / 8 weeks checkpoint, separate 30-day reuse cohort and insufficient-data decision. Human rubric calibration belongs to any later study claiming human-calibrated conclusions; it is not silently satisfied by engineering review. Do not keep the owner questionnaire as a scheduled prerequisite.

### 4. Reconcile overlapping active requirements together

The `product-scope` delta sets the governing distinction. During implementation, update Product Vision §10.11/§13–14, the active release-process “First publication requires explicit release evidence” requirement, release tasks 3.3–3.4/4.1, and the harness release-assessment requirements/tasks 3.6/4.1–4.2. Keep human cross-check requirements for calibrated studies while removing their use as a universal prerelease dependency. Update QUALITY_AND_REPORTS, PILOT, RELEASING, V1_READINESS, current tracker contracts and paired translations in the same change. Cite the new policy; do not tick old trial tasks as completed. Preserve historical contracts/outcomes and revise current scheduling/status with a dated record.

## Remaining Technical Work

This is a sourced worklist, not execution evidence or a new all-agents × 67-case matrix. Detailed scenario tasks remain in the existing changes.

| Section | Already observed | Still needed / completion evidence |
| --- | --- | --- |
| Agent decisions and functional quality | [Readiness ledger](../../../docs/evals/V1_READINESS.md#finite-coverage-ledger): raw PREF pairs, sufficient/no-change examples and corrected mandatory-stage question | Criterion-by-criterion engineering assessment of the preserved observations, including no-questions, conflict, source refusal and remaining profile/format cases. List exact missing traces/bindings rather than declaring an entire group passed |
| Positive extra skill and optional process | [Component work](../extend-infrastructure-contracts/tasks.md), [process update](../../../docs/evals/results/2026-10-31-process-version-update/README.md), [recovered fresh workflow](../../../docs/evals/results/2026-10-31-release-followup/README.md) | Bind applicable installed skill loading/use and process init/adopt/update/fresh-task evidence to selected versions and candidate scope; preserve root assistance and diagnostic limits. Complete genuine gaps, not another install-only smoke |
| Platform/runtime and standalone resources | [Six platform cells](../../../docs/evals/results/2026-10-30-platform-checks/README.md) on public b08252e; current copied-resource checks | Final candidate applicability and any necessary targeted checks. Keep intentional Windows command refusal. Runtime ≥22.20 and site/dev Node ≥22.23.4 are different promises, as README already explains |
| Exact candidate delivery | [Conditional draft](../../../docs/evals/results/2026-10-31-private-rc-preview/README.md#conditional-10-candidate): 728 pass / 1 skip and 32 + 7 local lifecycle calls | Reuse the [existing candidate delivery procedure](../../../docs/RELEASING.md) for immutable candidate refs: installed bytes, alpha upgrade, external edited-file backup and restore, preset/history/resume/schema refusal/removal; review sanitized public source and downloaded assets |
| Maintenance and public claims | @warbr1ng3r confirmed core/adapter/security owner; private vulnerability reporting enabled | Finish source-review responsibility/procedure evidence, private conduct route and independent advisory/checksum channel under existing release requirements; verify working routes. Release notes disclose actual coverage and unmeasured benefit |

These sections have no defensible completion date until the evidence audit identifies which observations are actually missing. They do not establish a need for a new product feature.

## Risks / Trade-offs

- Uncalibrated engineering judgment can miss poor recommendations → require independent evidence-based review and retain absent human benefit as unknown; do not claim human-validated quality.
- Partial policy edits leave contradictory gates → review a cross-document requirement map and paired translations before integration.
- Easier acceptance becomes a false pass for missing behavior → mandatory positive loading/use, invariant and exact-candidate checks remain separate blocking rows.
- No postpublication volunteers → disclose insufficient data at the existing checkpoint and record a recruit/extend/close decision rather than inventing observations or resetting time.

## Migration Plan

Apply the documentation/policy tasks, independently review the resulting requirement map, then run the existing evidence audit under the new policy. Keep old observations/grades immutable and append the engineering assessment. Technical gaps retain their own scope/authorization. A policy rollback restores the prerelease human dependencies in current scheduling; no historical result or published artifact is rewritten. Commit, candidate publication and live execution remain separately scoped actions.
