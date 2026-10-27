# Design

## Context

См. proposal.md. Проверенные callers createProcessSupervisor до изменения: native-runner, Codex preflight, probe-cli и tests/evals/{process-supervisor,native-checks}; private frozen scripts также импортируют совместимый run. Codex profile загружается общим profiles/index, native acceptance/diagnostics и diagnostic-driver. Новый Node helper использует тот же supervisor. Отдельный runner.ts уже ограничен trusted offline protocol и не меняется. Product core/execute не меняется.

## Goals / Non-Goals

**Goals:** убрать недоказанную production readiness; сохранить offline протокол и узкую проверяемую границу Node без потомков.

**Non-Goals:** полный native backend, обход OS sandbox ограничений, VM, зависимость/конфиг нового backend, изменения распространяемых skills, личная auth или модельные запросы.

## Decisions

- supervisor.run остаётся group-only и совместимым для доверенных discovery/fixtures. Перечисление PID или повторный kill не закрывает гонки detached/setsid, поэтому не используется как гарантия.
- Codex preflight блокируется до CLI запуска. Profile loading независимо блокирует cached ready и не читает его binary/auth. ZCode/Claude production loading также остаётся blocked с containment reason; доверенный version/help discovery остаётся отдельным наблюдением.
- createNodeCheckContainment проверяет macOS sandbox-exec deny process-fork через системный Perl fork(2), затем Node permission без child/worker/addon grants. OS policy также запрещает сигналы: отдельная безвредная проба signal 0 должна получить EPERM, чтобы тест не мог остановить supervisor. После проверки принимает только абсолютные testFiles, запускает --test-isolation=none и запрещает все NODE_*, OPENSSL_*, DYLD_* и LD_* environment до запуска, включая enumerable inherited keys; в spawn передаётся ровно проверенная копия без prototype. OpenSSL engine может загружаться до инициализации Node permission. Неподдержанная среда отклоняется. Это eval-only process boundary; filesystem policy не расширяется и остаётся обязанностью caller. В production native runner этот helper не даёт обхода блокировки.
- Native runner принимает code-only fixture profile; публичные production entries его не передают. Отдельные runTrustedNativeFixtureAcceptance/runTrustedCodexFixtureDiagnostics/loadTrustedCodexFixture названы явно и не выбираются из JSON. Trusted fixture prepare создаёт только пустой CLI home, без symlink к личной auth.
- Production native не исполняется, поэтому host не собирает файлы недоверенного native процесса через меняемые ссылки. Trusted fixtures могут пользоваться прежними host snapshots. Helper возвращает только bounded stdout/stderr; не читает созданные проектом файлы. Новое включение untrusted file collection потребует собственной sandbox-boundary проверки.

## Risks / Trade-offs

- [Native серии временно недоступны] → точный blocked reason, ноль auth/model requests, сохранённые прежние факты не меняются.
- [Node API permissions не равны OS sandbox] → независимый OS fork canary; отсутствие child/worker/addon grants и фиксированный argv; filesystem isolation этим helper не обещается.
- [Группа процессов не содержит setsid descendants] → только доверенные discovery/offline команды используют старый supervisor; комментарий фиксирует ограничение.
- [macOS sandbox-exec может быть недоступен] → factory отклоняет режим до project code; Linux/Windows не заявляются поддержанными.
