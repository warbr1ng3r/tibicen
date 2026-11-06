# Verification — simpler first use

Date: 6 November 2026. Local acceptance snapshot below; subsequent source publication and Pages delivery are recorded in Publication.

## Result

The approved five-point packet is complete. Home has one recommended pinned npx command, native optional alternatives, two first-request choices, one complete illustrative case at a time and a secondary preset link. `/preset/` and `/ru/preset/` reuse the local builder and preserve page kind when switching languages. Material prerequisites, Windows command limits, explicit approval and honest illustration limits remain visible or available in the named disclosures. The unused Steps component and installer select initialization were removed. No dependency or product version changed.

## Checks actually run

- Node `24.15.0`, pnpm `11.21.0`.
- `pnpm test`: lint, formatting, core/Astro types, site build, all current/archived strict OpenSpec checks and offline Node tests passed: **900 passed, 1 existing opt-in standalone skip, 0 failed**. The optional standalone matrix was not launched for this site-only packet.
- Site checks: **57/57** at `/`, **57/57** at `/tibicen/`, and **57/57** after restoring the final root build. These include four static routes, local assets/anchors, exact commands, independent home copying and disabled native form submission.
- Full Playwright suite in Chromium, Firefox and WebKit: **101 passed, 1 existing Firefox touch-emulation skip** at each base (`/` and `/tibicen/`). Coverage includes keyboard and native example selection, both languages, no-JavaScript reading/switching/form refusal, validation, identical local preset downloads, clipboard failure, privacy, 31 widths (280–5120 px), short windows, zoom-equivalent viewports and reduced motion.
- The first browser run had six expected screenshot mismatches after moving the builder (95 passed, 6 mismatches, 1 skip). All six actual/difference images were inspected before updating their Chromium references; the subsequent full runs passed without relaxed tolerances.
- After the full repository gate, the FAQ heading wording and excessive inner-widget spacing received small final corrections. Focused ESLint/formatting, the complete project-base browser suite and both-base site checks validated those corrections; unrelated core tests were not repeated.
- All four final routes were rendered at 1440×1000 and 390×1000, with no JavaScript errors or horizontal overflow. Home has zero forms and exactly one visible example. Final images were inspected; local screenshots and measurements are under `/tmp/tibicen-landing-first-use-20261106/` and are supplemental local files, not published evidence.

The English desktop home measured **3982 px** high, versus **5497 px** in the same-size published-page observation from the [research](../../../docs/research/2026-11-06-landing-installation-review/README.md): about 28% shorter. Russian measured 4011 px; mobile homes measured 5353/5576 px (EN/RU). These are layout observations, not measured conversion or human-usefulness gains.

## Review

Independent Ponytail review traced all changed source, connected tests/guides, local-only validation/download, four-route navigation and installer identity. Earlier cross-lane review caught a missing baseURL in a newly created no-JavaScript test context; it was fixed before the successful suites. Final review found only a stale FAQ disclosure name; both languages were corrected and rechecked. Verdict after fixes: **Ship**. Final independent review did not claim its own browser run; the integrator owns the results above.

## Frozen boundaries

The command still uses `skills@1.7.4`, distribution `7b3b08f58276034b1609e44ef393e5f7c0e01a1b`, global universal copy installation and both complete skills. All **100 payload files** plus the manifest (**101 total**) were verified after the build. `dist/SHA256SUMS` SHA-256 remains `ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef`, matching published 1.4.0. Core/runtime, skill sources/references, package versions, lockfile, maintenance records and previous release artifacts have no changes.

## Limits and handoff

This packet has not changed the public site or performed a real installation, paid-model call, native-host acceptance, security audit or human study. The running local preview is `http://127.0.0.1:8371/` (Russian at `/ru/`). Commit, curated public-source push and the separate Pages deployment remain later publication actions; the repository's private history must not be pushed wholesale. No new skill release is needed for these site changes. All six [tasks](tasks.md) and four [tracker tickets](../../../.scratch/landing-first-use/dashboard.md) are complete.

## Source handoff

After local acceptance, the owner authorized preparing a commit and pushing this checked packet. The handoff preserves private omissions and public history. This does not authorize the separate Pages deployment or create a new skill release; network delivery and CI outcomes are recorded separately from the local observations above.

## Publication

The owner subsequently authorized the source push and explicitly requested the site update. Public source [`a6d54bc`](https://github.com/warbr1ng3r/tibicen/commit/a6d54bc6901bbf212cbfd889385d77b82e4b2f4f) passed [CI 42154948265](https://github.com/warbr1ng3r/tibicen/actions/runs/42154948265). Existing [Pages workflow 42156035977](https://github.com/warbr1ng3r/tibicen/actions/runs/42156035977) built and deployed that exact source successfully; the one-line dispatcher source binding passed independent Ponytail review and invoked no release/maintenance mutation.

Post-deploy Chromium checked the four public routes (`/tibicen/`, `/tibicen/ru/`, `/tibicen/preset/`, `/tibicen/ru/preset/`) at 1440×1000 and 390×1000. Checked one default command/closed alternatives, one native-switchable example, locale/page-kind navigation, expanded builder, no horizontal overflow and two identical 204-byte preset downloads (SHA-256 `0b53cd3165875f98327843dc4524ff7e115e3e458a31f4f3fd8603563f38122e`). Both no-JavaScript language flows passed, including disabled form controls. The monitored desktop/mobile JavaScript pass had no page errors, HTTP error responses or unexpected external/non-GET requests. Rendered pages were inspected. The first live-check attempt stopped on a fieldset-specific Playwright matcher assertion; the disabled attribute was present, the assertion was corrected and the failed local receipt retained before the successful rerun.

Live checks used normal TLS with a fixed GitHub Pages hostname resolution. They did not download the official Actions artifact, establish full returned-byte equality, install skills or repeat the offline/platform matrix. The deployed maintenance index and frozen 1.4.0 distribution were not changed by this packet.
