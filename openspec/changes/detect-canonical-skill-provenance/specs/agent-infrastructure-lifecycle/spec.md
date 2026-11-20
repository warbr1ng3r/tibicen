## ADDED Requirements

### Requirement: Canonical installed skills are identified by carried identity, not directory names

Scan SHALL treat a harness skills directory as an installed canonical Tibicen
skill only when the directory carries the distribution identity marker — a
`package.json` whose `name` equals the canonical skill name with a nonempty
`version` string. A directory name alone SHALL NOT establish canonical
presence, and a marker-less lookalike directory SHALL classify as foreign
infrastructure like any other third-party skill.

#### Scenario: A noncanonical lookalike skill mimics the canonical name

- **WHEN** a project contains `.agents/skills/tibicen-init/` with mimicked
  naming but no distribution identity marker
- **THEN** its files classify as foreign infrastructure
- **AND** scan retains the improve hint instead of reporting init

#### Scenario: A genuine canonical install of any published version

- **WHEN** a project contains an installed Tibicen skill whose `package.json`
  carries the canonical name and a nonempty version
- **THEN** the skill counts as installed canonical Tibicen
- **AND** a project containing only canonical Tibicen skills keeps the
  init/not-configured classification

#### Scenario: A third-party skill with an unrelated name

- **WHEN** a project contains a third-party skill under a noncanonical name
- **THEN** its files classify as foreign infrastructure and scan reports
  improve

#### Scenario: A marker belongs to another project-relative directory

- **WHEN** one skill directory carries a canonical marker and a separate
  root, nested or sibling directory carries a marker-less lookalike
- **THEN** the marker identifies only its own complete project-relative directory
- **AND** the other directory remains foreign infrastructure and retains improve

#### Scenario: The identity marker is damaged or foreign

- **WHEN** a canonical-named directory contains a `package.json` that is
  malformed, lacks the canonical name, or lacks a version
- **THEN** the directory does not count as installed canonical Tibicen
- **AND** no scan gap is invented for ordinary third-party content
