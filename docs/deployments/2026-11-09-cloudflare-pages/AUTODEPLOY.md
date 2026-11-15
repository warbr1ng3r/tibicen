# Automatic deployment — 9 November 2026

The existing [tibicen.pages.dev](https://tibicen.pages.dev/) Direct Upload project now deploys automatically through GitHub Actions on pushes to `main`. A manual run is also available on `main`; other branches and pull requests do not publish.

## Configuration and authorization

The owner explicitly authorized committing and pushing only `.github/workflows/cloudflare-pages.yml` and the expected-origin change in `tests/site/site.test.ts`. Commit [`583c8ab`](https://github.com/warbr1ng3r/tibicen/commit/583c8abcb6535709a16a61a4ef093a3b3aac418e) contains exactly those two files, based on remote `main` at `714a148f73adce5c15c85d9e3ab42f4ce6514670`. It was prepared in an isolated worktree and pushed normally, without force or modifications to the concurrent dirty checkout.

The [workflow](https://github.com/warbr1ng3r/tibicen/blob/583c8abcb6535709a16a61a4ef093a3b3aac418e/.github/workflows/cloudflare-pages.yml) uses the existing pinned action SHAs, Node 24.15.0, pnpm 11.21.0 and frozen lockfile. It builds for `https://tibicen.pages.dev` with base `/`, runs all site unit tests with `TIBICEN_SITE_ORIGIN` set to that origin, then deploys through Wrangler 4.159.0. The test default remains compatible with the GitHub Pages build. Production deployments are serialized.

Repository Actions secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` were configured. Only the deploy step receives them. The account-owned token `tibicen-github-actions` grants Pages Write in the existing Cloudflare account, without other product permissions or an expiration date. Its value was transferred directly into the secret without being returned in tool output or written to a file. Rotate/revoke it in Account API tokens; replace the GitHub secret when rotating. GitHub workflow permissions are `contents: read`; checkout credentials are not persisted.

Cloudflare documents external CI for existing Direct Upload projects in its [official guide](https://developers.cloudflare.com/pages/how-to/use-direct-upload-with-continuous-integration/). The site was not recreated and the original hostname was retained.

## First automatic deployment

- [Run 42662867174](https://github.com/warbr1ng3r/tibicen/actions/runs/42662867174) was triggered by the push, completed successfully, and deployed the authorized commit. It ran on 9 November, 20:15:37–20:16:14 Europe/Moscow.
- Cloudflare production deployment: `d5c3b5b7-98f3-40e7-bc36-c67014bc05ca`, [deployment URL](https://d5c3b5b7.tibicen.pages.dev/).
- All 22 public file responses returned HTTP 200 and matched SHA-256 hashes of a local build of the exact published commit. See the [manifest](autodeploy-artifact.json) and [receipt](autodeploy-public-files.json). All four routes are included.
- Before publication, the changed test passed all 65 site tests against both origins, with focused ESLint, Prettier and whitespace checks. The first real workflow validated the deployment CLI and configured credentials.
- The separate general CI run 42662867176 was last observed in progress. Later API requests and browser navigation timed out, so its final result is not claimed. The Cloudflare deployment run has an independently confirmed success result.

The optional prepublication local Wrangler help command failed on npm DNS resolution; its CLI execution was not claimed as verified. The successful GitHub deployment supersedes that local environment limitation. Existing browser golden differences remain documented in the [initial deployment report](README.md); no page behavior changed in this automation commit.

No skill release, GitHub Pages deployment, domain purchase, paid plan or unrelated local change was published by this work. The paired guides and deployment evidence remain local documentation changes, outside the explicitly authorized two-file commit.
