# Tibicen 1.8.0 release

Published at **2026-11-20T04:15:05Z**: [Tibicen 1.8.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.8.0).
Release ID `452259773`; annotated tag `8c1d07daf16ad9b5f25bea707357cc7588b3040e` points to distribution
`a748ba3932e85f5194a3ea450c003f83bf8dcd9f` and binds public source `ab509eccca659ac7a273540661974c882fb8908c`.

This compatible minor delivers validated approval receipts and directory-scoped
canonical-skill routing. Persisted schemas/dependencies stay unchanged; old
receipt-free sessions load. See the [changelog](../../../../CHANGELOG.md),
[preparation record](../2026-11-20-release-1.8.0-preparation/README.md) and
[qualified packet assessment](../2026-11-20-consent-coverage-assessment/README.md).
Preparation and earlier integration were separate, dated scopes; the owner then
authorized complete push, checks, publication and website verification.

## Accepted delivery

- [Public source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44672175401)
  passed on exact source `ab509eccca659ac7a273540661974c882fb8908c`.
- [All six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/44672177483)
  passed: macOS/Ubuntu/Windows, Node 22.20 and 24.15. Both Windows cells actually
  executed commands; both built skills passed unpacked checks without Git.
- [Publication](https://github.com/warbr1ng3r/tibicen/actions/runs/44673107632)
  passed with exact CI/job/tag/draft/asset guards.
- Actual public full-SHA fresh installation, update from 1.7.1, repeat,
  edited-backup restoration, reinstall and removal passed: 12 lifecycle steps,
  five installer invocations and ten installed self-tests. Unrelated skill,
  host setting and a later project-memory note survived.
- A separately constructed partial copy recovered through the actual public
  full-SHA installer: 116 payload hashes/modes and two self-tests passed.
  This is controller-created partial state, not an observed SIGKILL.
- Three downloaded release assets match the frozen candidate byte for byte;
  both checksum layers, all 116 payloads and 117 archive files/modes passed.
  The 1.7.1 release's stable metadata and three asset identities are preserved;
  old assets were not redownloaded in this package.

The local gate had 1,207 passed / zero failed / two existing skips. Its versioned
source, standalone/compatibility controls, failed helper acceptance check and
review correction remain in the preparation record. Public operations use a
separate projection of approved commits; private history was not pushed.

## Website metadata

Installation pins, current bilingual guides and the checksum index are deployed
from metadata commit `0a8ba22375cea87ea12708f7f73ade46b34054f0`.
[CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44674193229),
[Cloudflare](https://github.com/warbr1ng3r/tibicen/actions/runs/44674193163) and
[legacy Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/44674636788)
passed on that exact source. All **27 returned bodies** match its local build
using the exact Cloudflare command, site and base; HTTPS certificate checks
passed. Both indexes contain **18 versions**, preserving all 17 previous
records and warnings. The first audit attempt passed; raw bodies, headers and
per-request results are retained. Later closure changes documentation only and
does not change deployment inputs. The release effort is closed.

Local metadata lint, type checking, strict OpenSpec and all 69 site checks passed.
The first site run had two failures from an old escaped version assertion;
independent review identified it, the assertion was corrected, and both attempts
are retained. Runtime and frozen skill assets were not changed.

## Limits

Receipts retain exact content and a caller-controlled channel; they do not
identify a human approver or prevent an executor with shared tools from
self-consenting. Distribution markers are not cryptographic authenticity.
Controller fixtures do not establish human approval, native harness loading,
causal memory benefit or measured user usefulness. Windows policy restrictions
remain unverified. Earlier behavioral failures and H6/F3 evidence gaps remain
unchanged. No new behavioral model or paid API call was required.

Exact identities, checks and retained evidence: [receipt.json](receipt.json).
