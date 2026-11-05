# landing-interactions Specification

## Purpose
Обеспечить предсказуемое управление интерактивными элементами статического лендинга с мышью, клавиатурой и на узком экране, сохраняя локальное создание пресета.

## Requirements

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


### Requirement: Legible responsive controls
Форма SHALL показывать полные значения по умолчанию и читаемые пояснения при ширинах 320, 390, 768, 1024 и 1440 px без горизонтального переполнения. Переключатели SHALL иметь область нажатия не менее 44 px по высоте; иконка раскрытия SHALL быть центрирована независимо от шрифта.

#### Scenario: Narrow preset form
- **WHEN** пользователь раскрывает конструктор при ширине 390 px
- **THEN** «Определить в проекте» видно полностью, поля расположены по доступному месту, а пояснения имеют размер не менее 12 px

### Requirement: Actionable validation
Ошибки пресета SHALL отображаться единообразно у соответствующего поля, быть связаны с ним для вспомогательных технологий и переводить фокус к первой ошибке. Исправление значения SHALL снимать прежнее состояние ошибки.

#### Scenario: Invalid name or path
- **WHEN** пользователь пытается скачать пресет с неверным именем или путём `../outside`
- **THEN** скачивание не происходит, поле получает состояние ошибки и доступное описание причины
- **AND** после исправления скачивается валидный preset.yaml

### Requirement: Local-only preset delivery
Ответы конструктора SHALL обрабатываться только в браузере. При отключённом или неинициализированном JavaScript форма SHALL оставаться недоступной для отправки ответов серверу.

#### Scenario: JavaScript disabled
- **WHEN** страницу открывают без JavaScript
- **THEN** команды установки доступны, кнопка скачивания отключена и ответы не отправляются навигацией формы

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
