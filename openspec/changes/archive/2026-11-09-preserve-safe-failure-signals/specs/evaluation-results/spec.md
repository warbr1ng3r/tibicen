## MODIFIED Requirements

### Requirement: Native notifications await definitive outcomes

The contained evaluator SHALL await a definitive turn outcome after a generic native error within existing process, output and time limits. Error records SHALL expose type/hash plus optional allowlisted per-event diagnostics. Explicit typed authentication/access errors SHALL still stop immediately. A failed turn, nonzero process exit or missing completed turn SHALL fail acceptance. No automatic retry SHALL be added.

#### Scenario: A native error precedes a completed turn

- **WHEN** a generic error is followed by a completed turn and zero process exit within all existing guards
- **THEN** the collector does not stop solely on that error and retains its safe error projection
- **AND** acceptance still requires all source, configuration, ownership and cleanup checks

#### Scenario: The stream does not recover

- **WHEN** an error is followed by a failed turn, nonzero process exit or no completed turn
- **THEN** the session is not accepted and its error remains visible without raw private details

#### Scenario: Typed authentication or access rejection occurs

- **WHEN** an error carries an existing validated HTTP401 or403 diagnostic
- **THEN** the collector stops immediately and verifies cleanup without a retry

## ADDED Requirements

### Requirement: Terminal error clues remain attributable and private

Native error callbacks and final error records SHALL retain the same allowlisted diagnostic projection per event. Known message templates SHALL yield only fixed identities with bounded source-format matching. Raw messages, variable tails and arbitrary properties SHALL remain absent. Unknown events SHALL keep type/hash-only records; existing aggregate precedence SHALL remain compatible. A recognized message SHALL establish observed text, not a trusted root cause.

#### Scenario: A later error has different safe clues

- **WHEN** a notification and a later failed turn contain different recognized status or message clues
- **THEN** each event retains its own safe clues in streaming and final records
- **AND** the aggregate result keeps its existing first-match precedence

#### Scenario: A pinned terminal template contains private details

- **WHEN** context-limit, request-timeout, stream-disconnect or retry-exhaustion text matches the supported pinned format within its bound
- **THEN** diagnostics retain the corresponding fixed message identity without the message or variable details
- **AND** prefix/suffix near-misses and unsupported fields do not introduce guessed causes

#### Scenario: The error is unknown or exceeds the new template bound

- **WHEN** an error has no supported clues or its template text exceeds the declared recognition limit
- **THEN** unsupported content remains represented only by its existing hash
- **AND** no retry, completion, authentication repair or historical cause is inferred
