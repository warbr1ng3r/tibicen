# Первая PROC-пара — 26.10.2026

У Tibicen и baseline observed launch/setup прошли, а task завершился `fail: native-command-before-approval` после первой specification-proposal сессии. Полный процесс OpenSpec не выполнен. Израсходованы шесть executor-сессий; judge и human review этой когорты — 0. [Точные статусы, длительности и хэши](summary.json).

| Вариант  | Launch | Setup | Task | Launch, с | Setup, с | Task, с | Executor |
| -------- | ------ | ----- | ---- | --------: | -------: | ------: | -------: |
| Tibicen  | pass   | pass  | fail |     1.294 |   76.021 |  37.378 |        3 |
| Baseline | pass   | pass  | fail |     1.283 |   64.550 |  45.269 |        3 |

Время округлено до тысячной секунды; task здесь измеряет остановленную попытку, а не завершение процесса. Один повтор, порядок T → B. До запуска закреплены cap 16 executor и лимиты launch/setup/task 45/180/360 секунд: общий task deadline включает все процессные фазы. Это отдельный цикл после прежнего продолжения; его 29 executor и 2 judge в новые счётчики не включены. Два зарезервированных judge этой failed-когорте не вызывались и оставлены для отдельно замороженного исправленного контроля.

Codex CLI 0.157.0 / gpt-6-sol, существующая подписка; платный API-маршрут и fallback не использовались. Preflight переиспользован, новых startup-запросов — 0, стоимость неизвестна (`null`). OpenSpec — закреплённая версия 1.14.3.

## Причина остановки

Стенд отметил как команды до согласия несколько чтений справки и шаблонов OpenSpec. Наборы у двух вариантов различаются; в таблице приведены только формы, зарегистрированные как `command`, и их exit codes.

| Точная команда                                        | Tibicen | Baseline |
| ----------------------------------------------------- | ------: | -------: |
| `openspec help`                                       |       0 |        — |
| `openspec instructions --help`                        |       0 |        0 |
| `openspec templates --help`                           |       0 |        0 |
| `openspec templates --schema spec-driven --json`      |       0 |        0 |
| `openspec new change --help`                          |       0 |        — |
| `openspec instructions specs --schema spec-driven`    |       — |        1 |
| `openspec instructions proposal --schema spec-driven` |       — |        1 |

У Tibicen пять отмеченных форм завершились успешно. У baseline три совпадающие формы успешны, а два дополнительных запроса instructions без `--change` вернули `No changes found`: change ещё не создан. Эти ошибки CLI сохранены; они не означают создание change или выполнение реализации.

Диагностика классификатора (`../../../../.scratch/codex-zcode-acceptance/proc-control-diagnosis.md`; private development record; excluded from public source) проверила pinned исходники и восемь конкретных OpenSpec recipes из T trace отдельными CLI-пробами без моделей. Во всех восьми synthetic project/HOME/XDG/TMP snapshots остались неизменными; это конечные файловые снимки, а не полная трассировка системных вызовов или сети. Две дополнительные baseline aliases без `--change` этим набором проб не запускались. Результат диагностики обосновывает отдельное исправление стенда, но не превращает исходную PROC-пару в успешную.

В обоих task нет approval/apply: start/end checkpoint полны и содержат одинаковые пути, content hashes и modes — 13 файлов у Tibicen, 12 у baseline. Чтения установленных инструкций и шаблонов зарегистрированы, однако specification → plan → implementation → verification не завершён и независимого task-result нет.

## Сохранённые результаты и проверки

Оба исторических `task-invariants` остаются `fail: native-plan-mismatch` и присутствуют в `invariantFailures`. Совпадение файловых snapshots не отменяет зарегистрированный guard отказа на командах. Механические setup-инварианты имеют pass. Оценки после исправления runtime сюда не переносятся.

У обоих `quality: null`; evaluated setup — `error: missing-quality-review`, evaluated task — `skip: evaluated-setup-not-passed`. Фактический observed task fail сохранён отдельно. Collector подготовил связанные judge packets без вызовов моделей; их наличие не считается состоявшейся оценкой.

Проверены experiment/conditions/scenario/profile bindings, два run hash, шесть SHA-256 файлов сессий и соответствующие `native-session-*` assertions, связи raw evidence и collected packets. Все шесть модельных сессий имеют exit code 0, без timeout и с `turn.completed`; host task fail вызван последующей проверкой команд. Все 109 assertion hashes совпали, что не отменяет двух зарегистрированных invariant failures. Runtime probe сохранён как `verified: true`, с запретом чтения контрольного файла, доступными ресурсами и `runtimeWriteDenied: true`.

Исторический source snapshot: HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252`, `dirty: true`, 156 файлов, tree hash `a8abc6571d6f6f7df192be2ade3062c0ca66ac348b91d6ed3ab5321714d923b6`. Снимок зафиксирован `2026-10-25T23:06:22.845Z`; сохранённое подтверждение сверки всех bytes/modes после серии — `2026-10-25T23:14:02.218Z` (26 октября по Москве). Отчёт проверяет эти исторические записи и не сравнивает их с последующими изменениями runtime.

Private evidence: `codex-proc-control-20261026-JxZ9ie`. Публичная проекция исключает полные traces, содержимое ответов, авторизационные данные и личные пути. Один повтор не доказывает сравнительную скорость или качество продукта; полная смысловая и человеческая приёмка PROC остаётся открытой.
