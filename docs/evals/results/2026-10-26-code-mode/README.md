# Контейнерный Code Mode и диагностика подписок

26.10.2026, пакет 30. Base commit `13dcc95deb2cad09687d5ff86a0c1df2bc0acccc`, рабочие изменения не закоммичены. Product core и distributed skills не менялись этим пакетом. API-расходы — 0.

## Codex

Один authenticated metadata GET завершился HTTP200: 8 моделей, все `code_mode_only`; `gpt-5.5` отсутствует, direct candidates0. Metadata не доказывает доступность inference и не объясняет прежнюю ошибку по одному hash. Источник и ограничение (`../../../../.scratch/codex-zcode-acceptance/codex-model-catalog-route.md`; private development record; excluded from public source).

Штатный V8 companion Codex0.157.0 теперь запускается через fixed sibling wrapper внутри exact owned r2 CID. Host binary копируется и проверяется; wrapper0500 использует UID1000 и очищенные host/container env. Host fallback отключён. Official `gpt-6-astra` metadata не изменена; low effort поддержан. Immutable image `sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd` сохраняет networknone/no mounts/512MiB/1CPU/128PIDs.

Actual offline V8 → remote shell/native patch, UID/caps/env и missing-companion/EOF/owner-loss/deadline/frame failures проверены. Подробности (`../../../../.scratch/codex-zcode-acceptance/codex-contained-code-mode.md`; private development record; excluded from public source). Свежий unmodified public caller прошёл 4 synthetic Responses turns за10.117s; files exact, host seed/sentinel и20source inputs сохранены, home/stage/CID удалены. Private evidence: `.evals-private/codex-code-mode-integration-20261026-r1/attempt-2/`. Первоначальная ошибка TOML quoting в probe сохранена; shared runtime defect не обнаружен.

Codex diagnostics теперь сохраняет только optional fixed message IDs для узких source-verified templates и allowlisted strict JSON hints. Raw error остаётся hashed, неизвестное не классифицируется. 8 actual CLI/4 actual contained synthetic cases,7 negative projections и17 focused tests прошли; независимый review Ship. Историческая причина package29 остаётся unknown. Исследование (`../../../../.scratch/codex-zcode-acceptance/codex-failure-diagnosis.md`; private development record; excluded from public source), [OpenSpec](../../../../openspec/changes/retain-codex-terminal-causes/tasks.md).

**Один реальный subscribed control — pass:** gpt-6-astra/Codex0.157.0 выполнил read, native patch `math.mjs`/`math.test.mjs` и тест за24.194s. В отдельном networkless контейнере независимый oracle проверил8значений обоих exports; оба agent tests затем прошли отдельным Node process. Source/config/code-mode-stage/host seed/sentinel сохранены, оба CID/home/stage удалены. [Public receipt](codex-subscription.json), review (`../../../../.scratch/codex-zcode-acceptance/review-package30-codex-code-mode.md`; private development record; excluded from public source). Private `.evals-private/contained-codex-code-mode-live-20261026-r2/`; protocolSHA `fe82c2da6c686aba53c6ca6a54633c92e3cdec345a6691d080f9146a6743552a`, resultSHA `9991bebf022ba8192ce52b2bad5f7c00fbd95649a1c367d8582af2d80bcd238f`. Root retry/fallback/judge/startup/paidAPI0; OAuth refresh authority исключена. ТочныеHTTP/inference/internal auth recovery countsunknown; usage CLI40913input/418output. Исторический gpt-5.5 error сохранён.

## ZCode

Prepared r1 host прошёл13host+13projection+4HTTP policy+7launch gate checks и independent review. Gate пинит shared supervisor; HTTP wrapper запрещает persistent POST `/api_keys` до transport. Подготовка (`../../../../.scratch/codex-zcode-acceptance/zcode-subscription-diagnostic.md`; private development record; excluded from public source).

Единственная consumed r1 diagnostic попытка завершилась `app-start / ERR_ASSERTION` за9.683s до credential store/SDK session/HTTP/model/tools. realAuth1, hostSessions0, fetchInvocations0; original profile9files unchanged, boundarypass, scope removed. Private evidence: `.evals-private/zcode-subscription-diagnostic-20261026-r1/live/`. Повтора использованной revision нет.

Offline reproduction без credentials/HTTP установила точный failed assertion: active copied builtin revision30/hash8bd8070d… сравнивался с SDK bundle revision33/hash361b778f…. Selected API/model metadata совпадают. Это отдельный подтверждённый preflight defect; исторический prepare failure остаётся unknown. Новая r2 сохраняет оба pins отдельно и синхронные typed preflight checkpoints, без ослабления boundary. Prepared13host+14projection+4HTTP+4preflight+7gate checks pass; после independent review выполнена одна новая consumed r2 subscribed session.

**R2 subscribed diagnostic:** все17preflight checks прошли, bootstrap/store завершены, затем `header-refresh` entered→failed за9.215s,1SDK request event,0native tools. Raw fetch counter0 в live не инструментирован (hook установлен только offline), поэтому не доказывает отсутствие HTTP. Public receipt сохраняет recorded counter отдельно и fetchInvocationsnull; HTTP/inference/internal retry countsunknown, messageIDnull; по одному hash причина не восстановлена. Original9profilefiles unchanged, scope removed, boundarypass, automaticrepeat0. [Safe receipt](zcode-diagnostic-r2.json), independent r2 review (`../../../../.evals-private/zcode-subscription-r2-review-20261026-r1/README.md`; private development record; excluded from public source). Два агента продолжают offline разбор public header/auth composition без новых auth/HTTP/model; использованная r2 неизменна.

## Проверки и границы

`pnpm test` прошёл: **646/646,0fail/0skip**, lint/format/core+site types/site build/active+archived strict specs. Лог `.evals-private/package30-repo-gate.log`. Два независимых агента проверили Code Mode source и фактическую интеграцию. Runtime тесты не используют настоящие auth/model calls.

Review обнаружил потенциальный false pass независимого math oracle: подмена assert из возвращённого модуля. В новой private subscribed revision r2 assertion functions/keys/stdout writer захватываются до dynamic import, stdout marker проверяется точно, agent tests выполняются отдельным Node process после независимой проверки. Контейнерные regression cases wrong exports+assert mutation, early exit0 и correct fixture дали ожидаемые исходы. Неиспользованная r1 preparation сохранена.

Новый Code Mode route подтвердил один реальный narrow smoke, но не полный Tibicen init/adopt/quality/human/release gate или массовую серию. General native workflow по-прежнему fail-closed; narrow caller проверяется отдельно. Исторические ошибки не повышены до pass, paid API и Git history не менялись.
