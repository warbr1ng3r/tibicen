# Native acceptance runner

Общий вход — [native.ts](../../scripts/evals/native.ts), протокол — [native-runner.ts](../../scripts/evals/native-runner.ts) и [native-workflow.ts](../../scripts/evals/native-workflow.ts). Первая очередь явно содержит `codex`, `claude-code`, `zcode`. Сценарии, согласование, бюджет, проверки и отчёт не зависят от формата вывода Codex.


Текущее состояние после пакета 25 (26.10.2026): production native routes возвращают `blocked / native-process-containment-unavailable` до CLI/auth/model. Старый cached ready не включает исполнение. Process group не удерживает detached descendants; полного проверенного backend пока нет. [Проверки и границы](../../openspec/changes/contain-evaluation-processes/verification.md). Исторические живые результаты ниже сохраняются как наблюдения прошлых редакций.

## Profiles

Целевой контракт отделяет native-профиль от способа авторизации: API-ключ — основной планируемый маршрут, уже имеющаяся подписка — альтернативный маршрут для экономии. Различаются фактические провайдер/модель/auth и когорты; подписочный pass не подтверждает API-доступ. Текущие серии не разрешают дополнительных расходов: платный маршрут не запускается без отдельно заданного бюджета. Реализация общего runner пока допускает только подписочные серии; обобщение и проверка маршрутов остаются открытой задачей 3.7.

Ближайший цикл использует имеющиеся подписки **Codex и ZCode**. Первый контрольный прогон готовится для Codex, параллельно задача 3.4 стенда готовит полноценный ZCode-профиль и проверяет применимость подписочного входа к конкретной CLI-сборке. Тип плана и модель ZCode пока не зафиксированы. Наличие подписки не переводит текущий discovery/blocked-профиль в ready. Claude Code через API остаётся следующим этапом после подготовки профиля и отдельного денежного бюджета; обобщение API-маршрутов в задаче 3.7 сохраняется.

| Профиль | Каталог | Реализовано | Остаётся подтвердить |
|---|---|---|---|
| Codex | [profiles/codex](../../scripts/evals/profiles/codex/profile.ts) | Production blocked; parser и offline fixture protocol проверены, исторические live preflight сохранены | Полный process-tree backend, новый preflight и живые SKILL/PREF/PROC/качество |
| Claude Code | [profiles/claude](../../scripts/evals/profiles/claude/preflight.ts) | Поиск CLI, `--version`/`--help` в пустом HOME, отказ непроверенного запуска | Startup через API-ключ, изоляция ключа, денежный бюджет, инструменты/парсер и живые серии |
| ZCode | [profiles/zcode](../../scripts/evals/profiles/zcode/preflight.ts) | Discovery CLI из PATH/desktop, desktop 3.14.4 / CLI 0.16.9; отдельный fake-проверенный stream-json parser, четыре blockedBy | Защищённый startup/auth/fs/process route, живые инструменты/loading и серии |

Discovery не выполняет login, prompt, установку или запрос модели. Отсутствующий CLI даёт `native-cli-unavailable`; найденный CLI остаётся `native-process-containment-unavailable`. Сам факт наличия CLI не даёт ready. Cached ready не заменяет проверенную текущую boundary; loader сохраняет blocked. Общий runner сохраняет оба слота blocked-пары без запуска Codex, чтения авторизации или загрузки ресурсов модели.

В историческом Codex route точная модель бралась из успешного preflight и связывалась с profile id/specification/argv; закреплённые CLI 0.157.0 и binary hash сохранялись. Этот протокол теперь доступен только явно названному code-only trusted fixture loader без auth links; production loader остаётся blocked. Значение по умолчанию само по себе не подтверждает доступ: 26.10.2026 `gpt-6.1-sol` получила `model_not_found` в текущем подписочном CLI-маршруте, а отдельная явная проба `gpt-6-sol` завершилась наблюдаемым чтением AGENTS.md и `turn.completed`. Это разные сохранённые пробы; модель не подменяется при загрузке профиля. Каталог `model/list` не заменяет успешный turn.

По умолчанию ZCode сначала ищется в PATH; на macOS также проверяются `/Applications/ZCode.app` и `~/Applications/ZCode.app`, entrypoint `Contents/Resources/glm/zcode.cjs`. Бандл вызывается через текущий Node массивом argv, без открытия GUI. Для version/help заданы пустые HOME/TMPDIR и отдельный ZCODE_DATA_BASE_DIR. Runtime и entrypoint имеют отдельные hashes; desktop version не подменяет версию встроенного CLI. Другой путь `.cjs` можно передать явно; явно заданный отсутствующий CLI не заменяется другой установкой. Фактическое discovery (локальная запись сопровождающего; не входит в публичный снимок) не является ready preflight.

Ready-профиль предоставляет общему runner только собственные команды запуска/проверок, права, пути skills, подготовку HOME и нормализованные сообщения, tool-команды, признак старта/завершения и usage. CLI-флаги и нативные записи разбираются внутри профиля. Старые `codex-diagnostic.ts`/`codex-preflight.ts` оставлены как совместимые входы; наблюдённые старые серии сохраняют архив исполненных исходников.

Claude Code поддерживает маршрут через API-ключ; обязательная подписка не является условием API-профиля. Конкретные провайдер, модель и денежный бюджет фиксируются до запросов; [Anthropic API — один из официальных вариантов](https://support.claude.com/en/articles/12304248-manage-api-key-environment-variables-in-claude-code). Это план подключения: текущий Claude-профиль остаётся discovery/blocked, а общий runner пока ограничен подписочными сериями с `maxCostUsd: null`. До платных запусков требуется реализация и проверка API-профиля, изоляции ключа и денежного лимита. Наличие или отсутствие подписки само по себе не подтверждает готовность API-маршрута.

Контроль 26.10.2026 (локальная запись сопровождающего; не входит в публичный снимок) сохранил первую SKILL-пару Codex с двумя setup error и blocked-пару ZCode. Исправления протокола внесены после серии; новый live pass не заявлен. Подробности ZCode — в исследовании установленной сборки (локальная запись сопровождающего; не входит в публичный снимок).

## Explicit invocation

Локальные полные run/transcript, source mirrors, judge packets и host-драйверы сохраняются вне репозитория либо в игнорируемом `.evals-private/`. Это соглашение о месте хранения: произвольный другой путь автоматически приватным не становится. `docs/evals/results/` содержит только отдельно отобранные и проверенные публичные проекции; личные auth/config и полные логи туда не копируются.

Доверенный host-модуль для [eval:external](EXTERNAL_RUNS.md) явно выбирает профиль, подготовленные id, неизменяемые условия и новые пути:

```js
import { runNativeAcceptance } from '/absolute/checkout/scripts/evals/native.ts';
export const run = () => runNativeAcceptance({
  profile: 'codex',
  preflightPath: '/new/private/ready.json',
  artifactDirectory: '/new/private/native-series',
  sourceSha: '<full-reviewed-source-sha>',
  experimentId: 'skill-proc-series-1',
  scenarioIds: ['skill-01', 'proc-01'],
  sourceMirrorPath: '/new/private/pinned-github-responses.json',
  repeats: 1,
  maxModelSessions: 24,
  limits: { launchMs: 45000, setupMs: 180000, taskMs: 240000, maxCostUsd: null },
});
```

Это пример параметров; текущий production route сохранит blocked без CLI/auth/model. Пример не разрешает новую серию и не заявляет достаточность бюджета. Число сессий включает уточнения и повтор предложения после поправки пользователя. Бюджет действует на всю когорту; исчерпание сохраняет оставшиеся попытки, не вызывает повтор или платный API. Задачи запускаются только после успешного setup, с новым HOME и новой сессией без его диалога.

Для discovery host явно вызывает `preflightZCode()` с автоматическим поиском либо `preflightZCode(binaryOrCjs)`, или `preflightClaude(binary)`, и сохраняет результат через `writeEvalArtifact`. Для источников отдельный модельно-независимый `captureNativeSources(filename)` получает реальные публичные GitHub-ответы и проверяет их продуктовыми `validateSources`/`fetchSourceFile`. Capture не заменяет метаданные репозитория синтетическими; ошибка возраста, происхождения, лицензии или хэша блокирует материал. Обычные тесты используют явно синтетический транспорт.

В сценариях с Ponytail оба варианта получают один проверенный mirror закреплённых ответов. Он доступен проектному Node через read-only preload, без реальной командной сети и без fallback для незаписанного URL/метода. Все выбранные SHA/байты повторно сверяются с фикстурами. OpenSpec 1.14.3 берётся из отдельно проверенного dev-пакета с полной сверкой ресурсов/integrity; native init/update и установка зависимостей приложения не запускаются автоматически.

Расширенные права на эти ресурсы требуют нового синтетического runtime probe перед модельными запросами. Если приватный synthetic файл читается или инструменты недоступны, все слоты получают `native-runtime-boundary-unverified`. Host-oracle и hidden assertions остаются вне executor scope. Это controlled-профиль; hostile initializer остаётся заблокирован.

## Consent and evidence

Setup и обычный task используют read-only предложение → точное согласие → apply. Ответ на уточнение выдаётся только после вопроса; PREF-03 требует нового предложения после поправки, отказ прекращает setup до согласия и записи. Достаточное состояние может пройти без apply-сессии. При полном kernelPlan host отдельно проверяет root/HOME, совпадение показанных файлов, pinned sources/ресурсы/лицензию, component ownership, процесс и служебный intent. После apply сверяются реальная квитанция, история, происхождение и файлы. Compat, встроенные проверки, MCP, установщики и дополнительные модели этим intent не разрешаются.

PROC task проходит три согласования: `specification` разрешает proposal/spec/metadata; `plan` — design/tasks; `implementation` — приложение/tests и отметки tasks. Разрешённые пути отделены от обязательного комплекта в `interaction.planning`, включённого в frozen fixturesHash и публичный протокол. PROC-01 требует непустые proposal/spec/tasks; условный design пропускается только с явным `skipDesignReason`. PROC-02-adopt/update прямо требуют design/tasks. Gate проверяет существующие файлы с точным overlay предложения до approval; отсутствие, пустое содержимое или удаление обязательного файла отклоняются до apply-сессии.

Перед plan approval host проверяет prospective planning в отдельной синтетической копии через fixed pinned `status` и `instructions apply`; это раскрытая read-only диагностика без исполнения приложения или code apply. State=ready и isPlanningComplete сохраняются отдельно вместе с plan/proposal hashes и skip reason; incomplete graph допустим только при рассмотренном условном пропуске design. Согласие planning не разрешает код. Перед реализацией выдаётся отдельная подготовленная review-реплика с контекстом проверенного комплекта. Host независимо запускает одобренные Node assertions и строгую OpenSpec validate в защищённой копии с оставшимся временем стадии. Исторические результаты не пересчитываются при обновлении требований.


Read-only команды `openspec --version`, `openspec --help`, `openspec validate --help`, `openspec version --help` и `openspec version --json` допускаются только для отдельно проверенного закреплённого CLI и с точным указанным argv. Для OpenSpec 1.14.3 `version --json` читает локальную версию/место установки; `version --check` в исключение не входит. Эти команды не запускают приложение и не дают согласия на проверки/изменения. Остальные команды сохраняют требования frozen allowlist и согласования.

Snapshot после каждой фазы проверяет точные эффекты. Загрузка засчитывается как факт только по tool-чтению конкретных байтов AGENTS/SKILL или отдельного шаблона OpenSpec, не по словам исполнителя. Ограничение: поддерживаются буквальные cat/sed/head и известные Node/OpenSpec recipes; итоговые снимки не доказывают отсутствие всех промежуточных действий внутри произвольной сложной команды. Это не hostile sandbox.

Битые JSON-значения и отсутствие собственного start-события сессии сохраняются как ошибки, не обрывая оставшиеся слоты. UTF-8 декодируется между чанками потока. Буквальные recipes требуют отдельных токенов через пробел/табуляцию: склеенные executable/аргумент и перевод строки не принимаются за согласованную команду. После ошибки apply снимок всё равно сверяется с последним согласованием; доказанное изменение защищённого файла остаётся invariant fail, а незавершённое согласованное изменение не превращается само по себе в нарушение безопасности.

Timeout исключает pass даже при exit 0 родительского процесса: потомки могут удерживать stdout до остановки группы. Это относится и к runtime probe, и к независимым проверкам; их незавершённый в срок результат не считается успешным.

До approval/apply host проверяет обязательные literal-команды непланирующей фазы; они заранее перечислены в протоколе, hidden assertions остаются закрытыми. Неполное предложение отклоняется без apply-сессии, команды не добавляются автоматически. Для kernelPlan предпочтительна ссылка `proposal-sha256:<digest>` на успешный compiled stdout текущей proposal-сессии; host сверяет её с envelope.digest и digest(proposal) без чтения файлов, исправления данных или компиляции intent. Полный JSON envelope по-прежнему допустим. В intent ядра commands=[], checks={}, compat.enabled=false; обязательные проверки согласуются только во внешнем commands. После approval агент получает точный read-only plan-файл и готовую shell-quoted invocation выбранного установленного CLI с root/plan/digest. Outer commands явно перечислены целиком; агент выполняет их и завершает сессию после согласованных эффектов/проверок. Host не применяет kernel автоматически; до следующей сессии plan-файл удаляется даже при ошибке, а сбой cleanup отменяет очередь. Runtime probe заранее подтверждает readable/write-denied/unchanged synthetic canary.

`frozen.json` связывает профиль, fixtures, планы качества, права/runtime probe, исходники стенда, источники и бюджет. Для каждой попытки сохраняются run, индекс всех proposal/apply-сессий с hash и выбранные основания качества, связанные с digest run. [collect-native.ts](../../scripts/evals/collect-native.ts) обогащает их без моделей: нормализованные counters суммируются по стадии, неизвестные/потерянные сессии сохраняют null, ссылки evidence перепривязываются к новым seq. Подмена trace/index/run отклоняется. Пакет судье и связанный run сохраняются отдельно; судья и обязательная человеческая выборка этим кодом не выполняются. Observed pass не превращается в evaluated pass.

Квитанции сессий внутри run дополнительно связывают состав индекса: удалить из него строку ради меньшего расхода нельзя. Отказ после предложения сохраняет setup=skip и уже наблюдённый расход предложения; не начавшийся task не получает выдуманных counters.

В judge packet одинаковое чтение одного содержимого внутри setup/task отбирается один раз; все исходные tool-события сохраняются в run. Это удерживает повторные чтения в лимите выбранных оснований, сохраняя раздельные факты новых редакций и свежей task-сессии. Наблюдённая стоимость предложения учитывается даже после отказа от setup; неизвестная стоимость не подменяется нулём.

Офлайн-контроли — [native-workflow.test.ts](../../tests/evals/native-workflow.test.ts). Они явно выбирают `runTrustedNativeFixtureAcceptance` / `runTrustedCodexFixtureDiagnostics`, а не параметр JSON или CLI. Эти code-only входы предназначены только для доверенных фикстур и не являются обходом production gate. Fake CLI проверяет протокол и реальные независимые Node/OpenSpec проверки; его synthetic boundary result не подтверждает изоляцию ОС или способность живой модели. Пункт 3.6 остаётся открытым до наблюдённой серии и оценки.

## Safe session diagnostics

Новые session traces содержат optional timing: UTC startedAt/endedAt и monotonic durationMs CLI-процесса; это не HTTP timestamps. Codex diagnostics сохраняет только подтверждённый scalar value/source: HTTP status, известный server code, числовой Retry-After и hash request id. Неизвестные поля и internalRetryCount — null. stderr ограничен 65536 и raw не сохраняется; terminal error/turn.failed новых сессий содержит только type/detailHash после извлечения hints. Прочие records/commands/usage прежние. Дополнительные поля входят в trace hash/receipt; старые traces/collector совместимы и не пересчитываются. Generic429 не доказывает исчерпание подписки и не разрешает повтор; разбор и пределы знания (локальная запись сопровождающего; не входит в публичный снимок).

Ограниченная eval-only `createNodeCheckContainment` проверяет macOS no-fork и Node child/worker/addon/execve denial, использует fixed argv и отвергает loader environment, включая inherited keys. OS policy запрещает сигналы к supervisor; denial проверяется до исполнения теста. Её filesystem policy задаёт caller; она не включает полноценный native CLI. Новая ZCode failure projection (локальная запись сопровождающего; не входит в публичный снимок) проверена через public SDK synthetic adapter; реальная причина прежнего provider failure остаётся неизвестной.
