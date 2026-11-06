# First use and moving between agent hosts

**Checked 6 November 2026.** English is canonical; the adjacent Russian edition is `first-use_ru.md`. This lane recommends **maintaining 1.4.1, with no new first-use or migration feature selected**. Two narrow options below remain conditional, with explicit rejection conditions. Reported confusion is real; it does not establish that another generator, installer or host adapter improves the result.

## What already works, and what remains unknown

The [published inventory](../../CURRENT_CAPABILITIES.md) already includes task-aware init/adopt, arbitrary valid host IDs through explicit skill reading and Node, preserved native rules, exact approved infrastructure edits, presets and a sufficient-setup no-op. Models/providers remain inside the selected host. These implement the bounded setup duties in the [vision](../../PRODUCT_VISION.md); the [addendum](../../PRODUCT_VISION_ADDENDUM.md) does not make a universal context compiler or portable setup manifest shipped functionality.

The [first-working-session record](../../evals/results/2026-11-06-first-working-session/README.md) contains an initial instruction file using actual project commands, a stale-command repair preserving nested rules, and a sufficient case with no changes. Those assisted synthetic observations used published **1.4**, not a fresh 1.4.1 installation or broad native-host test. The later [repair comparison](../../evals/results/2026-11-06-repair-comparison/README.md) reached the same repair/task result and no-op with Tibicen and direct Codex: eight once-only launches, one fixture/host/model, explicit reading/testing prompts. Extra functional benefit, ordinary installation effort, human time and monetary cost remain unknown. This research cannot upgrade either record.

[Task diagnosis](../../../scripts/core/diagnosis.ts) already accepts host/version, working directory and target path, reports lexical relationships and leaves native loading/use unverified. [Inventory guidance](../../../references/stage-inventory.md) requires reading actual permitted rules and linking problems to their text. A new host therefore does not require another native writer or a duplicate instruction file. Common-file operation and native discovery are separate contracts; see [portability](../../HARNESS_PORTABILITY.md).

## Five original reports, including counterevidence

| Ordinary problem | Original record and current qualification | What it means for Tibicen |
| --- | --- | --- |
| “We moved the repository; the agent now sees stale skills and paths.” | [Pydantic #8898](https://github.com/pydantic/pydantic-ai/issues/8898), opened 28 September: dropped bridge and stale relocation references. Overall issue remains **open**, but this specific item is marked fixed through merged #9658 on 2 October. It is explicitly AI-assisted maintenance reporting. | A useful historical failure class, not an unresolved customer request or proof that a filename inventory detects intent. |
| “My new agent ignores the rules already in the repo.” | [Jan #9079](https://github.com/janhq/jan/issues/9079), 28 September; **closed completed 29 September**. Maintainer proposal concerned `JAN.md` versus `AGENTS.md`. | Native repair exists; do not add a Jan bridge merely to solve the old state. |
| “Which rules file works across our IDEs and monorepo?” | [Copilot discussion](https://www.reddit.com/r/GithubCopilot/comments/1wre0j7/agentsmd_vs_githubcopilotinstructionsmd_when/), 27 September: Visual Studio 2026, some VS Code and OpenCode; single-source and scope confusion. Installed builds and resolution were not established. | Surface identity matters. CLI documentation cannot settle Visual Studio behavior; comments are not technical authority. |
| “Sharing the skill directory creates duplicate warnings.” | [Gemini #28944](https://github.com/google-gemini/gemini-cli/issues/28944), 21 August, reporter version **0.56.0**; **closed as not planned 5 September**, not established fixed. | Historical alias symptom, not a verified current defect. Existing copy/archive delivery avoids requiring aliases; the scan already exposes excluded symlinks. |
| “Starting at the root misses nested instructions.” | [Copilot CLI #3051](https://github.com/github/copilot-cli/issues/3051), 30 April, still **open**; requests recursive discovery. Affected release was not established. | Current docs describe target-path nested loading. That neither reproduces the old failure nor proves eager whole-tree discovery shipped. Task scope is already represented locally. |

These are five source reports, not five independent customer interviews. Jan's issue and fix are one correlated case; the Reddit thread and its replies are one case.

## Native alternatives change the decision

The [merged Jan change](https://github.com/janhq/jan/pull/9083) documents an `AGENTS.md` fallback while retaining nonempty `JAN.md` precedence, native `/init` reuse and `/context` visibility. Merge establishes source availability, not the first released or installed version.

[Copilot CLI](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) documents `/instructions` and nested target-path loading. [Visual Studio](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=visualstudio) separately documents instruction References and `/generateInstructions`. Its page's omission of `AGENTS.md` is insufficient proof that every build rejects it. [Gemini](https://geminicli.com/docs/cli/gemini-md/) exposes loaded context through `/memory show` and configurable instruction filenames. [OpenCode V2](https://dev.opencode.ai/v2/docs/instructions/) documents `AGENTS.md`, nested discovery and no `CLAUDE.md` fallback; its V2 URL redirects to the current instructions page. Do not transfer older OpenCode behavior to V2.

These inspection/generation routes are material controls. Native generation, existing package delivery or explicitly reading one common file may already satisfy first use. Tibicen's opportunity must survive that comparison, rather than count more supported names.

## Two conditional options, neither selected now

### 1. Record an explicitly supplied instruction source

Ordinary request: **“I switched tools. Check the instructions this tool actually uses; keep our rules.”** Jan and the mixed-IDE discussion illustrate why names and surfaces can differ.

Current handling already reads permitted existing files and preserves rules. The narrower structured gap is that `instructionCandidate` in [profiles](../../../scripts/agents/profiles.ts) recognizes a finite set: `JAN.md` is not classified there. An arbitrary file can be inventoried/read without appearing in the report's instruction-candidate list. `TaskContext` provides no explicit instruction-path observation field. This is a reporting gap, not inability to inspect the file or proof that its host loads it.

The smallest possible addition would be a bounded, caller-supplied project-relative path/hash observation in the existing report, labelled **caller-observed**, leaving loading/use unknown. No new writer, host-specific precedence rule or registry is needed. Native context inspection and today's manual handoff are the baseline.

**Reject unless** an offline example shows an important decision lost by the current report/handoff but preserved by that one observation. An excluded/secret path must remain unavailable; a stale hash cannot become a current fact. If the native inspector or current explicit read gives the same usable answer, change nothing. Upkeep includes path/privacy validation and preventing supplied observations from becoming authority. The fixed Jan case alone does not justify implementation.

### 2. Explain broken local references after a move

Ordinary request: **“We moved folders. Check that the agent's instructions and skills still point to real files.”** Pydantic supplies the historical example; Gemini supplies a distinct alias caution.

Current [scan](../../../scripts/scan/index.ts) records file hashes and `symlink-excluded` gaps; inventory already asks the agent to inspect links and commands. Component updates already compare previous inventory, actual files and selected new content. The inspected diagnosis contract has no per-reference edge list, but that does not establish a failed current workflow.

A smallest possible addition is read-only reporting of literal local references in explicitly selected instruction files: found, missing or unassessed, without following symlinks/external paths or repairing automatically. Host imports/globs and intended deletions remain outside this simple check. It **cannot infer a deleted bridge or intended skill relocation without prior expectations**, so it would not solve the whole Pydantic case. Ordinary review or an existing project link checker may suffice.

**Reject if** a model-free intact/missing/stale/forbidden-path example only repeats existing scan gaps, needs guessed intent, or requires a new universal resolver. Parsing/import differences and false positives impose ongoing cost. The evidence presently supports no implementation.

## Decision and evidence limits

The strongest countercase is competent native setup plus explicit shared instructions: upstreams fix loading defects, expose active context and generate initial rules, while the local comparison found no extra outcome. That does not make approval/preservation mechanisms valueless; it leaves their incremental benefit unmeasured here.

Keep 1.4.1 and use the existing task-aware handoff. No new adapter matrix, automatic migration, installer, context compiler or research round is queued. A future concrete failure can be checked against the rejection conditions above without recruiting users or launching models. This desk study used no installs, credentials, native/model runs or runtime tests and establishes neither prevalence nor general compatibility.

## Source ledger

All ten primary records were freshly opened on 6 November 2026. Five reports plus five owning contracts are **not ten independent demand observations**. The first three reports were root-supplied fresh leads; none of the five issue/thread URLs appeared in the inspected prior strategy/post-1.3 research. Gemini/OpenCode/Copilot documentation overlaps the existing harness research and was refreshed, not counted as new demand. The [prior strategy](../2026-11-06-product-strategy/README.md) remains historical.

| Record | Date/version/status retained | Evidence role |
| --- | --- | --- |
| [Pydantic #8898](https://github.com/pydantic/pydantic-ai/issues/8898) | 28 September; open overall, relevant item fixed 2 October | AI-assisted maintenance case. |
| [Jan #9079](https://github.com/janhq/jan/issues/9079) | 28–29 September; completed | Native-gap countercase. |
| [Mixed IDE thread](https://www.reddit.com/r/GithubCopilot/comments/1wre0j7/agentsmd_vs_githubcopilotinstructionsmd_when/) | 27 September; Visual Studio 2026 named | Unresolved reported confusion. |
| [Gemini #28944](https://github.com/google-gemini/gemini-cli/issues/28944) | 0.56.0; 21 August–5 September; not planned | Alias symptom; no current reproduction. |
| [Copilot #3051](https://github.com/github/copilot-cli/issues/3051) | 30 April; open; release unknown | Nested-scope request. |
| [Jan #9083](https://github.com/janhq/jan/pull/9083) | Merged 29 September | Same-case native repair/control. |
| [OpenCode instructions](https://dev.opencode.ai/v2/docs/instructions/) | Living V2 contract, redirected | Current declared scope. |
| [Copilot CLI instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions) | Living CLI contract | Native context inspection. |
| [Visual Studio context](https://learn.microsoft.com/en-us/visualstudio/ide/copilot-chat-context?view=visualstudio) | Living IDE contract | Native inspection/generation. |
| [Gemini context](https://geminicli.com/docs/cli/gemini-md/) | Displayed update 18 June | Native context/configuration. |
