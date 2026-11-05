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
Core and browser preset validation SHALL accept the same well-formed harness ID hints, including uncatalogued identities, while preserving schema 1 and existing presets. The local-only form SHALL present catalog entries as optional suggestions. IDs SHALL use the existing bounded lowercase slug syntax, with at most sixteen distinct hints; duplicate hints SHALL not increase that count. Hints SHALL NOT grant native, network, write, installation or execution capabilities.

#### Scenario: A user selects Gemini CLI and OpenCode

- **WHEN** a local preset is created with those catalog identities
- **THEN** browser and core validation agree and preserve their IDs
- **AND** the identities remain preferences independent from the installation route and distribution pin

#### Scenario: A private harness is absent from the catalog

- **WHEN** a preset includes a valid uncatalogued ID such as team-agent
- **THEN** core and browser accept and retain it without requiring a catalog addition
- **AND** native guidance, documentation and probe capabilities remain unknown unless separately established

#### Scenario: A malformed or excessive hint is submitted

- **WHEN** hints include malformed or non-string values, missing array entries or more than sixteen distinct valid IDs
- **THEN** validation returns an actionable error without a download or state write
- **AND** existing valid presets, including repeated known IDs, remain readable


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

### Requirement: Explicit portable skill workflow
Tibicen SHALL provide an explicit skill-file workflow for a host able to read the project and run the required Node runtime, without requiring a catalog identity, agent brand, model or provider. The workflow SHALL retain the existing approved common-instruction path and one project memory store where sufficient. Explicit reading SHALL NOT be represented as native autodiscovery.

#### Scenario: An uncatalogued host configures an existing application

- **WHEN** a file/Node-capable host explicitly reads tibicen-init and the user requests setup
- **THEN** it can inspect and propose approved common AGENTS.md changes without substituting a known brand
- **AND** application files, useful decisions, exact consent and write limits remain preserved

#### Scenario: Several hosts use the same project instructions

- **WHEN** explicit reading of one approved AGENTS.md is sufficient for the user's work
- **THEN** the recommendation can retain that one file without native shared-copy/version requirements
- **AND** the handoff gives the exact reading step and keeps automatic discovery unverified

### Requirement: Available operations are separate from model identity
Init/adopt SHALL distinguish available project-file, Node, write and activation operations from optional native probes. A missing operation SHALL produce a specific gap or manual step without requiring a model/provider or harness switch. Existing native methods SHALL keep their trust, startup, version and credential limits.

#### Scenario: The user changes the host model or provider

- **WHEN** the same host performs the required file and Node operations with a user-selected LLM
- **THEN** the ordinary setup workflow requires no Tibicen model allowlist, provider client or new credential
- **AND** unobserved model/version identities remain unverified rather than invented

#### Scenario: The host cannot execute Node or read local files

- **WHEN** an operation required for actual inspection or application is unavailable
- **THEN** the agent explains that exact limitation and offers the applicable local/manual next step
- **AND** it does not claim that unread files were inspected or unapplied changes and checks completed

#### Scenario: The host has no checked automatic behavior probe

- **WHEN** common instruction setup is available but no supported native task, quiz or loading method is established
- **THEN** the available setup proceeds within consent and its structural scope
- **AND** unavailable optional behavior checks remain explicit without becoming a fabricated pass or blanket product rejection
