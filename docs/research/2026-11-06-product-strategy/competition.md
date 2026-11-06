# Native alternatives and competitive durability

Checked 6 November 2026, Europe/Moscow. Research only; no installations, model evaluations, outreach or implementation. Russian translation (`competition_ru.md`). Recommendations below are hypotheses, not an approved backlog.

## Decision

Do not expand Tibicen around generic instruction generation, prompt audits, skill installation, portable manifests or organization policy. Current upstream tools already cover much of that territory. Test a narrower promise: **repair an existing setup with less operator effort, preserve accepted decisions, and demonstrate the next useful task in a fresh session**. Even that combination is a candidate service advantage, not an established moat.

The strongest immediate substitute is the developer’s existing agent with its native setup/audit commands, official documentation and ordinary file editing. For teams seeking repeatable distribution, Microsoft APM plus AgentRC is a particularly strong alternative. A sufficient short `AGENTS.md` and no extra component must remain a successful outcome.

## Baseline and evidence quality

The comparison baseline is published Tibicen **1.4.1**, distribution `52c0769574e90d7d1a0438996df9da40621b0107`, bound to source `319845f1f1597817807c81579b42250a1f189e7d`. Task-aware init/adopt, project memory, bounded local MCP diagnosis, preservation and update/recovery already exist; recommending their invention would misstate the starting point. See the [release report](../../evals/results/2026-11-06-release-1.4.1/README.md) and [changelog](../../../CHANGELOG.md). The dated 1.1 body in `CURRENT_CAPABILITIES` is historical, even when its header points to 1.4.1.

Release delivery checks establish engineering properties, not comparative benefit. The [native first-use report](../../evals/results/2026-11-06-native-first-use/README.md) records a real recommendation, a separate operator application, then a failed fresh task; later correction/read phases were unexecuted. The failure’s underlying cause remains unknown. It establishes neither a Tibicen defect nor successful native usefulness. Human time savings, retention and willingness to pay remain unmeasured.

External capabilities below are **vendor documentation or tagged repository facts**, not behavior observed in this study. Living documentation is not a tested release matrix. GitHub’s latest-release API supplied the four release dates; tagged raw files were read to avoid confusing `main` with a release. A cached generic repository page can be stale; versioned material wins over an old search snippet.

## What can erase our value

| Alternative | Freshly inspected capability | Strategic implication |
| --- | --- | --- |
| Claude Code | Native `/init` generates project guidance and suggests improvements to existing guidance. Its optional new initialization flow explores the project, asks questions and presents a proposal before writing. `/doctor prompt-audit` finds stale/conflicting instructions and proposes edits; `/doctor` and `/mcp` cover configuration/status. | Initial setup, audit and approved repair are already native competitors, not empty categories. [Memory/setup](https://code.claude.com/docs/en/memory), [troubleshooting](https://code.claude.com/docs/en/troubleshooting). |
| Codex | Official documentation covers hierarchical `AGENTS.md`, instruction-source checks, built-in skill creation/installation and native MCP configuration. | Writing entry points and explaining loading are baseline work an existing subscription can already support. [Instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md), [skills](https://learn.chatgpt.com/docs/build-skills), [MCP](https://learn.chatgpt.com/docs/extend/mcp?surface=cli). |
| Cursor | `/create-rule` generates scoped rules; project, user and team rules coexist; the documentation explicitly recommends adding rules in response to recurring mistakes. | A universal “best-practice scaffold” can add more ceremony than this incremental native workflow. [Rules](https://cursor.com/docs/rules). |
| AGENTS.md / Agent Skills | Shared Markdown instructions and the `SKILL.md` format reduce proprietary setup work; the skill specification defines progressive loading and a validator. | File format support is table stakes. A common format does not guarantee identical host precedence or actual instruction use. [AGENTS.md](https://agents.md/), [specification](https://agentskills.io/specification). |
| Vercel skills 1.7.6 | Install/list/check/update/remove, temporary use without installation, agent detection, and experimental project restore are documented in the tagged README. | Do not compete with delivery plumbing or turn installer breadth into a usefulness claim. Tibicen’s tested installer pin remains a separate version. [Tagged README](https://github.com/vercel-labs/skills/blob/v1.7.6/README.md). |
| APM 0.35.0 | Manifest/lockfile distribution, transitive dependencies, MCP deployment, policy, content integrity and replay-based drift audit are documented. | “Portable, reproducible, auditable agent setup” is already contested at much greater breadth. [Tagged README](https://github.com/microsoft/apm/blob/v0.35.0/README.md). |
| AgentRC, inspected main | Generates repository-specific instructions/configuration and evaluates whether instructions help; documents CI, batch and PR workflows, paired with APM. The repository labels itself experimental. | Even the generate → verify → maintain story is not unique. Published claims do not prove its comparative effectiveness. [Inspected revision](https://github.com/microsoft/agentrc/blob/7003319eb0a6120b3e979b7235b8f10b100d200d/README.md). |
| OpenSpec 1.16.0 / Spec Kit 1.3.1 | OpenSpec supplies its own initialization, setup prompt and workflow artifacts. Spec Kit supplies initialization and configurable workflows/extensions/bundles. | Teams choosing a process can start directly with its tool. Tibicen must earn any extra orchestration step. [OpenSpec](https://github.com/Fission-AI/OpenSpec/blob/v1.16.0/README.md), [Spec Kit](https://github.com/github/spec-kit/blob/v1.3.1/README.md). |

The most material discovery is Claude’s native audit. Its documentation requires **v2.1.283+** for `/doctor prompt-audit`; availability also depends on the bundled skill being enabled. Current instruction-file support has additional version/configuration conditions. We must not assume the installed Claude in another effort has every documented feature, but equally must not compare Tibicen against an artificially old native baseline. The new init flow is opt-in via `CLAUDE_CODE_NEW_INIT=1`. These conditions come from the [current memory documentation](https://code.claude.com/docs/en/memory).

APM is more than an installer. Its tagged [drift guide](https://github.com/microsoft/apm/blob/v0.35.0/docs/src/content/docs/enterprise/drift-detection.md) describes scratch replay and content consistency, refusal of unmanaged skill conflicts, and preservation of edited managed skills on ordinary reinstall. It also warns that reinstalling before audit can restore other managed outputs and mask prior changes. These are specific lifecycle semantics to compare, not grounds to claim that APM generally destroys user files. Its documented audit targets APM’s declared/deployed state; whether it resolves arbitrary pre-existing mixed instructions as well as Tibicen is untested.

## Table stakes, candidate wedge and countercase

**Table stakes:** valid host paths/formats; current official references; concise applicable instructions; source/version provenance; visible changes; safe handling of local edits; clear unavailable checks; functioning installation/removal. These matter, but APM and native tools show that no single item is durable differentiation.

**Ranked choices:**

1. **Prove a repair outcome before increasing scope.** Start with an existing project containing valuable local decisions, an actual instruction contradiction or disconnected local tool, and a concrete next task. Measure the operator’s work through the fresh task, including Tibicen installation and review. The differentiating claim is the saved effort with preserved behavior.
2. **Treat cross-host repair as a conditional extension.** Common formats reduce translation value, while different precedence and settings can still create practical errors. Add support only for a reproduced problem and a verified native handoff. A long harness catalog is not evidence of broad compatibility.
3. **Accumulate reusable evidence of narrow repairs.** A small corpus of reproducible before/after cases, version-bound failure explanations and independent preservation checks can improve maintenance and trust. This is a possible execution advantage; upstream vendors can build it too.
4. **Accept a small maintained utility if the baseline wins.** Native-first recommendations, a useful no-change result and a few reliable repair paths can be enough. Documentation may be the right delivery for some gaps.

The strongest countercase is straightforward: a developer runs native initialization/audit, accepts a small edit, checks the next task and finishes sooner because Tibicen adds installation, proposal machinery and reports. AgentRC plus APM also attacks both generation and maintenance for teams. There is no evidence here that users want a separate abstraction or that our preservation/reporting rigor compensates for its overhead. The [vision](../../PRODUCT_VISION.md) already defines usefulness in terms of reduced effort; maintaining feature parity is not a substitute for that test.

**Do not build next:** another skill marketplace/installer, transitive dependency resolver, portable setup package standard, central organization policy console, generic readiness score, mandatory specification workflow, or broad MCP health platform. These are either explicitly outside scope, directly occupied by the inspected alternatives, or unjustified extensions. Do not silently adopt APM as a dependency either; a specific user requirement must precede integration.

## Smallest comparative experiment

Propose a **three-pair falsification study**, not an execution request in this research. Use one current harness with its strongest available native remedy, preferably Claude with the documented audit enabled. Freeze harness/model, Tibicen 1.4.1, input copies, permissions and accepted decisions. If that route is unavailable within approved containment/subscription access, record the blocker; do not substitute an older baseline without disclosure.

Three snapshots: (A) already sufficient setup, (B) stale command plus conflicting scoped instruction and valuable local notes, (C) selected local stdio MCP configuration with a source/launch-context mismatch. Give each arm identical goals and allowed actions. Native arm may use current native commands, documentation and ordinary edits; Tibicen arm uses its normal workflow. No arm gets the hidden defect locations. Alternate arm order; include installation and human review time. Each setup has a ten-minute cap, followed by one five-minute fresh-session task: six setup runs and six follow-up tasks maximum, no automatic retries or paid API route. This requires a separately approved finite protocol and safe fixtures.

Before starting, define acceptance for each task and preserved files/decisions. Count success only after the useful task; “configuration correct” and “server connected” remain separate. Record time, operator interventions, mandatory manual steps, unnecessary edits, task acceptance and unavailable checks. Blind artifact review checks preservation; the operator necessarily sees the tool.

**Go:** all Tibicen arms preserve protected material; the no-change case causes no unnecessary edit; both repair tasks pass; and each repair saves at least one substantive manual intervention or 20% total operator time against native without worsening task quality. These are proposed screening thresholds, not established business targets. Advance only to a small real-project study; three pairs cannot estimate market benefit.

**Stop:** any destructive preservation breach stops the study. If native passes both repairs with equal/lower effort, freeze expansion of generic setup/audit features. If both arms fail, classify the defect and environment limits before product changes. An unavailable or censored run is inconclusive; do not count it as a competitor loss or fund a large adapter program from it.

## Source ledger and unknowns

All ten source families were freshly opened/read on **2026-11-06**. Release dates are UTC; living pages have no stable product-version guarantee.

| Source family | Date/version boundary | Evidence role |
| --- | --- | --- |
| OpenAI official documentation | Living pages; legacy developers URLs redirected to `learn.chatgpt.com` | Native documented capabilities; no installed-version test |
| Claude Code documentation | Living; audit explicitly ≥2.1.283, new init opt-in | Strongest direct native countercase |
| Cursor rules documentation | Living | Generation and incremental sufficient workflow |
| AGENTS.md | Living format site | Shared instruction baseline |
| Agent Skills | Living specification | Format/loading design, not a compatibility guarantee |
| Vercel skills | [v1.7.6](https://github.com/vercel-labs/skills/releases/tag/v1.7.6), 2026-11-03T00:14:36Z | Tagged delivery surface |
| Microsoft APM | [v0.35.0](https://github.com/microsoft/apm/releases/tag/v0.35.0), 2026-10-22T22:51:41Z | Tagged reproducibility/audit/policy alternative |
| Microsoft AgentRC | Main `7003319e…`; latest-release API returned 404 | Experimental revision, not a released-performance claim |
| OpenSpec | [v1.16.0](https://github.com/Fission-AI/OpenSpec/releases/tag/v1.16.0), 2026-10-30T23:38:25Z | Tagged process/setup alternative |
| GitHub Spec Kit | [v1.3.1](https://github.com/github/spec-kit/releases/tag/v1.3.1), 2026-11-05T16:23:37Z | Tagged configurable process alternative |

Unknown: which native features target users actually run; frequency/cost of mixed-setup repair; comparative preservation and fresh-task performance; total model/review overhead; demand for another tool; cross-host repetition; sustainable maintenance economics. This desk research narrows the hypothesis and exposes substitutes. It does not answer those questions.
