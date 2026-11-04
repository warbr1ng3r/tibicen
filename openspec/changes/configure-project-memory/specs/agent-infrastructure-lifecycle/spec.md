# Spec Delta

## ADDED Requirements

### Requirement: Memory writes have an explicit bounded binding

Only one supported project-relative memory path explicitly bound in the approved plan SHALL receive memory setup writes. Its exact initial edits SHALL use existing consent, path, symlink, forbidden-path and before-content protections. The binding SHALL NOT authorize arbitrary Markdown, application or global-memory writes.

#### Scenario: A supported existing file is selected

- **WHEN** the approved plan binds `docs/memory.md` and its exact changes
- **THEN** only that file and the separately approved instruction changes may be written
- **AND** another Markdown file remains outside the memory permission

#### Scenario: The selected file changes after approval

- **WHEN** the memory body differs from the approved before-content before apply or interrupted-session resume
- **THEN** the stale write is rejected before overwriting it
- **AND** a new plan and applicable approval are required

### Requirement: Mutable memory ownership is separate from stable setup

The stored setup SHALL identify the canonical memory path as user-owned mutable content. After completed setup, checks SHALL retain stable instruction, connection and path-safety checks without requiring the memory body to match its initial hash. An interrupted write SHALL retain exact journal and recovery protection.

#### Scenario: Memory grows after a completed session

- **WHEN** the working agent adds a decision within the approved policy
- **THEN** a later check accepts the changed body without resetting it
- **AND** a missing file, unsafe path or damaged managed instruction remains independently detectable

### Requirement: New memory records fail closed in older runtimes

Memory-aware proposal, manifest and recovery formats SHALL use explicit new schemas that 1.0 readers refuse before writes. The new runtime SHALL retain legacy non-memory reading and recovery, and show memory migration in the reviewed digest. Migration SHALL preserve useful content and earlier session history without silently downgrading ownership.

#### Scenario: An old runtime encounters a memory-enabled project

- **WHEN** a 1.0 runtime reads a new memory manifest or pending memory recovery record
- **THEN** it refuses the unsupported schema before writing
- **AND** the user can continue with the compatible runtime without losing existing content

#### Scenario: An existing 1.0 project opts into memory

- **WHEN** the new runtime proposes the memory feature for a legacy manifest
- **THEN** the migration and exact file changes are included in the approved plan
- **AND** declining memory preserves the ordinary legacy workflow
