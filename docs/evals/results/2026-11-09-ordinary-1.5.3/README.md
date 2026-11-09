# Ordinary Tibicen 1.5.3 workflows — closed with gaps

Both setups were accepted; the stock feature task passed. The queue task was held despite passing tests, and the later memory-correction session failed after a captured edit. Fresh memory reuse and both read-only repeats were not run. These are synthetic observations using [published 1.5.3](../2026-11-09-release-1.5.3/README.md).

## Projects and actions

**Queue starts with six files:** package, README, job source/tests, sample data and conventions; no agent instructions or memory. Jobs must retain IDs, priority labels, caller order and existing behavior.

The agent proposed and applied one short `AGENTS.md`; initial setup was correctly selected despite 110 installed Tibicen payload files. Structural checks and CLI status/report completed. During setup, two missing-Python attempts were handled through Node without operator repair; application tests did not run.

For the fresh priority-filter task, the agent read instructions/README without a cue and changed only source/tests. Five tests and the unchanged predeclared behavior check passed. Review held success: `!job.done` became `job.done === false`, excluding missing/null/zero values even without priority. Source and README conflicted, but the agent changed compatibility without resolving that conflict. Existing guidance covers it; this is agent noncompliance on an ambiguous fixture, not a demonstrated Tibicen runtime bug. No repair or regrade followed.

**Stock starts with twelve files:** package/README/configuration, root/nested instructions, existing `.agents/memory.md`, decisions, catalog/report source/tests and stock data. Root alphabetical sorting contradicts warehouse order; its lint command does not exist.

The agent repaired two instruction files and added a policy for reading, updating and correcting the existing memory. Application files, decisions and memory survived setup unchanged. One proposal command failed with empty captured output, cause unknown; later real CLI output was verified. Apply recovered missing Python through Node and also encountered missing Git. Structural checks/status/report completed; setup ran no application tests.

The fresh availability task read instructions, decisions and memory without a cue; seven meaningful tests and the unchanged predeclared behavior check passed, preserving formatting and protected files/modes.

## Outcomes

| Request | Result |
| --- | --- |
| Queue setup | Accepted |
| Queue priority filter | Execution/checks passed; semantic acceptance held; repeat not run |
| Stock setup | Accepted |
| Stock availability filter | Accepted |
| Remember the new picking-list decision | Edit captured, session failed; correction not accepted |
| Fresh decision reuse and stock repeat | Not run |

The captured memory edit contains positive-stock-only selection, ascending stock, stable ties and unchanged ordinary-report order; the unrelated Node note and mode survived. The session then failed without a final answer after 56.08 seconds, not a timeout. Cause is unknown. Correct-looking stored text does not establish accepted correction or fresh reuse.

<details>
<summary>Planned ordinary requests (original Russian; three not issued)</summary>

**Queue: setup**

> $tibicen-init
>
> Настрой этот проект для работы с агентом. Хочу короткие полезные инструкции без лишних инструментов. Сначала покажи предложение.

**Queue: task**

> Добавь в listJobs фильтр priority: например, high оставляет только такие задачи. Без фильтра всё как раньше, а вместе с openOnly учитывай оба. Добавь тесты.

**Queue: repeat**

> $tibicen-adopt
>
> Посмотри на настройку после этой задачи. Если всё уже подходит, оставь как есть. Новые инструменты не нужны.

**Stock: setup**

> $tibicen-adopt
>
> Агент путается в правилах этого репозитория. Приведи настройку в порядок, наши решения не потеряй. Сначала покажи предложение.

**Stock: task**

> Добавь в renderStock опцию availableOnly: с ней показывай только товары с остатком больше нуля. Остальное пусть работает как раньше. Допиши тесты.

**Stock: correction**

> Поменяли решение для списка сборки: туда идут только товары с положительным остатком, от меньшего остатка к большему. При равенстве сохраняем исходный порядок. Обычный renderStock по-прежнему сохраняет порядок входных данных. Запомни это, код пока не трогай.

**Stock: reuse**

> Добавь renderPickList(items): формат как у обычного отчёта, но заголовок # pick. Допиши тесты.

**Stock: repeat**

> $tibicen-adopt
>
> Посмотри, подходит ли настройка после этих изменений. Если всё уже нормально, ничего не меняй.

</details>

## Limits and next focus

Seven subscription calls used 485.406 seconds including caller overhead, excluding preparation/review time: six turns completed, five phases were accepted, one task was held and one memory call remained incomplete. Three isolated model-free checks ran. All seven native and three grading containers were removed; owned mirrors were removed and temporary homes are empty. No retries. See the [summary](summary.json).

Setup skill paths, operator consent and plan transfer are assistance. Correction permissions named `.agents/memory.md`, so locating that store was assisted. Safe diagnostics did not identify the failure cause. Human benefit, automatic loading and causal improvement remain unproven; earlier failures are unchanged. Next focus: clarify the queue's conflicting contract and improve privacy-safe failure observability. No product patch is established by this run.
