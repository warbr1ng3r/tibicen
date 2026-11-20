## ADDED Requirements

### Requirement: Approval consumption retains source-bound receipts

When `apply` or `resume` passes the digest consent gate and persists a session,
the CLI SHALL retain and surface a structured receipt binding the consumed
approval to the exact compiled proposal digest, the presented digest, the
operation, the approval channel, the project root, the session and a timestamp.
Receipts SHALL remain evidence of content identity and channel, never
authentication of an external approver.

#### Scenario: A valid exact external grant is consumed

- **WHEN** apply or resume is invoked with an approval channel digest that
  matches the exact compiled proposal digest
- **THEN** the retained receipt records the consumed digest, the operation, the
  actual channel, the project root, the session id and a timestamp
- **AND** the apply result, `status`, `report` and the manifest session summary
  expose that receipt

#### Scenario: The executor presents a different digest from the plan it applies

- **WHEN** the digest presented on the approval channel differs from the digest
  of the plan offered for application
- **THEN** consent is refused with a refusal record naming both the presented
  digest and the required digest of the offered plan
- **AND** the comparison of a controller's own approved digest with the retained
  or refused record mechanically exposes the divergence after the fact

#### Scenario: Consent is refused

- **WHEN** the digest presented on the approval channel does not match the plan
  offered for application, on a project with or without saved work
- **THEN** the refusal record appears in the error envelope
- **AND** the project directory, including any saved session state, is left
  byte-identical, because `.tibicen` writes themselves require approved consent
- **AND** the refusal record names the saved session id when state exists, or
  when resume selects saved work from a manifest without temporary state
- **AND** a new apply without state SHALL not attribute a previous completed
  manifest session to the refused attempt

#### Scenario: A session saved before receipts existed resumes

- **WHEN** a saved session or manifest session summary written before this
  requirement has no retained receipts
- **THEN** the session still loads and can be resumed with new consent
- **AND** new receipts accumulate beside the preserved history

#### Scenario: Receipt integrity

- **WHEN** a saved session contains a structurally invalid receipts list
- **THEN** loading that session fails explicitly instead of accepting damaged
  approval evidence
- **AND** the journal retains at most the last eight receipts per session, and a
  longer list or a persisted refusal receipt fails loading as tamper-suspect,
  because no product path persists refusals


#### Scenario: Invalid caller channel cannot create unreadable state

- **WHEN** apply/resume receives an approval channel other than `cli --approve`
  or `programmatic`
- **THEN** it SHALL fail with `invalid-approval-channel` before persistence
- **AND** it SHALL not create an unreadable journal from invalid input

#### Scenario: Consumed evidence has consistent ownership and digests

- **WHEN** a retained consumed journal is read from state or any manifest session
- **THEN** every receipt SHALL have equal non-null 64-hex string digests, the
  exact owning session ID, a supported channel and an absolute recorded root
- **AND** malformed manifest journals SHALL fail before exposure or inheritance
- **AND** the latest active-state receipt SHALL match the current proposal root
  and digest; older receipts may describe earlier approved plans and roots

#### Scenario: A legacy state belongs to a different session from the last manifest entry

- **WHEN** a legacy state without receipts resumes while the last manifest
  entry belongs to another session
- **THEN** apply, status and report SHALL not attribute that entry's receipts
  to the active session
- **AND** fallback SHALL use only a manifest entry with the same session ID

#### Scenario: A project with historical receipts moves to a new root

- **WHEN** a project is copied or moved and its manifest retains historical
  absolute roots, including roots from a different OS
- **THEN** status and new proposal generation SHALL keep that history readable
- **AND** a separately approved stateless resume SHALL preserve the session ID
  and old receipts while appending the current-root receipt
- **AND** the existing current proposal/root gate SHALL remain unchanged
