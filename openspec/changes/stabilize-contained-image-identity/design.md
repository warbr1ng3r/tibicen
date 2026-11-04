## Context

Independent diagnosis compared twelve captured responses. The current fingerprint hashes the whole inspect JSON, including auxiliary backend/API fields. The guard fails safely but prevents an authorized observation without proving that the execution image changed.

## Decisions

- Use a fixed fingerprint version, image ID, OS, architecture, variant or null, full Config and full RootFS.
- Canonicalize object keys recursively; preserve array order. Retain all fields inside Config and RootFS rather than selecting only the entrypoint.
- Require valid identity shapes, including a nonempty ordered array of SHA-256 layer IDs. Keep the existing pinned image, Linux arm64, root and watchdog checks.
- Keep canonicalization local to the standalone profile to avoid importing an unrelated runtime dependency closure.
- Freeze the new source/fingerprint before another independently reviewed live attempt. Do not rewrite or retry the stopped skill case.

## Validation

Exercise the actual profile inspection/validation seam with both equivalent metadata envelopes and key reordering. Reject changed configuration, layer identities/order and missing or malformed required fields. Run focused checks, independent review and the full offline gate before integration. Verify distributed payload equality.
