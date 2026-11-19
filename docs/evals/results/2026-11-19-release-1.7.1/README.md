# Tibicen 1.7.1 release and delivery

19 November 2026. **[1.7.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.7.1) published at 2026-11-19T00:41:12Z.**
All three returned assets and 115 archive files/modes match candidate-01.
Published 1.7.0 is preserved; website metadata is deployed and verified. This compatible patch contains the
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
passed. Local and public lifecycle acceptance each passed twelve steps.

## Public delivery

Only reviewed new files were projected onto known public source history;
private history was not pushed. Public CI and all six platform cells passed,
followed by actual public full-SHA installation/update/recovery/removal.
The annotated tag and three matching assets are published; returned bytes,
installation/checksum metadata and its deployment passed separate verification.
The owner authorized this sequence.

Initial DNS resolution failed; later ordinary Git/API access recovered. Existing
SSH authentication works. No new credential is created. Browser access was
rejected by environment policy and is not used.

## Limits

The original five consent failures and missing catalogue variants remain.
This release does not claim native autoload, a fresh behavioral cure for the
guidance, human consent, causal memory benefit or Windows policy execution.
New paid API spend: 0 RUB. Published 1.7.0 assets remain immutable.

## Completed public gates

Source 7896e21c8fc384a08a739bc3e7475f2a68e56406 passed [offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44429639472) and [all six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/44429642245). Distribution 9a5e1ef2eb837075bb79e2fb2db01f439343d28d passed twelve actual public lifecycle steps. Annotated tag e42cc8202bdebc39ded3ee829980ca57edca1394 and [publication](https://github.com/warbr1ng3r/tibicen/actions/runs/44430964257) bind those exact bytes. All three downloaded assets, all 115 archive files/modes and previous 1.7.0 asset identities were independently compared by root. The one-off workflow exists only on its ops branch, not main. Review found and closed a weak run-identity guard before publication; ten bounded guard assertions passed.

Local DNS resolution was intermittent. Public API reads used fresh DNS answers with normal TLS verification; scoped SSH retained strict known-host-key verification. No global network setting, new credential or browser-policy workaround was used. The first main push completed but the chained tag command lacked its message file; the later tag push succeeded after the file and exact six-cell records were verified. No release asset was deleted or replaced.

Metadata local acceptance passed 69 site tests, lint, format, types and strict OpenSpec. Independent Ponytail review corrected the stale version assertion and roadmap labels, then gave Ship. The first failed site test log is retained.

Metadata source c763fb66a048335ef37a9abedf425b5c8f375f23 passed [CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44432364426), [Cloudflare](https://github.com/warbr1ng3r/tibicen/actions/runs/44432364448) and [legacy Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/44432862533). All 27 returned bodies match the source-bound local build: all 22 primary files, four legacy redirects and the legacy checksum index. Both indexes contain 17 versions; all 16 previous records and other index fields/warnings are preserved. This comparison uses the local build bound to deployed source, not a separately downloaded official build artifact. The release effort is closed; the final follow-up changes documentation only.

The documentation closure uses `[skip ci]`: runtime, distribution and website files remain unchanged at their accepted references. Formatting and receipt/source consistency are checked locally; completed release and deployment checks are not rerun for this record update.
