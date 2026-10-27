# First limited public alpha — 27 October 2026

[0.1.0-alpha.1 prerelease](https://github.com/warbr1ng3r/tibicen/releases/tag/v0.1.0-alpha.1) and [landing page](https://warbr1ng3r.github.io/tibicen/) are published. This is a limited macOS/Node 24/Codex iteration; the full MVP remains open.

- Public source: `e0f59a55c7ce7581e402c3e270aa162fa1e0dc52`; all 409 source files match the reviewed snapshot. Private development history, tracker and raw evidence were excluded; the original local history was preserved.
- Distribution/tag: `db03ebc988af1e38ea9f62c02027945ba40660fc`; 86 file hashes match the exact public source rebuild, frozen candidate and actual SHA/tag installations. Both installed CLI self-tests passed outside the checkout.
- Clean local gate 668/668 and independent ponytail Ship. [Merged-main Ubuntu CI](https://github.com/warbr1ng3r/tibicen/actions/runs/40437643480) and [Pages deployment](https://github.com/warbr1ng3r/tibicen/actions/runs/40438226284) passed.
- Transition from the previous local 0.1.0 preserved 11 external files before resume. The same unfinished session completed, prior history remained, and unknown state/manifest schemas were refused without writes. Removal preserved 16 external files and verified backups.
- The three assets downloaded from the published release match local bytes and GitHub SHA-256 digests. Their checksum file verifies. The archive contains only the two skills and their 86-file inventory.
- Public-page smoke: logos/resources loaded under `/tibicen/`, the pnpm selector changed the tagged install command, and the constructor downloaded a valid local schema 1 preset. This check does not repeat the full browser suite.

[Machine-readable summary](results.json) contains the public refs, results and limits. Raw logs, receipts and screenshots are maintainer-local; they are not linked as publicly available artifacts.

The previous candidate was local, so this is not a transition between two already public releases. Installer replacement deletes local edits/extra files inside installed skill directories: back them up outside the installation. A pinned `skills update` stays on its ref; select a new release explicitly. Full component/agent/platform coverage, native loading, human/usefulness pilot and private support contacts remain open.
