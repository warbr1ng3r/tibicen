# Tibicen 1.4.0

Published 6 November 2026 at 03:10:57 Europe/Moscow (00:10:57Z),
[release ID 435921093](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.4.0).

Tibicen helps an agent set up a new project's instructions or improve an existing
setup through a reviewed proposal. Version 1.4.0 adds task-specific explanation
and local MCP diagnosis without restricting the common route to named harnesses.

## Changes

- **Explain setup for the next task.** Optional harness/version, working-directory
  and task-path context carries through init/adopt reports and handoffs. Existing
  useful instruction scopes and project-memory decisions remain preserved.
- **Diagnose local MCP configuration.** Inspect one selected stdio server across
  up to four permitted, bounded project files. Results explain source uncertainty,
  disablement and launch prerequisites, with a supported repair or native follow-up.
- **Keep other harnesses usable.** Any valid harness ID can select a known format
  or provide redacted observations bound to the inspected source by SHA-256.
  Eight explicit contracts cover Claude, Cursor, Gemini CLI, OpenCode V2, ZCode
  native/shared JSON, current Kimi Code JSON and bounded Mistral Vibe TOML.

This is a compatible minor release. Existing calls and persisted schemas remain
supported; there is no migration or automatic project update. Observation inputs
are request-time data. Selecting a format grants no new writer or server launch;
existing write and exact-plan approval boundaries remain intact.

## Installation and update

Install both skills with the pinned installer and exact distribution:

```sh
npx --yes skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/7b3b08f58276034b1609e44ef393e5f7c0e01a1b --agent universal --skill tibicen-init tibicen-adopt --copy
```

Use an explicit skill reference when your harness does not discover this location.
See the [installation guide](../../../INSTALLATION.md).
Back up local edits before explicit skill replacement. Re-run adopt separately
when you want a reviewed change to a project's configuration.

## Checks and limits

Frozen `1.4-candidate-01` passed the fresh full gate: **891 tests passed**, zero
failed and one manual standalone skip. The skipped lifecycle ran separately:
**3/3 passed**, alongside both self-tests, 12 MCP CLI cases and task-aware/legacy
reports. Local universal 1.3→1.4 replacement, repeat, edited-backup restoration
into installed paths and removal passed independent acceptance while preserving
the project, later memory, sibling skills and settings.

Fresh source-assisted guidance observations retained an unknown host's existing
configuration and proposed a one-line repair for an existing project's absent
check command. Both stopped before apply and passed independent result review.
Final local release engineering review returned Ship, including the exact
distribution commit. The curated source export's local gate also passed 891 tests
with one manual standalone skip. [Exact-source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42133771601)
and all six macOS/Ubuntu/Windows × Node22.20/24.15
[platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/42134245813) passed.
Public full-SHA universal installation, 1.3→1.4 replacement, repeat, complete edited-backup
restoration and removal passed with 100 payloads and two installed self-tests.
Project data and later memory were preserved. `skills update` and lock-byte stability
were not checked; trusted Git children had ordinary OS permissions.
All three returned assets match candidate bytes and API hashes; all 101 archive
files/modes match. Published 1.3 remains unchanged. GitHub reports `immutable: false`;
server-enforced immutability is not claimed. The separate metadata CI and
[Pages deployment](https://github.com/warbr1ng3r/tibicen/actions/runs/42136931904)
passed; the [body audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42137552667)
matched all 18 HTTP 200 bodies to the actual official artifact. Site checks passed
48/48 at both bases and 62 browser scenarios with one existing Firefox skip.
The initial failed browser run and truncated audit-summary retention attempt
remain recorded, alongside their corrections, in the [release report](README.md).

MCP parsing and source-bound observations do not establish native activation,
connection, tool discovery, model behavior or safety. Native applications and
human usefulness were not evaluated in this packet. The generic observation
route preserves this uncertainty; it does not claim universal native support.
See [supported formats and evidence](../../../MCP_FORMATS.md).

## Publication bindings

Tag: `v1.4.0`. Source: `dfc85d75698094d614ac66511c0b0c13fa54c0bf`.
Distribution: `7b3b08f58276034b1609e44ef393e5f7c0e01a1b`.
Annotated tag: `d7a49b1cfc9c604daa08d4101a320a3bb2e59052`.
[Publication workflow 42134902094](https://github.com/warbr1ng3r/tibicen/actions/runs/42134902094)
passed. The release includes these downloaded and verified exact candidate assets:

| Release asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `tibicen-1.4.0.tar.gz` | 264376 | `0b1df51d33c2e3b43cc5041ece30b397039d0b1c3f7f20c706014eb9b38e38d8` |
| `distribution-SHA256SUMS` | 10428 | `ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef` |
| `SHA256SUMS` | 177 | `272b8c4709b04cc4ca06ae9bbb5624135dd3b2b3c47f7a36ec6fb84e97768c93` |
