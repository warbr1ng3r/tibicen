# What should Tibicen do after 1.3?

**Fresh public research, 5 November 2026, Europe/Moscow.** Three parallel source
lanes and root counterevidence assess the earlier proposed workfronts against
published Tibicen **1.3.0**. This is a ranked research recommendation, not an
approved implementation, new release or benefit measurement. Adjacent Russian translation: `README_ru.md`.

**Recommendation: improve the existing adopt workflow around a concrete symptom,
the effective configuration in the selected host, and the smallest justified
repair.** The research narrows the earlier context-map proposal. It does not
justify a universal context graph, another memory backend or our own portable
package format as the immediate next feature.

## What was actually researched

- Original GitHub issues/discussions, Reddit threads and Hacker News comments;
  official current documentation, released/tagged alternatives and primary papers.
- Broad host coverage: Gemini CLI, OpenCode, Cline, Copilot CLI, Amp, Goose,
  Continue, Aider, ZCode and retained Roo material, alongside common-file and
  Claude native alternatives. Documentation coverage is not tested support.
- Original reports, their corrections, closure reasons and existing remedies.
  Every lane records newly investigated versus freshly rechecked source URLs.
  Old study conclusions were not reused as new demand.
- Actual code boundaries: [diagnosis](../../../scripts/core/diagnosis.ts) lists
  instruction candidates but leaves task/session applicability unverified;
  [MCP](../../../scripts/mcp/index.ts) checks supported local records and caller
  supplied environment names, without observing every target launch context.

The source baseline was local `e73551082655449fcde668ecf7e42342f892e374`.
[1.3 acceptance](../../evals/results/2026-11-05-release-1.3/README.md),
[portability](../../HARNESS_PORTABILITY.md), [memory](../../PROJECT_MEMORY.md)
and [adopt diagnosis](../../ADOPT_DIAGNOSIS.md) establish what already exists.
The dated 1.1 capability snapshot is not today's missing-feature list.

## Findings that change the previous priority list

| Proposed front | Evidence and existing alternatives | Revised decision |
| --- | --- | --- |
| Context map | Reports distinguish missing routing, client refresh defects and mistaken loading diagnoses. Copilot/OpenCode already document scope and inspection; Aider provides code maps. [Context findings](context-and-memory.md). | Investigate a concise **task/path/host-specific explanation** inside adopt. A new graph subsystem is not justified. |
| MCP diagnosis | A reporter corrected the wrong environment field; current V2 grammar and overrides differ from older examples. Native status tools already exist. [Original correction](https://github.com/anomalyco/opencode/issues/36434), [current V2 contract](https://dev.opencode.ai/v2/docs/mcp-servers/), [integration ledger](integrations.md). | Strong concrete candidate: effective-source and version-aware local stdio repair, using native diagnostics. Treat client defects and unknown GUI environments separately. |
| Memory continuity | Users report stale/generated notes and different preferences; some have a working small-file method. Configuration does not establish actual use. [Critical evidence R3–R5/R8](critical-evidence.md), [context findings](context-and-memory.md). | Keep the existing one-store/correction contract. Prioritize a bounded later-task check before inventing another storage system or hooks. |
| Portable team setup | There is direct team reuse demand, but shared files, Git, native sharing, dotfiles and released APM already address much of it. [Reuse findings](reuse-and-updates.md), [APM v0.35.0](https://github.com/microsoft/apm/releases/tag/v0.35.0). | Defer a new format. First require a named applicability/deviation case those approaches cannot handle adequately. |
| Safer updates | Local-edit loss is a real installer report; Tibicen 1.3 already documents complete backups and explicit replacement/recovery. [Original report](https://github.com/vercel-labs/skills/issues/455), [current guide](../../INSTALLATION.md). | Preserve ownership as an acceptance criterion and clarify what is being updated. No new missing core feature was established here. |
| Landing / release automation | No fresh demand study for Tibicen's landing or release process was performed. | Keep them as separately scoped maintenance, not research-validated product priorities. |

## A smaller proposed next packet

**First: make a particular adopt diagnosis actionable.** Illustrative user
request: “The agent seems to ignore our rules. Take a look.” The result should
name the selected host/version (or uncertainty), working directory, target path,
relevant sources, expected precedence and the remaining native inspection/reload
step. Preserve intentional subtree and host differences. Compare that output
with current adopt first: adding only a renamed inventory is insufficient.
[Current gap and counterexamples](context-and-memory.md).

**Second: add a narrow integration repair where that is the real cause.**
Illustrative request: “The server is in settings, but the agent has no tools.”
Start with current, version-bound Gemini/OpenCode examples because the inspected
contracts expose specific differences; these are selected cases, not an exclusive
host list. Show the effective server record, override/disable state, executable
and cwd evidence, and environment-reference grammar. Unknown launch context
stays unknown. Preserve secrets and unrelated settings. Commands that start a
server retain the existing approval/trust boundary. [Bounded candidate](integrations.md).
New automatic write targets would need their own reviewed adapter contract.

**Use current memory and update preservation as cross-cutting checks.**
Illustrative request: “Keep our decisions when you sort this out.” Keep accepted
meaning, unrelated notes, local edits and a sufficient setup. The research did
not establish that today's Tibicen memory policy needs a new schema. Existing
behavior should be evaluated before expanding it. [Current memory](../../PROJECT_MEMORY.md),
[reuse assessment](reuse-and-updates.md).

These are illustrative requests, not copied transcripts or executed acceptance
cases. The packet can begin with a small comparison of sufficient setup, actual
misconfiguration and intentionally different scopes. Expected applicability,
observed loading, connection and task use remain separate. No new native/model
scenario was run by this study and no release gate is reopened.

## What this evidence does not establish

This is purposive qualitative research, not representative market sampling.
Repeated themes are not frequency estimates, and cross-posts are not independent
users. Vendor docs establish a declared contract; forum accounts establish what
was reported. A fix merged into main is not automatically present in an installed
release. Open issues in archived projects are historical examples, not active
maintained targets. Bot replies, promotional claims and source-date ambiguity
are labeled in the ledgers.

The [critical evidence review](critical-evidence.md) also rejects treating every
text difference as conflict or cleaner file structure as guaranteed agent
improvement. The studies do not measure Tibicen, purchasing intent, saved human
time or correctness across all models. Private chats, interviews, YouTube viewing
and transcript analysis were not performed.

No product/runtime/landing changes, installs, paid APIs, authentication changes,
commits or publication are part of this task. The result is documentation and a
prioritized recommendation. Substantial implementation would need a scoped
OpenSpec change; the previous six-front list is not an approved backlog.

## Source lanes

- [Instructions, context and memory](context-and-memory.md).
- [Integration failures and native remedies](integrations.md).
- [Setup reuse, drift and updates](reuse-and-updates.md).
- [Critical evidence and competing explanations](critical-evidence.md).
- [Research map](../../../.scratch/post-1.3-priorities-research/map.md).
