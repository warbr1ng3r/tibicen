# First use of published Tibicen 1.5.4

Two synthetic projects completed proposal → exact approval → native application → a useful task in a fresh session. These observations used the complete, unchanged [published 1.5.4 skills](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.4), staged from verified release artifacts. They extend the [release observation](../2026-11-09-release-1.5.4/README.md) with agent-executed application in both cases.

## Bash: prepare an existing project

**Before:** five files contained a Bash log filter, tests, sample data and a written behavior contract. There were no user agent instructions or separate memory. The installed Tibicen folders did not prevent the real CLI from selecting `init`.

**Request, translated:** “Prepare this project for an agent: short instructions, no new tools. Show the proposal first.”

The agent inspected the project and authored a proposal through the real CLI. Its 7,960-byte envelope added only `AGENTS.md`, with mode `0600`, pointing to the existing contract. It proposed no separate memory, dependencies, MCP connections or project commands. After the operator approved the exact artifact digest and declared service writes, a fresh agent constructed the CLI apply call. Application returned `complete`; structural verification passed. Protected files were preserved.

The next ordinary request asked for a case-sensitive `--level ERROR` filter while preserving existing behavior, line contents and order. In a fresh session, the agent explicitly read `AGENTS.md`, README and the log contract. It changed only the script and its tests. All **14 Bash tests** and an independent contained behavior/preservation check passed. The checks covered exact field matching, backslashes, blank/empty input and final line endings.

## Documentation: repair existing instructions

**Before:** eight files included agent instructions, owner decisions and published release records. The instructions incorrectly required `npm test` and treated the draft patch 1.2.1 as published.

**Request, translated:** “Put the existing agent instructions in order. Preserve decisions and published history. Show the proposal first.”

The agent compiled a 7,340-byte CLI proposal modifying only `AGENTS.md`, preserving its `0644` mode and original English/history paragraph. It removed the nonexistent test command and false publication claim. It registered the existing `docs/decisions.md` as memory and added a scoped read/update policy; it created no second store. After exact consent, a fresh agent applied the plan. The approved instructions and manifest were written, transient state was absent, and protected decisions, history and runtime files retained their bytes and modes.

The fresh task requested a draft 1.2.1 release guide with an annotated-tag example and checks before sending, without inventing a date or publishing. Only `docs/releasing.md` changed. Independent semantic review and a finite documentary check passed: nine example commands, draft status, owner approval and prior history were preserved. No software tests, Git commands or publication were executed. Events show an explicit release-guide read; they do **not** establish that this task consulted `AGENTS.md` or the decisions store.

## What was observed

The frozen route used Codex 0.157.0 with `gpt-6-astra` through existing subscription access, with a zero paid API budget.

| Case | Proposal caller | Apply caller | Fresh-task caller | Useful-task check |
| --- | ---: | ---: | ---: | --- |
| Bash init | 86.414 s | 56.319 s | 51.036 s | 14 tests; independent check 0.825 s |
| Docs adopt | 73.521 s | 67.641 s | 46.317 s | Documentary check 0.857 s; semantic review |

The six subscription-backed native callers totalled **381.248 seconds**, with zero caller retries. Four separate model-free containers covered the boundary, oracle controls and two task checks. All were stopped and removed; the owned project root was removed and isolated session homes were empty. Paid API budget was zero.

Setup checks and later task checks remain distinct. Bash application had structural verification but no separately collected status/report commands. Docs application returned three parsed verify/status/report bodies in one exit-zero composite command. Both setup application-check results remained `unverified`; the fresh tasks provide the separate results above.

## Friction and limits

Both proposal turns recovered from an initial capture construction whose child exited zero while the parent's `JSON.parse` reported `Unexpected end of JSON input`. The initial payload was overwritten before collection: its exact length and cause are unknown, and missing, truncated and whitespace-only input cannot be distinguished. Direct CLI redirection then produced valid envelopes within those same callers. Bash application recovered from guessed reference filenames; other turns retained a missing-state lookup, a nonmatching search and a Python-unavailable → `awk` fallback. These were ordinary corrections, not outer retries or operator-authored replacements.

After that packet closed, a **separate read-only diagnostic container** compared direct CLI execution with a Node-parent child call. Both exited zero and returned valid 7,968-byte envelopes; the missing-output behavior was **not reproduced** in 2.952 seconds. Inputs and modes were preserved and cleanup was verified. This used no models, authentication or network and was additional to the four containers above. It does not establish parity with the native environment, explain the initial capture failures or change earlier outcomes.

The fixtures, explicit skill entry, artifact transport, write limits and exact operator consent were supplied. Agents authored the proposals and apply calls; fresh tasks received actual resulting files without earlier transcripts or special instruction-reading cues. This was not an installation test, repeat-run test, real-user pilot or second-harness observation. It establishes neither automatic discovery nor causal benefit or general memory use. Older outcomes retain their original scope; no product fix or version change resulted from this observation.
