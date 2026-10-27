# Tibicen development plan

**Revision: 2026-10-27.** This plan is based on the [main product vision](PRODUCT_VISION.md) and the [2026-10-22 addendum](PRODUCT_VISION_ADDENDUM.md). Addendum §§1–3, 7 and 9 clarify the first release obligations. The immediate scope explicitly includes the first OpenSpec process adapter from §6 and end-to-end acceptance of installing/using an additional skill. Sections 4–5 and 8, Spec Kit and the remaining process adapters remain future development.

Product documents define expected behavior. This plan defines order, dependencies, responsibility and transition criteria. Detailed requirements, scenarios and tasks live in OpenSpec; a specification link does not establish implementation readiness. Unresolved differences between documents are recorded explicitly, not turned into a new feature by inference.

## Current state and next step

The limited [0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) and [landing page](https://warbr1ng3r.github.io/tibicen/) were published on 2026-10-27. Public source `e0f59a5`, distribution/tag `db03ebc`; clean local gate 668/668, independent ponytail-review, Ubuntu CI and Pages passed. Actual installations by SHA/tag, transition from the earlier local 0.1.0, same-session resume, unknown-schema refusal and removal were confirmed for the limited macOS/Node 24/Codex scope. [Evidence](evals/results/2026-10-27-alpha-release/README.md).

**The first full MVP remains open.** In prepare-first-public-release, alpha group 5 is complete at 5/5; original groups 1–4 are at 6/14. The source snapshot was published separately from private development history; the original local history is preserved. Alpha observations do not establish coverage of every agent or OS, or user benefit.

| Next stage | Required work | Canonical tasks |
|---|---|---|
| Development speed | Remove duplicate push/PR runs and repeated CI builds; separate heavy harness integration according to verified dependencies. Remove concrete duplication while preserving checks of risky operations | CI speed analysis; optimizations are not yet implemented |
| Full MVP acceptance | Complete L1/PREF/SKILL/PROC and fresh native loading/human checks; OpenSpec criteria apply to requests selecting that component | [Core contracts](../openspec/changes/extend-infrastructure-contracts/tasks.md), [agent acceptance](../openspec/changes/build-agent-evaluation-harness/tasks.md) |
| Pilot and maintenance | Owner, private contacts/advisory channel, voluntary projects and benefit measurements | [Release groups 3–4](../openspec/changes/prepare-first-public-release/tasks.md) |

CI speed analysis: the same source SHA passed a branch push in 158s and a PR in 157s, including 121s for the full offline gate and 13s for a repeated build. Of 668 checks, 381 belong to the eval harness; 28 protocol modes repeatedly copy/build a fixture. Remove repeated work first, then decide the composition of separate gates. This is a proposal, not an implemented optimization.

ZCode/Codex SDK/OAuth research and paid API work do not block the published alpha. The full pilot and its 50-session/8-week checkpoint remain a separate program; missing data is not success.

### Historical implementation and acceptance stages

The following results and limits retain the state of their respective stages. Earlier statements that publication, Git delivery or remote CI had not run do not override the confirmed limited alpha above.

**Owner priority of 2026-10-25 — simplify the architecture and close technical debt first.** Refactoring completed locally: the map (maintainer-local record; omitted from public source), analysis (maintainer-local record; omitted from public source) and [simplification tasks](../openspec/changes/simplify-core-and-evaluation-workflows/tasks.md) retain evidence. The current effort is Codex and ZCode control (maintainer-local record; omitted from public source); the ticket dashboard (maintainer-local record; omitted from public source) shows concurrent assignments and dependencies. The product scope and release gates below remain in force.

**Order at that stage:** direct init/adopt in Codex (maintainer-local record; omitted from public source) completed: status/report complete, structural verify passed, four external Node tests before/after. Source files and the user section were preserved; the agent refined its check command through a separate approved application. The next run is in ZCode itself: a separate branch and assignment (maintainer-local record; omitted from public source) are prepared; the owner's run is not yet confirmed. The ZCode SDK/OAuth branch is deferred. The container harness passed synthetic checks and 660 tests, but a separate headless subscription attempt stopped before proposal/tool-failure; its outcome was retained, and repairing the harness does not block direct product scenarios.

| Area | Confirmed state | Still unconfirmed |
|---|---|---|
| Original core and refinements | П0–П8 implemented locally; mechanical guarantees 2.1–2.4 and bounded OpenSpec adapter 3.3 checked in [extend-infrastructure-contracts](../openspec/changes/extend-infrastructure-contracts/tasks.md) | Live PROC acceptance 3.4, final core acceptance and future extensions remain open |
| Preferences and selection §9 | Instructions, visible assumptions and their mechanical transfer checked; PREF-01–08 program prepared in [infer-preferences-for-component-selection](../openspec/changes/infer-preferences-for-component-selection/tasks.md) | Semantic selection quality, including PREF-08, is established separately by the harness |
| Harness and real agents | [build-agent-evaluation-harness](../openspec/changes/build-agent-evaluation-harness/tasks.md) checked 67 fixtures, offline runner/storage/graders/reports and Codex preflight. The first corrected diagnostic (maintainer-local record; omitted from public source) produced 4/4 observed setup/task passes. The SKILL/PREF/PROC continuation (maintainer-local record; omitted from public source) retained 60 slots/62 executor sessions and eight independent model reviews | The continuation did not pass acceptance: one full mechanical pass, 47 routing errors, five timeouts, no human cross-checks. Full semantic acceptance of SKILL, PROC and PREF coverage, other native profiles and common API/subscription route 3.7 remain open |
| Delivery | Both skills were installed with the pinned installer into a separate user scope and run outside source with no Git in PATH; single-source product versioning completed in [prepare-first-public-release 1.1](../openspec/changes/prepare-first-public-release/tasks.md) | Public delivery route, installed-version updates and claimed platforms require acceptance |
| Landing page | Astro workspace, logo, graph, local preset and custom fields checked locally; 59 browser tests passed, one expected skip | Physical devices, all operating systems and historical browser versions, public hosting |
| Current simplification | All four batches accepted, original map 11/11, OpenSpec with review fixes 13/13: core batch acceptance 585/585, last full gate after review 667/667; both unpacked CLIs and 84 checksums passed; historical browser gate 59 passed / 1 expected skip; [evidence](../openspec/changes/simplify-core-and-evaluation-workflows/verification.md) | Remote CI had not run; this acceptance does not close live/release obligations |
| First public release | README, MIT, SECURITY, local build and checksums exist; [release tasks](../openspec/changes/prepare-first-public-release/tasks.md) remain | Full acceptance, pilot, CI/release process, owners and publication channels are not ready |

**The main flow through handoff was confirmed on two typical requests:** initial setup and improvement (maintainer-local record; omitted from public source) finished `complete` in four real Codex sessions. Two CLI report gaps were fixed: the list of applied paths and the retained stop reason; legacy manifests were preserved. Criteria follow the request: selected OpenSpec or other component integration is checked as part of that setup, and a separate downstream task is not added to an unrelated case. Subsequent checks target gaps in requested configurations; the full semantic/human/release matrix remains open. An OpenRouter-like API awaits a separate route/key location/budget. The dashboard (maintainer-local record; omitted from public source) stores actual results.

**The practical batch completed with limits:** results (maintainer-local record; omitted from public source) retain the lifecycle pass and setup of a real Astro project: Codex prepared the plan, and root independently reviewed it and completed the flow without another model call. External build/13 tests passed before/after; the project's own verify remains unverified because of the dependency environment. The frozen model case was not upgraded after the host falsely rejected a scan with a relative root. Native ZCode stopped on a generic SDK error before tools; the cause is unknown and pass is unconfirmed. A later batch below closed this historical gap; the original outcomes and limits of this run were preserved.


**The reproducible-checks batch completed locally:** facts (maintainer-local record; omitted from public source). The real landing's own public CLI report became green after baseline/final build and 13 tests with approved local dependencies; the original was retained. A repeat after simplifying copying also passed; observed apply time fell from 179 to 85s. Review findings for PATH/Node runtime mismatch and OpenSSL startup loader escape were fixed. Safe ZCode SDK diagnostics were confirmed offline; the historical provider cause is unknown. The full native backend is not yet available: production routes fail closed before CLI/auth/model, and only a bounded macOS Node boundary was checked. No new live/API runs occurred in this batch.

**The containment and ZCode batches completed with limits:** facts (maintainer-local record; omitted from public source). The new host passed offline SDK tools, guards and review; one subscription session stopped before tools with prepare/unknown, without a repeat. The original profile is unchanged. Codex uses the already available Docker Desktop and standard stdio executor; four lifecycle canaries passed, but production remains blocked. Paid API calls and new commits in batches 26–27 — 0.

**The container backend was implemented and checked offline:** facts (maintainer-local record; omitted from public source), [OpenSpec](../openspec/changes/containerize-native-evaluation-execution/tasks.md). Five image lifecycle and seven session cases passed; the real host Codex performed shell/native patch through synthetic transport, host sentinels were preserved, and the CID and attach client terminated. ZCode prepare was analyzed through 17 synthetic cases; the historical cause is unknown. The next queue is backend integration with the native caller, including project/MCP policy, and precise diagnosis of the new private ZCode host. Real auth/model/API calls in batch 28 — 0; the production profile remains blocked.

**The native caller was connected in a narrow scope:** batch 29 (maintainer-local record; omitted from public source), [OpenSpec](../openspec/changes/connect-contained-codex-profile/tasks.md). Fresh image/source/config gates, host-only access-only auth, shell/native patch and first-failure cleanup were checked, 639/639. One separate subscribed Codex host session errored before tools after 7.429s; cause/HTTP/inference unknown, no repeats. The new ZCode diagnostic host passed 12+12 checks and bundled-pin regression/review, live 0. Next: safe model-free Codex classification and preparation of a separate ZCode host/protocol; general acceptance/mass runs are not yet open. Product core/dist and Git history did not change.

**Code Mode was connected and checked:** batch 30 (maintainer-local record; omitted from public source). The fresh subscription catalog contains only code_mode_only models. The actual V8 companion and unmodified public caller performed shell/native patch in the container while preserving host/source and completing cleanup; official gpt-6-astra metadata is unchanged. Codex safe terminal diagnostics passed review and synthetic gates. ZCode diagnostic r1 stopped before credential store/HTTP/model on a confirmed builtin pin mismatch; new r2 distinguishes profile configuration from the SDK bundle and passes offline gates. One fresh subscribed Codex control passed native patch/tests and an independent oracle in 24.194s; ZCode r2 passed 17 preflight checks and stopped at header-refresh before tools. The next milestone is connecting the verified Codex route to multi-phase scenarios and analyzing ZCode header/auth composition offline; overall acceptance remains open.

The last full gate after review was **667/667 tests**; lint/format/types/build/strict specs and independent code review passed. The last build had 86 files; both unpacked CLI self-tests and a new environment apply→report with empty PATH passed. The preceding review/fix/commit f8fa46b was created at the owner's request; batch 25 underwent another review/fix before local recording. Inherited environment bypass, a signal to the supervisor and an incorrect reason for a snapshot without an environment were found and fixed; report (maintainer-local record; omitted from public source). [Ponytail-review](../openspec/changes/simplify-core-and-evaluation-workflows/review.md) found three P2 issues; fixes passed re-review and unpacked smoke; local commit `6fd6cb5` was made at the owner's request. The previous planning pair (maintainer-local record; omitted from public source) used 3/16 executors and 0 new judges/startups: Tibicen setup timeout, baseline explicit model capacity, both tasks skipped. The new planning gate was not reached; partial canonical apply was not upgraded to setup pass. After trace-only diagnosis (maintainer-local record; omitted from public source), the prepared apply invocation was accepted offline; its timing effect has not yet been measured. The subsequent separate control and its errors are recorded above; historical outcomes did not change.

The previous PROC pair (maintainer-local record; omitted from public source) retains T's full observed workflow and 7/7 model criteria on the earlier snapshot; baseline ERROR is limited by an implicit design requirement. The earlier 20 executors/2 judges and their scores were retained separately and do not transfer to the new runtime. Human reviews — 0.

Earlier, the canonical-plan control (maintainer-local record; omitted from public source) produced observed setup/task passes in SKILL-01 and PREF-01 for both variants. Product [source-check](../openspec/changes/expose-pinned-source-validation/tasks.md) completed 4/4; the new SKILL pair (maintainer-local record; omitted from public source) also passed for both variants. In one Tibicen run, terminal events fell from 72 to 42; this is a single observation, not evidence of sustained speed improvement. Quality/human review of these cohorts remains open.

Executors are **Codex and ZCode through existing subscriptions**. Codex 0.157.0/gpt-6-astra was confirmed in new successful runs; earlier gpt-6-sol cohorts were retained separately. ZCode public bootstrap source 0.17.0 performs offline native tools; one live GLM-5.3 low/subscription run ended in an SDK error before tools. Installed CLI 0.16.9 did not change; the full native profile and Tibicen installation within it are unconfirmed. Claude Code/API is next, after a separate monetary budget. [Profile conditions](evals/NATIVE_RUNS.md#profiles).

| Batch | Result | Transition criterion |
|---|---|---|
| 1. Prepare profiles and cases | Three parallel areas: Codex, ZCode, short control series | Exact CLI/model/auth, verified boundaries and sources, or reproducible blocked outcome |
| 2. Bounded control | Separate SKILL → PREF → PROC pairs within subscriptions | Expand only after checking the previous pair; retain refusals |
| 3. Subsequent fixes | Analyze observations and define concrete product/harness tasks | Separate environment failures from product defects; full task 3.6 remains open |

This summary is the entry point at this stage; the queue sections below describe dependencies and criteria, while historical program П0–П10 preserves the original decomposition. Detailed execution and evidence remain in the corresponding OpenSpec change's tasks/verification. `openspec status` shows document readiness; it does not replace task execution. Archives marked retrospective are reconstructed records, not proof of prior approval or execution. Earlier test counts do not establish new requirements.

Development and installation commands are in [README](../README.md) and [package.json](../package.json); browser-check limits are in the [landing README](../landing/README.md). A site build is not required to install the skills.

## Unified work queue

The first-release requirements below describe the full MVP. The published limited alpha above does not complete or remove those requirements.

The first milestone is a verified first release with core refinements, the first OpenSpec adapter and observed installation/use of an additional skill. The second milestone is the remaining process adapters and portable setup. Release awaits the bounded queue 1а, not the entire future program 6–9.

| Queue | Result | Dependencies and transition criterion |
|---|---|---|
| 0. Landing page | Already implemented and checked introduction/installation path | Closed locally; revisit for a defect or a change in actual delivery |
| 1. Core refinements | Preservation, updates, recovery, shared rule editions across tools and justified preference-based selection | Based on П0–П8; fix-audit-safety-and-verification checked mechanically; acceptance of §§1–3, 7 and transfer of §9 assumptions remains required; semantic §9 scenarios belong to queues 2–3 |
| 1а. First process adapter | Optional OpenSpec init/adopt with exact effects and preservation of the user's process | After queue 1's mechanical guarantees; development runs alongside the harness, final acceptance is in queue 3; core change tasks 3.3–3.4 |
| 2. Harness and metrics | Verifiable scenarios, graders, execution and reporting | Runs alongside queue 1 after format agreement; the harness itself is checked on known successful/unsuccessful outcomes |
| 3. Real agents | Observed setup, additional skill, OpenSpec and next-task outcomes | First two scenarios after 1 and 2; process scenarios after 1а; the release series includes every mandatory group at a specific SHA |
| 4. Delivery and currency | Clean installation, safe update and maintained rules | Preparation runs alongside 1–3; readiness requires checking the modified core and actual distribution bytes |
| 5. OSS, pilot and first release | Reproducible candidate, initial benefit measurement and ready maintenance | CI/documents prepared alongside 1–4; public release after acceptance of 1–4 and the private pilot |
| 6. Composite sources | Provenance of each material and complete delivery | Next product cycle after first-release acceptance; foundation for extended adapters |
| 7. Context map | Clear relationships between entry point, rules, skills and references | May run alongside 6 on agreed metadata; the map is distinct from evidence of loading |
| 8. Additional process frameworks | Adapters beyond the first OpenSpec for observed cases and gaps, such as an adopted Spec Kit | After the required results of 6–7 and justification of benefit/cost; each adapter has separate integration acceptance in a fresh session |
| 9. Portable setup | Versioned declarative set for different projects | After 6–8 and schema definition; applicability, conflicts, deviations and export checked |

A queue expresses a dependency of the result, not a ban on preparing independent documents and fixtures earlier. An experimental run may expose defects before queue 1 finishes; its results are not final acceptance of the corrected version. Moving to a new SHA requires repeating affected scenarios without resetting the history of previous attempts.

### 1. Refine the existing core

Basis: addendum §§1–3, 7 and 9, main contract §§3, 5, 6.1, 6.3, 8, 10.3–7. This checks and improves functionality already promised. First map code and instructions to requirements and identify concrete gaps; do not rewrite implemented parts without a reason.

| Area | Verified result | Owner |
|---|---|---|
| Managed blocks | Distinct version, unambiguous parsing, add/change/remove without needless replacement; untouched bytes and line endings preserved | Integrator, checks executor |
| Component update | Compare the previous distribution, actual files and new version; do not claim unrelated files; represent local edits and removed resources in plan/manifest | Sources + integrator |
| Recovery | Recognize failure between a file write and result recording through three states; a matching file does not prove command execution; preserve the original session | Integrator, checks executor |
| Multiple tools | Two selected agents receive consistent rule editions; updates find stale copies through a verifiable link | Integrations + workflow |
| Preferences and selection | Available evidence is visible as assumptions; explicit choice takes precedence; sufficient rules remain, a useful gap prompts proactive discovery | Workflow + sources; semantic acceptance by the harness |

Detailed preservation tasks are in [OpenSpec group 2](../openspec/changes/extend-infrastructure-contracts/tasks.md#2-existing-lifecycle-guarantees); preference/selection tasks are in the [separate §9 change](../openspec/changes/infer-preferences-for-component-selection/tasks.md). §9 connects available evidence, visible assumptions and the recommendation to an assessment of whether the current setup is sufficient; the user's explicit decision takes precedence, and inference does not replace consent. Manifest/state changes have an explicit version and compatibility checks against existing data; old data does not automatically acquire new guarantees. Mechanical checks are supplemented by observations in fresh sessions in queue 3. Orchestration, task allocation and concurrent execution of an agent team are not added to the product.

**Transition criterion:** mechanical preservation scenarios pass; untouched areas are compared, and write errors or ambiguity do not become false success. Transfer of §9 evidence and assumptions is checked; semantic selection quality is accepted in queue 3.

### 1а. First process adapter

The first process adapter is limited to OpenSpec: a known external CLI version, exact support paths and init/update effects, an approved plan, preservation of the existing process and a check in a fresh session. The CLI is installed separately; OpenSpec and its generated skills are not bundled inside Tibicen. Unknown version, file conflict or uncontrolled initializer produces an explicit refusal/manual step. Materials needed for this adapter are checked, but a general composite-delivery format and portable manifest are not prerequisites.

Detailed work is in [tasks 3.3–3.4](../openspec/changes/extend-infrastructure-contracts/tasks.md); acceptance scenarios are in [SKILL/PROC](evals/COMPONENT_INTEGRATION.md). **Transition criterion:** observed init/adopt and a fresh agent session's working cycle supplement mechanical checks.

### 2. Evaluation harness and metrics

Basis: main vision §10.11–12 and §14, and the external-trial program in §6.1 below. The execution contract is in [RUNNER](evals/RUNNER.md), case composition and pinned sources in the [matrix](evals/MATRIX.md). [Observation boundaries](evals/OBSERVATIONS_AND_GRADERS.md) and the [rubric and paired report](evals/QUALITY_AND_REPORTS.md) separate mechanical facts from semantic assessment. The [explicit external entry point](evals/EXTERNAL_RUNS.md) works only with a selected trusted host driver.

First establish scenario/event/result formats and profile/grader interfaces. Then implement execution with timeouts and process-tree termination, checks of malformed output and authorization refusal, storage of sanitized observations and comparable reports. Code grades verifiable facts; an independent judge grades relevance using the specified rubric, with sampled human cross-checks. Graders are tested on known good and bad results before model calls.

The program includes main-vision scenarios А–Е and queue 1 refinement checks, including [PREF-01–08 for §9](evals/PREFERENCE_SELECTION.md): evidence from instructions/dialogue, explicit clarification, absent evidence, sufficient setup, material conflict, a useful gap and suitability of choices across different contexts of one request. Each fixture predefines its input, user-response/approval rules, permitted changes and independent expected result; a ready-made plan or hidden check is not given to the agent. Normal `pnpm test` stays offline. The harness/external-trial contract is [agent-evaluation-harness](../openspec/changes/build-agent-evaluation-harness/specs/agent-evaluation-harness/spec.md); detailed work is in [tasks](../openspec/changes/build-agent-evaluation-harness/tasks.md).

Experiment metrics: setup among observably started attempts; task among completed setups; end-to-end success among all started attempts. Numerator, denominator, coverage, startup errors and skips remain visible; a limit reached after startup does not remove the attempt from the summary. Product completion/verify-pass, manual effort and reuse retain the definitions in §14 rather than being replaced by these fractions.

The separate [SKILL-01–04 and PROC-01–04 program](evals/COMPONENT_INTEGRATION.md) checks a specific additional skill (Ponytail first, Caveman next), its loading/use and the first OpenSpec process. PREF assesses the justification for selection; SKILL and PROC require their own observed outcome and are not completed by a recommendation alone.

**Transition criterion:** the harness correctly distinguishes pass/fail/error/skip and refusals before/after startup, preserves repeat attempts and does not call missing evidence a success. Its green tests do not establish Tibicen's readiness.

### 3. Trials with real agents

An API key is the primary planned authorization route for each target native profile; an existing subscription is a separate cost-saving alternative. Authorization, provider and model are fixed in each cohort's conditions; capabilities do not transfer between schemes. Subscription use does not authorize additional spending; API calls stay disabled until a monetary budget is assigned separately. API/subscription generalization and verification of available routes belong to harness task 3.7.

The first diagnostic stage is two paired Codex scenarios: an application without infrastructure and a project with conflicting instructions. Each has variants with and without Tibicen, followed by a useful task in a separate fresh session. This is four scenario runs with two stages each; loading probes/judges are counted additionally. Repeats, variant order and budget are fixed before the series. Diagnostics check the harness, not Tibicen's advantage.

After harness verification, connect Claude Code through an API key and ZCode. The optional Claude Code + DeepSeek API profile stays disabled without explicit enablement and budget. Each profile verifies its exact version, authorization, startup, permissions and observed loading. An unverified profile receives a reason while work on the others continues. Detailed limits and authorization protection are in §6.1.

After the first two Codex diagnostic scenarios, run SKILL/PROC as the adapter becomes ready; these are mandatory first-release acceptance. Pin the skill's specific source/full SHA/license before the series; assess loading and use separately. An unavailable source or profile is a coverage gap and does not complete its release criterion.

The external Codex/Claude/ZCode trial matrix does not replace the product Codex/Claude/Cursor matrix. Participation in the harness does not make ZCode or DeepSeek supported product adapters. Built-in task/quiz retain first-release limits; external subscription checks do not automatically expand the built-in Claude adapter.

Next cover an empty folder, conflict/update, repeat without unnecessary edits, refusal, interruption and manual step, source/blocklist, concurrent writes, ML infrastructure and one project with two tools. Representative task, loading, quiz and application state are assessed separately. Adversarial runs await verified isolation; a temporary copy does not provide it by itself.

**Transition criterion:** paired reports are available with verdict evidence, execution conditions, both stages, time/available spend and actual coverage. Benefit claims require pilot measurements. Release acceptance criteria are in §6.

### 4. Delivery, updates and currency

Basis: main vision §6.2–3, §10.7/13 and §11, plus queue 1 refinements. Check clean installation of both skills in a separate user scope, operation outside source/without Git after installation, and updates preserving presets, manifests and useful local decisions. Check the actual distributed archive/tree and claimed OS/Node versions; do not claim untested platforms as verified. Check removal with the selected installer; do not add a custom uninstaller.

Incompatible schemas receive an explicit refusal or documented migration, not a silent replacement. Changed blocks/components/sessions undergo queue 1 acceptance and a repeat run. Updating the distribution and updating infrastructure it created are checked separately.

For each agent/version pair, preserve source, date and verification scope. The owner reviews core/adapters at least monthly and after significant tool/standard changes; changed recommendations undergo the corresponding setup/improvement scenarios before a version is released. A date does not replace quality checks. Updates are explicit, with no background self-replacement; this document creates no automatic schedule.

**Transition criterion:** installation and update, data and local-decision preservation are reproduced; compatibility limits are known; an owner and maintenance procedure are assigned.

The delivery acceptance contract is the [verification-and-delivery delta](../openspec/changes/prepare-first-public-release/specs/verification-and-delivery/spec.md); handler tasks remain in the core change, while installed-version checks belong to [release preparation tasks](../openspec/changes/prepare-first-public-release/tasks.md).

### 5. Open source, pilot and first release

CI and document preparation proceeds independently of live-trial completion. Publication depends on queues 1–4, release gate §10.11 and initial voluntary benefit checks for both scenarios. Local preparation does not itself create a remote, public repository, release or deployment.

- **Versions.** Root `package.json` is the single product-version source for CLI/manifest/build; `SCHEMA_VERSION` is versioned separately. In 0.x, compatible fixes increment patch; capabilities/incompatibilities increment minor, with an explicit description. Use Conventional Commits; a correct squash title is sufficient for an external PR. The changelog describes user impact and updating; a checkpoint receives no automatic tag.
- **CI.** Offline tests, OpenSpec, build, versions/completeness and unpacked distribution self-tests. External Actions are pinned to full SHAs with minimal permissions. Fork PRs receive no keys/subscription credentials; live evals have a separate trusted entry point.
- **Participation.** README/SECURITY, CONTRIBUTING/CHANGELOG, short issue/PR templates, code of conduct with a working contact. Local checks, rule/adapter proposals and private vulnerability reporting are clear. Check materials/history for secrets and personal data before opening; preserve licenses. A separate support portal is unnecessary.
- **Delivery route.** Check the specific Git route for the built tree: source owner/repo, ignored `dist/` and Release attachment are not interchangeable. The command with pinned installer and tag/full SHA must deliver the verified bytes.
- **Private pilot.** Before public release, fix group composition/size, comparison with the participant's usual approach, time, corrections and manual actions for init/adopt. Collect voluntary anonymized summaries; initial verification does not replace the §14 post-publication checkpoint.
- **Candidate and release.** Start with a reproducible build and manual draft; consider release-please after delivery is proven. A candidate such as `0.1.0-rc.1` identifies a specific verified set. Check artifacts, checksums, source SHA, release notes, agent versions/limits and updating together. Never replace a published version's bytes; a fix receives a new version. Use Immutable Releases/attestations when available, retaining an independent advisory/checksum channel.

**Transition criterion:** П9–П10, core refinements, the first OpenSpec adapter and mandatory SKILL/PROC program are accepted, no strict violations remain unresolved, the private pilot is complete and delivery/maintenance are ready. Before publication, the owner specifies GitHub owner/repo, site URL, security contact, independent advisory/checksum channel and responsible people. Pilot composition and thresholds are fixed before it starts; unconfirmed benefit is not presented as proven.

Detailed requirements: [release-process](../openspec/changes/prepare-first-public-release/specs/release-process/spec.md); implementation/acceptance: [release preparation tasks](../openspec/changes/prepare-first-public-release/tasks.md). Document readiness does not establish candidate readiness or authorize publication.

Process basis: [SemVer](https://semver.org/spec/v2.0.0.html), [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/), [GitHub community profile](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/about-community-profiles-for-public-repositories), [Actions security](https://docs.github.com/en/actions/reference/security/secure-use), [immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases).

### 6–9. Future development from the addendum

These capabilities beyond the first OpenSpec adapter belong to the overall product plan but do not block the first release. Detailed contracts: [process-configuration delta](../openspec/changes/extend-infrastructure-contracts/specs/process-configuration/spec.md); work: [task group 3](../openspec/changes/extend-infrastructure-contracts/tasks.md#3-first-process-adapter-and-future-extensions). Tasks 3.3–3.4 belong to immediate queue 1а; the others belong to future queues 6–9. Before separate implementation, requirements may be split into an independent change without losing coverage; do not archive the entire package after only one part is ready.

| Queue | Basis and result | Acceptance |
|---|---|---|
| 6. Composite delivery | Addendum §4; wrapper/original material sources/licenses, complete links and transformations | Changed originals, differing licenses and missing resources are visible; each installed file is traceable |
| 7. Context map | Addendum §5; entry point → rules → skills → references, with loading condition/method from collected evidence | An unknown relationship is shown where it occurs; configuration is not claimed as actual loading; saving follows report rules only |
| 8. Additional adapters | Spec Kit and other adapters beyond queue 1а's first OpenSpec | Check sources/versions, init/adopt/update, exact effects and fresh-session workflow separately for each |
| 9. Portable manifest | Addendum §8; separate schema, set version, applicability, sources/parameters/agents/stages and deviations | Two compatible projects, incompatible input, preset conflict, local edit, unknown schema/parameter/component, missing adapter, safe export |

The context map needs no compiler or exact token counting. An adapter does not authorize changes throughout a same-named directory: only explicitly listed support paths. CLI installation has its own version, location and approval and does not become a required Tibicen dependency; protected files and uncontrolled effects remain a manual step. An installed CLI does not establish an integrated process.

A portable manifest replaces neither the factual manifest nor a preference preset, and executes no arbitrary installer. Conflicts use the normal proposal flow; consent does not transfer, and pinned sources are not silently updated. Matching sets do not prove reproducibility of the transitive environment. Export separates materials from project state and secrets.

As each capability becomes ready, extend scenarios/graders and run new acceptance on supported agent versions; the main release gate and execution boundaries remain. Other deferred scope from main vision §13 — third-party preset library, additional application profiles, bootstrap registry, MCP health-check, opt-in telemetry with an owner, enterprise restrictions/mirrors — stays in a separate backlog, without automatic inclusion in 6–9.

## Coverage of both product documents

| Basis | Where addressed |
|---|---|
| Main vision §§1–5: purpose, two scenarios, simplicity and consent | Original П1–П4, queues 1–3, scenarios А–В; quality also assessed through human effort |
| Main §§6–8: sources/currency, MCP and artifacts | П2/П4/П6/П8, queues 1, 3–4; preservation and repeat updates |
| Main §§9–11: presets/page, engineering boundaries, delivery | П0/П5–П8, completed queue 0 and queues 1–5 |
| Main §§12–15: acceptance, MVP scope, metrics and risks | Scenarios А–Е, queues 2–5, release gate and pilot; subsequent 6–9 do not expand this MVP |
| Addendum §1: blocks | Queue 1, П4/П5, OpenSpec tasks 2.1 |
| Addendum §2: three-state update | Queues 1 and 4, П2/П4/П8, tasks 2.2 |
| Addendum §3: failure between writes | Queue 1, П4/П8, tasks 2.3; then a live queue 3 scenario |
| Addendum §7: multiple tools | Queues 1 and 3, П3/П6, tasks 2.4; no orchestration |
| Addendum §9: preferences and selection | Separate infer-preferences-for-component-selection, queues 1–3; evidence/assumptions, proactive recommendation and [semantic PREF-01–08 acceptance](evals/PREFERENCE_SELECTION.md) by the harness |
| Addendum §6: first OpenSpec | Queue 1а, tasks 3.3–3.4; mechanical/live PROC acceptance, mandatory first-release gate |
| Addendum §§4–5 and 8, other §6 adapters | Queues 6–9, tasks 3.1–3.2/3.5–3.6 and subsequent adapters; future development |
| Additional skills | Shared source/installation/update mechanisms; SKILL-01–04 check actual loading/use and appropriate refusal of unnecessary installation |

## Parallel work

Task assignment, batch dependencies and allowed paths are defined by the [current tracker](agents/issue-tracker.md) and its ticket contracts. One integrator changes common formats, `package.json`, build, manifest/state and shared documents; no more than three independent executors work concurrently. Preparatory reading of an independent area may start earlier; changes begin when inputs are ready. [Integration research](research/ADAPTERS.md) describes candidates' technical boundaries. The plan does not automatically launch paid calls or publication.

## Historical program П0–П10

The original decomposition below is retained to connect code with product criteria. Its roles, waves and “first” wording describe the initial implementation order; current assignments and the next step are in the current summary and tracker. П9–П10 criteria remain acceptance/release conditions.

The original core is recorded in `409573b`; landing in `9b9e13e`, metrics module in `c57f80a`, addendum and planned specs in `f0073a0`. These commits are not release tags. The combined tree passed 105 offline tests, build and both skill self-tests; these were not 105 real-agent trials.

The 2026-10-23 audit of tree `edfa451` found nine reproduced verification, execution, preservation and selection defects. All nine were fixed in `f8c9443`: 301 offline tests, 59 browser tests with one expected skip, build, both skill self-tests and 80 checksums passed. CLI scenarios for both packaged copies confirmed refusal of untrusted raw MCP, no false green in the checked cases, execution preservation and interruption/resume. The [change was archived](../openspec/changes/archive/2026-10-23-fix-audit-safety-and-verification/tasks.md), deltas synchronized; [results and limits](../openspec/changes/archive/2026-10-23-fix-audit-safety-and-verification/verification.md) apply to local macOS checks. Linux and live agents were not tested in this pass; Windows commands refuse before launch. Live series must identify the specific SHA of the core under test.

### 1. Implementation boundaries

- Two installable skills: `tibicen-init` and `tibicen-adopt`; stages load one at a time.
- Scripts use Node ≥22.20 with no third-party runtime dependencies. Common entry point: `scripts/tibicen.ts <command>`.
- The agent understands the task and justifies recommendations; scripts inspect data, check restrictions, obtain files, apply the approved plan and record outcomes.
- Before consent, only permitted reads: no state, file cache, counter, installation or third-party execution. Consent applies to the exact plan; autopilot does not replace it.
- Existing projects change only approved agent-infrastructure elements. Creation, modification, replacement and deletion are checked equally; application code, existing package manifests and CI are preserved.
- Tibicen creates no commits directly, through commands or through invoked agents, including temporary repositories, baseline and resume. Product-permitted `git init` remains a separate approved action.
- The first release includes rule updates, MCP stdio, compatibility probes, presets, a static page with a builder and the first optional OpenSpec adapter with additional-skill acceptance. No custom sandbox, server, accounts, marketplace, telemetry or additional application profiles are added.

### 2. Executors and file ownership

The integrator and no more than three executors work concurrently. Each executor writes their area's code and checks. The integrator edits shared files; proposals for them are sent by message rather than concurrent edits.

| Executor | Responsibility | Planned paths |
|---|---|---|
| Integrator | Common formats, permissions, proposal, apply, state/resume, history, distribution build and shared checks | `scripts/tibicen.ts`, `scripts/core/`, `tests/core/`, build configuration, `docs/`, README and SECURITY.md |
| А — project and checks | Scan, inventory, snapshots, baseline, infrastructure/project checks, controlled task/quiz | `scripts/scan/`, `scripts/verify/`, corresponding `tests/` directories and fixtures |
| Б — sources and integrations | Live discovery, provenance, source currency, agent matrix, MCP and compatibility | `scripts/discovery/`, `scripts/mcp/`, `scripts/compat/`, `references/agent-matrix.md`, corresponding `tests/` directories |
| В — workflow | Two entry skills, stage instructions, recommendation rules, presets and builder | `skills/`, `references/stage-*.md`, other rule files in `references/`, `scripts/presets/`, `landing/`, corresponding `tests/` directories |

This is the source tree. П0 checks the installed distribution layout: an installed skill must not depend on neighboring directories in the source repository. Shared implementations are not duplicated manually.

### 3. П0 — shared foundation before parallel implementation

**Owner:** integrator. Other tasks use П0's result.

1. Verify delivery of both skills through official documentation and a local installation: discovery, relative paths, stage and shared-script availability after installation. Choose minimal reproducible packaging without a new installer.
2. Define versions and exact script input/output formats: `ScanResult`, `Candidate`, `Proposal`, `ApprovedPlan`, `CheckResult`, `SessionRecord`, manifest and preset. Keep examples and checks near code; no separate architecture document is needed.
3. Record exact paths, operations and content/diffs, original hashes, source SHAs, command argv/cwd, allowed environment variable names, trust, cost, manual steps and material probe composition in `Proposal`. `ApprovedPlan` binds host-agent confirmation to a specific proposal version; an input file cannot approve itself. This is an approval mechanism, not protection from a malicious host owner. Selection/integration modules prepare operations/new content; П4's shared mechanism performs every write to the target project, including MCP configurations.
4. Define common rules for allowed paths/network, secrets, timeouts, structured extraction of untrusted text and refusal of unknown formats. Existing symlinks must not move operations outside the approved scope.
5. Define a verifiable read/write format for Tibicen's own YAML files with zero dependencies, without promising arbitrary YAML support. Manifest and state are validated as data; malformed input does not become an instruction or consent.
6. Align independent handoff, infrastructure, project, task, quiz, MCP and compatibility statuses with product §10. Continuing does not reset original session history or attempt number.
7. Add minimal test execution and shared data examples. Checks in all three branches use these examples rather than incompatible formats of their own.

**Completion criterion:** two installed test entry points find their resources; formats/examples pass checks; owners of shared files and module-to-module handoff methods are known. Record actual supported versions with date/source, not assumptions from memory.

### 4. First parallel wave

After П0, П1–П4 can be developed independently using shared data examples. П4 does not wait for completed network/scan modules but uses П0's actual formats.

#### П1 — scan and inventory

**Owner:** А. **Dependency:** П0.

Recognize an empty folder, an application without infrastructure and a project with infrastructure of any origin. Find actual commands, supported agent files, available versions and user restrictions. Mark unknowns as gaps; do not read secret/forbidden-area content or include it in results. Output contains facts, hashes and a proposed `init/improve` route, without changing files or running project code.

**Completion criterion:** fixtures for all three states are recognized correctly; scanning creates no files and runs no project hooks/commands. Checks cover secrets, forbidden paths, symlinks and a partially unavailable tree.

#### П2 — live discovery and recommendation evidence

**Owner:** Б. **Dependency:** П0.

Obtain candidates only from allowed sources. Check canonical provenance, SHA, tree license, age ≥90 days, archive status, install hooks, blocklist and injection signs. Contributors affect neither eligibility nor ranking. Record the selection-formula version; popularity and external `verified` labels do not replace applicability checks. Handle timeouts, partial responses, one reformulation of an empty search, gaps and refusal of an unnecessary component. Before approval, keep data only in memory.

For official guidance, retain source, date, tool version and applicability scope. Check relevant material without researching the entire ecosystem on every run. Provide the repo/SHA blocklist check as a shared function for П4 and П8; initial eligibility does not replace rechecking.

**Completion criterion:** L0 on recorded responses covers an eligible candidate and every mandatory refusal; includes empty, partial and unavailable sources. Installing the selected SHA remains a post-approval action.

#### П3 — skills and stage instructions

**Owner:** В. **Dependency:** П0.

Prepare both entry SKILL.md files and §4 stage instructions. Use scan facts, give one sufficient recommendation, preserve user decisions and explain each component's purpose. Support zero interview questions in autopilot, the normal question limit, exact proposals and clear reports. Recommendations must use П2's official evidence; do not introduce a mandatory-skill catalog. For `stage-verify`, define a representative task and expected result from user decisions, five quiz questions from the manifest and integration of П5's task/quiz executor.

**Completion criterion:** installed entry points invoke the intended stages one at a time; new-project, adoption and improvement examples follow the route without mandatory catalog selection. Autopilot does not authorize writes or third-party code execution.

#### П4 — propose and apply the approved plan

**Owner:** integrator. **Dependency:** П0.

Produce a readable summary and exact plan. After confirmation, recheck paths, original hashes and repo/SHA blocklist; obtain approved files by SHA, then apply only listed operations. Before the first write, preserve exact original versions of affected files in a temporary snapshot and retain them until application/verification ends; after partial failure they remain available for safe continuation. This snapshot does not replace П5's full project baseline. Maintain state and the list of actually applied changes; write manifest/history atomically. Stop on another party's modification and require a new proposal; do not roll back their edits. Execute commands through argv in approved cwd with minimal env; new commands/write scopes do not inherit consent. Require a П5 baseline call before applying changes to an existing project.

**Completion criterion:** add/change/remove/partial-failure fixture checks pass; exact original versions of affected files remain available after failure. Reject unconfirmed writes, post-approval plan changes, hash mismatch, path/symlink escape, blocked-SHA installation and commit creation. Preserve application source.

**Intermediate build:** П1 + П2 + П3 + П4 provide a flow from request to approved infrastructure files and report. Check it in an empty folder and an existing project. Until П5 is integrated, unavailable checks remain `unverified`; this is not first-release readiness.

### 5. Second parallel wave

| Task | Owner and dependencies | Result and readiness criterion |
|---|---|---|
| П5 — snapshots and checks | А; П0, П1; integration with П4; П6 matrix for task/quiz | Baseline before changes on the actual staged/unstaged/untracked tree; final run on the same snapshot with all Tibicen changes. A temporary copy is equivalent to a worktree; no commits, secrets excluded. Infrastructure checked across stacks, application through the web profile. А implements runtime checks of the representative task and quiz in a controlled fresh Claude Code session on a separate copy, with П4 permissions, П6 matrix launch parameters and П3's task. Other agents or unavailable controlled execution produce `unverified` with a reason. Non-comparability, unsupported profile and missing trust give an `unverified` reason; a new regression does not become pre-existing. Checks cover partially changed trees, unavailable baseline, independent task/quiz outcomes and preservation of the final integration snapshot. |
| П6 — agent matrix, MCP and compatibility | Б; П0, П2; integration with П3–П5 | Verified Claude Code, Codex and Cursor versions/paths and launch methods. For Claude/Cursor, Б parses local MCP configuration and prepares targeted operations/new content; only П4's mechanism writes it. For Codex, a manual TOML block and application check. Environment checked for the target context without secret values. Compatibility enabled by default; discovery and loading distinguished; unsupported/uncontrolled execution skipped with a reason. Actual execution uses П4 trust/permissions. |
| П7 — presets and static page | В; П0, П3 | Save presets only on request; strict schema without secrets/arbitrary instructions; fresh scan and selection on reuse. The page explains both scenarios, provides installation and downloads `preset.yaml` client-side. No server/account. Builder presets pass the same validator as local application. |
| П8 — improvement, continuation and metrics | Integrator; П1–П4; integration with П5–П6 | Apply exact changes to existing infrastructure, preserve useful decisions, no rewriting merely to run. On interruption/`incomplete`, retain state, reason and applied changes; resume checks facts, rechecks the blocklist and obtains new approval for the same session. Unexpected differences between state and facts produce `tamper-suspect` and stop automatic continuation. Repeat runs also check installed repo/SHAs against the blocklist; a forbidden operation does not continue. After two repair attempts, a mandatory defect produces `incomplete`. Manual steps have their own statuses. Completion and local counting neither double-count resume nor count unfinished work as success. |

П5, П6 and П7 start on fixtures/agreed formats while the integrator assembles П8. In the second wave, П5 snapshots and П6 matrix come first; task/quiz and compatibility are then connected to them, so П5 and П6 do not fully depend on each other. П6 can prepare configuration fragments before check execution is ready; third-party execution is permitted only after integration with П4. П7 does not wait for complete MCP/compatibility. The integrator checks П4–П8 interfaces after connecting modules.

**Completion criterion:** both user scenarios work with actual changes applied. Product scenarios В, Г and Д pass; MCP and compatibility have correct independent outcomes, including honest skip reasons.

### 6. П9 — check the first release end to end

**Owner:** integrator; executors fix discovered defects in their areas. **Dependencies:** П1–П8 with accepted queue 1 refinements and a ready queue 2 harness. Local implementation of the original stages does not automatically complete this acceptance.

1. Assemble L0 strict from unit checks and recorded source responses. Check public script entry points and format interfaces, not just individual functions.
2. Run L1: empty folder, existing application without infrastructure, conflicting infrastructure, repeat update, interruption/manual step/`incomplete`, preset transfer. The ML fixture checks infrastructure without falsely promising application execution.
3. Check invariants on every attempt: no writes before approval, unapproved execution, application changes or commits; exact plan match; no secrets in artifacts or unrelated processes' environments. Add scenarios blocking a SHA after proposal and between interruption/resume: later installation/execution of the forbidden operation must not occur.
4. Check the representative task and auxiliary quiz in a fresh controlled Claude Code session when trust, authorization and controlled startup are available. For other agents/unavailable execution, record separate `unverified` outcomes with reasons. Representative-task changes stay in its copy and do not mix with the integration verification snapshot.
5. Allow at most two total attempts per release-candidate scenario for soft quality criteria. A strict-invariant violation fails the release gate regardless of later success. This limit is separate from user-session repair.
6. Install through the pinned installer in a clean user scope and run both skills outside the source repository. Check Git availability for delivery and installed Tibicen operation without Git through a temporary copy.

**Completion criterion:** L0 strict and L1 strict invariants pass; quality is assessed under product §10.11. Record compatibility evidence for selected skills or reasons it is unconfirmed. Files alone or a green quiz do not establish full verification.

#### 6.1. External Tibicen trials through real agents

Agreed first-wave profiles: **Codex CLI, Claude Code and ZCode Agent**. The additional **Claude Code + DeepSeek API** profile has an explicit switch, disabled by default. It uses a separate DeepSeek API key without a subscription; a key alone does not enable paid calls. Before execution, fix model, permitted scope and estimated spend; without a key, startup check or approved budget, skip the profile with a reason without blocking the main three. Cursor remains next. This is the framework's external-trial matrix: including ZCode/DeepSeek does not yet establish an implemented adapter, automatic task/quiz within Tibicen or verified product support. Execution state and official sources: [agent-matrix.md](../references/agent-matrix.md#внешние-испытания-фреймворка).

Here DeepSeek supplies the model for an existing CLI; it is not a fourth independent agent engine. Results identify host/version, provider and model separately; conclusions apply to that combination, not the model outside its environment. Only the selected profile receives the key; restricting the parent environment alone does not protect against its tools — the boundary is checked below. Personal configuration and Claude subscription authorization stay unchanged; errors do not trigger an automatic provider switch. Absence/disablement of the additional profile is shown separately and does not hide failures in the main matrix.

Program based on the 2026-10-21 research. The preparation order and observation criteria below are retained; actual execution is recorded in the current summary and OpenSpec:

- First, the integrator fixes scenario/result formats, graders and each profile's preflight. Before model requests, verify actual version, authorization method without reading its values into context, startup configurations/hooks/plugins/MCP/skills, available tools, filesystem/network permissions, limits and whole-process-tree termination. Codex uses the existing subscription login. Claude Code plans an API key: fix provider/model/monetary budget before requests and verify key isolation/spend limits; a subscription is not required. Built-in `--bare` adapter limits do not change. For ZCode, verify login applicability to the specific CLI build. Block unverified profiles with reasons while continuing the others. After technical preflight, run the smallest approved live Tibicen loading probe; skill listings and exit code do not replace it.
- Before the first live scenario, fix input files/request, user-response rules and exact plan approval, mandatory success conditions, rubric thresholds and attempt count. An unnamed “the agent succeeded” is not a result. Preserve separate startup, setup and subsequent-task outcomes. Setup success uses started observable scenarios as its denominator; conditional task success uses scenarios with completed setup; end-to-end success requires both stages to succeed among all started scenarios. All summaries show numerator, denominator and coverage; pre-start skips and environment errors are separate. A timeout/limit after startup does not remove an attempt from summaries. These are external-experiment measures; product metrics retain product §14 definitions.
- Start with new-repository setup and improvement of existing infrastructure. Then add instruction conflict, reapplication, interruption/resume and refusal. After setup, check a small working task in a fresh session against independent result criteria.
- Compare Tibicen with the same agent without Tibicen and with the previous version. Fix original project, request, model, available tools, versions, limits and user-response rules for each pair. Each attempt has fresh context and separate state; decisions and hidden checks are not passed to the executor.
- Preserve observed tool events, diffs, check results, time and available spend data. Validate/sanitize events before saving or sending them to a judge; do not archive secrets/personal configuration. Explicitly disclose missing full trajectories or cost data. Startup errors, subscription limits and skips are not successes and are shown separately from task results.
- Grade verifiable facts with code; relevance and consistency through an independent judge session using a fixed rubric and sampled human cross-checks. Check graders themselves on known good/bad results. A high text score does not compensate for an invariant violation.
- Test malicious instructions in untrusted materials, false consent, path escape, changed sources and write failures. These trials require verified environmental isolation; a temporary folder and agent permission mode alone are not sandboxes. Do not add a custom sandbox system to the product.
- Before giving a profile real authorization, test the “profile authorization → tools/project-code access” boundary with a synthetic secret. Tools, hooks, MCP and child processes must not obtain the key through environment, files, results or logs. Do not provide a real key until that check passes. Adversarial runs with real credentials require separately verified isolation; otherwise skip with a reason. Sanitizing a report after the key reaches model context is not protection.
- Measure setup and subsequent-task success separately, along with manual corrections/user effort, repeatability, preservation of existing decisions and agent/version compatibility. Research repeats are fixed in advance and do not replace §6's two-attempt release-gate limit; preserve all failures.

Methodology basis: [skill evaluation](https://agentskills.io/skill-creation/evaluating-skills), [combined graders and repeated trials](https://www.anthropic.com/research/demystifying-evals-for-ai-agents), [paired comparison in SkillsBench](https://arxiv.org/abs/2602.12670). Start with existing Node tests and native CLIs; this plan introduces neither a new evaluation platform nor runtime dependencies.

**Program order:** extended harness fixtures, first OpenSpec adapter readiness → Codex preflight → first two diagnostic paired scenarios after core/harness mechanical acceptance → SKILL/PREF and PROC as the adapter becomes ready → external Claude Code/ZCode and remaining scenarios; DeepSeek is optional. The integrator owns the common harness/formats. The first two scenarios give both stages' outcomes and a comparison but complete neither SKILL/PROC nor the whole release gate. Claim full external coverage only for actually executed profiles, sources, versions and scenarios. Release criteria remain in §6 and П10; the current execution contract is in [NATIVE_RUNS](evals/NATIVE_RUNS.md).

### 7. П10 — prepare publication and maintenance

**Owner:** integrator. Б maintains matrix/source currency; В provides user-path documentation and the page. **Publication dependency:** П9.

- Prepare README with installation, explicit invocation of both skills, Git/Node/agent requirements and limits; include MIT license, SECURITY.md, repo/SHA blocklist and a verifiable distribution version/checksums. Choose and verify an independent advisory/checksum publication channel under product §10.13.
- Check the static page/builder with the real delivery command; establish repository/site URLs before publication.
- Assign core/adapter maintenance: review at least monthly and after significant supported-tool changes, run corresponding scenarios and release a new version. This plan creates no automatic schedule.
- Before the pilot, fix groups, time/correction/cost measurement and voluntary manual collection of summaries without project content/secrets. Compare benefit separately for setup/improvement; apply the §14 checkpoint.

Repository owner, site URL, pinned installer version and pilot parameters are decided by the corresponding stage. Starting the core does not depend on them. Estimate timing after П0 and the first end-to-end build.

**Completion criterion:** delivery/publication URLs, independent advisory/checksum channel, maintenance owner and initial benefit checks for setup/improvement are confirmed.

### 8. Handing tasks to subagents

Each executor receives the main product vision, addendum, this plan and relevant OpenSpec requirements/tasks for the current wave. Before starting, check П0 input formats and report missing dependencies. The task contract includes:

1. Expected result and readiness criterion for the specific task.
2. Allowed change paths from §2, required inputs and output formats.
3. Mandatory checks and product-defined reasons for permitted degradation.
4. No product-scope, shared-format or other-owner file changes without integrator agreement. Report new dependencies immediately; consumers do not silently adapt to a changed format.
5. Final report: changed files, checks/results and remaining limits. Subagents create no commits and publish no changes; one responsible person integrates the work.

The integrator first checks contract compliance, then runs shared checks and assembles the end-to-end scenario. Rechecking is limited to changed interfaces/unresolved defects; do not reopen the product document for a new general audit after every task.

## Change requirements

Detailed requirements, acceptance scenarios and tasks for substantial changes live in OpenSpec. This plan keeps stage order and dependencies without duplicating change tasks. Vision acceptance and the original implementation are represented by two retrospective archives; their original SHAs and recheck results are recorded there.
