# Correct current-guide version drift

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: current_guides
Blocked by: none

## Contract

Correct current installation/runtime version statements in `docs/HARNESS_PORTABILITY.md`, `docs/HARNESS_PORTABILITY_ru.md` and directly affected current guides only. Preserve dated release reports, historical evidence, runtime references, skills and supported/unverified distinctions. Canonical guides are English with adjacent Russian translations and English link targets. Record scope and checks in `.evals-private/native-first-use-20261106/guides/`. No commits or publication.

## Answer

Corrected both portability-guide installation pointers to published 1.4.1 and
the corresponding release report. Clarified the installed Node ≥22.20 runtime
versus repository/site tooling without incorrectly raising the installed minimum.
Corrected stale Unreleased navigation in both capability-snapshot headers;
preserved the dated 1.1 snapshot bodies byte-for-byte and linked later releases.

Scope and validation: private report (`../../../.evals-private/native-first-use-20261106/guides/README.md`; private development record; excluded from public source).
Existing path-scoped formatting/lint commands and diff whitespace checks passed;
Markdown exclusions are disclosed. Local links and historical-body preservation
were inspected. No runtime changes, new tests, full gate, commit or publication.
