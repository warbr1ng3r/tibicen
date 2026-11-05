# MCP diagnosis for arbitrary harnesses

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Implement the owner's approved capability-based packet without restricting the
common route to named harnesses. Any valid host can explicitly select a known
format or provide safe source-bound observations. Concrete native readers are
additional coverage, not a product allowlist. Preserve all earlier local work.

## Tickets

- [Portable core](issues/01-core.md)
- [Native sources and workflow](issues/02-docs.md)
- [Real CLI acceptance](issues/03-cli.md)
- [Integration and independent review](issues/04-integration.md)

## Decisions so far

- The owner approved implementation, then clarified that all harnesses should
  have a common route, rather than only ZCode/Kimi/Vibe additions.
- [OpenSpec tasks](../../openspec/changes/decouple-mcp-formats-from-harnesses/tasks.md)
  own detailed behavior. Root owns checkboxes and integration.
- Native JSON/TOML parsers and hash-bound caller observations have different
  confidence; neither proves native activation/connection or model behavior.
- No paid API, personal settings, native launch, commit or public action.

- [Core](issues/01-core.md): eight explicit readers and the arbitrary-host
  source-bound observation route; 48 MCP checks after review fixes.
- [Sources/workflow](issues/02-docs.md): five EN/RU guide pairs and installed
  recipe, checked primary contracts, local links and metadata examples.
- [CLI](issues/03-cli.md): 11 tests passed, including no-launch/no-leak/source
  preservation and arbitrary Python observations.
- [Integration](issues/04-integration.md) is claimed after all dependencies
  resolved; full gate and frozen standalone are running.

- [Final integration](issues/04-integration.md): full gate, exact standalone and
  independent Ponytail Ship; all tasks/tickets closed. Native/model limits stay
  explicit. Work is local Unreleased with no public operation.
