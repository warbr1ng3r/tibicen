# Verification

## Initial local integration checkpoint — 18 November 2026

The implementation is **Unreleased**, based on published 1.6.0. It adds a Windows-only runner after existing approval/trust checks, one fixed packaged PowerShell/Win32 helper, native interpreter lookup and conservative batch handling. Persisted schemas, POSIX process groups and published release artifacts remain unchanged.

The native suite runs both built skills and checks real exits, a forged stdout control message, Unicode/native argument round-trips, a real batch forwarder and refusals, exact extensionless paths, minimal environment/redaction, poisoned project PATH, early/live cancellation, timeout and leader-exit cleanup with inherited/closed pipes, missing bootstrap/helper and a public docs-profile CLI lifecycle. It logs Node/OS and the distribution manifest hash. Synthetic approval applies only to owned temporary fixtures; it does not prove human approval or harness loading.

## Independent review and corrections

A separate Ponytail runtime reviewer inspected the helper, runner, approval/copy callers and quoting. Two confirmed findings were fixed and rechecked:

- Supported `.com` suffixes escaped the common shell/wrapper/commit normalization. The new regression failed before the fix, then passed; the web Bash guard now uses that same normalizer and rejects `.COM`/`.bat` spellings.
- Cancellation left the timeout timer armed until process close, allowing an already cancelled run to acquire `timedOut: true` near its deadline. The first accepted stop now clears that timer; native abort cases require `timedOut: false`. This was a source-level race finding, not a reproduced Windows timing failure.

Root also removed suffix substitution for an explicitly reviewed extensionless entrypoint. `./check` never selects neighboring `check.exe`; native tests cover absent/present exact files with a real neighboring Node executable. The reviewer rechecked the changes and reported no further concrete finding, with **11/11** focused checks passing and native execution still unavailable locally.

## Checks at the initial checkpoint

- First combined gate: **1,172 passed / 2 failed / 2 skipped**. Both failures were the evaluator's fixed 55-file bundle guard after adding two packaged files per skill. The inspected guard is now 57, total 114, and the freeze test additionally checks hashes of both Windows files. The two cases then passed in **12/12** focused evaluation checks. This does not regrade a model observation or weaken the hash checks.
- Post-fix Windows/shared command/profile checks: **23/23 passed**. First-use integration checks: **22/22 passed**.
- Final `pnpm test`: **1,175 passed / 0 failed / 2 skipped**, 1,177 tests, test-runner duration 78.685 seconds. This includes lint, formatting, typecheck, site build, strict current/archived OpenSpec validation, standalone build and the offline tests. The skips are the existing manual portable check and the new actual-Windows suite on macOS.
- Independent temporary standalone copy: **114/114 SHA256SUMS entries matched**. Both skills' self-tests passed outside the checkout with isolated HOME and empty PATH; the temporary copy was removed. Local resource metadata remains version 1.6.0 because no new release is selected.
- Separate `pnpm build`: passed; 114 payload files. The rebuilt manifest matches the isolated check above.
- Payload manifest SHA-256: `072db4514d538a35a02eac97caa0495c0397c9e1e29faf11af9e6c0402542680`.

The normal offline test gate uses synthetic executors, not live provider sessions. No paid API/model observation, new dependency, version bump, commit, push or publication has occurred at this local checkpoint.

## Authorized Windows CI — 18 November 2026

After that initial checkpoint, the owner explicitly authorized source commits, the public projection branch push and native CI. Private source history was not pushed. Release publication is outside this authorization. The failed attempts below remain failed; later diagnostic progress does not regrade them.

| CI run | Public source | Retained outcome |
| --- | --- | --- |
| [44221666908](https://github.com/warbr1ng3r/tibicen/actions/runs/44221666908) | `220769c` | Failed: startup/portable timeout. |
| [44222670618](https://github.com/warbr1ng3r/tibicen/actions/runs/44222670618) | `8963260` | Failed: bounded probe left the startup cause unknown. |
| [44223233797](https://github.com/warbr1ng3r/tibicen/actions/runs/44223233797) | `3eed757` | Failed: coarse `New-Object`/encoding probe did not isolate the cause. |
| [44223674498](https://github.com/warbr1ng3r/tibicen/actions/runs/44223674498) | `c0143ed` | Failed: coarse input/JSON probe remained inconclusive. |
| [44224322116](https://github.com/warbr1ng3r/tibicen/actions/runs/44224322116) | `ea083cd` | Failed: LF pipe prototype did not establish a working lifecycle or an I/O cause. |
| [44224917757](https://github.com/warbr1ng3r/tibicen/actions/runs/44224917757) | `b2ffeb7` | Failed: private request-file transport alone did not resolve startup. |
| [44225584797](https://github.com/warbr1ng3r/tibicen/actions/runs/44225584797) | `3a4045c` | Failed: split probe completed `ReadAllText`, then stalled at JSON/module autoload. A pinned Utility control passed JSON, `Add-Type` and job opening, but stalled in `Run`. |
| [44225983954](https://github.com/warbr1ng3r/tibicen/actions/runs/44225983954) | `2ceaf72` | Failed overall: all 28 leaf process fixtures passed; both CLI lifecycles remained unverified. |
| [44226520891](https://github.com/warbr1ng3r/tibicen/actions/runs/44226520891) | `b2e6765` | Failed: verify reported `process-tree-unavailable`. Review confirmed a separate web `.COM` guard gap; its red regression was fixed and 34 focused checks then passed. |
| [44227046420](https://github.com/warbr1ng3r/tibicen/actions/runs/44227046420) | `7c81452` | Failed: probe failed at `Add-Type`; the diagnostic exception insertion missed Windows CRLF, leaving the actual cause unknown. |
| [44228143393](https://github.com/warbr1ng3r/tibicen/actions/runs/44228143393) | `ba1fcf0` | Failed overall: original `Add-Type` failed with a Unicode output directory; only the ASCII-environment control completed with exit 0. Explicit Unicode `TempFiles` with unchanged environment still failed. |
| [44228883842](https://github.com/warbr1ng3r/tibicen/actions/runs/44228883842) | `cb8f45a` | Failed: explicit Unicode `TempFiles` combined with removed `TMP`/`TEMP` still left the CLI unavailable. |

The root local gate at the intermediate checkpoint passed **1,176 / 0 failed / 2 skipped**, 1,178 total, with test-runner duration **80.332 seconds**. The previously reported `43538cbb37a4e97e29ee49bd826d091c5b8b9f67e88a760b6b97ef18e53b67f8` manifest belongs to the Windows CRLF checkout payload, not the root's local payload. The earlier `072db451…` manifest and 1,177-test gate identify only the initial checkpoint. Neither is the final relative-path candidate identity.

Full public offline CI [44228918273](https://github.com/warbr1ng3r/tibicen/actions/runs/44228918273) **passed** on `cb8f45a`; this is not a native Windows lifecycle pass. The next public source `7221397` runs the helper from its owned temporary cwd, pins the framework assembly, and uses relative `TempFiles('.')` plus compile-only `TMP`/`TEMP='.'`, restored in `finally` before the unchanged target cwd is used. No global directory, 8.3-path assumption or dependency is introduced. New `.gitattributes` canonicalizes text checkouts to LF; prior platform-specific hashes remain historical.

## Native acceptance — Windows Server 2022

Native CI [44229803132](https://github.com/warbr1ng3r/tibicen/actions/runs/44229803132) **passed all six platform cells** on public source `7221397bae0679bffbe333d81b338fc55b33c741`. Both Windows Server 2022 cells completed the native process suite for both built skills and portable CLI lifecycle: [Node 22.20.0](https://github.com/warbr1ng3r/tibicen/actions/runs/44229803132/job/134551767405) and [Node 24.15.0](https://github.com/warbr1ng3r/tibicen/actions/runs/44229803132/job/134551767742). The four macOS/Linux cells passed their portable checks. This is observed Windows execution for that runner and source, not mocked win32, every Windows environment or harness auto-loading.

The final root local gate passed **1,176 / 0 failed / 2 skipped**, 1,178 total, in **78.41613 test-runner seconds**. Root and an independent public-source build produced the same LF payload manifest: `aa986f71cf6ea76608ea9b72ff0a31f5420efd0db3dc0009b574fd320472243a`. CI logs record their own manifest; the returned Windows hash and exact native counts have not been independently read, so Windows-to-root hash equality is not claimed. The earlier failed runs remain failed. Current source changes stay **Unreleased** with package/resource version 1.6.0; published 1.6.0 artifacts remain unchanged. Documentation closure preserves this executable payload.

System PowerShell/.NET policy may make execution unavailable; Tibicen does not bypass it. Job membership controls ordinary descendants, not filesystem/network permissions or deliberately escaped WMI processes. The batch subset intentionally refuses richer strings. Python/Bash interpreter installation, Windows ACL parity, fresh harness auto-loading and human usefulness are outside these checks.

Final isolated standalone check: all **114/114** payload hashes matched, and both self-tests passed outside the checkout with isolated HOME and empty PATH. The temporary copy was removed.
