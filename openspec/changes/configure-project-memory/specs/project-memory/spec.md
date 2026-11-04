# Spec Delta

## Purpose

Configure project memory around the user's priorities so later agents can find, retain and correct useful decisions while preserving existing notes and explicit write boundaries.

## ADDED Requirements

### Requirement: Memory policy follows evidenced user priorities

Tibicen SHALL recommend memory rules from the user's request and permitted project evidence. It SHALL distinguish explicit lasting decisions from inferred preferences and temporary requests, show correctable assumptions, and retain the existing interview limits.

#### Scenario: A user describes what matters without naming a memory tool

- **WHEN** the user asks agents to retain architecture decisions and avoid unnecessary dependencies
- **THEN** the recommendation states which decisions and reasons to retain and when to consult them
- **AND** the user does not have to select a storage technology or complete a separate mandatory questionnaire

#### Scenario: A one-off response request is available

- **WHEN** the only style evidence is "answer this briefly"
- **THEN** it is not installed as a confirmed permanent memory rule
- **AND** any inferred preference remains visible and correctable

### Requirement: Project memory has one canonical location

Tibicen SHALL identify one supported project memory file, reuse suitable existing memory, and propose a new default only when needed. The selected path, initial content changes and instruction pointers SHALL be part of the reviewed plan. Unsupported stores SHALL retain their content and an explicit limitation.

#### Scenario: Existing memory is sufficient

- **WHEN** the project already has useful memory at a supported path
- **THEN** Tibicen connects the selected agents to that file without creating a competing copy
- **AND** unrelated notes remain byte-for-byte unchanged

#### Scenario: No project memory exists

- **WHEN** the user needs memory and no suitable store is found
- **THEN** the plan proposes one `.agents/memory.md` file and short applicable instruction pointers
- **AND** nothing is created before approval

### Requirement: Memory rules define reading and maintenance triggers

The approved instructions SHALL state what to read before relevant work, what confirmed information to retain, when to update it, and how to correct superseded decisions. They SHALL separate durable project knowledge from temporary task progress and keep routine updates within the user's approved scope.

#### Scenario: A later task depends on an earlier decision

- **WHEN** a new agent session receives a task affected by a recorded project constraint
- **THEN** the instructions direct it to the relevant memory before choosing its approach
- **AND** unrelated history is not required in the always-loaded instruction text

#### Scenario: The user changes a project decision

- **WHEN** the user explicitly replaces an earlier accepted decision
- **THEN** the working agent updates its current meaning and records the reason or source when available
- **AND** contradictory old text is not left as another equally current instruction

### Requirement: Memory records preserve provenance and uncertainty

The policy SHALL distinguish accepted decisions, verified project facts and unresolved assumptions. It SHALL retain useful reasons or source references without inventing confirmation. Sensitive content and full transcripts SHALL NOT be copied into project memory by default.

#### Scenario: A hypothesis has not been confirmed

- **WHEN** an agent infers a preference or possible technical explanation
- **THEN** it does not record it as an established permanent fact
- **AND** an unresolved item is labeled as such or remains outside durable memory

### Requirement: Adopt preserves working memory and resolves actual conflicts

An adopt run SHALL inspect current permitted memory, retain useful notes and propose only justified changes. A changed memory body after a completed setup SHALL be normal user-owned state, not automatic evidence of broken installation. Conflicts SHALL follow the user's explicit decisions rather than file age or load order.

#### Scenario: An agent added a legitimate decision after setup

- **WHEN** adopt runs again after the memory file has changed
- **THEN** it uses the current body as input and preserves the added decision
- **AND** it does not restore the setup template or report a fixed-content mismatch solely for that addition

#### Scenario: Several candidate stores disagree

- **WHEN** two existing stores contain materially conflicting decisions and the intended current source is unknown
- **THEN** Tibicen exposes the conflict and follows the existing clarification or no-questions gap rules
- **AND** it does not silently merge them or discard the user's history

### Requirement: Memory remains optional and local to the selected project

Tibicen SHALL keep sufficient existing setups and declined memory unchanged. Memory setup SHALL use the normal approved file workflow, without a resident Tibicen process, external account or automatic editing of global agent memory. Ongoing maintenance is performed by the working agents under the configured policy.

#### Scenario: The user declines memory setup

- **WHEN** the user declines the optional recommendation
- **THEN** no memory file or memory-specific dependency is added
- **AND** the ordinary init or adopt result can still complete

#### Scenario: A connection cannot be established safely

- **WHEN** the chosen store is unsupported, forbidden or unavailable
- **THEN** the report identifies the missing connection or manual action
- **AND** file presence is not presented as a working memory process
