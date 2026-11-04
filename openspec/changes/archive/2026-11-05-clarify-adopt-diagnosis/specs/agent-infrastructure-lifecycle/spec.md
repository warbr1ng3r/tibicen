## ADDED Requirements

### Requirement: Current read-only diagnosis accompanies saved reports

The existing report SHALL include a fresh structural diagnosis separately from saved session outcomes, preserving existing fields and session identity. Without explicit save request it SHALL leave project/user state unchanged and execute no project or third-party commands.

#### Scenario: A previous complete session has a current defect

- **WHEN** a registered instruction connection is damaged after completed setup
- **THEN** report preserves the historical complete status and recorded checks
- **AND** current diagnosis identifies the structural issue without claiming a new completed session

#### Scenario: A native setup has no Tibicen manifest

- **WHEN** report inspects an existing native setup without a saved session
- **THEN** it returns current available structural/inventory evidence and no recorded session
- **AND** it creates no manifest, state, cache, report file or application change

### Requirement: Adopt explains the smallest necessary outcome

Adopt SHALL explain the starting setup, concrete findings, what to retain or change, actual checks, limits and one next action in ordinary language. Exact edits and execution details SHALL remain reviewable before approval. A sufficient setup SHALL permit a no-change result with stated coverage.

#### Scenario: Existing setup is sufficient

- **WHEN** the working agent finds no necessary change after the available inspection
- **THEN** it explains what was inspected and why the setup is sufficient
- **AND** it neither invents a repair nor writes a fresh session merely to demonstrate activity

#### Scenario: Useful decisions have a missing connection

- **WHEN** existing useful project memory needs only a supported instruction connection
- **THEN** the recommendation preserves its notes and shows the minimal connection diff
- **AND** writes still require approval of the exact plan
