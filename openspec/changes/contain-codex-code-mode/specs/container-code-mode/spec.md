# Spec Delta

## Purpose

Обеспечивать выполнение штатного Code Mode runtime современных моделей Codex внутри принадлежащего одной eval-сессии контейнера с прежней границей секретов и очистки.

## ADDED Requirements

### Requirement: Companion executes inside owned container

Code Mode SHALL использовать pinned companion только в exact owned CID с UID1000, очищенным env, network none и без host mounts. Host execution/fallback SHALL быть запрещены; отсутствие или изменение binary/wrapper/route SHALL завершать запуск ошибкой.

#### Scenario: Model uses Code Mode nested tools
- **WHEN** unchanged official metadata выбирает Code Mode
- **THEN** V8 выполняется внутри owned container, а nested shell/filesystem используют проверенный remote executor
- **AND** host auth и файлы вне inputs недоступны

#### Scenario: Wrapper or companion is missing
- **WHEN** staged companion route отсутствует или не совпадает с freeze
- **THEN** запуск отклоняется без локального V8 fallback

### Requirement: Companion shares bounded session lifecycle

Companion SHALL принадлежать тому же PID namespace/deadline/cleanup, что executor. IPC SHALL не логировать frames или secrets; cancellation/failure SHALL завершать host и container, а результаты возвращаются только после проверенного удаления CID.

#### Scenario: Host wrapper disconnects or session deadline expires
- **WHEN** stdio обрывается либо session отменена
- **THEN** companion и descendants прекращаются вместе с CID, late effects отсутствуют

### Requirement: Official model semantics remain intact

Caller SHALL выбирать фиксированную поддержанную модель с неизменённой official metadata и явным tool-mode route. Нельзя подменять code_mode_only на direct ради pass. Synthetic proof SHALL предшествовать отдельному fresh reviewed subscription protocol.

#### Scenario: Current catalog contains only Code Mode models
- **WHEN** direct-compatible candidates отсутствуют
- **THEN** caller использует проверенный Code Mode route либо отказывает, не возвращая старую отсутствующую модель из cache
