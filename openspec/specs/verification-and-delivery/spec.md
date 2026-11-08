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

### Requirement: Instruction diagnosis distinguishes inventory and loading

Diagnosis SHALL distinguish observed project instruction candidates/directories, bounded adapter facts, unknown selected scope and actual loading/use evidence. File presence or recorded adapter versions SHALL NOT establish active precedence, installed versions, observed loading or behavioral compliance.

#### Scenario: Root and subtree instructions differ

- **WHEN** instruction candidates have different content in different directories
- **THEN** diagnosis retains their distinct directory scopes without declaring a semantic conflict from location alone
- **AND** the working agent explains applicable agent/version/cwd/target context or the explicit limitation

#### Scenario: Structural checks pass without native observation

- **WHEN** instructions and a memory connection pass structural verification but no controlled loading/task observation runs
- **THEN** current loading and behavioral use remain unverified with a reason
- **AND** stored earlier check outcomes remain labeled recorded evidence rather than refreshed success

#### Scenario: Inventory is partial

- **WHEN** scan excludes an unsafe path or reaches an inspection limit
- **THEN** diagnosis exposes the gap and limited coverage
- **AND** it does not claim the whole setup is healthy or select an agent from AGENTS.md alone

### Requirement: Explicit read-only project constraints

Target-project inspection commands SHALL accept an optional bounded `--forbidden-paths` literal JSON array of safe relative paths. The requested exclusions SHALL apply before project-resource reads and combine with active-plan exclusions without weakening them. Exclusions SHALL remain per-operation inputs, without changing completed manifests or report task-context schemas.

#### Scenario: Scoped inspection before and after completion

- **WHEN** scan, status, report or verify receives a forbidden subtree, including after a previous session completed
- **THEN** it excludes that subtree from current reads and instruction/evidence inventory, or reports the unavailable check without reading it
- **AND** it does not create state or treat the earlier plan as a permanent access policy

#### Scenario: Report context and constraints share one invocation

- **WHEN** report receives its existing task-context JSON through stdin and a separate literal exclusion array
- **THEN** both are honored without a temporary request file or a new task-context field
- **AND** the agent carries known user constraints into each recommended inspection invocation

#### Scenario: New scope narrows interrupted work

- **WHEN** an interrupted plan excludes one subtree and the inspection request excludes another or a pending file
- **THEN** recovery reads, scanning, structural checks and report evidence use their union
- **AND** an empty explicit array cannot reopen the active plan's excluded resources

#### Scenario: Stored exclusions are tampered with

- **WHEN** active-plan exclusions change without the matching saved proposal digest or project identity
- **THEN** metadata-only scan rejects the saved state before inventorying project files
- **AND** it reuses the same pure validation as full recovery without running recovery file hashing

#### Scenario: Recovery metadata is not a bounded regular file

- **WHEN** inspection encounters FIFO, directory, oversized or malformed recovery state
- **THEN** it rejects the metadata within the bounded command without waiting on special-file content or reading an oversized body before its size check
- **AND** no inventory or successful current check is fabricated

#### Scenario: Invalid scope or forbidden internal metadata

- **WHEN** the array is malformed, exceeds 128 entries or 64KiB UTF-8, includes a non-string or unsafe path, exceeds 4096 characters per entry, or covers required Tibicen metadata
- **THEN** inspection refuses before project reads
- **AND** one trailing slash on an otherwise safe path is normalized without permitting traversal or absolute paths

#### Scenario: MCP inspection preserves its operation boundary

- **WHEN** MCP diagnosis or project-local MCP verification receives a forbidden source
- **THEN** it leaves that source unread and reports its unavailable result or refuses
- **AND** explicitly selected global Codex configuration does not silently accept a project-only scope
