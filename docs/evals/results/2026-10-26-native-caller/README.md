# Narrow native Codex caller и ZCode diagnostics

Пакет 29, 26.10.2026. База `13dcc95`, незакоммиченные изменения. [Машинная сводка](summary.json), [контракт реализации](../../../../openspec/changes/connect-contained-codex-profile/tasks.md), дашборд (`../../../../.scratch/codex-zcode-acceptance/dashboard.md`; private development record; excluded from public source).

**Новый caller работает через container backend; подписочная проба не прошла.** Общий gate — 639/639 без skips. Полная native матрица и выпуск остаются открытыми.

## Codex

`describeContainedCodexRun` и `runContainedCodexSession` экспортированы из `scripts/evals/native-runner.ts`. Это отдельный узкий API: заранее выбранные regular-file inputs/result paths, одна host session, фиксированные limits, возврат bytes после stop/wait/remove. Он не записывает модельные результаты в настоящий host проект. Старые многофазные acceptance callers остаются blocked.

Перед auth заново проверяются pinned image, CLI0.157.0/hash, 18 source hashes, seed/result paths и закрытый project scope. `.codex`/`.mcp.json`, local system config и forced managed preferences отклоняются. Сохранённая ready-запись не включает сессию.

Generated HOME использует custom OpenAI subscription provider с ChatGPT backend, static untouched official gpt-5.5 catalog, explicit environment и `include_local=false`. Auth остаётся на host: режим `chatgptAuthTokens`, refresh token пустой, API credentials/fallback исключены. Для первого scope принимаются personal non-FedRAMP plans; workspace/cloud-policy accounts отвергаются. TTL перепроверяется непосредственно перед spawn. Личный auth source не передаётся в контейнер и кодом caller не изменяется.

Пять review findings исправлены: cloud account policy, немедленная отмена host до медленной Docker cleanup, failed native items, повторный TTL gate и сохранение signal handlers до окончания cleanup. Metadata/auth/predicate/cancellation regression tests прошли. Native prevalidation errors без failed JSONL event могут быть внутренне recoverable: caller не обещает перехватывать невидимые события CLI.

Финальные synthetic native cases `.evals-private/contained-codex-runner-20261026-r1/attempt-{9,10,11}`:

| Случай | Наблюдение |
|---|---|
| Shell + native patch | Caller pass, 4 local fake Responses, host sentinel/source/config unchanged |
| Shell exit 1 | Caller fail, ровно 1 local fake Response, дальнейшего model continuation нет |
| Patch защищённого image file | Caller fail, ровно 1 local fake Response, дальнейшего model continuation нет |

Все три CID stopped/removed. Proof SHA-256 `569031b4b72a698c2509cdcda68bb48774299b44a9fb03992d60a383c350095c`. Старые попытки сохранены: missing-file/nonmatching-hunk prevalidation не давали ожидаемый failed item, поэтому первоначальные predicates не прошли; поздняя ошибка shell завершила их. Они не переименованы в pass.

Отдельная synthetic auth proof подтверждает file loader/access-only/no refresh на фиктивных expired JWT. При fake401 Codex делает 3 Responses попытки даже с provider retries0; служебные account metadata requests тоже существуют. Эти offline counts не являются лимитом реального провайдера.

### Одна подписочная проба

После review, свежих gates и freeze использована ровно **1 host session**, candidate gpt-5.5, deadline90s, root retry/fallback/paid API0. Протокол `.evals-private/contained-codex-live-20261026-r1/protocol.json` закреплён до auth; SHA-256 `e05b2cbcab1adc07697e0f2e57ececbb74aa2b6c4b0a8cfe07613600816f0337`.

Наблюдались start, затем `error`/`turn.failed` через 7.429s; completion и native tools — 0. HTTP status/inference/internal retries и точная причина неизвестны: безопасные diagnostics не содержат server code/status, raw terminal text не сохранялся. Из hashes причину восстановить нельзя. Повтор и подмена route/model не выполнялись.

Source/config и host sentinels unchanged; CID stopped/removed, generated HOME удалён. Result SHA-256 `11d117deefc42d43d69a74738692e078aec3cc9ea57ea1cdcc64dfe7fbd7c9b8`. Runtime source snapshot сохранён рядом. Это не subscribed native pass и не подтверждение доступности модели/observed endpoint. Следующий шаг — безопасная классификация отказов без live-повтора.

## ZCode

Новый private host (`../../../../.scratch/codex-zcode-acceptance/zcode-diagnostic-host.md`; private development record; excluded from public source) оборачивает public header port до SDK composition. Checkpoints entered/returned/failed, boolean contract flags и allowlisted error projection сохраняются до first-error stop. Public app/sink integration подтверждена; потерянный constructor raw callback не используется как надёжный hook.

12 cases, 12 projection/network checks и altered bundled-config regression прошли. Review нашёл отсутствовавший pin bundled provider JSON; exact observed bundle/revision33 и resolved metadata теперь проверяются до/после и входят во freeze. Новая серия и независимое re-review прошли; старый proof сохранён. Final proof SHA-256 `a6e1b1745c7f7fb1f1126a8c857459fe5eaa2ffd4cdf690a38071c23c03c17b8`.

12457 SDK files, 180 historical host files и 8 diagnosis files unchanged. Scan712 files/694 JSON, процессов/scopes нет. Реальные auth/HTTP/model/API/retries0. Parent network hooks ограничивают trusted code; это не общая OS изоляция родителя. Tool OS/Node boundary сохранена. Historical/later-prepare cause unknown, live mode отсутствует.

## Проверки и пределы

`pnpm test`: lint, format, core/site types, site build, strict active/archived specs, **639/639**, 0 skips. Первый полный gate сохранил один timeout-fixture failure; отдельный запуск и затем полный quiet gate прошли без изменения тестового лимита. Первичные logs сохранены, окончательная причина scheduling failure не доказана.

Product core/distributed skills не менялись. OpenSpec остаётся инструментом разработки; commits/publication/paid API0. Успешные synthetic cases не заменяют живую установку Tibicen или полную release acceptance.

Official catalog provenance: [Codex pinned source](https://github.com/openai/codex/blob/ac21625ddf7f9dd5f34b2802212cf20295fdff95/codex-rs/models-manager/models.json). `scripts/evals/container/codex-model.json` — целиком неизменённый gpt-5.5 entry из этого файла, SHA-256 `c0948f5e809f1d7236b8fa51cae88cecc2524c0b010f95abb122916d7bf87457`.
