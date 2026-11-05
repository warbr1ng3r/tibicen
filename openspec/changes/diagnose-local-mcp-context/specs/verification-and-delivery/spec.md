# Spec Delta

## ADDED Requirements

### Requirement: MCP diagnosis separates configuration and effective source

Read-only MCP diagnosis SHALL inspect one selected server across explicitly
supplied project sources. It SHALL distinguish supplied host/version, source
selection, configuration validity, disabled state and target launch evidence.
Input order or file presence SHALL NOT establish effective precedence, installed
versions, connection or tool use.

#### Scenario: The same name occurs in two sources

- **WHEN** multiple records define the selected server without a confirmed effective source
- **THEN** source effectiveness remains unverified and records are not merged
- **AND** selecting a source retains its caller-supplied evidence boundary

#### Scenario: Correct local format has unknown target environment

- **WHEN** a valid record is present but target launch context is not established
- **THEN** executable, cwd and required environment availability remain unverified
- **AND** connection and task use do not become successful from configuration validity

### Requirement: MCP config inspection is bounded and redacted

The diagnosis CLI SHALL validate metadata before project reads and read at most
four permitted regular project files, each at most 1 MiB. It SHALL preserve
forbidden paths and reject traversal, sensitive paths and symlinks. Results SHALL
contain names and fixed status/reason data, never raw settings, command/argument
values, env values or exception contents. It SHALL NOT execute or resolve secrets.

#### Scenario: Configuration contains credentials or file substitutions

- **WHEN** a selected configuration contains inline environment data or a file reference
- **THEN** no value, reference content or raw error is returned
- **AND** the referenced file is never read and unsupported content receives a manual limit

#### Scenario: A requested source is unavailable

- **WHEN** source access fails, exceeds bounds or is disallowed
- **THEN** diagnosis records an unavailable source without treating it as an absent server
- **AND** it writes no state or project files and launches no native command

### Requirement: MCP readers retain host format boundaries

Diagnosis SHALL recognize the bounded Claude/Cursor JSON and Gemini JSON stdio
layouts and an explicitly selected OpenCode V2 JSON layout. Remote transport,
ambiguous JSON, unsupported fields and host-specific disable/policy uncertainty
SHALL retain explicit limits. Descriptive readers SHALL NOT expand write adapters.

#### Scenario: Gemini contains a URL and command together

- **WHEN** a Gemini server record has a remote URL as well as a local command
- **THEN** it follows the unsupported remote-transport outcome instead of a valid stdio outcome

#### Scenario: OpenCode override replaces a record

- **WHEN** an explicit effective source selects a V2 record from several definitions
- **THEN** diagnosis uses that complete record without inheriting lower command or environment fields
- **AND** disabled state and unsupported V1/unknown-format data remain visible
