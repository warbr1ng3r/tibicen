## MODIFIED Requirements

### Requirement: Adopt explains the smallest necessary outcome

Adopt SHALL explain the starting setup, concrete findings, what to retain or change, actual checks, limits and one next action in ordinary language. Exact edits and execution details SHALL remain reviewable before approval. A sufficient setup SHALL permit a no-change result with stated coverage.

A textual proposal preview SHALL retain every changed line while omitting unchanged leading/trailing regions beyond three context lines. One combined hunk from the first to last edit is sufficient; no minimal multi-hunk algorithm is required. Addition/deletion, empty files, CRLF and final-newline differences SHALL remain distinguishable. The preview SHALL NOT normalize approved file bytes, omit file-mode changes, weaken original hashes or alter existing approved proposals.

#### Scenario: Existing setup is sufficient
- **WHEN** the working agent finds no necessary change after the available inspection
- **THEN** it explains what was inspected and why the setup is sufficient
- **AND** it neither invents a repair nor writes a fresh session merely to demonstrate activity

#### Scenario: Useful decisions have a missing connection
- **WHEN** existing useful project memory needs only a supported instruction connection
- **THEN** the recommendation preserves its notes and shows the minimal connection diff
- **AND** writes still require approval of the exact plan

#### Scenario: A single line changes in a long instruction file
- **WHEN** a proposal changes one instruction while all other lines remain identical
- **THEN** its diff contains the exact replacement and at most three unchanged lines on each side, with correct line ranges
- **AND** full approved content, before hash and file mode remain bound to the proposal digest

#### Scenario: A file boundary or line ending changes
- **WHEN** a proposal adds/deletes an empty or nonempty file, changes only a mode, or changes CRLF/final newline
- **THEN** the preview accurately distinguishes the operation and newline state without changing approved bytes
