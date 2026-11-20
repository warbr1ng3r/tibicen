# Tasks

- [x] 1.1 Record the observed executor→host→controller authority route and each
  value's creator/reader/verifier in the packet boundary report; state that the
  host exports no approval identity and a matching digest proves content
  identity only.
- [x] 2.1 Add the optional approval receipt structure to session state and
  manifest session summaries with light structural validation; keep fields
  absent before the change loadable.
- [x] 2.2 Retain a consumed receipt when apply/resume passes the digest gate
  and persists the session, binding compiled digest, presented digest,
  operation, channel, root, session id and timestamp; bound the retained list.
- [x] 2.3 Attach a refusal record to the `consent-required` error envelope;
  leave the project byte-identical on refusal, naming the saved session id when
  saved work exists.
- [x] 2.4 Surface receipts in the apply/resume result, `status`, `report` and
  the manifest session summary, with the CLI argv channel bound as
  `cli --approve` and library callers as `programmatic`.
- [x] 3.1 Add model-free adversarial regressions: executor-written approval
  text and self-consent plan fields; own/default questionnaire answer and tool
  permission as purported approval; wrong digest; wrong root; replayed
  consumption after completion; plan modified after grant; stale plan after
  owner edit; plus the valid exact external grant positive control.
- [x] 3.2 Add the compatibility regression: a saved session from before the
  change (no receipts) still loads and resumes, appending new receipts.
- [x] 3.3 Prove the new receipt regressions fail on the pre-change
  implementation via a disposable old-implementation copy under the packet
  evidence scratch directory; retain the failure output.
- [x] 4.1 Run the focused touched/added test files plus lint and typecheck for
  the changed files; run strict OpenSpec validation for this change; record
  actual counts and exits (full `pnpm test` belongs to the coordinator gate).
- [x] 4.2 Keep the change evidence-only in wording: no claim that receipts
  authenticate an external approver; record the not-shipped stronger default
  contract as a separate proposed decision in the proposal.


## Integration follow-up — 20 November 2026

The checked tasks above preserve the returned ZCode checkpoint. These tasks
record the separately authorized root integration fixes.

- [x] 5.1 Reproduce invalid input channels, contradictory consumed receipts,
  damaged manifest inheritance and foreign-session legacy fallback before fixes.
- [x] 5.2 Share journal validation at writer/state/manifest boundaries; inherit
  only matching session history, preserve historical roots after project moves,
  and bind the latest active receipt to the current root and proposal.
- [x] 5.3 Run receipt/recovery/CLI focused regressions, lint, formatting, core
  typecheck and strict change validation; record root results and RU companions
  separately from the returned checkpoint. Root owns the merged full gate.
