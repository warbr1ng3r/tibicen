# Design

## Context

See [proposal](proposal.md). `checkPractices` already accepts `agentVersions` and
returns `agentVersion` on each relevant source. CLI currently passes only agents.
Proposal `practices` and report history already carry JSON evidence, so another
stored schema or recommendation engine is unnecessary.

## Goals / Non-Goals

**Goals:** connect the existing CLI to validated version context and make source,
environment and applicability limits clear in the existing agent workflow.

**Non-Goals:** detect binaries by executing project PATH entries, install tools,
query model accounts, classify all internet claims automatically, add a crawler,
or turn a supplied version into mechanically verified compatibility.

## Decisions

1. Reuse `--input FILE|-` for optional JSON `{ "agentVersions": { "codex":
   "0.157.0" } }`, while `--agents` remains required and authoritative. An omitted
   input or omitted map means unknown versions. Reject other top-level keys,
   non-object/array/null maps, unsupported/unselected keys and non-string, blank,
   control-containing or over-100-character values before any HTTP request.
   Keep version tokens opaque rather than assume every vendor uses SemVer.
2. Put version validation in the existing shared practices helper for CLI/direct
   callers; validate the CLI envelope before forwarding only the supported map.
   Preserve source statuses, gap names, schema 1 and `requires-agent-assessment`.
   No new output field or automatic compatibility label is needed.
3. The working agent obtains available versions from trusted host metadata or an
   already authorized observation, then supplies them via stdin. A repository
   file, preset or historical manifest is not proof of the current installation.
   Without a trustworthy observation, omit the entry and explain the gap. Do not
   run arbitrary project code or create a temporary input file to learn a version.
4. Keep the evidence interpretation rule in `references/rules.md`; stage pointers
   should guide use without duplicating a long policy. Update the existing
   proposal-format input example and adopt guide rather than create another guide.
   Existing assumptions/practices fields retain reviewable rationale and sources.

Alternatives rejected: one new flag per agent duplicates the existing map;
auto-executing `--version` adds a trust/execution surface; a freshness score or
new persistent recommendation store does not establish semantic applicability.

## Risks / Trade-offs

- Caller version may be wrong → label it as supplied context, retain assessment
  uncertainty and require the agent to explain its observation basis.
- Official docs may describe a different release → retain dated fetched evidence,
  compare applicability in the recommendation, and leave unknown if unresolved.
- Updating shared CLI/tests can affect standalone delivery → exercise offline
  CLI stdin/file paths and built init/adopt outside a checkout.
- Agent explanations are prompt-level behavior → static instruction review is
  not a live usefulness or native behavior result; disclose that limit.

## Migration Plan

No persistent migration. Existing agents-only invocations remain valid. Work is
Unreleased under 1.1.0 until separately prepared for release. Revert the bounded
CLI/helper/reference/doc changes to remove the extension; saved proposal/report
schemas remain unchanged.
