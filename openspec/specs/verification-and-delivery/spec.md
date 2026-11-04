# verification-and-delivery Specification

## Purpose

Различать фактические результаты проверок и недоступные возможности, не подменяя доказательства наличием файлов. Поставлять самостоятельные скиллы с валидированными ресурсами и пресетами.

## Requirements

### Requirement: Independent verification outcomes
Отчёт SHALL различать результаты инфраструктуры, проекта, типичной задачи, квиза, MCP и compat; недоступное выполнение получает причину вместо ложного успеха.

#### Scenario: A task probe cannot run
- **WHEN** авторизация или контролируемое окружение недоступны
- **THEN** соответствующий результат обозначается unverified с причиной
- **AND** наличие файлов или успешный exit code не подменяет доказательство поведения

### Requirement: Controlled project checks
Исполняемые проверки SHALL использовать согласованные команды и контролируемые копии с подтверждённым окружением, сохраняя различие между baseline и новым результатом.

#### Scenario: Existing project tests already fail
- **WHEN** сравниваются исходная и итоговая проверки
- **THEN** прежние ошибки и новые регрессии показываются отдельно
- **AND** проверка не меняет сохранённые входные состояния

### Requirement: Loading requires observable evidence
Проверка загрузки инструкций SHALL требовать наблюдаемого результата конкретного запуска и соответствия проверяемому содержимому; обнаружение имени скилла само по себе недостаточно.

#### Scenario: An agent only lists a skill name
- **WHEN** доступно имя скилла без наблюдения загрузки тела инструкций
- **THEN** compat не объявляется подтверждённой загрузкой
- **AND** непроверенные версии не наследуют доказательство от другой версии

### Requirement: Distribution has no development dependency
Сборка SHALL создавать два самостоятельных скилла с нужными скриптами, references, лицензией и SHA256SUMS; установленный runtime не требует OpenSpec, pnpm или TypeScript-компилятора.

#### Scenario: A skill is used outside the source checkout
- **WHEN** установленная копия запускает self-test и находит свои стадийные ресурсы
- **THEN** она использует файлы своего дистрибутива
- **AND** package.json скилла не содержит devDependencies исходного репозитория

### Requirement: Presets contain validated preferences
Конструктор и файловые операции пресетов SHALL использовать общий проверяемый контракт предпочтений, не принимать произвольные инструкции или исполняемые YAML-выражения.

#### Scenario: A preset contains an extra instruction field
- **WHEN** вход содержит неизвестное поле или небезопасный путь
- **THEN** данные отклоняются до сохранения
- **AND** сохранение личного пресета требует явного запроса

### Requirement: Project verification covers every approved command
Сравнение проектных проверок SHALL объявлять успешный сопоставленный результат только после полного выполнения одинакового согласованного набора команд в нужных исходном и итоговом деревьях. Частичный прогон, отсутствие доверия, изменение источника команды или неизвестный исход SHALL сохраняться как `unverified` с причиной.

#### Scenario: Both runs stop after the same successful prefix
- **WHEN** первая команда прошла в обоих деревьях, но вторая не выполнилась из-за изменённого исходного скрипта
- **THEN** результат остаётся `unverified`, даже если полученные записи первой команды совпали
- **AND** отчёт не утверждает отсутствие регрессий всего согласованного набора

#### Scenario: Trust or command outcome prevents completion
- **WHEN** одна команда не получила доверия либо её прежний исход неизвестен
- **THEN** незавершённость не превращается в `green`, `red-fixed` или `pre-existing-red`
- **AND** причина и ранее известные регрессии сохраняются независимо от статуса передачи инфраструктуры

#### Scenario: A complete comparison is available
- **WHEN** все согласованные команды полностью выполнены и сопоставимы
- **THEN** действующее разделение зелёного результата, старых ошибок, исправлений и новых регрессий сохраняется
- **AND** новый проект не требует выдуманного исходного прогона, но требует полного итогового набора

### Requirement: Distribution build preserves source files
Сборка дистрибутива SHALL проверять фактическое назначение очищаемых путей до удаления. Симлинк назначения или пересечение с исходными материалами SHALL приводить к отказу без потери исходников; поддержанное обычное назначение SHALL по-прежнему создавать оба самостоятельных скилла.

#### Scenario: The default output points at source skills
- **WHEN** `dist/` является симлинком на исходный каталог `skills/`
- **THEN** сборка отказывает до очистки содержимого
- **AND** оба исходных `SKILL.md` и остальные материалы остаются неизменными

#### Scenario: A custom output aliases protected material
- **WHEN** путь назначения явно совпадает с источниками, является их предком либо попадает к ним через симлинк в родительском каталоге
- **THEN** назначение отклоняется до первого удаления
- **AND** ссылка не расширяет область разрешённой очистки

#### Scenario: An ordinary output is rebuilt
- **WHEN** назначение является поддержанным обычным каталогом без пересечения с источниками
- **THEN** повторная сборка создаёт два скилла и корректный `SHA256SUMS`
- **AND** OpenSpec, dev-скиллы, стенд, сайт и документационные изображения не попадают в дистрибутив

### Requirement: Memory acceptance distinguishes structure and behavior

Memory evidence SHALL separate path/policy checks from observed reading, task decisions and updates in fresh agent contexts. Observations SHALL identify the candidate, agent/tool versions, assistance, limits and retained failures. Missing controlled execution SHALL remain unverified; engineering acceptance SHALL NOT imply measured human benefit.

#### Scenario: Setup passes but a later agent ignores memory

- **WHEN** files and pointers pass checks but a fresh agent does not use the relevant decision
- **THEN** structural success and behavioral failure are reported separately
- **AND** the memory feature does not receive behavioral acceptance from file presence

#### Scenario: Init and adopt are accepted on the candidate

- **WHEN** fresh contexts demonstrably read an init-created decision and correct an adopted decision while preserving unrelated notes
- **THEN** the recorded observations are bound to the tested bytes and versions
- **AND** other agents, untested versions and human usefulness remain outside those observations

### Requirement: Post-1.0 versions reflect compatibility

Stable releases SHALL use SemVer: compatible fixes increment patch, compatible functionality increments minor, and incompatible supported interfaces increment major. Completed unreleased changes SHALL have human-readable changelog entries. Published versions, tags and assets SHALL remain immutable; a correction SHALL receive a new version.

#### Scenario: Optional memory ships without breaking legacy workflows

- **WHEN** the memory feature is accepted with supported legacy workflows preserved
- **THEN** the next feature release is prepared as `1.1.0`
- **AND** published `1.0.0` artifacts and history are retained

#### Scenario: A repair is needed after publication

- **WHEN** a compatible defect fix is ready for an existing stable line
- **THEN** a new patch version is prepared rather than replacing that release's asset bytes

### Requirement: Release metadata identifies the checked candidate

Release preparation SHALL use the root package version as its source, generate matching skill metadata and checksums, and bind CI, platform and delivery results to the candidate bytes. Prereleases SHALL be labeled accordingly. A normal commit or CI success SHALL NOT automatically create a tag, publish a release or authorize new execution.

#### Scenario: A feature is still under development

- **WHEN** work has not reached the reviewed release candidate
- **THEN** completed changes are described under `Unreleased` without claiming a published feature
- **AND** the stable package version is changed only during candidate preparation

#### Scenario: Final validation changes distributed bytes

- **WHEN** a correction changes the prepared distribution after acceptance
- **THEN** affected checks and checksums are refreshed for those bytes
- **AND** the release does not reuse observations as if they tested the changed content
