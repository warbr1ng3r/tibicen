# Proposal

## Why

Users want later agents to retain the decisions and constraints that matter to them without repeating the whole conversation. Tibicen 1.0.0 can configure general instructions, but has no explicit memory lifecycle; its write allowlist excludes ordinary memory files and its verification normally treats registered content as fixed.

## What Changes

- Add optional project-memory setup to both `tibicen-init` and `tibicen-adopt`. Derive a concise policy from actual user priorities, preserve explicit decisions, and ask only about material unresolved choices.
- Keep one project memory file and short reading/updating rules in the selected agent instructions. Reuse supported existing memory; create `.agents/memory.md` when needed. Approved edits preserve unrelated notes and explain replacements.
- Separate stable setup rules from user-owned, changing memory content. Later additions are normal input to adopt; stale approved writes, unsafe paths and missing/broken connections still fail safely.
- Add versioned opt-in memory records and explicit migration, preserving 1.0 non-memory workflows and allowing older runtimes to refuse unfamiliar records before writes.
- Verify init, adoption, correction, repeat runs and fresh-session read/update behavior. Report structural checks separately from observed agent behavior and unknown human benefit.
- Prepare this backward-compatible feature for a **1.1.0** release. Document post-1.0 SemVer, keep completed work under `Unreleased` until release, and preserve published 1.0.0 tags/assets. Planning does not change the current package version or publish anything.

## Capabilities

### New Capabilities

- `project-memory`: user priorities, a bounded canonical memory file, reading/update/correction rules, preservation, and separate structural/behavioral evidence.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: an explicitly bound memory file receives narrowly scoped infrastructure operations and versioned mutable ownership without weakening consent or application protection.
- `verification-and-delivery`: memory setup has candidate-bound fresh-session evidence; public versions follow post-1.0 compatibility semantics and identify immutable distribution bytes.

## Impact

The main seams are `scripts/core/{types,contracts,paths,plan,apply,recovery,components,finalize,runtime}.ts`, `scripts/tibicen.ts`, `scripts/scan/index.ts`, `scripts/verify/{index,scope}.ts`, related first-party tests, and the shared stage references copied into both skills. Schema changes are justified by the new ownership/permission semantics, not by the product version number. Exact decisions and migration boundaries are in [design](design.md).

Project guides remain English with adjacent `_ru` translations. Distribution resources stay independent of development OpenSpec. No dependency, server, background watcher, global agent-memory edit, paid API, or expanded agent/OS promise is introduced. Presets keep their existing strict schema in this change; memory policy is project-specific.

The owner requested **plan review before implementation**. The work dashboard (`../../../../.scratch/project-memory/dashboard.md`; private development record; excluded from public source) records the approval dependency and parallel scopes. The separate landing review produces recommendations only; its implementation is outside this change. Commits, push and publication require a later explicit instruction for their concrete outputs.
