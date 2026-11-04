# Changelog

Version 1.0.0 is public. See [release details](docs/RELEASING.md) for
immutable source/distribution references, checks and remaining scope limits.

## Unreleased

## [1.0.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.0.0) — 2026-11-04

- Publish 1.0.0 with installer/site metadata pinned to the full standalone
  distribution commit; CI, six platform cells and public asset hashes passed.
- Keep a current-reply preference inferred and correctable until the user explicitly
  chooses a permanent project rule; a later explicit project correction replaces
  the earlier inference without transferring application consent.

- Refuse resume before writes when its remaining plan omits a required pending
  manual action from the original session; keep explicit completion and optional
  steps visible.
- Include MCP command/argument environment references in availability results;
  distinguish quoted Codex server names from nested dotted TOML tables.

- Clarify that uncertainty about a mandatory project stage requires a question
  before proposing to remove, combine or change it, when questions are allowed.
  Keep the existing stage while awaiting the answer.

- Use observable writable permissions for new first-party Windows text files;
  reject unsupported exact modes before writes and preserve repeated snapshots.
  POSIX mode bits do not establish Windows ACL privacy.

- Repeating an already-applied component merge produces a read-only empty plan
  when source identity, installed bytes and permissions still match. New
  revisions, drift and unknown records retain explicit merge checks.
- Add an opt-in standalone lifecycle test and manual platform workflow without
  adding runtime-matrix work to ordinary PR checks.
- Clarify how to finish a pending manual step through a newly approved `resume`
  plan while retaining the original integration session.
- Preserve recorded command outcomes when an approved manual-session resume
  continues without state; append new checks while ordinary apply stays separate.
- Clarify that `forbiddenPaths` covers project-resource operations, while internal
  state/passport writes are disclosed separately; explicit user bans remain binding.

## [0.1.0-alpha.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) — 2026-10-27

- Two entry points: initial agent setup and review/update of existing setup.
- Read-only discovery and exact proposals before approval; preservation of
  application code, existing package manifests, CI and user decisions.
- Provenance, manifest/history, resumable integration, separate verification
  results and a final report, including incomplete and manual outcomes.
- Presets, a static configuration page, MCP stdio configuration and compatibility
  probes with explicit execution and platform limits.
- An optional bounded OpenSpec adapter, selected per project request. External
  OpenSpec tooling is installed separately and is not bundled with Tibicen.
- Published standalone skill distributions and checksums. Public SHA/tag
  installation matched all 86 files; approved resume and removal checks passed.
- A clean-source local gate passed 668/668 tests, and the first Ubuntu CI and
  GitHub Pages runs succeeded.

The [release](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) and [configuration page](https://warbr1ng3r.github.io/tibicen/) were published on 27 October 2026. Full MVP component coverage, human review/pilot, additional agent/platform acceptance and support contacts remain open; this release is a limited alpha.
