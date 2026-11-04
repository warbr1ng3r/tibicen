# Refreshed public-source offline gate — 3 November 2026

The reviewed, sanitized **632-file source projection passed the actual repository gate** on macOS arm64 with Node 24.15.0 and pnpm 11.21.0. Its rebuilt 86-file payload and checksum inventory match the existing conditional 1.0 distribution byte for byte and mode for mode. This is a local projection-gate observation; immutable public delivery and full technical MVP acceptance remain separate in the [engineering assessment](../../ENGINEERING_ACCEPTANCE.md) and [readiness ledger](../../V1_READINESS.md).

## Source and execution boundary

The initial ticket 150 receipts for 630 files were preserved as revision 1. Revision 2 refreshes the reviewed current files and explicitly adds the [adopt/fresh-task report pair](../2026-11-03-adopt-fresh-task/README.md). It retains the former 593-file allowlist, intended public documentation and exactly seven pre-existing OpenSpec development-skill entries. Those entries remain development source only; no OpenSpec CLI, development skill, test or evaluation harness enters the distributed payload.

The document-only projection annotates **180** links to excluded private records with the original target as plain code and an English/Russian exclusion note. Root `package.json` changes only to `1.0.0` in the copy; shared source remains `0.1.0-alpha.1`. Runtime, tests, fixtures, build inputs and licences retain current source bytes. No behavior/test edit, exclusion to hide a failure or formatter correction was needed. Source staging contains neither dependencies nor symlinks.

The gate used a separate disposable sibling copy, with physical copies of existing dependencies: 18,498 regular files and 1,251 internal relative symlinks. Only 126 generated `.bin` launchers had their shared-checkout prefix relocated. Both direct and nested pnpm reported 11.21.0. The allowlisted environment used empty owned HOME/config paths, no inherited provider credentials, and disabled tool telemetry/update checks. TMPDIR was outside the source package scope, avoiding the already documented CommonJS-fixture/ESM host mismatch. No package installation/download, real model/API call, account/auth change, repository commit/tag/push, archive or publication was performed. Offline fake-control `modelSessions` counters in test logs are synthetic, not real model sessions. Environment settings are not an OS-wide network-isolation claim.

## Observed results

| Command/check | Outcome |
| --- | --- |
| One complete `pnpm test`, 12:09:28–12:10:55 UTC, 15-minute cap | Exit 0; 86.808 seconds. Lint, formatting, types, site build, strict current/archived OpenSpec validation, distribution build and Node tests passed. |
| Node test summary | 729 total: **728 passed, zero failed, one intentional skip**; 67.495 seconds. The portable lifecycle test requires `TIBICEN_PORTABLE_DIST` and was not enabled. |
| One `pnpm build`, 12:11:00–12:11:07 UTC, 15-minute cap | Exit 0; 7.146 seconds. |
| Source links | 1,240 relative links / 138 fragments checked; zero new failures, zero active links to excluded private records. Four previously recorded historical line-anchor failures remain. Nine authored skill-resource links use the already verified conditional-distribution context. External URLs were not fetched. |
| Preservation after execution | All 632 staged/gate/shared selected source files retain their recorded hashes and modes; all 18,498 shared dependency files are unchanged; copied dependency links still resolve internally. Both initial receipt revision and dependency-free staging are preserved. |
| Distribution comparison | All 86 payload hashes/modes match; no missing/extra payload or symlinks; both skill versions are `1.0.0`. `SHA256SUMS` also matches in bytes and mode. |

Astro reported two existing deprecated-API hints and zero errors/warnings; they were retained. The first preservation-audit helper incorrectly required generated Astro cache files to stay unchanged and stopped on an assertion. That helper and observation were preserved. A narrowly corrected filesystem audit records 27 changed/removed and 18 new files under the documented `landing/node_modules/.astro/vite-sync` cache separately; package files and shared dependencies did not change. **Neither project command was retried**, and source/tests were not edited.

The four historical references remain in `openspec/changes/build-agent-evaluation-harness/review.md` (lines 9, 15, 21) and `review-native-acceptance.md` (line 53). Their retained targets were refactored or lack a Markdown `L59` anchor. The same failures occur in canonical source and the prior public projection; excluding private history did not cause them. No replacement revision, target or evidence was invented.

## Exact local binding and remaining work

| Bound item | SHA-256 |
| --- | --- |
| 632-file source manifest, including original/current/projected hashes, modes and transforms | `7c9a8dc0796fbfa4d96013acc2848b80685d076e674914c11e5feec0b482769c` |
| Projected source `STAGING-SHA256SUMS` | `78f7acfea943499dc77febf3707ab1551f4d02a69172ebc6ae9ab0551d5a751e` |
| Existing conditional 1.0 distribution archive, read only | `7fed7ad4d3e27cf169ac29384f0807b9beae5689e6df0dbd1b11bac499ec7e55` |
| Both conditional and rebuilt distribution `SHA256SUMS` | `37b384c03e7ea0b83a82960ec6512771d391c694ed312b60ac6b50ef26fa88a3` |

Exact argv, cwd, tool hashes, allowlisted environment, both command logs/receipts, dependency inventories, first audit failure and final comparison are retained in `.evals-private/delegated-acceptance-20261103/public-source-gate/` (private development record; excluded from public source). Projection/revision receipts remain beside it in `source-projection/`. This report pair was written after the gate and is not part of its 632-file input binding.

The source staging remains mutable. Root must review this result, integrate the report and final documentation pointers, regenerate the final source selection/sums and bind any eventual archive/freeze separately. No new browser suite, portable/cross-platform lifecycle, installer/public Git route, live loading/task/quiz, human usefulness study or complete manual secret/transitive-dependency audit was performed. Reused dependencies are not evidence of a fresh clean install. A successful offline gate does not close missing technical observations or establish measured human benefit.
