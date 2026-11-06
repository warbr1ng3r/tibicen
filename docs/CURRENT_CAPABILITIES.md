# What Tibicen does today

**Current release: [1.4.1](evals/results/2026-11-06-release-1.4.1/README.md).**
Use the [installation guide](INSTALLATION.md), [portable workflow](HARNESS_PORTABILITY.md),
[harness profiles](HARNESS_CAPABILITIES.md) and [MCP formats](MCP_FORMATS.md) for
current guidance. These do not establish native loading or use in every host.

The snapshot below preserves the published 1.1 baseline and its original evidence;
it is not a current release inventory. [1.2 release results](evals/results/2026-11-05-release-1.2/README.md)
record the later published adopt diagnosis, version context and nested-memory
recognition. Harness profiles and the common installation route were published
in [1.3](evals/results/2026-11-05-release-1.3/README.md); task context and local MCP
diagnosis were published in [1.4](evals/results/2026-11-06-release-1.4/README.md).

**Snapshot: 5 November 2026 (Moscow), published version 1.1.0.** This describes the
released product, rather than the target scope in the [product vision](PRODUCT_VISION.md).
Release source: `3166be50a1a3979e600ea08b65694c9255dcb89a`; standalone distribution:
`7bbd953a020ac4ac4c7dfb99efa59f6e4b195026`. The [release report](evals/results/2026-11-04-project-memory/README.md#publication-follow-up)
retains checks, assistance, failures and limits. New opportunity research lives
in the [user-problem study](research/2026-11-05-user-problems/README.md).

## In one sentence

Tibicen helps your existing coding agent inspect, set up or repair a project's
agent instructions and integrations, apply the changes you approve, and explain
what was checked and what remains.

It is distributed as two standalone skills, `tibicen-init` and `tibicen-adopt`,
with local Node scripts. The landing page explains installation and generates
optional preset files in the browser. There is no Tibicen server, account,
background service or separate coding model. After setup, ordinary agents use
the resulting project files; Tibicen can be invoked again on request.

## What a user can ask for

The examples are illustrative requests, not transcripts or measured outcomes.

| Ordinary request                                | What 1.1.0 can do                                                                                                                                                                  | Important boundary                                                                                                                                                            |
| ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| “Set this project up for agents.”               | Inspect the existing repository, infer useful commands and constraints, propose one sufficient setup, and apply approved infrastructure changes.                                   | A working agent interprets the project. Existing application code, package manifests, CI and data are preserved. An empty directory can receive an approved initial scaffold. |
| “I've got rules everywhere. Put them in order.” | Inventory existing infrastructure, propose concrete additions, edits and removals, preserve useful decisions, then check the approved result.                                      | Finding semantic contradictions is an agent judgment, not a complete deterministic conflict detector. A sufficient setup can stay unchanged.                                  |
| “Stop making me explain our decisions again.”   | Bind one project-memory file, connect it from agent instructions, and supply rules for reading relevant decisions, retaining accepted knowledge and correcting outdated decisions. | Working agents maintain it afterward. Tibicen does not continuously observe chats or force an agent to read or obey memory.                                                   |
| “Connect this tool.”                            | Prepare selected local stdio MCP configuration, explain environment-variable names and apply supported targeted edits.                                                             | Claude Code/Cursor JSON edits are supported; Codex receives a manual TOML fragment. Remote HTTP MCP and secrets provisioning are outside this adapter.                        |
| “Use this skill, if it's suitable.”             | Discover candidates, inspect source/provenance and pinned content, include approved installation/replacement/removal and relevant checks.                                          | Popularity and heuristic scanning do not establish safety or usefulness. External code execution needs its own disclosed trust.                                               |
| “Review the setup after an update.”             | Rescan, consult supported official guidance, propose necessary changes and retain existing session/component history.                                                              | Runs are requested explicitly. There is no silent updater or guarantee that every upstream version is supported.                                                              |
| “We stopped halfway. What's left?”              | Inspect saved state, identify applied/pending/conflicting changes and resume the original session through a fresh approved plan.                                                   | Changed files require reconciliation; an unavailable original baseline remains unavailable. Recovery is not an unconditional undo of later user work.                         |
| “Use the same preferences in my next project.”  | Load a personal preset or a preset downloaded from the site, then recheck applicability to the new repository.                                                                     | Saving requires an explicit request. A preset is input, not installation approval; memory bodies are not preset content.                                                      |

## The normal path and visible result

1. **Read:** inspect permitted project files, existing agent setup, constraints and
   available sources. Before approval, first-party discovery/proposal operations
   do not write setup files or run project commands.
2. **Recommend:** the working agent proposes one small configuration. It asks only
   for important information that cannot be inferred. “All defaults” skips the
   interview; it does not approve changes.
3. **Review:** show exact paths and edits, component sources/SHAs, commands,
   execution trust, environment-variable names, costs and manual steps.
4. **Apply:** the core binds approval to the plan digest, checks original content
   and safe paths, and applies supported changes. A conflicting file change stops
   the write rather than silently overwriting it.
5. **Check and hand over:** report applied work, readiness, checks, limitations
   and the next useful request. Saving a separate report file requires an explicit
   request; reporting the outcome is part of the normal flow.

For example, a small approved memory setup might leave:

```text
AGENTS.md                # applicable instructions and a memory pointer
.agents/memory.md        # accepted decisions, reasons and useful verified facts
.tibicen/manifest.yml    # setup/version/provenance/session record
```

Selected agents may need different entry points. This tree does not imply that
every run adds these files or that every agent loads `AGENTS.md` identically.

## Mechanisms already present

| Mechanism                  | Implemented behavior and source                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Read-only inventory        | Bounded scan of files, languages, agent infrastructure and package commands; exclusions and unreadable/unsupported material are reported. See [scan](../scripts/scan/index.ts).                                                                                                                                                          |
| Exact approved changes     | Proposal validation, content hashes, managed blocks, safe path checks, explicit commands and preservation of the existing application. See [planning](../scripts/core/plan.ts), [contracts](../scripts/core/contracts.ts) and [apply](../scripts/core/apply.ts).                                                                         |
| Ownership and continuity   | Component records, provenance, original session identity, attempt history and recoverable unfinished work. See [components](../scripts/core/components.ts), [recovery](../scripts/core/recovery.ts) and [finalization](../scripts/core/finalize.ts).                                                                                     |
| Selected shared rules      | A checked common revision in managed Codex/Claude instruction blocks; stale registered copies can be detected. This is bounded by the [agent matrix](../references/agent-matrix.md), not universal cross-agent synchronization. See [shared rules](../scripts/core/shared-rules.ts).                                                     |
| Project memory             | One of `.agents/memory.md`, `MEMORY.md`, `docs/memory.md`, `docs/decisions.md`; safe binding and an instruction connection. Completed memory remains user-owned mutable content; initial apply and unfinished recovery still use exact originals. See [memory guide](PROJECT_MEMORY.md) and [implementation](../scripts/core/memory.ts). |
| Source and guidance checks | GitHub discovery, canonical provenance, full SHA, license/age/archive information, blocklist and heuristic content checks; dated official guidance with explicit gaps. See [discovery](../scripts/discovery/index.ts) and [practices](../scripts/discovery/practices.ts).                                                                |
| Optional process           | One bounded OpenSpec 1.14.3 adapter for checked Codex/Claude versions. It is selected when the request needs it. Tibicen does not require OpenSpec to run or produce its final report. See [process adapter](../scripts/process/index.ts).                                                                                               |
| Verification and handoff   | Structural checks, separate application and behavioral results, manual actions and truthful incomplete states. See [verification](../scripts/verify/index.ts) and [CLI/report](../scripts/tibicen.ts).                                                                                                                                   |

The CLI exposes `scan`, `discover`, `source-check`, `practices`, `proposal`,
`apply`, `resume`, `status`, `verify`, `report`, `mcp-verify`, `preset-load`,
`preset-save`, `self-test` and `version`. Most users interact through the skills,
rather than assembling JSON plans themselves. Reasoning about suitability,
non-obvious conflicts and the smallest useful setup belongs to the working
agent; the scripts validate and carry out bounded operations.

## What has actually been checked

The [candidate and publication report](evals/results/2026-11-04-project-memory/README.md)
is authoritative for exact identities and scope.

| Evidence                                                                                              | What it establishes                                                                             | What it does not establish                                                                                                       |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| Source gate: 767 passed, zero failed, one skipped; public CI passed                                   | Tested code paths and packaged resources on the recorded source/candidate.                      | A success rate on arbitrary user projects.                                                                                       |
| Six macOS/Ubuntu/Windows × Node platform cells                                                        | The recorded standalone/platform checks pass in those environments.                             | Native-agent behavior or Windows command execution. The product refuses command launch when process-tree control is unavailable. |
| Public install/update/removal for three targets; 90 payload files and three downloaded release assets | Exact distribution delivery and preservation in the recorded synthetic projects.                | Equal runtime support or automatic discovery in every target agent.                                                              |
| Two controlled fresh Codex memory tasks                                                               | Those sessions explicitly read, used and updated/corrected memory while preserving other notes. | Automatic startup loading, every agent/version, or measured benefit to a human. Setup assistance remains disclosed.              |
| Pages deployment and 18 returned bodies matching its official artifact                                | The checked English/Russian static site was deployed as built.                                  | End-user adoption or installation success in an untested environment.                                                            |

Structural checks work across project stacks. Executable application checks use
the supported web profile, approved commands and controlled copies; unsupported
profiles/environments remain `unverified`. Built-in controlled task/quiz/compat
execution has a conditional Claude Code route with version, authorization and
startup restrictions. Other observations in release studies are separate from
that built-in route. See the [matrix](../references/agent-matrix.md) and
[engineering acceptance](evals/ENGINEERING_ACCEPTANCE.md).

`complete` describes finished integration without a known mandatory defect;
it does not turn unperformed behavioral/application checks green.
`manual-action-required` exposes mandatory external steps; `incomplete` retains
an unresolved internal failure/mandatory defect and state.

## Boundaries that keep it small

- Supported first-party agent contracts concern Codex, Claude Code and Cursor,
  with different capabilities and tested versions. Historical ZCode observations
  do not make it a general supported adapter.
- No memory database, embeddings, private/global-memory editing, cross-project
  synchronization, chat-log ingestion or continuous memory maintenance.
- No agent orchestrator, model provider, marketplace, automatic general code
  repair, permanent monitoring or security sandbox.
- No promise that more rules improve coding, that models always comply, or that
  heuristic checks make third-party components safe.
- No measured effort savings, willingness to pay or human usefulness yet. Public
  problem research supplies hypotheses; it does not fill those missing outcomes.

Runtime/building the skills requires Node ≥22.20; installation also requires Git.
Developing the whole source/site uses the pinned pnpm and higher root tooling
requirement in [package.json](../package.json). Installed skills have no npm
runtime dependencies on the repository's development tools or landing page.
