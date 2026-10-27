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

- Published distribution tree and immutable installation URL in the chosen
  [warbr1ng3r/tibicen](https://github.com/warbr1ng3r/tibicen) repository.
- Site address, responsible maintainer and private security/conduct contacts.
- Independent channel for advisories and distribution checksums.
- Voluntary pilot participants and agreed measurements; actual pilot results.
- First remote CI run and completed acceptance for the claimed platform scope.

These inputs are pending. Do not substitute example addresses or claim that a
local candidate is already a public release. Maintenance is monthly and after
significant tool changes; changed recommendations need fresh init/adopt checks.

## Approved first alpha

The owner approved 0.1.0-alpha.1 as a limited prerelease on 27 October 2026, including commit/push, Git delivery checks, prerelease and Pages. The full MVP checklist remains open. This alpha requires source/distribution SHA, checked bytes, real Git installation and a distribution transition with preserved user state. Release notes must state actual platform/agent observations and pending scenarios, human review/pilot and support contacts.

Publish a checked public source snapshot without local development history/private records; preserve the original repository locally. Keep ready-to-install skills in a separate distribution branch. Pin the installer to an exact GitHub tree SHA (and later the immutable version tag), selecting only tibicen-init and tibicen-adopt. In skills 1.7.4, owner/repo@name selects a skill rather than a Git ref. GitHub release assets and Pages are separate outputs.
