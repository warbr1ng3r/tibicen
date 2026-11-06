# Tibicen development plan

Updated 6 November 2026 (Moscow). Product scope remains in the
[vision](PRODUCT_VISION.md) and [addendum](PRODUCT_VISION_ADDENDUM.md).
This roadmap owns milestone order; detailed requirements and tasks stay in OpenSpec.

## Published baseline

**Skills 1.4.0 are published.** Task-aware init/adopt and portable, read-only MCP
diagnosis are included. Candidate checks, six platform cells, public installation,
update/recovery/removal and returned release assets passed within the scopes in the
[1.4 release report](evals/results/2026-11-06-release-1.4/README.md).
That report retains exact source/distribution identities and coverage limits.

**The simpler first-use landing is published.** Public source
[`a6d54bc`](https://github.com/warbr1ng3r/tibicen/commit/a6d54bc6901bbf212cbfd889385d77b82e4b2f4f)
passed CI and Pages deployment; live EN/RU home and preset routes were checked on
desktop/mobile and without JavaScript. See the exact
[publication record](../openspec/changes/simplify-first-use-landing/verification.md#publication).
The distributed skills remain 1.4.0. Broader native/model compatibility, actual MCP
connection and measured human usefulness require their own observations.

## Current work and next milestones

1. **Validate the first working session after 1.4 — complete locally.** Five
   controlled init/adopt, project-memory, MCP and no-change cases used the frozen
   published distribution, followed by separate mechanical applications, useful
   tasks and a later memory correction/read. The
   [observation report](evals/results/2026-11-06-first-working-session/README.md)
   retains assistance, runtime and consent limits. Ownership remains in the
   working-path packet (`../.scratch/working-path/map.md`; private development record; excluded from public source), detailed tasks in
   [validate-first-working-session](../openspec/changes/validate-first-working-session/tasks.md).
2. **Prepare the compatible 1.4.1 patch — in progress.** A one-line proposal now
   displays a bounded context diff while retaining full approved content and
   existing plans. The development fix passed review and its full gate; versioned
   candidate acceptance, public CI, delivery and publication are tracked in the
   release effort (`../.scratch/release-1.4.1/map.md`; private development record; excluded from public source) and
   [candidate report](evals/results/2026-11-06-release-1.4.1/README.md).
   Frozen published 1.4 artifacts remain unchanged.
3. **Decide release scope and version after integration.** Apply normal SemVer:
   compatible fixes use patch, compatible features minor, and incompatible supported
   contracts major. The actual changes determine the next version. Follow
   [RELEASING](RELEASING.md) for candidate evidence and separate publication
   authorization; this roadmap does not select or approve a release.

## Regular maintenance and later options

Review core rules and adapters at least monthly and after material upstream changes
under [MAINTENANCE](MAINTENANCE.md). The next monthly review is due by
**3 December 2026**. A review may produce a justified no-change result or a bounded
change with affected setup/improvement checks; this is an ongoing maintenance lane.

Voluntary human usefulness research and rubric calibration remain optional
postpublication work under the [pilot protocol](PILOT.md); measured benefit is unknown.
Additional adapters, context maps, portable manifests and other future capabilities
need a demonstrated user problem and a separate scoped decision. The
[post-1.3 study](research/2026-11-05-post-1.3-priorities/README.md) records candidate
opportunities rather than an approved implementation queue.

## Historical plan

The [6 November roadmap snapshot](history/DEVELOPMENT_PLAN_2026-11-06.md) preserves
the previously published plan and its section headings from
[public source `d8fbb241`](https://github.com/warbr1ng3r/tibicen/blob/d8fbb2415aec32f18994611a3057748918d2bbc0/docs/DEVELOPMENT_PLAN.md).
Its dated Unreleased, next-step and approval wording describes those stages.
Retrospective archives are reconstructed records, not proof of prior approval or
execution; historical outcomes and missing observations retain their original scope.
