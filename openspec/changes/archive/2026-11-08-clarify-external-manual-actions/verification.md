# Verification

The two shared references now distinguish mandatory external human work from available agent reading and deferred behavior checks. The clarification does not change runtime finalization or prove improved model behavior.

- Strict validation of `clarify-external-manual-actions`: passed.
- Node24.15.0 `--test tests/core/cli.test.ts tests/core/integration.test.ts tests/core/recovery.test.ts`: **58 passed, 0 failed, 0 skipped**.
- Existing tests preserve `complete` with unverified checks, genuine pending Codex MCP actions, and required-action retention across resume.
- Fifteen local reference links resolve. A bounded before/after check preserved fifteen runtime/test/entrypoint/version and accepted-observation files, including the unchanged proposal digest `5aa5774c…` and its pending manual actions. The frozen 1.5.2 candidate retains all 111 file hashes and modes.
- Independent Ponytail review: **Ship, no findings**. Receipt SHA256: `938ea1ebbf9c81bbced2c89e225ba7526236cec91c95fe0290df10023a957080`.

Private test log SHA256: `bc85cf8ba90f31a91074ebdf8c0f58299fec62252460c03e58fc66bf13752a36`. The focused validation added no prose-matching tests and ran no model or historical regrade.

Root integration gate: `pnpm test` passed with **1,055 passes, one existing skip, zero failures**. Log SHA256: `9f7c32bbe95391a69023c874f7148fd28eb56fdda179d6da63e6c2a3e1880ec1`. This includes lint, formatting, types, site build, strict specs and offline tests. No browser run was needed for this guidance-only correction.

Both built skills passed self-test and all 110 checksums were verified. Only the two corrected references in each skill differ from the frozen published payload (four files). This is an unreleased working build, not a replacement of 1.5.2.

A separate fresh working-build proposal observation preserved all 118 inputs and produced a nine-line AGENTS proposal with no manual actions; future reading/task checks remained gaps. The actual proposal passed independent review. It was not approved or applied and does not establish a controlled improvement or general compliance. The [workflow report](../../../../docs/evals/results/2026-11-08-normal-workflows/README.md) records this generation separately from published 1.5.2 observations.
