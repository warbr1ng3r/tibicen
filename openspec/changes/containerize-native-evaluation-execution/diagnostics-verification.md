# First contained failure diagnostics

Offline follow-up, 2026-10-28. This fixes missing diagnostics in the evaluation harness; it does not change the distributed Tibicen skills or the published alpha.

## Observed defect and change

The [stopped native Ponytail task](../../../docs/evals/results/2026-10-28-published-alpha-native/README.md) retained `tool-failure`, but not the triggering executor event. Its original cause and container write set remain unknown. Those records have not been rewritten or replayed.

A deterministic test through the actual container session reproduced the loss: a split JSON-RPC error followed by a process exit stopped the session, but the receipt lacked the first error code. Before the fix, five existing tests passed and this assertion failed with `undefined` instead of the expected projection.

The receipt now includes `toolFailure`: null, `{kind: 'rpc-error', code: number|null}`, or `{kind: 'process-exit', exitCode: number|null}`. Only safe integers are retained. No arbitrary method, message, ID, command, output or nested payload is copied. The event that initiates stopping wins; ignored error -32004 and successful exits keep their existing behavior. Failure still collects no project files, and stop/removal checks remain unchanged. This field describes the observed event, not a diagnosis of its underlying cause.

The direct caller also returned `sourceUnchanged: false` when cancellation prevented full post-run profile validation. It now returns null on rejection and true only on successful validation; a passing run requires true. Null means unverified, including an unavailable check or a detected mismatch; it is not a claim that the source changed. No caller in the repository relies on the old false value. Existing historical outcomes are preserved.

## Verification

The actual caller was exercised from an isolated copy with inert dependencies. Its successful, cancelled and unavailable-validation cases first reproduced `false !== null`, then passed after the fix. The test also verifies receipt propagation and excludes an arbitrary validation-message canary. This checks caller control flow, without executing a CLI or model.

Focused Node 24.15.0 checks passed: 30/30 across the session, profile, subscription guards and caller-result tests. Separate archive checks passed 4/4. Independent `ponytail-review` found no actionable findings: **Ship**, for one bounded developer evaluation session.

`pnpm test` passed with Node 24.15.0 and pnpm 11.21.0: lint, formatting, types, site build, strict active/archived OpenSpec validation, distribution build and **700/700 offline tests** (Node tests: 68.7 seconds). The 86 distribution payload files plus their checksum manifest, the original published-alpha report and retained native-case files matched all 168 frozen hashes after the build. No browser suite was repeated for this eval-only change.

## Limits

No new model/API/native session, credential read, Docker run, authentication change, commit or publication was performed. Real Docker lifecycle observations remain those of the earlier verification. New behavior is covered by offline mocks and the actual caller with inert dependencies. Browser checks are outside this eval-only change. A future live attempt needs a separately reviewed fresh freeze and cap; the old failed attempt cannot establish whether this change captures its missing cause.
