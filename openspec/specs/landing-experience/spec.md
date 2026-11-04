# landing-experience Specification

## Purpose
Объяснять два сценария Tibicen и давать проверяемый первый шаг на самостоятельной статической странице без обязательного заполнения пресета или передачи ответов серверу.

## Requirements

### Requirement: Honest first-use guidance
Лендинг SHALL различать первоначальную настройку и улучшение существующей инфраструктуры, показывать установку и первый запрос до необязательного конструктора. Страница SHALL отделять доступный локальный старт от будущей публичной доставки и не объявлять непроверенные агенты или результаты evals готовыми.

#### Scenario: A visitor starts without a preset
- **WHEN** пользователь впервые открывает страницу
- **THEN** он находит оба сценария, команды установки и пример первого запроса без заполнения формы
- **AND** конструктор пресета изначально свёрнут

#### Scenario: Public distribution is not configured
- **WHEN** публичный адрес и канал доставки ещё не определены
- **THEN** предлагается сборка из исходников, без вымышленного owner/repo и обещания готового публичного релиза

### Requirement: Equivalent installer commands
Установка SHALL предлагать npm, pnpm и Yarn 2+ для выбранного поддержанного агента с одинаковым закреплённым установщиком и параметрами копирования. Сборка скиллов из исходников SHALL работать без установки зависимостей лендинга.

#### Scenario: A visitor switches package manager and agent
- **WHEN** выбран один из npm/pnpm/Yarn 2+ и один из Codex/Claude Code/Cursor
- **THEN** показывается соответствующий запуск `skills@1.7.4 add ./dist -g --agent <id> --copy` после `node scripts/build.ts`
- **AND** README и лендинг описывают один маршрут доставки

### Requirement: Coherent brand and project illustration
Страница SHALL использовать нейтральный тёмно-серый фон, зелёный акцент и наклонённую иллюстрацию структуры проекта. Логотип «Точная сборка» SHALL сохранять общий силуэт в шапке, подвале и favicon, оставаться различимым на соответствующем фоне и не заменять доступное имя ссылки.

#### Scenario: Brand assets appear in different contexts
- **WHEN** страница и вкладка показывают знак
- **THEN** используется одна геометрия балки, стойки и диагональной опоры; favicon адаптирует светлую часть к теме
- **AND** ссылка на главную имеет доступное имя независимо от декоративного изображения

#### Scenario: The illustration is viewed on a narrow screen
- **WHEN** доступная ширина уменьшается до 280 px
- **THEN** дерево и его пояснения перестраиваются без горизонтального переполнения или потери содержимого

### Requirement: Motion respects environment and user preferences
Основной фон SHALL быть плоским графом с независимо движущимися вершинами и следующими за ними рёбрами. Анимация SHALL останавливаться вне экрана, в скрытой вкладке и при reduced motion; при недоступном Canvas остаётся статический фон. Сравнение другой геометрии SHALL включаться только явно через preview.

#### Scenario: The page opens with no preview parameters
- **WHEN** пользователь открывает главную без параметров
- **THEN** выбран плоский граф, а не волна или объёмная ферма

#### Scenario: Animation is not appropriate
- **WHEN** включён reduced motion, вкладка скрыта или граф вышел из области просмотра
- **THEN** непрерывная анимация графа не выполняется
- **AND** при недоступном Canvas остаётся локальная SVG-иллюстрация

#### Scenario: Geometry comparison is requested
- **WHEN** включён `?preview=geometry`
- **THEN** доступны только предусмотренные варианты; прокрутка остальных фонов ограничена и не анимируется при reduced motion

### Requirement: Static local delivery
Лендинг SHALL собираться отдельно в статические файлы, использовать локальные ресурсы исполнения и сохранять необходимые уведомления лицензий. Открытие страницы SHALL не требовать backend, аккаунта, аналитики, внешних шрифтов или runtime дистрибутива Tibicen.

#### Scenario: A built page is served locally
- **WHEN** открывается результат `pnpm build:site`
- **THEN** внутренние ресурсы разрешаются, лицензии AstroWind/Starwind доступны, внешние ресурсы исполнения и аналитика не запрашиваются
- **AND** форма создаёт пресет в браузере по общему контракту предпочтений

### Requirement: First use has a direct route and recovery guidance

The landing SHALL explain that Tibicen installs two skills inside the selected coding agent, for initial setup or improving existing instructions. It SHALL present agent selection, the pinned command, a fresh project session and a first request in understandable order. Material loading/Windows limits SHALL remain visible, with deeper details and a documented recovery route.

#### Scenario: A first-time visitor follows installation

- **WHEN** a visitor opens either language route and follows the main action
- **THEN** they can identify what is installed, where to run the command and what to send the agent next
- **AND** supported manager/agent choices and exact copied parameters remain unchanged

#### Scenario: The agent does not find the skill

- **WHEN** a visitor looks for help after installation
- **THEN** concise guidance points to a fresh session, the selected target and documented loading steps
- **AND** any manual fallback is labeled without promising automatic discovery

### Requirement: Illustrations show the starting project and complete interaction

The page SHALL show clearly labeled illustrative init and adopt flows with a recognizable starting project, ordinary user request, agent inspection, necessary clarification or its absence, exact proposed change, approval and outcome. Preserved application files and useful decisions SHALL be visible. Illustrations SHALL NOT claim recorded success, human benefit or unreleased functionality.

#### Scenario: A visitor evaluates an existing-project example

- **WHEN** the visitor reads the adopt illustration
- **THEN** the initial useful rule and obsolete instruction are understandable, as are the proposed correction and preserved content
- **AND** the result distinguishes file checks from unverified future behavior

#### Scenario: A visitor has no agent instructions yet

- **WHEN** the visitor reads the init illustration
- **THEN** they can see what existed before and the minimal instructions proposed after inspection
- **AND** a question is not invented when existing evidence suffices

### Requirement: Mobile first action is not dominated by decoration

On narrow screens the hero illustration SHALL remain legible without dominating the first-use route. The installation command SHALL follow concise setup guidance rather than repeated technical explanation. Both languages SHALL preserve usable controls, focus, reduced-motion behavior and content reflow without horizontal overflow at 320 CSS pixels.

#### Scenario: The page is viewed on mobile

- **WHEN** either language route is viewed at 390 by 844 pixels or 320 CSS pixels wide
- **THEN** the hero occupies less vertical space than the reviewed baseline and the installation card follows its heading with concise context
- **AND** the main action, limits, selectors and command remain usable without horizontal scrolling
