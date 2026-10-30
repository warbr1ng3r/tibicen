# Standalone platform checks — 30 October 2026

All six actual GitHub-hosted cells passed for public source [`b08252e`](https://github.com/warbr1ng3r/tibicen/commit/b08252e1c74066ed78bc0ba81bf74a35ae1f8c71). [Platform run](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938), first attempt on this corrected source. This is an unreleased working build with version `0.1.0-alpha.1`; the published alpha tag/assets and deployed landing were not replaced.

| GitHub runner | Node 22.20.0 | Node 24.15.0 |
| --- | --- | --- |
| macos-15 | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303322448) | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303322579) |
| ubuntu-24.04 | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303322287) | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303322471) |
| windows-2022 | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303321973) | [passed](https://github.com/warbr1ng3r/tibicen/actions/runs/41125634938/job/124303322973) |

Each job builds both standalone skills on Node24.15, then runs the target runtime outside the checkout with owned project/HOME and stripped environment/PATH. The check verifies its 86-file inventory, versions/self-tests, init/adopt, exact consent, protected-file refusal, preservation, structural checks, final status/report and read-only repetition. Windows command execution remains `unverified` with `process-tree-unavailable`; no successful Windows execution is claimed. Unsupported exact Windows permissions refuse before writes.

## First failure and correction

The [first matrix](https://github.com/warbr1ng3r/tibicen/actions/runs/41124239471) on [`5dc6051`](https://github.com/warbr1ng3r/tibicen/commit/5dc6051486269cf4efecc12388b14de2b54d97a9) passed four macOS/Ubuntu cells and failed both Windows cells. Windows init added AGENTS.md, then stopped with `baseline-changed`; adopt passed. The original failures remain visible and were not relabeled or blindly rerun.

The plan and final snapshot had recorded requested mode0600 for a new instruction file while Windows observed0666. The fix makes ordinary writable0666 explicit for new first-party Windows text, retains POSIX0600 and existing observed modes, and rejects unsupported exact result modes in proposal compilation, raw apply preflight and direct snapshots. Upstream0644/0755, explicit0600 and unverified readonly0444 are not silently mapped. Historical/source parsing and exact byte/mode comparisons remain intact. POSIX mode bits and internal chmod requests do not establish Windows ACL privacy; see the [Node file-mode caveat](https://nodejs.org/download/release/v24.15.0/docs/api/fs.html#file-modes).

Three local policy regressions failed before the fix, then the focused suites passed21/21. They emulate the Windows platform selector with real local files; the remote matrix above supplies actual Windows evidence. Independent review accepted the correction. The final local pnpm11.21.0/Node24.15.0 gate passed715 tests/one intentional portable-test skip (716 total), including lint/format/types/site build and strict active/archived OpenSpec validation. Local standalone checks passed3/3 on each available runtime. The actual [Ubuntu offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41125594821) also passed for the corrected source, including unpacked-distribution smoke checks.

The locally rebuilt macOS payload contains86 verified files, inventory SHA256 `170fdef9501f0ffb85b7d418bd416364bf6f76fbde046f4c4e9e9bd799669447`, with16 differences from published alpha (ten core copies and six reference copies). Each remote job verifies its own rebuilt inventory; a cross-platform byte-identical archive was not asserted. Public technical snapshots preserve the reviewed source bytes and exclude private development history/tracker/raw evidence.

## Limits

This accepts the bounded standalone CLI flow on the recorded OS/runtime cells. It does not establish native agent discovery, every component/permission configuration, human usefulness, or the full MVP. Exact-candidate public installation/upgrade/backup restoration, remaining semantic acceptance, real pilot and support inputs remain open under the [release procedure](../../../RELEASING.md). No model/API evaluations, credential changes, 1.0 release or Pages deployment occurred.
