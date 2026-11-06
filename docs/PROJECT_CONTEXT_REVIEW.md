# Review project context evidence

These optional additions are included in **published 1.5.0**.
They extend the existing `report --input` used by both init and adopt. Users keep
the normal flow: describe the problem, review a recommendation, approve exact
changes and receive a report. Agents collect evidence; there is no extra form.

The [adopt guide](ADOPT_DIAGNOSIS.md) explains the original task context. Pass
`agent` and `cwd`, optionally `agentVersion` and `targetPath`, plus only the lists
needed for the task. Any valid harness ID works, including an uncatalogued host.
Use stdin before approval; writing a metadata file is unnecessary:

```sh
node "SKILL_DIR/scripts/tibicen.ts" report --root "/actual/project" --input -
```

Provide JSON on stdin and close it normally. Replace `SKILL_DIR` with the complete
installed skill directory and the root with the actual project. An existing
JSON file can be read with `--input PATH`. No report is saved unless explicitly
requested through the existing save option.

## 1. “Our agent reads RULES.md. Can you check that file too?”

The working agent inspects the permitted project and takes `path` and `hash`
from the actual `scan.files` record. It adds:

```text
instructionSources: [{path: "RULES.md", hash: <observed SHA-256>}]
```

`diagnosis.instructions.sources` reports `matched-current-file`, `stale` or
`unavailable`. The latter retains the exclusion/coverage reason. The selection is
caller-supplied, separate from native filename recognition. It grants no edit
rights and proves no loading, priority, applicability or task use. A matching
hash means only that the current permitted bytes match the supplied bytes.

## 2. “We remembered this fact. Has its source changed?”

When an agent verifies a fact, it can retain the actual source path/hash along
with a short note reference, in session context or the normal approved memory
content. Later it supplies:

```text
memorySources: [{
  id: "runtime-choice", memoryPath: ".agents/memory.md",
  noteReference: "Runtime choice", sourcePath: "package.json",
  baselineHash: <SHA-256 retained when the fact was checked>
}]
```

All entries reference one existing supported memory path. This input does not
register a store, impose a note format or create memory. A registered-store
mismatch is unverified. Without an earlier observed hash, omit the relation and
state that history is unavailable; today's hash is not an earlier baseline.

`diagnosis.memorySources` separates memory-file availability from source status:
`unchanged`, `changed`, `missing` or `unverified`. A changed/missing source asks
for review; it does not make the fact false. An unchanged source does not prove
that the referenced note exists or is correct. `keep` means no byte-change review
trigger with an available memory file, not approval of a decision. Review the
actual relevant note before proposing a correction. Age alone expires nothing.
The supplied baseline's historical origin is not independently established.

## 3. “A tool changed. Does our setup need to change?”

The agent reads relevant permitted upstream guidance and the local decision,
assesses their actual relationship, and can supply:

```text
versionImpacts: [{
  source: {url: "https://example.org/release-notes", checkedAt: <ISO date>,
           contentHash: <hash of source actually read>},
  versions: {from: <known earlier version>, to: <known target version>},
  upstreamChange: <what changed>,
  local: {path: "AGENTS.md", contentHash: <observed local hash>,
          decision: <which local decision is affected>},
  applicability: <why it matters here, or why it does not>,
  action: "keep" | "change" | "unknown", reason: <plain explanation>
}]
```

This is a data shape, not literal JSON: replace angle-bracket fields with actual
strings. Omit unknown versions rather than inventing them. Prefer the applicable
official dated/versioned source; an unread release note is not evidence.

`diagnosis.versionImpacts` retains the assessment as **caller-supplied** and checks
its local file binding. It does not fetch/authenticate the upstream text, detect
installed versions or prove compatibility. Stale or unavailable local evidence
downgrades the effective action to `unknown`. Unavailable evidence does not echo
supplied hashes or assessment text. A justified change still needs the normal
exact proposal and approval; report performs no update.

## Bounds and preservation

Instruction and memory lists allow at most 16 entries each; version impacts
allow 8. Instruction paths and memory IDs are unique. Paths are printable,
canonical project-relative paths, at most 4096 characters. Hashes are lowercase
64-character SHA-256 strings. Memory IDs are 1–64 characters, note references
1–256. Memory paths retain the [existing supported set](PROJECT_MEMORY.md).
Version sources use HTTPS without credentials or fragments, an ISO date and
bounded printable text. Allowed query selectors are `ref`, `version`, `v`,
`view`, `lang` and `locale`, each at most once. Source URLs are at most 2048
bytes, versions 128 bytes and each explanation field 1000 bytes. Dates use
`YYYY-MM-DD` or a UTC timestamp with seconds and optional three-digit milliseconds.
Unknown fields and malformed/excessive inputs fail
before project inspection or saving.

No extra source path is read because it occurs in a list. All comparisons use
the existing permitted scan; excluded/sensitive/symlinked files remain excluded.
Incomplete coverage does not establish that an absent file is missing. No source
file, note, manifest, state or mode changes during these ordinary report calls.
Base task-context output never echoes the raw lists. Calls without the new fields
retain their prior output. Technical tests cover these contracts; native loading,
usefulness and source semantics require their own observations.
