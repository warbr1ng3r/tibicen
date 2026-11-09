# Proposal

## Why

An interrupted agent turn can leave only an opaque error hash. Recognized error clues are aggregated first-match, so a later terminal error can be masked by an earlier notification. Separately, the ordinary 1.5.3 queue observation exposed a documentation/source disagreement copied into new instructions without being resolved.

## What Changes

- Recognize four pinned Codex terminal-message templates as fixed identities without retaining their text or variable suffixes.
- Use one safe error projector for streaming callbacks and final records. Known per-event diagnostics remain visible; unknown errors keep the existing type/hash-only shape and aggregate precedence stays compatible.
- Clarify the instruction-authoring branch for contradictory documentation, implementation and tests by pointing to existing interview/gap handling; an explicit owner decision remains an independent authority.
- Add a small prospective legacy-data conflict control and an explicit owner-decision contrast. These controls do not replay or regrade the closed observation.
- Keep execution/consent/privacy/stop rules, dependencies and published 1.5.3 unchanged. No new native calls, auth repair or release.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: retain allowlisted per-error observations and distinguishable prospective conflict controls without upgrading historical causes or changing failure stopping.
- `agent-infrastructure-lifecycle`: resolve or disclose behavioral disagreements before turning a project claim into an instruction.

## Impact

Development-only Codex profile/collector diagnostics and their existing tests; one shared distributed architecture reference; small authored evaluation fixtures/controls. No new CLI option, runtime schema, package or dependency. The shared reference is Unreleased; versioning remains with later candidate preparation. Old failed observations and unrelated parked work remain intact.
