# Tibicen

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/brand/readme-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/brand/readme-light.svg">
  <img alt="Tibicen logo" src="docs/assets/brand/readme-light.svg" width="320" height="80">
</picture>

Tibicen helps you set up agent infrastructure for a new project or improve an existing setup. It works inside your usual agent: examines the project, recommends one suitable configuration, shows the changes, applies what you approve, and reports verification results separately.

Two entry points:

- `tibicen-init` — “Set up agent infrastructure.” For an empty directory or an existing application without an agent setup.
- `tibicen-adopt` — “Review and update agent infrastructure.” For fixing, extending, and updating existing instructions and integrations.

[Version 0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) was published on 27 October 2026 as a limited prerelease. The [configuration page](https://warbr1ng3r.github.io/tibicen/) is live. Observations cover macOS/Node 24/Codex; full MVP acceptance, broader agent coverage, human/pilot evidence and support contacts remain open. See [CHANGELOG](CHANGELOG.md), [contributing](CONTRIBUTING.md) and [release details](docs/RELEASING.md).

Application source code, existing package manifests, CI, and data are preserved during setup. Nothing is written or installed, and no project code runs, before approval. Tibicen does not create commits, including in temporary repositories or during checks. Afterward, the project retains instructions and a `.tibicen/manifest.yml` record; no persistent Tibicen process remains.

## Install the limited alpha

The [published alpha](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) uses a versioned distribution tag, separate
from the development source tree; release assets include checksums. Installation
from both the full distribution SHA and tag matched all 86 files, and approved
session resume and removal checks passed. These observations cover macOS with
Node 24 and Codex; other agent options remain experimental.

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent codex --skill tibicen-init tibicen-adopt --copy
```

Use the full distribution SHA from the release notes when an exact commit is
required. Install from the versioned distribution: the default source branch contains
unbuilt skill sources without their bundled resources. Node and Git are required for installation; repository dependencies and
a site build are not.

## Build and install from source

Building and using the skills requires Node ≥22.20 and a configured agent. Installing the skills does not require repository dependencies or a site build. The installer requires Git; once installed, Tibicen can work without Git using a temporary project copy.

Command execution controls the process group on POSIX systems and stops descendants on timeout or cancellation, with up to one extra second for forced termination. Windows execution currently returns `process-tree-unavailable` before launching a command; read-only operations remain available. macOS is locally tested; Linux still needs platform acceptance.

First, build the skills from the Tibicen source directory:

```sh
node scripts/build.ts
```

Then run **one** command with your preferred package manager:

```sh
# npm
npx skills@1.7.4 add ./dist -g --agent codex --copy

# pnpm
pnpm dlx skills@1.7.4 add ./dist -g --agent codex --copy

# Yarn 2+
yarn dlx skills@1.7.4 add ./dist -g --agent codex --copy
```

Yarn Classic 1.x has no `dlx`; use `npx`. This only selects how to run the installer: the target project's package manager and dependencies remain unchanged.

Replace `codex` with `claude-code` or `cursor` as needed. These commands were verified by installing both skills through npm, pnpm 11.21.0, and Yarn 4.18.1 into separate temporary user scopes (Node 24.15.0, macOS). After installation, their resources are accessible outside the source repository. `--copy` creates an independent copy; `-g` installs skills in the developer's user scope.

In your agent, explicitly invoke the skill by name and describe your project. For example: “Use tibicen-init. Set up agent infrastructure for this project with minimal process.” You can request “all defaults” to skip the interview questions; the final plan still requires approval.

`dist/` is the distribution tree, containing two standalone skills and `SHA256SUMS`. Each skill includes its own copies of shared resources, built automatically from a single source. The published distribution branch and version tags contain this built tree. Installing from the root of the unbuilt source repository is unsupported.

### Update or remove an installation

Replacing installed Tibicen and updating a project's infrastructure are separate
actions. Replacing Tibicen does not automatically run adopt in your projects.

Before reinstalling, copy any locally edited skill directories to a safe location
outside the installation. With `skills@1.7.4`, repeating `add --copy` replaces the
whole selected skill directory, including extra files. It does not merge local
changes. Compare the backup with the new version before reapplying useful edits.
Keep project rules and presets outside the installed Tibicen directories.

For a local-path installation, `skills update` cannot check the source
automatically. After checking a newly built distribution and saving local edits,
explicitly repeat the chosen pinned `add` command above. A Git installation pinned
to a SHA or version tag also stays on that ref: `skills update` does not select
the next Tibicen release. Back up local edits, then repeat `add` with the next
release's explicit URL. Resuming a project session is a separate, approved
Tibicen operation. Candidate-specific acceptance is recorded in release notes.

To remove both skills from the tested Codex user scope:

```sh
pnpm dlx skills@1.7.4 remove tibicen-init tibicen-adopt -g --agent codex -y
```

This removes their installed directories and any files inside them. In the local
macOS check it preserved project files, `.tibicen` manifests/state, presets and
agent configuration outside those directories. Empty parent directories and the
installer's lock file may remain. Removal does not undo approved project setup;
review project changes separately. See the [delivery evidence](docs/evals/results/2026-10-27-candidate-delivery/README.md)
for the exact tested scope.

## Working with a project

1. The agent examines the actual files, commands, constraints, and available sources.
2. It proposes a sufficient configuration. An additional skill or MCP integration is included when it has a clear purpose; a setup without unnecessary components is a valid outcome.
3. It shows exact paths, changes, sources/SHAs, commands, environment variable names, code trust decisions, costs, and manual steps. Proposal data stays in memory/stdin until approval.
4. After approval, it applies only the displayed plan. If another process changes an affected file, writing stops.
5. It hands over the result, limitations, and a useful first prompt. The manifest preserves provenance, changes, and the original session history.

`complete` means integration is finished with no known mandatory defect; project and behavioral checks have independent results. `manual-action-required` means mandatory external actions remain. An internal failure or an unresolved mandatory defect produces `incomplete`; state and original versions of affected files are preserved so work can resume with new approval.

## Capabilities and verification limits

- Scanning, modifying approved agent files, adding/replacing/removing them, rechecking, and resuming sessions.
- Live discovery through the GitHub API: canonical provenance, full SHA, license, age, archive status, install hooks, blocklist, and heuristic injection checks. Contributor count is not used.
- Current official guidance for selected agents: sources, dates, structured excerpts, and gaps. The agent assesses applicability; a recent fetch date alone does not prove a recommendation's quality.
- MCP over stdio: targeted edits to Claude/Cursor JSON while preserving other entries; a manual TOML block for Codex. Secret values are never requested; only environment variable names are recorded. Variables available to Tibicen do not confirm the environment of another agent that is already running.
- Structural infrastructure checks across stacks. Build/test/lint use the web profile and run only approved commands on controlled copies with a reproducible environment. If the environment cannot be confirmed, the result is `unverified`.
- A controlled representative task, quiz, and native compatibility checks have a conditional execution path for the verified Claude Code version. Other agents, or missing authorization, trust, controlled startup, or observable results, produce `unverified` with a reason. Exit codes and lists of discovered skills do not prove instruction loading.
- A baseline restored from another process is never replaced with a newly invented starting point: `baseline-unavailable`. Known regressions and attempt history are preserved.
- Saving a personal preset or report file requires a separate explicit request. The builder in `landing/` downloads presets in the browser without a server or submission of answers.

Tibicen writes its own YAML files as YAML-compatible JSON. Only this strictly validated subset is supported: arbitrary YAML, tags, and executable expressions are not parsed. Ambiguous third-party configurations require a manual step.

Verified versions and execution conditions: [agent matrix](references/agent-matrix.md). Full validation with real agents and a usefulness pilot are still required before the full MVP; local checks do not establish time savings on real projects.

## Development commands

For development across the repository, use Node 24 LTS and pnpm 11.21.0 (pinned in `packageManager`). The workspace is defined in `pnpm-workspace.yaml`, with dependencies in a single `pnpm-lock.yaml`. Enable pnpm through Corepack (`corepack enable pnpm`) or install the specified pnpm version yourself. The npm/Yarn examples above apply only to the skill installer.

```sh
pnpm install --frozen-lockfile
pnpm lint
pnpm format:check
pnpm typecheck
pnpm test
pnpm build
pnpm eval:diagnostic --help
pnpm eval:external --help
node scripts/tibicen.ts self-test
node scripts/tibicen.ts help
```

Use focused checks while editing; run `pnpm test` before integrating changes.

| Command | Scope |
|---|---|
| `pnpm typecheck:core` | Root TypeScript code and tests, including evals, without Astro checks |
| `pnpm test:core` | Product lifecycle, adapters, verification and standalone skills; no site build |
| `pnpm test:evals` | Offline harness and fake drivers; no site build or model calls |
| `pnpm test:site:unit` | Site build and Node tests for page structure and client logic |
| `pnpm test:site` | Site build and Chromium, Firefox and WebKit browser tests |

The full `pnpm test` gate still runs lint, formatting, all type checks, the site build, strict OpenSpec validation and every Node test. Browser tests remain the separate `pnpm test:site` command.

[Offline CI](docs/CI.md) runs the full gate, build, distribution checksums and unpacked self-tests without model credentials. The published source passed [GitHub Actions on Ubuntu](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480); the local clean-source gate passed all 668 tests.

Use `pnpm eval:diagnostic` for the documented [diagnostic entry](docs/evals/EXTERNAL_RUNS.md): dry-run by default, or offline calibration with a fake driver. Native execution requires an explicit supported request; unsupported routes produce a saved blocked result.

ESLint checks TypeScript, JavaScript and Astro with the recommended rules. Prettier formats code and configuration with two-space indentation and single quotes. Use `pnpm lint:fix` for automatic lint fixes and `pnpm format` to format files; `pnpm test` includes both style checks. Frozen fixtures, upstream source copies, recorded evidence and documentation are excluded from formatting.

The build uses an ordinary `dist/` directory. Custom output is allowed under `dist/` or outside the repository, without overlap with the source tree. The output directory, both skill targets and `SHA256SUMS` are checked for unsafe paths and symlinks before anything is cleared.

Source code and tests use TypeScript with strict type checking. The CLI runs directly on Node ≥22.20. Landing page development and builds require Node ≥22.23.4; TypeScript, Astro, and type checking tools remain development and site dependencies. There are no runtime dependencies. `scripts/tibicen.ts` outputs structured JSON. Discovery and proposal generation do not save files; the completed proposal and its digest are passed through stdin. `--approve` binds actual human approval to a specific plan; it does not authorize a script or agent to approve its own input.

Main commands: `scan`, `discover`, `practices`, `proposal`, `apply`, `resume`, `status`, `verify`, `report`, `preset-load`, `preset-save`. Used on its own, `verify` performs structural checks only. Executable checks are specified in the approved proposal. Input format and example: [proposal-format.md](references/proposal-format.md).

The landing page is a separate Astro workspace in `landing/`, with adapted AstroWind sections, Tailwind CSS, client-side TypeScript, and local assets. Section provenance and the MIT notice are documented in [landing/README.md](landing/README.md). Install dependencies for all parts with a single `pnpm install --frozen-lockfile` from the root. Start the development server with `pnpm dev:site` (http://127.0.0.1:8371/). Build with `pnpm build:site` and preview with `pnpm preview:site`. The static output in the ignored `landing/dist/` directory can be deployed to ordinary static hosting; the page requires neither an application server nor external assets. The landing page and its dependencies are excluded from installed skills.

## Documentation and maintenance

English is canonical for project documentation. Russian translations live beside it as `*_ru.md`; all references target the English documents. Update a translation alongside its guide.

- [Product vision](docs/PRODUCT_VISION.md).
- [Development plan and work allocation](docs/DEVELOPMENT_PLAN.md).
- [Initial voluntary pilot protocol (draft)](docs/PILOT.md).
- [Security boundaries and vulnerability reporting](SECURITY.md).

Before the full MVP, define an independent channel for advisories and checksums, the person responsible for reviewing rules, support contacts, and the voluntary pilot parameters. The core and adapters are reviewed at least monthly and when supported tools change significantly. Updating an installed Tibicen is an explicit user action; there is no background self-update.

License: MIT.

## OpenSpec for development

OpenSpec 1.14.3 is pinned in devDependencies. `pnpm openspec list` lists changes; `pnpm spec:check` validates requirements and completion of archived tasks and is included in `pnpm test`. Generated Codex development skills are omitted from this public snapshot; regenerate them separately when setting up the OpenSpec development workflow. To disable CLI telemetry, set `OPENSPEC_TELEMETRY=0` in the process environment.

The product vision defines purpose and MVP scope, the development plan defines the order of stages, and OpenSpec holds detailed requirements and tasks for individual changes. Substantial new behavior goes through a change; small copy and CSS edits can proceed directly. OpenSpec and its development dependencies are excluded from distributed Tibicen skills.

External experiments have a separate explicit entry: [execution contract and current limits](docs/evals/EXTERNAL_RUNS.md). The command loads only the trusted local host driver selected by an explicit `run`; normal tests stay offline. Native agent profiles require a verified process-tree boundary and their own observed preflight; current production routes fail closed until that boundary is available. See [native runner limits](docs/evals/NATIVE_RUNS.md).

The development harness includes a [67-case frozen matrix](docs/evals/MATRIX.md), pinned Ponytail/Spec Kit materials and observed OpenSpec package effects. [Controlled Codex diagnostics](docs/evals/CODEX_DIAGNOSTIC.md) use a separately observed subscription profile; these first diagnostic runs do not establish full skill/process acceptance or a release benefit claim.

The first two stages were documented retrospectively on 2026-10-22: the archives contain original SHAs from before history was rewritten and evidence from checks performed on that date. This does not claim that OpenSpec was used at the time or that live agent trials took place.
