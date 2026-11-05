# Actionable local MCP diagnosis

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Implement the owner-approved next MCP packet autonomously in parallel lanes,
from current effective configuration and launch-context evidence to a precise
repair or native follow-up. Preserve existing task-aware setup work and all
approval/secret/application boundaries. Root integrates and reviews the complete
packet without requesting approval for routine implementation steps.

## Tickets

- [MCP diagnosis core](issues/01-core.md)
- [MCP workflow rules](issues/02-rules.md)
- [MCP user guide and contracts](issues/03-docs.md)
- [Integration and review](issues/04-integration.md)

## Decisions so far

- The owner requested a larger uninterrupted work packet after task-aware setup.
- Core/rules/docs inspect in parallel; OpenSpec binds the final implementation.
- No commits, publication, credentials or paid APIs. No arbitrary MCP launch.
- Keep validation and one consolidated acceptance record; no proof ceremony for
  every small task. Current and prior research are inputs, not new native evidence.

- Implementation is bound to [diagnose-local-mcp-context](../../openspec/changes/diagnose-local-mcp-context/tasks.md); strict validation passed.

- Core, rules and paired guides integrated; focused checks 43/43. Final review and standalone acceptance own remaining integration.

- [Integration](issues/04-integration.md): reviewed and fixed sensitive-path parity,
  refreshed exact contained bundle, final full gate and standalone passed;
  independent code/evidence Ship. All tickets/tasks closed, no public actions.
