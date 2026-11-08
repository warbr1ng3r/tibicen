# Proposal

## Why

The contained development evaluator stops Codex 0.157.0 on every top-level `error` event. The pinned CLI emits that event while still running, so the evaluator can cut off a later definitive turn outcome. This was observed after a documentation proposal had already been saved; the underlying native error and historical outcomes remain unknown.

## What Changes

- Await the definitive turn outcome after a generic error within the existing deadline and process/output limits.
- Keep error callbacks hash-only, immediate typed authentication/access rejection and all existing terminal containment guards.
- Add offline real-caller regressions before changing the collector. Preserve closed observations and require a new prospective freeze for subsequent native work.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: distinguish a nonterminal native error notification from a failed turn, without weakening acceptance or privacy.

## Impact

Development-only `scripts/evals/contained-codex.ts`, connected tests and paired evidence. No distributed skill, product version, new dependency, automatic retry, paid API or authentication change.
