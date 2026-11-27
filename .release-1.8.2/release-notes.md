# Tibicen 1.8.2

This compatible patch prevents recognized literal credentials under secret-like keys from appearing in proposal content
or diffs and from being written through approved ordinary infrastructure changes.
Raw content and structured MCP inspection share strict complete-placeholder and
secret-key rules. Spaced literals, authorization/credential names and escaped or
duplicate JSON keys are checked; complete encoded placeholders remain supported.
It also reports unsafe change paths consistently before other per-change refusals.

Persisted schemas and dependencies are unchanged. Existing approval, application
file protection and interpreter restrictions remain. No project migration is needed.

Install/update uses the exact distribution SHA shown below after publication. Back
up locally edited skill directories before replacement. Existing project setup is
updated separately through adopt. Installation/update/restore/removal and support
limits are recorded in the release report.

This release does not claim universal harness autoload, general model acceptance,
human benefit or completion of the selected 185-scenario matrix.

## Install or update

Requires Node 22.20 or newer and Git. Back up locally edited skill folders first:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/2f151b9fb1b9a2a3553e374fbb0ba6ad5b02fbb5 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

## Verification

Source: `4e2257a5ceff9df62ce2709f0cdf0b86e0105cc2`.
Distribution: `2f151b9fb1b9a2a3553e374fbb0ba6ad5b02fbb5`.

Local gate: 1,224 passed, zero failures, two expected skips. Independent Ponytail
review accepts the scoped correction. [Public offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/45926415370)
and [all six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/45926417347)
passed, including actual Windows commands on both Node versions. Local and public lifecycle
checks retain controller assistance and ordinary OS permissions; recovery uses
constructed incomplete folders rather than proving interruption at every copy step.
No native harness autoload or measured human benefit is claimed.

Archive SHA-256: `27158c13d3d899c5c13755765634dff2e6f642a9ded04b1fd806a76bac71a4f2`.
Payload manifest SHA-256: `491e3cb133e7b7b197f68317170b3830562c6a1bf900830e3b8e8147c7a83481`.

[Release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-27-release-1.8.2/README.md).
