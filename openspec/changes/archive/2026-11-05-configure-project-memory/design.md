# Design

## Context

Tibicen 1.0.0 is already published. Its interview distinguishes evidenced lasting choices from temporary requests, and its shared-rule mechanism connects managed instructions. However, there is no explicit project-memory contract. Ordinary memory files are outside `isInfrastructurePath`; the approved planner, scan, recovery and verification share that boundary. Manifest verification normally expects fixed content. Adding only a memory template would therefore either fail writes or later flag legitimate notes as damaged setup.

Relevant seams are `scripts/core/{types,contracts,paths,plan,apply,recovery,components,finalize,runtime}.ts`, `scripts/scan/index.ts`, `scripts/verify/{index,scope}.ts` and shared stage references. Root `scripts/build.ts` generates both skill distributions; generated copies are not edited directly. Presets reject unknown fields and will retain their current schema.

This is a proposed design for owner review, not a record of implementation or acceptance. The [requirements](specs/project-memory/spec.md) define observable behavior; [tasks](tasks.md) own implementation checkboxes; the dashboard (`../../../../.scratch/project-memory/dashboard.md`; private development record; excluded from public source) owns work status. As in existing changes, capability translations live at the change root as `<capability>-spec_ru.md`: OpenSpec accepts only canonical `spec.md` deltas inside `specs/`.

## Goals / Non-Goals

Goals:

- Translate the user's ordinary request into small, correctable memory rules without requiring them to choose a tool.
- Configure one project store, reuse useful notes and preserve explicit decisions.
- Let future working agents read, update and correct memory under the approved policy.
- Preserve exact approval, recovery, application protection and legacy workflows.
- Accept observable behavior on a bounded candidate and prepare a compatible 1.1.0 release.

Non-goals: a memory service, vector database, dependency, watcher, cross-project synchronization, editing global/private agent memory, saving full chats, preset-schema expansion, a new agent support claim, or a landing implementation. Tibicen finishes its setup/report; working agents maintain memory afterward.

## Decisions

### 1. Keep policy in instructions and knowledge in one file

Use a short managed policy/pointer in applicable existing agent instructions. Keep durable project knowledge in one separate Markdown file. Default to `.agents/memory.md` only when no suitable store exists. Reuse an unambiguous existing store at `.agents/memory.md`, `MEMORY.md`, `docs/memory.md` or `docs/decisions.md`; these four exact paths form this release's bounded set.

Discover candidates through permitted scan results and existing references. Do not select by modification time, create competing files or silently combine conflicting stores. Unsupported stores remain untouched with an explicit gap/manual connection. Multiple material conflicts follow the existing interview/no-questions rules. This deliberately bounds the first implementation rather than granting all Markdown writes.

The policy states:

- Read relevant decisions before work they affect; do not load an entire history into every instruction file.
- Retain explicit lasting user constraints, verified project facts and useful accepted decisions with reasons/source when available.
- Distinguish assumptions and temporary task progress from confirmed knowledge. A project note cannot override higher-priority user instructions or authorize execution.
- Update after a newly accepted decision or verified correction; revise superseded meaning instead of keeping contradictory current instructions. Preserve unrelated notes.
- Exclude secrets, private transcripts and speculative preferences by default. Follow forbidden-path and permission boundaries.

Use readable notes rather than imposing an entry schema, mandatory timestamps or a new interview. Existing question limits remain. A request for autonomous work does not approve a setup digest; the normal explicit apply consent still applies.

### 2. Bind permission and ownership explicitly

Add one typed optional input, `memory: { path }`, and compile it into a memory record with ownership `user-memory`. The existing `changes` list carries exact initial memory and instruction edits. Policy text lives in the managed instructions, not a second JSON policy model. The path binding is included in the digest and session/manifest records; it is not an installed third-party component.

The planner recognizes only the bound supported path as memory infrastructure for that operation. Share this narrow decision with scan, apply, recovery, finalize and verification; do not broaden `isInfrastructurePath` into an arbitrary Markdown allowance. Retain project-root containment, symlink checks, forbidden paths, current hashes/modes and protected `.tibicen/` handling. Existing files are merged only through reviewed exact changes.

### 3. Separate completed mutable state from pending exact writes

While a plan is pending or interrupted, memory edits use the same before-content checks, journal and exact recovery protections as other approved writes. External edits invalidate a stale write; no special mutable-content exemption applies then.

After setup completes, verify that the canonical file is present, supported and safe and that its managed instruction connection remains intact. The body is user-owned mutable data: later notes do not require the initial content hash or reset to the installation template. Fixed checks still apply to managed instruction blocks. Preserve initial hashes as historical apply evidence, not as the expected current body. Adopt reads current notes as input and makes no change merely to run again. Existing uninstall/restore protections must not discard later user notes.

### 4. Version new semantics, preserve old workflows

Current formats are proposal 1, manifest 1/2 and recovery state 3. Introduce proposal 2, manifest 3 and state 4 for memory-aware plans/projects only. A 1.0 reader already rejects unfamiliar schema numbers; this prevents older writers from silently losing the ownership or permission semantics. New readers retain legacy proposal, manifest and recovery support. Ordinary non-memory work continues using its existing formats.

Validate all new record fields and the bound path. Show a memory manifest migration in the approved digest; preserve earlier session history and notes. Once a project uses manifest 3, later compatible operations retain its memory record and format even when they do not edit memory. Never silently downgrade it. An interrupted legacy session completes through its legacy recovery contract before a new memory proposal. Unit/fixture checks must use the actual 1.0 readers to prove refusal before writes, rather than assuming compatibility from numbers alone.

This is the only schema expansion in scope. If an existing contract makes this design incompatible with a supported legacy workflow, report it before release; do not conceal the break behind a minor version.

### 5. Parallel implementation has three owners

After owner approval, run three non-overlapping work scopes:

| Owner               | Scope                                                                                           | Shared boundary                                                                        |
| ------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Core agent          | Runtime seams named above, mechanical regression tests and minimal typed memory contract        | Sole owner of shared core/scan/verify code; supplies example inputs to the rules agent |
| Rules agent         | Root stage references and the two source skill entrypoints, plus instruction-content checks     | Uses this contract; no runtime or generated distribution edits                         |
| Documentation agent | EN/RU memory guide, post-1.0 release/contribution guidance and completed-work changelog entries | No website, package version or public support expansion                                |

Root integrates, owns conflicting test files and candidate metadata, runs the normal gate and builds the distribution. An independent Ponytail reviewer then inspects connected code and preservation paths. Findings return to the responsible owner; root freezes a new candidate after distributed changes and refreshes affected evidence. Landing recommendations remain separate.

### 6. Use a finite acceptance protocol on fresh contexts

Approval of this plan authorizes the following future synthetic-fixture protocol, not its execution during planning. Before launch, record the exact candidate inventory/hash, agent/model/tool versions (or explicit unknown), controlled launcher, permissions and fixtures in a new memory evidence folder. Do not reuse the exhausted historical 24/24 program.

Four primary Codex contexts cover two flows:

1. Init setup in a small generated project; review and apply a concrete proposal under the fixture authorization. A separate fresh task context must demonstrably consult the recorded constraint, make a useful compatible decision and retain a newly accepted fact.
2. Adopt setup with existing notes and a superseded rule; preserve unrelated notes. A separate fresh task context must consult the current decision and correct memory after an explicit change, without resurrecting the old rule.

Each context allows at most two agent turns and eight minutes. Two reserve contexts are allowed only for a diagnosed fix with independently reviewed revised inputs; retain the prior failure and account for each launch. Hard maximum: six contexts, zero paid-API spend, no authentication changes or real-project edits. Development/review subagents are not behavioral-evaluation contexts. Root may approve concrete synthetic setup digests; this is not human usefulness evidence. Do not prompt a fresh task to read a particular memory file just to manufacture compliance. Record whether instructions loaded automatically or were supplied manually; assisted behavior cannot establish automatic loading.

If the required controlled route is unavailable, record `unverified` and stop that acceptance scope instead of looping through login methods. A behavioral failure blocks memory behavior acceptance. Other target formats receive structural checks only, with no inherited Codex behavioral promise. Human benefit remains unmeasured; no owner questionnaire is required by this engineering protocol.

### 7. Follow normal post-1.0 releases

Use [SemVer 2.0.0](https://semver.org/spec/v2.0.0.html) and a human-readable [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) structure (checked 2026-11-04): fixes → patch, compatible features → minor, incompatible supported contracts → major. The planned compatible feature targets `1.1.0`; do not bump the version merely because planning exists.

Add completed changes to `Unreleased` during implementation. After integration passes, root prepares local candidate metadata from the root `package.json`; generated skill metadata inherits that version. Use `1.1.0-rc.N` only if distributing an actual prerelease, with a new version for every published correction. Freeze the candidate before fresh behavioral acceptance. Bind the final build, archive inventory, SHA256SUMS, unpacked self-tests and delivery observations to its bytes. Changes afterward require refreshed affected observations.

The release packet includes compatibility/migration notes, supported-versus-unverified outcomes, changelog, tag/commit binding, checksums, release notes and update/recovery/removal checks. Final public CI and the existing six OS/Node cells run on the authorized public candidate; do not expand that matrix for this feature. A commit, push and publication need a later explicit owner instruction on the concrete candidate. Never rewrite or replace published 1.0.0 tags/assets, or conflate the package's minor version with internal schema numbers. No release-automation dependency is needed.

## Risks / Trade-offs

- **Memory can become stale or noisy:** keep rules small, make uncertainty visible and correct current meaning. Do not promise automatic quality or measured usefulness.
- **User content could be overwritten:** exact initial approvals, preserved unrelated notes, immutable apply evidence and mutable post-setup ownership need both regression and interruption tests.
- **A narrow path set misses valid custom stores:** preserve and report unsupported paths; broader store adapters need a later scoped change.
- **New schemas prevent old runtimes continuing memory projects:** document the compatible runtime and test refusal before writes; preserve legacy sessions and an unchanged non-memory route.
- **Shared rules do not prove loading:** separate structural, manual-assisted, automatic-loading and observed task results. Do not generalize across agents or versions.
- **Evaluation can consume time without progress:** the six-context bound and diagnosed-fix rule replace repeated uncontrolled attempts.

## Migration Plan

1. Leave 1.0.0, its evidence and current non-memory projects untouched during planning.
2. After approval, implement opt-in validation and versioned ownership with legacy fixtures; align instructions and paired project guides.
3. Integrate and run focused regressions, then the repository gate/build. Prepare local 1.1.0 candidate bytes, independent review and bounded fresh-session evidence.
4. Produce a reviewable release packet. After explicit commit/push/release authorization, bind public CI, six platform cells and exact-candidate delivery to the public source; fix and refresh affected evidence as necessary.
5. Publish a new immutable tag/assets and matching notes only when checks pass. Archive/sync this development change only after its implementation tasks are actually complete. Optional later human research and landing work do not become fabricated release results.
