# Spec Delta

## MODIFIED Requirements

### Requirement: Consistent custom selection

Selection controls SHALL present styled menus, selected values and accessible names. They SHALL support keyboard operation, Escape, outside dismissal and viewport containment. Installation controls SHALL select the command runner for the explicit universal route. Optional preset harness hints SHALL allow catalog suggestions and well-formed uncatalogued IDs without changing installation or granting capabilities.

#### Scenario: Keyboard selection

- **WHEN** a user opens a select with Enter or Space, chooses with arrows and confirms with Enter
- **THEN** the value updates, the menu closes and focus returns to its control
- **AND** confirming an option does not download the preset

#### Scenario: Installation and form values

- **WHEN** a user changes the command runner or preset preferences
- **THEN** the universal installation command and downloaded preset reflect those choices
- **AND** the default programming-language hint remains absent

#### Scenario: Dismissal and viewport edges

- **WHEN** a menu is dismissed with Escape or an outside click, or opened near a viewport edge
- **THEN** it closes predictably or contains its choices without clipping

## ADDED Requirements

### Requirement: Unknown harness hints remain local and accessible

The optional form SHALL retain valid uncatalogued harness IDs using the same validation as the core. Invalid or excessive distinct hints SHALL show a localized accessible field error and prevent download. Correcting the field SHALL clear that error. Preference entry SHALL remain local to the browser.

#### Scenario: A user enters a private harness

- **WHEN** the visitor combines a catalog suggestion with a valid private harness ID
- **THEN** the downloaded preset retains both identities without creating a catalog entry
- **AND** no answer is sent to a server

#### Scenario: An invalid custom identity is corrected

- **WHEN** the visitor attempts download with an invalid custom ID and then corrects it
- **THEN** the first attempt shows the error at the relevant field and moves focus there
- **AND** the corrected valid preset can be downloaded without stale invalid state
