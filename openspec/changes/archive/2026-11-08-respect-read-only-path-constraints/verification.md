# Verification

## Scope

A synthetic CLI reproduction first excluded `private-data` through the existing scanner API, applied a plan with that constraint, then observed the forbidden instruction candidate and file hashes in fresh unscoped CLI reads after completion. Supplying that constraint through report task context was rejected. This establishes the missing per-read transport; it does not establish a promised persistent ACL.

The fix adds the optional literal `--forbidden-paths` array to project inspections, retains the existing task-context schema and combines fresh limits with active-plan exclusions. Completed manifests, approval, state schemas and published 1.5.2 remain unchanged. Source scan loads bounded metadata without recovery-file hashing; both paths share pure saved-state validation. Local MCP verification reuses the existing bounded regular-file reader.

## Actual checks

- The first new CLI regression failed before the flag existed (exit 1); it then passed through first inspection, exact test-fixture approval/apply and constrained post-completion report. The generated project and isolated HOME were removed.
- Independent review found that the initial metadata-only path did not bind active exclusions to the saved digest. An exact CLI tampered-state test failed before correction (scan returned exit 0); after sharing the existing pure schema/digest/root/journal guards, scan rejects it before inventory with `tamper-suspect`.
- A second independent review found the previously unbounded state reader newly reachable from scan. A bounded FIFO-state CLI test timed out at 1500ms before correction. Reusing the existing nonblocking regular-file reader with `MAX_DATA_BYTES` made FIFO, directory, oversized and malformed state reject promptly in both scan and status; earlier logs remain retained.
- `node --test tests/core/read-scope.test.ts tests/core/cli.test.ts tests/core/recovery.test.ts tests/core/instruction-sources-cli.test.ts tests/mcp/diagnosis.test.ts tests/scan/scan.test.ts`: **86 passed, 0 failed, 0 skipped**. Eleven new tests cover explicit scope, pending union/recovery, report evidence/stdin/save, invalid/oversized paths, local MCP/global separation, bounded file reads and malformed/tampered metadata.
- `pnpm typecheck:core`: passed.
- Scoped ESLint on the three changed source files and new regression file: passed, zero warnings.
- Targeted Prettier formatted those TypeScript files. Project Markdown is ignored by the configured formatter; no Markdown formatting pass is inferred.
- Installed guidance uses one authoritative read-scope section and stage/MCP pointers. Paired Unreleased entries describe both the scope correction and the separately implemented memory-fragment fix; earlier release entries are retained.

## Integrated checks and limits

The corrected source passed independent Ponytail review. The full gate passed lint, configured formatting, types, site build, strict specs, distribution build and **1067 tests / one existing skip / zero failures**; Node tests took 74.996 seconds. An earlier draft retained one offline-protocol launch error among 1064 tests. The same case passed a separate focused check; its initial cause remains unknown and the earlier failure is not regraded.

Both copied skills passed one synthetic acceptance: **12 actual CLI reads and four copied core API calls** in 1.641 seconds. Exact generated plans used isolated explicit core homes. First and post-completion scans, status, task-context report and verification respected explicit exclusions; traversal was rejected. The paired memory-fragment correction connected successfully. Protected bytes/modes/mtimes, read-only project/home/runtime snapshots and all 110 payload hashes stayed unchanged; the owned root was removed.

No native agent, authentication, network or model request ran for this fix. The checks do not establish native discovery, ongoing memory use, human benefit or wider harness compatibility. Published 1.5.2 and earlier failed packets remain unchanged. Source publication is separate from a future versioned release.
