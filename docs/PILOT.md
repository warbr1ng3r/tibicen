# Initial voluntary pilot

**Status: voluntary postpublication research; protocol draft, not frozen. Policy adopted 2026-11-03.** Initial human observations and human rubric calibration are not prerequisites for technical release acceptance. Release tasks 3.3 and 3.4 are deferred research, not completed trials. The owner volunteered on 2026-10-30; no pilot observations are recorded here. Exact route/project scope, group minimums and pretrial conditions are agreed only if willing participants begin a trial.

**Availability update, 2026-11-03:** the owner cannot currently complete the assessment or recruit participants and requested public-source research instead. The earlier volunteering remains historical; an available participant is no longer assumed. No owner assessment or trial is scheduled. [Public agent-setup research](research/PUBLIC_AGENT_SETUP_EVIDENCE.md) informs priorities; the adopted [evidence policy](../openspec/changes/separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md) separates this research from the [engineering release assessment](evals/ENGINEERING_ACCEPTANCE.md), without inventing participant observations.

Earlier acceptance used generated projects at the owner's request. Those runs remain synthetic scenario checks. A [preliminary real-project adopt comparison](evals/results/2026-10-30-owner-pilot-adopt/README.md) now has two proposal-only app observations; full setup/useful-task and participant measurements remain unobserved.

Basis: [Product Vision §14](PRODUCT_VISION.md#14-usefulness-and-quality-metrics) and [postpublication research](RELEASING.md#voluntary-postpublication-research). The pilot compares Tibicen with each participant's usual method on real work. Initial setup (`init`) and improvement (`adopt`) are assessed separately. The published limited alpha is not full MVP acceptance; deferring human research does not close missing technical evidence.

## Before the first trial

The owner and participants fill in this record before observing results. Keep the dated agreed record; changed conditions receive a new dated revision rather than rewriting earlier observations. It remains **not frozen** until the owner has selected the cohort and these fields are agreed.

| Field | Record before the trial |
|---|---|
| Pilot record and coordinator | Identifier, date/revision, responsible person, agreed private summary channel; not yet assigned |
| Voluntary groups and sizes | Owner volunteered on 2026-10-30 but is unavailable as of 2026-11-03; if trials resume, agree anonymous codes and planned/minimum participant/project/session counts for init and adopt separately, with group overlap, before observation |
| Projects and scope | Anonymous project codes, coarse stack, initial infrastructure, route, task and exclusions; real projects chosen by participants, not invented examples |
| Version and environment | Installed Tibicen version/ref, agent/version, OS/Node and relevant tool versions; actual publication date for the §14 clock |
| Usual-method baseline | Owner confirmed ordinary Codex without Tibicen as the usual method on 2026-10-30; still freeze the same task, comparable starting state, tools, limits and order, explaining differences |
| Measurements | Same start/end rule, correction-count rule, manual-work categories, cost source and interruption handling for both methods |
| Reuse follow-up | Start/end of each participant's 30-day window and how to request an optional follow-up |

Use participant-owned copies of the same initial state for the two methods where possible. Never overwrite a participant's current work to recreate a baseline. If no comparable usual-method observation or original baseline is available, record the gap; do not reconstruct it from an already changed project or claim measured savings.

## Run and record

1. Participation and summary sharing are voluntary. Agree on what may be shared and where; a participant may stop or skip. Use normal approval of the exact changes, commands, trust and costs. Joining the pilot does not approve execution or spending.
2. Start the clock at the agreed setup/improvement request. Record when the first agreed useful task is completed in a fresh agent session, or that no result was observed. Record interruptions and wall-clock time; record the participant's active manual minutes separately. Apply the same rule to the usual method.
3. Count each necessary user intervention correcting an incorrect result or instruction as one correction. Record a short anonymous reason. Ordinary interview answers and approvals are separate actions, not corrections. Agree any different counting rule before the trial.
4. Record manual minutes and action counts for file integration/repair separately from secrets or mandatory external authorization. Record observed cost with currency/source, label estimates, or use `unknown`; unavailable billing or usage is not zero.
5. Record integration status, project checks and the useful-task outcome separately. Preserve attempt history, known regressions, manual steps and skipped/unverified reasons. A quiz or a green internal test is not evidence of a useful working task.

## Short observation form

Copy once per method and original session; update the same record for continuation. Use `unknown` for missing information and a reason for skips. The usual method needs only an observation ID; identify its integration assessment as manual rather than a Tibicen-reported status. This is a human note, not a new data schema.

```text
Observation ID / original session ID / continuation of:
Participant code / group / project code / init or adopt:
Method: Tibicen or usual method / versions / trial date:
Agreed task and success check / starting-state comparability / gaps:
Start / first useful result time / elapsed wall time / interruptions:
Tibicen status: complete/manual-action-required/incomplete/unknown; usual method: manual assessment:
Corrections: count and short reasons / ordinary approvals and answers:
Manual integration: minutes/actions / secret or authorization steps: minutes/actions:
Cost: amount + currency/source, labelled estimate, or unknown:
Project check: baseline/comparison, first-attempt outcome, regressions, skips:
Useful task: outcome, fresh-session agent/version, evidence summary or skip reason:
Attempts/resume/manual steps / 30-day reuse observation or not yet due:
Useful aspects and limits (1–2 sentences) / summary sharing agreed:
```

## Summarize without changing the denominators

- Keep init and adopt separate, and identify each method. Show numerator, denominator, coverage, unknown outcomes and exclusions; never substitute the harness's experimental ratios for product metrics.
- Tibicen completion is confirmed `complete` sessions divided by all observed Tibicen starts; keep usual-method assessments separate. Keep `manual-action-required` and `incomplete` in that denominator without success until completion. Show unknown outcomes separately without calling them failures or silently dropping observed starts; pre-start skips are separate.
- A resumed session remains one observation and at most one success. Link it to the original ID, preserve earlier attempts and update its outcome; continuation is neither a new start nor a new use.
- Verify-pass means first-attempt green for a new directory, or no new errors against a comparable original baseline for an existing project (`pre-existing-red` is allowed). Verification before mandatory manual changes is provisional. Unsupported profiles, absent runs and unprovable baselines are excluded from the applicable verify-pass denominator with reasons and proportions; a known new regression stays counted despite a later `unverified` result.
- Report time, corrections, manual effort and cost only to the extent observed. Include useful-task coverage, agent/version and skip reasons. Unknown observations are not failures; unmeasured benefit is not proven benefit.

## Privacy and follow-up

Keep repositories, code, prompts, secrets, raw logs, screenshots and personal configuration with the participant. Share only the agreed anonymized summary: project/participant codes, coarse conditions, measurements and limits. Do not request credentials. Until a private summary channel is agreed, retain notes locally; do not send sensitive details to public issues. Follow [SECURITY](../SECURITY.md).

The §14 review checkpoint is **50 measured sessions or 8 weeks after publication, whichever comes first**. The initial private pilot does not itself complete this checkpoint. Preserve the actual publication date; starting later or resuming does not reset that clock.

Count a second separate project within **30 days** separately from returning to improve the same project. Report reuse thresholds only for a mature 30-day cohort; a missing follow-up is unknown, and resume is not reuse.

Initial hypothesis review triggers are completion **<40%**, applicable verify-pass **<70%**, or a second separate project **<10%** in a mature cohort. Assess measured effort savings and limitations, not internal test counts. Insufficient data requires an explicit decision to recruit, extend the pilot or stop; do not declare the target met.

## What remains before an actual pilot

If an actual pilot resumes, willing participants must select the cohort, group sizes and real projects, agree the pretrial record and private sharing channel, then collect separate init/adopt observations and anonymized benefit/limitation summaries. The earlier volunteer is currently unavailable; completed trials, frozen trial conditions and full MVP gate closure are not implied by this draft.
