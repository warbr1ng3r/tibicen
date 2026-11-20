# Proposal

## Why

The retained 1.7.0 assessment keeps approval failures A2/A3/B2/C3/D1: self-created,
fabricated or absent external approval, and A3 executed a different digest from the
controller-approved one. Investigation of the real route (see the packet report
`reports/APPROVAL_BOUNDARY.md`) confirms why: `applyPlan` checks only
`approvedDigest === digest(plan)` — content identity. Both sides of that equality
come from the executor, so an executor that applies plan Y while the controller
approved digest X passes the gate. Until now nothing on disk recorded which digest
was consumed for which applied plan, through which channel; refusals left no trace.
The ZCode host exports no subagent tool-event stream and no approval identity, so
no trustworthy external-approval boundary can be enforced inside the product today.

## What Changes

- When `apply`/`resume` consumes an approval (the digest gate passes and the
  session is persisted), retain a compact source-bound receipt binding the exact
  compiled proposal digest, the digest presented via the approval channel, the
  operation (`apply`/`resume`), the channel (`cli --approve` when invoked through
  the CLI, otherwise `programmatic`), the absolute project root, the session id
  and an ISO-8601 timestamp.
- When consent fails (missing or mismatched digest), attach the same structured
  refusal record — presented digest versus the required digest of the plan
  actually offered — to the `consent-required` error envelope. Refused attempts
  never write the project: `.tibicen` writes are themselves part of the approved
  service-write contract, so a project with saved work stays byte-identical and
  the refusal record names the saved session id instead.
- Surface retained receipts in the `apply`/`resume` result, `status`, `report` and
  the manifest session summary, so a controller can mechanically compare its own
  approved digest with the digest the executor actually consumed.
- Bound the retained receipt list (last 8 per session state) to keep state compact.
- Receipts are evidence of content identity and channel only. Approver identity
  stays unknown; no authentication, service, vendor or resident process is added.

## Capabilities

`verification-and-delivery`: approval consumption retains source-bound receipts
that distinguish the consumed digest, channel and refusal record.

## Impact

Source-only, additive change in `scripts/core/{types,apply,finalize,recovery,components,approvals}.ts`
and `scripts/tibicen.ts`; distributed guidance and the strict preset schema are
untouched. `approvals` is optional in state and manifest session summaries, so
saved sessions and manifests from before this change load unchanged; ordinary
one-proposal/one-approval flow and all CLI options stay as they were. This is an
evaluation-evidence improvement, not product enforcement of an external approver:
the CLI still cannot authenticate a human, and the receipts must not be described
as secured consent. A stronger default contract (for example, refusing applies
whose channel is `programmatic`, or requiring a host-issued token) would break
existing flows and is deliberately not shipped; it belongs to a separate decision
if a host ever exports a real approval identity.


## Integration follow-up — 20 November 2026

Independent root review reproduced four data-consistency gaps in the returned
patch: invalid caller channels could create unreadable state, consumed receipts
accepted contradictory digests/session IDs, legacy fallback could import another
session, and manifest receipts bypassed state validation. Integration adds one
small shared validator and matching-ID fallback in apply, status and report.
Only the two documented channel labels are accepted before persistence. Missing
legacy journals remain supported. Historical absolute roots remain readable
across project moves; the latest active receipt binds the current root/digest.
These checks detect inconsistent evidence, not an external approver's identity.
The original packet and its dated verification checkpoint remain unchanged;
see the [root assessment](../../../docs/evals/results/2026-11-20-consent-coverage-assessment/README.md).
