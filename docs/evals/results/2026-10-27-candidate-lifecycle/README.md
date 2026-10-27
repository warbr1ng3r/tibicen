# Lifecycle acceptance of the installed candidate · 2026-10-27

The eight local L1 cases below were verified on frozen Tibicen **0.1.0 / source `3fb29efb1087a616aeb69a3b22f400972bfb8a3e`**. This is a deterministic run of the actual installed CLI; it does not establish a new agent session or human/semantic/release acceptance. No new product defects were confirmed.

The distribution was copied from maintainer-local record; omitted from public source into a separate owned temporary directory **outside the checkout**. Both skills were invoked by absolute path through Node **24.15.0**, with separate HOME/TMPDIR and a minimal PATH. After verification, the original candidate and installed copy match their initial snapshots byte for byte: 86 listed resources plus `SHA256SUMS` (87 files). SHA-256 of the checksum file itself: `6ecd6b77d28e7adf3e9921b20078c80b2091a0109c8b5b6bfabaa9a201b4de23`.

| Case | Observed result | CLI evidence |
|---|---|---|
| Init of a Node project without infrastructure | `complete`; structural `passed`; tiny Node test `green`, `firstAttempt: true`; application, test, package.json, and CI preserved | 001, 003–008 |
| Adopt with user-owned areas | `complete`; only the managed block was replaced, with a separately displayed obsolete rule deleted; prefix/suffix, CRLF, and permissions preserved; application/package/CI preserved | 009–013; `adopt-preservation.json` |
| Repeat/noop | Empty file plan; read-only scan/status/verify/report did not change bytes, permissions, or mtime, including the project manifest | 014–018; before/after snapshots |
| Refusal before application | Wrong digest → `consent-required`; application edit → `application-protected`; changed original AGENTS → `stale-plan`. No state or other writes | 019–022 |
| Mandatory manual step | A generic pending action and a separate Codex MCP TOML case produced `manual-action-required`. The host applied the block only to a temporary owned configuration; `mcp-verify` → `configured-unverified`, with no server launch | 023–026, 046–049 |
| Incomplete → resume | A registered AGENTS file deleted by the host was not hidden by an empty improve plan: `incomplete`, `missing-file`, exit 1, state preserved. New exact plan + digest → `resume` → `complete`, with the same session id, two attempts, and previous history | 027–036; `resume-history.json` |
| Preset and second project | Without `--requested`, refusal with no write; valid strict round-trip; unknown schema and instructions field rejected. A second Node project was scanned afresh, the host carried preferences into a new plan, new approval was given, and the result was `complete` | 037–044 |
| Unknown project manifest schema | `unsupported-manifest-schema` before writing; original manifest and history preserved | 045 |

The noop used the read-only path explicitly described in `stage-proposal.md`: with no changes or new executions, `apply` was not called. The absence of a write was not presented as saving new evidence in the manifest. In the manual MCP case, the saved report remains `manual-action-required`: the separate structural check of the temporary configuration was not declared a completed session or an MCP health check.

For init, the exact check command was an absolute Node path + `--test app.test.js`, using only an owned tiny fixture with one test. The CLI retained two completed command attempts for baseline/final; the host also executed the same owned test before/after. No arbitrary commands from an existing external project were executed.

In total, **50 receipts were saved: 48 candidate CLI calls and 2 direct owned Node test runs**. Each call records argv, cwd, a safe explicit environment, stdin JSON, stdout/stderr, and exit code. The exact plan was passed through stdin, and approval matched the returned digest. This is the deterministic test host's authority over its own fixtures; it is not presented as approval from an external project's owner.

Machine-readable summary: result.json (maintainer-local record; omitted from public source). Full local evidence: private result (maintainer-local), command index (maintainer-local), context (maintainer-local). This private area also contains receipts, initial/final hash/mode/mtime snapshots, final fixtures, and a copy of the owned HOME. The temporary installed copy is retained; its path is recorded in context.json.

Limitations: init was checked on a fresh Node project that already existed without infrastructure, not an empty directory. Incomplete was induced through the known missing-file defect; a sudden kill, an ambiguous command outcome, and retrying it were not checked here. The manual step remains pending in the saved report. Network-based sources and current practices, Git delivery/update/remove, supported-schema migration, OpenSpec/other components, instruction loading, task/quiz/compatibility in a new agent session, and human evaluation are outside this L1 observation. Sources and compatibility pairs are empty; no behavioral pass is claimed.

The host initially made two incorrect exit-code assertions: incomplete apply and status were expected to return 0, while the CLI correctly returned structured `incomplete` with 1. The original outputs were retained; commands were not repeated, and continuation used the saved result. Top-level `report.reason: null` is accompanied by the specific `checks.infrastructure.issues: missing-file`; this was not declared a separate defect.

Reads of real authorization, model/API/network calls, SDK/ZCode, new commits, and changes to product code/spec/tracker/frozen candidate: **0**. L1 does not close public acceptance, delivery, or a new working-session check.
