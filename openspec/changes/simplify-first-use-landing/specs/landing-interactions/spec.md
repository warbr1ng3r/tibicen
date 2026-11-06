## MODIFIED Requirements

### Requirement: Consistent custom selection
Preset selection controls SHALL retain styled values, accessible names, keyboard operation, Escape/outside dismissal and viewport containment. Optional harness hints SHALL accept catalog suggestions and valid unknown IDs without granting capabilities. Installation alternatives SHALL be readable explicit commands, without requiring custom selection or JavaScript.

#### Scenario: Keyboard selection
- **WHEN** a user opens a preset select with Enter or Space, chooses with arrows and confirms with Enter
- **THEN** the value updates, the menu closes and focus returns to its control
- **AND** confirmation does not download the preset

#### Scenario: Installation and form values
- **WHEN** the visitor chooses an alternative installer command or changes preset preferences
- **THEN** equivalent installer semantics or downloaded preferences reflect that choice
- **AND** no default language hint is invented

#### Scenario: Dismissal and viewport edges
- **WHEN** a preset menu is dismissed or opened near a viewport edge
- **THEN** it closes predictably or contains its choices without clipping

## ADDED Requirements

### Requirement: Independent home and preset initialization
Shared page behavior SHALL copy installation and first-request text on pages without a preset form. Preset handlers SHALL initialize only where the form exists. Both page types SHALL remain free of initialization errors and preserve localized accessible feedback.

#### Scenario: Copy on the home page
- **WHEN** a visitor copies the installation or first request on a home page with no form
- **THEN** the complete visible command/request is copied and localized status is announced

#### Scenario: Download on the preset page
- **WHEN** a visitor corrects invalid preferences and downloads
- **THEN** validation clears and the local preset retains the chosen values without a network submission
