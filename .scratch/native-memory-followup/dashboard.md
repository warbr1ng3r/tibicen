# Native working and memory cycle

| Work | Status | Owner |
| --- | --- | --- |
| [Freeze the bounded native caller](issues/01-caller.md) | resolved | native_routes |
| [Prepare independent checks and controls](issues/02-oracles.md) | resolved | native_protocol |
| [Observe the three native phases](issues/03-observations.md) | resolved | none |
| [Integrate results and review](issues/04-integration.md) | resolved | none |
| [Preserve ordinary command recovery](issues/05-recovery.md) | resolved | none |

| Native phase | Required observation | Status |
| --- | --- | --- |
| Useful work | Read actual memory; implement batching using its accepted limit | failed: executor exit 127; no candidate collected |
| Decision correction | Update the limit, implementation and memory; preserve unrelated decisions | stopped after M1 |
| Fresh read | Read corrected memory and explain the current result without the answer in the prompt | stopped after M1 |

Native budget: three sequential sessions, 180/150/90 seconds; no automatic retry,
paid API or fallback. Published skills remain 1.4.1. The earlier failed S1 remains
failed; this packet does not replace it.

M1 ran once for 23.96 seconds. Two commands completed successfully; no memory-body
read or completed task was observed. First failure has a matching accepted start,
exit 127 and sandboxDenied false, but its argv remains unknown. Cleanup passed;
collection is unverified. The 21 model-free oracle controls passed beforehand.

Offline continuation now owns a separate demonstrated evaluator defect: ordinary
nonzero commands terminate the whole session before Codex can recover. The
[recovery change](../../openspec/changes/preserve-recoverable-command-results/tasks.md)
has no model, credential, image or permission change and does not reopen M1–M3.

Recovery is complete locally: the same reviewed owner-socket driver changed from
red to green after only session policy changed. Focused 73/73; full gate
981 passed, zero failed, one existing manual skip. Independent source, evidence
and final integration reviews: Ship. All five tickets are resolved. Any later
native observation belongs to a new prospective packet and source/input freeze.
