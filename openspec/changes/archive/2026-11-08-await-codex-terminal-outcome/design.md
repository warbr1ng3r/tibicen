# Design

## Context

See [proposal](proposal.md). The pinned Codex0.157.0 emitter drops `willRetry` from error notifications and returns Running; its later turn event and process exit determine the outcome. Existing parsing already separates completed turns from diagnostic records. The collector currently kills the process earlier.

## Goals / Non-Goals

**Goals:** fix only the development collector, retain hash-only diagnostics and every containment/acceptance check.

**Non-Goals:** change the published skills, infer a missing historical tail, add native retries or grade an interrupted turn as completed.

## Decisions

Use the existing bounded diagnostic parser for explicit HTTP401/403. Otherwise keep a generic error observable but await the terminal event. Sanitize both terminal and nonterminal callbacks before invoking consumers. Keep callback failures terminal. No new parser, dependency or retry mechanism is needed.

Exercise the real caller with the existing inert process-supervisor seam: error→completed, error→failed, incomplete/nonzero exits, typed access denial and throwing callbacks. This catches both premature stopping and the raw-error disclosure that a predicate-only fix would introduce.

## Risks / Trade-offs

- An unrecovered generic error can consume the remaining deadline → existing timeout/output/process guards still bound it; success still needs completed turn and exit0.
- A later successful observation cannot explain an old truncated stream → keep old STOPs, freezes and outcomes intact; bind any subsequent assisted continuation separately.

## Migration Plan

Run red/green controls, independent review and the repository gate. Prospectively bind the repaired source only in the new assisted handoff. No product version bump or artifact replacement. Reverting the small collector patch restores the earlier conservative behavior without changing evidence.
