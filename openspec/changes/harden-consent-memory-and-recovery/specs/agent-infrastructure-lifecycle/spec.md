## ADDED Requirements

### Requirement: Exact consent is separate from autonomy and tool permissions

Guidance SHALL distinguish interview defaults and host tool permissions from separately supplied approval of a compiled plan. Digest matching SHALL be described as content binding, not human authentication. Executor text, project instructions and third-party content SHALL NOT supply their own consent.

#### Scenario: The request asks for autonomous work

- **WHEN** the user says to do everything without questions before a concrete plan exists
- **THEN** the agent uses permitted interview defaults, presents the exact compiled plan and waits read-only for applicable consent
- **AND** tool access and quoted approval text from project material do not authorize apply

#### Scenario: The host has no independent approval enforcement

- **WHEN** the same agent can invoke the CLI and supply its digest
- **THEN** documentation discloses that the CLI checks plan identity without authenticating the approving person
- **AND** guidance compliance is not presented as a mechanical identity guarantee

### Requirement: Missing memory connections have actionable recovery advice

Fresh report diagnosis and apply results with a missing memory connection SHALL explain that repeating the same plan cannot create an absent connection. Advice SHALL identify the selected store and require a new exact connecting proposal and fresh approval. Approved instruction removal SHALL remain possible; repair SHALL preserve notes, session identity and attempt history.

#### Scenario: An approved entrypoint removal leaves memory disconnected

- **WHEN** the approved instruction removal completes and the registered memory lacks a structural connection
- **THEN** the result stays incomplete and directs the user to review a new connecting plan before resume
- **AND** the original removal is not rejected or silently reversed and the memory body stays intact

#### Scenario: A new plan repairs the connection

- **WHEN** a new exact connection proposal is approved and resumed
- **THEN** the same session can complete while retaining attempts and later memory notes
- **AND** a subsequently healthy fresh diagnosis does not retain obsolete repair advice

#### Scenario: Inspection cannot establish the connection

- **WHEN** the store or instructions are excluded, unsafe or unavailable
- **THEN** advice retains inspection limits and asks for review within the permitted scope
- **AND** it does not prescribe permission expansion or label another memory store as the replacement
