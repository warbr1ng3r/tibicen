# Tibicen 1.3.0

Tibicen can be used through explicit skill-file reading in a host that can read project files and run the required Node operations. Your host chooses the model and provider; Tibicen adds no model account, API client or model allowlist.

## What's new

- A single explicit `universal` installation route and complete manual archive installation. Both skill folders keep their scripts and references together.
- A common project `AGENTS.md` and optional memory route when sufficient. Required access/activation gaps are reported separately from unavailable optional native probes.
- Custom harness hints in core and the browser form: up to sixteen distinct valid IDs, including tools outside the catalog, with accessible EN/RU errors.
- Thirteen descriptive harness profiles and a read-only `harnesses` command. Broader instruction/memory recognition does not expand automatic write permissions or native adapters. Practices keeps its overall six-HTTP-attempt budget.

## Install or replace

Back up both complete installed skill folders outside the installation directory if they contain local edits. Explicit reinstallation replaces those folders; it does not merge local edits or update project instructions in the background.

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/b61a19583dc91ee9e3e795250d733d2cc99e6569 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

In a project session, ask your agent to read `~/.agents/skills/tibicen-init/SKILL.md` and follow it; use `tibicen-adopt/SKILL.md` to review existing setup. Expand `~` if your host needs an absolute path. Keep `--agent universal` explicit. For a chosen directory, download the full archive, verify the checksums and keep both complete skill folders. See [installation, loading, backup, recovery and removal](https://github.com/warbr1ng3r/tibicen/blob/797b96e5306da77e8acc54a28c8a6a8e85b3cfd7/docs/INSTALLATION.md); that immutable source guide still records the prior published 1.2 pin, so use the exact 1.3 command and asset table in these notes for this release.

## Compatibility and limits

This is a compatible minor release. Existing persisted schemas and memory/recovery formats are unchanged. Older runtimes can reject new optional harness hints; remove only those added hints before opening the preset in 1.2. Updating Tibicen does not approve changes to an existing project.

A catalog entry or successful installation does not establish native discovery, automatic loading or compatibility with every host/model. Self-tests check resources; source-assisted reasoning cases are not native-loading observations. Windows project-command execution remains unsupported; read-only operations are available. Human benefit and comparative effort savings remain unmeasured. Earlier failed, withheld and assisted observations keep their original scope.

## Exact release identity

- Source: `797b96e5306da77e8acc54a28c8a6a8e85b3cfd7`.
- Distribution / tag target: `b61a19583dc91ee9e3e795250d733d2cc99e6569` / `v1.3.0`.
- Accepted candidate: `1.3-candidate-02`; 94 payload files, 47 per skill, 95 regular archive members.

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [tibicen-1.3.0.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/tibicen-1.3.0.tar.gz) | 237193 | `86862c77462896229fac1dffd1877953f591a5362e4724b95c41a7ad791ba194` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/distribution-SHA256SUMS) | 9795 | `bf589996433f8eb46b83f87cd229fc6ead81af46f0ce50959e4c7c05525bee4d` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.3.0/SHA256SUMS) | 177 | `561fc7e0192909dadbc919e02a2fdcec105cabb448b96d7c701c36cccd7f9c1f` |

## Verification

- Local gate: 843/843 tests, no failures/skips; 42 affected browser scenarios across Chromium, Firefox and WebKit passed.
- [Public exact-source CI 42092841285](https://github.com/warbr1ng3r/tibicen/actions/runs/42092841285) passed.
- Local universal init/adopt, manual archive access, installed self-tests, 1.2→1.3 replacement/repeat, complete edited-backup restoration into actual skill paths and removal passed. Project memory and later owner notes were preserved.
- Two fresh source-assisted init/adopt reasoning cases passed independent review. They do not establish native loading or application execution.
- [Public platform workflow 42094073753](https://github.com/warbr1ng3r/tibicen/actions/runs/42094073753) passed all six macOS 15 / Ubuntu 24.04 / Windows 2022 × Node 22.20.0 / 24.15.0 cells on the exact source.
- Public full-SHA universal 1.2→1.3 installation/replacement/repeat, both installed self-tests, complete edited-backup restoration into actual skill paths and removal passed: four installer and two CLI calls, 25.521 seconds. All 94 payload files/modes, the seven-file project and its later memory, sibling skill and external settings matched. The [delivery summary](https://github.com/warbr1ng3r/tibicen/blob/codex/release-1.3-ops/.release-1.3/public-delivery-receipt.json) binds the exact distribution and frozen archive. Summary SHA-256: `d70a77c0308bbb6d61cb3712c5cb1aed6dcd3438458a9c9e41693f27cd97fed0`.

The public delivery check used anonymous HTTPS with a key-free synthetic HOME. Installer Node permissions did not constrain trusted Git children; this is not an OS filesystem/network sandbox. It exercised explicit repeated `add`, not `skills update` or lock-byte stability. Returned release assets and Pages deployment/body comparison are separate postpublication gates; no current result is inferred here. Existing 1.2 and older releases remain unchanged.
