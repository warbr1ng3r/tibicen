# Прямой source-check — 26.10.2026

Новая SKILL-01 пара завершилась observed launch/setup/task pass у Tibicen и baseline; все шесть независимых механических grades прошли. Восемь executor-сессий, judge и human review этой когорты — 0; evaluated сохраняет missing-quality-review. [Точные статусы и hashes](summary.json).

| Вариант  | Setup, с | Task, с | Executor |
| -------- | -------: | ------: | -------: |
| Tibicen  |  118.650 |  36.010 |        4 |
| Baseline |   65.964 |  33.600 |        4 |

Один repeat, порядок T → B, лимиты launch/setup/task 45/180/120 секунд. Codex CLI 0.157.0 / gpt-6-sol / существующая подписка; платный API-маршрут и fallback не использовались. Цена неизвестна. Отдельный снимок 156 файлов: HEAD bdd889d9f4f626daec1bf10057fa1003d2e2a252, dirty, tree hash a8abc6571d6f6f7df192be2ade3062c0ca66ac348b91d6ed3ab5321714d923b6. После серии все bytes/modes снимка повторно сверены.

## Что изменилось в наблюдённом пути

Агент выполнил source-check через CLI. Первый ввод с URL вместо owner/repo получил invalid-source, второй — provenance-verified с MIT и точным SHA. Чтения большого transport mirror и прямого импорта validateSources больше нет. Остались четыре диагностических чтения scripts в proposal (6638 байт) и одно смешанное чтение references/scripts при apply (4029 байт). Поэтому путь не объявляется полностью свободным от исследования реализации.

| Tibicen run                                                         | Terminal events | File changes | Tool output, UTF-8 байт |
| ------------------------------------------------------------------- | --------------: | -----------: | ----------------------: |
| [Предыдущий canonical-plan](../2026-10-26-canonical-plan/README.md) |              72 |            1 |                  402231 |
| Новый source-check                                                  |              42 |            1 |                  134397 |

Proposal компилировался по одному разу в каждом run. Подсчёт выполнен одинаково по завершённым command_execution/file_change событиям четырёх сессий, объём — сумма aggregated_output после обезличивания путей. Это инструментальный вывод, а не уникальный контекст или стоимость. Длительности одной пары и различие двух снимков не доказывают устойчивого ускорения. Подробное наблюдение (`../../../../.scratch/codex-zcode-acceptance/source-check-observation.md`; private development record; excluded from public source).

## Проверки и границы

Два run прошли validateRun; оба session-индекса связаны с run hashes, восемь файлов сессий совпали с SHA-256. Conditions/experiment hashes совпали с frozen. Runtime probe verified: auth denial, resourcesReadable и runtimeWriteDenied. Механические setup/task-инварианты и task exports имеют pass. Полная смысловая/человеческая приёмка, PROC и остальная матрица остаются открытыми; предыдущие model-оценки не перенесены.

Код перед серией прошёл pnpm test: 566/566 Node tests, lint/format/types/site/strict specs; оба standalone skills проверены вне checkout. Независимое code review не обнаружило P1/P2. Оно не заменяет quality judge новой когорты. Private evidence: codex-source-check-20261026-MrXrND, без публикации traces и личных путей.
