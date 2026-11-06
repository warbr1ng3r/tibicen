# One repair case and a sufficient-setup guard

Prepared **6 November 2026**. This is an isolated, synthetic input packet for the [strategy's next comparison](../../docs/research/2026-11-06-product-strategy/README.md#one-sequence-of-experiments-not-six-backlogs). It reuses an existing case; it supplies no new user-demand or native-use observation. The active chat's evaluator, reports and release work remain separately owned.

## What is ready

- [Repair input](inputs/repair.json): an existing project whose shared workflow says `yarn check`, while its package and tests use `node --test`; the main instructions also repeat the check command. Owner review, public `double` export, team note, dependency manifest and CI must survive setup.
- [Sufficient input](inputs/sufficient.json): the same project and next task with the stale command corrected and the repeated line removed. Existing instructions already provide the useful workflow. No-change can be a correct setup result, but useful-task completion is still required.
- The identical next coding task in both cases adds `triple(value)` and tests, preserving `double` and the accepted owner rules. This small familiar task intentionally gives a competent native method a strong chance to suffice.
- Operator-only [repair oracle](oracles/repair.json), [guard oracle](oracles/sufficient.json) and [source/input hashes](freeze.json). These are acceptance references, not observations or automatic approval.

Both inputs use the existing [scenario contract](../../scripts/evals/contracts.ts) and [materializer](../../scripts/evals/fixtures.ts). They are not registered in the shared diagnostic runner. A later owned caller can parse either JSON with `validateScenario` and materialize separate copies through `materializeScenario`. Keep oracles, frozen replies, this guide and reference-control code outside the agent workspace; only scenario files and the agreed current-phase prompt enter it.

## Local check

From the repository root, using its pinned pnpm 11.21.0 and Node 24.15.0:

```sh
pnpm exec node .scratch/repair-comparison-prep-20261106/controls.ts
```

This validates hashes and contracts, makes four independent temporary input copies, checks hidden-data exclusion and preservation, and runs trusted synthetic tests plus known-answer/negative controls. It cleans its temporary copies. It launches no coding agent, native CLI, server, Docker container or network operation. The only child programs are the fixture's first-party Node tests, with an empty environment and finite timeout. It neither evaluates Tibicen nor measures a person's effort.

Preparation checks passed on Node 24.15.0 / pnpm 11.21.0: two valid cases, four independent copies, four actual fixture-test runs, rejection of missing/wrong task exports and a lost local note, source/input hash preservation and temporary cleanup. Focused ESLint, Prettier and EN/RU local-link/section checks passed. The full repository gate was not rerun; this packet does not modify its shared code or regenerate build outputs.

## Before any actual comparison

Choose a separate finite protocol: exact Tibicen revision, observable host/model/startup, equal per-arm permissions and time/cost/attempt caps, approval handling, initial order and fresh-task acceptance. The baseline uses the owner's competent current/native method; it is not forced to run a particular audit or unfamiliar tool. The Tibicen arm receives the same goal with the explicit skill invocation. Both arms receive equivalent starting copies, and every setup/application approval remains concrete and separate from task execution. Source availability and installed files do not establish native loading.

Record all starts, assistance and failures. Count installation, approvals, proposal reading, task work and recovery as total active operator work; record elapsed time and model cost separately, with unknown costs retained. Compare one repair through the next useful task and check the sufficient guard also completes that task without gratuitous changes. Success requires protected material and task quality plus less total work or a specific tradeoff accepted before observation. A saved edit alone cannot outweigh extra review unnoticed. An unavailable execution route is inconclusive. No live run, human cohort or spending is authorized by this input packet.

## Provenance and boundary

The seven project files and task derive from [diagnostic-conflicts](../../scripts/evals/fixtures/diagnostic-conflicts.json) and its [oracle](../../scripts/evals/fixtures/oracles/diagnostic-conflicts.json), under the repository's [MIT license](../../LICENSE). Source commit at preparation is recorded in the freeze. The guard edits only `AGENTS.md` and `.agents/skills/project-workflow/SKILL.md`; the frozen initial command and public task stay equal. Instructions are embedded fixture content, not changes to this repository's AGENTS.md.

The packet is a rehearsal that can reject an unhelpful technical workflow. It cannot establish an urgent user problem, a maintained adapter contract, automatic instruction discovery, human benefit or competitive advantage. Actual later results belong in a separately identified observation record. This work does not alter the [current roadmap](../../docs/DEVELOPMENT_PLAN.md) or the active agent's files.
