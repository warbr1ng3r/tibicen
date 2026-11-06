# Design

## Context

See [proposal](proposal.md). Landing currently owns the whole document, installation mounts a custom select, and app.ts assumes a preset form exists. Examples render two six-step cards side by side. Preset logic already has local validation and no-server safeguards.

## Goals / Non-Goals

Keep one continuous first-use path with the accepted pinned command. Preserve both task meanings, complete illustrative evidence, all material limits and offline/static operation. No runtime change, release-version bump, dependency, new installer or automatic task router.

## Decisions

- Keep installationCommand(manager) as the single command generator, render npx by default and native details for the other two commands. Delete the obsolete selector mount rather than introducing new state.
- Share the actual document/header/footer in SiteLayout.astro between home and a small PresetPage.astro. Interface: locale plus optional preset:boolean; main/skip/copy-status/live feedback belong to the shared layout. Native language links preserve page type. This avoids two diverging copied documents.
- New routes: /preset/ and /ru/preset/, respecting the configured base. PresetForm receives an expanded flag for the dedicated page. Keep disabled submission until its existing local handler initializes; guard its missing form after installing copy handlers.
- Use native radio inputs for mutually exclusive illustrative cases, with scoped CSS and visible labels/focus. Both cases retain their actual six logical stages; compact prose and optional tree/diff details reduce height. No new tabs library or JavaScript state.
- Root owns Landing.astro composition/global.css/existing site/E2E tests. Installation lane owns Installation.astro/install.ts/install.test.ts. Example lane owns InteractionExamples.astro and its focused unit test. Preset lane owns SiteLayout.astro/PresetPage.astro/new routes/PresetForm.astro/app.ts and its focused unit test.

## Risks / Trade-offs

Moving the form exposes old null assumptions -> initialize copy independently and browser-check both page types. Existing anchors and mobile controls can regress -> retain home #start/#result/#faq and a secondary #preset link; test four routes under / and /tibicen/. Examples can lose user control -> preserve approval and truthful illustration labels. Site-only changes do not change the immutable 1.4 skill assets.

## Migration Plan

No project or schema migration. Build the static site normally; published Pages requires a later explicit commit/push instruction. Old /#preset remains a visible link to the separate builder. Full delivery/runtime identities stay unchanged.
