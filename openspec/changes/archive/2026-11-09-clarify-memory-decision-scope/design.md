# Design

## Context

See [proposal](proposal.md). Memory is user-owned Markdown linked from working instructions; Tibicen does not execute a semantic memory engine. The previous correction never received the later API name, so inventing that association would be wrong.

## Goals / Non-Goals

Capture supplied scope in future decisions and make matching exceptions usable. Preserve unknown identity as unknown. No alias registry, precedence engine, mandatory entry format, migration or automatic application-code change.

## Decisions

- Clarify the single shared memory reference and its generated-policy examples; keep the router and core unchanged. A runtime validator cannot decide whether two natural-language operations are identical.
- Record the supplied subject and affected behavior, and the part of an earlier decision it replaces. Preserve unrelated defaults. Current user instructions and ordinary permissions still govern.
- Use a neutral named operation in a new synthetic correction/reuse case, plus a same-operation contradiction. Freeze inputs, checks and finite limits before execution; disclose operator-staged instructions and selected subscription route. This observes the configured policy, not automatic generation or causal improvement over the old version.
- Keep the old HOLD and all previous packets immutable. Do not add source tests that merely search for the new wording; use actual behavior and meaningful functional/mutation controls.

## Risks / Trade-offs

- Overeager conflict resolution → retain clarification for unknown identity and unresolved same-scope requirements; include a negative native case.
- A single model follows the example → report its exact scope without a general harness or usefulness claim.
- Prompt wording changes the result → distinguish the new explicitly named case from the old unnamed case; make no before/after causal claim.

## Migration Plan

No migration. The next compatible release includes updated guidance. Existing project policies change only through an ordinary reviewed proposal; published 1.5.3 is unchanged.
