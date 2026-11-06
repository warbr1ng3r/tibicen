# Installation presentation: one default route

Observed on **2026-11-06**. [Canonical English report](README.md); a Russian translation is maintained beside it. This is a bounded comparison and a recommendation, not an implementation or a conversion study.

**Recommendation:** Tibicen should present one copyable, tested installation command, followed immediately by the request to send to the agent. Move npm/pnpm/Yarn preferences and manual archive instructions behind one “Other installation methods” link. Keep the exact installer version, distribution revision, complete skill selection and copying behavior of the accepted command.

## What other products actually show

Counts below concern the installation component or the product entry block, not every navigation link on the page. The sources were read through the web text extractor; this comparison does not measure their rendered visual prominence, mobile usability or conversion. A CLI application, a specification framework and a collection of agent skills have different installation requirements.

| Product and category | Main public entry | Documentation and alternatives | Relevant lesson |
| --- | --- | --- | --- |
| [Claude Code](https://claude.com/product/claude-code), agent application | Two adjacent entry links: “Download for macOS” and documentation. Eight other interfaces, including terminal and IDEs, are listed as secondary routes. | The [terminal quickstart](https://code.claude.com/docs/en/quickstart) presents three install families: native installation explicitly recommended, Homebrew and WinGet. Native commands differ by OS/shell; further Linux package options are linked. | Several supported routes can coexist with an explicit default. The landing is not the full installation reference. |
| [OpenCode](https://opencode.ai/), agent application | Six install tabs: curl, npm, bun, brew, paru and yay. The returned default command is `curl -fsSL https://opencode.ai/v2/install \| bash`. | Its [intro documentation](https://opencode.ai/v2/docs) expands this to nine CLI tabs, standalone binaries, desktop downloads, web pairing and Docker. | Some prominent projects do put many choices on the homepage. This is a counterexample to claiming that everyone uses a single method, not proof that Tibicen needs the same menu. |
| [OpenSpec](https://openspec.dev/), specification framework with CLI | Five package-manager tabs: npm, pnpm, bun, yarn and nix. The returned default is `npm install -g @fission-ai/openspec@latest`. | The [installation guide](https://openspec.dev/docs/installation) leads with standalone installers, then agent-assisted installation, package managers and manual downloads. Its macOS/Linux command is `curl -fsSL https://openspec.dev/cli/install.sh \| sh`. | Alternatives belong in reference material, but the homepage and docs should agree about the default. The observed pages do not expose exactly the same leading method. |
| [Skills](https://www.skills.sh/), skill discovery and distribution | One generic command: `npx skills add <owner/repo>`. Agent names are shown separately from this entry command. | The [overview](https://www.skills.sh/docs) uses `npx skills add vercel-labs/agent-skills`; the [CLI reference](https://www.skills.sh/docs/cli) explains usage separately. | This is the closest comparison to Tibicen's current skill distribution: one entry command rather than a prerequisite package-manager decision. |
| [Superpowers](https://github.com/obra/superpowers), agent skills and workflow | The repository README is its detailed entry document. It has **16 harness-specific installation sections**, rather than one universal instruction. | For example, Claude Code uses `/plugin install superpowers@claude-plugins-official`; Gemini CLI uses `gemini extensions install https://github.com/obra/superpowers`. Several entries link fuller harness-specific guides. | A real native plugin may require a separate path. A long compatibility README is not automatically a useful model for a short marketing page. Tibicen's generic folder route does not establish these native integrations. |

These are dated observations from five selected official sources, not a market-wide survey. No install command was run. Vendor adoption and performance claims were not evaluated.

## What Tibicen currently asks the visitor to decide

The local [installation component](../../../landing/src/components/Installation.astro) contains a selector for **three command runners**: npm (`npx`), pnpm (`pnpm dlx`) and Yarn 2+ (`yarn dlx`). These are three launch aliases for the same pinned installer and the same destination, not three distinct Tibicen products. The [command generator](../../../landing/src/scripts/install.ts) always selects both skills, the universal target and copied complete folders. A manual archive route is already a documentation link.

The current default is:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/7b3b08f58276034b1609e44ef393e5f7c0e01a1b -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

The [installation guide](../../INSTALLATION.md) explains its accepted scope and installed paths. The web text tool and browser connector initially failed to open the public Tibicen URL. A subsequent fresh local Chromium session loaded the live HTTPS site with normal certificate verification and inspected the rendered desktop page at 1440 × 1000. Its title, language and release content matched the checked 1.4.0 source.

The unnecessary first decision is “which runner?”, before the visitor has tried the product. The meaningful later choice is whether to prepare a new setup or repair an existing one. “Copy install command”, “open the installed skill”, “pick a task” and “send the request” are also separate concepts in the current [page source](../../../landing/src/components/Landing.astro); making the first session appear as one continuous sequence would be clearer. This is an editorial judgment supported by the structure, not measured user behavior.

## Proposed treatment

1. **Show one default path.** State “Install both skills”, display the existing exact `npx` command and provide one copy button. Retain the material prerequisites: Node ≥22.20 and Git for this installer. A project may use pnpm while its owner runs this one-off installer with npx; the product does not need to inherit the project's package manager.
2. **Follow with the actual next action.** Open the project in the existing agent and send the explicit installed-skill request. Keep new setup versus existing setup as a task choice, with ordinary language. Installing files alone does not prove the host loaded them.
3. **Move alternatives into the guide.** One “Other installation methods” link can contain pnpm, Yarn 2+, manual archive installation, checksums and nonstandard paths. Update/removal and detailed compatibility evidence also belong in documentation. Do not remove the guide or the recovery information.
4. **Keep limits relevant to the decision.** A short file/Node-access requirement and a link to compatibility are appropriate near first use. Native auto-loading remains experimental. Universal distribution does not claim every host, model or native plugin was tested.
5. **Preserve the accepted delivery contract.** Do not shorten the executable to `npx skills add warbr1ng3r/tibicen` or replace the accepted revision with an unpinned default branch just for appearance. Do not add a new curl installer, npm package or platform-specific plugin merely to make the command look like another product's. A shorter stable alias would be separate distribution work with its own acceptance checks; it is unnecessary for this copy/layout improvement.

The evidence supports reducing the installation decision burden. It does **not** establish a conversion uplift, a productivity benefit or that the whole landing needs replacing. The appropriate first change is removing a low-value choice from the main path and making the first useful session easier to follow.

## Follow-up inspection of the live Tibicen page

The rendered desktop page measured 5,497 CSS pixels high at the inspected viewport; this is a layout observation, not a usability score. The preset builder, its advanced project hints, compatibility details and skill-loading troubleshooting are already collapsed by default. The thirteen harness suggestions are inside the advanced preset controls, not mandatory installation choices.

The clearer editorial issue is the repeated explanation of the same first-use journey: installation, opening the skill, selecting a task, the workflow section, then two full six-step illustrations. Prefer one continuous install-and-invoke block; retain one concise user/agent walkthrough with a task tab or an expandable second example. The starting project and resulting change should remain visible, as requested by the owner. Move preset creation to a secondary destination or post-first-use action. Keep material prerequisites and relevant Windows command limits near the start; detailed evidence belongs behind the existing documentation links.

The published 1.4.0 release and its engineering checks establish a public MVP. Measured time savings, successful unaided onboarding and broad native model/harness activation are not established by that release. The next proposed packet is first-use simplification; it is not an approved implementation backlog. A site-only change need not bump the distributed skills version. No mobile session, conversion study or product change was performed in this review.
