# Tibicen

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/assets/brand/readme-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="docs/assets/brand/readme-light.svg">
  <img alt="Tibicen logo" src="docs/assets/brand/readme-light.svg" width="320" height="80">
</picture>

Tibicen helps your coding agent set up or repair a project's instructions and tools. It examines the project, shows one suitable plan, applies the changes you approve and reports what it checked. It runs inside your usual agent; there is no separate Tibicen account or background service.

[Website and preset builder](https://tibicen.pages.dev/).

## Get started

Run this in your terminal. It installs both complete skills from the exact published **1.5.4** distribution; Node **22.20 or newer** and Git are required.

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/381c5d53972b53d60e9a134ec7f620bb7c35e6be -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Then open your project in an agent that can read files and run Node, and send:

> Read `~/.agents/skills/tibicen-init/SKILL.md` and follow its instructions. Set this project up for my agent. Keep the setup small and show me the changes first.

Already have agent instructions? Use `~/.agents/skills/tibicen-adopt/SKILL.md` instead and ask it to review and improve the setup. Expand `~` to your home directory if your host needs an absolute path. This explicit entry does not depend on native skill discovery.

The agent inspects the actual project, proposes exact changes and waits for your approval before applying them. A sufficient existing setup may need no changes. Additional skills, memory and MCP connections are optional, chosen only when they help the project.

For requirements, other package managers, manual placement, update and removal, use the [installation guide](docs/INSTALLATION.md). Do not install the unbuilt source branch or copy only `SKILL.md`.

## Working with a project

Your project keeps the approved instructions and a `.tibicen/manifest.yml` setup record. Application source, existing package manifests, CI and data are protected during setup. Project writes, installations and application commands need approval of the exact plan; Tibicen does not create commits.

The final report separates structural checks, actual task results and unverified behavior. See a [short recorded walkthrough](docs/examples/first-use.md): an agent repaired a synthetic project's instructions, an operator applied its exact plan, and a fresh agent completed a useful task using the existing memory.

## Capabilities and verification limits

Use Tibicen with a host that can read the complete skill and perform its local operations. Your model and provider stay configured in that host; they do not need a separate Tibicen API key. Explicit access does not establish automatic loading or compatibility with every host. Windows project-command execution remains unavailable; read-only operations are supported.

Human usefulness and comparative time savings have not been measured. Your agent's built-in initialization or a direct request to review instructions may also be enough.

- [Working across hosts and models](docs/HARNESS_PORTABILITY.md) and [project memory](docs/PROJECT_MEMORY.md).
- [1.5.4 release checks and limits](docs/evals/results/2026-11-09-release-1.5.4/README.md), [changelog](CHANGELOG.md) and [earlier README/release history](README_RELEASE_HISTORY.md).
- [Contributing](CONTRIBUTING.md), [product scope](docs/PRODUCT_VISION.md) and [security](SECURITY.md).

## Build and install from source

For development, follow [Contributing](CONTRIBUTING.md). `pnpm build` produces the complete skills in `dist/`; the [local installation recipe](README_RELEASE_HISTORY.md#build-and-install-from-source) is retained in the earlier README. For ordinary use, prefer the pinned published command above.

## Update or remove an installation

Back up locally edited skill folders before replacing or removing them: repeating `add --copy` replaces the selected folder. Follow the [update and removal guide](docs/INSTALLATION.md#update-and-removal). Reinstalling Tibicen does not update project infrastructure automatically; request adopt separately.

[MIT license](LICENSE).
