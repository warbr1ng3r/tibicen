## ADDED Requirements

### Requirement: Local dependency checks bind their approved environment
Опциональное окружение локальных Node-зависимостей SHALL входить в proposal digest вместе с roots, hash содержимого, объёмом и runtime identity. Поддержка SHALL включаться явно; пакеты не устанавливаются, личное окружение не переносится.

#### Scenario: Existing dependencies are selected
- **WHEN** предложение выбирает локальные node_modules roots существующего проекта
- **THEN** показанный план содержит вычисленную идентичность выбранного package payload
- **AND** изменение payload после согласия не используется скрыто в исполнении

#### Scenario: No dependency environment is selected
- **WHEN** старый или новый план не выбирает окружение
- **THEN** действующее поведение snapshots и environmentReady сохраняется
- **AND** наличие зависимостей в исходном checkout не даёт неявного доступа из копии

#### Scenario: PATH selects another Node runtime
- **WHEN** локальная среда согласована с конкретной Node version, а PATH содержит другой Node
- **THEN** compiled plan закрепляет явный Node entrypoint абсолютным путём текущего runtime
- **AND** execution независимо отвергает иную или выбираемую через PATH команду до запуска

### Requirement: Baseline and final use independent copies of one captured environment
Согласованные project checks SHALL использовать отдельные исполняемые копии одного захваченного до baseline окружения. Мутации прогона SHALL не менять исходный проект, захваченное окружение или вход следующего прогона.

#### Scenario: A check creates generated package caches
- **WHEN** build записывает Astro cache в свою исполняемую копию
- **THEN** final и следующий запуск получают исходное согласованное окружение без этого изменения
- **AND** исходные зависимости и файлы приложения сохранены

#### Scenario: Real landing checks run
- **WHEN** выбраны поддержанные локальные зависимости и явные Node entrypoints landing
- **THEN** публичный Tibicen выполняет полный согласованный baseline/final build/test
- **AND** зелёное сравнение требует реального успеха обоих наборов без внешнего runner

### Requirement: Dependency copies preserve explicit scope and limitations
Ссылки зависимостей SHALL разрешаться только внутри копии проекта; внешние/абсолютные ссылки, специальные объекты и превышение лимитов SHALL отклоняться. Чувствительные пути, непереносимые shims и caches SHALL не переноситься; недоступное окружение SHALL давать unverified с причиной. Фильтрация секретов обычного приложения SHALL сохраняться.

#### Scenario: A package links to a workspace
- **WHEN** относительная ссылка указывает на workspace внутри исходного проекта
- **THEN** она указывает только на соответствующее место снимка проекта
- **AND** исполняемая копия не ссылается на оригинальный checkout

#### Scenario: Environment is unsafe or unavailable
- **WHEN** root, ссылка, identity или лимиты не подходят поддержанному профилю
- **THEN** окружение не исполняется и причина сохраняется без ложного green
- **AND** незапрошенные файлы владельца и оригинальные зависимости не меняются

#### Scenario: Vendor code contains credential-shaped examples
- **WHEN** пользователь явно выбирает и согласует package payload с фиксированным hash
- **THEN** он рассматривается как доверенный исполняемый код, не как агентский контекст или личная конфигурация
- **AND** отчёт не обещает распознавать произвольные встроенные credentials; известные чувствительные пути исключаются, обычная проверка project source остаётся прежней
