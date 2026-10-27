# Spec Delta

## Purpose

Довести ограниченные AGENTS-only init/adopt до собственного итогового отчёта через проверенный контейнерный caller, сохранив существующие review, approval и evidence.

## ADDED Requirements

### Requirement: Explicit bounded setup selection

Runner SHALL явно фиксировать Tibicen-only init/adopt setup selection, order, exact source/runtime/route и бюджеты до auth. Неподдержанные сценарии SHALL отклоняться до запуска. Task, baseline comparison и полная acceptance SHALL не выдаваться за пройденные.

#### Scenario: Run two supported setup cases
- **WHEN** выбран reviewed bounded init/adopt batch
- **THEN** каждый case выполняет proposal и отдельно approved apply с verify/status/report/final response
- **AND** не создаются дополнительные task/judge/retry sessions

#### Scenario: Proposal mode differs from selected case
- **WHEN** compiled proposal использует init для adopt case или improve для init case
- **THEN** proposal отвергается до approval и запуска apply host
- **AND** такой прогон не засчитывается как покрытие выбранного сценария

### Requirement: Setup-only artifacts remain collectable

Report builder и model-free native collector SHALL принимать setup-only experiments без baseline slots. Они SHALL сохранять individual attempt records и явно обозначать setup-only observations, без вымышленных пар, сравнительных delta или baseline coverage. Обычные paired reports SHALL сохранять прежний формат и смысл.

#### Scenario: Enrich a retained setup-only batch
- **WHEN** collector получает валидные сохранённые init/adopt artifacts
- **THEN** enriched report создаётся без обращения к отсутствующему baseline
- **AND** оба Tibicen attempt records доступны, comparison pairs отсутствуют и baseline planned равен нулю

### Requirement: Closed byte and mode transfer

Stopped-container collection SHALL сохранять проверяемые regular-file modes и bytes, отвергать unexpected paths/types/links и сравнивать protected/support inputs. Host reconciliation SHALL применять только точные reviewed changes и declared kernel service state.

#### Scenario: Model changes a protected file mode or runtime
- **WHEN** bytes или mode frozen seed/support изменились вне approved scope
- **THEN** case завершается error без host writeback и batch continuation

#### Scenario: Proposal or output includes unexpected paths
- **WHEN** proposal меняет seed либо collection содержит undeclared file/directory/link
- **THEN** output отклоняется, исходное состояние сохраняется и CID удаляется

### Requirement: Trusted runtime and separate homes

Container workspace SHALL содержать фиксированные соседние project root и support subtree. Trusted Tibicen runtime, logical tool HOME и approved plan SHALL передаваться как frozen support bytes вне product root. Generated auth HOME SHALL оставаться вне transfer workspace; credentials/host config SHALL не попадать в container seed. Success SHALL требовать observed trusted commands и независимо проверенных report/manifest/AGENTS bytes.

#### Scenario: Complete init or adopt
- **WHEN** approved native apply заканчивается успешным final response
- **THEN** actual report/status/manifest и AGENTS hash совпадают с reviewed plan
- **AND** protected/support bytes/modes и host-only auth config сохранены

#### Scenario: Apply removes temporary product state
- **WHEN** успешный product finalizer очищает `.tibicen/state`
- **THEN** runtime, approved plan и logical HOME сохраняются вне product root
- **AND** последующие verify/status/report исполняются тем же frozen runtime без изменения product scan или empty-project classification

#### Scenario: CLI audit omits command stdout
- **WHEN** exact trusted report command завершился с exit0, но native CLI audit не сохранил stdout
- **THEN** receipt явно отмечает capture как unavailable, а не как наблюдённый JSON
- **AND** отдельный owned container обязан независимо получить verify passed и status/report complete по проверенным returned bytes
- **AND** все непустые captures должны быть JSON objects с ожидаемым status; каждый capture verify/status/report сравнивается с независимым результатом, более поздний пустой capture не скрывает предыдущий

### Requirement: Batch failure stops further sessions

Любая native/tool/parser/collection/cleanup/deadline/budget ошибка SHALL завершать текущий case и запрещать последующие auth reads/model launches. Все CID/home/stage SHALL быть удалены до завершения; исходные failed outcomes сохраняются.

#### Scenario: First child fails
- **WHEN** child получает ошибку или отмену
- **THEN** следующий child не запускается, остальные outcomes явно skipped/error и cleanup проверен
