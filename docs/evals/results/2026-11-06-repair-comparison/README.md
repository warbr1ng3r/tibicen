# Repair comparison: direct Codex and Tibicen 1.4.1

**6 November 2026, Europe/Moscow. Completed.** Both approaches corrected the same obsolete command, preserved the project and completed an identical fresh task. Both left an already sufficient setup unchanged. Tibicen's actual proposal/apply and manifest worked; this small example did not demonstrate an additional useful outcome or reduced human work.

This is the bounded technical follow-up to the [strategy study](../../../research/2026-11-06-product-strategy/README.md) and [prepared comparison](../../../../.scratch/repair-comparison-prep-20261106/README.md). It is an assisted synthetic rehearsal, not a customer study. The [execution map](../../../../.scratch/repair-comparison-run-20261106/map.md) and [dashboard](../../../../.scratch/repair-comparison-run-20261106/dashboard.md) are closed. Product code, roadmap, shared tracker and release integration belonged to the other chat and were not edited here.

## Question and inputs

Can published Tibicen repair obsolete instructions and reach a useful task while preserving the same material as competent direct Codex? A sufficient variant checks for gratuitous setup changes.

Each case has seven project files: main instructions, a local workflow skill, CI, a team note, a dependency manifest, source and tests. The repair case has an obsolete `yarn check` instruction and a harmless duplicated test command. The sufficient variant corrects those two instruction bodies. The subsequent task is identical: add/test `triple(value)` while preserving public `double` behavior, the note, dependencies, CI and owner review of infrastructure changes. Neither approach receives a hidden defect location or reference answer.

## Frozen protocol

- Codex CLI **0.157.0**, model **gpt-6-astra**, existing subscription authentication projected as access-only data. No paid API, refresh request or source credential write by the caller. Initial authentication preservation was checked; no credentials were supplied to project commands.
- At most **8 sequential caller launches / 960 seconds**: one 150-second proposal and one 90-second fresh task for each of four arms. Actual order: repair direct, repair Tibicen, sufficient Tibicen, sufficient direct. No caller reruns or fallback. Provider-internal retry counts were not reported.
- A proposal can write only its designated artifact outside the project. Root reviews the actual proposal and separately authorizes exact changes before model-free application. Direct proposals use a study-specific JSON artifact; this is not a claimed native audit feature. Tibicen receives the complete staged 50-file adopt runtime and explicit skill invocation; when needed, it uses the actual proposal CLI and digest-approved apply.
- Fresh task sessions receive accepted project bytes only: no proposal, runtime, oracle, reference implementation or previous answer. They explicitly read current instructions. Only source/tests may change, and `node --test` is authorized for this phase.
- All project commands and returned code run in owned network-none containers using the pinned image `sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd`. No host execution of model code or project writeback. Launch, session, collection, preservation, grading or cleanup failure would stop remaining phases; ordinary recoverable command errors remain in the trajectory.

Private inputs, prompts, caller, published runtime and grader were frozen before observation. All **20 source hashes and 65 asset hashes** still matched at closeout. A separate model-free control container rejected missing/wrong exports and a `double` regression, accepted a reference, restored inputs and verified cleanup. Four grading containers checked returned exports at `3, 0, -2`, ran the actual tests and preserved their inputs. Grader rules were not amended after observation.

## Results

All proposal/project preservation checks, four separate task grades and root semantic acceptances passed. Full staged skill bodies appeared in both Tibicen proposal command outputs. Full accepted main/local instruction bodies appeared before editing in all four fresh tasks; this verifies explicitly requested reading, not automatic discovery.

| Case | Approach | Setup result | Fresh task |
| --- | --- | --- | --- |
| Repair | Direct Codex | Replace the obsolete skill command with `node --test`; one approved file edit | Passed |
| Repair | Tibicen | Identical file edit through actual CLI apply; manifest added | Passed; identical source/tests |
| Sufficient | Tibicen | No change; no manifest or session created | Passed; identical source/tests |
| Sufficient | Direct Codex | No change; no manifest or session created | Passed; identical source/tests |

Both repair proposals retained the harmless main-instruction duplicate, a secondary-quality observation under the frozen criteria. Both preserved effective owner-review and public-export rules. Tibicen apply reported `complete`, structural checks passed, and transient session state finalized. Supplemental compatibility probes and apply-time task/project checks were not run and remained unverified; later fresh-task evidence does not retroactively mark them passed.

Actual final source and test bytes matched across all four arms: `double` multiplies by two, `triple` by three, and both named tests run successfully in the separate grader. Protected files stayed unchanged during the task, including the Tibicen manifest where present.

## Observed effort proxies

Times below cover native phases only. “Caller” includes its surrounding launch/collection overhead; CLI is the recorded subprocess interval. Neither includes preparation, ordinary installation, root review, separate application, grading or human active effort.

| Case / approach | Proposal caller / CLI seconds | Task caller / CLI seconds | Parsed shell command records, proposal / task |
| --- | --- | --- | --- |
| Repair / direct | 55.44 / 53.33 | 34.12 / 32.09 | 4 / 4 |
| Repair / Tibicen | 71.65 / 69.55 | 33.61 / 31.44 | 10 / 5 |
| Sufficient / Tibicen | 90.11 / 88.00 | 32.21 / 29.65 | 12 / 5 |
| Sufficient / direct | 40.56 / 37.88 | 39.00 / 36.54 | 4 / 4 |

Eight caller launches completed once: **396.68 seconds caller / 378.49 seconds CLI**, within the declared cap. Four model-free operator containers handled two repairs and two no-ops; four task graders and one control container also completed. All owned session/container cleanup checks passed. Raw outcomes/events were retained before checks.

Five ordinary nonzero command records recovered within successful proposal sessions: missing ancestor/search paths or an advertised but unavailable optional documentation skill in the direct arms, and unavailable Python followed by Node artifact writing in the sufficient Tibicen arm. These are retained environment/tooling noise, not failed sessions or retries; the comparison does not isolate their timing effect. Shell record counts are not counts of every tool action. Monetary cost and human effort are unknown; token counters do not establish either.

## Product implication and limits

The integrated repair and competent direct method both worked on this case. Tibicen exercised exact approval, preservation and manifest mechanisms, but they did not produce an extra functional result here. The Tibicen proposal phases took longer in this single ordering; this is not a general speed estimate. There is no evidence here to expand the integrated workflow for this simple correction.

The strategy study's whole-workflow benefit gate remains **unmet by this evidence**: normal installation and total active human work were not observed. Root performed proposal review, exact approval, application and final semantic review; there was no independent semantic reviewer or human usefulness score. Staged explicit loading is a narrower result than ordinary installation/discovery. One small reused fixture, one host/model and one order per case cannot establish demand, retention, broad superiority or failure of other use cases.

Keep current capabilities available and treat this as counterevidence to expansion justified by simple instruction repair alone. A different product bet needs a concrete gap beyond competent native behavior and its own bounded comparison. This packet is complete; it creates no additional run, recruitment, implementation, release or commit obligation. Local links, paired EN/RU targets, statuses and whitespace were checked; shared runtime tests were not rerun for this report.
