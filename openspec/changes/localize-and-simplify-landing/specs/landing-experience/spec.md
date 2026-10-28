# Spec Delta

## ADDED Requirements

### Requirement: English-default bilingual static routes
The landing SHALL serve English at the configured base route and Russian at its `ru/` route. Both pages SHALL provide an accessible language link visible on mobile and usable without JavaScript, with localized page text, title, description, html language and accessible labels.

#### Scenario: A visitor opens the base route
- **WHEN** a visitor opens `/` or `/tibicen/` under the corresponding hosting base, including with a Russian browser locale or JavaScript disabled
- **THEN** the server-delivered page is English and includes installation, both first prompts and a working link to Russian
- **AND** no locale detection or automatic redirect is required

#### Scenario: A visitor switches languages under a project base
- **WHEN** a visitor follows the language link from `/tibicen/` to `/tibicen/ru/` and back on desktop or mobile
- **THEN** the content and metadata match the chosen language, all local assets/licenses remain inside the hosting base and both routes load without JavaScript

### Requirement: Compact first-use and illustrative results
The landing SHALL place installation and both first prompts together after the hero, before optional preset configuration. It SHALL show one concise workflow and a clearly labelled illustrative before/after and final report, including changed infrastructure, preserved application files, checks and unverified work.

#### Scenario: A visitor starts without configuration
- **WHEN** the page opens in either language
- **THEN** the visitor can install and copy an init or adopt prompt without completing the preset or returning to an earlier section
- **AND** the preset is collapsed, and the page does not repeat full workflow explanations or present the manifest filename as the main benefit

#### Scenario: A visitor examines the example
- **WHEN** the visitor reads the result example
- **THEN** it is visibly labelled as an illustration rather than a measured or guaranteed outcome
- **AND** it distinguishes an approved infrastructure change, preserved application files, checked results and unverified agent behavior

### Requirement: Evidence-scoped support and project links
The landing SHALL describe generic coding agents in its main promise. It SHALL retain real installation targets, distinguish verified delivery from experimental choices and app exercises, and place practical platform limitations and source/release/canonical English guide links beside installation. Third-party notices SHALL remain available.

#### Scenario: A visitor evaluates installation support
- **WHEN** the visitor chooses Codex, Claude Code or Cursor
- **THEN** the page distinguishes the verified macOS/Node 24/Codex delivery scope from experimental targets and does not infer universal support from a copied-skill ZCode exercise
- **AND** Windows command-execution limitations and relevant canonical English guidance are available before installation

#### Scenario: A visitor follows project links
- **WHEN** the visitor uses the links beside installation or in the footer in either language
- **THEN** the source, release notes and installation/update/removal guide point to the real Tibicen repository and English documentation
- **AND** AstroWind and Starwind notices remain accessible inside the hosting base
