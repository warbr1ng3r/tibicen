# Tibicen development plan

## Current work — reliability and remaining native coverage

The [memory-link correction](../openspec/changes/archive/2026-11-08-recognize-memory-link-fragments/verification.md) and [explicit per-read exclusions](../openspec/changes/archive/2026-11-08-respect-read-only-path-constraints/verification.md) passed independent review, the full gate (1067 passes / one existing skip) and both copied skills (12 CLI reads / four core calls). Detailed tasks and retained failures stay with the archived changes. These source fixes are Unreleased; published 1.5.2 remains unchanged.

The [new workflow report](evals/results/2026-11-08-normal-workflows/README.md) separates real documentation setup/work from a test checker that wrongly rejected a valid tag example and its separately reviewed continuation. The [manual-action clarification](../openspec/changes/archive/2026-11-08-clarify-external-manual-actions/verification.md) keeps available agent work out of mandatory human handoff; the execution contract and original pending plans remain unchanged. This is Unreleased source work, not a replacement of published 1.5.2.

The effort (`../.scratch/normal-workflow-and-second-harness-20261108/map.md`; private development record; excluded from public source) owns integration and the remaining coverage tasks. One different harness and memory correction/reuse there remain unverified: ZCode UI control is unavailable and current Claude status is logged out. Continue available product work without requiring OS setup; do not infer a native pass from the prepared fixture or configuration scans.

The [standalone ZCode investigation](evals/results/2026-11-08-zcode-standalone/README.md) reached the installed CLI without GUI access, then stopped before a model request. Its fixed shared store lacks the identity record required by that account route; this does not establish Desktop logout or an invalid subscription. Authentication was left unchanged. Actual Tibicen setup, useful work and memory reuse on another native harness remain unverified; further authentication probes are outside this completed investigation.

## Completed work — landing and bounded reliability follow-up

The approved landing is [published and verified](../openspec/changes/archive/2026-11-08-compose-approved-landing-visuals/verification.md). Fresh Bash completed setup, useful task and read-only repeat. Documentation completed approved apply, useful task and repeat through an explicit operator handoff after an interrupted proposal; the original failure remains unchanged. The [report](evals/results/2026-11-08-reliability-followup/README.md) records both outcomes, independent task checks and cleanup.

The confirmed [development collector repair](../openspec/changes/archive/2026-11-08-await-codex-terminal-outcome/verification.md) passed independent Ponytail review and the full gate: 1,055 passes, one existing skip, no failures. All 110 skill payloads remain published 1.5.2 bytes. Twelve additional CLI format scans passed; native ZCode/Aion control was unavailable while the Mac was locked and one Claude auth-status operation left login status unknown. Wider native coverage needs an available authorized route. The closed effort (`../.scratch/landing-and-reliability-20261108/map.md`; private development record; excluded from public source) retains nine callers/625.499 seconds, original failures and assistance; no paid API or authentication change.

## Historical delivery — 1.5.2 and initial follow-ups

The 8 November effort (`../.scratch/release-and-working-cycles-20261108/map.md`; private development record; excluded from public source) delivered compatible patch 1.5.2: reviewed routing correction, frozen candidate, 1048 passing tests/one existing skip, standalone 3/3, exact local/public installation/recovery/removal, public CI/six platforms, returned assets and separate Pages verification. Two synthetic queue/monorepo working cycles completed; shell/docs remain stopped with their evidence limits. The [release report](evals/results/2026-11-08-release-1.5.2/README.md) preserves actual outcomes. Landing-preview choice and additional harness observations remain separate follow-ups; no production landing redesign is implied. Earlier observations and parked Agensi are unchanged.

## Historical local correction — 7 November checkpoint

Canonical installed Tibicen skill folders alone now select init; other user infrastructure still selects improve. All files remain inventoried and the nonempty-project/write guards are unchanged. The [change verification](../openspec/changes/distinguish-self-installed-tibicen/verification.md) records independent Ponytail Ship, 1047 passing tests/one existing skip, both built skills and 110 checksums. The correction is Unreleased; published 1.5.1 remains unchanged.

The [ordinary-cycle report](evals/results/2026-11-07-ordinary-working-cycles/README.md) retains two accepted proposals, a native error before apply and the closed three-call packet. A separate offline check applied both approved plans successfully; this does not establish a complete fresh-agent working cycle. That observation remains the next evidence gap. The effort (`../.scratch/ordinary-cycle-20261107/map.md`; private development record; excluded from public source) owns detailed tasks and limits. Landing naming/icons have a separate private screenshot preview pending the owner's choice. Agensi remains parked.

Updated 7 November 2026 (Moscow). Product scope remains in the [vision](PRODUCT_VISION.md) and [addendum](PRODUCT_VISION_ADDENDUM.md). This roadmap owns milestone order; detailed requirements and tasks stay in OpenSpec.

## Current milestone — 1.5.2 published; Pages verified

The compatible routing fix is published from `f5bc0a416813c54d3ec21e50f3f5ede0b4be2bb8` as [1.5.2](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.2) at `2026-11-07T23:27:53Z`. Source CI, six platform cells, public delivery and returned assets passed. The [release report](evals/results/2026-11-08-release-1.5.2/README.md) retains actual agent observations, operator assistance and earlier failures with their limits. [Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/42427301398) serves source `2454eda623ad58d1d18e6037fa8aead4a629def2`; the [audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42427728184) matched all 20 bodies to the official artifact. This documentation closure does not redeploy the site; previous observations are unchanged.

## Historical milestone — 1.5.1 published; Pages verified

Compatible consent/mode fixes are published from `210e786fdac4a7aa90b88cd34e223788f4f097dd` as [1.5.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.1) at `2026-11-07T17:33:16Z`. Source CI, six platform cells, public delivery and returned assets passed. The [release report](evals/results/2026-11-07-release-1.5.1/README.md) retains explicit reading, operator assistance and manual-action-required limits. [Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/42398163708) serves source `c1589cdbd26a5768847578a69d520212ccb04c03`; the [audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42398637168) matched 20/20 official-artifact bodies. The later documentation closure changes neither the deployed source nor prior observations.

## Historical milestone — 1.5.0 and Pages delivered

[Skills 1.5.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.0) were
published at `2026-11-06T22:43:22Z` (7 November Moscow). Candidate-02, three scoped
fresh observations, exact local/public update/recovery/removal, source CI, six
platform cells and all three returned assets passed. Separate metadata CI and
Pages deployed source `49b41f02fd2cbe8a8fadf2b23cafade97f99739f`; the
[20-body audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42309686805)
matched the official artifact without rebuilding. The
[release report](evals/results/2026-11-07-release-1.5/README.md) retains exact
identities, original failures, the full-summary/local-seven-body collection scope
and independent review. The effort (`../.scratch/release-1.5/map.md`; private development record; excluded from public source) and
dashboard (`../.scratch/release-1.5/dashboard.md`; private development record; excluded from public source) record completed final documentation closeout;
document-only updates do not change the already deployed site.

The [context-review guide](PROJECT_CONTEXT_REVIEW.md) describes the three optional
additions. Schemas and write/approval boundaries are unchanged. Fresh sessions
explicitly read the staged skill and use the CLI in synthetic fixtures on one
requested route; B3's missing-utility command and same-session recovery remain
disclosed. No implicit loading, all-harness compatibility or measured human
benefit is established. That release packet includes no further native session. Routine maintenance
and the separately selected investigation follow below.

## Completed local maintenance — consent guidance and faithful restaging

Completed the two narrow follow-ups from the first-run observation: explicit
generated-service consent presentation and preservation of ordinary file modes
through the evaluator. The current effort (`../.scratch/first-run-fixes-20261107/map.md`; private development record; excluded from public source)
owns parallel work; [OpenSpec](../openspec/changes/preserve-first-run-consent-and-modes/proposal.md)
owns detailed tasks. Focused 130/130, full gate 1043 passes / 1 skip and independent
Ponytail Ship are recorded in [verification](../openspec/changes/preserve-first-run-consent-and-modes/verification.md).
Keep published 1.5.0 and all historical outcomes unchanged. No new engine,
native rerun, version bump, commit or release is included.

## Latest observation — setup applied; second useful task incomplete

The renewed [first-run observation](research/2026-11-07-first-run-value/README.md)
used published 1.5.0 without product changes. The native agent applied both exact
setup proposals and reported their verification limits. Initial setup then passed
a fresh useful task and independent checks (5/5 tests). Its proposal required one
extra operator correction to keep the Tibicen route. Improvement preserved existing
memory and decisions; its later search task returned code and a successful test
command but ended with a terminal native error before completion. That task was
not accepted or independently graded, and no retry followed.

Six native calls and two model-free containers ran; all containers were removed.
Both repeat checks were prospectively omitted because evaluator restaging changes
file modes and would confound the result. Earlier preparation failures remain
closed historical records. The execution effort (`../.scratch/first-run-execution-20261107/map.md`; private development record; excluded from public source)
owns exact outcomes and limits. This is assisted technical evidence on one route;
human benefit and other harness behavior remain unknown. The narrow follow-ups
are clearer generated-record consent guidance and faithful evaluator file modes,
not a new product engine. Neither change nor a new release is included here.

## Published baseline

The following earlier 1.4.1 baseline retains its original evidence; the current
1.5.0 release is recorded above.

**Skills 1.4.1 are published.** The compatible proposal-preview correction retains
full approved bytes and existing plans. Candidate acceptance, public source CI,
six platform cells, public installation/replacement/recovery/removal and all three
returned release assets passed; 101 archive files/modes match the candidate.
The [1.4.1 release report](evals/results/2026-11-06-release-1.4.1/README.md) retains
exact source/distribution identities, failed attempts and coverage limits.
The [published 1.4.0 records](evals/results/2026-11-06-release-1.4/README.md) remain unchanged.
Metadata CI and Pages deployment passed. The separate Actions audit matched all
20 returned bodies to the official artifact, preserving six earlier maintenance
records and warnings; root retained its exact structured summary. See
[maintenance receipts](MAINTENANCE.md) for scope and failed-attempt accounting.

**The simpler first-use landing is published.** Public source
[`a6d54bc`](https://github.com/warbr1ng3r/tibicen/commit/a6d54bc6901bbf212cbfd889385d77b82e4b2f4f)
passed CI and Pages deployment; live EN/RU home and preset routes were checked on
desktop/mobile and without JavaScript. See the exact
[publication record](../openspec/changes/simplify-first-use-landing/verification.md#publication).
That separate landing deployment retained skills 1.4.0. Broader native/model compatibility, actual MCP
connection and measured human usefulness require their own observations.

## Completed milestones and prior decisions

1. **Validate the first working session after 1.4 — complete locally.** Five
   controlled init/adopt, project-memory, MCP and no-change cases used the frozen
   published distribution, followed by separate mechanical applications, useful
   tasks and a later memory correction/read. The
   [observation report](evals/results/2026-11-06-first-working-session/README.md)
   retains assistance, runtime and consent limits. Ownership remains in the
   working-path packet (`../.scratch/working-path/map.md`; private development record; excluded from public source), detailed tasks in
   [validate-first-working-session](../openspec/changes/validate-first-working-session/tasks.md).
2. **Publish the compatible 1.4.1 patch — complete.** Candidate, public delivery,
   returned assets, metadata CI, Pages deployment and the 20-body official-artifact
   comparison are complete. Actual results and retained failures are tracked in the
   release effort (`../.scratch/release-1.4.1/map.md`; private development record; excluded from public source) and
   [release report](evals/results/2026-11-06-release-1.4.1/README.md).
   Frozen published 1.4 artifacts remain unchanged.
3. **Record the native first-use cycle after 1.4.1 — packet complete.** The owner
   approved reviewed-landing deployment, bounded subscription-backed native
   observations and correction of current-guide version drift. The
   native first-use packet (`../.scratch/native-first-use/map.md`; private development record; excluded from public source) owns tasks,
   source/input freezes and [actual outcomes](evals/results/2026-11-06-native-first-use/README.md). Internal assistance, structural
   checks, native reading/use and unperformed phases retain separate results.
   Pages and current-guide fixes passed. S0 passed; S1 failed, stopping later
   phases. The offline diagnostic follow-up passed review and 954 tests/one skip
   for its five-file source freeze, without changing the published skill payloads.
   That gate does not validate the later recovery change.
4. **Repair evaluator recovery — verified locally; native task and memory phases stopped.**
   The follow-up packet (`../.scratch/native-memory-followup/map.md`; private development record; excluded from public source) attempted M1
   once: two commands succeeded before an accepted process exited 127. Its command
   and cause remain unknown. M2/M3 did not run; no retry occurred. Memory use,
   task completion and container changes remain unverified; see the
   [actual observations](evals/results/2026-11-06-native-memory-followup/README.md).
   A separate [offline recovery change](../openspec/changes/preserve-recoverable-command-results/tasks.md)
   lets ordinary command results reach Codex while retaining terminal evaluator
   failures and containment. Independent source review: Ship; the full gate passed
   981 tests with no failures and one existing skip. The same model-free
   owner-socket driver failed before the fix and completed a later command after
   the fix; both runs verified cleanup. All 100 distributed payloads remain
   unchanged. These results do not establish native task or memory success.
5. **Finite native memory observations — complete.** The
   recovery observation packet (`../.scratch/native-memory-recovery/map.md`; private development record; excluded from public source) caught
   a second CLI stop before launch. The
   [caller repair](../openspec/changes/preserve-cli-command-results/tasks.md)
   passed independent review and 1002 tests/one existing skip. R1 then completed,
   but its frozen grade failed on a measurement proxy; original R2/R3 stopped.
   A separate declared amendment passed 32 controls and accepted a corrected R1
   assessment after observation on the same bytes, without a model retry. C1
   completed the correction and passed deterministic grading and independent
   semantic review; root accepted the result. C2 completed once in 35.98 seconds,
   read current memory, executed the actual function and returned `[4,4,4,1]`
   without file changes; deterministic grading and final independent review
   passed, and root accepted the result. All three sessions were used once within the original
   three-session/420-second cap; no further native runs are planned here. The
   [report](evals/results/2026-11-06-native-memory-recovery/README.md) keeps actual
   evidence, original failures and revised assessments separate. Earlier failed
   S1/M1 packets are not retried or regraded.
6. **Evaluator source integration — complete.** Public source
   [`542743c`](https://github.com/warbr1ng3r/tibicen/commit/542743cde5a133f3a2a23a10d38daebab85ac5bf)
   passed [CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42272604247).
   Published skill payloads remain 1.4.1; no new skill release was made.
   Earlier native outcomes retain their original scope.
7. **Repair/native comparison — complete.** The
   [comparison](evals/results/2026-11-06-repair-comparison/README.md) completed
   eight single launches. Both approaches made the same repair, completed the
   same useful task and left sufficient setup unchanged. No incremental useful
   result or human-time benefit was demonstrated. This assisted one-fixture,
   one-host/model case explicitly prompted instruction reading and tests;
   ordinary installation, human effort and monetary cost remain unknown.
   Task success without the repair was not tested.
8. **Prior decision, 6 November — maintain 1.4.1.** The bounded workflow
   review did not establish a required step removable without weakening supported
   behavior, or a measured bottleneck. The
   [strategy study](research/2026-11-06-product-strategy/README.md)
   remained a set of hypotheses; no further audit or benchmark round was selected.
   Scope was to reopen only for a concrete evidenced gap, allowing no change.
   The separate 7 November selection is recorded above. Versions follow actual
   scope and normal SemVer: patch for compatible fixes, minor for compatible
   features and major for incompatible supported contracts. Follow
   [RELEASING](RELEASING.md) for separate publication authorization. These
   observations themselves granted no new native budget, implementation, commit or release.

## Regular maintenance and later options

Review core rules and adapters at least monthly and after material upstream changes
under [MAINTENANCE](MAINTENANCE.md). The next monthly review is due by
**3 December 2026**. A review may produce a justified no-change result or a bounded
change with affected setup/improvement checks; this is an ongoing maintenance lane.

Voluntary human usefulness research and rubric calibration remain optional
postpublication work under the [pilot protocol](PILOT.md); measured benefit is unknown.
Beyond the selected context-review milestone, additional adapters, broader context
maps, portable manifests and other future capabilities
need a demonstrated user problem and a separate scoped decision. The
[post-1.3 study](research/2026-11-05-post-1.3-priorities/README.md) records candidate
opportunities rather than an approved implementation queue.

## Historical plan

The [6 November roadmap snapshot](history/DEVELOPMENT_PLAN_2026-11-06.md) preserves
the previously published plan and its section headings from
[public source `d8fbb241`](https://github.com/warbr1ng3r/tibicen/blob/d8fbb2415aec32f18994611a3057748918d2bbc0/docs/DEVELOPMENT_PLAN.md).
Its dated Unreleased, next-step and approval wording describes those stages.
Retrospective archives are reconstructed records, not proof of prior approval or
execution; historical outcomes and missing observations retain their original scope.
