# Offline evaluation runner

Tasks 1.2 and 2.1 of change [build-agent-evaluation-harness](../../openspec/changes/build-agent-evaluation-harness/tasks.md). Implementation is in [fixtures.ts](../../scripts/evals/fixtures.ts) and [runner.ts](../../scripts/evals/runner.ts); formats remain those of [CONTRACTS](CONTRACTS.md). This stage checks harness operation with fake local processes, without models or real authorization.

## Diagnostic fixtures

`loadDiagnostic(id)` loads a strict scenario and separate private oracle, checking id and digest. `scripts/evals/fixtures/` contains two immutable initial sets:

| id | Input | What future acceptance must check |
|---|---|---|
| diagnostic-bare | Small ESM application, double test, CI and team note; no agent infrastructure | Sufficient setup based on actual tasks/commands while preserving the application |
| diagnostic-conflicts | The same application, duplicates in AGENTS.md and an old rule with an incorrect yarn check command | Resolving the contradiction while retaining useful rules and separate owner review |

In both cases, task asks for triple and a test in a new session. During setup, application sources, package.json, tests, CI and the note are protected. Task permits only src/math.js and tests/math.test.js. The check command is defined by the digest of `{executable: "node", argv: ["--test"], cwd: "."}`; the profile freezes the actual Node version before a live series. The hidden oracle also contains independent double/triple cases and preservation/quality criteria; the request contains neither a solution nor a required tool name.

`materializeScenario(scenario, parent)` creates a separate directory each time and writes only `scenario.files`. It returns a projection without the oracle or future replies; an invalid tree is removed. Both variants receive identical initial bytes, and a selected future profile adds Tibicen only to its variant. Before every attempt, the caller must materialize a separate copy: the runner neither reuses nor clears the supplied cwd. Tests check tree contents, independent copies, setup/task separation and non-disclosure of private data. Physical inaccessibility of neighboring directories requires a separate preflight; a temporary directory does not provide it.

## Process execution

`runProcessAttempt({experiment, scenario, attemptId, profile, signal?, reviewReply?})` binds an attempt to frozen scenario ids/hashes and a full profile specification. It returns linked `result/events` through validateRun without changing EvalAttempt schema 1. The oracle is not passed to the child process and is not executed at this stage.

`ProcessProfile` uses the existing EvalProfileSpec and preflight; `command(stage)` defines absolute executable/cwd, literal argv and explicit env. Parent environment is not inherited automatically, and no shell is used. This runner blocks profiles with auth other than none, paid profiles and hostile scenarios; only trusted auth:none/paid:false drivers are checked. The real [Codex profile](CODEX_DIAGNOSTIC.md) and [external command entry](EXTERNAL_RUNS.md) are implemented separately. Profile metadata alone does not restrict the supplied executable's capabilities.

After successful preflight, the setup process starts. Receiving ready confirms the fake scenario's start; spawn alone, exit 0 or file presence do not give launch pass. After setup pass, a new task process starts in its approved working tree, without setup text or its future replies. The launch limit includes preflight and setup startup; setup receives a separate limit after ready. All task startup, including waiting for ready, consumes taskMs. The host measures stage time until process exit/stop; waiting for forced group cleanup is not added to durationMs.

Timeout, cancellation, invalid protocol, excess output and nonzero exit produce an error for the current stage. An earlier setup pass is retained; if setup is not pass, task is skipped. A failed preflight produces an unlaunched attempt with a reason; a preflight exception or timeout is a launch error. The reason code is bounded; raw native errors and stdout/stderr are excluded from returned observations. Usage is not invented: null is allowed, and actual cost enforcement for external profiles is not implemented yet.

Stopping sends SIGTERM to the group, then SIGKILL after 100 ms; leader exit does not cancel escalation. This also applies after successful exit, to avoid background descendants and hangs on inherited pipes. Checks use children and grandchildren that ignore SIGTERM. The mechanism relies on the [Node POSIX process group](https://nodejs.org/docs/latest-v22.x/api/child_process.html#optionsdetached); Windows receives process-tree-unavailable before startup. A process that detaches again can escape the group: such execution requires another verified environment control and is unsupported here.

## Driver protocol and human replies

The trusted driver receives one stdin JSON line: schema, attempt id, current stage, scenario id, available dialogue, current prompt and allowedPaths/allowedCommands. It receives neither the other stage, oracle nor staged replies. Output is JSONL:

- `{kind: "ready"}` — once before actions;
- `{kind: "observation", observation: "artifact" | "command" | "instructions-loaded" | "usage", data: ...}` — only the corresponding EvalEvent fields;
- `{kind: "reply", when: "clarification" | "proposal" | "review", proposalDigest?: ...}` — request for the next human reply;
- `{kind: "finished", status: "pass" | "fail" | "error" | "skip", reason?: ...}` — fake-stage result followed by normal exit;
- `{kind: "error", reason: ...}` — bounded rejection code, also allowed before ready.

At this stage, ready and finished are controlled signals from a fake process. A real profile will need an independent start observation and its own parser; agent self-report does not become evidence. Fake-process statuses confirm harness transitions; the [mechanical wrapper](OBSERVATIONS_AND_GRADERS.md) separately checks tree/consent, resources and task outcome, and downgrades a false pass. Recommendation quality and live loading require subsequent stages.

Unknown fields, repeated ready, actions before ready/after finished, an incomplete line, more than 64 KiB per line or 1 MiB stdout are rejected. While a reply is requested, the driver waits for a response line. Without reviewReply, null is returned: fixture text is not automatic consent. The host receives only the requested staged reply and checks the displayed proposal itself; the runner permits approvedDigest only for proposal/review and only when it matches the requested digest. Clarification cannot approve execution. Matching the digest to the real proposal/paths requires host and grader checks; a test callback does not prove that check. A hung callback is bounded by the stage timer, and a late reply is not sent to a finished process.

## Checks and remaining work

Local command: `node --test tests/evals/*.test.ts`. The fake driver is in tests/evals/helpers/process-driver.mjs and is not itself an agent integration. Test results are not added to the live-trial matrix.

Safe storage, a synthetic authorization boundary and mechanical graders are implemented for offline/auth:none: [description and limitations](OBSERVATIONS_AND_GRADERS.md). The [rubric with recorded calibration and paired report](QUALITY_AND_REPORTS.md) are implemented separately; semantic results from a real judge are not claimed. The [explicit external entry](EXTERNAL_RUNS.md) was implemented in 2.6; [Codex preflight and diagnostics](CODEX_DIAGNOSTIC.md) in 3.1–3.2. Other native profiles remain open. All scripts/evals files, tests, fixtures/oracle and development documentation are excluded from distributed skills. This offline runner itself calls no models and installs nothing into the personal environment.
