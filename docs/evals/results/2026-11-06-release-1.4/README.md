# Tibicen 1.4.0 release preparation

**Unpublished draft — 6 November 2026, Europe/Moscow.** The owner authorized
work through commit, push and publication. Published 1.3.0 remains the current
release until the public candidate gates and returned-asset checks are complete.
This report records preparation; it does not establish publication.

## Scope and compatibility

The intended version is **1.4.0**, a compatible minor release:

- Optional selected-harness/version, working-directory and task-path context
  makes init/adopt reports and handoffs specific to the next task. Lexical
  instruction relationships remain distinct from observed native loading/use.
- Read-only `mcp-diagnose` examines one selected local server in up to four
  permitted, bounded project files. It explains source selection, disablement,
  launch prerequisites and the exact supported repair or native follow-up.
- Any valid harness ID can select an explicit known format or provide redacted
  stdio observations bound to inspected UTF-8 source text by SHA-256. Models,
  providers and catalog membership do not gate this route.
- Eight format contracts cover Claude Code, Cursor, Gemini CLI, OpenCode V2,
  ZCode native/shared JSON, current Kimi Code JSON and a bounded Mistral Vibe
  TOML subset. A selected format grants no new writer or execution permission.

Existing report calls, persisted schemas, presets, project-memory stores and
approval boundaries remain compatible. Task context and MCP observations are
request-time inputs; these changes introduce no persisted-format migration.
Existing automatic MCP writers remain Claude/Cursor only, with the existing
manual Codex helper. Installation replacement does not update a project's setup.
See [MCP formats](../../../MCP_FORMATS.md),
[task-aware diagnosis](../../../ADOPT_DIAGNOSIS.md) and the
[release procedure](../../../RELEASING.md).

## Candidate identity and public gates

| Item | Current status |
| --- | --- |
| Intended version/tag | 1.4.0 / `v1.4.0`; not published |
| Frozen candidate | `1.4-candidate-01`: 1,269 source files; 100 payloads / 101 archive files; generated skills report 1.4.0 |
| Fresh local gate and standalone | 891 tests passed / one manual standalone skip; exact standalone lifecycle 3/3, both self-tests, 12 MCP CLI cases and task-aware/legacy reports passed |
| Local update/recovery/removal | D01 passed independent acceptance; four installer calls and two installed self-tests in 1.501 seconds |
| Fresh affected guidance observations | I1 recommendation-only and A1 read-only proposal accepted independently; neither applied |
| Independent engineering review | Source, frozen candidate, I1/A1, D01 and exact distribution commit: Ship for the local release packet; public gates remain pending |
| Public source CI and six platform cells | Pending |
| Public full-SHA installation, update/recovery/removal | Pending |
| Returned release assets and checksum comparison | Pending |
| Pages deployment and returned-body comparison | Pending, separate from skill publication |

The frozen working-tree snapshot is based on local commit
`e73551082655449fcde668ecf7e42342f892e374`. Source inventory SHA-256:
`00f4914a163b8490bf2f934e7686e207875a0dbd395e533e823d7ebb4fe4c2dd`;
distribution inventory SHA-256:
`e2aac1e70ad092ba4cb2f0f441b3a75fe54a999a43a9ad54bc6ec39cb8a3161e`.
These identify local frozen inputs, not a final public source/distribution commit.

The three prepared assets are local and have not been downloaded from a release:

| Prepared asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `tibicen-1.4.0.tar.gz` | 264376 | `0b1df51d33c2e3b43cc5041ece30b397039d0b1c3f7f20c706014eb9b38e38d8` |
| `distribution-SHA256SUMS` | 10428 | `ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef` |
| `SHA256SUMS` | 177 | `272b8c4709b04cc4ca06ae9bbb5624135dd3b2b3c47f7a36ec6fb84e97768c93` |

The final public source/distribution SHAs and workflow URLs remain pending.
Earlier development candidates below keep their original identities.
Distribution commit `7b3b08f58276034b1609e44ef393e5f7c0e01a1b` is prepared
locally over the published 1.3 distribution, with the exact 101 candidate files;
it has not been pushed or publicly installed yet.
Independent review matched all 101 Git blobs to the exact candidate. The curated
public-source export's local gate also passed 891 tests / one manual standalone
skip, with zero failures; this is not a public GitHub CI run.

## Exact 1.4 candidate checks

Frozen install/build passed with the pinned toolchain. The fresh full gate exited
0 with 891 passed, zero failed and one manual standalone skip (892 total). It
included lint, formatting, types, site build, strict specs and distribution build.
The separate exact-candidate standalone run on macOS arm64 / Node 24.15.0 passed
both self-tests, all 12 MCP CLI fixtures, task-aware and legacy report checks,
and the skipped portable lifecycle (3/3, zero skips). Fixture files/modes remained
unchanged and no server sentinel appeared. The portable test uses synthetic
isolated home/PATH and exact operator approval for owned fixtures; it is not a
native application run.

D01 tested local-path universal 1.3→1.4 replacement, identical repeat, both
installed self-tests, complete restoration of edited backups into the actual
installed skill directories, and removal. All 100 candidate payloads matched.
The seven-file synthetic application, later owner memory, sibling skills,
external settings and original inputs were preserved. Application tests were
not run; this is installation lifecycle evidence. The trusted installer retained
ambient read capability, with writes limited to owned paths; OS isolation or an
OS firewall is not claimed. Public pinned delivery and `skills update` were not
observed. Independent D01 acceptance does not replace the pending guidance cases.

Raw receipts are retained locally under `release-1.4-20261106`: candidate-01,
its standalone record and delivery attempt D01. No paid API or native application
was used. Public delivery, asset download and Pages remain separate gates.
Receipt SHA-256 bindings: candidate
`2e17e92744432dde5f818ebe9411a4c4a7b884c151220b594febf001affb44b9`,
standalone `ba7be87da74ae10cd2a6b2ae1b7f4b9922756388661e8b1e2c1f4ef2f3f3d672`,
D01 `45bc1902e4c2b10b30e38fba55ad16a409323f129b4ffb83f6bda412dbf58f5e`.

## Fresh guidance observations

Two fresh internal agents explicitly read the frozen skill and applicable
references, then used only permitted fixture files and the candidate CLI.
Hypothetical target host/task context was supplied. Neither native application
was run; no plan was applied or project/configuration file changed.

| Case | Actual observation and review |
| --- | --- |
| I1 / init entry, unknown private-team-agent | Four CLI calls, zero retries. Carried unknown-host/task context and source-hash-bound caller observations for custom YAML; preserved the configuration, recommended no change pending native evidence, and stopped at manual-action-required. Independent result accepted for this recommendation-only scope. This is not applied initial setup. |
| A1 / adopt entry, selected ZCode | Six CLI calls exited zero, zero retries. Proposed only replacing nonexistent `pnpm lint` with the documented root `pnpm test`, explicitly noting that lint is not configured. Preserved integer-cents rules, memory, subtree instructions and the disabled project MCP record. Independent result review: Ship for this read-only, unapplied proposal; all 50 skill and six fixture files retained bytes/modes. |

I1's built-in scan did not classify the custom `.team/mcp.yml` as infrastructure;
the caller-supplied host contract enabled manual inventory. That assistance and
the unknown native launch directory were retained rather than treated as automatic
format support or a proven missing-script defect. A1 reported lexical instruction
candidates without claiming native merging and disclosed future internal/usage
writes in its proposal; none was performed. All fixture and frozen distribution
bytes/modes remained unchanged. No application tests or useful task were run.

Outcome SHA-256: I1
`a830c5c0c867c6ce09473566ff5cfbd06bae213a99de8c2c705a9c00fce3832b`;
A1 `f98249192a900cc4dc2abc03c629be9837958ca287f22833f239f35df6013801`.
The unapproved A1 proposal digest is
`5a2f15f286076449a67b8e0211a5e5d698ea35e9febfa723915bf719578efa5a`;
acceptance of its recommendation is not consent to apply it.
Raw reads, CLI records, proposals, snapshots and responses remain in the local
`observations/I1` and `observations/A1` directories. These supplement the earlier
implementation evidence below without renaming it as final-candidate evidence.

## Retained implementation evidence

These completed local packets predate the 1.4 versioned release candidate. Their
distributions carried development bytes with package metadata still 1.3.0;
they were never the published 1.3.0 distribution.

| Packet | Actual checks and limits |
| --- | --- |
| [Task-aware init/adopt](../../../../openspec/changes/explain-task-aware-setup/verification.md) | 849 full-gate tests passed / one standalone skip; separate exact standalone lifecycle 3/3. Four fresh source-assisted fixture sessions observed instruction/memory reading, use and correction. Selected host identities were inputs, not native applications. API-assisted apply used owned explicit homes. |
| [Local MCP diagnosis](../../../../openspec/changes/diagnose-local-mcp-context/verification.md) | Final gate: 872 passed / one standalone skip; separate lifecycle 3/3, both self-tests and 15 CLI cases. One separately approved Cursor fixture repair preserved 14 unrelated files/modes and launched no server. Earlier failed gate and superseded candidate are retained. |
| [Format-independent MCP](../../../../openspec/changes/decouple-mcp-formats-from-harnesses/verification.md) | Final gate: 891 passed / one standalone skip; separate lifecycle 3/3, both self-tests, 12 frozen CLI cases and 101 checked file hashes/modes. Independent Ponytail verdict: Ship. Parser/validation corrections and the initial acceptance-script reporter failure remain recorded. |

Those results establish their stated offline/source-assisted scopes only.
Changed distributed bytes require refreshed affected checks. Earlier public
releases and their failures, withheld cases and assistance retain their original
identities; see the [1.3 report](../2026-11-05-release-1.3/README.md).

## Remaining limits

No native application launch, MCP handshake, tool discovery, live model/provider
behavior or human usefulness was observed in these packets. Hash binding proves
which source an observation describes, not that its interpretation is correct,
safe or effective in the native client. Parsed configuration and caller-supplied
observations retain distinct results. Personal settings, credentials and paid API
calls are outside this release work. Public delivery and Pages remain separate
checks until their actual receipts are recorded.

The [release-note draft](release-notes.md) is prepared for publication only after
the pending gates pass.
