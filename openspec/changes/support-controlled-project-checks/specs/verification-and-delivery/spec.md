## ADDED Requirements

### Requirement: Ordinary project stacks get controlled checks through pinned entrypoints

Project checks SHALL accept the execution profiles `python`, `bash` and `docs` beside `web` for approved build/test/lint commands on controlled snapshot copies without a dependency environment. Non-web profiles SHALL pin interpreter executables to absolute paths at proposal time without executing them. All other profiles and the web-only dependency environment rules SHALL remain unchanged.

#### Scenario: A Python project runs its existing unittest entrypoint

- **WHEN** an agent has read a Python project's real test entrypoint and the user approves a plan whose test command runs it with a pinned interpreter
- **THEN** baseline and final execute the identical command set on independent copies and report real exit codes
- **AND** the language of the project alone never creates or approves such a command

#### Scenario: A documentation project uses its local check script

- **WHEN** the project has an existing local verification script and the approved command runs it through a pinned interpreter
- **THEN** the same CLI chain executes comparable baseline/final runs
- **AND** absent Markdown checks stay `unverified / no-project-checks` rather than inventing tests

#### Scenario: The interpreter is unavailable

- **WHEN** a non-web profile plan references an interpreter that cannot be found on `PATH`
- **THEN** proposal refuses with `interpreter-unavailable` or the check stays `unverified` with that reason
- **AND** nothing is installed or executed to recover

#### Scenario: An unknown profile fails at proposal time

- **WHEN** `checks.profile` is not one of the supported profile names
- **THEN** proposal refuses with `invalid-check-command` before a plan, session or file write exists
- **AND** the refusal surfaces during review instead of an `unsupported-profile` result after apply

### Requirement: Script-bound check commands bind reviewed bytes exactly

A script-bound check SHALL hash an existing project file into the reviewed plan and re-verify its bytes in the execution copy. The file SHALL run from the project root as an explicit `./` executable or first interpreter file argument. Proposal MAY normalize that argument before review and consent.

#### Scenario: The bound bytes change after consent

- **WHEN** the project script file differs from the hash bound in the approved plan
- **THEN** the command does not execute and the result keeps `unverified / command-source-changed`
- **AND** an old digest does not authorize the changed script or any new argv

#### Scenario: The bound file is absent, unsafe or executed from another directory

- **WHEN** the bound path is missing, unreadable, outside the project, or a same-named file would run from a different working directory
- **THEN** the command does not execute and no fallback launch happens
- **AND** the result reports the unavailable source instead of a green outcome

#### Scenario: A filename resembles an interpreter option or subcommand

- **WHEN** an existing bound file is named `--version` or `inspect`
- **THEN** the compiled command names it explicitly as `./--version` or `./inspect`
- **AND** the file's actual exit code enters comparison instead of a version result, debugger launch or false green check

#### Scenario: Inline interpreter spellings stay refused

- **WHEN** a controlled-profile pinned interpreter receives any argument other than a bound `./` file argument or an installed `-m` module, including `-p`, `--eval=…`, `--print=…` or clustered flags such as `-Ic`
- **THEN** proposal refuses with `forbidden-command` before any consent, plan or execution
- **AND** the accepted surface for pinned interpreters remains exactly the reviewed bytes or an installed module runner

#### Scenario: A script file argument binds only to a pinned interpreter

- **WHEN** the bound `./` file argument rides on an executable that is neither the bound file itself nor a pinned interpreter executable
- **THEN** validation refuses the command before execution
- **AND** the reviewed script hash never certifies bytes that the executable does not run

#### Scenario: The script contract stays outside the web profile

- **WHEN** a web-profile proposal carries a script binding
- **THEN** proposal refuses with `invalid-check-command` before review
- **AND** every existing web command rule remains unchanged

#### Scenario: An executable names the original project

- **WHEN** a controlled non-web check names an absolute executable in the source project, or an external executable link resolves into it
- **THEN** proposal and execution refuse `invalid-check-command`
- **AND** the agent uses a byte-bound project-relative entrypoint in the controlled copy instead

#### Scenario: A project executable needs no arguments

- **WHEN** a bound `./check.sh` entrypoint has an empty argv
- **THEN** it runs in the controlled copy with no extra arguments added to the script
- **AND** its hash is checked before execution

### Requirement: Bash execution stays limited to the explicit script contract

Bash SHALL be accepted only in the controlled non-web profiles for build/test/lint commands with a pinned absolute interpreter whose argv is exactly the bound script path. `./`-relative entrypoints SHALL require the same byte binding. Arbitrary shell command lines, other shells, wrappers and inline code SHALL remain forbidden everywhere.

#### Scenario: An existing bash smoke script runs under the explicit contract

- **WHEN** the approved test command is a pinned `bash` with exactly the bound script path as argv and the reviewed bytes match
- **THEN** the script executes on the controlled copy and its exit code enters the comparison
- **AND** the general ban on arbitrary shell command lines and wrappers stays in force

#### Scenario: The contract is narrowed against evasion

- **WHEN** a command tries `sh`, an unbound `./`-relative entrypoint, a web-profile `bash`, extra interpreter arguments, inline code or a different kind
- **THEN** validation rejects it before execution
- **AND** no wrapper or escaped spawn route is added for a green result

### Requirement: Local usage accounting never gates delivery

The local usage counter SHALL remain accounting metadata, not transfer state. A damaged or unwritable counter file SHALL NOT fail or block an approved apply, and the damaged file SHALL stay untouched for manual repair instead of being overwritten.

#### Scenario: A corrupted usage counter does not fail an approved apply

- **WHEN** the usage counter cannot be parsed or written while an approved apply otherwise completes
- **THEN** the apply result and session status reflect the actual approved work
- **AND** the damaged counter file is preserved byte-for-byte for manual repair
