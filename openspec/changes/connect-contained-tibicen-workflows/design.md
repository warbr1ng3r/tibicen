# Design

## Context

Исследование: `.evals-private/codex-native-workflow-seam-20261027-r1/research.md`, selected-first-vertical. Все native model calls проходят local session() в native-runner.ts; proposal review/evidence/approval уже реализованы. Narrow caller возвращает stopped-container bytes, current archive parser теряет modes. Полный shipped bundle43files/~391KB помещается в существующие transfer limits.

## Decisions

- Использовать существующую orchestration и concrete contained route; не выдавать async caller за NativeCommand и не открывать trusted fixture loader через JSON. General default остаётся fail-closed.
- Первый scope — ровно Tibicen-only init/adopt с AGENTS.md; setup proposal и approved apply+verify/status/report/final response. Task явно skip/out-of-scope, baseline сравнение не заявляется.
- Container workspace содержит фиксированные соседние каталоги `project/` и `support/`. Product root — `project/`; frozen dist, logical HOME и approved plan находятся в `support/runtime/<skill>`, `support/home` и `support/plan.json`. Так они не участвуют в product scan и переживают штатную очистку `.tibicen/state`. CLI получает абсолютный product root и command-scoped logical HOME; generated host auth HOME/CodeMode env остаётся вне transfer workspace.
- Фиксированный frozen marker `project/.tibicen/.keep` создаёт каталог пустого проекта в file-only transfer. Это защищённый seed, не продуктовый результат; regression подтверждает прежнюю empty-project classification и отсутствие support в scan.
- Перед каждым child freeze включать exact seed/runtime/prompt/schema/allowed results. Whole stopped tar допускает только seed и точные approved AGENTS/kernel service/usage paths. Проверять support/protected bytes и modes; root записывает только проверенные изменения в собственный synthetic project. Никакого recursive host extraction или выполнения returned code на host.
- Proposal не меняет seed. Approved apply проверяет existing kernelPlan digest, observed trusted apply/verify/status/report и actual manifest/AGENTS bytes. Report --save и произвольные service paths не допускаются. Независимая структурная проверка использует тот же pinned runtime в отдельном model-free container.
- Новый prospective subscribed batch: максимум4host attempts,2percase,90ssession/180scase/360sbatch,0retries/fallback/judge/startup/API. Ошибка/abort/deadline/cleanup/budget прекращает batch до следующего auth read. Это будущий fresh protocol после реализации/review, не текущая модельная авторизация.

## Risks / Trade-offs

- [Mode changes скрыты byte-only transport] → bounded tar mode facts и exact preservation checks.
- [Подмена trusted runtime/plan] → frozen bytes/modes сравниваются после collection, report сверяется с actual state.
- [Scope creep к полной матрице] → reject unsupported selection before auth, явный setup-only результат.
- [Auth HOME попадает в tools] → только workspace logical HOME, existing host-only access-only projection без изменений.

## Observed correction

Actual synthetic attempt2 выполнил proposal и apply, затем verify получил `MODULE_NOT_FOUND`: успешный product finalizer удаляет весь `.tibicen/state`, включая первоначально помещённый туда runtime. Отдельный model-free replay подтвердил причину. Поэтому support вынесен из product root; продуктовый cleanup/scanner ради стенда не меняется. Failed attempt и diagnostic-1 сохраняются в `.evals-private/codex-contained-tibicen-synthetic-20261027-r1/`.

Attempt3 выполнил actual apply/verify/status/report, но `item.completed` для report содержит exit0 и пустой aggregated_output, тогда как actual V8 tool result содержит complete JSON. Причина потери audit stdout не установлена. Пустой capture явно недоступен; все обязательные exact invocations сохраняются, independent container всегда проверяет status/report/verify, а каждый непустой capture сравнивается без перезаписи предыдущих. Непустые malformed/null/array/primitive JSON отклоняются.
