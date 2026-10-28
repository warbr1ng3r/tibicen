# Tasks

## 1. Pinned executor image

- [x] 1.1 Добавить pinned Docker build inputs, непривилегированный Codex0.157.0/Node24.15.0/pnpm11.21.0 executor и защищённый PID1 watchdog; проверить версии, child UID/capabilities и EOF/deadline в реальном image, сохранить hashes и команды подготовки.

## 2. Session lifecycle and file transfer

- [x] 2.1 Реализовать eval-only CID create/attach/stop/wait/remove с фиксированными limits/env и отказом unsafe inputs; unit checks и реальные exit/timeout/cancel/output-cap/owner-loss canaries подтверждают отсутствие late effects и чужих изменений.
- [x] 2.2 Добавить bounded input/result archive transfer без host mounts и extraction недоверенного дерева; тесты отвергают links/traversal/duplicates/oversize и принимают разрешённые regular files.

## 3. Codex environment integration

- [x] 3.1 Добавить generated isolated CODEX_HOME/environment config без local fallback, с зеркальным cwd и сохранёнными feature restrictions; проверки missing/malformed config и direct real-executor initialize/process/fs проходят без auth/model.
- [x] 3.2 Проверить настоящий host harness shell/filesystem/native apply_patch через synthetic local transport, неизменный host sentinel и безопасный сбор результата; missing routing остаётся blocked без реальной auth/model/API.

## 4. Integration acceptance

- [x] 4.1 Провести независимый review, необходимые repo checks и полный offline gate; записать evidence/ограничения и обновить tracker/roadmap, не выдавая partial evidence за production или live readiness.
- [x] 4.2 Исправить найденный ponytail-review пропуск удаления CID после wait/state error; regression cases подтверждают удаление и сохранение ошибки, не скрывают failed removal.

## 5. First failure diagnostics

- [x] 5.1 Preserve the first stopping tool error as a bounded numeric projection in the container receipt; regressions cover chunked input, competing failures, ignored protocol codes and secret exclusion without changing stop or collection behavior.
- [x] 5.2 Mark rejected post-run source validation as unverified rather than evidence of mutation; verify offline, independently review, run the full repository gate and record the remaining historical unknown without a live replay. See diagnostics-verification.md.
