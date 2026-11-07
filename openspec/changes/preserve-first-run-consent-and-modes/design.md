# Design

## Context

See [proposal](proposal.md). Collection already returns bytes plus numeric modes;
archive encoding and the setup reconciliation lose that information. The existing
filesHash freezes only sorted paths/content hashes. Shared proposal guidance asks
for complete diffs while the runtime declares bounded generated service records.

## Goals / Non-Goals

**Goals:** preserve effective ordinary permissions across the maintained route;
clarify actual service consent without weakening it.

**Non-Goals:** no product schema or writer expansion, filesystem model replacement,
new runtime service, credential/model run, historical regrade or release.

## Decisions

- Add optional `fileModes` beside existing `files`; omitted entries stay 0644.
  Reuse archive validation for ordinary integer permission bits and exact declared
  file keys. Directories stay 0755. A bytes-or-object union would churn every caller.
- Include sorted effective permission values in the existing filesHash tuple.
  Omitted and explicit defaults are equivalent. Validate before snapshot copying
  and clone supplied modes alongside buffers; subsequent validation detects drift.
- Pass actual captured seed modes to native and independent setup checks, preserve
  approved returned modes in reconciliation, and retain the setup slice's fixed
  scope/service privacy. Fixing only the archive would leave maintained callers lossy.
- Keep one authoritative generated-record consent explanation in proposal-format
  with short stage pointers. Use actual serviceWrites/usageFile fields; future
  timestamps, IDs and results are generated, never previewed as known bytes.

## Risks / Trade-offs

- [Mode metadata broadens input] → reject unknown keys, invalid shapes and special
  bits before side effects; preserve current byte/path/size/network boundaries.
- [Mutable caller metadata] → capture after validation and bind effective values
  into the existing freeze and profile validation.
- [More permissive consent wording] → a stricter owner request still requires an
  explicit answer, and unchanged CLI plan approval still gates all writes.
- [Offline checks mistaken for agent behavior] → preserve prior evidence and label
  this verification offline/model-free; no fresh native success is claimed.

## Migration Plan

No persisted format migration. Legacy input maps default to 644. New source needs
new prospective freezes; old packets are immutable. The root package remains 1.5.0,
with user-visible guidance recorded under Unreleased. Reverting this local change
restores old behavior without rewriting user project or historical evidence.
