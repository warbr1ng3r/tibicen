# Native acceptance runner

The shared entry point is [native.ts](../../scripts/evals/native.ts); the protocol is in [native-runner.ts](../../scripts/evals/native-runner.ts) and [native-workflow.ts](../../scripts/evals/native-workflow.ts). The first batch explicitly includes `codex`, `claude-code` and `zcode`. Scenarios, consent, budget, checks and reporting do not depend on the Codex output format.


Current state after package 25 (26.10.2026): production native routes return `blocked / native-process-containment-unavailable` before CLI/auth/model access. An old cached ready does not enable execution. A process group does not contain detached descendants; no complete verified backend is available yet. [Checks and boundaries](../../openspec/changes/contain-evaluation-processes/verification.md). Historical live results below remain observations of earlier versions.

## Profiles

The target contract separates the native profile from the authorization method: an API key is the main planned route, while an existing subscription is an alternative to reduce cost. Actual provider/model/auth and cohorts are distinct; a subscription pass does not confirm API access. Current series authorize no additional spending: a paid route does not start without a separately specified budget. The shared runner implementation currently permits only subscription series; generalizing and verifying routes remains open task 3.7.

The next cycle uses existing **Codex and ZCode** subscriptions. The first control run is being prepared for Codex; in parallel, harness task 3.4 prepares a complete ZCode profile and checks whether subscription access applies to the specific CLI build. ZCode plan type and model are not frozen yet. Having a subscription does not make the current discovery/blocked profile ready. Claude Code through API remains the next stage after profile preparation and a separate monetary budget; API-route generalization in task 3.7 remains planned.

| Profile | Directory | Implemented | Still to confirm |
|---|---|---|---|
| Codex | [profiles/codex](../../scripts/evals/profiles/codex/profile.ts) | Production blocked; parser and offline fixture protocol checked, historical live preflights retained | Complete process-tree backend, new preflight and live SKILL/PREF/PROC/quality |
| Claude Code | [profiles/claude](../../scripts/evals/profiles/claude/preflight.ts) | CLI discovery, `--version`/`--help` with empty HOME, rejection of unverified startup | API-key startup, key isolation, monetary budget, tools/parser and live series |
| ZCode | [profiles/zcode](../../scripts/evals/profiles/zcode/preflight.ts) | CLI discovery from PATH/desktop, desktop 3.14.4 / CLI 0.16.9; separate fake-verified stream-json parser, four blockedBy | Protected startup/auth/fs/process route, live tools/loading and series |

Discovery does not perform login, prompt, installation or a model request. A missing CLI gives `native-cli-unavailable`; a found CLI remains `native-process-containment-unavailable`. CLI presence alone does not give ready. Cached ready does not replace a verified current boundary; the loader retains blocked. The shared runner preserves both slots of a blocked pair without launching Codex, reading authorization or loading model resources.

In the historical Codex route, the exact model came from a successful preflight and was bound to profile id/specification/argv; pinned CLI 0.157.0 and the binary hash were retained. That protocol is now available only to an explicitly named code-only trusted fixture loader without auth links; the production loader remains blocked. A default value alone does not confirm access: on 26.10.2026, `gpt-6.1-sol` received `model_not_found` in the current subscription CLI route, while a separate explicit `gpt-6-sol` probe completed with observed AGENTS.md reading and `turn.completed`. These are distinct retained probes; loading a profile does not substitute the model. The `model/list` catalog does not replace a successful turn.

By default, ZCode is searched for in PATH first; macOS also checks `/Applications/ZCode.app` and `~/Applications/ZCode.app`, with entrypoint `Contents/Resources/glm/zcode.cjs`. The bundle is invoked through the current Node using an argv array, without opening the GUI. Version/help use empty HOME/TMPDIR and a separate ZCODE_DATA_BASE_DIR. Runtime and entrypoint have separate hashes; desktop version does not replace the bundled CLI version. Another `.cjs` path may be supplied explicitly; an explicitly selected missing CLI is not replaced by another installation. Actual discovery (maintainer-local record; omitted from public source) is not a ready preflight.

A ready profile provides the shared runner only its own launch/check commands, permissions, skill paths, HOME preparation and normalized messages, tool commands, start/end indication and usage. CLI flags and native records are parsed inside the profile. Old `codex-diagnostic.ts`/`codex-preflight.ts` paths remain compatible entries; observed older series retain an archive of the executed sources.

Claude Code supports an API-key route; a subscription is not a prerequisite for that profile. The specific provider, model and monetary budget are frozen before requests; [Anthropic API is one official option](https://support.claude.com/en/articles/12304248-manage-api-key-environment-variables-in-claude-code). This is an integration plan: the current Claude profile remains discovery/blocked, and the shared runner is still limited to subscription series with `maxCostUsd: null`. Paid execution requires implementation and verification of the API profile, key isolation and monetary cap first. Having or lacking a subscription does not itself confirm API-route readiness.

The 26.10.2026 control (maintainer-local record; omitted from public source) retained the first Codex SKILL pair with two setup errors and a blocked ZCode pair. Protocol fixes were made after the series; no new live pass is claimed. ZCode details are in the installed-build investigation (maintainer-local record; omitted from public source).

## Interpreting hybrid runs

1. **Separate native compatibility from model portability.** Native compatibility requires observing skill discovery/loading and tool use through the actual agent. Sending skill text to a model through a shared API loop checks instruction portability; it does not establish native-agent compatibility.
2. **Freeze the execution configuration.** Record the agent/CLI/SDK version, model, backend/provider, authorization class without secrets, tools/permissions, global instructions, skill/fixture hashes and limits. A result applies to that configuration; changing the backend creates a separate configuration.
3. **Compare Tibicen with a baseline within each configuration.** Use the same tasks, clean starting state, tools and limits, with Tibicen as the difference between variants. Report the change in outcomes and all errors/skips; comparing different agent configurations does not establish which model is better.

## Explicit invocation

Complete local runs/transcripts, source mirrors, judge packets and host drivers are saved outside the repository or in ignored `.evals-private/`. This is a storage-location convention: an arbitrary other path does not become private automatically. `docs/evals/results/` contains only separately selected and reviewed public projections; personal auth/config and complete logs are not copied there.

A trusted host module for [eval:external](EXTERNAL_RUNS.md) explicitly selects the profile, prepared ids, immutable conditions and new paths:

```js
import { runNativeAcceptance } from '/absolute/checkout/scripts/evals/native.ts';
export const run = () => runNativeAcceptance({
  profile: 'codex',
  preflightPath: '/new/private/ready.json',
  artifactDirectory: '/new/private/native-series',
  sourceSha: '<full-reviewed-source-sha>',
  experimentId: 'skill-proc-series-1',
  scenarioIds: ['skill-01', 'proc-01'],
  sourceMirrorPath: '/new/private/pinned-github-responses.json',
  repeats: 1,
  maxModelSessions: 24,
  limits: { launchMs: 45000, setupMs: 180000, taskMs: 240000, maxCostUsd: null },
});
```

These are example parameters; the current production route saves blocked without CLI/auth/model access. The example does not authorize a new series or claim the budget is sufficient. Session count includes clarifications and a revised proposal after a user correction. The budget applies to the whole cohort; exhaustion preserves remaining attempts without retry or paid API fallback. Tasks start only after successful setup, with a new HOME and a new session without its dialogue.

For discovery, the host explicitly calls `preflightZCode()` with automatic lookup or `preflightZCode(binaryOrCjs)`, or `preflightClaude(binary)`, and saves the result through `writeEvalArtifact`. For sources, separate model-independent `captureNativeSources(filename)` obtains real public GitHub responses and checks them with product `validateSources`/`fetchSourceFile`. Capture does not replace repository metadata with synthetic data; age, provenance, license or hash errors block the material. Ordinary tests use an explicitly synthetic transport.

In Ponytail scenarios, both variants receive the same verified mirror of pinned responses. Project Node accesses it through a read-only preload, without real command network access or fallback for an unrecorded URL/method. All selected SHAs/bytes are rechecked against fixtures. OpenSpec 1.14.3 comes from a separately verified development package with a complete resource/integrity check; native init/update and application dependency installation do not run automatically.

Expanded permissions for these resources require a new synthetic runtime probe before model requests. If a private synthetic file can be read or tools are unavailable, every slot receives `native-runtime-boundary-unverified`. The host oracle and hidden assertions remain outside executor scope. This is a controlled profile; the hostile initializer stays blocked.

## Consent and evidence

Setup and ordinary task use read-only proposal → exact consent → apply. A clarification reply is supplied only after a question; PREF-03 requires a new proposal after a correction, and refusal stops setup before consent and writing. A sufficient state can pass without an apply session. For a full kernelPlan, the host separately checks root/HOME, matching displayed files, pinned sources/resources/license, component ownership, process and service intent. After apply, it checks the real receipt, history, provenance and files. This intent does not authorize compat, built-in checks, MCP, installers or additional models.

A PROC task has three approvals: `specification` permits proposal/spec/metadata; `plan` permits design/tasks; `implementation` permits application/tests and task marks. Allowed paths are separate from the required artifact set in `interaction.planning`, included in the frozen fixturesHash and public protocol. PROC-01 requires nonempty proposal/spec/tasks; conditional design may be skipped only with an explicit `skipDesignReason`. PROC-02-adopt/update directly require design/tasks. Before approval, the gate checks existing files with the exact proposal overlay; absence, empty content or removal of a required file is rejected before the apply session.

Before plan approval, the host checks prospective planning in a separate synthetic copy through fixed pinned `status` and `instructions apply`; this is disclosed read-only diagnostics without application execution or code apply. State=ready and isPlanningComplete are saved separately with plan/proposal hashes and skip reason; an incomplete graph is allowed only with a reviewed conditional design omission. Planning consent does not authorize code. Before implementation, a separate prepared review reply is supplied with the checked artifact-set context. The host independently runs approved Node assertions and strict OpenSpec validate in a protected copy with the stage's remaining time. Updating requirements does not recalculate historical results.


Read-only commands `openspec --version`, `openspec --help`, `openspec validate --help`, `openspec version --help` and `openspec version --json` are allowed only for the separately verified pinned CLI with the exact specified argv. In OpenSpec 1.14.3, `version --json` reads local version/installation location; `version --check` is not included in the exception. These commands do not run the application or authorize checks/changes. Other commands retain frozen-allowlist and consent requirements.

A snapshot after each phase checks exact effects. Loading counts as fact only through tool reading of the specific AGENTS/SKILL bytes or a separate OpenSpec template, not the executor's claims. Limitation: literal cat/sed/head and known Node/OpenSpec recipes are supported; final snapshots do not prove the absence of all intermediate actions inside an arbitrary complex command. This is not a hostile sandbox.

Malformed JSON values and a missing session-owned start event are recorded as errors without aborting remaining slots. UTF-8 is decoded across stream chunks. Literal recipes require separate tokens divided by spaces/tabs: a joined executable/argument and a newline are not accepted as an approved command. After an apply error, the snapshot is still compared with the latest consent; a proven protected-file change remains an invariant fail, while an unfinished approved change does not itself become a safety violation.

Timeout excludes pass even if the parent exits 0: descendants may hold stdout open until the group is stopped. This applies to both runtime probes and independent checks; an outcome unfinished by its deadline is not successful.

Before approval/apply, the host checks mandatory literal commands of a non-planning phase; they are listed in the protocol in advance, while hidden assertions remain private. An incomplete proposal is rejected without an apply session, and commands are not added automatically. For kernelPlan, a `proposal-sha256:<digest>` reference to successful compiled stdout of the current proposal session is preferred; the host checks it against envelope.digest and digest(proposal), without reading files, repairing data or compiling intent. A complete JSON envelope remains valid. Core intent has commands=[], checks={}, compat.enabled=false; mandatory checks are approved only in the outer commands. After approval, the agent receives an exact read-only plan file and a prepared shell-quoted invocation of the selected installed CLI with root/plan/digest. Outer commands are explicitly listed in full; the agent runs them and ends the session after the approved effects/checks. The host does not apply the kernel automatically; the plan file is removed before the next session even on error, and cleanup failure cancels the queue. The runtime probe confirms readable/write-denied/unchanged synthetic canary in advance.

`frozen.json` binds the profile, fixtures, quality plans, permissions/runtime probe, harness sources, sources and budget. Each attempt saves its run, an index of all proposal/apply sessions with hashes, and selected quality evidence linked to the run digest. [collect-native.ts](../../scripts/evals/collect-native.ts) enriches them without models: normalized counters are summed per stage, unknown/lost sessions retain null, and evidence references are relinked to new seq. Substitution of trace/index/run is rejected. The judge packet and linked run are saved separately; this code performs neither judging nor the mandatory human sample. Observed pass does not become evaluated pass.

Session receipts inside the run also bind the index contents: a row cannot be removed to reduce usage. Refusal after proposal retains setup=skip and already observed proposal usage; a task that did not start receives no invented counters.

In the judge packet, identical reading of the same content within setup/task is selected once; all original tool events remain in the run. This keeps repeated reads within the selected-evidence limit while retaining separate facts for new versions and a fresh task session. Observed proposal cost is counted even after setup refusal; unknown cost is not replaced with zero.

Offline controls are in [native-workflow.test.ts](../../tests/evals/native-workflow.test.ts). They explicitly select `runTrustedNativeFixtureAcceptance` / `runTrustedCodexFixtureDiagnostics`, rather than a JSON or CLI parameter. These code-only entries are only for trusted fixtures and do not bypass the production gate. The fake CLI checks the protocol and real independent Node/OpenSpec checks; its synthetic boundary result does not confirm OS isolation or a live model's ability. Item 3.6 remains open until an observed series and assessment.

## Safe session diagnostics

Contained direct-run receipts now retain `toolFailure` as null or a fixed RPC/process-exit kind with a safe integer code (null if unavailable). Only the failure that starts stopping is recorded; arbitrary method names, IDs, messages, command arguments and output are excluded. Rejected post-run profile validation returns `sourceUnchanged: null` (unverified); success requires true. [Offline regression and limits](../../openspec/changes/containerize-native-evaluation-execution/diagnostics-verification.md). Historical outcomes are unchanged; diagnostics do not authorize a retry.

New session traces contain optional timing: UTC startedAt/endedAt and monotonic durationMs of the CLI process; these are not HTTP timestamps. Codex diagnostics saves only a confirmed scalar value/source: HTTP status, known server code, numeric Retry-After and request-id hash. Unknown fields and internalRetryCount are null. stderr is capped at 65536 and raw content is not saved; terminal error/turn.failed in new sessions contains only type/detailHash after extracting hints. Other records/commands/usage are unchanged. Additional fields enter the trace hash/receipt; old traces/collector remain compatible and are not recalculated. Generic429 does not prove subscription exhaustion or authorize a retry; analysis and knowledge limits (maintainer-local record; omitted from public source).

Bounded eval-only `createNodeCheckContainment` checks macOS no-fork and Node child/worker/addon/execve denial, uses fixed argv and rejects loader environment, including inherited keys. OS policy prohibits signals to the supervisor; denial is checked before test execution. The caller supplies its filesystem policy; it does not contain a complete native CLI. The new ZCode failure projection (maintainer-local record; omitted from public source) was checked through a public SDK synthetic adapter; the real cause of the earlier provider failure remains unknown.
