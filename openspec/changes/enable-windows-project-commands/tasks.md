# Tasks

## 1. Command representation

- [x] 1.1 Add Windows native quoting and conservative batch representation with focused round-trip/refusal unit checks; document the accepted batch subset in the design.
- [x] 1.2 Resolve controlled Windows interpreters to native absolute `.exe` paths and reject NUL/Windows shell-or-commit aliases in shared validation; cover refusals and preserve POSIX resolution regressions.

## 2. Controlled execution

- [x] 2.1 Ship the fixed self-job Windows helper and independent bounded result receipt, integrate after existing consent/trust validation, and add actual Windows tests for exits, Unicode/argv, secrets, missing helper, timeout/abort and descendants with/without pipes.
- [x] 2.2 Replace expected Windows nonexecution with real copied-project/standalone CLI checks and extend the existing platform workflow to execute the native lifecycle suite; keep unsupported host/policy failure explicit in the paired documentation.

## 3. Integration and acceptance

- [x] 3.1 Complete independent Ponytail review, fix confirmed findings, run focused and full local gates, build and both isolated standalone self-tests; record exact payload and remaining unavailable checks.
- [ ] 3.2 Run the reviewed candidate on actual Windows CI and retain source/payload-bound results for both Node versions; do not mark native support verified from macOS or mocked platform tests.

## Workflow follow-up

- Prepare a compatible minor release only after actual native acceptance and explicit release authorization. Preserve published 1.6.0 tags, bytes and metadata.
