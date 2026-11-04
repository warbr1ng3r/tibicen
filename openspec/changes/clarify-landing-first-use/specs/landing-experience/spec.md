# Spec Delta

## ADDED Requirements

### Requirement: First use has a direct route and recovery guidance

The landing SHALL explain that Tibicen installs two skills inside the selected coding agent, for initial setup or improving existing instructions. It SHALL present agent selection, the pinned command, a fresh project session and a first request in understandable order. Material loading/Windows limits SHALL remain visible, with deeper details and a documented recovery route.

#### Scenario: A first-time visitor follows installation

- **WHEN** a visitor opens either language route and follows the main action
- **THEN** they can identify what is installed, where to run the command and what to send the agent next
- **AND** supported manager/agent choices and exact copied parameters remain unchanged

#### Scenario: The agent does not find the skill

- **WHEN** a visitor looks for help after installation
- **THEN** concise guidance points to a fresh session, the selected target and documented loading steps
- **AND** any manual fallback is labeled without promising automatic discovery

### Requirement: Illustrations show the starting project and complete interaction

The page SHALL show clearly labeled illustrative init and adopt flows with a recognizable starting project, ordinary user request, agent inspection, necessary clarification or its absence, exact proposed change, approval and outcome. Preserved application files and useful decisions SHALL be visible. Illustrations SHALL NOT claim recorded success, human benefit or unreleased functionality.

#### Scenario: A visitor evaluates an existing-project example

- **WHEN** the visitor reads the adopt illustration
- **THEN** the initial useful rule and obsolete instruction are understandable, as are the proposed correction and preserved content
- **AND** the result distinguishes file checks from unverified future behavior

#### Scenario: A visitor has no agent instructions yet

- **WHEN** the visitor reads the init illustration
- **THEN** they can see what existed before and the minimal instructions proposed after inspection
- **AND** a question is not invented when existing evidence suffices

### Requirement: Mobile first action is not dominated by decoration

On narrow screens the hero illustration SHALL remain legible without dominating the first-use route. The installation command SHALL follow concise setup guidance rather than repeated technical explanation. Both languages SHALL preserve usable controls, focus, reduced-motion behavior and content reflow without horizontal overflow at 320 CSS pixels.

#### Scenario: The page is viewed on mobile

- **WHEN** either language route is viewed at 390 by 844 pixels or 320 CSS pixels wide
- **THEN** the hero occupies less vertical space than the reviewed baseline and the installation card follows its heading with concise context
- **AND** the main action, limits, selectors and command remain usable without horizontal scrolling
