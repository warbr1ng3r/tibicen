# Secondary bilingual preferences

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

The owner approved the bounded [change](../../../openspec/changes/simplify-first-use-landing/tasks.md). Allowed paths: SiteLayout.astro, PresetPage.astro, /preset and /ru/preset page sources, PresetForm.astro, scripts/app.ts and optional focused preset-page unit test. Shared interface locale plus optional preset:boolean; common main/skip/copy-status. Guard missing form after copy initialization. Work starts from the completed design; parallel file ownership must not overlap. No commit/push or published version change.

## Answer

Implemented the shared [document layout](../../../landing/src/components/SiteLayout.astro),
[secondary page](../../../landing/src/components/PresetPage.astro) and EN/RU routes
at `/preset/` and `/ru/preset/`. Main navigation returns to the corresponding
language's home anchors; language links preserve page kind and configured base.
The page opens the existing form through `expanded`; disabled fieldset/submit,
local-only validation/download and no-JavaScript guidance are retained. Shared
copy behavior initializes before the form guard in
[app.ts](../../../landing/src/scripts/app.ts); background behavior stays home-only.

Added [four static-route checks](../../../tests/site/preset-page.test.ts) for
expanded/disabled form behavior, language/base navigation and shared exits.
Focused ESLint, Prettier and diff whitespace checks passed. Astro check reported
one concurrent home integration error (`FAQs` was passed an unsupported `locale`
prop); the root integrator was notified. Rendered-route and browser checks await
the root's integrated build; no successful browser run is inferred here. No
runtime, published version, dependency, commit or public site was changed.
