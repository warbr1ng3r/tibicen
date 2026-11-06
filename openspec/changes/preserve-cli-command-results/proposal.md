# Proposal

## Why

Prelaunch review found a second premature-stop branch: after the executor returns an ordinary nonzero result, the native caller kills Codex when its CLI emits the corresponding completed command item. The lower-level recovery fix and model-free owner-socket proof remain valid, but they do not establish recovery through the complete native caller.

## What Changes

- Preserve valid completed CLI command results, including failed commands with a concrete exit code, so the current native session can recover.
- Keep terminal CLI errors, failed turns, declined/cancelled operations, failed file changes, unavailable command outcomes and malformed command results terminal.
- Prove the actual caller path with a red-capable mocked transport regression and retain both command results and cleanup.
- Preserve the unexecuted R1 preparation and Needs changes review, then revise its prospective metadata against the repaired source. No native attempt, retry or budget increase is introduced by metadata revision.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: explicitly preserve ordinary results across both executor and native CLI event handling.

## Impact

Development-only contained-codex.ts and focused caller/auth tests, paired reports and existing unexecuted protocol metadata. No distribution, image, permission, dependency, credential or version change. The owner's uninterrupted execution instruction authorizes planning and implementation without the planning skill's default pause. No commit or publication.
