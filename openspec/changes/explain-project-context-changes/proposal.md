# Proposal

## Why

The 6 November opportunity study identified three concrete gaps in the existing
read-only report: callers cannot bind an uncatalogued instruction file to an
observed hash, relate a remembered fact to earlier source bytes, or retain a
bounded explanation of how upstream guidance affects a local decision. On
7 November the owner selected all three for implementation. The landing also
looks as though every setup creates `MEMORY.md` and the same directories.

## What Changes

- Extend optional task-context report input with explicitly supplied instruction
  sources, remembered-fact source relations and version-impact assessments.
- Compare only files already present in the permitted current scan. Keep supplied
  claims, byte comparisons and actual native loading/use separate.
- Explain how working agents collect these inputs without inventing historical
  hashes, creating a second memory store or requiring an extra questionnaire.
- Preserve the six-row project illustration while making optional features and
  variable paths clear in English and Russian.
- Keep reports read-only unless the existing explicit save option is requested.

## Capabilities

### New Capabilities

- `project-context-review`: optional, bounded report evidence for caller-selected
  instruction files, memory/source changes and local version-impact explanations.

### Modified Capabilities

None. Existing inventory, memory ownership, instruction discovery, write policy,
approval and report fields retain their behavior when these inputs are absent.

## Impact

Core report validation/summaries, CLI wiring, distributed stage references,
paired project guides, tests and the EN/RU landing illustration change. There are
no new dependencies, commands, network reads, native-agent runs, metadata stores,
updaters, version bumps or publication actions. The published release stays 1.4.1.
