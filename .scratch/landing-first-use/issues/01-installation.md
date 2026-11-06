# One recommended installation

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

The owner approved the bounded [change](../../../openspec/changes/simplify-first-use-landing/tasks.md). Allowed paths: Installation.astro, scripts/install.ts and tests/site/install.test.ts. Keep exact executable semantics; delete obsolete installer select mount.. No dependency/runtime/public action changes. Work starts from the completed design; parallel file ownership must not overlap. No commit/push or published version change.

## Answer

Implemented the single pinned npx command with its existing copy target and no runner selector. Native closed “Other installation methods” contains complete pnpm/Yarn commands, independent copy buttons and the canonical manual/archive guide. Both languages remain statically readable; version, full distribution SHA, skills@1.7.4, global/universal copy semantics and both complete skills are unchanged. Removed obsolete mountInstallation and its only caller/import.

Checks: the command-equality test passed (1/1); targeted ESLint, Prettier and git diff whitespace checks passed. Added EN/RU built-page checks for one primary command outside the closed disclosure, complete alternative commands/copy targets and manual guidance without JavaScript. Those two checks await root's integrated site build; no competing build, commit, dependency or runtime changes were performed.
