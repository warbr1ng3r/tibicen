# Tibicen 1.4.0 — draft, unpublished

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

The final installation command must pin the accepted public distribution's full
SHA with `skills@1.7.4` and select only `tibicen-init` and `tibicen-adopt` using the
universal target. That binding is pending; follow the canonical
[installation guide](../../../../README.md) once this release is published.
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
with one manual standalone skip. Public CI, six platform cells, public full-SHA installation/update/
recovery/removal, returned assets and Pages checks are **pending**. These are
separate from the local checks in the [release report](README.md).

MCP parsing and source-bound observations do not establish native activation,
connection, tool discovery, model behavior or safety. Native applications and
human usefulness were not evaluated in this packet. The generic observation
route preserves this uncertainty; it does not claim universal native support.
See [supported formats and evidence](../../../MCP_FORMATS.md).

## Publication bindings

Intended tag: `v1.4.0`. Public source/distribution SHAs and publication time remain
pending. These local prepared files have not been returned from a public release:

| Prepared asset | Bytes | SHA-256 |
| --- | ---: | --- |
| `tibicen-1.4.0.tar.gz` | 264376 | `0b1df51d33c2e3b43cc5041ece30b397039d0b1c3f7f20c706014eb9b38e38d8` |
| `distribution-SHA256SUMS` | 10428 | `ec1b4c75a0cef2dde8d4d12a29dc75de1ee1f8c01d16d72efec82a4891fb58ef` |
| `SHA256SUMS` | 177 | `272b8c4709b04cc4ca06ae9bbb5624135dd3b2b3c47f7a36ec6fb84e97768c93` |

This draft is not a published release announcement.
