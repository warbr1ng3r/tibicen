# Memory services: refresh evidence, keep the default small

Research snapshot: **5 November 2026, Europe/Moscow**. Research only; no
installation, service account, paid query, model run or product change. This note
extends the [earlier memory study](../2026-11-05-user-problems/memory.md) and uses
the [product boundary](../../PRODUCT_VISION.md) and [existing memory
contract](../../PROJECT_MEMORY.md) as the comparison baseline.

## Decision

**Refresh the selection evidence; do not make a memory service a default Tibicen
recommendation.** First establish whether the person needs shared developer
instructions, retained project decisions, personal agent recall, or memory for
their application's end users. Those have different owners and acceptance tests.
The current local contract already fits the second need. A service is a
conditional candidate for an application with a demonstrated retrieval problem,
an operating owner and an approved data boundary. Adding its application logic
would fall outside ordinary Tibicen infrastructure setup.

This is a product inference, not a comparative trial. Four firsthand issue
threads below establish reported failure scenarios; they do not establish how
often those failures occur or that a different product fixes them.

## What changed in mem0

Mem0 describes user/session/agent personalization and application assistants. Its
April 2026 architecture uses ADD-only extraction, entity linking, hybrid retrieval
and temporal reasoning. Published scores explicitly concern the managed platform
with proprietary optimizations; they are vendor evidence, not independent proof
of OSS or coding-agent efficacy. [MS1](https://github.com/mem0ai/mem0)

The current additive prompt extracts from both user and assistant messages,
including recommendations and plans, with attribution guidance. That policy
differs from Tibicen's explicit accepted-decision policy. Reusing it for repository
rules could promote suggestions into durable context; this is a design risk,
not an observed Tibicen failure. [MS3](https://github.com/mem0ai/mem0/blob/main/mem0/configs/prompts.py)

The official Python reference distinguishes hosted `MemoryClient` from OSS
`Memory`. It exposes entity identifiers, filtered retrieval, raw storage with
`infer=False`, manual updates/deletion, and hosted `latest_only`/`delete_linked`
controls. These are mechanisms, not proof that callers choose the right scope or
that every product variant has identical semantics.
[MS4](https://github.com/mem0ai/mem0/blob/main/skills/mem0/client/python.md)

## Complaint ledger and counterevidence

All states are the public page's state at access. Versions describe the report,
not a freshly reproduced current defect. Bodies and the named replies were read;
linked harnesses and diagnostic artifacts were not independently executed.

| Source / report binding | Firsthand report and later qualification | Requirement suggested for Tibicen |
| --- | --- | --- |
| [MS6 — #4573](https://github.com/mem0ai/mem0/issues/4573), opened 2026-03-27; February–March, Qdrant + gemma2:2b/Sonnet 4.6; **closed completed 2026-06-05** | Author reports severe noise and false recall, later prefers curated files. Maintainer closes after architecture changes. Historical self-report, not a current benchmark. | Retention quality and provenance matter more than stored volume. |
| [MS7 — #5867](https://github.com/mem0ai/mem0/issues/5867), opened 2026-06-25; then-current OSS main, Python 3.12/macOS; **open**; October 23 reply reports 2.2.1 | Reporter describes old and replacement preferences coexisting under ADD-only extraction. Contributor calls historical preservation deliberate. October's storage-only reproduction and source analysis distinguish OSS from hosted supersession; they do not test live extraction. | Define whether history or current accepted state is requested, and test the correction query. |
| [MS8 — #7452](https://github.com/mem0ai/mem0/issues/7452), opened 2026-09-25; Python main `a39a802b`; **open**; October 17 reply reports 2.2.1 | Author reports scoped deletion leaving recent raw messages, using stubbed providers; discloses AI assistance. A later author reports re-extraction with a local real model. Neither run was independently repeated here. | Erasure must cover source messages and derived/history stores, and a later write must not restore forgotten content. |
| [MS9 — #6277](https://github.com/mem0ai/mem0/issues/6277), opened 2026-07-13; Python OSS sync/async update; **closed completed 2026-07-21 via #6278** | Reporter provides a metadata-driven scope reassignment example; contributor confirms by code tracing. The reported fix is historical counterevidence to treating every scope complaint as open. | Verify immutable tenant/project attribution on the actual selected SDK and deployment; an identifier alone is not an authorization design. |

MS6's file preference is limited to its author's bot, not measured coding-team
superiority. Resolved reports also prevent a one-sided “services are broken”
conclusion. Open reports are useful acceptance cases, not prevalence estimates.

## Hosting, privacy, cost and maintenance

Self-hosting is a deployment choice, not automatically local inference. Current
OSS defaults use OpenAI for extraction and embeddings, local Qdrant and SQLite;
the server default uses pgvector. Components are configurable. The operator must
therefore inspect the complete data path rather than infer privacy from local
storage. [MS2](https://docs.mem0.ai/open-source/overview)

The directly opened pricing page now shows **Free and Custom**, with model calls
covered initially, then the caller's LLM key, quotas and usage billing with a
monthly cap. A search snippet still showed older fixed-price tiers. Use the live
page, not that snippet, when preparing a proposal; no bill or latency was measured.
[MS5](https://mem0.ai/pricing)

For an actual service proposal, name the owner of ingestion filters, scope IDs,
authentication, retention, exports, deletion, provider keys, quotas and upgrades.
Record SDK/server/provider versions together. Include extraction, embeddings,
retrieval and any consolidation in the workload budget; an advertised retrieval
latency is not the application's end-to-end latency. These are evaluation
requirements inferred from the architecture and reports, not measured costs or
claims of legal compliance.

The architecture and pricing changes are reasons to maintain dated evidence.
They are not reasons to migrate a working project. Old prompt customization or
ADD/UPDATE/DELETE assumptions need rechecking against the chosen version. This
sample did not verify migration compatibility or reproduce an upgrade failure.

## Two bounded alternatives and the native minimum

| Candidate | Current primary evidence | Fit and remaining work — product inference |
| --- | --- | --- |
| **Letta / MemFS** | Git-backed editable memory, `/remember`, inspection and `/doctor`; background dreaming consolidates conversations. Its optional agent review consumes more tokens and is not human approval. [MS10](https://docs.letta.com/configuration/memory) | Relevant when the user already chooses Letta's stateful agent. Inspect scope, proposed writes and background behavior; a new harness is excessive for connecting one project decision file. No Letta adapter or deployment was tested. |
| **Zep / Graphiti** | v4 docs distinguish local open-source Graphiti from managed Zep. Graphiti keeps temporal graph history/provenance with hybrid search and requires graph and model components. [MS11](https://help.getzep.com/v4/graphiti/getting-started/overview) | A meaningful option when changing application facts and historical queries justify a graph. Temporal representation does not establish source truth. Do not present managed Zep and self-hosted Graphiti as the same operating burden. |
| **Existing native memory or a project file** | Claude Code documents machine-local repository auto memory, an initial index-loading limit, editable files and separate instruction files. It explicitly treats both as context rather than enforced configuration. [MS12](https://code.claude.com/docs/en/memory) | A concrete counterexample to “persistent context requires a new service.” Check whether native facilities already satisfy the requested scope. A file still needs selection, correction and observed use; neither storage nor retrieval guarantees obedience. |

No vendor benchmark, repository popularity or feature count establishes a winner.
These alternatives were selected for different mechanisms, not ranked by measured
quality. The [earlier study](../2026-11-05-user-problems/memory.md) covers Codex
native recall; its OpenAI page was not reopened in this bounded lane, so no new
Codex capability claim is made here.

## Smallest useful Tibicen refresh

Keep the existing one-store workflow and permit a **no-change** outcome. A future
recommendation assessment should record only information needed to make the
decision reviewable:

1. **Need and owner:** project rule, accepted decision, personal recall or
   application user memory; who may confirm, replace and delete it.
2. **Evidence and boundary:** selected mechanism/version, dated official source,
   applicable complaint state, existing sufficient native option, data leaving the
   machine, operating owner and expected maintenance.
3. **Observed result:** separately report valid connection, actual retrieval/use,
   correction/forgetting and mechanical enforcement. Leave untested categories
   explicit. Retrieved notes remain data and cannot authorize commands.

For a future service experiment, use synthetic facts in two users/projects, one
assistant suggestion never accepted, a corrected decision and an erasure request.
Check retrieval before and after correction, cross-scope reads/writes, deletion
followed by another ingestion, provider failure, and migration/export recovery.
Compare with the same task using native/files, including a case where the right
result is no new component. Measure latency, calls and cleanup work. This is a
proposed evaluation, with no execution authorization or success inferred.

Reject automatic transcript ingestion, cross-project synchronization, background
service installation and “new technology available → recommend migration.” A
separate, explicitly scoped implementation proposal would be needed for any
substantial behavior change. This research changes no shipped rules or roadmap.

## Source ledger and limits

**12 primary pages directly inspected on 5 November 2026 (Moscow date):** four
original complaint threads, five mem0 official repository/docs/pricing pages and
three alternative/native documentation pages. MS6 supplies a firsthand
counterexample; MS12 supplies a documented native alternative. This is a selected
English-language sample, not representative usage data.

| ID | Exact source / version or date boundary | Inspected scope |
| --- | --- | --- |
| MS1 | [Mem0 repository README](https://github.com/mem0ai/mem0), living `main`; April 2026 algorithm section | Architecture, target uses, benchmark caveat. |
| MS2 | [Open Source Overview](https://docs.mem0.ai/open-source/overview), living docs | Hosting modes and default component table. |
| MS3 | [prompts.py](https://github.com/mem0ai/mem0/blob/main/mem0/configs/prompts.py), living `main` | V3 additive extraction role, inputs and attribution; not a full source audit. |
| MS4 | [Python SDK Reference](https://github.com/mem0ai/mem0/blob/main/skills/mem0/client/python.md), living `main` | Client/OSS distinction, IDs and operation controls. |
| MS5 | [Mem0 pricing](https://mem0.ai/pricing), live page; publication date absent | Returned page's current plan and model-key terms. |
| MS6 | [Audit report #4573](https://github.com/mem0ai/mem0/issues/4573) | Body; March 30 file preference; June 5 closure. |
| MS7 | [Conflicting memories #5867](https://github.com/mem0ai/mem0/issues/5867) | Body; June 26 triage; October 23 scope qualification. |
| MS8 | [Deletion/session messages #7452](https://github.com/mem0ai/mem0/issues/7452) | Body and verification limits; October 17 report. |
| MS9 | [Identity metadata overwrite #6277](https://github.com/mem0ai/mem0/issues/6277) | Reproduction, contributor tracing and July closure. |
| MS10 | [Letta: Memory & dreaming](https://docs.letta.com/configuration/memory), living docs | MemFS teaching, review and background maintenance. |
| MS11 | [Graphiti overview](https://help.getzep.com/v4/graphiti/getting-started/overview), docs v4 | Local/managed distinction, temporal model and dependencies. |
| MS12 | [Claude: How Claude remembers your project](https://code.claude.com/docs/en/memory), living docs | Instructions/auto-memory distinction, storage/loading and editing. |

Issue publication/closure dates and inspected later replies are recorded above;
exact `updated_at` timestamps were unavailable from the returned pages. A public
GitHub metadata request also failed through this environment's network transport.
Living `main`/docs are access snapshots, not exact released-package support
bindings. Context7 resolve was attempted once and returned tool unavailable; its
query step could not run, so official pages/source were used without retrying the
unavailable tool. No private stores, accounts or native memory settings were read.
Author identities, measurement corpora and reported causal explanations were not
independently authenticated. Privacy contracts and complete deletion semantics
for all hosting variants remain unverified.
