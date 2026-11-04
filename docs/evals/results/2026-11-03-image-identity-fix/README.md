# Image-identity correction: public-source gate — 3 November 2026

The independently reviewed, eval-only [image-identity correction](../../../../openspec/changes/stabilize-contained-image-identity/proposal.md) passed the complete offline gate on a new **645-file public-source projection**. The rebuilt 86-file Tibicen payload, modes and checksum inventory remain identical to conditional 1.0. This result binds the changed source; the earlier [632-file gate](../2026-11-03-public-source-gate/README.md) remains a separate historical observation.

The correction fingerprints a versioned projection of image ID, OS, architecture, normalized variant, full Config and full RootFS. Object-key order and auxiliary GraphDriver/Descriptor/Identity envelopes do not define execution identity; array order and material configuration/filesystem changes remain significant. Required identity shapes and pinned image/platform/root/watchdog checks remain enforced. This gate does not establish a new real Docker/model observation or authorize a live run. The [installed-skill observations](../2026-11-03-installed-skill-check/README.md) retain their original outcomes and budgets.

## Input and boundary

Root signalled independent Ship and final documentation readiness before copying or testing. The review receipt SHA-256 is `dfd6c33088287fb1d497a61571a20eb624aeaf3258a7a87250b805c0959ecdd7`. Only two existing non-document files changed relative to the 632-file input: `scripts/evals/profiles/codex/contained.ts` and `tests/evals/contained-codex-profile.test.ts`; their hashes matched the reviewed GO signal. Other changes are reviewed documentation: the two report pairs and nine OpenSpec artifacts explicitly expand selection from 632 to 645 files.

The prior 632-file staging revision was copied and verified before refresh; task 152's receipts remain untouched. The new projection retains licences, fixtures, build inputs and exactly seven existing development-source skill entries. It annotates 180 links to excluded private records, using the established document-only EN/RU notes. Only copied root `package.json` changes to `1.0.0`; shared source stays alpha. No runtime/test edit or exclusion was made to pass the gate. Pure source staging contains no dependencies or symlinks.

Execution used the same Node 24.15.0 / pnpm 11.21.0 recipe as 152: a new disposable sibling with source and separate owned host/TMP directories, 18,498 copied dependency files, 1,251 internal relative links and 126 relocated generated launchers. Direct and nested pnpm versions were verified. Empty owned HOME/config paths and an allowlisted environment prevented inherited provider credentials; telemetry/update checks were disabled. No package installation/download, real model/API/auth action, shared dependency/dist write, repository commit/tag/push, archive or publication was performed. Fake-control `modelSessions` in logs are synthetic counters. These environment controls do not constitute OS-wide network isolation.

## Actual results

| Check | Observation |
| --- | --- |
| One full `pnpm test`, 15:59:42–16:01:10 UTC | Exit 0, **88.236 seconds**; 15-minute cap. Lint, formatting, types, site build, strict active/archived OpenSpec validation, distribution build and Node tests passed. |
| Node test summary | **733 total: 732 passed, zero failed, one intentional portable skip**, 69.788 seconds. `TIBICEN_PORTABLE_DIST` was not enabled. |
| One `pnpm build`, 16:01:33–16:01:40 UTC | Exit 0, **7.724 seconds**; 15-minute cap. |
| Source links | 1,264 relative links / 138 fragments; zero new failures and no active private-record links. Four known historical line-anchor failures remain; nine authored resource links use the verified conditional-distribution context. External links were not fetched. |
| Preservation | All 645 selected gate/stage/shared source hashes and modes unchanged after execution. Shared dependency inputs unchanged; copied dependency links remain internal. Previous 632-file staging and task 152 proof bindings preserved. |
| Product payload | **86/86 hashes and modes match**, both versions `1.0.0`; checksum inventory also identical in bytes/mode, with no extra/missing payload or symlinks. Eval-only code/tests and OpenSpec development material do not enter the payload. |

Both project commands passed on their first invocation; no retry, source correction or audit-helper failure occurred. The existing two Astro deprecated-API hints remain. The documented Astro work cache regenerated 27 prior entries and 18 new files in the disposable copy; these are recorded separately from package/source preservation, following the already reviewed 152 audit rule. No shared cache or package file changed.

## Binding and remaining work

| Item | SHA-256 |
| --- | --- |
| 645-file source manifest, including current/projected hashes, modes and transforms | `7ea12638f12931d03e37a24264c56015c7ab40983347bfccc1f5d7ed11c1b469` |
| Projected source `STAGING-SHA256SUMS` | `c06c05a8b4d2c2a7b54364758f1f3d0e95d9f31f8019c276faff46f94d6618ce` |
| Read-only conditional 1.0 archive | `7fed7ad4d3e27cf169ac29384f0807b9beae5689e6df0dbd1b11bac499ec7e55` |
| Conditional and rebuilt distribution `SHA256SUMS` | `37b384c03e7ea0b83a82960ec6512771d391c694ed312b60ac6b50ef26fa88a3` |

Exact tool hashes, argv/cwd, environment, source/dependency inventories, command logs and comparison receipts are retained in `.evals-private/delegated-acceptance-20261103/image-fix-source-gate/` (private development records; excluded from public source). This report pair was written after the gate and is outside its 645-file input. Staging remains separate from any final archive or public source binding.

Root and the independent reviewer must bind this gate to the new source/identity/startup/permissions/input/protocol freeze before any separately authorized native launch. No new browser/portable/platform/installer/public-Git acceptance, live loading/task/quiz, model routing or human-benefit study was performed. Existing unsupported conditions and technical gaps remain in the [engineering assessment](../../ENGINEERING_ACCEPTANCE.md) and [readiness ledger](../../V1_READINESS.md). This offline pass is not full MVP acceptance or measured human benefit.
