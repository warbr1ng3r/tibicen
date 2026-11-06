## ADDED Requirements

### Requirement: Contained executor failure correlation
Contained failure receipts SHALL retain the first failure's fixed kind and numeric code, plus validated, session-scoped hashed request/process identities and bounded exit facts. An operation SHALL be identified only from an observed request; a process exit SHALL claim a matched start only when the corresponding start response agrees. Missing, ambiguous or invalid correlation SHALL remain unknown.

#### Scenario: Interleaved processes finish differently
- **WHEN** two observed process/start requests receive matching responses and one process exits nonzero after the other exits zero
- **THEN** the first failure identifies the failing process and matching start request, rather than the last completed command
- **AND** the original stop reason and cleanup remain unchanged

#### Scenario: The start response is missing or disagrees
- **WHEN** an exit notification has no uniquely matching accepted start request
- **THEN** its validated process hash and exit facts can be retained but request/operation correlation is unknown
- **AND** an RPC error can identify an observed start request without claiming that the process started

#### Scenario: The standard setup profile records a failed child
- **WHEN** the contained session returns a failure context and the setup profile reports the child as failed
- **THEN** the existing collection artifact preserves that same safe context before the failure is thrown
- **AND** file bodies remain represented only by hashes and modes in that artifact

### Requirement: Diagnostic privacy and resource bounds
Correlation SHALL retain no raw commands, paths, environment, output, error text or identifiers. Diagnostic buffering, identity lengths and map sizes SHALL be bounded. Overflow, malformed requests and duplicate identities SHALL disable uncertain correlation without changing forwarded bytes, failure stopping, containment, cleanup or execution results. Identities SHALL be unlinkable between sessions.

#### Scenario: Secrets and ambiguous identities are supplied
- **WHEN** protocol messages contain arbitrary payloads, duplicate identities, oversized input or malformed metadata
- **THEN** the diagnostic receipt contains only fixed fields, nullable validated numbers/booleans and session-scoped hashes
- **AND** no ambiguous request match or arbitrary text is retained

### Requirement: Diagnostic verification preserves historical outcomes
Executor diagnostics SHALL remain development-only and separate from strict attempt records. Offline synthetic transport checks SHALL not invoke credentials, models or a live executor. A diagnostic improvement SHALL NOT upgrade an old unknown cause, missing collection, task failure or unverified memory read, and SHALL NOT add retries.

#### Scenario: The old native attempt is reviewed after the fix
- **WHEN** new offline regression checks pass
- **THEN** the original failed attempt and its raw receipts remain unchanged
- **AND** its missing command identity and uncollected container contents remain unverified
