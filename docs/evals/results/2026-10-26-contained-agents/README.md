# Изоляция Codex и подписочная проба ZCode

26.10.2026, пакеты 26–27. Shared runtime и дистрибутив Tibicen не менялись. Исходный коммит — `13dcc95`; новая работа не закоммичена. Дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source).

## ZCode

**Живая проба не прошла: остановилась до инструментов.** Одна host session через существующую подписку `account:zai-individual-coding-plan / GLM-5.3 / low`, одно наблюдаемое SDK model_request event, 0 native port calls. Host завершился через 9.684 s (процесс с загрузчиком — 10.273 s). Сохранено: reason `unknown`, code `model_request_failed`, phase `prepare`, HTTP status `null`. SDK пометил ошибку как подготовку запроса; точную причину и факт inference это не устанавливает. HTTP/inference/retry count остаются неизвестными. Host retry, judge/startup и paid API — 0. Повтор не выполнялся.

До сети exact revision прошла шесть offline cases: реальный SDK tool loop, безопасная вложенная ошибка, немедленная остановка по SDK error, failed Bash, failed filesystem helper и deadline при финальной записи. Независимый review исправил подмену assert/ранний exit в oracle, продолжение после упавшего Bash и гонку очистки с записью квитанции. 44 projector cases прошли в исходном r2 host. Frozen fake adapter pass подтверждает host mechanics; живой pass им не подменяется.

Файловые инструменты и Node tests используют одну macOS OS boundary: ограниченные пути, запрет сети/fork/signal/hardlink и Node child/worker/addon/execve. Это ограниченный инструментальный smoke, не полный native backend. Авторизацию расшифровывает официальный SDK из одноразовой непрозрачной копии; provider config также копируются, все записи идут во временную область. 9 исходных файлов профиля, 476 ранее зафиксированных artifact files и 155 pre-live manifest entries неизменны; временная область удалена.

[Безопасные факты ZCode](zcode.json). SDK source 0.17.0 / `3c5b227649371507ddc4eb46ac5133afe6db1cab`; установленный CLI 0.16.9 не менялся. Private proof SHA-256 указан в JSON; raw provider payload, credential values и заголовки сюда не перенесены. Историческая причина первого native отказа остаётся неизвестной.

## Codex

**Маршрут выбран, production остаётся blocked.** Уже работающий Docker Desktop удержал orphan/setsid workers в четырёх синтетических lifecycle cases: положительный контроль, exit, TERM-resistant timeout и cancel. После остановки трёх границ поздних marker нет; все четыре контейнера удалены, исходные inventories совпали. Images не скачивались, VM/services не создавались, модель и auth не вызывались.

Предлагается штатный `environments.toml` → stdio → Linux `codex exec-server`, авторизация на host, `include_local=false`. Нужны pinned Linux image, владелец CID с kill/wait/remove, изменение изолированной конфигурации, безопасный обмен файлами и полный offline integration gate. Текущий `--ignore-user-config` пропускает environments.toml; его нельзя оставить без изменения launcher. Исследование и первичные источники (`../../../../.scratch/codex-zcode-acceptance/native-containment-route.md`; private development record; excluded from public source), [факты canary](native-route.json).

Полная установка/загрузка Tibicen в ZCode, смысловая/человеческая и релизная приёмка остаются открытыми. Последний общий product gate — 616/616 на `13dcc95`; в этом пакете выполнялись private host checks и проверки evidence, полный suite повторно не запускался.
