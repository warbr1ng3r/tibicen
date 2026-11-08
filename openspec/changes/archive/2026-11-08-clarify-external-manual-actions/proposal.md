# Proposal

## Why

Shared handoff guidance both reserves `manual-action-required` for external human actions and requires it before any observed instruction reading. A fresh proposal also records ordinary future reading and a representative review as required manual steps. This confirms contradictory guidance, not a runtime-finalization defect or the cause of that model choice.

## What Changes

- Define required manual steps at proposal time as mandatory external human work that the agent cannot perform within the available authority.
- Have the agent perform available instruction reading; keep deferred or optional behavior checks separate as unverified results and first-use guidance.
- Preserve genuine human activation blockers, internal-defect handling, exact consent and already accepted plans.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: clarify the existing distinction between external manual integration and unobserved behavior in shared guidance.

## Impact

Two shared references: `proposal-format.md` and `stage-handoff.md`. No runtime, schema, finalization, skill entrypoint, version, published artifact or historical outcome changes. Existing manual-action and unverified-check tests remain the runtime safeguards; this clarification does not prove improved model behavior.
