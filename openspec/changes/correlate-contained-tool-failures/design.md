# Design

## Context

See [proposal](proposal.md). The session already parses bounded executor stdout and stops on the first error/nonzero exit. The owner pipes client requests into the executor without observing their identities. Exact Codex 0.157.0 source confirms separate RPC `id`, logical `params.processId`, matching `result.processId`, and exit `processId`/`seq`/`exitCode`/optional `sandboxDenied`. Historical IDs were discarded and cannot be reconstructed.

## Goals / Non-Goals

Retain enough metadata to distinguish a later failed operation from earlier successful commands. Do not retain command text, change failure policy, collect extra files on failure, retry native sessions, or alter distributed skills.

## Decisions

- Observe request bytes at the existing owner socket, before forwarding. A small session-local observer parses only request identity and the fixed `process/start` method; it never changes forwarded bytes. Keep implementation in the existing frozen source files so the profile's source-hash boundary stays complete.
- Hash validated IDs with a fresh per-session HMAC key and type/domain separation. Bound strings to 256 UTF-8 bytes, request buffering to 64 KiB per line and 1 MiB total, and tracking to 128 requests/processes. On malformed/oversized input or reused request/process identity, discard uncertain tracking for the session. Do not retain raw argv, cwd, env or payloads in maps or receipts.
- A matching start response confirms the request/process pair. An exit can identify the request only through this accepted pair. An RPC error can identify an observed start request without claiming a successful start. Missing/mismatched response stays unknown. Response/notification ordering is not a join key.
- Add a fixed nullable context to tool failures: operation, requestIdHash, processIdHash, startResponseObserved, sequence and sandboxDenied. Safe integers/booleans only; unknown facts remain null or explicitly unobserved. No context is added to successful receipts. First failure wins even if later messages arrive during cleanup.
- Keep all existing output framing, stop reasons, zero collection on failure, ownership checks and removal. No HTTP counts or historical cause inference. A command journal or generic tracing framework would retain more data than this problem needs.
- The context establishes an internally matched executor start/exit, not command attribution. Session HMACs cannot be joined to CLI command strings without another same-key observation. Neither command text nor the underlying cause is recoverable from this receipt alone.
- Forward the context through the standard setup profile's existing collection projection before its child-success assertion. Keep file-body hashes/modes and existing fields unchanged. Test the pure artifact boundary without introducing a live run or changing strict attempt records; its source remains covered by the setup batch's own freeze.

## Risks / Trade-offs

- Request observation sees sensitive input transiently → project no fields beyond validated identities; bounded buffers are discarded after parsing or disabling.
- Correlation can be absent after limits or malformed messages → retain unknown; stopping still occurs normally.
- Unit transport differs from live behavior → independently verify owner wiring with a local mocked socket; do not claim a new live successful task.
- A receipt alone cannot explain why a command failed → report identity/exit facts only; debugging commands remains separate work.

## Migration Plan

Additive development receipt context only; no persisted attempt-schema migration, release or skill version change. Rollback removes the observer/context. Preserve original native and operator records byte-for-byte.
