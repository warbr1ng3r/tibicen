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

Before 1.0, compatible fixes increment patch; new capabilities and breaking
changes increment minor. Describe breaking changes and migration steps even in
0.x. Examples from a published 0.1.0:

| Change | Next version | Example title |
| --- | --- | --- |
| Compatible bug fix | 0.1.1 | `fix(report): retain the incomplete reason` |
| New capability | 0.2.0 | `feat(adopt): add a supported adapter` |
| Breaking change | 0.2.0 | `feat(core)!: change the proposal format` |
| First candidate for 0.2.0 | 0.2.0-rc.1 | `chore(release): prepare 0.2.0-rc.1` |
| Candidate correction | 0.2.0-rc.2 | `fix(core): preserve a local block` |

Use Conventional Commits (`feat`, `fix`, `docs`, `refactor`, `test`, `build`,
`ci`, `chore`); scope is optional. Mark incompatibility with `!` or a
`BREAKING CHANGE:` footer. Commit type alone does not publish or bump a version.
Keep user-visible changes in [CHANGELOG.md](../CHANGELOG.md), with unreleased
work separate from published versions. Move entries under a version and actual
publication date only when that version is released.

## Candidate procedure

1. Review the release tasks and evidence in
   [prepare-first-public-release](../openspec/changes/prepare-first-public-release/tasks.md).
   Confirm the source SHA, intended version and approved scope. A dirty tree is
   reviewable work, not an immutable release source.
2. With the pinned Node/pnpm, run `pnpm install --frozen-lockfile`, `pnpm test`
   and `pnpm build`. Run separate browser checks for site changes. Preserve logs
   and the source SHA; tests do not replace candidate-specific acceptance.
3. Copy the built tree and `dist/SHA256SUMS` into a new candidate directory.
   Check all sums, both installed skill versions/resources and both CLI
   `self-test` commands outside the checkout with Git absent from PATH.
4. Test the actual distribution repository at its full SHA with the pinned
   installer. Check update between frozen distributions, removal, user data and
   supported platform limits. Earlier versions need not already be public.
   A local path or archive does not prove the public Git route.
5. Link the candidate to current L1/PREF/SKILL/PROC evidence, source versions,
   the [independent engineering assessment](evals/ENGINEERING_ACCEPTANCE.md)
   and support limits. Under the 2026-11-03 policy, human calibration and the
   initial usefulness pilot have a separate voluntary postpublication schedule;
   their absence is disclosed. OpenSpec scenarios apply to requests selecting
   that component. Missing mandatory loading, application or other technical
   evidence remains an open gap; review cannot replace an absent observation.
6. Prepare a local release draft containing version, source SHA, installation
   route, sums, notes, update/removal instructions and limits. Obtain explicit
   approval for publication only after the draft is concrete and reviewable.

Record corrections in a new candidate. Preserve failed attempts and old sums.
Published tags and bytes stay immutable; a published defect requires a new
version. There is no background update of installed Tibicen or project setup.

## Published 1.0.0 — 4 November 2026

**Published 4 November 2026:** [1.0.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.0.0) binds source `4c1be3ecc4126f1531030e51c4a8a56e9a292190` to distribution `e8532bba0582564c93e50de1f55174daaa9bbd34`. [Normal frozen-install CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41779006751) passed; the [platform workflow](https://github.com/warbr1ng3r/tibicen/actions/runs/41779751678) passed all six macOS/Ubuntu/Windows × Node 22.20/24.15 cells. Public full-SHA installations for Codex, Claude Code and Cursor each matched all 86 payload files; 16 version/resource checks, pinned update, backup restoration and removal passed. All three release assets were received with matching hashes; the archive contains 87 regular files and all 86 payload hashes match. These are mechanical delivery checks, not native discovery/loading, application execution, whole-case grades or measured human benefit. Windows command launch remains unsupported; read-only operations are available. Pages deployment and returned-byte verification for this metadata remain pending.

## Inputs still required for the full MVP

The owner confirmed [@warbr1ng3r](https://github.com/warbr1ng3r) as core/adapter maintainer and private security-report recipient on 31 October 2026. The private vulnerability reporting route is enabled; see [SECURITY](../SECURITY.md).

- Verify the scoped public project/private GitHub Support reporting routes in the [CoC](../CODE_OF_CONDUCT.md), preserving the confirmed private vulnerability recipient. The former general private conduct-inbox promise is replaced; no inbox or alternate is appointed. Form/notification delivery is not newly verified.
- Publish and verify the separate committed Pages advisory/checksum index defined in [MAINTENANCE](MAINTENANCE.md). Its local alpha and 1.0 records do not establish a working channel; GitHub administration is shared.
- Candidate-bound technical coverage and acceptance for the declared components, agents and platforms; retain explicitly permitted unsupported outcomes with reasons.

The [maintenance procedure](MAINTENANCE.md) and [latest source review](evals/results/2026-11-03-maintenance-review/README.md) cover the appointed maintainer, review cadence and documentation/CLI metadata. They do not establish notification delivery or actual Pages-index publication, or substitute for remaining behavior evidence. The adopted [maintenance-channel contract](../openspec/changes/define-maintenance-reporting-and-checksum-channel/specs/maintenance-channels/spec.md) defines separate artifact/publication/origin independence; publication and byte checks remain pending task 3.2.

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
