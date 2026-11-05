# MCP core

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read-only discovery of scripts/mcp, callers, types and tests. Propose a complete bounded diagnosis API and input/output: effective source/version, disabled/override, cwd/executable and env-name context, no secret output/execution. Identify the simplest repair path within current approved writers. Wait for final OpenSpec edit contract. Allowed eventual edits: scripts/mcp/ and tests/mcp/; root owns CLI.

## OpenSpec contract

[Tasks](../../../openspec/changes/diagnose-local-mcp-context/tasks.md): group 1.1.
Read proposal/design/specs before edits. Root updates task checkboxes.

## Answer

Strict metadata validator and pure single-server projection implemented for four bounded readers; one export reuses the existing unambiguous parser. 33/33 MCP tests, type/lint/format checks passed. Invalid-reference repair is limited to the exact existing writer with explicit source; missing environment/executable/cwd remains native follow-up. No native connection claim.
