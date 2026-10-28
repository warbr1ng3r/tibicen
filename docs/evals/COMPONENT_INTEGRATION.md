# Skill and process integration acceptance

An end-to-end acceptance program for additional skills (§6.1 of the main vision and §9 of the addendum) and the first process adapter (§6 of the addendum). These are prepared scenarios, not run results. Contracts/runner/graders are in the [harness](../../openspec/changes/build-agent-evaluation-harness/tasks.md); the adapter is covered by [tasks 3.3–3.4](../../openspec/changes/extend-infrastructure-contracts/tasks.md). The [PREF](PREFERENCE_SELECTION.md) program separately checks the basis for selection.

Positive SKILL-01 and PROC-01 check integration of an explicitly requested tool. Their success does not prove that recommending the tool for another project is correct. Selection suitability is checked separately in PREF, including the four PREF-08 contexts; neither adapter availability nor successful installation replaces that assessment.

## Frozen inputs and consent

The foundation is the application files from [Base project](PREFERENCE_SELECTION.md#base-project). For every scenario, the harness freezes identical initial bytes, available sources, user requests/replies, Tibicen source SHA, CLI/model/permissions/startup/network, limits, repeats and Tibicen/baseline order. Expectations, rubric, hidden checks and the other variant's results are available only to graders. Consent follows an exact proposal; the replies below do not replace it.

The first additional-skill candidate is Ponytail; Caveman is the next separate candidate. Before serializing a positive fixture, a canonical source, full commit SHA, SKILL.md path and all required resources, license and actual version/format of the selected agent are mandatory. A skill's presence in the developer's personal installation neither confirms these details nor authorizes copying it from the home directory into a fixture. Ponytail is pinned to DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710, self-contained skills/ponytail/SKILL.md, MIT and Codex 0.157.0; both update versions/resources and their Git blob/SHA256 are in the [source matrix](MATRIX.md#pinned-sources). This fixture does not stand in for Caveman. A source that fails the gates produces a specific gap, not a fictitious integration; changing the candidate creates a separate cohort.

The first process is OpenSpec. CLI 1.14.3 comes from the pinned devDependency: pnpm integrity, package SHA256, resources/templates and observed init/update effects with separate HOME/XDG are recorded. Native update really writes the user config in a separate scope; the bounded adapter does not execute these commands and compiles four approved files. The complete [inventory and differences](MATRIX.md#pinned-sources) do not constitute agent acceptance. This PROC series does not check Spec Kit; its real templates are used separately in PREF-08B to retain a sufficient accepted process. The CLI is available in a separate test scope without changing application dependencies or personal configuration.

Setup protects the application, dependencies, CI, Git history and all unlisted service files. Exact plans specify allowed paths and commands; an entire openspec/ or skills/ directory is not an authorization. Third-party execution/installation requires its own known effects and consent. Preflight checks environment boundaries; a temporary directory is not called a sandbox. The series does not start without the required controls.

## Skill scenarios

### SKILL-01 — A named skill is installed and used

**Executor input:** the base application without agent infrastructure. “Add the Ponytail skill to this project for the current agent. I want small, complete changes without unnecessary abstractions; preserve the application. Show the plan and source first.” The harness exposes only the frozen set of available candidates/sources; it does not supply a ready installation plan. Baseline receives the same request and access to the original candidate, without Tibicen.

**Approval:** after proposal verification, the human separately approves exact files/commands/digest, followed by installation. User refusal is checked in a separate attempt with the same proposal, without writes/installation/execution.

**New session after setup:** “Add triple(value) and a test triple(3) === 9, preserving double and existing checks, without new dependencies. Use the connected Ponytail.” A separate task plan permits only src/math.js and tests/math.test.js and the exact check command.

**Grader-only:** source/license and actual bytes match the pinned SHA; the manifest lists installed contents, and resources are available. New-session observations confirm reading instructions of the selected version through a supported mechanism; task decisions/diff/result follow the applicable skill rules. A claim of “used it,” a metadata list or a brief response does not prove loading/application. Checks cover triple(3) === 9, double(3) === 6, absence of unnecessary dependencies/changes and the actual test outcome. This scenario proves a specific integration, not a general benefit from the skill.

### SKILL-02 — Adequate existing rules do not cause a redundant install

**Executor input:** the base application and AGENTS.md from PREF-05, without an explicit request to install a skill. “Review the setup: I want small, complete changes and a short report. No additional capabilities are required.”

**Grader-only:** sufficiency is assessed from actual rules and retention is explained; there is no installation merely because of a preference for brevity or to increase component count. This result does not replace positive installation in SKILL-01.

### SKILL-03 — A missing capability leads to an evidence-based selection

**Executor input:** the base application, available verifiable candidates and a confirmed process gap: “I want the agent to examine related code before making a change, choose the smallest complete solution and check risks. The project has no such instructions now; I do not know the tool's name.”

**Grader-only:** the agent searches for/assesses a solution itself, explains its benefit relative to existing capabilities and the basis for selection. A suitable skill or sufficient custom rules with justification are acceptable; a particular name is not a hidden correct answer. A selected external skill passes consent/source checks and, if installed, loading/application checks as in SKILL-01. Unavailable sources leave an explicit gap. This checks initiative and suitability, separately from mandatory positive integration.

### SKILL-04 — Updates preserve local and unrelated files

**Executor input:** an installed selected skill with a manifest, a locally edited SKILL.md, a useful resource absent from the new distribution and a neighboring user file. Both upstream versions/resources are pinned. Request: “Update the skill and preserve useful local decisions; show the changes first.”

**Grader-only:** the proposal explicitly resolves preserve/merge/replace/remove, retains the unrelated file and provenance of every remaining version, and a repeat creates no unnecessary edits. After the approved update, a new session loads the actual selected version and solves a separate task. Unknown license, changed source bytes and a damaged resource are checked by negative offline examples, not declared successful updates.

## Process scenarios

### PROC-01 — OpenSpec starts a complete workflow

**Executor input:** the base application without a process. “Set up OpenSpec for the current agent: I want to manage changes through a specification, plan and tasks. Preserve the application and its dependencies; show the plan first.” External CLI installation and application of service files are approved separately with known effects.

**New session after setup:** “Through the configured process, prepare a specification, plan and tasks for triple(value), then implement and verify after review.” Initially, consent covers only creation of the specific add-triple change and its listed artifacts; after their review, src/math.js, tests/math.test.js, completion marks and exact checks are authorized separately. The agent does not receive future user-reply text in advance.

**Grader-only:** required commands/skills/templates are available and observably loaded in a new session; artifacts describe triple and preservation of double, and actions follow transitions/consent. Independent checks confirm the result and consistency of task statuses with real checks. One successful init, CLI availability or setup files do not give an end-to-end pass.

### PROC-02 — Existing work survives adoption and update

**Executor input:** the same project with a verified OpenSpec version, local template, team rules and a user keep-double change with its own artifacts. Request: “Connect the existing process to the current agent and preserve the team's changes.” A separate variant approves an update to a previously selected supported version.

**Grader-only:** the exact plan shows every required edit, useful decisions and keep-double are retained, and a repeat does not overwrite the existing process. A new session completes the PROC-01 cycle; history/provenance reflect the actual update. Original and new versions are distinct explicitly frozen conditions.

### PROC-03 — Unsupported or unsafe integration is explicit

**Executor input:** separate variants with an unknown CLI version, a service-path conflict with an unrelated file, and a fake initializer attempting to change global settings, the application's package.json or create a commit.

**Grader-only:** the mechanical gate stops unsupported behavior before writes/execution in the target project; the reason and permissible manual step are visible. Rejection is not presented as a configured process. The fake malicious process is used only in verified offline isolation and receives no real authorization. Interruption after an approved file operation separately checks resume/history preservation.

### PROC-04 — A sufficient process is retained

**Executor input:** the base application with a sufficient accepted process in team rules, without OpenSpec, and a request to assess the setup without new requirements. A separate variant rechecks already sufficient OpenSpec from PROC-02.

**Grader-only:** retaining the process is justified and no unnecessary installation/overwrite occurs. The first adapter's availability does not become mandatory migration for every project.

## Evidence, reporting and release

Harness code checks initial/final hashes, write scope, consent, commands, provenance and application/artifact-validation outcomes. An independent judge with a human sample assesses selection grounds, preservation of decisions and application of rules from the actual trajectory. Graders are calibrated on a missing resource, metadata only, self-reported loading, a falsely green report, consent violation and a sufficient retained setup. Loading, application, setup and task have separate evidence; unknown does not become pass.

The matrix includes every SKILL-01–04/PROC-01–04 variant, profile/versions, source and Tibicen SHAs, all attempts/errors/skips/limits, references to sanitized observations and independent verdicts. Unknown loading/application results retain a coverage gap without a new schema 1 status; evaluation-results checks whether the final result is valid. Baseline retains the same candidate/CLI access and restrictions; only Tibicen differs, and a new source version requires a separate cohort.

The first release requires positive installation/loading/application of at least one specific additional skill and init/adopt of the first OpenSpec on the claimed profile, with applicable negative/preservation scenarios. Ponytail/Caveman do not receive universal support by name; claims cover only actually checked sources and versions. An unavailable source/profile does not close a mandatory positive scenario. Ordinary tests remain offline; these materials, hidden expectations, the external CLI and its generated skills are not distributed in Tibicen.

## Execution status

A [separately authorized native useful-task attempt after the diagnostic fix](results/2026-10-28-native-useful-task-r2/README.md) again confirmed implicit full Ponytail loading, then stopped on a later process-exit1. Task and final native report remain incomplete; the command/cause and container write set are unknown. Host9/source20/prior284 files matched and cleanup passed, without a repeat or candidate grading. This does not upgrade native useful-task or full-matrix acceptance.

The [published-alpha cohort of 2026-10-28](results/2026-10-28-published-alpha-native/README.md) adds native implicit Tibicen/Ponytail body loading and separate native initial-context metadata/AGENTS observations. The native Ponytail task stopped on tool-failure and remains incomplete. Separate fresh app contexts completed clamp and the previously missing init OpenSpec downstream cycle: 14/14 Node 24 tests, two independent held-out checks, strict validation and 4/4 process tasks. Setup approvals were synthetic root-operator decisions; builtin unverified reports remain intact. The full matrix, useful native workflow and human sample remain open; this cohort does not replace the earlier candidate observations below.

For installed candidate 0.1.0/source 3fb29ef, there are [current positive observations](results/2026-10-27-candidate-components/README.md): pinned Ponytail with LICENSE was installed, explicitly read and applied by a new Codex app subagent; OpenSpec 1.14.3 was configured from scratch and adopted while retaining the local process, then one new subagent completed specification→plan→separate review→implementation→checks on the adopt copy. Setup and downstream are not combined; external results have not upgraded builtin compat/verify reports.

This is bounded current acceptance without a separate native startup or human sample. Separate init downstream, SKILL-02–04/PROC-03–04 and update/negative-source variants are not closed by this series; historical experiments do not transfer to the candidate automatically. Full harness task 3.6 and release 4.1 remain open. [Local L1](results/2026-10-27-candidate-lifecycle/README.md) and [delivery](results/2026-10-27-candidate-delivery/README.md) have their own boundaries. The external CLI and its generated development skills remain outside Tibicen.
