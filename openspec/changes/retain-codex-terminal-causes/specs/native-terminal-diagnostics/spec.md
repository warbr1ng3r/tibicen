# Spec Delta

## Purpose

Сохранять полезные безопасные признаки terminal failures native CLI, не превращая непроверенный текст провайдера в доверенную причину или секретный лог.

## ADDED Requirements

### Requirement: Fixed terminal message identities

Parser SHALL выдавать только source-verified fixed message IDs для точно распознанных terminal message templates либо строгого JSON error envelope. Неизвестный текст SHALL оставаться неклассифицированным. ID обозначает совпадение шаблона сообщения, а не доказанную причину или HTTP status.

#### Scenario: Provider reports unsupported subscription model
- **WHEN** terminal message точно совпадает с проверенным шаблоном неподдерживаемой модели, напрямую или в JSON error.message
- **THEN** сохраняется fixed ID без имени модели и произвольного текста
- **AND** отсутствующий HTTP status не придумывается

#### Scenario: Message contains unknown text or a misleading fragment
- **WHEN** сообщение не совпадает с полным проверенным шаблоном или содержит вложенный несвязанный фрагмент
- **THEN** новый ID не выдаётся и исходная ошибка остаётся hashed

### Requirement: Evidence and secret boundaries remain intact

Parser SHALL сохранять terminal hashes и существующие allowlisted numeric/code hints без raw messages, bodies, headers, JWT, identities или stack. Structured hints SHALL иметь приоритет над текстовыми. Улучшение diagnostics SHALL не менять stage result, retry или route; historical unknown не повышается до классифицированного исхода.

#### Scenario: An error embeds secrets and a known template
- **WHEN** error envelope содержит synthetic secrets и распознаваемое error.message
- **THEN** observations содержат только fixed ID, допустимые hints и hashes
- **AND** arbitrary fields и значения секретов отсутствуют

#### Scenario: Old failure contains only a hash
- **WHEN** новая версия parser применяется к дальнейшим наблюдениям
- **THEN** прежний failed outcome и unknown cause сохраняются без реконструкции текста
