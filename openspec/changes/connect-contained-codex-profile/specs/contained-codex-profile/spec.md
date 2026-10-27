# Spec Delta

## Purpose

Предоставлять узкий воспроизводимый native запуск Codex через проверенный container executor с сохранением границ секретов и честным учётом результатов.

## ADDED Requirements

### Requirement: Fresh closed scope gate

Caller SHALL проверять текущие pinned image, CLI binary, generated configuration и source hashes перед каждой сессией. Неподдержанные project configs/MCP, небезопасные input/result paths и изменение freeze SHALL отклоняться до чтения авторизации. Сохранённая запись ready не заменяет эту проверку.

#### Scenario: Inputs request project configuration
- **WHEN** seed содержит .codex либо .mcp.json или current freeze изменился
- **THEN** caller отказывает до auth/model и не разрешает local executor fallback

#### Scenario: A cached record claims readiness
- **WHEN** ранее успешная запись передана без текущей проверки image/binary/source
- **THEN** caller не открывает сессию по этой записи

### Requirement: Host subscription isolation

Live caller SHALL использовать только существующую подписку ChatGPT на доверенном host с явно закреплённым provider/model/endpoint. Auth bytes SHALL оставаться вне container inputs и observations. API-key режим, fallback и изменение личного login SHALL быть запрещены. Synthetic transport SHALL быть отдельным offline путём без credentials.

#### Scenario: Subscription input contains an API key
- **WHEN** credential file выбирает API-key режим или содержит API key
- **THEN** caller отказывает без provider запроса

#### Scenario: Offline full host test
- **WHEN** synthetic loopback provider выдаёт shell и native patch calls
- **THEN** они изменяют только container workspace без передачи auth или вызова реальной модели

### Requirement: Bounded lifecycle and byte collection

Caller SHALL владеть container вне process group CLI, ограничивать время и вывод, прекращать запуск при первой terminal failure и возвращать только разрешённые regular-file bytes после stop/wait/remove. Timeout, invalid output и cleanup failure SHALL сохраняться как ошибки. Host workspace SHALL не изменяться результатами инструментов.

#### Scenario: Host CLI finishes or fails
- **WHEN** CLI завершён, отменён или превысил лимит
- **THEN** caller завершает принадлежащий container, проверяет удаление и лишь затем выдаёт результат

#### Scenario: Tool creates a symlink result
- **WHEN** collected archive содержит link или другой неподдержанный entry
- **THEN** результат не извлекается в host filesystem и сессия не объявляется успешной

### Requirement: Evidence separates readiness from acceptance

Caller SHALL сохранять frozen metadata и фактический исход, различая synthetic проверки, подписочную сессию и полную acceptance. Новый live SHALL требовать отдельный заранее записанный bounded protocol после review. Старый budget не переносится автоматически; неподдержанные общие workflows SHALL оставаться blocked.

#### Scenario: Synthetic tests pass
- **WHEN** offline caller завершил shell/patch и cleanup
- **THEN** результат подтверждает routing, а не live качество или release acceptance
