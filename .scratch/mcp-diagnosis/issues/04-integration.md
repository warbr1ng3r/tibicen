# MCP integration and review

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: 01, 02, 03

## Contract

Root owns OpenSpec, CLI/caller integration, roadmap, changelog, tracker and final
validation. Integrate resolved lanes, obtain independent Ponytail review, fix
findings, check complete distributed CLI flows on representative fixtures, and
run the full appropriate gate once after focused checks. Record one concise
paired verification report. Do not fabricate native connection or model results.

## OpenSpec contract

[Tasks](../../../openspec/changes/diagnose-local-mcp-context/tasks.md): group 1.2 and 3.1–3.2.
Read proposal/design/specs before edits. Root updates task checkboxes.

## Answer

Complete: all six OpenSpec tasks. Combined independent Ponytail review found one
sensitive-inspection gap; shared scanner/MCP predicate plus pre-inspection tests
fixed it. The contained-profile pin now covers 49 files per skill and both new
resource hashes. Final full gate 872 pass / 1 standalone skip / 0 failures;
exact candidate02 standalone 3/3, both self-tests, 15 CLI cases and approved
single-record repair passed with 14 unrelated files/modes preserved. Independent
code and final evidence verdicts: Ship. Candidate01/earlier failures retained.
[Consolidated verification](../../../openspec/changes/diagnose-local-mcp-context/verification.md)
records exact manifest, limits and actual checks. No native connection/model
claim, new writer, version bump, commit or publication.
