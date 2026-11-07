## ADDED Requirements

### Requirement: Installing Tibicen alone retains initial setup routing
Tibicen SHALL выбирать первую настройку, если единственная инфраструктура — канонические папки Tibicen в поддержанных корнях скиллов. Подсказка SHALL сохранять полный инвентарь и SHALL NOT менять пустоту проекта, согласование, доверие, исключения и разрешения записи.

#### Scenario: First setup after project-local installation
- **WHEN** установлены tibicen-init и tibicen-adopt, другой агентской инфраструктуры нет
- **THEN** scan выбирает init и сохраняет разрешённые файлы скиллов как инфраструктуру
- **AND** существующие исходники приложения не меняются

#### Scenario: Existing user setup alongside the utility
- **WHEN** также есть пользовательские инструкции, другой скилл, зарегистрированная память или паспорт
- **THEN** scan выбирает improve и сохраняет все наблюдаемые файлы

#### Scenario: Noncanonical skill names remain conservative
- **WHEN** найден скилл с похожим или изменённым именем вне точных канонических имён Tibicen
- **THEN** он остаётся существующей инфраструктурой при выборе режима

#### Scenario: Initial route does not make a folder empty
- **WHEN** каталог занят только установленными проектными скиллами Tibicen
- **THEN** init не разрешает стартовые исходники, скрытый package/Git init
- **AND** защиты исходного содержимого, запрещённых путей и симлинков действуют

#### Scenario: A self-named example remains owned by outer user rules
- **WHEN** пример с именем канонического скилла Tibicen вложен в распознанную область пользовательских правил, команд, инструкций или MCP
- **THEN** эти пользовательские файлы по-прежнему выбирают improve
- **AND** внутреннее имя папки не ослабляет инвентарь и защиту записи
