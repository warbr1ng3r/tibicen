# Preparing a release

This procedure covers publishing the Tibicen skills. The static landing page
can be deployed separately, with copy reflecting the current availability of
the skills. Security contacts, pilot results and full skill acceptance are not
technical prerequisites for GitHub Pages hosting.

Releases are manual. A normal commit, merge or successful CI run creates no tag
or release. The source version is `package.json`; product versions and persisted
schema versions are separate. The builder copies the product version into both
skills. Change a schema only for an actual schema change.

## Version and changelog policy

After 1.0, use [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html): compatible
fixes increment patch, compatible functionality increments minor, and incompatible
supported interfaces increment major. Describe compatibility and migration steps,
including opt-in persisted formats an older runtime cannot read. Examples from
the published 1.0.0:

| Change | Next version | Example title |
| --- | --- | --- |
| Compatible bug fix | 1.0.1 | `fix(report): retain the incomplete reason` |
| Compatible new capability | 1.1.0 | `feat(memory): configure project memory` |
| Incompatible supported contract | 2.0.0 | `feat(core)!: replace a supported proposal format` |
| First published prerelease for 1.1.0 | 1.1.0-rc.1 | `chore(release): prepare 1.1.0-rc.1` |
| Correction to that published prerelease | 1.1.0-rc.2 | `fix(core): preserve a local block` |

Use Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `build`,
`ci`, `chore`); scope is optional. Mark incompatibility with `!` or a
`BREAKING CHANGE:` footer. Commit type alone does not publish or bump a version.
Keep completed user-visible changes under `Unreleased` in
[CHANGELOG.md](../CHANGELOG.md), using the relevant Added, Changed, Deprecated,
Removed, Fixed or Security categories from
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Plans and unchecked tasks
are not completed features. Change the root package version during candidate
preparation, then generate both skills from it. Move the completed entries under
the version and actual publication date when releasing; a prepared draft stays
clearly unpublished until then.

Use `-rc.N` only for an actual prerelease. An internal candidate may instead bind
the intended stable version to an immutable snapshot, build hash and attempt
identifier. Every correction after publication gets a new version. Published
tags, release assets and checksums retain their original bytes.

## Candidate procedure

1. Follow the current change and release tasks linked from the
   [development plan](DEVELOPMENT_PLAN.md). Confirm completed scope, compatibility,
   intended version and source identity. Update `package.json` for the candidate;
   keep internal schema changes separately justified. A working tree can be
   reviewed, but freeze its exact inventory/hash before candidate observations.
2. With the pinned Node/pnpm, run `pnpm install --frozen-lockfile`, `pnpm test`
   and `pnpm build`. Run separate browser checks for site changes. Preserve logs
   and the frozen source identity; tests do not replace candidate acceptance.
3. Copy the built tree and `dist/SHA256SUMS` into a new candidate directory.
   Check both generated skill versions/resources, the archive inventory and every
   checksum. Run both CLI `self-test` commands outside the checkout with Git
   absent from PATH. Retain the exact bytes; regenerating them creates a new
   candidate unless their identity is proved unchanged.
4. Obtain independent engineering review and the change's candidate-bound
   behavioral observations. Preserve failures and assistance. For project memory,
   separate file/pointer checks from actual fresh-session reading, use and updates;
   see [project memory](PROJECT_MEMORY.md). Changes to distributed bytes require
   refreshed affected checks and observations.
5. Check local exact-candidate installation, update between frozen distributions,
   recovery, removal and preservation of user data. Include memory added after
   setup when applicable. A local path or archive does not prove public delivery.
6. Link the candidate to applicable L1/PREF/SKILL/PROC evidence, source versions,
   the [independent engineering assessment](evals/ENGINEERING_ACCEPTANCE.md)
   and support limits. Under the 2026-11-03 policy, human calibration and the
   initial usefulness pilot have a separate voluntary postpublication schedule;
   their absence is disclosed. OpenSpec scenarios apply to requests selecting
   that component. Missing mandatory loading, application or other technical
   evidence remains an open gap; review cannot replace an absent observation.
7. Prepare a local release draft containing version, frozen source/distribution
   identities, intended `v<version>` tag, installation route, checksums, changelog,
   release notes, compatibility/migration, update/recovery/removal instructions and
   supported/unverified limits. Identify the public checks still pending. Obtain
   explicit owner authorization for commit, push and publication on that concrete
   packet; feature-plan approval does not authorize release actions.
8. After authorization, bind the public source commit and distribution SHA to the
   candidate. Pass normal public CI and the existing six macOS/Ubuntu/Windows ×
   Node 22.20/24.15 cells. Test installation from the actual public distribution
   repository at its full SHA with the pinned installer, including applicable
   update/removal and preservation checks. Record exact results and limits.
9. After successful gates, publish the new immutable SemVer tag, release assets
   and matching notes. Verify returned asset bytes and checksums. Update Pages
   metadata/checksum records only to describe the released bytes and separately
   verify that deployment. Report actual public URLs and remaining limitations.

Record corrections in a new candidate. Preserve failed attempts and old sums.
Published tags and bytes stay immutable; a published defect requires a new
version. There is no background update of installed Tibicen or project setup.

## Published 1.4.0 — 2026-11-06 (Moscow)

[1.4.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.4.0) was published at `2026-11-06T00:10:57Z`.
Source `dfc85d75698094d614ac66511c0b0c13fa54c0bf` binds distribution `7b3b08f58276034b1609e44ef393e5f7c0e01a1b` and candidate-01.
Task-aware init/adopt and format-independent local MCP diagnosis are compatible
additions; persisted schemas and existing write/approval boundaries are unchanged.
The 891-pass local gate, [public CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42133771601) and
[six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/42134245813) passed. Public universal installation/update/
backup restoration/removal and all three returned assets matched the candidate.
Fresh I1/A1 observations are read-only, source-assisted recommendations, not native
sessions or applied setup. Native activation/connection, model behavior and human
benefit remain unverified.

[Metadata CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42136249664) passed on `e1487697d264eb9e14a03466550342f1ddd105dc`;
[Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/42136931904) deployed the same source (deployment `7588966676`,
`2026-11-06T00:28:15Z`). The [separate audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42137552667) matched all 18 HTTP 200 bodies to
official artifact `13465038486`; official artifact ZIP SHA-256 (78,852 bytes): `fc5f717f1278308aa7c08efa55a7b6990fc7d4c78872ad429b14b1623b36f6e4`.
The returned index SHA-256 is `fb835f18db1717ee3222fa7c6f6972b64e635bfba1040ed35c91e8113c5278e5`; five older records and warnings remain
unchanged. Exact deployment/byte scope is in [MAINTENANCE](MAINTENANCE.md);
identities, assets and limits are in the
[release report](evals/results/2026-11-06-release-1.4/README.md).

## Published 1.3.0 — 2026-11-05 (Moscow)

[1.3.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.3.0) was published at `2026-11-05T19:34:40Z`.
Source `797b96e5306da77e8acc54a28c8a6a8e85b3cfd7` binds distribution `b61a19583dc91ee9e3e795250d733d2cc99e6569` and accepted candidate-02.
Universal installation, explicit skill reading and uncatalogued hints are included;
a catalog entry does not establish native loading or compatibility with every model.

The 843/843 local gate, 42 affected browser scenarios,
[CI 42092841285](https://github.com/warbr1ng3r/tibicen/actions/runs/42092841285) and all six
macOS 15 / Ubuntu 24.04 / Windows 2022 × Node 22.20.0 / 24.15.0 cells of
[workflow 42094073753](https://github.com/warbr1ng3r/tibicen/actions/runs/42094073753) passed.
Public full-SHA universal delivery passed: 4 installer calls, 2 self-tests, 94 payloads;
1.2→1.3 replacement, repeat, complete edited-backup restoration into actual installed
paths and removal preserved the project, later memory, sibling skill and settings.
`skills update` and lock-byte stability were not checked. Trusted Git children had
ordinary OS permissions; child isolation is not claimed.

| Published asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [tibicen-1.3.0.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/tibicen-1.3.0.tar.gz) | 237193 | `86862c77462896229fac1dffd1877953f591a5362e4724b95c41a7ad791ba194` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/distribution-SHA256SUMS) | 9795 | `bf589996433f8eb46b83f87cd229fc6ead81af46f0ce50959e4c7c05525bee4d` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/SHA256SUMS) | 177 | `561fc7e0192909dadbc919e02a2fdcec105cabb448b96d7c701c36cccd7f9c1f` |

All three returned release assets matched the frozen candidate.
[Pages 42096956053](https://github.com/warbr1ng3r/tibicen/actions/runs/42096956053) deployed metadata source `606f5b25f83831c3d9c5e29709d85c32ae0cf7a9`;
a [separate auditor](https://github.com/warbr1ng3r/tibicen/actions/runs/42097697236) matched all 18 actual HTTP 200 bodies to the official artifact.
The four older index objects and warnings were preserved. Exact bindings are in
[MAINTENANCE](MAINTENANCE.md) and the [release report](evals/results/2026-11-05-release-1.3/README.md).
All earlier releases, assets and observations below retain their original facts.

## Published 1.2.0 — 5 November 2026 UTC

[1.2.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.2.0) was published at
`2026-11-05T03:46:37Z` (release ID `434759670`); publication run: [41963669550](https://github.com/warbr1ng3r/tibicen/actions/runs/41963669550).
Frozen public source `fb80e78198e7fe12353fbe8f9319f84ac943f792` binds distribution
`0656f12e00ea83d84229180d331f3178bf253407`. The 804/804 offline gate passed without
skips, as did [frozen-source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41957289753).
The later metadata source `802c01ece6d7e3fd07f080263e2e19c7537e3a46` passed
[normal CI 41965074048](https://github.com/warbr1ng3r/tibicen/actions/runs/41965074048) before Pages deployment.
The [six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/41952044767)
are reused through exact unchanged platform/build/runtime inputs, rather than
represented as a new run. Public full-SHA installation/update/backup restoration/
removal passed for Codex, Claude Code and Cursor, matching all 92 payload files
and preserving projects, later memory notes, sibling skills and external settings.
The initial strict-lock checker failure and corrected separate pass are retained.

Version-aware practice context, clearer adopt diagnosis and nested memory-pointer
recognition are compatible additions/fixes. No persisted-format migration is
introduced by 1.2. Supplied versions are context, not proof of compatibility.
D01/D02 passed independent review only for source-supplied generic reasoning.
Combined D03/D04 observations and final engineering verdict: actual subcriteria of stopped D03 and the separate D04 report accepted / Ship for the frozen candidate and exact publication packet.
D03 stopped on a root collector error after five CLI calls; its report command never ran.
The separate D04 read-only report was independently accepted, without repeating apply.
The original I01 failure, withheld A01 and unexecuted M03 keep their original status.
New native/implicit loading, broader harness support and measured benefit are not claimed.

| Release asset | Bytes | SHA256 |
| --- | --- | --- |
| [tibicen-1.2.0.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.2.0/tibicen-1.2.0.tar.gz) | 225604 | `fa33bdfbad280cba71b199671e280d71fcda1fc0b568b66130b0a1036aba47d9` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.2.0/distribution-SHA256SUMS) | 9582 | `9c4853a038fec91a37ad430e50184ef3364e9ebb1f7569ff2010ba7a39cb70c5` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.2.0/SHA256SUMS) | 177 | `b81625fc6b24efd63a5b655e0f7d58a3fc76e2168e3b43c176daac8d2e527772` |

Returned-byte verification: passed: all three downloaded files match the exact release notes, tag and frozen candidate; 93 archive files/modes and 92 payload checksums match.
Earlier tag/body/asset preservation: passed: the 1.1 tag/body and all three asset metadata/digests remain unchanged.
GitHub reports `immutable: false`; server-enforced immutability is not claimed.
The archive contains 93 regular files; the manifest covers 92 payload files.
Install using the full distribution SHA in [README](../README.md); back up local
skill edits before explicit replacement. Project updates remain separately approved.
See the [release report](evals/results/2026-11-05-release-1.2/README.md) for exact
bindings, assistance and failures. Pages deployment passed and all 18 returned bodies matched the official artifact, as recorded in
[MAINTENANCE](MAINTENANCE.md); project memory's original 1.1 observations remain historical.

## Published 1.1.0 — 4 November 2026 UTC

[1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0) was published at
`2026-11-04T21:02:42Z` (5 November in Moscow). Source
`3166be50a1a3979e600ea08b65694c9255dcb89a` binds the accepted distribution
`7bbd953a020ac4ac4c7dfb99efa59f6e4b195026`.
[Normal CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41911531361) and the
[existing six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/41911587517)
passed. Public full-SHA installation/update/backup restoration/removal passed for
Codex, Claude Code and Cursor, preserving registered projects and later memory
notes. All three downloaded release files and 90 payloads matched the frozen
candidate. The 1.0 tag/body/assets remain unchanged. These are observed bindings;
GitHub's release `immutable` flag is false, so server enforcement is not claimed.

Memory is opt-in, with schema compatibility and assisted fresh-session limits in
[project memory](PROJECT_MEMORY.md) and the
[candidate/report follow-up](evals/results/2026-11-04-project-memory/README.md).
Pages is a separate deployment recorded in [MAINTENANCE](MAINTENANCE.md).

## Published 1.0.0 — 4 November 2026

**Published 4 November 2026:** [1.0.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.0.0) binds source `4c1be3ecc4126f1531030e51c4a8a56e9a292190` to distribution `e8532bba0582564c93e50de1f55174daaa9bbd34`. [Normal frozen-install CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41779006751) passed; the [platform workflow](https://github.com/warbr1ng3r/tibicen/actions/runs/41779751678) passed all six macOS/Ubuntu/Windows × Node 22.20/24.15 cells. Public full-SHA installations for Codex, Claude Code and Cursor each matched all 86 payload files; 16 version/resource checks, pinned update, backup restoration and removal passed. All three release assets were received with matching hashes; the archive contains 87 regular files and all 86 payload hashes match. These are mechanical delivery checks, not native discovery/loading, application execution, whole-case grades or measured human benefit. Windows command launch remains unsupported; read-only operations are available. Pages deployment and returned-byte verification are complete within the scope recorded in [MAINTENANCE](MAINTENANCE.md).

## Recorded release checks and remaining limits

The owner confirmed [@warbr1ng3r](https://github.com/warbr1ng3r) as core/adapter maintainer and private security-report recipient on 31 October 2026. The private vulnerability reporting route is enabled; see [SECURITY](../SECURITY.md).

- Read-only accessibility of the scoped public project/private GitHub Support routes in the [CoC](../CODE_OF_CONDUCT.md) is recorded in [SECURITY](../SECURITY.md): public routes were reachable, private anonymous routes required sign-in, and the owner could access the form without submitting a report. The confirmed private vulnerability recipient is preserved; no general private conduct inbox or alternate is appointed. Notification delivery remains untested.
- Publication and returned-byte verification of the separate committed Pages advisory/checksum index passed, as recorded in [MAINTENANCE](MAINTENANCE.md). Its alpha and 1.0 records are preserved; GitHub administration is shared.
- The candidate-bound [engineering assessment](evals/ENGINEERING_ACCEPTANCE.md) records technical coverage and acceptance within the declared component, agent and platform scopes, including explicitly permitted unsupported/unverified outcomes and reasons. Native/application evidence and human usefulness retain their reported limits.

The [maintenance procedure](MAINTENANCE.md) and [latest source review](evals/results/2026-11-03-maintenance-review/README.md) cover the appointed maintainer, review cadence and documentation/CLI metadata. They do not establish notification delivery or widen the separately recorded native/application/human evidence. Actual Pages-index publication and returned bytes are separately verified in [MAINTENANCE](MAINTENANCE.md). The adopted [maintenance-channel contract](../openspec/changes/define-maintenance-reporting-and-checksum-channel/specs/maintenance-channels/spec.md) defines separate artifact/publication/origin independence; publication and byte checks under task 3.2 are complete within that recorded scope.

These maintenance/access limits remain after publication of 1.0.0. Maintenance is monthly and
after significant tool changes; changed recommendations need fresh init/adopt checks.

## Voluntary postpublication research

The initial real-work usefulness pilot and human rubric calibration are deferred,
not completed, under the adopted [evidence policy](../openspec/changes/separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md).
No owner questionnaire or participant recruitment is a prerelease dependency.
Use the [pilot protocol](PILOT.md) if volunteers become available. Report human
benefit as unmeasured until observed; public discussions and model judgments
do not fill participant records. Human-calibrated studies retain their existing
calibration/cross-check rules and old evaluated outcomes.

Retain the 50 measured sessions / 8 weeks after publication checkpoint and
30-day reuse definitions. Insufficient data requires an explicit recruit,
extend or close decision; it neither proves benefit nor resets the clock.

## Published first alpha

[0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) was published on 27 October 2026 as a limited prerelease; the [configuration page](https://warbr1ng3r.github.io/tibicen/) is live.

- Source: `e0f59a55c7ce7581e402c3e270aa162fa1e0dc52`.
- Distribution: `db03ebc988af1e38ea9f62c02027945ba40660fc`; immutable tag `v0.1.0-alpha.1`.
- Clean-source local gate: 668/668 tests and build passed. [Main CI](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480) and [Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284) succeeded.
- Public installation through both SHA and tag matched all 86 distribution files; approved session resume and removal checks passed. Observations cover macOS, Node 24 and Codex.

The public source snapshot omits local development history and private/raw records; the original repository is preserved locally. Ready-to-install skills live in the separate distribution branch. Pin skills 1.7.4 to the full GitHub tree SHA or immutable version tag and select only tibicen-init and tibicen-adopt. In this installer, owner/repo@name selects a skill rather than a Git ref. Release assets and Pages remain separate outputs.

Full technical MVP acceptance, broader component/agent/platform coverage and remaining support arrangements remain open. Human review/pilot is separate voluntary research after publication; no human benefit is claimed.
