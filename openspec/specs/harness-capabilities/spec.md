# harness-capabilities Specification

## Purpose

Describe harness identities and documented project capabilities without confusing recognition with approved mutation, installation or observed execution.

## Requirements

### Requirement: Read-only dated harness catalog

Tibicen SHALL expose a static catalog through a read-only `harnesses` command. Each known entry SHALL retain identity, label, documentation date/scope, official sources, instruction/skill locations and documented or legacy status. Unknown selections SHALL produce an explicit unknown result. Catalog facts SHALL NOT claim current installed versions or native loading/use.

#### Scenario: Current and legacy profiles are listed

- **WHEN** the catalog is listed without a selection
- **THEN** it includes the existing three IDs and reviewed additional CLI/IDE profiles
- **AND** version-specific guidance and legacy status remain visible without launching code or reading user credentials

#### Scenario: An unknown harness is selected

- **WHEN** a bounded valid selection names a harness outside the catalog
- **THEN** that identity receives an explicit unknown result without substituting another harness
- **AND** no domain, path, installer or execution permission is created

### Requirement: Preset hints follow the catalog

Core and browser preset validation SHALL accept the same catalog identities while preserving schema 1 and existing presets. The local-only form SHALL present names as preferences, not verified installation or execution support. Unknown or malformed preset identities SHALL retain a clear validation error.

#### Scenario: A user selects Gemini CLI and OpenCode

- **WHEN** a local preset is created with those catalog identities
- **THEN** browser and core validation agree and preserve their IDs
- **AND** installation commands retain the separately verified installer choices and distribution pin

### Requirement: Observation is distinct from authority

Inventory and current diagnosis SHALL recognize documented project instruction candidates and distinctive harness markers. Shared instruction/skill locations SHALL NOT uniquely identify a harness. Existing exclusions, scan limits and approval/write policy SHALL remain authoritative. Structural memory references SHALL NOT establish actual instruction loading or memory use.

#### Scenario: Shared instructions are present

- **WHEN** a project contains only AGENTS.md or shared .agents skills
- **THEN** they remain infrastructure candidates without identifying one harness as installed

#### Scenario: Native instructions are found

- **WHEN** permitted inventory finds GEMINI.md or a reviewed native rule location
- **THEN** current diagnosis includes the candidate and any distinctive marker with installed version/loading/use unverified
- **AND** that observation does not make a previously protected path writable

#### Scenario: A native rule points to existing memory

- **WHEN** an observed instruction candidate explicitly references the registered memory store
- **THEN** structural connection checks can recognize the reference
- **AND** the store, application, exclusions and native behavior evidence remain unchanged

### Requirement: Capability authorities remain independent

Catalog identities SHALL NOT expand checked runtime adapters, MCP/process behavior, installer targets or native evaluation profiles. Init/adopt SHALL explain documented, unavailable and unverified capabilities, preserve useful existing configurations and propose only supported exact changes with consent.

#### Scenario: A documented harness lacks a Tibicen MCP adapter

- **WHEN** the harness documents MCP but Tibicen has no checked adapter
- **THEN** the catalog remains documentation evidence and the missing adapter stays explicit
- **AND** Tibicen does not reuse another harness's syntax, initialize it or execute a server
