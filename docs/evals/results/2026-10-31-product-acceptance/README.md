# Product acceptance diagnostics — 31 October 2026

The bounded standalone recovery check passed. Twelve blind calibration inputs are prepared; human assessment remains pending. Neither result closes full MVP acceptance in the [readiness ledger](../../V1_READINESS.md).

## Partial external package and same-session recovery

This diagnostic used the actual standalone Tibicen CLI on macOS with Node 24.15.0, an owned existing-process project and separate HOME/TMP. Local source was `8f962f9`, public source `8683310`, with runtime bytes from `b08252e`. The unchanged 86-file payload inventory SHA256 was `170fdef9501f0ffb85b7d418bd416364bf6f76fbde046f4c4e9e9bd799669447`. This working payload is still labeled `0.1.0-alpha.1`; it differs from the published alpha and is not a new release.

| Step | Observed result |
| --- | --- |
| Propose/apply without the selected external CLI | Root reviewed the exact fixture plan: two empty process anchors and one generated instruction. Apply returned `manual-action-required`. |
| Interrupt partial provisioning | An approved first-party copy helper copied only the real OpenSpec 1.14.3 `package.json`. Root verified its readiness marker/PID and sent SIGKILL to that helper. |
| Propose against the partial package | The CLI refused with `ENOENT` for the absent entry point. Project/HOME snapshots were unchanged; the original session remained pending. |
| Complete the frozen package copy | All 432 package files matched the source bytes, modes and modification times. This step left the project/HOME unchanged. |
| Review and resume | The new plan changed only the generated instruction's literal CLI invocation. The old digest was refused with `consent-required` without writes; root separately approved the new digest and explicit `resume` completed. |
| Check the result | One session retained its original ID, first attempt and first process-history entry; it now has two attempts and two history entries. Status/report were complete with no pending manual action. Structural/package-resource verification passed; repetition proposed no changes or commands and wrote nothing. |

All 14 pre-existing project files, original package files, installed payload and pinned Node bytes/modes remained intact. The 12 CLI calls completed within 175 seconds of the first proposal, below the frozen 16-call/15-seconds-per-call/480-seconds-total limits, without timeout or repeat. Approvals came from the synthetic fixture operator, not a human participant. No package manager, external OpenSpec code, agent/model, network or project test command was run.

The interruption was of a package-copy helper, not an installer. Dependencies outside the package directory were not copied or installed. The passing check covers structure and the seven registered package resources; it does not prove a runnable external CLI, agent loading, useful process work, distinct-version update or full PROC-03 acceptance. The product report correctly leaves CLI execution, loading and task results `unverified`, and project checks `unverified: no-project-checks`.

Private evidence is retained under `.evals-private/product-acceptance-20261031/process-recovery/`: frozen protocol/inputs, independent prelaunch review, exact fixture approvals, all 12 command receipts, interruption/copy records and final result. Raw receipts contain local paths and stay outside published documentation. The [component contract](../../COMPONENT_INTEGRATION.md) remains authoritative.

## Blind human calibration inputs

The existing 12 synthetic quality controls were converted through the current packet API into unchanged canonical requests, each with all seven rubric criteria. Neutral packet codes and order are frozen. Human-facing files contain 12 blank responses: **84 judgments remain unanswered**. Control mapping, host bindings and existing synthetic mechanical data stay in a separate lead-only directory. No quality grades or human identity were manufactured.

Preparation checks cover canonical requests, request/artifact hashes, complete control/criterion coverage, blank response fields and hidden-answer leakage. Independent review accepted both outputs; one translation link was corrected without changing requests, responses or order, and the original hashes were retained. This prepares an assessment; it does not perform human calibration, independent judge calibration, human cross-checking of actual runs or the real-project pilot. Those remain required under [quality and reports](../../QUALITY_AND_REPORTS.md).

Private preparation is retained under `.evals-private/product-acceptance-20261031/calibration/`. Only its `human/` contents belong in the assessor's copy. The original blank snapshot and lead-only mapping remain separate from any future returned answers.

## Release impact

No product source, dependencies, distribution, version, release assets or deployment changed. This package adds one observed mechanical recovery path and prepares human assessment inputs. Remaining semantic decisions, human observations, pilot/support inputs and exact-candidate delivery remain open. The earlier [six-platform-cell result](../2026-10-30-platform-checks/README.md) and 715-test gate are unchanged; this documentation-only package does not claim a new full-suite run.
