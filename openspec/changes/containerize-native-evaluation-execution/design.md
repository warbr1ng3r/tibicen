# Design

## Context

См. proposal.md и исследование native-containment-route.md. Текущие loadCodexProfile/preflightCodex намеренно blocked; process-supervisor.ts допустим только для доверенных групп. Docker Desktop уже работает. Codex 0.157.0 предоставляет stdio exec-server и environments.toml; --ignore-user-config обходит этот файл. Remote environment объединяет process и filesystem, а native apply_patch использует filesystem выбранной среды. Host --cd переносится в remote selection, поэтому cwd требуется зеркалировать внутри контейнера.

## Goals / Non-Goals

**Goals:** reusable eval-only CID lifecycle и stdio bridge, pinned Linux toolchain, нулевая реальная auth/model/paid API при подготовке, доказуемый offline gate.

**Non-Goals:** автоматическое включение production profile, универсальный orchestrator, новый daemon/VM, изменение product core/distributed skills или глобального login. Host-crash cleanup не считается доказанным наличием одного process group kill.

## Decisions

- Новый код ограничен scripts/evals/container/ и tests/evals/container-*. Только root меняет shared tracker/OpenSpec и будущий caller. Existing native loaders остаются blocked до полного gate; отдельный code-only offline вход не выбирается JSON флагом readiness.
- Image фиксирует Linux architecture, base digest, Codex0.157.0, Node24.15.0, pnpm11.21.0 и проверяемые hashes. Проект и auth в image не входят. Model networking остаётся на host, контейнер имеет network=none и не монтирует host paths.
- PID1 — доверенный root-owned watchdog, недоступный для записи tool UID. Он запускает exec-server с отдельным UID/GID1000, не передаёт child capabilities, завершает namespace при stdin EOF, child exit и фиксированном deadline. Только SETUID/SETGID grants остаются у root watchdog, остальные capabilities сброшены; tool UID не может посылать сигнал PID1. Rootfs использует приватный writable overlay, чтобы pre-start archive не скрывался tmpfs и результаты сохранялись после stop; доверенные image paths защищены UID/permissions, не ReadonlyRootfs. Host дополнительно владеет CID и выполняет kill/wait/inspect/remove. И EOF, и независимый deadline проверяются реальной потерей owner.
- Контейнер создаётся до attach; OpenStdin/AttachStdin/StdinOnce проверяются через inspect, а не предполагаются. Init stdin не содержит auth. Docker command env построен явно; значения модели не превращаются в Docker flags, image reference или env.
- Workspace передаётся без mounts через ограниченный архив с UID/GID1000 и зеркальным абсолютным cwd. Collector после stop читает ограниченный archive stream, проверяет headers, types и пути и возвращает bytes только разрешённых regular files. Symlink/hardlink/special entries не извлекаются. Существующая Node boundary не используется для произвольного Linux shell.
- CID owner живёт вне process group host Codex: временный Unix socket соединяет минимальный stdio bridge с принадлежащим outer owner Docker attach. Codex может завершить всю группу launcher, но outer owner сохраняет CID и завершает cleanup/collection. Socket находится в отдельной 0700 директории, не монтируется в контейнер, принимает одно соединение и удаляется после сессии; постоянный сервис не создаётся.
- Прямой JSON-RPC initialize/process/fs проверяет executor отдельно. Полный host gate использует изолированный CODEX_HOME, include_local=false, controlled config без --ignore-user-config, отключённые plugins/MCP/hooks/browser/snapshots и синтетический локальный transport вместо провайдера. Docker seccomp запрещает внутренний bwrap user namespace; pinned legacy Landlock не поддерживает restricted profile. Файловая граница поэтому обеспечена контейнером, tool UID и закрытым составом inputs. Поддержанный named profile filesystem={':root':'write'}, network={enabled:false} обходит bwrap с сохранением внутреннего network seccomp. Host auth/private inputs в контейнере отсутствуют; Docker seccomp не ослабляется. Это явная модель внешней файловой изоляции, не прежний inner read allowlist. Неудача либо непроверенная маршрутизация оставляет production blocked.

## Risks / Trade-offs

- [Exec-server и host CLI версии расходятся] → pin0.157.0 и настоящий handshake до готовности.
- [Owner/launcher погибает] → защищённый PID1 deadline плюс lease EOF; проверка SIGKILL и late marker за горизонтом.
- [Host config влияет на native tools] → полностью generated home/config, без local fallback; host sentinel в offline harness gate.
- [Образ скачан или собран, но gate неполный] → image evidence отделено от production readiness; blocked сохранён.
- [Docker daemon недоступен при cleanup] → terminal error с CID, без success/ready; не удалять чужие контейнеры.
