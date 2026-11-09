## ADDED Requirements

### Requirement: Memory decisions retain applicable scope

Tibicen SHALL configure policies that retain a decision's known subject, affected behavior, supplied operation names and accepted exception boundaries. Working instructions SHALL apply clearly matching accepted exceptions while preserving unrelated defaults, and clarify unknown operation identity or unresolved same-scope conflicts. Current user instructions and existing execution/write limits SHALL remain authoritative.

#### Scenario: An owner names an operation when correcting a decision

- **WHEN** the owner explicitly changes one named operation and leaves another operation unchanged
- **THEN** the memory retains the supplied identity and changed behavior without inventing aliases
- **AND** the unrelated operation and useful notes remain intact

#### Scenario: A later task changes a different dimension

- **WHEN** a later task clearly names the same operation and specifies its output format without replacing its accepted selection or ordering decision
- **THEN** the working policy directs the agent to use that scoped decision and retain other applicable defaults
- **AND** a general default outside that scope is not itself an unresolved contradiction

#### Scenario: Same-operation requirements remain incompatible

- **WHEN** active sources prescribe incompatible behavior for the same operation without an accepted resolution
- **THEN** the policy requires clarification or an explicit limitation within the existing question and write boundaries
- **AND** file age, load order or a guessed alias does not select a winner

#### Scenario: The relationship to a new operation is unknown

- **WHEN** a later request names an operation that cannot be reliably linked to a stored business term
- **THEN** the policy preserves that uncertainty rather than inventing the relationship
- **AND** it does not treat memory as permission to override the current request or expand execution
