# Proposal

> Public source snapshot: detailed local development records are omitted. Historical verification summaries below retain their original limits.

## Why

В успешной живой установке известного закреплённого скилла агент сделал 17 диагностических обращений, прежде чем нашёл внутренний `validateSources()`. Нужная проверка уже реализована; публичный CLI должен давать прямой короткий путь к ней.

## What Changes

- Добавить read-only `source-check --input FILE_OR_STDIN_DASH` для существующего массива `Source[]`.
- Переиспользовать `validateSources()` и актуальный blocklist, возвращая его компактный результат и прежние структурированные ошибки.
- В инструкции выбора компонента различить проверку явно выбранного закреплённого источника и поиск ещё неизвестного кандидата.
- Проверить stdin/file, положительные и отрицательные источники, отсутствие записей и доставку команды в обоих скиллах.

## Capabilities

### New Capabilities

Нет.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: прямой read-only CLI для проверки выбранного источника до предложения и установки.

## Impact

`scripts/tibicen.ts`, `references/stage-agent-arch.md`, CLI/дистрибутивные тесты. Новых зависимостей, транспорта и устойчивого кэша нет. Повторная проверка источников при apply и согласие на точный план сохраняются. Основание: профиль успешной установки; время будущего пути ещё не измерено.
