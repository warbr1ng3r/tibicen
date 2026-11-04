# Tibicen init/adopt через контейнерный Codex

Пакет 31 подключает существующий многофазный runner к проверенному Codex Code Mode route. Scope: только AGENTS.md, proposal → approval → apply → verify → status → report → итоговый ответ. Полная продуктовая матрица и baseline comparison этим не закрываются.

## Контроль стенда

Actual CLI 0.157.0 и V8 companion прошли оба сценария с локальным synthetic Responses transport: 4 host sessions, 8 loopback responses, 2 независимые проверки итогового состояния. `init` добавил AGENTS.md, `adopt` сохранил исходное правило и добавил согласованное. В обоих случаях apply/status/report complete, structural verify passed, task явно skip. Новых запросов к модели или авторизации в этом контроле нет.

Negative control отклонил первую постороннюю команду: 1 host/response, adopt не начат. Все 7 контейнеров обоих контролей удалены; 106 source hashes, protected/runtime bytes/modes и host sentinel сохранены. [Безопасная проекция результатов](synthetic.json).

## Исправленные дефекты стенда

- Runtime больше не находится в `.tibicen/state`, который продукт штатно удаляет. Frozen runtime, logical HOME и approved plan лежат в соседнем support-каталоге вне product root.
- Setup-only task event больше не маскирует исходную setup failure.
- CLI audit иногда возвращает пустой stdout при успешной trusted команде. Такой capture явно unavailable; independent verify/status/report обязательны. Все непустые captures проверяются и сравниваются, последующий пустой capture не скрывает предыдущий.

Product core, skills и дистрибутив ради этих исправлений не менялись. Failed attempts 1–3 и два model-free diagnostics сохранены отдельно, их статус не повышен до pass.

## Проверки и свидетельства

`pnpm test`: **660/660**, fail/skip0; lint, format, types, site и strict active/archived specs прошли. Независимый review (`../../../../.scratch/codex-zcode-acceptance/review-package31.md`; private development record; excluded from public source): Ship. [OpenSpec](../../../../openspec/changes/connect-contained-tibicen-workflows/tasks.md) сохраняет требования и задачи.

Private evidence: `.evals-private/codex-contained-tibicen-synthetic-20261027-r1/`; final-proof SHA256 `12bd35fa4f889ee30babcc8ae8a82bb3ac61d19c8b51f63a10a8a6b515371ead`. Full gate: `.evals-private/package31-repo-gate.log`.

## Подписочный результат

Fresh subscribed batch завершился после **1 из 4** host attempts: модель начала сессию и успешно прочитала shipped SKILL.md, затем owner остановил её на tool-failure до proposal. Точная упавшая команда и причина не сохранились до отмены; ошибка не приписывается продукту. Init — error, adopt не начат. Повторов не было. Известный CID удалён, временные области отсутствуют, source/host sentinel сохранены. [Безопасная квитанция](subscription.json).

Независимая postlive сверка повторно проверила все 106 source pins, binding protocol/consumed/review, отсутствие второй сессии, CID и временного scope. Private proof SHA256 `02f36708440051b875bb9050812960e5624f1cf58f0e0285c3de66fbfd43b0b3`; batch остаётся failed.

До auth были зафиксированы exact source/runtime/script/evidence hashes и fresh cap 4 host attempts, 90s/session, 180s/case, 360s/batch, без startup/judge/retry/fallback/API. Protocol SHA256 `777c9409860352c37d5245ef18a385bdc7095909743840fa077409b3e853e063`; freeze `e266ac1419d98a8d07a5a483dedebe5934c37112580efcba0aacdf81e1b6bcf9`. Synthetic pass не выдаётся за успех подписочной серии.

Дальнейшая продуктовая проверка выполняется обычными инструментами в приложениях Codex и ZCode. Ремонт headless-обвязки не блокирует эти сценарии.

ZCode SDK/OAuth отложен по указанию владельца. Для запуска в самом ZCode подготовлены отдельные worktree, ветка `codex/zcode-product-pass` и задание (`../../../../.scratch/codex-zcode-acceptance/ZCODE_HANDOFF.md`; private development record; excluded from public source); запуск пока не подтверждён.
