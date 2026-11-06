# Verification

Completed locally on 6 November 2026 with Node 24.15.0 and pnpm 11.21.0.

## Result

The first executor tool failure retains safe internal request/start/exit context.
The standard setup profile preserves it before rejecting a failed child. Failure
stopping, containment, cleanup and strict attempt records are unchanged. The
[native report](../../../docs/evals/results/2026-11-06-native-first-use/README.md)
keeps the actual failed task separate from this offline correction.

## Checks

- Final `pnpm test`: **954 passed, 0 failed, 1 existing manual skip**. This includes
  lint, formatting, core/site types, site build, strict current/archived OpenSpec
  validation, skill build and offline Node tests. The skipped platform lifecycle
  requires `TIBICEN_PORTABLE_DIST`; unchanged published payloads did not require
  another platform run. No site source changed, so browser tests were not repeated.
- Focused mocked checks: 36 session tests and 10 setup-profile tests passed.
  They cover the exact failing pair, interleaving, unknown/ambiguous matches,
  resource/privacy bounds, byte-preserving owner forwarding and artifact propagation.
- Independent Ponytail review: **Ship** on the final five source/test files.
  Two review gaps were fixed: exact pair assertions and the setup artifact's
  omitted failure context. Separate documentation/evidence review: **Ship**.
- All **100 payload files and modes** match published 1.4.1. The manifest is
  unchanged: `1ddbe0968918ac22469dbe3c0d8cd8f85c8d23910d2f623451957f804a4238fd`.
  Neither distributed skill contains eval tooling; both versions remain 1.4.1.
- All 74 original private native records remain unchanged. Paired project guides
  preserve dated snapshot bodies and installed Node requirements. Local links and
  English canonical targets were checked; Markdown is excluded by repository
  format/lint configuration, so no independent Markdown linter pass is claimed.

Private evidence is under `.evals-private/native-first-use-20261106/diagnosis/`:
`review-freeze-02.json`, `full-gate-02.log`/`.json`, `ponytail-review.md`/`.json`,
`docs-integration-review.md`/`.json`, `distribution-verification.json` and
`original-native-preservation.json`. Gate01 passed 953 tests/one skip before
review added setup-profile propagation; its log is retained and does not stand
in for the final candidate's gate. Concurrent product-strategy research is outside
this change and its review.

## Limits

Session hashes establish internal protocol correspondence; they do not recover
command text or its cause. S1 remains failed, its uncollected container contents
and memory/task behavior unverified; S2/S3 were not run. Diagnostic verification
made no live executor/model/auth/Docker calls, no retry, credential change, skill
release, source commit, push or publication. Pages deployment belongs to the
separate already-approved landing lane. A new live attempt needs its own finite
protocol and fresh source/input freeze; historical outcomes are not regraded.
