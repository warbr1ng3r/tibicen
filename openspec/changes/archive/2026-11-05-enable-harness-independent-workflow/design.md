# Design

## Context

See [proposal](proposal.md) for motivation. Three read-only lanes found that
ordinary `createProposal`/`applyPlan` already work without a harness/model field
and can update common AGENTS instructions. The actual entry restrictions are the
three-target landing command, catalog-only preset validation and guidance that
unconditionally sends multiple tools through version-gated native shared copies.
The pinned installer has a distinct explicit `universal` target; omitting the
agent flag can select all detected/available agents and is not an acceptable
substitute. The intermediate 1.3 candidate remains an immutable earlier snapshot.

## Goals / Non-Goals

**Goals:** an explicit end-to-end common-instruction route usable by a host with
project-file and required Node operations; descriptive unknown preferences; one
canonical memory store; precise available/unavailable checks; small existing
interfaces and no new persistence authority.

**Non-Goals:** automatic arbitrary native Markdown/config writes, adding every
MCP/process/probe adapter, own provider/model routing, credential setup, a plugin
runtime or a claim of native autodiscovery/compatibility for every tool.

## Decisions

### Reuse the existing skill and project-instruction interface

Deliver both complete skills to the pinned installer's universal user-scope
folder and explicitly ask the current host to read the selected SKILL.md. Where
sufficient, the resulting approved AGENTS.md is also explicitly read. A model or
provider setting belongs to that host; Tibicen requires neither a model ID nor a
provider client. The catalog remains supplementary dated format guidance.
Native shared-rule copies are only for a separately justified supported request;
one common file does not enter the version-gated copy adapter.

Alternative: register more brands or extend native write authority. It would not
remove the general entry gate and would require schema/recovery work for new
persisted authority. That is optional native convenience, not a prerequisite for
this common-file route. Existing kernel path/approval guards remain unchanged.

### Share a small hint validator rather than a new registry

Use the existing bounded lowercase `isHarnessId` syntax for known and unknown
IDs. A browser-safe helper validates dense string arrays with at most sixteen
distinct IDs, without counting duplicates as extra choices. It rejects missing
array entries and malformed values; no normalization can turn free instructions
into a valid ID. Core and browser use the same helper. Existing known duplicates
remain readable; browser download can retain its existing ordered deduplication.
The form keeps catalog suggestions and adds a compact custom-ID field with
localized accessible errors. IDs are data only; no new URLs or authority follow.

### Make installation and first use explicit

The default command retains skills@1.7.4, the published full distribution SHA,
both exact skill names, global scope and --copy, with --agent universal. Remove
the mandatory brand selector; manager selection and no-JavaScript instructions
remain. Give the common user-scope location and exact explicit-reading prompt.
A complete manual route uses the published archive/checksums, both whole skill
folders and their resources in a selected destination. It never copies only an
entry file or invents a native host directory. Do not refresh published pins to
unreleased code. Existing specialist routes can be documented as optional.

### Express operations and evidence in existing guidance

Use existing scan/inventory/architecture/verify/handoff stages to distinguish
project-file access, supported Node, approved writes and explicit activation.
When an operation is absent, report that operation and a useful next step.
Optional task/quiz/loading probes retain their exact supported methods; their
absence is neither a pass nor a blanket rejection of ordinary setup. Keep the
existing finalization/manual-action semantics. Add no capability persistence
format or provider/model allowlist. Distributed guidance remains self-contained.

## Parallel ownership

| Lane | Exclusive edits |
| --- | --- |
| Core hints | scripts/agents/profiles.ts, scripts/core/contracts.ts, focused helper/preset tests, docs/HARNESS_CAPABILITIES.md and its _ru copy |
| Landing/install | landing source, browser/site tests, new docs/INSTALLATION.md and its _ru copy |
| Rules/project docs | existing distributed references and the init SKILL entry delivery-prerequisite sentence, README.md and its _ru copy, new docs/HARNESS_PORTABILITY.md and its _ru copy |
| Root integration | OpenSpec/checklists, trackers/roadmap, changelog and final verification |

No file pair has two writers. Core and landing provide their exact facts to the
documentation lane; reading a pending shared helper is allowed, but the helper
contract is fixed before parallel code edits. New guides remain project docs,
not runtime dependencies of installed skills.

## Risks / Trade-offs

- [Universal folder is not universal native discovery] → explicit SKILL/AGENTS
  reading, useful first prompt, native loading kept unverified until observed.
- [Implicit installer detection selects unwanted targets] → explicit universal
  flag, command assertions and one external synthetic-HOME delivery observation.
- [Unknown hints appear to grant support] → preference-only copy, shared
  validation, unchanged source budget, writable paths, adapters and probe methods.
- [A host lacks file/Node operations] → exact manual/unavailable handoff without
  invented scan/application results or a forced provider/harness change.
- [Wording bypasses consent or creates native configuration] → connected rules
  review and generic lifecycle preservation checks; keep protected-native tests.

## Migration Plan

Keep package/schema/dependency policy from the retained candidate: intended minor
1.3.0, existing persisted schemas, published 1.2 delivery pins. Old presets work;
new optional IDs are refused by old validators, so remove only those hints for
downgrade. Make new source/build identities after implementation. Reuse existing
feature evidence only for identical inputs; run affected checks and full gate,
then independent review and finite exact universal delivery/manual-archive checks
with one reused brandless lifecycle. The manual destination includes spaces; both
self-tests, exact load paths, full checksum inventory and siblings are checked. Earlier H01/H02 remain unconsumed, not regraded or launched.
New commits/publication follow their explicit authorization and concrete packet.
