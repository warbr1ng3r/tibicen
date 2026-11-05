# Practice evidence dashboard

5 November 2026 (Moscow). **Implementation complete; Unreleased.**

| Ticket | Status | Result |
| --- | --- | --- |
| [Core](issues/01-core.md) | Resolved | Optional version input; focused discovery/built CLI9/9 + existing CLI5/5 pass |
| [Rules](issues/02-rules.md) | Resolved | Evidence limits and smallest justified recommendation; resource/proposal2/2 pass |
| [Documentation](issues/03-docs.md) | Resolved | Existing adopt guide/changelog EN/RU; links/parity/input/published entries checked |
| [Integration](issues/04-integration.md) | Resolved | Independent Ship; full801/801 gate without skips, both standalone self-tests and92/92 checksums |

All6 detailed tasks in [OpenSpec](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/tasks.md)
are complete. [Verification](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/verification.md)
and [independent review](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/review.md)
retain exact scope, checks, corrections and limits. The change was synced and archived during the later delegated release preparation;
its original review and verification remain available.

The gate used Node24.15.0 and pinned pnpm11.21.0 with portable lifecycle enabled.
All99 input hashes remained unchanged; package/lockfile/version and skill entry
bodies preserved. Markdown links/parity were checked manually; Markdown is
excluded from Prettier. Earlier research retains its pre-implementation baseline.

Versions remain caller-supplied context, not automatic installed-version or
compatibility proof. No real HTTP/native/model check or measured usefulness,
new dependency, schema, version bump, commit, push or release is claimed.
