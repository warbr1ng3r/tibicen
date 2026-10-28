# Tibicen landing page

A separate static Astro workspace. Pages and components use `.astro`, client scripts use TypeScript, and styling uses Tailwind CSS with local styles. There is no React, shadcn, analytics, external font service or application server.

From the repository root, with Node 24 LTS:

```sh
pnpm install --frozen-lockfile
pnpm dev:site
pnpm typecheck
pnpm build:site
pnpm preview:site
```

The home page uses a flat graph with moving vertices. Alternative geometry is available in comparison mode at `?preview=geometry`.

The local address is http://127.0.0.1:8371/. Stop the development server on that port before using preview. Build output goes to `landing/dist/`.


## Languages and first use

The landing serves English at the configured base route (`/` locally, `/tibicen/` on GitHub Pages) and Russian at `ru/` (`/ru/` locally, `/tibicen/ru/` on GitHub Pages). The EN/RU links remain visible on mobile and work without JavaScript. Switching languages navigates to another static page and resets unsaved preset answers; it does not change the project's programming-language hint.

Both pages share one layout and components. Installation and both first prompts are together after the hero, followed by a compact workflow and a clearly illustrative before/after report. Source, release and installation/update/removal links target the canonical English project guides. The optional preset starts collapsed; inferable stack/type/agent hints are in advanced settings. Commands and serialized preset values remain identical between languages. No translation service or new dependency is used.

The bilingual iteration was published on 28 October 2026 from reviewed source [`31694d4`](https://github.com/warbr1ng3r/tibicen/commit/31694d4b234efc82064b8a1799f7a179a6541041); [CI](https://github.com/warbr1ng3r/tibicen/actions/runs/40689855224) and [GitHub Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/40690279699) passed. The [English](https://warbr1ng3r.github.io/tibicen/) and [Russian](https://warbr1ng3r.github.io/tibicen/ru/) pages are live. Public route/assets, equivalent commands/presets and no-JavaScript switching checks are recorded in the [publication receipt](../openspec/changes/localize-and-simplify-landing/verification.md#publication-28-october-2026). The existing skill release is unchanged.

## GitHub Pages

The [manual workflow](../.github/workflows/pages.yml) deploys the landing page separately. Skill publication, pilot results and support contacts are not prerequisites for hosting the page.

To redeploy reviewed code from the default branch:

1. In Settings → Pages, select Source: GitHub Actions.
2. In Actions, open **Deploy landing to GitHub Pages** → **Run workflow** and select the reviewed branch.
3. Wait for build and deploy; the URL appears in the **github-pages** environment. Check the home page, logo/license and preset download at that address.

The workflow gets origin/base from Pages, passes them to Astro and checks the built files before upload. It supports a project path and the root of a user site or configured domain. Push/PR does not trigger deployment; configure a custom domain separately in Pages. The package.json `homepage`/`repository` fields describe the package; the build uses Astro `site`/`base` parameters.

Equivalent local project-path checks from the repository root:

```sh
pnpm --filter @tibicen/landing build --site https://tibicen.invalid --base /repo/
TIBICEN_SITE_BASE=/repo/ node --test tests/site/*.test.ts
TIBICEN_SITE_BASE=/repo/ pnpm exec playwright test --config landing/playwright.config.ts --project chromium --grep "without JavaScript|Russian layout|equivalent English"
```

`tibicen.invalid` is an example origin for local checking, without publication or requests to it. Restore the ordinary build afterward with `pnpm build:site`. To inspect a project-path build, use preview with the same `--base /repo/` and visit `/repo/`.

The [landing page](https://warbr1ng3r.github.io/tibicen/) was initially published on 27 October 2026 from source [`e0f59a5`](https://github.com/warbr1ng3r/tibicen/tree/e0f59a55c7ce7581e402c3e270aa162fa1e0dc52); the [GitHub Pages run](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284) succeeded. Page publication does not close full MVP acceptance of the skills.

## AstroWind

Sections in `src/components/astrowind/` are adapted from [AstroWind](https://github.com/arthelokyo/astrowind/tree/14e1a691f80548dcc36370847b1a02c0d0b12821): `Features2`, `Steps2`, `FAQs`, `Headline` and `WidgetWrapper`. Widget composition, typed props, Tailwind grids and native details are retained. Unused variants, integrations and reveal animations were removed; Tibicen colors and prompt-copying were added. The full blog/CMS/analytics template was not imported.

The upstream MIT notice is preserved in `public/licenses/astrowind.txt` and linked from the page. The custom `ProjectPreview`, preset builder and background graphics remain separate Tibicen components.

## UI components and browser checks

AstroWind is not installed as a package; its adapted sections are stored in the repository. Five selection fields share `src/components/ui/Select.astro`, built on `@starwind-ui/astro/select` with local styles. The full Starwind template, styled registry, React and global theme are not included. `Field.astro` connects labels, descriptions and errors to each field. All answers remain in the browser.

The Starwind UI MIT notice is preserved in `public/licenses/starwind.txt` and included in the static build.

A pnpm patch in `patches/` pins changes to runtime 1.3.0: it removes `pointerdown` cancellation inside Select, which suppressed the following touch `click` in WebKit, and explicitly scrolls to the active option after keyboard navigation so Firefox does not clip it in a short window. Selection still uses the standard Select handler. Browser scenarios cover both cases; check whether the patch remains necessary before removing it during a Starwind update.

```sh
pnpm exec playwright install chromium firefox webkit
pnpm test:site
```

Checks serve the built page on port 8372 without stopping the development server on 8371. They cover mouse and keyboard selection, nine installation commands, errors and local preset downloads, JavaScript disabled, and widths of 320/390/768/1024/1440 px. Touch checks also run in Chromium and WebKit mobile emulation; Firefox skips that scenario because it lacks the required emulation. Chromium reference screenshots are stored in `e2e/controls.spec.ts-snapshots/`; update them deliberately with `pnpm test:site --update-snapshots` after reviewing the changes. Results and failure traces go into the ignored `test-results/landing/` directory. WebKit checks the engine and does not replace testing on a real iPhone.

Current references were recorded on macOS. Playwright uses separate references for another OS; generate and inspect them in that environment.

`e2e/responsive.spec.ts` checks the whole page at 31 widths from 280 to 5120 px, including media-query boundaries, four short windows, all FAQ answers, graph motion/pause, and layout at CSS viewports equivalent to 200% and 400% zoom in a 1280×900 window. This emulation checks layout and pixel density; it does not replace manually changing browser zoom. In the narrow illustration, explanations move below filenames and long menus scroll within their frame.

## Product installation and site development

Visitors install two ready-to-use skills from the separate version tag `v0.1.0-alpha.1` through skills 1.7.4 and npm, pnpm or Yarn 2+. Site source and dependencies are unnecessary. The tag and page were published on 27 October 2026 after Git delivery checks: full-SHA and tag installations matched all 86 distribution files, and resume/removal checks passed. Other agent choices remain experimental; alpha observations cover macOS, Node 24 and Codex.

Repository development uses pnpm 11.21.0, `pnpm-workspace.yaml` and one `pnpm-lock.yaml`. The version is pinned in the root `packageManager`. Enable pnpm with `corepack enable pnpm` or install the specified version separately. npm/Yarn examples on the page only select how to run the skill installer.
