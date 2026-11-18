# Spec Delta

## ADDED Requirements

### Requirement: First-task handoff retains reviewed context

Init and adopt SHALL give one copyable first-task request containing the actual working directory, reviewed applicable instruction paths, the selected project memory when enabled, and a useful task. Existing native/custom entrypoints SHALL remain usable. The request SHALL NOT treat all inventory candidates as applicable, create a replacement entrypoint, or invent a missing task or precedence.

#### Scenario: Initial setup uses one common instruction file

- **WHEN** init has applied the approved common-file setup and a first task is known
- **THEN** the handoff provides one request with the actual working directory, instruction file and useful task
- **AND** it includes the selected memory only when enabled

#### Scenario: Adopt preserves nested or custom instructions

- **WHEN** the reviewed task uses existing native/custom instructions or an intentional subtree exception
- **THEN** the request retains only the reviewed applicable entrypoints and known target
- **AND** unrelated candidates and unassessed native precedence remain outside that claimed instruction selection

#### Scenario: Context or required operations are missing

- **WHEN** the task context is incomplete or a required file/Node/write/activation operation is unavailable
- **THEN** the handoff names that exact gap and the available next action without claiming unapplied work or inventing paths
- **AND** available instruction reading proceeds within authority, without a new user approval step or forced host/model change

#### Scenario: Explicit reading is available without native observation

- **WHEN** the agent can read approved instructions but native discovery or fresh-task use has not been observed
- **THEN** it performs the available reading and reports structural checks, explicit reading, native discovery and fresh-task use separately from the copyable request
- **AND** optional future observation is not turned into required human activation or a fabricated pass
