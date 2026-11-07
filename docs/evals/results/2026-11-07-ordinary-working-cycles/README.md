# Ordinary working cycles with Tibicen 1.5.1

**Stopped; no complete working cycle accepted.** Two real proposals were accepted; the next queue application session failed before any command or message, and the frozen evaluator stopped the packet globally. All 24 model-free checks remain passed. Snapshot: `2026-11-07T20:10:54+00:00`.

We are checking a simple sequence: ask for agent setup, approve the actual proposal, do a useful task in a fresh session, then ask whether the setup needs another change. These are four small generated projects, not a human pilot or a comparison against another product. The Russian requests below retain their actual wording. All twelve were prepared; only the two initial setup requests received completed responses. No useful-task or repeat request was run. Activation and environment permissions were supplied separately.

The **Before** rows describe the authored project before installing the 110 published Tibicen files locally. Actual native input included those files: 116 for queue, 118 for Bash, 122 for TypeScript and 117 for the handbook. The latter two were staged but never launched.

## JavaScript queue: initial setup

| Step | Starting point, request or result |
| --- | --- |
| Before | Six files; no agent instructions or memory. A dependency-free queue already preserves IDs/order and supports an open-only filter. |
| Setup request | Настрой этот маленький проект для работы с агентом. Хочу короткие полезные инструкции, без новых инструментов. Сначала покажи, что предлагаешь поменять. |
| Useful task request — not run | Добавь в listJobs опцию priority: например, выбрал high — вижу только такие задачи. Без неё всё должно работать как раньше, а вместе с openOnly — учитывать оба фильтра. Порядок и сами задачи не меняй. Добавь тесты. |
| Repeat request — not run | Посмотри ещё раз на настройку агента после этой задачи. Если всё уже подходит, оставь как есть; новые инструменты не нужны. |
| Actual outcome | Real proposal accepted: add one short `AGENTS.md` at `0600`, with no new tools. Exact root consent was recorded. The native apply session then failed before commands/messages; no CLI apply was observed. Useful task and repeat were not run. |

## Bash log filter: adopt existing setup

| Step | Starting point, request or result |
| --- | --- |
| Before | Eight files; existing instructions, one private memory and a workflow skill. Bats commands are stale; the actual checks use Bash. Owner decisions preserve exact lines, IDs, case and order. |
| Setup request | Наведи порядок в настройке агента для этого маленького проекта. Наши решения и память сохрани, ничего устанавливать не надо. Сначала покажи конкретные изменения. |
| Useful task request — not run | Добавь фильтр --level: например, с --level ERROR должны остаться только строки ERROR. Без фильтра всё должно работать как раньше. Порядок и сами строки не меняй, регистр уровня учитывай. Добавь тесты. |
| Repeat request — not run | Проверь, подходит ли текущая настройка агента для дальнейшей работы с фильтром. Если исправлять нечего, ничего не меняй. |
| Actual outcome | Real proposal accepted: replace stale Bats guidance in `AGENTS.md` and the existing workflow skill with the actual Bash check. Existing memory was unchanged. Exact root consent was recorded, but apply preparation was blocked by the global STOP before execution. Useful task and repeat were not run. |

## TypeScript workspace: reconcile scoped rules

| Step | Starting point, request or result |
| --- | --- |
| Before | Twelve files; two dependency-free packages, root/nested instructions and existing memory. The root sorting/lint rule conflicts with scoped caller-order rules and the actual Node checks. |
| Setup request | Разбери настройку агента в этом репозитории и убери мешающие противоречия. Полезные правила пакетов и наши решения не потеряй. Сначала покажи предложение. |
| Useful task request — not run | Добавь в renderStock опцию availableOnly: с ней показывай только товары с положительным остатком. Без неё отчёт должен остаться прежним. Порядок, заголовок и SKU не меняй. Добавь тесты. |
| Repeat request — not run | Посмотри на настройку после изменения отчёта. Если правила уже достаточны и не конфликтуют, оставь их как есть. |
| Actual outcome | Not run: the packet stopped globally before this case. The requests above are prepared inputs, not observed agent actions. |

## Documentation handbook: initial setup

| Step | Starting point, request or result |
| --- | --- |
| Before | Seven files; no agent setup, application or software test suite. Version 1.2.0 is already published; 1.2.1 is only the next draft. |
| Setup request | Подготовь этот маленький проект с документацией к работе с агентом. Инструкции нужны короткие, без лишних инструментов. Сначала покажи план изменений. |
| Useful task request — not run | Допиши в руководство понятный порядок следующего патча 1.2.1. Он пока черновик: нужен пример аннотированного Git-тега и как проверить его перед отправкой. Старую историю и опубликованную 1.2.0 не переписывай, новую дату релиза не придумывай. Команды только покажи, ничего не публикуй. |
| Repeat request — not run | Посмотри, хватает ли текущих правил агенту для дальнейшей работы с документацией. Если всё уже понятно, ничего не добавляй. |
| Actual outcome | Not run: the packet stopped globally before this case. The requests above are prepared inputs, not observed agent actions. |


## Where the actual run stopped

| Native phase | Native time | Observed result |
| --- | ---: | --- |
| Queue setup proposal | 73.126 s | Actual CLI proposal and visible consent request accepted by root and independent review; project unchanged |
| Bash setup proposal | 90.857 s | Two exact instruction repairs and existing-memory preservation accepted by root and independent review; project unchanged |
| Queue approved application | 37.061 s | `error` / `turn.failed`, `pass: false`, exit code `null`, zero commands/messages; no approved AGENTS file produced |

The native failure's cause is **unknown**: retained error details are redacted and stderr is empty. No Tibicen CLI apply, verify, status or report was observed. The private evaluator then demanded successful output before handling the failed native result; its missing-`AGENTS.md` assertion escalated the unchanged case to a **global STOP**. That evaluation-order error does not establish a product apply defect, and the original STOP remains binding.

All **117 input files and modes were unchanged**, with no extra output, AGENTS, manifest or state file. Container stop/removal and host/source/config preservation were verified. Root subsequently removed the checked, owned host mirrors; the raw records remain. The native packet is **closed: three native starts and two model-free containers** (capability and controls). Bash apply description was blocked before execution. TypeScript/documentation setup, all useful tasks, all task grades and all repeats were not run. Nothing was retried or regraded.

## Completed checks and current limits

The exact published [1.5.1 distribution](../2026-11-07-release-1.5.1/README.md) is reused: 55 files per skill, 110 payloads, distribution commit `287ef7b22630482aca7996e5a0faad601cede778`. Both complete skills are staged in each project; this observes project-local installation, not discovery from a user's global home. Existing subscription Codex CLI 0.157.0 requests `gpt-6-astra`, with Node 24.15.0 and Bash 5.2.15. Python was unavailable, so the selected batch uses Bash rather than the unused CSV/Python preparation. No dependency or image installation was performed.

The model-free control container completed once in **3.709 seconds**: four baselines, four positive implementations and sixteen cause-specific negatives. All 228 staged file bytes/modes were preserved, including private/executable mode probes; container stop/removal was verified. Root accepted the actual receipt. The earlier C01 description stopped on JSON presentation before execution; the serialization correction and original STOP remain recorded. No native result is inferred from either preparation step.

The stopped packet had a prospective ceiling of twenty native sessions / 2,280 seconds across four cases, including optional clarification slots, with zero paid-API budget and no automatic retry. Three native callers started. Unused slots do not authorize resumption. Actual proposals and exact root consent were retained; the queue continuation explicitly received the approved artifact, but never issued a command. Useful-task grades and no-change repeats were planned and did not run. The model-free ceiling was eight containers, including the capability observation and bounded pre-model control attempts, with a 20-second deadline per grade. Only the capability and successful control containers have run among model-free checks.

Ordinary requests are not forced into a CLI mode: preinstalled skills may make a first-instruction request classify as improve. A successful task cannot establish that instructions were loaded, caused the result, benefited a person or work across other models/harnesses. Claims about instruction or memory use require actual evidence. No baseline arm, real-user usefulness measurement, publication or global agent configuration change is part of this observation. See the [native-run method](../../NATIVE_RUNS.md).

Private local records, intentionally not published as broken repository links: `oc151/packet-protocol.json`, `oc151/preflight-result.json`, `oc151/oracle-controls-acceptance.json` and `oc151-grading/controls-C02-{raw,result}.json`. Accepted control result SHA-256: `bdc20e8119acda67ae6a5a7ae3cfa0c1b174bcf48db94d151ba9ce8ce8e12b64`. Actual native records are retained in `oc151/{queue,shell}-proposal-acceptance.json`, `oc151/queue-apply-outcome.json` and `oc151/STOP.json`. Failed queue outcome SHA-256: `9b35690008e1c7fe00d385af9d2e77b03451572b2a5f4c19966a5ce4c98ed6a0`. No full-cycle pass, task-grade success, or repeat success is recorded.

## Separate offline CLI diagnosis — completed

Two separately approved, one-use model-free containers applied the unchanged queue and Bash envelopes directly through the published 1.5.1 CLI on `2026-11-07`, in 3.834 s and 1.976 s respectively (20 s ceiling each). These are **two additional containers**, with zero model sessions, auth reads/writes, network, installations or application execution. They are separate from the closed native packet and do not complete or regrade its three native starts.

| Case | Actual CLI and collected result |
| --- | --- |
| Queue | `apply → verify → status → report`, all exit `0`. The exact approved `AGENTS.md` was added at `0600`. Apply, status and report returned `complete`; infrastructure verification returned `passed`, `structure-only`. |
| Bash | The same four CLI commands, all exit `0`. Both exact approved instruction repairs were written at `0644`. Existing `.agents/memory.md` stayed byte-identical at `0600`. Apply, status and report returned `complete`; infrastructure verification returned `passed`, `structure-only`. |

The fixed diagnostic program read the actual approved instruction outputs and existing Bash memory. Both complete initial input sets (117/119 files including the approved envelope) were checked before apply; all protected file bytes/modes and all 110 runtime files were preserved afterward. Private manifests were `0600`, no transient session state remained, and both containers were stopped and removed with `toolFailure:null`. The Bash memory SHA-256 remained `fd21f734eb8ed780c65cfe978b83e9ecaa28a4873605463e7eb57a1f555e2970`.

The reports retain `verify:unverified/no-project-checks` and `task`/`quiz:unverified/not-requested`; compat has no pairs and MCP has no probes. Structural completion does not establish an application test pass, fresh-agent instruction or memory use, useful-task success, repeat stability or human benefit. The earlier native failure cause remains unknown. A separate [local routing correction](../../../../openspec/changes/distinguish-self-installed-tibicen/verification.md) is implemented and verified, but is Unreleased. It was not part of the published runtime used here and does not change these historical results.

Private diagnosis records: `oc151-cli-diagnosis/{queue,shell}-{raw,result}.json`. Queue result SHA-256: `0e9372cd44c54cf8a8c05b251c7e2dab742015d7d7bd290a489a5cf5d959e961`; raw receipt: `4fb8fa29dbf3f6dcc2edf05b15de3455573a4fa60c9746f0c7fcdfbb36ecb6b9`. Bash result SHA-256: `3b9b4036175e4277e5a00add121514154565d58b4287fa061c55871965209a24`; raw receipt: `576b7f19c8fc35b36a79e37689b9a1b7fcbac451d9daae0b2b80c1e130b553c4`. Native closure records remain private `oc151/reviews/method-queue-apply-failure.json` and `oc151/cleanup.json`.
