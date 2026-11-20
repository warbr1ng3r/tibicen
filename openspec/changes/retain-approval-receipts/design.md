# Design

## Context

`applyPlan` enforces content identity (`approvedDigest === digest(proposal)`)
and nothing else; see the packet boundary report for the full actor analysis.
The host exports no approval identity, so any claim to "authenticate the
approver" would be false. The smallest correction the evidence supports is
retaining what actually happened at the consent gate.

## Goals / Non-Goals

- Goal: make the consumed digest, channel, operation, root, session and time of
  every approval consumption mechanically inspectable after the fact, and keep
  refused consent attempts visible.
- Non-Goals: authenticating an external person, gating previously-allowed
  applies, new services/daemons/accounts/vendors, changing the proposal format
  or the preset schema.

## Decisions

1. **Receipt shape** (one object, added as optional `approvals` arrays):
   `{ outcome: 'consumed' | 'refused', operation: 'apply' | 'resume',
   channel: 'cli --approve' | 'programmatic', approvedDigest: string | null,
   proposalDigest: string, root: string, sessionId: string | null, at: string }`.
   `approvedDigest` is what the actor presented on the approval channel
   (`null` when absent); `proposalDigest` is the digest of the exact compiled
   plan bound at the gate. For a consumed receipt they are equal by definition
   of the gate; for a refused receipt their difference is precisely the A3
   detector.
2. **When consumed is recorded**: after the consent gate passes and the session
   object is first persisted. A failure after that persistence leaves the
   receipt with the incomplete session. Preflight failures before persistence,
   including stale plans, do not create a consumed receipt.
3. **When refused is recorded**: attached to the thrown `consent-required`
   error (surfaced by the CLI error envelope as `error.approval`), including the
   saved state session id, or the last manifest session id for a stateless
   resume. A new apply without state does not borrow a previous session id.
   Refusals never write the project:
   the CLI's `runtimeHooks`/`bindRunner` can refuse before `applyPlan` runs, and
   an existing invariant requires a refused resume to leave saved state
   byte-identical — writing a refusal log would itself be an unapproved
   `.tibicen` write.
4. **Channel label**: the CLI supplies `'cli --approve'`; library callers
   default to `'programmatic'`. These are the only accepted labels. A caller
   controls its supplied label; it is not proof of identity or trusted origin,
   and nothing is inferred from executor prose.
5. **Surfacing**: `apply`/`resume` result, `status`, `report` expose `approvals`
   from the live state, falling back only to its matching manifest session
   summary. Without state, status uses the last manifest session;
   `finalize`/`writeManifest` copy the receipts into the persisted session
   summary.
6. **Bounds and compatibility**: at most the last 8 receipts are retained in a
   session state; `approvals` is optional everywhere and lightly validated
   (`tamper-suspect` on invalid evidence) at state and manifest boundaries.
   States and manifests written before this change load unchanged.

## Risks / Trade-offs

- Consumed attempts add timestamps. Refused attempts still leave state bytes
  unchanged; regressions check that boundary.
- The refusal record in the error envelope is additive JSON; consumers that
  match only `error.code` are unaffected.
- A malicious executor can delete receipts along with any state file; receipts
  are evidence retention, not tamper-proof security, and the manifest copy
  survives state cleanup.

## Migration Plan

None needed: optional fields only; no schema version bump. Old sessions simply
have no receipts, and their resume appends new ones.

## Open Questions

None blocking. A future host that exports approval identity could extend
`channel` and promote receipts to enforcement; that decision is deliberately
out of scope (recorded in the proposal).


## Integration follow-up — 20 November 2026

`core/approvals.ts` holds the single bounded consumed-journal validator and
channel check. The channel is validated before persistence. State and manifest
reads reject malformed lists, persisted refusals, mismatched/nonstring digests,
foreign session IDs and unsupported channels. Every consumed receipt has equal,
non-null digests and its owning session ID. The last active receipt also matches
the current proposal root and digest; earlier entries may name prior plans and
absolute roots, including Windows roots read on POSIX and vice versa.

Historical manifest journals do not require today's checkout path: copied or
moved projects retain readable history, and a stateless resume can append a fresh
current-root receipt without changing the session ID. The existing proposal/root
consent gate is unchanged. Missing journals remain unknown legacy evidence.
Fallback and status/report lookup use the matching session ID, never an unrelated
last manifest session. The finalized list is checked before the first state write.
