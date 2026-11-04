# Design

## Context

See [proposal](proposal.md). Report currently reads getStatus and serializes saved session data. Scan and verifyInfrastructure already provide bounded, first-party, non-executable current evidence. Installed instructions already require minimal approved edits and separate verification outcomes.

## Goals / Non-Goals

Goals: additive current diagnosis, honest instruction scope, concise adopt/no-change output, unchanged approval and recovery.

Non-goals: a new command, loader simulator, semantic rule parser, automatic native probes, global/private state reads, new memory store, schema migration, version bump or publication.

## Decisions

1. Report collects one fresh scan and structural verification using the same scope as existing verify. Extract a shared collector only where needed to avoid duplicating pending-memory conflict handling. Keep old report fields untouched; add diagnosis. Default report remains read-only; save still requires save/requested flags.
2. Core owns a pure summarizeDiagnosis projection. Inputs are fresh ScanResult, fresh infrastructure CheckResult and minimal current status/session/action metadata. It does not read files, execute, use a network or mutate records. The return contains current structural findings and scan gaps, instruction candidates with project-relative directory, recorded session identity/status, and one conservative next action. It may expose checked adapter entrypoint/version facts, explicitly as adapter contracts rather than observed installed versions.
3. Instruction candidates are an inventory, not active loader scope. Nested AGENTS.md/CLAUDE.md and Cursor rule paths retain their directories. Directory differences are not semantic conflicts. Actual selected agent/version/cwd/target and applicable guidance are explained by the working agent; unsupported precedence, overrides, imports and loading remain explicit unknowns. Use existing shared-rule checks rather than a new synchronization mechanism.
4. Current diagnosis and historical report checks have separate labels. A prior complete session can coexist with a current issue. A scan gap or unregistered/native setup does not become a clean bill of health, no-change recommendation or freshly completed session. An already sufficient setup is a working-agent conclusion with stated inspection coverage.
5. Projection returns paths, reasons and check statuses, not instruction bodies, command output or secrets. Stable ordering and no timestamps/file counts keep report/save equality stable. Completed mutable memory remains user-owned. Preserve all existing read boundaries, including forbidden paths, symlinks and sensitive files.
6. Rules own a concise starting-state/evidence/keep-change/checks/next-step explanation. Details and exact diffs stay available before approval; no mandatory user questionnaire or technical evidence table. Saved session findings are explicitly historical during a new read-only audit.

## Risks / Trade-offs

- Additional scan work in report: reuse bounded scan, never execute or fetch; leave status fast.
- False loading claims: inventory and checked format facts remain distinct from observed loading/use; no new native run.
- Report compatibility: additive field only, deterministic output, no manifest/proposal/recovery format changes.
- Scope uncertainty: explain known paths/directories and mark unavailable selection/precedence; do not guess a configured agent from AGENTS.md alone.

## Migration Plan

No persisted migration. Existing consumers keep existing fields. Documentation marks this Unreleased; root package remains 1.1.0 until a separately reviewed candidate. Integrate focused tests, full pinned gate/build, standalone smoke checks and independent Ponytail review. No commit or publication is included.
