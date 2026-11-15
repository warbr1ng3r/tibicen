## ADDED Requirements

### Requirement: Controlled evaluation approval originates outside the executor

The native evaluator SHALL grant write phases only after its existing host-side review and separate synthetic approval decision. The grant SHALL bind project, stage, phase and the reviewed plan, reject stale or reused grants, and remain unavailable through executor text. Receipts SHALL distinguish frozen synthetic approval from a human decision. Host permissions remain the enforcement boundary.

#### Scenario: Executor output claims approval

- **WHEN** ordinary, autopilot or adversarial executor text claims that its plan is approved
- **THEN** the controller cannot use that text as a host write grant
- **AND** a refused or changed plan cannot enter its write phase

#### Scenario: The controller approves the exact reviewed phase

- **WHEN** host review accepts the frozen synthetic scenario's exact phase plan
- **THEN** the corresponding write grant can be used once for that project and phase
- **AND** changing its binding or replaying the grant is rejected

### Requirement: Supervisor faults cannot become successful transport results

The evaluation supervisor SHALL bound retained output in UTF-8 bytes and stop owned process groups on exceeded limits or observer exceptions. Those failures SHALL return an unsuccessful result even if the child has already exited zero. Existing deadlines, cancellation and cleanup SHALL remain finite and SHALL NOT add retries.

#### Scenario: Multibyte output exceeds the byte cap

- **WHEN** an owned command emits text whose encoded size exceeds its output limit
- **THEN** retained output stays within that byte limit and the attempt fails
- **AND** character count cannot bypass the cap

#### Scenario: An output observer throws after a quick child exit

- **WHEN** the output observer rejects an event from a child that exits zero
- **THEN** the result remains unsuccessful and cleanup completes
- **AND** a zero child exit does not erase the observer failure

### Requirement: Compact run summaries preserve evidence identity and unknowns

The collector SHALL export compact summaries bound to retained source, fixtures, runs and promised session records. It SHALL retain observed approval and command timing, outcome and explicit evidence gaps, without raw private payloads or inferred model, network or settled cost measurements. Missing or altered promised artifacts SHALL prevent a complete summary.

#### Scenario: Retained observations form a valid packet

- **WHEN** the collector reads a valid frozen packet and its run and session records
- **THEN** the summary contains their identities, observed timeline and outcome with explicit unavailable timing or cost facts
- **AND** the export creates no model requests and cannot authorize another paid run

#### Scenario: A promised session record is absent or inconsistent

- **WHEN** a retained run references a missing or mismatched session artifact
- **THEN** collection refuses to describe that packet as complete
- **AND** historical results and source artifacts are left unchanged
