# Verification

[Русский](verification_ru.md)

## Retained returns

The first coverage return and selected follow-up retain their original grades,
candidates and failed attempts. Root verified both patches and frozen payloads.
The [first assessment](../../../docs/evals/results/2026-11-26-coverage-assessment/README.md)
and [follow-up assessment](../../../docs/evals/results/2026-11-27-coverage-followup-assessment/README.md)
separate those dated observations from local integration. No original failure is
upgraded by a later fix.

Initial root review fixed prefix matching in structured MCP inspection. The
follow-up then found a different raw-content path: fix-01 rejected a suffixed
placeholder without spaces but still echoed spaced literals and AUTHORIZATION.
Raw scans also missed escaped JSON secret keys; generic infrastructure apply could
write the literal even when MCP apply refused later.

## Complete local correction

Secret-key and strict whole-placeholder rules live in one policy module and are
used by both guards. The raw scanner decodes each quoted key/value occurrence,
including JSON escapes, instead of collapsing an object through JSON.parse; duplicate
keys or duplicate parent members cannot conceal an earlier literal. Complete encoded
placeholders remain exempt. Known-token/private-key detection and the narrow bare
non-JSON placeholder-plus-word check remain. Arbitrary bare non-JSON literals and
unknown semantic key names are not generalized secret detection.

Two new regression tests fail on the incoming fix, then pass on the correction.
They cover spaced values, alternate keys, escaped and duplicate JSON, positive
encoded placeholders, real CLI proposal output, reading current files, and valid
digest-bound approved apply for AGENTS.md and both supported MCP paths. Refusals
show no literal and preserve file bytes, state and isolated HOME. Independent code
review exposed the duplicate-key and encoded-placeholder edge cases before closure.
The three focused test files pass 46/46; six original CLI reproductions now refuse.

The missing-path scenario remains limited to nonempty projects. Empty init retains
its pre-existing unsafe-path refusal; nonempty init/improve use application-protected.
Full final checks, independent verdict and standalone candidate identity belong in
the follow-up assessment receipt. This integration makes no fresh agent-flow, native
loading, human-benefit or causal claim. Version 1.8.1 remains unchanged and no commit,
push or publication is included.
