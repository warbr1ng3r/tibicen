# Tibicen 1.8.1 release

Published at **2026-11-26T03:35:49Z**: [Tibicen 1.8.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.8.1).
Release ID `458919868`; annotated tag `540173673908f6d4ed825c26b3b1faa35e6465d8` points to distribution
`3fab265ce311c8d2de9d8942da1b031f6aba49b3` and binds public source `bb5758d688c0cd61115c7f24c9d25006b1766651`.

This compatible patch corrects pytest failure comparison under timing, timedelta-clock
and terminal-padding drift while preserving meaningful diagnostics. It also makes
proposal approval clearer and states controlled-check environment limits precisely.
Saved schemas, approval boundaries and dependencies are unchanged; no migration is required.
The [development assessment](../2026-11-26-development-assessment/README.md) keeps the
returned model observations and their protocol/consent/context limits separate from
this technical release acceptance.

## Accepted delivery

- [Exact source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/45749197647) passed.
- [All six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/45749199727) passed: macOS/Ubuntu/Windows with Node 22.20 and 24.15. Both Windows cells ran actual command checks from both unpacked skills.
- [Publication](https://github.com/warbr1ng3r/tibicen/actions/runs/45749907041) passed exact source/job/tag/draft/asset guards.
- Local gate: 1,213 passed, zero failed, two expected skips; frozen install and build passed. Both skills passed standalone CLI and self-test checks outside checkout with empty PATH and isolated HOME.
- Local and actual public full-SHA lifecycle each passed six installer calls, twelve self-tests and six complete 116-payload comparisons. Update from frozen 1.8.0, repeat, edited-backup restoration, reinstall and removal preserved four unrelated sentinels, including a later project-memory note.
- Constructed incomplete folders recovered through the actual installer with complete byte/mode comparisons. This was controller-created state, not an observed mid-copy SIGKILL.
- Independent code and release-packet Ponytail review: **Ship** after fixes. Public source is a projection of approved commits; private history was not pushed.

## Published assets

| File | SHA-256 |
| --- | --- |
| tibicen-1.8.1.tar.gz | `90dd9b9634ceca7c8238d6e8ab85c5e73b3d9e603844b083404f0a1e1702c3cc` |
| distribution-SHA256SUMS | `25cda5d8b181d67f85d058480f62ddf0e4b2e37c1bfb1b3513a28c9becfe5b69` |
| SHA256SUMS | `8c8ff85f119570ed6c05bfdde373a9f0d4d4db73f5179cd26876e1e7b758939f` |

All three downloaded release assets match the frozen candidate byte-for-byte; both checksum layers, every payload and all archive bytes/modes passed. HTTPS certificate verification was enabled.
The manifest covers 116 payloads; the archive contains 117 files including the manifest.
Published 1.8.0 metadata and all three asset identities are preserved.

## Website metadata

Installation pins, current bilingual guides and the checksum index are deployed
from metadata source `a5fba7f7c441c0def77883a259286ff633a0f560`.
[CI](https://github.com/warbr1ng3r/tibicen/actions/runs/45750463037),
[Cloudflare](https://github.com/warbr1ng3r/tibicen/actions/runs/45750463009) and
[legacy Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/45750781835)
passed on that exact source. All **27 returned bodies** match its source-bound
local build using the exact Cloudflare site/base command; HTTPS certificate checks
passed. Both indexes contain **19 versions**, preserving all 18 earlier records
and warnings. The first audit attempt passed. Local metadata lint, types, strict
OpenSpec, formatting and all 69 site unit checks passed; independent metadata and
Pages-guard review: Ship. A missing escaped-version test replacement was corrected
in the preview before application, with both previews retained.

The release effort is closed. This later documentation-only closure changes no
runtime or deployment input and does not claim another deployment.

## Limits

Quiet/unrecognized runner output retains strict comparison. Interpreter pinning is
path-only; script binding covers the entrypoint. Virtualenv directories are not
reproduced, and their exclusion does not establish import isolation. Native harness
loading, genuine mid-copy interruption, skills-update/lock stability and measured
human/causal benefit remain unverified. Synthetic CLI grants in controlled fixtures
are not authenticated human approval. Earlier behavioral grades remain unchanged.
The first standalone collector attempt lacked its output directory; the helper was
corrected and rerun against unchanged candidate bytes. No product failure followed.

Exact identities and checks: [receipt.json](receipt.json).
