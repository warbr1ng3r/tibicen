# Tibicen 1.8.2

This compatible patch prevents inline credentials from appearing in proposal content
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
