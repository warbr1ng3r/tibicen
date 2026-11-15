# Product conclusions from the reliability runs

Reviewed 13 November 2026. This is a source/document assessment, not a new run or
release acceptance. The [registry](README.md) preserves historical per-run claims;
the [handoff](HANDOFF.md) states evidence availability, corrections and budget limits.

The useful result is a set of concrete reliability problems to fix. The quantity
of reported checks is not a reason to add more tools or claim universal support.
Keep the product's two scenarios: propose suitable agent infrastructure, apply
approved changes, and report what was actually checked.

## Ordered development priorities

| Priority | User problem and next work | Evidence and completion criterion |
| --- | --- | --- |
| 1. Approval reliability | Some agents treated “do it yourself” as permission to approve their own proposal. Clarify the distinction between interview autopilot and exact-plan consent; cover known failing forms. State the trust boundary honestly: matching `--approve` to a digest does not authenticate a human. | Registry S4-05, S5-03, S8-A. Preserve failing observations; a reviewed change must reach the consent decision point, wait without writes, and apply only after separately supplied exact consent. An unfinished read-only run is not a pass. |
| 2. Durable project rules and memory | Project sections were placed inside replaceable managed blocks; host-native memory sometimes replaced or preceded approved portable memory. Keep ownership explicit, connect the one selected store from actual host instructions, and give actionable recovery when the connection is missing. | R3, S3-03/04, S9-1c, S10-1, S12-5. Test owner-text preservation, selected-host entrypoints, no pre-consent memory writes, and new-plan+resume repair. Preserve the existing supported recovery flow before tightening validation. |
| 3. Bounded, inspectable execution | Long read loops, transport stalls, helper-model changes and delayed accounting obscured results and exceeded caps. Add offline transport/classifier/timestamp checks and conservative usage bounds before repeating paid probes. | R4, S2-03, S4-06, S6-01 and S7. Retain sanitized source identity, prompt/consent receipt, tool timeline, final status, cost uncertainty and cleanup for every new observation. A cap is a bound only when enforcement is demonstrated. |
| 4. Fresh delivery and small regression checks | A stale local distribution omitted a confirmed FIFO fix. Integrate the input hardening and keep tests independent of live models; bind the tested build to the source that will be released. | R0a, S13-3; retained source/tests. CI already builds and checks unpacked skills; `/dist/` is ignored. Verify exact candidate/artifact identity and FIFO refusal in standalone copies rather than adding a comparison against committed dist. |
| 5. Capability-based host support | The same project pointer is not auto-loaded everywhere; a brand/profile is not proof of discovery, execution or use. Add or refresh narrowly justified profiles, keeping explicit-read and no-exec limitations visible. | R9/R10, S2-01/02, S3-03 and the retained sandbox narratives. Document exact versions/paths and separately observe discovery, loading, proposal, native apply and fresh use. Do not turn Codex's hybrid run into full native acceptance. |

Substantial behavior changes need their own requirements, scenarios and tasks.
The current [roadmap](../../../DEVELOPMENT_PLAN.md) owns scheduling; this report
is the basis for those priorities, not a second live tracker.

## What these records do not establish

- Broad six-harness native completion: five harnesses have reported full cycles;
  Codex R9 has operator application and no recorded fresh-task result. Raw event
  streams and most graders cannot now be independently checked. Some sandbox
  narratives, recipes and checksum records remain.
- Universal causes or rates: reported self-consent is serious even without a
  causal system-prompt conclusion. Vacuous or truncated runs stay inconclusive.
- Bidirectional memory portability, all-model support, or attribution of recall
  solely to Tibicen when native memory was also read.
- All 218 original checks passing: the [coverage map](runs/PLAN-COVERAGE.md)
  aggregates scenario families and includes failures, partial coverage and gaps.
- New budget authorization: 100 RUB was the original total allowance; daily key
  limits are separate. Historical totals conflict and settlement is unknown.
- Measured human benefit. Real-project comparison remains voluntary postrelease
  research under the [vision](../../../PRODUCT_VISION.md#14-usefulness-and-quality-metrics),
  separate from technical checks.

Do not add a new memory framework, SDD stack, persistent service or silent updater
on this evidence alone. First make consent, preservation, handoff and recovery
predictable. The 90-day third-party trust policy and temporary fixture's `bool`
spec inconsistency require scope clarification, not automatic product features.
