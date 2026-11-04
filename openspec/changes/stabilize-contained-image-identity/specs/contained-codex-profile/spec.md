## ADDED Requirements

### Requirement: Stable execution image fingerprint

The contained profile SHALL fingerprint a fixed, versioned projection of the pinned image's ID, OS, architecture, optional variant, full configuration and full filesystem identity. Object key order SHALL NOT affect the fingerprint; array order SHALL remain significant. Auxiliary inspect-envelope fields SHALL NOT be part of execution-image identity.

#### Scenario: Equivalent inspect envelopes

- **WHEN** two responses have identical execution identity but differ in auxiliary GraphDriver, Descriptor or Identity metadata or object key order
- **THEN** repeated profile validation accepts the unchanged image without weakening the pinned ID or isolation checks

#### Scenario: Material identity change

- **WHEN** configuration, a filesystem layer identity or layer order differs from the frozen profile
- **THEN** validation refuses the changed image before native task launch

#### Scenario: Incomplete identity

- **WHEN** required configuration or filesystem identity is absent or malformed
- **THEN** inspection refuses instead of fingerprinting incomplete metadata
