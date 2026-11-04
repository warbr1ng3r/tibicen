# Maintaining Tibicen rules and adapters

The confirmed core/adapter maintainer, [@warbr1ng3r](https://github.com/warbr1ng3r), owns the source review below. Existing security responsibility is recorded in [SECURITY](../SECURITY.md); it does not appoint a private conduct recipient.

Review at least monthly and after a material supported-agent, instruction-loading, skill/MCP, process-tool, installer or security-advisory change. The [3 November 2026 review](evals/results/2026-11-03-maintenance-review/README.md) exercised this procedure for official documentation and local CLI metadata. The next monthly review is due by **3 December 2026**, or earlier on a material change. This document creates no automatic schedule.

## Review procedure

1. **Fix the scope.** Record the Tibicen source/payload binding, affected agent/tool versions and task. Read the applicable official sources in `scripts/discovery/practices.ts`, the [agent matrix](../references/agent-matrix.md), and upstream release/security material for the affected process or installer. Record unavailable pages and redirects; a search snippet is not a completed source check.
2. **Compare, then decide.** Compare the current guidance with Tibicen's pinned contract and useful project decisions. Record either a concrete changed recommendation and affected paths, a justified no-change result, or a gap. Native initialization/audit is a valid alternative. Current vendor documentation does not by itself widen Tibicen's supported versions or authorize removing a working bridge.
3. **Keep evidence levels separate.** Documentation establishes published guidance; local `--version`/`--help` establishes only the inspected executable's metadata/options. Positive selected-version instruction loading and useful work need their own observed evidence. Preserve unknowns, failures and original build attribution in the [engineering assessment](evals/ENGINEERING_ACCEPTANCE.md).
4. **Check the affected contract.** For a changed recommendation, identify the corresponding init/adopt, preservation, update/recovery and loading/use checks before releasing it. Use the existing focused checks and candidate procedure in [RELEASING](RELEASING.md). A check needing unavailable trust, authorization or a separately bounded agent run stays unverified with a reason; this procedure grants no model budget, installation or publication permission.
5. **Review and hand off.** Obtain independent review of the evidence and exact change. Update the versioned rule/adapter only through its normal change and release process. Report actual coverage and limits; retain old outcomes. A useful source review is not measured human benefit or full MVP acceptance.

Each dated review records:

| Field | Required content |
| --- | --- |
| Source and date | Primary URL, access date, relevant upstream version or mutable-page status |
| Scope and binding | Material actually read; exact local source/payload/tool where applicable |
| Evidence | Direct source finding or CLI receipt; documentation, metadata and behavior distinguished |
| Decision | Changed recommendation, no change or gap, with its reason and affected paths |
| Follow-up | Necessary checks, independent reviewer/result, remaining limits and next review date/trigger |

## Reporting and checksum publication

Reporting follows the [CoC](../CODE_OF_CONDUCT.md): nonsensitive project matters use public issues/PRs; private GitHub Support reports cover platform-rule violations on GitHub; vulnerabilities go privately to the confirmed recipient in [SECURITY](../SECURITY.md). The former unfulfilled general private conduct-inbox promise is replaced, not declared satisfied. No alternate is appointed; an implicated maintainer must not decide a complaint about their own conduct. Do not post sensitive details publicly. Form/notification delivery has not been newly tested.

The [local index](../landing/public/maintenance/index.json) is prepared for a separate committed Pages artifact/publication at https://warbr1ng3r.github.io/tibicen/maintenance/index.json, on an HTTP origin distinct from release attachments. **Publication and returned-byte verification are pending.** Administration remains shared with GitHub/repository releases: this channel can cross-check changed attachments while the Pages record stays trustworthy, but cannot protect against compromise of their shared administration/provider, authenticate an initially compromised source or replace a code audit.

The initial record binds the original published 0.1.0-alpha.1: retained downloaded manifest/archive bytes were independently rehashed against the dated release receipts, with all 86 archive payload sums checked. Current public release/raw-manifest text corroborates the references; connector/DNS/release-asset retrieval failures prevented a fresh binary download. These are original immutable-byte facts, not a claim about unverified current downloads or a new public 1.0.

Keep each published version/warning object unchanged. Append a version only after actual publication, with full source/distribution commits, publication date, exact manifest/archive URLs and SHA-256 and release notes. Append dated warnings with stable IDs, affected versions and safe action; link a superseding version/warning when available. Correct a bad old record by a new warning, not replacement. An empty warnings array does not establish source safety. Reject placeholders and unpublished future entries; unavailable facts belong in preparation notes.

Use the existing manual [release procedure](RELEASING.md) and [channel tasks](../openspec/changes/define-maintenance-reporting-and-checksum-channel/tasks.md). Before a working-channel claim, separately authorize deployment, bind the committed site/source and deployment, compare returned index bytes and named assets, and record actual route accessibility/limits without submitting reports. The [readiness ledger](evals/V1_READINESS.md) retains open public-channel and full technical release dependencies.
