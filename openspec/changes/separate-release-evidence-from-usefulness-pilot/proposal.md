# Proposal

## Why

The owner cannot currently assess the prepared answers or recruit a pilot. [Public research](../../../docs/research/PUBLIC_AGENT_SETUP_EVIDENCE.md) can inform needs now, but the previous full-MVP release contract required human calibration and initial real-work observations before publication; repeating requests to the unavailable owner does not resolve that dependency.

## What Changes

- **Change the release acceptance policy**, while retaining the full original MVP feature scope. Technical readiness can be assessed from candidate-bound observable evidence and an independent engineering review without a prerelease human preference grade.
- Keep strict invariants, functional quality, positive skill loading/use and process init/adopt/use, supported coverage, exact delivery/update/recovery and maintenance readiness as release requirements. Neither public research nor a model's unsupported opinion satisfies these checks.
- Schedule human usefulness observations and human rubric calibration separately after publication when participants are available. Preserve missing observations, baseline definitions, privacy, separate init/adopt outcomes and the existing postpublication checkpoint; publish that measured benefit is unknown.
- Keep the existing human-calibrated experiment protocol available for studies that claim that evidence level. Existing evaluated outcomes and failures remain unchanged; document a separate engineering release assessment rather than weakening the grader or relabeling old runs.
- Reconcile the affected product, release and evaluation documents in one implementation change. Implementation was authorized on 3 November 2026. The policy is adopted through the linked tasks and verification; it grants no fresh model runs and does not declare 1.0 ready.

## Capabilities

### New Capabilities

None. Release readiness is part of the existing product contract.

### Modified Capabilities

- `product-scope`: distinguish technical release acceptance from measured usefulness, retain full functionality and observable evidence requirements, and allow an explicitly disclosed release without prerelease human calibration/pilot.

## Impact

Documentation and development acceptance policy only. No distributed skill, runtime, schema, dependency, product approval boundary or agent adapter change is planned. Implementation updates Product Vision §10.11/§13–14, PILOT, RELEASING, QUALITY_AND_REPORTS, V1_READINESS, CONTRIBUTING/README where affected, paired translations, current tracker contracts, and the active `prepare-first-public-release` / `build-agent-evaluation-harness` planning artifacts. The existing `evaluation-results` module and historical cohorts retain their semantics.

The [design](design.md) gives the remaining technical work and source evidence. The [tasks](tasks.md) track implementation; the [verification](verification.md) records the requirement map and executed checks. Existing executor usage is 24/24; this proposal grants no new evaluation budget, auth change, commit or publication.
