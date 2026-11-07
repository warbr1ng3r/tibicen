## ADDED Requirements

### Requirement: Installing Tibicen alone retains initial setup routing
Tibicen SHALL select initial setup when canonical Tibicen skill folders at recognized project skill roots are the only observed infrastructure. This route hint SHALL preserve the full inventory and SHALL NOT change project emptiness, consent, trust, exclusions or write permissions.

#### Scenario: First setup after project-local installation
- **WHEN** a project contains installed tibicen-init and tibicen-adopt but no other agent infrastructure
- **THEN** scan selects init and inventories all permitted skill files as infrastructure
- **AND** application files, if present, remain unchanged

#### Scenario: Existing user setup alongside the utility
- **WHEN** the project also contains user instructions, another skill, or registered memory or a manifest
- **THEN** scan selects improve and retains every observed file

#### Scenario: Noncanonical skill names remain conservative
- **WHEN** a similarly named or renamed skill is found outside the exact canonical Tibicen folder names
- **THEN** it remains existing infrastructure for route selection

#### Scenario: Initial route does not make a folder empty
- **WHEN** only project-local Tibicen skill files occupy the project
- **THEN** initial route does not authorize starter application writes or implicit package or Git initialization
- **AND** normal before-content, forbidden-path and symlink protections remain in force

#### Scenario: A self-named example remains owned by outer user rules
- **WHEN** an example path named like a canonical Tibicen skill is nested inside recognized user rule, command, instruction or MCP areas
- **THEN** those user-owned files still select improve
- **AND** no inventory or write protection is weakened by the inner folder name
