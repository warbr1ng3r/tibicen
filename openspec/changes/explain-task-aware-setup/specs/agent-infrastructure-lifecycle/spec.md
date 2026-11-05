# Spec Delta

## ADDED Requirements

### Requirement: Init and adopt share a task-scoped explanation

Both entry skills SHALL use the same available host/version, project root,
working directory and intended task/path context to explain retained or proposed
instructions. The explanation SHALL give one sufficient recommendation and a
concrete activation step or remaining check. Missing context SHALL remain
explicit without adding mandatory questions or inferring the host from shared files.

#### Scenario: Initial setup starts from a simple request

- **WHEN** the user asks to set up agents in a project without agent infrastructure
- **THEN** init derives project commands and available task context from permitted inspection
- **AND** it explains the minimum setup and first reading/activation step
- **AND** it preserves application files and the exact-plan approval boundary

#### Scenario: An existing setup has intentional subtree differences

- **WHEN** adopt reviews root and nested instructions for a particular task
- **THEN** it explains the relevant directory relationships and host-specific uncertainties
- **AND** it preserves intentional differences instead of treating different text as a conflict
- **AND** a concrete defect receives an addressable correction or no-change outcome

#### Scenario: An unknown host can read common instructions

- **WHEN** an uncatalogued host supports the existing file and Node workflow
- **THEN** the recommendation can use an explicit common-file reading step
- **AND** it does not invent native precedence, installed version or a model/provider requirement

### Requirement: First-task handoff reuses the reviewed scope

Verification and handoff SHALL reuse the reviewed task context or disclose a
change to it. Existing memory checks SHALL distinguish structural connection,
fresh reading, task use and accepted correction while preserving unrelated notes.
Unavailable observations SHALL retain their reasons and assistance limits.

#### Scenario: A later task depends on an accepted project decision

- **WHEN** a fresh working context follows the approved setup and the task needs a stored decision
- **THEN** acceptance records whether the decision was read and affected the result
- **AND** an explicitly accepted correction preserves unrelated notes
- **AND** an assisted observation does not establish native autodiscovery or broad compatibility
