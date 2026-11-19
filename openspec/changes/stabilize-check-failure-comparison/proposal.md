# Proposal

## Why

Released 1.7.0 hashes project-check output after replacing the temporary project path. Node and Python test runners put variable execution durations in otherwise identical failing output. The same failure can therefore be reported as `changed-failure` rather than `pre-existing-red`.

The returned scenario packet reproduced that symptom. Its first fix replaced duration-shaped tokens throughout the output. Independent integration review found a false negative: assertion values `(1s)` and `(5s)`, and even changed test names containing those values, became identical. That broad normalization is not accepted.

## What Changes

- Normalize only recognizable complete timing records: Node spec status-line final millisecond suffixes, Node spec/TAP duration summaries, TAP diagnostic duration immediately following a test result and diagnostic opening, and Python unittest's complete `Ran N tests in Ts` line.
- Preserve assertion values, test names, counts and ordinary log phrases, including `took 1s`, `after 5s` and unrelated `duration_ms` fields. Unknown formats retain strict comparison.
- Require identical nonzero exit codes for an unchanged failure, closing a review-discovered existing comparison gap.
- Keep the single check-run recording point, comparison history and existing stored hashes. No schema, CLI or state migration is introduced.

## Capabilities

`verification-and-delivery`: stable comparison of recognized runner timing records without discarding meaningful failure differences.

## Impact

Shared `scripts/verify/index.ts`, focused canonicalization/comparison tests, and real Node TAP/spec execution through the existing snapshot runner. Both distributed skills receive the same implementation. A matching runner record is a formatting convention, not proof that the project or runner is truthful; no semantic understanding of arbitrary command output is claimed.
