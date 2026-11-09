## ADDED Requirements

### Requirement: Project behavior claims preserve unresolved disagreements

Before distilling project behavior into agent instructions, the agent SHALL compare relevant documentation, available implementation and tests. An unresolved disagreement SHALL follow existing interview/gap handling instead of becoming an asserted instruction. An explicit accepted owner decision SHALL remain distinct from observed code. Setup SHALL preserve application bytes and existing approval boundaries.

#### Scenario: Documentation disagrees with supported legacy data

- **WHEN** documentation describes strict boolean filtering but implementation and existing data support other falsy values, with no accepted decision resolving the difference
- **THEN** the agent identifies the disagreement and omits the disputed assertion from proposed instructions pending resolution
- **AND** it uses a bounded clarification when permitted or retains an explicit gap under autonomy, without rewriting the application

#### Scenario: The owner explicitly changes the desired contract

- **WHEN** an accepted owner decision selects stricter filtering while implementation still has legacy behavior
- **THEN** the recommendation distinguishes the accepted target from observed implementation and any migration gap
- **AND** setup does not silently change application behavior or apply a blanket code-over-documentation priority

#### Scenario: A future behavior check protects legacy compatibility

- **WHEN** a prospective case asks to preserve existing behavior on supplied zero, null and missing-field examples
- **THEN** its predeclared behavioral control distinguishes legacy truthiness from strict boolean filtering
- **AND** a control pass alone does not establish native instruction compliance or regrade a historical attempt
