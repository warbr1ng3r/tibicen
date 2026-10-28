# Spec Delta

## ADDED Requirements

### Requirement: Locale-complete interaction feedback
All installation/preset labels, help, validation errors, copy progress/success/failure and download feedback SHALL use the current page language, including assistive text. Invalid fields SHALL retain accessible error association, focus and recovery behavior in both languages.

#### Scenario: Invalid values are rejected in either locale
- **WHEN** invalid name, process, response style, agent, programming-language hint, project-kind hint or forbidden path is supplied in English or Russian
- **THEN** the same validation rule rejects it with a message in that page language and no download
- **AND** name/path browser errors identify and focus the field, expose hidden advanced controls when needed and clear after editing

#### Scenario: Copy succeeds or fails
- **WHEN** the visitor copies an install command or first prompt
- **THEN** copy progress and success use the current language
- **AND** if both clipboard access and selection fallback fail, a localized message explains manual copying

#### Scenario: A valid preset is downloaded
- **WHEN** the visitor submits a valid preset in either language
- **THEN** preset.yaml is downloaded locally with localized feedback and no answer-bearing network request

### Requirement: Locale-independent installation and preset values
Page language SHALL affect presentation only. Equivalent selections SHALL produce byte-identical installer commands and preset content in both locales. Agent IDs, manager tokens, schema, field names and defaults SHALL remain unchanged; page locale SHALL NOT populate the programming-language hint.

#### Scenario: All installer choices remain equivalent
- **WHEN** a visitor selects any of the three existing managers and three existing installation targets in either language
- **THEN** the displayed command equals the existing pinned release command for that selection
- **AND** the default remains `npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/v0.1.0-alpha.1 -g --agent codex --skill tibicen-init tibicen-adopt --copy`

#### Scenario: UI language is separate from project preferences
- **WHEN** visitors download equivalent presets from English and Russian, including empty stack defaults
- **THEN** serialized presets are byte-identical and have no new locale field or language hint inferred from page language
- **AND** the programming-language selector is named distinctly from the page-language switch

#### Scenario: No-JavaScript locale navigation preserves privacy
- **WHEN** the visitor switches English to Russian and back without JavaScript and attempts preset submission
- **THEN** both pages remain readable, preset controls remain disabled and no answers are transmitted
