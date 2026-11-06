# Tibicen 1.4.1

A one-line proposal edit now shows the relevant lines with up to three lines of
context. All changes remain visible in one combined hunk. This compatible patch
preserves complete approved content, hashes, permissions, line endings and
existing approved plans. Persisted schemas and write/approval scopes are unchanged;
there is no migration, new dependency or automatic project update.

## Install or replace

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/52c0769574e90d7d1a0438996df9da40621b0107 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Back up complete locally edited skill folders before explicit replacement.
Replacing Tibicen does not run adopt or change project infrastructure.
[Installation and recovery](https://github.com/warbr1ng3r/tibicen/blob/main/docs/INSTALLATION.md).

## Checks and limits

- Frozen candidate `1.4.1-candidate-01`: 100 payloads / 101 archive files.
- Versioned local gate: 930 passed / one default manual skip; separate standalone lifecycle 3/3.
- Both bundled CLIs passed focused preview/full-byte apply checks and applied genuine published-1.4 proposals byte-for-byte unchanged: four cases, 22 successful CLI calls.
- Local and actual public full-SHA installation, 1.4→1.4.1 replacement, repeat, full edited-backup restoration/removal and preservation passed independent engineering review.
- [Exact-source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42168629099) and all six [platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/42168790859) passed on the source below.

The first local gate retained an offline preflight failure; its precise original
cause remains unproven. Narrow and full-file checks, a separate full gate and
public CI passed without changing source assertions or timeouts. An initial
private acceptance checker omitted the planned local usage file; its separately
reviewed correction passed. Both original failures remain in the
[paired release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-06-release-1.4.1/README.md).

These are mechanical, synthetic technical observations. They do not establish
native host/model loading, MCP activation/connection or measured human benefit.
Windows project-command launch remains unsupported; read-only operations remain
available. Trusted installer Git children have ordinary OS permissions.
Earlier assisted working-session observations retain their original 1.4.0 scope.

## Exact release bindings

Source: `319845f1f1597817807c81579b42250a1f189e7d`. Distribution/tag target:
`52c0769574e90d7d1a0438996df9da40621b0107`. Tag: `v1.4.1`.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `tibicen-1.4.1.tar.gz` | 265489 | `c3302cf25284120d009ee7b01c9044cdc0193c8c658597e0f24fe7e65233dcb8` |
| `distribution-SHA256SUMS` | 10428 | `1ddbe0968918ac22469dbe3c0d8cd8f85c8d23910d2f623451957f804a4238fd` |
| `SHA256SUMS` | 177 | `23c4ccc8243d2936a1e2782922fa17991cc4f8e182047c7d5f78e711e4ee2d6c` |

Returned assets and the separate Pages deployment/body comparison are recorded
after publication in the release report. Earlier published versions are preserved.
