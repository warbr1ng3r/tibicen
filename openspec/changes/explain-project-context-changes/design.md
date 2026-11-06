# Design

## Context

See [proposal](proposal.md) for motivation. `report --input` already validates a
task context before inspecting the project. Diagnosis consumes one bounded scan;
the scan owns exclusion and file-read policy. Memory has one approved store and
no per-note schema. Practices fetches bounded source evidence separately.

## Goals / Non-Goals

**Goals:** add optional explanations within that existing report; retain legacy
output when absent; use real current inventory hashes and explicit attribution.

**Non-Goals:** native loading proof, automatic truth checking, new memory stores,
source fetching, version installation/upgrades, persistent relation registries or
application-file edits. Published 1.4.1 and installer pins remain unchanged.

## Decisions

### Extend the existing input rather than add commands or configuration

The original `agent`, optional `agentVersion`, `cwd` and optional `targetPath`
remain required/optional as before. New optional lists use strict item schemas:

- `instructionSources` (0–16 unique paths): `{path, hash}`.
- `memorySources` (0–16 unique IDs, one memory path):
  `{id, memoryPath, noteReference, sourcePath, baselineHash}`.
- `versionImpacts` (0–8): `{source:{url,checkedAt,contentHash},
  versions?:{from?,to?}, upstreamChange,
  local:{path,contentHash,decision}, applicability,
  action:'keep'|'change'|'unknown', reason}`.

Paths are canonical printable project-relative strings, at most 4096 characters;
hashes are lowercase SHA-256. Memory IDs are printable 1–64 characters and note
references 1–256. The note reference is opaque, not proof that a note exists.
Memory paths use the existing supported set; a reference does not register one.
Version source URLs use HTTPS without userinfo/fragment, dates use ISO form and
all free text is bounded/control-free. Source metadata is supplied, not fetched.

Input is revalidated through the existing entry point before manifest reads.
The existing `taskScope.context` echoes only its original four fields, never the
new arrays or hashes. Separate optional diagnosis sections contain assessments.

### Share the inventory trust boundary, not the feature semantics

One small pure helper checks permitted observed files using existing path,
exclusion and scan-coverage rules. It performs no I/O. Explicit/ancestor
exclusions win over a file record; unrelated incomplete coverage does not erase
a safely observed file. An absent path is missing only in complete permitted
coverage; otherwise unverified. Only current permitted hashes can be returned.

Independent instruction, memory and version modules validate and summarize their
own data. The report passes active forbidden paths and registered memory context.
This avoids three copies of privacy/coverage logic without a plugin framework.

### Compare bytes without upgrading supplied claims into verified behavior

Instruction output is `diagnosis.instructions.sources`, with caller-supplied
basis and matched-current-file/stale/unavailable status. Automatic native
candidate recognition, lexical scope and write policy do not change.

Memory output is `diagnosis.memorySources`: supplied relation basis, unverified
note presence, separate memory-file availability and per-source
unchanged/changed/missing/unverified status. Changed or missing sources request
review; unverified sources request inspection. `keep` only means no byte-change
trigger when the memory file is observed. A registered-store mismatch is
unverified. Never echo the baseline hash as historical proof.

Version output is `diagnosis.versionImpacts`. Source/version/semantic claims keep
caller-supplied labels and installed-version/compatibility limits. Local hash
mismatch or unavailable inventory forces unknown. Excluded/unavailable local
evidence does not echo assessment text or supplied hashes. This is an explanation
record, not an upstream verification or automatic-upgrade service.

### Keep the normal user flow

Working agents gather evidence from permitted scans and actual inspected sources.
A memory binding must originate when the source was observed, retained in the
session or normal approved memory content. Without that baseline, omit it and
state the gap. No hidden file or mandatory new note format is introduced.
Corrections still use the existing exact proposal/approval/apply flow.

The landing keeps all six rows and its visual structure. Labels make optional
memory/skills/tools and variable instruction paths clear directly in the rows;
there is no restored long example disclaimer.

## Risks / Trade-offs

- Supplied metadata can be fabricated → label its origin; compare current bytes
  only; never report semantic truth, history or native behavior as verified.
- Excluded paths could leak through nested context → echo only base context and
  suppress unavailable evidence hashes/text; exercise CLI privacy regressions.
- Optional fields add cognitive load → agents collect them when useful; normal
  users keep the existing request/proposal/result flow.
- A hash change can be irrelevant → request review, never invalidate a decision
  automatically; unrelated files do not affect a relation.

## Migration Plan

No persisted schema or data migration. Older callers retain identical output.
New fields require the new development runtime and can be omitted for 1.4.1.
Removal of the optional sections reverts this feature without editing project
state. A later compatible feature release follows normal minor-version policy;
this implementation packet does not publish it.
