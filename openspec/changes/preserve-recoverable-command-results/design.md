# Design

## Context

See proposal.md for motivation. The pinned official Codex source is revision ac21625ddf7f9dd5f34b2802212cf20295fdff95 (0.157.0). Its unified execution manager returns ordinary command exit codes as tool output. The executor protocol represents process/exited with string processId, u64 seq, i32 exitCode and optional nullable sandboxDenied; the core treats absent denial metadata as false without proving a measured denial result.

The earlier correlate-contained-tool-failures change deliberately preserved the former stopping policy. This separate change supersedes that policy prospectively; its historical tests and receipts remain evidence for their original source freeze.

## Goals / Non-Goals

**Goals:** match ordinary Codex recovery semantics while retaining byte-transparent transport, finite execution and verified owned-container cleanup.

**Non-Goals:** identifying the unknown M1 argv, installing speculative missing utilities, regrading old attempts, changing image/configuration/permissions, automatic retries or granting new native budget.

## Decisions

1. Classify process/exited from the trusted owned executor by its pinned schema. A processId string, safe nonnegative integer sequence and signed 32-bit integer exitCode are required. sandboxDenied can be absent, null or boolean. A valid result with denial other than true is forwarded unchanged and is not a terminal toolFailure, regardless of exit code. Explicit denial or malformed fields remain terminal. Existing unknown extra fields remain allowed by the upstream schema.
2. Diagnostic correlation remains optional. Its bounded maps can disable themselves without stopping a valid command. A second accepted-ID registry adds no authority boundary on this single trusted transport and would introduce new false failures from diagnostic resource caps. An unmatched valid result never proves a matched start.
3. Ordinary nonzero results remain visible in CLI events; they never independently establish task success. Terminal CLI state, collection, independent behavioral grading, preservation and cleanup still determine acceptance. Do not catch, rewrite or suppress the command's actual exit code.
4. Prove the seam before editing runtime: synthetic unit regression and one owned 30-second model-free owner-socket run must fail on exit1 followed by a required second command. Run the same reviewed driver once against the fix, in a separate evidence directory, and require the second command and cleanup to pass. No model or credential is involved.
5. Keep all Docker creation restrictions, request forwarding, file collection allowlist and deadline unchanged. No image repair is bundled with this policy fix. A missing helper remains a separate candidate explanation, not the established cause of either historical attempt.

## Risks / Trade-offs

- Ordinary failed commands may consume the existing session deadline while the agent recovers → keep the finite whole-session bound and final checks; do not increase it here.
- JavaScript cannot represent all u64 sequence values exactly → reject unsafe integers rather than infer ordering from rounded values.
- Missing sandboxDenied is unknown metadata → preserve null diagnostic meaning while following upstream ordinary-result semantics.
- A green model-free control proves recovery transport only → report native task and memory behavior separately, without upgrading failed attempts.
