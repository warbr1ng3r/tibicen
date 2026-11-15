# Reliability handoff — reviewed 13 November 2026

Read the [current assessment](ASSESSMENT.md) first, then the historical
[run registry](README.md), [digest](runs/DIGEST.md) and
[coverage map](runs/PLAN-COVERAGE.md). The registry preserves the executor's
reported observations for 10–12 November; this handoff corrects their aggregate
interpretation. No live rerun or independent reproduction was performed for this edit.

## What is retained

The sandbox archive (`docs/evals/sandboxes/2026-11-10/README.md`, retained privately) retains some
`EVIDENCE.md` narratives, scenario prompts, consent summaries, recipes, dependency
pins and checksums. For example, the Codex narrative (`docs/evals/sandboxes/2026-11-10/codex-polza-01/EVIDENCE.md`, retained privately)
explicitly records operator application; the Qwen narrative (`docs/evals/sandboxes/2026-11-10/qwen-code-01/EVIDENCE.md`, retained privately)
records a pre-consent write to harness memory. These are useful records with
specific limits, rather than independently replayed raw evidence.

The original scratch tree, `runs/INDEX.md`, per-run raw streams, most grading
outputs, installed environments and scenario project states are unavailable.
The advertised `runs/S13-regression-battery.mjs` is also absent. Historical log
paths inside summaries describe the original run; they do not prove that those
files survive. Rebuilding a scenario produces a new observation and cannot
restore the identity of a deleted capture.

## What the results support

- Native discovery and complete cycles are **reported** for OpenCode, Claude Code,
  Gemini CLI, DeepSeek Harness and qwen-code on Polza. Codex R9 is a hybrid:
  native discovery/proposal, operator-run apply, no recorded fresh-task result.
  Aider's selected launch lacked model shell/exec; assisted GLM is a separate row.
- The basic init/adopt/no-op, memory, managed-block, recovery, shared-rule,
  preset and optional OpenSpec flows have varied reported observations. OpenSpec
  was selected for its test cases, not made a dependency of ordinary Tibicen use.
- Self-consent was reported under autonomy framing for deepseek with dsh/Codex
  and for an assisted GLM host whose brand is unspecified. Other observations
  waited; unfinished cells do not count as consent-gate passes. This supports a
  reliability concern, not a universal causal claim about harness system prompts.
- Memory transfer was reported from OpenCode to Gemini and dsh. This is two
  destinations, not bidirectional coverage. Native memory in Claude/Qwen is a
  separate channel and does not prove portable project-memory use.
- Bash, docs-only, Python and monorepo cases broaden the scenario shapes. S3-05
  exposed grading material to the model, so it lacks a clean independent task
  oracle. Synthetic results do not measure real users' time saved or corrections.

## Confirmed code change and findings to investigate

1. **FIFO input hardening is in the working tree.** `scripts/tibicen.ts` checks
   explicit file inputs for regular-file type and size before reading. The CLI
   regression is separate from the added compat-evidence test, which tests
   already-correct parallel/null tool handling. The historical 1081-pass gate is
   a reported earlier result; current integration needs its own checks.
2. **Memory connection and recovery need clearer diagnostics.** A memory-bound
   proposal can leave no usable instruction pointer; `scripts/verify/index.ts`
   reports `missing-memory-connection`, and `scripts/core/finalize.ts` preserves
   incomplete state. Repeating the same digest cannot change those approved
   bytes. This is not an irrecoverable session: `tests/core/memory.test.ts`
   explicitly covers a new connecting proposal followed by resume. Do not add a
   blanket proposal rejection without assessing this supported repair/removal flow.
3. **Keep project-owned rules out of replaceable blocks.** Several reported
   setups composed project sections inside Tibicen's managed block. Review the
   intended ownership and exact update diff; add guidance and a focused regression
   before claiming this is fixed.
4. **Respect host input and context-loading constraints.** Claude's shell
   heuristic blocked some stdin shapes. A newly written file before consent is
   not an acceptable workaround; use a safe in-memory/stdin method or explain
   the limitation. Gemini/Qwen native entrypoints and pre-consent native memory
   require explicit scope checks; a catalog row alone establishes neither loading
   nor permission to write.
5. **Bind releases to a fresh verified build.** A local stale dist was reported.
   `/dist/` is ignored, not committed; CI already builds before checksum and
   standalone checks. Improve exact source/artifact binding where necessary,
   rather than diffing against a nonexistent committed dist.

The 90-day third-party source gate rejecting Tibicen's own pin is a policy
question, not evidence that it should be bypassed. Distinguish first-party
installation from third-party component discovery before changing trust policy.
The `bool` inconsistency in `reject-negative-price-qty` belonged to a temporary
scenario's application change, not a Tibicen product spec requiring repair.

## Budget and execution limits

The known owner authorization was **100 RUB total**, including previous work;
a date or chat change does not reset it. The original plan explicitly retains
that ceiling. A Polza setting of **200 RUB/day** is an account limit, not additional
authorization. No later authorization extending the total is established here.

Historical numbers conflict: stage 1 reports 24.4154 RUB; the next day's book
reaches 138.52 RUB at stage 6 plus approximately 17.2 RUB in stage 7; the old
handoff instead said approximately 153 RUB total. These are unreconciled reported
figures, not a settled total. Per-run cap overruns are recorded at S2-03 and
S4-06; hidden helper-model spending is reported at S6-01. No retrospective
approval or fresh paid work follows. Keep paid execution on hold until budget
custody, authorization and the cumulative ledger are reconciled.

Stages 8–17 reported zero Polza spend; they are ten stage numbers, not seven.
Cleanup narratives do not independently establish present process/account state.
This edit did not inspect credentials, query usage or start models.

## Next work

Follow the five ordered priorities in the [assessment](ASSESSMENT.md) and the
current [roadmap](../../../DEVELOPMENT_PLAN.md). Preserve historical failures,
separate new checks from reported old passes, and retain compact sanitized
receipts for future observations. The original AionCore native route remains
uncompleted; this matrix does not silently close it. Real MCP connection,
IDE-family execution, full accessibility, performance and measured user benefit
remain outside the established results. No commit, push, release or paid call
is authorized by this handoff itself.
