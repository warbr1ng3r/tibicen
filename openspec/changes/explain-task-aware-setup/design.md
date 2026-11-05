# Design

## Context

See [proposal](proposal.md). The existing report is the only runtime caller of
the shared diagnosis. `scan.agents` contains observed markers, not the selected
host; catalog instruction paths contain globs, annotations and different loading
models. Existing stage references already cover minimal setup and memory policy.

## Goals / Non-Goals

**Goals:** Add bounded context to the existing projection and connect both entry
flows to it. Keep report compatibility, path/approval limits and evidence labels.

**Non-Goals:** A universal active-instruction resolver, native configuration
parsers, a new memory system, new write targets or a new live-runner backend.

## Decisions

1. Use `report --input FILE_OR_STDIN_DASH` with the direct object
   `{ agent, agentVersion?, cwd, targetPath? }`. Host uses the existing bounded ID
   syntax. Version is a bounded printable string. Paths are canonical project-
   relative slash paths; cwd accepts `.`. Reject traversal, absolute paths,
   backslashes, control characters, unknown fields and incorrect types before
   inspecting project state. Context is optional and caller supplied.
2. Preserve all existing diagnosis fields. Add `instructions.taskScope` only
   when context exists: context basis, selected profile or unknown status,
   candidate relationships to cwd and optional target, and assessment limits.
   Core owns validation/projection; root integrates the CLI caller. Context
   performs no additional filesystem reads or execution. Path relationships are
   lexical and do not resolve symlinks or override scan exclusions.
3. Recognized plain instruction basenames can expose directory ancestry. Rules
   in native directories remain conditional/host-specific; their applicability
   cannot be rejected by parent directory alone. All relationships stay separate
   from applicability, precedence, installed versions, loading and task use.
   Do not build matchers from descriptive catalog strings.
4. Keep instructions short: add the shared report call to scan/inventory and
   carry context through agent architecture, verify and handoff. Reuse existing
   one-store memory rules and exact approval rather than duplicating them.
5. Test pure projection and CLI validation/read-only behavior, then use bounded
   fresh source-assisted agent sessions on dependency-free fixtures for init,
   adopt and later memory reading/use/correction. Retain exact candidate hashes,
   prompts, results, assistance and failures. These observations are not native
   host autodiscovery or a representative model matrix.

## Risks / Trade-offs

- Spatial scope could be mistaken for active inheritance → explicit lexical and
  assessment labels, native-rule caveats and regressions for distinct subtrees.
- Supplied context could be mistaken for installed evidence → never mutate
  existing adapter `installedVersion`, loading/use or recorded session checks.
- More options could burden users → internal agent-facing optional input; derive
  it from the session and ask only consequential missing information.
- Snapshot/string checks cannot establish reasoning → separate fresh-session
  observations and independent engineering review.

## Migration Plan

No stored-schema migration or version change. Existing report calls are intact.
Ship under Unreleased; candidate preparation later owns a SemVer minor release.
Removing the optional input/projection and stage additions restores prior behavior.
