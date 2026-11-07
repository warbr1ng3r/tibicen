# Tibicen 1.5.1 release report

**Preparation in progress; 1.5.1 is not published.** The current public release
remains [1.5.0](../2026-11-07-release-1.5/README.md). Candidate identities, checks
and public results below stay pending until their actual receipts are reviewed.

## Scope and authorization

1.5.1 is a compatible patch. Proposal guidance separates exact user-file diffs
from generated service records: disclose their paths, purpose and generated
fields; clarify a demand for unknown future journal bytes while remaining
read-only. Exact consent still leads to the unchanged CLI plan and real apply,
without a direct-write fallback or self-approval.

The development evaluator preserves declared ordinary file permissions through
staging, input freezes, setup continuation and independent checks. Omitted modes
retain `0644`; the fixed maintained setup fixture still requires `AGENTS.md`
`0644` and private service files `0600`. This is a development-tool correction,
not broader distributed write scope. Persisted schemas, the approval contract
and existing project data remain compatible. No migration or automatic update
is introduced. See the [change](../../../../openspec/changes/preserve-first-run-consent-and-modes/proposal.md)
and [draft release notes](release-notes.md).

The owner explicitly requested review, commit and publication of 1.5.1. The
release effort (`../../../../.scratch/release-1.5.1/map.md`; private development record; excluded from public source) and
dashboard (`../../../../.scratch/release-1.5.1/dashboard.md`; private development record; excluded from public source) own the bounded work.
Publication follows the candidate, public-delivery and returned-asset gates;
the request does not authorize paid APIs, credential changes or unrelated work.

## Candidate and checks

| Identity | Current value |
| --- | --- |
| Candidate/source inventory | Pending freeze |
| Candidate receipt and distribution inventory | Pending freeze |
| Payload/archive inventory | Expected 110 payloads / 111 files; pending exact comparison |
| Archive bytes and SHA-256 | Pending freeze |
| Distribution and outer manifest hashes | Pending freeze |
| Curated public source and distribution commits | Pending push and exact comparison |

| Gate | Actual status |
| --- | --- |
| Versioned local gate/build and built standalone checks | Pending |
| Independent final Ponytail/candidate review | Pending |
| Fresh proposal/clarification and exact-approved apply observation | Pending; at most three sequential sessions / 330 seconds: initial 150, optional proposal continuation 90, apply 90 |
| Local exact-candidate delivery/update/recovery/removal | Pending; at most four installer calls and two installed self-tests |
| Public source CI and six platform cells | Pending |
| Public full-SHA delivery/update/recovery/removal | Pending; separate four installer calls and two installed self-tests |
| New annotated tag/release and three returned assets | Pending |
| Separate Pages metadata/deployment/returned-body verification | Pending |

Pending is not a successful check. Private operations compilation and synthetic
controls establish only authoring behavior; they do not satisfy these gates.

## Observation and delivery limits

The planned fresh observation explicitly stages the frozen skill in a synthetic
fixture. If it first asks a legitimate service-record clarification before
compiling a CLI proposal, an optional continuation can produce that proposal.
If the first response already includes the actual envelope, root combines the
clarification with exact consent and omits that continuation. Root extracts the
actual proposal and approves its exact digest before the separate apply session.
That assistance is disclosed. There is no useful-task
or repeat check in this packet. A terminal failure stops the observation; no
automatic retry, model fallback or regrading is permitted. Actual route, times,
failures and acceptance will be recorded from returned evidence.

Local and public delivery use separate owned protocols and exact old/new
distributions. Checks must retain original application data, later memory,
sibling skills, settings and edited backups through replacement/recovery/removal.
Local delivery does not establish public full-SHA delivery. Public CI, six
platform cells, exact returned assets and the existing stable release's
preservation remain separate required checks.

The earlier [first-run observation](../../../research/2026-11-07-first-run-value/README.md)
keeps its init route correction, terminally incomplete adopt task and omitted
repeat checks. This release preparation does not repair or regrade that record.
Published 1.5.0 and its tags/assets/checksums stay unchanged. Broader harness
coverage, implicit loading, ordinary-user reliability and measured human benefit
remain unverified. Follow [installation](../../../INSTALLATION.md) and the
[release procedure](../../../RELEASING.md) for supported delivery and recovery.
