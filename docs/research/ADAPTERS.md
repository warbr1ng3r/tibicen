# Tibicen integration research and adapter selection

A snapshot of official documentation as of 22 October 2026. The research below describes the mechanics and boundaries of several integrations: what Tibicen could connect reliably and the contract required. It does not establish which tools best suit users or set their recommendation/development order. It contains no user-case or comparative-benefit evidence for an unconditional “Spec Kit next” priority.

The candidate list is incomplete. Technical assessment is based on preserving the application, exact consent, no automatic commits and no persistent runtime. Upstream installation instructions do not imply verified compatibility. Main-branch links reflect the researched snapshot; implementation must pin specific releases/SHAs and contents.

## Basis for a user recommendation

Tibicen first uses the project and available dialogue to identify the task, expected result and actual difficulty. It then checks whether current rules and built-in capabilities are sufficient. For a confirmed gap, it compares suitable options by relevant capabilities, environment/team constraints, added benefit, manual effort, cost and installation/maintenance complexity. The user receives one justified recommendation; retaining the current solution is acceptable.

An adapter enables integration but does not itself make a tool suitable. If a useful solution cannot yet be connected reliably, show the specific gap and an allowed manual route while retaining useful setup. A supported tool that misses a material need does not become the default replacement. For example, a request for shorter answers may be fully handled by existing rules, and a sufficient adopted process does not require migration to OpenSpec.

## Required adapter types

| Area | What needs a separate contract | Decision |
|---|---|---|
| Workflow | Service structure, stages, templates, commands, updates and retention of the existing process | The first bounded OpenSpec adapter is implemented; additional processes are selected for uncovered cases |
| Coding tool | Entry points, skill/config format and location, startup and loading evidence | Confirm claimed profiles; expand for target-project agents and identified gaps |
| Ordinary skill | Source, full SHA, license, resources, target format, loading and usefulness | Shared Agent Skills mechanism; no separate adapter for every name |
| Package with hooks/plugins/runtime | In addition to materials: executable effects, global scope, disabling and update methods | Only a separate verified contract; not ordinary SKILL.md installation |
| MCP | Target config format and transport/secret parameters | Use existing stdio/config adapters; a service-specific adapter is needed only for additional unsupported behavior |

The shared Agent Skills format provides SKILL.md and optional scripts/references/assets. The installation unit should therefore be a verified set of required resources, not one Markdown file alone. This justifies a shared handler, not universal confirmation of every skill. [Agent Skills specification](https://agentskills.io/specification).

## Process candidates

| Need to investigate | Candidate | What to investigate in the specific case | Main maintenance cost |
|---|---|---|---|
| Link requirements, changes and tasks | OpenSpec | Whether its process fits project constraints; a bounded adapter already exists, but that does not justify a recommendation | Live loading/workflow, version updates, additional agent formats |
| Retain adopted constitution, specifications, plans and tasks, or address a confirmed gap | Spec Kit | Whether the existing process is sufficient and how this option improves on available alternatives | Separate CLI, scripts/templates, selected integration and its own install manifest |
| Support a broader product/architecture process | BMAD | Whether the team needs specific roles/modules and the complexity is justified | Module completeness, setup effects, multiple runtime tools, differing version lines |
| Improve completion checking, debugging, review or planning | Superpowers | Whether current rules or one practice are sufficient, or a full process is needed | The full process includes bootstrap/plugins and its own decisions about worktrees, delegation and Git |
| Manage long-running work by phases and retain state | GSD | Whether there is a way to retain the team's required process compatible with Tibicen boundaries | Execution workflow includes commits and executor management, conflicting with current Tibicen boundaries |

### OpenSpec

Official installation creates the process and generated files for selected tools; some profile/delivery settings are global. Documentation also warns about cleanup of old integrations during init. A bounded route with exact files and custom guidance for native commands, with separate CLI installation, is justified for Tibicen. [Installation](https://github.com/Fission-AI/OpenSpec/blob/main/docs/installation.md), [setup](https://github.com/Fission-AI/OpenSpec/blob/main/docs-lab/start/setup.md).

The current adapter supports 1.14.3, local spec-driven and Codex 0.157.0 / Claude Code 2.1.283 formats. Resource hashes, preservation, repetition, recovery and availability of the native CLI template have been checked mechanically. External stores, changing the registered agent/version and other CLI versions still require a separate migration/adapter. Live PROC acceptance remains open.

### Spec Kit

Current documentation uses explicit integration selection and separate sh/ps/py script variants. Init creates structure, templates and integration files; Git functions are a separate extension not installed by default. This makes a bounded variant without the Git extension promising, but the flag alone does not prove the absence of side effects across all stages. [Core commands](https://github.com/github/spec-kit/blob/main/docs/reference/core.md).

Spec Kit already has manifest-aware upgrade: local edits to integration files block ordinary updates, while shared scripts/templates account for the previous managed copy. A Tibicen adapter must reconcile this ownership with its own manifest; force must not become the normal update method. [Upgrade](https://github.com/github/spec-kit/blob/main/docs/upgrade.md).

If user cases justify this adapter, implementation first needs a small isolated spike: pin the CLI release/source materials, one target tool and one script variant; obtain the exact install manifest and init/adopt/upgrade effects, then check the commit ban and preservation of local templates/constitution/specs. Follow this with a separate OpenSpec change and a new session like SKILL/PROC. This research does not designate Spec Kit as the next adapter or a mandatory part of the first release.

### BMAD

Upstream describes a separate stable v6.12 line and main as v7 preview alpha with changing skills/setup. It also lists different installation methods and additional tools. A single “BMAD latest” adapter therefore lacks a sufficiently defined contract. If a pilot team already uses BMAD, first select a specific line/modules and check adoption; defer universal automatic installation. [Official README](https://github.com/bmad-code-org/BMAD-METHOD).

### Superpowers

The full package is a methodology over composable skills with bootstrap and coding-tool-specific installation. Its documented workflow includes worktrees, delegation options, testing and Git commits. For Tibicen, this is a separate integration with its own effects; installing one useful practice through a verified skill should be assessed separately from enabling the full process. [README and workflow](https://github.com/obra/superpowers/blob/main/README.md#the-basic-workflow).

### GSD

Settings describe planning.commit_docs, but disabling planning-file commits does not prove that code commits are disabled. Execution workflow explicitly links plan completion to production/SUMMARY commits. Until a verified compatible no-commit mode exists, the full adapter does not fit the current product contract. Existing .planning/ may be recognized and retained during analysis; that is not yet support for GSD execution. [Configuration](https://github.com/gsd-build/get-shit-done/blob/main/docs/CONFIGURATION.md), [execute-plan](https://github.com/gsd-build/get-shit-done/blob/main/get-shit-done/workflows/execute-plan.md).

## Ponytail and Caveman

On 23.10.2026, canonical Ponytail was confirmed through the author's README: [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail/tree/09c434ab73ca43761c5d8b0c5d341926c2fba710). The SKILL series pins full SHA 09c434ab73ca43761c5d8b0c5d341926c2fba710, skills/ponytail/SKILL.md, MIT and exact Git blob/SHA256. The selected skill-only contents are self-contained, without plugin/hooks/npm installer; the home copy was not used. The historical version and useful vanished example are pinned separately for updates. [Contents and limits](../evals/MATRIX.md#pinned-sources) confirm the fixture's source, not yet live skill application or universal suitability.

Caveman upstream JuliusBrussee/caveman and separate skills/caveman/SKILL.md were found. Its README distinguishes skill-only installation from the full product with CLI/proxy/other parts. Bounded skill-only contents can be investigated for a confirmed gap; a brevity preference alone does not justify even that installation. The full installer changes substantially more. [README](https://github.com/JuliusBrussee/caveman#say-less-the-caveman-voice), [source skill](https://github.com/JuliusBrussee/caveman/blob/main/skills/caveman/SKILL.md).

Licensing must be pinned with the version: upstream specifies Apache-2.0 starting at 3.0.0, while earlier releases retain their own terms. The old assumption “Caveman is always MIT” does not apply to every version. This is another reason to check the actual source/NOTICE and selected materials rather than the name. [Licensing](https://github.com/JuliusBrussee/caveman/blob/main/LICENSING.md).

The skill also references neighboring ultracave/megacave variants: before installation, check which references are actually required by the selected mode and do not promise absent modes. SKILL acceptance still requires pinning SHA/contents, ordinary source gates and live observation of loading/application. README marketing claims of token savings do not become Tibicen promises.

## Building the adapter queue

The next accepted engineering work is completing the harness and observed acceptance of current OpenSpec and at least one additional skill. These checks demonstrate specific integrations, not their superiority for every user. The separate [PREF program](../evals/PREFERENCE_SELECTION.md) checks selection quality, including different contexts for the same request.

Further adapters need real or explicitly labeled representative cases: task, existing process, constraints and remaining gap. First compare suitable solutions, including retaining the current one; then assess the new coverage an adapter provides, manual work it removes and implementation/maintenance cost. A hypothetical case is not presented as confirmed demand. No universal queue of names is assigned without these grounds. Existing projects using the selected process must be included in its acceptance alongside initial setup.

A new adapter is justified when the shared file/source mechanism cannot express its stage, effects or update. Admission requires version and provenance, exact paths/actions, retention of local decisions, verified execution limits and a separate new session. Popularity and skill count do not replace these criteria.
