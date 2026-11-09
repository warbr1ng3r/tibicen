## ADDED Requirements

### Requirement: Primary public site and legacy continuity

Актуальные ссылки и метаданные сборки по умолчанию SHALL использовать https://tibicen.pages.dev. Четыре старых маршрута GitHub Pages SHALL вести на соответствующие страницы основного сайта с видимой ссылкой и без требования JavaScript. Прежний maintenance/index.json GitHub Pages SHALL оставаться прямым JSON-ответом с неизменными исходными байтами и channel.

#### Scenario: A legacy visitor opens a known route

- **WHEN** посетитель открывает /tibicen/, /tibicen/ru/, /tibicen/preset/ или /tibicen/ru/preset/
- **THEN** переход ведёт на соответствующий маршрут Cloudflare с тем же языком и типом страницы
- **AND** фиксированные canonical и запасная ссылка указывают этот адрес
- **AND** при JavaScript сохраняются query и fragment без возможности смены origin назначения

#### Scenario: JavaScript is disabled

- **WHEN** любой известный старый маршрут открывают без JavaScript
- **THEN** HTML-перенаправление открывает соответствующий маршрут Cloudflare

#### Scenario: An existing checksum consumer reads its endpoint

- **WHEN** клиент запрашивает /tibicen/maintenance/index.json
- **THEN** он получает JSON напрямую, побайтно равный каноническому исходнику
- **AND** redirect, HTML или переписанные релизные записи/channel не заменяют его
