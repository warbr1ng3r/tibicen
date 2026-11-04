# Повторный контроль — 26.10.2026

Baseline впервые в этой контрольной карте полностью прошёл установку Ponytail и следующую задачу; у Tibicen сохранился конкретный транспортный отказ. [Структурные поля](summary.json), дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source).

| Вариант | Launch | Setup | Task | Executor-сессии |
|---|---|---|---|---:|
| Tibicen | pass | error: native-proposal-rejected | skip | 1 |
| Baseline | pass | pass | pass | 4 |

Codex CLI 0.157.0 / gpt-6-sol через существующую подписку. Fresh preflight подтвердил чтение и completion, auth/fs/process-tree boundary; новый frozen tree hash `c0c5a55e8dfef38bf5ab0de3f17fab0346772a6a64c91a7ab5f0fef19a9300a9` включает незакоммиченный стенд. Исходный HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252` не заменяет этот снимок. Порядок T → B, один повтор, первая пара skill-01 с cap8, launch/setup/task 45/180/120 секунд. PREF/PROC не расширялись.

## Причина и исправление

Агент усвоил предыдущие уточнения: вернул compiled envelope и внешнюю node --test. Но при копировании служебного JSON изменил поле diff, сохранив прежний digest. Проверка обоснованно отклонила объект. В исходном CLI envelope был и второй блокер: kernel.commands содержал node --test, тогда как стенд требует согласовывать её отдельно во внешнем commands.

Read-only replay неизменённого compiled envelope с пустыми kernel.commands и внешней node --test прошёл все root/source/ownership/service/receipt guards. Дефект создания исходных байтов скилла не воспроизведён.

Исправление передачи готового плана (`../../../../.scratch/codex-zcode-acceptance/issues/11-use-observed-compiled-plan.md`; private development record; excluded from public source) позволяет явно сослаться на наблюдённый compiled stdout текущей proposal-сессии по digest. Host не компилирует intent и не исправляет объект; после отдельного approval предоставляет точный временный read-only plan-файл штатному apply. Файл удаляется до следующей сессии, включая ошибку; нарушение cleanup отменяет очередь. Legacy JSON и строгие проверки сохранены. Это изменение внесено после данной когорты и требует отдельного live-результата.

## Независимая оценка

Две отдельные подписочные judge-сессии получили только blinded packet.request и завершились без инструментов. Для baseline все шесть model-критериев pass: grounding/fit/sufficiency/consistency и наблюдаемые loading/application. Для Tibicen setup-критерии pass, task loading/application unverified: задача не выполнялась. Модельная оценка не повышает исходный setup error.

У обоих humanRequired:true, человеческих оценок0; evaluated pass не заявлен. Все ответы связаны с packet/run hashes, исходные traces/index и обогащённые collector данные сохранены в `.evals-private/codex-zcode-cycle2-20261026-kG3bMh/`. Cost неизвестна, токены не пересчитаны в деньги. Платного API, fallback, коммитов и публикации не было.

## ZCode параллельно

Исследование (`../../../../.scratch/codex-zcode-acceptance/zcode-isolation-route.md`; private development record; excluded from public source) проверило существующий OS sandbox на synthetic canary. Установленная CLI не предоставляет полного exec/filesystem boundary, hooks не покрывают все инструменты. Конкретный дальнейший путь — отдельный pinned bootstrap-host с проверенными портами и выключенными обходными исполнителями. Это не готовый native-ZCode; модельных запросов0.
