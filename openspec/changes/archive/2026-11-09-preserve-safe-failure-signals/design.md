# Design

## Context

See [proposal](proposal.md). `parseCodex` currently extracts bounded aggregate hints, then hashes terminal payloads. The contained caller separately duplicates the type/hash projection. The last memory-correction turn failed after a partial write; its original payload was not retained and remains unknowable. Shared interview guidance already covers substantial contradictions; the instruction-authoring step has no local trigger for documentation/code disagreement.

## Goals / Non-Goals

**Goals:** useful event-local evidence; a single privacy projection; a concrete trigger before instruction distillation; a prospective semantic discriminator.

**Non-Goals:** raw error retention, automatic recovery, old cause recovery, native reruns, a general code-contract analyzer, wider host claims or new runtime permissions.

## Decisions

1. Reuse the messageId/httpStatus/serverCode members of `NativeFailureDiagnostics` and the existing safe extraction in one pure error projector used by parser records and contained callbacks. Select only those three fields into optional per-event `diagnostics` when nonempty; do not spread requestIdHash, retryAfterSeconds or internalRetryCount. Unknown records remain exactly type/hash. This avoids a separate signals vocabulary, duplicated logic and unconditional empty objects. Aggregate extraction stays unchanged.
2. Extend the existing message identity union with context-window-exceeded, request-timeout, stream-disconnected and retry-limit-exhausted. Match the fixed context/timeout strings exactly; match stream/retry only at the anchored known formatter with bounded variable content. The new matcher has a 2,048-byte UTF-8 bound and rejects controls/newlines. Variable tails are discarded. IDs express a matched message template, never an authenticated provider cause or retry permission.
3. Ground formats in [pinned Codex error source](https://github.com/openai/codex/blob/00c972ed5d6ff6499317fd41b7f23605b8e6850d/codex-rs/protocol/src/error.rs) (Stream, ContextWindowExceeded, RequestTimeout and RetryLimitReachedError). The JSONL emitter flattens richer error categories; do not invent absent typed fields. Root verified the pinned source via public web reads; the attempted full local download failed DNS, so no pinned local blob is claimed.
4. Add one short branch/pointer to the architecture reference before shared instruction distillation. Existing interview rules remain the authority for questions/autonomy/gaps. Avoid duplicating those rules or choosing code over docs unconditionally.
5. Maintain one authored standalone case at `scripts/evals/fixtures/project-contract-conflict.json`, a paired case guide under `docs/evals/cases/project-contract-conflict/`, and one small offline Node test. Existing supported legacy records distinguish truthiness/strict false. An explicit owner-decision contrast prevents an accidental code-always-wins rule. Keep the existing math-specific diagnostic catalog unchanged. Behavioral controls grade declared outcomes, not instruction wording, and do not prove model compliance.

## Risks / Trade-offs

- Diagnostic allowlists can misclassify imitated text → label it message evidence, anchor/limit formats, test near-misses and unknown properties; preserve stop behavior.
- Private values in error tails → retain only fixed IDs, validated existing scalar fields and existing hashes; test both callback and final records with synthetic private markers.
- Earlier notifications mask later failure clues → event-local observations retain both while preserving legacy aggregate precedence.
- Extra prose may not improve model behavior → one local trigger only; no claim of a native model fix without a new prospective observation.

## Migration Plan

Additive development output; no attempt/core/runtime schema or dependency changes. The one shared reference change is Unreleased until later candidate preparation. Keep package version and published 1.5.3 immutable. Revert the projector/identity extension and reference paragraph together if needed; old receipts remain readable and unchanged.
