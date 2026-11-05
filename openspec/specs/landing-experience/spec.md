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
Installation SHALL offer npm, pnpm and Yarn 2+ with the same pinned installer, exact published distribution, two selected Tibicen skills and copy behavior. The primary command SHALL explicitly select the installer's universal target rather than a brand or implicit auto-detection. Building skills from source SHALL remain independent from landing dependencies.

#### Scenario: A visitor switches package manager and agent

- **WHEN** a visitor selects npm, pnpm or Yarn 2+ for the normal installation route
- **THEN** the command preserves skills@1.7.4, the exact distribution pin, both skill names, global copy behavior and --agent universal
- **AND** README and landing describe that same common-folder route without a mandatory agent selector


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
The landing SHALL explain the two skills inside the user's existing file/Node-capable agent, for initial setup or improvement. First use SHALL present universal installation, explicit skill-file reading in the project session and an ordinary request before optional preferences. It SHALL separate explicit loading from native discovery and retain material platform/operation limits and a complete manual-folder fallback.

#### Scenario: A first-time visitor follows installation

- **WHEN** a visitor opens either language route and follows the main action
- **THEN** they can identify both skills, the common user-scope installation folder, where to run the command and the exact first reading/request step
- **AND** their harness, model and provider need not appear in Tibicen's catalog

#### Scenario: The agent does not find the skill

- **WHEN** automatic skill discovery is absent or unknown
- **THEN** the page gives the explicit SKILL.md reading route instead of requiring a different harness
- **AND** the route does not claim automatic discovery or compatibility

#### Scenario: The installer is not a usable route

- **WHEN** the visitor chooses manual installation
- **THEN** guidance names the published archive and checksum verification, both skill directories and their complete resources, the chosen destination and exact explicit-load step
- **AND** it does not suggest copying SKILL.md alone or invent a native loading folder

#### Scenario: The host lacks local operations

- **WHEN** the selected host cannot read project files or run the required Node operations
- **THEN** the visitor sees the specific local/manual requirement and relevant platform limits
- **AND** the page does not imply a completed automated setup or require new provider credentials


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
