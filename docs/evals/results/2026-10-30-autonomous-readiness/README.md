# Autonomous readiness checks — 30 October 2026

The autonomous block found and fixed an already-current component merge defect. Standalone lifecycle checks pass on macOS arm64 with Node 22.20.0 and 24.15.0. This advances the [full MVP readiness ledger](../../V1_READINESS.md); it does not establish 1.0 readiness, human benefit or every agent/platform combination.

## Payload and evidence

Runtime, skill-update and paired decision observations used the published `0.1.0-alpha.1`: 86 files, inventory SHA256 `35f743a56b47e4f25743da5d6b6a1e606fb719b3382372384124094711e1b2dc`. Local source started at `292d665dd765a980b9b6ae355483ad6ecb507659` with uncommitted documentation/context changes.

The subsequent unreleased build changes only `scripts/core/components.ts` in each skill. Its inventory SHA256 is `0729d51a78ac02ba677347ad679e539e2c2048c8caf835f16af01a33c22cde32`; the version field remains `0.1.0-alpha.1`. This is a working-tree build, not the published alpha or a frozen 1.0 candidate. The original alpha failure is retained.

The later manual-continuation clarification also changes `references/stage-build.md` and `references/process-openspec.md` in both skills: six changed payload files in total. That separate 86-file build has inventory SHA256 `17a0cc74fa9fd853f52c1c88e6ae58b80eb3f0dc4948390f681ddfaefbe7fe50`. Earlier observations retain the earlier payloads; no case was silently rerun or upgraded.

The subsequent access-field clarification adds the two `references/proposal-format.md` copies, for eight differences from alpha. Its 86-file inventory SHA256 is `14b0018d1fbbf8463e8132fcece96c6e99512167420c37b719c758175635bd99`. Both standalone self-tests passed outside checkout on Node24.15; no agent run against this last wording is claimed.

Private receipts live under `.evals-private/autonomous-release-20261030/`: `runtime`, `skill-update`, `fixed-merge`, `decisions`, `use-task`, `coverage`, `process-update`, `manual-outcomes`, `manual-resume-docs`, `manual-agent` and `access-guide`. Root verified the inventories of 150 runtime, 77 skill-update and 81 process receipts. App answers are operator summaries, with earlier responses reconstructed from retained context; they are not complete independently captured tool trajectories. App/model builds are unknown. Agent-reported and host timestamps are separate sources; no speed comparison is made.

## Mechanical checks

| Check | Observation | Boundary |
| --- | --- | --- |
| Published standalone lifecycle | 20 scenario groups, 104 CLI calls across two Node versions, including two actual OS interruptions | macOS arm64, owned projects and synthetic operator consent |
| Preservation/recovery | Empty scaffold, existing-project checks, CRLF/owner sections/modes, read-only no-op, consent/stale/scope and unknown-schema refusals; unknown interrupted command refused blind retry, then resumed the same session after fresh review | No automatic discovery or agent-understanding claim |
| Profile/manual status | Missing ML checks stayed `unverified`; pending manual action stayed pending | No ML training, model task or quiz |
| Skill update | Pinned Ponytail updated; local rule, old resource provenance and foreign neighbor retained; four source/license/path refusals before writes | Synthetic offline repository metadata with actual frozen Git blobs; no live-source verification |
| Fresh useful task | New context reported reading the updated installed skill, proposed two files, received separate root review and added `triple` while preserving `double`; two tests passed | Explicit read, not implicit/native loading or human usefulness |
| Independent task check | Exact two approved files, all modes and 15 protected files retained; ten additional behavior assertions passed | Separate synthetic task; the older incomplete native attempt stays incomplete |

The private case-to-proof map covers all 67 frozen IDs and separates direct mechanical proof from unresolved agent/human decisions. Root verified 23 source hashes and 80 expanded test names against the executed gate. This is a coverage index, not 67 accepted cases.

## Defect and verification

A fresh repetition of the successful skill merge failed with `component-content-required`: normalization removed the unchanged write, but component validation still required it. This used current manifest state, not an obsolete digest.

The fix allows a no-op only when recorded source identity/path/content, installed bytes and known permissions agree. New revisions, drift, missing provenance and mode changes retain explicit merge-content checks. Ten regressions cover these boundaries. A new copy of the completed 17-file project returned zero changes/commands on both runtimes, preserving hashes, modes and modification times. No schema or consent rule changed. See [the implementation task](../../../../openspec/changes/extend-infrastructure-contracts/tasks.md).

Independent ponytail-review accepted the fix and platform preparation. `pnpm test` passed lint, formatting, types, site build, strict specifications and 710 tests, with one intentional skip. The skipped portable test is opt-in; explicit execution against the fixed build passed 3/3 on each available runtime. Site behavior did not change, so browser tests were not repeated.

## Read-only paired decisions

Four frozen cases used eight fresh app contexts and nine answer turns. Ordinary Codex was compared with published Tibicen instructions plus a permitted read-only scan. Each pair used identical project/request bytes; all remained unchanged. One capacity rejection occurred before context creation; no case was repeated.

| Case | Ordinary Codex | With Tibicen |
| --- | --- | --- |
| Explicit brief-response preference | Proposed `AGENTS.md` and `.nvmrc` | Proposed only `AGENTS.md`, with persistence of the preference labeled editable |
| Corrected preference | Asked what setup object was intended; no concrete proposal, so correction was not reached | Proposed an editable brevity assumption, then replaced it after the frozen synthetic request for detailed explanations |
| Sufficient agreed team process | No changes | No changes |
| Sufficient agreed OpenSpec process | No changes; unfinished verification stayed unfinished | No changes; no tool install/update |

These are raw diagnostics: no human-calibrated quality grades, semantic pass rate or measured benefit. No files were applied; no hidden correction preceded its stage. Documented OpenSpec availability does not prove CLI execution.

## Process preservation and manual continuation

The actual standalone adapter and pinned, separately installed OpenSpec 1.14.3 ran 36 bounded commands on macOS/Node24.15: nine expected refusals and no unexpected failures. Fourteen original files per positive fixture retained their bytes/modes, including owner instructions, local templates, existing change/spec, application and CI. All 432 external package files and the observed 86-file distribution remained unchanged. Actual read-only CLI version/list/status/instructions observations did not alter Tibicen's built-in `unverified` loading/task/CLI-execution fields.

An approved local instruction extension survived registration and a repeated proposal. A stale invocation refused before writes; root separately reviewed its exact one-line correction and registration digest. Unknown input/package versions, a foreign instruction path, external-store config, an application-scope overwrite and an unsupported initializer field also refused. The synthetic initializer was inert and never executed: this verifies input rejection, not hostile-code isolation.

The first protocol used ordinary `apply`, intentionally creating a second integration while retaining the old pending session. A separately frozen fixture then used explicit `resume` with a newly reviewed plan: it completed the original session with one ID, two attempts and two process-history entries. The instructions now state how to use `resume --plan` after a manual outcome even without a state file. Runtime behavior is unchanged. The clarified build passed 27 focused skill/process tests with one intended portable skip; explicit portable checks passed 3/3 on each Node version. Distinct-version update, explicit instruction replacement and process-specific interruption remain unverified here.

## Additional status decisions

Three more read-only pairs used six fresh contexts, preserving all 19 fixture files and the frozen alpha payload. Both methods avoided claiming successful setup from missing evidence. The Tibicen response explicitly retained `incomplete` after two documented failures and `baseline-unavailable` for the lost original baseline. Neither method invented an MCP configuration or requested the secret value in chat; the pre-application MCP assessment stayed unverified.

These fixtures supplied prior history through documents, without executable session state. The imposed read-only/no-repair boundary does not prove a free-running two-repair stopping policy, actual recovery or a completed automatic-to-manual MCP handoff. Partial reference output and an agent's disclosure of shell-based file reading are retained; broad “no CLI” wording was ambiguous alongside permitted file inspection. There are no semantic or human grades.

## Fresh agent continuation attempt

A new actual pending-manual fixture used the clarified six-difference build, with a real manifest, original session and no state. One fresh agent reported reading the installed instructions, ran scan and proposal, then stopped when proposal returned `forbidden-path`. Its input had placed readable preservation targets, including the required process config, in `forbiddenPaths`. No envelope, digest or chosen continuation command was produced. Application and fresh-agent continuation remain unverified; the successful mechanical resume above is a separate observation.

Root verified the unchanged project/HOME/distribution and eight executor-artifact hashes. The initial wrong environment-file read and rejected input are retained; there was no retry or replacement context. The reference now defines `forbiddenPaths` as a read/write access prohibition. Preserving a readable file means leaving it outside `changes`; actual user access bans remain binding and may require reporting a gap. This clarifies existing behavior without relaxing runtime gates. Across the block, evaluation executors used 16 app contexts and 18 answer turns; no human-calibrated grades were produced.

## Remaining limits

A manual six-cell OS/runtime workflow is prepared without adding work to ordinary PR checks. It is unpublished and undispatched: Linux/Windows remain unverified. Exact-candidate public installation/upgrade and backup restoration, broader semantic coverage, human calibration, real voluntary pilot and maintenance/contact decisions remain open. During the autonomous block, no commits, tags, publication, paid API calls or personal authentication changes were made.

## Subsequent review corrections

The owner then requested ponytail-review of all uncommitted changes and a local commit. Independent reviewers covered runtime/reference changes, the manual platform test/workflow, and documentation/evidence for the documented local single-operator workload. Two confirmed findings were corrected before committing:

- A command-bearing manual session could resume with its original ID after state cleanup but lose its saved command journal. Resume now restores that journal from the latest manifest session and appends new command outcomes. Ordinary apply starts a separate journal. Two regression variants execute harmless approved Node checks; the resume test failed before the fix and both pass afterward. The combined component/recovery suites pass 68/68.
- The new access-field paragraph described a broader boundary than the runtime enforces: internal manifest/state operations do not receive `forbiddenPaths`. The reference now limits the promise to project-resource operations that receive the field, explains the separate `serviceWrites`, and requires stopping before Tibicen if the owner bans mandatory internal paths. Runtime restrictions were not weakened.

Re-review accepted the fixes. This later unreleased build contains 86 verified files with inventory SHA256 `c095d117bff29a0c9e67310948f8b33fca50e3cdc34d610faca4e26429332a81`: ten differences from published alpha, comprising four core copies and six reference copies. Version remains `0.1.0-alpha.1`; the four earlier inventories and their observations above remain historical. No agent evaluation was repeated against this build.

The fresh final `pnpm test` gate passed lint, formatting, types, site build, strict active/archived OpenSpec validation and 712 tests, with one intentional portable-test skip (713 total). Explicit portable checks passed 3/3 on each of Node22.20.0 and24.15.0 against this exact build, including both standalone self-tests outside the checkout. All 86 payload hashes matched. Site browser behavior, remote jobs and live agents were not rerun. Private review receipts are under `.evals-private/review-commit-20261030/`.

The local commit is explicitly authorized by the owner. Push, tags, publication, real Linux/Windows jobs and human acceptance are outside this review. Review ticket (`../../../../.scratch/codex-zcode-acceptance/issues/113-review-and-commit-autonomous-readiness.md`; private development record; excluded from public source).
