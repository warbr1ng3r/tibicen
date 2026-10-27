# Controlled Codex diagnostics

Текущее production исполнение временно blocked до проверенного process-tree backend; сохранённый ready.json его не включает. Перед использованием команд ниже см. [текущие границы native runner](NATIVE_RUNS.md). Исторические diagnostic результаты не пересчитываются.


Реализация задач 3.1–3.2: [preflight](../../scripts/evals/codex-preflight.ts) и явный [host-драйвер](../../scripts/evals/codex-diagnostic.ts) для двух первых diagnostic-сценариев. Обычные import/help/test не запускают модели. Подтверждение относится к macOS arm64, конкретному CLI/model/маршруту и сохранённым условиям; hostile-серия и другие ОС им не разрешаются.

Текущая реализация Codex находится в [profiles/codex](../../scripts/evals/profiles/codex/profile.ts); прежние пути совместимы. Сценарии, staged consent и отчёт вынесены в [общий runner первой тройки](NATIVE_RUNS.md). Ниже описаны условия диагностик 3.1–3.2; новые SKILL/PREF/PROC используют собственные frozen conditions и не изменяют исторические свидетельства.

## Historical preflight

```sh
node scripts/evals/codex-preflight.ts /new/private/probe.json
node scripts/evals/codex-preflight.ts /new/private/observed.json --observe-startup gpt-6-sol
```

Сейчас оба вызова возвращают blocked с modelRequests=0 до CLI/auth/model. В сохранённых исторических пробах первый использовал синтетическую авторизацию и native `codex sandbox`; второй добавлял один ограниченный startup-запрос модели через существующий ChatGPT-вход. Остальное описание раздела фиксирует тот протокол. JavaScript не читает реальные значения credentials: отдельный CODEX_HOME получает временную ссылку на существующий auth.json, которую использует только родительский CLI. Командам проекта закрыты и ссылка, и исходный каталог. После проверки отдельный scope удаляется. API key, новая авторизация и установка в личную среду не нужны.

Проверяются чтение синтетической авторизации из команды и потомка, запрет внешней записи, разрешённые проектные/skill-записи и остановка потомка до отложенной записи. Изолированный startup использует пустой HOME, `--ignore-user-config`, `--ignore-rules`, `--ephemeral`, отдельную модель, отсутствие наследуемых credential env, login-shell, hooks/plugins/apps/browser/multi-agent и командной сети. Публичные runtime-пути Node/OpenSSL разрешены явно; личные каталоги и host-материалы закрыты. Это контролируемый командный профиль; права других поверхностей не предполагаются. Параметры проверены по установленной справке и официальным [permissions](https://learn.chatgpt.com/docs/permissions), [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode), [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).

Loading означает успешное наблюдаемое shell-чтение полного содержимого конкретного AGENTS.md, совпавшего с host-хэшем, и завершённый turn. Ответ «использовал» без такого tool-события не проходит. До этого/при ошибке сохраняется blocked с причиной. Несовпадение модели с доступным подписочным каталогом не обходится API-ключом: проверяется `model/list`, новая модель фиксируется отдельным профилем, старый отказ сохраняется.

## Historical frozen paired series

Host явно вызывает `runCodexDiagnostics({preflightPath, artifactDirectory, sourceSha, experimentId})` из выбранного локального `.mjs` через [eval:external](EXTERNAL_RUNS.md). Требуются ready preflight и совпавший бинарный hash; directory/report должны быть новыми.

До первого запроса записывается `frozen.json`: SHA ядра, 80 файлов дистрибутива/суммы, хэши исполняемого стенда, preflight/profile/conditions, два сценария, один повтор и порядок bare Tibicen → bare baseline → conflicts baseline → conflicts Tibicen. На когорту разрешены максимум 16 модельных сессий, launch 45 s, setup 180 s, task 120 s; API-платёжный маршрут выключен. Наблюдённые расходы без достоверных данных остаются null. Startup/служебные пробы учитываются отдельно.

У пары одинаковые начальные байты и последовательное пересоздание одного канонического project root. Разница варианта — оба проверенных распространяемых Tibicen skills в отдельном read-only tool scope. Baseline имеет обычные возможности Codex при тех же ограничениях. Пакет OpenSpec, developer OpenSpec skills и стенд исполнителю не открываются.

Setup/task сначала предлагают изменения в read-only режиме. Host проверяет точные пути/байты/команду и выдаёт согласие только на их digest. Для штатного ядра дополнительно проверяется полный kernelPlan: те же edits, root, digest, отсутствие установок/MCP/process/исполнения и ограниченный служебный intent manifest/state/счётчика отдельного HOME. Этот intent записывается до apply отдельным связанным host assertion; динамические служебные квитанции проверяются по schema/реальным changes/status/state. Обычные пользовательские файлы не получают исключений. Это native-проверка доверенного закреплённого ядра; произвольный installer этим путём не согласуется.

Task стартует после механически состоявшегося setup, с новым HOME/CODEX_HOME и новой ephemeral сессией, без истории setup. У него собственные план и согласие. Независимый Node checker работает в отдельной защищённой копии со скрытыми случаями double/triple и контролем завершения assertions. Executor их не получает. Снимки, фактические command/loading events и причины сохраняются; timeout/error/skip не удаляются. Сигналы отмены останавливают активные группы и запрещают следующие запросы.

Независимая команда ограничена оставшимся временем стадии. Ошибка запуска/завершение сигналом не дают pass. Неполный снимок дерева сохраняется как неполный, останавливает проверки проекта и оставляет попытку в отчёте; уже видимое несогласованное изменение остаётся fail. Preflight обрабатывает отмену теми же правилами остановки группы и удаления временного scope.

Этот драйвер предназначен для controlled diagnostics, не атакующего arbitrary-shell тестирования. Проверка итоговых файлов не доказывает отсутствие всех возможных промежуточных действий внутри одной сложной shell-команды. Наблюдаемые command events распознают только поддержанную буквальную `node --test`; текст команды внутри heredoc/JSON не считается её исполнением. Расширение поддержанного синтаксиса требует отдельной проверки.

Для сохранённых первых версий [collect-native.ts](../../scripts/evals/collect-native.ts) без моделей добавляет доступный cumulative usage из native turn.completed. [native-usage.ts](../../scripts/evals/native-usage.ts) требует полных counters, сохраняет денежный null, перепривязывает seq/evidence и при явно указанном хэше старого драйвера восстанавливает task startup по host boundaries. Raw data не заменяются; исходники реально исполненного стенда и отдельные enriched проекции сохранены в результатах (локальная запись сопровождающего; не входит в публичный снимок).

Collector сверяет digest frozen conditions и id каждой попытки с её слотом. У успешной стадии нужны оба transcript — proposal и apply; для неуспешной apply ожидается после наблюдаемого согласия. Потеря ожидаемого файла делает полный token-итог неизвестным, без подстановки известной части.

## Assessment

Сохраняются отдельные observed/evaluated результаты существующего парного отчёта. Native-механика проверяет read-only, точный diff/область, служебную квитанцию и независимую задачу. Смысловые пригодность/достаточность/применение остаются за независимым судьёй и человеческой выборкой. Без них quality отсутствует и observed pass не становится evaluated pass.

Первая диагностическая когорта выявила два дефекта host-профиля: совпадение `node --test` в данных предложения и недостаточное разрешение проектной `.agents` после согласия. Её четыре записи сохранены; отказы не приписываются продукту. Исправленная когорта имеет новый experiment/conditions/harness hash и новые исходы. Старые записи не заменяются и не смешиваются в одной дроби. Это проверка стенда, не статистическое доказательство пользы и не релизный гейт SKILL/PREF/PROC.

[Тесты native protocol/review](../../tests/evals/codex-diagnostic.test.ts) остаются офлайн и не используют реальные credentials или CLI моделей. Фактические результаты и ограничения ведутся в [verification](../../openspec/changes/build-agent-evaluation-harness/verification.md).
