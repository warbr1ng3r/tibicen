# Nested memory connection verification

**5 November 2026 (Moscow), local Unreleased correction.** This follows the
[completed diagnosis packet](../2026-11-05-clarify-adopt-diagnosis/verification.md).
Published 1.1.0 and package metadata are unchanged. No commit or publication.

## Observed defect and correction

Real temporary-project scans reproduced a false `missing-memory-connection` for
existing nested Cursor rules, Claude rules and `.cursorrules` containing the same
literal project-root-relative memory pointer accepted at the root. Thirteen
controlled cases and three actual protected-write refusals established the
boundary. The first reproduction wrapper wrongly expected an empty synthetic
home after fixture apply; its correction compares the legitimate post-setup
baseline. Both attempts are retained, without treating the wrapper error as a
product defect.

Only two read-predicate patterns changed. The sole caller remains guarded
structural verification; pointer matching, safe reads, scanner, stores and write
allowlists are unchanged. Fifteen regression cases were added to the existing
memory test fixture. Before the fix the eight positive cases had five passes and
three failures, exactly the nested native forms. Afterward the combined focused
memory/diagnosis/report set passed **45/45**. EN/RU guide paragraphs and Unreleased
entries describe structural recognition and unchanged permission/loading limits.

## Independent review and integrated checks

Independent Ponytail review returned **Ship**, with no mandatory findings. The
reviewer read the connected scanner, pointer matcher, verifier and write guards;
independently ran all **32 memory tests**, and checked translation/link scope.

Pinned Node 24.15.0 / pnpm 11.21.0 `pnpm test` passed lint, formatting, core/site
types, site build, strict active/main/archived specs, distribution build and
**798/798 tests, zero failures or skips**. The portable lifecycle was explicitly
enabled through `TIBICEN_PORTABLE_DIST`; it ran both copied skills and only its
own generated fixture application checks. Node tests took 69.894 seconds. A
separate `pnpm build` also passed: **92 payload files, 46 per skill**.

After that build, a separate copied-distribution check passed on its first
execution: **six cases across both skills, 34 CLI commands**. Exact zero-edit,
zero-command memory-binding plans were independently hashed and approved by the
operator of disposable fixtures. With the root seed removed, each nested form
passed verify/report; removing its pointer produced the expected missing
connection. Actual nested write proposals still failed as application-protected.
Memory bytes/mode, application, saved manifest/session and isolated home remained
unchanged by reads. Source/dist/copied payload inventories matched before/after;
temporary projects were removed. This added check executed no application,
native/model or network command.

## Byte binding and limits

Receipts are retained privately under
`.evals-private/nested-memory-instructions-20261105/`: original `results.json` and
`source-and-attempts.json`, `review-fixed.json`, `full-gate-fixed.log`/`.json`,
`build-fixed.log`, `build-inputs-fixed.json`, `distribution-fixed.json`, and the
`post-fix-built/` command, plan-review and protected-file receipts. No original
pre-fix result was overwritten.

The 48-input inventory SHA-256 is
`43f0c6a87a285721fb622505f6b64ccd7fa67862868b9e4586aa0fa070442498`;
the 92-payload inventory SHA-256 is
`3732b10c575189ca5ec5b26561acf443ebd2a8580449e40a7bab3e47bc11b4ab`.
Both use sorted-key compact JSON without the final newline and include modes.
Only `scripts/core/memory.ts` differs from the previous packet's build inputs.

These are synthetic offline engineering results on darwin arm64. They do not
establish native loading, task-wide applicability, behavioral use, human benefit,
new platform coverage or public delivery. Development metadata remains 1.1.0;
these changed bytes are not the published 1.1.0 artifact. No dependency or landing
change is included.

## Workflow closure

All four tracked tasks completed before archive. The one added requirement and
three scenarios were synced exactly to the main project-memory spec; its earlier
bytes and Purpose stayed unchanged. The change was archived on 5 November and
affected relative links repaired. Strict main/active/archived validation passed
after the move. These documentation operations did not change tested inputs or
distribution bytes.
