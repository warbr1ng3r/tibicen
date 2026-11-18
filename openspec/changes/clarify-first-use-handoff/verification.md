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

The final joint package, including native Windows acceptance and the later 1,176-pass gate, is recorded in the [Windows verification](../enable-windows-project-commands/verification.md). The handoff remains source/resource guidance; no new fresh-model or automatic-loading observation is claimed.


## Release 1.7.0 closure — 18 November 2026

[1.7.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.7.0) was published at `2026-11-18T15:35:26Z` under the later owner-authorized release package. Source `6eef592d9638a063cb2b49c33fe4843e601956dd` binds distribution `d881334f638ccffa74bcc032a392451f5d5b8f52` through the actual `v1.7.0` annotated tag, object `5884e983a1a6f8ba1a0fa0becbe61b8c8950ad7e`. [Public offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44331525617) and [all six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/44331426419) passed on that source. All three returned assets and 115 archive files/modes match frozen candidate-01; published 1.6.0 is unchanged. Exact delivery, failed publication attempts and the narrowly reviewed failed-draft-upload cleanup remain in the [English release report](../../../docs/evals/results/2026-11-18-release-1.7.0/README.md).

The handoff observation covered two synthetic fixtures and four fresh collaboration contexts: **passed-with-assistance**. Explicit skill/instruction reading, controller rebinding of the usage-counter HOME and synthetic controller approval/application are disclosed. Fresh tasks passed within that bounded protocol; instruction reads are executor-reported, not an exported tool trace. This is not native-agent apply or human approval. Native autoload and measured human benefit remain unverified; no new paid API calls were made.

Earlier checkpoint versions, Unreleased statements, permission limits and failed results above retain their historical scope. This release closure does not regrade them or establish site deployment.
