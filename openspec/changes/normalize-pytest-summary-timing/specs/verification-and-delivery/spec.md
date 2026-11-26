## MODIFIED Requirements

### Requirement: Project verification covers every approved command
Project verification SHALL report a comparable result only after the complete identical approved command set has executed against the appropriate baseline and final trees. Partial execution, missing trust, a changed command source or an unknown outcome SHALL remain `unverified` with a reason. Failure comparison SHALL tolerate variable durations in recognized runner timing records while retaining meaningful failure differences.

#### Scenario: Both runs stop after the same successful prefix
- **WHEN** the first command passes in both trees but the second cannot execute because its reviewed script changed
- **THEN** the result remains `unverified` even if the first command records match
- **AND** the report does not claim the entire approved command set has no regressions

#### Scenario: Trust or command outcome prevents completion
- **WHEN** a command lacks trust or its earlier execution outcome is unknown
- **THEN** incomplete execution does not become `green`, `red-fixed` or `pre-existing-red`
- **AND** the reason and previously known regressions survive independently of handoff status

#### Scenario: A complete comparison is available
- **WHEN** all approved commands have completed and are comparable
- **THEN** the distinction between green results, existing failures, fixes and new regressions is preserved
- **AND** a new project needs no invented baseline but still requires the complete final command set

#### Scenario: Identical failures differ only in recognized runner timing records
- **WHEN** comparable failing runs have the same nonzero exit code and differ only in a Node spec/TAP timing record, a complete Python unittest timing summary, or a complete framed pytest summary line (`=+ <counts or "no tests ran"> in Ts =+`)
- **THEN** comparison reports `pre-existing-red` instead of a new regression
- **AND** test names, assertion values and test counts remain part of the compared output

#### Scenario: Pytest adjusts padding around its duration
- **WHEN** an otherwise identical framed summary changes its separator width because the duration crosses a digit, minute or day boundary
- **THEN** the recognized timing and separator padding normalize together
- **AND** only timedelta-shaped clock annotations are ignored; arbitrary parenthesized diagnostics remain meaningful differences

#### Scenario: Duration-shaped data changes the failure
- **WHEN** a failure changes an asserted value, test name, summary counts or ordinary log phrase from `(1s)` to `(5s)`, or changes an unrelated `duration_ms` field or an unframed `in Ts` phrase
- **THEN** the meaningful difference remains `changed-failure`
- **AND** unsupported output formats retain strict comparison

#### Scenario: The failure exit code changes
- **WHEN** comparable runs have identical normalized output but different nonzero exit codes
- **THEN** comparison reports `changed-failure` rather than `pre-existing-red`
