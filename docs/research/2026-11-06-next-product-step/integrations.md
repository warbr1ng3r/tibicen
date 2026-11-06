# Integrations and maintenance after 1.4.1

**Checked 6 November 2026.** English is canonical; the adjacent Russian edition is `integrations_ru.md`. This lane uses ten freshly read primary records and the shipped contract. It recommends **no new MCP runtime, format inventory or updater now**. A small version-aware explanation may be worth improving only where existing guidance cannot already answer the request. Neither demand nor saved human work is measured.

## Does the present product do this job?

For its declared scope, yes: 1.4.1 can inspect permitted project configuration, explain missing prerequisites, preserve accepted decisions and apply supported approved changes. It does not promise a working connection merely because configuration parses. See [current capabilities](../../CURRENT_CAPABILITIES.md), [MCP formats](../../MCP_FORMATS.md), [portable operation](../../HARNESS_PORTABILITY.md) and the [published release](../../evals/results/2026-11-06-release-1.4.1/README.md).

Existing `mcp-diagnose` accepts eight bounded formats or source-hash-bound redacted stdio observations for any valid host ID. It separates source selection, parsed/caller-reported configuration, supplied target executable/cwd/env-name availability and connection. Unknown target context remains unknown; another terminal's environment is insufficient. Values, personal settings and arbitrary code execution stay outside inspection. Only matching Claude/Cursor project writers and the existing manual Codex path have their declared write behavior. This is breadth of host entry, not proof of native compatibility everywhere. [Workflow](../../../references/mcp-diagnosis.md), [implementation](../../../scripts/mcp/diagnosis.ts).

Customized component updates already compare prior inventory, current files and the selected new distribution. Local edits require preserve/merge/replace; removed upstream resources need an explicit decision; unrelated neighboring files stay unowned. A dated practice lookup supports applicability judgment, not silent modernization. These duties follow the [vision](../../PRODUCT_VISION.md), [addendum](../../PRODUCT_VISION_ADDENDUM.md) and [existing update format](../../../references/proposal-format.md). They are not missing features.

## What the original reports actually show

- **OpenCode:** a desktop-service environment regression followed **2.0.13 → 2.0.14/2.0.15**. Local server placeholders stopped receiving stored variables although manual execution worked. The report closed on **16 October** through a native startup fix. First fixed released version was not established here. This supports checking the actual service/version before editing correct configuration; it does not justify copying credentials into files. [Original report](https://github.com/anomalyco/opencode/issues/50882).
- **Gemini CLI:** **0.30.0-nightly.20260210.a2174751d** reportedly reused an old MCP client after configuration changes. Restarting the application was the reported workaround; the issue closed through a fix on **24 February**. It is historical counterevidence to treating every stale result as a file defect, not a claim that current Gemini remains broken. [Original report](https://github.com/google-gemini/gemini-cli/issues/19792).
- **Kimi:** the old Python CLI **0.18.0** web route started a server from the wrong directory, misrouting workspace-dependent storage. Its author closed the report on **24 June**; the repository was archived on **23 September**. No first fixed release was verified. Do not transfer this behavior to the current Kimi Code implementation or confuse CLI/web routes with models. [Original report](https://github.com/MoonshotAI/kimi-cli/issues/2469).
- **Mistral Vibe:** an open **1.8.0 VS Code** report says the extension supplied an empty MCP list despite project expectations. It mixes an alleged configuration-path problem with an ACP integration problem. Neither was reproduced here or established for current Vibe. A new parser cannot repair a host that ignores its supplied settings. [Original report](https://github.com/mistralai/mistral-vibe/issues/779).

These four reports are different host/runtime paths, not four votes for a Tibicen feature. Older dates, closure and uncertainty are retained. They show why correct-looking configuration, target process conditions and an active session must remain separate.

## Native remedies are material counterevidence

Current Gemini documentation already exposes per-server status/errors and trust-aware testing; its listing may test a stdio server. OpenCode V2 already documents connection listing, local cwd/environment, whole-record overrides and remote OAuth setup. These are useful native operations, not harmless file reads. Tibicen must show the actual execution/trust/network scope before invoking them; it should not secretly start a server or turn a diagnostic into login. [Gemini contract](https://geminicli.com/docs/tools/mcp-server/), [OpenCode contract](https://opencode.ai/docs/mcp-servers/).

An MCP connection includes protocol/capability negotiation and initialization. Even that is weaker than proving a particular tool helps the user's task. A config parser or a supplied boolean cannot stand in for those stages. The inspected **2025-11-25** lifecycle is a versioned contract, not a claim to be the latest protocol supported by every host. [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle).

Vibe **3.1.0**, released **4 November**, says native settings/MCP saves now preserve manual and concurrent config edits. That is declared upstream repair, not a Tibicen trial or proof that the older extension complaint is fixed. Skills **1.7.6** already documents update checking and selected updates; its project restoration remains experimental. Do not build another package updater from these facts. [Vibe release](https://github.com/mistralai/mistral-vibe/releases/tag/v3.1.0), [tagged Skills contract](https://github.com/vercel-labs/skills/blob/v1.7.6/README.md).

Skills Manager **1.43.1** says unchanged-content syncs now preserve edited copies, while real library-content updates still replace them. This makes Tibicen's existing explicit preserve/merge decisions relevant; it establishes no comparative benefit or need for another updater. This is a maintainer report, not an independent demand observation. [Changelog](https://github.com/xingkongliang/skills-manager/blob/main/CHANGELOG.md).

## Ranked smallest choices

### 1. Keep the existing integration workflow; no addition by default

Ordinary request: **“After the update my MCP tools disappeared. Fix it.”** Desired outcome: identify which layer is known, retain correct settings, and give one exact next action with remaining uncertainty. Existing target metadata, native status and current guidance often suffice. The residual gap is not another missing env/PATH checker: those facts already have a place in 1.4.1.

A concise case explanation can use current fields: inspected source → actual host/version/mode → established obstacle or unknown → permitted action. This is an agent handoff obligation already present, not a new schema or subsystem. If a host bug is suspected, disclose the match as a hypothesis until version and runtime evidence agree. No automatic upgrades, repeated reconnections, key requests or personal-scope reads follow.

**Rejection condition:** if existing report plus official native guidance supplies that answer, implement nothing. Keeping 1.4.1 is the preferred decision from this evidence. Maintenance cost is refreshing only relevant dated contracts when a request requires them, rather than maintaining a universal issue database.

### 2. Conditional improvement: one version-impact explanation, not an update engine

Ordinary request: **“I updated the agent and edited this skill. What actually needs changing?”** A useful result would connect one verified upstream change to affected local decisions, distinguish unchanged customization from a real conflict, and propose a minimal fix or justified no-change.

The possible gap is **cross-layer explanation**, beyond a package manager delivering bytes or native status reporting failure. Existing three-state component updates protect files but do not themselves diagnose a host regression; conversely an old issue cannot prove local impact. Agent reasoning and dated practices may already supply the whole answer. There is no demonstrated unmet need for a new report command here.

**Available falsification without new runs or people:** use these saved primary descriptions and existing report fields to sketch a fixed-version regression, a wrong-runtime-directory case and an irrelevant update. If current output/guidance already supports the right decision, or the note recommends editing an unaffected/working setup, reject the addition. This is an available desk check, not an authorized next study. If a concrete explanation defect remains, the smallest candidate is one existing handoff example; any typed feature requires its own scoped design. Upkeep is version applicability and source dating, with no credential collection or automatic migration.

## Excluded expansions and evidence limits

Do not add universal handshake execution, remote HTTP/OAuth management, automatic repairs for every host, a custom skill updater or a background watcher. Remote transports are real native capabilities, but this selection does not show a residual benefit from Tibicen implementing them. Changed paths/layers likewise call for evidence and a native remedy before a new writer. These are optional product bets, not current MVP failures.

This is primary-source desk research, not source prevalence, current-host testing, customer validation or proof of useful connectivity. Skills 1.7.6 is a **rechecked source from the prior strategy study**, not new demand; the other issue URLs were absent from that inspected study. Closure does not prove a current installed build contains a fix. No install, credential access, live server/model run, recruitment, runtime test or product change occurred. The [prior strategy](../2026-11-06-product-strategy/README.md) and [assisted comparison](../../evals/results/2026-11-06-repair-comparison/README.md) retain their original limits.

## Compact source ledger

All ten owning records were reopened on **6 November 2026**. Living docs are declared contracts; issue bodies are reported experience. Linked activity was inspected for closure; first fixed releases remain unknown unless stated.

| Source | Version/date/status retained | Role |
| --- | --- | --- |
| [OpenCode #50882](https://github.com/anomalyco/opencode/issues/50882) | 2.0.14/15; 23 September; closed 16 October | Service env counterexample; native fix. |
| [Gemini #19792](https://github.com/google-gemini/gemini-cli/issues/19792) | Exact nightly above; 21 February; closed 24 February | Stale runtime versus current file. |
| [Kimi #2469](https://github.com/MoonshotAI/kimi-cli/issues/2469) | Old 0.18.0; June closure; archived repository | Host-mode/cwd limit; no current extrapolation. |
| [Vibe #779](https://github.com/mistralai/mistral-vibe/issues/779) | 1.8.0; 13 June; open | Unverified extension-level report. |
| [Gemini MCP docs](https://geminicli.com/docs/tools/mcp-server/) | Living; displayed update 6 October | Existing status/trust remedy. |
| [OpenCode MCP docs](https://opencode.ai/docs/mcp-servers/) | Living V2 | Native local/remote and layering. |
| [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-11-25/basic/lifecycle) | 2025-11-25 | Connection evidence boundary. |
| [Vibe release](https://github.com/mistralai/mistral-vibe/releases/tag/v3.1.0) | 3.1.0; 4 November | Upstream preservation fix. |
| [Skills README](https://github.com/vercel-labs/skills/blob/v1.7.6/README.md) | 1.7.6; reused URL | Existing update commands; experimental restore. |
| [Skills Manager changelog](https://github.com/xingkongliang/skills-manager/blob/main/CHANGELOG.md) | 1.43.1; 27 October; declared fix | Customized copies; native limitation, not new demand. |
