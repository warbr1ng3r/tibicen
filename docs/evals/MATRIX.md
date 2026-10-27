# Frozen acceptance matrix

Harness tasks 1.3–1.4: 67 separate cases in [matrix.ts](../../scripts/evals/matrix.ts), with the full digest of input, oracle, rubric and control examples pinned in [matrix-lock.json](../../scripts/evals/fixtures/matrix-lock.json). These are prepared inputs and independent expectations; a matrix row does not mean live acceptance.

For the [shared native runner](NATIVE_RUNS.md), each fixture contains host-only `interaction`: approve/refuse/revise and the presence of a staged process task. Future replies remain hidden from the executor. The current lock also pins separate PROC adopt/update tasks, an allowed metadata change and the required exact LICENSE in SKILL-01; historical frozen series retain their own conditions.

| Group | Separate cases |
|---|---|
| Main vision scenarios `А–Е` | New project, existing application, conflict, repeat without writes, refusal, manual step, incomplete, lost baseline, preset |
| PREF | 01–07, separate 06 without questions, separate 08A/B/C/D |
| Addendum §1 | No block, valid, matching, empty, moved, removal, duplicates, nesting, reversed order, unclosed pair, old/unknown format; CRLF and surrounding bytes |
| Addendum §2 / SKILL-04 | Local edit, vanished useful upstream resource, unrelated neighbor, occupied path, unconfirmed license, changed bytes and missing resource |
| Addendum §3 | 11 states after a real hard exit: add/modify/delete before and after replacement, before/after manifest write, before cleanup, ambiguous unrelated edit, unknown command outcome |
| Addendum §7 | One approved Codex/Claude version and a separate outdated copy |
| Stack and tools | ML without promising application execution; Codex/Claude/Cursor formats with explicit compatibility gaps |
| SKILL-01–04 | Installation and refusal, sufficient rules, need-based choice, update and negative sources |
| PROC-01–04 | Init and full workflow, adopt/update with existing work, four process defects, retaining sufficient team/OpenSpec process |

Ordinary cases require controlled isolation. Fake `unsafe-init.mjs`, which actually contains attempts to write HOME/package.json and create a Git commit, is marked hostile. The ordinary process runner rejects it before preflight/launch; the test does not execute this payload. A temporary directory does not count as the required isolation.

`loadAcceptanceMatrix()` returns a scenario, separate MechanicalOracle, QualityPlan and control examples of sufficient/violating behavior. Only `scenario.files` and the `executorScenario()` projection reach the executor. The oracle, control responses and future replies remain with the host. Materializing both variants checks identical bytes and independent trees. Sources/CI/source materials are protected during setup; task has its own paths, commands and consent. PROC separately distinguishes permission for planning files from review before implementation.

Semantic expectations are not checked by searching a response for the “correct” name. Grounding/fit/sufficiency/consistency/application/loading/process require actual observations, an independent rubric and an established human sample. Control descriptions are not live grades. Component count is not a criterion.

Scenarios without execution do not require a hidden Node command during setup. A new empty React project allows an approved scaffold package.json and a separate task with React files; Node double/triple expectations do not apply to it. The current profile has no web checker, so application verification remains unverified. After these review fixes, the matrix was refrozen before a future series; conditions of completed diagnostic cohorts are preserved.

## Historical state templates

[lifecycle.json](../../scripts/evals/fixtures/lifecycle.json) was produced by an [explicit authoring script](../../scripts/evals/freeze-lifecycle.ts) through an emergency exit of the real core. Schema 3, originals, write intent, command journal and original session id are preserved. This is synthetic fixture history, not proof of user consent.

Root and separate HOME are represented by `/fixture/project` and `/fixture/home`. Before freezing an experiment, the host calls `bindAcceptanceFixture(fixture, canonicalProjectRoot, canonicalHome)`, changing only these bindings and the related digests of two historical JSON files. A sequential pair uses one canonical path, recreated between variants: the pair's initial bytes must match after binding. Binding after agent startup is forbidden. Copying a template without binding correctly produces `tamper-suspect`; this helper does not authorize transferring user state.

Tests actually resume states with new exact consent, preserve the id, check that an already completed file is not rewritten and refuse to overwrite an unrelated edit. For an unknown test-command outcome, a repeat is not executed without a separate justification; the journal remains unknown and verification stays unverified. Matching files do not become evidence of execution.

## Pinned sources

[upstream.json](../../scripts/evals/fixtures/sources/upstream.json) contains canonical URLs, full commit SHAs, original paths, MIT, Git blob, SHA256 and sizes of ten real files. Bytes came from GitHub, not a home installation. [Tests](../../tests/evals/matrix.test.ts) recalculate both hashes and check completeness of the selected contents.

- Ponytail skill-only: [`DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710`](https://github.com/DietrichGebert/ponytail/tree/09c434ab73ca43761c5d8b0c5d341926c2fba710), `skills/ponytail/SKILL.md` and MIT LICENSE. The skill is self-contained in this version; plugin/hooks/npm installer were not selected. Agent format: Codex 0.157.0, `.agents/skills/*/SKILL.md`; a live Ponytail task has not yet been accepted.
- Historical selected distribution for SKILL-04: [`fe963cae99d986dae3199fe56403f99e87db7c6c`](https://github.com/DietrichGebert/ponytail/tree/fe963cae99d986dae3199fe56403f99e87db7c6c). Besides SKILL.md, the useful optional `examples/web-platform-lookup.md` was explicitly selected; the new version does not contain it. Manifest schema 2 links the previous source hashes to a locally edited SKILL.md. The useful old example is not presented as a resource of the new SHA.
- PREF-08B uses real templates and MIT from [`github/spec-kit@27d14e20c187c1f2916540ea201ecbdc9f8ed588`](https://github.com/github/spec-kit/tree/27d14e20c187c1f2916540ea201ecbdc9f8ed588), plus explicitly local rules and an unfinished keep-double. This checks retention of an accepted process; it does not claim a new Spec Kit adapter/CLI integration.
- [OpenSpec 1.14.3](https://github.com/Fission-AI/OpenSpec): [openspec.json](../../scripts/evals/fixtures/sources/openspec.json) pins pnpm integrity, upstream-package file SHA256s (excluding installer-generated launchers in `node_modules/.bin` with local paths), native init/update and the four bounded-adapter files. The [explicit probe](../../scripts/evals/openspec-source.ts) uses the pinned devDependency with separate HOME/XDG, CI and telemetry disabled. Native init creates ten files; the first update also writes `HOME/.config/openspec/config.json`, and the second changes nothing. This is an observed inventory of the trusted CLI, not an OS sandbox or agent loading. The bounded adapter does not run init/update or change application dependencies.

Sources and the exact CLI scope are available to both variants. For a future PROC series, the host must resolve `openspec` to the verified separate package with this inventory, then freeze PATH/permissions and check actual commands. The first diagnostic Codex driver supports only two diagnostic scenarios and does not claim to be a SKILL/PROC profile.

## Verification and refreezing

```sh
node --test tests/evals/matrix.test.ts
node scripts/evals/openspec-source.ts
node scripts/evals/freeze-lifecycle.ts
```

The last two commands explicitly rewrite authored materials and are not part of ordinary test execution. After substantive changes, matrix-lock is reviewed separately; it must not be updated automatically to hide changed conditions of an already completed series. Source/SHA, installation, loading and application have separate evidence. All harness materials and external processes are excluded from the Tibicen distribution.
