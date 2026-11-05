# MCP docs

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read-only discovery of current MCP docs and current primary host contracts (Gemini CLI/OpenCode V2), using browsing. Verify schema, scope precedence, native diagnostics and version limits. Propose concise EN/RU guide and exact acceptance fixtures; do not add automatic writers speculatively. Wait for final contract. Allowed eventual edits: assigned project guides only.

## OpenSpec contract

[Tasks](../../../openspec/changes/diagnose-local-mcp-context/tasks.md): group 1.3.
Read proposal/design/specs before edits. Root updates task checkboxes.

## Answer

Completed group 1.3 in the four assigned guides. The existing task-aware sections
remain intact; one new MCP section covers both entry flows, metadata-only stdin,
bounded/redacted inspection, caller-supplied source/launch evidence, supported
repair, no-change and native follow-up. Capability text keeps four readers
separate from the existing writers. Published 1.3 remains unchanged.

Fresh official Gemini MCP/configuration and OpenCode V2 MCP/configuration pages
and both schemas were read on 6 November 2026. Nearby guide links retain exact
layout, override, environment/trust and version limits; no native command ran.
Five root-level Russian OpenSpec translations were added with matching current
task states; root owns subsequent checkbox/contract synchronization.

Executed the documented stdin metadata against a temporary synthetic OpenCode V2
source through the real CLI: exit 0, `valid-stdio`, caller-supplied selected source,
unverified executable/cwd/env/connection and `no-repair-indicated`. Original source
hash and the fixture's one-file inventory were preserved. Command/argument and
environment values were absent from output. The temporary fixture was removed.
Checked nine edited/new documents and 31 local link destinations; both guide
translation pairs and five OpenSpec translations exist. Assigned guide diff
passes `git diff --check`. Markdown is ignored by Prettier; no formatting pass
is claimed. Connection/use remain unverified; no commit or publication.
