# Release 1.2.0

Labels: wayfinder:map
Status: claimed
Assignee: /root

## Destination

The owner's new instruction delegates the remaining work after the reviewed
practice-evidence packet. Root proceeds through candidate preparation, checks,
commit/push, public CI/platform/delivery gates and publication only when mandatory
checks pass. Earlier packet restrictions remain historical; this effort owns the
new scope. No paid API, credential changes or old-tag/asset rewrites.

## Decisions so far

- Compatible new CLI functionality plus adopt improvements target SemVer1.2.0.
- Existing native/memory support limits stay explicit; research is not proof of
  measured benefit. The release must bind affected checks to frozen bytes.
- Root owns version/changelog/source history/publication. Independent lanes audit
  the release gap and prepare finite candidate acceptance before root integration.
- Public/local Git histories differ; use an isolated public worktree and normal
  fast-forward publication, preserving original local and published histories.

- Reviewed implementation/research committed locally as
  `300ef76` (`feat(practices): bind guidance to supplied agent versions`).
- Completed OpenSpec change synced/archived; published1.1.0 remains untouched.
- Fresh cached route metadata passed; candidate observations remain unconsumed.

## Tickets

- [Audit release requirements and existing evidence](issues/01-audit.md)
- [Prepare bounded changed-behavior acceptance](issues/02-acceptance.md)
- [Prepare, verify and publish the candidate](issues/03-release.md)
