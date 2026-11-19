## ADDED Requirements

### Requirement: First executable-check proposals carry their proposed trust and checked readiness
The distributed guidance SHALL tell executors to include proposed command trust and actually verified environment readiness in the first exact plan requesting execution. It SHALL select the supported profile for the real project scenario and retain the requirement for later external approval of the unchanged digest.

#### Scenario: A fresh executor proposes an executable check
- **WHEN** the executor shows the code and exact command it asks to execute and the relevant environment is checked
- **THEN** the first proposal contains the proposed trust and readiness fields
- **AND** the actual external digest approval covers the displayed change and execution without another cycle solely to add those fields

#### Scenario: Trust or readiness is genuinely absent
- **WHEN** the relevant environment is unknown or the requested code/command has not been shown
- **THEN** the corresponding declaration is not invented
- **AND** execution remains unverified or awaits the necessary trust and approval

#### Scenario: The project check is Bash or Python
- **WHEN** an existing supported Bash or Python check is proposed
- **THEN** the guidance selects the appropriate profile instead of imposing the web profile
- **AND** the existing command and environment restrictions still apply

#### Scenario: The executor creates a questionnaire or generates an approval answer
- **WHEN** no separate external user or authorized controller has approved the shown digest
- **THEN** its own questionnaire, simulated answer, default choice or tool permission does not approve the plan
- **AND** unknown approval provenance keeps the executor read-only without claiming that the CLI authenticates a human
