# Proposal

## Why

The controlled `python` profile's comparison promise (an unchanged failure stays
`pre-existing-red`) holds for Python `unittest`, whose complete `Ran N tests in Ts`
line is normalized. Pytest — the most common Python runner — prints its summary as
`========== N failed in Ts ==========`; that timing record is not recognized, so the
same failing check run twice reports `changed-failure` / `new-regression` purely from
timing drift. A packet reproduction against the unchanged public base confirmed the
misclassification through the real recording site (`outputHash` over
`canonicalizeRunOutput`), while the equivalent `unittest` drift compared correctly.

## What Changes

- Recognize the complete pytest summary timing record — a line consisting solely of
  `=+ <counts or "no tests ran"> in <duration>s =+` — and normalize its duration, optional timedelta clock and variable separator padding. Keep line anchoring as with the Node spec/TAP and Python unittest rules.
- Everything else stays strict: assertion values, test names, counts, unframed
  phrases such as `3 warnings in 0.42s`, and unknown formats remain meaningful
  differences (`changed-failure`).
- Documentation precision alongside the fix: pinned interpreters are absolute paths
  only, script binding covers the single approved entrypoint file, and directories named `.venv`/`venv` are excluded from baseline/final copies and are not reproduced. Package availability depends on the pinned interpreter and approved environment; exclusion does not isolate imports. `environmentReady` attests the pinned
  interpreter plus whatever packages that interpreter actually sees (system or
  ambient), never a reproduced environment.

## Capabilities

`verification-and-delivery`: unchanged failures differ only in recognized runner
timing records — now including pytest summaries — compare as `pre-existing-red`.

## Impact

Shared `scripts/verify/index.ts` (one canonicalization rule), focused regressions in
`tests/verify/run-output-normalization.test.ts` (failing on the unchanged base),
`references/proposal-format.md` and `docs/CURRENT_CAPABILITIES.md` boundary wording,
plus `Unreleased` changelog entries in both languages. Both distributed skills
receive the same implementation through the existing build. A matching summary line
is a formatting convention, not proof of runner honesty; no semantic understanding of
arbitrary output is claimed.
