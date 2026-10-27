# Local candidate delivery — 2026-10-27

Candidate `0.1.0`, source `3fb29efb1087a616aeb69a3b22f400972bfb8a3e`. macOS arm64, Node `24.15.0`, installer `skills@1.7.4`; machine-readable results and commands (maintainer-local record; omitted from public source), 86 installed SHA-256 hashes (maintainer-local record; omitted from public source), original evidence hashes (maintainer-local record; omitted from public source). The pinned package and its runtime dependencies were copied from an existing cache; npm/pnpm/Yarn package installation was not checked in this run. Repository pnpm version: `11.21.0`.

The installer ran with an environment allowlist: separate HOME/CODEX_HOME/XDG/TMP/npm configuration/cache under `/private/tmp`, without inherited auth or personal settings. Telemetry was disabled; a preload denied fetch/socket networking, and no attempts were recorded. Distribution CLIs ran outside the checkout with an empty PATH (no Git) and Node permissions allowing reads/writes only within the temporary scope. Personal HOME/skills/settings were unchanged; there were no model/API calls, publications, or commits.

| Check | Observation |
| --- | --- |
| `add $FROZEN_DIST -g --agent codex --copy -y` | Both skills installed in `$HOME/.agents/skills/`; exactly 86 files match frozen SHA256SUMS, with no extra files |
| Standalone | `self-test`, `version`, `help`, `scan` for both skills: 8/8 exit 0; both self-tests `passed`, resources available |
| Repeated `add` | All 86 byte hashes match; external user files preserved |
| `update tibicen-init tibicen-adopt -g -y` with a local edit | Exit 0, but local sources were skipped: `Local path`, `cannot be checked automatically`; the edit and added file remained |
| Repeated `add --copy` with a local edit | The `SKILL.md` edit was replaced with the frozen version, and `user-note.txt` added inside the skill was deleted; a complete backup had been saved outside the installation beforehand |
| `remove tibicen-init tibicen-adopt -g --agent codex -y` | Both skills removed; a separate check confirmed deletion of a user file inside the installation; its backup was preserved |
| User data outside the installation | 6/6 SHA-256 hashes preserved: preset, project manifest/state, AGENTS.md, data/user.txt, and Codex config.toml |
| Frozen candidate after verification | All 86 original files still match; SHA256SUMS hash `6ecd6b77d28e7adf3e9921b20078c80b2091a0109c8b5b6bfabaa9a201b4de23` |

After removal, empty `$HOME/.agents/skills/` and `.agents/` directories remain, along with `$XDG_STATE_HOME/skills/.skill-lock.json` with `version: 3` and empty `skills` and `dismissed`. Presets and project files remain in place. Removing user data is not required to uninstall. The lock path with XDG set was observed directly; the fallback without XDG was not run.

Updating Tibicen itself through the installer replaces the installed skills. Updating project components through `tibicen-adopt` is a separate operation requiring a plan and approval; the installer did not run it. Before reinstalling or removing, save modified skill directories outside the installation, then compare and carry over useful edits manually. Automatic merging was not established. Backups and their hashes were checked; restoring from them was not checked in a separate run.

This is the local portion of delivery/update/remove work. A public Git tag/full SHA, Ubuntu/Linux, transition between different frozen distributions, and subsequent resume remain unchecked; release task `2.4` is not closed. Manifest/state were opaque delivery sentinels here: preserving them does not establish schema support or resume. Fresh agent loading and skill application are checked separately. CLI success does not prove agent instruction loading.

Detailed evidence: maintainer-local record; omitted from public source. Early preparation errors involving cached dependencies and assumed installation paths are retained as `bootstrap-*`; after correcting the verification scenario, all table checks were completed. Product code, the frozen candidate, and tracker/spec/roadmap were unchanged.
