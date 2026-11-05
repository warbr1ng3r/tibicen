# Version-bound practice evidence

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Implement the owner's approved next packet through the [OpenSpec change](../../openspec/changes/archive/2026-11-05-bind-practice-evidence-to-agent-versions/proposal.md).
Existing init/adopt should carry available agent-version context and explain
keep/change/unknown without treating fetched guidance as proven compatibility.
No new command, automatic tool execution, background process, dependency,
persistent schema, version bump, commit, push or release.

## Decisions so far

- The owner's “Поехали” approves the previously presented requirements,
  core/rules/docs parallel implementation, integration and Ponytail review.
- Reuse optional --input FILE|- with agentVersions; missing observations stay
  gaps. Selected --agents remains authoritative; validate before HTTP.
- Root owns planning/tracker/integration/review; three lanes own disjoint paths.
- Earlier technology-refresh research changes remain in place and outside
  runtime scope. They are included in final uncommitted review without rewriting
  the historical research-only completion record.

- [Core](issues/01-core.md): implementation and focused/source/standalone checks complete.
- [Rules](issues/02-rules.md): one evidence rule with connected stage pointers; checks complete.
- [Docs](issues/03-docs.md): paired guide/changelog examples and manual parity complete.

- [Integration](issues/04-integration.md): independent Ship and final801/801
  gate without skips; both self-tests,92/92 checksums and unchanged version/input
  bindings. Full packet complete locally and Unreleased. A later delegated release
  effort synced/archived the completed change.

## Tickets

- [Implement core version input and offline delivery checks](issues/01-core.md)
- [Clarify evidence and recommendation rules](issues/02-rules.md)
- [Explain version-aware outcomes in project guides](issues/03-docs.md)
- [Integrate, review and verify the packet](issues/04-integration.md)
