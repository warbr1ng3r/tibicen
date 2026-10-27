What this change does: It simplifies session completion and recorded-file checks, adds an offline CI gate, and splits the evaluation code by job. It also adds a public source-check command and makes native agent approval, planning and evidence more explicit.

Reviewed all tracked changes and new, non-ignored files against `bdd889d9f4f626daec1bf10057fa1003d2e2a252`. The expected load is one local CLI user with interrupted and resumed sessions, plus bounded evaluation workers. All three findings below were reproduced and fixed before committing.

## Must fix

1. **A pending permission change is treated as already applied** (`scripts/verify/scope.ts:78`). Fixed.
   - **What this is:** A component can change its executable permission while keeping the same file bytes. Verification must distinguish the approved future state from the state already written.
   - **Problem:** Matching content hashes marked the change complete before its permission write. After an interruption before that write, recovery reported pending while verification demanded the future permission and reported a false mismatch; an older same-hash receipt could cause the same error.
   - **Fix:** Compare the known file permissions as well as content for unchanged files and applied receipts. Keep the previous byte-only rule when old records have no permission field; cover interruption before and after writing, resume and an older receipt.
   - **If we skip it:** Users see a false infrastructure error for a correctly pending operation and cannot trust the verification result during recovery.

2. **Repeated operations lose their final position in session history** (`scripts/core/finalize.ts:37`, `scripts/core/apply.ts`). Fixed.
   - **What this is:** Resumed sessions combine earlier operations with newly approved ones. The last approved operation for a file defines the expected final state.
   - **Problem:** Replacing a duplicate in a JavaScript Map keeps its first position. The real sequence A → B, B → A, A → B was stored as A → B, B → A; a later empty improvement expected A although the approved file contained B.
   - **Fix:** Delete a repeated history key before inserting its latest value, using one shared helper in apply and finalization. Apply this rule to file, component, shared-rule and process histories; regressions cover an entrypoint and an owned component through interrupted cleanup and an empty improvement.
   - **If we skip it:** A successful recovery can produce a wrong recorded baseline and false errors on the next verification.

3. **Explicit acceptance of current local content is discarded** (`scripts/core/plan.ts:306`). Fixed.
   - **What this is:** An owner can review a local edit and explicitly propose its exact current content as the new baseline. This acceptance still needs to appear in the approved plan.
   - **Problem:** The planner removed the operation because its requested bytes and permissions already matched the file, without checking the recorded baseline. If the baseline was A and the owner accepted local B, no operation was recorded and verification kept reporting B as drift.
   - **Fix:** Retain an explicit full-content change when the recorded content or known permission differs from the actual file. Keep ordinary clean no-ops and managed-block handling unchanged; test entrypoint and owned-component acceptance, a subsequent clean no-op and rejection of a stale plan.
   - **If we skip it:** Owners cannot accept a valid local edit without manufacturing another content change.

## Verification

- Before the fixes, five of the first six regression cases failed. After the fixes, all seven new cases passed; the full recorded-scope file passed 17/17.
- `pnpm test`: 585/585 Node tests passed, zero skips, with lint, formatting, core/Astro types, site build and strict active/archived OpenSpec validation.
- `pnpm build`: passed; 84 delivered files. The unpacked copy passed all 84 checksums and both standalone self-tests outside the checkout with an empty PATH.
- The unpacked CLI also accepted exact current owner content and passed standalone verification.
- Independent agents reviewed core/recovery, native protocol/evidence, and matrix/profile/quality code. The matrix/profile reviewer ran 138 focused tests. The native reviewer ran 30 focused tests before a model capacity failure; another independent reviewer completed that source review. The core reviewer checked the fixes again and passed all seven targeted regressions.
- Read the pinned official Action definitions and checked their workflow inputs. Scanned candidate files for common credential/private-key patterns; private evaluation artifacts and builds remain ignored. No new live model requests were made during this review gate.

Verdict: Ship.

Not checked: remote Linux CI, new browser runs, Windows process groups, simultaneous writers to one project, live acceptance of this exact snapshot, human evaluation and public release. Earlier live results retain their original source hashes and limits.
