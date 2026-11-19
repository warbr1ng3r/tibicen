Tibicen 1.7.1 is a compatible patch.

- Keep pre-existing failures stable when only recognized Node spec/TAP or Python unittest runner timings change.
- Preserve meaningful assertion values, test names and changed nonzero exit codes when comparing failures.
- Clarify proposed command trust, checked environment readiness, actual check profiles and external approval replies.

No CLI/schema migration or dependency change. Unsupported runner output remains strict. Digest matching does not authenticate the approver; this release does not claim a fresh behavioral cure, native autoload or human consent. Original scenario failures remain disclosed.

Local gate: 1,185 passed, zero failed, two existing skips. Independent Ponytail review and exact-candidate checks passed. Public CI, six platform cells and actual public delivery are required before publication.

Install/update both skills from the full distribution SHA using the pinned installer:
    npx --yes skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/9a5e1ef2eb837075bb79e2fb2db01f439343d28d -g --agent universal --skill tibicen-init tibicen-adopt --copy -y

Back up edited skill folders before replacement. Restore complete backups for rollback; removing Tibicen skill folders leaves project instructions and memory intact. Verify downloaded bytes against SHA256SUMS and distribution-SHA256SUMS. Published 1.7.0 remains immutable.
