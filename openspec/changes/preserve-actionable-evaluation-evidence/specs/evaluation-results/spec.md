## ADDED Requirements

### Requirement: Optional private native errors survive cleanup

The contained evaluator SHALL optionally retain bounded, credential-redacted terminal error messages in an exclusively created owner-private location outside disposable HOME and target workspace. Destination and capture policy SHALL be prospectively bound. Existing public records SHALL retain their safe projections; private text SHALL NOT enter them or distributed skills.

#### Scenario: An unknown terminal error ends a session

- **WHEN** private capture is enabled and an unknown complete error event arrives
- **THEN** its bounded redacted message remains available after normal owned-resource cleanup
- **AND** public events and parsed results still contain only their existing safe projection

#### Scenario: A diagnostic destination is unsafe

- **WHEN** the requested location exists, redirects through a symlink or lies in a forbidden disposable/target area
- **THEN** it is rejected before model execution without overwriting another file
- **AND** omitted capture leaves prior evaluator behavior unchanged

#### Scenario: Diagnostic text includes credentials or exceeds bounds

- **WHEN** terminal text includes known credential values, supported credential patterns or excessive content
- **THEN** retained text redacts those values and stays within fixed record/file limits
- **AND** arbitrary provider properties, headers, prompts and transcripts are excluded; unknown secret detection is not claimed

#### Scenario: Capture fails or the stream is incomplete

- **WHEN** private diagnostic output cannot be written or no complete terminal event is observed
- **THEN** recording failure or missing evidence is explicit and cannot be reported as captured success
- **AND** cleanup, terminal stopping and no-automatic-retry boundaries remain intact

### Requirement: Generated memory observations isolate the decision source

A generated-memory observation SHALL separate native policy generation, reviewed exact application and fresh ordinary tasks. A task's distinguishing decision SHALL be absent from its prompt, source and visible tests, with the scorer outside the worker scope. Correction controls SHALL preserve unrelated notes and distinguish observed reads, behavior, source resets and assisted loading.

#### Scenario: A fresh task follows generated setup

- **WHEN** an agent receives only approved setup outputs and a fresh ordinary task
- **THEN** the hidden scorer distinguishes memory-aware behavior from a plausible default
- **AND** visible files outside selected memory do not expose the distinguishing decision

#### Scenario: A corrected decision is reused

- **WHEN** an ordinary agent updates a decision without installed Tibicen and a fresh task receives the updated memory
- **THEN** unrelated notes remain protected and scoring distinguishes the corrected decision
- **AND** any reset of task source is declared rather than described as uninterrupted same-worktree execution

#### Scenario: Only fixture checks or executor summaries exist

- **WHEN** model-free fixture checks pass or native tool/read events are unavailable
- **THEN** the report states the actual evidence boundary without claiming native generation, loading or human usefulness
- **AND** each later model packet needs its own finite prospective identity and resource protocol
