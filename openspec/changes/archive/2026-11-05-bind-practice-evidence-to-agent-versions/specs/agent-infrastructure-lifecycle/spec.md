## ADDED Requirements

### Requirement: Practice discovery accepts explicit version context

The existing read-only practices command SHALL accept optional structured input containing versions for selected supported agents, retaining the original agents-only invocation. Malformed, unknown or out-of-selection version entries SHALL be rejected before network reads. Missing versions SHALL remain explicit gaps. Input SHALL remain data and SHALL NOT cause agent execution or project/user-state writes.

#### Scenario: Selected versions are supplied through stdin or a file

- **WHEN** practices receives selected supported agents and valid optional version input
- **THEN** each source record for an agent with a supplied version retains that version
- **AND** stdin and existing-file input produce equivalent bindings without creating state, caches or project edits

#### Scenario: Some versions are unavailable

- **WHEN** practices is invoked without version input or with versions for only some selected agents
- **THEN** sources can still be checked for the selected agents
- **AND** each agent without a supplied version retains an agent-version-unverified gap

#### Scenario: Invalid version input is rejected before reads

- **WHEN** version input has an invalid shape, unsupported or unselected agent key, or an empty, oversized or control-containing version value
- **THEN** the command returns a structured input error before fetching sources
- **AND** supplied fields cannot override selected agents, allowed sources or execution boundaries

### Requirement: Fetched practice evidence does not establish compatibility

Practice assessment SHALL distinguish successful source retrieval, supplied agent-version context and semantic applicability. A fetched source SHALL retain its date, content hash and requires-agent-assessment marker; a supplied version SHALL NOT be reported as independently observed installation or verified compatibility. Failed reads SHALL preserve explicit reasons without fresh evidence or uncontrolled retries.

#### Scenario: Current guidance is fetched with a version

- **WHEN** an official source is successfully fetched for a caller-supplied agent version
- **THEN** the output retains the source evidence and version context
- **AND** applicability still requires agent assessment rather than an automatic compatibility or loading success

#### Scenario: A source is unavailable or refers to a different version

- **WHEN** a source cannot be read or its guidance cannot be justified for the observed environment
- **THEN** unavailable retrieval retains its mechanical reason and unjustified applicability remains explicitly unknown in the recommendation
- **AND** old evidence or a main-branch fix is not presented as a freshly verified installed-release result

### Requirement: Recommendations explain their evidence boundary

Init/adopt SHALL connect each necessary recommendation to the observed task, sufficient existing/native alternatives, relevant source/date/version context and remaining limits. Keep/change/unknown outcomes SHALL be explained in ordinary language. Uncertainty SHALL NOT justify an invented repair, automatic tool upgrade or weakening the existing exact-plan consent boundary.

#### Scenario: A useful current setup is retained

- **WHEN** available evidence identifies no necessary change to the inspected setup
- **THEN** the agent explains what it retains and the inspected scope
- **AND** unknown versions or unavailable checks remain visible without a new component or session merely to record activity

#### Scenario: Relevant guidance supports a change

- **WHEN** the agent identifies a concrete problem and applicable evidence supporting a supported correction
- **THEN** it explains the added benefit, minimum change, material side effects and how the result can be checked
- **AND** exact edits/executions remain reviewable and require the existing approval before application
