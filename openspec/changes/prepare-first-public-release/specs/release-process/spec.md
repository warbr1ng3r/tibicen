# Spec Delta

## Purpose

Make Tibicen releases reproducible and verifiable. The 3 November 2026 evidence policy separates technical release acceptance from voluntary human research without reducing the full MVP scope. Planning documents and local checkpoints do not constitute a public release.

## ADDED Requirements

### Requirement: Product versions have one authoritative source
Версия продукта SHALL иметь один источник для CLI, паспорта и дистрибутива; версии схем SHALL оставаться отдельными. История изменений SHALL следовать Conventional Commits и SemVer 0.x: совместимые исправления — patch, возможности/несовместимости — minor с описанием обновления. Для внешнего PR достаточно корректного squash-заголовка; checkpoint SHALL не создавать тег автоматически.

#### Scenario: A candidate is built from a tagged source version
- **WHEN** формируется кандидат, например 0.1.0-rc.1
- **THEN** CLI, паспорт и оба скилла сообщают согласованную версию продукта, независимая схема не меняется без основания
- **AND** changelog описывает пользовательский эффект, несовместимости и действия обновления

### Requirement: CI validates artifacts without exposing live credentials
CI SHALL выполнять офлайн-тесты, строгую проверку OpenSpec, сборку, сверку версий/комплектности и self-test распакованной поставки. Внешние Actions SHALL закрепляться полным SHA с минимальными правами. Fork PR SHALL не получать ключи или подписочную авторизацию; живые evals SHALL иметь отдельный доверенный запуск.

#### Scenario: An external contribution triggers checks
- **WHEN** проверяется PR из форка
- **THEN** доступные офлайн-проверки выполняются без учётных данных моделей и без исполнения платного eval-профиля
- **AND** успешный CI не объявляется доказательством живых агентских испытаний

#### Scenario: Offline checks run in a clean checkout
- **WHEN** новый checkout устанавливает закреплённые зависимости и запускает документированный offline gate
- **THEN** необходимые standalone-ресурсы собираются до тестов, не требуя прежнего ignored dist
- **AND** fingerprint пакета процесса связывает поставляемые upstream-байты и не зависит от сгенерированных package-manager launchers с локальными абсолютными путями

### Requirement: Public participation has usable instructions and contacts
Для полного публичного MVP материалы SHALL описывать установку/ограничения, локальные проверки, участие и предложения правил/адаптеров, changelog, шаблоны issue/PR, кодекс поведения и приватное раскрытие уязвимостей. Контакты SHALL быть рабочими; история/материалы проверяются на секреты и личные данные, лицензии сохраняются.

#### Scenario: Publication information is still a placeholder
- **WHEN** owner/repo, адрес сайта, security-контакт или ответственный не определён
- **THEN** подготовка локальных материалов продолжается, но публичная готовность не объявляется

### Requirement: Published versions identify immutable verified bytes
Кандидат SHALL связывать source SHA, версию, установленное дерево/артефакты, контрольные суммы, release notes и подтверждённые агентские версии/ограничения. Проверенная команда установки SHALL получать эти байты. Опубликованные байты версии SHALL не заменяться: исправление требует новой версии; предупреждения и суммы имеют независимый канал.

#### Scenario: An installer route differs from the tested archive
- **WHEN** команда из README получает другое дерево либо не находит скиллы по tag/full SHA
- **THEN** кандидат не считается готовым, даже если локальный dist и Release attachment корректны

#### Scenario: A defect is found after publication
- **WHEN** требуется исправить опубликованный дистрибутив
- **THEN** выпускается новая версия с инструкцией обновления; прежний тег/артефакт не переписывается

### Requirement: Pilot measures both product scenarios without repository disclosure
Voluntary usefulness research SHALL be separately scheduled after publication, not required for technical release acceptance. Before participation its protocol SHALL define willing cohorts, their ordinary baseline, separate init/adopt measures and anonymization. Missing observations SHALL remain unknown. Existing §14 checkpoint and reuse definitions SHALL remain unchanged.

#### Scenario: A technical experiment passes without user measurements
- **WHEN** парные прогоны агентов успешны, но измерений пилота нет
- **THEN** подтверждён технический результат, а пользовательская польза остаётся неподтверждённой
- **AND** начальный пилот не заменяет контрольную точку 50 сессий или 8 недель после публикации и зрелую 30-дневную когорту повторного использования
- **AND** the protocol defines time, corrections, manual integration and available cost before participation; only anonymized summaries without repositories or secrets are shared

#### Scenario: No voluntary participants are available
- **WHEN** the postpublication checkpoint has insufficient observations
- **THEN** the report records insufficient data and a recruit/extend/close decision without resetting the clock
- **AND** technical acceptance is not delayed solely by absent participants, and no owner participation or human grade is inferred
- **AND** human rubric calibration remains separately scheduled voluntary postpublication work

### Requirement: First publication requires explicit release evidence
The first full public MVP SHALL require candidate-bound technical observations and independent engineering review under §10.11, immutable delivery/update/recovery, declared coverage and maintenance readiness. Missing mandatory evidence SHALL block acceptance. Prerelease human calibration and pilot participation SHALL NOT be prerequisites; unmeasured benefit SHALL be disclosed. Publication SHALL require separate explicit authorization.

#### Scenario: Technical release evidence covers the full MVP
- **WHEN** a full MVP candidate is assessed
- **THEN** evidence covers the core, first OpenSpec adapter, observed additional-skill installation/loading/use, process init/adopt and a working cycle in a fresh session, L0/L1 invariants and functional quality
- **AND** review cannot supply missing observations; Spec Kit and other future extensions do not become hidden gates

#### Scenario: Planning artifacts are complete but implementation tasks remain
- **WHEN** OpenSpec сообщает готовность planning artifacts, а задачи реализации или обязательной приёмки открыты
- **THEN** change остаётся незавершённым, кандидат не объявляется готовым по одному статусу планирования
- **AND** подготовка плана или коммит не создают remote, публичный релиз или выкладку сайта

#### Scenario: A candidate lacks positive skill or process evidence
- **WHEN** первые диагностические прогоны успешны, но обязательный положительный SKILL/PROC отсутствует, пропущен или имеет неподтверждённую загрузку/применение
- **THEN** кандидат не считается готовым; матрица показывает конкретные недостающие сценарии, источники и версии
- **AND** корректный отказ от небезопасного источника не подменяет положительную интеграцию другого проверенного источника

#### Scenario: Technical evidence is complete but human observations are absent
- **WHEN** candidate-bound technical requirements and independent engineering review are complete without human calibration or pilot measurements
- **THEN** technical readiness can be recorded with unknown measured benefit, subject to maintenance, immutable delivery evidence and explicit publication authorization
- **AND** historical grades and missing human cross-checks remain unchanged; public research and engineering review do not become participant outcomes

### Requirement: An explicitly approved alpha has a bounded release contract
Отдельно согласованный владельцем alpha prerelease SHALL иметь prerelease-версию, проверенный состав/source SHA/суммы, реальную закреплённую Git-доставку, проверку сохранности при смене поставки и release notes с фактическим охватом. Он SHALL явно сохранять непроверенные агенты/сценарии, полный MVP, human sample и пилот открытыми. Обозначение alpha SHALL не заменять согласие на публикацию или проверку отправляемых файлов.

#### Scenario: The owner approves the first limited iteration
- **WHEN** владелец подтверждает0.1.0-alpha.1 с ограниченным проверенным охватом
- **THEN** отдельная alpha-группа проходит review, build, Git-install, update/resume/remove и публикуется как prerelease с указанными ограничениями
- **AND** полная программа MVP, пилот и ещё не назначенные каналы сопровождения остаются явными незавершёнными обязательствами

#### Scenario: Development history contains private local paths
- **WHEN** первая отправка в public repo раскрыла бы private development records
- **THEN** публикуется отдельный проверенный source snapshot без этих записей и без изменения локальной истории
- **AND** source snapshot, сборка и distribution ref связаны фактическими хэшами; отсутствие raw внутренних записей объяснено
