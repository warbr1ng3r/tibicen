## MODIFIED Requirements

### Requirement: Structural memory checks recognize permitted nested instructions

Structural memory checks SHALL recognize explicit project-root-relative pointers in permitted existing root and nested instruction files of supported forms, including a fragment targeting a section of the exact canonical memory file. Recognition SHALL preserve safe-read and write boundaries and SHALL NOT establish native loading or task-wide applicability.

#### Scenario: Only an existing nested native rule connects memory

- **WHEN** a safely scanned nested `.cursorrules`, Cursor rule or Claude rule contains the exact canonical project-root-relative memory pointer
- **THEN** verification recognizes that structural connection without requiring a redundant root pointer
- **AND** report keeps applicability, loading and behavioral use unverified without separate evidence

#### Scenario: An unsafe or unrelated file contains a pointer

- **WHEN** the only pointer is in a forbidden path, symlink, unrelated Markdown or unsupported rule extension, or is not the exact supported memory path
- **THEN** it does not satisfy the structural connection
- **AND** inspection does not read excluded content or mutate notes, state or user files

#### Scenario: Recognition does not permit editing a protected nested rule

- **WHEN** a plan attempts to modify a nested native rule outside the existing infrastructure write allowlist
- **THEN** the plan remains rejected as application-protected
- **AND** a structurally recognized pointer does not expand approval or write permissions

#### Scenario: A pointer identifies a section of the registered file

- **WHEN** a permitted instruction contains a Markdown link to the exact registered memory path followed by `#accepted` or an empty `#`
- **THEN** structural verification recognizes the same-file connection
- **AND** read-only verification preserves project bytes, permissions and state

#### Scenario: A similar destination does not identify the registered file

- **WHEN** a link uses a backup filename, prefixed or absolute path, external URL or query-only suffix instead of the exact canonical memory path
- **THEN** it does not satisfy the structural memory connection
