# Tasks

## 1. Containment boundary

- [x] 1.1 Сохранить совместимый group-only supervisor только для доверенных discovery/fixtures; проверить все callers, описать границы в design и подтвердить tests/evals/process-supervisor.test.ts.
- [x] 1.2 Добавить проверяемый macOS Node no-fork режим с фиксированным test argv и запретом runtime injection; подтвердить прямой OS fork canary, child/worker/addon/execve denial и marker-регрессию exit/timeout/cancel в tests/evals/node-check-containment.test.ts.

## 2. Production and fixture routes

- [x] 2.1 Блокировать native preflight/profile loading до CLI/auth/model независимо от cached ready, передавать containment reason через diagnostic entry; подтвердить Codex/ZCode/profile/diagnostic tests без личной auth/model.
- [x] 2.2 Сохранить offline native acceptance/diagnostics через явно названные code-only trusted fixture входы без auth links; подтвердить tests/evals/native-workflow.test.ts и native fixture checks.

## 3. Integration

- [x] 3.1 Выполнить pnpm 11.21.0 typecheck:core, lint затронутых файлов, format:check, test:evals и strict OpenSpec validation; сохранить команды, результаты и ограничения в verification.md без изменения исторических результатов.
- [x] 3.2 Исправить подтверждённые повторным review inherited environment и signal-to-supervisor bypass; проверить отказы до spawn, bounded SIGSTOP regression, независимое re-review и полный gate перед коммитом.
