# agent-infrastructure-lifecycle Specification

## Purpose

Настроить или улучшить агентскую инфраструктуру через исследование, точный план и согласованные изменения. Сохранить приложение, пользовательский контроль и исходную сессию при прерываниях.

## Requirements

### Requirement: Two self-contained entry skills
Tibicen SHALL предоставлять tibicen-init для первоначальной настройки и tibicen-adopt для улучшения инфраструктуры, с общим процессом исследования и применения.

#### Scenario: An existing application has no agent infrastructure
- **WHEN** пользователь вызывает tibicen-init в существующем приложении
- **THEN** выбирается первоначальная настройка агентских файлов
- **AND** код приложения не переделывается ради подключения

### Requirement: Research and proposals are read-only
Сканирование, подбор и подготовка предложения SHALL сохранять проект и пользовательский профиль без записи и исполнения проектного кода до согласия.

#### Scenario: The user has not approved a proposal
- **WHEN** агент исследует проект и готовит рекомендуемое решение
- **THEN** предложение остаётся данными в памяти или stdin
- **AND** счётчик, файлы, установки и сторонние команды не запускаются скрыто

### Requirement: Consent is bound to an exact plan
Применение SHALL требовать подтверждения конкретного плана, его digest и исходных версий затрагиваемых файлов.

#### Scenario: A file changes after the plan is prepared
- **WHEN** фактический хэш больше не совпадает с согласованным исходным состоянием
- **THEN** операция останавливается до записи
- **AND** новое состояние не получает согласие от старого плана

### Requirement: Protected paths and execution boundaries
Общий механизм записи и исполнения SHALL защищать исходники приложения, секреты, существующие пакетные манифесты и CI; симлинки не должны выводить запись за разрешённые пути, автоматические Git-коммиты запрещены.

#### Scenario: A proposed command would create a commit
- **WHEN** план содержит прямую или обёрнутую команду создания Git-коммита
- **THEN** команда отклоняется до запуска
- **AND** отсутствие репозитория не оправдывает создание коммита во временной копии

### Requirement: Resume preserves the original session
Прерванная настройка SHALL сохранять исходные версии и историю сессии; продолжение требует нового согласия на оставшийся план.

#### Scenario: A partial apply is resumed
- **WHEN** пользователь возвращается после частичного сбоя
- **THEN** исходное состояние не заменяется текущим как новым baseline
- **AND** история попыток и известные регрессии сохраняются

### Requirement: Sources and MCP retain explicit provenance
Подбор SHALL связывать компоненты с каноническим происхождением и SHA; MCP-секреты представлены именами env, а ручные действия не выдаются за выполненные.

#### Scenario: Codex needs an MCP configuration change
- **WHEN** настройка требует изменения пользовательского TOML Codex
- **THEN** предлагается явный ручной блок
- **AND** Tibicen не переписывает глобальный конфиг пользователя самостоятельно

### Requirement: MCP trust follows actual configuration changes
Tibicen SHALL требовать явно указанное доверие к добавляемому или изменяемому исполняемому MCP-серверу независимо от способа подготовки плана. Неоднозначный или неподдержанный конфиг SHALL требовать ручного разбора до записи.

#### Scenario: A raw change bypasses the MCP planner
- **WHEN** точный план добавляет сервер через полное содержимое `.mcp.json` или `.cursor/mcp.json`, но не содержит соответствующего явного доверия
- **THEN** применение отклоняется до записи файлов проекта, state и пользовательского счётчика
- **AND** ручная подмена вспомогательного признака необходимости доверия не разрешает запись

#### Scenario: An existing server is retained
- **WHEN** изменение не затрагивает команду, аргументы или окружение существующего сервера
- **THEN** сохранение его прежних записей не требует нового доверия
- **AND** изменения остальных серверов проверяются отдельно, а глобальный TOML Codex остаётся ручным шагом

### Requirement: Execution deadlines stop the process tree
Тайм-аут и отмена SHALL завершать запущенную команду вместе с её потомками в пределах объявленного срока остановки. Если контроль дерева процессов на платформе не подтверждён, Tibicen SHALL отказаться от запуска с явной причиной.

#### Scenario: A descendant retains the output pipe
- **WHEN** команда создаёт потомка, удерживающего вывод и игнорирующего мягкое завершение, а затем истекает тайм-аут
- **THEN** остановка затрагивает всё дерево независимо от выхода родителя
- **AND** результат не остаётся ждать закрытия потока потомком без ограничения времени

#### Scenario: A run is cancelled
- **WHEN** согласованный запуск отменён до старта либо во время работы
- **THEN** до старта процесс не создаётся, а после старта дерево завершается
- **AND** результат содержит причину отмены, не успех

### Requirement: Infrastructure updates preserve file permissions
Обновление инфраструктуры SHALL сохранять обычные права существующего файла. Для нового исполняемого ресурса права SHALL быть частью согласованного результата и проверенного источника; специальные биты прав не допускаются. Служебные данные Tibicen SHALL оставаться закрытыми для остальных пользователей.

#### Scenario: An executable helper is updated
- **WHEN** согласованная правка меняет содержимое существующего помощника с правами `0755`
- **THEN** после замены он сохраняет право исполнения
- **AND** проверочная копия и фактический файл имеют одинаковые согласованные права

#### Scenario: A new upstream executable is installed
- **WHEN** выбранный исходный файл зафиксированного SHA является исполняемым и соответствующие права показаны в плане
- **THEN** установленный ресурс запускается обычным способом
- **AND** подмена заявленных прав относительно источника отклоняется

#### Scenario: An interrupted write is resumed
- **WHEN** итоговое содержимое уже присутствует, но права отличаются от записанного согласованного результата
- **THEN** продолжение не выдаёт совпадение байтов за полное выполнение операции
- **AND** прежние данные без сведений о правах остаются читаемыми без выдумывания отсутствующих свидетельств

### Requirement: Persisted state remains readable
Tibicen SHALL проверять совместимость размера записываемых служебных данных с лимитами штатного чтения. План, начальное состояние которого превышает объявленный совокупный лимит, SHALL отклоняться до изменения проекта. Ошибка последующей записи SHALL сохранять последнее читаемое состояние и историю.

#### Scenario: An accepted input would produce oversized state
- **WHEN** файлы и входной JSON укладываются в свои лимиты, но план вместе с оригиналами превышает лимит состояния
- **THEN** применение явно сообщает ограничение до изменения проектных файлов
- **AND** не создаёт служебный файл, который `status` или `resume` не сможет прочитать

#### Scenario: A journal grows at the size boundary
- **WHEN** запись очередного результата или паспорта превысила бы поддержанный лимит
- **THEN** прежний валидный файл не заменяется недоступными для чтения данными
- **AND** продолжение различает фактическое состояние файлов по сохранённому плану без тихого удаления истории

### Requirement: Secret inspection completes on bounded text
Проверка секретов SHALL завершаться на допустимом текстовом входе в установленном проверочном бюджете, включая длинную строку без присваиваний. Устранение задержки SHALL сохранять обнаружение поддержанных токенов, приватных ключей и буквальных значений при разрешённых env-ссылках.

#### Scenario: A long line contains no secret
- **WHEN** проверяется строка из одного повторяющегося латинского символа длиной 1 МиБ
- **THEN** контрольный процесс завершает проверку до своего объявленного тайм-аута
- **AND** отсутствие присваиваний не превращается в длительное зависание или ложное обнаружение секрета

#### Scenario: Existing secret and placeholder cases remain distinguishable
- **WHEN** проверяются буквальный токен, приватный ключ, именованное секретное присваивание и допустимая env-ссылка
- **THEN** секреты отклоняются, а разрешённая ссылка не считается значением секрета
- **AND** значения не включаются в текст диагностик

### Requirement: Candidate discovery retries after all rejections
При отсутствии подходящих кандидатов после первой выдачи Tibicen SHALL выполнить ровно одну предусмотренную переформулировку в прежних разрешённых источниках. Сетевой отказ SHALL сохранять причину без бесконтрольных повторов.

#### Scenario: Repositories exist but none contains a usable skill
- **WHEN** первая выдача непустая, но все репозитории отклонены, а во второй выдаче есть допустимый скилл
- **THEN** результат включает кандидата второй попытки и причины первого отсева
- **AND** ограничения лицензии, возраста, происхождения и блоклиста сохраняются

#### Scenario: Both attempts have no suitable candidates
- **WHEN** обе выдачи пусты либо все их кандидаты отклонены
- **THEN** результат содержит две попытки и явный gap
- **AND** успешная первая выдача не вызывает лишнего второго поиска

### Requirement: Pinned source retrieval avoids repeated tree reads
Получение нескольких файлов одного зафиксированного источника SHALL переиспользовать уже проверенные неизменяемые ответы в пределах одного применения. Сокращение запросов SHALL сохранять проверку каждого файла, актуальных ограничений источника и отсутствие устойчивого кэша до согласия.

#### Scenario: A component supplies twenty files
- **WHEN** одно применение получает двадцать файлов одного SHA
- **THEN** получение файлов не запрашивает заново один и тот же коммит и его дерево для каждого файла
- **AND** содержимое каждого файла по-прежнему сверяется с согласованным хэшем

#### Scenario: A later apply has different source eligibility
- **WHEN** начинается новое применение или выбран другой SHA
- **THEN** прежняя память запросов не подменяет новую проверку допуска и блоклиста
- **AND** изменение или несоответствие файла сохраняет явный отказ

### Requirement: Memory writes have an explicit bounded binding

Only one supported project-relative memory path explicitly bound in the approved plan SHALL receive memory setup writes. Its exact initial edits SHALL use existing consent, path, symlink, forbidden-path and before-content protections. The binding SHALL NOT authorize arbitrary Markdown, application or global-memory writes.

#### Scenario: A supported existing file is selected

- **WHEN** the approved plan binds `docs/memory.md` and its exact changes
- **THEN** only that file and the separately approved instruction changes may be written
- **AND** another Markdown file remains outside the memory permission

#### Scenario: The selected file changes after approval

- **WHEN** the memory body differs from the approved before-content before apply or interrupted-session resume
- **THEN** the stale write is rejected before overwriting it
- **AND** a new plan and applicable approval are required

### Requirement: Mutable memory ownership is separate from stable setup

The stored setup SHALL identify the canonical memory path as user-owned mutable content. After completed setup, checks SHALL retain stable instruction, connection and path-safety checks without requiring the memory body to match its initial hash. An interrupted write SHALL retain exact journal and recovery protection.

#### Scenario: Memory grows after a completed session

- **WHEN** the working agent adds a decision within the approved policy
- **THEN** a later check accepts the changed body without resetting it
- **AND** a missing file, unsafe path or damaged managed instruction remains independently detectable

### Requirement: New memory records fail closed in older runtimes

Memory-aware proposal, manifest and recovery formats SHALL use explicit new schemas that 1.0 readers refuse before writes. The new runtime SHALL retain legacy non-memory reading and recovery, and show memory migration in the reviewed digest. Migration SHALL preserve useful content and earlier session history without silently downgrading ownership.

#### Scenario: An old runtime encounters a memory-enabled project

- **WHEN** a 1.0 runtime reads a new memory manifest or pending memory recovery record
- **THEN** it refuses the unsupported schema before writing
- **AND** the user can continue with the compatible runtime without losing existing content

#### Scenario: An existing 1.0 project opts into memory

- **WHEN** the new runtime proposes the memory feature for a legacy manifest
- **THEN** the migration and exact file changes are included in the approved plan
- **AND** declining memory preserves the ordinary legacy workflow

### Requirement: Current read-only diagnosis accompanies saved reports

The existing report SHALL include a fresh structural diagnosis separately from saved session outcomes, preserving existing fields and session identity. Without explicit save request it SHALL leave project/user state unchanged and execute no project or third-party commands.

#### Scenario: A previous complete session has a current defect

- **WHEN** a registered instruction connection is damaged after completed setup
- **THEN** report preserves the historical complete status and recorded checks
- **AND** current diagnosis identifies the structural issue without claiming a new completed session

#### Scenario: A native setup has no Tibicen manifest

- **WHEN** report inspects an existing native setup without a saved session
- **THEN** it returns current available structural/inventory evidence and no recorded session
- **AND** it creates no manifest, state, cache, report file or application change

### Requirement: Adopt explains the smallest necessary outcome

Adopt SHALL explain the starting setup, concrete findings, what to retain or change, actual checks, limits and one next action in ordinary language. Exact edits and execution details SHALL remain reviewable before approval. A sufficient setup SHALL permit a no-change result with stated coverage.

#### Scenario: Existing setup is sufficient

- **WHEN** the working agent finds no necessary change after the available inspection
- **THEN** it explains what was inspected and why the setup is sufficient
- **AND** it neither invents a repair nor writes a fresh session merely to demonstrate activity

#### Scenario: Useful decisions have a missing connection

- **WHEN** existing useful project memory needs only a supported instruction connection
- **THEN** the recommendation preserves its notes and shows the minimal connection diff
- **AND** writes still require approval of the exact plan

### Requirement: Practice discovery accepts explicit version context

The existing read-only practices command SHALL accept optional structured input containing versions for selected valid harness identities, retaining the original agents-only invocation. Malformed or out-of-selection version entries SHALL be rejected before network reads. Missing versions SHALL remain explicit gaps. Input SHALL remain data and SHALL NOT cause agent execution or project/user-state writes.

#### Scenario: Selected versions are supplied through stdin or a file

- **WHEN** practices receives selected catalog agents and valid optional version input
- **THEN** each source record for an agent with a supplied version retains that version
- **AND** stdin and existing-file input produce equivalent bindings without creating state, caches or project edits

#### Scenario: Some versions are unavailable

- **WHEN** practices is invoked without version input or with versions for only some selected agents
- **THEN** sources can still be checked for the selected agents
- **AND** each agent without a supplied version retains an agent-version-unverified gap

#### Scenario: Invalid version input is rejected before reads

- **WHEN** version input has an invalid shape, unselected or malformed agent key, or an empty, oversized or control-containing version value
- **THEN** the command returns a structured input error before fetching sources
- **AND** supplied fields cannot override selected agents, allowed sources or execution boundaries

#### Scenario: Unknown selected harness has a supplied version

- **WHEN** a valid selected unknown identity has caller-supplied version context
- **THEN** input validation accepts the context but returns an unsupported-agent gap
- **AND** no documentation request or verified compatibility is inferred

### Requirement: Fetched practice evidence does not establish compatibility

Practice assessment SHALL distinguish successful source retrieval, supplied agent-version context and semantic applicability. A fetched source SHALL retain its date, content hash and requires-agent-assessment marker; a supplied version SHALL NOT be reported as independently observed installation or verified compatibility. Failed reads SHALL preserve explicit reasons without fresh evidence or uncontrolled retries.

#### Scenario: Current guidance is fetched with a version

- **WHEN** an official source is successfully fetched for a caller-supplied agent version
- **THEN** the output retains the source evidence and version context
- **AND** applicability still requires agent assessment rather than an automatic compatibility or loading success

#### Scenario: A source is unavailable or refers to a different version

- **WHEN** a source cannot be read or its guidance cannot be justified for the observed environment
- **THEN** unavailable retrieval retains its mechanical reason and unjustified applicability remains explicitly unknown in the recommendation
- **AND** old evidence or a main-branch fix is not presented as a freshly verified installed-release result

### Requirement: Recommendations explain their evidence boundary

Init/adopt SHALL connect each necessary recommendation to the observed task, sufficient existing/native alternatives, relevant source/date/version context and remaining limits. Keep/change/unknown outcomes SHALL be explained in ordinary language. Uncertainty SHALL NOT justify an invented repair, automatic tool upgrade or weakening the existing exact-plan consent boundary.

#### Scenario: A useful current setup is retained

- **WHEN** available evidence identifies no necessary change to the inspected setup
- **THEN** the agent explains what it retains and the inspected scope
- **AND** unknown versions or unavailable checks remain visible without a new component or session merely to record activity

#### Scenario: Relevant guidance supports a change

- **WHEN** the agent identifies a concrete problem and applicable evidence supporting a supported correction
- **THEN** it explains the added benefit, minimum change, material side effects and how the result can be checked
- **AND** exact edits/executions remain reviewable and require the existing approval before application

### Requirement: Practice reads share a fixed global budget

Practice discovery SHALL accept at most sixteen valid identity selections, deduplicate them in caller order, and attempt at most two catalog sources per identity and six HTTP requests in total. Sources SHALL stay on explicitly reviewed official HTTPS hosts. Existing read, redirect, credential, content and timeout safeguards SHALL remain. Exhausted selections SHALL retain explicit gaps.

#### Scenario: More than three harnesses are selected

- **WHEN** valid selected profiles need more than six source requests
- **THEN** at most six requests are attempted in deterministic selection/source order
- **AND** each source not attempted because of the global limit has a source-budget-exhausted gap without an invented checked result

#### Scenario: Sources fail or identities repeat

- **WHEN** selected identities repeat or an attempted source fails
- **THEN** duplicates do not increase reads and failed attempts consume the same global budget
- **AND** failures keep their actual reason without retries or redirects

#### Scenario: Invalid selection is supplied

- **WHEN** the selection exceeds sixteen entries or contains malformed/non-string identity data
- **THEN** the entire invocation fails before network reads
- **AND** selected input cannot supply arbitrary source domains or change capability authorities
