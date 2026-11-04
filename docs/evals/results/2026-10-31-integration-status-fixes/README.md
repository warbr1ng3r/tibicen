# Integration status corrections — 31 October 2026

Three reproduced first-release defects are corrected in the current working build. No new adapter, schema or dependency was added. These are mechanical corrections, not new agent-quality or human/pilot acceptance.

## Observed behavior

| Trigger | Before | Corrected behavior |
|---|---|---|
| A resume plan omits a required pending manual action | The original session could become complete and lose its pending record | Resume refuses before writes, from both saved state and a manual session after state cleanup. Explicit confirmed completion, retained pending actions, optional actions and separate fresh apply keep their existing semantics |
| Claude/Cursor MCP refers to a variable only in command/arguments | Planning and verification omitted the dependency and reported configured-unverified even with missing or unknown availability | Both paths include supported variable names and distinguish unknown, missing and available target contexts. Cursor non-environment placeholders remain excluded; config bytes and trust decisions are unchanged |
| A dotted Codex server name is pasted as nested bare TOML keys | A different table counted as the requested block being applied | Verification requires the requested table identity; the generated quoted block and single bare-key alias remain supported |

The Codex correction follows TOML's [key semantics](https://toml.io/en/v1.0.0#keys). No personal agent configuration, environment value or actual MCP server was accessed by these checks. Manual-action tests do not perform or invent an external action.

## Checks and review

- Root reproduced all three original defects independently of the source auditors in an owned minimal environment; exact failed behavior and fixture approvals remain recorded.
- Regression-first recovery tests exposed both omission paths; the final recovery file passes **36/36**. MCP regressions initially exposed seven failures; after correction and a review fix, the file passes **18/18**. Separate CLI/integration/process checks passed **38/38** before that last MCP nullish-input correction.
- Independent ponytail review accepted the core guard. MCP review found an introduced regression for previously accepted null envNames; the nullish fallback and two raw-JSON regressions corrected it. Rereview: **Ship**, with the original finding retained.
- The final pinned Node 24.15.0/pnpm 11.21.0 gate passed **728 tests, zero failed, one intentional portable skip**, in **76.364 seconds**. It includes lint, formatting, types, site build, strict active/archived specification validation and distribution build. All **768** frozen source files stayed unchanged during that gate.
- Both copied standalone self-tests passed outside checkout with Git absent from PATH and read permission limited to the copied distribution. Their scope is resource availability, not agent loading or behavior.

The run used owned HOME/TMP/package configuration and disabled only the previously diagnosed pnpm pre-run auto-install. Offline operation was procedural, without an extra outer OS sandbox or a network-isolation claim. No dependencies were installed.

A read-only coverage overlay binds the existing80mapped test names, five earlier regressions and13new tests to actual passing lines in this gate and current source hashes. The67case assignments and fixture locks are unchanged; the prior map is preserved. Root independently checked the overlay without rerunning tests. Semantic/human acceptance remains separate and open.

## Payload and limits

The build contains 86 payload files plus SHA256SUMS. Inventory SHA256: **36da6c7637bd101fc1c4e0087d2bec9cb98afbb16cf8820665c7b89a828ea547**. Compared with the prior working inventory 79002226def0ff0b1695cfc8fa854003c03ba7a655c2e29cfdae5c4f507cbd40, only the two copies of core/apply.ts and the two copies of mcp/index.ts differ. Version remains unreleased 0.1.0-alpha.1.

The earlier private rc.1/rc.2 archives and evidence remain unchanged; neither contains these later corrections. A new private archive was not created merely to repeat packaging. Exact original reproductions/source snapshots are in .evals-private/mvp-engineering-audit-20261031/; focused/full receipts, source freeze, build checks and review bindings are in .evals-private/integration-status-fix-20261031/ and the two review folders.

Executor usage remains 24/24: no new model/evaluation context or human grade was created. Prior platform observations retain their original source bindings. Accepted semantic/human evidence, actual voluntary pilot/support decisions and final immutable public-candidate checks remain open in the [readiness ledger](../../V1_READINESS.md). No shared version bump, commit or publication occurred.
