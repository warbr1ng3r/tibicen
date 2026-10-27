# Design

## Context

Pinned Codex0.157 JSONL ThreadError содержит message; TurnFailed теряет structured CodexErrorInfo и добавляет additional_details в текст. См. исследование codex-failure-diagnosis.md. Необходима узкая наблюдаемость в текущем parser, без нового транспорта/daemon.

## Decisions

- Дополнительный optional messageId в NativeFailureDiagnostics, только для доказанных exact templates. Существующие records продолжают хранить detailHash; неизвестное не создаёт новый field.
- Прямой terminal текст либо strict JSON object.error.message: ограниченное извлечение без рекурсивного обхода/поиска произвольных вложенных полей. Признанные error codes используют существующий allowlist и precedence structured→text.
- Не интерпретировать provider fixture как доверенный тип ошибки SDK. Имя ID/документация отражает только matched message, HTTP inference не повышается по смыслу текста.
- Исторические protocol/result/source snapshots неизменны. Ordinary tests offline; actual CLI composition проверяется fake Responses + synthetic auth в отдельной private области.

## Risks / Trade-offs

- [Provider меняет или подделывает текст] → узкий exact match, unknown по умолчанию, не использовать ID для retry/auto routing.
- [JSON содержит секреты] → сохраняются только разрешённые scalar hints/fixed IDs/hash, observation guard и adversarial tests.
- [Изменение интерфейса ломает старые записи] → поле optional, существующие consumers используют общий parser, stage/budget contracts неизменны.
