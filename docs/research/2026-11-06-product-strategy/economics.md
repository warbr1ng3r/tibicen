# Business models and maintainer economics

Checked **6 November 2026, Europe/Moscow** against published **Tibicen 1.4.1**. Research only. Russian translation (`economics_ru.md`). This lane proposes choices; it authorizes no billing, outreach, service commitment or product change.

## Decision

Keep Tibicen a **bounded, maintained open-source utility** while comparative usefulness remains unknown. The smallest potential commercial extension is one fixed-scope setup or repair engagement, fulfilled manually with the existing skills. Sponsorship can supplement maintenance if eligible and organically requested. Recurring team support needs evidence of recurring incidents and an available operator. A hosted control plane or licensing program is premature.

This order follows the product's temporary-scaffolding model: the user retains files and a manifest, without a resident Tibicen runtime. Published delivery, preservation and recovery checks establish engineering properties. They do not establish saved time, repeated demand or willingness to pay. The [native first-use result](../../evals/results/2026-11-06-native-first-use/README.md) still has a failed useful-task phase and unexecuted later phases. Its cause remains under investigation; neither success nor a product defect is inferred. See [vision](../../PRODUCT_VISION.md), [roadmap](../../DEVELOPMENT_PLAN.md) and the [competition lane](competition.md).

## What comparable offers establish

These are observed offers and documented mechanisms, not evidence of their revenue or Tibicen demand.

- **Maintenance can stay free while support/scale is paid.** Mend advertises Renovate Enterprise at **“up to $250 per developer per year”**, rather than an unconditional fixed price. Separately, its cloud documentation gives Community unlimited public/private repositories; Enterprise adds resources, scheduling and helpdesk support. A large installed scope can therefore remain free. [Pricing](https://www.mend.io/pricing/), [cloud tiers](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers).
- **Expert implementation can complement a developer tool.** Nx Labs explicitly offers workspace assessments, training, embedded engineering and on-demand expertise. No numeric service price is displayed on the inspected page. This supports considering a service format; it supplies no Tibicen price anchor. [Nx Labs](https://nx.dev/contact/labs).
- **An agent vendor already bundles the team boundary.** Cline lists its open-source individual offer as free, with inference paid separately or BYOK; Enterprise has custom pricing and includes centralized administration, SSO, SLA and support. A separate Tibicen team product must earn another budget and vendor relationship. [Cline pricing](https://cline.bot/pricing).
- **Sponsorship is a payment mechanism, not recurring customer demand.** GitHub allows one-time/monthly tiers. Its documentation lists no fee for personal-account sponsorships and up to 6% for organization sponsorships; receiving funds depends on supported-region eligibility. Account eligibility and payout availability for this owner were not checked. [GitHub Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors).
- **A maintainer network has selection and allocation rules.** Tidelift documents payments based on subscriber package usage and strategic importance, with agreements and co-maintainer allocation. Its article was last updated in December 2023. It is historical mechanism documentation freshly inspected today, not proof that Tibicen qualifies or that its skills appear in customers' dependency inventories. [Maintainer payments](https://support.tidelift.com/hc/en-us/articles/4406294816916-How-we-pay-lifters).
- **Operating mechanisms and licenses are separate choices.** Renovate's own guide describes self-hosting duties—hosting, configuration, regular execution and updates—and distinguishes OSS from closed-source CE/EE, which use an EULA. A two-week CE/EE cadence contrasts with OSS releases on each commit. This is an example of a vendor maintaining separate delivery/support surfaces, not a licensing recipe for Tibicen. [Running Renovate](https://github.com/renovatebot/renovate/blob/main/docs/usage/getting-started/running.md).

## Decision table

All buyer descriptions and triggers below are hypotheses. None was validated through customer contact.

| Option / priority | Buyer and trigger | What must be true | Main operating cost drivers | Sufficient-free/native countercase and decision |
| --- | --- | --- | --- | --- |
| **1. Maintained OSS utility** | No required buyer; maintainer/user returns when an agent or setup changes | A small supported surface helps actual tasks and fits a finite upkeep budget | Upstream review; reproduction; release/platform checks; docs/translations; issue triage | Native setup plus a short instruction file is enough. Keep useful narrow repairs; allow no-change outcomes and freeze breadth when upkeep exceeds capacity. |
| **2. Optional sponsorship** | An existing beneficiary or employer wants continued shared maintenance | Beneficiary already values the public work; payout route is available; benefits do not imply unlimited support | Sponsor administration, public maintenance receipts, promised benefits, payment fees | User can use/fork the tool without funding it. Treat funding as optional and volatile; do not attach availability promises to small donations. |
| **3. Fixed-scope setup/migration service** | Repository maintainer or engineering manager faces a concrete agent transition or broken customized setup | The operator removes more effort than native/self-service; access, acceptance and exclusions can be bounded; a capable operator is available | Intake, repository access, investigation, model usage, preservation review, delivery, rework | The buyer's existing agent or colleague finishes the same task cheaply. Test one priced scope before any service software. |
| **4. Team maintenance agreement** | Platform/developer-experience lead has repeated changes across named repositories/harness versions | Incidents recur; buyer wants responsibility transferred; request volume and response expectations fit capacity | Scheduled reviews, upstream drift, heterogeneous repos, private support, incident bursts, coverage expansion | Shared files, native team controls, AgentRC/APM or an internal owner suffice. Defer until several independently requested maintenance events reveal a repeatable boundary. |
| **5. Paid SaaS/control plane** | Platform/security owner needs cross-repository policy, access evidence or central fleet status | A recurring cross-repo job genuinely requires a service; local reports and existing vendors fail; buyer accepts hosted access | Auth/permissions, tenant isolation, repository data, availability, audit retention, connectors, support and sales | Native organization features plus existing free distribution solve it. Defer: a dashboard cannot manufacture recurring need. |
| **6. Commercial licensing** | A distributor or organization needs rights/support beyond the current public offer | A specific requested transaction and rights inventory justify a distinct offer | Provenance, contributor rights review, separate packaging/releases, contract administration and support | The public license may already meet the requested use. Do not turn an unmeasured service hypothesis into a license gate. |

The repository's current [LICENSE](../../../LICENSE) is MIT and explicitly grants broad use, modification, distribution and sale permissions subject to its conditions. That text does not establish ownership of every dependency or permission to relicense every contribution. No licensing change, legal conclusion about a proposed deal, or recommendation to restrict already distributed copies follows from this research. The product addendum also requires component-level provenance; a wrapper's license cannot substitute for included material's origin.

## Strongest economic countercase

A user with an existing agent can already generate guidance, make ordinary file edits and use native diagnostics. Claude documents `/init` and approved edits through `/doctor prompt-audit`; the latter requires **2.1.283+** and its bundled skill enabled. The richer initialization is opt-in. These are documented capabilities, not tests here. [Native guidance](https://code.claude.com/docs/en/memory).

If that workflow completes the next useful task with equal or less operator effort, Tibicen has no basis for charging for generic setup. Its installation, proposal review, reports and additional maintenance can be net cost. For organizations, Cline's bundled administration and the free alternatives in the [competition study](competition.md) further reduce room for a separate purchase. A reproducible preservation advantage might justify a bounded repair service, but remains a hypothesis. Competitors' prices, stars or repository counts cannot establish Tibicen's TAM, conversion, ARR or willingness to pay.

## Smallest sustainable operating model

Adopt a finite maintenance envelope before any revenue assumption: documented supported paths, monthly and material-upstream-change review as already required by the [roadmap](../../DEVELOPMENT_PLAN.md), security/critical preservation fixes, batched compatible releases, and explicit unsupported cases. A review may validly produce no change. Track actual maintainer time by review, reproduction, release and support; track model cost separately. These measurements support scope decisions rather than another product feature.

Illustrative capacity arithmetic, **not a forecast**: let monthly available hours be `H`, routine upkeep `M`, mean full engagement time including rework `h`, and variable cash cost per engagement `v`. Capacity is at most `floor((H − M) / h)` when `H ≥ M`. With invented values `H=16`, `M=10`, `h=6`, capacity is one engagement; if `h=8`, capacity is zero. If a proposed fee is `P`, cash after that engagement's variable cost is `P−v`, before fixed costs and taxes; the effective hourly contribution also includes intake and unsuccessful inquiries. No value for `P`, time saving or sales probability has been measured. A service cannot subsidize upkeep merely because its nominal price looks high.

The owner's [pilot availability constraint](../../PILOT.md) means even this small service is currently a conditional option. Do not allocate recruitment, questionnaires or trial appointments to the owner. Sponsorship and voluntary contributions cannot substitute for a named available maintainer when making response commitments.

## Cheapest falsifiable commercial-signal experiment

**Prepare one dormant offer card**, rather than build billing: “One existing repository, one selected harness/version, one setup or repair transition, an approved diff, preservation check and fresh-task handoff; application changes, credentials, runtime hosting and ongoing support excluded.” It must disclose any remaining native-task limitation. Include a single fixed price `P`, set from a finite delivery budget before exposure, with an explicit statement that requests are nonbinding until an operator accepts the scope. This research does not choose a market-clearing price or publish the card.

Only after comparative usefulness and operator availability exist, propose exposing that card through the existing site/repository entry point. Use voluntary inbound requests; no campaign, user questionnaires, new telemetry service or scheduled pilot. A qualified signal is an identifiable budget holder voluntarily requesting that stated scope at `P`, naming the imminent task and acknowledging the available native route. A click, star, donation or generic “interested” does not qualify. This is commercial intent, **not a paid transaction**; actual paid acceptance requires a separately authorized, deliverable engagement and an available payout route.

**Precommit a 30-day exposure window if activated.** One qualified request supports at most a manually scoped paid-test proposal; it does not support a subscription or SaaS build. Zero qualified requests stops commercial implementation, while recording reach: without known relevant exposure, the result is inconclusive about demand. Scope repeatedly expanding into application engineering, enforcement or 24/7 support rejects this offer boundary. A request fulfilled more easily by the buyer's native tool rejects the claimed service advantage. With owner/operator unavailable, leave the experiment dormant; there is no demand result or ticking trial window today.

## Fresh source ledger and remaining unknowns

All eight external entries were opened on **2026-11-06**. “New” means new to this economics lane; it does not prove absence from every past repository study. “Rechecked” explicitly overlaps the completed competition lane. Living prices/features are not immutable contracts or tested versions.

| Primary source | Version/date and status | Qualification |
| --- | --- | --- |
| [Mend pricing](https://www.mend.io/pricing/) | Living; new | Vendor asking price, including “up to”; no realized revenue |
| [Mend cloud tiers](https://docs.mend.io/renovate/latest/mend-renovate-cloud-resource-tiers) | Living; new | Free/paid operational boundary; no Tibicen buyer evidence |
| [Nx Labs](https://nx.dev/contact/labs) | Living; new | Actual service menu, no displayed numeric price |
| [Cline pricing](https://cline.bot/pricing) | Living; new | Vendor free/custom-price distinction; not observed service quality |
| [GitHub Sponsors](https://docs.github.com/en/sponsors/getting-started-with-github-sponsors/about-github-sponsors) | Living; new | Funding mechanism/fees/eligibility; owner route unchecked |
| [Tidelift payments](https://support.tidelift.com/hc/en-us/articles/4406294816916-How-we-pay-lifters) | Updated 2023-12-04; new, historical mechanism | Allocation explanation; current Tibicen eligibility unknown |
| [Renovate running guide](https://github.com/renovatebot/renovate/blob/main/docs/usage/getting-started/running.md) | Inspected main, unpinned; new | First-party operating/license descriptions, not a legal analysis |
| [Claude memory/setup](https://code.claude.com/docs/en/memory) | Living; audit ≥2.1.283; rechecked | Strong native substitute with version/enablement conditions |

Unknowns remain decisive: actual comparative usefulness, incident recurrence, acquisition reach, owner/operator capacity, upkeep hours, native evolution, budget authority, accepted price and fulfilled-service cost. The sustainable smallest model is a scoped utility whose maintenance fits available time; a business becomes an option only when a real buyer and deliverable obligation appear.
