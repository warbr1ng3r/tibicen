# Tibicen 1.8.3 — published 28 November 2026

[Русский](README_ru.md)

[1.8.3](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.8.3) was published at 2026-11-28T03:34:22Z (release `461274281`). This compatible patch clarifies memory drafting: preserve the owner's stated input/output domain, distinguish unspecified details from accepted rules, and avoid an unsupported standing requirement to ask questions. Genuine ambiguity and explicit owner instructions still apply. CLI runtime, persisted schemas, dependencies and approval boundaries are unchanged; no project migration is required.

## Exact delivery

- Public source: `bd8cdd3b80b6f43de3a934c913f099a8a758ca9d`.
- Distribution: `1ab71cc59579bedee46cff0a83acddc328915260`.
- Annotated tag object: `1cb7b85e67e2b971fb5fd421dbadc95a7805c0f7`.
- [Source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/46102648184), [six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/46102649717) and [publication](https://github.com/warbr1ng3r/tibicen/actions/runs/46103477140): passed.

The local full source gate passed **1,224 tests, zero failures, two expected local skips**. All six macOS/Ubuntu/Windows × Node 22.20/24.15 cells passed. Actual Windows command execution and restricted-helper refusal ran on both Node versions. The initial policy fixture timed out while querying PowerShell policy; the final test removes that unrelated module-autoload dependency and directly checks the controlled success/restricted refusal pair. Earlier failed CI attempts are retained. The product payload did not change during that test correction.

Independent Ponytail review accepted runtime publication. All three downloaded public assets equal the frozen candidate: 116 payload hashes and all 117 archive file bytes and modes match. Exact hashes, asset IDs and sizes are in [receipt.json](receipt.json). Published 1.8.2 and its tag and asset identities are preserved.

Local and actual public full-SHA lifecycle each passed six pinned-installer calls, six complete byte/mode comparisons and twelve installed self-tests on Node 24.15.0. Complete edited backups, unrelated tools/settings/application data and a later memory note survived update, repeat, backup restoration, recovery and removal. Fourteen standalone CLI commands passed outside the checkout with isolated HOME and empty PATH.

## Website — verified

Metadata source `5805d1c55c6ef2b7aac3c57c43cdc80f394cee1f` passed
[CI](https://github.com/warbr1ng3r/tibicen/actions/runs/46105372729),
[Cloudflare](https://github.com/warbr1ng3r/tibicen/actions/runs/46105372725) and
[legacy Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/46105686206).
All **27 returned response bodies** match the exact source-bound build: 22 primary
files, four legacy redirects and one legacy checksum index. Both indexes contain
21 versions and preserve all 20 earlier records, historical bytes and warnings.
This later documentation-only closure does not change accepted site or payload bytes.

## Working Codex installation

Both skills are installed in the maintainer's working Codex at **1.8.3**, from the
same immutable public distribution. All 116 installed file hashes and both self-tests
match the candidate. The [release checklist](../../../RELEASING.md) now includes
updating this working installation after verified publication, preserving local edits
and recording provenance. File installation and self-test do not establish native
harness loading in a fresh session.

## Limits

Lifecycle is controller-directed macOS evidence with pinned skills 1.7.4 and ordinary OS permissions. Recovery uses constructed partial directories; it does not prove a real interruption at every copy boundary. Updating or removing installed skills does not automatically change project infrastructure.

The [memory assessment](../2026-11-28-memory-guidance-assessment/README.md) supports one assisted positive observation on byte-identical guidance. It does not establish native autoload, clean context, unique memory causality, general model behavior or measured human benefit. Original [mechanical](../2026-11-27-mechanical-47-assessment/README.md), [agent](../2026-11-27-agent-eight-assessment/README.md) and [follow-up](../2026-11-28-four-agent-followup-assessment/README.md) grades remain unchanged. Windows acceptance covers the observed hosted policies and does not cover every enterprise policy. No new live model sweep or paid API evaluation occurred.
