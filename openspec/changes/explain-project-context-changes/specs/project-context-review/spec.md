# Spec Delta

## Purpose

Help working agents explain the evidence behind project instructions, remembered
facts and technology recommendations using optional read-only report input.

## ADDED Requirements

### Requirement: Optional context evidence preserves existing report behavior

Report SHALL accept bounded optional instruction sources, memory source relations and version-impact assessments alongside the existing task context. Invalid input SHALL fail before project inspection or save. Omitted fields SHALL preserve existing output. New evidence SHALL use only the permitted current inventory, without network requests, command execution or implicit writes.

#### Scenario: An existing caller supplies no new fields
- **WHEN** report receives the previously supported task context
- **THEN** its output retains the previous shape and behavior
- **AND** no new evidence assessment is invented

#### Scenario: Evidence input is invalid
- **WHEN** an optional list exceeds its limit, contains unknown item fields or malformed paths, hashes or text
- **THEN** report rejects the input before project inspection or saving
- **AND** no state or project file changes

### Requirement: Caller-selected instructions remain distinct from native discovery

Report SHALL compare at most sixteen unique caller-selected relative instruction paths and expected hashes with the permitted inventory. It SHALL identify matched, stale or unavailable evidence, label the selection as caller-supplied and expose no hash for excluded files. Selection SHALL NOT establish native loading, precedence, applicability or new write permission.

#### Scenario: An uncatalogued host uses a custom instruction filename
- **WHEN** valid task context selects `team-agent` and supplies an observed `RULES.md` hash
- **THEN** report compares that file without requiring a catalog entry
- **AND** native candidates and loading/use assessments retain their independent meaning

#### Scenario: A selected instruction is excluded or changed
- **WHEN** its path is forbidden, sensitive, unavailable or has different current bytes
- **THEN** report states unavailable or stale with the applicable reason
- **AND** excluded input hashes do not appear as observed evidence

### Requirement: Memory review distinguishes source changes from fact truth

Report SHALL compare at most sixteen supplied relations for one supported memory path with earlier source hashes. Source status SHALL distinguish unchanged, changed, missing and unverified. Note existence and meaning SHALL remain unverified; changed bytes SHALL request review, not declare a fact false. Relations SHALL NOT select a store, migrate memory or edit notes.

#### Scenario: A remembered fact has an earlier source binding
- **WHEN** a permitted source has changed since the supplied baseline hash
- **THEN** report flags that relation for review and separately states memory-file availability
- **AND** the old hash remains caller-supplied rather than independently proven history

#### Scenario: Source bytes are unchanged
- **WHEN** a relation matches current permitted bytes
- **THEN** report states unchanged source bytes without certifying the note's presence or truth

#### Scenario: The source or selected store cannot be assessed
- **WHEN** coverage is incomplete, a path is excluded or the reference conflicts with the registered memory store
- **THEN** the affected assessment remains unverified with a reason
- **AND** no competing store or automatic repair is created

### Requirement: Version impact retains attribution and local applicability limits

Report SHALL accept at most eight supplied source/date/hash and local-decision assessments. It SHALL retain keep/change/unknown reasoning only within its evidence scope, label upstream and semantic claims as caller-supplied and compare the local hash with the permitted inventory. Missing, excluded or changed local evidence SHALL downgrade the suggested action to unknown.

#### Scenario: New guidance is relevant to unchanged local evidence
- **WHEN** a supplied assessment explains its source, version scope, local decision and applicability and the local hash matches
- **THEN** report retains that explanation as a supplied assessment
- **AND** it does not claim observed installed versions, verified compatibility or native use

#### Scenario: Local evidence is stale or excluded
- **WHEN** current local evidence differs or cannot be assessed safely
- **THEN** report returns unknown with a current-evidence reason
- **AND** supplied hashes or assessment text for excluded paths do not become observed output

### Requirement: Working-agent guidance collects evidence without additional user burden

Guidance SHALL explain how agents collect actual current instruction hashes, retain earlier memory/source bindings and assess upstream changes against local decisions. It SHALL allow omission when evidence is unavailable, forbid invented historical hashes and preserve existing memory ownership and exact-plan consent. It SHALL NOT require an extra questionnaire or an automatic updater.

#### Scenario: No earlier source binding exists
- **WHEN** an agent cannot establish the historical bytes behind a memory note
- **THEN** it reports that limit or omits the relation
- **AND** it does not label today's hash as a historical baseline

#### Scenario: Guidance suggests a useful correction
- **WHEN** an assessment identifies a concrete justified change
- **THEN** the agent explains the smallest proposed change through the existing review/approval workflow
- **AND** the report itself applies nothing
