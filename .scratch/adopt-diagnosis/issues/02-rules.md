# Clarify working-agent instructions

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Own references/stage-inventory.md, stage-proposal.md, stage-handoff.md, skills/tibicen-adopt/SKILL.md and tests/skills/resources.test.ts only; OpenSpec group 3. Follow writing-for-agents. Concise starting state, concrete finding, retain/change decision, exact approved diff, current checks and next action. No-change stays read-only. Distinguish recorded/current/expected/observed; scope agent/version/cwd/target or state limitation. Preserve all existing consent, memory and safety boundaries. No new resources/workflow/commands unless agreed with root.

## Answer

Four instruction files updated; current-vs-recorded and no-change boundaries retained. Initial focused checks passed; independent review then removed the newly added exact-prose test, leaving tests/skills/resources.test.ts unchanged from HEAD. Resource, memory and example checks passed in the final full gate; independent re-review returned Ship. See [verification](../../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/verification.md).
