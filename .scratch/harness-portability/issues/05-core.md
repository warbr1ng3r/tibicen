# Implement portable preference hints

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: 04

## Contract

Own [OpenSpec group 1](../../../openspec/changes/archive/2026-11-05-enable-harness-independent-workflow/tasks.md); no duplicated detailed checklist here. Exclusive edits: scripts/agents/profiles.ts; scripts/core/contracts.ts; tests/core/harnesses.test.ts; tests/presets/presets.test.ts; docs/HARNESS_CAPABILITIES.md; docs/HARNESS_CAPABILITIES_ru.md.
Preserve published pins, runtime/schema/write/adapter/credential authority. No
commits, public writes, native/model/API executions or extra dependencies. Root
owns task checkboxes and tracker updates. Retain actual focused check receipts.

## Answer

All six owned files are complete: shared dense-list validator, core known/unknown hints, focused tests and guide pair. 14/14 tests, ESLint and formatting passed; 15 policy/schema/adapter/lock inputs match HEAD. The guide links to sibling INSTALLATION/HARNESS_PORTABILITY guides; their final existence and browser parity belong to integration. Receipt: `.evals-private/harness-portability-20261105/core/receipts/receipt.json`.
