# Design

## Context

`installedTibicenSkill(relative)` matched a regex over the file path and
accepted `['tibicen-init', 'tibicen-adopt'].includes(dirName)` with no content
check. Its single caller is the scan `mode` decision: `improve` when any
infrastructure file is not part of an installed Tibicen skill. The frozen A5
oracle requires names not to be treated as provenance.

## Goals / Non-Goals

- Goal: canonical presence from content the distribution itself carries;
  lookalike directories without it classify as foreign infrastructure.
- Non-Goals: byte-level impersonation detection (hash pinning of known
  versions), network verification, manifest-based detection, new scan output
  fields, changing the scan result schema.

## Decisions

1. **Identity marker**: `<skill-dir>/package.json` parsed as JSON where `name`
   equals the canonical skill name (`tibicen-init`/`tibicen-adopt`) and
   `version` is a nonempty string. This is exactly what `scripts/build.ts` has
   written into every distribution build since 0.1.0-alpha.1 (verified in git
   history and in `frozen/candidate/dist/*/package.json`), so genuine installs
   of every published version carry it. Version is required but not pinned, so
   future versions keep working offline.
2. **Where it is read**: during the existing bounded `readProjectFile` pass in
   `scanProject` — no extra traversal, no reads beyond files scan already
   reads. A malformed or non-matching marker simply does not count (unknown
   stays unknown); no gap is emitted because a lookalike marker is ordinary
   third-party content, not a scan failure.
3. **Candidate narrowing**: the marker is only consulted for `package.json`
   files inside a harness skills directory whose leaf directory name is a
   canonical name and whose `<dir>/SKILL.md` is a harness infrastructure path —
   the same shape the old regex accepted. The existing
   `example.instructions.md`/`example.json` documentation guard is preserved.
4. **Mode decision**: `installedTibicenSkill(path, canonicalSkills)` now also
   requires the complete project-relative skill directory to be in the
   collected canonical set. A marker in a nested or sibling project cannot
   identify another directory sharing the same suffix. All other
   scan behavior (kind, files, languages, commands, memory) is untouched.
5. **Test fixtures**: existing fixtures that wrote a bare `SKILL.md` under a
   canonical name encode the defective assumption; they are updated to the
   genuine distribution layout by adding the marker. The
   `tibicen-adopt/package.json` fixture keeps its `scripts` payload (the
   MUST_NOT_RUN check) and gains the identity fields.

## Risks / Trade-offs

- A marker-less directory that a user considers "their Tibicen install" now
  classifies as foreign infrastructure (improve hint). That is the intended
  honesty: without carried identity, provenance is unknown.
- A lookalike that copies `package.json` verbatim passes; recorded as a known
  limit (name-only lookalikes are distinguished; copied markers are not authenticated).
- Extra JSON parse per canonical-named `package.json` during scan: bounded by
   the existing per-file byte limit; negligible.

## Migration Plan

None: pure classification change; no persisted format changes.

## Open Questions

None blocking. Hash-pinning known distribution versions is a possible future
tightening, deliberately out of scope.
