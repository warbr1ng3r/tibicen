# Verification

Local implementation checked on 28 October 2026, in the working tree after `520a998`. This is not a commit or public deployment receipt. Both static routes share one layout; the published alpha skills and release tag/assets are unchanged.

## Delivered behavior

- English at the configured base, Russian at `ru/`, with visible EN/RU links and no automatic locale redirect. Both work without JavaScript; page navigation resets unsaved form answers.
- Localized page/component/accessibility/noscript text, metadata, validation and copy/download feedback. Page language never populates the project's programming-language hint.
- Installation and both first prompts together after the hero; one compact workflow and a visibly illustrative before/after/report. The optional preset remains collapsed, with inferred hints under advanced settings.
- Real source/release/English documentation links and tested/experimental/platform scope. Installer tokens and preset schema/data are unchanged; no new dependency, analytics or service.

## Checks

| Check | Observed result |
|---|---|
| Site build and types | Both routes built; typecheck has 0 errors/warnings, with existing deprecated clipboard fallback hints |
| Site unit checks | 33/33 at root and 33/33 at `/tibicen/`; includes 16 pure localization/invariance checks |
| Three browser engines | 74 passed, one intentional Firefox mobile-touch emulation skip; no assertion was removed or relaxed |
| Tiny-window menu regression | All 12 cases passed: four low-height viewports × Chromium/Firefox/WebKit |
| Project-base browser smoke | 3/3 Chromium scenarios at `/tibicen/`: no-JavaScript switching/privacy, RU responsive switch, byte-identical local downloads |
| Visual inspection | EN/RU desktop 1440×1000 and mobile 390×844; six existing Chromium references deliberately updated and reviewed |
| Full pnpm test gate | Passed lint, formatting, types, site build, strict specs, distribution build and 688/688 offline tests (0 failures/skips) |
| Distribution preservation | All 86 files match the prior alpha inventory and SHA-256 |

The normal root build was restored after project-base checking. The configuration uses the same TIBICEN_SITE_BASE variable for Astro preview and browser checks; normal builds still default to `/` and Pages can supply `--base`.

## Review and repair

Independent ponytail-review traced both routes, base links/assets, component and assistive text, all validation branches, clipboard fallback, download privacy, data/command invariance and support claims. Verdict: Ship.

Browser acceptance exposed a real WebKit menu collapse after hints moved into advanced settings. The existing Select's inline height can become stale after focus scrolling changes placement. An initial broad CSS override regressed other engines and was rejected. The final small fix keeps the existing placement/upper limits and reserves one option: popup minimum 56px, list minimum 44px. The original regression and all 12 low-height cases pass; final independent review accepted this fix. No package/runtime patch or lockfile change was required.

Private logs, failure evidence, screenshots and reviewed probes remain under the maintainer-local evidence collection; none are public artifacts. The final browser log is `playwright-final.log`; rejected attempts have separate retained logs.

## Limits

Physical devices and browser versions outside the configured engines were not checked. No new live model/API evaluations, commit, push, skill release or Pages deployment were performed. Local landing checks do not expand the product's verified agent/platform or human-benefit claims.
