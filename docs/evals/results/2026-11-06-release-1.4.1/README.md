# Tibicen 1.4.1 release report

**Published 6 November 2026 at 08:37:35 Europe/Moscow (`2026-11-06T05:37:35Z`).**
[Release 1.4.1](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.4.1),
ID `436136601`, passed public CI, all six platform cells, exact public delivery
and returned-asset verification. Pages deployment and returned-body verification remain pending.

## Patch scope and compatibility

A one-line proposal edit previously displayed the entire file as removed and added.
Local source commit `2932f67` trims the shared prefix/suffix and shows one combined
changed region with up to three unchanged context lines on each side. Every changed
line remains visible; separated edits may share one hunk. This compatible display fix adds no dependency.

The preview does not normalize approved bytes. Complete content, original hashes,
file modes, CRLF and final-newline state remain bound to approval. Apply consumes
full approved content; old whole-file previews retain their original digest and compatibility.
Persisted schemas, presets, writers, execution permissions and project memory are unchanged.
No migration is required. See the [working-session requirements](../../../../openspec/changes/validate-first-working-session/specs/agent-infrastructure-lifecycle/spec.md).

The simpler bilingual landing was delivered separately; its [publication record](../../../../openspec/changes/simplify-first-use-landing/verification.md#publication)
does not establish delivery of the 1.4.1 skills.

## Frozen candidate and delivery gates

`1.4.1-candidate-01` was frozen at `2026-11-06T05:13:48Z` from the working tree
based on local commit `2932f670948f1e7750d4f3f101007572948c0b08`, with package
version 1.4.1: 1,322 source files, 100 payloads and 101 archive files.
Source remained unchanged from capture through build. Inventory SHA-256 values:

| Inventory | SHA-256 |
| --- | --- |
| Local source freeze | `f483181cb57c6447d03638942ee606063f7b7cc2c97644df918521382e87c527` |
| Frozen distribution files/modes | `19e3bd1f79e2a2947d9305b96642ff11dd6dde6ce63935d6143a67eb05c817fe` |

| Item | Actual status |
| --- | --- |
| Frozen-lock install and separate build | Passed on Node 24.15.0 / pnpm 11.21.0 |
| Versioned full gate G02 | 930 passed, zero failed, one default manual skip |
| Exact standalone lifecycle | 3/3 passed separately on macOS arm64; both self-tests and 100 payloads checked |
| Exact-candidate affected CLI checks A02 | 22 calls, four cases passed; original A01 retained |
| Local delivery D01 | Four installer calls and two installed self-tests passed |
| Independent exact-candidate engineering review | Ship; zero open P1/P2 findings; frozen A02/D01 and curated projection verified |
| Public source commit and CI | [42168629099](https://github.com/warbr1ng3r/tibicen/actions/runs/42168629099) passed on `319845f…` |
| Six macOS/Ubuntu/Windows × Node 22.20.0/24.15.0 cells | [42168790859](https://github.com/warbr1ng3r/tibicen/actions/runs/42168790859): all passed |
| Public full-SHA installation/update/recovery/removal | P01 passed; four installer calls and two installed self-tests in 26.471 seconds; independent Ship |
| v1.4.1 tag, publication and returned assets | [42169510847](https://github.com/warbr1ng3r/tibicen/actions/runs/42169510847) published; all three downloads and 101 archive files/modes match candidate-01 |
| Pages metadata, deployment and separate returned-body comparison | Pending |

All three actual public downloads matched the frozen candidate, sizes and API digests:

| Asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [tibicen-1.4.1.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/tibicen-1.4.1.tar.gz) | 265489 | `c3302cf25284120d009ee7b01c9044cdc0193c8c658597e0f24fe7e65233dcb8` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/distribution-SHA256SUMS) | 10428 | `1ddbe0968918ac22469dbe3c0d8cd8f85c8d23910d2f623451957f804a4238fd` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.4.1/SHA256SUMS) | 177 | `23c4ccc8243d2936a1e2782922fa17991cc4f8e182047c7d5f78e711e4ee2d6c` |

Public source `319845f1f1597817807c81579b42250a1f189e7d` binds distribution
`52c0769574e90d7d1a0438996df9da40621b0107`. Annotated tag object
`4c65b9d0fbb901598bcc7e88a974a54019e583a0` resolves to that distribution;
the actual ref/object was verified separately from release creation metadata.
The original 25-path curated export preserved 317 prior omissions and rebuilt
all 101 frozen files/modes. Independent review rehashed the source, assets and
complete edited backups. See [RELEASING](../../../RELEASING.md).

## Attempts, public delivery and preservation

Original gate G01 remains **929 passed / one failed / one default skip**.
`process-skip-unexplained` failed before offline protocol arms launched. A boundary
preflight delay is a hypothesis; the exact historical cause is unproven because
the original preflight receipt was removed by test cleanup. Separate narrow 1/1,
complete offline workflow-file 42/42 and full-gate G02 observations passed without
source, assertion or timeout-budget changes. None launched a native model.

A01 stopped after five product CLI calls: its checker omitted the exact planned
owned HOME usage file from permitted effects. The original failure is retained.
Explicitly reviewed corrective A02 passed both bundles' new focused previews,
full-byte/mode application and genuine published-1.4.0 envelopes applied unchanged
by 1.4.1. Original hashes/digests and protected files remained intact. Four cases
returned `complete` and structural checks passed; product project verification
remained **`unverified` / `no-project-checks`**. Root-authorized synthetic mechanical
tokens are not end-user consent; no application checks were requested or run.

D01 passed universal local-path 1.4.0 → 1.4.1 replacement, identical repeat,
full edited-backup restoration into actual installed directories and removal.
All 100 payloads matched; application files, later owner memory, sibling skills,
external settings and original inputs were preserved. The trusted installer had
ambient read capability and owned-only writes; no OS sandbox/firewall is claimed. Private receipts retain attempts, inputs, outputs, inventories and hashes.

P01 separately installed published 1.4.0 and replaced it from the actual public
1.4.1 full SHA, then repeated, restored the complete edited backups into actual
installed paths and removed them. Exact fetch/checkout/lock/payload bindings,
both installed self-tests and protected files passed. Trusted Git children had
ordinary OS permissions; no OS isolation is claimed. Returned release notes,
three assets, 101 archive files/modes and 100 payload sums matched; the previous
1.4.0 release, assets and annotated tag were preserved. Returned-byte review: Ship.

## Earlier evidence retains its identity

The [first working-session report](../2026-11-06-first-working-session/README.md)
records five synthetic, assisted cases using frozen published **1.4.0**, separate
mechanical fixture applications, later tasks and a memory correction/read.
Those are not 1.4.1 candidate observations or end-user consent.

Before the version bump, the development gate passed 930 tests with one default skip;
standalone passed separately, 3/3, and independent review passed 136 focused checks.
These retain their original source/runtime scope, separate from the versioned gates above.
Published 1.4.0 artifacts and their [release evidence](../2026-11-06-release-1.4/README.md) remain unchanged.

## Preservation and limits

Installing a newer skill replaces the selected installed folders; back up local
skill edits and verify restoration before removing backups. Replacing Tibicen
does not run adopt or migrate project infrastructure. The
[installation guide](../../../INSTALLATION.md) covers replacement and removal;
local-path evidence alone does not establish public delivery.

There is no background updater. This release establishes no new native host/model session,
automatic loading, MCP activation/connection or broad model compatibility.
Windows project-command launch remains unsupported; read-only operations remain available.
Synthetic assisted checks do not measure human usefulness, comparative effort savings or unassisted behavior.
