# Tasks

## Current policy — 3 November 2026

The adopted [release evidence policy](../separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md) retains every mandatory technical observation, invariant, candidate/platform/delivery check and maintenance obligation. Record their scope and remaining gaps in the [engineering assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md). Human tasks 3.3–3.4 are **DEFERRED** voluntary postpublication work, remain unchecked and are not technical release prerequisites. Historical counts and alpha approvals below are not current acceptance or new publication permission.

## Historical checkpoint — 27 October 2026

Полная MVP-программа1–4 на 27.10.2026: выполнены 1.1–1.3, 2.1, 2.2 и 2.5, 6/14 для полного MVP; отдельная ограниченная alpha опубликована, группа5 выполнена5/5. Код офлайн-CI уже есть и проверен локально; первый удалённый Ubuntu run не подтверждён. Локальная поставка 0.1.0/source3fb29ef заморожена для ограниченной macOS/Codex alpha, без объявления полной публичной приёмки. Свидетельства — в verification.md; критический путь — docs/DEVELOPMENT_PLAN.md. Доставка из Git, обновление/удаление, продуктовая приёмка кандидата, пилот и решения владельца остаются открытыми.

## 1. Versioning and contribution

- [x] 1.1 Убрать независимую версию из contracts, получать версию своей поставки из package.json; тестами проверить согласованность CLI/паспорта/обоих скиллов вне checkout и независимость версии схемы.
- [x] 1.2 Описать Conventional Commits, SemVer 0.x, changelog и подготовку кандидата; проверить примеры patch/minor/prerelease и отсутствие автоматического тега для обычного коммита.
- [x] 1.3 Подготовить CONTRIBUTING/CHANGELOG, issue/PR-шаблоны, кодекс поведения и согласованный README/SECURITY; проверить команды участия и явно перечислить незаполненные контакты до публикации.

## 2. CI and distribution acceptance

- [x] 2.1 Добавить офлайн-CI с закреплённым pnpm и SHA внешних Actions/минимальными правами; проверить test/spec/build и запрет передачи авторизации моделей fork PR.
- [x] 2.2 Проверить комплектность, версии и суммы чистой сборки, self-test распакованного дерева и отсутствие dev/eval-ресурсов, внешнего OpenSpec CLI и сгенерированных им скиллов; подтвердить наличие собственных ресурсов опционального адаптера и сохранить результаты кандидата.
- [ ] 2.3 После определения owner/repo и размещения собранного дерева проверить конкретную установку по tag/full SHA закреплённым установщиком в отдельный user-scope; подтвердить байты обоих скиллов, ресурсы и работу вне checkout/без Git после установки на заявляемых платформах.
- [ ] 2.4 Проверить обновление ранее установленной версии с пресетами, паспортом, локальными правками и незавершённой сессией; подтвердить гарантии группы 2 `extend-infrastructure-contracts`, отказ/миграцию неизвестной схемы и сохранение истории, описать ограничения.
- [x] 2.5 Проверить удаление выбранным установщиком в тестовом user-scope; документировать сохранность пользовательских данных, оставшиеся настройки и необходимые ручные действия.

- [x] 2.6 Prepare a manual-only standalone platform smoke workflow and a small portable CLI integration check for the declared runtime/OS cells; run local available cells and leave actual remote cells unverified until dispatch. Keep the default PR gate unchanged and retain Windows execution refusal where required.

## 3. Maintenance and voluntary research

- [ ] 3.1 Назначить ответственного за ядро/адаптеры и описать ежемесячный/событийный пересмотр; проверить наличие источника, даты, области и фактических свидетельств в матрице, повторить init/adopt для изменившихся рекомендаций.
- [ ] 3.2 Определить рабочие контакты безопасности и независимый канал advisory/контрольных сумм; проверить доступность маршрутов и перед открытием репозитория проверить материалы/историю на секреты и личные данные, сохранив лицензии.
- [ ] 3.3 **DEFERRED — voluntary postpublication research.** Before a pilot, define willing cohorts/sizes, their ordinary baseline, time/corrections/manual-integration measurements and anonymization; retain §14 definitions, the 50-session/8-week checkpoint and the separate 30-day reuse cohort. Experiment fractions do not replace these measures. Deferral does not complete recruitment, the protocol or human calibration.
- [ ] 3.4 **DEFERRED — voluntary postpublication research.** Conduct the initial private init/adopt pilot when participants are available and retain separate anonymized usefulness/limit summaries. Report absent observations and unknown benefit; do not claim a completed checkpoint, reset its clock or enroll the owner by assumption.

## 4. Candidate readiness

- [ ] 4.1 Assemble candidate-bound technical evidence for the core clarifications, first OpenSpec adapter (3.3–3.4 of extend-infrastructure-contracts), SKILL-01–04/PROC-01–04 from docs/evals/COMPONENT_INTEGRATION.md, L0/L1 invariants and functional quality, declared platform coverage, delivery/update/recovery and maintenance. Independently review source/payload/version bindings, positive skill loading/use and process init/adopt/fresh-session use; keep mandatory missing observations open. Record any impact analysis separately from actual candidate execution, preserve failures and attempt limits, and disclose absent human calibration/pilot without claiming measured benefit or future-adapter support.
- [ ] 4.2 Подготовить воспроизводимый кандидат и ручной draft с source SHA, версией/суммами, release notes, матрицей/ограничениями, owner/repo/сайтом и инструкцией обновления; сверить все ссылки и байты без публичного выпуска.

## 5. Approved limited alpha0.1.0-alpha.1

- [x] 5.1 Зафиксировать одобренный alpha scope/версию/ограничения, исправить замечания финального ponytail-review, проверить публичный source snapshot без приватной истории и пройти full local gate.
- [x] 5.2 Создать разрешённые source commits, отправить проверенный snapshot в public main и получить первый remote CI; сохранить public source SHA и соответствие локальному исходнику.
- [x] 5.3 Собрать standalone alpha из public source, проверить суммы/версии/self-tests и опубликовать immutable distribution SHA; реально установить его pinned skills1.7.4 с explicit init/adopt filter в отдельном HOME.
- [x] 5.4 Проверить переход frozen0.1.0→alpha с backup локальных правок, сохранностью preset/manifest/state, same-session resume, отказом неизвестной схеме и remove без потери внешних файлов.
- [x] 5.5 Подготовить и опубликовать prerelease tag/assets/суммы/release notes и Pages; подтвердить фактические GitHub URL/хэши и указать оставшиеся ограничения.

## Workflow follow-up

- Публичный выпуск и выкладка — отдельное явное действие после проверки кандидата; опубликованные байты не заменяются.
- После реализации и приёмки синхронизировать дельты и архивировать change с фактическими свидетельствами, не по одному статусу planning artifacts.
