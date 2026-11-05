# Design

## Context

See [proposal](proposal.md). Read-only source audit and two official-source research lanes completed on 5 November 2026. Product code repeats three names in practices, presets and scan; it already stores agent IDs as strings. Read-only scanner classification is broader than `core/paths.ts` write authority and is reused by verification. Existing runtime matrix, installers and native eval profiles have different identities and evidence.

## Goals / Non-Goals

**Goals:** one small dependency-free source of descriptive harness identities, bounded official practice selection, consistent preference hints and native instruction observation. Keep existing preset/scan/manifest schemas and existing operational adapters compatible.

**Non-Goals:** generic plugins, remote catalog updates, model/provider routing, new write targets, new MCP/process adapters, installer expansion, native model execution or new compatibility promises. Package version remains 1.2.0 with changes under Unreleased; publication is a later separately authorized step.

## Decisions

### Static catalog, descriptive facts only

Use `scripts/agents/profiles.ts`, safe for browser and standalone skills, without Node/framework dependencies. Export a readonly catalog and own-identity lookup; store ID, label, documented/legacy status, checkedAt, documentation scope, descriptive project instruction/skill paths and at most two relevant official practice URLs. Keep fixed path matchers inside that module for instruction candidates and distinctive infrastructure markers. Export shared instruction-candidate and observational helpers needed by callers; CLI serialization excludes matcher objects.

Initial IDs: `claude-code`, `codex`, `cursor`, `opencode`, `gemini-cli`, `copilot-cli`, `aider`, `zcode`, `cline`, `devin-local`, `continue-ide`, `roo-code`, `windsurf`. Existing three facts/pins remain at their original evidence level. OpenCode is specifically V2; ZCode is the built-in Agent, not every ZCode CLI. Roo is legacy because official docs announce shutdown. Windsurf is legacy recognition; current Devin Local documentation is a separate identity. Aider convention files require explicit configuration, not invented autodiscovery. Continue skills and ZCode project skill path remain unknown. Do not duplicate a large boolean capability matrix: descriptive metadata never replaces existing operational authorities.

Use the two private research ledgers as inputs and publish a concise paired source guide. Exact URLs and caveats are retained there; mutable current pages are not exact-version loading observations. `harnesses` lists known entries without network or writes; optional `--agents` selects at most sixteen valid lowercase slug IDs, deduplicated in caller order, and returns explicit unknown records rather than another tool's profile.

### One selection bound and one practice request budget

Practices retains schema 1 and existing record fields. Validate the entire selection and optional version map before any read. Valid identity syntax is lowercase alphanumeric segments separated by hyphens, 1–64 characters; maximum sixteen raw selections. Caller versions for selected unknown IDs are valid context but lead only to unsupported-agent gaps. Unknown IDs generate no URL. Malformed/out-of-selection versions still fail before network.

Use catalog practice sources and explicit reviewed official HTTPS hosts. Add only the official hosts required by reviewed entries, never caller-supplied domains; preserve existing private test-source injection safeguards. At most two sources per identity and six HTTP attempts total, in deduplicated caller/source order. Failed attempts consume budget. For each withheld source return an unverified source record and `source-budget-exhausted` gap. Retain timeout/body/content limits, no redirects/retries, no credentials and source applicability markers. Keep `OFFICIAL_SOURCES` if existing callers import it, deriving it from the catalog.

### Observation never becomes write authority

Reuse fixed catalog matchers in scanner and diagnosis; root/nested native candidate paths are observations, not proof of active scope. Shared AGENTS.md and shared .agents/skills cannot identify a single harness. Distinct config/rule markers may identify a candidate ID, always with version and native loading/use unknown. Preserve every old scan observation and existing protected/sensitive/symlink/file/depth/size limit.

Diagnosis keeps checked `adapterContracts` from AGENT_MATRIX unchanged and can add separate descriptive profiles for observed IDs. Memory connection recognition reuses the same instruction candidate helper, checks only permitted observed/expected files plus existing fallbacks, and remains structure-only. `core/paths.ts`, consent/hash/state ownership, component inventory, MCP/process algorithms, installer lists and eval profile identities remain unchanged. New native rule files can be inventoried even when modifying them is outside supported automatic writes; handoff explains the exact gap and preserves useful setup.

### Preset hints do not choose installers

Core and browser preset validators share catalog IDs and preserve schema 1 and previous choices. The form renders the same labels, visibly marks legacy choices and explains that preferences are not verified install/loading support. Unknown IDs still fail preset validation; unknown inspection remains available through harnesses/practices. Existing installer selector and full SHA commands remain unchanged. Keep empty selection, localized errors, keyboard/viewport accessibility and local-only downloads.

## Risks / Trade-offs

- Current documentation changes → retain date, source and version/product scope; monthly maintenance handles refresh through review, not background mutation.
- More catalog names appear to promise universal support → keep unknown/loading limits in CLI, guides and form; separate checked adapter contracts and installer choices.
- Broad scan scope affects structure/preservation checks → test new candidates, ambiguous shared files, exclusions, native memory pointers and rejected native writes.
- Shared browser module increases payload → use simple static data and pure helpers, without Node imports or dependencies; inspect production build and focused browser behavior.
- Old input errors change for selected unknown versions and >3 selections → explicit delta requirements, focused zero-read validation/budget regression tests and unchanged old three-ID behavior.

## Migration Plan

Add the catalog first, then parallelize callers with disjoint file ownership. Integrate rules/guides/UI, run focused checks, independent Ponytail review, full offline gate and standalone outside-checkout checks. Record exact results and unresolved native evidence separately. Rollback is removal of new callers/catalog with existing schemas and writes untouched; no project migration or published tag rewrite is involved.

## Integration correction

The first full gate observed two failures because the contained setup helper
expects an exact 46-file skill bundle. The new catalog module produces 47 files
per skill. Update that exact offline inventory guard and its regression assertions
for the new candidate, retaining regular-file/per-file hashes, batch source/runtime
freeze and prelaunch validation. Native image, model, authorization, session limits,
execution permissions and historical evidence remain unchanged. This is required
delivery integration, not a new native run or a regrade of earlier results.
