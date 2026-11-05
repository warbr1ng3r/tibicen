# MCP portability dashboard

| Ticket | Status | Owner | Dependencies |
| --- | --- | --- | --- |
| [Core](issues/01-core.md) | resolved | none | none |
| [Sources and workflow](issues/02-docs.md) | resolved | none | none |
| [CLI acceptance](issues/03-cli.md) | resolved | none | none |
| [Integration](issues/04-integration.md) | resolved | none | 01, 02, 03 |

All six tasks and four tickets are complete. Independent Ponytail: Ship.
Full gate 891 passed / one manual standalone skip; exact standalone 3/3 without
skips, both self-tests, 12 CLI cases and 101 frozen hashes/modes checked.
[Results and limits](../../openspec/changes/decouple-mcp-formats-from-harnesses/verification.md).
Local Unreleased; native activation/connection and model behavior unverified.
