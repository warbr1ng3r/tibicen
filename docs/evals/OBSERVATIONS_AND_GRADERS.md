# Safe observations and mechanical graders

Implementation of [harness](../../openspec/changes/build-agent-evaluation-harness/tasks.md) tasks 2.2–2.3: [observations.ts](../../scripts/evals/observations.ts), [mechanical.ts](../../scripts/evals/mechanical.ts). This is offline verification of trusted local drivers, without real CLIs, models or real credentials.

## Observation storage

`saveObservedRun(directory, projectRoot, run, sensitiveValues?)` revalidates the experiment/scenario/attempt/events/grades links and saves one JSON file per attempt id. Record fields: schema 1, experiment and scenario ids/hashes, source SHA, profile hash, result, events and grades. The complete scenario, requests, oracle, replies, argv/env and raw stdout/stderr are excluded. Rewriting the same id is rejected; writing is atomic, the file has mode `0600` and a new directory has `0700`. The destination is canonicalized before creation and must be outside the executor tree, including through a symlink.

Validated events and the allowed projection are copied before asynchronous work. The record name and bytes come from one detached snapshot; changing the original attempt or host object after invocation does not change saved data. The sensitiveValues registry is also copied when the guard is created and cannot be cleared by a later caller mutation.

The runner accepts host-only `sensitiveValues`. Before sending, it checks original context, the actual command with argv/env and the validated human reply; before receiving, it checks protocol messages, and before writing, selected structural fields. A registered sensitive value or recognizable literal credential causes a bounded error without the value. An invalid observation is not edited into a supposedly reliable fact. Authorization environment variables are additionally prohibited in an offline command; the parent environment is not inherited. Raw stderr is drained without storage.

The regression puts a synthetic credential only in the host environment, starts a driver and a separate project subprocess with explicitly empty env, and checks argv, input context, project environment and recorded artifacts. Attempts to pass the value through an argument, event reason or input prompt are rejected. This confirms a specific offline/auth:none boundary, not protection of real subscription access: authorized native profiles remain blocked until task 3.1. A directory outside the project is not physically inaccessible to another process of the same user; hostile isolation and hidden-data accessibility require a separate preflight.

JSON remains capped at 8 MiB. Saving after runner completion also retains partial timeout/cancellation outcomes, but does not promise journaling if the host itself crashes. Masking an arbitrary unknown secret in free text is not guaranteed; free output is therefore not saved, and allowed fields, rejection of known values and separate verification of a future native parser are used.

## Mechanical evidence

`runMechanicalAttempt(input, projectRoot, oracle, review)` wraps the runner with independent observations. The oracle must match the scenario's private id/hash; the input tree must match the frozen files. The process runs in the observed cwd. Stages have distinct plans/consent; the setup result reaches task without reusing consent.

The host creates events that the driver is prohibited from sending:

- `checkpoint`: start / immediately before consent / end; sorted relative paths, SHA-256 and ordinary file permissions, plus a completeness flag;
- `approval`: digest of the exact ReviewedPlan with changes `{path, beforeHash, afterHash}` and commandHashes; fixture text alone does not grant consent;
- `assertion`: id and expected/actual digest of a selected JSON field, without its contents;
- `host-command`: hash of a separately approved fixed command and its exitCode/null.

`driver-finished` retains the driver's stated outcome separately from final `stage-finished`. The grader checks changes between snapshots, plan scope and initial/final hashes, protected files, Git metadata, existing file permissions, consent before writing and command hash. A snapshot with a symlink, inaccessible/oversized file or exceeded limits does not prove completeness. Limits: 10 000 files, 2 MiB per file and 16 MiB per read tree. Snapshot boundaries detect retained changes; a temporary write restored between snapshots is not proven to be covered. This mechanism does not allow hostile scenarios and does not replace native-profile monitoring/isolation.

On an invariant violation, the grader's project command is not executed, setup receives fail and task is skipped. Unavailable mandatory evidence gives error/unverified with a reason. A claimed pass does not upgrade the independent verdict or erase an earlier-stage error.

An incomplete snapshot does not cancel a proven violation: a protected-file change visible in both snapshots or an unapproved command retains fail. A path missing from an incomplete list does not prove addition/removal. The project checker does not run with incomplete checkpoints.

## Independent expectations

The existing diagnostic oracle retains allowedPaths/protectedPaths, the command and numeric export cases. Additional mechanical fields:

| Stage field | Check |
|---|---|
| `artifacts: [{path, contentHash, fileMode?}]` | Exact bytes and resource permissions when needed; null requires absence. Suitable for a full skill distribution, removed upstream file and mandatory process artifacts |
| `json: [{id, path, pointer, value}]` | Equality of specific manifest fields: repo/SHA/license/resources; only digests enter observations |
| `loading: [{path, contentHash}]` | Separate loading/unverified until a confirmed native observation; metadata and self-report do not give pass |
| `exports` and `modulePath?` | Independent numeric export cases; the default module for the two current diagnostics is `src/math.js` |

Only frozen command `{executable: "node", argv: ["--test"], cwd: "."}` is currently supported. The host uses its own Node, a temporary check copy, empty env and the corresponding stage's limit. A separate `tibicen-oracle.test.cjs` is added to the task copy: it checks original double and new triple with hidden cases. It does not enter the executor's initial/final tree and is deleted with the copy. Bypassing test discovery or a path collision does not count as success. Command content/output is not saved. Other recipes require a separate verified implementation; execution in a copy is not a sandbox.

The hidden test registers an exit check before importing the module and marks completion only after every assertion. `process.exit(0)` during import/check yields a nonzero outcome, even if Node would otherwise accept an empty test file. This checks completion of the trusted local checker; it does not protect against hostile code that removes process handlers.

`gradeMechanicalRun` returns Grade with seq references to observations of its stage. Invariants, command outcome and loading are distinct. The [rubric and paired summary](QUALITY_AND_REPORTS.md) are implemented separately in tasks 2.4–2.5 and calibrated on recorded control grades; semantic acceptance by a real judge remains to be performed. Mechanical grades do not prove a tool's suitability for a user.

## Calibration and limits

`node --test tests/evals/*.test.ts` checks storage/synthetic secrets, positive setup/task, early writing, protected/Git/unapproved-command violations, false task pass without triple, a missing resource with a correct manifest/metadata, wrong bytes/SHA and license, retaining a local neighbor and removing an old resource, mandatory process artifacts, changed inputs/oracle and refusal to substitute host events.

The component/process in this calibration is a synthetic fixed distribution. Canonical external sources, live instruction reading, real OpenSpec transitions and recommendation suitability are not confirmed by it; they remain in tasks 1.3–1.4 and 3.x. Rubric 2.4 is checked separately on recorded grades. A trusted driver must not be treated as a real-agent parser. All harness files, oracle, tests and this documentation are excluded from both Tibicen distributions.
