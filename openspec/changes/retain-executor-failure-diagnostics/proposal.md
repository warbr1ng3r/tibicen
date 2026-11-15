# Proposal

## Why

The generated-memory native apply stopped on an executor fault before the CLI
could emit a terminal error. Its stderr was discarded during cleanup, leaving
only a sandbox flag and no actionable reason. That historical cause cannot be
recovered; new failures need diagnostics at the executor boundary.

## What Changes

- Extend the existing opt-in private recorder to retain a bounded, redacted
  failure record synchronously before executor cleanup/caller cancellation.
- Associate stderr only with a uniquely observed accepted process start; retain
  fixed RPC error messages separately, and disclose missing/invalid correlation.
- Keep public receipts, ordinary command recovery, terminal stopping, isolation
  and default callers unchanged. Exclude argv, stdout and successful transcripts.
- Freeze the new capture policy/source and verify with offline regressions and
  at most three declared model-free controls; no models, auth or paid API calls.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: distinguish public hash-only correlation from opt-in
  owner-private executor failure context and preserve it before cancellation.

## Impact

Development-only container session, private recorder, contained-run integration
and connected tests/guides. No dependencies, distributed skill behavior, runtime
files, version, commit, publication or original observation regrading.
