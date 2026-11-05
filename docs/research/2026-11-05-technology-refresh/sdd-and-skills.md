# SDD and instruction skills: use the agreement, earn the machinery

Research date and access date: **5 November 2026, Europe/Moscow**. Research only;
no installation, third-party script, native-agent trial or model evaluation was
run. This lane extends the [earlier problem study](../2026-11-05-user-problems/README.md).

The evidence supports optional, proportionate specification work and a small
instruction skill when either solves an observed problem. It does **not** support
making an SDD framework or the full Ponytail plugin a Tibicen default. The useful
distinction is between preserving the requested outcome and reducing the work
needed to deliver it. Neither fewer tokens nor more specification files proves
that outcome was delivered.

## Method and three implementations

Here, SDD means agreeing on intended behavior before implementation and checking
the result against that agreement. It need not mean a new CLI, a fixed document
set, or making generated specifications permanently authoritative. These are
separate implementation and maintenance choices.

| Representative | Inspected official contract | Consequence for Tibicen |
| --- | --- | --- |
| [GitHub Spec Kit](https://github.com/github/spec-kit) | The current README offers independent SDD, bug-fixing and idea-assessment entry points. Its SDD loop includes constitution, specification, plan, tasks, implementation and convergence. Extensions, hooks and shell-task workflows are additional mechanisms; a catalog listing is explicitly not an audit. | Preserve a selected existing workflow. Do not describe every task as requiring the full SDD loop or install extensions just because they exist. |
| [OpenSpec](https://github.com/Fission-AI/OpenSpec) | Propose/apply/archive uses proposal, requirements/scenarios, design and tasks. Artifacts remain editable. CLI upgrades and project-guidance regeneration (`openspec update`) are separate operations. | Consider for substantial changes needing durable agreement. Guidance regeneration changes a target project; it is not evidence refresh. |
| [Kiro Specs](https://kiro.dev/docs/specs/) | Requirements or bug analysis, design and tasks; current capability table covers IDE, CLI and web. Quick Spec can generate the three artifacts without approval gates. Page updated **15 October 2026**. | A user already on Kiro has native spec support. Another framework may duplicate it. A faster generation option is not permission for Tibicen to skip its own approved-change boundary. |

These are contracts and owner descriptions, not independent usefulness results.
The OpenSpec README still characterizes Kiro as IDE-only, while Kiro's current
table includes CLI and web. This concrete disagreement illustrates why a
competitor comparison must be rechecked against the tool owner's current
documentation before recommending anything. It establishes neither model support
nor comparative quality. [OpenSpec comparison](https://github.com/Fission-AI/OpenSpec),
[Kiro capability table](https://kiro.dev/docs/specs/).

## Firsthand complaints and contrary experience

Relative Reddit dates below are the page's displayed dates, **not reconstructed
publication dates**. Exact timestamps were unavailable: public JSON requests
returned 403. A thread is one discussion, not a count of affected users.

| Ordinary problem and inspected primary page | Date, version and status | Evidence distinction and limit | Native or simpler alternative; implication |
| --- | --- | --- | --- |
| “Why another branch just to refine this feature?” [Spec Kit #1191](https://github.com/github/spec-kit/issues/1191) | Opened **15 November 2025**; closed **8 April 2026** via #2118, listing community Spec Refine. Version unspecified. | Aggregated requests plus a **25 December 2025** firsthand iteration complaint. Historical friction; extension-based closure does not establish current-core behavior or installation. | Review/edit artifacts or deliberately select an extension. Check existing support before proposing a migration. |
| “The ceremony costs more, and the code is not reliably better.” [OpenSpec team account](https://www.reddit.com/r/SpecDrivenDevelopment/comments/1vubvmz/we_tried_specdriven_development_for_months_we/) | Displayed **2 months ago**; several months of data-engineering and legacy-to-Python work; exact OpenSpec/model versions not supplied. | Firsthand team account reports overhead for bounded tasks and values the reviewable record of intent. Its linked external comparisons were **not inspected**, and the team's measurements were not reproduced. A reply reports useful continuity after compaction with local models: an anecdotal counterexample in the same thread. | A bounded prompt or short goal/constraints/acceptance note may suffice. Reserve durable specification for real coordination and contract decisions; do not promise a universal code-quality improvement. |
| “The process finally keeps my documents and tasks together.” [Spec Kit favorable account](https://www.reddit.com/r/vibecoding/comments/1sykoln/i_cannot_say_enough_good_things_about_githubs/) | Displayed **6 months ago**; author describes approximately one month using Spec Kit, version unspecified. | Firsthand positive account after earlier manual design/roadmap/task workflows drifted. The author recommends clarification and cross-artifact analysis. No controlled comparison or independent verification of the example repository. | Existing structured workflows can be useful. Preserve one that works instead of replacing it with Tibicen's preferred trend. A reply also favors lighter structure for small tasks. |
| “People cannot find the useful prompt under all the installation machinery.” [Ponytail #808](https://github.com/DietrichGebert/ponytail/issues/808) | Opened **4 September 2026**; closed **5 October 2026** after the owner described a shorter README and a separate installation guide. | Firsthand adopter/recommender praises the skill but criticizes discoverability. The owner acknowledges the problem. **Resolved documentation complaint**; stale search results still showed it open. | Expose the skill and its purpose clearly; make host adapters optional. This supports a small user flow, not a claim that current Ponytail remains unusable. |
| “Minimal code leaves out expected features.” [Ponytail/Whittle discussion](https://www.reddit.com/r/ClaudeCode/comments/1x67fvg/made_a_skill_so_claude_stops_cutting_features_to/) | Displayed **4 days ago**; Ponytail 5/Sonnet 5.5, ten runs per condition/two apps; commit unspecified. | **Competing author's evaluation**. Admits post-output kanban checklist changes, equal weighting and rubric overlap with their skill; reports similar clear-spec scores. Self-identified Ponytail creator disputes scope/rubric. Run artifacts unaudited. | Define must-have outcomes first. Neither general superiority nor omission of explicit requirements is established. |

The disagreement is useful without choosing a winner: “smallest version of a
vague request” and “everything an ordinary user expects” can be different
products. A short explicit scope and acceptance example resolves more of that
ambiguity than installing a second competing instruction skill. This is a design
inference from the discussions, not an experimentally established benefit.

## What official Ponytail actually adds

| Inspected owner source | Dated scope | What it establishes; simplest alternative |
| --- | --- | --- |
| [Core SKILL.md](https://github.com/DietrichGebert/ponytail/blob/main/skills/ponytail/SKILL.md) | Main observed **5 November 2026**. | Requires affected-scope reading, reuse, required-work completion and preservation of validation, security, accessibility and data-loss handling. Vague requests get a minimal core; lite lets the user choose, ultra adds pushback. These are prompt instructions, not enforcement. Concise project guidance may suffice. |
| [Ponytail README](https://github.com/DietrichGebert/ponytail) | Main snapshot **29 October 2026**; advertises Ponytail 5 and band features in 5.3. | Offers a plain skill/rules-file path and host plugins. Codex setup asks for trusting two lifecycle hooks. The Claude band/board stores local task/session metrics and can import past sessions; it has host/version restrictions. This exceeds the execution/data surface of copying a prompt. The source reports benchmark gains, but this research did not audit those experiments. |
| [Release history](https://github.com/DietrichGebert/ponytail/releases) | Latest displayed **v5.3.3, 29 October 2026**, release commit `7801d06`; compared with v5.3.0/5.3.1/5.3.2 on **16 October**. | Describes band integration, Windows startup/timeouts, transcript lookup and interactions with other plugins. These are **reported fixes**, not newly reproduced defects. Recent maintenance shows adapters have continuing compatibility obligations; it does not establish instability or prevalence. |

The prompt's principle fits Tibicen's existing sufficiency goal. Installing the
full plugin by default is a different proposal: lifecycle execution, host state,
metrics and update ownership all need a concrete need and exact approved scope.
No hook implementation, permission sandbox, telemetry behavior or off switch was
executed or independently audited here. A README saying data stays local is an
owner statement, not a security assessment.

## Fit and rejection criteria

These are research recommendations, not an approved implementation backlog.
They must fit [Tibicen's product boundaries](../../PRODUCT_VISION.md): two skills,
existing-agent operation, sufficient infrastructure, preserved user decisions
and updates at the user's request.

| Situation | Prefer | Reject or defer |
| --- | --- | --- |
| Small, bounded repair with observable acceptance | Existing agent, actual repository commands, a short scope and useful check. | Mandatory new constitution/design/task tree for the repair. |
| Change spans sessions, interfaces, important data or owners | Reviewed intent, compatibility constraints and acceptance examples; keep an already selected SDD system. | Parallel sources of truth or rewriting the whole brownfield system into specs merely to begin. |
| User wants simpler agent output | Reuse concise local guidance or consider the plain Ponytail skill after inspecting it. | Adding multiple overlapping minimalism skills or collecting metrics without a stated need. |
| Current specs and code disagree | Show the concrete disagreement and the current/historical status of each artifact; resolve intent with the owner of that decision. | Silently changing intended behavior to bless whatever the agent implemented. |
| A new upstream version appears | Recheck relevant owner docs/source, installed version, exact change surface and whether a concrete problem is addressed. | Inferring better recommendations from release recency, stars, token counts or vendor comparisons. |

Tibicen's remaining opportunity in this lane is small: explain **why a workflow
is sufficient or needs a change**, expose optional execution/state costs, and
keep completion separate from minimality. The prior diagnosis work already
addresses understandable keep/change/no-change handoffs; this study does not
establish a missing framework integration. Development OpenSpec in this
repository must remain separate from distributed Tibicen requirements.

Refreshing source evidence is reasonable. Automatically replacing policy or a
target project's instructions whenever an upstream author changes a prompt is
not supported by this evidence. The resolved issues, changed release behavior,
inaccessible documentation paths and conflicting competitor descriptions all
favor dated, reviewable recommendations with an explicit no-change outcome.

## Versions, reading boundaries and access gaps

**Eleven substantive primary pages/documents** appear above: three official
tool overviews, three firsthand SDD discussions, two Ponytail discussions, the
Ponytail skill, its README and releases. Their bodies and relevant comments or
sections were read; entire linked repositories, experiments and every release
were not. Two additional owner metadata files were inspected:
[Spec Kit pyproject](https://github.com/github/spec-kit/blob/main/pyproject.toml)
reports **1.3.1.dev0**, and
[OpenSpec package.json](https://github.com/Fission-AI/OpenSpec/blob/main/package.json)
reports **1.16.0**. These main-branch values are not a claim about the user's
installed version or the latest published package.

GitHub's public commit API returned these main snapshots during access:
[Spec Kit `ec9a6f3`](https://github.com/github/spec-kit/commit/ec9a6f3b94c0aa856f77e550785a1ddde1993de1),
**4 November 2026, 22:34:17 UTC**;
[OpenSpec `3e4d5f0`](https://github.com/Fission-AI/OpenSpec/commit/3e4d5f0769e2857c8eb54f149cbf5e4f703fa04c),
**4 November 2026, 17:05:54 UTC**;
[Ponytail `96608e0`](https://github.com/DietrichGebert/ponytail/commit/96608e078b2d5ea607c5c3b8b5a54d1c1fba6846),
**29 October 2026, 11:59:31 UTC**. API metadata is not an additional incident or
runtime reproduction. Live page reads are observations at access, not archived
byte-for-byte snapshots of every linked artifact.

Context7's OpenSpec library-resolution call returned **tool unavailable**; no
documentation query could follow. Official sources were used instead. The old
[Spec Kit persistence source path](https://github.com/github/spec-kit/blob/main/docs/concepts/spec-persistence.md)
returned **404** through both raw and GitHub fetches; the published
[evolving-specs page](https://github.github.com/spec-kit/how-to/evolving-specs.html)
could not be opened. Search cached substantial text, but **these are unverified
leads, excluded from this lane's capability findings and source count**. The
accessible current README and issue history are used for narrower claims.

The sample deliberately includes complaints and counterexamples. It cannot
measure frequency, willingness to adopt, causal quality/cost effects or Tibicen
benefit. No new question to the project owner, outreach, account change,
installation, paid API, commit or publication follows from it.
