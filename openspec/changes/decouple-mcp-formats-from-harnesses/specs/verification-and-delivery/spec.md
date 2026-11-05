# Spec Delta

## ADDED Requirements

### Requirement: MCP format choice is independent from harness identity

Diagnosis SHALL accept an explicit supported format for any valid harness ID.
Existing default requests SHALL retain their meaning. Results SHALL separate
format evidence from host identity and native activation. Unsupported formats
SHALL retain a precise limit without guessing syntax or requiring a model switch.
Reader choice SHALL NOT grant write authority.

#### Scenario: An uncatalogued host uses a known contract

- **WHEN** a valid uncatalogued ID explicitly selects a supported format
- **THEN** the corresponding reader inspects the supplied files without replacing that ID
- **AND** the result identifies caller-selected format evidence and unverified native activation

#### Scenario: No known contract is selected

- **WHEN** an unknown host supplies no format or an unsupported format
- **THEN** no native syntax or precedence is inferred from the brand or file path
- **AND** the general redacted-observation route remains available

#### Scenario: Reader choice cannot obtain a writer

- **WHEN** an unknown host selects Cursor JSON or Cursor selects a different contract
- **THEN** diagnosis cannot offer a supported writer from format selection alone
- **AND** only matching existing host, writer format and explicit exact project path retain repair eligibility

### Requirement: General MCP observations retain their evidence boundary

Any valid host SHALL be able to supply redacted stdio observations bound to an
inspected source hash. Observation-based results SHALL remain distinct from
parsed configuration validity. Missing or changed sources SHALL invalidate the
observation. Metadata SHALL contain only bounded states, hashes and env names,
never commands or values. Observation input SHALL NOT enable a writer or execution.

#### Scenario: A host uses an otherwise unsupported configuration language

- **WHEN** the caller supplies a stdio observation and the exact source hash matches
- **THEN** diagnosis reports caller-observed stdio and the supplied environment-name requirements
- **AND** explicitly supplied target launch facts can identify missing prerequisites
- **AND** native activation, semantic correctness, connection and task use remain unverified

#### Scenario: An observation becomes stale or contains executable data

- **WHEN** its source hash differs, its source is unavailable or metadata includes command/value fields
- **THEN** stale facts are not accepted as current or parsed validity
- **AND** invalid metadata is rejected before project inspection
- **AND** source code, tagged YAML and shell fragments are never interpreted

#### Scenario: A reported disable choice is preserved

- **WHEN** a hash-matching observation reports a disabled server
- **THEN** the result preserves that state with caller-observation evidence
- **AND** no repair automatically enables it

### Requirement: Additional MCP readers preserve native contract limits

Diagnosis SHALL provide bounded ZCode native/shared JSON, current Kimi Code JSON
and Mistral Vibe TOML readers. Each SHALL retain its documented fields and disable
semantics. Unsupported syntax, literal environment overlays and external policy
SHALL retain explicit limits. Readers SHALL preserve bounded redacted inspection
and SHALL NOT execute a config or infer effective scope from source order.

#### Scenario: ZCode native and compatibility sources differ

- **WHEN** the caller selects either native mcp.servers or shared mcpServers layout
- **THEN** the reader uses only that selected contract
- **AND** the agent explains native fallback and scope limits without merging records or guessing effectiveness

#### Scenario: Kimi has a disabled or nonlocal server

- **WHEN** Kimi configuration disables a server or selects a nonlocal environment
- **THEN** disabled state or the unsupported target limit remains explicit
- **AND** project trust is not assumed or weakened

#### Scenario: Vibe uses a supported or unsupported TOML construct

- **WHEN** a complete supplied source fits the documented bounded TOML subset
- **THEN** the selected local record can be inspected without evaluating code
- **AND** ambiguity, duplicate definitions or unsupported syntax produce a manual limit without raw errors

#### Scenario: Two formats use different environment rules

- **WHEN** similar-looking records have different documented interpolation or literal-overlay semantics
- **THEN** the reader retains the selected contract rather than borrowing another host's interpolation
- **AND** neither environment values nor referenced files are resolved or exposed
