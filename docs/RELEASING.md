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
   independent and human review, initial pilot and support limits. OpenSpec
   scenarios apply to requests selecting that component. Unverified loading or
   application remains an open gap.
6. Prepare a local release draft containing version, source SHA, installation
   route, sums, notes, update/removal instructions and limits. Obtain explicit
   approval for publication only after the draft is concrete and reviewable.

Record corrections in a new candidate. Preserve failed attempts and old sums.
Published tags and bytes stay immutable; a published defect requires a new
version. There is no background update of installed Tibicen or project setup.

## Inputs still required for the full MVP

- Responsible maintainer and private security/conduct contacts.
- Independent channel for advisories and distribution checksums.
- Voluntary pilot participants and agreed measurements; actual human/pilot results.
- Full component coverage and acceptance for additional agents and platforms.

These inputs remain open after the limited alpha. Maintenance is monthly and
after significant tool changes; changed recommendations need fresh init/adopt checks.

## Published first alpha

[0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) was published on 27 October 2026 as a limited prerelease; the [configuration page](https://warbr1ng3r.github.io/tibicen/) is live.

- Source: `e0f59a55c7ce7581e402c3e270aa162fa1e0dc52`.
- Distribution: `db03ebc988af1e38ea9f62c02027945ba40660fc`; immutable tag `v0.1.0-alpha.1`.
- Clean-source local gate: 668/668 tests and build passed. [Main CI](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480) and [Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284) succeeded.
- Public installation through both SHA and tag matched all 86 distribution files; approved session resume and removal checks passed. Observations cover macOS, Node 24 and Codex.

The public source snapshot omits local development history and private/raw records; the original repository is preserved locally. Ready-to-install skills live in the separate distribution branch. Pin skills 1.7.4 to the full GitHub tree SHA or immutable version tag and select only tibicen-init and tibicen-adopt. In this installer, owner/repo@name selects a skill rather than a Git ref. Release assets and Pages remain separate outputs.

Full MVP acceptance, broader component/agent/platform coverage, human review/pilot and support contacts remain open.
