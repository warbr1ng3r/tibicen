# Proposal

## Why

Контейнерный executor прошёл offline gates, но native callers по-прежнему заблокированы. Нужен узкий подписочный путь, который использует этот backend и собирает результат после проверенной очистки, без открытия всей экспериментальной матрицы.

## What Changes

- Добавить отдельный bounded native Codex caller/profile для заранее переданных regular-file inputs и разрешённых result paths.
- Проверять текущие image, binary, route, config и закрытый project scope перед каждым запуском; cached ready не является разрешением.
- Оставлять подписочную авторизацию только на доверенном host, исключить API/fallback и project MCP/config.
- Проверить caller через synthetic transport и записать отдельный prospective live protocol до любого реального запроса.

## Capabilities

### New Capabilities

- `contained-codex-profile`: узкий native профиль Codex с переносом bytes через container boundary и host-only subscription route.

### Modified Capabilities

Нет. Общая release acceptance и evaluation-results не меняются.

## Impact

Eval-only profiles/container/native runner и тесты; product core, distributed skills и dependencies не меняются. Общие legacy acceptance entrypoints остаются blocked до отдельной интеграции их полного workflow. Коммиты, публикация, paid API и новый ZCode live исключены.
