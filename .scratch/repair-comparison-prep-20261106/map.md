# Prepare one repair comparison without changing the active evaluator

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Deliver reusable inputs for one Tibicen-versus-native repair comparison and an already-sufficient guard. Reuse the existing diagnostic fixture and scenario contract. This packet prepares and checks synthetic material; it does not run the comparison or change product behavior.

## Ownership

The owner asked this chat to take an independent piece alongside the active agent. Own only this directory. The other chat owns native-memory recovery, shared evaluator code, reports, roadmap, tracker and release integration. No shared file writes, builds, dist regeneration, live sessions, credentials, paid APIs, installs, commits or publication. Existing source fixtures are read-only. Canonical guide and Russian translation stay together.

## Ticket

- [Prepare and verify the repair/guard inputs](issues/01-inputs.md)

## Decisions so far

- Reuse diagnostic-conflicts and its oracle rather than add another scenario framework or modify the registry.
- The two native/comparison arms receive identical files for a given case; the sufficient guard changes only outdated/duplicate instructions.
- No new OpenSpec behavior change: this is an isolated preparation artifact, not an adapter, runner or distributed skill change.
- [Prepared inputs and controls](issues/01-inputs.md): repair and sufficient guard validated through the existing contract/materializer. Local positive/negative controls, four fixture-test runs, source preservation, lint, formatting and paired-guide links passed. No native or comparative outcome is inferred; shared execution remains with the other chat.
