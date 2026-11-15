# Design

## Context

See [proposal](proposal.md). The current private recorder sees native CLI
`error`/`turn.failed` events. The executor can stop first: session stop clears
correlation and notifies the runner, which cancels the CLI. The old apply's
missing command/stderr cannot be recovered. An inspected local executor source
snapshot uses output-based likely-denial classification. Its correspondence to
the installed binary is unverified; the final control tests the installed route.
The flag alone does not explain which permission failed.

## Goals / Non-Goals

Retain actionable private failure context at its source, without changing the
execution boundary. No new runner/provider, retry, permission change, general
transcript recorder, raw argv/stdout capture, distributed code or historical fix
claim. Three finite model-free controls are allowed; models/auth/paid API are not.

## Decisions

- Reuse session-scoped request/process correlation and add one synchronous
  failure-only hook in session input. The contained runner supplies the existing
  private recorder only when opted in. Snapshot before stop clears state; catch
  recording faults so original failure and cleanup remain authoritative.
- Observe validated `process/output` envelopes for sequence even when stdout is
  discarded. Buffer only accepted-process stderr. Clear on ordinary exit and
  correlation invalidation. Fixed limits: 8 pending buffers, 16KiB per process,
  64 KiB total. Overflow withholds complete text; retaining a raw prefix could
  split a credential before exact-value redaction.
- Require canonical base64, monotonic safe sequence and strict UTF-8 at failure.
  Report fixed gaps for invalid/uncorrelated/overflow/empty text. Reuse existing
  HMAC identities; never attribute executor-wide stderr to a process.
- Extend the same exclusive 0700/0600 private writer and final 1024-byte redacted
  message limit with a versioned `executor.error` record and fixed metadata.
  Retain matched RPC error message/code as RPC data, not process stderr. The
  ignored not-found RPC code and ordinary nonzero exits remain nonterminal.
- Keep the recorder's standard-library implementation independent of the product
  module graph. Importing its shared policy from the session must not load
  product validators or package metadata into an isolated metadata fixture.
- Source/policy hashes bind the change to future freezes; old freezes and
  observations stay unchanged. Red tests use real owner/session handling with
  existing Docker/socket mocks; a separate real-RPC control uses the supported
  container permission profile, not an invented restricted-filesystem profile.

## Risks / Trade-offs

- Error text can itself contain private project data → private/untrusted storage,
  fixed bounds, known credential redaction and no universal-secret guarantee.
- Output/correlation uncertainty → text withheld with an explicit gap; execution
  still forwards bytes and follows existing terminal policy.
- Callback/write faults during teardown → recording failure remains visible and
  cleanup is unconditional; do not reinterpret the executor fault.
- Raw controls can use the wrong inner permission profile → retain negative
  controls honestly and validate the native profile before the final control.

## Initial model-free controls

An unsandboxed RPC EACCES returned ordinary exit 1 / denial false. A deliberately
restricted-filesystem managed profile failed before the child because unprivileged
namespaces were unavailable; it also returned denial false. Neither reproduces
the historical native flag, nor is either a product defect. The third allowed
control will use the existing native container filesystem/network profile after
the offline regression fix; do not change containment to obtain a pass.
