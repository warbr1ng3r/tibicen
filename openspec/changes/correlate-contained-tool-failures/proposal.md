# Proposal

## Why

The 6 November native working attempt stopped on an executor exit of 1, but its receipt discarded the process/request identity. Two earlier commands succeeded; the retained records cannot identify the later failing operation. Preserve safe correlation for future attempts without rerunning or regrading this failure.

## What Changes

- Retain bounded, session-scoped hashed executor identities and fixed operation facts with the first tool failure.
- Match `process/start` requests, their responses and `process/exited` notifications using the pinned Codex 0.157.0 protocol; missing or ambiguous matches remain unknown.
- Keep raw commands, paths, environment, output and error text out of the diagnostic receipt.
- Preserve this safe failure context in the standard setup profile's existing collection artifact before reporting child failure.
- Preserve immediate failure stopping, containment, cleanup and every historical outcome. Verify the change offline with mocked transport only.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: add safe correlation to development-only contained executor failure receipts, separate from strict attempt records.

## Impact

Development harness `scripts/evals/container/session.ts`, its stdio owner, the standard setup profile's result projection and focused tests. No new dependencies, distributed skill changes, version bump, credentials, model calls, retry, commit or publication. Protocol provenance and the original failure remain in the native first-use report.
