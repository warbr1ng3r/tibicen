# Original plan (218 checks, 25 directions) → marathon coverage

Reviewed 13 November 2026. Source: the external 218-check plan, originally stored
at `~/CodeProjects/tibicen-verification-plan-20261110/PLAN.md`. This is a
**direction-level mapping of reported observations**, not a checked list of 218
passes. Original per-run verdicts remain in the [registry](../README.md); current
interpretation and retention limits are in the [assessment](../ASSESSMENT.md) and
[handoff](../HANDOFF.md). Some sandbox summaries and recipes (`docs/evals/sandboxes/2026-11-10/README.md`, retained privately)
survive, but most raw outputs and scenario states do not.

Legend describes the executor's coverage claim: **LIVE** = scenario reportedly
executed; **UNIT** = existing automated coverage reported by the earlier audit;
**UNIT+LIVE** = both claimed; **OPEN** = not established. Coverage does not mean
success, independence, current-source acceptance or full completion of a direction.
No tests were rerun for this map's editorial review.

| Direction | Coverage | Evidence (stage.run) |
| --- | --- | --- |
| BASE (8) | UNIT+LIVE | audits (R0a); candidate/hashes pinned every run; dist rebuilt+verified (R0a, S13-3) |
| ORACLE (8) | UNIT+LIVE | fixtures tests (UNIT); mutation battery 5/5 (S12-1); S3-05 exposed grading material: independent-oracle limitation |
| ENV (8) | UNIT + LIVE-partial | ENV-05 unit; DNS/transient failures classified live (S2-02, S6-*); full transport mocks OPEN |
| RUN (10) | UNIT + LIVE-partial | RUN-03/04/05/07 live every run (consent gates, cancel, exit-status); supervisor timestamps OPEN |
| SAFE (10) | UNIT+LIVE; violations reported | SAFE-01/02 live (S3-06, S13-2); SAFE-07 found+fixed+regression (R0a, S13-3); FIFO/oversize live; two-writer race no-corruption (S12-2); self-consent violations (S4-05, S5-03, S8-A) remain findings |
| INIT (12) | LIVE | basic (R2), autopilot (R5), deny (R6), adversarial (R7), empty scaffold (S3-10), bash (S3-05), docs (S3-06), typo (S8-D), monorepo (S4-04), python (S6-K), queue (S4-01), foreign-skill routing (S6-B INIT-04/05) |
| ADOPT (10) | LIVE | outdated command + legacy rule (S2-05/06), no-op (S2-07), re-adopt after owner edits (S9-4), drift-repair + rollback (S11-2, S14-2) |
| REC (8) | UNIT+LIVE | REC-01/02 live (S9-1); manual-action lifecycle (S10-3, S11-1); same-digest missing-memory-link limitation diagnosed (S10-1), new-plan repair supported; disk-full OPEN |
| BLOCK (6) | UNIT+LIVE | lifecycle amid owner text incl. delete-form + CRLF (S13-5, S14-3) |
| MEM (10) | UNIT+LIVE | decline (S6-B), bind-existing (S9-3), non-standard store preserved (S8-E), replacement (S3-07), one-off (S3-08), fresh-reuse ×many, cross-harness (S3-01/02), exception-vs-conflict (S4-02/03) |
| CTX (8) | UNIT+LIVE | task-context binding (every run), source-change detection (S9-5), path-move (S10-2), versionImpacts supplied-basis (S14-4) |
| PRESET (6) | UNIT+LIVE | gates (S6-B), cross-project TEXTBOOK (S10-5), browser builder (R0b) |
| MCP (10) | UNIT+LIVE(offline) | formats/readers/writers UNIT (audit); explicit reader + unknown agent live (S6-B); stdio-observation all branches live (S13-1); inline-secret + forbidden-path live (S14-5, S8/S6-B); MCP-09 real server connection OPEN |
| HOST (12) | LIVE | 5 native full cycles reported (R2, R8, S2-01, S2-02, S3-03), Codex hybrid/operator apply without recorded fresh task (R9), Aider selected-launch no-exec limitation (R10) + explicit-reading host (S6-K); unknown-host honest route (S2-02 dsh); IDE-family headless OPEN |
| MODEL (8) | LIVE-partial | model contrast (R4, S2-03/04); transferability (S6, S7); cost attribution (S2-13); full model-matrix per-harness OPEN (budget) |
| COMP (8) | UNIT+LIVE | live discover honest metadata + hostile query (S16-1); source-check real pin → policy tension (S15-1); "add nothing" (many); process adapter full lifecycle (S11-1) |
| DIST (10) | UNIT+LIVE | outside-checkout runs (R0a); exclusions; manual lifecycle 4/4 (S15-2); archive/installer NET routes OPEN; stale-dist risk found (S13-3) |
| CHECK (8) | UNIT+LIVE | structure-vs-behavior separation (every oracle run); commands-never-auto-executed (S9 note); CHECK-03 script-hash change (UNIT) |
| REPORT (8) | UNIT+LIVE | no-save/--save gates (S6-B); drift after complete (S10-4); manual-vs-optional (S10-3); honesty of every run report |
| UI (10) | LIVE-partial | EN/RU/pin/preset (R0b); full accessibility matrix OPEN |
| PROJECT (10) | LIVE | JS (R2), bash (S3-05), docs (S3-06), monorepo (S4-04), queue (S4-01), stock (S4-02/03), python (S6-K), CI-conflict fixture (S4-07 UNIT via queue case) |
| VALUE (8) | OPEN (needs human/paid baseline) | only methodology established |
| PERF (8) | OPEN (P2) | size caps observed live (8MiB caps in S6-B) |
| DOC (6) | REVIEW-partial | Initial missing translations, stale aggregates and unavailable artifact links corrected in this directory on 13 November; external sandbox narratives remain historical; mapping = this file + DIGEST |
| CLOSE (8) | REPORTED; retention partial | defect classification (R0a, S10-1); minimal fixes + regression (R0a); independent review (R0a); final gate (R0a) + stale-dist catch (S13-3); some narratives/recipes retained, raw traces mostly unavailable; current integration not graded here |

The marathon reports broad scenario variety and several defects, not 218 green
checks. VALUE/PERF, transport mocks, supervisor timestamps, real MCP connection,
IDE-family routes and some public-delivery routes remain open or partial.
Self-consent failures, pre-consent harness-memory writes and oracle leakage remain
visible rather than disappearing inside a coverage label. See the five ordered
[development priorities](../ASSESSMENT.md). The original 100 RUB total allowance
was not reset by the key's daily limit; historical spending needs reconciliation.
