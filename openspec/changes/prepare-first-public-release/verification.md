# Verification

## Local candidate and existing CI — 27.10.2026

После ponytail-review/fixes создан source commit `3fb29efb1087a616aeb69a3b22f400972bfb8a3e`. Общий gate667/667, build и 86 сумм passed. Обе распакованные CLI вне checkout с пустым PATH вернули self-test passed/version0.1.0. Eval/dev resources, внешний OpenSpec CLI и сгенерированные development skills отсутствуют; собственные `scripts/process/index.ts` и `references/process-openspec.md` присутствуют в обеих поставках с проверенными суммами.

Офлайн-CI уже находится в `.github/workflows/ci.yml`: SHA-pinned Actions, pnpm11.21.0, contents:read, persist-credentials:false, test/build/unpacked checks без model secrets или live eval. Команды прошли локально. Git remote отсутствует; первый Ubuntu/GitHub Actions run не заявляется выполненным. Прежняя формулировка design «CI нет» исправлена по фактическому коду.

Локальная поставка заморожена в maintainer-local record; omitted from public source: version0.1.0, source SHA, 86files, SHA256SUMS hash `6ecd6b77d28e7adf3e9921b20078c80b2091a0109c8b5b6bfabaa9a201b4de23`, log hash и unpacked proofs в candidate.json. Это ограниченный local alpha candidate, не публичный релиз. Новых тегов, remote/model/auth/API вызовов или публикаций нет.

Задачи 2.1/2.2 приняты локально; прогресс3/14. Публичная доставка, update/remove установленной версии, приёмка заявленных L1/SKILL/PROC/PREF, human review, начальный пилот, контакты и release draft остаются открытыми. Исторические результаты ниже сохранены с их исходной датой и областью.

Дата: 22.10.2026. Проверка планирования, не подготовленный релиз.

## Initial planning

Подготовлены proposal, design, дельты `release-process` / `verification-and-delivery` и 14 задач реализации/приёмки. Основания — оба продуктовых документа и очереди 4–5 объединённого плана. Работа обработчиков остаётся в change ядра; будущие расширения не добавлены в гейт MVP.

- `pnpm spec:check`: строгая валидация 9 активных items и 5 архивов прошла.
- Локальные ссылки и якоря изменённых Markdown-документов проверены; задачи этого change остаются открытыми, 0/14.
- Planning artifacts готовы; change не завершён, дельты не синхронизированы и не архивированы.

Код версии/сборки не менялся. CI, публичный маршрут, приёмка обновления/удаления, контакты/каналы, пилот и кандидат остаются невыполненными. Релиз, remote, выкладка и автоматическое расписание не создавались. Проверки runtime/браузеров не повторялись для изменения только документации.

## Scope revision — first process release gate

Первый ограниченный OpenSpec теперь явно включён в ближайший выпуск. Proposal/design, оба delta specs и tasks согласованы с обязательной программой SKILL/PROC: кандидат требует положительной установки/загрузки/применения дополнительного скилла и init/adopt/рабочего цикла OpenSpec, связанных с проверенными байтами поставки. Отказ от небезопасного источника сохраняется как корректный отказ, но не закрывает положительный критерий. Остальные адаптеры и будущие расширения не перенесены в гейт.

Проверено: pnpm spec:check (10 активных items и 5 архивов), локальные ссылки/якоря и git diff --check. Прогресс остаётся 0/14: приёмка компонентов, кандидат и выпуск не выполнены. Код, CI, модели, установка компонентов и публикация не запускались; дельты не синхронизированы и не архивированы.

## Single product version — 25.10.2026

По приоритету владельца «сначала архитектура и технические долги» выполнена только задача 1.1. VERSION читает собственный package.json относительно модуля; сборка переносит корневую версию в оба самостоятельных скилла. SCHEMA_VERSION и MANIFEST_SCHEMA не менялись. Тест CLI через симлинк сравнивает версию с package.json, без второго литерала.

Новый регрессионный тест задаёт копии исходников версию `0.2.0-rc.7`, собирает два скилла в отдельное место и удаляет checkout. С пустым PATH, отдельным HOME и cwd другого проекта каждый CLI возвращает новую версию, проходит self-test и записывает её в паспорт, сохраняя schema 1 CLI и schema 2 паспорта. Применение выполняется только во временной тестовой папке.

Проверено на Node 24.15.0 / pnpm 11.21.0:

- `node --test tests/skills/build.test.ts tests/core/cli.test.ts`: 11/11.
- `pnpm test`: lint, format, typecheck, site build, строгие specs и 508/508 Node-тестов; Node-стадия 31,54 с.
- После удаления литерала из прежнего CLI-теста: `node --test tests/core/cli.test.ts`, 2/2; повторная сборка прошла.
- `pnpm build`: оба самостоятельных дерева, все 80 записей SHA256SUMS проверены по фактическим байтам.
- Self-test обоих dist CLI из `/tmp` с пустым PATH: passed.

Браузерный baseline до правки runtime: `pnpm test:site`, 59 passed / 1 ожидаемый skip. Лендинг правкой не затронут. Вариация длительности Node-стадии не объявляется ускорением продукта.

Прогресс 1/14. CI, публичный маршрут, обновление/удаление, пилот и кандидат не выполнены; новые native/платные прогоны не запускались. Change не синхронизирован и не архивирован, коммиты и публикация не создавались.

## Contribution materials — 27.10.2026

Release tasks1.2–1.3: добавлены CONTRIBUTING, CHANGELOG (Unreleased, публичного релиза нет), CODE_OF_CONDUCT, issue/PR templates и docs/RELEASING.md; README/SECURITY связаны с ними. Проверены patch/minor/prerelease примеры, реальные scripts/pnpm11.21, относительные ссылки и отсутствие release/tag job в единственном CI workflow. Working security/conduct контакты/owner/ответственный остаются явными незаполненными входами до публикации; task3.2 открыта. Автоматизации релиза, bump/tag/commit/publish нет.

Проверки: git diff --check; ссылки шести документов и наличие документированных scripts; все86 frozen candidate hashes неизменны; pnpm spec:check —19 active+6 archived pass. Полный667 gate не повторялся: изменена только документация/шаблоны, продуктовые байты прежние.

## Installed candidate lifecycle and delivery — 27.10.2026

На неизменном source3fb29ef/0.1.0 выполнены [8 ограниченных L1 случаев](../../../docs/evals/results/2026-10-27-candidate-lifecycle/README.md) и [локальная доставка](../../../docs/evals/results/2026-10-27-candidate-delivery/README.md). Root независимо пересверил 24 файла L1 и 6 внешних delivery-файлов, историю resume и удаление каталогов. 86 файлов поставки совпали при установке/повторе/reinstall; 8 CLI-команд прошли без Git вне checkout. Подробные ограничения каждого прогона сохранены.

Task2.5 принята для проверенного macOS/Codex user-scope: remove удаляет оба каталога скиллов вместе с добавленными внутрь файлами, сохраняет внешние проектные файлы/пресеты/настройки; остаются пустые parent directories и lock. README предупреждает о замене локальных правок при повторном add --copy и требует сначала сохранить их вне installation. Backup проверен, отдельное восстановление не проверялось. Public Git/Ubuntu и переход между двумя разными версиями с resume не подтверждены:2.3/2.4 открыты.

Документы tasks1.2–1.3 получили независимый ponytail-review: Ship, конкретных ошибок не найдено. Уточнение владельца отделяет деплой статического лендинга от выпуска скиллов; полный release checklist не блокирует страницу.

Проверка перехода версий может использовать два зафиксированных кандидата; два уже публичных релиза не требуются для первого выпуска. Это уточнение описания непройденной проверки, без изменения результатов.

## Installed components and fresh app contexts — 27.10.2026

[Положительные наблюдения кандидата](../../../docs/evals/results/2026-10-27-candidate-components/README.md): pinned Ponytail/SKILL+LICENSE установлен через CLI, явно прочитан и применён отдельным app subagent (2/2 теста). Optional OpenSpec1.14.3 init/adopt complete, затем один новый app subagent на adopt-копии выполнил planning→review→implementation→checks (5/5, strict validation, 3/3 native tasks). Root независимо сверил область изменений, защищённые файлы и по12 функциональных утверждений на каждый task. Источники/SHA/версии и все первоначальные отклонённые планы сохранены; template/keep-double/localinstructions не изменены.

Это отдельные наблюдения в новых контекстах текущего Codex app; версия app не измерена, native startup/discovery и human sample не проверены. Отдельный init downstream и все update/negative варианты не выполнены; builtin setup reports не переписаны внешними успехами. Tasks4.1 и extend3.4 открыты. Общий продуктовый код и86 файлов frozen candidate неизменны; новых SDK/API/auth/modelCLI/commit/tag/публикаций нет.

## Published limited alpha — 27 October 2026

Group5 is complete5/5. [Public evidence](../../../docs/evals/results/2026-10-27-alpha-release/README.md) binds source e0f59a5, distribution/tag db03ebc,668/668 clean local checks, independent review, actual SHA/tag installations and downloaded assets. Ubuntu main CI40437643480 and Pages40438226284 passed. The old local0.1.0→alpha transition preserved session history and completed the same session; unknown schemas refused without writes and removal preserved16 external files.

Groups1–4 remain6/14: full component coverage, native loading/human/pilot and support ownership/contact requirements are not closed by alpha publication. No model/API acceptance is inferred from offline CI.
