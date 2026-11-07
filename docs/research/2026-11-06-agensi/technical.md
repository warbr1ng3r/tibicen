# Agensi: Tibicen delivery and packaging study

Date: 6 November 2026. Canonical English report. Scope: public documentation and read-only inspection of published 1.4.1 payloads. No account connection, upload, installation, model run or marketplace acceptance test was performed.

## Finding

An unchanged ZIP of Tibicen can meet Agensi's upload format while failing its execution contract. Tibicen is a local, multi-file Node tool controlled by staged skill instructions. Agensi serves skill text through MCP and directs agents to execute individual scripts temporarily. A ZIP conversion alone does not reconcile those models.

Do not promise a full working Tibicen listing until that boundary is resolved. First request a free open-source/directory exception or classification for the existing product. A self-contained diagnostic skill is a clear technical fit, but is a different, narrower product; build it only for independent user value. A free launcher that uses an independently downloaded GitHub release could preserve the full product with less duplication, subject to explicit platform admission and separate installation approval. Neither option has been implemented or accepted here.

## Published artifact actually examined

The study read the existing returned release archive at `.evals-private/release-1.4.1-20261106/publication/returned-release/tibicen-1.4.1.tar.gz`, without extracting or executing it. Its SHA-256 is `c3302cf25284120d009ee7b01c9044cdc0193c8c658597e0f24fe7e65233dcb8`, matching the [published installation guide](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) and [release receipt](../../evals/results/2026-11-06-release-1.4.1/README.md) (line 53). This is an inspection of a previously returned public artifact, not a fresh download from GitHub.

| Observation | Actual value |
| --- | --- |
| Compressed archive | 265,489 bytes |
| Regular files | 101: 100 payload files and root `SHA256SUMS` |
| All regular file modes | `0644` |
| Each skill | 50 files: 31 scripts, 16 references, `SKILL.md`, `package.json`, `LICENSE` |
| Uncompressed init/adopt payload | 523,363 / 523,840 bytes |
| Differences between the two trees | Only `SKILL.md` and package name; 48 files are identical |
| File encodings | All 101 regular files decode as UTF-8 |
| Current generated `dist/` | All 101 bytestrings match the returned archive; no rebuild performed |

The two payload trees already total 100 files: adding the root checksum, README or provenance record exceeds the creator-agent upload count. Separate 50-file ZIPs fit that count; a complete pack should use the website route if ever admitted. Size is not the primary blocker.

Four scripts in each skill exceed 20,000 bytes: `core/apply.ts` 31,564; `discovery/index.ts` 20,090; `mcp/diagnosis.ts` 26,417; `verify/index.ts` 31,971. This relates to Agensi's review guideline, not a demonstrated rejection.

The source build deliberately copies a complete runtime and references into each skill, omitting the build script and evaluation harness, and generates a minimal package and payload checksums ([build](../../../scripts/build.ts) (line 51)). Do not upload only `skills/tibicen-init/` or `skills/tibicen-adopt/`: those source folders contain entry instructions, not the complete distribution. Do not upload the whole development repository, dependencies, evaluation fixtures or OpenSpec development tooling.

## Local runtime contract

The following line references are to matching local sources, cross-checked against the archive's relevant files.

- Both entries define `SKILL_DIR` as the installed `SKILL.md` directory and resolve scripts/references from it ([init](../../../skills/tibicen-init/SKILL.md) (line 10), [adopt](../../../skills/tibicen-adopt/SKILL.md) (line 10)). Both contain both routes, so installing another entry is unnecessary when project state changes route.
- `scripts/tibicen.ts` imports sibling modules immediately ([CLI](../../../scripts/tibicen.ts) (line 5)); other commands import more modules dynamically. Running that file alone from an arbitrary temporary location cannot resolve those files.
- The runtime reads `../../package.json` relative to `contracts.ts` for its version ([contract](../../../scripts/core/contracts.ts) (line 9)). Self-test reads the real `references/stage-*.md` tree ([self-test](../../../scripts/tibicen.ts) (line 414)). Providing text in model context does not provide those filesystem dependencies.
- Installed 1.4.1 requires Node ≥22.20; development currently has a higher engine floor. Archive installation does not need Git, package managers, a checkout, or development dependencies. The host needs local project reading and Node execution, or an operator returning actual results ([requirements](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) (line 15)).
- Application is not an instruction-only rewrite: exact proposal content, digests, preservation, recovery and verification are enforced by the CLI. Bypassing a refused apply with ad hoc agent writes changes the product's contract ([build stage](../../../references/stage-build.md) (line 5)).
- Modes `0644` do not block `node scripts/tibicen.ts`; no executable binary is required. Agensi's temporary file suffix/Node invocation still needs confirmation. There is no separate `assets/` tree in this payload; required references and package metadata remain essential.

The [Agent Skills specification](https://agentskills.io/specification) describes a directory and relative references. It does not guarantee that an MCP marketplace preserves a local directory or resolves Node imports.

## What the platform documents

These are Agensi's published statements, checked on the study date, not observed service behavior.

| Interface | Documented constraint |
| --- | --- |
| Website ZIP | 50 MB, 1,000 files, up to 50 skills |
| Creator agent upload | 100 text files, 5 MB |
| Buyer text delivery | All `SKILL.md` files, up to 200 other text files, 6 million characters |
| Script model | Independent temporary execution; no access to other package files |
| Review guideline | Script logic under 20 KB; embedded data excluded |

[Packaging reference](https://www.agensi.io/docs/packaging).

`get_skill` loads instructions/index, supports individual `file` retrieval, and uses `path` for pack selection. Agents are told to fetch again next use, retain no skill in project/skill folders, and run script bytes unchanged temporarily. Binary resources are not served. [Delivery reference](https://www.agensi.io/docs/how-agents-load-skills).

A skill pack is one multi-skill listing. A commercial bundle groups existing paid listings; it does not create a shared runtime. [Product formats](https://www.agensi.io/docs/what-you-can-sell), [bundle rules](https://www.agensi.io/docs/bundles).

The remote server requires OAuth for tool use and allows one connected agent per account. MCP delivery adds neither project access nor local shell execution. The actual host must supply those capabilities. A chat receiving references only can advise, but cannot perform a local scan/apply. [MCP reference](https://www.agensi.io/docs/mcp-server), [Tibicen host requirements](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) (line 20).

Generated project configs/reports are permitted outputs; retaining the delivered skill, scripts or templates is different. Open-source listings are allowed when licence conditions are followed. The FAQ also says listings can only be loaded after going live; loading one's own live listing is free and excluded from use counts. [Creator FAQ](https://www.agensi.io/docs/creator-faq).

## Options and work required

The judgments below are engineering inference from those contracts. “Supported format” does not mean “works in Tibicen” or “will pass review”.

| Approach | Evidence status | Work and decision |
| --- | --- | --- |
| Two unchanged full ZIPs | Single-skill format supported; runtime incompatible under documented execution | Preserve release bytes and all 50 files per ZIP. Separate search entries/updates, duplicated core. Do not publish as working full Tibicen without an exception. |
| One ZIP retaining both complete trees | Pack format supported; same runtime conflict | About 1.06 MB raw; within website limits. Add pack README. Route selection improves, local module problem remains. |
| One pack with shared core/references | Shared file delivery supported; local execution unverified | Deduplicate 48 identical files, rewrite entry/reference paths and version lookup as needed. Shared files in context do not make a local import graph. Requires a new build target and evidence, not moving folders manually. |
| One merged dispatcher | Plausible custom skill; current product has two entries | One entry can route by existing infrastructure, which both entries already do. Does not solve execution. Adds a new public interface and maintenance/testing work with limited technical gain. |
| Self-contained native Agensi port | Script contract fits in principle; implementation unknown | Generate independent operations with embedded data, no sibling imports or filesystem resources. Preserve proposal/apply hashes, recovery and bounds. Merely bundling everything into one very large script conflicts with review guidance and is not a small packaging fix. |
| Thin free bootstrap/launcher | Plausible; platform admission unresolved | Keep marketplace wrapper in context; download separate pinned MIT release from GitHub after approval, verify it, load it locally. Retains existing runtime and avoids copying platform-delivered code. Requires clarification described below. |
| Useful guide with source referral | Technically simple; listing quality/admission unknown | Provide a concrete environment/readiness assessment or installation decision, then link official docs. A redirect-only card may not deliver the promised work. Explicitly call it a guide; do not claim completed local setup. |
| Diagnostic/lite product | Best direct fit, but a new product | A text workflow or independent read-only script reports missing/conflicting infrastructure with reasons. No managed writes/recovery/full init claim. Define scope and useful output before implementing; do not imply CLI-equivalent checks. |
| No listing now | Immediately feasible | Keep canonical release and installation; revisit if platform supports retained dependency trees or admits the external-runtime approach. No product regression or extra release stream. |

### Bootstrap boundary: external distribution versus exporting the skill

These cases must remain distinct:

1. Reconstructing the marketplace-served Tibicen module tree in a project or installed-skill directory conflicts with Agensi's documented no-retention directive. A paid wrapper cannot silently relabel its delivered source as generated output.
2. A small marketplace guide can link independent official documentation. The format even accepts a `docs_url`. A link is not evidence that automatic installation is admitted.
3. A launcher might download the independent MIT GitHub release, rather than copying any marketplace response. That is technically and provenance-wise different from case 1, and respects an independently obtained licence. However, Agensi says products needing local installation are not offered; no public document clearly classifies this dependency-style launcher as accepted. Open-source listing permission does not remove that uncertainty. [Packaging](https://www.agensi.io/docs/packaging), [supported products](https://www.agensi.io/docs/what-you-can-sell), [Terms §5.2](https://www.agensi.io/terms).

Public listings show the policy needs clarification: [start mcp gateway](https://www.agensi.io/skills/start-mcp-gateway) advertises cloning a public repository and starting Docker; [Project Setup](https://www.agensi.io/skills/project-setup-app-idea-to-prd-mvp-backlog-build-plan) describes a retained local skill folder and an alternative ZIP install. These are seller claims visible on live pages, not inspected skill payloads or proof that the current policy allows Tibicen. The latter directly conflicts with the general no-retention delivery description.

Ask Agensi to classify this exact model before implementation: a **free original readiness/launcher skill**, independently useful, no export of its marketplace content, explicit user approval, direct downloads of the creator's separately MIT-licensed release, checksums, local execution, and GitHub remaining canonical. Also ask whether the resulting locally installed Tibicen may remain for future direct use. This is a policy question, not a request to relax security checks.

If admitted, pin both the launcher version and Tibicen runtime version separately. Prefer the existing manual archive procedure to avoid requiring a package manager or Git. Use a fresh empty directory; verify the trusted manifest digest, the two asset entries, the extracted payload manifest and each payload. Show origins, paths, download/execution and persistence before approval. Never use `curl | sh`. Preserve the exact release licence and hashes. The full-SHA installer is an alternate documented route, with its own pinned installer and replacement/backups behavior ([installation](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) (line 29), [archive verification](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) (line 85)).

Agensi automatic updates would update the wrapper, while local Tibicen has no background updater ([Tibicen update contract](https://github.com/warbr1ng3r/tibicen/blob/319845f1f1597817807c81579b42250a1f189e7d/docs/INSTALLATION.md) (line 170)). Do not auto-replace a runtime during an approved session or silently switch a pin to “latest”. Record the source/version that actually ran.

## Packaging manifest for a future candidate

This is a proposed checklist, not an upload artifact produced by this study.

For unchanged full-payload comparison, use only these two inventories:

```text
separate listing ZIP                 pack ZIP
SKILL.md                            README.md (new pack explanation)
package.json                        tibicen-init/ (all 50 release files)
LICENSE                             tibicen-adopt/ (all 50 release files)
scripts/ (31 files)                  release-provenance.json (new, optional)
references/ (16 files)
```

The manifest should record upstream release `1.4.1`, source `319845f1f1597817807c81579b42250a1f189e7d`, distribution `52c0769574e90d7d1a0438996df9da40621b0107`, archive hash above, per-file digests/modes, adapter version and every changed path. A new ZIP has a new digest; do not reuse the tarball hash as its checksum. If payload paths are repacked, retain the upstream manifest as provenance and generate a correctly scoped package manifest separately. Confirm every referenced resource survives delivery; omit no module to satisfy an arbitrary file count.

For the bootstrap candidate, a reasonable small layout is `SKILL.md`, `references/requirements.md`, `references/release-1.4.1.md`, `references/verification-and-recovery.md`, `LICENSE` and, only if needed and admitted, one self-contained reviewed script. Do not ship the full runtime inside that wrapper. Declare local file reading/writing, terminal, Node, exact network origins and user-selected directories honestly. List optional Git/package-manager dependencies only for the installer route.

Security review can flag network plus local reads, command execution and writes; these capabilities are central to the full workflow and must be explained, not hidden. Agensi documents warnings, possible false positives and final human judgment; its scan is not proof of safety or functional compatibility. [Review rules](https://www.agensi.io/docs/review-and-approval), [security limitations](https://www.agensi.io/docs/security).

## Proposed acceptance probes

None of these were performed for Agensi. A future authorized packet should separate the gates:

1. **Offline package:** exact allowlist, UTF-8, file counts/size, licence, no secrets/dependencies, preserved resources, entry paths, module graph, manifest bytes and modes; inspect scan-sensitive capabilities. Do not infer delivery from ZIP validity.
2. **Local transport emulation:** load wrapper/text resources without assuming a local skill directory; run each candidate script unchanged in isolation from temporary files. Test missing Node/terminal/project access, paths with spaces, unrelated CWD and denied network. A successful emulation is not actual marketplace delivery.
3. **Platform review:** confirm the chosen product model and disclose capabilities; submit only with publication authorization. A creator submission preview is a metadata confirmation step, not runnable marketplace acceptance. [Creator submission](https://www.agensi.io/docs/submit-from-your-agent).
4. **Own live listing:** after approval, observe actual pack index/`path`/`file` delivery, resources, directives and temporary execution. Test both routes independently. Record versions and returned content. This gate requires a live listing; do not promise a private platform test that the FAQ does not offer.
5. **Full workflow if claimed:** show exact plan before writes; apply a fresh init and adopt/preservation case; check no-change, missing capability, interruption/recovery and project-file preservation. Keep native loading, structural checks, useful task and human benefit separate. Existing 1.4.1 release evidence does not cover the new transport.
6. **Update/lifecycle:** prove latest wrapper versus pinned runtime behavior, refusal on hash mismatch, backup/restore/removal and preservation of sibling skills and project output. Check retention/deletion policy explicitly. Agensi serves the newest approved listing; rejected updates leave the live version unchanged. [Update reference](https://www.agensi.io/docs/updates).

No implementation estimate is measured. A guide is comparatively small; a bootstrap is a bounded integration if admitted; a full isolated-script port is substantial product work requiring OpenSpec, focused tests and new acceptance evidence. Do not create that work merely to obtain a listing.
