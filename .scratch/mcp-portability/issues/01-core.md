# Portable core

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read [change design](../../../openspec/changes/decouple-mcp-formats-from-harnesses/design.md)
and [tasks](../../../openspec/changes/decouple-mcp-formats-from-harnesses/tasks.md),
groups 1.1–1.3. Own scripts/mcp/** and tests/mcp/** only. Preserve legacy source,
redaction and writer boundaries. Add no runtime dependency or execution. Verify
focused tests/types/lint. Root maintains OpenSpec checkboxes and integration.

## Answer

Implemented eight explicit native format contracts independently of harness ID
and the general hash-bound `stdio-observation` route. Parsed and caller-reported
stdio retain distinct status/basis; native activation/connection stay unverified.
New ZCode, Kimi Code and bounded Vibe readers preserve disable, literal-env and
target limits. Existing repair requires matching host, format and exact path.

Added one dependency-free Vibe TOML helper and 15 grouped regression tests;
all 48 MCP tests, core typecheck, focused lint and formatting pass. Root's early
review caught and corrected nonstring observation state and standalone CR in
TOML. Independent review then caught invalid Unicode whitespace accepted by
JavaScript trim/header whitespace; ASCII-only trimming/header syntax now rejects
NBSP/BOM outside strings while preserving Unicode inside values. Regression
coverage retains these corrections. No native launch, credentials, commit or
publication. Root owns integration, final review and full acceptance.
