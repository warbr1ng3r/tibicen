# Офлайн-CI

[Workflow](../.github/workflows/ci.yml) запускается на push, pull request и вручную: Ubuntu 24.04, Node 24.15.0 и pnpm 11.21.0 из package.json. Actions закреплены полными SHA; обновляя их, проверяйте соответствующий официальный action.yml и локальные команды. Разрешён только `contents: read`, checkout не сохраняет credentials.

После `pnpm install --frozen-lockfile` выполняются:

1. `pnpm test`: lint, format, все typecheck, сборка сайта, strict OpenSpec и все Node-тесты.
2. `pnpm build`: две самостоятельные поставки.
3. Распаковка обеих поставок во временный каталог вне checkout, проверка SHA256SUMS и self-test каждой CLI с пустым PATH.

Стенд использует офлайн-фикстуры и fake drivers. Workflow не передаёт secrets, не вызывает модели и не запускает `eval:external`. Доступ к реестру пакетов и загрузкам Actions/Node/pnpm нужен для установки; «офлайн» относится к проверкам продукта и моделей.

Браузерная приёмка остаётся отдельной командой `pnpm test:site`. Текущие эталонные скриншоты записаны на macOS; этот Ubuntu workflow не заявляет проверку Linux-скриншотов, всех ОС или живых агентов.

По состоянию на 25.10.2026 YAML и команды проверены локально на macOS; Git remote у checkout не настроен, удалённого запуска GitHub Actions ещё не было. Успех локальных команд не равен успешному запуску на Ubuntu. После подключения remote подтвердите первый запуск до включения обязательной проверки ветки; публикация и release pipeline остаются отдельной работой.

27.10.2026: создан публичный [warbr1ng3r/tibicen](https://github.com/warbr1ng3r/tibicen) и настроен origin. Push и удалённый CI пока не выполнялись. Для страницы добавлен отдельный ручной [Pages workflow](../.github/workflows/pages.yml); локальные проверки не заменяют первый GitHub run.

Полный `pnpm test` и `pnpm test:evals` собирают standalone-ресурсы перед Node-тестами; прежний ignored `dist/` не требуется. Fingerprint закреплённого dev-пакета OpenSpec исключает только генерируемые package-manager launchers `node_modules/.bin`, сохраняя проверку остальных файлов и наблюдаемых effects.
