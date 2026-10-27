# Verification

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

Актуально на 26.10.2026: реализация — 13/13, включая три исправления review; 585/585 тестов, build и распакованная поставка прошли. [Отчёт review](review.md). Историческая приёмка 25.10.2026 — 10/10, все четыре пакета выполнены. Карта 11/11 закрыта; оставшиеся внешние/живые обязательства перечислены ниже. Одноисточниковая версия выполнена отдельно в prepare-first-public-release 1.1; её результаты не засчитываются здесь повторно.

## Initial planning

Основания, воспроизведение ложного успеха и фактический baseline — в анализе. Трекер содержит отдельные файлы 11 тикетов, зависимости пакетов и права на файлы. Цель «сначала упростить архитектуру и закрыть технические долги» выбрана владельцем в живом ответе 25.10.2026.

С текущими плановыми материалами прошёл `pnpm test`: lint/format/typecheck/site build/strict specs и 508 Node-тестов. Это не исправление дефекта состава и не выполнение задач рефакторинга. Браузерный baseline — 59 passed / 1 ожидаемый skip. Ошибка состава остаётся открытой в первом тикете.

Перед передачей проверяются относительные ссылки, отсутствие циклов/несуществующих blockers, соответствие тикетов пакетам и итоговая строгая валидация. Удалённый CI, native/платные прогоны, публикация, изменение пользовательской инфраструктуры и коммиты этим проходом не выполняются.

## Recorded infrastructure — 25.10.2026

Задача 1.1. До исправления два интеграционных теста воспроизводили `passed` вместо `issues-found`: отдельная CLI-проверка после удаления применённого скилла и пустой improve после исчезновения installed-ресурса. Оба падали менее чем за 0,2 с.

`scripts/verify/scope.ts` строит единый состав из паспорта, истории применённых операций, компонентных решений и текущих подтверждённых записей. Скан добавляет ранее неизвестные пути, не подменяя зарегистрированный baseline фактическими хэшами. Последняя применённая операция каждого пути имеет приоритет; неподтверждённый pending write не становится доказательством применения. CLI, runtime и резервная проверка apply используют одну процедуру. В apply добавлен только текущий component plan; схемы, recovery и журнал команд не менялись.

Отсутствие и локальное расхождение компонента получают `missing`/`drift` вместо ложного unchanged; прежняя принадлежность остаётся в истории, отсутствующий файл не объявляется установленным. Пустой improve возвращает incomplete, повторный resume не забывает дефект. Автоматического восстановления или изменения локальных байтов/прав нет.

Сохранены действующие контракты общих правил и процесса: допустимые owner edits вне общего блока/эквивалентные окончания строк не сравниваются с устаревшим хэшем всего файла; процессные ресурсы сверяются по принятому process plan. Точные текущие записи продолжают проверяться полностью. У schema 1 без installed hash не выдумывается прежний локальный baseline; явная миграция фиксирует фактические байты и сохраняет unverified provenance.

Проверено на Node 24.15.0 / pnpm 11.21.0:

- Новый `tests/verify/registered-scope.test.ts`: 10/10 — read-only verify, отсутствие отдельной истории changes у installed-компонента, повторный пустой resume, сохранение локальных байтов/прав и drift, прямой apply без hooks, add/modify/delete/re-add по нескольким сессиям, новое согласованное содержимое, отсутствие паспорта, прерывание до/после записи и последующий resume.
- Связанный набор core/components, shared-rules, process и verify/forward: 82/82 до добавления двух последних регрессий; итоговый полный набор включает все десять.
- `pnpm test`: lint, format, typecheck, site build, strict specs и 518/518 Node-тестов; Node-стадия 28,22 с. Разницу времени с исходным запуском не считаем доказанным ускорением.
- `pnpm build`: два самостоятельных скилла; все 82 записи SHA256SUMS проверены по фактическим байтам.
- Обе скопированные поставки из отдельных временных папок, вне checkout, с отдельным HOME и пустым PATH прошли self-test и CLI-цепочку: первоначальное применение → внешнее удаление скилла → verify с exit 1/missing-file → пустой improve с incomplete → новое согласованное восстановление через resume → согласованное удаление → verify passed.

Браузерные сценарии и живые/native/платные агенты для этой правки не запускались. Локальная Node-приёмка не закрывает интеграцию всего change, удалённый CI, релиз или пилот. Прогресс 1/10; delta не синхронизирована, change не архивирован, коммиты не создавались.

## Development feedback and status — 25.10.2026

Задачи 1.2–1.3. В package.json добавлены независимые `typecheck:core`, `test:core`, `test:evals`, `test:site:unit`. Строки полного `test` и браузерного `test:site` сохранены; полный typecheck по-прежнему включает root tsc и Astro. Команды описаны в обоих README. 24 core, 12 evals и четыре site-файла без пересечений покрывают прежние 40 Node-файлов.

Измерения одного последовательного локального запуска, macOS / Node 24.15.0 / pnpm 11.21.0, зависимости и браузеры уже установлены:

| Команда | Время | Результат |
|---|---|---|
| `pnpm test` до изменения scripts | 44,34 с | 518/518 |
| `pnpm typecheck:core` | 1,53 с | passed |
| `pnpm test:core` | 23,24 с | 246/246 |
| `pnpm test:evals` | 27,48 с | 259/259 |
| `pnpm test:site:unit` | 2,64 с | build + 13/13 |
| `pnpm test:site` | 19,69 с | 59 passed / 1 ожидаемый skip |
| `pnpm test` после изменения scripts | 45,45 с | все стадии + 518/518 |

Для первых трёх коротких команд сравнены mtime/size всех файлов landing/dist: сборки сайта нет. Суммарное время отдельных команд не равно полному gate, где Node выполняет файлы вместе. Эти timings показывают стоимость выбора области, не доказывают ускорение runtime или устойчивый процент ускорения.

Субагент изменил только roadmap: актуальные состояния и ближайший шаг сведены наверху, повторы удалены, П0–П10 отделены как историческая программа, критерии не названы выполнением. Проверены 43 локальные ссылки/якоря, Prettier и whitespace diff; требования и гейты живой/релизной приёмки сохранены. Пакет 1 принят; дальше пакет 2 внутренних модулей и офлайн-CI.

## Internal modules and offline CI — 25.10.2026

Задачи 2.1–2.4 выполнены параллельно тремя субагентами и интегратором после приёмки пакета 1.

- `core/finalize.ts` объединяет статус/активную попытку, историю паспорта, pending write/recovery, usage/cleanup и итоговый ответ. Apply сохраняет согласие, проверки, atomic write и журнал команд. Исходный attempt передан явно, чтобы afterChange не сменил активную попытку. 56/56 recovery/adversarial/integration, включая ошибки before/after-manifest-write и before-state-cleanup, подтверждают прежний baseline и одну запись usage/ID после resume.
- `evals/process-supervisor.ts` — общий lifecycle для native runner/Codex preflight/probe: группы процессов, сигналы/отмена, deadlines, ограниченные stdout/stderr и cleanup. Env/auth/JSON остаются у потребителей. Переполнение защёлкивает отказ и при exit 0, с регрессией для валидного JSON-префикса. 80/80 focused тестов и typecheck/lint/format прошли.
- Матрица разделена на шесть существующих групп и shared.ts; loader/binding и внешний контракт сохранены. Сравнение до/после: 67 IDs/порядок, private JSON 1 428 701 B, executor projection 1 226 044 B, bytes/SHA256 всех 18 source files совпали. Private JSON SHA256 `795de0211e5ca86f8f1fa65b2009b900cf0ba48f0d7636e181ff09ac17c36025`. 117 matrix/fixtures/native-workflow и 34 native-usage/results/report теста прошли; восемь исторических запусков обеих диагностических frozen-серий прочитаны текущими validators. Исторические результаты не менялись. Supervisor и все семь файлов matrix включены в harness fingerprint.
- `.github/workflows/ci.yml` использует pinned Node/pnpm, frozen lockfile, полный gate/build и точный unpack/checksums/self-test shell. Только contents:read, persist-credentials:false, без model secrets/live evals и Linux browser assertions. Проверены YAML/триггеры/permissions/полные SHA/версии и bash syntax всех run-шагов. Actions/input сверены с официальными [checkout action.yml](https://github.com/actions/checkout/blob/3d3c42e5aac5ba805825da76410c181273ba90b1/action.yml), [setup-node action.yml](https://github.com/actions/setup-node/blob/949feb2413d6458794dcd2491c4babbbce0c15c1/action.yml), [pnpm action.yml](https://github.com/pnpm/action-setup/blob/ea17c68df8912ef543352723c149a84f56e3d413/action.yml). [CI-инструкция](../../../docs/CI.md) различает локальные свидетельства и удалённый запуск.

Интеграция, то же локальное окружение Node 24.15.0 / pnpm 11.21.0:

| Команда | Время | Результат |
|---|---|---|
| `pnpm install --frozen-lockfile` | 0,46 с | lockfile unchanged |
| `pnpm test` | 44,16 с | lint/format/typecheck/site/spec + 530/530 |
| `pnpm build` | 7,15 с | два скилла, 84 файла |
| Точный smoke shell из CI YAML | 0,46 с | 84/84 суммы, оба self-test вне checkout с пустым PATH |

Дополнительный portable-тест обеих скопированных CLI повторил read-only missing-file (exit 1), пустой improve и повторный resume с incomplete (exit 1), новое согласованное восстановление через resume и согласованное удаление. Приложение сохранено, .git не создан, manifest schema 2/version 0.1.0 сохранены. В первом запуске тестовый скрипт ошибочно ожидал exit 0 от incomplete; исправлено ожидание скрипта, продукт не менялся, повтор прошёл для обеих копий.

Удалённый GitHub Actions ещё не запускался: remote отсутствует. Релизная задача 2.1 поэтому остаётся открытой. Браузеры после пакета 2 отдельно не перезапускались; окончательная приёмка включает их. Модели и credentials не использовались; Windows process-group поведение не заявлено подтверждённым. Пакет 2 принят, дальше пакет 3.

## Diagnostic entry and linked evidence — 25.10.2026

Задачи 3.1–3.2 выполнены двумя субагентами в непересекающихся областях. Требования и сценарии существующих задач закреплены в delta: явные режимы/бюджет/blocked, резервирование output до исполнения, наблюдаемые связи и ограничения evidence. Продуктовый объём не расширен.

`native-evidence.ts` отбирает фактические команды, точные чтения источников, промежуточные сообщения и реальные ответы пользователя; `native-checks.ts` содержит прежние независимые math/OpenSpec проверки. Native runner сохраняет согласие/argv/auth/env/permissions. Новые файлы входят в harness fingerprint. Optional criterion/provenance/truncation metadata валидируются; loading связывает path/content hash/tool call/session и событие той же стадии. Judge/human не цитируют новый excerpt другого критерия; legacy packets без metadata остаются допустимы. Полный trace/oracle не принимаются, секреты проверяются до усечения, лимиты 4000/200 сохранены, omitted text/items обозначаются явно. Повторные наблюдения не теряются из журнала, дедуплицируются только отрывки.

Проверки: 131/131 focused, 31,79 с; 11/11 unit повторно после последнего уточнения JSON-сообщений. Синтетические partial/failed/compound reads не выдают loading, сохранённый обезличенный source read связан с наблюдением, исторический source_read_unobserved остаётся unverified. Независимый math check ловит неверный triple при зелёных проектных тестах; OpenSpec сохраняет literal argv/deadline/timeout. Рубрика, verdict/cohort и исторические файлы не менялись. [Контракт судьи](../../../docs/evals/QUALITY_AND_REPORTS.md).

`eval:diagnostic` использует новый entry/driver и встроенный hash-pinned fake. По умолчанию help/dry-run не запускают процессы; offline сохраняет calibration, native требует явно выбранного существующего Codex subscription-контракта и совместимого saved preflight. Отсутствующие/неподдержанные условия дают отдельный diagnostic blocked с нулём запросов, без fallback или подделки ready native-профиля. Каталог резервируется до config/import/driver; error — exit1, сохранённый blocked — exit0, native progress остаётся JSONL. Config/preflight paths, credentials и сырые ошибки не отражаются.

16/16 entry/external тестов, включая 9 новых, прошли; fake native сверяет фактические frozen repeats/maxModelSessions/limits/model/auth с запросом и использует пустые HOME/CODEX_HOME. Scoped tsc/lint/format/diff и 14 ссылок прошли. Интегратор выполнил `pnpm eval:diagnostic --help`, default dry-run, два offline (одинаковые диагностические conditions/calibration, modelRequests:0), no-overwrite с exit1/сохранением старых байтов и API-запрос с blocked/нулём запросов. Воспроизводимый локальный пример: `.evals-private/refactor-entry-sl6aai_6/`; это игнорируемая офлайн-калибровка, не native-приёмка. [Параметры и команды](../../../docs/evals/EXTERNAL_RUNS.md).

Независимый read-only review финализации пакета 2 не нашёл дефектов: active attempt, persist/pendingManifest/write/usage/cleanup и success/catch сохранены. Общий gate и автономная поставка всех пакетов принимаются следующей задачей 4.1. Модели/credentials/платные вызовы не использовались.

## Integrated acceptance — 25.10.2026

Задача 4.1 выполнена после остановки всех агентских правок и интеграционного чтения стыков. Те же macOS / Node 24.15.0 / pnpm 11.21.0, установленные зависимости и браузеры:

| Команда | Elapsed | Результат |
|---|---|---|
| `pnpm test` | 48,45 с | lint/format/root+Astro typecheck/site/strict specs + 550/550 Node |
| `pnpm test:site` | 21,22 с | Chromium/Firefox/WebKit: 59 passed / 1 ожидаемый skip |
| `pnpm build` | 7,72 с | две самостоятельные поставки, 84 файла |
| Точный unpack/sums/self-test shell из CI | 0,51 с | 84/84 суммы и оба self-test вне checkout с пустым PATH |
| Portable CLI-регрессии обеих копий | 3,89 с | missing-file/empty-improve/repeat-resume/restore/delete, сохранённое приложение и отсутствие Git-истории |

Обе CLI version 0.1.0 / manifest schema 2 прошли read-only verify после внешней пропажи скилла (exit1/missing-file), пустой improve и повторный resume с incomplete (exit1), новое согласованное восстановление через resume и согласованное удаление с итоговым passed. Прежние app bytes сохранены, `.git` не создан. Core types и eval contracts не менялись; VERSION читает собственный package.json, enum/schema константы прежние. Критические recovery, consent, pending write и command journal покрыты полным gate и отдельным независимым review финализации.

Build-тесты проверяют отсутствие evals/tests/docs/OpenSpec/generated dev skills/site/node_modules/компилятора в обеих установках; тест с подменённой версией дополнительно удаляет исходный checkout перед CLI и сверяет собственную версию паспорта. Новых runtime dependencies нет. 67 случаев, их порядок, source bytes/hashes и private/public projection сохранены; optional selected-evidence metadata читаются обратно совместимо, рубрика/verdict/cohort не менялись.

Проверки по областям сохранены и покрывают весь текущий набор без пересечений; короткие core/evals/typecheck не собирают сайт. Timings пакета 1 и окончательного gate приведены с окружением и числом тестов. Общий набор вырос с 518 до 550, поэтому elapsed не трактуется как измеренное ускорение продукта. Выигрыш цикла — возможность выбрать область и одного владельца повторяющихся решений, без сокращения полного gate.

Карта закрыта, 11/11 тикетов, OpenSpec 10/10. Дальнейшие выделения apply, новые native-трения и удаление геометрий лендинга не требуются для принятого результата и возвращаются только по конкретным новым основаниям. Удалённый CI (remote отсутствует), Linux browser baselines, Windows process groups, API-профили, live SKILL/PREF/PROC и человеческая сверка, пилот и публикация остаются открытыми в roadmap/своих changes. Offline fake/calibration не выдаётся за native или релизную приёмку. Реальные credentials и модели не вызывались, коммиты/публикация не выполнялись. Delta не синхронизирована, change не архивирован: workflow follow-up не подменяет фактическое выполнение.

Финальная сверка документации: 175 относительных файловых ссылок разрешаются; все 11 тикетов имеют resolved/Assignee:none/Answer, OpenSpec apply сообщает all_done/10 из 10. Повторная строгая валидация всех активных и архивных specs и diff whitespace прошла после закрытия статусов. Снимок дашборда проверен на 736/320 px: выбор тикетов, light/dark, отсутствие overflow и JS ошибок.

## Uncommitted review — 26.10.2026

По прямому поручению владельца выполнено ponytail-review всех tracked и новых non-ignored файлов. Три подтверждённых P2 исправлены: pending mode-only больше не считается applied по одним байтам, повтор истории сохраняет позицию последнего события, явное принятие текущего полного owner content обновляет baseline. Подробные воспроизведения, fixes и ограничения — в [review](review.md); требования и задачи 5.1–5.3 сохранены в этом change.

До fixes пять из первых шести регрессий падали; после fixes все семь новых регрессий и весь registered-scope 17/17 прошли. Независимое повторное review ядра подтвердило fixes; native/evidence и matrix/profiles/quality проверены отдельно. Общий `pnpm test` завершился 585/585 без skip, включая lint/format/types/site build/strict active+archived specs. `pnpm build` создал 84 файла. Вне checkout проверены 84 суммы, обе standalone CLI с пустым PATH; принятие точного локального содержимого владельца завершилось standalone verify passed. Исходники после этих проверок не менялись.

Локальные журналы: `/tmp/tibicen-uncommitted-review-gate-20261026.log`, `/tmp/tibicen-uncommitted-review-build-20261026.log`, `/tmp/tibicen-uncommitted-review-smoke-20261026.json`. Новых моделей/credentials в review gate не было. Исторические 550 тестов и 59 browser pass / 1 ожидаемый skip относятся к прежней приёмке; браузеры повторно не запускались. Удалённый CI, человеческая и полная живая приёмка остаются открытыми. Локальный коммит прямо разрешён текущим поручением; публикация и изменение истории не входят в него.
