# Verification — await the Codex terminal outcome

Date: 8 November 2026. Scope: development collector and its existing offline caller tests; no distributed-skill behavior change.

## Pinned contract

Codex `rust-v0.157.0` resolves to `00c972ed5d6ff6499317fd41b7f23605b8e6850d`. The [JSONL emitter](https://github.com/openai/codex/blob/00c972ed5d6ff6499317fd41b7f23605b8e6850d/codex-rs/exec/src/event_processor_with_jsonl_output.rs#L447-L458) emits top-level `error` while remaining Running and omits `willRetry`. The [exec loop](https://github.com/openai/codex/blob/00c972ed5d6ff6499317fd41b7f23605b8e6850d/codex-rs/exec/src/lib.rs#L1261-L1324) distinguishes retryable notifications internally and enforces unsuccessful exits. The [SDK](https://github.com/openai/codex/blob/00c972ed5d6ff6499317fd41b7f23605b8e6850d/sdk/typescript/src/thread.ts#L97-L140) waits for subsequent records and explicitly handles `turn.failed`. Schema comments calling errors fatal do not expose this distinction.

The confirmed defect was premature collection shutdown on every generic error. The underlying native cause and missing terminal tails of historical Docs observations remain unknown; those observations are unchanged.

## Red and green

Before production edits, the real-caller stub regression returned **33 tests: 27 pass, 6 fail**: five failing subcases plus their parent. Generic error followed by a completed turn reproduced the defect.

After repair, four focused test files passed **57/57**, with no skips. Coverage includes recovery, failed/incomplete turns, nonzero exit, explicit 401/403, callback redaction/throw, malformed results, ownership and cleanup. Targeted Prettier, ESLint and core typecheck passed; the initial test-only union-narrowing error was corrected.

Generic errors now remain hash-only observations. Typed authentication/access errors, failed turns and existing protocol/containment failures still stop immediately. Success still requires completion, exit 0 and every existing deadline, output, source/configuration and cleanup guard. No retry was added.

## Review and integration

Independent Ponytail verdict: **Ship**, no findings; private local receipt SHA-256 `98f91d954fb9d4024ec5f8adfb8db6e7a068162ff049904a174f21f555baed48`.

Stable SHA-256:

- `scripts/evals/contained-codex.ts`: `34cc4fa7062168b1382d9526ffbbbd32e43c2fe62c0d3f8630ead65589daca5f`
- `tests/evals/contained-codex-result.test.ts`: `4cf35d023b33d31589a9aaded384decdb1a3f88328125d906f3c170a30908739`

**Repository gate passed: 1,055 tests passed, zero failed, one existing skip (1,056 total). All110 built skill payloads match published1.5.2 bytes.** Full-gate log SHA-256: `f99691b2df1d4a4dfcaa02d64f67740a5b6ae5cf59cb4b3843ea47b72e3ab31a`. No new native/model/auth/container call ran for these fix checks. Offline success does not prove a native workflow repair; subsequent observations require a new prospective source binding.
