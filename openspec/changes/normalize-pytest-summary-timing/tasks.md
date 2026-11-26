# Tasks

- [x] 1.1 Reproduce timing-only pytest-summary drift against the unchanged public base through the recording site and retain the failing reproduction.
- [x] 1.2 Add regressions to `tests/verify/run-output-normalization.test.ts` that fail on the unchanged base: canonicalization of framed summaries and a `pre-existing-red` comparison under timing-only drift.
- [x] 1.3 Add the single line-anchored summary rule to `canonicalizeRunOutput`; keep unframed phrases, assertion values and changed counts strict.
- [x] 1.4 Clarify boundary wording in `references/proposal-format.md` and `docs/CURRENT_CAPABILITIES.md`: absolute-path pinning, entrypoint-only script binding, excluded `.venv`/`venv` directories without claiming import isolation, and what `environmentReady` can attest.
- [x] 1.5 Record the change under `Unreleased` in both changelog languages.
- [x] 1.6 Run focused checks, the repository gate, strict OpenSpec validation, rebuild the changed candidate and test both built skills standalone.

- [x] 2.1 Close integration-review findings: normalize changing pytest frame width, accept only timedelta clock annotations, retain meaningful diagnostics, and verify the final integrated source and both standalone skills.
