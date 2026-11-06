# Tibicen 1.5.0

Tibicen now helps an agent explain which project instructions it checked, review the sources behind remembered decisions, and judge a supplied upstream change against the current setup. These are optional inputs to the existing read-only report. Existing report callers, persisted formats, approval and write boundaries stay compatible; no project migration is needed.

## Added

- Hash-bound, caller-selected instruction sources, including custom files. A match confirms current permitted bytes; it does not prove native loading or precedence.
- Explicit links between a remembered decision and an earlier source hash. Changed or missing source bytes prompt review; they do not automatically invalidate a decision or rewrite memory.
- Supplied version-impact assessments linked to current local evidence. Tibicen separates supplied source/version claims from its own local comparison and does not fetch, install or update tools automatically.

The bilingual landing also clarifies optional project files, simplifies its footer and uses clearer setup example labels.

## Install or update

Use Node >=22.20.0 for the installed CLI. Back up local edits in installed Tibicen skill folders before replacement. Existing project instructions, memory and setup history are outside installer replacement. Follow the [installation guide](https://github.com/warbr1ng3r/tibicen/blob/main/docs/INSTALLATION.md) for update, recovery and removal.

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/0706d7caf6a93b79a117379c1cd5f8cd95effb04 -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

Source: `1d0f8a0e65ee966cb3fbddef1bc0c128ed54d441`. Distribution: `0706d7caf6a93b79a117379c1cd5f8cd95effb04`.

The three assets are the archive, the per-file distribution manifest and the outer asset checksums. The archive has 110 skill payload files plus SHA256SUMS. SHA-256 of tibicen-1.5.0.tar.gz: `f6d5aa6f8dda0aef5f51ded9e711f534490d27ebdc289505fed73eef18fc2b46`.

## Checks and limits

- The versioned candidate passed 1035 offline tests with one existing manual portable skip; standalone checks passed 3/3.
- Exact local update from 1.4.1, backup restoration at installed paths, removal and preservation passed. Public full-SHA delivery passed; exact public CI/platform runs are linked below and must pass before publication.
- Three assisted, fresh Codex 0.157.0 subscription sessions with requested gpt-6-astra read the staged skill and used real scan/report commands on synthetic fixtures. They cover custom instructions, a changed memory source and a sufficient direct-Node setup. One missing shasum command in the last session exited 127; the same session recovered with sha256sum. This is not a clean all-command pass, unassisted discovery, all-harness validation or a human usefulness study.
- Broad native/model compatibility, installed versions, live MCP connections and measured human benefit remain unverified. No background updater or new memory engine is introduced.

Full evidence and preserved failed preparation attempts: [release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-07-release-1.5/README.md).

Public source CI: https://github.com/warbr1ng3r/tibicen/actions/runs/42305982054.
Six platform cells: https://github.com/warbr1ng3r/tibicen/actions/runs/42306168341.
Public full-SHA delivery: Passed: four installer calls, two installed self-tests, exact fetch/checkout and lock binding, complete edited-backup restoration/removal, project and later memory preservation; independent review passed..
