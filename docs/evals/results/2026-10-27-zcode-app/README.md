# ZCode app: completed init/adopt acceptance

The two generated-project flows ran on **27 October 2026** in ZCode's normal workspace using the delivered standalone skills. Root inspected the saved evidence and current files on **28 October**; independent artifact review accepted the result. Root did not repeat apply, reset the projects or rerun the tests.

Source provenance: `b5b1c5ea08218fb2e25c9ea7d55c8b2299b22e25`, original source branch `codex/zcode-product-pass`, runtime `0.1.0-alpha.1`. The delivered bundle was **not a Git checkout**. Its unchanged 86-file inventory has SHA-256 `35f743a56b47e4f25743da5d6b6a1e606fb719b3382372384124094711e1b2dc`.

| Case | Applied change | Observed result | External application tests |
|---|---|---|---|
| Init: task CLI | Add minimal AGENTS.md, mode 0600 | apply/status/report complete; infrastructure passed, structure-only | 6/6 before and 6/6 after |
| Adopt: notes API | Remove the Legacy rule section; preserve User decisions byte for byte, mode 0644 | apply/status/report complete; infrastructure passed, structure-only | 6/6 before and 6/6 after |

Root independently matched the approved proposal contents, current AGENTS.md bytes/modes, manifests and 11 protected application/test/package/README files. All 86 distribution hashes still match. Fresh read-only status/report calls returned complete for both cases, with no unfinished session. Raw logs and original executor reports were copied into private evidence before integration.

## Proposal history and consent

The first init proposal (`f470913f…`) incorrectly made the run's temporary source/test preservation boundary a permanent project instruction and cached the six-test count. Root/Codex removed that clause and count, then recompiled with the real CLI. ZCode applied the corrected proposal (`559fc46b…`). Adopt (`6924a75d…`) was unchanged. The original proposal is preserved and the executor reports it was never applied. This was a root-assisted init result, not an unassisted first-pass recommendation.

ZCode's command receipts record exact operator approval before applying the two final proposals. Root did not independently observe the original approval chat; the messages forwarded to root are executor reports, not new consent. The local review note was in the parent workspace beside the assignment, not in the acceptance bundle root. Full digests and evidence boundaries are in the [machine-readable result](results.json).

No CLI/runtime, auth, quota or environment failure was reported during the applied attempts. This does not erase the earlier instruction-content defect and root correction.

## Scope and limits

- Skills were invoked explicitly. Automatic native discovery and instruction loading by a fresh agent session were not observed.
- Tibicen's infrastructure check passed with `scope: structure-only`. Its built-in application check remains `unverified/no-project-checks`; the actual external `node --test` results above do not turn that check green. Task and quiz remain `unverified/not-requested`; no compatibility pairs were tested.
- The scripts created normal project manifests and transient session state, and updated the disclosed local usage counter. Report JSON was saved as artifacts; `report --save` was not used. Project code, tests, package files and READMEs stayed unchanged.
- The follow-up tasks `list --open` and `GET /notes?q=term` remain unimplemented. Generated-project acceptance is not a voluntary human pilot, measured benefit or full agent/platform acceptance. No additional model/API session was started by root.
- During this acceptance exercise, shared product source did not change and the full 668-case suite was not repeated. Subsequent repository review, validation and documentation commits are separate from these run results.

Raw evidence is maintainer-local at the maintainer-local evidence collection; artifact paths in the original executor report are local, not public downloads. The original errors, superseded proposal and root correction remain in that snapshot.
