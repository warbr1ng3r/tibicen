# Офлайн-CI

[Workflow](../.github/workflows/ci.yml) выполняется по push, pull request и вручную: Ubuntu 24.04, Node 24.15.0 и pnpm 11.21.0 из package.json. Actions закреплены полными SHA; при обновлении проверяйте соответствующий официальный action.yml и локальные команды. Разрешения ограничены `contents: read`; checkout не сохраняет credentials.

После `pnpm install --frozen-lockfile` выполняются:

1. `pnpm test`: lint, форматирование, все проверки типов, сборка сайта, strict OpenSpec, standalone-ресурсы и все Node-тесты.
2. `pnpm build`: проверки типов, сборка сайта и обе самостоятельные поставки скиллов.
3. Распаковка обеих поставок во временный каталог вне checkout, сверка SHA256SUMS и self-test каждой CLI с пустым PATH.

Стенд использует офлайн-фикстуры и fake drivers. Workflow не передаёт secrets, не вызывает модели и не запускает `eval:external`. Для установки зависимостей нужны реестр пакетов и загрузки Actions/Node/pnpm; «офлайн» относится к продуктовым проверкам и исполнению моделей.

Браузерная приёмка выполняется отдельно через `pnpm test:site`. Текущие эталонные скриншоты записаны на macOS; этот Ubuntu workflow не доказывает приёмку Linux-скриншотов, всех платформ или живых агентов.

27 октября 2026 года опубликован source snapshot [`e0f59a5`](https://github.com/warbr1ng3r/tibicen/tree/e0f59a55c7ce7581e402c3e270aa162fa1e0dc52). Чистая локальная копия прошла 668/668 тестов и сборку; [первый main CI](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480) успешен на Ubuntu. Отдельный ручной [Pages workflow](../.github/workflows/pages.yml) также [успешен](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284), [сайт](https://warbr1ng3r.github.io/tibicen/) опубликован. Это подтверждает заявленные офлайн-проверки; полная платформенная и живая агентская приёмка остаются открытыми.

`pnpm test` и `pnpm test:evals` собирают самостоятельные ресурсы до Node-тестов, поэтому прежний ignored `dist/` не требуется. Fingerprint закреплённого dev-пакета OpenSpec исключает только генерируемые package-manager launchers в `node_modules/.bin`, сохраняя проверки остальных файлов и наблюдаемых эффектов.

Текущий workflow может дважды проверять изменение в открытом PR: по push и pull request. Внутри одного запуска `pnpm test` и `pnpm build` повторяют проверки типов и сборку сайта. Эти повторы пока остаются в gate.
