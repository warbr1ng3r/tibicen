# Proposal

## Current release policy — 3 November 2026

The adopted [evidence policy](../separate-release-evidence-from-usefulness-pilot/specs/product-scope/spec.md) separates the [engineering release assessment](../../../docs/evals/ENGINEERING_ACCEPTANCE.md) from human-calibrated experiments and voluntary usefulness research. Full MVP functionality, hard invariants, functional quality, positive skill loading/use and process init/adopt/fresh-session use remain technical requirements. Independent review must use candidate-bound observations; missing mandatory evidence stays open. Human calibration and pilot participation are deferred postpublication work, not completed checks or technical release prerequisites. The existing grader, experiment outcomes and failures keep their meanings.

## Why

Локальные тесты и `scripts/evals/results.ts` проверяют механические операции и записи исходов, но не доказывают, что настоящий агент самостоятельно настраивает проект и затем решает полезную задачу. Очередям 2–3 объединённого плана нужен отдельный проверяемый контракт стенда и внешних испытаний.

## What Changes

- Зафиксировать сценарии, события, наблюдения и интерфейсы профилей/оценщиков; сохранить существующий строгий формат агрегируемой попытки.
- Prepare controlled execution, process-tree cleanup and independent checks; retain rubric calibration and human cross-checks for studies claiming human-calibrated results.
- Record technical release conclusions separately from experiment grades, using criterion, candidate/source/payload/version bindings, observations, independent reviewer context and limits. Public research and a model's unsupported opinion do not supply missing technical facts or measured user benefit.
- Сравнивать одного агента с Tibicen и без него на одинаковых входах; настройку и следующую задачу проверять раздельно.
- Начать с двух сценариев Codex; затем проверить внешние маршруты Claude Code через API-ключ и ZCode. Подписка Claude Pro не требуется; провайдер, модель и денежный бюджет фиксируются до платных запросов. DeepSeek API остаётся опциональным и выключенным по умолчанию.
- Показывать фактический охват, ошибки и все попытки; не подменять продуктовые метрики тремя экспериментальными дробями.
- Включить семантическую приёмку §9 по [PREF-01–08](../../../docs/evals/PREFERENCE_SELECTION.md), отделяя действительность основания, полезность рекомендации и границы согласия от механической передачи assumptions. Один запрос в разных контекстах проверяет пригодность выбора, включая достаточный принятый процесс и подходящее неподдержанное решение, без заранее правильного бренда.
- Добавить обязательную программу [SKILL-01–04/PROC-01–04](../../../docs/evals/COMPONENT_INTEGRATION.md): положительная установка, загрузка и применение конкретного скилла, сохранность обновления и достаточных правил; init/adopt первого OpenSpec и полный процесс в новой сессии. Сначала фиксируются действительные источники/версии и независимые критерии, а не только названия кандидатов.

- Отделить способ авторизации от native-профиля: API-ключ как основной планируемый маршрут, доступные подписки как альтернативы для экономии; проверять и показывать покрытие каждого маршрута отдельно, без платного fallback и без дополнительных расходов до отдельного бюджета.

## Capabilities

### New Capabilities

- `agent-evaluation-harness`: воспроизводимые внешние испытания агентских сессий, их доказательства, независимые оценки и сопоставимые отчёты.

### Modified Capabilities

Нет. `evaluation-results` используется без ослабления валидации и изменения определения метрик; встроенные продуктовые task/quiz/compat не расширяются.

## Impact

The policy reconciliation changes documentation only. It does not relax `evaluation-results` or the existing quality grader, relabel old series, start new model runs or authorize paid API fallback. The existing 24/24 executor freeze remains closed; any necessary fresh observation needs a separately authorized finite scope.

### Historical implementation checkpoint — 26 October 2026

Область — `scripts/evals/`, отдельные сценарные фикстуры и тесты, отдельная явная команда внешнего запуска и отчёты разработки. Стенд не входит в распространяемые скиллы; `pnpm test` не вызывает модели. Итоговая серия проверяет принятый код по конкретному SHA. Контракты, 67 расширенных фикстур, runner, хранение, механические оценщики, рубрика и парный отчёт реализованы офлайн. Явный внешний вход 2.6 и наблюдаемые Codex preflight/две диагностические пары 3.1–3.2 реализованы; исходные и исправленные результаты сохранены раздельно. Независимая смысловая оценка, SKILL/PREF/PROC и остальные native-профили ещё не подтверждены; синтетическая граница auth:none сама по себе не подтверждает реальную авторизацию.
