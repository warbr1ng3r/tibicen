# Spec Delta

## MODIFIED Requirements

### Requirement: Equivalent installer commands

Installation SHALL offer npm, pnpm and Yarn 2+ with the same pinned installer, exact published distribution, two selected Tibicen skills and copy behavior. The primary command SHALL explicitly select the installer's universal target rather than a brand or implicit auto-detection. Building skills from source SHALL remain independent from landing dependencies.

#### Scenario: A visitor switches package manager and agent

- **WHEN** a visitor selects npm, pnpm or Yarn 2+ for the normal installation route
- **THEN** the command preserves skills@1.7.4, the exact distribution pin, both skill names, global copy behavior and --agent universal
- **AND** README and landing describe that same common-folder route without a mandatory agent selector

### Requirement: First use has a direct route and recovery guidance

The landing SHALL explain the two skills inside the user's existing file/Node-capable agent, for initial setup or improvement. First use SHALL present universal installation, explicit skill-file reading in the project session and an ordinary request before optional preferences. It SHALL separate explicit loading from native discovery and retain material platform/operation limits and a complete manual-folder fallback.

#### Scenario: A first-time visitor follows installation

- **WHEN** a visitor opens either language route and follows the main action
- **THEN** they can identify both skills, the common user-scope installation folder, where to run the command and the exact first reading/request step
- **AND** their harness, model and provider need not appear in Tibicen's catalog

#### Scenario: The agent does not find the skill

- **WHEN** automatic skill discovery is absent or unknown
- **THEN** the page gives the explicit SKILL.md reading route instead of requiring a different harness
- **AND** the route does not claim automatic discovery or compatibility

#### Scenario: The installer is not a usable route

- **WHEN** the visitor chooses manual installation
- **THEN** guidance names the published archive and checksum verification, both skill directories and their complete resources, the chosen destination and exact explicit-load step
- **AND** it does not suggest copying SKILL.md alone or invent a native loading folder

#### Scenario: The host lacks local operations

- **WHEN** the selected host cannot read project files or run the required Node operations
- **THEN** the visitor sees the specific local/manual requirement and relevant platform limits
- **AND** the page does not imply a completed automated setup or require new provider credentials
