# Verification

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

## Approved apply invocation 5.7 and bounded live control — 26.10.2026

Живая пара после 5.6 завершена на setup: Tibicen proposal pass, apply timeout в общем 180s budget; baseline explicit model capacity error. Task и новый planning gate не достигнуты. Фактически 3/16 executor, 0 judge/startup/human. Source 157 bytes/modes проверены post-run, точные исходники сохранены в private executed-source. Сверены 3 session hashes/receipts, 73 assertion hashes и оба collector bindings; setup invariants unverified, старые ошибки не пересчитаны.

Trace-only диагноз подтверждает observed canonical apply complete и совпадающие пять approved changes, структурный verify; outer node --test не наблюдается, host receipt-check и turn.completed отсутствуют. Из 180s на proposal ушло около 110.8s; в apply агент искал синтаксис по инструкциям и дошёл до git status. Причина незавершения turn не доказана; capacity baseline — отдельный отказ. Эти частичные факты не повышают setup до pass и не доказывают дефект 5.6.

5.7 передаёт после approval готовую shell-quoted invocation выбранного установленного CLI с точными root/plan/digest и явный полный список outer commands. Selected skill вычислен из trusted scenario.files, а не ответа модели. Исполняет агент, host не расширяет checks и сохраняет consent/exact effects/receipt/cleanup. Два изменённых runtime/test файла сопоставлены независимым ревьюером с private executed-source; P1/P2 нет. Fake success/failure controls проверяют literal invocation/checks, оба прошли; финальный pnpm test — **578/578**, 0 skip, lint/format/types/site build/strict active+archived specs прошли. Распространяемые скиллы не менялись; последний build — 84 файла.

5.7 отмечен по sourcePath/line CLI и повторно подтверждён: **20/26**. Новых live/model/judge после изменения нет, ускорение и устранение capacity не заявлены. Следующий пакет начинает с bounded startup доступной модели; полная 3.6, adopt/update и человеческая приёмка остаются открытыми.

## Explicit process planning 5.6 — 26.10.2026

Required specification/plan artifacts теперь заданы fixture policy отдельно от allowed phase paths и раскрыты до proposal. PROC-01 допускает только условный design с непустым skipDesignReason; PROC-02-adopt/update прямо требуют design/tasks. Gate учитывает существующие файлы и точный proposed overlay до approval; missing/blank/deleted required отклоняются до apply-сессии. Metadata .openspec.yaml не сделана обязательной.

Перед plan approval pinned status/instructions apply проверяют отдельную prospective копию с остатком task budget. Фиксируются apply.ready, isPlanningComplete, reason и plan/proposal hashes. Копия удаляется, проект остаётся неизменным; реализация и actual checks требуют следующего отдельного согласия. Native ready без graph completeness допускается только при явно рассмотренном optional design skip; это не механическая оценка смыслового качества reason.

Новые controls — 4/4: retained/missing/blank/deleted required, bounded skip только нужной фазы, PROC-02 без design, exact overlay/argv/cleanup, invalid/blocked/nonzero/timeout CLI и исчерпанный бюджет. Фокусные native controls — 7/7: прежний полный путь, запреты команд до согласия, positive skip PROC-01, отказ PROC-02, unexplained skip, missing tasks и полные adopt/update. Подставной агент не подтверждает живую приёмку. Полный pnpm test — **578/578**, без skips, lint/format/core+Astro types/site build/strict active+archived specs прошли. Сборка — оба скилла, 84 файла; независимое review относительно исходников начала пакета не нашло P1/P2.

Refreeze затронул только proc-01/proc-02-adopt/proc-02-update будущей матрицы; все 67 cases сохранены, старые run/report не изменены. Пункт 5.6 закрыт по sourcePath/line CLI, progress повторно подтверждён **19/25**. Новая bounded пара имеет собственный snapshot и cap 16 executor/0 judge; результаты дополнят отдельный отчёт. Полная 3.6, человеческая сверка и релизная приёмка открыты.

## Process inspection repair 5.5 — 26.10.2026

Первая PROC-пара: обе setup pass, обе task fail native-command-before-approval, шесть executor, judge/human — 0. Start/end task inventories совпали, подтверждены пять ошибочно классифицированных queries у каждого варианта с разными argv. Диагноз содержит восемь T и две baseline synthetic probes без записей. Исторические failures сохранены.

5.5 вводит один verified-CLI guard для 12 exact forms и прежних bounded list/status/instructions; actual validate/node/new требуют согласия. Physical readOnly, reviewedCommands, phase/snapshot guards, fixtures/oracle и distributed runtime не менялись. Доступные metadata-формы раскрываются из общей константы. Focused 12/12 + финальные 3/3, полный pnpm test 570/570 (lint/format/types/build/strict active+archived specs), build 84 files и независимое review без P1/P2.

Новая frozen когорта: codex-proc-inspection-2026-10-26, source tree `c463cf2cca28a7c9cde50a407d0e20c6d803c28aaa188116fdd3e44bce666c32`, HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252` dirty, 156 files. One repeat, cap 16 executor в общем cap 32 после первых шести, judge cap 2; launch/setup/task 45/180/360s. Existing subscription, paid:false. Preflight metadata переиспользуется после binary validation; runtime frozen, все 156 bytes/modes post-run совпали.

Tibicen: восемь executor, launch/setup/task и три mechanical grades pass; наблюдены specification → plan → отдельное planning review → implementation → Node/strict OpenSpec и независимые host checks. Проверка оснований. Baseline: шесть executor, setup pass, task ERROR native-process-artifacts-missing после exact approved tasks-only; implementation не началась, task invariants unverified, приложение сохранено. У новой когорты invariantFailures пуст; это не отменяет baseline ERROR.

Две новые независимые judge-сессии завершены без инструментов: T — 7/7 model pass; B — шесть pass и process fail из-за отсутствия implementation/verification. Точные packet/review/session bindings проверены, старые оценки не переносились. HumanRequired=true, human reviews — 0; evaluated setup обеих сторон остаётся independent-check-unverified, task — evaluated-setup-not-passed. Всего текущее PROC-продолжение использовало 20/32 executor (6+14) и 2/2 judge. Исходный report сохранён отдельно от report-with-model-judge.

Read-only аудит planning сверил 432 pinned OpenSpec 1.14.3 ресурса и выполнил девять CLI-проб без моделей/приложения. Точные baseline planning/config bytes без design дают native apply.ready и strict valid=true при isPlanningComplete=false. Обязательный design в PROC-01 был более сильным неявным требованием host, тогда как PROC-02 прямо просит design/tasks. Сравнение не доказывает превосходство Tibicen; исходный ERROR не пересчитан. Следующий пакет раскрывает обязательный состав и проверяет его до approval. Полная 3.6, adopt/update, человеческая сверка и релизная приёмка остаются открытыми.

## Latest product-path control — 26.10.2026

Source-check SKILL-пара выполнена отдельно от canonical-plan: обе стороны observed launch/setup/task pass, шесть механических grades pass, восемь executor, новых judge/human 0. На tree a8abc6571d6f6f7df192be2ade3062c0ca66ac348b91d6ed3ab5321714d923b6 агент использовал публичный source-check; terminal events в одном Tibicen run 72 → 42, tool output 402231 → 134397 байт. Остаточные чтения scripts и границы сравнения сохранены в отчёте. Продуктовый change [expose-pinned-source-validation](../expose-pinned-source-validation/verification.md) проверен 4/4; общий gate 566/566. Полная 3.6 и смысловая/человеческая приёмка открыты.

## Latest observed SKILL and PREF controls — 26.10.2026

На tree hash `f74094db9246f807810f2dfd2e5bebd83658257589b185cb36acc99cf4c43d06` (HEAD `bdd889d9f4f626daec1bf10057fa1003d2e2a252`, dirty) отдельно заморожены SKILL-01 и PREF-01. Codex 0.157.0 / gpt-6-sol / существующая подписка: обе пары имеют observed launch/setup/task pass, setup invariants, independent task exports и task invariants pass. SKILL дополнительно содержит наблюдённое чтение установленного скилла в новой сессии и approved-kernel-artifact. Runtime probe подтвердил запрет runtime-записи наряду с auth boundary и чтением ресурсов.

16 executor-сессий, без новых judge/human review; evaluated по-прежнему missing-quality-review. Старые две model-оценки cycle2 не перенесены. Публичная проекция; private artifacts — `.evals-private/codex-canonical-plan-20261026-PwLTG0`. Полная 3.6/PROC и релизная приёмка остаются открытыми. Профиль успешного пути выявил скрытый CLI-стык; отдельный продуктовый change [expose-pinned-source-validation](../expose-pinned-source-validation/tasks.md) сокращает его без смены sourceGate.

## Observed-reference transport and second control — 26.10.2026

Повторный контроль cycle2 сохранил пять executor-сессий: baseline setup/task pass; Tibicen setup error из-за перепечатанного diff и непустых kernel.commands. Два blinded model judge завершены: baseline все шесть model-критериев pass; Tibicen setup pass, task loading/application unverified. Human reviews 0, evaluated pass не заявлен; 3.6 открыта.

Задача 5.4 выполнена после этой когорты: явная proposal-sha256 ссылка разрешается только из успешного compiled stdout текущей proposal-сессии, до redaction, с равными reference/envelope.digest/digest(proposal). Missing/tampered/failed stdout, несовпадающие edits и kernel commands по-прежнему отклоняются. Host не компилирует intent; legacy JSON сохранён. После approval агент получает точный read-only plan-файл штатному apply --plan.

Независимое review нашло P1: первоначальный файл оставался в общем runtime и мог быть прочитан следующим вариантом. Отрицательный контроль падал до исправления; теперь файл удаляется в finally до следующей сессии, включая ошибку apply. При сбое удаления supervisor отменяет очередь; отдельный apply-failure контроль сохраняет успешный baseline. Повторное review не нашло P1/P2. Runtime canary подтверждает readability, write denial и неизменность байтов до модели.

Fake reference-control использует существующий synthetic source mirror/preload без реального сетевого fallback. Проверки: focused workflow/diagnostic43/43 до расширения cleanup, cleanup2/2, финальный полный pnpm test 565/565 с lint/format/types/site/strict OpenSpec. Сборка84 файлов. Общий прогресс17/23; новый live transport проверяется отдельной когортой и не меняет прошлые исходы.

ZCode: исследование доказало отдельный OS canary для child/descendant, но не весь native-профиль. Установленная CLI не открывает полный exec+filesystem boundary; конкретный будущий путь — pinned bootstrap-host со scoped ports и выключенными обходными исполнителями. Нулевые model requests, готовность native/auth/loading не заявлена.

## Subscription control and protocol fixes — 26.10.2026

Отчёт и выбранные структурные поля сохраняют текущий цикл отдельно от истории. Задача 3.4 выполнена конкретным воспроизводимым blocked ZCode, 5.3 — исправлением native-протокола; текущий итог 16/22. Полная 3.6 открыта.

- Codex 0.157.0: gpt-6.1-sol отклонена текущим ChatGPT CLI-маршрутом, отдельная gpt-6-sol probe дала shell read и turn.completed; synthetic auth/fs/process-tree границы прошли. Loader сохраняет точную модель успешного preflight, без подмены. Default не изменён.
- Первая пара skill-01: три завершённые executor-сессии, оба launch pass, два setup error, обе task skip. Tibicen вернул raw intent вместо compiled envelope; baseline записал точные байты, затем слишком поздний gate обнаружил commands без node --test. Routing/timeout в этих трёх сессиях не было. Source SHA, dirty tree и frozen hashes записаны в отчёте. PREF/PROC остановлены; judge: 0 / human: 0.
- По read-only replay compiled envelope проходит review, raw intent отвергается. Протокол теперь явно требует полный результат proposal, раскрывает обязательные literal-команды без hidden assertions; их согласование проверяется до approval/apply. Planning и пользовательский отказ сохранены, команды не добавляются автоматически. Отрицательные fake-контроли доказывают отсутствие apply при пропуске Node/PROC verification.
- ZCode Desktop 3.14.4/CLI 0.16.9: актуальные version/help в пустом data scope, проверенный отдельный stream-json parser; loader остаётся hard blocked, fake ready отклоняется. Оба blocked-слота сохранены без модели/auth/API fallback. Четыре границы startup/auth-read/filesystem-write/process-tree не подтверждены. После Codex-когорты закрыто замечание parser failed+exit0 отдельной регрессией; исторические hashes не заменены.
- Focused workflow/ZCode — 36/36; полный pnpm test — 562/562 (lint/format/root+Astro types/site/strict active+archived OpenSpec/all Node). Автономная сборка перед серией — 84 файла. Независимое code review существенных замечаний не нашло. Новых browser/product-acceptance утверждений нет.

Живой повтор после исправления не запускался. Положительный task и независимая quality/human-приёмка не подтверждены; change не синхронизирован и не архивирован. Коммитов, paid API, публикации и личных login/config-изменений не было.

## Observed SKILL/PREF/PROC and style checks — 25.10.2026

Продолжена задача 3.6. Полный отчёт с публичными проекциями сохраняет три когорты и их ограничения. Ядро — `0a4c7f7`, выполненный dirty harness отдельно архивирован и связан с frozen hashes/patch. До модели зафиксированы один preflight, максимум 280 executor и 60 judge-сессий; API/платный fallback выключены. Использована существующая подписка Codex CLI 0.157.0 / gpt-6-sol. Фактические public GitHub-ответы закреплённых источников сохранены в частном mirror, product provenance/license/blob gates пройдены.

- Серия 01: 60 записанных незапущенных слотов, ноль executor-сессий. Реальный sandbox probe отказал из-за отсутствующего CODEX_HOME. В check invocation используется существующий пустой home без модельной авторизации; модельный HOME/.codex и защита авторизации сохранены. Офлайн-контроль падал до исправления и проходит после; повторный реальный расширенный boundary probe подтвердил denied/resourcesReadable.
- Серия 02: пять started/шесть executor-сессий; стенд ошибочно считал `openspec --version`/`--help` проверками без согласия. Серия остановлена с сохранением всех 60 исходов. Точные metadata reads проверенного CLI отделены от запуска проекта; произвольные дополнительные аргументы и `node --test` до согласия дают fail.
- Серия 03: 60 слотов/62 executor-сессии; 10 завершённых turns, 47 `workspace routing discovery failed`, пять таймаутов. Два hostile-слота заблокированы до модели. По одному setup pass у каждого варианта, один полный механический pass у `skill-02-tibicen-1`; установка/применение нового скилла и PROC не приняты. Четыре измеренных elapsed существенно превышают лимит из-за неотделённой задержки host-таймера; значения сохранены и не используются как сравнительная производительность.
- Независимый judge 25.10: прежние версия/hash CLI подтверждены без модели; первая отдельная judge-сессия проверила текущую доступность перед остальными. Восемь содержательных попыток получили отдельные обезличенные оценки без инструментов, 52 слота пропущены без judge-запроса. Все ответы прошли проверку схемы/binding/оснований. Человеческих проверок — ноль; первый повтор требует сверки, evaluated pass отсутствует. Выбранные основания неполны для ряда критериев, исходные traces сохранены отдельно; `unverified` не означает доказанного отсутствия действия.
- После серии 03 исправлены точные `openspec validate --help`, `version --help`, `version --json`: OpenSpec 1.14.3 проверен по установленному коду; локальное чтение не включает `version --check`. Расширенный metadata-контроль воспроизвёл false fail до исправления и проходит после; дополнительные аргументы/registry check/проверка приложения до согласия отклоняются. Старый baseline fail не перезаписан.
- Judge выявил конфликт фикстуры: `npm test` в достаточных правилах против единственной разрешённой `node --test`. Исправлены общая авторская строка и программа PREF, вручную пересмотрены восемь изменённых hashes matrix-lock. Исторические frozen/оценки не менялись; новые входы требуют отдельной когорты.

`pnpm test` — **507/507**, без skips: ESLint, Prettier, TypeScript/Astro, сборка сайта, strict OpenSpec и офлайн-тесты. Разработка уже использовала pnpm 11.21.0; он явно закреплён в AGENTS.md, русский README дополнен командами и описанием lint/format. Команды изолированных Node-фикстур и поддержка чужих npm/Yarn-проектов не меняют менеджер разработки Tibicen.

Прогресс — **14/21**, 3.6 и 3.7 открыты. Следующая работа в 3.6 — дополнить выбранные основания связанными действиями, затем новая frozen-серия после проверки доступности и обязательная человеческая сверка. Платных API-запросов, новых коммитов и публикации не было; прочие native-профили/ОС этим проходом не проверены.

## Native acceptance review and fixes — 23.10.2026

По явному запросу пользователя выполнены ревью всех незакоммиченных изменений и исправления перед коммитом. [Полный отчёт](review-native-acceptance.md) фиксирует восемь подтверждённых проблем: потерю инвариантного fail после ошибки apply, потерю серии на malformed/missing-start потоке, ошибочный разбор shell-токенов, повреждение UTF-8, переполнение выбранных loading-оснований, потерю стоимости после отказа, ложный pass после timeout и ссылку установленного скилла на исключённые dev-артефакты.

Девять регрессионных случаев воспроизведены до соответствующих исправлений. После них `pnpm test` — **503/503**, без skips; `pnpm build` — **80 файлов**, оба установленных self-test passed и **80/80 SHA256SUMS** совпали. Локальные ссылки всех поставляемых Markdown теперь проверяются build-тестом. Старые отчёты collector воспроизведены целиком без моделей (**4/9** и **4/16** попыток/сессий); исходные артефакты не менялись. Добавлен игнорируемый `.evals-private/` с явной границей публичных проекций. Проверка изменённых файлов и 13 прежних Git-ревизий нашла только известный синтетический header в тесте секретов; значения ключей/авторизации в материалах коммита не найдены.

Живые агенты, judge/человеческая сверка, другие ОС и новая авторизация не запускались. Прогресс сохраняется **14/20**; review/fixes не закрывают 3.3/3.4/3.6. Исторические результаты ниже относятся к прежним исходникам.

## Desktop ZCode discovery correction — 23.10.2026

После уточнения пользователя проверена desktop-установка: `/Applications/ZCode.app`, Info.plist version **3.14.4**, build **3.14.4.7912**. В приложении найден `Contents/Resources/glm/zcode.cjs`; через Node 24.15.0 он успешно отвечает на `--version` (**0.16.9**) и `--help` в отдельном пустом HOME/TMPDIR/ZCODE_DATA_BASE_DIR. Очищенное discovery с hashes runtime/entrypoint/Info.plist/help сохранено. Предыдущая проверка подтверждала только отсутствие команды в PATH, а не отсутствие установленного CLI.

Preflight теперь автоматически проверяет стандартные macOS app bundles после PATH и принимает явно переданный `.cjs`. Общий probe поддерживает отдельный entrypoint/hash и задаваемый профилем data-home env; команды передаются массивом argv, потомки/таймауты обрабатываются прежним механизмом. Явно заданный отсутствующий бинарник не подменяется desktop-версией. Version/help discovery не запускает GUI, login или prompt. Стенд не открывал личные конфиги/авторизацию и не передавал их в probe; ОС-граница доступа пока не проверялась.

`pnpm test` — **495/495**, без skips. Новый офлайн-контроль использует неисполняемый `.cjs` с пробелом в пути: проверяет Node invocation, оба флага, отдельный data scope, hashes, отсутствие наследуемых credential env, отсутствие готовности после discovery и отказ для явно отсутствующего пути. Реальный discovery — **0 model requests**, новая причина `native-startup-auth-isolation-unverified`. Подписочный вход, полная управляемость startup, изоляция инструментов и живая загрузка скилла остаются непроверенными; 3.4 не закрыт, прогресс **14/20**. Коммит не создавался; дистрибутив и продуктовые зависимости не менялись.

## Shared native acceptance code — 23.10.2026

Продолжение кода пункта 3.6 с уточнением пользователя о первой тройке профилей. Codex CLI/config/auth/parser перенесены в `scripts/evals/profiles/codex`; прежние import/CLI-входы сохранены. Общий `native.ts`/runner/workflow не подставляет Codex вместо явно выбранных Claude Code или ZCode. Для двух последних реализованы version/help discovery в пустом HOME и blocked-профили, полноценный native invocation ещё не подтверждён. Контракт и фактические ограничения — в [NATIVE_RUNS](../../../docs/evals/NATIVE_RUNS.md).

- `pnpm test` — **494/494**, без skips: TypeScript, сборка сайта, strict OpenSpec (10 активных items / 6 архивов), весь офлайн-набор. Новые 14 контролей охватывают выбор профиля/blocked-пары, изолированное discovery и отмену с потомком, frozen source transport, полную проверку kernelPlan/квитанции, SKILL install/loading, сохранение достаточных правил, PROC specification → plan → implementation с реальными независимыми Node/OpenSpec проверками, ранний код, runtime boundary failure, общий budget, уточнение, пересмотр предложения и отказ.
- Fake CLI и синтетические GitHub-метаданные используются только как офлайн-контроли. Synthetic boundary result в fake CLI **не** подтверждает ОС-изоляцию. Kernel-контроль отдельно применяет реальный продуктовый план/источники и отклоняет изменённые лицензию/байты, чужой HOME/compat и подменённое происхождение квитанции. Настоящие источники не захватывались и модели не вызывались.
- Session index связан с квитанциями внутри run; потеря ожидаемого transcript сохраняет неизвестный итог, удаление строки индекса отклоняется. После пользовательского отказа сохраняются уже потраченные tokens предложения при setup=skip. Collector готовит связанные пакеты судье без самостоятельной quality-оценки.
- **67** случаев сохранены. Перед будущей серией пересмотрен matrix-lock: добавлено host-only управление фазами/ответами; PROC metadata `.openspec.yaml` допустима только на стадии спецификации, adopt/update получили собственный process task; SKILL-01 требует также точный LICENSE. Frozen исторических диагностик не менялись.
- `pnpm build` — **80 файлов**, оба установленных `self-test` passed, **80/80 SHA256SUMS** совпадают. Evals/profiles/источники/OpenSpec остаются вне обеих поставок. Product runtime и зависимости не изменены.
- Текущий collector без моделей воспроизвёл обе старые серии в новом временном каталоге: **4 попытки/9 сессий** и **4 попытки/16 сессий**; оба enriched report целиком совпали с сохранёнными. Исходные артефакты не заменялись.
- Model-free `preflightZCode()` в текущем PATH: `cliPath=null`, `status=blocked`, `reason=native-cli-unavailable`, `modelRequests=0`. Это discovery текущей среды, не проверка конкретной ZCode-сборки/авторизации и не закрытие 3.4.

Прогресс — **14/20**. Пункты 3.3/3.4/3.6 остаются открытыми; новая живая SKILL/PREF/PROC-серия, независимый judge и человеческая выборка не выполнены. Коммит текущих изменений не создавался. UI/браузерные проверки не повторялись: интерфейс не менялся. Исторические свидетельства ниже относятся к прежним исходникам.

## Uncommitted-change review and fixes — 23.10.2026

По явному запросу пользователя выполнено ponytail-review всех незакоммиченных изменений, исправления и подготовка коммита. [Полное ревью](review.md) содержит пять воспроизведённых проблем и их исправления: ложный pass после аварии checker, потеря попыток на ненаблюдаемом дереве, незавершённый preflight после отмены, противоречивые ожидания матрицы и неполный/перепутанный расход collector.

- Четыре новые native-регрессии проверены в отдельной копии с сохранёнными старыми codex-diagnostic/preflight из executed-harness-source: **0/4 pass**, с фактическим false pass, исключением снимка и оставленной группой после SIGTERM. На исправленном стенде все четыре проходят без настоящего CLI/авторизации/моделей.
- `pnpm test` — **480/480**, без skips: TypeScript, сборка сайта, strict OpenSpec по активным/архивным изменениям и все офлайн-тесты. Новая матричная регрессия проверяет механический pass без запрещённой команды; тест collector проверяет потерянный apply, перестановку слотов и изменённые conditions.
- `pnpm build` — **80 файлов**. `node dist/tibicen-{init,adopt}/scripts/tibicen.ts self-test` — оба passed; **80/80 SHA256SUMS** совпадают. Стенд, источники, отчёты и OpenSpec по-прежнему исключены из устанавливаемых скиллов.
- Новый collector без моделей повторно обработал обе сохранённые серии в новом временном каталоге: **4 попытки/9 сессий** и **4 попытки/16 сессий**. Оба итоговых report целиком совпали с сохранёнными enriched-отчётами; старые файлы не менялись. Все **8** архивированных исходников и общий harness hash совпали. Текущий драйвер дополнительно фиксирует mechanical/runner, откуда теперь используется общий наблюдатель дерева.
- После исправления 26 запретов исполнения и отдельного пустого React-сценария пересмотрен matrix-lock для будущих серий. Сохранились **67** случаев; frozen двух проведённых diagnostic-когорт не менялись. Неизвестный web-check не заменяется Node-тестом.

Живые модели после ревью не вызывались. Браузерные тесты не повторялись: UI не менялся. Независимые quality-оценки и человеческая выборка, SKILL/PREF/PROC и остальные native-профили остаются открытыми; прогресс плана — **14/20**, новых завершённых пунктов ревью не добавляет. Исторические результаты ниже относятся к ранее проверенным исходникам.

## Expanded fixtures and first live Codex diagnostics — tasks 1.3–1.4, 3.1–3.2

23.10.2026. Выполнены четыре пункта, на которые пользователь дал «делай все пункты», в прежнем порядке плана. Ядро/дистрибутив — `408beb5a5e4af1bae78d2a3d6b4bf23b04611f90`; продуктовые scripts/skills/references относительно HEAD не менялись. Стенд и документы остаются незакоммиченными; source hashes и точные исходники исполненного исправленного стенда сохранены отдельно. Среда: macOS arm64, Node 24.15.0, pnpm 11.21.0.

### Prepared fixtures

[Матрица](../../../docs/evals/MATRIX.md) содержит 67 отдельных cases поверх двух первых diagnostic: А–Е, PREF-01–08 со всеми четырьмя 08 и 06 без вопросов, marker/update/recovery, ML и два tools. Закрытые MechanicalOracle/QualityPlan/контрпримеры не передаются исполнителю. Для каждого заданы isolation и допустимые setup/task paths/commands; оба варианта получают одинаковые независимые входы. 11 реальных hard exit snapshots покрывают add/modify/delete, запись паспорта, cleanup, ambiguous и неизвестный command outcome; тесты реально продолжают их с новым согласием. Synthetic root/HOME привязываются до заморозки, не после старта. Опасный initializer — конкретный inert payload с hostile gate, до исполнения не допускается.

Ponytail взят из канонического DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710, skill-only SKILL.md + MIT; предыдущий fe963cae99d986dae3199fe56403f99e87db7c6c и полезный удалённый upstream-пример закреплены отдельно. Десять настоящих файлов Ponytail/Spec Kit проверены по Git blob/SHA256/размеру/лицензии, без домашней копии. PREF-08B использует реальные Spec Kit templates @27d14e20c187c1f2916540ea201ecbdc9f8ed588 и локальные незавершённые решения, без заявления нового адаптера. OpenSpec 1.14.3: закреплены pnpm integrity, весь package inventory и фактические init/update effects в отдельном HOME/XDG; первый update пишет пользовательский config, следующий no-op. Четыре bounded adapter files отделены от этих native эффектов.

### Observed Codex profile and outcomes

[Методика](../../../docs/evals/CODEX_DIAGNOSTIC.md), самодостаточный отчёт с исходными/исправленными данными. CLI 0.157.0, binary SHA256 ad0be20d04e2ba6146ecdb51d7f8b7b0fe15420a15dc9b0057518d858f1f3714. Локальная gpt-6.1-sol отвергнута подписочным backend; оба отказа и model/list сохранены. Отдельный gpt-6-sol профиль реально прошёл startup через существующую ChatGPT-подписку, синтетический запрет чтения auth из команды/потомка, внешней записи, разрешённую skill-запись/удаление и остановку потомка. Наблюдалось полное tool-чтение AGENTS.md. JS реальные значения auth не читает: временную ссылку использует родительский CLI; её путь и личный источник закрыты командам. Сторонние startup/config/rules/hooks/plugins/apps и командная сеть отключены; hostile/другие ОС этим не подтверждены.

До серии заморожены SHA/дистрибутив/источники стенда, 1 repeat, T/B → B/T, предел 16 native model sessions, launch 45 s / setup 180 s / task 120 s. API key/платёжный API-маршрут не включались. Полезная task имеет новую ephemeral сессию и собственные план/согласие; независимые числовые assertions выполняются в защищённой копии, не в контексте модели. Для kernel setup exact edits и полный service intent связаны до apply; проверяется квитанция, без вывода исполнения из одного наличия файлов.

Первая когорта: четыре записи, 9 native sessions. Bare Tibicen error/skip из-за ложного regex-события команды в JSON; bare baseline pass/pass; оба conflicts fail/skip из-за защищённой `.agents`. Это дефекты стенда, исходы/причины/наблюдения сохранены. Исправленный парсер/права проверены офлайн и новым preflight; новые experiment/conditions/harness hash отделяют исправленную серию.

| Исправленная когорта | Setup | Task в новой сессии | Независимый результат                        |
| -------------------- | ----- | ------------------- | -------------------------------------------- |
| Bare / Tibicen       | pass  | pass                | Точные изменения, сохранность, double/triple |
| Bare / baseline      | pass  | pass                | Точные изменения, сохранность, double/triple |
| Conflicts / baseline | pass  | pass                | Точные изменения, сохранность, double/triple |
| Conflicts / Tibicen  | pass  | pass                | Точные изменения, сохранность, double/triple |

Все 16 native sessions исправленной серии использованы; четыре setup/task pass — observed механика. Во всех четырёх задачах есть наблюдение чтения инструкций; 9 loading excerpts сохранены. Native CLI error неправильной передачи diff отвергнут до записи, затем тот же утверждённый digest принят. Judge/человеческой выборки нет: quality null, evaluated setup не pass (`missing-quality-review`), evaluated task skip. Первые два сценария не закрывают PREF/SKILL/PROC/релизный гейт. В этих данных Tibicen использовал больше setup-времени/токенов, что само по себе также не доказывает общую пользу/вред: один повтор и специальный native protocol, host выполнял другую разработку во время диагностики.

Дополнительно сохранены 5 startup model requests вне когорт (2 неподдержанной модели, 3 доступной); они не входят в сценарные дроби. По native usage сохранены cumulative input/output, включая cached context, без повторного прибавления cached input и без выдуманной денежной стоимости. После серии обнаружена потеря task startup в исходной duration; неизменённые host boundaries позволили восстановить полный интервал в отдельной проекции. Raw reports/observations сохранены; качество/исходы не менялись. Будущий драйвер исправлен, alias-regression и source-bound projection проверены без новых моделей.

### Verification

| Проверка                               | Результат                                                                                                                                                                                                                |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `pnpm test` после всех изменений кода  | Exit 0: typecheck, сайт, strict OpenSpec, 475/475 Node tests без skip; модели не вызываются                                                                                                                              |
| Fixture/native protocol/usage controls | 67 input cases, 11 реальных recovery states, точные source blobs, protected/malformed proposals, command-in-data regression, неизвестные counters, перенумерация evidence, shared-stage aliases и неизменность raw files |
| `pnpm build`                           | Exit 0, два standalone skills, 80 файлов                                                                                                                                                                                 |
| Self-test обоих dist skills            | passed / distribution-resource-check                                                                                                                                                                                     |
| Native distribution gate               | Перед обеими сериями все 80 SHA256SUMS проверены; dev/eval/source/OpenSpec материалы исключены                                                                                                                           |
| `pnpm eval:external run`               | Две отдельные наблюдаемые когорты по 4 попытки; все failures/skips сохранены, corrected 4/4 observed setup/task pass                                                                                                     |
| Model-free evidence processing         | Исходные результаты/планы не перезаписаны; tokens/clock проекция валидирована через прежние contracts/report                                                                                                             |

Tasks 1.3–1.4/3.1–3.2 закрыты, 14/20; подробные дальнейшие задачи остаются в tasks и прежней очередности roadmap. Дельта не синхронизирована/не архивирована до завершения change. Product adapter scope, Linux/Windows, Claude/ZCode и живые SKILL/PREF/PROC здесь не расширены. Коммитов и публикации нет. Исторические свидетельства ниже сохранены.

## Explicit external entry — task 2.6

23.10.2026. Выполнена задача 2.6 по плану поверх `408beb5`, macOS arm64 / Node 24.15.0 / pnpm 11.21.0. Добавлены `pnpm eval:external`, scripts/evals/external.ts и [документация](../../../docs/evals/EXTERNAL_RUNS.md). Только явный run загружает выбранный доверенный локальный host-драйвер; import/help/неполные аргументы не загружают его. Драйвер возвращает frozen experiments, отчёт проверяется существующими контрактами и публикуется общим атомарным writer с 0600/0700, без перезаписи. Существующий путь отклоняется до загрузки драйвера. Секреты и сырые исключения не отражаются в отчёте/диагностике команды.

Обычный pnpm test не подключён к внешней команде. В семи новых тестах используются только записанные calibration-данные и синтетический секрет: явный вызов, отсутствие вызова без run, права/форма отчёта, существующий файл без повторного исполнения, неверный модуль/результат, секрет и исключение. Тест обеих сборок явно проверяет исключение evals/tests/docs/OpenSpec/dev-скиллов/сайта/node_modules. Прежние регрессии хранения, конкурентной публикации и мутации данных проходят с общим writer.

| Проверка                                                                                         | Результат                                                                    |
| ------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------- |
| `node --test tests/evals/external.test.ts tests/evals/runner.test.ts tests/skills/build.test.ts` | 50/50 без skip                                                               |
| `pnpm eval:external --help`                                                                      | Exit 0, только JSON-справка                                                  |
| `pnpm eval:external run tests/evals/helpers/external-driver.mjs <new-temp-report>`               | Exit 0, одна calibration-когорта/пара; временный отчёт удалён после проверки |
| `pnpm test`                                                                                      | Exit 0: typecheck, сайт, strict OpenSpec, 380/380 Node-тестов без skip       |
| `pnpm build` и оба distribution self-test                                                        | Exit 0, 80 файлов; оба passed / distribution-resource-check                  |
| SHA256SUMS и полный инвентарь                                                                    | Все 80 файлов совпадают, dev/eval-материалы исключены                        |
| `git diff --check`                                                                               | Exit 0                                                                       |

Задача 2.6 закрыта, повторные apply instructions подтверждают 10/20. README и фактические статусы плана обновлены; порядок оставшихся работ не менялся. Change остаётся активным без sync/archive. Нативные профили, авторизация, модели и живые SKILL/PROC не запускались; host-модуль является явно доверенным кодом, а не sandbox или подтверждением preflight. Подключение настоящего Codex остаётся задачей 3.1, живые парные серии — 3.2. Другие ОС/браузерный UI не проверялись; UI не менялся. Коммит не выполнялся.

## Review and fixes — task 5.2

23.10.2026. Ревью всего незакоммиченного блока поверх `f8c9443`: diff, новые файлы, вызывающий код, контракты, тесты, README и границы продукта. Расчётная нагрузка — один разработчик с небольшими локальными сериями и возможными параллельными сохранениями записей. Применён ponytail-review; пользователь явно поручил исправления и коммит. Живые вызовы/публикация не выполнялись.

### Findings and fixes

1. **Проверенные объекты менялись до записи.** После `saveObservedRun()` изменение исходного события позволяло сохранить зарегистрированный синтетический секрет; изменение id меняло имя файла. Host-события и реестр sensitiveValues также сохраняли внешние ссылки. Теперь runner копирует событие, guard — список значений, хранилище — разрешённую проекцию и её сериализованные байты до первого await. Имя файла берётся из той же копии. План в отчёте также отделён от изменяемого входа. Без исправления проверка секретов и соответствие hash/id не гарантировали фактически записанное содержимое.
2. **Старая оценка принималась после изменения наблюдений.** Изменение afterHash артефакта оставляло пять pass: binding учитывал лишь эксперимент/id/сценарий, а ответ не имел связи с конкретным request. Теперь binding фиксирует весь linked run, а судья/сверка должны иметь совпадающие bindingHash/packetHash. Регрессия меняет событие, исход, механическую оценку и отрывки; старые оценки отвергаются. Без исправления хороший вердикт мог относиться к другому результату.
3. **Неполный снимок скрывал доказанное нарушение.** Драйвер менял защищённый package.json и добавлял симлинк: оценщик возвращал unverified/error вместо fail, теряя нарушение в списке строгих отказов. Теперь сравниваются наблюдаемые записи, известный fail сохраняется и запрещает checker. Пропуск файла в неполном списке отдельно остаётся unknown, без ложного удаления. Без исправления неполнота позволяла потерять обязательный инвариантный отказ.
4. **Нулевой выход обходил скрытые assertions.** Node принимал тестовый файл с process.exit(0) во время импорта как passed; задача получала pass без проверки экспортов. Скрытый тест теперь регистрирует exit-handler до импорта и подтверждает завершение только после всех assertions. Регрессия требует task fail и сохраняет setup pass. Это контроль завершённости доверенного checker, без обещания hostile-изоляции.

### Validation

До исправлений пять целевых проверок воспроизводили отказы: 0/5. После исправлений добавлены семь регрессионных тестов, включая отделение плана отчёта и отсутствие ложного удаления на неполном снимке.

| Команда/проверка                            | Результат                                                                                                                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --test tests/evals/*.test.ts`         | 125/125, без skip                                                                                                                                                                  |
| `pnpm test`                                 | Exit 0: typecheck, сайт, strict OpenSpec, 373/373 Node-теста без skip                                                                                                              |
| `pnpm build`                                | Exit 0, оба скилла, 80 файлов                                                                                                                                                      |
| Self-test обоих `dist/*/scripts/tibicen.ts` | passed / distribution-resource-check                                                                                                                                               |
| SHA256SUMS и полный инвентарь               | Все 80 хэшей совпадают; evals/tests/docs/OpenSpec/сайт/assets/node_modules исключены                                                                                               |
| Архив аудита и основные спеки               | Все 7 файлов перенесены; прежние байты сохранены, кроме исправленных ссылок/фактического статуса verification; все 9 требований синхронизированы, прежние основные спеки сохранены |

Задача 5.2 закрыта после проверок; change остаётся активным, 9/20. Релизный гейт, native-профили, реальные auth/модели и живые SKILL/PROC не проверялись. UI не менялся, браузерные тесты не повторялись. Предыдущие отчёты ниже сохранены как история своих этапов.

## Quality rubric and paired report — tasks 2.4–2.5

23.10.2026. Блок поверх рабочего дерева с офлайн-задачами 2.2–2.3, HEAD `f8c9443`; macOS / Darwin arm64, Node 24.15.0, pnpm 11.21.0. Нового коммита нет. Это проверка стенда по записанным контролям, без вызовов моделей, человеческой экспертизы или живой SKILL/PROC-приёмки.

### Implemented and calibrated

- `scripts/evals/quality.ts`: версия рубрики, независимый обезличенный request, семь отдельных критериев, связь с замороженной попыткой, полные векторы судьи/сверки и сохранение расхождений. Обязательная сверка первого повтора/неположительных случаев/недостаточных свидетельств и детерминированная выборка остальных; отсутствие сверки или нужного наблюдения не даёт pass. Контрольные recorded/reference labels не выдаются за модельную/человеческую оценку.
- 12 контролей: достаточные правила, конфликт, придуманная история, ненужная установка, навязанная миграция Spec Kit, выбор ради адаптера, SKILL-наблюдение/самоотчёт, успех задачи без применения, PROC init/полный порядок и намеренный спор. [Сохранённые оценки](../../../docs/evals/calibration-quality.json) включают спор без усреднения.
- `scripts/evals/report.ts`: консервативные когорты по frozen experiment/scenario/profile/rubric/plan/mode, все запланированные пары/повторы, исходные оценки и separate observed/evaluated результаты по неизменённому `evaluation-results`. Ошибка до старта, ошибка после старта и отсутствующая запись различаются; старый fail не стирается успешным повтором. Механический провал имеет приоритет, потеря оценок блокирует приёмку.
- Время skip/пропущенной записи — null, измеренный ноль остаётся нулём; последняя накопленная usage-запись стадии заменяет предыдущую. Неизвестная стоимость не превращается в 0 и не дополняется старым snapshot; partial subtotal не выдаётся за полный total. Разности только для двух известных измерений одной пары.
- [Парный пример](../../../docs/evals/calibration-paired.json): 6 слотов, 5 записей, нарушение инварианта, незапущенная попытка, timeout после старта, успешный повтор и неполная пара. Оба JSON сверяются с воспроизводимыми генераторами в офлайн-тестах. [Рубрика и процедура](../../../docs/evals/QUALITY_AND_REPORTS.md) описывают условия сверки и границы доказательств.

### Commands and results

| Команда                                                              | Результат                                                                                                                                   |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `node --test tests/evals/quality.test.ts tests/evals/report.test.ts` | 43/43: 21 quality + 22 report, включая связность, обезличивание, неподходящие свидетельства, споры, когорты, дроби и unknown cost/time      |
| `pnpm test`                                                          | Exit 0; typecheck/сайт/strict OpenSpec, 366/366 Node-тестов без skip; финальный прогон после исправлений сверки и сохранения прежних оценок |
| `pnpm build`                                                         | Exit 0; оба скилла, 80 файлов; eval-код и материалы не входят в поставку                                                                    |
| `OPENSPEC_TELEMETRY=0 pnpm spec:check`                               | Exit 0; 10 актуальных items и 6 архивов                                                                                                     |
| `node dist/tibicen-init/scripts/tibicen.ts self-test`                | passed / distribution-resource-check                                                                                                        |
| `node dist/tibicen-adopt/scripts/tibicen.ts self-test`               | passed / distribution-resource-check                                                                                                        |
| Проверка SHA256SUMS и полного инвентаря Node-checker                 | Все 80 файлов совпадают; evals/tests/docs/OpenSpec/node_modules/сайт/assets исключены                                                       |
| `git diff --check`                                                   | Exit 0                                                                                                                                      |

Задачи 2.4 и 2.5 закрыты по отдельности; повторные apply instructions подтверждают 7/19 и 8/19. Проверены 94 локальные цели ссылок в 18 изменённых/новых Markdown-файлах, пропусков нет; якоря не проверялись. План и активная дельта обновлены; change не синхронизирован/не архивирован. История проверок ниже сохранена.

### Remaining boundaries

Реальные судья/человек, native-профили, авторизация и наблюдение загрузки остаются непроверенными. Поля model/human и host-отрывки требуют доверенного ведущего и будущего preflight; структура JSON не доказывает независимость сессии или истинность наблюдения. Синтетические SKILL/PROC не подтверждают внешний компонент. Впереди 2.6, расширенные фикстуры 1.3–1.4, живые 3.x и релизная приёмка 4.x. Браузерные проверки повторно не запускались: UI не менялся; сборка/Astro check сохраняет прежний hint document.execCommand без ошибок. Пользовательский пилот и полезность Tibicen не измерялись. Коммит, публикация и установка в личную среду не выполнялись.

## Safe observations and mechanical graders — tasks 2.2–2.3

23.10.2026. Реализованный блок: задачи 2.2–2.3 поверх `f8c9443`, macOS / Darwin arm64, Node 24.15.0, pnpm 11.21.0. Это калибровка стенда на доверенных подставных процессах, не испытания настоящих агентов.

### Commands and results

| Команда                                                | Результат                                                          |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| `OPENSPEC_TELEMETRY=0 pnpm test`                       | Exit 0; typecheck/сборка сайта/спеки, 323/323 Node-теста, без skip |
| `pnpm build`                                           | Exit 0; строгая проверка типов, сайт и оба скилла; 80 файлов       |
| `OPENSPEC_TELEMETRY=0 pnpm spec:check`                 | Exit 0; 10 актуальных spec/change и 6 архивных changes             |
| `node dist/tibicen-init/scripts/tibicen.ts self-test`  | passed / distribution-resource-check                               |
| `node dist/tibicen-adopt/scripts/tibicen.ts self-test` | passed / distribution-resource-check                               |
| `git diff --check`                                     | Exit 0                                                             |

Итоговый полный прогон включает 75 тестов evals, из них 20 механических сценариев и 33 проверки runner. Локальный Node-checker сверил SHA256SUMS с полным инвентарём: все 80 файлов совпадают; оба дистрибутива исключают evals, сценарии/oracle, docs, OpenSpec CLI, сайт, assets и node_modules. Браузерные тесты повторно не запускались: код интерфейса не менялся. При Astro check остаётся прежний hint о deprecated document.execCommand; ошибок типов нет.

Финальная проверка: 78 локальных ссылок в 17 изменённых/новых Markdown-файлах разрешаются. Основные спеки сохраняют прежний текст целиком и все девять добавлений аудита; архивные planning artifacts сохранены побайтно, ссылки отчёта исправлены после перемещения. Прежняя история этого отчёта сохранена без изменения.

### Observed offline cases

- [runner.test.ts](../../../tests/evals/runner.test.ts): связанная запись результата/событий/оценок без raw output/контекста/oracle; 0600, отказ повторному и параллельному id, запрет назначения внутри проекта/через симлинк, отклонение чужой попытки. Синтетическое host-значение не попадает в argv, проектный subprocess, контекст или файл; попытки передать его через аргумент/prompt/reason блокируются. Сохраняются прежние тайм-ауты, частичные исходы, остановка потомков и границы согласия.
- [mechanical.test.ts](../../../tests/evals/mechanical.test.ts): отдельные host-снимки, точное согласие и независимые Node-проверки принимают полный setup/task. Изменение protected/Git/прав, запись до согласия, неподтверждённая команда, пропущенный ресурс, неверные байты и лицензия дают fail с seq-основаниями. Нарушение setup пропускает task и не исполняет проектную команду оценщика.
- Ложный task pass с прежним успешно проходящим публичным тестом не скрывает отсутствующий triple: независимые числовые случаи дают fail. До исправления имени файла со скрытыми тестами этот случай воспроизвёл ошибку самого оценщика; регрессия проходит после исправления.
- Положительные синтетические компонент/обновление/процесс проходят проверку точных ресурсов, полей происхождения и обязательных артефактов. Если loading обязателен, даже полный состав и self-report оставляют loading/unverified, setup/error и task/skip; отдельная регрессия сначала воспроизвела ложный pass и проходит после исправления. Локальный сосед сохраняется, явно удалённый старый ресурс отсутствует; один паспорт/метаданные не подтверждает полноту поставки и загрузку.
- Неизвестные/изменённые входы/oracle и попытка драйвера прислать host-checkpoint не проходят; потеря независимых свидетельств остаётся unverified. Запоздалый review после тайм-аута не меняет итог и не запускает проверочную команду.

### Scope and remaining work

Авторизация проверена только синтетически на offline/auth:none с явным пустым env; реальные auth/paid-профили по-прежнему не запускаются. Физическая изоляция скрытых файлов, произвольных credentials и кратковременных записей между снимками не доказана. Доверенные callbacks и подставной протокол не заменяют preflight/парсер native-профиля; [ограничения](../../../docs/evals/OBSERVATIONS_AND_GRADERS.md) сохранены явно.

Положительные SKILL/PROC в этом наборе являются калибровкой механики на синтетических данных, без канонического внешнего компонента и живого цикла OpenSpec. Задачи 1.3–1.4, рубрика качества 2.4, парный отчёт/явный внешний запуск 2.5–2.6 и вся живая серия 3.x остаются открытыми. Польза рекомендации и загрузка настоящим агентом не заявляются.

В этом блоке также синхронизированы девять требований аудита с основными спеками и архивирован полностью завершённый change [fix-audit-safety-and-verification](../archive/2026-10-23-fix-audit-safety-and-verification/verification.md). Его механические результаты относятся к `f8c9443`; новые живые серии требуют собственного SHA и свидетельств. Коммит и модельные вызовы для этого блока не выполнялись.

## Review fix — 23.10.2026

Обработчик preflight больше не предполагает, что исключение является Error. Null, undefined, строка и объект дают записанный незапущенный результат с launch error/preflight-unavailable, пропущенными setup/task и одним финальным событием; процесс не запускается, исходные сведения ошибки не сохраняются. Отдельный регрессионный тест падал с TypeError до исправления и проходит после; прежние тесты таймаута/отмены также проходят.

`pnpm test` — 256/256, включая четыре новых регрессионных теста runner/адаптера и строгую валидацию спецификаций; `pnpm build`, оба distribution self-test и git diff --check прошли. Dev/eval-код, фикстуры, oracle и документация исключены из обеих поставок. Задача 5.1 закрыта, apply instructions подтверждают 4/19. Настоящие профили, защита авторизации, независимые оценщики, парный отчёт и живые серии остаются открытыми; change активен без sync/archive. Проверки выполнены на macOS/Node 24, модели и настоящая авторизация не использовались.

## Diagnostic fixtures and offline runner — tasks 1.2 and 2.1

22.10.2026: реализованы scripts/evals/fixtures.ts, два schema 1 сценария diagnostic-bare/diagnostic-conflicts и отдельные oracle с проверяемыми digest, scripts/evals/runner.ts и документация docs/evals/RUNNER.md. Материализация создаёт независимые копии одинаковых входов, передаёт только публичные данные; setup и task имеют разные пути/команды и отдельные запросы согласия. Физическая изоляция соседних каталогов этим не доказана.

Runner связывает попытку с frozen metadata и запускает отдельные setup/task процессы после preflight. Launch pass требует наблюдаемого ready подставного драйвера. Есть ограниченные стадии, AbortSignal, staged-ответы только через host review и точный digest, строгий JSONL, обработка некорректного/неполного/избыточного вывода, отказов авторизации и ненулевого exit. Ошибка task не отменяет setup pass. POSIX-группа получает SIGTERM/SIGKILL, даже если лидер уже вышел; auth отличная от none, paid, hostile и Windows блокируются до запуска. Это протокол trusted-подставных процессов, не native-профиль агента или доказательство контроля произвольного executable.

Добавлено 34 теста: 4 для фикстур и 30 для runner. Подтверждены одинаковые байты/независимые копии, защищённые пути, непередача oracle и будущих реплик, согласованная команда и очистка ошибочного дерева; точная связь metadata и событий, разные PID сессий, pass/fail/error/skip, неизвестный расход null, битый/неполный/слишком большой вывод, действия после finished и повтор ready, отказ авторизации, отмена и preflight timeout, таймаут до/после старта и без повторного бюджета task, отсутствие автоматического approve, отказ с чужим digest/из clarification и ограничение зависшего reviewer. Дети и внуки, игнорирующие SIGTERM, прекращают исполнение при timeout/cancel и при нормальном выходе родителя; отдельно проверены их PID/heartbeat. Оставшихся test-driver процессов после серии нет.

Фактические проверки на macOS arm64 / Node v24.15.0:

- `node --test tests/evals/*.test.ts`: 52/52, включая прежние контракты/метрики; подставные значения SHA и вердикты не являются результатами настоящих агентов.
- Отдельный `node --test` в материализованном приложении каждого из двух диагностических сценариев прошёл без установки зависимостей; это baseline исходных приложений, не результат setup/task агента.
- `pnpm test`: 252/252; TypeScript/Astro, сборка сайта и strict OpenSpec (10 активных items, 5 архивов) прошли.
- `pnpm build`: оба скилла, 80 файлов в SHA256SUMS; self-test обоих дистрибутивов passed.
- Проверено отсутствие scripts/evals, fixtures/oracle, tests и docs в обоих дистрибутивах. Проверено существование 37 локальных целей ссылок в 7 Markdown-файлах; якоря не проверялись. `git diff --check` прошёл.

Задачи 1.2 и 2.1 закрыты, повторные apply instructions подтверждают 3/18. Следующие обязательства остаются открытыми: безопасное сохранение наблюдений и синтетическая защита авторизации/границ среды, независимые оценщики, расширенные PREF/SKILL/PROC, парный отчёт и настоящие профили. Сообщение finished подставного процесса не доказывает успешную настройку или выполнение triple; отдельный оценщик ещё нужен. conditionsHash проверен как metadata, не как свидетельство фактической среды. Минимальный Node 22, Windows, вышедшие из группы процессы и живые агенты этим проходом не проверялись. Пользовательские README/reamde_ru.md/docs/assets не редактировались; моделей, реальной авторизации, установок в личную среду, коммитов и публикации не было. Change остаётся активным, без sync/archive.

## Case-based selection clarification — 22.10.2026

В proposal/design/spec и открытые задачи 1.3/2.4/4.2 включён PREF-08 из docs/evals/PREFERENCE_SELECTION.md: один запрос в четырёх контекстах, пригодность независимо от доступности адаптера, сохранение достаточного принятого процесса и явный пробел вместо неподходящей замены. Положительные SKILL-01/PROC-01 проверяют явно запрошенную интеграцию и не подтверждают универсальную рекомендацию этого инструмента. Фикстуры, runner, калибровка судьи и прогоны PREF-08 не выполнены; новых закрытых задач или результатов агента нет.

Строгая валидация OpenSpec, сборка обоих скиллов, проверка progressive resources, оба self-test и git diff --check прошли. В связанном clarification change предпочтений сохранён точный объём проверок. Эти результаты подтверждают целостность материалов и поставки, не качество рекомендаций.

## Contract implementation — task 1.1

22.10.2026: scripts/evals/contracts.ts реализует versioned Experiment/EvalScenario/EvalEvent/Grade, интерфейсы EvalProfile/preflight/EvalGrader, отдельную проекцию исполнителя без oracle/будущих ответов и validateRun для строгой связи с прежней schema 1 результата. Новая документация — docs/evals/CONTRACTS.md. Неизвестный расход остаётся null; неизвестные поля и версии отклоняются, обе ветки/повторы заморожены заранее.

В tests/evals/contracts.test.ts прошли 12 офлайн-тестов: неизвестные схемы/вложенные поля, запрет raw output/env в событиях/профилях, скрытые входы, парные слоты/бюджет, preflight, подмена сценария/результата/событий, отсутствие наблюдаемого старта/финального исхода, ссылки оценщика, неизвестная стоимость и ошибки до запуска. Это проверки контрактов, не доказательство защиты настоящей авторизации, качества оценщика или запуска агентов.

Общий pnpm test — 218/218; pnpm build и self-test обоих установленных скиллов прошли. Стенд/его документация/сценарии не вошли в дистрибутив. Задача 1.1 закрыта, прогресс 1/18 подтверждён повторными apply instructions. Runner, конкретные фикстуры, независимые оценщики, preflight и живые серии остаются открытыми; change не синхронизирован/не архивирован.

Дата: 22.10.2026. Проверка планирования, не результат испытания агентов.

## Initial planning

Подготовлены proposal, design, одна дельта `agent-evaluation-harness` и 16 задач реализации/приёмки. Основания — оба продуктовых документа, очереди 2–3 объединённого плана и действующая `evaluation-results`. Существующий валидатор/агрегатор не изменялся; стенд, профили и оценщики ещё не реализованы.

- `pnpm spec:check`: строгая валидация 9 активных items и 5 архивов прошла.
- Локальные ссылки и якоря изменённых Markdown-документов проверены; задачи этого change остаются открытыми, 0/16.
- Planning artifacts готовы; change не завершён, дельта не синхронизирована и не архивирована.

Живые Codex/Claude/ZCode/DeepSeek, авторизация, изоляция, runner и судьи в этой задаче не запускались. Новых измерений качества продукта нет; тесты приложения и браузеров не повторялись для изменения только документации.

## Scope revision — skill and first process acceptance

Ближайший выпуск теперь включает первый ограниченный адаптер OpenSpec и обязательную программу SKILL-01–04/PROC-01–04 из docs/evals/COMPONENT_INTEGRATION.md. Согласованы proposal, design, требования и tasks: отдельные основания выбора/загрузки/применения, init/adopt/рабочего цикла, положительное покрытие и сохранность достаточной настройки. Добавлены задачи фикстур 1.4 и наблюдаемой серии 3.6; текущий прогресс — 0/18, все задачи реализации/приёмки открыты.

Для PROC нужны реализация 3.3 и офлайн-часть 3.4 change ядра; живые результаты стенда затем подтверждают агентскую часть 3.4. Первые два диагностических сценария не закрывают эту программу. Источник/SHA/лицензия кандидата Ponytail ещё не зафиксированы; Caveman и Spec Kit не объявляются проверенными.

Проверено: pnpm spec:check (10 активных items и 5 архивов), локальные ссылки/якоря изменённых Markdown и git diff --check. Прочитаны локальные версия/справка OpenSpec 1.14.3, init/update не исполнялись. Код, CLI-профили, установка компонентов, модели и оценщики не запускались; дельта не синхронизирована и не архивирована.

## PROC-01 on a newly observed available model — 26.10.2026

После запрошенного ponytail-review/fixes и коммита `6fd6cb535da478df28d1f603b86604e82848c41f` начат следующий bounded этап 3.6. Отдельный профиль Codex 0.157.0/gpt-6-astra/subscription зафиксирован до запросов; 1 startup ready, 6 из 16 executor, 0 judge/human, один repeat, limits 45/180/360. Проекция содержит источник 157 файлов, frozen и фактические результаты.

T setup observed pass: complete canonical apply, пять согласованных операций, kernel receipt, реальный `node --test` и host Node exit 0. Отдельно согласованы/применены три specification-файла. T plan-proposal и B setup-proposal вернули HTTP 429, exit 1 без timeout/команд; B task skip. Planning preview/readiness/graph/design-skip review и implementation не достигнуты; evaluated setup T остаётся missing-quality-review. Смысловая приёмка и 3.6 не закрываются.

Независимо проверены 6 trace hashes/receipts, 48 assertions, 57 selected evidence и две collector packet bindings. Все runtime/source/archive bytes/modes сохранены, оба observed outcome неизменны; никакого legacy timing correction и переноса прежних judge нет. Источник 429 не установлен. Следующий разбор имеет нулевой модельный бюджет; автоматических повторов не было.

## Safe session diagnostics 5.8 — 26.10.2026

Разбор 429 выполнен без новых моделей. Два bounded metadata-сеанса exact Codex 0.157.0 с прежним binary hash и auth link установили account binding с desktop и current ordinaryUsageAllowed=true (5% недельного окна, нет reached/spend block); raw RPC/identity/auth values не сохранены, metadata исходного auth файла неизменна. Это не объяснение исторического specific/model/route limit. Сохранённая серия имеет known subtotal: 434336 input / 5959 output, включая 293376 cached; два failed usage и startup неизвестны. HTTP request count/retry hints/endpoint неизвестны.

Отдельный тикет 5.8 реализован без новых startup/executor/judge/model requests. Trace теперь включает UTC startedAt/endedAt и monotonic duration CLI; HTTP-время ими не подменяется. stderr ограничен 65536, сырой текст не сохраняется. Codex parser выделяет только валидированные scalar hints с fixed source и hash request id, неизвестные cause/retry count остаются null. Независимый P2 review обнаружил сохранение arbitrary terminal headers/private text; новые error/turn.failed теперь только type/detailHash, diagnostic hints вычисляются до этой проекции. Прочие records/commands/usage и исходы не менялись, исторические файлы не переписаны.

Восемь новых parser tests и один fake integration; focused — 27/27. Итоговый `pnpm test` — **594/594**, ноль skip, включая lint/format/types/site/strict active+archived specs. `pnpm build` — 84 файла. Распакованы вне checkout: 84 суммы и оба self-test с пустым PATH прошли, SHA256SUMS совпал с предшествующей поставкой. Legacy collector принял прежние traces без новых optional полей и получил побайтово тот же paired report. Повторное независимое review не нашло P1/P2. До фикса шесть первых parser регрессий падали; отдельный red→green terminal-side regression подтвердил закрытие утечки.

Локальные журналы: `/tmp/tibicen-safe-diagnostics-gate-20261026.log`, `/tmp/tibicen-safe-diagnostics-build-20261026.log`, `/tmp/tibicen-safe-diagnostics-smoke-20261026.json`. Первый полный gate остановился на strict предупреждении длины нового requirement; текст сокращён без удаления сценариев, итоговый gate прошёл. Изменение не подтверждает исправление server 429, full 3.6, human quality или выпуск. Следующий route-пакет имеет 0 модельных запросов.
