# Proposal

## Why

Tibicen 1.6.0 can inspect and apply infrastructure on Windows, but deliberately refuses project commands because its process cleanup uses POSIX process groups. Windows users cannot obtain actual baseline/final test results from the same approved plan.

## What Changes

- Add a fixed Windows launcher that owns an unnamed, non-inheritable kill-on-close Job Object before starting project code. Preserve real exit codes and stop ordinary descendants on completion, timeout and cancellation.
- Keep exact-plan approval, explicit trust, controlled copies, bounded output, minimal environment and secret redaction unchanged. A missing launcher or failed cleanup remains unavailable, never a passed check.
- Resolve controlled interpreters to absolute `.exe` paths on Windows. Support native argument quoting and a deliberately restricted `.cmd`/`.bat` route for ordinary package-manager commands; reject unrepresentable batch arguments before launch.
- Exercise the actual packaged launcher on Windows runners, including descendants, failures and consent refusals. Keep POSIX behavior covered.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `verification-and-delivery`: Windows command lifecycle and truthful execution evidence under the existing controlled-project-check contract.

## Impact

`scripts/core/execute.ts`, interpreter resolution in `plan.ts`, one dependency-free packaged PowerShell/Win32 helper, executor/CLI/portable tests and the existing platform workflow. The helper uses Windows PowerShell and .NET already present on the supported Windows host; no package installation, service, persistent cache or elevated permission is introduced. Ordinary job descendants are controlled; this is not an OS sandbox or a guarantee against deliberately escaped execution such as WMI. POSIX permission/Windows ACL differences remain explicit. Persisted schemas and the published 1.6.0 release stay unchanged.
