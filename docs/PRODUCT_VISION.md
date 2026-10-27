# PRODUCT_VISION.md — Tibicen

## Summary

**What:** Tibicen is a lightweight framework that takes project agent infrastructure setup off the developer's hands. It helps set it up for the first time or put an existing setup in order: it studies the project, proposes a suitable solution, applies approved changes, and checks the result.

**For whom:** developers who frequently create repositories or want to improve how agents work in an existing project. Users only need to describe their task and constraints; understanding agent configuration internals is not a prerequisite.

**Two scenarios:** “Set up for the first time” — an empty directory or an existing project without agent infrastructure; “Improve and update” — a project with infrastructure from Tibicen or any other source. The distribution consists of two skills: `tibicen-init` and `tibicen-adopt`.

**Result:** infrastructure that fits the project and selected agents, contains what is needed, is connected, and has been checked within the available limits. Its quality is measured by the usefulness of the next working session, consistent instructions, and the amount of manual work left to the user. The number of installed skills or files is not a quality measure.

**Lightweight operation:** Tibicen works inside the user's usual agent. After it finishes, the project retains the infrastructure and its `.tibicen/` project manifest; there is no persistent runtime or dependency on an installed Tibicen. The tool can be invoked again in the same project for checks and updates.

**Keeping current:** live component selection is supplemented by checking applicable official guidance and maintaining a versioned core of rules. Project updates happen at the user's request through an approved change plan.

**Status:** the main product document and basis for implementation, dated 2026-10-21. Target behavior is defined in §1–5; the first release and implementation stages in §13; usefulness criteria in §14.

Requirement clarifications and extensions are in the [product vision addendum](PRODUCT_VISION_ADDENDUM.md), dated 2026-10-22.

> *Tibicen is temporary scaffolding: it helps build or repair a structure and is removed when the work is done.*

## Decisions in this revision

1. Two user scenarios: set up infrastructure for the first time; improve and update existing infrastructure.
2. In the first release, both scenarios proceed through applying approved changes, rather than stopping at recommendations.
3. The normal path is one recommended setup and one final approval. Detailed choices are available on request.
4. Existing agent infrastructure files may be corrected, extended, replaced, or deleted only within an explicitly approved scope. Existing application code is protected from changes.
5. No persistent Tibicen process remains in the project after completion. Repeated runs for the same project are supported.
6. Skills and MCP connections are selected for the task. The absence of unnecessary components is a positive property of the result.
7. MCP uses stdio/local transport, with secrets outside the repository and one target configuration per agent selected for MCP. `.tibicen/` is not an MCP configurator.
8. Compatibility, provenance, and loading checks remain internal quality mechanisms. Dynamic compatibility probes are enabled by default and may be disabled by the user.
9. Presets and a static page with a builder are part of the first release. Automatic telemetry comes after release.
10. Best practices are assessed in the context of the project and tool versions. Keeping them current requires maintaining Tibicen itself and rechecking projects on request.

**Glossary:** infrastructure — instructions, rules, skills, selected MCP connections, and agent working commands · scaffold — their files together with the project manifest · core rules — versioned decision procedures and quality criteria · proposal — the recommended solution and exact change plan presented before approval · project manifest — `.tibicen/manifest.yml` · gap — explicitly recorded unavailable information or capabilities · baseline — the initial state and check results used for comparison · compatibility probe — a check of a specific “skill × agent” pair that distinguishes discovery from instruction loading · `manual-action-required` — integration is waiting for a mandatory external action by the user · `incomplete` — work stopped because of an internal failure or an unresolved mandatory integration defect.

## 1. Purpose and product boundaries

Tibicen helps users obtain agent infrastructure suited to their project with little effort. It studies tasks, the actual repository structure, and available agents; recommends a sufficient configuration; shows the changes; applies what is approved; and checks integration and the usefulness of the result.

The first scenario is initial setup. In an empty directory, it can create an approved initial project scaffold and infrastructure. In an existing project without infrastructure, it adds the required agent files without reworking the application.

The second scenario is improvement and updating. Tibicen identifies outdated, unnecessary, conflicting, and disconnected elements; preserves useful user decisions; proposes corrections; and applies them after approval. This scenario also covers projects previously configured by other tools.

**Complete infrastructure** provides enough context and tools for the selected working tasks. It does not mean a mandatory collection of every possible process, skill, MCP server, hook, or agent role. An additional component is introduced when it has a clear benefit for the project.

The product is distributed as skills for existing agents. These scenarios require no separate application, server, account, or persistent process in the repository. The checks performed and environment limitations are disclosed at handoff; the presence of files alone does not prove correct agent behavior.

## 2. Problem and product value

When creating another repository, developers repeat the same work: recall the chosen agent's rules, assemble instructions, select skills, connect tools, and check that the pieces work together. Copying yesterday's setup saves time but carries over outdated assumptions and unnecessary rules.

In an existing project, infrastructure gradually accumulates duplicates, conflicts, unsuitable processes, and old integrations. Users need help correcting these problems as well as identifying them.

**Tibicen's main value:** reduce the time and manual work needed to reach a useful agent session while preserving control over changes. Skill selection, compatibility checks, and file generation serve that goal.

| User task | Tibicen result |
|---|---|
| Start a new project | An approved scaffold and connected agent infrastructure |
| Connect agents to an existing project | Setup based on the actual commands and structure, without reworking the application |
| Repair or update infrastructure | Approved changes applied, useful decisions preserved, and a verification report |
| Repeat the setup in another repository | A preset of decisions, with a fresh scan and a new applicability check |

Skill installers, instruction formats, and process frameworks are used as existing components. Tibicen's competitive hypothesis is the convenience of the complete workflow from understanding the project to verified integration. Any claim of uniqueness requires separate market research; the product does not depend on a promise that no alternatives exist.

Distribution uses an existing skill installer and Tibicen's own static page. A monthly review of ecosystem changes informs product decisions and keeps rules current; building its own marketplace is not planned.

## 3. Principles and infrastructure quality

1. **Little user effort.** The agent investigates the project and recommends a solution itself. It asks the user only for information that cannot be reliably inferred from available context and where a wrong assumption would be costly.
2. **Sufficiency.** Every added element has a purpose. A suitable existing setup is preserved. A repeated run may conclude that no changes are needed.
3. **Consistency.** Entry points are connected, paths and commands match the project, and instructions contain no identified duplicates or conflicts. The amount of context loaded continuously is limited to what the work requires.
4. **Applicability.** Decisions account for the stack, agent versions, tasks, and user constraints. A component's popularity or freshness alone does not establish suitability.
5. **Verifiable usefulness.** Checks cover both the file inventory and the agent's ability to find the required instructions and perform an approved representative task. Unavailable checks are identified explicitly.
6. **Transparent approval.** Before writing, installing, or executing third-party code, a proposal shows the exact changes and executions. Third-party content encountered during research is data, not instructions for Tibicen.
7. **Safe boundaries.** Changes to an existing project are limited to approved agent infrastructure files and blocks. Secrets do not enter context, logs, or the repository. Working application code is not changed.
8. **Repeatability without a resident runtime.** The tool runs for the duration of a task and can be invoked again later. No persistent Tibicen runtime remains in the project.
9. **Evidence for current guidance.** The core rules have a version; significant sources have a check date and scope of applicability. An inability to obtain fresh information is not concealed behind a claim of current best practices.

**Result criteria:** suitable composition; correct integration; no identified conflicts or unnecessary elements; preservation of the application and useful user decisions; available checks; and a clear first working step. Known verification limitations remain part of the report.

## 4. Two scenarios and session stages

There are still two skills: `tibicen-init` for first-time setup and `tibicen-adopt` for improvement and updates. Routing is determined by the presence and condition of agent infrastructure, not only by whether the directory is empty. If the request and observed state differ, the agent explains the selected route; no additional technical choice is required from the user.

Stage instructions: `scan`, `inventory`, `interview`, `product-arch`, `agent-arch`, `proposal`, `build`, `verify`, `handoff`. The `build` stage includes creating and applying approved changes. File names follow `references/stage-<name>.md`.

### Set up for the first time — `tibicen-init`

```text
User request: the project and its tasks; “all defaults” is allowed
scan          environment, agent versions, actual tree, and constraints;
              existing infrastructure → improve route if needed;
              available materials and applicable practice sources
interview     only important missing information; no questions in autopilot
product-arch  new projects only: proposed tree and assumptions;
              preserve the application structure of an existing project
agent-arch    one recommended configuration; live selection; checks for
              provenance, applicability, and conflicts
proposal      short explanation + exact changes/executions/permissions/cost
              → one initial approval
build         in an existing project, baseline first if supported
              and execution is approved; then infrastructure and manifest
verify        integration and quality; approved project checks;
              representative task, quiz, and compatibility within available limits
handoff       what is ready, what was checked, limitations, first useful prompt;
              offer to save a preset
```

### Improve and update — `tibicen-adopt`

```text
User request: “review and put the agent infrastructure in order”
inventory     actual files, agents and versions, manifest, previous decisions;
              conflicts, duplicates, unnecessary, outdated, disconnected items;
              other tools' areas are input to the plan, not permission to edit
interview     one iteration for important missing information; autopilot available
agent-arch    compare against applicable current rules and tasks;
              preserve what fits; recommend necessary changes
proposal      add / modify / replace / delete; exact paths and diffs;
              reasons, commands, trust, cost, and manual steps → approval
build         baseline before changes if possible; verify original hashes;
              apply the approved plan to infrastructure only
verify        initial snapshot + all applied changes; no new regressions;
              integration, quality, and available task/quiz/compatibility probes
handoff       added N / modified M / deleted K / manual steps R;
              infrastructure status and verification results reported separately
```

If the environment changes or the work would exceed the approved plan, a new proposal covers the remaining work. The repair cycle allows no more than two attempts; an unresolved mandatory integration defect after those attempts produces `incomplete`, with the reason and a list of applied changes. Project and behavioral check results are reported separately (§10.4). Repairs do not permit an undisclosed expansion of the write scope.

## 5. A simple user flow and approval

**Normal flow:** describe the task → receive a recommended setup with an explanation → approve → receive the applied result. Candidate rankings, technical alternatives, and manual configuration are available on request, but are not required steps.

Internally, nine dimensions remain: scope and deadline, forbidden paths, code trust, stack, target agents, workflow, structure, skills, and MCP. Scanning, context, and recommendations resolve them. Externally, there are no more than four compound questions over 1–2 iterations; improvement uses one iteration. A question is asked when the answer cannot be reliably inferred and a wrong assumption would be costly.

| Question, when needed | What it clarifies |
|---|---|
| Hard constraints | Deadlines, forbidden areas, permitted execution |
| Environment | Ambiguous stack and selected agents |
| Work and structure | Tasks, preferences, and mandatory user decisions |
| Required connections | Missing context about external tools and team requirements |

**Autopilot:** “use the defaults,” “use your judgment,” and “don't ask” mean zero interview questions. The agent derives recommendations and shows its assumptions; autopilot does not replace approval of the final plan.

The proposal consists of a short summary of “what will change, why, and what you will need to do,” with supporting details. Before approval, exact paths and diffs, sources/SHAs, commands and argv, headless executions, permission boundaries, check costs, and manual steps are available. The user may accept the recommendation as a whole or change any part. Significant risks and mandatory manual actions are visible in the summary rather than buried in details.

Before this checkpoint, trusted first-party read-only scripts and network reads under §10.14 are allowed; writing state/cache/counters, dynamic `npx`, installations, and third-party execution are prohibited. Plan details remain in context before approval, without hidden disk writes.

For an empty directory, the proposal may include package manifests, configuration files, and `git init`. This is an approved initial scaffold, not implementation of application functionality. In an existing project, these files are read for understanding but are not reworked for agent setup.

Revising the proposal is an ordinary conversation. Clarifying the tree does not approve installations or commands that have not yet been shown. A new source, command, write area, or deletion outside the plan requires new approval. Saving a personal preset or report file requires a separate explicit request.

## 6. Component selection and keeping current

### 6.1. Live selection

Search, hashing, source validation, and change preparation are implemented in scripts. The common entry point is `scripts/tibicen.ts <command>`. They use built-in HTTP and already installed trusted tools; downloading and executing new CLIs through `npx` is not a read-only research method.

1. Search is limited by the task, stack, and required capabilities. Sources include skill registries, the GitHub API, and MCP registries; Tibicen does not contain a preassembled component catalog.
2. Untrusted input text, dossiers, and probe outputs undergo structured extraction; raw output does not become an instruction for Tibicen. README/SKILL.md files are read as data for assessing selected candidates.
3. Mandatory conditions: verifiable provenance, an allowed source and SHA, a license checked against the tree at that SHA, no prohibited install hooks, and no blocklist match. An unknown license causes refusal by default; an exception must be explicit in the proposal and project manifest. The repository must not be archived; fork provenance is resolved to the canonical source.
4. The published, versioned selection formula retains a repository age filter of ≥90 days. Contributor count is used neither for admission nor ranking; no separate request is needed. Installs, stars, freshness, and audits are supplementary signals, not proof of quality or safety. An external registry's `verified` field is stored separately with its source identified.
5. Candidates are assessed for applicability, unnecessary instruction volume, conflicts with existing rules, and benefit compared with the agent's built-in capabilities. By default, one solution is proposed with a rationale; alternatives and a top 3 are available on request. “Do not add a component” is a valid decision.
6. The injection scanner is heuristic: suspicion produces `injection-suspect` and blocks installation. No findings does not prove safety. Installing a skill as instructions for the target agent is disclosed separately in the proposal and does not authorize Tibicen to execute arbitrary commands from its text.
7. After approval, files are obtained with a pinned SHA; their content hashes are recorded in the project manifest. Until files are obtained, the selection is a plan, not an installation. Files that were not obtained are not recorded as installed.
8. Empty results → one reformulation → an honest gap: defer the capability or propose a small first-party skill with `origin: self`. Its purpose and verification are included in the plan. One suitable candidate is an acceptable result.

Before approval, caching is in memory only; afterward, it is in state. Timeouts and partial results are disclosed explicitly. When network access is unavailable, use the host's available authorization mechanism or the gap protocol; previously checked information is not presented as freshly verified.

### 6.2. Keeping Tibicen's own rules current

Live component search is supplemented by a versioned core of quality criteria and procedures. The core stores stable rules and verified agent support information; it is not a catalog of preselected skills.

Each run determines the actual agent and stack versions. It checks task-relevant official guidance and changes in supported capabilities using allowed sources. Researching the entire ecosystem in every session is not required. A recommendation must have a basis and a scope of applicability; “newest” does not mean “most suitable.”

The project manifest records the Tibicen/core version, significant tool versions, checked sources, and check date. An unavailable source, conflicting documents, or an unsupported version becomes a gap with a reason. Available verified information may be used with its date and limitations explicitly stated.

**Product maintenance:** the owner reviews the core and adapters at least monthly and whenever a supported agent or standard has a significant release. Changes to recommendations are checked against representative setup and improvement scenarios, then released as a Tibicen version. The check date and scope are maintained alongside the rules. Updating an installed Tibicen is an explicit user action through the delivery channel (§11), without silent self-replacement.

This is a maintenance process, not a guarantee of perpetual currency. If maintenance stops, an old version cannot be declared consistent with today's practices solely because it can perform live skill searches.

### 6.3. Updating an already configured project

A request to “review and update agent infrastructure” starts the normal improvement scenario. Actual files, saved decisions, versions, and current applicable guidance are compared. New component versions are treated as candidates: replacement requires a clear benefit and verification, not merely a new commit.

User constraints and useful settings are preserved. Unnecessary instructions and outdated components may be removed under the displayed plan. After approval, changes are applied and checked. If everything fits, the result is a verified finding that no changes are needed, with the scope of the check described.

### 6.4. Internal compatibility probes

Compatibility probing is a supplementary quality check, enabled by default. After a skill is installed or replaced, each selected “skill × target agent” pair is checked using a supported headless method. On a repeated run, saved evidence applies only to the same SHA, agent version, and material execution configuration; a different state requires a new probe or `unverified`.

- A skill appearing in a list confirms metadata discovery. For loading, this means `loading: unverified`, with reason `discovered-only`.
- `loading: verified` requires observable evidence that instructions from the pinned SHA were loaded. A file on disk, its path, or a metadata listing does not prove this.
- Record the SHA, agent version, date, method, and evidence, or the reason verification is unavailable.
- If the method requires executing skill commands, explicit trust and approval apply (§10.2). Uncontrolled startup means no launch, with `startup-uncontrolled`.
- Support for a path/format in the agent matrix and confirmed loading of a particular pair are separate results. A probe does not establish behavioral safety or the quality of a working task's solution.
- Cost, authorization, execution configuration, and minimal environment are included in the proposal. If the user disables probes, the manifest records `compat.enabled: false` and `reason: skipped-by-user`.

The normal report only needs a clear result; the detailed table and evidence are available without requiring the user to study them.

## 7. MCP

MCP is connected when it serves a useful project task. By default, the agent recommends the necessary connections and explains their purpose; a menu of alternatives is available on request. Each selected agent uses its target configuration, without an intermediate copy in `.tibicen/`.

1. The proposal includes selected servers, provenance, licenses, versions, launch commands, and environment variable names. Automatic downloading or execution when a configuration is opened also counts as execution and is accounted for before approval.
2. A person supplies secrets outside the repository. Tibicen neither requests nor stores their values. An unsupported way of passing a secret produces a manual step; any required agent restart is disclosed in advance.
3. After approval, the configuration is created or edited selectively: Claude — `.mcp.json`, Cursor — `.cursor/mcp.json`. For Codex, the first release provides a ready-to-use TOML block with its target path and a check of subsequent application; automatic editing of its global configuration is outside v1.
4. Only approved entries in an existing configuration are changed; other servers and settings are preserved. An ambiguous mixed format or inaccessible write area produces a mandatory manual step. Manually pasting fragments is not the normal path for a supported local format.
5. Environment references use the target agent's syntax: Claude — `${VAR}`, Cursor — `${env:VAR}`; Codex uses its supported environment-passing method. Configuration syntax and environment availability in the specific target launch context are checked without exposing values or starting the server as a probe.

With a valid configuration: the variable is available or no key is needed — `configured-unverified`; the variable is missing — `no-key`; availability in the required context has not been established — `env-context-unverified`. Unfinished mandatory manual integration means `manual-action-required`. Checking environment availability in Tibicen does not confirm the environment of another agent that is already running; multiple contexts are considered separately.

Transport in v1 is stdio/local. Remote transport and server health checks are outside the first release. Configuration status is not evidence of MCP server health. Declining an optional connection is recorded as `disabled-by-user` and does not prevent setup from completing.

## 8. Artifacts and change boundaries

| Artifact | Purpose |
|---|---|
| `AGENTS.md` and selected agents' entry points | Short, applicable instructions, commands, and significant project decisions; a `CLAUDE.md` bridge for Claude when needed |
| Rules and skills | Only necessary workflows in supported directories for the target agents; paths and compatibility are recorded for tested versions |
| MCP configurations | Necessary connections for each target agent, without secret values |
| `.tibicen/manifest.yml` | Versions, provenance/SHAs/licenses/hashes, decisions and assumptions, changes, practice sources, results, and session history |
| `.tibicen/report.md` | A report copy saved on explicit request |
| `.tibicen/state/` | Temporary state after approval: build progress, plan, and results; retained for continuation after interruption or `incomplete`, removed after handoff and brief history storage in the manifest for `complete` or `manual-action-required` |
| `~/.tibicen/presets/` and local counter | Personal presets, approved runs, and outcomes; not background telemetry |

**Change scope in an existing project:** instructions and rules for selected agents, selected skill directories, approved MCP entries, and Tibicen service files. The proposal defines the scope through exact paths and diffs. A file being within an infrastructure area does not itself authorize overwriting it.

Approved elements may be added, extended, corrected, replaced, or deleted. User decisions and blocks unaffected by the plan are preserved. Every deletion is shown explicitly with a reason. Duplicates are not created in place of correcting a suitable existing file.

Application source, business logic, data, existing package manifests, CI, and migrations are not rewritten during this setup. A required change outside the infrastructure scope receives an explanation and a ready-to-perform manual step. In an empty directory, new starter files are allowed only under the approved tree (§5).

Before writing, the original hashes of affected files are checked again. A user or another process changing a file after planning stops application and requires a new proposal. Original versions of affected files remain available in a temporary snapshot until application and verification finish. On failure, state, the list of applied changes, and a safe continuation plan are preserved; silently rolling back someone else's changes is prohibited.

`tibicen:begin/end` markers are used in formats that allow comments; other formats use manifest paths and hashes. They establish provenance and help detect accidental divergence, but do not independently protect against coordinated replacement of both a file and its hash. User files without markers may also be changed after explicit approval of the exact diff.

## 9. Presets and the page

A preset is a small decision questionnaire with a strict schema: supported values, source preferences, and relative forbidden paths. It contains no arbitrary instructions or secrets. It helps repeat preferences rather than freeze yesterday's component selection.

- Saving requires a request such as “remember this as preset X,” and uses `~/.tibicen/presets/<name>/`; personal details are removed.
- Applying a preset requires a fresh scan, a check that conditions match, and renewed search and applicability checks. Differences are reflected in the proposal; previous approval does not carry over.
- The static page in v1 explains the two scenarios, provides an install command, and includes a client-side builder that downloads `preset.yaml`. There is no server or account. Builder questions concern tasks and constraints rather than requiring technical choices.
- A library of third-party presets comes after manual review, schema CI, and a blocklist are established. Every preset remains untrusted input and does not bypass the gates.

## 10. Engineering layer

1. **First-party scripts:** Node ≥22.20, zero dependencies, cross-platform, without shell wrappers. Mechanical network operations, hashing, file retrieval, plan application, and fragment preparation are implemented in scripts. First-party read-only code is allowed before approval; writes, state, and the counter come afterward.
2. **Execution:** argv without a shell. Project checks use only the exact approved build/test/lint commands. Dependency installation for an approved new scaffold uses `--ignore-scripts`; `git init`, quizzes, and compatibility probes are separate approved actions. Tibicen creates no commits in either the target repository or temporary repositories: setup, checks, and continuation run without `git commit`, including through invoked commands and agents. migrate/deploy/push/prune are shown only. A worktree or temporary copy is not a sandbox. Tests, MCP, or other third-party code run only after explicit trust in the displayed code, with a minimal environment and no automatically inherited secrets. Without trust, permissions, or a reproducible environment, do not execute; return `unverified` with a reason. Host permissions are not weakened; v1 has no sandbox of its own.
3. **State/resume:** state is created after approval. An interruption before approval requires renewed research. On the next run after interruption or `incomplete`, offer continuation of the original session. State and the manifest are read as proposed data, actual files and hashes are checked, and remaining changes and commands require new approval. Approval is not inherited from state. An unexpected mismatch produces `tamper-suspect`: show the differences and stop automatic continuation, without silent rollback. Expected user edits after `complete` are checked as new input to the improvement scenario; completion of previously issued mandatory manual steps belongs to the original session.
4. **Independent results:** handoff — `complete / manual-action-required / incomplete`; infrastructure — `passed / issues-found / unverified`; project checks — `green / red-fixed / pre-existing-red / unverified`; representative task — `passed / failed / unverified`; quiz — a result out of five questions or `unverified`; MCP and compatibility — as defined in §7 and §6.4. `unverified` includes a reason. `complete` means infrastructure integration, completion of mandatory manual actions, and report handoff, with no known unresolved mandatory integration defects. `manual-action-required` means available automatic actions are finished and mandatory external user actions remain. An internal failure or unresolved mandatory integration defect produces `incomplete`, even when manual actions also remain; the report states the reason, applied changes, and remaining work. The absence of a successful project or behavioral run alone does not determine handoff status; those results and limitations are shown separately.
5. **Verification snapshot:** after approval, an existing project's baseline runs before changes on a snapshot of the actual working tree, including approved staged/unstaged/untracked files and excluding secrets and irrelevant files. The final run uses the same initial snapshot plus all Tibicen changes; a new directory uses the created files. A worktree is allowed if the actual state is carried over without creating commits; a temporary copy is equally valid, and Git is not required to run Tibicen. Contents and exclusions are recorded. An invalid snapshot or environment produces `unverified`, rather than checking a different tree. A new error after changes does not become pre-existing because a run was repeated. `pre-existing-red` is allowed only after an actual comparison with no new errors; an unresolved regression produces `unverified` with its description.

   After manual completion of integration, the original baseline is not replaced with a new one. Confirming the original session's result requires comparable evidence, coverage of mandatory manual changes, and attempt history. If comparison cannot be restored, report `baseline-unavailable`; do not claim first-attempt success or no regressions across the entire integration.

   The manifest preserves the stable original session identifier, brief attempt outcomes, known new errors, and mandatory manual actions with statuses. Continuation is linked to the same session. History is written atomically before state is deleted; failed writing, interruption, or `incomplete` leaves state in place. This does not add full logs, secrets, or permanent snapshots. Brief history does not replace a lost baseline.

6. **Secrets:** determine only the presence and names of required variables; values do not enter context, logs, the repository, or snapshots. Tibicen tokens are passed only to the required network call through the environment, not argv; project runs and MCP do not automatically inherit them. If a valid snapshot cannot be obtained without secrets, skip the check with a reason.
7. **Agent matrix:** `references/agent-matrix.md` contains tested versions, directories, connection methods, and headless methods with startup, authorization, and environment limitations. A changed or unsupported version does not inherit evidence from an older one. A fallback with a reason is defined for an unavailable tool.
8. **Profiles:** infrastructure checks apply to both scenarios regardless of the project's language. Live application execution in v1 uses the web profile; other stacks receive `verify: unverified / unsupported-profile`. This does not remove checks of infrastructure paths, rules, integration, or compatibility. ML/Unity application profiles come later.
9. **Third-party infrastructure:** inventory recognizes the main formats of the three supported agents and several known bootstrap tools. An unknown area is not rewritten based on guesswork: use exact approval of affected files or a manual step. A complete registry of third-party tools comes after release.
10. **Checking real work:** the proposal defines a small representative task and an expected result based on the user's tasks and decisions. In a controlled copy, a new session must find the required instructions and perform the approved work without unapproved actions. In v1, automatic headless execution of the representative task and supplementary quiz is supported only for Claude Code; other agents receive `unverified` with a reason, without substituting a structural check for a behavioral one. Execution configuration, CLI version, files, tools, authorization, and cost are included in the proposal. Hooks, plugins, MCP, settings, and auto-memory outside the plan are not picked up; if this cannot be constrained and verified, skip execution with `startup-uncontrolled`. `claude -p` alone does not provide control. `--bare` is not a universal substitute: it changes instruction loading and authorization. V1 does not add a new mandatory authorization requirement or a sandbox of its own.

    The supplementary quiz checks five questions from the manifest and user decisions; the threshold is ≥4/5. It is not part of verify-pass, does not confirm loading of every skill, and does not prove improved real work. The representative task, quiz, compatibility probes, and project checks have separate results.

11. **Self-test:** L0 consists of strict script checks against recorded search responses. L1 consists of controlled runs for a new directory, an existing project without infrastructure, and a project with conflicting/outdated agent files; it includes a repeated run and an ML fixture without promising application execution. Every attempt must remain read-only before approval, avoid unapproved execution, preserve application code, follow the change plan exactly, and report manual-step statuses correctly. An invariant violation fails the release gate; a later successful repeat does not cancel it. Response quality and result presentation use soft checks, with at most two attempts in total per release-candidate scenario, including the first; this is a separate limit from the repair cycle in §4. L1 assesses sufficient, consistent infrastructure and the approved representative task when execution is available. The release gate is L0 strict + L1 strict invariants + L1 quality criteria.
12. **Measurements:** before telemetry, use a local counter of approved runs and outcomes, plus voluntary manual pilot summaries. There is no persistent event before approval; early refusals are counted only through pilot observation. Future telemetry is opt-in, with stage/status/version/stack-class fields and no missions, repositories, sources, or secrets; it is automatically off in CI, and its receiver and owner must be defined before enabling it.
13. **Incidents:** a published repo/SHA blocklist is checked during installation, repeated runs, and resume. SECURITY.md describes disclosure; advisories and distribution checksums are published through an independent channel. Pinning, hashes, and the scanner are not a code security audit.
14. **Network and filesystem permissions:** Tibicen's own requests are limited to a versioned allowlist of sources: `api.github.com`, selected registries from §6.1, and official documentation sites for supported agents/standards/stacks. The initial documentation set is `agents.md`, `agentskills.io`, `code.claude.com`, `cursor.com`, `developers.openai.com`, and `learn.chatgpt.com`; registry and stack domains are listed explicitly in the core, without wildcards for arbitrary sites. Navigation and redirects do not automatically expand the allowlist. A user-supplied URL does not itself expand permissions: unavailable or disallowed material becomes a gap with an offer to use local material. Expanding the allowlist for a particular session requires explicit approval before making the network request. Supported documentation is available during research within the already allowed list. Writes are limited to approved target-repository paths, the tool's own user-scope skill directory, `~/.tibicen/`, and approved temporary snapshots/state, without escaping through `..`, absolute content paths, or symlinks. This is a policy for first-party scripts, not a sandbox for third-party code (§10.2).

## 11. Delivery

Installation in the developer's user scope: `npx skills add <owner>/tibicen -g`. The release README specifies the tested installer version; bootstrap and updating Tibicen itself are explicit actions requiring trust in the installer. A version pin and checksum identify the installed distribution. The product license is MIT.

Exactly two SKILL.md files: `tibicen-init` and `tibicen-adopt`, with clear triggers such as “set up agent infrastructure” and “review and update agent infrastructure.” Both are available in new and existing projects according to their state and task. Stage instructions are loaded as needed, one at a time; the entire process need not be duplicated in context.

Prerequisites are one supported agent from the three-agent group and Node ≥22.20. Initial installation with the shown `npx skills add … -g` command requires Git; Git is also needed when reusing that delivery method. After installation, Tibicen can work with a project without Git by using a temporary copy for checks. Specific skill paths, versions, and launch behavior are determined by the verified agent matrix, not by a claim of perpetual compatibility.

## 12. Acceptance scenarios

**`А`. New repository.** “Set up a calculation dashboard project, React, all defaults” → scan → one recommended setup and tree → detailed proposal → approval → creation → infrastructure checks, web execution, representative task/quiz/compatibility when controlled execution is available → report and first useful prompt. Unverified checks are explicitly identified; the user does not have to choose a skill from a catalog.

**`Б`. Existing application without infrastructure.** The scan identifies the actual structure and CI commands → the proposal adds the necessary agent files → approval → baseline for a supported profile → integration and verification. Source files, existing package manifests, and CI remain unchanged. Python receives no false green application run: the project check is `unsupported-profile`, with infrastructure results reported separately.

**`В`. Put existing infrastructure in order.** Conflicting rules, duplicates in AGENTS.md, and an outdated skill are found → necessary changes are recommended and useful user constraints preserved → exact diffs and deletion of the duplicate are shown → approval → Tibicen applies the changes itself → integration, comparison with the baseline, and an available representative task are checked. If no supported method of applying changes exists, a manual step is explained; ordinary AGENTS.md editing is not handed back to the user.

**`Г`. Repeated update.** Some time later, the user requests “review and update” → a fresh scan and check of applicable sources/versions → suitable elements are preserved and necessary changes justified. If no changes are needed, files are not rewritten just because the tool ran. New approval covers only the actions actually proposed. Recovery of the original unfinished integration preserves its identifier and attempt history.

**`Д`. Interruption, unfinished work, and a manual step.** A session is interrupted after some changes → state and hashes make it possible to show what was actually applied and what remains → a new plan and approval. A mandatory integration defect remains after two attempts → `incomplete`, with the reason and applied changes in the report, and state preserved; the next run offers continuation of the same session with new approval. If only mandatory external user actions remain, such as supplying a secret or applying a Codex TOML block, the status is `manual-action-required`; after application is checked, integration status is recalculated. A lost baseline produces `baseline-unavailable`, rather than a newly invented first-attempt success. No scenario creates commits, including for snapshot preparation or continuation.

**`Е`. Many similar projects.** The user saves a preset and requests setup with it in a new project. Preferences are prefilled, search and freshness checks run again, and differences are explained. The user neither assembles the toolset from scratch nor blindly carries over old instructions.

## 13. Target product, first release, and implementation order

**Target product:** two simple scenarios — initial setup and improvement/updating — with approved changes applied, understandable result quality, and maintained recommendations.

Separately approved preliminary alpha iterations have an explicit limited scope and do not satisfy the first full MVP's criteria. On 2026-10-27, the owner approved 0.1.0-alpha.1 with Git delivery/update/resume/remove verification; the uncompleted full matrix, human/pilot evaluation, and maintenance readiness remain open.

**The first release includes both scenarios.** In an existing project, it can change approved agent infrastructure files, preserve user decisions, remove explicitly approved unnecessary elements, and recheck the result. V1 includes presets/the builder, current applicable sources, a core version, the manifest/history, MCP stdio, infrastructure checks, and dynamic compatibility probes. Automatic application scopes and execution limitations are explicitly defined in §7–10.

First-release clarification dated 2026-10-22: the nearest release scope includes the first bounded process adapter — OpenSpec, as defined in §6 of the addendum. Connecting it remains a choice for a suitable project, not a mandatory installation for every user. Release acceptance includes setup from scratch, connection to an existing process, and operation in a new session, as well as installation and actual use of a selected additional skill. Spec Kit and other process adapters remain a subsequent extension. The OpenSpec CLI and skills it generates are not included in the Tibicen distribution; installation into the target project is approved separately.

| Stage | Scope | Gate |
|---|---|---|
| Initial setup core | Scan, autopilot, proposal, live selection, provenance, scaffold, manifest/history, infrastructure checks, report | L0 strict; core portions of scenarios `А` and `Б` without MCP/compatibility; read-only before approval and preservation of the existing application |
| Improvement, current guidance, and integrations | Inventory, exact diffs and application, baseline, state/resume, rule sources/versions, MCP, compatibility, and representative task verification | Scenarios `В`, `Г`, `Д`; full `А` with available probes; infrastructure corrected and changes applied consistently with the approved plan |
| Release preparation | Presets and static page, fixtures for the three agents, SECURITY.md/blocklist, documentation, pilot | Scenario `Е`; release gate from §10.11, initial usefulness assessment, and readiness to maintain the rules |

Time estimates are refined after checking selective application methods and controlled headless execution.

**After release:** a reviewed library of third-party presets, additional application verification profiles, a complete registry of third-party bootstrap tools, MCP health checks, telemetry with a defined receiver, enterprise constraints, and mirrors. New agents are added through tested adapters.

**Outside the product:** Tibicen's own skill marketplace, SaaS for these scenarios, accounts, a permanent agent in the project, silent automatic updating of infrastructure or Tibicen itself, and complex interactive browser logins. Updating on request is a core function and is not a silent automatic update.

**Owner decisions:** the limited alpha fixed the repository as `warbr1ng3r/tibicen`, the page as `https://warbr1ng3r.github.io/tibicen/`, and the tested installer as `skills@1.7.4`. Pilot cohort composition and minimum group sizes, and verification and distribution coverage goals remain open. These decisions do not replace quality criteria or change boundaries.

## 14. Usefulness and quality metrics

**Primary evidence of usefulness:** on real projects, compare Tibicen with each participant's usual method — time to the agent's first useful task, the number of necessary user corrections, manual integration effort, and cost. Initial setup and improvement are assessed separately. Technical checks supplement this comparison.

| Metric | What is counted | Limitation |
|---|---|---|
| Completion | Share of started, observed sessions that reach connected infrastructure and `complete` | `incomplete` and `manual-action-required` remain in the denominator without success until completion; outcomes are shown separately, and continuing the same session does not create a second observation or success |
| Manual work | Time and number of actions the user needs to complete setup | Secrets and mandatory external authorization are distinguished from manually assembling files |
| Useful task | Time, user corrections, and outcome of a representative task in a new session | Coverage, agent/version, and skip reasons are published; a quiz does not replace a working task |
| Infrastructure | Share of results meeting the criteria in §3 | Not combined with application test success |
| Verify-pass for a new directory | A green approved application run on the first attempt | Only actual runs of a supported profile |
| Verify-pass for an existing project | No new errors against the original baseline on the first attempt | An actual comparable comparison is required; `pre-existing-red` is allowed |
| Compatibility coverage | Pairs with `loading: verified` and evidence of loading the selected SHA | All selected pairs when probes are enabled; reasons for `unverified` and user-disabled probing are reported separately |
| Quiz | Share of completed quizzes scoring ≥4/5 | A supplementary metric; target ≥80%, with coverage and skip reasons shown alongside |
| Reuse | A second separate project started within 30 days, or repeated improvement of the same project | These are separate metrics; resuming an unfinished session is not a new use |

Before mandatory manual changes, verification is provisional and does not count as verify-pass for the full integration. Attempt history is not reset. Unsupported profiles, runs that did not happen, and unprovable baselines are excluded from their respective denominators, with reasons and proportions; an already known new error does not disappear from the denominator because of a later `unverified` result.

The pilot is a voluntary cohort that manually submits summaries without repository contents or secrets. Stars/issues are supplementary signals. Group sizes and the method for measuring time/corrections are fixed before the pilot; an unknown observation is not treated as a failure.

The review checkpoint is 50 measured sessions or 8 weeks after publication, whichever comes first. Thresholds for the initial hypothesis: completion <40%, the applicable verify-pass <70%, or a second separate project <10% in a mature 30-day cohort are reasons to reconsider the solution. Returning to improve the same project is counted separately. Insufficient data requires a separate decision to recruit/extend the pilot or close it. Product decisions account for measured effort savings rather than substituting the number of passed internal probes for that evidence.

## 15. Risks and limits of the promise

| Risk | Response |
|---|---|
| A recommendation is current but unsuitable | Applicability to the project/versions, sufficient composition, quality criteria, and representative task verification |
| Technical choices make the tool burdensome | One default recommendation, a short summary, and details available before approval |
| A correction affects useful user rules | Exact diff, preservation of decisions, original hashes, and a new plan when state changes |
| Application damage | Limited infrastructure scope, preservation of source/data/manifests/CI, baseline, and strict invariants |
| Prompt injection and dangerous code | Third-party content treated as data, a heuristic scanner, provenance, and explicit trust for execution; no sandbox of its own is promised |
| Files are created but agent work does not improve | Integration checks, a representative task, and separate measurement of time and corrections |
| Rules and adapters become outdated | Assigned maintenance, regular review, dated sources, a core version, and repeated updates on request |
| Documentation or headless execution is unavailable | Gap/`unverified` with a reason; old evidence is not presented as fresh |
| Probes are expensive | Cost is approved, compatibility probes can be disabled, and checks are limited to the task and available environment |
| Manual steps remain | They are visible before approval; if they are the only obstacle to completion, status is `manual-action-required`. An internal failure or unresolved mandatory integration defect means `incomplete` (§10.4). The tool applies ordinary supported infrastructure edits itself |

## Appendix A — Basis for recommendations and sources

Checked while preparing the 2026-10-21 revision; implementation checks applicability against actual versions. These are sources for rules and formats, not a frozen component installation list.

- [OpenAI: rethinking skills and instructions](https://learn.chatgpt.com/blog/rethinking-skills-and-prompts-for-gpt-6-astra): recommendations change with models; unnecessary and conflicting instructions need review.
- [Claude Code: best practices](https://code.claude.com/docs/en/best-practices): short, applicable instructions, limiting unnecessary context, and checking behavior.
- [Agent Skills](https://agentskills.io/home): metadata discovery, instruction loading, and execution are separate stages.
- [OpenAI: skill evaluation](https://developers.openai.com/blog/eval-skills): expected results, actions, and efficiency are assessed separately.
- [skills installer](https://github.com/vercel-labs/skills/blob/main/docs/commands.md): delivery, discovery, checking, and updating components; these operations do not replace assessment of the project's entire infrastructure.
- [Claude MCP](https://code.claude.com/docs/en/mcp#environment-variable-expansion-in-mcpjson) and [Cursor MCP](https://cursor.com/docs/mcp#config-interpolation): different syntax for environment references.

## Appendix B — Data sketches

```yaml
# .tibicen/manifest.yml — illustrative example of improving a Python project
schema: 1
tibicen: { version: "1.0.0", rulesVersion: "1.0.0", built: "2026-10-21", mode: improve, status: complete }
stack: { languages: [python], agents: [claude-code, cursor] }
practices:
  - { source: "https://agentskills.io/home", checkedAt: "2026-10-21", appliesTo: "Agent Skills format" }
installed:
  - name: example-skill
    source: "github.com/owner/repo"
    ref: "<sha>"
    license: MIT
    provenance: provenance-verified
    files: [{ path: ".claude/skills/example-skill/SKILL.md", contentHash: "<sha256>" }]
changes:
  - { path: "AGENTS.md", action: modify, beforeHash: "<sha256-before>", afterHash: "<sha256-after>" }
  - { path: ".claude/skills/example-skill/SKILL.md", action: add, beforeHash: null, afterHash: "<sha256>" }
assumptions:
  A1: { text: "A minimal process is sufficient", status: user-confirmed }
gaps: []
rejected: []
mcp: []
checks:
  infrastructure: passed
  verify: unverified
  reason: unsupported-profile
  firstAttempt: null  # no project run took place
  task: unverified
  taskReason: startup-uncontrolled
quiz: { status: unverified, reason: startup-uncontrolled }
sessions:
  - id: "<исходный-session-id>"
    attempts: [{ number: 1, kind: infrastructure, outcome: passed, newRegressions: [] }]
    manualActions: []  # mandatory actions with identifiers and pending/done statuses
compat:
  enabled: true
  pairs:
    - { skill: example-skill, ref: "<sha>", agent: claude-code, agentVersion: "<tested>", pathFormat: supported,
        method: headless-discovery-list, date: "2026-10-21", loading: unverified, reason: discovered-only }
    - { skill: example-skill, ref: "<sha>", agent: cursor, agentVersion: "<tested>", pathFormat: supported,
        loading: unverified, reason: startup-uncontrolled }
# loading: verified is allowed only with evidence that instructions from the selected SHA were loaded.
# complete confirms integration; limitations of project and behavioral checks are reported separately.
```

```yaml
# ~/.tibicen/presets/hackathon/preset.yaml
schema: 1
name: hackathon
stack_hint: { language: python, kind: experiment }
answers:
  process: minimal
  style: concise
  forbidden_paths: [data/raw, secrets/]
preferred_sources: []  # a preference for a fresh search, not installation permission
```

Interview dimensions, exact schemas, and default rules are versioned in the core. Stage files: `stage-scan.md`, `stage-inventory.md`, `stage-interview.md`, `stage-product-arch.md`, `stage-agent-arch.md`, `stage-proposal.md`, `stage-build.md`, `stage-verify.md`, `stage-handoff.md`.
