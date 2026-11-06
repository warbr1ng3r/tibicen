# Design

## Context

The earlier session policy fix passed its owner-socket red/green and 981-test gate. The next native launch was stopped before inference when independent review found containedCodexFailure also rejects item.completed command_execution with nonzero exit_code or status failed. Existing whole-caller tests already copy the real module into a temporary fixture and stub its dependencies; use this seam without credentials, containers or models.

## Goals / Non-Goals

**Goals:** match pinned Codex ordinary command-result semantics across the complete caller, preserve actual exit/status records, keep final acceptance and hard failures separate.

**Non-Goals:** changing failed patch handling, weakening container boundaries, identifying historical argv, installing helpers, regrading old attempts or increasing the current three-session/420-second budget.

## Decisions

Accept only command_execution completed items with string command and aggregated_output, status completed or failed and a concrete signed 32-bit integer exit_code. Treat the failed status with an actual ordinary exit code as a result, not a failed turn. The pinned Option<i32> also permits null, but null supplies no observed outcome and remains terminal under this conservative policy; it is not called schema-invalid. Retain terminal errors/turn.failed, declined/cancelled operations and failed non-command items; reject malformed command result fields.

Test the actual runContainedCodexSession stdout callback through its existing mocked-dependency fixture: a failed command result followed by a successful command and completed turn must survive, keep both observations and exit codes, and clean up. Keep terminal cases red. Do not add a helper-only green test as the sole proof.

The current native packet has no attempt markers. Root archives its prepared source/control/readiness/R1 metadata and Needs changes review as superseded revision one, then rebinds only prospective metadata after the new source gate and independent review. Preserve old controls as actual observations, repeat one freshly reviewed model-free control only if needed for the new source freeze, and retain the same finite native budget. The closed predecessor private packet stays untouched.

## Risks / Trade-offs

- CLI status failed can also mean command launch failed without an exit code → require a valid concrete ordinary result; keep malformed/unavailable exits terminal.
- A completed native turn may still contain a bad final result → keep independent candidate tests, behavior, protected-byte and actual memory-read grading.
- Earlier source reviews missed the second branch → report the later finding and first proof's scope explicitly; never alter the historical review receipts.
