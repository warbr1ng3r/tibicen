# Design

## Context

См. proposal.md. createSnapshot намеренно исключает node_modules; runtimeHooks сохраняет app baseline и создаёт отдельные исполнения. Landing требует около 254 MB, 18,498 обычных файлов и 1,251 ссылку pnpm. .bin содержит абсолютные пути исходного checkout, а native bindings больше действующего лимита текстовых файлов приложения. Content эвристики приложения ошибочно распознают примеры в 66 vendor files, поэтому их нельзя бездумно применять к выбранному package payload.

## Goals / Non-Goals

**Goals:** одна явно выбранная переносимая локальная Node-среда, согласованный hash, неизменный захват и независимые исполнения, реальный публичный CLI на landing.

**Non-Goals:** установка/обновление пакетов, .bin/pnpm запускаемые shims, контейнерный менеджер, перенос HOME/авторизации, inference credentials, универсальный анализ секретов vendor code, изменение обычного source snapshot.

## Decisions

1. checks.environment.kind=local-node-modules с roots. createProposal вычисляет hash/files/bytes/platform/arch/nodeVersion; эти значения входят в согласие. Отдельная CLI-команда и реестр сред не нужны.
2. Отдельный helper inspectNodeEnvironment/copyNodeEnvironment выполняет один и тот же детерминированный ограниченный обход. Copy хэширует именно записываемые bytes/link text/modes, сверяет итог до возврата и откатывает несовпадение; повторные полные чтения source не нужны. До 50k entries, 512 MiB total и 64 MiB/file; roots — непересекающиеся относительные node_modules каталоги без симлинка в предках. Фиксированная политика исключает credential paths, .bin, pnpm machine metadata и generated caches. Native package payload разрешён и хэшируется.
3. Относительные ссылки не разыменовываются при записи; разрешён только target внутри project root, включая workspace. В execution snapshot target должен существовать внутри копии. Абсолютные/внешние ссылки и special files отвергаются. Личное окружение не монтируется.
4. Захват происходит до baseline из согласованного source, далее baseline/final и каждое исполнение берут независимые байты только из retained snapshot. Собственность/cleanup использует существующий liveSnapshots; дополнительный глобальный registry не нужен.
5. Непригодный capture сохраняет gap с причиной и оставляет verify unverified. Никакой подстановки внешнего runner или нового baseline после изменений. Отказ подтверждения environmentReady сохраняет прежний результат.

## Risks / Trade-offs

- [Vendor code может содержать любые строковые литералы] → payload выбирается явно и хэшируется; credentials paths исключены; содержимое не добавляется в контекст/логи. Эвристическое распознавание произвольных embedded secrets не обещается. Обычный source snapshot не меняется.
- [Дополнительные копии около 254 MB] → жёсткие лимиты и существующий lifecycle cleanup; каждый запуск получает чистую среду. Не добавляем cache reuse с возможным загрязнением baseline.
- [pnpm shims непереносимы] → первый scope использует явные Node entrypoints; этот предел раскрыт, установка пакетов не маскирует его.
- [Другие runtime/ABI] → platform/arch/точная Node version входят в идентичность, mismatch не исполняется.

## Migration Plan

Поле optional; прежние планы и паспорта остаются читаемыми. Новое окружение требует нового proposal/digest. Обе автономные поставки включают helper через существующий build, без dev dependencies. Реальный offline приёмочный прогон и отрицательные случаи предшествуют заявлению готовности.
