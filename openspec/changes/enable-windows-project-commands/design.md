# Design

## Context

See [proposal](proposal.md). `runCommand` currently refuses win32 before its POSIX detached-process-group runner. Controlled interpreter lookup also assumes executable bits and extensionless filenames. The portable Windows fixture currently expects an unavailable project check; that expectation must become real execution, not be removed silently.

## Goals / Non-Goals

Keep one platform seam under existing validation and approval. Preserve persisted formats, controlled project copies and POSIX behavior. Do not introduce a package, precompiled binary, elevated privilege, resident process, permanent compilation cache or general shell interface. A process job controls ordinary descendants; it is not a filesystem/network sandbox or protection against deliberate WMI escape.

## Decisions

1. **A fixed packaged PowerShell helper owns its own job before launching code.** The helper explicitly imports `Microsoft.PowerShell.Utility` from its pinned absolute system-module path before JSON parsing or `Add-Type`; project paths and PATH do not select that module. Windows PowerShell/.NET compiles a small in-memory P/Invoke helper. It creates an unnamed non-inheritable Job Object with `KILL_ON_JOB_CLOSE`, assigns itself, then starts the target with `UseShellExecute=false`. Children inherit membership. The helper writes its result and closes the final job handle, terminating itself and remaining ordinary descendants. This avoids taskkill's orphan lookup race and the create-suspended/assign gap if the launcher dies between calls. Missing PowerShell/module, compilation restrictions or job assignment fail closed.
2. **Structured request and separate result.** Node writes one UTF-8 JSON request exclusively into its owned temporary directory, then invokes the fixed helper with literal `-File` / `-RequestFile` paths, that owned directory as bootstrap cwd and ignored bootstrap stdin. The request retains the approved target cwd. Request fields are never interpolated into PowerShell source or transported through environment variables; the helper receives the approved minimal execution environment. Project stdin is separately redirected with `RedirectStandardInput=true` and closed immediately after `Process.Start`, explicitly providing EOF rather than relying on inherited handles. A per-run random result path/nonce carries a bounded structured result outside stdout/stderr. Missing/malformed results are unavailable; helper exit code alone never means project success. Temporary state is removed on every settled path. Same-user trusted project code is not an adversarial isolation boundary.
3. **Two explicit command representations.** Native `.exe` arguments use conventional Windows CRT quoting. Batch files use the fixed absolute system `cmd.exe /d /s /v:off /c`, quoted tokens and a conservative subset: refuse quotes, NUL/newlines, expansion/shell characters, parentheses, trailing-backslash arguments and an overlong command line. This covers ordinary npm-style forwarding without accepting arbitrary shell strings. System bootstrap paths come from the actual Windows system directory, never cwd or project PATH.
4. **One interpreter resolver.** Proposal compilation searches absolute PATH directories; Windows checks native `.exe` names without POSIX mode assumptions. Existing absolute external-executable and reviewed-script boundaries stay in force. An explicit `./` entrypoint is never substituted with a neighboring suffixed file. Executable/cwd NUL and shell/commit aliases with Windows suffixes are refused in shared validation.
5. **Native evidence is mandatory.** Unit checks cover representation and negative input on any host. Real Windows tests cover actual startup, exit codes, Unicode paths/argv, batch forwarding, environment/redaction, early and live cancellation, timeout and ordinary descendant cleanup with/without inherited pipes. The existing manual platform job runs these against the built payload on Windows, alongside portable CLI apply/verify/status/report. [Native acceptance](verification.md#native-acceptance--windows-server-2022) passed on Windows Server 2022 with Node 22.20.0 and 24.15.0; this is not every Windows environment or a harness-loading observation.

6. **Compiler temporary paths remain relative to the owned bootstrap directory.** Explicit `CompilerParameters` reference the loaded framework `Process` assembly by its system location and use `TempFileCollection('.', false)`. Only during compilation, helper-process `TMP`/`TEMP` are `.`; `finally` restores their prior values before the target launches. Relative temporary compiler arguments avoid transporting full Unicode paths to the compiler. This adds no global directory, 8.3-path requirement or dependency. Repository `.gitattributes` sets `* text=auto eol=lf` so text checkout bytes, including packaged helpers, are canonical for cross-platform payload comparisons.

Earlier pipe/file prototypes did not establish an I/O cause. [Diagnostic CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44225584797) completed `ReadAllText` and stalled at the JSON/module-autoload step. A subsequent control with the pinned Utility import passed JSON parsing, `Add-Type` and job opening, but stalled at `Run`. Explicit project EOF is the launch contract correction, not an explanation of every earlier stall. Later [compiler controls](https://github.com/warbr1ng3r/tibicen/actions/runs/44228143393) narrowed the remaining failure to Unicode temporary-output handling: only the ASCII-environment control completed; explicit Unicode `TempFiles` alone did not. The combined relative-path correction passed [CI 44229803132](https://github.com/warbr1ng3r/tibicen/actions/runs/44229803132) on source `7221397bae0679bffbe333d81b338fc55b33c741`; earlier failed attempts keep their outcomes in [the verification record](verification.md).

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
- [CodeDOM temporary-file collection](https://learn.microsoft.com/en-us/DOTNET/api/system.codedom.compiler.compilerparameters.tempfiles?view=netframework-4.8.1): explicit compiler temporary files, including a current-directory collection.

Sources checked 18 November 2026; these platform contracts are design inputs, not evidence that our implementation has run on Windows.
