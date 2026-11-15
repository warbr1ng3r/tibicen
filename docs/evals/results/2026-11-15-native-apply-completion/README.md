# Native apply completion, 15 November 2026

**The corrected-capture native observation passed apply → verify → status →
report.** All four actual CLI JSON results are retained and independently graded.
The [earlier empty-capture grade](../2026-11-15-native-apply-capture/README.md)
remains failed; this is a new directed observation after the owner's request to
finish. The [evidence index](evidence.json) binds private protocols and results.

The change was to the evaluator's invocation method: one frozen helper uses
explicit file descriptors, checks child errors/signals before status and retains
bounded, strict-UTF-8 output. Native restrictions and product code were unchanged.
The inputs were the same 66 baseline files/modes plus that evaluator-only helper;
the two-file proposal, root and digest were unchanged. The prompt now explicitly
selects the corrected helper, so this is not an unchanged-prompt replay.

A separately frozen model-free control first completed the four actual CLI calls
in **3.671 seconds** and passed artifact grading. It is controller evidence, not
native success. Helper checks covered one positive/four negative cases; artifact
grading covered one positive/fourteen negative cases. Independent prelaunch review
found and fixed a source-binding omission before either execution was admitted.

The fresh Codex 0.157.0 session then completed in **43.228 seconds** (driver wall
time **43.279 seconds**), reporting **125,922 input / 725 output tokens**:

| Actual CLI step | Result |
| --- | --- |
| apply | `complete`, exit 0 |
| verify | `passed`, exit 0; **structure-only** |
| status | `complete`, exit 0 |
| report | `complete`, exit 0 |

All captures contain nonempty valid JSON, no child error, no signal and no capture
error. Both approved files exactly match the plan at `0600`; all **63 immutable
named inputs** (including the helper) retain their bytes/modes. Manifest, usage,
session and approved project memory agree; the named temporary session is absent.
Independent event review checked actual native helper invocations and their output
against captures; artifact grading alone is not execution proof.

The two owned containers were stopped, removed and independently confirmed absent;
the disposable native HOME is absent. All 66 host inputs and 22 frozen source
files are unchanged. This package used **one subscription model session, one
model-free container, no caller retries and no new paid API calls**. Historical
generated-memory accounting now contains seven native calls across its separate
packets, not the project's entire history; failed historical usage and monetary
cost remain unknown. No live jobs remain.

This closes the missing native CLI-output acceptance for this exact generated
setup. Loading was assisted; consent was synthetic controller consent. Structural
verification is not application behavior, human approval, automatic loading,
human usefulness or support for every harness. The earlier generated-memory
task/correction/fresh-task observations retain their own results and limits.
Next work is interrupted recovery, adopt preservation and memory use in another
harness. Routine GLM review remains optional external work, not a blocker here.

Only private evaluator helpers and paired documentation changed in this package.
Published **1.5.4** and the distributed candidate are unchanged. Scoped formatting,
links, evidence identities and whitespace are checked; the full source gate was
not repeated after documentation-only work. Its preceding result remains 1,148
passed, 0 failed, 1 existing skip. No commit, push or release is claimed.
