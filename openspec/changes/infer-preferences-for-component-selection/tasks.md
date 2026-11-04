# Tasks

## 1. Product and workflow alignment

- [x] 1.1 Включить §9 в roadmap, его таблицу покрытия и контекст OpenSpec отдельным change; проверить ссылки и сохранение статусов прежних задач без объявления новой приёмки.
- [x] 1.2 Уточнить общие стадии scan/interview/agent-arch/proposal и правила рекомендаций: доступные основания, inferred/explicit, достаточность настройки, инициативный поиск, отсутствие признаков, существенный конфликт и пригодность для кейса независимо от наличия адаптера; проверить доступность ресурсов в обоих дистрибутивах и соответствие каждому сценарию дельты.

## 2. Visible assumptions

- [x] 2.1 Показать существующие assumptions в summary/report, описать пример с основанием без новой обязательной схемы; тестами обоих установленных CLI проверить read-only предложение/отчёт, отказ без approve и при изменении оснований, сохранение в паспорте/report, совместимость прежних значений и отсутствие скрытых установок/исполнения.

## 3. Acceptance program

- [x] 3.1 Подготовить docs/evals/PREFERENCE_SELECTION.md с конкретными входами из инструкций/диалога, явным override, отсутствием признаков, достаточной настройкой, существенным конфликтом, полезным пробелом и PREF-08 с разными контекстами одного запроса; для каждого задать наблюдаемые критерии и отделить закрытые ожидания от входа исполнителя.
- [x] 3.2 Явно связать §9 и матрицу с задачами/контрактом стенда и программой живой приёмки; проверить, что runner/формат сценариев не дублируются, сценарные материалы не входят в дистрибутив, а неподтверждённое поведение не отмечено успешным.

## 4. Integration verification

- [x] 4.1 Выполнить pnpm test, pnpm build, self-test обоих скиллов и строгую валидацию; сохранить фактические результаты и ограничения в verification.md, отдельно указав отсутствие либо реальные свидетельства живых сценариев §9.

## Workflow follow-up

- После реализации провести семантическую приёмку §9, включая PREF-08, через build-agent-evaluation-harness с проверенным preflight, разрешёнными лимитами и независимыми наблюдениями; подготовка инструкций/программы и зелёные тесты передачи данных не подтверждают качество выбора.
- Синхронизировать дельту и архивировать change только при явно подтверждённом объёме приёмки; данный проход не запускает модели и не создаёт коммитов.

## 5. Observed clarification correction

- [x] 5.1 Clarify the interview branch for a user who is uncertain about a mandatory project stage: when questions are allowed, ask before proposing removal, combination or a changed procedure; retain the current stage pending that answer and preserve the no-questions safe-gap branch. Keep the failed PREF-06 response, verify both built skill resources and existing matrix/resource tests, independently review the diff and run one separately frozen fresh-context check within the existing24-context ceiling. Record its actual outcome and remaining human/semantic limits without treating a question as approval.
- [x] 5.2 Distinguish a situational reply format from an explicitly chosen persistent project rule in the shared interview reference. Preserve the failed 223 PREF-02 recommendation, its actual persisted values and root review mistake; independently review the clarification, bind the two changed distribution resources, and separately observe the unchanged PREF-02 input with a fresh corrected candidate and finite allocation. Record inference status, scope, preservation and any consented effects without regrading the failed attempt or transferring its approval.
