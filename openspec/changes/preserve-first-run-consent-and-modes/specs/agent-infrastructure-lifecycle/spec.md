# Spec Delta

## ADDED Requirements

### Requirement: Generated service writes have explicit consent presentation
Proposal guidance SHALL distinguish exact user-file changes from generated service records. It SHALL disclose their actual paths, purposes and generation contract and bind approval to the unchanged CLI proposal. A demand for unavailable future bytes SHALL require clarification before writes; it SHALL NOT authorize an alternative application route.

#### Scenario: The normal proposal includes generated journals
- **WHEN** a proposal declares service writes and a local usage record
- **THEN** the agent shows exact user-file changes and the declared generated paths and purposes without inventing final journal bytes
- **AND** actual CLI application waits for explicit approval of that unchanged plan

#### Scenario: The owner requires full future journal content
- **WHEN** the owner requires full bytes that depend on future session identifiers, timestamps or results
- **THEN** the agent asks whether generation under the shown contract is acceptable and remains read-only until answered
- **AND** it neither treats the question as approval nor replaces the requested CLI application with direct file writes
