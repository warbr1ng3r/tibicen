# Tibicen 1.8.1

Compatible patch. No migration is required. Approval boundaries, saved state schemas and dependencies are unchanged.

- Correctly compare unchanged failing pytest runs when only summary timing, timedelta clocks or terminal padding differ. Test counts, assertion values and non-clock diagnostics remain meaningful differences. Unsupported output formats retain strict comparison.
- Make the first proposal easier to approve: plain summary, affected files and one explicit question. Defaults and silence do not approve a plan.
- Clarify CLI exit/result semantics and controlled-check environment limits: path pinning is not binary identity, script binding covers the entrypoint, and excluded virtualenv directories do not establish import isolation.

Source: `bb5758d688c0cd61115c7f24c9d25006b1766651`. Distribution: `3fab265ce311c8d2de9d8942da1b031f6aba49b3`.

Install the two skills using the pinned installer and full distribution SHA:

```sh
npx -y skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/3fab265ce311c8d2de9d8942da1b031f6aba49b3 --skill tibicen-init tibicen-adopt --agent universal --copy
```

Choose an appropriate scope for your project. Back up local skill edits before replacement; updating installed skills does not approve project changes.

Local gate: 1,213 passed, zero failed, two expected skips; standalone CLI/self-tests outside checkout with empty PATH; all 116 payload checksums and 117 archive files/modes verified. Exact-candidate lifecycle checks preserve unrelated files and later memory. [Source CI](https://github.com/warbr1ng3r/tibicen/actions/runs/45749197647) and [six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/45749199727) passed before publication.

Archive SHA-256: `90dd9b9634ceca7c8238d6e8ab85c5e73b3d9e603844b083404f0a1e1702c3cc`. Distribution manifest SHA-256: `25cda5d8b181d67f85d058480f62ddf0e4b2e37c1bfb1b3513a28c9becfe5b69`. Both checksum layers are attached.

Independent engineering review: Ship after correcting variable-frame handling, unrestricted clock annotations and environment wording. Native harness loading, measured human benefit and causal superiority over a plain agent remain unverified. The development assessment retains consent, context and protocol evidence limits; historical results are not regraded.

Published 1.8.0 and its assets remain unchanged.
