# Complete standalone lifecycle acceptance

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Run the existing optional portable lifecycle test against the current built dist,
on this host only, plus at most one disposable built-CLI memory scenario needed
to confirm current-versus-recorded diagnosis after completed setup. Use isolated
HOME and temporary projects, preserve original source/dist bytes and modes, and
retain commands, stdout/stderr and failed attempts under
`.evals-private/adopt-diagnosis-20261105/`. Root may act as the synthetic fixture
operator approving exact local digests; this is not human pilot approval or a
native agent observation. No network, model calls, paid API, auth changes,
existing user projects, release or source edits. Stop and report any defect to
root before changing implementation. Return exact outcomes and limitations.

## Answer

Portable lifecycle passed once: 3/3, zero skips, both copied skills, on darwin arm64
Node 24.15.0. It ran only its generated fixture application check. Additional
memory scenario passed 12 copied-CLI invocations: exact-digest refusal/approval,
preserved owner instructions and memory bytes/mode, legal later notes, current
broken connection versus recorded complete, read-only/default save refusal and
explicit saved-report equality. No model/native/network or user-application run.
All 198 source/test/resource files and entire dist remained byte/mode-identical.
The receipt wrapper's first reporter-format assertion error is retained; portable
ran only once and its successful log was reused. Results:
`.evals-private/adopt-diagnosis-20261105/lifecycle-acceptance-02.json` and
`lifecycle-command-receipts-02.json`. Disposable projects removed.
