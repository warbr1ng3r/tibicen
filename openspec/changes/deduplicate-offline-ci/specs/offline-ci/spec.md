# Spec Delta

## Purpose

Validate development changes and standalone distributions without duplicate automatic runs or repeated build stages.

## ADDED Requirements

### Requirement: Automatic checks follow the review lifecycle
Offline CI SHALL run for pull requests, pushes to main and manual dispatch. A feature-branch push SHALL NOT independently duplicate the pull-request run. A newer run SHALL cancel outdated runs of the same workflow and ref without cancelling another ref or workflow.

#### Scenario: A feature PR receives a new commit
- **WHEN** a feature branch with an open pull request receives a push
- **THEN** pull_request triggers the offline checks, without a second push-triggered run
- **AND** the previous run for that PR can be cancelled while other PRs remain independent

#### Scenario: Main receives a change
- **WHEN** a commit is pushed to main
- **THEN** offline checks validate the resulting main tree
- **AND** an operator can still request a manual run on a selected ref

### Requirement: Each run preserves the complete offline gate
Each CI run SHALL execute all existing lint, formatting, type, site-build, strict-spec, standalone-build and Node-test checks before unpacked-distribution validation. Successful completion SHALL NOT require repeating the build stages. Permissions, pinned actions and model-free execution SHALL remain unchanged.

#### Scenario: A fresh checkout completes validation
- **WHEN** locked dependencies are installed and the full offline gate succeeds
- **THEN** both built skills are unpacked outside the checkout, checksums are verified and both CLI self-tests run with empty PATH
- **AND** no test case or safety check is removed to reduce execution time
