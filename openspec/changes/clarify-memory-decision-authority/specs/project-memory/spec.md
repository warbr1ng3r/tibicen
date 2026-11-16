## ADDED Requirements

### Requirement: Memory maintenance preserves owner decision authority

Tibicen SHALL configure working policies to retain the owner-approved meaning and scope of a decision until the user explicitly changes them. Verified implementation facts SHALL be recorded separately when they differ from that decision; they SHALL NOT silently narrow, replace or create an exception to it.

#### Scenario: Implementation covers only part of an owner decision

- **WHEN** a worker verifies code that implements only a narrower case than the stored owner decision
- **THEN** its configured policy preserves the owner's meaning and scope and records the implementation mismatch separately
- **AND** the implementation does not become a new owner-approved exception

#### Scenario: The user explicitly changes the decision

- **WHEN** the current authorized request explicitly replaces the owner's earlier decision or exception boundary
- **THEN** the policy allows updating that decision with the known reason and preserving unrelated notes
- **AND** an installed Tibicen runtime is not required for ordinary authorized maintenance

#### Scenario: Implementation and decision cannot yet be reconciled

- **WHEN** an observed implementation conflicts with a decision and no authorized replacement resolves it
- **THEN** the policy retains the decision and the separately identified observation rather than inventing a narrower rule
- **AND** existing clarification, forbidden-path and write boundaries remain in effect
