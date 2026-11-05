## MODIFIED Requirements

### Requirement: Practice discovery accepts explicit version context

The existing read-only practices command SHALL accept optional structured input containing versions for selected valid harness identities, retaining the original agents-only invocation. Malformed or out-of-selection version entries SHALL be rejected before network reads. Missing versions SHALL remain explicit gaps. Input SHALL remain data and SHALL NOT cause agent execution or project/user-state writes.

#### Scenario: Selected versions are supplied through stdin or a file

- **WHEN** practices receives selected catalog agents and valid optional version input
- **THEN** each source record for an agent with a supplied version retains that version
- **AND** stdin and existing-file input produce equivalent bindings without creating state, caches or project edits

#### Scenario: Some versions are unavailable

- **WHEN** practices is invoked without version input or with versions for only some selected agents
- **THEN** sources can still be checked for the selected agents
- **AND** each agent without a supplied version retains an agent-version-unverified gap

#### Scenario: Invalid version input is rejected before reads

- **WHEN** version input has an invalid shape, unselected or malformed agent key, or an empty, oversized or control-containing version value
- **THEN** the command returns a structured input error before fetching sources
- **AND** supplied fields cannot override selected agents, allowed sources or execution boundaries

#### Scenario: Unknown selected harness has a supplied version

- **WHEN** a valid selected unknown identity has caller-supplied version context
- **THEN** input validation accepts the context but returns an unsupported-agent gap
- **AND** no documentation request or verified compatibility is inferred

## ADDED Requirements

### Requirement: Practice reads share a fixed global budget

Practice discovery SHALL accept at most sixteen valid identity selections, deduplicate them in caller order, and attempt at most two catalog sources per identity and six HTTP requests in total. Sources SHALL stay on explicitly reviewed official HTTPS hosts. Existing read, redirect, credential, content and timeout safeguards SHALL remain. Exhausted selections SHALL retain explicit gaps.

#### Scenario: More than three harnesses are selected

- **WHEN** valid selected profiles need more than six source requests
- **THEN** at most six requests are attempted in deterministic selection/source order
- **AND** each source not attempted because of the global limit has a source-budget-exhausted gap without an invented checked result

#### Scenario: Sources fail or identities repeat

- **WHEN** selected identities repeat or an attempted source fails
- **THEN** duplicates do not increase reads and failed attempts consume the same global budget
- **AND** failures keep their actual reason without retries or redirects

#### Scenario: Invalid selection is supplied

- **WHEN** the selection exceeds sixteen entries or contains malformed/non-string identity data
- **THEN** the entire invocation fails before network reads
- **AND** selected input cannot supply arbitrary source domains or change capability authorities
