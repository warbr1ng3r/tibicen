# Verification

## Local implementation — 18 November 2026

The shared `references/stage-handoff.md` now carries one copyable first-task recipe: actual absolute cwd, reviewed applicable native/custom instructions, optional selected memory and useful task. Absolute target paths avoid interpreting a project-relative path twice from a nested cwd. Unknown context is a named gap, and declining memory omits its reading step.

The paired portability guide corrects its 1.5.6 release pointer to published 1.6.0 and removes the stale statement that current published behavior lacks report context. The new handoff clarification remains **Unreleased**. Existing Windows limitation sentences are unchanged, pending the separate Windows execution work. No project-memory policy, runtime report/status/schema or native adapter changed.

## Checks performed

- `node --test tests/skills/resources.test.ts tests/skills/memory-instructions.test.ts tests/core/instruction-sources.test.ts tests/core/report-diagnosis.test.ts`: **23 passed, 0 failed**. The new resource check verifies the single shared example carries cwd, preserved custom entrypoint, nested instruction, selected memory and absolute target in the same order in EN/RU guidance. Existing checks retain both skill routes, resource closure, mutable memory and read-only/context evidence limits.
- `pnpm exec prettier --check references/stage-handoff.md docs/HARNESS_PORTABILITY.md docs/HARNESS_PORTABILITY_ru.md tests/skills/resources.test.ts openspec/changes/clarify-first-use-handoff`: passed.
- `pnpm exec eslint tests/skills/resources.test.ts --max-warnings 0`: passed.
- `pnpm exec openspec validate clarify-first-use-handoff --strict`: passed.

## Self-review and limits

Reviewed root init, nested/custom adopt, memory selected/declined, missing operations and unknown/changed task context against the recipe and scenarios. This is source/resource review, not fresh-session behavioral execution. The only correction from self-review was making the example target absolute; focused checks were repeated afterward.

Available reading stays within authority without another user approval; structural checks, actual explicit reading, native discovery and fresh-task use remain separate. No new resolver, registry, memory store, automatic loading claim, model/API call, paid cost, version bump, commit or publication. Native loading, model compliance and human usefulness were not observed. Root independent integration review and the combined gate remain pending in task 2.2.

## Root integration — 18 November 2026

Root reviewed the shared entry flows and paired guidance, then removed the new exact-example prose assertion: it duplicated the illustrative path strings rather than protecting behavior. The earlier 23/23 result above is retained as the agent's actual historical check; the final resource/memory/instruction-source/report set passed **22/22** without that test. Windows wording now explicitly scopes the old limitation to published 1.6.0 and points to the separate Unreleased implementation.

The final combined `pnpm test` passed **1,175 / 0 failed / 2 skipped** (the existing manual portable case and actual Windows suite on macOS). Both standalone self-tests and 114 payload hashes passed outside the checkout with isolated HOME and empty PATH. Task 2.2 is complete. This is source/resource integration, not new native loading, a fresh behavioral model session or human usefulness evidence. No version bump, commit, push or publication at this checkpoint.
