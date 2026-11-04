# Tasks

## Current policy — 3 November 2026

Apply the adopted [release evidence policy](../separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md) through the separate [engineering assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md). Tasks 3.6 and 4.1–4.2 retain mandatory technical observations and independent functional-quality review. Human calibration, live human cross-checks and the human-calibrated comparative-study portion are **DEFERRED** voluntary postpublication work, not completed or required before technical release acceptance. Checked task 2.4 records the rubric/protocol and recorded controls, not a completed human trial. Old evaluated outcomes, failures and missing reviews stay unchanged; the 24/24 freeze grants no new execution budget.

## Historical checkpoints — through 26 October 2026

Статус: **21/28**. Исправления 5.1–5.8 приняты offline; текущий gate **594/594**, build/unpacked checks и независимое review прошли. [Новая gpt-6-astra пара](../../../docs/evals/results/2026-10-26-process-ready/README.md) дала T setup/specification pass, затем T plan/B setup HTTP429; 6 executor/1 startup/0 judge. [Разбор без моделей](../../../docs/evals/results/2026-10-26-rate-limit-diagnosis/README.md) установил current account permission, но не точный исторический лимит. 5.8 добавляет безопасные timing/error observations будущих сессий, не меняя старые результаты. [Новый подписочный пакет](../../../docs/evals/results/2026-10-26-subscription-environments/README.md) дал Codex SKILL pass и рабочий ZCode tools-disabled кодовый путь; новый PROC выявил нераскрытые разрешённые чтения fresh apply. Исправление 5.9 отложено по уточнению владельца: optional downstream OpenSpec не блокирует самостоятельный Tibicen handoff/report. Runtime 5.9 не менялся. Полная 3.6, adopt/update, human review и релиз открыты.

[Предыдущая PROC-когорта](../../../docs/evals/results/2026-10-26-process-inspection/README.md) сохраняет T observed workflow pass и 7/7 model criteria на прежнем снимке; B ERROR ограничен неявным design-контрактом. Контракты/67 фикстур, офлайн-стенд, Codex preflight/первые пары и review fixes 5.1–5.7 проверены. ZCode 3.4 закрыт конкретным blocked CLI 0.16.9; рабочий native-профиль не заявлен.

[Новая canonical-plan когорта](../../../docs/evals/results/2026-10-26-canonical-plan/README.md): SKILL-01 и PREF-01 обеих сторон имеют observed launch/setup/task pass и независимые инварианты, всего 16 executor-сессий. Quality judge: 0, human: 0 для этих когорт; evaluated сохраняет missing-quality-review. Ранее [cycle2](../../../docs/evals/results/2026-10-26-subscription-control-cycle2/README.md) сохранил пять executor и две model-оценки; они не переносятся на новые прогоны. Исторические ошибки не пересчитаны. Полная 3.6, оставшиеся PROC-сценарии, остальные native/API-профили и релизная матрица остаются открытыми. [Свидетельства](verification.md), очередь — docs/DEVELOPMENT_PLAN.md.

Дополнительный продуктовый [source-check контроль](../../../docs/evals/results/2026-10-26-source-check/README.md) завершён на отдельном снимке: ещё восемь executor, обе стороны SKILL-01 observed pass, quality/human 0. Сам продуктовый change закрыт 4/4 и полный gate — 566/566; это не закрывает полную 3.6 стенда.

## 1. Contracts and fixtures

- [x] 1.1 Определить версионированные форматы эксперимента/сценария/события и интерфейсы профиля/оценщика; добавить документацию и офлайн-тесты неизвестных схем/полей и связи с неизменённой schema 1 результата.
- [x] 1.2 Подготовить две первые фикстуры — приложение без инфраструктуры и конфликтующие инструкции; проверить одинаковые входы вариантов, правила согласования, допустимые изменения и недоступность готового решения/скрытых проверок исполнителю.
- [x] 1.3 Дополнить матрицу сценариями А–Е, уточнениями дополнения (включая §9/PREF-01–08 из docs/evals/PREFERENCE_SELECTION.md и все четыре контекста PREF-08), ML-инфраструктурой и двумя tools; у каждого сценария проверить независимый ожидаемый результат и явно требуемый уровень изоляции, без заранее правильного бренда.
- [x] 1.4 Подготовить конкретные фикстуры SKILL-01–04/PROC-01–04 из docs/evals/COMPONENT_INTEGRATION.md: зафиксировать канонический источник/SHA/лицензию/ресурсы первого дополнительного скилла (кандидат Ponytail, Caveman отдельно) и проверенную версию/эффекты OpenSpec; разделить запросы, staged-согласия, допустимые изменения setup/task и скрытые критерии загрузки/применения/процесса, проверить одинаковый доступ baseline к источникам.

## 2. Offline harness and graders

- [x] 2.1 Реализовать runner на подставных процессах; тестами подтвердить наблюдаемый старт, pass/fail/error/skip, битый вывод, отказ авторизации, таймаут до/после старта и остановку дерева потомков.
- [x] 2.2 Реализовать сохранение разрешённых наблюдений и связь с попытками; синтетическим секретом проверить отсутствие значений в argv/артефактах/контексте и недоступность авторизации проектному коду, описать ограничения.
- [x] 2.3 Добавить механические оценщики инвариантов setup и результата task, точных источников/ресурсов, сохранности обновления и артефактов процесса; известные хорошие/плохие примеры, включая ложный успех, только метаданные, пропущенный ресурс и запись до согласия, должны давать ожидаемые вердикты с основаниями.
- [x] 2.4 Зафиксировать рубрику независимого судьи и процедуру выборочной человеческой сверки; откалибровать на противоречивых/достаточных результатах и SKILL/PROC, включая навязанную миграцию и неподходящий выбор ради готового адаптера; отдельно оценить пригодность, наблюдение загрузки, применение правил и соблюдение стадий вместо самоотчёта, сохранить расхождения до вызовов моделей.
- [x] 2.5 Собрать парный отчёт поверх `evaluation-results`; офлайн-примерами проверить разделение когорт/стадий, повторы, числители/знаменатели, ошибки до/после старта и неизвестные время/расход.
- [x] 2.6 Добавить явный вход внешних испытаний и его документацию; проверить, что `pnpm test` не вызывает модели, а сборка обоих скиллов исключает стенд и сценарные материалы.

## 3. Observed agent profiles

Код продолжения 3.6: общий SKILL/PREF/PROC runner и отдельные каталоги первой тройки профилей; Codex имеет native-драйвер, Claude/ZCode — discovery/blocked-профили. Офлайн-проверки протокола не закрывают 3.3/3.4/3.6: нужны фактический preflight/серии и независимая оценка. Подробности — в `docs/evals/NATIVE_RUNS.md` и verification.

- [x] 3.1 Подтвердить preflight Codex: конкретные CLI/модель, существующий подписочный вход, контролируемый startup, права, синтетическую проверку авторизации и наблюдаемую загрузку; сохранить свидетельство либо конкретный блокирующий пробел.
- [x] 3.2 После приёмки ядра и стенда зафиксировать бюджет/повторы/порядок и провести два первых парных сценария Codex с задачей в новой сессии; отчёт должен содержать все четыре сценарных прогона и отдельные исходы обеих стадий, без требования заранее успешного результата.
- [ ] 3.3 Подготовить и проверить внешний профиль Claude Code через API-ключ без обязательной подписки: зафиксировать провайдера/модель/денежный бюджет, реализовать и проверить ограничение расхода и изоляцию ключа до реальной авторизации; затем выполнить доступные сопоставимые прогоны либо зафиксировать отказ preflight, не меняя встроенный продуктовый Claude-адаптер.
- [x] 3.4 Проверить конкретную CLI-сборку и маршрут входа ZCode; выполнить доступные сопоставимые прогоны либо зафиксировать отказ с причиной, не объявляя новый продуктовый адаптер.
- [ ] 3.5 Описать опциональный профиль DeepSeek API и проверить выключение по умолчанию; без отдельного включения/бюджета подтвердить отсутствие вызовов, при включении применять те же preflight и правила отчёта.
- [ ] 3.6 Complete the required candidate-bound SKILL-01–04/PROC-01–04 technical assessment after core/adapter mechanical readiness (3.3 and offline 3.4 of extend-infrastructure-contracts). Audit existing observations first; require positive installation/loading/use of a concrete additional skill and OpenSpec init/adopt/working cycles in fresh sessions, retain every refusal/gap and link the core's agent acceptance. Any missing mandatory observation remains open and needs its own finite execution authorization. **DEFERRED:** the human-calibrated paired-study portion retains its frozen comparison/calibration/human-review protocol and is not completed by engineering acceptance.

- [ ] 3.7 Обобщить выбор авторизации независимо от native-профиля: API-ключ как основной планируемый маршрут Codex/Claude Code/ZCode, существующая подписка как альтернатива для экономии; раздельные провайдер/модель/auth/права и frozen cohorts, подтверждённые бюджеты и отсутствие платного fallback. Проверить доступность каждого маршрута; реальные платные прогоны выполняются только с отдельно заданным бюджетом, иначе сохраняется явный пробел покрытия.

## 4. Integrated acceptance

- [ ] 4.1 Independently review the engineering release assessment against L0 strict, L1 hard invariants and functional quality. Record criterion, candidate/source/payload/version binding, observation, reviewer context, conclusion and limits. Preserve candidate attempt rules: a hard violation cannot be cancelled by a retry; soft criteria allow at most two attempts in total, separate from study repetitions and product repair cycles. Missing human calibration/pilot is disclosed, not fabricated or made a technical prerequisite.
- [ ] 4.2 Retain the matrix of actually observed scenarios/profiles/versions, including PREF-01–08, the no-questions branch, all four PREF-08 contexts and SKILL-01–04/PROC-01–04. Bind component sources/SHAs and distinct fit/loading/application/process grounds to the candidate and mark insufficient/missing mandatory evidence explicitly. Keep impact analysis separate from actual candidate execution, preserve historical experimental grades and failures, and leave human-calibrated studies **DEFERRED**. Do not turn assumptions, two diagnostic cases, public research or test counts into full technical acceptance or measured benefit.

## 5. Review fixes

- [x] 5.1 Закрыть регрессию preflight: null/undefined и другие non-Error исключения дают записанный launch error без запуска процесса; сохранить прежние результаты таймаута и отмены.
- [x] 5.2 Исправить воспроизведённые дефекты ревью: отделить проверенные события/хранение/реестр секретов от изменяемых объектов, связать оценки с точными наблюдениями и запросом, сохранить доказанный инвариантный fail при неполном снимке и отклонить exit 0 до выполнения скрытых assertions; добавить регрессии и обновить свидетельства.

- [x] 5.3 По наблюдениям короткой серии 26.10.2026 раскрыть обязательные команды проверки в native-протоколе и проверять их до approval/apply; пояснить полный compiled kernelPlan, сохранить отказ raw intent и отсутствие автоматического согласия. Проверить отказ до записи/второй сессии, отдельные PROC-фазы и прежний успешный fake workflow.

- [x] 5.4 По повторной серии разрешать явную ссылку на проверенный compiled stdout текущей proposal-сессии вместо перепечатывания JSON; после approval передавать canonical plan-файл без проектной записи, сохранив legacy JSON, строгие guards и раздельные kernel/outer commands. Проверить missing/tampered/failed references, exact edits, запрещённые kernel commands, отсутствие файла до согласия и полный fake apply/receipt.

- [x] 5.5 По первой PROC-паре исправить классификацию только подтверждённых read-only help/templates aliases pinned OpenSpec и прежних bounded inspection recipes; actual validate, node tests и new требуют отдельного согласия. Сохранить exact argv, frozen allowlist, verified CLI, snapshot/phase guards; positive/negative fake controls и полный pnpm test/review должны подтвердить отсутствие обхода.

- [x] 5.6 По аудиту PROC раскрыть required planning artifacts отдельно от allowed paths и проверить окончательное предложение до approval; PROC-01 допускает явный reviewed skip design, PROC-02 сохраняет прямо запрошенный design. Подтвердить prospective native apply-ready закреплённым CLI в отдельной копии и отдельно зафиксировать graph completeness, сохранив consent/snapshot/phase guards и исторические исходы. Проверить complete и no-design пути, missing/empty/deleted required artifacts, отсутствие skip reason, PROC-02 без design и CLI not-ready/invalid/timeout; выполнить полный pnpm test и независимое review.

- [x] 5.7 По setup timeout передавать после approval точную shell-quoted invocation установленного tibicen apply с проверенными root/plan/digest и явный полный список согласованных outer commands. Сохранить agent execution, receipt/exact effects и cleanup; fake controls должны проверять invocation/checks и прежние success/failure paths. Выполнить полный pnpm test и независимое review, без новых live/judge и обещания устранить model capacity.

- [x] 5.8 По разбору 429 сохранять UTC start/end и monotonic duration каждой новой native CLI-сессии; для Codex выделять только подтверждённые безопасные error hints с источниками из terminal records и bounded stderr, не сохраняя raw stderr/headers/error messages/identity/prompts; terminal errors новых сессий проецировать в type/detailHash. Generic429 не получает выдуманной причины/retry count, неизвестные поля остаются null. Проверить structured/generic/secret-bearing ошибки, timing, legacy collector/receipts и прежние consent/outcomes; выполнить полный offline gate и независимое review, без новых моделей.

- [ ] 5.9 По новой PROC-паре явно раскрывать точные разрешённые OpenSpec inspection argv из frozen policy в каждой proposal/apply-сессии, включая instructions apply для текущего change. Не расширять allowlist или согласие на effect/check commands; сохранить verified CLI/exact argv/phase/receipt/effects guards. Проверить fake fresh-apply regression, неизвестные/extra argv/unverified CLI и прежние запреты исполнения до approval; полный offline gate, build/unpacked и независимое review, без новых моделей.

## Workflow follow-up

Ревью незакоммиченного продолжения 3.6: исправления сохранности серии/инвариантов, UTF-8, буквальных команд, выбранных оснований, расхода после отказа и ссылок поставки покрыты регрессиями; см. `review-native-acceptance.md`. Эта историческая запись не добавляла живых серий и закрытых пунктов; текущий итог указан в начале файла.

- После реализации и проверок синхронизировать дельту и архивировать change с фактическими свидетельствами; готовность planning artifacts сама по себе этого не разрешает.
