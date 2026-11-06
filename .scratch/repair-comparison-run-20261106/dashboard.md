# Repair/native comparison — complete

| Case | Arm | Proposal | Application | Fresh task | Grade |
| --- | --- | --- | --- | --- | --- |
| Repair | Native | passed, 55.44 s | one approved skill-command edit | passed, 34.12 s | passed; root semantic acceptance |
| Repair | Tibicen | passed, 71.65 s | same repair plus actual manifest | passed, 33.61 s | passed; root semantic acceptance |
| Sufficient guard | Tibicen | passed, no-change, 90.11 s | zero project writes, no manifest/session | passed, 32.21 s | passed; root semantic acceptance |
| Sufficient guard | Native | passed, no-change, 40.56 s | zero project writes, no manifest/session | passed, 39.00 s | passed; root semantic acceptance |

Times are caller native-phase seconds, excluding preparation, review, separate application/grading and human work. Eight launches completed once in 396.68 seconds caller / 378.49 seconds CLI within the 960-second cap, concurrency 1, no caller retry/fallback. Four operator, four grader and one control container completed; cleanup and preservation passed. Exact final source/test bytes match in all arms. Five ordinary nonzero command results recovered within successful sessions; provider-internal retry counts are unknown.

[Final report](../../docs/evals/results/2026-11-06-repair-comparison/README.md). All work resolved; no sessions queued. This small assisted case does not establish additional functional benefit or reduced human work.
