# PROC после исправления inspection — 26.10.2026

Tibicen завершил наблюдённый полный цикл OpenSpec: specification → plan → отдельное ревью → implementation → verification. Baseline прошёл setup, затем остановился с `error: native-process-artifacts-missing`: в plan был создан только `tasks.md`, обязательного для этого контроля `design.md` нет. Новая пара использовала **14 executor-сессий и 2 независимые judge-сессии**; человеческих оценок — 0. [Точные статусы, длительности и свидетельства](summary.json).

| Вариант  | Observed launch | Observed setup | Observed task | Launch, с | Setup, с | Task, с | Executor |
| -------- | --------------- | -------------- | ------------- | --------: | -------: | ------: | -------: |
| Tibicen  | pass            | pass           | pass          |     1.270 |   95.358 | 157.728 |        8 |
| Baseline | pass            | pass           | error         |     1.210 |   60.496 |  93.440 |        6 |

Время округлено до тысячной секунды. Один повтор, порядок T → B, лимиты launch/setup/task — 45/180/360 секунд; task deadline общий для всех его фаз. Cap новой когорты — 16 executor. Вместе с [первой неуспешной PROC-парой](../2026-10-26-process-control/README.md) фактически израсходованы 20 executor из общего cap 32 и 2 judge из cap 2. Её прежние 6 executor, task failures и отсутствие judge сохранены отдельно без пересчёта.

## Подтверждённый цикл Tibicen

Все восемь сессий связаны с run hash и SHA-256 файлов: setup proposal/apply и по две сессии specification, plan, implementation. В новой task-сессии прочитан установленный `.agents/skills/tibicen-openspec/SKILL.md`: content hash `30f812216ba1d4124dbf7472df288f4a08c857f5138012aab351f66a8fc662dc`, raw event 72, session hash `677605e34150298313703aa6c614d1d96187729ba3ee52141a1661245d0c2c0e`. Проверены успешный read output, исходное содержимое и связь с очищенным excerpt; CLI path обезличен в selected evidence.

Согласования task имеют raw seq 97, 130 и 163. Первое разрешает только specification-файлы, второе — design/tasks; оба без разрешённых команд реализации. Specification подтверждена event 102, plan — 141; отдельное ревью planning зафиксировано event 142 до implementation consent. Перед каждым согласованием файловый snapshot совпал с предыдущим завершённым состоянием, а каждый согласованный набор изменений применён с точными after hashes.

После implementation consent реально выполнены `node --test` и `openspec validate add-triple --strict`: model command events 176/178, оба exit 0. Их точные command hashes присутствуют в consent 163. Это проверки после согласия, их не выдавали за metadata inspection. Независимые host-проверки экспортов и строгой валидации OpenSpec также завершились exit 0 — events 187/188. Setup/task invariants и task-result имеют pass; полный наблюдённый процесс этого Tibicen run подтверждён.

## Исход baseline и граница сравнения

У baseline шесть сессий: setup proposal/apply, specification proposal/apply, plan proposal/apply. Последний plan-proposal JSON и approval 105 содержат только `openspec/changes/add-triple/tasks.md`. Этот согласованный файл применён точно, но `design.md` отсутствует; host остановил фазу до отдельного planning review и implementation. `src/math.js` и `tests/math.test.js` сохранили исходные bytes/modes. Независимых task-проверок нет.

Сохранены observed task `error: native-process-artifacts-missing` и task-invariants `unverified: native-reviewed-effects-preserved`. Это не invariant fail: у новой когорты `invariantFailures` пуст. Наблюдатель не дописывал design и не запускал пропущенные стадии за baseline.

Отдельная проверка контракта planning (`../../../../.scratch/codex-zcode-acceptance/proc-planning-contract.md`; private development record; excluded from public source) установила: закреплённый OpenSpec 1.14.3 для точных planning/config байтов baseline без `design.md` возвращает `instructions apply.state = ready` и strict-valid, одновременно `status.isPlanningComplete = false`. Инструкция design условная, граф tasks требует design, а gate apply и strict validation проверяют другой набор условий. Девять отдельных CLI-проб не выполняли приложение, implementation или application tests. Поэтому ошибка baseline относительно обязательного design в этом frozen стенде не доказывает нативную невозможность продолжить и не даёт объективного преимущества Tibicen. Исторический ERROR сохраняется; наблюдённый полный цикл конкретного T run также сохраняет значение. Одна пара с разными исходами не устанавливает причинное преимущество, устойчивое ускорение или экономию.

## Независимые оценки и приёмка

Две реальные подписочные judge-сессии получили только текущие blinded `packet.request`, по одной попытке каждая, без истории исполнителя, host wrapper и скрытого oracle. Обе завершились без инструментов; cap 60 секунд на сессию, последовательно, без повторов. Ответы, reviews, packets, plan/ledger и collector-enriched run hashes сверены между собой. Старые оценки не переносились.

| Модельный критерий                                 | Tibicen | Baseline                                 |
| -------------------------------------------------- | ------- | ---------------------------------------- |
| Setup: grounding / fit / sufficiency / consistency | 4 pass  | 4 pass                                   |
| Task: application                                  | pass    | pass                                     |
| Task: loading                                      | pass    | pass                                     |
| Task: process                                      | pass    | fail: implementation-verification-absent |

Model application pass означает применение правил в наблюдённых действиях; он не означает завершение функциональной задачи. Поэтому baseline application pass не отменяет его observed task error и отсутствия implementation/verification.

У обоих `humanRequired: true`, human reviews — 0; итоговые quality grades остаются `unverified: human-review-required`. После model review evaluated setup у обоих — `error: independent-check-unverified`, evaluated task — `skip: evaluated-setup-not-passed`. Исходные observed результаты и их длительности сохранены. Полная смысловая/человеческая приёмка и OpenSpec-задача 3.6 остаются открытыми.

## Источник и целостность

Codex CLI 0.157.0 / gpt-6-sol, существующая подписка, `paid: false`; платный API-маршрут и fallback не использовались. Preflight переиспользован, новых startup-запросов — 0. Стоимость неизвестна (`null`). OpenSpec 1.14.3 и источники закреплены. Runtime probe имеет `verified: true`, доступные ресурсы, запрет чтения контрольного файла и `runtimeWriteDenied: true`; это конкретная canary-проверка среды.

Новый frozen source: HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252`, `dirty: true`, 156 файлов, tree hash `c463cf2cca28a7c9cde50a407d0e20c6d803c28aaa188116fdd3e44bce666c32`. Снимок зафиксирован `2026-10-25T23:23:14.533Z`; сохранённая сверка всех bytes/modes после executor-пары — `2026-10-25T23:31:19.056Z` (26 октября по Москве).

Проверены frozen/experiment/scenario/profile/run/evidence bindings, 14 session SHA-256 и receipts, 221 совпавший assertion hash, пять границ read-only proposal и пять наборов точных согласованных эффектов. Исходный report после judge-сессий не изменён; отчёт с модельными оценками хранится отдельно. Raw workflow seq и quality evidence seq относятся соответственно к исходному run и collector-enriched run; их хэши явно разделены в JSON.

Private evidence: `codex-proc-inspection-20261026-Wb40B7`. Публичная проекция не включает полные traces, содержимое ответов, авторизационные данные и личные пути. Текущий runtime не сравнивался с историческим снимком.
