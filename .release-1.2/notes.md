Tibicen 1.2.0 adds version context to practice evidence and makes reviews of existing agent setup clearer. It is a compatible feature release after 1.1.0.

## Changes

- Supply known agent versions when requesting practice evidence. Omitted versions remain unknown. A fetched source, its date and hash do not by themselves prove that its advice fits a particular release or project.
- Get a clearer adopt diagnosis: current project structure, saved setup history and checks that have not been performed are reported separately. A useful existing setup can remain unchanged.
- Recognize supported memory links in nested native instructions while preserving their directory scope and existing notes.

No background updater or new required framework is introduced. Tibicen still proposes a concrete setup and applies it only against the approved plan digest.

## Installation

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/0656f12e00ea83d84229180d331f3178bf253407 -g --agent codex --skill tibicen-init tibicen-adopt --copy
```

The example installs into the Codex user scope; the existing installer targets also include `claude-code` and `cursor`. Back up locally edited skill directories outside the installation before replacing them. Use `tibicen-init` for a new setup and `tibicen-adopt` to review an existing one inside your coding agent. See the [project guide](https://github.com/warbr1ng3r/tibicen/blob/main/README.md).

## Validation and scope

- 804 offline tests passed without failures or skips; normal GitHub CI passed on source `fb80e78198e7fe12353fbe8f9319f84ac943f792`.
- Six OS/Node platform cells passed. Their unchanged build/runtime inputs are bound to this candidate.
- Public Git installation, pinned update, edited-file backup/restore and removal passed for the three existing installer targets. These mechanical checks do not establish native instruction loading.
- Two fresh supplied-context init/adopt recommendations passed independent review. The exact init text was separately approved and applied on an owned fixture; structural verification and a read-only report were observed with protected project files preserved. A root collector error stopped the original lifecycle after status, so its remaining report was observed separately; the stopped attempt is retained in the release report.

The original native CLI init attempt failed before an assistant response; its cause remains unknown. Its adopt case was withheld. The separate Desktop observations use explicitly supplied candidate instructions: they do not prove implicit skill discovery, current Cursor behavior, executor model identity or measured human benefit. Historical positive component observations retain their original inputs, versions and limits. Supported capability coverage is unchanged; naming an agent or providing a version does not establish compatibility.

The [release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-05-release-1.2/README.md) keeps the observations and limits separate.

## Artifacts

The tag points to distribution commit `0656f12e00ea83d84229180d331f3178bf253407`.

- `tibicen-1.2.0.tar.gz`: SHA-256 `fa33bdfbad280cba71b199671e280d71fcda1fc0b568b66130b0a1036aba47d9`.
- `distribution-SHA256SUMS`: checksums for all 92 payload files.
- `SHA256SUMS`: checksums for the archive and distribution checksum file.

Existing 1.0 and 1.1 releases remain available. The project maintainer and private vulnerability-reporting route are listed in [SECURITY.md](https://github.com/warbr1ng3r/tibicen/blob/main/SECURITY.md).
