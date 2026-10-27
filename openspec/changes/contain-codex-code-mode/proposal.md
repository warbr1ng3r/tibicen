# Proposal

## Why

Свежий subscription catalog содержит только code_mode_only модели; прежний direct-only caller несовместим с ними. Включение companion на host нарушает выбранную границу, поэтому V8 должен выполняться внутри уже принадлежащего caller контейнера.

## What Changes

- Добавить fixed sibling wrapper для штатного Code Mode companion внутри exact owned CID, без host fallback.
- Выбирать сохранённую official metadata подходящей модели, сохраняя source/hash/config gates и host-only subscription auth.
- Проверить actual CLI Code Mode→remote shell/native patch и failure/cleanup offline перед отдельной bounded subscribed пробой.

## Capabilities

### New Capabilities

- `container-code-mode`: штатный Codex V8 companion и его nested tools под существующим container lifecycle.

### Modified Capabilities

Нет. General многофазная acceptance остаётся отдельной работой.

## Impact

Eval-only container/profile/caller config и тесты. Product core/skills/dependencies/Git history неизменны. Host auth не передаётся companion, API fallback запрещён.
