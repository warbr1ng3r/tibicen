# Tibicen 1.5.3

Two compatible inspection fixes:

- Recognize Markdown fragments in links to the registered memory file during structural checks, preserving the chosen store and safe-read boundaries.
- Accept explicit per-operation forbidden paths on read-only project commands. Recovery, report evidence and supported local MCP checks retain the supplied scope and unfinished-plan exclusions. This does not create a persistent project ACL or cover global Codex configuration.

Installed guidance keeps mandatory external human actions separate from reading instructions and future checks an available agent can perform. Existing pending plans and finalization rules are unchanged.

Validation: 1,067 passing tests and one existing skip; three standalone checks; exact local installation from 1.5.2, replacement, repeated add, complete edited-backup restoration and removal. Both copied candidate skills passed fragment-memory and scoped-read checks after setup completion, with project/home/runtime preservation and cleanup. These are model-free technical checks, not new native-agent or human-benefit observations.

No new dependency, memory store or automatic update mechanism is introduced. Validation and coverage limits are recorded in the [release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-09-release-1.5.3/README.md).

Install the exact distribution:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/b6fd86e8927c3640fe66be064da5a34e63ac366d -g --agent universal --skill tibicen-init tibicen-adopt --copy
```
