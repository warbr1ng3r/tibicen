# Native apply and child-output capture, 15 November 2026

**The native agent applied the reviewed files, but full acceptance failed: all
four CLI output captures were empty.** Later model-free controls isolated a
capture/runtime-policy interaction. They do not replace the failed grade or
establish a Tibicen product defect. The [evidence index](evidence.json) binds
private protocols, helpers, results and closure checks. Published **1.5.4 is unchanged**.

## One native observation

After the [diagnostic-delivery change](../2026-11-15-executor-diagnostics/README.md),
one fresh Codex 0.157.0 session used the same 66 inputs/modes, prompt and reviewed
generated-memory digest as the stopped earlier apply, with a new source/recorder
freeze. Synthetic controller consent covered two planned files, declared service
effects and four captures; it was not human consent. Independent prelaunch review
corrected modes, manifest/usage/session binding and execution-evidence limits.
The grader passed one positive and eleven negative model-free controls before GO.

The native turn completed in **41.734 seconds** (driver wall time **41.784
seconds**), reporting **74,697 input / 900 output tokens**. Both planned files,
`AGENTS.md` and `.agents/memory.md`, exactly match the plan at `0600`. All 62
immutable named inputs retain their bytes/modes. Manifest and isolated usage are
complete with matching project/session/memory; the named temporary state is absent.

The observed native helper invoked apply, verify, status and report once each,
using the exact approved digest for apply. All captures report exit zero but
empty stdout/stderr; the helper discarded `spawnSync.error`. The grader correctly
failed parsing empty JSON, and the agent disclosed that gap. Manifest completion
and apply's recorded structure-only check cannot replace standalone CLI results.
A recovered read of a missing reference file remains in the trace. No terminal
executor fault was observed; the empty diagnostic is not proof of nested success.

## Capture diagnosis

A separate **0.990-second**, model-free direct-RPC control reproduced
`status: 0`, `error.code: EPERM` and empty streams for both a synthetic print and
read-only Tibicen status. A **2.753-second**, single-container comparison then
varied capture and inner policy; outer Docker `network=none` stayed unchanged:

| Inner policy | Default pipes | Explicit file descriptors |
| --- | --- | --- |
| Unrestricted filesystem, restricted network | EPERM, status zero, empty streams | No error; expected stdout/stderr retained |
| Same filesystem, enabled inner network | No error; both streams retained | No error; both streams retained |
| Inner sandbox omitted | No error; both streams retained | No error; both streams retained |

This isolates an interaction in the tested Node 24.15.0 / executor 0.157.0 route.
These controls do not establish an internet, credential or Tibicen JSON-generation failure. The exact denied
syscall is unknown. Because the native helper discarded its error field, its
original EPERM remains an inference from reproduction, not direct observation.
The still-earlier executor denial remains unexplained.

## Resolution and closure

The [retention guide](../../REPRODUCIBLE_RUNS.md) now requires checking child errors
and signals before status and using compatible capture without relaxing native
isolation. File descriptors worked with the restricted policy. This changes
evaluation guidance, not product behavior or frozen helpers. Full CLI-output
acceptance still needs a new bounded native observation; no automatic retry is selected.

Independent Codex-specific review checked commands, raw controls, protocol/helper
identities and causal limits. All three containers were stopped, removed and
independently confirmed absent; the disposable HOME is absent. All 66 host inputs
and 22 frozen source files remain unchanged. No live jobs remain. This package
used **one subscription model session, two model-free containers, zero caller
retries and zero new paid API calls**. Earlier five-call accounting remains
intact: these generated-memory efforts now contain six native calls, not the
project's full history. Historical failed usage and monetary cost remain unknown.

No full source gate was repeated for these documentation changes; the preceding
gate remains 1,148 passed, 0 failed, 1 existing skip. A separate user-operated GLM
review packet is ready; no GLM result has been received. Interrupted recovery,
adopt preservation and another harness's memory behavior remain subsequent work.
This report claims no automatic loading, human usefulness, broader harness support,
commit, push or release.
