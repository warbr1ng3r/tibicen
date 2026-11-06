## MODIFIED Requirements

### Requirement: Honest first-use guidance
The landing SHALL distinguish first setup and improvement, place one recommended installation and the first request on the main path, and link to optional presets on a secondary page. Claims SHALL match the published distribution and recorded checks.

#### Scenario: A visitor starts without a preset
- **WHEN** a visitor opens either home language route
- **THEN** both tasks and their explicit first requests are available without choosing a command runner or completing a form
- **AND** the preset builder is a secondary link rather than a form on the home page

#### Scenario: Public distribution is not configured
- **WHEN** a public delivery channel is unavailable
- **THEN** guidance does not invent a repository or published release

### Requirement: Equivalent installer commands
Installation SHALL show the exact npx command first. An optional disclosure SHALL provide equivalent pnpm and Yarn 2+ commands and the manual guide. Every command SHALL retain skills@1.7.4, the published full SHA, both skills, global copy behavior and --agent universal. Source skill builds SHALL remain independent of site dependencies.

#### Scenario: A visitor switches package manager and agent
- **WHEN** a visitor opens alternative installation methods
- **THEN** pnpm and Yarn 2+ preserve the same accepted installer and distribution semantics as npx
- **AND** no harness selector or new installer is required

#### Scenario: JavaScript is unavailable
- **WHEN** either home route is opened without JavaScript
- **THEN** the primary command, alternatives, manual guide and first requests remain readable

### Requirement: Illustrations show the starting project and complete interaction
Illustrations SHALL offer init and adopt with one compact example visible at a time. Each SHALL retain the starting project, ordinary request, inspection, clarification or its justified absence, exact proposal, approval and outcome. Detailed trees/diffs can be disclosed. Preserved decisions and unverified future behavior SHALL remain explicit; examples SHALL NOT claim recorded success or human benefit.

#### Scenario: A visitor evaluates an existing-project example
- **WHEN** the visitor selects the adopt illustration
- **THEN** the useful rule, obsolete test command, exact correction, approval and preserved application are available
- **AND** future behavior is not claimed from file checks alone

#### Scenario: A visitor has no agent instructions yet
- **WHEN** the visitor selects init
- **THEN** the existing project and minimal proposed instructions are clear
- **AND** no question is invented when project evidence suffices

#### Scenario: A visitor compares cases
- **WHEN** the visitor changes the example using keyboard or pointer
- **THEN** the selected case is clear and only that case occupies the primary example space
- **AND** switching remains usable without JavaScript

## ADDED Requirements

### Requirement: Secondary bilingual preset pages
The site SHALL provide dedicated EN/RU preset pages linked from home. Each SHALL retain local validation/download, material privacy information, language-equivalent navigation and a return to the main first-use route. Preset answers SHALL NOT be sent to a server.

#### Scenario: A visitor opens preferences
- **WHEN** a visitor follows the preset link from either home route
- **THEN** the matching-language builder opens ready for input
- **AND** switching language remains on the builder and returning home reaches the matching-language first-use route

#### Scenario: Script initialization is unavailable
- **WHEN** a preset page is loaded with JavaScript disabled or its handler has not initialized
- **THEN** native submission remains disabled and no answers are sent to a server
