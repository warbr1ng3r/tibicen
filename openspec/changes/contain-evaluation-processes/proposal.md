# Proposal

## Why

Evaluation supervisor убивает исходную группу процессов, но потомок после detached fork/setsid способен пережить её и менять файлы после сбора результата. Обычная cleanup-проба не подтверждает заявленный контроль дерева.

## What Changes

- Явно сохранить group-only supervisor для доверенного discovery и offline fixtures; убрать обещание полного дерева.
- Добавить ограниченный macOS режим Node tests: проверяемое OS deny process-fork плюс Node permission без child/worker/addon grants и test-isolation=none.
- **BREAKING**: полнофункциональные native профили блокируются с native-process-containment-unavailable до auth/model и независимо от старого cached ready.
- Offline протокольные fixtures доступны только через явно названный code-only вход, без JSON/config bypass и личной авторизации.
- Подтвердить отсутствие поздних marker-эффектов после exit, timeout и cancel; сохранить исторические свидетельства без переписывания.

## Capabilities

### New Capabilities

- `evaluation-process-containment`: проверяемая граница процессов evaluation и отказ от недоказанного native запуска.

### Modified Capabilities

Нет. Product execute/verify в распространяемых Tibicen skills не входит в эту правку.

## Impact

scripts/evals supervisor, Codex preflight/profile, CLI discovery, native/diagnostic callers и tests/evals. Новый режим ограничен Node tests на проверяемой macOS; filesystem/network policy остаётся отдельной ответственностью caller. Полный native containment backend, VM, новые пакеты, auth/model/network/install/commits не добавляются.
