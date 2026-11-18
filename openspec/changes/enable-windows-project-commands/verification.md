# Verification

## Local integration — 18 November 2026

The implementation is **Unreleased**, based on published 1.6.0. It adds a Windows-only runner after existing approval/trust checks, one fixed packaged PowerShell/Win32 helper, native interpreter lookup and conservative batch handling. Persisted schemas, POSIX process groups and published release artifacts remain unchanged.

The native suite runs both built skills and checks real exits, a forged stdout control message, Unicode/native argument round-trips, a real batch forwarder and refusals, exact extensionless paths, minimal environment/redaction, poisoned project PATH, early/live cancellation, timeout and leader-exit cleanup with inherited/closed pipes, missing bootstrap/helper and a public docs-profile CLI lifecycle. It logs Node/OS and the distribution manifest hash. Synthetic approval applies only to owned temporary fixtures; it does not prove human approval or harness loading.

## Independent review and corrections

A separate Ponytail runtime reviewer inspected the helper, runner, approval/copy callers and quoting. Two confirmed findings were fixed and rechecked:

- Supported `.com` suffixes escaped the common shell/wrapper/commit normalization. The new regression failed before the fix, then passed; the web Bash guard now uses that same normalizer and rejects `.COM`/`.bat` spellings.
- Cancellation left the timeout timer armed until process close, allowing an already cancelled run to acquire `timedOut: true` near its deadline. The first accepted stop now clears that timer; native abort cases require `timedOut: false`. This was a source-level race finding, not a reproduced Windows timing failure.

Root also removed suffix substitution for an explicitly reviewed extensionless entrypoint. `./check` never selects neighboring `check.exe`; native tests cover absent/present exact files with a real neighboring Node executable. The reviewer rechecked the changes and reported no further concrete finding, with **11/11** focused checks passing and native execution still unavailable locally.

## Checks

- First combined gate: **1,172 passed / 2 failed / 2 skipped**. Both failures were the evaluator's fixed 55-file bundle guard after adding two packaged files per skill. The inspected guard is now 57, total 114, and the freeze test additionally checks hashes of both Windows files. The two cases then passed in **12/12** focused evaluation checks. This does not regrade a model observation or weaken the hash checks.
- Post-fix Windows/shared command/profile checks: **23/23 passed**. First-use integration checks: **22/22 passed**.
- Final `pnpm test`: **1,175 passed / 0 failed / 2 skipped**, 1,177 tests, test-runner duration 78.685 seconds. This includes lint, formatting, typecheck, site build, strict current/archived OpenSpec validation, standalone build and the offline tests. The skips are the existing manual portable check and the new actual-Windows suite on macOS.
- Independent temporary standalone copy: **114/114 SHA256SUMS entries matched**. Both skills' self-tests passed outside the checkout with isolated HOME and empty PATH; the temporary copy was removed. Local resource metadata remains version 1.6.0 because no new release is selected.
- Separate `pnpm build`: passed; 114 payload files. The rebuilt manifest matches the isolated check above.
- Payload manifest SHA-256: `072db4514d538a35a02eac97caa0495c0397c9e1e29faf11af9e6c0402542680`.

The normal offline test gate uses synthetic executors, not live provider sessions. No paid API/model observation, new dependency, version bump, commit, push or publication has occurred at this local checkpoint.

## Native acceptance — pending

Task 3.2 stays open. A real Windows runner must exercise the reviewed public source and built payload on Node 22.20.0 and 24.15.0, retaining actual process/CLI outcomes and source/manifest identities. A green macOS gate, mocked win32 or self-test does not establish this. Public branch commit/push and CI require the owner's authorization under AGENTS.md; root has prepared a separate public-history checkout rather than pushing private source history.

System PowerShell/.NET policy may make execution unavailable; Tibicen does not bypass it. Job membership controls ordinary descendants, not filesystem/network permissions or deliberately escaped WMI processes. The batch subset intentionally refuses richer strings. Python/Bash interpreter installation, Windows ACL parity, fresh harness auto-loading and human usefulness are outside these checks.
