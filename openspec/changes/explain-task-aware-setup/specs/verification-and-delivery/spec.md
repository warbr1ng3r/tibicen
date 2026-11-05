# Spec Delta

## ADDED Requirements

### Requirement: Read-only task context accompanies diagnosis

The report SHALL accept optional caller-supplied harness identity, version,
project-relative working directory and target path. It SHALL validate the entire
context before inspection, preserve existing no-input fields and distinguish
supplied context from observed installation. Context SHALL NOT authorize new
reads, writes, execution or filesystem traversal.

#### Scenario: A nested task has instruction candidates in several subtrees

- **WHEN** context selects a working directory and target path within the project
- **THEN** diagnosis exposes candidate directory relationships to both paths
- **AND** conditional or host-specific rules retain an explicit assessment limit
- **AND** spatial relationships do not establish active precedence or loading

#### Scenario: Unknown or absent host information

- **WHEN** a valid uncatalogued host is supplied or no context is provided
- **THEN** an unknown host remains unknown and absent context preserves existing behavior
- **AND** neither case substitutes a known host or invents an installed version

#### Scenario: Invalid context fails without side effects

- **WHEN** context contains unknown fields, invalid identity/version data or unsafe paths
- **THEN** the invocation rejects the input before project inspection or report saving
- **AND** no state, application files or permissions are changed

### Requirement: Context explanation retains its evidence limits

Task-context diagnosis SHALL label supplied context, documented host facts and
lexical path relationships separately. It SHALL leave expected applicability
subject to host/version/configuration assessment and current loading/use
unverified without their respective observations. Excluded paths and partial
inventory SHALL retain their coverage limits.

#### Scenario: A documented workspace-only host sees a nested file

- **WHEN** a candidate is spatially above the target but the host's native contract is not established
- **THEN** diagnosis does not declare the candidate active from directory ancestry
- **AND** it identifies the remaining host/session assessment instead

#### Scenario: Rules use conditional matching

- **WHEN** a native rules directory contains a candidate with conditional or host-specific behavior
- **THEN** diagnosis marks the behavior for assessment without parsing it as unconditional subtree inheritance
- **AND** no candidate is declared irrelevant solely from that rules file's directory
