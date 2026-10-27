# Proposal

## Why

Полноценные Codex eval заблокированы: группа процессов macOS не удерживает setsid descendants. Локальный Docker PID namespace уже прошёл lifecycle canaries; нужен настоящий Linux executor с проверенным завершением и без передачи host auth инструментам.

## What Changes

- Добавить eval-only сессии контейнерного исполнения с pinned image, ограниченными ресурсами, сетью none и без host mounts.
- Управлять контейнером по CID вне его namespace: terminal result выдаётся после stop/wait/remove; owner loss также завершает контейнер.
- Добавить изолированную stdio конфигурацию штатного Codex exec-server и офлайн-проверку handshake, shell/filesystem и безопасного сбора результатов.
- Сохранить общий native gate blocked, пока полная интеграционная проверка не подтверждена; fake/model-free проверки не превращать в live acceptance.

## Capabilities

### New Capabilities

- `container-execution-sessions`: принадлежащая одной eval-сессии контейнерная граница, контролируемый stdio executor и проверяемая очистка.

### Modified Capabilities

Нет. Требование verified native containment из активного contain-evaluation-processes сохраняется; новый backend предоставляет отдельный проверяемый механизм, не ослабляет его.

## Impact

Новые eval-only scripts/tests и документация подготовки image; Docker Desktop используется уже установленный. Product core, target-project skills и OpenSpec в дистрибутиве не меняются. Новые внешние пакеты в product dependencies не добавляются. Auth/model/API и commits в этой реализации — 0. Локальная подготовка image не публикуется.
