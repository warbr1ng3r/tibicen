# Positioning, activation and distribution after 1.4.1

Checked **6 November 2026 (Moscow)**. Canonical English; adjacent Russian translation. Research and proposed decisions only: no outreach, installation, live evaluation, publication or product change.

## Decision

Lead with a project problem and a reviewable result: **“Put your coding agent’s project instructions in order before the next change. Keep useful rules; approve the exact changes.”** Use an existing-project repair as the first acquisition story; preserve initial setup as the second entry. This is a positioning hypothesis, not evidence that repair has a larger market.

The entry task should be specific: **“After changing agents or project commands, check conflicting instructions, preserve our decisions, and show what needs fixing.”** An obsolete test command makes a good demonstration, but correcting one line alone may not justify installing Tibicen. Show the whole bounded result: an evidenced finding, a small approved correction, useful rules preserved, and the next ordinary project task. A justified no-change result is valid product behavior; it is not automatically evidence of incremental value.

Rank the next decisions: **first establish a reliable first useful session; then test whether people with this problem choose it; only then expand distribution.** Do not build another installer, marketplace, onboarding wizard or telemetry service to answer those questions.

## What already exists

The local [landing](../../../landing/src/components/Landing.astro) already has a plain setup promise, one default installation command, terminal/chat separation, initial-setup and repair prompts, loading recovery, account/privacy explanations and a secondary preset destination. The [installation guide](../../INSTALLATION.md) preserves exact 1.4.1 distribution pinning, complete-folder recovery and explicit loading. These are implemented capabilities, not gaps copied from earlier landing reviews. This lane inspected source, not a fresh rendered browser session. The separate [native-first-use report](../../evals/results/2026-11-06-native-first-use/README.md) records the landing deployment and its actual browser checks.

That report also records a completed native recommendation, a separate operator application and a failed fresh useful task. Later phases were not run. The stopping mechanism is known; the underlying failed operation is uncorrelated. This neither proves Tibicen caused the failure nor establishes a working acquisition-to-value journey. Mechanical delivery and internal assistance cannot stand in for unaided activation or human benefit.

## What comparable projects actually distribute

| Primary observation | Plausible mechanism | What it does not demonstrate |
| --- | --- | --- |
| [Skills FAQ](https://www.skills.sh/docs/faq): discovery listings arise through installer telemetry; rankings use installation counts. | Searchable skill pages can expose a task-specific tool to people already installing skills. | Unique users, successful loading, useful sessions, retained use or Tibicen acquisition. |
| [Skills CLI README](https://github.com/vercel-labs/skills/blob/main/README.md): Git-backed install, skill/agent selection, global scope and discovery command. | Reuse an existing delivery habit; avoid making users learn another package system. | Every source/ref is equally discoverable or every listed host loads Tibicen. |
| [Superpowers README](https://github.com/obra/superpowers/blob/main/README.md): harness-specific marketplace/plugin routes; some link fuller guides, and the Muse section supplies a concrete fresh-session task check. | Installation near the working agent can reduce the distance from discovery to trying a task. | Marketplace acceptance for Tibicen or causal conversion uplift from any route. |
| [OpenSpec getting started](https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md): terminal setup and chat workflow are explicitly separated. | Explain the handoff between an installer and the actual agent session. | An empirically measured most-common onboarding failure across products. |
| [Spec Kit README](https://github.com/github/spec-kit/blob/main/README.md?plain=1): install/init precede a photo-organizer workflow example and explicit chat actions. | An ordinary task can make an abstract process understandable. | Demand for Tibicen or better outcomes than a direct agent request. |

These are publisher descriptions and repository facts. None supplies an attributable Tibicen acquisition funnel or a controlled channel comparison. Current branch documentation is mutable; the ledger records its inspection scope rather than presenting it as a pinned release contract.

Two original reports reinforce the activation distinction without establishing prevalence. [Superpowers #54](https://github.com/obra/superpowers/issues/54), opened 20 October 2025, describes installed skills working when explicitly named but not triggering automatically; it is closed as not planned, with no exact release in the opening report. [#2392](https://github.com/obra/superpowers/issues/2392), opened 26 September 2026, reports missing advertised skills despite installed/enabled files and successful manual reading. It is also closed as not planned; root cause and fresh-session reproduction remain unconfirmed. It was filed by an agent at the user's request, so it is a reported incident, not independent behavioral research. Neither is a current universal defect or proof that Tibicen can repair the host.

Counterevidence matters: [Skills #982](https://github.com/vercel-labs/skills/issues/982) reported project updates broadening the installed skill set on CLI 1.5.1. The maintainer marked it fixed on 27 April 2026 and said the fix would ship in 1.5.2. Tibicen already pins 1.7.4 and selects its two skills explicitly. Do not sell this historical, corrected issue as an unresolved Tibicen advantage.

## Channel priority and organic limits

**First: one useful case study attached to the existing repository/landing.** Show starting instructions, one contradiction, the proposed diff, preserved decisions and an actual next task. Link a recorded run only with its true version, assistance and failures; keep an illustration labeled as such. The current walkthrough already supplies presentation structure. The missing evidence is user relevance and reliable completion, not another illustrated section.

**Second: existing skill discovery, conditionally.** Check whether the exact published distribution and two intended entries can be found through the actual catalog/index path. Tibicen's source repository contains development skills; the supported install target is its built distribution. Automatic listing documentation does not prove a full-SHA distribution URL maps to a clean searchable Tibicen identity. Inspect that result before proposing a listing or alias. Do not silently substitute the default source branch to shorten a command.

**Later: a native marketplace route only after demonstrated host-specific friction.** Superpowers shows that this channel exists, not that Tibicen is accepted, discoverable there, or should support many adapters. Review access requirements and ongoing maintenance before committing. No application or outreach was performed here.

Organic discovery has a cold-start problem: installation-ranked listings preferentially expose already installed skills; a useful tutorial still needs readers; repositories and release notes can primarily reach existing followers. Marketplace visibility depends on gatekeepers and host changes. Adding more directories does not create a problem people urgently want solved. Stars, forks and cumulative installer counts cannot measure the share of relevant visitors who reached value. Search-extractor caches can also show old repository content; the local 1.4.1 source and exact release evidence govern this baseline, not cached alpha copy or star counts.

## Three small experiments, with explicit stop rules

All experiments below are optional and require a separately chosen execution scope. Under the [pilot availability policy](../../PILOT.md), the owner cannot currently assess or recruit participants; no coordinator or willing cohort is assumed, and no questionnaire is assigned to the owner. Missing participants mean unobserved human outcomes, not a blocked technical release. **No experiment has run here.** Sample sizes and thresholds are proposed spending/attention rules for tiny samples, not market benchmarks or statistically reliable conversion estimates. Record anonymized counts in one Markdown table; no automatic tracking is needed. Preserve unknown outcomes as unknown rather than relabeling them failures.

1. **Comprehension before more page work.** Show the current page to six consenting developers who have an existing repository and recent instruction friction. Denominator: all six exposed, including abandonments. Without coaching, ask what Tibicen does, what they would do next, and what changes require approval. Continue if at least **5/6** identify all three; record separately how many can name an immediate repository problem, with **3/6** as the relevance threshold. If comprehension fails, make one focused copy correction and repeat once with six new readers. If relevance fails, revise the segment/promise rather than redesigning the site. Recruitment and convenience-sample bias remain explicit.

2. **Activation and incremental value.** Begin only after the separate bounded native protocol yields a completed useful task. Recruit six problem-matched voluntary task starts, recording release, host/model, prior familiarity and every operator intervention. Denominator: **all six starts**, including installation, loading and task failures. Activation means the user reviews the proposal, applies an approved justified change, and completes the next ordinary task using the intended instructions. Track no-change outcomes separately. Continue if **4/6** activate without maintainer rescue. Compare each against a direct agent/native setup request on a preserved equivalent starting copy, with order balanced; retain actual elapsed effort and validated missed findings. Require **3/6** cases with a concrete incremental advantage, not merely more files. If direct requests perform as well with less effort, narrow the promise or stop growth work. This requires its own finite protocol and consent; it is not permission to run models now.

3. **Two channel probes after activation.** Compare one job-specific case study entry and one confirmed skill-discovery entry. For each, use **10 eligible, consenting exposed readers** with a known exposure record; avoid counting the same person twice. Denominators: ten exposed, starters among ten, useful completions among starters **and among ten**. A source qualifies for another bounded round if **at least 2/10 start and 1/10 completes** without private rescue. Record observer-reported source and confusion manually. A controlled exposure only tests response to the entry surface; it does not prove organic reach. Separately observe unsolicited arrivals over 14 days if any; unknown impressions stay unknown, and zero arrivals is a result. Do not invent a website conversion rate from GitHub views or registry installs. Stop after two such rounds without any useful completion; do not multiply channels to hide the result.

## Strongest countercase and uncertainties

Developers may prefer a built-in initializer or a direct “audit these instructions” request. Setup is infrequent, and the product asks users to install instructions that install or revise other instructions. The reader may enjoy an impressive agent demo yet have no reason to use it now. Existing conventions may already be sufficient. The [README](../../../README.md) explicitly acknowledges native alternatives and unmeasured comparative benefit. If the narrow cohort cannot show incremental value, the rational strategy is a maintained small utility or a pause on growth investment; more releases, educational content and catalog entries are not a substitute.

Unknowns: current eligible audience size, organic discovery volume, unaided activation, comparative effort, repeat use, referral behavior, public catalog identity and native marketplace eligibility. No market-size, acquisition-cost, retention or willingness-to-pay estimate follows from these sources.

## Source/date/version ledger

All entries checked 6 November 2026. “New” means newly added to this research lane relative to the repository studies inspected; it does not mean a newly occurring event.

| Evidence | Version/date scope | New versus rechecked; limit |
| --- | --- | --- |
| Local README, installation, landing, roadmap and native-first-use report linked above | HEAD `331886e47031506c7b2e043368581f9790f50473`; concurrent worktree; skills 1.4.1 | Fresh baseline; no new browser or live task run. |
| Skills FAQ and CLI README linked above | Mutable live docs/main; no release binding inferred | FAQ listing mechanism new; distribution overview rechecked from 6 November installation study. |
| Superpowers README linked above | Mutable main; harness instructions, not Tibicen support | Rechecked installation evidence; fresh-task example inspected. |
| OpenSpec getting started; Spec Kit README linked above | Mutable main; not repository-pinned OpenSpec 1.14.3 | Onboarding distinction rechecked; Spec Kit concrete task newly inspected here. |
| Superpowers #54 | 20 October 2025; opening report version unspecified; closed not planned | New source here, old incident; no prevalence inference. |
| Superpowers #2392 | 26 September 2026; cached Superpowers 5.1.3 and separate Claude 6.4.1; host version unknown | New source here; agent-filed, root cause unconfirmed, closed not planned. |
| Skills #982 | CLI 1.5.1; 22–27 April 2026; fix stated for 1.5.2 | New historical counterevidence; not a present 1.7.4 defect claim. |

The older [installation review](../2026-11-06-landing-installation-review/README.md) and [landing review](../2026-11-04-landing-review/README.md) provide history. Their pre-fix observations and recommendations are not a fresh gap list, nor do they establish conversion improvement.
