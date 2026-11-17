# Verification

## Publication — 17 November 2026

This change shipped in [1.6.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.6.0). The [release report](../../../docs/evals/results/2026-11-17-release-1.6.0/README.md) binds source, distribution, CI, six platforms, public delivery and returned assets. Later sections preserve dated preparation states, including earlier Unreleased statements; they are not current publication status.

## Preparation record — historical

This change is **Unreleased**. The initial ZCode worktree record below is retained; the later Codex integration section records additional findings and final accepted local checks. Neither changes published 1.5.6.

2026-11-16, pnpm 11.21.0, Node v24.15.0, macOS arm64, worktree branch `codex/project-checks-20261116` from f5816c7.

## Contract coverage

- `tests/verify/project-profiles.test.ts` — 9/9: bash acceptance matrix (unbound/extra argv/wrong kind/`sh`/absolute/`..` paths), profile gating (`unity` unsupported, web-only dependency environment, run-time web bash ban), bound-byte drift and absence, live bash baseline/final comparison, live python unittest exit codes, timeout honesty, untrusted/`no-project-checks`, proposal pinning/binding/refusals (`interpreter-unavailable` incl. empty and relative-only `PATH`, `command-script-unavailable`, submitted-hash drift, `invalid-check-command`, `invalid-node-environment`, web `forbidden-command`), cwd/argv binding and `./`-entrypoint binding rules.
- `tests/verify/forward-profiles.test.ts` — 6/6, both distributed skills: python unittest baseline/final through the public CLI (`red-fixed`, attempts `failed`→`completed`), docs gate + bash smoke script through the CLI (`green`, original project untouched), drift → `command-source-changed`, untrusted → `trust-required`, missing interpreter → `interpreter-unavailable` with `PATH` removed.
- Review-attack replays: `reports/evidence/review-attacks-closed.txt` in the 2026-11-16 project-checks workspace — cwd file swap, bound-file ≠ argv[0], unbound `./run.sh` shebang entry, web-profile bash all refused; relative-`PATH` entry cannot produce a pin; honest contract still compiles.
- Before/after gap reproductions on f5816c7 vs this change: `reports/evidence/repro-gaps-before.txt` / `repro-gaps-after.txt`.

## Gate and standalone checks

- `pnpm test`: **1,165 total / 1,164 passed / 0 failed / 1 existing skip** (lint, formatting, core/site typecheck, site build, strict active+archived OpenSpec validation, offline tests).
- `pnpm build`: passed, **110 payload files**. All **110 SHA256SUMS** entries verified outside the checkout; both skills passed `self-test` with an empty `PATH` and isolated `HOME`; no evals/OpenSpec/build tooling in the distribution.

## Independent review

A fresh independent Ponytail review (by the `.codex` ponytail-review method, executed by a separate reviewer session) found two must-fix holes — the bound hash could be verified for one file while another ran from a different `cwd`/`argv[0]`, and an unbound `./`-relative shebang executable ran arbitrary bash bytes — plus a real web-path widening (profile-blind bash acceptance), a weak `PATH` pin scan and missing regressions for those branches. All five findings were fixed (root-first bound argv with `cwd: '.'`, `./`-entrypoints require the byte binding, bash pinned-absolute and banned outside the controlled profiles at proposal and run time, absolute-executable `PATH` scan with execute-bit check, per-name resolution cache) and covered with the regression tests above; finding 6 (lean) was also applied. The verdict was "fix 1 and 2 first"; both and all other findings are resolved in this diff.

## Remaining limits

Scan still discovers commands only from package.json; for other stacks the agent reads entrypoints and proposes them (documented in `references/proposal-format.md`). Interpreter versions are not detected (would require pre-consent execution); pinning records the absolute path only. No package installation, venv or system dependency reproduction; missing dependencies remain honestly unverified. Windows execution stays `process-tree-unavailable`; on Windows the execute-bit pin check refuses interpreters, which is honest given execution is unavailable there anyway. Copies remain non-sandboxes for trusted code. Browser suite not run (no site change). No model run, paid API call, commit, push, version bump or publication.

## Codex integration — 16 November

The returned 12 tracked modifications and seven new files were first copied without changes from the worktree based on `f5816c792e766386f2bff7d109512615c9fa485d`. The external reports and original worktree remain unchanged. Root Ponytail review then reproduced two further contract failures:

1. A bound file named `--version` with contents `exit 73` was passed to Bash as an option. Both runs exited zero without running the file and comparison reported `green`. Compilation now normalizes the file argument to `./--version`; runtime validation requires that explicit form. The regression also executes a Node file named `inspect` as a file, not a subcommand; both return 73 and compare as `pre-existing-red`.
2. An absolute executable inside the original project ran from its original location even though cwd was a copy; a normal `$0`-relative write changed the original fixture. A shared compilation/execution check now refuses absolute project paths and external aliases resolving into the project. The positive byte-bound `./` entrypoint runs in the copy and leaves the original untouched.

Additional integration corrections: execution-dependent tests now respect Windows unavailability, a simulated Windows refusal covers all three controlled profiles, the typed proposal input accepts an omitted script hash while compiled commands require it, and paired tracker/roadmap/capability documents distinguish Unreleased from published behavior.

### Final local checks

- Focused project-profile and public CLI tests: **18 passed, 0 failed, 0 skipped**. Both distributed CLIs exercise the improve route on existing fixture projects; this is not a fresh empty-project init observation or native model behavior.
- Full `pnpm test`: **1,168 total / 1,167 passed / 0 failed / 1 existing skip**, including lint, formatting, types, site build and strict OpenSpec validation.
- `pnpm build`: passed, **110 payload files**. All 110 hashes matched after copying outside the checkout; both self-tests passed there with isolated HOME and empty PATH. Distribution manifest SHA-256: `392ef7e15776e9b2c6b30b8a176430e46e86844daebd2c24f2c94121768cc7f9`.
- Source version stays 1.5.6 for local development. These Unreleased bytes are not the immutable published 1.5.6 assets. No commit, push, version bump, publication, fresh model session or paid API call was performed.

Remaining limits: no new native Windows/Linux acceptance, harness-loading or human-usefulness observation; no dependency/venv installation or reproduction, interpreter-version identity or sandbox guarantee. A launched command that returns nonzero remains a real failed run subject to normal comparison; unverified means the required execution or comparison was unavailable, not that every missing dependency is automatically classified.

## Adopt-maintenance continuation — 16 November (ZCode/GLM)

A second maintenance packet re-verified the whole contract through the built skills before finding, reproducing and closing four review holes; all regressions are in `tests/verify/forward-profiles.test.ts`, `tests/verify/project-profiles.test.ts` and `tests/core/apply.test.ts`.

- Six fixture groups (moved instruction reference, changed test command, root/nested instruction distinction, memory-source change, sufficient setup, Tibicen-only routing) ran through the distributed CLI with read-only diagnosis, digest-bound synthetic fixture consent, real apply/verify/status/report and repeat adopt; no fixture behavior gap remained before the review round.
- Live reproductions before fixing: `node -p`/`python3 -Ic` inline spellings compiled in `docs`/`python` profiles; a `script` binding compiled in the `web` profile; `/bin/echo`-style wrappers accepted a bound file argument; a truncated `~/.tibicen/usage.json` failed an otherwise complete apply with `invalid-data` and left the session `incomplete`. All four refused or completed correctly after the fix, with positives (bound `./` scripts, `python3 -m unittest`) unchanged.
- Wrong-digest apply (`consent-required`), post-consent byte drift (`stale-plan`) and memory edits without a store binding (`application-protected`) were retained as side-effect-free refusals.
- The full `pnpm test` gate, `pnpm build`, standalone payload hashes and both isolated self-tests outside the checkout were re-run on the fixed tree; the worktree stays uncommitted for Codex integration. Published 1.5.6 bytes are unchanged; no model run, paid API, commit, push, version bump or publication belongs to this packet.

A follow-up re-review of the fixes found the inline-code rule still keyed to bare interpreter names only; absolute spellings (`/usr/bin/python3 -Ic …`) compiled. The rule was hoisted to cover every build/test/lint command whose executable name is in the pinned set, bare or absolute; the reviewer independently reproduced the refusal matrix (inline spellings refused in every form, `-m` modules and bound `./` scripts still compile) and accepted the closure.

## Final Codex integration — 17 November

Root verified all 1,964 frozen baseline entries and integrated the exact returned
15-file delta onto `e3a505e`, preserving the newer landing changes. The received
worktree and reports are unchanged. The [assessment](../../../docs/evals/results/2026-11-17-adopt-maintenance/README.md)
records the six mechanical cases, approval/content checks and remaining limits.

Root Ponytail review found no remaining blocking code finding and corrected the
stale design claim that a known-interpreter file command could omit its binding.
Proposal-time profile refusal and runtime unsupported-profile behavior are now
distinguished consistently. Final product checks: **33/33** focused regressions;
merged full gate **1,171 total / 1,170 passed / 0 failed / 1 existing skip**; build;
all **110** standalone hashes and both self-tests with isolated HOME and empty
PATH. Manifest SHA-256: `5272acbee9ecc64899a4ffb3ab87241b5bb470ae957502852ac97688d78f684a`.
A separate read-only control left the complete fixture tree and modes unchanged.
Documentation-only reconciliation after the gate passed formatting and strict
OpenSpec checks again.

No commit, push, version bump or publication; these are Unreleased development
bytes, not replacement published 1.5.6 assets. No new behavioral model, paid API
or native Windows/Linux run was made. Mechanical fixtures do not establish
semantic diagnosis, native loading or human usefulness.

## Release candidate 1.6.0 — 17 November

The integrated change is prepared as a compatible minor **1.6.0** — an
unpublished local candidate. Existing web plans, persisted schemas and saved
state remain compatible; unknown profile names now fail at proposal time while
old plans stay readable, and the web profile keeps its shell restrictions. The
root `package.json` and both generated skills are versioned 1.6.0; published
1.5.6 assets are unchanged.

- Full `pnpm test` gate (pnpm 11.21.0, Node v24.15.0, macOS arm64): **1,171
  total / 1,170 passed / 0 failed / 1 existing skip**. `pnpm build`: passed,
  **110 payload files**; distribution manifest SHA-256
  `f5009dbba05de5a1122c3d44cf06db8a1f64b62af1bc3156e673dc856fe9ca75`.
- Frozen candidate `candidate-01` in the local release package
  `Tibicen-work/release-1.6.0-20261117`: complete source manifest, distribution
  tree with `SHA256SUMS`, the versioned `tibicen-1.6.0.tar.gz`, archive
  inventory and sums. Exact-candidate install/update/recovery/removal, CLI
  acceptance and independent review evidence are retained in that package's
  `reports/`.
- Publication is **pending**: no commit, push, tag, release, deploy or remote
  workflow was performed; stable links and indexes remain on published 1.5.6
  until an actual release.

## Release integration — candidate-02

Root retained the received candidate-01 and reports, verified the exact nine-file
release delta and all 110 payload hashes, and compared all 111 archive files/modes
with the frozen distribution. Four roadmap/tracker files changed after the original
source-manifest freeze; candidate-01's source manifest therefore does not describe
the final worktree. The executable payload did not change. Candidate-02 records a
new final source identity and copies the same accepted payload/archive bytes; all
three release assets are now prepared locally. Exact identity and root receipts
remain in `Tibicen-work/release-1.6.0-20261117/candidate-02` and `integration/`.

The received partial SIGKILL experiment remains partial. Root separately seeded a
controlled partial installation (38 present payload files, 37 matching) and reran
the cached pinned skills 1.7.4 installer. Recovery restored all 110 hashes and modes,
both installed self-tests report 1.6.0, and the unrelated skill, host settings and
post-setup project-memory note stayed unchanged. This is controlled-state recovery,
not observation of an actual mid-copy kill or proof of atomic installation.

Publication, public-source projection, public CI, six platform cells and returned
public assets remain pending authorization and actual execution. No native loading
or human usefulness claim follows. Published 1.5.6 stays unchanged.

Final root gate on the integrated 1.6.0 source: **1,171 total / 1,170 passed /
0 failed / 1 existing skip**; build passed and its 110 payload bytes match the
accepted frozen distribution. Both standalone self-tests passed outside the
checkout with isolated HOME and empty PATH. An additional exact-candidate Python
missing-import control returned real exit 1/ModuleNotFoundError and
`pre-existing-red`, never green; approved application files stayed unchanged.
Documentation-only reconciliation was followed by formatting and strict
specification validation. Candidate-02 retains the unchanged archive, distribution
manifest and generated asset-checksum file, with a complete final source inventory.
The public source projection is prepared locally on the actual public main base;
no commit, push, remote workflow, tag, release or deployment has been performed.
