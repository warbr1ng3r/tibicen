# Verification — 27 October 2026

## Implemented

Push checks are limited to main; pull_request and workflow_dispatch remain. Concurrency cancels outdated runs for the same workflow/ref. The repeated pnpm build step is removed; pnpm test still performs all prerequisite builds and every existing test before the unchanged distribution smoke step.

## Evidence

- Static YAML/script checks: PR, main, manual, feature-push and tag-push selection reviewed against GitHub's documented filters. Permissions, action pins, package scripts and all remaining job steps are unchanged. This is configuration validation, not observed GitHub event execution.
- Initial pnpm test: 667/668, one failure, 79.066s locally. The descendant-timeout fixture stopped at boundary preflight under its 600ms startup allowance, yielding launch/setup skips before any model session. This initial failure is retained.
- Controlled reproduction: injecting 700ms boundary startup delay yields the same skips at launchMs600; using the normal fixture launchMs3000 reaches the intended setup error. The existing test now inherits that startup allowance, retaining setupMs/taskMs800 and all exitCode0/timedOuttrue assertions. Its isolated run passed.
- Final pnpm test: 668/668, zero failures/skips, 82.839s locally. Lint, formatting, types, site build, strict current/archived specs and standalone build passed.
- The unchanged workflow smoke script ran directly after pnpm test, without a second build: 86/86 checksums and both unpacked CLI self-tests passed outside the checkout with empty PATH. Distribution inventory equals the frozen published alpha inventory, SHA-256 `35f743a56b47e4f25743da5d6b6a1e606fb719b3382372384124094711e1b2dc`.
- Independent workflow/doc review and timeout-fixture follow-up: Ship, no actionable findings. No test case was removed. Product/runtime and dependencies are unchanged.

Raw logs, controlled startup-delay reproduction, static proof and review are maintainer-local in `.evals-private/ci-dedup-20261027-r1/`.

## Limits

At the local verification checkpoint, this change was uncommitted and GitHub/Ubuntu event delivery, actual cancellation and new remote durations were unverified. The owner subsequently authorized final review, fixes, commit and publication on 27 October 2026. Local durations are not a before/after GitHub speed comparison. The earlier push158s/PR157s and repeated-build13s measurements describe the previous published workflow. Heavy-fixture caching and selective gates remain outside this bounded optimization. No model/auth/API runs were performed. Publication evidence is recorded after the actual run.

New planning records use English according to the owner's later documentation-language instruction, which takes precedence over the older Russian-language hint in OpenSpec context.

## Publication and remote CI

Final ponytail-review: Ship, no actionable findings. Local implementation commit `5e8f336a8333d42cc5e14d351c6a9010fc5e4761` was followed by public main commit [`63b5f36ff34abcb96ab104235467b7bdd3d22299`](https://github.com/warbr1ng3r/tibicen/commit/63b5f36ff34abcb96ab104235467b7bdd3d22299). The public delta contains 14 files and preserves the existing privacy edits. Anonymous fetch verified all 448 source files against the reviewed manifest; the alpha tag still resolves to `db03ebc988af1e38ea9f62c02027945ba40660fc`.

The new push-triggered [Ubuntu CI run](https://github.com/warbr1ng3r/tibicen/actions/runs/40502875998) succeeded. Both the full offline gate and unpacked-distribution check passed, and the separate build step was absent. Observed elapsed time: 151s including queue/setup/cleanup; the checks job took 146s and its full offline gate took 124s. These are one-run observations, not a controlled speed comparison. PR event delivery and concurrency cancellation remain unexercised.

Run/job status, timing, final review and exact-source proof are maintainer-local under `.evals-private/ci-dedup-20261027-r1/publication/`. The published alpha artifacts and product/runtime were not changed.
