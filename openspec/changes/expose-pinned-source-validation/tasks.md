# Tasks

## 1. Expose the existing source check

- [x] 1.1 Добавить source-check с прежним Source[]/summary и актуальным blocklist; офлайн CLI-тестами проверить stdin/file, отказ неверного hash/файла/лицензии/blocked/invalid input, отсутствие network fallback и записей в проект/HOME.
- [x] 1.2 Обновить ветку явно выбранного repo/SHA/состава в stage-agent-arch и CLI help; проверить доставку и работу команды в обоих собранных скиллах вне checkout без OpenSpec/dev-зависимостей.

## 2. Verify the integrated path

- [x] 2.1 Выполнить pnpm test, строгую валидацию change и независимое review изменённого CLI/инструкции; сохранить фактические результаты и ограничения.
- [x] 2.2 На новой frozen когорте сохранить отдельную SKILL-пару с одним повтором, cap8 в остатке совокупного32/2, прежними лимитами и существующей подпиской; установить по traces использовал ли агент source-check без исследования внутренних scripts/transport, не объявляя одиночный elapsed доказательством ускорения.
