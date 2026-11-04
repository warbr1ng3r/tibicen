# Контейнерный executor Codex и диагностика ZCode

Пакет 28, 26.10.2026. **Настоящий host Codex 0.157.0 выполнил два shell-вызова и native apply_patch через контейнерный executor.** Ответы задавал локальный synthetic transport; реальные auth/provider/model/API calls — 0. [Факты и hashes](summary.json), дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source), [OpenSpec](../../../../openspec/changes/containerize-native-evaluation-execution/tasks.md).

## Что реализовано

Eval-only image содержит закреплённые Codex 0.157.0, Node 24.15.0 и pnpm 11.21.0. Root PID1 watchdog запускает executor под UID1000 с нулевыми capabilities, принимает только ограниченный deadline, завершает namespace по EOF/exit/timeout. Tool UID не может остановить PID1 или изменить его код. Docker networking отключён, host paths/auth/socket не монтируются. [Подготовка image и ограничения](../../../../scripts/evals/container/IMAGE.md).

Внешний owner удерживает CID вне process group Codex. Временный одноразовый Unix socket связывает stdio launcher и executor; при завершении launcher owner останавливает namespace, проверяет Pid=0, собирает ограниченные regular-file bytes и удаляет контейнер до terminal result. Ни daemon, ни постоянный процесс проекта не добавлены. Unsafe workspace paths, project .codex/.mcp.json inputs, traversal, links, специальные файлы, дубли и превышение лимитов отвергаются. Transfer поддерживает до 512 entries, 1 MiB/file, 16 MiB total: это текущая контролируемая eval-граница.

Изолированный host config выбирает только remote environment, зеркалит cwd и запрещает local fallback. Вложенный bwrap недоступен при Docker seccomp; filesystem изолирует сам контейнер и UID, Codex сохраняет ограничение сети. Для этого использован поддержанный named profile root-write/network-disabled, без ослабления Docker. Generated workspace отмечен untrusted, чтобы Codex не менял config добавлением trust. Auth и прочие личные configs отсутствуют.

## Проверено

- 5 real-image lifecycle cases: positive late marker, EOF, deadline, executor exit и SIGKILL attach owner. После остановки marker отсутствует за горизонтом worker; все CIDs удалены, посторонние контейнеры сохранены.
- 7 final-source session cases: process/fs roundtrip, nonzero tool, cancel, deadline, unsafe symlink result, output cap, гибель launcher. Подтверждено завершение не только контейнера, но и Docker attach client.
- Frozen host attempt8: 4 локальных synthetic HTTP requests, 2 shell-вызова, completed native file_change. Collector получил ожидаемые изменённые bytes, одноимённый host файл и закрытый host sentinel не изменились. Source/config hashes совпали до/после, CID stopped/removed.
- 10 новых unit checks: archive paths/types/limits, защищённые workspace/config, generated home и watchdog/build pins.

Общий `pnpm test` прошёл: **626/626**, 0 skips; lint, format, core/site types, build сайта и strict active/archived OpenSpec — pass. Production gate при этом не менялся.

Review исправил возможность заменить watchdog через workspace path, продолжение после RPC/tool failures и зависший Docker client при output cap. Ранние попытки сохранены: cp -a менял UID, image r1 не имел пустого CODEX_HOME, restricted profile требовал bwrap, auto-trust менял generated config, paused attach pipe удерживал процесс после cleanup. Они не переименованы в успешные.

## ZCode

Исследование подготовки (`../../../../.scratch/codex-zcode-acceptance/zcode-prepare-diagnosis.md`; private development record; excluded from public source) завершило 17 synthetic official-adapter cases и 8 projection checks. Прежний tuple воспроизводится несколькими ошибками: header refresh, нарушенный header contract, преобразование сообщения. Историческая причина остаётся unknown, повторного live не было. Найдено, что addStatusSink при композиции теряет raw publishFailure; следующему host нужны проверенные stage/header checkpoints до first-error stop. Все 12457 source files SDK и 9 исторических inputs сохранены.

## Граница результата

Production loaders пока намеренно blocked. Это проверенный offline backend на закрытой fixture, а не автоматическая поддержка произвольного проекта: необходимо подключить его к native профилю, сохранить guard против project configs/MCP discovery и отдельно проверить настоящую подписочную сессию по новому frozen протоколу. Обычный mcp_servers={} не является универсальным запретом executor-local MCP. Target-project skills, product core и distribution dependencies не менялись; OpenSpec остаётся инструментом разработки.

Новых реальных model/provider/API calls и коммитов — 0. Полная semantic/human/release приёмка не закрыта.
