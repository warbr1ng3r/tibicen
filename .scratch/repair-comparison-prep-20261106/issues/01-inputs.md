# Prepare and verify the repair/guard inputs

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Own only .scratch/repair-comparison-prep-20261106/. Read and reuse the existing diagnostic-conflicts fixture, hidden oracle, validateScenario, executorScenario and materializeScenario. Prepare repair and sufficient input JSON, matching operator-only oracles, source/input hashes, one local controls script and a concise paired guide. Check scenario validity, same-state arm equivalence/independence, hidden-oracle/reply exclusion, protected content, a sufficient-state negative control and actual baseline/known-answer task checks. Keep source fixtures unchanged. Do not add scenarios to the shared registry, change the evaluator, write a live protocol, run a model or claim usefulness.

## Answer

Prepared two scenario-contract inputs, matching operator-only oracles and source/input hashes, reusing diagnostic-conflicts and the existing materializer. The sufficient guard changes only two instruction bodies; both cases use identical setup/task goals, permissions and command hashes. The package is in this owned directory with a paired [guide](../README.md).

Node 24.15.0 / pnpm 11.21.0 controls passed: four independent copies, hidden oracle/reply exclusion, identical bytes/modes between arms, four actual fixture-test runs, known-answer success, missing/wrong-export rejection, lost-note rejection, preserved sibling inputs and source hashes, cleanup. Focused ESLint/Prettier and 26 local links/anchors with EN/RU parity passed. No runtime product change, shared registry edit, full build/gate, model call, native session, install, commit or publication.
