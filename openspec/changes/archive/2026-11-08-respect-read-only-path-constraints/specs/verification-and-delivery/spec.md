## ADDED Requirements

### Requirement: Explicit read-only project constraints

Target-project inspection commands SHALL accept an optional bounded `--forbidden-paths` literal JSON array of safe relative paths. The requested exclusions SHALL apply before project-resource reads and combine with active-plan exclusions without weakening them. Exclusions SHALL remain per-operation inputs, without changing completed manifests or report task-context schemas.

#### Scenario: Scoped inspection before and after completion

- **WHEN** scan, status, report or verify receives a forbidden subtree, including after a previous session completed
- **THEN** it excludes that subtree from current reads and instruction/evidence inventory, or reports the unavailable check without reading it
- **AND** it does not create state or treat the earlier plan as a permanent access policy

#### Scenario: Report context and constraints share one invocation

- **WHEN** report receives its existing task-context JSON through stdin and a separate literal exclusion array
- **THEN** both are honored without a temporary request file or a new task-context field
- **AND** the agent carries known user constraints into each recommended inspection invocation

#### Scenario: New scope narrows interrupted work

- **WHEN** an interrupted plan excludes one subtree and the inspection request excludes another or a pending file
- **THEN** recovery reads, scanning, structural checks and report evidence use their union
- **AND** an empty explicit array cannot reopen the active plan's excluded resources

#### Scenario: Stored exclusions are tampered with

- **WHEN** active-plan exclusions change without the matching saved proposal digest or project identity
- **THEN** metadata-only scan rejects the saved state before inventorying project files
- **AND** it reuses the same pure validation as full recovery without running recovery file hashing

#### Scenario: Recovery metadata is not a bounded regular file

- **WHEN** inspection encounters FIFO, directory, oversized or malformed recovery state
- **THEN** it rejects the metadata within the bounded command without waiting on special-file content or reading an oversized body before its size check
- **AND** no inventory or successful current check is fabricated

#### Scenario: Invalid scope or forbidden internal metadata

- **WHEN** the array is malformed, exceeds 128 entries or 64KiB UTF-8, includes a non-string or unsafe path, exceeds 4096 characters per entry, or covers required Tibicen metadata
- **THEN** inspection refuses before project reads
- **AND** one trailing slash on an otherwise safe path is normalized without permitting traversal or absolute paths

#### Scenario: MCP inspection preserves its operation boundary

- **WHEN** MCP diagnosis or project-local MCP verification receives a forbidden source
- **THEN** it leaves that source unread and reports its unavailable result or refuses
- **AND** explicitly selected global Codex configuration does not silently accept a project-only scope
