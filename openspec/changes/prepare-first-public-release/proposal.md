# Proposal

## Current release policy — 3 November 2026

The adopted [evidence policy](../separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md) separates technical release acceptance from voluntary human usefulness research. Full MVP functionality, L0/L1 invariants and functional quality, observed skill/process loading and use, declared coverage, candidate delivery/update/recovery and maintenance remain required. The [engineering assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md) records candidate-bound observations and independent review; absent mandatory evidence remains open. Human calibration and the initial pilot are deferred postpublication work, not completed prerequisites. Historical results and the limited alpha approval below retain their original scope.

## Current maintenance policy — 3 November 2026

The adopted [maintenance-channel contract](../define-maintenance-reporting-and-checksum-channel/specs/maintenance-channels/spec.md) defines scoped existing reporting routes, explicitly replaces the unfulfilled general private conduct-inbox promise and retains the confirmed private vulnerability recipient, privacy and recusal without an alternate appointment. The checksum channel means a separate committed Pages artifact/publication/origin with shared GitHub administration; the original-alpha index is prepared locally. Actual deployment/public-byte and route-accessibility verification remain pending. [Release tasks 3.1–3.2](tasks.md) retain source review, changed-recommendation init/adopt, privacy/licenses and working maintenance evidence; local adoption does not complete them or authorize publication. Dated records retain their original context.

## Why

Локальная установка собранных скиллов ещё не подтверждает публичную доставку, безопасное обновление и готовность сопровождения. Очередям 4–5 объединённого плана нужны требования к проверяемому кандидату, открытому репозиторию и условиям первого выпуска.

## What Changes

- Проверить установку, обновление и удаление фактического дистрибутива, сохранность пользовательских данных и ограничения платформ.
- Установить единый источник версии продукта, отдельную версию схем, Conventional Commits, SemVer 0.x и changelog.
- Подготовить офлайн-CI и документы участия/безопасности без передачи ключей внешним PR.
- Зафиксировать конкретный Git-маршрут доставки, происхождение байтов, независимый канал предупреждений/сумм и процедуру сопровождения правил.
- Prepare the first full candidate after technical acceptance of the core, the first bounded OpenSpec adapter and mandatory SKILL/PROC observations: additional-skill installation/loading/use, process init/adopt and a working cycle in a fresh session.
- Defer the voluntary init/adopt pilot and human rubric calibration until participants are available after publication. Retain their protocol, unknown benefit and the existing postpublication checkpoints; engineering review does not supply human grades.

## Capabilities

### New Capabilities

- `release-process`: versioning, candidate verification, open-source participation, separately scheduled voluntary research and evidenced public-release readiness.

### Modified Capabilities

- `verification-and-delivery`: проверка установленного дистрибутива, обновления/удаления и актуальности сведений о поддержке.

## Impact

The implementation scope covers versioning in package.json/CLI/builds, CI, contribution documentation, delivery checks and release notes. Core and first-adapter implementation belongs to `extend-infrastructure-contracts`; this change verifies the installed distribution. Current evidence and unfinished work are recorded in [tasks](tasks.md) and [verification](verification.md). Planning and policy edits do not create a remote, run a study or authorize publication. The first OpenSpec adapter remains in the release; Spec Kit and other future process adapters do not block it. The external CLI and its generated skills stay outside Tibicen and require separate target-project installation approval.

## Approved alpha scope — 27.10.2026

Владелец подтвердил предложенный ограниченный prerelease0.1.0-alpha.1 и полный проход commit/push/доставка/prerelease/Pages. Это отдельная предварительная итерация с явными ограничениями, а не объявление полного MVP. Полная программа1–4 остаётся открытой; alpha-проход отслеживается группой5. Обязательны проверенные неизменяемые байты, фактическая установка из Git, update/resume/remove и честные release notes. Новый источник runtime, дополнительные SDK/API и чужие зависимости не добавляются.
