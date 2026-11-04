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
