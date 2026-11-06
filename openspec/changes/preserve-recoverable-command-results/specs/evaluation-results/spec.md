## MODIFIED Requirements

### Requirement: Contained executor failure correlation
Contained failure receipts SHALL retain the first terminal fault's fixed kind and numeric code, plus validated, session-scoped hashed request/process identities and bounded exit facts. An operation SHALL be identified only from an observed request; a process fault SHALL claim a matched start only when the corresponding start response agrees. Ordinary valid process results SHALL NOT create terminal faults. Missing, ambiguous or invalid correlation SHALL remain unknown.

#### Scenario: Interleaved processes finish differently
- **WHEN** two observed process/start requests receive matching responses and one reports an explicit sandbox denial after the other exits zero without denial
- **THEN** the first terminal fault identifies the denied process and matching start request, rather than the last completed command
- **AND** the terminal stop reason and cleanup remain unchanged

#### Scenario: The start response is missing or disagrees
- **WHEN** a terminal process fault has no uniquely matching accepted start request
- **THEN** its validated process hash and exit facts can be retained but request/operation correlation is unknown
- **AND** an RPC error can identify an observed start request without claiming that the process started

#### Scenario: The standard setup profile records a failed child
- **WHEN** the contained session returns a failure context and the setup profile reports the child as failed
- **THEN** the existing collection artifact preserves that same safe context before the failure is thrown
- **AND** file bodies remain represented only by hashes and modes in that artifact

### Requirement: Diagnostic verification preserves historical outcomes
Executor diagnostics SHALL remain development-only and separate from strict attempt records. Mocked offline checks SHALL invoke no credentials, models or live executor. Separately declared bounded model-free controls SHALL use only an owned isolated executor, without credentials or models. Diagnostic improvements SHALL NOT upgrade an old unknown cause, missing collection, task failure or unverified memory read, and SHALL NOT add automatic retries.

#### Scenario: The old native attempt is reviewed after the fix
- **WHEN** new offline regression checks or separately declared model-free controls pass
- **THEN** the original failed attempt and its raw receipts remain unchanged
- **AND** its missing command identity and uncollected container contents remain unverified

## ADDED Requirements

### Requirement: Ordinary contained command results permit recovery
The contained evaluator SHALL forward schema-valid ordinary process results unchanged, including nonzero exit codes, without terminating the session or creating a terminal tool failure. Missing optional diagnostic correlation SHALL NOT alter this policy. A command result alone SHALL NOT establish task acceptance.

#### Scenario: An ordinary command fails before another command
- **WHEN** an owned executor reports a valid exit1 without explicit sandbox denial and a later command is requested within the deadline
- **THEN** the later command can complete in the same owned container
- **AND** the original nonzero result remains visible to the native caller

#### Scenario: Optional diagnostics are unavailable
- **WHEN** diagnostic correlation has disabled itself at its bounded limit and an otherwise valid process result arrives
- **THEN** ordinary command recovery remains available
- **AND** unknown request attribution is not upgraded to a known match

### Requirement: Executor faults remain terminal
The evaluator SHALL stop on explicit sandbox denial, malformed process-exit fields and existing terminal RPC, transport, output, deadline or cleanup faults. It SHALL retain existing filesystem, network, identity, ownership and collection boundaries. Optional nullable denial metadata SHALL follow the pinned protocol without being reported as an observed false value.

#### Scenario: Denial or malformed exit is received
- **WHEN** process/exited contains sandboxDenied true, invalid field types, an unsafe sequence or an exit code outside the pinned signed integer range
- **THEN** the evaluator stops and verifies owned-container cleanup
- **AND** a later command is not accepted as successful recovery

#### Scenario: Infrastructure fails after a valid command
- **WHEN** an RPC fault, invalid transport, output cap, deadline or cleanup failure occurs after an ordinary result
- **THEN** the terminal fault and unsuccessful acceptance remain visible
- **AND** the prior ordinary result does not hide the failure

### Requirement: Recovery verification preserves prior evidence
Recovery-policy verification SHALL preserve original native outcomes and immutable evidence. A bounded model-free regression SHALL distinguish its synthetic command recovery from native task, memory and usefulness observations. A new native observation SHALL require a new prospective source/input freeze and finite protocol.

#### Scenario: The regression passes after a policy fix
- **WHEN** the same reviewed synthetic driver fails on the old source and passes on the repaired source
- **THEN** both receipts and cleanup outcomes are retained
- **AND** earlier native attempts remain failed with their unknown argv and uncollected candidate contents unchanged
