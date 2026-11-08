# Design

## Context

See [proposal](proposal.md). The proposal builder preserves supplied manual actions; finalization correctly treats required pending actions as blockers. Existing tests cover that protection and `complete` with unverified project checks.

## Goals / Non-Goals

**Goal:** resolve the guidance ambiguity before a manual action enters the approved digest.

**Non-goals:** infer human actors from free text, add schema fields, weaken finalization, rewrite accepted plans, or claim a model-behavior fix.

## Decisions

- Put the classification in `proposal-format.md`, already read before proposal construction. Replace the broad handoff reading blocker with an available-reading action and a pointer to that definition.
- Reuse actual proposal/finalization tests for runtime invariants. Prose-matching tests cannot reproduce model classification; native improvement needs a separate prospective observation.

## Risks / Trade-offs

- A genuine activation blocker could be dismissed as an optional check → retain an explicit external-human scenario and existing required-action/resume safeguards.
- Clearer wording may not change the next model result → claim only corrected guidance; preserve historical pending actions and all frozen observations.

## Migration Plan

No migration or release is selected. Existing accepted plans keep their digest and status. A later distribution includes the shared-reference edits through the ordinary release process.
