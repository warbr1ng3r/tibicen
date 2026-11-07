# Spec Delta

## ADDED Requirements

### Requirement: Contained restaging preserves declared file permissions
The contained evaluator SHALL accept optional ordinary input-file modes, defaulting unspecified files to 0644. It SHALL reject invalid mode maps before metadata, container or credential work, bind effective permissions into the input freeze, and preserve returned modes through maintained continuation and check paths. Directory modes and existing containment limits SHALL remain unchanged.

#### Scenario: Collected project files enter a fresh session
- **WHEN** input files have declared 0600, 0644 or 0755 modes
- **THEN** contained staging retains each file's bytes and declared mode
- **AND** continuation and independent checks use those modes without rewriting a project manifest to match a staging artifact

#### Scenario: A legacy caller supplies bytes only
- **WHEN** an input omits the mode map or explicitly supplies 0644 for the same files
- **THEN** regular files stage as 0644 and effective input bindings are equivalent

#### Scenario: A map names an undeclared file or unsafe permissions
- **WHEN** mode input has an invalid shape, unknown path, noninteger value, special bits or a value outside ordinary permission bits
- **THEN** validation rejects it before metadata, container creation or auth access

#### Scenario: Modes change after a prospective freeze
- **WHEN** a file's effective mode changes without changing its bytes
- **THEN** the input freeze changes and stale approval cannot authorize the altered input

#### Scenario: Prior observations exist
- **WHEN** the mode regression passes on the corrected evaluator
- **THEN** old outcomes, missing repeats and the terminally failed useful task retain their original status
- **AND** no native rerun or benefit claim follows from the offline correction
