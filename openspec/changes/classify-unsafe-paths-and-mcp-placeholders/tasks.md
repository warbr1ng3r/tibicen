# Tasks

## 1. Code

- [x] 1.1 Validate every requested and saved change path before the internal-state, write-boundary and freshness checks in `createProposal` and `applyPlan`; a missing path in a nonempty project keeps its existing refusal.
- [x] 1.2 Recognize complete MCP placeholder/reference values without weakening literal detection; keep raw-content and structured MCP rules consistent.
- [x] 1.3 Exempt a placeholder in the raw text of a proposed change only when the whole value is one; share the secret-like key rules and preserve unrelated guards.

## 2. Regression evidence

- [x] 2.1 Add CLI and unit regressions beside the existing contract tests and show them failing on the unfixed source and passing on the fix.
- [x] 2.2 Reproduce both defects with isolated-HOME CLI receipts before and after the fix, and confirm that a valid application path still reports `application-protected` and a literal MCP secret still reports `existing-inline-secret`.
- [x] 2.3 Add a unit regression for quoted and bare partial placeholders and a CLI regression through the real `proposal` command (exit 1, `secret-content`, value absent from stdout and stderr, nothing written); show both failing before the fix.

## 3. Verification

- [x] 3.1 Lint, formatting, type and full `pnpm test` gates on the final source.
- [x] 3.2 Independent review and candidate build.
- [x] 3.3 Lint, formatting, type and full `pnpm test` gates on the source with the raw-text correction, then freeze the candidate once.
- [x] 3.4 Re-observe `SECURITY-008` on the frozen candidate for both host formats and retain the author row in the follow-up packet.

## 4. Integration review

- [x] 4.1 Close integration review: retain known-token and narrow bare-text detection, recognize only complete MCP placeholder/reference values, reject partial/mixed literals without echo or writes, and verify proposal/apply plus the final source.

## 5. Complete follow-up integration

- [x] 5.1 Reproduce spaced literals, alternate secret keys, escaped JSON keys and the ordinary-infrastructure apply path; share the secret policy and add old-code-failing proposal/current-read/apply regressions.
- [x] 5.2 Close independent final review, full gates, standalone payload checks and the qualified follow-up assessment without regrading old cases.
