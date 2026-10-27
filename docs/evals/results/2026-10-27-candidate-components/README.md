# Candidate component setup, 2026-10-27

Pinned Ponytail installation and file integration of OpenSpec 1.14.3 were performed on frozen Tibicen 0.1.0/source3fb29ef through distribution skills installed outside the checkout. Setup and subsequent observations in a new working session are counted separately; the latter results appear below.

| Case | Apply / status / report | Structural verify | External application test |
| --- | --- | --- | --- |
| Ponytail init | complete | passed, structure-only | 1/1 before and after |
| OpenSpec init | complete | passed, structure-and-package-resources | 1/1 before and after |
| OpenSpec adopt | complete, applied[] | passed, structure-and-package-resources | 1/1 after; original application SHA preserved |

The application is a small Node ES module with double(value). Setup did not change package.json, src/math.js, or tests/math.test.js. Adopt preserved 13 non-service files: the application, AGENTS.md, process configuration, local instructions, a team template, and the user's keep-double change. Data and results are in setup-summary.json (maintainer-local record; omitted from public source). Exact plans, separate root approvals, and actual apply/verify/status/report outputs are retained in private evidence; the public summary contains no personal or temporary absolute paths.

## Pinned sources

Ponytail: DietrichGebert/ponytail@09c434ab73ca43761c5d8b0c5d341926c2fba710, MIT. Only skills/ponytail/SKILL.md with SHA256 9badd22a32e19cb884e46dfa8d3aae82bb81dfa5484105b8b4f0262df823a509 and LICENSE with SHA256 fb1bc6909ac3ef82d5c22106e32ef682b0cff66788fa915fb9b53b15c9d2f3ab were selected. Actual source-check with both files returned provenance-verified; the check was repeated during apply. Original bytes are retained in owned private evidence.

OpenSpec: @fission-ai/openspec 1.14.3, MIT, sourced from the pinned devDependency. pnpm-lock integrity matched the pinned fixture; all 432 original package files were retained, and resourceHash 27f07484ad1c5843d930395fa6381b8a0d472d7fbf1ddb61c89900b017bd095b matched. A separate self-contained copy of 57 runtime packages was prepared in an owned temporary directory for execution. All copied bytes were compared with their sources, and seven adapter resources matched. The only file omitted from the runtime copy was the unused package-internal node_modules/.bin/yaml wrapper; its bytes remain in the source archive. The copy does not require the development checkout's CLI.

The bounded adapter created exactly a configuration file, two .gitkeep files, and its own tibicen-openspec/SKILL.md; native init/update and CLI installation were not executed. Separately authorized --version and list --json ran from the copy with isolated HOME/XDG and OPENSPEC_TELEMETRY=0: version 1.14.3, with the root matching process-init-app. This is a CLI smoke check, not agent loading of the process.

## Controls and limitations

Node v24.15.0 and pnpm 11.21.0 were used. The 86 installed Tibicen files matched frozen dist byte for byte. Codex 0.157.0 is the pinned target format; the actual Codex application version was not measured in this series. The proposal reported headless-method-unverified; the actual compatibility report retained loading:unverified / trust-required. Setup plans contain no commands, so built-in application verification is unverified/no-project-checks; the Node profile is unsupported in v1. Successful node --test runs were performed separately.

Every apply occurred only after review of the exact digest. The initial plans that omitted LICENSE or used the checkout CLI were rejected by root before apply; corrected plans were saved separately. Product code was not fixed. Setup used no native application startup, additional model session, auth, or paid model API; no new runner/SDK, repository dependencies, or commits were introduced. HOME/XDG, usage/state, and runtime are in an owned temporary directory; a temporary directory is not an OS sandbox.

## New working sessions

Two independent Codex app subagents received only the project, connected skill, and user task, without setup/evaluator context. This is explicit instruction reading and application in a new context; separate application startup and automatic skill discovery were not checked. The actual application version was not measured.

| Component | Observation | Independent root check |
| --- | --- | --- |
| Ponytail | Read the installed SKILL.md at its pinned SHA; added triple while preserving double, 2/2 Node tests | Only the two approved files changed, five others were preserved; 12 functional checks passed |
| OpenSpec | Read project instructions and native templates; five planning files were approved, followed by implementation after a separate review. 5/5 Node tests, strict validation, native progress 3/3 all_done | All 12 protected original files were preserved, and only the five approved planning files were added; 12 functional checks passed |

Sanitized new-session summary (maintainer-local record; omitted from public source). The OpenSpec workflow ran once on a copy of the accepted adopt setup with keep-double; init has setup evidence without a second independent downstream run. Team instructions, the local template, and the existing change were preserved. Saved Tibicen reports remain as originally recorded: external observations do not overwrite unverified in those reports.

These are positive observations for the selected sources and scenarios. The full SKILL/PROC matrix, a separate init workflow, component updates/negative cases, native startup, and human acceptance remain open. There is no human sample.

Private evidence: .evals-private/candidate-components-20261027-r1/. It contains locations.json, complete sources/runtime inventory and candidate equivalence, initial rejected plans, CLI/test stdout/stderr, separate approvals, final plans, and downstream-skill-task.txt / downstream-process-task.txt. The temporary directory is retained for independent continuation.
