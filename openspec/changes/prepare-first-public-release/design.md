# Design

## Current release policy — 3 November 2026

Apply the adopted [technical/human evidence distinction](../separate-release-evidence-from-usefulness-pilot/design.md). Technical acceptance requires candidate-bound observations and independent engineering review, including functional quality, mandatory positive skill/process loading and use, platform applicability, immutable delivery/update/recovery and maintenance. Review cannot create missing observations; public research is not measured Tibicen benefit. The [engineering assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md) records each criterion, source/payload/version binding, observation, reviewer context, conclusion and limits.

Human calibration and the initial voluntary pilot have a separate postpublication schedule. Preserve the calibrated-study protocol, existing outcomes, missing human checks and all failures. No policy edit grants a model budget, commit or publication permission. The dated notes below retain their original context; current dependencies are stated in Release Dependencies.

Requirement/task map: `Pilot measures both product scenarios without repository disclosure` maps to deferred tasks 3.3–3.4; `First publication requires explicit release evidence` maps to technical candidate task 4.1. The installed-delivery, positive workflow-integration, preservation/schema and maintenance requirements in `verification-and-delivery` remain unchanged.

## Current maintenance policy — 3 November 2026

The adopted [maintenance-channel contract](../define-maintenance-reporting-and-checksum-channel/specs/maintenance-channels/spec.md) defines scoped existing reporting routes, explicitly replaces the unfulfilled general private conduct-inbox promise and retains the confirmed private vulnerability recipient, privacy and recusal without an alternate appointment. The checksum channel means a separate committed Pages artifact/publication/origin with shared GitHub administration; the original-alpha index is prepared locally. Actual deployment/public-byte and route-accessibility verification remain pending. [Release tasks 3.1–3.2](tasks.md) retain source review, changed-recommendation init/adopt, privacy/licenses and working maintenance evidence; local adoption does not complete them or authorize publication. Dated records retain their original context.

## Historical context — 27 October 2026

См. `proposal.md`. Сборщик создаёт два самостоятельных скилла и SHA256SUMS, исключает evals и инструменты разработки. Локальные установки уже описаны с ограничениями в README. На 27.10.2026 версия читается из собственного package.json, офлайн-CI написан и его команды проверены локально; удалённого CI run и проверенного публичного Git-маршрута нет. Локальная поставка source3fb29ef заморожена, но полная приёмка кандидата открыта. Владелец/адрес публикации и рабочие контакты ещё не определены.

## Goals / Non-Goals

**Goals:** проверять распространяемые байты и обновление, отделить версию продукта от схем, сделать вклад и сопровождение понятными, собрать доказательства готовности кандидата.

**Non-Goals:** автоматическая публикация без поручения владельца, новый установщик/деинсталлятор, обязательные аккаунты/аналитика, автоматический релиз по каждому коммиту или выпуск всех будущих частей process-configuration. Первый ограниченный адаптер OpenSpec включён в ближайшую приёмку явно.

## Decisions

- **Версия берётся из собственного package.json.** Корневой манифест задаёт исходную версию, сборка переносит её в package.json каждого скилла; CLI/паспорт читают версию своей поставки. Это работает вне checkout без зависимости от корневого репозитория. Независимый литерал VERSION убирается; SCHEMA_VERSION остаётся отдельным контрактом. Ошибка чтения версии не маскируется старой константой.
- **Сначала ручной кандидат.** Conventional Commits и SemVer 0.x задают историю и changelog; подготовка draft не публикует его автоматически. Release-please откладывается до проверки доставки. При дефекте опубликованного артефакта выпускается новая версия без переписывания тега.
- **Офлайн-CI проверяет поставку.** Используются закреплённый pnpm, существующие проверки, чистая сборка и self-test распакованного дерева. Проверяются состав и согласованные версии. Actions закрепляются SHA, права минимальны, авторизация живых агентов недоступна fork PR. Новая платформа тестирования не требуется.
- **Git-маршрут является частью кандидата.** Установщик должен получить готовое дерево с двумя скиллами по конкретному tag/full SHA. Локальный dist и архив релиза сами по себе этого не доказывают. Конкретные owner/repo/размещение дерева фиксируются перед проверкой публичного маршрута; до этого готовится только локальная процедура, не обещается рабочий публичный адрес.
- **Доставка и инфраструктура обновляются раздельно.** Группа 2 `extend-infrastructure-contracts` владеет обработкой блоков, компонентов, схем и resume; этот change проверяет установленную версию и переход между поставками, не дублируя реализацию. User-scope тестовый; личные каталоги разработчика не используются как фикстура. Удаление выполняет выбранный установщик.
- **Сопровождение — процесс с ответственным.** Датированные источники/версии и порядок пересмотра входят в матрицу и документацию. Значимые изменения проходят init/adopt-сценарии перед выпуском. Документ не создаёт автоматическое расписание, вечную совместимость или скрытое обновление.
- **Human usefulness research remains separate.** Define voluntary cohorts, their ordinary baseline, time/corrections/manual-integration measurements and anonymization before participation. Keep init/adopt outcomes separate, the 50-session/8-week postpublication checkpoint and the 30-day reuse cohort. The initial pilot and human calibration are deferred until participants are available after publication; insufficient data stays explicit and does not reset the clock. Engineering evidence cannot replace participant observations or human grades. No automatic telemetry or owner enrollment follows.
- **Компоненты проходят сквозную приёмку установленного Tibicen.** Обязательная программа [SKILL/PROC](../../../docs/evals/COMPONENT_INTEGRATION.md) связывается с source SHA и проверенными байтами кандидата: конкретный скилл установлен, загружен и применён, OpenSpec проходит init/adopt и рабочий цикл в новой сессии. Само имя Ponytail/Caveman не подтверждает источник, а первые два диагностических сценария не закрывают этот гейт. Установка внешнего CLI отделена от дистрибутива и согласия на приложение.

## Risks / Trade-offs

- Локальная сборка может отличаться от установки из Git → проверить конкретную закреплённую команду и фактические байты.
- Контакты/owner пока неизвестны → оставить задачу открытой; не подставлять вымышленные адреса и не объявлять публикацию готовой.
- CI does not prove agent use → acceptance still requires the core contract, observed agent/component behavior and independent engineering review; missing human benefit remains separately disclosed.
- Свежая дата без повторной проверки создаёт ложную актуальность → сохранять источник/область свидетельства, ограничения и ответственного.

## Release Dependencies

CI/material preparation may proceed alongside core and harness work. The full candidate still requires the core clarifications, first OpenSpec adapter (3.3–3.4 of `extend-infrastructure-contracts`), mandatory SKILL/PROC observations, the technical §10.11 gate with independent engineering review, actual declared coverage, candidate-specific delivery/update/recovery, working maintenance routes and explicit publication authorization. Future process adapters do not become hidden gates. An unknown source, unobserved loading/use, or unavailable mandatory profile leaves its technical criterion open. Human calibration and pilot tasks 3.3–3.4 are **DEFERRED**, remain unchecked and do not block technical release acceptance. Their absence and unmeasured benefit must be disclosed; neither this policy nor old alpha permission authorizes a new publication.

## Approved limited prerelease

27.10.2026 владелец подтвердил0.1.0-alpha.1 и commit/push/prerelease/Pages. Группы1–4 сохраняют полные MVP-критерии; группа5 проверяет только согласованную предварительную итерацию. Контакты/пилот/человеческая выборка и неисполненные варианты обозначаются открытыми. В релизе заявляются только реальные наблюдения macOS/Node24/Codex app; Linux CI — отдельный результат, остальные агенты не получают покрытие автоматически.

В public main отправляется проверенный source snapshot с сохранёнными лицензиями и всеми необходимыми build/test inputs. Локальная development history, .scratch/private artifacts и непринятый research не отправляются. Для runtime сохраняется побайтное равенство продуктового состава; snapshot-only редактура касается внутренних ссылок/локальных путей в dev-документах. Готовое standalone дерево публикуется отдельно в distribution branch; только его полный SHA и tag используются установщиком. `owner/repo@name` у skills1.7.4 означает фильтр скилла, поэтому ref задаётся полным GitHub tree URL.
