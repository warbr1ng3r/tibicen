## ADDED Requirements

### Requirement: Primary public site and legacy continuity

Current product links and default landing metadata SHALL use https://tibicen.pages.dev. The four legacy GitHub Pages routes SHALL redirect to the corresponding primary page with a visible fallback link and without requiring JavaScript. The existing GitHub Pages maintenance/index.json endpoint SHALL remain a direct JSON response with unchanged source bytes and channel identity.

#### Scenario: A legacy visitor opens a known route

- **WHEN** a visitor opens /tibicen/, /tibicen/ru/, /tibicen/preset/ or /tibicen/ru/preset/
- **THEN** navigation reaches the corresponding Cloudflare route preserving language and page type
- **AND** a fixed canonical URL and fallback link identify that destination
- **AND** JavaScript-enabled navigation preserves query and fragment without allowing a different destination origin

#### Scenario: JavaScript is disabled

- **WHEN** the visitor opens any known legacy route without JavaScript
- **THEN** the HTML redirect reaches the corresponding Cloudflare route

#### Scenario: An existing checksum consumer reads its endpoint

- **WHEN** a client requests /tibicen/maintenance/index.json
- **THEN** it receives JSON directly, byte-identical to the canonical committed index
- **AND** no redirect, HTML wrapper or rewritten release/channel record replaces it
