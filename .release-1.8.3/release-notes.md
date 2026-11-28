# Tibicen 1.8.3

This compatible patch clarifies project-memory drafting: preserve the owner's stated
input/output domain, separate unspecified details from accepted rules, and avoid
adding an unsupported standing requirement to ask for clarification. Genuine
ambiguity and explicit instructions to ask are still respected.

CLI runtime, persisted schemas, dependencies and approval boundaries are unchanged.
Existing projects need no migration. Updating installed skills does not silently
update project infrastructure; use adopt for a separately approved project update.

The source adds restricted-helper-policy coverage for Windows and retains qualified
mechanical and agent follow-up assessments. One assisted memory observation supports
the guidance correction; it does not establish native autoload, general model
compliance, unique memory causality or measured human benefit. Earlier failed,
assisted and unexecuted scenario grades are unchanged.

## Install or update

Requires Node 22.20 or newer and Git. Back up locally edited skill folders first:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/1ab71cc59579bedee46cff0a83acddc328915260 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

## Verification

Source: `bd8cdd3b80b6f43de3a934c913f099a8a758ca9d`.
Distribution: `1ab71cc59579bedee46cff0a83acddc328915260`.

Local source gate: 1,224 passed, zero failures, two expected local skips.
[Public offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/46102648184)
and [all six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/46102649717)
passed, including actual Windows commands and restricted-helper refusal on both
Node versions. Both standalone self-tests and 14 isolated CLI invocations passed.

Local and public full-SHA installation, update, repeat, backup restoration and
removal were checked with pinned Node 24.15.0 and skills 1.7.4. These are
controller-directed macOS checks. Recovery uses constructed incomplete folders;
it does not prove an actual interruption at every installer-copy step.

Archive SHA-256: `846d07eee23d621c640b9d771f183e48a86990567e63e0e6b0dddc96cc46514b`.
Payload manifest SHA-256: `44c8d9b9f7f117640d2ba0db3abae17dd42bf3e78022245a469d10f12d93c729`.

The [release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-28-release-1.8.3/README.md)
records returned assets and website metadata separately as those steps complete.
No new live model sweep or paid API evaluation is included.
