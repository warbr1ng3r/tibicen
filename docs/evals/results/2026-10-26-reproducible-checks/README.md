# Воспроизводимые проверки проекта и границы исполнения

Пакет 25, 26.10.2026. Основание — пробелы [практических сценариев](../2026-10-26-practical-workflows/README.md). Предшествующий review/fix/commit завершён в `f8fa46b`; этот пакет меняет поведение ядра и eval-only маршрутов отдельно.

| Область | Фактический результат |
| --- | --- |
| Встроенный verify | Public CLI proposal/apply/report на копии настоящего landing: complete, verify green. Baseline/final исполнили Astro build и 13 site tests; внешний runner не подставлялся |
| Окружение | 18 311 файлов / 251 344 980 bytes, согласованный hash, darwin/arm64/Node v24.15.0; оригинальные исходники и зависимости сохранены |
| Стоимость копирования | Одно чтение записываемого payload вместо трёх: observed apply 178 935 → 85 443 ms. Обе попытки pass; два локальных наблюдения не заменяют общий benchmark |
| Процессы eval | OS no-fork + Node permission boundary прошла exit/timeout/cancel и loader-injection regressions. Production native profiles блокируются до CLI/auth/model, включая cached ready |
| ZCode diagnostics | 44 projector cases + публичный SDK synthetic failure сохраняют typed reason/code/status/phase до generic outer error. 222 файла исходного native run неизменны |

[Проверки проекта и hashes](project-checks.json), [безопасная диагностика ZCode](zcode-diagnostics.json). Модельных/HTTP/paid API запросов в пакете **0**; ZCode использовал три in-memory fake invocations во всех сохранённых fixture-попытках. Ошибки подготовки новых стендов сохранены: вложенная destination, лишний mkdir и неверная форма managedBlock; после исправления полные CLI прогоны выполнены отдельно.

## Что реализовано

Опциональный `checks.environment` вычисляется до согласия и связывает roots, payload hash, объём и runtime с digest плана. Захват выполняется до baseline; retained input и каждое исполнение имеют независимые байты. Hash проверяется по фактически записанным файлам, ссылкам и modes до использования копии; несоответствие откатывается. Изменившиеся/недоступные зависимости, runtime и workspace target дают `unverified` с причиной. Полный набор команд и прежний механизм сравнения сохранены.

Ревью воспроизвело выбор Node 25 из PATH при согласованном Node 24. Компилятор теперь закрепляет Node executable, а runtime независимо сверяет его realpath. Повтор исходной пробы и 15 focused tests прошли. Review (`../../../../.scratch/codex-zcode-acceptance/review-project-environment.md`; private development record; excluded from public source), [требования и задачи](../../../../openspec/changes/reproduce-project-check-environments/tasks.md).

Общий eval supervisor честно остаётся group-only для доверенных discovery/fixtures. Новый Node helper проверяет OS fork denial, запрещает child/worker/addon/execve и использует фиксированные аргументы. Независимое review обнаружило OpenSSL engine через OPENSSL_CONF до Node permissions; startup variables теперь отклоняются до spawn, повторная constructor-проба не создала marker. Trusted fixture API выбирается только кодом и не создаёт ссылку на личную auth. Review (`../../../../.scratch/codex-zcode-acceptance/review-process-containment.md`; private development record; excluded from public source), [проверки и границы](../../../../openspec/changes/contain-evaluation-processes/verification.md).

## Общая проверка

`pnpm test` после повторного review: 616/616, без пропусков; lint, format, types, site build и строгая проверка active/archived specs прошли. `pnpm build`: pass, 86 files, все SHA256SUMS совпали. Оба скилла скопированы вне checkout и с пустым PATH прошли self-test и новый local-node-modules proposal/apply/report с complete/green. Eval scripts, dev skills и OpenSpec runtime в поставку не входят. Повторное review (`../../../../.scratch/codex-zcode-acceptance/review-package25.md`; private development record; excluded from public source) перед локальной фиксацией нашло и исправило inherited env bypass, signal-to-supervisor и ложную причину ошибки старого snapshot; новые regression tests проходят.

## Ограничения

Local Node environment — явно выбранный доверенный package payload с фиксированным hash. Credential paths, shims, machine metadata и caches исключаются; универсальное обнаружение встроенных секретов в vendor code не обещается. Поддержаны явные Node entrypoints без установки пакетов. Временная копия сама по себе не является OS sandbox; реальная приёмка дополнительно запрещала сеть через ОС.

Node containment подтверждён на текущей macOS/Node и требует отдельной filesystem policy. Полный native backend пока отсутствует; сохранённые прошлые ready records его не заменяют. Product core/execute продолжает исполнять явно доверенные команды. Историческая причина живой ошибки ZCode неизвестна; новый live smoke, полная смысловая/человеческая приёмка и выпуск этим пакетом не подтверждены.
