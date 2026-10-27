# Tibicen product vision addendum

**Revision:** 2026-10-22. **Basis:** [PRODUCT_VISION.md](PRODUCT_VISION.md).

This document defines additional rules for infrastructure changes, identifying user preferences, and extending workflow setup. Section references point to the main vision; its requirements apply without being repeated here. Implementation stages and readiness are tracked in [DEVELOPMENT_PLAN.md](DEVELOPMENT_PLAN.md).

Sections 1–3 detail existing obligations. Section 7 clarifies support for multiple agents; section 9 covers preference identification and component selection. In §6, the first bounded OpenSpec adapter is explicitly included in the nearest release under §13. Sections 4–5 and 8, Spec Kit, and other adapters remain future development.

## 1 Managed block handling

**Supplements §8:** preservation of areas outside an ordinary update of Tibicen's own block is checked mechanically. If the plan separately changes surrounding instructions, only the areas that the plan leaves untouched are checked for preservation.

| State of `tibicen:begin/end` markers | Handler operation |
|---|---|
| No markers | Prepare to add a block; include any required separator in the diff |
| One valid pair | Update or delete the block in its existing location |
| Block text already matches | Do not create another block replacement operation |
| Duplicate, nested, reversed, or unclosed pair | Do not change the block automatically; identify where the ambiguity occurs |

The marker format has a distinguishable version. The legacy format is recognized explicitly; an unknown version requires a separate conversion. Repair of damaged markers is described through an exact diff.

**Additional acceptance criteria:** empty and moved blocks, damaged pairs, and marker version changes; byte-for-byte comparison of untouched areas, including line endings. A damaged block fails block validation even if the entire file matches its expected hash.

## 2 Matching files during a component update

**Supplements §6.3 and §8:** an update plan is built from three states — the previous inventory in the project manifest, actual files, and the component's selected new inventory.

| Difference between states | Additional decision in the plan |
|---|---|
| A file was edited locally | Merge the changes, preserve the local version, or replace it; show the selected option explicitly |
| A resource disappeared from the new distribution | Determine whether the project still needs it; disappearance from a distribution does not itself require deletion |
| A user file appeared in the directory | Do not assign it to the component's inventory based solely on its location |
| A new resource occupies an existing path owned by something else | Record a conflict rather than automatically assigning the file to the component |

When local changes are preserved, the project manifest distinguishes original distribution content from the actual file state after the session. The local version retains its source link and is not labeled an exact copy of the selected SHA. Deleted resources are excluded from the installed inventory; previous records remain in change history.

**Additional acceptance criteria:** update a component with a local edit, a neighboring user file, and a removed resource. The manifest lists no deleted files as installed and does not falsely confirm that the local version has unchanged source content.

## 3 Failure between a file change and recording its result

**Supplements §10.3:** state must make it possible to recognize an interruption after a file change but before the operation's result was recorded. This requires comparing the expected original content, exact approved result, and actual state; absence of a file is accounted for in additions and deletions.

| Actual state | What is known on continuation |
|---|---|
| Matches the original | The file change is still required |
| Matches the approved result | The file already conforms to the plan; another write is unnecessary |
| Differs from both | The operation's outcome is ambiguous; the path requires investigation |

A matching final file does not establish which process wrote it and does not confirm execution of related commands. If a command's outcome is unknown after a failure, retrying it must be justified separately in the remaining plan. Further continuation is governed by §10.3–5.

**Additional acceptance criteria:** failures before file replacement, after replacement but before recording the result, during manifest writing, and before state deletion. Check correct recovery of records of applied changes, not merely the existence of a saved session.

## 4 Provenance of a composite distribution

**Extends §6.1 and §8 when such sources are added:** a component's packaging may reference material from another repository. The project manifest links each selected material to its actual source, separately from the packaging's provenance. The packaging's authorship and license do not replace those of the included materials.

The checks in §6.1 apply to every source used. Distribution completeness is also checked: are the links, templates, and supporting files required for the selected process available? If a transformation changes content, record the source materials and the transformation's result. An unsupported composite distribution receives a gap, rather than verification based on a single wrapper's metadata.

**Additional acceptance criteria:** an unchanged wrapper with a changed original, sources with different licenses, and a missing linked resource. Every installed file can be traced to source material or an explicitly described transformation.

## 5 Connected context map

**Extends handoff in §4:** a concise map links the agent entry point, main instructions, skills, and reference materials. Each link specifies the connection method and reading condition, where supported by the selected agent. Unknown links are marked where they occur.

Example: `AGENTS.md → project commands; review skill → for the relevant task; reference materials → through a link in the skill`. The map describes configuration; evidence of actual loading comes from §6.4. It uses information already gathered; no separate context compiler or exact token count is required.

**Additional acceptance criteria:** a missing link is visible in the chain, reading order is not invented, and detailed materials are not presented as continuously loaded without evidence. Saving the map to a file follows the report rules in §8.

## 6 Connecting process frameworks

**Develops the use of existing components from §2:** Tibicen can select and configure a specification workflow framework such as OpenSpec or Spec Kit. Setup covers its service structure, instructions for selected agents, templates, and available commands for moving between process stages.

The nearest first release includes one bounded OpenSpec adapter with separate acceptance. This capability is used according to the project's needs; an already sufficient process is preserved. Spec Kit and other adapters remain future development. This choice does not automatically move the full scope of §§4–5 and 8 into the first release.

For a supported framework, the adapter describes verified versions, files created and changed, initializer side effects, the update method, and integration checks. Installing a supporting CLI, when needed, is a separate action with a specified version and installation location. It does not make that CLI a mandatory dependency of the Tibicen distribution.

For this extension, the agent infrastructure scope from §8 may include explicitly listed framework service paths, such as its configurations and templates. This does not authorize changing any file inside a directory with that name. A supported initializer may be executed beyond the command set in §10.2 only under the adapter's contract, with known effects and the general execution constraints in that section. If installation requires changes to the protected application or has uncontrolled effects, it remains a manual step.

The common lifecycle is connected through the selected framework: stages, required artifacts, transition criteria, and commands are linked to project tasks. After handoff, agents and connected tools execute the process. A process already accepted by the team may be preserved and configured without switching systems.

**Additional acceptance criteria:** set up the framework from scratch and connect it to an existing process; its working command and required materials are available in a new session of the selected agent. A CLI without a connected process does not count as completed integration. Loading and representative-task checks operate within §6.4 and §10.10.

## 7 One project and multiple coding agents

**Clarifies §6.4, §7, and §10.7:** support for multiple agents means configuring one project for several selected coding tools. This requirement does not define running an agent team, distributing tasks, or coordinating parallel work.

Common project rules and the selected process's stages are consistent across adapters. Copies of shared materials, where needed, have a verifiable link so divergence can be detected during updates. Format differences and verification methods follow the matrix in §10.7 and procedure in §6.4.

**Additional acceptance criteria:** in one project, two agents receive the same approved revision of rules and process through their respective formats. An update does not leave an unnoticed outdated copy.

## 8 Portable user setup manifest

**Extends reuse from §9:** a process author or team may describe a specific set of rules, components, and settings for use in other projects. A separate portable setup manifest is introduced for this purpose. It is a new setup input; the project manifest and preset from §8–9 are not substitutes for it.

The setup manifest has a schema version, a name, and a version for the set. It contains applicability conditions, selected component sources, supported adapter parameters, target agents, and a description of process stages. First-party rules and templates are supplied as separate materials with explicit provenance. The author may distribute them alongside the manifest or through specified sources.

When applying the setup, Tibicen compares the set with the project's actual infrastructure and shows deviations from the setup manifest. A preset may fill unspecified preferences. A conflict between the manifest and the user's request or accepted project decisions is resolved through a recommended revision of the normal proposal; file loading order does not automatically determine a winner.

Pinned sources preserve selected versions until a change to the set is shown separately. This makes it possible to repeat an explicitly specified composition. Resolving transitive dependencies remains the responsibility of connected tools; matching one manifest does not establish reproducibility of their entire environment. An unsupported schema version, component, or adapter parameter produces a clear refusal or gap rather than undisclosed partial application.

The setup manifest describes a desired configuration, not an arbitrary installer program: supported adapters form executable actions under §6 of this addendum. Obtaining materials and applying changes follow §5–6 of the main vision. The project manifest preserves the version of the applied set and actual deviations from it.

**Additional acceptance criteria:** one set is applied to two suitable projects while preserving its specified sources; an unsuitable project receives an explanation of incompatibility. Check a conflict with a preset, a locally modified component, an unknown schema version, and a missing adapter. Exporting a setup manifest separates distributable materials from the actual state of the source project and follows the user artifact saving rules in §9.

## 9 Identifying preferences and selecting components

**Clarifies §3, §5, and §6.1:** Tibicen accounts for explicitly stated and reasonably inferred needs and preferences for working with an agent, including response detail, autonomy, and workflow. Users only need to describe the work they want; they do not have to name a particular tool or state every need directly.

Evidence comes from the available conversation, project materials, existing instructions, and the selected preset. For example, requests to “get straight to the point” or “avoid long explanations,” or a requirement for short answers in project instructions, justify considering concision during selection. Unavailable conversation history is not assumed. An explicit user decision takes precedence over an inferred preference.

An identified need informs discovery and assessment of suitable skills, MCP connections, and other supported components under §6.1. Tibicen proposes a suitable solution itself even if the user did not request a tool installation. For every component, it explains the connection to the need and the benefit compared with the existing setup and the agent's built-in capabilities. Sufficient existing rules may be preserved without adding a component; there is no mandatory toolset.

Inferred preferences appear in the overall proposal as assumptions, with a brief basis and an opportunity to correct them. When the evidence is sufficient, no separate question is required for every preference or component. Significant conflicts and unknowns where an incorrect assumption would be costly are clarified within the interview limits in §5. An assumption does not become consent to installation or execution: normal approval of the exact plan still applies.

If there is no evidence for a preference, Tibicen does not attribute it to the user. The initial recommendation assumes short, clear responses with necessary detail; concision preserves the conditions, limitations, and information the user needs to decide.

**Additional acceptance criteria:**

- Project instructions require short answers, but the user has not named a preference or tool: Tibicen considers concision in selection, explains its decision, and does not require a separate question when the evidence is sufficient.
- The available conversation contains indirect signs of a preference: the proposal links them to its recommendation and labels the inference as an assumption; an explicit user clarification changes the recommendation.
- No signs exist: no hidden preference is invented, and no special component is automatically added for it. A sufficient existing setup and a significant conflict are checked as separate scenario variants; a conflict follows the clarification rule above.
