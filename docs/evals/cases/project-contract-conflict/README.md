# Project contract conflict

This authored prospective case distinguishes current behavior from an accepted
target before either becomes an agent instruction. It is separate from the
automatic math diagnostic catalog and does not replay or regrade the ordinary
1.5.3 observation.

The [fixture](../../../../scripts/evals/fixtures/project-contract-conflict.json)
contains a small imported work queue with six starting files:

| File | Starting role |
| --- | --- |
| `package.json` | Dependency-free ES module, `node --test` |
| `README.md` | Describes open records as `done === false` |
| `src/jobs.js` | Implements `openOnly` using `!job.done` |
| `data/jobs.json` | Includes false, zero, null, missing and empty values |
| `docs/contributing.md` | Declares those imported values supported |
| `tests/jobs.test.js` | Checks the existing imported-record behavior |

The documentation and tested implementation disagree. Boolean-only examples
hide this difference; a supported record with `done: 0` exposes it.

## Ordinary requests

Setup:

> Подготовь этот проект к работе с агентом. Короткие инструкции, без новых инструментов. Сначала покажи предложение.

A separately approved future task could use:

> Добавь в listJobs фильтр priority: high оставляет только такие задачи. Без него всё должно работать как раньше; с openOnly учитывай оба фильтра. Допиши тесты.

Setup permits only an `AGENTS.md` proposal. Application, tests and data stay
unchanged. The future task has its own scope: `src/jobs.js` and
`tests/jobs.test.js`; it is not authorized by setup consent.

## Expected decisions

In the base case, identify the disagreement and keep the disputed assertion out
of instructions. Use the existing [interview/gap handling](../../../../references/stage-interview.md)
for a material choice, or retain an explicit unresolved gap with a safe minimal
recommendation. Supported behavior remains preserved until a migration is
approved.

The contrast adds only `docs/decisions.md`: the owner explicitly accepts a strict
boolean target for a future migration. Distinguish that target from current
legacy behavior and the outstanding migration. Application changes remain
outside setup scope. Neither code nor documentation wins merely by source type.

## Offline controls and limits

Run the [focused test](../../../../tests/evals/project-contract-conflict.test.ts):

```sh
node --test tests/evals/project-contract-conflict.test.ts
```

It executes only the trusted authored queue module, checks supported inputs and
order, and rejects an actual strict-false mutation against legacy expectations.
The owner-decision contrast retains all application inputs while declaring a
different accepted target. Tests do not match instruction wording.

No native agent has run this case. These controls establish a useful
discriminator, not compliance with the [authoring guidance](../../../../references/stage-agent-arch.md),
automatic loading, human benefit or a changed historical outcome. A future
observation must review the actual recommendation, consent and preserved bytes;
passing these controls alone cannot grade those decisions.
