# Catalog and bounded practice discovery

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Implement OpenSpec tasks1.1–1.2. Own scripts/agents/profiles.ts, scripts/discovery/practices.ts, scripts/core/contracts.ts, scripts/tibicen.ts and focused catalog/discovery/CLI/preset tests. Publish shared exports HARNESS_PROFILES, getHarnessProfile(id), instructionCandidate(relative), observedHarnesses(relative), harnessInfrastructurePath(relative) early; do not expose matcher regexes in CLI JSON. Existing contracts.AGENTS can derive catalog IDs. Own catalog CLI output/validation, selected unknown version behavior and global six-request accounting. Use both private research ledgers for metadata. Preserve checked adapters, core/paths, installer/eval identities and package/pins. No other source paths. Root owns task checkboxes, tracker updates, integration and Unreleased. Verify focused tests and changed-file lint/format; notify other lanes when helper module exists.

Canonical requirements and verification criteria are in the [change](../../../openspec/changes/archive/2026-11-05-catalog-harness-capabilities/tasks.md).

## Answer

Static13-profile catalog, read-only harnesses CLI, shared preset identities and
bounded practices are implemented. All-before-read validation, explicit unknown
version context and six-attempt global budget have focused regression coverage.
Checks:24/24 focused tests including both standalone skills outside checkout;
12/12 practices after the retained initial sparse-array lint correction; final
ESLint/Prettier passed. Existing authority, pins and versions remain unchanged.
