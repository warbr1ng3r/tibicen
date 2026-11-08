# Reliability follow-up — 8 November 2026

**Closed:** Bash completed a full cycle; documentation completed an operator-assisted continuation after its interrupted proposal. All 110 [published 1.5.2 payloads](../2026-11-08-release-1.5.2/README.md) remain byte-identical. Only evaluation tooling changed; no version bump. The [landing publication](../../../../openspec/changes/archive/2026-11-08-compose-approved-landing-visuals/verification.md) is separate and completed.

## Failures retained and evaluator fixes

- Older Bash lacked a complete retained proposal despite a reported digest. Read-only CLI contrasts succeeded without explaining the original omission.
- Older documentation stopped after a generic error event. Its underlying error and unobserved continuation remain unknown; its failed result is unchanged.
- Fresh generation one made one call: scan/status/report worked, but the helper’s nested Node launch failed with `EPERM`. No proposal/apply was accepted; 119 protected files/modes survived. Generation closed; resources removed.

Corrected capture uses published CLI `main` and `serializeData(result)`, one stdin read and mode-0600 evidence. It serializes a real CLI result, not child stdout or consent. A Node-permission control rejected the old child-dependent helper and allowed the correction without input changes; this does not identify the original Linux restriction.

A second fault: the collector stopped on every generic `error`. The [pinned official emitter](https://github.com/openai/codex/blob/00c972ed5d6ff6499317fd41b7f23605b8e6850d/codex-rs/exec/src/event_processor_with_jsonl_output.rs#L447-L458) returns `Running` after that notification; terminal outcome/exit are separate. The [correction](../../../../scripts/evals/contained-codex.ts) passed 57 focused [tests](../../../../tests/evals/contained-codex-result.test.ts) and independent review. Deadlines and explicit authentication stops remain. Only the new continuation uses this fix; old outcomes are not regraded.

The full gate passed **1,055 tests, zero failures, one existing skip**. An earlier gate stopped on test typing; the test was corrected before the passing run.

## Actual working stages

| Project and task | Proposal | Approved apply | Fresh useful task | Read-only repeat |
| --- | --- | --- | --- | --- |
| Bash log filter with existing instructions/memory: repair setup, then add case-sensitive `--level`, preserving lines/order/default behavior | Accepted: exact evidence and consent | Accepted: apply/report complete; structure verified | Accepted: 10 tests plus contained oracle | Accepted: 119 files/modes unchanged |
| Release guides without agent instructions: setup, then explain draft 1.2.1/annotated-tag checks without rewriting 1.2.0/history or inventing a date | Interrupted: valid 8,158-byte artifact; native turn unaccepted | Accepted with operator handoff: apply/status/report complete | Accepted: six Markdown files checked; software tests inapplicable | Accepted with operator assistance: 119 files/modes unchanged |

Documentation’s proposal remains interrupted; exact-artifact consent enabled assisted continuation, not a clean four-phase cycle. There were no automatic retries; 24 prior oracle controls were reused. Its fresh task read AGENTS/README/owner decisions without a special read cue and changed only the release guide: 118 other files and 119 modes survived. The 0.858-second contained oracle checked six Markdown files; no software tests, Git or invented date.

Bash changed only the filter/tests; 117 other files and existing memory survived. Its separate finite oracle passed in 0.879 seconds and cleaned up. Ordinary corrections remain: unavailable `shasum`/wrong usage lookup recovered through Node; task search returned 1 for absent additional instructions; repeat corrected `scripts/filter-log.sh` to `bin/filter-log.sh`. Apply's status command exited 0 with an empty body: JSON status is unobserved; actual apply/report and structural verify support acceptance. Docs apply/task also retained absent paths/search results (exits 2/1) and unavailable Python (127); the task checked link targets with a shell fallback.

## Other harnesses

Twelve CLI scans matched declared configuration contracts in 1.997 seconds: self-install-only, shared `AGENTS.md`, Gemini, Vibe, Copilot, legacy Windsurf/Roo, Cline, Aider, Cursor, Claude and Continue. Inputs/modes survived and temporary projects were removed. These are scanner checks, **not twelve native harness runs**; versions/loading remain unverified. See [portability](../../../HARNESS_PORTABILITY.md).

Vibe's `.vibe/config.toml` is inventoried without a Vibe marker, retaining `init`; its separate [MCP reader](../../../MCP_FORMATS.md) was not run. Aider's configured `CONVENTIONS.md` remains ordinary inventory; automatic reading was not tested.

Mac locking prevented native ZCode/Aion control. One Claude auth-status operation exited 1; login/subscription remains unknown. No raw identifiers were published; no login/model/API fallback occurred. Personal caches remain unverified.

Nine calls used **625.499 seconds summed caller wall** against the nine-call/1,200-second ceiling. Both mirrors and empty session homes/oracle were verified; the borrowed root was removed once. No generic errors occurred in continuation; live error recovery remains unobserved.

The [summary](summary.json) binds receipts. Human benefit, natural activation, memory updating and universal harness support remain unmeasured.
