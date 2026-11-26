# Executor verification and integration follow-up — 26 November 2026

Prepared in the working packet `development-1.8.0-20261126` on base
`da14bec29a55ade389b64c58bd8fe469a9f77859`. The reproduction on the unchanged base
and the regressions failing before the fix are retained in the packet
(`evidence/D/`).

## Reproduction

- Front D hypothesis H1: timing-only drift in a pytest summary
  (`===== 1 failed in 0.42s =====` → `0.43s`) yields `new-regression /
  changed-failure`, while equivalent unittest drift compares correctly. Reproduced
  through the real recording site (`outputHash` over `canonicalizeRunOutput`) in
  `evidence/D/repro-h1c.mjs`.
- Two regressions in `tests/verify/run-output-normalization.test.ts` fail on the
  unchanged base (`evidence/D/regression-old-code.txt`: 8 pass / 2 fail) and pass
  with the rule (10 pass / 10).

## Boundaries

The rule recognizes only a fully framed pytest summary line; counts, test names,
assertion values and unframed phrases stay strict. A counts change
(`1 failed` → `2 failed`) remains `changed-failure`. Previously stored hashes are
neither rewritten nor claimed to use the new normalization.

The documentation boundary clarifications (absolute interpreter path, entrypoint-only
script binding, exclusion of `.venv`/`venv` directories without claiming import isolation, the meaning of
`environmentReady`) change no behavior — wording precision only.

## Root integration review

The incoming revision B still retained variable pytest separator padding and
removed arbitrary parenthesized annotations. Two new regressions failed on that
returned implementation (11 passed / 2 failed), then all 13 focused tests passed
after canonicalizing recognized padding and limiting annotations to timedelta clocks.
The fixtures cover 80-column digit, minute and day crossings, meaningful diagnostic
changes and CRLF. Unknown formats remain strict.

An independent Ponytail follow-up reviewed the final code, regression suite and
English/Russian boundary documentation: **Ship**, with full integration gates still
owned by root. Final gate and standalone results are recorded in the
[development assessment](../../../docs/evals/results/2026-11-26-development-assessment/README.md).

The returned packet remains unchanged. Its original candidate and executor gates
are distinct from the integrated source; no commit, version change or release
was performed.
