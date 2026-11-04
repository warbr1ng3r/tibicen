## ADDED Requirements

### Requirement: Instruction diagnosis distinguishes inventory and loading

Diagnosis SHALL distinguish observed project instruction candidates/directories, bounded adapter facts, unknown selected scope and actual loading/use evidence. File presence or recorded adapter versions SHALL NOT establish active precedence, installed versions, observed loading or behavioral compliance.

#### Scenario: Root and subtree instructions differ

- **WHEN** instruction candidates have different content in different directories
- **THEN** diagnosis retains their distinct directory scopes without declaring a semantic conflict from location alone
- **AND** the working agent explains applicable agent/version/cwd/target context or the explicit limitation

#### Scenario: Structural checks pass without native observation

- **WHEN** instructions and a memory connection pass structural verification but no controlled loading/task observation runs
- **THEN** current loading and behavioral use remain unverified with a reason
- **AND** stored earlier check outcomes remain labeled recorded evidence rather than refreshed success

#### Scenario: Inventory is partial

- **WHEN** scan excludes an unsafe path or reaches an inspection limit
- **THEN** diagnosis exposes the gap and limited coverage
- **AND** it does not claim the whole setup is healthy or select an agent from AGENTS.md alone
