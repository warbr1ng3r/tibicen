# Evaluation contracts · schema 1

Implementation: scripts/evals/contracts.ts; offline checks: tests/evals/contracts.test.ts. These are harness contracts; the first separate fixtures and fake-process runner are described in [RUNNER](RUNNER.md). Real profiles and live trial results are not ready yet. All objects reject unknown fields and versions; the existing EvalAttempt schema 1 from results.ts remains unchanged.

| Contract | Frozen data |
|---|---|
| Experiment | id, full source SHA, conditionsHash, scenario ids/hashes, profiles, repeats, order of all Tibicen/baseline pairs and launch/setup/task/cost limits |
| EvalProfileSpec | id, agent/version/model, auth route without credentials, paid status, startupHash and permissionsHash |
| EvalScenario | id, isolation, input text files/available dialogue, setup/task with a request and exact command paths/hashes, staged human replies and an id/hash reference to the private oracle |
| EvalEvent | experimentId/attemptId, seq/elapsedMs, stage, kind and strictly allowed structural data |
| Grade | independent id/attemptId, stage, assessment scope, pass/fail/unverified, reason code and event references |

conditionsHash freezes a canonical document containing environment/network/source settings, rubric version/applicable criteria and other comparison conditions; the future runner must verify the contents and their correspondence to the observed environment. The scenario hash is the digest of the complete EvalScenario. Changed conditions, materials or source require a new experiment/cohort. Each scenario/profile/repeat has both variants with unique ids planned in advance; reruns do not replace earlier attempts.

executorScenario creates a separate input copy without the oracle or future human replies. The profile receives only that projection; replies/consent arrive through a separate runner callback after an observed request and exact proposal verification. A reply's presence in a fixture does not create consent. Only the grader receives the private oracle; the runner checks its hash before grading.

The EvalProfile interface defines preflight and run with observations, AbortSignal and a response request. A ready preflight requires confirmed startupControlled/authProtected/processTreeControlled. A hostile scenario requires actually verified hostile isolation; the field type does not create a sandbox. A paid profile requires an explicit positive cost limit; an unknown/inapplicable limit for other profiles is recorded as null. Real profiles, limit enforcement and credential protection remain separate tasks.

EvalGrader receives the scenario, events, schema 1 result and private oracle. Grade is validated separately; a non-unverified verdict must reference events from its stage. These checks confirm reference validity, not judge quality.

Events:

- scenario-started — observed scenario start in the launch stage, not proof of spawn;
- artifact — relative path and beforeHash/afterHash, with null for a missing file;
- command — id, exact commandHash and exitCode/null, without raw argv/env/stdout;
- instructions-loaded — path, contentHash and toolUseId of the observed read;
- stage-finished — exactly the status/duration/reason code of the corresponding result stage;
- usage — cumulative costUsd/inputTokens/outputTokens within the stage, null for unknown usage; the latest observation replaces the previous one, and snapshots are not summed.
- checkpoint / approval / assertion / host-command — independent tree snapshots, exact consent, hashes of checked fields and an executed host check; host-only, not driver messages;
- driver-finished — the driver's stated outcome before independent assessment; stage-finished contains the final stage outcome.

validateRun binds the result to the frozen attempt and scenario hash. Events have consecutive seq and monotonic time, proceeding launch → setup → task; an executed stage requires a final observation. Setup/task wait for an observed start, and task waits for setup pass. A task error preserves setup pass; a rejection before start retains the unlaunched attempt. Outcomes are passed to validateAttempt/summarizeAttempts without experiment metadata.

Disallowed extra fields cannot pass serialization through these validators. A strict shape does not itself sanitize secrets: [observation storage](OBSERVATIONS_AND_GRADERS.md) separately selects fields, checks known sensitive values and avoids saving raw output/context. A synthetic offline check does not confirm real authorization of future native profiles. The harness, scenarios, oracle and this documentation are excluded from distributed skills.

[Rubric and paired reports](QUALITY_AND_REPORTS.md) describe an independent anonymized request, human cross-checking, recorded calibration and separate observed/evaluated summaries over the same schema 1 result. Calibration mode is not mixed with live evidence.
