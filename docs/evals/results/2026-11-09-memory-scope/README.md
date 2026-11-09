# Named memory scope and genuine conflict

**Completed: three bounded observations accepted.** The agent preserved an
explicit operation name, used its corrected decision in a fresh implementation,
and asked for clarification when that same operation had incompatible decisions.
The [summary](summary.json) retains exact results. The
[earlier Hold](../2026-11-09-fresh-conflict-memory/README.md) is unchanged;
“assembly list” was not explicitly linked to `renderPickList` there.

## Project and ordinary requests

The new API is `renderAssemblySheet(items)`. The operator restaged a clean
12-file stock project with `renderStock`, `availableOnly`, seven tests and
existing private-mode memory, then instantiated the reviewed **Unreleased**
working policy in both AGENTS blocks. This is operator assistance, not observed
Tibicen instruction generation/setup. The 110-file skill build keeps package
version 1.5.3; published artifacts are unchanged.

Route: Codex 0.157.0 (binary `ad0be20d…`), `gpt-6-astra`, existing subscription
access only; Linux arm64 tool container `ba23f5c6…`, Node 24.15.0 and pnpm
11.21.0. The [execution identity](summary.json) binds full hashes, including
reviewed memory guidance `758c1734…`.

Correction:

> Поменяли решение для renderAssemblySheet(items): только товары с положительным остатком, от меньшего остатка к большему. При равенстве сохраняем исходный порядок. renderStock не меняем. Запомни, код пока не трогай.

Fresh reuse and an independent conflict variant received the same request:

> Добавь renderAssemblySheet(items): строки sku:stock, заголовок # assembly. Допиши тесты.

| Phase                   | Observed result                                                                                            |
| ----------------------- | ---------------------------------------------------------------------------------------------------------- |
| Named correction        | Accepted: same API recorded with positive stock, ascending order and stable ties; only memory changed      |
| Fresh reuse             | Accepted: corrected memory read before implementation; new export, nine tests and functional oracle passed |
| Same-operation conflict | Accepted: two incompatible active notes recognized; focused clarification, no code/test changes            |

Correction preserved the `renderStock` exception boundary, exact SKU policy,
nonmutation requirements and unrelated Node note. Fresh implementation retained
`renderStock` order and `availableOnly`; the frozen oracle passed in 1.044 seconds
with all 122 project/runtime file modes preserved. Memory remained unchanged.

The negative seed differed only in memory: both notes named the same API, with
no recorded chronology, supersession or winner. Its task and two-file write
permissions matched positive reuse, so clarification was not forced by a
read-only restriction. No operator answer or fourth native call followed.

## Assistance, checks and limits

Correction named no memory path; the fresh task received no prior correction
prompt, filtering/order answer or reading cue. Source/test and execution bounds,
restaging and the instantiated policy are disclosed assistance. This tests
working instructions, not their automatic generation.

Boundary checks passed in 2.494 seconds; controls in 1.884 seconds: one seven-test
baseline, two valid alternatives (eight/seven named tests) and nine targeted
negatives. Three native turns completed and were accepted; summed CLI time was
100.071 seconds, maintained-caller time 106.859 seconds. Three model-free
containers ran. All six containers were stopped/removed; the owned host root
was removed and native homes were empty. No retries, fourth call or paid API.

The initial full `pnpm test` was **not green**: formatting stopped on three
concurrent research JSON files before source tests. Later component type/site/
spec/build checks passed. An intermediate Node assertion caught an omitted
cancellation clause; restoring it without changing the test yielded 1,075 passed,
one existing skip, zero failures. Portable checks passed 3/3, both built
self-tests/reference copies passed. Formatting passed excluding exactly those
three files; component results are not a green original full gate.

These small synthetic cases establish the observed branches only. They do not
prove causal improvement, automatic loading, other-harness compatibility or
human benefit, and do not regrade the earlier ambiguity.
