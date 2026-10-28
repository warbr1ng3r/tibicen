# Spec Delta

## Purpose

Изолировать инструменты native eval в одноразовой Linux-сессии, проверять завершение её процессов и возвращать только ограниченные результаты без доступа к host auth и private inputs.

## ADDED Requirements

### Requirement: First stopping tool failure is retained safely

The session SHALL retain the first structured tool failure that initiates stopping in its receipt. The projection SHALL contain only a fixed kind and a safe integer error code or process exit code, or null when that number is unavailable. Arbitrary method names, IDs, command arguments, messages, output and nested data SHALL be excluded. Later events SHALL NOT overwrite the initiating failure or change the existing stop reason, cleanup or fail-closed collection policy.

#### Scenario: Two failures arrive in one protocol chunk
- **WHEN** a JSON-RPC error initiates stopping and a process exit follows
- **THEN** the receipt retains only the first error kind and numeric code
- **AND** stopping, container removal and empty failure collection remain unchanged

#### Scenario: An ignored protocol error precedes a failed process
- **WHEN** error code -32004 is followed by process/exited with a nonzero exit code
- **THEN** only the process exit initiates stopping and its safe numeric exit code is retained

### Requirement: Rejected post-run validation remains unverified

The contained caller SHALL return null for sourceUnchanged when post-run profile validation rejects, including cancellation or unavailable metadata. Only a completed successful validation SHALL return true. Unverified validation SHALL NOT permit a passing run or claim observed source mutation. Historical failed records SHALL remain unchanged.

#### Scenario: Tool failure cancels profile metadata validation
- **WHEN** stopping cancels the caller and the post-run profile validation rejects
- **THEN** sourceUnchanged is null and the run remains failed
- **AND** no retry, new auth or model call is made

### Requirement: Executor inputs are fixed and isolated
Сессия SHALL использовать закреплённый image ID, фиксированные инструменты, сеть none, private PID namespace и ограниченные ресурсы. Инструменты SHALL работать с непривилегированным UID без host mounts, auth, Docker socket или возможности сигналить доверенному watchdog.

#### Scenario: A project attempts host access
- **WHEN** инструмент читает синтетический host secret, обращается к host сети или пытается управлять watchdog
- **THEN** доступ запрещён, host inputs не меняются и deadline остаётся работоспособным

#### Scenario: Configuration changes the boundary
- **WHEN** переданы mutable image tag, произвольные Docker flags или неподдержанные paths/environment
- **THEN** запуск отвергается до исполнения проекта

### Requirement: A session owns and removes its container
Host SHALL удерживать CID до подтверждённой остановки и удаления контейнера. Success, failure, timeout, output cap, cancel и dispose SHALL завершать всю session boundary перед terminal result; cleanup failure SHALL давать ошибку, не ready.

#### Scenario: A descendant detaches
- **WHEN** worker меняет process group/session и пытается записать late marker после terminal outcome
- **THEN** stopped boundary содержит Pid=0, marker не появляется после его горизонта, контейнер удалён

#### Scenario: A tool fails or times out
- **WHEN** выполняемый инструмент завершается ненулевым кодом или превышает deadline
- **THEN** сессия прекращается до следующего инструмента и поздние потомки не продолжают работу

#### Scenario: Stop verification fails
- **WHEN** owned CID уже подтверждён, но wait или чтение/проверка state завершается ошибкой
- **THEN** удаление owned CID и проверка отсутствия всё равно выполняются
- **AND** исходная ошибка сохраняется при успешной очистке, а сбой удаления явно возвращается как cleanup failure

### Requirement: Owner loss has an independent deadline
Executor SHALL иметь ограниченный срок жизни вне полномочий проверяемого кода. Исчезновение host owner/stdio lease SHALL завершать сессию; немедленно неподтверждённое завершение SHALL оставаться unverified до наблюдения за горизонтом deadline.

#### Scenario: The owner is killed
- **WHEN** доверенный host owner неожиданно исчезает, а detached worker продолжает ждать
- **THEN** закрытие lease либо независимый deadline завершает PID namespace, late marker не появляется после проверенного горизонта

### Requirement: Native tools use the selected remote environment
Изолированная конфигурация Codex SHALL выбирать только заданный stdio executor без local fallback. Shell, filesystem и native apply_patch SHALL использовать выбранную среду. Неполная конфигурация SHALL завершаться до реальной auth/model сессии.

#### Scenario: No remote executor is available
- **WHEN** environments config отсутствует, malformed или stdio handshake не удался
- **THEN** локальные инструменты не запускаются, native readiness остаётся blocked

#### Scenario: Host and remote workspaces differ
- **WHEN** host cwd передаётся remote executor
- **THEN** caller создаёт согласованный mapping, и read/write/patch выполняются внутри контейнера, а host sentinel неизменен

### Requirement: File transfer treats project results as untrusted
Ввод и сбор результатов SHALL иметь лимиты количества и размера файлов. Collector SHALL отклонять traversal, links, специальные файлы, дубли и незаявленные пути, не извлекая недоверенное дерево в host filesystem.

#### Scenario: A result contains a symlink or oversized file
- **WHEN** проект подменяет результат ссылкой либо превышает согласованный лимит
- **THEN** collector отклоняет результат и завершает boundary без чтения host цели

### Requirement: Readiness comes from fresh offline integration evidence
Backend SHALL иметь offline проверки настоящего pinned Linux executor и host environment selection. Прямой RPC, fake model и source inspection SHALL учитываться отдельно. Production gate SHALL оставаться blocked до полного подтверждения; новая live проба требует отдельного протокола.

#### Scenario: Only executor RPC succeeds
- **WHEN** handshake и filesystem/process RPC проходят, но host tool routing не проверен
- **THEN** сохраняется partial evidence, production readiness не повышается

#### Scenario: An offline model transport drives tools
- **WHEN** синтетический local transport используется для проверки настоящего host harness
- **THEN** результат отмечен offline, реальные provider/auth/model/API calls равны 0 и live acceptance не заявляется
