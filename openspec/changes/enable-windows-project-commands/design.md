# Design

## Context

See [proposal](proposal.md). `runCommand` currently refuses win32 before its POSIX detached-process-group runner. Controlled interpreter lookup also assumes executable bits and extensionless filenames. The portable Windows fixture currently expects an unavailable project check; that expectation must become real execution, not be removed silently.

## Goals / Non-Goals

Keep one platform seam under existing validation and approval. Preserve persisted formats, controlled project copies and POSIX behavior. Do not introduce a package, precompiled binary, elevated privilege, resident process, permanent compilation cache or general shell interface. A process job controls ordinary descendants; it is not a filesystem/network sandbox or protection against deliberate WMI escape.

## Decisions

1. **A fixed packaged PowerShell helper owns its own job before launching code.** Windows PowerShell/.NET compiles a small in-memory P/Invoke helper. It creates an unnamed non-inheritable Job Object with `KILL_ON_JOB_CLOSE`, assigns itself, then starts the target with `UseShellExecute=false`. Children inherit membership. The helper writes its result and closes the final job handle, terminating itself and remaining ordinary descendants. This avoids taskkill's orphan lookup race and the create-suspended/assign gap if the launcher dies between calls. Missing PowerShell, compilation restrictions or job assignment fail closed.
2. **Structured request and separate result.** Node sends one UTF-8 JSON request through stdin and closes it. No project value is interpolated into PowerShell source. The child sees EOF, not request bytes. A per-run random result path/nonce carries a bounded structured result outside stdout/stderr. Missing/malformed results are unavailable; helper exit code alone never means project success. Temporary state is removed on every settled path. Same-user trusted project code is not an adversarial isolation boundary.
3. **Two explicit command representations.** Native `.exe` arguments use conventional Windows CRT quoting. Batch files use the fixed absolute system `cmd.exe /d /s /v:off /c`, quoted tokens and a conservative subset: refuse quotes, NUL/newlines, expansion/shell characters, parentheses, trailing-backslash arguments and an overlong command line. This covers ordinary npm-style forwarding without accepting arbitrary shell strings. System bootstrap paths come from the actual Windows system directory, never cwd or project PATH.
4. **One interpreter resolver.** Proposal compilation searches absolute PATH directories; Windows checks native `.exe` names without POSIX mode assumptions. Existing absolute external-executable and reviewed-script boundaries stay in force. An explicit `./` entrypoint is never substituted with a neighboring suffixed file. Executable/cwd NUL and shell/commit aliases with Windows suffixes are refused in shared validation.
5. **Native evidence is mandatory.** Unit checks cover representation and negative input on any host. Real Windows tests cover actual startup, exit codes, Unicode paths/argv, batch forwarding, environment/redaction, early and live cancellation, timeout and ordinary descendant cleanup with/without inherited pipes. The existing manual platform job runs these against the built payload on Windows, alongside portable CLI apply/verify/status/report. No new claim from a mocked platform.

## Risks / Trade-offs

- Cold PowerShell/C# startup adds per-command overhead → count it inside the command timeout; use measured realistic test deadlines and keep pre-cancelled requests launch-free.
- Windows policy may prohibit compilation or nested jobs → return unavailable, retain the reason, never weaken system policy or use a fallback shell.
- Batch parsing has more semantics than native argv → accept only the stated subset and test a real `%*` shim; direct native execution remains available for richer strings.
- Job close terminates the helper too → validate the independent receipt only after the process/pipes close; never use its exit code as the target's result.
- Native Windows execution is unavailable on the developer's macOS host → prepare the exact code and tests locally; record real Windows CI separately before declaring support verified.

## Migration Plan

Keep new work Unreleased and 1.6.0 immutable. Existing plans/state remain readable. Refresh affected candidate checks and resource manifests after integration; choose the next compatible minor only during release preparation. Rollback uses the previous published distribution; project infrastructure is not automatically rewritten.

## Sources

- [Microsoft Job Objects](https://learn.microsoft.com/en-us/windows/win32/procthread/job-objects): inherited membership and kill-on-close.
- [Creation/assignment race](https://devblogs.microsoft.com/oldnewthing/20230209-00/?p=107812): why post-create assignment is insufficient.
- [CRT argument rules](https://learn.microsoft.com/en-us/cpp/c-language/parsing-c-command-line-arguments?view=msvc-170) and [cmd options](https://learn.microsoft.com/en-us/windows-server/administration/windows-commands/cmd).
- [Node 24.15 child processes](https://nodejs.org/download/release/v24.15.0/docs/api/child_process.html): Windows batch launch and environment differences.

Sources checked 18 November 2026; these platform contracts are design inputs, not evidence that our implementation has run on Windows.
