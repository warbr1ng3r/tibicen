# Recorded walkthrough: improve instructions, then use the memory

This is a short summary of one accepted **1.5.4** observation, not a real-user pilot or a verbatim chat transcript. The project was synthetic; an operator approved and applied the agent's exact plan. Full evidence and limits are in the [release report](../evals/results/2026-11-09-release-1.5.4/README.md).

## Before

A twelve-file stock project already had working code, seven tests, stale agent instructions and an existing memory file. One README sentence promised SKU sorting, while code, tests and an accepted decision retained caller order. A separate accepted exception for `renderAssemblySheet(items)` required positive stock, ascending stock and stable ties.

## 1. Ask for a review

The setup request, translated from the recorded Russian prompt, was:

> Put this project's agent instructions in order. Preserve code, tests and accepted decisions. Show changes before applying.

The agent read the project and both relevant Tibicen references. It distinguished the stale README from accepted requirements, authored the working policy and compiled its proposal with the actual CLI. The plan changed root and nested `AGENTS.md` instructions; the existing memory was preserved. This was an actual 11,107-byte CLI envelope, not a suggested outcome written by the operator.

## 2. Review and apply the exact plan

The operator checked the actual proposal and its digest, then approved it, including the generated service records. The operator ran the candidate CLI in an isolated container to apply the unchanged plan. Structural verification passed, and apply/status/report returned complete.

This application was performed by the operator, not a native agent. No application feature was added during setup.

## 3. Give a fresh session useful work

A new agent session received the resulting project files, without the setup transcript or a prompt to read memory:

> Add renderAssemblySheet(items): sku:stock lines, header # assembly. Add tests.

The agent read the existing memory and implemented the named exception. Only source and tests changed; the previous `renderStock` behavior, exact SKUs and inputs were preserved. Nine project tests and an independent behavior oracle passed. Both native sessions and all four model-free containers were cleaned up.

## What this establishes

One assisted synthetic setup produced a policy that a fresh session used for a useful task. It does not establish automatic loading, native agent application, memory-correction behavior, a causal improvement, compatibility with every host or measured human benefit. To try the current entry path yourself, start with [README](../../README.md).
