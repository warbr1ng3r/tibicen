# Portable workflow verification — 5 November 2026

Local implementation is complete and Unreleased. Published skills and installation
pins remain 1.2.0. The workflow uses the user's existing file/Node-capable host
and selected model/provider; catalog membership is no longer an entry requirement.

## Implemented behavior

- Universal installation explicitly selects `--agent universal`, both complete
  skills and the existing exact published pin. Manual full-folder installation
  and explicit `SKILL.md` reading are documented in both languages.
- Core and browser share validation for known or unknown lowercase harness IDs,
  with at most sixteen distinct values. Existing valid duplicates remain readable.
  The local form accepts custom hints with accessible localized errors.
- Guidance can use one approved common `AGENTS.md` and one project memory store.
  Available file/Node/write/activation operations are separate from harness,
  provider, model and optional native probes. Missing required operations remain
  gaps; absent optional probes do not prohibit structural setup.
- Schema, protected paths, native write targets, adapters and execution authority
  are unchanged. No model client, provider credentials or background updater was added.

## Actual checks

| Scope | Observed result |
| --- | --- |
| Core lane | 14/14 focused checks, lint and format passed. |
| Landing lane | 48/48 site tests and 42/42 affected browser checks across Chromium, Firefox and WebKit; EN/RU, narrow screens, keyboard, no JavaScript and local downloads. |
| Integrated source | `pnpm test`: 843/843, no failures/skips; frozen-lock offline install and `pnpm build` passed. |
| Protected inputs | 108 of 109 baseline files unchanged; the only exception is the reviewed init entry clarification that archive installation does not require Git. |
| Candidate-02 | 94 payload files, 47 per skill; 95 regular archive entries, exact bytes/modes/checksums. |
| External U02 | Three pinned-installer calls: universal local installation, identical repeat and removal; complete manual archive in a directory with spaces; both skill self-tests with Git absent. |
| Generic lifecycle | Eighteen first-party CLI calls overall: unknown hint load/inspection, init proposal, wrong-digest refusal, separately approved apply, verify/status/report and no-change adopt. Application, siblings, settings, payloads and a later synthetic owner memory note preserved. |

U02 used one synthetic external tree, fresh HOME/XDG/TMP and no inherited keys.
Active checker time was 2.884 seconds, excluding root's proposal-review wait.
The actual digest was
`b95e77b41e975a537a55ce18ebb6eb7ce57a936311eef5a69b7ac2c9f281c2a1`.
Root read and separately approved the two proposed files and disclosed service
writes under the owner's autonomous engineering delegation. This is synthetic
fixture consent, not a human usefulness rating. The optional unknown-host task
remained unverified; no model was launched.

## Retained corrections and limits

- The first browser attempt passed 34 checks and failed eight. Compact copy and
  an observable focus wait fixed the causes; thresholds were unchanged. The later
  42-check pass is separate and the original failures are retained.
- Independent Ponytail code and guidance reviews returned Ship. G01 scoped Git
  to the installer route. G02 made download/checksum/extraction examples stop on
  failure through `&&` chains; both language blocks parse and agree. The first
  guidance actor hit capacity after sealing its artifact; root verified that
  artifact and its input hashes, without inventing another execution.
- The initial acceptance review held on A01: it needed to detect extra project
  files and compare approved bytes/modes. That was corrected and independently
  reviewed before execution.
- U01 failed after one installer call and zero CLI calls: Node's `fs.cp` required
  ancestor metadata outside the owned-read grant. Installer exit 0 did not prove
  success; exact payload comparison caught the empty targets. No proposal/apply
  happened, and protected files survived. U01 was retained, not retried.
- Separately planned/reviewed U02 gave only the pinned trusted installer ambient
  filesystem read capability, retaining owned-only writes. Detection can also
  probe system application/config paths. First-party CLI reads/writes stay owned-only.
  This is not whole-filesystem read isolation or an OS network firewall claim.
- Candidate-01, its earlier three-target delivery and unconsumed H01/H02 remain
  historical. U02 is mechanical acceptance, not a replacement semantic/model run.
  Native discovery/loading, later LLM memory use, new model compatibility,
  application-test execution and public full-SHA delivery are unverified here.

## Exact candidate and evidence

Candidate `1.3-candidate-02` has version 1.3.0 and local base
`17d4129c85a28147eb478ded4100d87ca74dce2b` plus frozen working-tree changes.
Its 1,174-file source inventory hash is
`d459f1a339e8fd49a393c17bc45b3ed62b097fdaab90ad66d323dc9d35cf1fb2`;
distribution inventory hash:
`aec1d3e8bd21917d8bead63314c00ce946e7e57844debc05981c2f1e849516e9`.
The 237,193-byte archive hash is
`86862c77462896229fac1dffd1877953f591a5362e4724b95c41a7ad791ba194`.

The source snapshot was captured during the gate after lane inputs were sealed,
then checked unchanged through gate/build. The G02 guide correction and later
verification/tracker/spec bookkeeping are post-freeze project documentation;
they do not change the builder/runtime inputs or candidate bytes. The frozen
snapshot is retained rather than relabelled as the final source commit.

Private raw evidence lives in `.evals-private/harness-portability-20261105/`
(lane receipts, reviews, integration logs and U01/U02 attempts), with immutable
candidate snapshots in `.evals-private/release-1.3-20261105/`. These local records
are not public CI or returned-release assets. The
[portable guide](../../../../docs/HARNESS_PORTABILITY.md) explains user behavior;
[RELEASING](../../../../docs/RELEASING.md) governs separate candidate observations,
public CI/platform/delivery gates, authorization and immutable publication.
