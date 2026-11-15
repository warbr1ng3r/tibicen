# Stage-2 verification plan (follows the 2026-11-10 run registry)

Historical plan written 11 November 2026; assessed 13 November. The stage-1
[registry](README.md) reported ≈24.4 RUB spent. It contains two reported native full
cycles and Codex hybrid setup, rather than three complete native cycles. Planned rows
below are not completion records; the registry records later execution and deviations.

> **Budget correction:** the original owner authorization was **100 RUB total**,
> including prior work. The historical 200 RUB/day key setting and this plan's
> ≤60 RUB/day target did not extend it or reset it each day. Per-run table caps
> are historical planning targets; some were exceeded. Totals remain unreconciled.
> See the [assessment](ASSESSMENT.md) and [handoff](HANDOFF.md). This plan is
> not permission for a new paid run or retrospective approval of past spending.

## 0. Polza capability facts established from the docs (2026-11-11)

Protocol formats (all reachable with the same key):

| Format | Endpoint / mechanism | Harness use | Status |
| --- | --- | --- | --- |
| OpenAI Chat Completions | `https://polza.ai/api/v1/chat/completions` | OpenCode, Qwen Code, DeepSeek Harness, Cline, Kilo, Roo | proven in stage-1 (R2) |
| OpenAI **Responses API** | `https://polza.ai/api/v1/responses` — documented in API reference; gateway transforms to chat-completions internally | Codex CLI 0.157 direct (`wire_api="responses"`) | proven in stage-1 (R9) |
| **Anthropic-format** | `ANTHROPIC_BASE_URL=https://polza.ai/api` + `ANTHROPIC_AUTH_TOKEN` | Claude Code, Claude Desktop | proven in stage-1 (R8) |
| **Gemini-format** | `GOOGLE_GEMINI_BASE_URL=https://api.polza.ai/` + `GEMINI_API_KEY` (note: different host) | **Gemini CLI direct, no proxy** | NOT yet run — stage-2 target |
| Local proxy (open-source, fastify) | `127.0.0.1:8787`, injects fields (e.g. provider routing order) into `/chat/completions`, `/completions`, `/responses` | tools that cannot set custom params | NOT yet run |
| Non-LLM: embeddings, images, media (video/audio), audio speech/transcriptions, systemone, storage | see API reference | out of Tibicen scope; noted for completeness | — |

Accounting endpoints (key never printed): `GET /api/v1/key` (limit/usage), `GET /api/v2/balance`
(org spendable), **`GET /api/v1/history/generations` (per-generation cost log)** — stage-2 must
use the history endpoint for per-run cost attribution instead of key-level deltas.

Official harness integration docs exist for: Claude Code/Desktop, Cline(+Desktop), Codex CLI,
ChatGPT Desktop, Cherry Studio, **DeepSeek Harness**, Dify, **Gemini CLI**, Hermes, **Kilo Code**,
LangChain, N8N, OpenClaw, OpenCode(+Desktop), Polza IDE, **Polza.AI Proxy**, **Roo Code**,
**Qwen Code CLI(+Desktop)**. Bold = stage-2 candidates mapped from the original plan §11.

Known Polza quirks to respect (stage-1 findings): usage meter reconciles late (saw ~13 ₽ →
kopecks); transient DNS failures to polza.ai (×3 in one day); cancelled runs still burn tokens.

## 1. Stage-2 goals

1. **Harness breadth** (original plan HOST-04/05/07): one more full CLI cycle on
   **Gemini CLI** (Gemini-format endpoint — a fourth protocol path), plus **Qwen Code CLI**
   and/or **DeepSeek Harness** (chat family, cheap contrast). Roo/Kilo = legacy/IDE notes if
   automatable headlessly; otherwise documented as manual-limited, no fake results.
2. **Model breadth on a proven harness** (MODEL-04): on OpenCode (fastest, cheapest), one
   cycle each for 2–3 further Polza models (e.g. `z-ai/glm-5.3` — watch its 166.9 ₽/M output
   price; `qwen/qwen3.8-flash`; retry `minimax` with a longer cap only if cheap). Each model
   switch = one config line = a new observation, no cross-claims.
3. **The missing plan piece: adopt** (ADOPT-01/02/03): on a configured OpenCode project,
   live adopt run — fix one genuinely outdated command, preserve User-decision bytes on a
   legacy-rule removal, and a no-op re-run that writes nothing.
4. **Productize stage-1 findings** (Unreleased skill files + repo):
   a. managed-block pollution guidance (setup must keep project sections OUTSIDE the block) + evals regression;
   b. Claude Code guidance: prefer file-based `--input PATH` over stdin-pipe;
   c. runner classifier hardening (word-boundary fix is in scratch only — graduate it).
5. **Engineering debts from stage-1 audits** (each = one small PR-shaped item, offline, 0 ₽):
   ENV-04 transport error mocks (DNS/TLS/ECONNREFUSED/hung-body), RUN-01 supervisor-level
   timestamps, ORACLE-02 rounding/empty-input mutations, PRESET-05 cross-project preset load,
   CHECK-02 publish/deploy argv rejection test, MCP-01 format-list derivation from code,
   SAFE-10 concurrent-apply guard test, DIST-06 backup-restore automated check.

## 2. Run matrix

| ID | Run | Mode | Cap | Done means |
| --- | --- | --- | --- | --- |
| S2-01 | Gemini CLI 0.x × Polza: dry-run + full native cycle on the four-file fixture (skill at Gemini CLI's expected path; if no skills support → declared assisted entry, separate observation) | LIVE | 15 ₽ | oracle PASS or precisely documented blocker |
| S2-02 | Qwen Code CLI or DeepSeek Harness × Polza: same cycle | LIVE | 10 ₽ | same |
| S2-03 | OpenCode × glm-5.3 full cycle (output-price-aware short caps) | LIVE | 15 ₽ | oracle PASS; wall-time vs deepseek recorded |
| S2-04 | OpenCode × qwen3.8-flash full cycle | LIVE | 10 ₽ | same |
| S2-05 | Adopt run on configured project: outdated-command fix (ADOPT-01) | LIVE | 8 ₽ | real proposal→consent→apply; only justified infra changed |
| S2-06 | Adopt: legacy-rule removal preserving User-decision bytes (ADOPT-02) | LIVE | 8 ₽ | protected text byte-exact, conflict explained |
| S2-07 | Adopt no-op re-run (ADOPT-03) | LIVE | 5 ₽ | zero writes, honest status |
| S2-08 | Polza proxy smoke: install (open-source), health check, one chat round-trip with `inject` provider order; no Tibicen cycle (seam documentation only) | NET/LIVE | 3 ₽ | documented behavior; no secrets in config |
| S2-09 | Skill-doc fixes (a+b from goals §4) as Unreleased edits + one evals regression each | OFF | 0 ₽ | review passed; dist rebuilt; no behavior change beyond guidance |
| S2-10 | ENV-04 transport mocks + runner classifier graduation into repo evals | OFF | 0 ₽ | tests green in CI suite |
| S2-11 | RUN-01 supervisor timestamps (process-supervisor event instants) | OFF | 0 ₽ | monotonic per-event timing asserted in tests |
| S2-12 | Audit debts batch: ORACLE-02, PRESET-05, CHECK-02, MCP-01, SAFE-10, DIST-06 (pick 4 of 6 by value) | OFF | 0 ₽ | merged tests, registry row added |
| S2-13 | Per-run cost attribution via `/api/v1/history/generations` wired into accounting | NET | 0 ₽ | per-run ₽ attribution works; key never printed |
| S2-14 | Registry update: append S2 rows to the stage-1 README/README_ru | REVIEW | 0 ₽ | same format, honest statuses |

Execution rules (unchanged from stage-1): paid runs sequential; budget gate before each
(accounting.mjs + history-based attribution); no-key negative control for every new harness;
consent recorded per run (synthetic flow-level for generated projects); evidence per run
(events with timestamps, EVIDENCE.md, consent.md); no commits/push/release without the owner.

## 3. Explicitly not in stage-2

Native AionCore/second-harness runs from the original plan (separate track, needs its
environment); IDE-family automation (Cline/Kilo/Roo headless) unless a cheap headless mode is
found — otherwise documented as manual; cross-provider comparisons beyond Polza; UI/PERF/VALUE
directions stay parked at their stage-1 statuses.
