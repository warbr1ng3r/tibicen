# Verification

## Codex integration review — 20 November 2026

The returned marker set discarded project-parent prefixes. Root reproduced a
nested genuine marker exempting an unrelated root lookalike: the new regression
failed before the fix (5 passed / 1 failed), then the corrected scan and existing
suite passed 22/22. Root, nested and sibling locations now use full directory
paths. The existing negative test has a genuine marked base so it no longer
passes merely because its base was marker-less. Independent re-review: Ship.

The [integration assessment](../../../docs/evals/results/2026-11-20-consent-coverage-assessment/README.md)
owns the merged gate, standalone identity and evidence qualifications. The
original packet's A5-i3 scan failure is retained; a local regression is not a
new behavioral observation. The entries below are the original worktree checks.

Final merged `pnpm test`: 1,209 total / 1,207 passed / 0 failed / 2 existing skips,
exit 0. A separate build and outside-checkout copy passed all 116 payload
hashes/modes, both isolated self-tests and 14 actual CLI invocations. The linked
assessment separately retains the first failed gate and its unknown offline
control cause. The two integration changes are complete and remain Unreleased.

## ZCode worktree checkpoint — 19 November

All checks were run 19 November 2026 in the packet worktree at commit
`233ae1dcd42db3fe14ad4ab7d6335d89cc709fc2` with the changed files uncommitted.
Node v24.15.0, pnpm 11.21.0 (corepack).

- `pnpm exec openspec validate detect-canonical-skill-provenance --strict` —
  exit 0 ("Change 'detect-canonical-skill-provenance' is valid").
  `retain-approval-receipts` also still validates strictly (changes disjoint).
- `pnpm typecheck:core` (tsc --noEmit) — exit 0.
- `pnpm exec eslint` on all changed/new files — exit 0; `prettier --check` —
  all pass.
- New regressions `tests/scan/canonical-skill-provenance.test.ts`: **5/5
  pass** (A5-i3 lookalike repro → improve; marker-bearing lookalike of an early
  version → init; damaged/foreign/version-less markers → improve without
  invented gaps; genuine canonical-only install → init/not-configured;
  third-party name → improve).
- `tests/scan/scan.test.ts` (fixtures updated to the genuine distribution
  layout): **16/16 pass**.
- `tests/core/*.test.ts` whole directory (apply fixture updated likewise):
  **338 tests — 337 pass, 0 fail, 1 pre-existing skip**.
- Eval scan consumers (`generated-memory-fixture`, `matrix`, `native-workflow`):
  **0 failures**.
- Old-implementation proof (`evidence/A5-i3/scratch/old-impl-check/`, pristine
  pre-change `scripts/scan/index.ts` via `git show HEAD:` plus the new test
  file): **5 tests — 3 pass, 2 fail, exit 1**. The two failures are exactly the
  defect regressions (lookalike → init on old impl; marker content ignored);
  the three passes assert behavior the fix preserves and pass on both
  implementations. Procedure and log retained there.
- Full `pnpm test` intentionally not run; the coordinator owns the full gate.

## CHANGELOG draft (for the coordinator; CHANGELOG.md itself is not edited here)

Under `Unreleased`:

- Fixed: scan no longer treats a skill directory named `tibicen-init` or
  `tibicen-adopt` as an installed canonical Tibicen skill by name alone.
  Canonical presence now requires the distribution identity marker the builds
  have always carried (`package.json` inside the skill directory with the
  canonical name and a nonempty version). A name-only lookalike counts as
  foreign infrastructure and retains the improve/unknown-provenance hint;
  genuine canonical installs of every published version keep the previous init
  routing.
