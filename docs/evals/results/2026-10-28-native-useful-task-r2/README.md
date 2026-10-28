# Native Codex useful-task attempt after the diagnostic fix

On 2026-10-28, one newly authorized Codex CLI subscription session **stopped before completing the useful task**. It implicitly selected and read the exact installed Ponytail skill, then the container reported a process exit code of **1**. The new diagnostics retained that event; the underlying failed command and cause remain unknown. There was no repeat.

This is a fresh copy and separately authorized attempt after the [offline diagnostic fix](../../../../openspec/changes/containerize-native-evaluation-execution/diagnostics-verification.md). The [earlier failed attempt](../2026-10-28-published-alpha-native/README.md) remains unchanged. This does not establish useful-task success or full MVP acceptance.

## Inputs and limits

The generated numeric-helper project restores nine exact post-setup files from the earlier published-alpha case, including the Tibicen-installed Ponytail, its MIT license, AGENTS and the original manifest. Setup was not rerun. Ponytail is pinned to `DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710`; body SHA256 is `9badd22a32e19cb884e46dfa8d3aae82bb81dfa5484105b8b4f0262df823a509`.

The ordinary task asks for `clamp(value, min, max)`, inclusive bounds, finite-number validation, a reversed-bound error, preservation of `double` and focused tests. It names neither Ponytail nor an instruction-reading command. Only `src/numbers.js` and `tests/numbers.test.js` may change in the container. The seven other inputs are protected.

Pinned runtime: Codex CLI 0.157.0 / `gpt-6-astra`, the existing contained subscription route, twenty frozen harness sources and the owned network-disabled tool container. Freeze digest: `89323eeff8d95233f8e192216ab865b1a13fc8da510a7060b1b4e38420932483`. Limit: one session, 120 seconds including setup, 45-second launch allowance, no automatic repeat, paid API budget zero. HTTP request counts and token usage are unverified; one session does not mean one HTTP request. No login, OAuth or SDK work was performed.

An independent prelaunch `ponytail-review` approved the exact script, protocol, freeze, oracle and grader hashes. A race in the private grader was found and fixed before the model started: Docker execution previously began before the container was running. Both the original failed baseline and its script were retained. The corrected baseline passed the two original tests; the hidden oracle failed specifically because `clamp` was absent. Both model-free grader containers were stopped and removed. The oracle is outside the model's nine input files and covers normal/extreme finite values, invalid arguments, reversed bounds and preservation of `double`.

## Observations

| Check | Actual result |
|---|---|
| Native start | Confirmed; turn started, not completed |
| Implicit skill selection | Confirmed from the natural task and native trajectory |
| Full body loading | Confirmed: successful native command output contains the exact 3,496-byte pinned skill body |
| Useful task and final native report | Incomplete; no final report was produced |
| First stopping event | `toolFailure: {kind: "process-exit", exitCode: 1}` |
| Failed command and underlying cause | Unknown; no corresponding failed command item was retained |
| Time | Native CLI 18.805 seconds; whole caller 20.825 seconds |
| Collection / container writes | Zero files collected after failure; container write set unverified |
| Host preservation | All nine bytes/modes unchanged; no unlisted host files or writeback |
| Source validation | `sourceUnchanged: null`: full post-run validation unverified after cancellation; an independent check matched all twenty frozen source hashes |
| Other guards | Generated config and Code Mode wrapper checks passed |
| Cleanup | Tool container stopped and removed |
| Historical material | All 284 frozen prior artifact/project/distribution files matched |

The failed attempt was not graded as a successful task. Its collected output is empty; the candidate test/oracle phase was not run and no separate app-context task replaced it. The retained numeric event identifies a process failure, not its cause or an error in Tibicen/Ponytail. The built-in setup reports and previous observations have not been upgraded.

## Evidence and follow-up

[Sanitized observations](results.json) accompany this report. Private evidence retains the reviewed protocol/freeze, one-attempt marker, original and corrected baseline controls, raw native trajectory, terminal receipt, root preservation checks and independent acceptance review. The CLI JSONL trajectory and container receipt are separate evidence channels; a stopped turn may not emit a corresponding failed command item in time.

Current-runtime focused regressions passed 17/17. The earlier full offline gate remains 700/700, with no runtime changes during this attempt; it was not repeated for these reporting changes. Root checked report links, English/Russian parity, preservation and the absence of private paths. Independent artifact and EN/RU documentation reviews returned **Ship for accurate failed/partial reporting**; they do not approve the useful task or MVP.

The next step is offline correlation of the first executor failure with its initiating request, using the retained event and pinned protocol implementation. Another live session requires a new reviewed freeze and cap; this result grants no retry. No product/distribution change, host writeback, commit or publication occurred.

For the general CLI automation and credential context only, see official [non-interactive mode](https://learn.chatgpt.com/docs/non-interactive-mode) and [authentication](https://learn.chatgpt.com/docs/auth). Those documents do not establish this run's model access or acceptance; the observations above do.
