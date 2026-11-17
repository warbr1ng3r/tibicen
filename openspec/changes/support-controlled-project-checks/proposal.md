# Proposal

## Why

`runProjectChecks` accepts only `profile = web`; every other stack receives `unverified / unsupported-profile` even when the project already has a real check entrypoint that could run as a trusted literal-argv command on controlled copies. Command discovery reads package.json scripts only, there is no contract for binding a check to an existing script file's exact bytes, and the runner forbids every shell invocation, so Bash, documentation and Python projects cannot get a comparable baseline/final application check at all (reproduced on 1.5.6: `reports/evidence/repro-gaps-before.txt` in the 2026-11-16 project-checks workspace).

## What Changes

- Accept three additional execution profiles — `python`, `bash`, `docs` — beside `web`. They run the same approved build/test/lint command set on independent snapshot copies without a dependency environment; `local-node-modules` environments remain web-only, and unsupported runtime profiles keep `unsupported-profile`. New proposals reject unknown profile names with `invalid-check-command`.
- At proposal time the CLI pins bare interpreter names (`node`, `python3`, `python`, `bash`) to an absolute executable found on `PATH` by a filesystem scan over absolute executable candidates; a missing interpreter refuses with `interpreter-unavailable` instead of a later failed run. Other non-web executables must already be absolute or `./`-relative project paths bound to their own bytes. No version detection, package download or interpreter execution happens before consent.
- Add an explicit script-binding contract: a check command may carry `script: { path, hash }` naming one existing project file whose reviewed bytes the CLI hashes into the plan; the compiled bound file runs from the project root as an explicit `./` executable or interpreter file argument, the execution snapshot re-verifies those bytes before spawning, and drift returns `command-source-changed`. Absolute project executables and external aliases into the project are refused so execution uses the copy.
- Under that contract the runner accepts `bash` in the controlled non-web profiles for exactly one argv — the bound script path — with a pinned absolute interpreter and kind `build`/`test`/`lint`; the web profile keeps its previous flat shell ban. Arbitrary shell command lines, `sh`/`zsh`/`fish`/`cmd`/`powershell`/`pwsh`, wrappers, `npx`, `env`, `xargs`, inline code, publication and commits remain forbidden; nothing about the existing web path changes.
- Keep baseline/final comparison, known regressions, `pre-existing-red`, first-attempt semantics, interruption recovery and all existing web behavior unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `verification-and-delivery`: controlled project checks cover ordinary project stacks through pinned interpreters and an explicit script contract.

## Impact

`scripts/core/types.ts` (Command.script), `scripts/core/execute.ts` (validateCommand bash contract), `scripts/core/plan.ts` (profile gating, interpreter pinning, script hashing), `scripts/verify/index.ts` (profile set, script re-verification), references `stage-verify.md` / `proposal-format.md`, project vision §10.8 and changelog entries with Russian twins, plus new focused and forward CLI tests. No new dependency, container platform, environment manager, provider choice, background service or package installation. Old plans and passports stay readable; old digests are not reused because new fields change the compiled plan only when used.
