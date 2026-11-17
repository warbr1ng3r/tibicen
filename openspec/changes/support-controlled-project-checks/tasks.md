# Tasks

## 1. Runtime contracts

- [x] 1.1 Add `Command.script` binding, the narrow bash acceptance in `validateCommand` (bound script + exact argv + build/test/lint) and negative unit tests for `sh`, unbound `bash`, extra argv, inline code and wrong kinds.
- [x] 1.2 Extend `runProjectChecks` to the `python`/`bash`/`docs` profiles with web-only dependency environments, re-verify bound script bytes in the execution copy (`command-source-changed`) and keep every existing web/unsupported behavior under tests.

## 2. Proposal compilation

- [x] 2.1 Pin bare `node`/`python3`/`python`/`bash` executables for non-web profiles via a read-only `PATH` scan, refuse `interpreter-unavailable`, require absolute or `./`-relative executables otherwise, and keep web behavior unchanged.
- [x] 2.2 Hash requested `script` bindings from the actual project file into the compiled plan (bounded read, forbidden-path aware) with a missing-file refusal.

## 3. Scenarios through the public CLI

- [x] 3.1 Python fixture with an existing unittest entrypoint: comparable baseline/final with real exit codes, original project preserved.
- [x] 3.2 Documentation fixture with an existing local check script and a Bash fixture smoke script under the explicit contract; honest `no-project-checks`, `interpreter-unavailable`, script-drift and unsupported-profile negatives.
- [x] 3.3 Regression coverage: pre-existing red vs new regression, prefix/timeout incompleteness, untrusted commands, changed source under an old digest, and old-format web plans staying compatible.

## 4. Documentation and integration

- [x] 4.1 Update `references/proposal-format.md`, `references/stage-verify.md`, `PRODUCT_VISION.md`(+`_ru`) §10.8 and `CHANGELOG.md`(+`_ru`) under Unreleased.
- [x] 4.2 Full `pnpm test`, `pnpm build`, standalone payload/self-test/SHA256SUMS checks, independent review, tracker update with remaining limits.

## 5. Codex integration review

- [x] 5.1 Keep bound filenames from becoming interpreter options/subcommands and reject absolute project entrypoints that execute the original instead of the controlled copy; add regressions for both reproduced cases.
- [x] 5.2 Make execution scenarios respect Windows unavailability and keep an explicit check of that refusal.
- [x] 5.3 Synchronize the paired tracker, roadmap and capability documentation, then complete integration checks and record the remaining limits without publishing or changing the version.

## 6. Adopt-maintenance review hardening (16 November)

- [x] 6.1 Refuse pinned-interpreter argv spellings that can carry inline code (`-p`, `--eval=`, clustered `-Ic`); accept only a bound `./` file argument or an installed `-m` module, with through-the-CLI regressions in both skills.
- [x] 6.2 Scope script bindings to the controlled non-web profiles and require an argv[0] binding to ride a pinned interpreter executable; regressions for the web-profile binding and the absolute-wrapper binding.
- [x] 6.3 Validate `checks.profile` at proposal time so unknown names fail before any plan or session exists.
- [x] 6.4 Keep a damaged local usage counter from failing an approved apply while preserving the file byte-for-byte for manual repair; regression covers apply completion.
- [x] 6.5 Show the reviewed script binding in the consent summary; update paired proposal-format guidance and the changelog under Unreleased; rerun integration checks and the fixture packet on the fixed build.
