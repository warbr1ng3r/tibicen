# Verification

**5 November 2026, Europe/Moscow. Local implementation complete, Unreleased.**
Published 1.1.0 and its immutable artifacts remain unchanged. Source baseline is
local `d1f64a49e1332b7b7bdb4ae12174cbd647b22645`; this packet and the preceding
technology-refresh research are uncommitted.

## Implemented outcome

The existing `practices --agents …` command accepts optional `--input FILE|-`
with `{ "agentVersions": { "codex": "0.157.0" } }`. Envelope/map validation runs
before source reads. The original invocation, partial/missing-version gaps,
source request/host limits, schema 1 and `requires-agent-assessment` remain.
Versions are supplied context, not automatic binary detection or compatibility
proof. Existing init/adopt references and the EN/RU guide explain the evidence
boundary and keep/change/unknown outcomes.

## Actual checks

| Check | Result and scope |
| --- | --- |
| Core author's focused discovery/standalone CLI checks | 9/9 pass, no skips; valid/partial/missing/invalid version input, stdin/file, source failures and read-only snapshots. |
| Existing CLI regressions | 5/5 pass, no skips. These and the focused cases are included in the final full gate, not additional acceptance observations. |
| Reference resource graph and proposal example | 2/2 pass, no skips. Static connection/example checks, not observed agent obedience. |
| Final `TIBICEN_PORTABLE_DIST=<repo>/dist pnpm test` | Exit 0; lint, format, core/site types, site build, strict current/archived OpenSpec validation, standalone build and **801/801 Node tests**, zero skips/failures/cancellations. Node v24.15.0, pnpm 11.21.0 on macOS. |
| Standalone command regression | Source plus built init/adopt exercised outside the temporary checkout after that checkout was deleted. Offline fetch, empty PATH, stdin/existing file, malformed input before HTTP, unavailable/timeout reasons and unchanged project/home/install snapshots pass. No actual agent binary or live HTTP invoked. |
| Portable lifecycle | Enabled in the final full gate; retained its real local platform/runtime scope. No new Windows/Linux native result is claimed. |
| Final distribution resources | Both built self-tests pass; **92/92** SHA256SUMS entries match. Generated packages have no dependencies/devDependencies; development OpenSpec roots/skills/CLI are absent. The optional target-process reference is intentionally present. |
| Input/package preservation | All 99 snapshotted source/reference/skill/package inputs remain unchanged since gate start. Root package, lockfile and skill entry bodies match the pre-packet inventory; no dependency or version bump. |
| Documentation | Paired guide/planning/task/source links and canonical pointers checked manually; published changelog sections remain byte-identical. Markdown is excluded by the repository's Prettier policy, so formatter success is not claimed as Markdown layout validation. |
| Independent review | [Ponytail review](review.md) reports Ship. Separate root-metadata/parity review found two wording issues; both corrected and rechecked. |

Private local logs and inventories are under
`.evals-private/practice-evidence-20261105/`: `offline-gate.log`,
`initial-inventory.json`, `gate-inputs.json`, `distribution-check.json` and
`result.json`. The final sum-file SHA256 is
`31f3f6a0f092f9bab9da5a3095824fcec2e0584729d6471ded5911e0cd4465c4`.
These local receipts are not public CI evidence.

An initial ad-hoc artifact check rejected any filename containing “openspec”; it
incorrectly included the allowed `process-openspec.md` reference. The corrected
check verifies absence of development roots/dependencies, and passes. No product
change was needed for that check correction.

## Limits and handoff

No native-agent/model session, live official-source behavior, measured usefulness,
paid API, personal auth change or external installation was performed. The
offline tests and instruction review do not prove semantic recommendation quality
or native loading. Source/date/hash and supplied version remain separate from
those observations. No target application, persistent schema or approval boundary
changed. No commit, push, version preparation or publication occurred.

The complete packet is ready for user review and a separately requested commit.

## Release preparation follow-up

The owner later delegated the remaining work. On 5 November the completed change
was synced to the main lifecycle specification and archived before commit/release
preparation. The checks above retain their original scope with version 1.1.0; they are not
a 1.2 candidate or publication result.
