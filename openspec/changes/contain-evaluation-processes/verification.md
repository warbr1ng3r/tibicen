# Verification

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

Дата: 2026-10-26. Реализация ticket 37; pnpm 11.21.0, Node v24.15.0, macOS Darwin 24.6.0 arm64. Исторические live evidence не менялись.

## Results

- `pnpm test:evals`: **328/328 pass**, 0 failed/skipped, 59.62 s, после финальной OPENSSL/NODE environment правки. Включает обычный supervisor, native offline protocol, production blocked routes и no-fork regressions. Временный лог: `/tmp/tibicen-containment-evals.log`.
- `node --test tests/evals/node-check-containment.test.ts tests/evals/process-supervisor.test.ts tests/evals/codex-profile.test.ts tests/evals/codex-diagnostic.test.ts tests/evals/zcode-profile.test.ts tests/evals/diagnostic-entry.test.ts`: **47/47 pass**, 0 failed/skipped после финальной environment правки; лог `/tmp/tibicen-containment-focused.log`.
- `pnpm typecheck:core`: pass после финальной environment правки.
- `pnpm lint`: pass; после финальной environment правки дополнительно `pnpm exec eslint scripts/evals/node-check-containment.ts tests/evals/node-check-containment.test.ts --max-warnings 0`: pass.
- `pnpm format:check`: pass; финальные изменённые helper/test отформатированы `pnpm exec prettier --write scripts/evals/node-check-containment.ts tests/evals/node-check-containment.test.ts`.
- `pnpm spec:check`: active/main **14 passed**, archived **6 passed**, 0 failed. `pnpm openspec validate contain-evaluation-processes --strict`: pass.
- `git diff --check`: pass.

## Regression evidence

Фабрика проверяет настоящий OS fork(2) через `/usr/bin/perl` под macOS sandbox-exec deny process-fork: fork отклонён. Отдельный Node canary подтверждает запрет обычного/detached spawn, workers, addons и execve/execveSync при наличии API. Tests запускаются с фиксированными permissions и --test-isolation=none; безопасный поздний marker отсутствует после exit/timeout/cancel. Последующий запуск после dispose не создаётся. Runtime-injection environment и неявные/относительные test paths отклоняются до запуска.

Независимый offline review обнаружил OPENSSL_CONF engine constructor до Node permissions: временная dylib записывала marker, хотя test ещё не выполнялся. Исправление отвергает все NODE_*, OPENSSL_*, DYLD_* и LD_* ключи до spawn. Reviewer повторил точную безопасную constructor-пробу: `invalid-contained-node-check`, marker отсутствует; временные config/library/test удалены. Дополнительный независимый focused suite: 38/38 pass. Исправление вошло в финальные 47/47 и 328/328 прогоны выше.

Production Codex preflight с observeStartup=true не исполняет даже --version, не читает auth и сохраняет modelRequests=0. Production cached ready и JSON fixture признаки не включают native route. Общий runner сохраняет blocked-пары с native-process-containment-unavailable. Offline protocol явно использует code-only fixture API; fixture prepare больше не создаёт symlink к личной auth.

## Supported scope

Подтверждён eval-only Node process boundary на текущей macOS/Node: процессы/worker/addon не разрешены, OS fork запрещён, argv фиксирован. Filesystem policy остаётся обязанностью caller; этот helper сам по себе не является filesystem sandbox и не читает созданные недоверенным тестом файлы. Network deny policy задана; реальных сетевых запросов не выполнялось.

Полные native CLI tools **blocked**: проверенного полного tree-containment backend нет. Group-only supervisor остаётся только для доверенного discovery и offline fixtures; detached/setsid cleanup этим API не гарантируется. Linux/Windows execution не заявляется поддержанным; локально эти платформы не тестировались. Product core/execute/verify и распространяемые skills в этой правке не менялись. Модели, личная auth, установки, реальные секреты, коммиты и публикация не использовались.

## Final pre-commit review

Повторное ponytail-review нашло inherited environment bypass и signal-to-supervisor bypass. Helper копирует все enumerable env keys в object без prototype, проверяет и передаёт ровно его; inherited NODE_OPTIONS/OPENSSL_CONF отклоняются до spawn. OS policy запрещает signal, отдельная signal-0 canary требует EPERM. Изолированный SIGSTOP regression проверяет сохранение deadline с гарантированным cleanup. На временной копии старого helper оба новых случая падают ожидаемо, исправленный helper проходит 5/5.

Финальный pnpm test: **616/616**, 0 skipped, включая lint/format/types/site/strict specs; pnpm build pass, **86 checksums**, обе автономные CLI self-test и local-node-modules proposal/apply/report complete/green с пустым PATH вне checkout. Логи `/tmp/tibicen-package25-review-test-20261026.log` и `/tmp/tibicen-package25-review-build-20261026.log`. Полный review report. Historical proof не переписывался; live/auth/model/API запросов 0.
