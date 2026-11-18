# Spec Delta

## ADDED Requirements

### Requirement: Windows approved command lifecycle

On a supported Windows host, Tibicen SHALL run supported approved and trusted commands in the controlled copy, preserve their actual exit code and bounded redacted output, and terminate ordinary descendants on normal completion, cancellation or timeout. Missing process control SHALL remain unavailable with no successful project result.

#### Scenario: A native check completes

- **WHEN** the unchanged approved command runs a native executable in the controlled copy and exits with 0 or 37
- **THEN** the recorded project exit code is respectively 0 or 37, independent of the launcher's exit code
- **AND** project stdout cannot supply the launcher's control receipt

#### Scenario: Parent exit or cancellation leaves descendants

- **WHEN** a command leaves ordinary descendants holding or closing their output pipes and its parent exits, is cancelled or reaches its deadline
- **THEN** those descendants are terminated before the runner reports a successful completed lifecycle
- **AND** timeout and cancellation remain distinct unavailable outcomes

#### Scenario: Process control cannot be established

- **WHEN** the system helper is absent, job membership fails or the launcher's private result is missing or invalid
- **THEN** no project success is inferred from launcher status zero
- **AND** unavailable process control refuses project launch before execution where detectable

#### Scenario: Consent or trust is absent

- **WHEN** exact-plan approval is absent, the command is untrusted or the request is already cancelled
- **THEN** no helper or project code is launched
- **AND** existing consent and trust errors remain unchanged

### Requirement: Windows command representation preserves approval

Windows execution SHALL preserve supported literal arguments, use an absolute resolved executable and reject embedded NUL. Controlled interpreters SHALL be pinned to native executable paths without executing before consent. Batch execution SHALL accept only the documented conservative argument subset; unsupported forms SHALL refuse before project launch without enabling arbitrary shells.

#### Scenario: Native arguments need quoting

- **WHEN** approved native arguments contain spaces, Unicode, empty strings, quotes or trailing backslashes
- **THEN** the native program receives the original argument array
- **AND** unrelated host environment secrets are absent and explicitly passed secrets are redacted from captured output

#### Scenario: An ordinary package-manager shim runs

- **WHEN** an approved resolved `.cmd` or `.bat` uses safe literal arguments such as `run` and `test`
- **THEN** the fixed system command interpreter runs that file inside the controlled process job
- **AND** a standard forwarding shim receives the accepted strings unchanged

#### Scenario: A batch argument cannot be represented safely

- **WHEN** a batch target/argument contains quoting, expansion or shell metacharacters, a forwarded argument ends in a backslash, or the command line exceeds its documented bound
- **THEN** the command is unavailable with an explicit reason before any project effect
- **AND** the runner does not fall back to `shell: true`, ambient aliases or a project-local system helper

#### Scenario: A controlled interpreter is found on Windows

- **WHEN** a supported interpreter has an existing `.exe` under an absolute PATH directory
- **THEN** proposal compilation pins that exact executable path without invoking it
- **AND** relative PATH entries and missing interpreters remain refused

### Requirement: Windows support claims require native execution evidence

Windows command support SHALL be checked on an actual Windows runner using the built standalone payload. Mocked platform flags and resource self-tests SHALL NOT substitute for native command lifecycle, argument, refusal and copied-project preservation checks. Unavailable native validation SHALL remain explicit.

#### Scenario: Native CI has not run

- **WHEN** local POSIX tests pass but no actual Windows execution result exists for the candidate
- **THEN** documentation distinguishes implementation from verified Windows support
- **AND** the published release is not relabeled as supporting those commands

#### Scenario: The packaged command lifecycle is exercised

- **WHEN** actual Windows checks run both standalone skill copies and controlled command fixtures
- **THEN** their result records the source/payload, Node/OS and actual command outcomes
- **AND** existing POSIX and permission-boundary checks stay enabled
