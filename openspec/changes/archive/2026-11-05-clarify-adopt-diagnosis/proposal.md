# Proposal

## Why

The 5 November research and current 1.1 snapshot show a need for understandable diagnosis, minimal repair and honest handoff. Current report output shows saved session facts without a fresh structural assessment or an explanation of instruction candidates.

## What Changes

- Add a current read-only diagnosis to report using existing scan and structural verification. Preserve old fields and session semantics; create no session and run no commands.
- Explain observed instruction paths/directories and checked adapter entrypoint facts, keeping selected scope, installed versions and actual loading unverified when evidence is missing.
- Make adopt explain starting setup, concrete findings, what to keep/change, exact approved edits, actual checks, limits and one next step. Sufficient setup may finish read-only.
- Add EN/RU examples and focused tests, integrate, independently review and run the normal offline source/build gates.

## Capabilities

### New Capabilities

None; reuse the lifecycle and verification capabilities.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: current diagnosis and understandable repair/no-change handoff.
- `verification-and-delivery`: separate current inventory/structure, recorded checks, expected entrypoint format and observed loading/use.

## Impact

CLI report, a small pure diagnosis projection, focused tests, selected stage references and project docs. No new command, dependency, model call, permission or persisted schema. OpenSpec remains development-only. Version stays 1.1.0 until candidate preparation; no commit or publication.

The owner approved this packet and parallel execution on 5 November: “Поехали, запускай рой субагентов”. Preserve the existing uncommitted research documents and include them in final review.
