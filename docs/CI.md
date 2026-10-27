# Offline CI

The [workflow](../.github/workflows/ci.yml) runs on pull requests, pushes to main and manual dispatch using Ubuntu 24.04, Node 24.15.0 and pnpm 11.21.0 from package.json. Feature branches without a PR use local checks or manual dispatch. Actions are pinned to full SHAs; check the corresponding official action.yml and local commands when updating them. Permissions are limited to `contents: read`, and checkout does not persist credentials.

The push [branch filter](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#onpushbranchestagsbranches-ignoretags-ignore) avoids a second run for a feature-branch PR update; the merged main tree still receives its own check. A [concurrency group](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency) cancels outdated runs of the same workflow and ref. Different PRs and the Pages workflow remain independent.

After `pnpm install --frozen-lockfile`, it runs:

1. `pnpm test`: lint, formatting, all type checks, the site build, strict OpenSpec validation, standalone resources and all Node tests.
2. Unpacking both distributions into a temporary directory outside the checkout, verifying SHA256SUMS and running each CLI self-test with an empty PATH.

The harness uses offline fixtures and fake drivers. The workflow supplies no secrets, calls no models and does not run `eval:external`. Installing dependencies still requires access to the package registry and Actions/Node/pnpm downloads; “offline” describes the product checks and model execution.

Browser acceptance remains the separate `pnpm test:site` command. Current reference screenshots were recorded on macOS; this Ubuntu workflow does not establish Linux screenshot, all-platform or live-agent acceptance.

On 27 October 2026, source snapshot [`e0f59a5`](https://github.com/warbr1ng3r/tibicen/tree/e0f59a55c7ce7581e402c3e270aa162fa1e0dc52) was published. A clean local copy passed 668/668 tests and the build; the [first main CI run](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480) succeeded on Ubuntu. The separate manual [Pages workflow](../.github/workflows/pages.yml) also [succeeded](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284), and the [site](https://warbr1ng3r.github.io/tibicen/) is live. These results cover the stated offline checks; full platform and live-agent acceptance remain open.

Both `pnpm test` and `pnpm test:evals` build standalone resources before Node tests, so a previous ignored `dist/` is unnecessary. The pinned OpenSpec development package fingerprint excludes only generated package-manager launchers in `node_modules/.bin`, retaining checks for all other files and observed effects.

The workflow reuses the site and standalone builds produced by `pnpm test`; a second `pnpm build` is unnecessary. All existing Node tests remain in the gate. Changes to package.json must preserve those build prerequisites. A measured GitHub duration improvement requires a run after publication of this workflow.
