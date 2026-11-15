# Proposal handoff: investigation closed, native acceptance open

Published Tibicen remains **1.5.4**. This follow-up clarified proposal execution but did not establish an ordinary autonomous init/adopt workflow. The [earlier second-harness outcomes](../2026-11-09-second-harness/README.md), including autonomous HOLD, remain unchanged.

Native observations used AionCore 0.1.55/aionrs 0.2.8 with Qwen3.6-35B-A3B via Polza and an owned synthetic four-file order-total fixture. Setup explicitly prompted the first Read of the installed SKILL; natural discovery was not tested.

## Observed results

| Observation            | Actual result                                                                                                                                                                         |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Retained run08 replay  | RED: real scan completed; the last completed action read the proposal reference. No CLI proposal was requested. This detects the recorded omission, not its cause.                    |
| Native control01       | Interrupted by watcher metadata timeout. The explicit command was requested but not executed.                                                                                         |
| Native control02       | The approved command reached zsh; heredoc temporary-file creation failed with `operation not permitted` before Tibicen ran.                                                           |
| Local carrier contrast | Same JSON, policy and environment: heredoc failed; quoted `printf '%s'` pipe produced a canonical CLI proposal, exit 0, without project writes. This was not native-agent acceptance. |
| Standalone control03   | NOT RUN: insufficient remaining host lifetime.                                                                                                                                        |
| Fresh ordinary init    | `USER_LLM_PROVIDER_NETWORK_ERROR` before the first tool: zero tools, proposal, apply and useful task not reached. Instruction effectiveness was not evaluated.                        |
| Ordinary adopt         | NOT RUN because the native provider route was unavailable; no identical paid retry or operator rescue.                                                                                |

## Clarification and remaining gap

Four existing instruction paragraphs are Unreleased: both skill entries name the first file to read, shared architecture names root-relative `AGENTS.md`, and proposal compilation now precedes presentation with a complete CLI command and conditional POSIX pipe recipe. The input format, no-change route, memory rules, service-write disclosure and exact digest consent remain intact. Runtime, schema and version did not change. A successful local pipe does not explain the earlier unrequested command or prove model compliance.

The retained provider diagnostic reports failed name resolution; a separate system lookup also timed out after 10 seconds. Metadata HTTPS with an explicit address and verified hostname succeeded. The responsible network/system layer remains unknown; account failure or user fault is not established. No DNS proxy, OS setting change or additional login was introduced.

Controls preserved 132 frozen inputs each; init preserved 122, with zero project writes. Owned profiles/databases were removed and ports closed. No personal resources were removed. Last observed cumulative usage was **0.6546804 RUB of the original 100 RUB**, unchanged in the final observation; no owned model call remained outstanding. This is an observation, not a server spending cap.

The isolated candidate passed exact `pnpm test` with pnpm 11.21.0: **1079 passed, 0 failed, 1 existing manual skip**, including lint/format/types/site/strict OpenSpec/build. Foreign changes were excluded; this is not a whole-workspace pass. The first preparation-marker formatting failure remains recorded. Next: establish a reachable provider route under the existing boundaries, then separately bound new init/adopt acceptance requiring the agent's own proposal and native apply after exact operator consent. Human benefit, causal improvement and broader coverage remain unmeasured.
