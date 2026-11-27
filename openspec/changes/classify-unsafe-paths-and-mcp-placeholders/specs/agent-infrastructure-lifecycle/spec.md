## ADDED Requirements

### Requirement: Unsafe change paths are classified before other per-change refusals
Proposal planning and plan application SHALL report unsafe-path for every path-escape form of a change path, including backslash separators, parent-directory segments, absolute locations and an escape from the internal state prefix. For an individual change this classification takes precedence over its internal-state, application-protection and staleness classifications; plan-level refusals such as a missing resume consent, a tampered session or an invalid plan keep their own codes.

#### Scenario: A path-escape form is proposed or saved
- **WHEN** a proposal or a saved plan carries a change path with backslash separators, parent-directory segments or an absolute location and no plan-level refusal applies
- **THEN** proposal, apply and resume refuse it with the code unsafe-path
- **AND** no project file and no Tibicen state is written

#### Scenario: A valid application path is proposed outside a new empty project
- **WHEN** a change path is safe but outside the infrastructure write boundary
- **THEN** the refusal keeps the code application-protected

#### Scenario: A change carries no path
- **WHEN** a proposed change has no path in an existing nonempty project
- **THEN** the refusal keeps the code application-protected

### Requirement: MCP configuration inspection recognizes complete placeholder values
Inspection of Claude Code and Cursor MCP configuration, covering verification, planning and execution-trust comparison, SHALL exempt only complete placeholder values: a whole environment reference, an angle-bracket identifier, a redaction marker or an all-asterisk mask. Partial placeholder prefixes and reference values mixed with literal text SHALL remain literal secrets. A literal value under a secret-like key SHALL still be refused, and its value SHALL NOT appear in any result.

#### Scenario: A documented placeholder is configured
- **WHEN** an environment entry under a secret-like key holds a documented placeholder such as an angle-bracket value
- **THEN** verification, planning and execution-trust comparison do not report an inline secret
- **AND** the remaining verdict belongs to the rules of the selected format, not to secret inspection

#### Scenario: A literal credential is configured
- **WHEN** an environment entry under a secret-like key holds a literal value anywhere in the configuration
- **THEN** verification and planning report existing-inline-secret, and execution-trust comparison refuses the change
- **AND** the literal value is absent from every result

#### Scenario: A partial placeholder or mixed reference is configured
- **WHEN** a secret-like entry contains an unclosed or suffixed placeholder, or literal text before or after an environment reference
- **THEN** verification and planning report existing-inline-secret without including the value or proposing an automatic replacement
- **AND** plan application refuses a credential-bearing current configuration before any configuration or state write

### Requirement: Raw infrastructure content shares the literal-secret boundary
Raw content SHALL use the same secret-key and complete-placeholder rules as MCP inspection. It SHALL inspect decoded JSON and quoted assignments, including spaces and escapes. Current-file reads, proposal and approved apply SHALL refuse literal secrets with secret-content, without echo or project/state writes. Bare non-JSON values retain the narrow placeholder-plus-word scan.

#### Scenario: A literal is hidden behind a placeholder or an alternate key
- **WHEN** otherwise valid raw infrastructure content includes a spaced or suffixed placeholder literal, AUTHORIZATION/CREDENTIALS, or an escaped JSON secret key
- **THEN** proposal and approved apply refuse with secret-content, including for AGENTS.md and both supported MCP configuration paths
- **AND** the value is absent from results and no project or state is written

#### Scenario: The current file contains a literal secret
- **WHEN** the current file has one of these literal-secret forms
- **THEN** reading it for a proposal or apply refuses without echoing the value
- **AND** its bytes and unrelated project files remain unchanged

#### Scenario: A complete placeholder is used
- **WHEN** the value is a complete documented placeholder
- **THEN** secret inspection preserves its exemption and reference-format checks keep their own verdict
