# Contributing to Tibicen

Tibicen [1.5.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.1) is published.
The repository is [warbr1ng3r/tibicen](https://github.com/warbr1ng3r/tibicen).
Release CI, six platform cells and public delivery are recorded in the
[release follow-up](docs/evals/results/2026-11-07-release-1.5.1/README.md).
The maintainer/private security route is in [SECURITY](SECURITY.md); reporting scope
is in the [code of conduct](CODE_OF_CONDUCT.md). Pages has separate deployment
and returned-byte evidence in [MAINTENANCE](docs/MAINTENANCE.md).
Read [release details](docs/RELEASING.md) before preparing another release.

## Documentation language

Write the canonical project documentation in English. Keep a Russian translation beside each guide as `NAME_ru.md` and update both versions together. Links and instruction pointers target the English canonical files in both languages. This convention covers project guides; installed skill instructions and versioned runtime references have a separate release scope.

## Set up and check a change

Use Node 24.15.0 and the pinned pnpm 11.21.0 from `package.json`:

```sh
pnpm install --frozen-lockfile
pnpm test:core
pnpm test
pnpm build
```

Run focused checks while editing, then the full gate before integration.
`pnpm test` includes lint, formatting, types, site build, strict OpenSpec
validation and offline Node tests. Browser checks run separately with
`pnpm test:site`; use them for site behavior changes. Tests do not need model
credentials. Live agent evaluations require their own approved protocol and
budget; an offline pass is not live acceptance.

Release acceptance requires candidate-bound technical observations and independent
engineering review, recorded in the [engineering assessment](docs/evals/ENGINEERING_ACCEPTANCE.md)
and [readiness ledger](docs/evals/V1_READINESS.md). Full MVP functionality,
strict invariants, functional quality, positive skill/process loading and use,
declared coverage, exact-candidate delivery/update/recovery and maintenance
readiness remain required. Human usefulness observations and human rubric
calibration are separate voluntary postpublication research; measured benefit is
unknown. Studies claiming human-calibrated results retain their own protocol,
and historical outcomes are not regraded through engineering review.

## Keep the change small

Read [product scope](docs/PRODUCT_VISION.md) and the affected code first. Include
a regression test for a bug or risky behavior. Keep application files, user
decisions and approval boundaries intact. Report unsupported checks honestly.

For substantial behavior changes, keep requirements, scenarios and tasks in an
OpenSpec change under `openspec/changes/`. Small copy and CSS edits can proceed
directly. Keep milestone order in [the roadmap](docs/DEVELOPMENT_PLAN.md), with
detailed tasks in the change. Development OpenSpec tools and generated skills
must stay outside the distributed Tibicen skills.

For project-memory changes, follow the [memory contract and user guide](docs/PROJECT_MEMORY.md):
keep the one approved store, preserve unrelated notes, and distinguish structural
checks from observed use in fresh sessions. The feature has been available since 1.1.0; the older 1.0.0 distribution
does not include it.

Record completed user-visible work under `Unreleased` in [CHANGELOG](CHANGELOG.md).
After 1.0, compatible fixes use patch, compatible features minor, and incompatible
supported contracts major. Candidate preparation owns the root package version;
do not edit generated skill metadata by hand. Follow the [release procedure](docs/RELEASING.md)
for immutable artifacts, checks and separate publication authorization.

A rule or adapter proposal should name the user problem, dated primary source,
exact version, affected agents and paths, expected side effects, and tests for
init/adopt and preservation. A component name alone does not establish support.
Preserve upstream licenses and record the origin of copied material.

## Submit and review

Use the issue and pull request templates. Describe the user-visible result,
validation actually run, and remaining limits. Share minimal, anonymized examples;
keep tokens, private source, user paths and full agent transcripts out of issues.
For vulnerabilities, follow [SECURITY.md](SECURITY.md).

Use a Conventional Commit title, for example `fix(core): preserve local rules`
or `feat(adopt): explain a manual step`. External PRs may use any intermediate
commit messages if their final squash title follows this convention. Agents
create commits only when the user explicitly requests them.

Follow the [code of conduct](CODE_OF_CONDUCT.md). Use repository issues and pull
requests for ordinary contributions; use [SECURITY](SECURITY.md) for private
vulnerability reports. GitHub platform-rule violations use the private GitHub Support route described in the CoC; the project has no general private conduct inbox or appointed alternate. Do not post sensitive details publicly.
