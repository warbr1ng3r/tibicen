# Design

## Context

См. proposal.md и завершённый containerize-native-evaluation-execution. Backend уже имеет external owner, private stdio broker, pinned image и bounded archive collector. Общий native runner смешивает host paths/tooling/preloads и многофазный approval workflow; включение его целиком потребует отдельной миграции.

## Goals / Non-Goals

**Goals:** отдельный native caller с настоящим Codex parser/profile, seeded regular bytes, текущими gates и безопасной collection. Один reusable narrow API через native-runner; offline проверки и prospective protocol.

**Non-Goals:** замена полного workflow runner, автоматическая запись результата в настоящий проект, изменение SDK ZCode, новая платная route, distribution изменений.

## Decisions

- Narrow caller выделен в отдельный eval module и экспортирован native-runner. Старый loader остаётся blocked для неперенесённой полной матрицы. Это сохраняет реальный scope filesystem policy, а не выдаёт container availability за совместимость всех host checks.
- Метаданные image/CLI/source проверяются свежими до auth; входные bytes проходят существующий archive/session validator. Binary ожидается trusted pinned caller hash; image принимается только verified r2 ID. Список results задан до старта, не поступает от модели.
- Generated fresh home и конфигурация повторно используют container config generator. Offline loopback transport и subscription выбираются разными явными code inputs. Secrets читаются внутри доверенного кода после metadata/seed gate, только копируются в private host home и удаляются после cleanup; исходный login не меняется.
- Exact mirrored workspace и include_local=false сохраняются. Неподдержанные .codex/.mcp.json inputs отвергаются; workspace host не используется как источник файлов для transfer. Controlled config выключает plugins/hooks/MCP/browser/telemetry, automatic project trust и local fallback.
- Docker owns filesystem isolation; network none и UID1000 остаются. Caller не переносит host runtime/oracle/auth в inputs. Возвращает bytes без host extraction. Process supervisor ограничивает доверенный host CLI, container owner остаётся снаружи этой группы и завершается finally.
- Provider defaults/retry semantics определяются pinned source, не предполагаются по TOML. Prospective protocol честно фиксирует host session cap, external deadline и неизвестные внутренние provider операции; live невозможен до завершённого review/freeze.

## Risks / Trade-offs

- [Fresh auth copy может обновляться SDK] → оригинал только читается, copy находится вне container/observations и удаляется.
- [Source/config меняются между подготовкой и launch] → повторная проверка непосредственно до launch, source freeze в результате.
- [Container доступен, но старый workflow несовместим] → отдельный narrow API, legacy entrypoints blocked.
- [Provider продолжает retry внутри CLI] → точные documented limits из pinned source и независимый external deadline; не объявлять maxTurns/token limit без работающего контроля.
