# Proposal

## Why

Подписочная Codex session завершилась до инструментов без полезной причины: CLI JSONL оставляет текст, а стенд сохраняет только hash. Следующее наблюдение должно различать доказанные fixed error templates без сохранения произвольного текста провайдера.

## What Changes

- Распознавать узкий source-verified список terminal message IDs и allowlisted nested error codes.
- Сохранить строгую редакцию raw terminal errors, first-error stop и unknown для неподдержанных сообщений.
- Проверить parser через synthetic CLI failures без реального auth/model; исторический cause не восстанавливать.

## Capabilities

### New Capabilities

- `native-terminal-diagnostics`: безопасная классификация terminal errors native CLI по проверенным fixed шаблонам.

### Modified Capabilities

Нет; порядок стадий/знаменатели evaluation-results не меняются.

## Impact

Eval-only Codex parser/contracts/tests и metadata evidence. Product core/distributed skills/dependencies не меняются. Новая модельная проба имеет отдельный protocol/budget после review, paid API и commits исключены.
