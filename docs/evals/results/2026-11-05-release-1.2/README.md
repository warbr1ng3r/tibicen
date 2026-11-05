# 1.2.0 candidate status — 5 November 2026

**Tibicen 1.2.0 is a candidate, not a published release. The current published
version remains [1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0).**
Offline checks and normal CI passed, but the required fresh observation of the
changed explanation behavior did not complete. Publication remains blocked.

The candidate adds optional validated agent-version context to `practices` and
clarifies how init/adopt explain evidence, applicability and the smallest useful
change or no-change result. Supplied versions remain caller context, not proof
of an installed version or compatibility. Source retrieval, dated content and
semantic applicability remain separate facts.

## Checks and remaining gates

| Scope | Recorded result | Limit or remaining work |
| --- | --- | --- |
| Local candidate gate | **801/801 tests passed**, zero failures and skips; both installed skills' self-tests passed. | Offline mechanics and distribution-resource checks do not establish native loading, behavior or usefulness. |
| Normal public CI | [Offline checks, run 41950161822](https://github.com/warbr1ng3r/tibicen/actions/runs/41950161822) completed successfully on public source `1a38fef4974370620f9a9aefd72f1ca709d82ff4`. | Separate from the six platform cells and fresh behavior observations. |
| I01: fresh init recommendation | One controlled Codex attempt failed before any assistant output or command; the cause is unknown. | No recommendation, proposal or changed-behavior success was observed. |
| I01 preservation | Original fixture, staged host and candidate skill files stayed unchanged; returned files/modes matched. The wrapper reported container cleanup and generated HOME removal was checked. | An independent container-absence probe was inconclusive. Clean preservation does not establish successful behavior. |
| A01 / M03 | Adopt context A01 was withheld; assisted lifecycle M03 is blocked because I01 produced no proposal. | No invented plan, digest or approval; no apply occurred. |
| Six platform cells | [Platform gate, run 41952044767](https://github.com/warbr1ng3r/tibicen/actions/runs/41952044767) passed all steps in all six OS/Node cells on the same public source commit. | Platform execution does not establish the missing native explanation behavior. |
| Public full-SHA delivery | **Passed after a checker correction:** 1.1 → 1.2 installation, pinned update, external backup/fresh restore and removal for Codex, Claude Code and Cursor. All 92 payload files matched per target; registered project memory and later notes, sibling skills and external settings were preserved. | Mechanical macOS/Node 24 checks: 12 installer invocations, 24 version/self-tests and 9 DNS reads. They do not prove native loading or all harnesses. |
| Release and hosted delivery | **Not published.** | New tag/release assets, returned-byte checks and separate Pages checks remain pending. |

The [operational controller, run 41952034366](https://github.com/warbr1ng3r/tibicen/actions/runs/41952034366)
failed after dispatch. Its specific cause is unknown; retrieving raw logs returned
403. The platform run itself passed. Associating that run with the controller
uses the same bot and a three-second dispatch window, so the association remains
an inference; the controller is not recorded as passed.

I01 used the existing isolated Codex CLI 0.157.0 subscription profile, requesting
`gpt-6-astra`, with a 180-second deadline and one allowed attempt. The recorded
session lasted 39.186 seconds and retained no assistant message, command or token
usage. Model availability and the failure cause are unverified.

The fresh-observation scope was stopped after I01. There was no retry, reserve
context, automatic fallback, paid API request or credential repair. A01 remains
unconsumed. Fresh explanation observations and the concrete approved-proposal
lifecycle remain open technical requirements; passing other checks cannot
replace them. The completed public delivery checks do not replace those observations.

## Preserved correction history

The first delivery attempt stopped after its Codex update because the checker
required byte-identical installer lock metadata. The pinned ref and all 92
payloads were unchanged. Inspection of the pinned installer showed an API Git-tree
hash versus local SHA-256 cache-hash mismatch, which can trigger same-ref
reinstallation and timestamp changes. The before-update object was captured in
an earlier binding; original raw before-lock bytes were not separately retained.
The actual after-lock file and failed attempt remain preserved.

The corrected checker permits only verified cache-hash/time bookkeeping changes,
while requiring the exact ref, payload bytes/modes and all unrelated fields to
stay unchanged. It passed independent review and negative offline drift checks.
One fresh mechanical run passed for all three targets in 33.127 seconds; in that
run all three raw locks actually stayed byte-identical. Existing product files
and the pinned installer were not modified to obtain this result.

A separate developer-helper correction sends the first terminal event through
its existing callback after stopping, using the same `type`/`detailHash` privacy
projection as the result parser. Independent review rejected an initial raw-event
proposal before any live use. The corrected fixture checks callback logs as well
as saved results for private text. This repairs event delivery, not the cause of
I01; it does not reconstruct the missing error. The full offline gate then passed 804/804 with zero skips, and every rebuilt
payload/checksum file remained byte/mode-identical to the original candidate.
Further observations require a separate bounded protocol, new source/observer
bindings, review and root GO. A source-supplied Desktop pair is being prepared
only for the changed generic reasoning subcriteria; it is not evidence of
installed-component loading, CLI identity or OS isolation.

## Candidate identities

| Record | Exact identity |
| --- | --- |
| Frozen local source commit | `e305011f8af4618e9c06e055b3e2e131221bd438` |
| Public source commit | `1a38fef4974370620f9a9aefd72f1ca709d82ff4` |
| Frozen distribution commit | `0656f12e00ea83d84229180d331f3178bf253407` |
| Candidate archive SHA256 | `fa33bdfbad280cba71b199671e280d71fcda1fc0b568b66130b0a1036aba47d9` |
| Source inventory SHA256 | `9a2390702f7cbfe486a86e64793ca0d718442e50d8ef232c602a1c1c81bdb10e` |
| Distribution inventory SHA256 | `ef9fcaf9eb28de9a23eddda7e3f9c2a9ebbf2045d08adb95ce5f8cfb6ed92788` |
| Candidate receipt SHA256 | `caeaeaaefa9dbb6cb186cf719ad98f8172c3c345c4294089f77a0f90faf06a91` |

The local-to-public source binding records equality of 204 runtime/test files.
At preparation, content checks matched 1,111 tracked source files, 93 installed/archive files
and 92 payload checksums, including recorded file modes. These hashes identify
the retained evidence and candidate bytes; private receipt/inventory identities
alone do not make the observations publicly reproducible or establish release
acceptance.

The prepared interpretation fixtures use clearly synthetic source records;
they are not fresh official guidance. No new agent compatibility or loading
claim follows from this candidate's offline/resource checks or failed native
attempt. Measured human benefit remains unknown. Earlier published results keep
their original candidate, agent/version and assistance limits; see the
[1.1 release record](../2026-11-04-project-memory/README.md),
[engineering assessment](../../ENGINEERING_ACCEPTANCE.md) and
[release procedure](../../../RELEASING.md).
