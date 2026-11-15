# Cloudflare Pages deployment — 9 November 2026

The owner-authorized static landing is live at [tibicen.pages.dev](https://tibicen.pages.dev/), published through Playwright MCP using Cloudflare Pages Direct Upload on the free plan. At the first upload, Git integration and deployment automation were not configured. [Automatic deployment](AUTODEPLOY.md) was added and verified later the same day.

## Delivery

- Tracked source: `57a491a4b0a232984d871e18b41f785513c879ca`, extracted with `git archive` into an isolated copy, excluding concurrent dirty skill/harness changes.
- Node 24.15.0, pnpm 11.21.0, frozen repository lockfile; dependencies installed from the local store.
- Build: `pnpm --filter @tibicen/landing build --site https://tibicen.pages.dev --base /`.
- Payload: 22 public files, 506,196 uncompressed bytes. ZIP: 149,395 bytes; SHA-256 `19805d87cf68df9851f130c6ce31d1ab9067efee0a87415a29e2631ebe1b531a`.
- Deployment: `ba167afd-f446-410d-8cd6-111b2c102337`; [deployment URL](https://ba167afd.tibicen.pages.dev/). Cloudflare confirmed production deployment.
- All 22 public responses returned HTTP 200 and matched the build SHA-256 hashes. See the [build manifest](artifact.json) and [public-byte receipt](public-files.json).

The four routes are `/`, `/ru/`, `/preset/` and `/ru/preset/`. Canonical, Open Graph image/URL and language alternate URLs were checked against the new origin. Installation still pins published 1.5.4 distribution `381c5d53972b53d60e9a134ec7f620bb7c35e6be` through skills 1.7.4. The existing GitHub Pages site and maintenance channel were retained.

## Verification and limits

- Site unit suite: 65/65 passed against the default-origin build, then 65/65 against the Cloudflare build after changing only the expected origin in the disposable test copy.
- Chromium suite: initially 30/35. Three tests expected the old 1.4.1 distribution SHA; those three passed after updating the expectation in the disposable copy. Repository tests were not changed.
- Two mobile screenshot comparisons still differ from their goldens. Both failures also reproduce on the default-origin build: actual 390 px images are pixel-identical between origins; actual 320 px images differ by eight pixels. Goldens were not updated. The unmodified full browser suite is not reported as passing.
- Public browser checks passed at 390 px: both languages' home-to-builder navigation, valid local `preset.yaml` downloads, language switching preserving the builder route, no horizontal overflow, no page errors, and no requests carrying the synthetic preset answer.
- Initial public navigation timed out; subsequent browser and HTTP checks passed. These checks do not establish availability from every network or Google indexing.

Only static files were uploaded. No product code, release artifacts, credentials, GitHub settings or existing Cloudflare projects were changed. No commits were created. The exact uploaded ZIP and test adaptations were reviewed; after the baseline comparison the final Cloudflare payload was restored and all 22 local hashes rechecked.
