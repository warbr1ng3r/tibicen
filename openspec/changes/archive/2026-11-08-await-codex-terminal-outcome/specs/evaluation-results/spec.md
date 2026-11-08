# Spec Delta

## ADDED Requirements

### Requirement: Native notifications await definitive outcomes
The contained evaluator SHALL await a definitive turn outcome after a generic native error within existing process, output and time limits. Error callbacks SHALL expose only event type and a content hash. Explicit typed authentication/access errors SHALL still stop immediately. A failed turn, nonzero process exit or missing completed turn SHALL fail acceptance. No automatic retry SHALL be added.

#### Scenario: A native error precedes a completed turn
- **WHEN** a generic error is followed by a completed turn and zero process exit within all existing guards
- **THEN** the collector does not stop solely on that error and retains its hash-only callback
- **AND** acceptance still requires all source, configuration, ownership and cleanup checks

#### Scenario: The stream does not recover
- **WHEN** an error is followed by a failed turn, nonzero process exit or no completed turn
- **THEN** the session is not accepted and its error remains visible without raw private details

#### Scenario: Typed authentication or access rejection occurs
- **WHEN** an error carries an existing validated HTTP401 or403 diagnostic
- **THEN** the collector stops immediately and verifies cleanup without a retry

## MODIFIED Requirements

### Requirement: Ordinary contained command results permit recovery
The contained evaluator SHALL forward schema-valid ordinary process and CLI command results unchanged, including nonzero exit codes, without terminating the session or creating a terminal tool failure. Missing optional diagnostic correlation SHALL NOT alter this policy. A command result alone SHALL NOT establish task acceptance.

#### Scenario: An ordinary command fails before another command
- **WHEN** an owned executor reports a valid exit1 without explicit sandbox denial and a later command is requested within the deadline
- **THEN** the later command can complete in the same owned container
- **AND** the original nonzero result remains visible to the native caller

#### Scenario: Optional diagnostics are unavailable
- **WHEN** diagnostic correlation has disabled itself at its bounded limit and an otherwise valid process result arrives
- **THEN** ordinary command recovery remains available
- **AND** unknown request attribution is not upgraded to a known match

#### Scenario: The CLI reports the failed command before recovering
- **WHEN** the native CLI emits a schema-valid completed command result with nonzero exit code and failed status, followed by a successful command and completed turn
- **THEN** the caller keeps the session available and preserves both actual results
- **AND** terminal native failures, failed turns, declined/cancelled items, failed file changes, unavailable command outcomes and malformed command results still fail acceptance
