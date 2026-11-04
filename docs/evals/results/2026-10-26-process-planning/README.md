# PROC с явным planning-контрактом — 26.10.2026

Обе попытки завершились на setup с `error: native-execution-failed`; task не запускался. У Tibicen setup-apply превысил срок, у baseline сохранено сообщение `Selected model is at capacity`. **Новый planning gate 5.6 в этой живой паре не достигнут.** [Точные статусы, длительности и хэши](summary.json).

| Вариант  | Observed launch | Observed setup | Observed task | Launch, с | Setup, с | Executor-сессии |
| -------- | --------------- | -------------- | ------------- | --------: | -------: | --------------: |
| Tibicen  | pass            | error          | skip          |     1.390 |  178.636 |               2 |
| Baseline | pass            | error          | skip          |     1.397 |   51.878 |               1 |

Длительности округлены до тысячной секунды; JSON сохраняет исходные миллисекунды. Время task не измерялось: стадия не выполнялась. Это один повтор с порядком T → B и заранее закреплёнными лимитами launch/setup/task 45/180/360 секунд.

## Наблюдённые отказы

Tibicen setup-proposal завершился exit 0 с одним `turn.completed`. В этой сессии измерены 220 865 input и 4 378 output tokens. После согласования началась setup-apply, но её итог — `timedOut: true`, `exitCode: null`, без `turn.completed`. Полный setup usage неизвестен из-за незавершённой apply; известные counters proposal не подменяют итог стадии. Причина незавершения apply здесь не установлена; данных для вывода о дефекте planning 5.6 нет.

У baseline одна setup-proposal сессия завершилась exit 1, `timedOut: false`, с `error` и `turn.failed`, содержащими сообщение о capacity выбранной модели. Launch pass означает наблюдённый старт, а не успешное завершение setup. Usage этой неуспешной сессии неизвестен. Модель не подменялась; повторной executor-сессии и fallback не было.

У Tibicen зарегистрирован один setup approval; полные start/end snapshots содержат соответственно 7 и 13 файлов. У baseline approval нет, start/end содержат те же 7 файлов. У обоих исходные `src/math.js` и `tests/math.test.js` сохранили bytes/modes. Оба setup-invariants имеют **unverified**, reason `native-reviewed-effects-preserved`: это не подтверждённый pass завершённой настройки. `invariantFailures` пуст; этот факт не отменяет двух setup error.

Ни одной task-сессии, task approval или `native-process-planning-preview` нет. Проверки обязательных planning artifacts, reviewed skip design, prospective apply readiness, graph completeness и полный процесс specification → plan → implementation → verification этой парой не подтверждены.

Trace-only диагноз setup (`../../../../.scratch/codex-zcode-acceptance/proc-planning-setup-diagnosis.md`; private development record; excluded from public source) отдельно подтвердил canonical apply с complete receipt и пятью approved changes в stdout и end snapshot. Структурный verify завершился успешно; outer `node --test` среди девяти apply-команд отсутствует, а host receipt-check и финальный `turn.completed` не состоялись. Это частичные наблюдения, которые не повышают setup до pass. Следующее исправление готовой apply invocation относится к более позднему runtime; устранение timeout/capacity этим отчётом не доказано.

## Бюджет и приёмка

Выделен отдельный бюджет: **3 из 16 executor**, **0 из 0 judge**, новых startup-запросов — 0, human reviews — 0. [Предыдущий PROC-цикл](../2026-10-26-process-inspection/README.md) с расходом 20/32 executor и 2/2 judge сохранён отдельно; его результаты и оценки не пересчитывались и не переносились.

У обоих `quality: null`. Evaluated setup сохраняет `error: native-execution-failed`, evaluated task — `skip: evaluated-setup-not-passed`; observed task имеет `skip: setup-not-passed`. Collector обработал 2 attempts / 3 sessions / 1 cohort и подготовил связанные packets без вызовов judge. Их наличие не считается независимой оценкой. Полная смысловая/человеческая приёмка и задача 3.6 остаются открытыми.

Codex CLI 0.157.0 / gpt-6-sol, существующая подписка, `paid: false`; платный API-маршрут и fallback не использовались. Подтверждённый preflight переиспользован. Стоимость неизвестна (`null`); неизвестные counters не превращены в нули. Длительности этих ошибочных попыток не доказывают сравнительную скорость, устойчивость или преимущество продукта.

## Источник и целостность

Новый frozen source содержит 157 файлов: HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252`, `dirty: true`, tree hash `4d89f8a85137ef9590736a102e55319c7bfcc324230700bbeef99e26286ed190`. Root сохранил подтверждение совпадения всех bytes/modes после серии. OpenSpec 1.14.3 и source mirror закреплены; runtime probe имеет `verified: true`, доступные ресурсы, запрет чтения контрольного файла и `runtimeWriteDenied: true`.

Сверены frozen conditions/experiment/scenario/profile hashes, оба run hash, raw evidence, три session SHA-256 и соответствующие receipts, а также collector usage и packet/linked-run bindings. Все 73 assertion hashes совпали; исходные observed/evaluated статусы и unverified grades сохранены. При подготовке этой проекции runtime не менялся; последующие исправления не оцениваются данной парой. Исторические reports сохранены.

Private evidence: `codex-proc-planning-20261026-l4SPIu`. Публичная проекция не содержит полных traces, содержимого ответов, авторизационных данных и личных путей.
