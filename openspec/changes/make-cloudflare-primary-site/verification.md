# Verification — 9 November 2026

## Candidate and authorization

Prepared in the isolated `codex/cloudflare-primary` worktree from published main `583c8abcb6535709a16a61a4ef093a3b3aac418e`. The owner approved the migration and deployment. The previous commit grant named only two automation files; this migration has not been committed or published and requires its own scoped commit grant under AGENTS.md.

## Completed preparation checks

- Exact `pnpm test`: lint, formatting, core/Astro types, default Cloudflare-origin static build, strict active/archived OpenSpec validation, skill build and offline Node tests passed. Total 1084: 1083 passed, zero failed, one existing manual skip. Node tests took 102.377 seconds. Astro retained two existing deprecated-execCommand hints, with zero errors.
- The required `pnpm build` also passed after restoring the default Cloudflare build.
- Four focused redirect tests passed. They check the four fixed destination routes, language, canonical, immediate HTML fallback and actual inline-script behavior with a query containing an external URL; destination origin stays Cloudflare.
- Real Chromium through Playwright MCP passed all eight local navigation cases (four routes with JavaScript and four without). With JavaScript, query and fragment survived. Cloudflare destinations were fulfilled with a minimal test page to isolate redirect behavior; these are local browser observations, not public deployment acceptance.
- The exact shell assembly block from the Pages workflow produced exactly five files, all identical to the browser-tested artifact. The JSON is copied directly and compared with `cmp` before upload.
- Explicit alternate origin `https://tibicen.invalid` and base `/repo/` built successfully; all 69 site tests passed with matching expected environment values. This hostname is a local test origin and was not contacted.
- The existing public GitHub Pages index returned HTTP 200 directly as application/json, 17,856 bytes, SHA-256 `0548a67abc264d0f1cc4885977fc04c15ed32a06c4ed4854adc1dc6e2162f6eb`. Source and assembled JSON match these exact bytes. Channel identity and published records were not modified.
- The reviewed diff changes only site entry/metadata, compatibility HTML/workflow/tests, paired current guides and this OpenSpec change. No runtime/skill/release files or dependencies change. Historical publication links remain as dated evidence.

The Russian specification translation is at [spec_ru.md](spec_ru.md), outside the parser's `specs/` tree because OpenSpec accepts only each capability's canonical `spec.md` there. The canonical delta remains [specs/landing-experience/spec.md](specs/landing-experience/spec.md).

## Publication acceptance — pending

After a scoped commit grant: push the candidate, confirm Cloudflare and general CI, dispatch **Publish legacy redirects and checksum index** on main, then verify all four public legacy navigations and direct unchanged JSON. No public migration success is claimed by the preparation checks above.

The compatibility pages use static HTML navigation and return HTTP 200; this does not claim configurable HTTP 301 support. [Google documents instant meta-refresh redirects](https://developers.google.com/search/docs/crawling-indexing/301-redirects); [GitHub documents custom Pages artifact workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages). Google indexing/traffic is not established by deployment checks.
