# First native working session after 1.4.1

Labels: wayfinder:map
Status: resolved
Assignee: root

## Destination

Deploy the reviewed landing revision, establish which installed subscription-backed harness can execute a bounded first working session, and correct current-guide version drift. Record actual native observations separately from file checks and internal assistance.

## Notes

The owner approved this execution packet with “Поехали” on 6 November 2026. Execution is included in this map. Use disjoint lanes and independent Ponytail review. Published skills remain 1.4.1; no new product behavior, paid API calls, credential changes, personal configuration edits, new release or additional source commit is authorized by this packet. A substantial reproduced product fix needs its own OpenSpec change before implementation. Local documentation and owned fixtures may be edited.

## Parallel work

- [Deploy the reviewed landing](issues/01-pages.md)
- [Establish bounded native execution routes](issues/02-native-routes.md)
- [Correct current-guide version drift](issues/03-current-guides.md)
- [Observe a native working cycle and integrate results](issues/04-observations.md)
- [Retain safe executor failure correlation](issues/05-executor-diagnostics.md)

## Decisions so far

- The published skill release is 1.4.1. Public landing source `4ed6009071036f709793d052ff03ce3661901017` passed CI; its Pages deployment is a separate operation.
- [Establish bounded native execution routes](issues/02-native-routes.md): the existing contained Codex 0.157.0 route and pinned Docker image are available; generic Claude/ZCode execution remains outside verified containment.
- [Correct current-guide version drift](issues/03-current-guides.md): four current-guide headers/pointers now reflect 1.4.1; independent Ponytail review passed, preserving the historical snapshot and installed Node minimum.
- [Deploy the reviewed landing](issues/01-pages.md): existing Pages workflow successfully deployed source `4ed6009`; live EN/RU preview, language switch and preserved installation pin were checked without a new source commit.
- The native setup recommendation passed; the fresh useful task stopped on an uncorrelated process exit. Further native phases are stopped. The bounded offline [diagnostic change](../../openspec/changes/correlate-contained-tool-failures/proposal.md) addresses the demonstrated evidence gap without changing product behavior or historical outcomes.
- Integration is complete: independent Ponytail/evidence review passed, the final gate passed 954 tests with one existing manual skip, and all 100 skill payloads/74 original native records are unchanged. All five tickets are resolved. Native working-task/memory acceptance remains unverified; resolution does not turn the failed cycle green.

## Not yet specified

The later failing native command and underlying cause remain unknown. New live execution requires a fresh finite protocol; this packet does not retry the failed task.

## Out of scope

Human usefulness scoring, exhaustive model compatibility, paid API use, new memory backends and automatic technology installation.
