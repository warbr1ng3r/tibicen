# Evaluation entry points

The main entry for repeatable local diagnostics is `pnpm eval:diagnostic`; `pnpm eval:external` remains available for an arbitrary trusted host module. Import, invocation without arguments and `--help` for either command do not load the driver or launch a process or model. Ordinary `pnpm test` remains offline. The harness and its materials are excluded from both installable skills.

## Repeatable local diagnostics

Repeatable diagnostics do not require writing a host module: [diagnostic.ts](../../scripts/evals/diagnostic.ts) selects a bounded built-in [driver](../../scripts/evals/diagnostic-driver.ts). Without arguments or with `--help`, it only displays help. When `--output` is supplied, the default mode is `dry-run`; it launches neither processes nor models.

```sh
pnpm eval:diagnostic --help
pnpm eval:diagnostic --output .evals-private/diagnostic-plan-001
pnpm eval:diagnostic --mode offline --output .evals-private/diagnostic-offline-001
```

The output directory must be new. It is reserved atomically with mode 0700 before config is read or the driver is loaded; an existing file, directory or symlink is rejected before execution. A race between two commands permits only one directory owner. Files are written through `writeEvalArtifact` with mode 0600 and are not replaced; after a failure, the remaining directory is preserved for investigation, and a retry requires a new path.

`diagnostic.json` is command state, not a verdict on Tibicen. `blocked` means the model was not called (`modelRequests: 0`); the command successfully saves that reason with exit 0. `error` means a command failure with exit 1. `recorded` means a paired report was saved and may contain error/skip/unverified. An unknown native-series request count remains `null`; actual sessions are counted by the existing native runner. Stdout is JSONL: the final line is command state, preceded by any brief progress records from the native runner.

The offline example launches only a [fixed fake process](../../scripts/evals/diagnostic-fake.mjs) through `ProcessProfile`, with empty env and `auth: none`. It has one synthetic `offline-protocol` case, two variants, one repeat, launch/setup/task limits of 1000 ms each and zero model budget. The `profile: fake` route, `provider/model/auth: none`, all limits and the synthetic zero source SHA are visible in `diagnostic.json`; `paired-report.json` is marked `calibration`. This checks runner message exchange, without installing infrastructure, checking OS isolation or assessing live-agent behavior. The corresponding skip outcomes are recorded on unsupported platforms. The example requires no agent CLI, network or credentials.

To check a specific native request, supply JSON with explicit conditions:

```json
{
  "schema": 1,
  "profile": "codex",
  "provider": "openai",
  "model": "gpt-6-sol",
  "auth": "subscription",
  "sourceSha": "<full-reviewed-source-sha>",
  "experimentId": "codex-diagnostic-next",
  "preflightPath": "/absolute/private/ready.json",
  "repeats": 1,
  "maxModelSessions": 16,
  "limits": {
    "launchMs": 45000,
    "setupMs": 180000,
    "taskMs": 120000,
    "maxCostUsd": null
  }
}
```

Replace the source SHA placeholder with the full reviewed SHA, and preflightPath with an explicit absolute path to the saved preflight. Config contains only the listed metadata, without keys, env, arbitrary argv, extra fields or authorization values. This entry does not create a native preflight: it checks saved conditions and the binary hash through the existing profile, without executing it or reading credentials. Missing/invalid fields, an unconfirmed preflight or an unsupported route produce a saved `blocked`, without switching profile, model or API. Config/preflight paths, raw errors and unknown values are not reflected in stdout or the diagnostic artifact.

```sh
pnpm eval:diagnostic --config /absolute/private/request.json --output .evals-private/diagnostic-plan-002
```

Even a complete valid dry-run remains `blocked` with reason `diagnostic-dry-run` and zero model requests. A real series requires a separate explicit `--mode native` with the same config and a new output. This mode delegates to the existing `runCodexDiagnostics`: only Codex CLI 0.157.0 / gpt-6-sol / an existing subscription and the fixed budget above. Its `native/` contains the existing frozen conditions/sessions, while `paired-report.json` remains `observed`. Product loading and usefulness are accepted independently of successful command completion. An API profile, a new monetary budget and other models are not implemented; they remain harness task 3.7. Claude/ZCode still have only discovery/blocked profiles.

[Offline entry tests](../../tests/evals/diagnostic-entry.test.ts) check default/help/import without processes, fake calibration, blocked without fallback, config/errors without synthetic-secret leaks, and refusal to overwrite before execution. The supported native route is checked only with a fake CLI and a separate empty HOME; this is not new native acceptance.

## Invocation

```sh
pnpm eval:external --help
pnpm eval:external run /absolute/path/to/trusted-host-driver.mjs /absolute/path/to/new-report.json
```

`run` explicitly authorizes execution of the selected local host module. This is trusted code owned by the experiment operator, not a downloaded skill, project script or executor input. It may access authorization and models; read and review it before invocation as with any executable host code. There is no default built-in driver/profile. This entry point does not create a sandbox or confirm a preflight itself.

The module exports `async function run()`, returning:

```ts
{
  experiments: ReportExperiment[],
  sensitiveValues?: readonly string[]
}
```

Types `ExternalDriver`/`ExternalRun` are in [external.ts](../../scripts/evals/external.ts); `ReportExperiment` is in [report.ts](../../scripts/evals/report.ts). Supply at least one frozen experiment with all planned slots; actual records and coverage gaps are retained under the [paired-report rules](QUALITY_AND_REPORTS.md). Do not change `calibration` mode to `observed` to present recorded data as a live run.

The host driver is responsible for choosing a confirmed profile, preflight, frozen SHA/conditions/budget/order/repeats, independent trees and setup/task sessions, exact staged consent, limits/descendant stopping and collection of independent assessments. It uses the [contracts](CONTRACTS.md), [runner](RUNNER.md) and [mechanical graders/storage](OBSERVATIONS_AND_GRADERS.md). The executor receives neither the oracle nor future replies. A run function and field names alone do not prove these responsibilities are fulfilled; the actual native profile is confirmed separately.

Credential values are not written into the driver, argv, stdout/stderr or returned experiments. `sensitiveValues` remains host-only and is used for rejection before publication; the list is not copied into the report. The driver does not print raw responses/errors. The CLI does not reflect driver exception text: an error gives exit 1 and fixed `external-experiment-failed`, without a report.

## Report

After the driver finishes, the CLI revalidates experiments, linked records and grades through `buildPairedReport`. Only the selected report projection is saved; the complete scenario/oracle, judge-request excerpts, raw logs and sensitiveValues are not copied into it.

The destination must be explicit. An existing file or symlink is rejected **before the driver is loaded**, so another invocation does not run an experiment merely to overwrite its output. Publication is atomic and never replaces an existing path, even under a race: a temporary file with mode 0600, a new directory with mode 0700, a hard link and removal of the temporary file. Separate intentional invocations are not deduplicated and receive no automatic retry. Old results are retained; a new series requires new ids and a new report path.

Successful command completion means a validated report was saved, not that Tibicen passed or release acceptance is complete. Error/skip/unverified data is preserved. Only actually observed scenarios and profiles are confirmed.

## Offline verification

A working command control without models:

```sh
pnpm eval:external run tests/evals/helpers/external-driver.mjs /tmp/tibicen-calibration-example.json
```

The specified module belongs to the tests and returns only a recorded control in calibration mode. The report path must be new; an existing example is not overwritten. This checks the entry point, not Codex.

[Command tests](../../tests/evals/external.test.ts) check no driver loading without run, correct report/permissions, retention of the old file without repeated execution, an invalid driver, and rejection of a synthetic secret/exception without leakage. [Build tests](../../tests/skills/build.test.ts) check that evals/tests/docs/OpenSpec/dev skills/site/node_modules are excluded from both distributions. Storage regressions check concurrent writing and data separation before await.

Task 2.6 itself does not add a native profile. Subsequent tasks 3.1–3.2 were implemented separately as the [Codex preflight and diagnostic host driver](CODEX_DIAGNOSTIC.md); their explicit invocation and evidence do not change the normal offline route. The [shared native runner](NATIVE_RUNS.md) continues SKILL/PREF/PROC with separate directories for the first three profiles. Claude/ZCode currently have discovery/blocked profiles; live execution requires confirmation. Existing ProcessProfile remains a protocol for trusted offline/auth:none processes.
