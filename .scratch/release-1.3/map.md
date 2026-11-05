# Release 1.3.0 preparation

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Prepare a concrete, reviewable 1.3.0 candidate for the completed descriptive
harness profiles and generic portable workflow. The owner authorized the reviewed feature commit/push
and autonomous preparation. Publishing a new distribution, tag, assets or Pages
requires authorization on the concrete release packet under
[RELEASING](../../docs/RELEASING.md). Paid API budget stays USD 0; personal
credentials and published versions stay unchanged.

## Decisions so far

- [Candidate preparation](issues/01-candidate.md) is complete: 835/835 tests, build, 94 payloads and both skills on a physically external unpack passed. The source/archive and correction history are frozen privately; observations and delivery remain separate.

- The feature is committed locally as `17d4129c85a28147eb478ded4100d87ca74dce2b`
  and pushed to public main as `93d9305380ee24deb7ffca88f6d62fb48250f2f2`.
  Independent export review accepted exact scope and historical privacy boundaries.
- Target 1.3.0 is a compatible minor. Root package version owns generated skill
  versions; persisted schema versions and dependency pins remain unchanged.
- New schema-1 preset agent hints need a downgrade note: older runtimes reject
  newly added IDs. Installer/native support remains separately bounded.
- Existing 835/835 development and 9/9 browser results keep their identities.
  Fresh candidate checks and two finite supplied-context observations follow;
  no native loading or human benefit is inferred.

## Tickets

- [Freeze and check the versioned candidate](issues/01-candidate.md)
- [Observe changed init/adopt guidance](issues/02-observations.md)
- [Check delivery and prepare the release packet](issues/03-delivery-and-review.md)

## Scope correction

The owner requires actual broader harness/LLM portability. Candidate-01 and all completed local checks remain retained. H01/H02 are withheld/unconsumed with no GO or dispatch; further acceptance/release work follows the [portability effort](../harness-portability/map.md). No new publication.

Candidate-02 local portability is implemented and mechanically checked in the linked effort: 843/843, 42 browser checks and U02. This does not replace candidate-01/H01/H02 or close the separate behavioral/public release gates.

- The owner approved the next local acceptance packet: two fresh supplied-context init/adopt observations and exact candidate-02 update/recovery/removal checks. Independent protocol review precedes execution. H01/H02 and U01/U02 retain their old outcomes. No new paid API, personal-auth or release action is inferred.

- [Fresh observations](issues/02-observations.md) and [local delivery/release preparation](issues/03-delivery-and-review.md) are complete for candidate-02: H03/H04 source-assisted reasoning accepted; D01 universal replacement/restoration/removal and combined local assessment Ship. Raw child traces/native model compatibility remain unverified. [Public release](issues/04-public-release.md) followed the owner’s later concrete-packet authorization, as recorded below.

- [Public release](issues/04-public-release.md): owner authorization received; source `797b96e`, distribution `b61a195`, CI and all six platform cells passed. Public universal delivery passed; [1.3.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.3.0) published at `2026-11-05T19:34:40Z`, all three returned assets verified. Metadata CI 42096237029 passed; Pages 42096956053 deployed metadata source `606f5b25f83831c3d9c5e29709d85c32ae0cf7a9`. Actual audit 42097697236 verified all 18 returned bodies and preserved the four earlier maintenance records. Release work is complete.
