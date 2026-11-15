## MODIFIED Requirements

### Requirement: Diagnostic privacy and resource bounds

Public correlation receipts SHALL retain no raw commands, paths, environment, output, error text or identifiers. Diagnostic buffering, identity lengths and map sizes SHALL be bounded. Overflow, malformed requests and duplicate identities SHALL disable uncertain correlation without changing forwarded bytes, failure stopping, containment, cleanup or execution results. Identities SHALL be unlinkable between sessions. Separately enabled private failure recording SHALL NOT enter public receipts.

#### Scenario: Secrets and ambiguous identities are supplied

- **WHEN** protocol messages contain arbitrary payloads, duplicate identities, oversized input or malformed metadata
- **THEN** the public diagnostic receipt contains only fixed fields, nullable validated numbers/booleans and session-scoped hashes
- **AND** no ambiguous request match or arbitrary text is retained there

## ADDED Requirements

### Requirement: Private executor faults survive cancellation

Opt-in private diagnostics SHALL retain the first executor fault before caller cancellation and cleanup. Only stderr correlated to an accepted unique start or a fixed RPC error message SHALL be eligible. Missing or invalid correlation SHALL be explicit. Defaults, public projection, terminal stopping and ordinary command recovery SHALL remain unchanged.

#### Scenario: A matched process is denied before the native CLI reports it

- **WHEN** a matched accepted process emits stderr and an existing terminal denial
- **THEN** its redacted bounded private failure record is written before failure notification and survives owner cleanup
- **AND** another process's stderr, stdout, argv, environment and successful transcripts are not intentionally collected

#### Scenario: A process start receives an RPC error

- **WHEN** an observed request receives a terminal RPC error
- **THEN** the fixed error message/code can be retained privately as an RPC fault
- **AND** it does not claim an accepted process or process-stderr observation

#### Scenario: Recording fails

- **WHEN** a private failure observer or writer fails
- **THEN** the original executor failure and unconditional cleanup are preserved
- **AND** failed recording cannot become captured success or a passing run

### Requirement: Private executor text has bounded provenance

Private executor collection SHALL bound pending processes, per-process and total bytes. Canonical framing, sequence and UTF-8 checks SHALL protect attribution. Raw overflow or ambiguous/malformed streams SHALL withhold text rather than publish partial credentials. Complete eligible text SHALL use existing credential redaction before final output limits, exclusive owner-only storage and prospectively frozen policy/source.

#### Scenario: Output is interleaved or split across transport chunks

- **WHEN** accepted processes interleave output and stderr bytes split Unicode or known credentials
- **THEN** only the failing process's complete eligible stderr is redacted and retained
- **AND** ordinary exit buffers are cleared without private failure output

#### Scenario: A stream exceeds its limit or becomes ambiguous

- **WHEN** raw bytes overflow, identities become uncertain or output framing/sequence/UTF-8 is invalid
- **THEN** private context reports the collection gap and withholds the text
- **AND** public failure classification, forwarded protocol bytes and cleanup are unchanged

#### Scenario: The old failure is assessed

- **WHEN** the new regression or separately frozen model-free control passes
- **THEN** old missing argv, stderr, usage and removed-container contents remain unverified
- **AND** a sandbox-denial flag is reported as observed classification rather than a proven root cause
