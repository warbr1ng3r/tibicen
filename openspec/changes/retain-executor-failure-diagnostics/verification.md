# Verification

Date: 15 November 2026, Europe/Moscow. Base revision:
`31f87d993e76bbf546643211980c628c365500f0` plus existing Unreleased work.
This change concerns development-only opt-in diagnostics. Published 1.5.4 is
unchanged. Local payload bytes match the preceding reviewed Unreleased candidate;
this is not a claim of byte equality with the published release.

## Confirmed defect and correction

An actual owner/session regression using existing Docker/socket mocks failed
before implementation: one private callback expected, zero observed. Private
CLI terminal-event recording could not retain an earlier executor failure before
cancellation cleared process correlation. The new synchronous failure hook
retains fixed context plus uniquely accepted, complete stderr or a matched RPC
error message in the existing private recorder, before stop notification.

Policy v2 bounds raw stderr to eight buffers, 16 KiB per process and 64 KiB total.
Ambiguity, framing/sequence/UTF-8 errors and overflow withhold text. Known
credentials are redacted before the final 1,024-byte limit. Ordinary recovery,
default non-capture, public results, failure identity and cleanup are preserved.

Initial producer/writer/caller checks passed 139/139. The first gate stopped on
caller-test formatting; after formatting, the first full test run found 12
metadata-fixture import failures. Importing the recorder's policy from session
had pulled product contracts and their dependency graph into the isolated
fixture. Standard-library SHA-256 and a local assertion preserve identical hash,
error message and code semantics without a new module or expanded fixture.
Post-fix focused profile/writer/session/caller/auth checks passed **159/159**.

## Final checks

- Independent connected-code Ponytail review: **Ship**, no actionable findings.
- Final `pnpm test`: **1,149 total, 1,148 passed, 0 failed, 1 existing skip**.
  Includes lint, formatting, core/landing types, site build, strict active and
  archived OpenSpec validation, distribution build and offline Node tests.
  Node tests took 76,018.565 ms. Their synthetic model counters are not actual
  model calls. Earlier failed gate logs are retained separately.
- Outside-checkout standalone copies: all **110 payload hashes** matched; both
  resource self-tests passed with isolated HOME and empty tool PATH.
  Evaluation/OpenSpec tooling remains absent from those skills.
- Payload inventory SHA-256:
  `7d2b52de840072b08f8983106611257b5211c96d57a3a41afe49b63138665f90`.
- No site behavior changed, so browser tests were not rerun.

Final independent Ponytail/evidence review accepted the paired reports,
roadmap/tracker, guides, changelog and OpenSpec records. All 29 indexed private
artifact hashes/sizes and eight current implementation identities matched.
Root also checked 120 canonical local links across 14 documents and the absence
of raw synthetic text/tokens and personal absolute paths in those public files.
No implementation source changed after the successful full gate.

Local source identities, red/green receipts, full logs and review records are in
`.scratch/executor-diagnosis-20261115/`. Public evidence and its limitations are
in the paired [diagnostic report](../../../docs/evals/results/2026-11-15-executor-diagnostics/README.md).

## Actual executor control

Three independently frozen model-free controls used one owned container each,
with a 20-second limit and no retries. Ordinary unsandboxed EACCES and an
unsupported restricted-filesystem namespace failure both returned
`sandboxDenied: false`; neither is the red regression or a product failure.

After the full gate and independent source review, the final supported-profile
control ran in **2,898.294 ms** using executor **0.157.0 / linuxSeccomp**. Its
Node command only wrote an owned fixture and printed deliberate error words
before exit 1; it attempted no prohibited operation. Nevertheless the installed
route classified `sandboxDenied: true` and retained a terminal process fault.
This directly establishes that the flag can classify by output; it does not
prove an actual permission denial or explain the historical command.

One complete private record, **625 bytes**, retained matched stderr with the
synthetic Bearer secret redacted. Capture preceded failure notification. The
public receipt contained no raw text; private directory/file modes were
0700/0600. All six prospectively frozen source copies matched after the control.
All three containers were stopped/removed, and separate Docker inspection
confirmed their IDs absent. No model sessions, auth reads or paid API calls ran.

## Limits

The historical missing argv, stderr, failed-turn usage and removed container's
final transient state remain unknown. The inspected local executor source is
not verified to match the installed binary; commit-specific remote source URLs
returned 404. The successful control is a synthetic classification/capture check,
not historical replay, native-agent apply success or a product/network fix.

Private text remains untrusted and can contain secrets that pattern filters do
not recognize. Missing or invalid streams remain explicit gaps. This completed
diagnostic package does not expand native-harness coverage or establish human
usefulness. No source version, commit, push or publication is selected.
