# Spec Delta

## Purpose

Сохранять наблюдения по попыткам испытаний и считать явные показатели без сокрытия ошибок, подмены пропуска успехом или заявления о поведении агента на основании одной агрегированной записи.

## ADDED Requirements

### Requirement: Strict attempt records
Валидатор SHALL принимать только schema 1 с непустыми id/scenarioId/profileId, вариантом tibicen либо baseline, boolean started и стадиями launch/setup/task. Неизвестные и отсутствующие собственные поля SHALL отклоняться. Статусы setup/task — pass/fail/error/skip, launch — pass/error/skip; durationMs конечный и неотрицательный, skip имеет нулевую длительность, любой неположительный исход требует непустую причину, pass не содержит reason.

#### Scenario: A malformed observation is supplied
- **WHEN** запись содержит неизвестную схему, лишний ключ, унаследованное обязательное поле, бесконечное время или skip без причины
- **THEN** валидация отклоняет запись до включения в сводку

### Requirement: Stage order preserves partial outcomes
started SHALL означать наблюдаемый старт сценария, а не создание процесса. Без старта launch имеет error/skip и остальные стадии skip; после старта launch не бывает skip, а launch error пропускает остальные стадии. task SHALL выполняться только после setup pass; ошибка task сохраняет успешный setup.

#### Scenario: Launch is blocked before the scenario starts
- **WHEN** started=false и launch=error с причиной
- **THEN** setup и task остаются skip, а попытка видна в числе незапущенных

#### Scenario: A task fails after successful setup
- **WHEN** setup=pass и следующая задача завершилась error или fail
- **THEN** успешная настройка сохраняется, а сквозной успех не засчитывается

### Requirement: Explicit denominators and repeat identity
Сводка SHALL возвращать total, started, незапущенные error/skip и исходы стадий, а для каждой метрики — numerator/denominator/rate. setupSuccess равен setup pass / started; taskSuccessGivenSetup — обе стадии pass / setup pass; endToEndSuccess — обе стадии pass / started. При нулевом знаменателе rate SHALL быть null. Повторный id отклоняется, новая попытка того же сценария имеет новый id; входные записи не изменяются.

#### Scenario: Failures and skips occur after an observed start
- **WHEN** среди начатых попыток есть error, fail или skip
- **THEN** они остаются в знаменателе started; заблокированные до старта учитываются отдельно

#### Scenario: No scenario starts
- **WHEN** сводка пуста либо содержит только незапущенные попытки
- **THEN** метрики с нулевым знаменателем содержат null вместо 0 или ложного успеха

#### Scenario: The same scenario is retried
- **WHEN** две записи имеют один scenarioId и разные id
- **THEN** обе учитываются; повтор одного id отклоняется как дублирование

### Requirement: Aggregation is development tooling
Модуль SHALL только проверять и агрегировать переданные наблюдения, без вызова моделей и оценки доказательств поведения. Выбор сопоставимой когорты остаётся обязанностью вызывающего стенда. Сборка SHALL исключать scripts/evals из обоих распространяемых скиллов.

#### Scenario: An aggregate report is produced offline
- **WHEN** локальные тесты строят сводку и собирают дистрибутив
- **THEN** модели не вызываются, runtime скиллов не содержит evals
- **AND** сводка не выдаётся за grader, парный эксперимент или подтверждённую пользу продукта
