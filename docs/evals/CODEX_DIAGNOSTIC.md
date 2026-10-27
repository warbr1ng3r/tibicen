# Controlled Codex diagnostics

Current production execution is temporarily blocked until a verified process-tree backend is available; a saved ready.json does not enable it. Before using the commands below, see the [current native runner boundaries](NATIVE_RUNS.md). Historical diagnostic results are not recalculated.


Implementation of tasks 3.1–3.2: a [preflight](../../scripts/evals/codex-preflight.ts) and explicit [host driver](../../scripts/evals/codex-diagnostic.ts) for the first two diagnostic scenarios. Ordinary import/help/test does not launch models. Confirmation applies to macOS arm64, the specific CLI/model/route and the recorded conditions; it does not authorize a hostile series or other operating systems.

The current Codex implementation is in [profiles/codex](../../scripts/evals/profiles/codex/profile.ts); the old paths remain compatible. Scenarios, staged consent and reporting are handled by the [shared runner for the first three agents](NATIVE_RUNS.md). The conditions below describe diagnostics 3.1–3.2; new SKILL/PREF/PROC series use their own frozen conditions and do not alter historical evidence.

## Historical preflight

```sh
node scripts/evals/codex-preflight.ts /new/private/probe.json
node scripts/evals/codex-preflight.ts /new/private/observed.json --observe-startup gpt-6-sol
```

Both calls currently return blocked with modelRequests=0 before CLI/auth/model access. In the recorded historical probes, the first used synthetic authorization and native `codex sandbox`; the second added one bounded model startup request through the existing ChatGPT login. The rest of this section records that protocol. JavaScript does not read real credential values: a separate CODEX_HOME receives a temporary link to the existing auth.json, used only by the parent CLI. Project commands cannot access either the link or its source directory. The separate scope is removed after the check. No API key, new authorization or installation into the personal environment is required.

Checks cover reading synthetic authorization from a command and its child, denying external writes, allowing project/skill writes and stopping a child before a delayed write. Isolated startup uses an empty HOME, `--ignore-user-config`, `--ignore-rules`, `--ephemeral`, a separate model, and no inherited credential env, login-shell, hooks/plugins/apps/browser/multi-agent or command network access. Public Node/OpenSSL runtime paths are explicitly allowed; personal directories and host materials are blocked. This is a controlled command profile; permissions of other surfaces are not assumed. Parameters were checked against installed help and the official [permissions](https://learn.chatgpt.com/docs/permissions), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) and [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

Loading means successful observed shell reading of the full contents of the specific AGENTS.md matching the host hash, followed by a completed turn. A response saying “used it” without that tool event does not pass. Before this observation, or on error, blocked is retained with a reason. A model mismatch with the available subscription catalog is not bypassed with an API key: `model/list` is checked, a new model is recorded as a separate profile, and the old rejection is preserved.

## Historical frozen paired series

The host explicitly calls `runCodexDiagnostics({preflightPath, artifactDirectory, sourceSha, experimentId})` from a selected local `.mjs` through [eval:external](EXTERNAL_RUNS.md). A ready preflight and matching binary hash are required; directory/report must be new.

Before the first request, `frozen.json` records the core SHA, 80 distribution files/checksums, executed harness hashes, preflight/profile/conditions, two scenarios, one repeat and the order bare Tibicen → bare baseline → conflicts baseline → conflicts Tibicen. The cohort allows at most 16 model sessions, launch 45 s, setup 180 s and task 120 s; the paid API route is disabled. Observed costs remain null without reliable data. Startup/service probes are counted separately.

Each pair starts with identical bytes and sequentially recreates one canonical project root. The variant difference is both verified distributed Tibicen skills in a separate read-only tool scope. Baseline has the ordinary Codex capabilities under the same restrictions. The executor cannot access the OpenSpec package, developer OpenSpec skills or harness.

Setup/task first propose changes in read-only mode. The host checks exact paths/bytes/command and grants consent only for their digest. For the standard core, it also checks the full kernelPlan: the same edits, root and digest, no installations/MCP/process/execution, and bounded service intent for manifest/state/a counter in a separate HOME. Before apply, that intent is recorded as a separate linked host assertion; dynamic service receipts are checked against schema/actual changes/status/state. Ordinary user files receive no exceptions. This is a native check of the trusted pinned core; it does not approve an arbitrary installer through this route.

Task starts after mechanically completed setup, with a new HOME/CODEX_HOME and a new ephemeral session without setup history. It has its own plan and consent. An independent Node checker runs in a separate protected copy with hidden double/triple cases and assertion-completion checks. The executor does not receive them. Snapshots, actual command/loading events and reasons are preserved; timeout/error/skip are not removed. Cancellation signals stop active groups and prevent subsequent requests.

The independent command is bounded by the stage's remaining time. Startup errors or signal termination do not produce pass. An incomplete tree snapshot is recorded as incomplete, stops project checks and leaves the attempt in the report; an already visible unapproved change remains fail. Preflight handles cancellation using the same group-stopping and temporary-scope removal rules.

This driver is intended for controlled diagnostics, not hostile arbitrary-shell testing. Checking final files does not prove the absence of all possible intermediate actions within one complex shell command. Observed command events recognize only supported literal `node --test`; command text inside heredoc/JSON does not count as execution. Extending the supported syntax requires a separate check.

For the first recorded versions, [collect-native.ts](../../scripts/evals/collect-native.ts) adds available cumulative usage from native turn.completed without models. [native-usage.ts](../../scripts/evals/native-usage.ts) requires complete counters, retains monetary null, relinks seq/evidence and, when the old driver hash is explicitly supplied, reconstructs task startup from host boundaries. Raw data is not replaced; the actually executed harness sources and separate enriched projections are preserved in the results (maintainer-local record; omitted from public source).

The collector checks the frozen conditions digest and each attempt id against its slot. A successful stage requires both transcripts — proposal and apply; for an unsuccessful stage, apply is expected after observed consent. A missing expected file makes the full token total unknown, without substituting the known portion.

## Assessment

Separate observed/evaluated results of the existing paired report are preserved. Native mechanics check read-only behavior, exact diff/scope, the service receipt and the independent task. Semantic suitability/sufficiency/application remain for the independent judge and human sample. Without them, quality is absent and an observed pass does not become an evaluated pass.

The first diagnostic cohort exposed two host-profile defects: matching `node --test` inside proposal data and insufficient permission for the project's `.agents` after consent. Its four records are preserved; the failures are not attributed to the product. The corrected cohort has new experiment/conditions/harness hashes and new outcomes. Old records are neither replaced nor mixed into one fraction. This checks the harness; it is neither statistical proof of usefulness nor the SKILL/PREF/PROC release gate.

[Native protocol/review tests](../../tests/evals/codex-diagnostic.test.ts) remain offline and do not use real credentials or model CLIs. Actual results and limitations are maintained in [verification](../../openspec/changes/build-agent-evaluation-harness/verification.md).
