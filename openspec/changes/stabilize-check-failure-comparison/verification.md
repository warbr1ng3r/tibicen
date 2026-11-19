# Integration verification — 19 November 2026

The returned scenario-sweep patch was applied to a separate root integration
branch from `a1d97e66b252c0d5f0027c4ef7459389e66b9015`. Original packet files,
worktree, protocol, candidates and reported grades remain unchanged. The
[independent assessment](../../../docs/evals/results/2026-11-19-scenario-sweep-assessment/README.md)
and its receipt bind the incoming patch and the corrected integration separately.

## Review and corrections

Independent Ponytail reviews covered runtime comparison, proposal/approval
boundaries and retained evidence. Root rejected the returned broad token scrubber
because it hid changed assertion durations/test names. A failing-before-fix
regression established that gap. Root restricted normalization to recognized
runner records and added real failing Node TAP/spec executions through the shared
recording path. Review also found the existing unequal-exit-code comparison gap;
a second red regression preceded the equality fix.

Proposal guidance now selects the actual supported profile instead of generic
`web`, includes proposed trust without implying prior consent, and requires
observed readiness. An executor-created questionnaire, generated/default answer
or tool permission is not an external approval reply. The CLI does not authenticate
the approver; this is a guidance correction, not runtime identity enforcement.

The focused comparison/recording suite passed **19/19**. Three independent
review streams accepted runtime, guidance and the evidence assessment. Final
`pnpm test` exited zero: **1,187 total / 1,185 passed / 0 failed / 2 existing
skips**, including lint, format, type checks, site build, strict OpenSpec (48
active items and 20 archives) and offline tests. No site behavior was changed.

A second build outside the checkout matched the gate build byte-for-byte: all
**114 payload hashes / 115 total files**, including the manifest, match. Both
standalone resource self-tests passed with isolated HOME, empty PATH and an
outside-checkout working directory. Both copies of the changed runtime/reference
match root source. SHA256SUMS SHA-256:
`ccf1ba121bcafd4e59a9303d2b924d73cdb1cdf833be8f5724e4925193d7e611`.
This is an unreleased integration build, separate from the returned candidate-02.
The original packet's final guard also passed (151 frozen inputs, 2,000 baseline
files, 114 payloads / 115 archive files). Exact log/source hashes are indexed in
the assessment receipt; no raw private streams are committed.

## Evidence limits

The returned RET1 green/complete manifest and matching installed guidance are
retained, but its first proposal/approval trace is absent. No fresh behavioral
model call measured the root-corrected wording. Five earlier consent failures
remain failures; later reported compliance does not erase them. Native autoload,
human approval, causal memory usefulness, the missing catalogue variants and
Windows policy execution remain outside this local verification.

Version remains 1.7.0. No commit, push, tag, publication, deployment or paid API
call belongs to this integration. OpenSpec remains development-only and is not
included as a dependency of distributed skills.
