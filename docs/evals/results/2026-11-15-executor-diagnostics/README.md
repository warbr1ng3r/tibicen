# Executor failure diagnostics, 15 November 2026

**Completed: bounded private executor failure context now survives cleanup.**
The actual-owner regression, final supported-profile synthetic control and full
source gate passed. Two earlier model-free controls did **not** reach that
failure branch and remain negative controls. The historical native failure
remains unexplained; this fixes diagnostic delivery, not a demonstrated product,
network or permission defect.

The [sanitized evidence index](evidence.json) records private artifact hashes,
compact outcomes and the inspected local source snapshot. It contains no raw
transcripts, worker command arguments, stderr text or personal absolute paths. Work is
tracked in [retain-executor-failure-diagnostics](../../../../openspec/changes/retain-executor-failure-diagnostics/proposal.md).
Published **1.5.4 remains unchanged**.

## The concrete gap

The [earlier generated-memory native apply](../2026-11-15-generated-memory-observation/README.md)
stopped at an executor process boundary before a native CLI terminal error was
observed. The owner retained a process exit and `sandboxDenied: true`, but the
command arguments, stderr and full reason were not retained. The removed
container's final transient state and failed-turn usage remain unknown.

The existing opt-in recorder observes CLI `error` and `turn.failed` events. An
executor fault can stop the session and trigger cleanup/cancellation before
either event arrives. The implemented change retains bounded private context at
that producer boundary, before correlation is cleared. It does not change which
commands may run, ordinary nonzero command recovery or the public receipt format.

## What has actually run

| Control                                                   | Observed result                                                                                                                                                                                                              | What it establishes                                                                                                                                                                                                                          |
| --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Ordinary RPC EACCES, before the fix                       | Completed in about 2.73 seconds. A child reported EACCES and exited 1 with `sandboxDenied: false`; the control completed and its container was stopped/removed. No terminal record was captured.                             | This was an ordinary nonterminal command exit, so an empty terminal capture was expected. The initial probe selected the wrong branch; it is not a failing reproduction of the diagnostic gap or a product bug.                              |
| Unsupported restricted-filesystem profile, before the fix | Completed in about 0.68 seconds. Bubblewrap could not create a namespace before the intended child started. Exit was 1, `sandboxDenied: false`; the container was stopped/removed and the private terminal record was empty. | This deliberately different profile is unsupported here. It did not reproduce the old native profile/failure and is not evidence that the product's permissions need changing.                                                               |
| Actual-owner regression, before the fix                   | The focused Node test failed as expected: 1 test, 0 passed, 1 failed, about 112.66 ms. Expected one private failure callback; observed zero.                                                                                 | The test exercises actual owner/session correlation and cancellation with existing Docker/socket mocks, including interleaved processes. This is the red regression for missing diagnostic delivery, not a real-container historical replay. |
| Supported-profile synthetic control, after the fix        | Passed in about 2.90 seconds. Exit 1 and deliberate output text produced `sandboxDenied: true`; one complete private record was retained before failure notification, and the container was stopped/removed.                 | This directly checks installed-route classification and diagnostic retention. No prohibited operation was performed; it does not reproduce or explain the historical native failure.                                                         |

The first two raw receipts and empty diagnostic files are preserved by hash.
Neither ordinary exit 1 nor an unavailable namespace is relabeled as a product
failure to manufacture a red test.

The actual-owner regression command is:

```sh
node --test --test-name-pattern='private executor stderr survives actual owner' tests/evals/container-session.test.ts
```

Separate compact receipts bind the red and green source/test identities; the
failed regression is preserved. After the producer fix, all **139 focused tests
passed, with zero failures**, in about 722.84 ms: 87 session tests, 11 private-writer
tests and 41 actual-caller tests. Scoped lint, formatting and core type checks
also passed.

The green suite covers interleaved starts, capture before cancellation, split
Unicode/credential bytes, invalid framing and sequence, fixed buffer bounds,
ordinary exit recovery and callback-fault cleanup. These mocked regressions do
not replace the final real-container control or required full source gate.

## What the source inspection can say

An **inspected local snapshot**, labeled
`codex-ac21625ddf7f9dd5f34b2802212cf20295fdff95`, contains
`sandboxing/src/denial.rs` and `exec-server/src/local_process.rs`. In those files,
exit status and output keywords feed a likely-denial classification. A sandbox
flag therefore is not itself a full explanation of a failed permission.

Attempts to reopen both commit-specific official GitHub blob pages returned 404. The index hashes the local files; it does **not** claim that the remote
commit was verified, that these files match the installed binary, or that this
code proves the historical cause. The final synthetic control observed the
installed route directly while retaining that narrower distinction.

## The final supported-profile result

The installed **exec-server 0.157.0**, using **linuxSeccomp**, received a deliberate
output-keyword message and exit 1; it reported `sandboxDenied: true` despite no
prohibited operation being attempted. This directly demonstrates why that flag
alone cannot identify the historical permission failure.

The matched complete stderr was retained as **one 625-byte private record**.
The synthetic Bearer credential was redacted. The observed callback order was
`private-capture → failure-notification`, before cleanup; the public receipt
contained no private text. The owner retained its tool-failure result and stopped
and removed the container. Independent closure checks found all three owned
container IDs absent, six frozen source files unchanged, and the diagnostic
directory/file at `0700`/`0600`.

## Limits for the final control and recording

This investigation used exactly **three owned real-container controls**, each
within its **20-second deadline**, and no retries, model sessions, credential
reads or paid API calls. The control allowance is exhausted and no live jobs
remain. Offline mocked regressions did not launch these real-container controls.

The final control used the existing supported native profile: unrestricted
filesystem inside the owned container with its existing network restriction.
It did not weaken permissions or perform a real denied operation to obtain a
result. Its deliberate keyword message and exit code tested the classifier/
retention path, not a recovered historical command.

The opt-in recorder remains owner-private and bounded. It associates
stderr only with a uniquely accepted process start, redacts known credentials
before storage and records explicit gaps when correlation or complete text is
unavailable. It excludes argv, stdout and successful transcripts. Unknown secret
detection is not guaranteed; private error text remains untrusted and unsuitable
for publication. See the [retention guide](../../REPRODUCIBLE_RUNS.md).

## Verification and closure

Outside-checkout copies passed all **110 payload hashes** and both resource
self-tests with isolated HOME and empty tool PATH. The payload inventory remains
`7d2b52de840072b08f8983106611257b5211c96d57a3a41afe49b63138665f90`;
evaluation/OpenSpec tooling is absent from distributed skills.

The first full source gate stopped on caller-test formatting. After formatting,
the second gate exposed **12 profile-test failures**: a new transitive product
import broke the evaluator's portable fixture. The recorder now uses Node
built-ins and local equivalent assertion/hash behavior, without a new module or
expanded fixture. **159 focused tests then passed**. Both integration failures
and their fixes remain recorded; neither explains the old native failure.

Independent read-only Ponytail review accepted the producer, private writer,
caller and connected tests with no actionable findings; the reviewer ran no
tests, containers, models or authorization reads. The third full source gate
passed: **1,149 total tests, 1,148 passed, 0 failed, 1 existing skip**. Its Node
test phase took about 76.02 seconds; this is not the whole pipeline duration.
The gate includes lint, formatting, types, site build, strict OpenSpec validation,
distribution build and offline tests. The index binds source/policy identities,
all three gate records and independent closure checks.

The [change verification](../../../../openspec/changes/retain-executor-failure-diagnostics/verification.md)
records integration and closure. The bounded diagnostic-delivery change is verified; a future separately bounded
observation may use this seam. The old command arguments, stderr, final transient
container state, usage and cause remain unknown. There is no new native apply
success, product/network fix, wider harness support, release, commit or deployment
claim.
