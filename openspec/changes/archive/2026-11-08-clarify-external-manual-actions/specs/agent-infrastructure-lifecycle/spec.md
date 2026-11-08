# Spec Delta

## ADDED Requirements

### Requirement: Guidance distinguishes human integration steps from behavior evidence

Proposal and handoff guidance SHALL reserve required manual actions for mandatory external human work that the agent cannot perform within its available authority. Available instruction reading SHALL be performed by the agent after applicable consent. Deferred or optional behavior checks SHALL remain separate unverified results or first-use guidance, without fabricated loading evidence.

#### Scenario: The agent can read the approved instructions

- **WHEN** approved infrastructure is connected and the agent can read its instructions, but fresh-session behavior has not been observed
- **THEN** the agent performs available reading and explains the unverified fresh-session behavior and first useful request
- **AND** future reading or an optional representative task alone does not become a required manual integration step

#### Scenario: Only a mandatory human activation remains

- **WHEN** connection requires an external host activation that the agent cannot perform and the human has not completed it
- **THEN** the proposal identifies that concrete required manual action and handoff retains `manual-action-required`
- **AND** an instruction file or suggested reading request does not establish completed activation or native loading

#### Scenario: An internal integration defect remains

- **WHEN** an internal failure or mandatory integration defect remains, even alongside manual actions
- **THEN** handoff remains `incomplete` with the cause and actual applied changes
- **AND** the agent neither relabels the defect as human work nor suppresses an accepted required action without a newly approved plan
