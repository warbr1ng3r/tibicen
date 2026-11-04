# Instructions, scope and context: public user problems

Research/access date: **5 November 2026, Europe/Moscow**. Product baseline:
published Tibicen **1.1.0**, summarized in the [current-capability snapshot](../../CURRENT_CAPABILITIES.md). This is qualitative public-source research and a set
of product hypotheses, not a demand estimate, a compliance benchmark or an
implementation plan. See the [earlier investigation](../PUBLIC_AGENT_SETUP_EVIDENCE.md)
for historical sources; the four community threads below are new to that ledger.

## Product conclusion

The useful small-tool hypothesis is: **explain which project instructions should
apply, identify a concrete configuration defect, and repair only that defect with
approval**. A configuration audit should be able to finish with “your files are
already sufficient.” Creating more instructions or promising that the agent will
always obey them would overstate both the evidence and Tibicen's control.

Several superficially similar complaints need different answers: an unread file,
the wrong scope, contradictory guidance, a documented size limit, a stale session,
and a model that received a rule but did not follow it. The community material
below gives examples, not a reliable classifier for a new user's machine.

## What 1.1.0 already offers

According to the [current product guide](../../../README.md#capabilities-and-verification-limits),
init/adopt examines the setup, proposes exact changes, applies the approved plan,
preserves useful owner decisions, and separates structural checks from observed
agent behavior. This already provides the container for instruction repair.
Generating an extra audit product or adding another entry command is unnecessary
for the hypotheses in this note.

There is also an existing managed `sharedRules` connection: one reviewed rule
revision is represented in `AGENTS.md` for Codex 0.157.0 and `CLAUDE.md` for Claude
Code 2.1.283; structural verification detects a stale managed copy. These are
adapter contract versions, not a claim about currently installed versions or
identical agent behavior. Cursor and other versions need separate adapter
verification. See the [agent matrix](../../../references/agent-matrix.md) and
[proposal format](../../../references/proposal-format.md).

Optional [project memory](../../PROJECT_MEMORY.md) can preserve accepted decisions
and reasons in one approved store. It does not enforce their execution. Existing
coverage should be reused before proposing another synchronizer, memory store or
rules directory.

The gap worth investigating is the **clarity and precision of diagnosis**. The
current documented contract does not establish a complete, deterministic,
cross-agent instruction-loading simulator, an exhaustive semantic conflict
detector, a universal token calculation or a resident enforcement mechanism.

## Problems and the smallest plausible response

These are research judgments about possible value and engineering scope. “High
value” means a promising hypothesis to test, not demonstrated user benefit.

| Ordinary user complaint                            | Public signal                                                                                                                                                                       | 1.1.0 fit / remaining gap                                                                                          | Smallest candidate mechanism                                                                                                            | Native overlap; value / complexity                                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| “The rules are there, but it ignores them.”        | Codex author distinguishes successful reading from later noncompliance [S1](https://github.com/openai/codex/issues/25884)                                                           | Structural verification and conditional native observations already differ; a file pass cannot diagnose this alone | In the existing report, separate **found**, **expected to load**, **observed loaded**, **task behavior checked**; unknown stays unknown | Native logs/diagnostics first; promising explanatory value / small reporting work, moderate version-specific diagnosis            |
| “I have rules everywhere. Which ones matter here?” | A reported Cursor scope leak was explained by an explicit repo-wide search [S3](https://forum.cursor.com/t/agents-md-isolated-within-a-subdirectory-is-applied-to-root/160773)      | Agent-led inventory is available; no exhaustive active-scope proof                                                 | For the selected agent, version, working directory and target path, show applicable files and why; label inferred scope                 | Native scoped rules already exist; promising value for confusing setups / moderate adapter work                                   |
| “My setup has become huge.”                        | A July Cursor monorepo report describes excessive loading [S2](https://forum.cursor.com/t/cursor-loads-all-rules-from-all-folders-in-monorepo-and-blows-past-context-limits/165337) | Adopt can propose smaller infrastructure; no universal bloat metric                                                | Show bytes, imports, duplicated managed content and known loader limits; propose one justified move/removal, preserve decisions         | Native audits and rule scoping overlap; conditional value / small inventory, moderate accurate expansion model                    |
| “We use different agents and the copies drift.”    | Gemini discussion requests fewer vendor-specific files [S4](https://github.com/google-gemini/gemini-cli/discussions/1471)                                                           | Managed shared rules already cover two exact contracts                                                             | Explain existing bindings and stale copies; add another adapter only for a demonstrated project need                                    | Native filename settings/imports may suffice; promising for mixed-tool teams / small explanation, high universal portability cost |
| “These two rules disagree. Which is current?”      | Native Claude documentation explicitly addresses instruction contradictions [S6](https://code.claude.com/docs/en/memory)                                                            | Adopt preserves decisions and can propose edits; unclear owner intent is still a gap                               | Show the two passages, scopes and evidence; recommend a resolution only when supported, otherwise ask one meaningful question           | `/doctor prompt-audit` already offers findings and proposed edits; value depends on safe completion / moderate semantic judgment  |

These responses can share the existing **scan → small proposal → approved repair →
honest verification** lifecycle. They do not require five new features or a
mandatory bundle of rules, agents and servers.

## Native alternatives constrain the opportunity

Codex documents startup discovery, precedence, a default combined 32 KiB budget,
restart behavior and ways to inspect loaded guidance. A file that exists is not
necessarily the selected file. That is a reason to inspect configuration before
rewriting prose. [S5](https://learn.chatgpt.com/docs/agent-configuration/agents-md)

Claude Code already offers instruction auditing with proposed edits in
v2.1.283+, while direct `AGENTS.md` loading is conditional on version and
`CLAUDE.md` presence/settings. It describes instructions as context rather than
enforced configuration. [S6](https://code.claude.com/docs/en/memory)

Cursor documents nested `AGENTS.md` and several native rule activation modes.
Gemini documents configurable context filenames and imports. Those are reasons
to prefer a native connection over duplicating the same content when suitable;
they do not establish equivalent precedence or behavior across products.
[S7](https://cursor.com/docs/rules),
[S8](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)

An original HumanLayer practitioner article recommends task-specific references
and deterministic formatting tools. Its advice is a design input, not a universal
line-count or instruction-count law; its linked studies were not assessed here.
[S9](https://www.humanlayer.dev/blog/writing-a-good-claude-md)

The potential advantage is therefore **less work to reach a safely repaired
setup**, not the mere existence of an audit, diff, shared filename or short file.
That comparative advantage remains unmeasured. A user of one agent with a small,
working native setup may have no reason to run Tibicen.

## Keep a diagnosis understandable

An illustrative ordinary request is “The agent keeps missing our rules. Sort it
out.” It is synthesized for this note, not a quotation or a completed trial. A
small result could show:

1. **Starting point:** the chosen agent/version, working directory, relevant
   instruction paths and useful existing decisions. Do not sweep through private
   global state or read every transcript to produce an impressive inventory.
2. **What is known:** a missing pointer, unsupported format, masked entry point,
   conflicting passage or documented size issue, with exact locations. Separate
   a configuration observation from a guessed cause of model behavior.
3. **What will change:** the smallest diff and its reason; no rewrite if the
   current setup is sufficient. User-owned rules are not removed merely because
   they are long, old or duplicated in different intended scopes.
4. **What happened:** approved changes, preserved decisions, checks actually run
   and one next working step. “Files repaired; loading not observed” is useful
   when it is the true result.

The default handoff should use these concepts in plain language. A detailed
loader graph, source dates and byte accounting belong in optional detail. A
single green “healthy” label would collapse different kinds of evidence again.

## Candidate priorities and exclusions

**First: improve the existing diagnosis/handoff.** Make the expected loading path,
native alternative and evidence level understandable. Reuse existing shared-rule
hashes and verification output. A paper prototype or offline fixture can test
whether the explanation is comprehensible without another live model run.

**Second: add only bounded mechanical checks supported by exact adapters.** Useful
fixtures would include a masked entry point, contradictory root/subtree rules,
an already sufficient setup, a stale managed copy and a known size-limit boundary.
Expected loading must remain distinct from observed loading. An apparent conflict
between two intentional scopes should be a negative control.

**Third: investigate new adapters only on a concrete request.** “Every agent” is
not a small contract. Filename selection, imports, scope, precedence and session
refresh can differ independently. Existing native configuration may solve the
request without a new adapter.

Do not build a new rules DSL, cross-vendor compiler, background injector,
automatic policy synchronizer or compliance score on this evidence. Do not
automatically convert prose prohibitions into hooks: enforcement changes trust,
execution and approval semantics. A separate authorized change would need its own
contract and native controls. No such implementation is proposed here.

## Source ledger and current-status boundaries

All nine sources were **directly opened on 2026-11-05 (Moscow)**. Dates below are
publication/comment dates visible in the source; an unknown update date is not
the access date. Read scope excludes screenshots, raw private logs and unexpanded
linked studies. Forum replies are attributed to their authors, not treated as
official product contracts.

| ID / exact original source                                                                                                                                                                                       | Date and version                                                                                         | What was read / status at access / limit                                                                                                                                                                                           |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| S1 — [AGENTS.md instructions can be read correctly but then applied inconsistently later in the same session, Codex #25884](https://github.com/openai/codex/issues/25884)                                        | Opened 2026-06-02; CLI 0.136.0, macOS; update date unknown                                               | Author reports rules initially understood, later missed. **Open**; old-version self-report, not current-defect or causality evidence. Later generated/promotional suggestions excluded.                                            |
| S2 — [Cursor loads all rules from all folders in monorepo and blows past context limits $$](https://forum.cursor.com/t/cursor-loads-all-rules-from-all-folders-in-monorepo-and-blows-past-context-limits/165337) | 2026-07-09; Cursor 3.10.17, Windows; update date unknown                                                 | OP reports excessive context; rejects vendor-only conversion. Current docs contradict the reply's explanation; shipped fix/current defect not established.                                                                         |
| S3 — [Agents.md isolated within a subdirectory is applied to root?](https://forum.cursor.com/t/agents-md-isolated-within-a-subdirectory-is-applied-to-root/160773)                                               | 2026-05-15; replies 05-17/05-21; version absent; last update unknown                                     | OP, explanation and author's follow-up. Author attributes the incident to asking the agent to search all coding guidelines. This is a useful resolved misunderstanding, not an established loader leak requiring a product fix.    |
| S4 — [AGENTS.md thought leadership, Gemini CLI discussion #1471](https://github.com/google-gemini/gemini-cli/discussions/1471)                                                                                   | Started 2025-06-25; selected replies through 2026-05; version absent; update date unknown                | OP and selected configuration exchanges; **closed**. Requests less cross-tool duplication; native configurability acknowledged. Promotional/quantitative reply claims excluded. Shared filenames do not establish shared behavior. |
| S5 — [Custom instructions with AGENTS.md, OpenAI](https://learn.chatgpt.com/docs/agent-configuration/agents-md)                                                                                                  | Living documentation; publication/update date and release binding not shown                              | Discovery and troubleshooting sections. Documents precedence, startup chain, size setting and diagnostics. A current native contract reference, not replay evidence for a particular installation.                                 |
| S6 — [How Claude remembers your project](https://code.claude.com/docs/en/memory)                                                                                                                                 | Update date unknown                                                                                      | Loading/audit sections; version thresholds above; no trial.                                                                                                                                                                        |
| S7 — [Rules, Cursor](https://cursor.com/docs/rules)                                                                                                                                                              | Living documentation; update date/version binding unknown; original `/docs/context/rules` redirects here | Rule format, activation, nested AGENTS and FAQ. Describes intended current scoping. Does not independently show that the July report was fixed.                                                                                    |
| S8 — [Provide Context with GEMINI.md Files, Gemini CLI](https://google-gemini.github.io/gemini-cli/docs/cli/gemini-md.html)                                                                                      | Living documentation; update date/version binding unknown                                                | Hierarchy, imports and configurable filenames. Shows a native alternative to proliferating copies. It does not extend Tibicen's supported agent matrix.                                                                            |
| S9 — [Writing a good CLAUDE.md, Kyle / HumanLayer](https://www.humanlayer.dev/blog/writing-a-good-claude-md)                                                                                                     | Published 2025-11-25; update date/version binding unknown                                                | Original article's concise-context, references and formatter advice. Reused from earlier research. Commercial practitioner opinion; broad model-performance claims and linked empirical material are not adopted as findings.      |

Searches targeted ignored instructions, nested scope, oversized monorepo context
and multi-tool duplication, including native solutions and counterexamples. This
is a selected English-language sample, not a systematic review. Four distinct
community discussions are not four independent reproductions. None establishes
prevalence, willingness to pay, causal effects or a Tibicen benefit. No accounts,
messages, authentication changes, paid API calls, live agent trials or product
changes were used in this research.
