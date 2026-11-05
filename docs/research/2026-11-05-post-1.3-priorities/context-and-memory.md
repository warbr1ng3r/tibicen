# Instructions, context maps and memory after 1.3

Research and access: **5 November 2026, Europe/Moscow**. English is canonical;
`context-and-memory_ru.md` is the adjacent translation. This is a fresh public
search and reading exercise, with no installation, model API calls, native-agent
trial or reproduction. The earlier [instruction study](../2026-11-05-user-problems/instructions.md)
and [memory study](../2026-11-05-user-problems/memory.md) are historical context,
not the findings below.

## Recommendation

The strongest bounded candidate is **explaining which instruction sources are
expected to apply to a particular task, working directory and host**, including
how to inspect or refresh the host's actual context. Investigate this as an
extension of adopt diagnosis before proposing a new context-map subsystem.
The current evidence supports distinguishable failure modes, not a universal
remedy: an old Gemini loading defect received an upstream fix; an OpenCode
loading accusation was retracted; a Cline report concerns history limits; and
native scoped instructions and code maps already exist. [CM2–CM9 below](#source-ledger).

A universal graph, a second memory store, or a promise that an index prevents
forgetting is not justified by this sample. A short task-to-reference index is
reasonable only where the inspected repository lacks a useful route to existing
guidance. Its effect on task success remains unmeasured. [Routing request][CM1],
[native code-map alternative][CM8].

## What published 1.3 already supplies

| Existing contract inspected | Implication for a new proposal |
|---|---|
| One selected project memory file; accepted decisions, verified facts, correction of superseded meaning and preservation of unrelated notes. [Memory guide](../../PROJECT_MEMORY.md), [runtime guidance](../../../references/project-memory.md). | “Add persistent project decisions” or “remember corrections” would repeat existing scope. Reading, use and updates in another host remain separate unverified behavior. |
| Fresh instruction candidates with their directories, structural findings, saved-session history and explicit loading/applicability limits. [Adopt guide](../../ADOPT_DIAGNOSIS.md), [diagnosis code](../../../scripts/core/diagnosis.ts). | Inventory and structural diagnosis are already present. The code does not compute a task-specific effective instruction set: applicability is deliberately `unverified`. |
| Explicit common-file activation in file/Node-capable hosts, plus descriptive native profiles. [Portability guide](../../HARNESS_PORTABILITY.md), [profiles](../../../scripts/agents/profiles.ts). | Another host name or a shared Markdown pointer alone is not a new capability. Native semantics and installed-version evidence still need their own contracts. |

These are product/source observations, not a new verification of the distributed
1.3 bytes or of users receiving a benefit. The bounded local read included these
three guides and the diagnosis/profile/memory instructions above.

## Fresh findings and competing explanations

**Routing is a specific problem; “more context” is not a diagnosis.** The
OpenCode request motivates inspecting a concrete missing route. Its historical
status and proposed design establish neither current failure nor router
effectiveness. [Original request][CM1].

**Context display and model use can diverge for different reasons.** Gemini's
0.10.0 report showed a file in `/memory show` while the task ignored it; the
linked merged change attributes this to stale active system instructions.
OpenCode's separate reporter later withdrew their loading diagnosis after
inspecting injected sources. Neither case supports fixing every ignored rule by
rewriting it. [Gemini report][CM2], [merged change][CM3],
[OpenCode correction][CM5].

**Continuity is broader than durable decisions.** A Cline user reports a
message-count ceiling during a long task. The root cause and present-version
behavior are unverified. Cline also documents its own Markdown Memory Bank and
context handoff commands. A durable decision store cannot be advertised as a
repair for a transcript limit or complete task-history recovery. [Report][CM4],
[native method][CM7].

**Hosts already make different scope and refresh choices.** Copilot CLI has
path-specific instructions and `/instructions`; its docs require restarting or
starting/resuming a session after edits. OpenCode V2 documents updates to ambient
instructions before the next request, but says previously loaded nested edits
need a new session. A generated generic pointer cannot establish these states.
[Copilot CLI][CM6], [OpenCode V2][CM9].

Roo's retained docs offer mode-specific rules, but the official project states
that the extension shut down on 15 May 2026. Preserve existing Roo setups and
assess any fork separately; historical format support is not a new active-host
integration opportunity. [Retained rules][CM10], [shutdown notice][CM11].

## Which meaning of “context map” earns its cost?

| Proposed meaning | When it might help | Why this study does not justify a general feature |
|---|---|---|
| Small task-to-reference index in the existing entry point | Several real instruction documents have no clear selection cue. | It still depends on model selection and reading; CM1 supplies no comparative result. |
| Map of code symbols and dependencies | Finding relevant application files. | Aider already supplies a ranked, budgeted repository map. It solves a different discovery problem from rule precedence or accepted decisions. [CM8][CM8] |
| Explanation of expected instruction scope | A user cannot tell which existing file applies to a target path in their actual host/session. | This is the narrow extension worth specifying. File presence, expected applicability, observed loading and behavior must remain distinct. CM5 is a counterexample to relying on the model's self-description. |
| Persistent memory graph or cross-session transcript engine | Not established by this sample. | Tibicen already configures one decision store; Cline has a native multi-file method. No inspected comparison establishes a graph's extra benefit or safe migration need. [Current contract](../../PROJECT_MEMORY.md), [CM7][CM7]. |

The proposed scope explanation would take the selected host and its observed or
unknown version, working directory and target paths; show relevant candidate
files and the cited native rule; then name the remaining inspection or refresh
step. It should say **expected** applicability until actual loading is observed.
No automatic native launch, global-memory editing, shell transcript collection
or persistent runtime follows from this proposal.

This is a design inference from CM2–CM9 and the current diagnosis code. A map that
only relabels the existing candidate inventory would add no established value.
A rules-only improvement to the current adopt explanation may be enough; first
compare the proposed output with the existing guide's scoped-instruction and
“files pass, loading unknown” examples. [Existing examples](../../ADOPT_DIAGNOSIS.md).

## Memory corrections: retain the contract, separate task state

Keep the present one-store policy and explicit correction of current meaning.
An accepted lasting decision, an inferred preference and temporary task progress
are already distinguished; another schema is not needed to restate that rule.
[Current memory contract](../../PROJECT_MEMORY.md).

A task handoff may need current goal, completed work, unresolved questions and the
next action. That is a possible separate, user-requested working artifact, not
permission to turn every chat into permanent policy or to introduce a second
decision source. The Cline complaint motivates examining this distinction, while
its documented native handoff is counterevidence against building a replacement
by default. [CM4][CM4], [CM7][CM7]. No source here establishes that Tibicen's
current correction instructions fail in ordinary use across hosts.

Before implementation, define an offline example with root and nested rules,
an existing decision file, one superseded decision and a host-specific reload
condition. The candidate improvement must explain a concrete ambiguity the
existing report cannot, preserve notes and accept “no change.” Actual loading,
post-compaction continuity and decision correction would each require their own
later authorized observations. No such experiment was performed or authorized
by this research.

## Source ledger

Every URL below was **independently opened on 5 November 2026**; all substantive
claims are paraphrases. “NEW” means absent from the earlier files under
`docs/research/` when searched by exact URL and identifying path. CM6, CM9, CM10
and CM11 nevertheless already occur in the 1.3 profile catalog: fresh reading is
not a newly discovered product capability. The eleven pages include four
original complaint/request threads, one of which contains a retraction; the
extra fix/status pages were retained to avoid misclassifying old reports.

| ID / exact title and URL | Publication, version and status observed | Direct claim read; limits and mapping to 1.3 |
|---|---|---|
| CM1 — [Improve AGENTS.md structure for task-specific instructions and reduced context crowding][CM1] — NEW | Opened 2025-07-15; no runtime version. Closed 2025-12-28 by inactivity automation. | OP describes missed selective references and requests task routing. No comparative result; closure does not establish a remedy. Current inventory does not route tasks. |
| CM2 — [gemini-cli seems to ignore GEMINI.md context file][CM2] — NEW | 2025-10-23; CLI 0.10.0, gemini-2.5-pro, macOS. Closed completed 2025-11-20. | OP reports context visible in memory display but ignored until explicit mention. Historical defect, not evidence that current Gemini or Tibicen needs another map. |
| CM3 — [Fix: Update system instruction when GEMINI.md memory is loaded or refreshed][CM3] — NEW | Proposed 2025-10-28; merged into main 2025-11-20. First released version not established. | Author attributes CM2 to config context not refreshing active system instructions. Upstream implementation evidence; no released-version reproduction here. Diagnose the host before changing project notes. |
| CM4 — [Inadequate code generation behavior by agents of AI models][CM4] — NEW | 2026-08-23; Cline v4.1.6(Next), Windows, opencode/nemotron-3-ultra-free. Open. | OP reports an 800-message history limit despite unused advertised token space. Mixed-issue report, no minimal reproduction; do not turn the OP's “lines” interpretation into a technical fact. Memory instructions do not fix a history ceiling. Promotional reply excluded. |
| CM5 — [Bug: Global AGENTS.md (~/.config/opencode/AGENTS.md) not loaded when project AGENTS.md exists][CM5] — NEW | 2026-04-11; “latest,” Windows 11. Closed 2026-04-13; OP retracts 2026-04-14. | OP's logger showed both files loaded; their earlier diagnosis was withdrawn. A May follow-up disputes behavior without equivalent evidence. Distinguish loading from self-report; no plugin installed here. |
| CM6 — [Adding custom instructions for GitHub Copilot CLI][CM6] — NEW to research; profile reference rechecked | Living official docs; publication date and installed version absent. | Native scope, imports, inspection and session refresh are documented. No universal file precedence is promised. Existing profile already discloses documentation disagreement; do not infer all Copilot surfaces or a tested version. |
| CM7 — [Memory Bank][CM7] — NEW | Living Cline docs; publication date/version absent. Old prompting URL redirects to this page. | Documents a multi-file Markdown method, updates and native context commands. This is an existing optional method, not an observed guarantee or justification to replace Tibicen's single store. |
| CM8 — [Repository map][CM8] — NEW | Living Aider docs; publication date/version absent. | Documents symbol/dependency context selection under a token budget. Native overlap for code discovery; no claimed solution for instruction precedence or memory corrections. |
| CM9 — [Instructions][CM9] — NEW to research; profile reference rechecked | Living OpenCode **V2** docs; exact installed patch absent. | Distinguishes ambient and progressive nested loading/update behavior; only AGENTS.md, without CLAUDE.md fallback. Native behavior contract, not a run or conflict solver. Current diagnosis has no task-specific effective-set computation. |
| CM10 — [Custom Instructions][CM10] — NEW to research; profile reference rechecked | Retained Roo documentation; exact runtime version/date absent. Legacy context per CM11. | Documents workspace/global/mode composition and optional root AGENTS.md loading. Existing scope mechanisms, not support for a current Roo successor. |
| CM11 — [Roo Code Docs][CM11] — NEW to research; profile reference rechecked | Official root last updated 2026-05-15; shutdown notice says 15 May. | Confirms extension shutdown. Prevents treating retained docs as a maintained native integration target; forks require independent identification. |

### Access and interpretation limits

Fresh searches covered original GitHub reports and official documentation for
Gemini, OpenCode, Cline, Roo, Copilot and Aider. The older Codex/Claude/Cursor
research was checked for reuse, not counted as new evidence. This is a selected
English-language sample, not an estimate of prevalence, willingness to pay,
time saved or causally improved instruction adherence.

Some GitHub pages exposed partial-loading errors in peripheral widgets; the
cited bodies, status and relevant dated comments were readable. Collapsed/raw
attachments and inaccessible private tracker links were not treated as read.
Search-result summaries were used for discovery, not verification.

Other directly opened pages were excluded from the decision ledger: Aider
[#3422](https://github.com/Aider-AI/aider/issues/3422) is an old, open path/ignore
report; OpenCode [#16960](https://github.com/anomalyco/opencode/issues/16960) is an
old compaction claim; [#34341](https://github.com/anomalyco/opencode/issues/34341)
is a bot-authored design tracker, closed after progressive loading work, not a
new independent user complaint. Its closure does not prove every proposed
lifecycle behavior shipped. The legacy [OpenCode rules page](https://opencode.ai/docs/rules/)
has CLAUDE.md fallback guidance that must not be applied to V2. Current V2 docs,
rather than those older expectations, support the bounded scope recommendation.
No source demonstrates that Tibicen can repair vendor compaction, enforce model
obedience or recover a lost transcript.

[CM1]: https://github.com/anomalyco/opencode/issues/1028
[CM2]: https://github.com/google-gemini/gemini-cli/issues/11799
[CM3]: https://github.com/google-gemini/gemini-cli/pull/12136
[CM4]: https://github.com/cline/cline/issues/13490
[CM5]: https://github.com/anomalyco/opencode/issues/22020
[CM6]: https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions
[CM7]: https://docs.cline.bot/best-practices/memory-bank
[CM8]: https://aider.chat/docs/repomap.html
[CM9]: https://dev.opencode.ai/v2/docs/instructions/
[CM10]: https://roocodeinc.github.io/Roo-Code/features/custom-instructions/
[CM11]: https://roocodeinc.github.io/Roo-Code/
