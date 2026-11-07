# Tibicen 1.5.1

A compatible patch for clearer approval and faithful evaluation file permissions. No project migration is required.

## Fixed

- The agent shows exact changes to your files and separately explains Tibicen's generated service records. If you request their complete future contents, it clarifies the unknown IDs, times and results before writing. Applying still requires approval of the unchanged CLI plan.
- Development evaluation tools preserve declared ordinary file permissions across contained staging and continuations. Omitted modes still default to `0644`. Earlier observations retain their original results and limits.

There is no new background updater, dependency, persisted schema or approved project write scope.

## Install or update

Back up locally edited installed skill folders before replacing them. This command installs both complete skills at the exact distribution commit:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/287ef7b22630482aca7996e5a0faad601cede778 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Open a fresh project session and explicitly ask your agent to read `~/.agents/skills/tibicen-init/SKILL.md` or `tibicen-adopt/SKILL.md`. See the [installation and recovery guide](https://github.com/warbr1ng3r/tibicen/blob/main/docs/INSTALLATION.md). Updating installed skills does not automatically change a project setup.

## Validation and limits

The exact source passed GitHub CI and all six standalone OS/Node cells. Local checks passed 1,043 tests with one normal opt-in skip, plus standalone checks 3/3. Local and full-SHA public delivery each passed installation, replacement, identical repetition, complete edited-backup restoration, removal and both installed self-tests.

Two assisted fresh Codex sessions accepted the exact approved setup write and structural checks. The saved status remains `manual-action-required`: its read marker is pending despite an observed explicit read. This is not a completed workflow or useful-task claim. Automatic discovery, broad harness/model compatibility and measured human benefit remain unverified. [Detailed release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-07-release-1.5.1/README.md).

The archive contains 110 skill payload files plus the distribution checksum manifest. Verify the archive and distribution manifest against the attached `SHA256SUMS`. Published 1.5.0 assets remain unchanged. The separate Pages update follows release acceptance.
