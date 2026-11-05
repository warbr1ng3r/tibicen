# Verification

6 November 2026, Europe/Moscow. Local Unreleased implementation on top of the
[task-aware](../explain-task-aware-setup/verification.md) and
[first MCP](../diagnose-local-mcp-context/verification.md) packets. Published
1.3.0, the root package version and prior evidence remain unchanged. No commit,
push, publication, paid API or personal configuration operation.

## Implemented scope

Any valid harness ID can select one of eight bounded formats or the common
`stdio-observation` route. Model/provider and catalog membership do not gate
diagnosis. Known JSON/TOML contracts produce parsed results; arbitrary source
languages can supply redacted states/env names bound by SHA-256 to inspected
UTF-8 text. `reported-stdio`/`caller-observation` remains distinct from
`valid-stdio`/`parsed-format`; source hashes establish neither semantic accuracy
nor safety. Stale/unavailable sources invalidate observations.

New readers cover ZCode native/shared JSON, current Kimi Code JSON and a bounded
Mistral Vibe TOML subset. Existing defaults, source/launch uncertainty, bounded
regular-file inspection and redaction are retained. Native activation and
connection stay unverified. Explicit format selection grants no writer; existing
repair still requires matching host, format, explicit source and exact path.

The [format guide](../../../docs/MCP_FORMATS.md) records dated primary contracts,
native policy limits and the general route for other harnesses, including
DeepSeek Harness YAML and GigaChat applications with code-defined configuration.
Five EN/RU guide pairs and one installed recipe are updated; both entry flows
reach the common recipe. No runtime dependency was added.

## Review corrections

- Root found observation-state coercion: a nonstring array could pass an enum
  check. Validation now requires an exact string; regression tests retain it.
- Root found raw standalone CR accepted in a TOML literal. The parser now rejects
  lone CR while preserving supported CRLF/LF sources.
- Independent Ponytail review found Unicode whitespace accepted outside TOML
  strings through generic trimming. Only ASCII spaces/tabs are trimmed; NBSP/BOM
  cases reject while Unicode inside quoted values remains supported.

All corrections have focused regressions. The independent post-fix MCP/CLI/
installed-resource run passed **62/62**, without skips. The reviewer also compared
15 table-definition cases against Python's TOML parser and checked the primary
native contracts. No remaining runtime or guidance finding was reported.

The first local acceptance-script attempt successfully exercised the fixture
cases and portable lifecycle, then failed its log assertion because Node used
the spec reporter instead of TAP. The harness now requests TAP explicitly.
Earlier logs are retained as `attempt-01-*`; they are not final-byte acceptance
or a product failure. Core-test assertions adjusted during implementation retain
the established distinction between source status and selected configuration.

## Final checks and exact standalone candidate

| Check | Actual result |
| --- | --- |
| Full repository gate | `pnpm test` exited 0: 891 passed, zero failures, one manual standalone skip (892 total); lint, formatting, types, site build, strict specs and distribution build included. |
| MCP contracts | 48 focused tests passed, including legacy behavior, all concrete readers, arbitrary hosts, caller observations, stale hashes, parser ambiguity and unchanged write authority. |
| Real CLI | 11 tests passed, including eight native fixture subprocesses and three matching/stale/missing-source observation subprocesses; no launch, leak or file/mode changes. |
| Frozen standalone | 100 payloads plus SHA256SUMS, both self-tests passed, 12 additional CLI cases passed outside the checkout. Nine fixture files and modes remained unchanged; no server sentinel appeared. |
| Portable lifecycle | Exact frozen candidate passed 3/3, zero skips. The existing test uses isolated synthetic home/PATH and exact operator approval for owned fixtures. |
| Distribution containment | The added dependency-free TOML helper makes 50 payloads per skill; frozen size assertions and helper-hash checks were refreshed without expanding native execution/session limits. |

Final SHA256SUMS SHA-256:
`dd54af8676ac89af2546e4ed8c286030f31dd819d241ab11fb1e652b727bcfaa`.
The standalone runner used Node 24.15.0 on macOS arm64. Independent review
recalculated all 101 frozen file hashes/modes and matched current `dist` to that
candidate, including exact inventory with no symlinks or extra files.

Raw records remain consolidated under `.evals-private/mcp-portability-20261106/`:
`full-gate.log`, `standalone/acceptance.json`, `standalone/portable.log` and
`docs-checks.json`. Source/guidance changes after freezing would require refreshed
affected evidence; subsequent project-only verification/tracker edits do not
enter the distributed skills.

## Limits

These are offline configuration and delivery checks, with caller-assisted
observation fixtures. No native application, MCP handshake, tool discovery,
live model/provider behavior or human usefulness was observed. Vibe TOML is an
explicit subset; arbitrary syntax uses observations, not an invented parser.
Target launch facts remain supplied evidence. Existing automatic writers remain
Claude/Cursor only, with the existing manual Codex helper. No browser behavior
changed; a new browser matrix was not required.

## Closure

Independent Ponytail verdict: **Ship**. All six tasks and four tracker tickets
are complete. The full gate and exact standalone receipts were independently
reviewed; remaining native/model limits above are unchanged.
