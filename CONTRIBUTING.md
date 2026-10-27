# Contributing to Tibicen

Tibicen has published its first limited [alpha prerelease](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1). The repository is [warbr1ng3r/tibicen](https://github.com/warbr1ng3r/tibicen). Full MVP acceptance, a responsible maintainer and private security/conduct contacts remain open. See [release details](docs/RELEASING.md) before preparing another release or inviting a pilot.

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

## Keep the change small

Read [product scope](docs/PRODUCT_VISION.md) and the affected code first. Include
a regression test for a bug or risky behavior. Keep application files, user
decisions and approval boundaries intact. Report unsupported checks honestly.

For substantial behavior changes, keep requirements, scenarios and tasks in an
OpenSpec change under `openspec/changes/`. Small copy and CSS edits can proceed
directly. Keep milestone order in [the roadmap](docs/DEVELOPMENT_PLAN.md), with
detailed tasks in the change. Development OpenSpec tools and generated skills
must stay outside the distributed Tibicen skills.

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

Follow the [code of conduct](CODE_OF_CONDUCT.md). Public contribution and conduct
reporting routes will be added when the owner and responsible maintainer are
confirmed. Preparing these files does not mean those routes are operational.
