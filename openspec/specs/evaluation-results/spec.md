# evaluation-results Specification

## Purpose
Сохранять наблюдения по попыткам испытаний и считать явные показатели без сокрытия ошибок, подмены пропуска успехом или заявления о поведении агента на основании одной агрегированной записи.

## Requirements

### Requirement: Strict attempt records
Валидатор SHALL принимать только schema 1 с непустыми id/scenarioId/profileId, вариантом tibicen либо baseline, boolean started и стадиями launch/setup/task. Неизвестные и отсутствующие собственные поля SHALL отклоняться. Статусы setup/task — pass/fail/error/skip, launch — pass/error/skip; durationMs конечный и неотрицательный, skip имеет нулевую длительность, любой неположительный исход требует непустую причину, pass не содержит reason.

#### Scenario: A malformed observation is supplied
- **WHEN** запись содержит неизвестную схему, лишний ключ, унаследованное обязательное поле, бесконечное время или skip без причины
- **THEN** валидация отклоняет запись до включения в сводку

### Requirement: Stage order preserves partial outcomes
started SHALL означать наблюдаемый старт сценария, а не создание процесса. Без старта launch имеет error/skip и остальные стадии skip; после старта launch не бывает skip, а launch error пропускает остальные стадии. task SHALL выполняться только после setup pass; ошибка task сохраняет успешный setup.

#### Scenario: Launch is blocked before the scenario starts
- **WHEN** started=false и launch=error с причиной
- **THEN** setup и task остаются skip, а попытка видна в числе незапущенных

#### Scenario: A task fails after successful setup
- **WHEN** setup=pass и следующая задача завершилась error или fail
- **THEN** успешная настройка сохраняется, а сквозной успех не засчитывается

### Requirement: Explicit denominators and repeat identity
Сводка SHALL возвращать total, started, незапущенные error/skip и исходы стадий, а для каждой метрики — numerator/denominator/rate. setupSuccess равен setup pass / started; taskSuccessGivenSetup — обе стадии pass / setup pass; endToEndSuccess — обе стадии pass / started. При нулевом знаменателе rate SHALL быть null. Повторный id отклоняется, новая попытка того же сценария имеет новый id; входные записи не изменяются.

#### Scenario: Failures and skips occur after an observed start
- **WHEN** среди начатых попыток есть error, fail или skip
- **THEN** они остаются в знаменателе started; заблокированные до старта учитываются отдельно

#### Scenario: No scenario starts
- **WHEN** сводка пуста либо содержит только незапущенные попытки
- **THEN** метрики с нулевым знаменателем содержат null вместо 0 или ложного успеха

#### Scenario: The same scenario is retried
- **WHEN** две записи имеют один scenarioId и разные id
- **THEN** обе учитываются; повтор одного id отклоняется как дублирование

### Requirement: Aggregation is development tooling
Модуль SHALL только проверять и агрегировать переданные наблюдения, без вызова моделей и оценки доказательств поведения. Выбор сопоставимой когорты остаётся обязанностью вызывающего стенда. Сборка SHALL исключать scripts/evals из обоих распространяемых скиллов.

#### Scenario: An aggregate report is produced offline
- **WHEN** локальные тесты строят сводку и собирают дистрибутив
- **THEN** модели не вызываются, runtime скиллов не содержит evals
- **AND** сводка не выдаётся за grader, парный эксперимент или подтверждённую пользу продукта

### Requirement: Contained executor failure correlation
Contained failure receipts SHALL retain the first terminal fault's fixed kind and numeric code, plus validated, session-scoped hashed request/process identities and bounded exit facts. An operation SHALL be identified only from an observed request; a process fault SHALL claim a matched start only when the corresponding start response agrees. Ordinary valid process results SHALL NOT create terminal faults. Missing, ambiguous or invalid correlation SHALL remain unknown.

#### Scenario: Interleaved processes finish differently
- **WHEN** two observed process/start requests receive matching responses and one reports an explicit sandbox denial after the other exits zero without denial
- **THEN** the first terminal fault identifies the denied process and matching start request, rather than the last completed command
- **AND** the terminal stop reason and cleanup remain unchanged

#### Scenario: The start response is missing or disagrees
- **WHEN** a terminal process fault has no uniquely matching accepted start request
- **THEN** its validated process hash and exit facts can be retained but request/operation correlation is unknown
- **AND** an RPC error can identify an observed start request without claiming that the process started

#### Scenario: The standard setup profile records a failed child
- **WHEN** the contained session returns a failure context and the setup profile reports the child as failed
- **THEN** the existing collection artifact preserves that same safe context before the failure is thrown
- **AND** file bodies remain represented only by hashes and modes in that artifact

### Requirement: Diagnostic privacy and resource bounds
Correlation SHALL retain no raw commands, paths, environment, output, error text or identifiers. Diagnostic buffering, identity lengths and map sizes SHALL be bounded. Overflow, malformed requests and duplicate identities SHALL disable uncertain correlation without changing forwarded bytes, failure stopping, containment, cleanup or execution results. Identities SHALL be unlinkable between sessions.

#### Scenario: Secrets and ambiguous identities are supplied
- **WHEN** protocol messages contain arbitrary payloads, duplicate identities, oversized input or malformed metadata
- **THEN** the diagnostic receipt contains only fixed fields, nullable validated numbers/booleans and session-scoped hashes
- **AND** no ambiguous request match or arbitrary text is retained

### Requirement: Diagnostic verification preserves historical outcomes
Executor diagnostics SHALL remain development-only and separate from strict attempt records. Mocked offline checks SHALL invoke no credentials, models or live executor. Separately declared bounded model-free controls SHALL use only an owned isolated executor, without credentials or models. Diagnostic improvements SHALL NOT upgrade an old unknown cause, missing collection, task failure or unverified memory read, and SHALL NOT add automatic retries.

#### Scenario: The old native attempt is reviewed after the fix
- **WHEN** new offline regression checks or separately declared model-free controls pass
- **THEN** the original failed attempt and its raw receipts remain unchanged
- **AND** its missing command identity and uncollected container contents remain unverified

### Requirement: Ordinary contained command results permit recovery
The contained evaluator SHALL forward schema-valid ordinary process and CLI command results unchanged, including nonzero exit codes, without terminating the session or creating a terminal tool failure. Missing optional diagnostic correlation SHALL NOT alter this policy. A command result alone SHALL NOT establish task acceptance.

#### Scenario: An ordinary command fails before another command
- **WHEN** an owned executor reports a valid exit1 without explicit sandbox denial and a later command is requested within the deadline
- **THEN** the later command can complete in the same owned container
- **AND** the original nonzero result remains visible to the native caller

#### Scenario: Optional diagnostics are unavailable
- **WHEN** diagnostic correlation has disabled itself at its bounded limit and an otherwise valid process result arrives
- **THEN** ordinary command recovery remains available
- **AND** unknown request attribution is not upgraded to a known match

#### Scenario: The CLI reports the failed command before recovering
- **WHEN** the native CLI emits a schema-valid completed command result with nonzero exit code and failed status, followed by a successful command and completed turn
- **THEN** the caller keeps the session available and preserves both actual results
- **AND** terminal native failures, failed turns, declined/cancelled items, failed file changes, unavailable command outcomes and malformed command results still fail acceptance

### Requirement: Executor faults remain terminal
The evaluator SHALL stop on explicit sandbox denial, malformed process-exit fields and existing terminal RPC, transport, output, deadline or cleanup faults. It SHALL retain existing filesystem, network, identity, ownership and collection boundaries. Optional nullable denial metadata SHALL follow the pinned protocol without being reported as an observed false value.

#### Scenario: Denial or malformed exit is received
- **WHEN** process/exited contains sandboxDenied true, invalid field types, an unsafe sequence or an exit code outside the pinned signed integer range
- **THEN** the evaluator stops and verifies owned-container cleanup
- **AND** a later command is not accepted as successful recovery

#### Scenario: Infrastructure fails after a valid command
- **WHEN** an RPC fault, invalid transport, output cap, deadline or cleanup failure occurs after an ordinary result
- **THEN** the terminal fault and unsuccessful acceptance remain visible
- **AND** the prior ordinary result does not hide the failure

### Requirement: Recovery verification preserves prior evidence
Recovery-policy verification SHALL preserve original native outcomes and immutable evidence. A bounded model-free regression SHALL distinguish its synthetic command recovery from native task, memory and usefulness observations. A new native observation SHALL require a new prospective source/input freeze and finite protocol.

#### Scenario: The regression passes after a policy fix
- **WHEN** the same reviewed synthetic driver fails on the old source and passes on the repaired source
- **THEN** both receipts and cleanup outcomes are retained
- **AND** earlier native attempts remain failed with their unknown argv and uncollected candidate contents unchanged

### Requirement: Native notifications await definitive outcomes
The contained evaluator SHALL await a definitive turn outcome after a generic native error within existing process, output and time limits. Error callbacks SHALL expose only event type and a content hash. Explicit typed authentication/access errors SHALL still stop immediately. A failed turn, nonzero process exit or missing completed turn SHALL fail acceptance. No automatic retry SHALL be added.

#### Scenario: A native error precedes a completed turn
- **WHEN** a generic error is followed by a completed turn and zero process exit within all existing guards
- **THEN** the collector does not stop solely on that error and retains its hash-only callback
- **AND** acceptance still requires all source, configuration, ownership and cleanup checks

#### Scenario: The stream does not recover
- **WHEN** an error is followed by a failed turn, nonzero process exit or no completed turn
- **THEN** the session is not accepted and its error remains visible without raw private details

#### Scenario: Typed authentication or access rejection occurs
- **WHEN** an error carries an existing validated HTTP401 or403 diagnostic
- **THEN** the collector stops immediately and verifies cleanup without a retry
