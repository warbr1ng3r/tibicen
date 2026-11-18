Windows project checks and a concrete first-task handoff are now available in Tibicen 1.7.0. This compatible minor keeps persisted schemas, existing project scope and approval rules unchanged.

## Added
- Controlled Windows execution through system Windows PowerShell/.NET and a kill-on-close Job Object, with literal native arguments and a conservative batch-file subset.

## Changed
- One copyable first-task request carrying the actual working directory, reviewed applicable instruction paths and optional project memory. Existing useful native/custom instructions remain usable.

## Checks
- Public source: `6eef592d9638a063cb2b49c33fe4843e601956dd`. [Offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44331525617) passed.
- [All six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/44331426419) passed: macOS 15, Ubuntu 24.04 and Windows Server 2022 with Node 22.20.0 / 24.15.0. Windows runs execute both built skills and their CLI lifecycles.
- Local gate: 1,176 passed, zero failed, two expected skips. An earlier offline-fixture timing failure is retained; its focused check and final complete gate passed without a product-code change.
- Independent Ponytail review: Ship. All 114 payload hashes and 115 archive file hashes/modes checked.
- Two assisted synthetic first-use cases completed useful fresh-context tasks; controller application and explicit-reading assistance are disclosed. These are not native autoload, human approval, a human pilot or measured comparative benefit.

## Install / update
Use the complete immutable distribution at `d881334f638ccffa74bcc032a392451f5d5b8f52`:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/d881334f638ccffa74bcc032a392451f5d5b8f52 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Back up complete locally edited skill folders before replacement. Project memory, unrelated skills and host settings stay outside the replacement scope. See the [installation guide](https://github.com/warbr1ng3r/tibicen/blob/main/docs/INSTALLATION.md).

## Limits
Windows policy restrictions can make compilation/process control unavailable; no bypass or interpreter installation is performed. Temporary copies are not OS sandboxes. Native auto-loading across all harnesses, Windows ACL parity, causal memory benefit and human usefulness are not established. A shared explicit-reading route remains available to capable hosts outside the catalog. Published 1.6.0 tags and assets remain unchanged.

## Assets
- `tibicen-1.7.0.tar.gz`: SHA-256 `648bf3d2e06244f735690618f55b6358fa84c5518d3fc43efeb827c17e90577a`.
- `distribution-SHA256SUMS`: SHA-256 `089afd976d09b0e83c03a69eb9ea75a4c14a180284fcffd8b2c2e2a0e9b0e91e`.
- `SHA256SUMS`: checksums of those two assets.
