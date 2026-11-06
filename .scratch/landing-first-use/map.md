# Simpler first-use landing

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Implement the owner's approved five-point landing simplification after the [research](../../docs/research/2026-11-06-landing-installation-review/README.md). Detailed requirements/tasks are in the [change](../../openspec/changes/simplify-first-use-landing/tasks.md). This is local implementation, not commit/push or publication. Product/distribution version remains 1.4.0; no paid API/native runs.

## Parallel work

The completed design fixes interfaces and non-overlapping ownership. Installation, examples and secondary presets can run together; root composes home independently against those interfaces and waits for all lane results before integration acceptance.

- [Recommended installation](issues/01-installation.md)
- [Compact examples](issues/02-examples.md)
- [Secondary presets](issues/03-presets.md)
- [Home and integration](issues/04-integration.md)

## Decisions so far

- One existing pinned npx command; no new installer/dependency.
- Both task choices remain ordinary requests; no new automatic router.
- Native radio example selection works without JS.
- Secondary EN/RU preset pages reuse one shared layout and existing local-only handling.

## Lane results

Installation, examples and secondary presets are [resolved](dashboard.md). Root's [integration ticket](issues/04-integration.md) owns the combined gate, browser results, independent review and verification record. No lane performed a commit or publication.

## Outcome

All four tickets and six change tasks are complete. [Verification](../../openspec/changes/simplify-first-use-landing/verification.md) records independent review, gates, rendered results and frozen distribution checks. Local only; no publication action.

## Source handoff authorization

After local acceptance the owner asked to push the reviewed result. Root prepares the local commit and curated public-source commit, preserving historical private omissions. Public CI is checked after push; separate Pages deployment is outside this handoff.

## Publication complete

Public source `a6d54bc` passed CI 42154948265. Owner-authorized Pages 42156035977 deployed the same source successfully; four live EN/RU routes and identical 204-byte presets passed desktop/mobile/no-JS checks. See the change verification for actual limits. Skill release 1.4.0 is unchanged.
