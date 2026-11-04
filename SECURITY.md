# Tibicen security

Tibicen limits its own operations to the exact approved plan. Files, presets, state, network responses and probe output are data; they do not authorize execution or establish user consent.

## Boundaries

- No writes, installation or third-party execution before approval. Autopilot affects the interview, not permissions.
- Affected files are checked again by hash and path. Symlinks, paths outside the project and forbidden paths stop the operation. Original versions are saved before writing; other people's changes are never silently rolled back.
- Project commands run without a shell, with literal argv and a minimal environment. Secret variables are not inherited automatically; explicitly permitted secrets are removed from reported output. The manifest contains no full command logs.
- Commits, publication, push, prune and migrations are not performed. Dependency installation is permitted only in an approved new scaffold, with `--ignore-scripts`.
- JSON configurations with detected inline secrets are not rewritten; their values are not displayed. An environment variable's name and availability in the required context are distinct from its value and from availability in another process.
- Provenance, SHA, license and blocklist are checked during selection and before installation. A repeat run or resume checks saved components' eligibility again. The injection scanner is a heuristic, not an audit of third-party code.

A temporary copy and a worktree are not sandboxes. Trusted project code or a third-party agent runs with the user's permissions; execution requires separately disclosed code, environment and trust. If controlled execution or a reproducible environment is unavailable, the check is skipped with a reason.

On POSIX, the runner controls a separate process group: timeout or cancellation terminates it, with forced termination after one second, even if the parent has already exited or a descendant keeps output open. This controls trusted processes; it does not isolate hostile code. On Windows, commands do not start until descendant control is verified (`process-tree-unavailable`). Local acceptance was performed on macOS; it does not automatically establish Linux/Windows acceptance.

## Advisories and blocklist

The versioned list of blocked repositories/SHAs is in `references/blocklist.json`. It is currently empty; that does not establish the safety of all other sources. Changes are delivered through distribution updates. Unavailable information is not presented as a fresh check.

The public [warbr1ng3r/tibicen](https://github.com/warbr1ng3r/tibicen) repository, limited [0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) and [landing page](https://warbr1ng3r.github.io/tibicen/) were published on 2026-10-27; the advisory/checksum channel is defined as a separately committed Pages artifact/publication on a distinct HTTP origin, with shared GitHub administration. On 4 November 2026, [Pages deployment](https://github.com/warbr1ng3r/tibicen/actions/runs/41782942576) from site source `5f8b7dcaae6c1f93b96583c7348903c1efd2dc45` succeeded and all 18 returned HTTP 200 bodies matched the clean production build; see [MAINTENANCE](docs/MAINTENANCE.md). `dist/SHA256SUMS` helps verify build contents; a file next to the distribution does not by itself establish independent provenance.

A bug report needs only the Tibicen version, agent, OS and a minimal anonymized reproduction. Do not include tokens, private project content or full logs containing secrets.

Core/adapter maintainer and private security-report recipient: [@warbr1ng3r](https://github.com/warbr1ng3r), confirmed by the owner on 31 October 2026. Use GitHub's [Report a vulnerability](https://github.com/warbr1ng3r/tibicen/security/advisories/new) form for private security reports. Private vulnerability reporting was enabled and verified on 31 October 2026.

Source review follows the [maintenance procedure](docs/MAINTENANCE.md); the [3 November review](docs/evals/results/2026-11-03-maintenance-review/README.md) records sources, actual metadata checks and remaining limits.

The [code of conduct](CODE_OF_CONDUCT.md) replaces the former unfulfilled general private conduct-contact promise: nonsensitive project matters are public; private GitHub Support reports cover GitHub platform rules, and private vulnerabilities use the unchanged recipient above. No general private conduct inbox or alternate is appointed. Public reporting routes were reachable; private anonymous routes required sign-in and the owner could access the form. No report was submitted and notification delivery remains untested. The Pages channel deployment and returned bytes are verified within the scope recorded in the maintenance guide. Other release inputs are listed in the [release procedure](docs/RELEASING.md); ordinary changes follow [CONTRIBUTING](CONTRIBUTING.md), and participation follows the [code of conduct](CODE_OF_CONDUCT.md).

The first limited alpha prerelease was approved separately and published; it does not complete the full MVP or maintenance requirements. Send sensitive vulnerability details through the private route above, not public issues.
