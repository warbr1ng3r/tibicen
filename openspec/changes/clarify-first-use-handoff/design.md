# Design

## Context

See [proposal](proposal.md). The existing portable workflow already separates local operations from host/model identity, and report task context already distinguishes supplied values from native observations.

## Decisions

Keep one recipe in `references/stage-handoff.md`, reached by both skills. Build the copyable request from the reviewed working directory, applicable existing instruction paths and optional selected memory; retain the useful task. Preserve native/custom entrypoints rather than resolving precedence from filenames or adding another instruction file.

Keep the observation explanation outside the request: structural result, available explicit reading, native discovery and fresh-task use. Unknown observations stay unknown. Existing manual-action and incomplete-state rules remain authoritative.

Update paired portability documentation, including its stale release/context statements. No runtime field or persistent state is needed for a handoff produced by the working agent.

## Risks / Trade-offs

Resource tests protect shared-resource closure and task-context linkage; EN/RU example equivalence was reviewed manually. Neither check establishes model compliance. Native loading and usefulness still need separate observations; this package performs none. A real project may need a clarification if applicable instructions conflict; the recipe preserves that uncertainty rather than inventing an ordering.
