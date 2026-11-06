# Tibicen 1.4.0 release report

**Published 6 November 2026 at 03:10:57 Europe/Moscow (00:10:57Z).**
[Release 1.4.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.4.0),
ID `435921093`, passed public source CI, all six platform cells, exact public
delivery and returned-asset verification. Pages remains a separate pending deployment.

## Scope and compatibility

Version **1.4.0** is a compatible minor release:

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

| Item | Actual status |
| --- | --- |
| Published version/tag | [1.4.0 / v1.4.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.4.0), release ID 435921093 |
| Frozen candidate | `1.4-candidate-01`: 1,269 source files; 100 payloads / 101 archive files; generated skills report 1.4.0 |
| Fresh local gate and standalone | 891 tests passed / one manual standalone skip; exact standalone lifecycle 3/3, both self-tests, 12 MCP CLI cases and task-aware/legacy reports passed |
| Local update/recovery/removal | D01 passed independent acceptance; four installer calls and two installed self-tests in 1.501 seconds |
| Fresh affected guidance observations | I1 recommendation-only and A1 read-only proposal accepted independently; neither applied |
| Independent engineering review | Source, frozen candidate, I1/A1, D01, exact distribution and P01: Ship within their stated scopes |
| Public source CI | [42133771601](https://github.com/warbr1ng3r/tibicen/actions/runs/42133771601) passed on source `dfc85d7…` |
| Six platform cells | [42134245813](https://github.com/warbr1ng3r/tibicen/actions/runs/42134245813): macOS 15 / Ubuntu 24.04 / Windows 2022 × Node 22.20.0 / 24.15.0, all passed |
| Public full-SHA installation, update/recovery/removal | P01 passed; four installer calls and two installed self-tests in 10.330 seconds |
| Publication | [42134902094](https://github.com/warbr1ng3r/tibicen/actions/runs/42134902094) passed; release published at 2026-11-06T00:10:57Z |
| Returned release assets and checksum comparison | All three actual downloads match candidate bytes and API hashes; 101 archive files/modes match |
| Pages deployment and returned-body comparison | Pending, separate from skill publication |

The frozen working-tree snapshot was based on local commit
`e73551082655449fcde668ecf7e42342f892e374`. Source inventory SHA-256:
`00f4914a163b8490bf2f934e7686e207875a0dbd395e533e823d7ebb4fe4c2dd`;
distribution inventory SHA-256:
`e2aac1e70ad092ba4cb2f0f441b3a75fe54a999a43a9ad54bc6ec39cb8a3161e`.
Those are the original local freeze identities. The curated public source is
`dfc85d75698094d614ac66511c0b0c13fa54c0bf`; publication operations ran at
`e114edcd6d6a31b693013ddae911ba6c6f1ac425`. Neither replaces the historical
working-tree snapshot or its inventory.

Annotated tag `d7a49b1cfc9c604daa08d4101a320a3bb2e59052` points to distribution
`7b3b08f58276034b1609e44ef393e5f7c0e01a1b`, whose 101 Git blobs match the exact
candidate. The same distribution was installed from its actual public full SHA.
Both the curated export's local gate and the separate public source CI passed;
they are distinct observations. Earlier development candidates below retain
their original identities.

All three published assets were downloaded and verified:

| Published asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [tibicen-1.4.0.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.0/tibicen-1.4.0.tar.gz) | 264376 | `0b1df51d33c2e3b43cc5041ece30b397039d0b1c3f7f20c706014eb9b38e38d8` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.0/distribution-SHA256SUMS) | 10428 | `ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.0/SHA256SUMS) | 177 | `272b8c4709b04cc4ca06ae9bbb5624135dd3b2b3c47f7a36ec6fb84e97768c93` |

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
OS firewall is not claimed. D01 was local-path evidence: it did not observe
public delivery or `skills update`. Public delivery was subsequently observed
in P01 below; guidance observations remain separate.

Raw receipts are retained locally under `release-1.4-20261106`: candidate-01,
its standalone record and delivery attempt D01. No paid API or native application
was used. Public delivery and asset downloads were subsequently checked below;
Pages remains separate.
Receipt SHA-256 bindings: candidate
`2e17e92744432dde5f818ebe9411a4c4a7b884c151220b594febf001affb44b9`,
standalone `ba7be87da74ae10cd2a6b2ae1b7f4b9922756388661e8b1e2c1f4ef2f3f3d672`,
D01 `45bc1902e4c2b10b30e38fba55ad16a409323f129b4ffb83f6bda412dbf58f5e`.

## Public delivery and returned assets

P01 used the pinned `skills@1.7.4` installer with the explicit universal target
and full public SHAs: published 1.3 `b61a19583dc91ee9e3e795250d733d2cc99e6569`
then 1.4 `7b3b08f58276034b1609e44ef393e5f7c0e01a1b`. Four installer calls and
two installed self-tests all exited zero, without timeouts or outer retries.
Three Git traces confirmed exact fetch/checkout and the expected remote; locks
retained full refs. Replacement and repeat matched all 100 candidate payloads and
modes. Both installed self-tests passed at 1.4.0 with Git absent from PATH.

The complete 96-file edited 1.3 backup was restored into the actual two installed
skill directories before removal. Both installed roots were then absent; the
backup, seven-file application, later owner memory, sibling skill, settings and
all bound original inputs retained exact bytes/modes. Independent result review:
Ship. Receipt SHA-256:
`769812c7881ccb39149b76421e4ff480c237e64f8181ef0478ea1c063d4b7294`.
This is explicit replacement/repeat, not `skills update`; lock-byte stability was
not checked. Trusted Git children had normal OS permissions and were not
constrained by Node's permission grants. No native or application work ran.

Actual release JSON, annotated tag/commit, previous 1.3 release/tag and all three
asset responses were received over normal TLS. The release body exactly matched
the publication notes. All three downloaded files matched frozen candidate bytes,
sizes and API SHA-256 digests; the archive's 101 files and modes matched its
inventory. Published 1.3's body, tag and asset identities remained unchanged.
Verification receipt SHA-256:
`d8e4db1cd0f97278cfcb7925fdee69741ab63e48184b7ebd83da05632eb10f01`.
GitHub reports `immutable: false`; server-enforced immutability is not claimed.
Raw P01 and returned-response records remain local under `release-1.4-20261106`.
Pages deployment and returned-body comparison remain a separate pending check.

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
calls were not used in these checks. Public delivery and returned assets are
verified above; Pages remains separate.

See the [release notes](release-notes.md) and [installation guide](../../../INSTALLATION.md).
