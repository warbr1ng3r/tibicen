# Tibicen development plan

Updated 6 November 2026 (Moscow). Product scope remains in the
[vision](PRODUCT_VISION.md) and [addendum](PRODUCT_VISION_ADDENDUM.md).
This roadmap owns milestone order; detailed requirements and tasks stay in OpenSpec.

## Published baseline

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

## Current work and next milestones

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
   [native first-use packet](../.scratch/native-first-use/map.md) owns tasks,
   source/input freezes and [actual outcomes](evals/results/2026-11-06-native-first-use/README.md). Internal assistance, structural
   checks, native reading/use and unperformed phases retain separate results.
   Pages and current-guide fixes passed. S0 passed; S1 failed, stopping later
   phases. The offline diagnostic follow-up passed review and 954 tests/one skip
   for its five-file source freeze, without changing the published skill payloads.
   That gate does not validate the later recovery change.
4. **Repair evaluator recovery — verified locally; native task and memory phases stopped.**
   The [follow-up packet](../.scratch/native-memory-followup/map.md) attempted M1
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
   [recovery observation packet](../.scratch/native-memory-recovery/map.md) caught
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
6. **Select source integration and release scope.** These fixes affect development
   evaluators; published 1.4.1 skill payloads remain unchanged. Decide whether a
   product release is needed from the actual changes. Apply normal SemVer:
   compatible fixes use patch, compatible features minor, and incompatible supported
   contracts major. The actual changes determine the next version. Follow
   [RELEASING](RELEASING.md) for candidate evidence and separate publication
   authorization; this roadmap does not select or approve a release.

## Regular maintenance and later options

Review core rules and adapters at least monthly and after material upstream changes
under [MAINTENANCE](MAINTENANCE.md). The next monthly review is due by
**3 December 2026**. A review may produce a justified no-change result or a bounded
change with affected setup/improvement checks; this is an ongoing maintenance lane.

Voluntary human usefulness research and rubric calibration remain optional
postpublication work under the [pilot protocol](PILOT.md); measured benefit is unknown.
Additional adapters, context maps, portable manifests and other future capabilities
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
