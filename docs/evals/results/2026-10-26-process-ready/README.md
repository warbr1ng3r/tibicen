# PROC-01 на доступном профиле после review

Новая пара на `Codex 0.157.0 / gpt-6-astra / subscription` завершилась ограничением `429 Too Many Requests`. У Tibicen установка прошла и спецификация применена после согласия; планирование остановлено до предложения плана. Baseline остановился на первом предложении установки. Это частичное наблюдение, полная приёмка процесса не достигнута. [Машиночитаемая проекция](summary.json).

## Условия

Источник — коммит `6fd6cb535da478df28d1f603b86604e82848c41f` после ponytail-review и трёх fixes. Снимок содержит 157 файлов, tree hash `9f14291b28e75628f087821e6e6832f26f20237aad6ae16ff904195bd3cf238a`; dirty относится только к назначению тикета. Runtime bytes/modes совпадают с коммитом и сохранённым архивом до и после пары. Gate перед запуском: 585/585 тестов, build, 84 суммы и две распакованные CLI.

До запросов закреплены отдельная модель, existing ChatGPT subscription и cap: **1 startup, 16 executor, 0 judge**, один repeat PROC-01, Tibicen → baseline; launch/setup/task — **45/180/360 секунд**. API, paid fallback, смена модели внутри когорты и повтор пары исключены. Предыдущие результаты `gpt-6-sol` и их оценки не переносятся.

Новый preflight завершил startup, явное чтение инструкций и проверки auth/process boundaries. Само присутствие модели в catalog не подтверждает доступ: [official OpenAI documentation](https://developers.openai.com/siwc/token-sharing-open-source/codex-app-server) также различает catalog и завершённый inference. Runtime probe пары проверил доступность ресурсов, запрет чтения контрольного файла и записи runtime. OpenSpec 1.14.3/resources/integrity/lock и source mirror проверены заново без сетевого fallback.

## Фактический результат

| Вариант  | Setup                                 | Task                                  | Executor |
| -------- | ------------------------------------- | ------------------------------------- | -------: |
| Tibicen  | observed pass, 123,583 с              | error, 91,771 с: 429 на plan-proposal |        5 |
| Baseline | error, 2,027 с: 429 на setup-proposal | skip                                  |        1 |

У Tibicen наблюдены штатный apply/receipt с complete, пять согласованных infrastructure-изменений, manifest schema 2 и отсутствие pending session. Реальный executor `node --test` завершился exit 0; отдельная host-проверка Node тоже exit 0. Далее отдельно согласованы и применены три specification-файла. Приложение и тесты сохранены. Следующий model request вернул `exceeded retry limit, last status: 429 Too Many Requests`, exit 1, без timeout. Baseline получил тот же отказ до команд и approval.

Planning preview, plan application/review, readiness/graph completeness, выбор условного design skip, implementation и task verification не достигнуты. Считать их успешными по готовности setup нельзя. Установка имеет mechanical invariant pass, но evaluated setup остаётся error `missing-quality-review`: новых независимых смысловых или человеческих оценок нет.

Расход — **6/16 executor и 1/1 startup**, **0 judge/human**. Четыре executor-сессии завершены, две неуспешны; у последних usage остаётся null. Создание двух judge packets — обработка данных, модельных оценщиков оно не запускало. Автоматического повторения пары не было. Точный scope 429 — аккаунт, частота, отдельный запрос или маршрут — по этим traces не установлен; дефект продукта из этого ответа не следует.

## Целостность и следующий шаг

Проверены два raw run, шесть trace SHA-256 и шесть receipts, 48 совпавших assertions, 57 selected evidence records и две packet/linked-run bindings. Независимый reviewer восстановил collector report/usage/observations без расхождений; observed outcomes и unverified grades сохранены. Исторические отчёты не менялись. Private source id: `codex-proc-ready-20261026-x6uiuw`; полные traces, авторизация и личные пути в публичную проекцию не входят.

При review перед коммитом исправлены только два производных флага JSON: `setup.actualNodeTest` и `setup.hostNodeCheck` теперь true по setup events 25/32 с утверждённым command hash. Проекция содержит binding исправления; исходный raw run и его частичный результат не менялись.

Следующий тикет — Разобрать 429 без новых модельных вызовов (`../../../../.scratch/codex-zcode-acceptance/issues/25-diagnose-rate-limit.md`; private development record; excluded from public source). Новая серия требует проверенного основания для продолжения; adopt/update, вся OpenSpec 3.6, human/quality review и выпуск остаются открытыми.
