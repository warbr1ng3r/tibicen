# Tibicen 1.7.1 release preparation

19 November 2026. **Local candidate prepared; publication pending.**
Published 1.7.0 remains the public default. This compatible patch contains the
reviewed comparison and proposal-guidance corrections from the
[independent assessment](../2026-11-19-scenario-sweep-assessment/README.md).

## Scope

Normalize recognized Node spec/TAP and Python unittest timing records while
preserving meaningful assertion/test-name differences. Require matching nonzero
failure exit codes. First-proposal guidance selects the actual supported profile,
distinguishes proposed trust from approval, requires observed readiness and
rejects executor-generated/default answers as external approval.

No CLI/schema migration, new dependency, resident service or user-application
change. Old hashes are not rewritten. Unknown output formats remain strict.
Digest checking does not authenticate the approver.

## Candidate and checks

Version 1.7.1, candidate-01: 114 payloads / 115 archive files and modes.
The archive, payload manifest and outer SHA256SUMS are frozen. Exact identities
and completion states are in [receipt.json](receipt.json).

Pinned frozen-lockfile offline installation, pnpm test and pnpm build passed:
**1,187 total / 1,185 passed / 0 failed / 2 existing skips**.
Independent Ponytail candidate review: Ship. All source copies, three assets,
hashes/modes and both isolated outside-checkout, empty-PATH resource self-tests
passed. Local lifecycle and public observations are recorded as they finish.

## Public delivery

Project only reviewed new files onto known public source history; never push
private history. Pass public CI and all six platform cells, then verify actual
public full-SHA installation/update/recovery/removal. Publish the annotated tag
and three matching assets, compare returned bytes, update installation/checksum
metadata and separately verify its deployment. The owner authorized this sequence.

Initial DNS resolution failed; later ordinary Git/API access recovered. Existing
SSH authentication works. No new credential is created. Browser access was
rejected by environment policy and is not used.

## Limits

The original five consent failures and missing catalogue variants remain.
This release does not claim native autoload, a fresh behavioral cure for the
guidance, human consent, causal memory benefit or Windows policy execution.
New paid API spend: 0 RUB. Published 1.7.0 assets remain immutable.
