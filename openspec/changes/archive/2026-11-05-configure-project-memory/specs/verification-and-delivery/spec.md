# Spec Delta

## ADDED Requirements

### Requirement: Memory acceptance distinguishes structure and behavior

Memory evidence SHALL separate path/policy checks from observed reading, task decisions and updates in fresh agent contexts. Observations SHALL identify the candidate, agent/tool versions, assistance, limits and retained failures. Missing controlled execution SHALL remain unverified; engineering acceptance SHALL NOT imply measured human benefit.

#### Scenario: Setup passes but a later agent ignores memory

- **WHEN** files and pointers pass checks but a fresh agent does not use the relevant decision
- **THEN** structural success and behavioral failure are reported separately
- **AND** the memory feature does not receive behavioral acceptance from file presence

#### Scenario: Init and adopt are accepted on the candidate

- **WHEN** fresh contexts demonstrably read an init-created decision and correct an adopted decision while preserving unrelated notes
- **THEN** the recorded observations are bound to the tested bytes and versions
- **AND** other agents, untested versions and human usefulness remain outside those observations

### Requirement: Post-1.0 versions reflect compatibility

Stable releases SHALL use SemVer: compatible fixes increment patch, compatible functionality increments minor, and incompatible supported interfaces increment major. Completed unreleased changes SHALL have human-readable changelog entries. Published versions, tags and assets SHALL remain immutable; a correction SHALL receive a new version.

#### Scenario: Optional memory ships without breaking legacy workflows

- **WHEN** the memory feature is accepted with supported legacy workflows preserved
- **THEN** the next feature release is prepared as `1.1.0`
- **AND** published `1.0.0` artifacts and history are retained

#### Scenario: A repair is needed after publication

- **WHEN** a compatible defect fix is ready for an existing stable line
- **THEN** a new patch version is prepared rather than replacing that release's asset bytes

### Requirement: Release metadata identifies the checked candidate

Release preparation SHALL use the root package version as its source, generate matching skill metadata and checksums, and bind CI, platform and delivery results to the candidate bytes. Prereleases SHALL be labeled accordingly. A normal commit or CI success SHALL NOT automatically create a tag, publish a release or authorize new execution.

#### Scenario: A feature is still under development

- **WHEN** work has not reached the reviewed release candidate
- **THEN** completed changes are described under `Unreleased` without claiming a published feature
- **AND** the stable package version is changed only during candidate preparation

#### Scenario: Final validation changes distributed bytes

- **WHEN** a correction changes the prepared distribution after acceptance
- **THEN** affected checks and checksums are refreshed for those bytes
- **AND** the release does not reuse observations as if they tested the changed content
