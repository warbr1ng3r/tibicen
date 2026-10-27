# Design

## Context

Fresh subscription metadata содержит8code_mode_only models. Pinned Codex0.157 использует bundled V8 companion, stdio length-prefixed V1; обычный host spawn не имеет OS sandbox. CLI exec не предоставляет config override пути, но InstallContext ищет companion рядом с фактическим binary.

## Decisions

- Новый eval-only stager копирует проверенный host binary в свежую private директорию, рядом создаёт fixed sibling wrapper. Symlink не подходит: install-context canonicalizes executable.
- Wrapper запускает только `docker exec -i --user1000:1000 ownedCID fixed-linux-companion` с явным Docker env и очищенным container env. CID/pinned path не приходят от модели. Existing outer owner останавливает namespace, включая V8; wrapper не владеет cleanup.
- Generated config включает code_mode_host и disable_in_process_fallback; штатные tool callbacks продолжают идти в existing remote executor. Auth/token/path hostHOME не передаются companion.
- Для первого supported route используются gpt-6-astra с unchanged pinned official entry и fresh catalog confirmation; старый gpt-5.5 остаётся offline direct fixture, subscription candidate больше не выбирается из старого bundle.
- Code-only synthetic transport проверяет actual host JS→shell/native patch, V8 globals/import restrictions и /proc UID/cap/env/process location. Не выдавать V8 API restrictions за самостоятельную OS границу.

## Risks / Trade-offs

- [Случайный host fallback] → только staged COPY+exact wrapper, explicit fallback disable и negative tests.
- [Убит Docker exec client, V8 ещё жив] → owner kill/wait/remove всего CID, deadline/late marker canary.
- [IPC stdout загрязнён] → wrapper не пишет stdout, фиксирует только ограниченные safe receipts отдельно.
- [Catalog semantics меняются] → pin metadata/source, fresh check и отдельный protocol, не ослаблять tool mode.
