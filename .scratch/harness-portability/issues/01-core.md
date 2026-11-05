# Audit portable instruction authority

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read-only core/compat/plan/apply/verify/path/contracts audit. Identify the smallest safe contract for exact native/project instruction targets independent from a fixed agent list, including schema, resume, verify and preservation consequences. Write only private audit notes; no code or publication.

## Answer

Core init/adopt already accepts a brandless proposal and common AGENTS writes. The minimum generic route reuses that authority, explicitly loads instructions and accepts valid unknown preference hints. No schema/native-write extension is needed; exact native-target registration remains a separate optional feature. Private audit: `.evals-private/harness-portability-20261105/core-audit.md`.
