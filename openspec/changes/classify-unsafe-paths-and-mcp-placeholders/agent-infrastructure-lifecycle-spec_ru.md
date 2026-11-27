# Delta translation

Каноническая спецификация: [spec.md](specs/agent-infrastructure-lifecycle/spec.md).

## ADDED Requirements

### Requirement: Unsafe change paths are classified before other per-change refusals
Планирование предложения и применение плана SHALL сообщать unsafe-path для формы
выхода пути правки за границы, включая обратные слеши, родительские сегменты,
абсолютные пути и выход из префикса внутреннего состояния. Для одной правки эта
классификация предшествует внутреннему состоянию, защите приложения и актуальности.
Отказы уровня плана — согласие resume, подмена сессии, невалидный план — сохраняют коды.

#### Scenario: A path-escape form is proposed or saved
- **WHEN** предложение или сохранённый план содержит такую форму пути и нет отказа уровня плана
- **THEN** proposal, apply и resume отказывают с unsafe-path
- **AND** файлы проекта и состояние Tibicen не записываются

#### Scenario: A valid application path is proposed outside a new empty project
- **WHEN** путь безопасен, но находится вне границы агентской инфраструктуры
- **THEN** сохраняется application-protected

#### Scenario: A change carries no path
- **WHEN** предложенная правка в существующем непустом проекте не содержит пути
- **THEN** сохраняется application-protected

### Requirement: MCP configuration inspection recognizes complete placeholder values
Проверка MCP-конфигурации Claude Code/Cursor в верификации, планировании и проверке
доверия SHALL исключать лишь полные заполнители: цельную ссылку окружения,
идентификатор в угловых скобках, маркер редактирования или маску из звёздочек.
Частичные префиксы и ссылки, смешанные с текстом, SHALL оставаться литералами.
Литерал при ключе секрета SHALL отклоняться, его значение SHALL NOT попадать в результат.

#### Scenario: A documented placeholder is configured
- **WHEN** такой ключ содержит полный документированный заполнитель
- **THEN** проверка, планирование и сравнение доверия не сообщают inline-secret
- **AND** дальнейший результат определяется правилами выбранного формата

#### Scenario: A literal credential is configured
- **WHEN** конфигурация содержит литерал при ключе секрета
- **THEN** проверка/планирование сообщают existing-inline-secret, сравнение доверия отказывает
- **AND** литерал отсутствует в каждом результате

#### Scenario: A partial placeholder or mixed reference is configured
- **WHEN** значение содержит незакрытый/дополненный заполнитель либо текст до/после ссылки
- **THEN** existing-inline-secret возвращается без значения и автоматической замены
- **AND** apply отказывает до записи конфигурации или состояния

### Requirement: Raw infrastructure content shares the literal-secret boundary
Сырое содержимое SHALL использовать общие с MCP правила ключей и полных заполнителей. Оно SHALL проверять декодированный JSON и присваивания в кавычках с пробелами/экранированием. Чтение файла, proposal и согласованный apply SHALL отказывать литералам с secret-content, без выдачи значения и записи проекта/состояния. Вне JSON узкая проверка без кавычек сохраняется.

#### Scenario: A literal is hidden behind a placeholder or an alternate key
- **WHEN** иначе допустимое содержимое имеет литерал с префиксом заполнителя и пробелом/суффиксом, AUTHORIZATION/CREDENTIALS либо экранированный JSON-ключ секрета
- **THEN** proposal и согласованный apply отказывают с secret-content, включая AGENTS.md и оба поддерживаемых пути MCP
- **AND** значение не выдаётся и проект/состояние не записываются

#### Scenario: The current file contains a literal secret
- **WHEN** текущий файл содержит одну из этих форм литерала
- **THEN** чтение для proposal/apply отказывает без выдачи значения
- **AND** байты файла и посторонние файлы сохранены

#### Scenario: A complete placeholder is used
- **WHEN** значение является полным документированным заполнителем
- **THEN** исключение проверки секретов сохраняется, а проверка формата ссылок имеет собственный результат
