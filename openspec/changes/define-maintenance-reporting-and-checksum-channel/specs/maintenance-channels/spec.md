# Spec Delta

## Purpose

Define usable, accurately scoped maintenance reporting routes and a separately published advisory/checksum channel, while preserving participant privacy and immutable release records.

## ADDED Requirements

### Requirement: Reporting routes identify actual recipients and scope

Participation guides SHALL direct nonsensitive project matters to public repository issues/PRs, GitHub platform-rule violations to private GitHub Support reporting, and private vulnerabilities to the confirmed project security recipient. They SHALL explicitly replace the unfulfilled general private conduct-inbox promise, disclose the absence of such an inbox/alternate, and SHALL NOT present Support as project intake or enforcement of all project rules.

#### Scenario: A participant has a nonsensitive project concern

- **WHEN** the participant chooses an ordinary contribution or nonsensitive public moderation discussion
- **THEN** the guide links the project issues/PRs as public conversations visible to the confirmed core/adapter maintainer
- **AND** it warns against posting sensitive allegations, private information or vulnerability details

#### Scenario: A report concerns platform abuse or a vulnerability

- **WHEN** a participant needs a private route
- **THEN** the guide distinguishes GitHub Support for violations of GitHub's platform rules on GitHub from the existing Report a vulnerability route to the confirmed project security maintainer
- **AND** Support is not described as a general project-conduct inbox, off-platform handler or delivery to Tibicen's maintainer

### Requirement: Conduct protections survive the reporting change

The CoC SHALL retain respect, prohibitions on harassment, threats, discrimination and private-information disclosure, moderation/exclusion powers and protection of reporter identity. An implicated maintainer MUST NOT decide a complaint about their own conduct. The policy SHALL disclose that no alternate/independent project handling is appointed and SHALL NOT direct sensitive reports to a public issue to compensate.

#### Scenario: A complaint involves the sole confirmed maintainer

- **WHEN** that maintainer is implicated
- **THEN** the maintainer does not adjudicate the complaint about their own conduct and no alternate appointment is inferred
- **AND** the guide states the independent-project-handling limitation and preserves the private Support option only for applicable GitHub platform-rule violations

### Requirement: The checksum channel is a distinct publication with stated limits

Advisories and distribution checksums SHALL have a separately committed static Pages artifact, publication and HTTP origin distinct from release attachments. The channel SHALL disclose shared GitHub administration. It SHALL NOT claim administrative/provider independence, signatures or source-security assurance; an adjacent release checksum or another URL alone SHALL NOT establish this channel.

#### Scenario: A reader cross-checks a release attachment

- **WHEN** the separately published Pages record remains trustworthy
- **THEN** its recorded hashes can detect differing attachment/distribution bytes without replacing the old release
- **AND** the guide states that compromise of shared GitHub administration can affect both surfaces

### Requirement: Published records preserve exact release facts and warnings

Each version record SHALL identify the actual version/publication date, full public source and distribution commits, exact payload-manifest and archive SHA-256 hashes/URLs, and release notes. Published records and version bytes SHALL remain immutable. Warnings SHALL append dated affected-version/action records and optional superseding-version/warning links without rewriting earlier records. Publishable output SHALL contain no placeholders or invented candidate entries.

#### Scenario: The initial index covers the published limited alpha

- **WHEN** the initial index is prepared
- **THEN** it uses checked facts for the already published 0.1.0-alpha.1 and retains its limited scope
- **AND** absent final-candidate facts are omitted, not represented as a public 1.0 or a publishable template

#### Scenario: A defect or a later release needs publication

- **WHEN** new verified release facts or a warning become available
- **THEN** the index appends the new version/warning, preserving earlier hashes, dates and records
- **AND** an incorrect earlier record is flagged by a superseding warning; neither that record nor the old released bytes are silently replaced

### Requirement: Adoption and functional verification remain distinct evidence

Planning, policy adoption, local index checks, actual route/publication verification and full release acceptance SHALL be recorded separately. Working-channel claims SHALL require actual public access, deployment/source binding and byte/hash comparison. Reporting evidence SHALL state recipients, accessibility and any untested delivery; no sensitive test report SHALL be sent. The full technical MVP and separate publication authorization SHALL remain required.

#### Scenario: Local checks pass before publication

- **WHEN** policy/index implementation and local checks pass but no new authorized Pages publication has been verified
- **THEN** the result is local preparation with a pending public channel, not a working channel or closed full-release gate
- **AND** documented route availability is not labeled tested notification delivery

#### Scenario: An authorized publication is checked

- **WHEN** the exact committed index is deployed under separate explicit permission
- **THEN** the evidence binds its source/site revision, deployment and returned bytes, verifies listed manifest/archive hashes, and records reporting-route accessibility and limits without submitting a report
- **AND** remaining release tasks and absent technical observations retain their own status
