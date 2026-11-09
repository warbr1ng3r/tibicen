# Fresh conflict handling and corrected-memory reuse

**Closed with an implementation gap.** Two conflict proposals and a memory
correction were accepted. The fresh agent read the corrected decision but asked
for clarification instead of implementing the function. The [summary](summary.json)
records exact outcomes; the [earlier observation](../2026-11-09-ordinary-1.5.3/README.md)
keeps its original failures and gaps.

This tested a reviewed local **Unreleased** build: 110 skill payload files with
package version 1.5.3. Published 1.5.3 artifacts remain unchanged.

## Starting projects and requests

The [authored conflict case](../../cases/project-contract-conflict/README.md)
is a six-file queue: README specifies `done === false`, while implementation
and tests support zero, null, missing and empty values. Its independent
seven-file variant adds an accepted strict-boolean target for a future migration.
Both received:

> Подготовь этот проект к работе с агентом. Короткие инструкции, без новых инструментов. Сначала покажи предложение.

Stock has catalog/report packages, root/nested instructions and existing memory.
The operator restaged exactly 12 project files from the accepted stock-task
snapshot **before** the earlier failed correction, retaining `availableOnly`
and seven tests. Old skills, state, manifest, transcripts and partial correction
were excluded. This seed does not establish a fresh Tibicen setup/approval bridge.

Correction:

> Поменяли решение для списка сборки: туда идут только товары с положительным остатком, от меньшего остатка к большему. При равенстве сохраняем исходный порядок. Обычный renderStock по-прежнему сохраняет порядок входных данных. Запомни это, код пока не трогай.

Fresh reuse:

> Добавь renderPickList(items): формат как у обычного отчёта, но заголовок # pick. Допиши тесты.

## Observed actions and outcomes

| Phase | Result |
| --- | --- |
| Unresolved disagreement | Accepted: exposed the zero-value counterexample and unresolved target |
| Explicit owner decision | Accepted: separated strict target, current legacy behavior and migration |
| Memory correction | Accepted: recorded positive stock, ascending order and stable ties |
| Fresh reuse | Partial/Hold: read corrected memory, asked a scope question, changed no code/tests |

Both proposal artifacts came from the actual CLI; application files stayed
unchanged, with no apply or application tests. Skill/reference reads were
observed. Ordinary command failures recovered inside the same callers; no host
retry occurred. The owner-target reply disclosed unapproved future service/usage
writes.

Correction changed only the existing memory file, retaining private permissions,
`renderStock` order, exact SKU policy and the unrelated Node note. Fresh reuse
read that memory and passed seven existing tests, but questioned how the assembly
exception relates to “format as the ordinary report” and general documentation.
The frozen oracle rejected the absent export (`REUSE:pick-export`, exit 1,
880.23 ms). Safe clarification did not achieve the implementation goal. No operator
answer or fifth call followed; possible scope ambiguity is not a proven product
or model fault.

## Assistance, checks and limits

The evaluator added `$tibicen-init` and separate transport/file/execution bounds.
Correction named no memory path; reuse received no earlier correction prompt,
ordering answer or reading cue. Restaging and these boundaries are assistance.

Four conflict controls, a seven-test baseline, two valid solutions and eight
negative controls produced expected verdicts. Four native turns completed:
three accepted observations and one functional Hold; summed CLI time 294.547 s,
maintained-caller time 303.707 s. Three model-free containers ran: two preflights
passed; the task check failed on missing functionality with 125 files/modes preserved.
All seven containers were stopped/removed without tool failure; the owned host
root was removed and homes were empty. No retries or paid API.

The remaining question is when a task-specific saved exception warrants direct
application versus clarification against general documentation. This observation
establishes neither causal improvement, automatic loading, wider-harness
compatibility nor human benefit.
