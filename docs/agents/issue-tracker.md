# Issue tracker

Public bug reports and proposals belong in [GitHub Issues](https://github.com/warbr1ng3r/tibicen/issues). Follow [CONTRIBUTING.md](../../CONTRIBUTING.md) when preparing a change.

For implementation order and current scope, read [the development plan](../DEVELOPMENT_PLAN.md). Requirements, scenarios and detailed implementation tasks live in the corresponding [OpenSpec change](../../openspec/changes/). Select work with ready inputs and keep concurrent assignments in separate paths.

## Current effort

Published-alpha observations confirmed implicit loading of Tibicen init and the pinned Ponytail body; separate fresh app tasks passed 14/14 tests and the explicitly selected OpenSpec init workflow. Built-in unverified reports remain unchanged. [Evidence and limits](../evals/results/2026-10-28-published-alpha-native/README.md).

Safe first-error diagnostics and unverified post-run source validation passed independent review and the 700/700 offline gate. [Verification](../../openspec/changes/containerize-native-evaluation-execution/diagnostics-verification.md). A separately authorized native useful-task attempt loaded the full skill, then stopped on a later process-exit1; task/report incomplete, no collection or repeat, preserved host/source/history and verified cleanup. [Fresh attempt](../evals/results/2026-10-28-native-useful-task-r2/README.md). Next: offline executor request correlation; no new live budget. Full MVP, native useful-task, ZCode and human gates remain open.

The limited `0.1.0-alpha.1` and [landing page](https://warbr1ng3r.github.io/tibicen/) were published on 27 October 2026. Current acceptance and remaining full MVP, human/pilot and support limits are recorded in [release details](../RELEASING.md).

The bilingual landing was published on 28 October 2026 from [`31694d4`](https://github.com/warbr1ng3r/tibicen/commit/31694d4b234efc82064b8a1799f7a179a6541041): English by default, Russian at `ru/`. All 11 tasks, independent ponytail-review Ship, the full 688/688 gate and local browser checks are now supplemented by successful CI, Pages and live acceptance of EN/RU, equivalent commands/presets and no-JavaScript switching. [Implementation and publication evidence](../../openspec/changes/localize-and-simplify-landing/verification.md); the existing skill release is unchanged.

Project documentation uses canonical English files with adjacent Russian copies; links target the English documents. Detailed development tickets and private run records are maintainer-local records and are not included in this public source snapshot. Historical verification summaries retain their original scope and limits.
