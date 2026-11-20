# Verification

## Returned ZCode checkpoint — 19 November 2026

The original worker reported the checks below in the returned packet worktree at commit
`233ae1dcd42db3fe14ad4ab7d6335d89cc709fc2` with the changed files uncommitted.
Node v24.15.0, pnpm 11.21.0 (corepack, `--frozen-lockfile --prefer-offline`).

- `pnpm exec openspec validate retain-approval-receipts --strict` — exit 0
  ("Change 'retain-approval-receipts' is valid").
- `pnpm typecheck:core` (tsc --noEmit) — exit 0.
- `pnpm exec eslint <changed files> --max-warnings 0` — exit 0.
- `pnpm exec prettier --check <changed files>` — all pass.
- New regressions `tests/core/approval-receipts.test.ts`: **11/11 pass**
  (10 library-level adversarial/compatibility tests plus 1 CLI-level
  channel/error/status/report surface test).
- Focused adjacent files (apply, recovery, adversarial, cli, integration,
  native-approval, freeze-lifecycle, native-checks): **100/100 pass**.
- Manifest-session consumers (components, memory, registered-scope, forward,
  evals matrix, native-workflow): **250/250 pass**.
- Whole `tests/core` directory (blast radius of the core change):
  **338 tests — 337 pass, 0 fail, 1 pre-existing skip**.
- Old-implementation proof (`evidence/AB/scratch/old-impl-check/`, pristine
  pre-change sources via `git show HEAD:<path>` plus the new test file):
  **11 tests — 2 pass, 9 fail, exit 1**. Every failure is receipt-specific
  (missing `approvals`/`approval` fields on the old implementation); the two
  passes assert pre-existing enforcement (wrong-root `invalid-plan`, owner-edit
  `stale-plan`) that must keep working. Procedure and log are retained there
  (`old-impl-run.log`, `README.md`).
- Full `pnpm test` (includes build, site, spec check, all suites) was NOT run
  here by design; the coordinator owns the full gate.

## Original CHANGELOG draft

This is the returned worker's draft, preserved as a dated record; the root
coordinator owns the actual changelog and merged gate.

Under `Unreleased`:

- Added: `apply`/`resume` now retain source-bound approval receipts — the
  consumed digest, the digest presented on the approval channel, the operation,
  the channel (`cli --approve` or `programmatic`), the project root, the session
  id and a timestamp — surfaced in the apply result, `status`, `report` and the
  manifest session summary. Refused consent returns the same structured record
  (presented versus required digest) in the `consent-required` error envelope
  and never writes the project. Receipts are evidence of content identity and
  channel; they do not authenticate an external approver. Saved sessions and
  manifests from before this change load unchanged.

## Root integration verification — 20 November 2026

Independent read-through and model-free probes found four consistency bugs in
the returned implementation: invalid input channels could create unreadable
state; consumed journals accepted contradictory digest/session ownership;
manifest journals bypassed validation; and a legacy state could inherit a
different session's receipts. The initial root regressions ran before fixes:
**14 tests, 10 passed, 4 failed, exit 1**. Separate regressions also caught the
matching-session `status`/`report` fallback and the over-strict first fix that
rejected receipt history after copying a project.

The integrated implementation shares journal validation at writer, state and
manifest boundaries, preserves legacy absence and historical absolute roots,
and binds the latest active receipt to the current proposal/root. A bounded
real child-exit regression exercises legacy recovery before the first manifest
write. The final refusal regression first failed with `sessionId: null` for a
stateless resume; library and CLI now name the selected saved session, while a
new apply without state does not borrow a previous session ID. Refusals still
leave state, manifest and usage bytes unchanged.

Root checks after the final source edit:

- `node --test tests/core/approval-receipts.test.ts tests/core/recovery.test.ts
  tests/core/cli.test.ts tests/core/apply.test.ts` — **74/74 passed, exit 0**,
  8,080.255 ms; includes all **16** receipt tests.
- `pnpm exec eslint` on the eight touched core/CLI/test files — exit 0.
- `pnpm exec prettier --check` on the same eight files — exit 0.
- `pnpm typecheck:core` — exit 0.
- `pnpm exec openspec validate retain-approval-receipts --strict` — exit 0.

The merged gate subsequently exposed two contained-eval expectations that still
assumed 57 runtime files per skill. The profile and regression now bind all 58,
including the new shared `approvals.ts` source hash; their focused tests passed
2/2. Final `pnpm test`: 1,209 total / 1,207 passed / 0 failed / 2 existing skips,
exit 0. A separate build and outside-checkout verification passed all 116 payload
hashes/modes, both self-tests with empty PATH and 14 actual CLI invocations.
The assessment retains the first gate failure and its unknown offline-control
cause separately; no related product fix is claimed.

The original returned packet was not edited. No behavioral model session,
network request or paid API call was used for these fixes. Receipts remain
caller-controlled evidence, not approver authentication or a new approval
service. The coordinator records the merged full gate and build in the
[root assessment](../../../docs/evals/results/2026-11-20-consent-coverage-assessment/README.md).
