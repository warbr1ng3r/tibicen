# Local integrations after Tibicen 1.3

Fresh public-source investigation, **5 November 2026**. This lane covers local
MCP startup, configuration scope and skill loading. It compares current upstream
material with the released [harness catalog](../../HARNESS_CAPABILITIES.md),
[portable workflow](../../HARNESS_PORTABILITY.md) and
[MCP implementation](../../../scripts/mcp/index.ts). It does not reuse an older
roadmap as evidence of demand.

## Decision

The strongest bounded integration front is **find the effective local MCP
configuration and repair an identified mismatch**. Start with version-bound
Gemini CLI and OpenCode support, selected for the evidence below, while retaining
the universal explicit-reading route for other hosts. A useful result names the
active source, explains the failure and supplies one reviewable change. This is
a product inference from configuration corrections, launch-context reports and
current native remedies, not a measured ranking of market demand. [I1](https://github.com/anomalyco/opencode/issues/36434),
[I2](https://github.com/mcp-router/mcp-router/issues/189),
[D1](https://dev.opencode.ai/v2/docs/mcp-servers/),
[D2](https://geminicli.com/docs/tools/mcp-server/)

A generic doctor, another list of harness names or automatic duplication into
every client would have weaker differentiation. Cline already has MCP management;
Amp lists and reloads skills; ZCode supplies configuration and diagnostic skills.
[D3](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx),
[D4](https://ampcode.com/docs/customize/skills),
[B5](https://zcode.z.ai/en/docs/skill)

## What the new reports actually establish

| Symptom and firsthand evidence | Correct classification | Tibicen opportunity and limit |
| --- | --- | --- |
| OpenCode 1.17.16 omitted an `env` block. The author subsequently confirmed that `environment` fixed their setup. The thread was later closed for inactivity. [I1](https://github.com/anomalyco/opencode/issues/36434) | Target schema mismatch, despite the original regression framing | Explain the target grammar and propose a minimal record change. The correction does not establish that every later commenter had the same cause. |
| MCP Router on macOS reportedly cannot resolve Homebrew `npx`/`uvx` names from its GUI, although the terminal command works. Its repository was archived on 18 September 2026; the issue remains open. [I2](https://github.com/mcp-router/mcp-router/issues/189) | Historical launch-environment / executable-resolution example | Distinguish shell visibility from target-process visibility. This archived client is not a maintained-target recommendation or prevalence evidence. The author's cause and database workaround are unverified; Tibicen should not edit that private database. |
| Gemini CLI nightly `0.28.0-nightly.20260202.707b3e85d` reportedly redacted required variables despite an allowlist. The linked global-allowlist fix merged on 6 April. [I3](https://github.com/google-gemini/gemini-cli/issues/18302), [I4](https://github.com/google-gemini/gemini-cli/pull/24767) | Historical client defect with upstream correction | Identify the exact version and route to the native remedy. A merged fix does not establish which published versions contain it, or justify weakening current sanitization. |
| A 4 November OpenCode 2.2.5 report says both global and project skills exist but the skill tool finds none. [I5](https://github.com/anomalyco/opencode/issues/61669) | Unresolved discovery complaint | Inspect source, enablement, identity and reload state before changing content. The counter-reproduction is explicitly a bot reply and is not independent human verification. |

These are selected reports, with no user-population denominator or Tibicen
reproduction. They establish plausible failure classes, not their frequency.

## Native alternatives and broad scope check

| Harness | Current primary-source finding | Consequence for the next feature |
| --- | --- | --- |
| OpenCode V2 | Local stdio records use `mcp.servers`, `environment`, `{env:NAME}` and `disabled`. A project override replaces the entire same-name server object. `opencode mcp list` checks connections. [D1](https://dev.opencode.ai/v2/docs/mcp-servers/) | Bind translation to V2; avoid partial overrides and V1 field copying. |
| Gemini CLI | Undefined environment references become empty strings; base-environment sanitization is documented. `gemini mcp list` and `/mcp list` expose status/errors; stdio connection tests depend on folder trust. [D2](https://geminicli.com/docs/tools/mcp-server/) | Reuse native connection evidence; record trust and launch context separately from file validity. |
| Cline | CLI MCP settings have their own path/override; the IDE opens its actual settings through the UI. Native management already lists, edits and restarts servers. [D3](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx) | Do not equate extension, Desktop and CLI state. A new management wizard adds little. |
| Cline CLI correction | Changelog 3.0.69 says Windows `npx`/`uvx` servers were silently lost to a three-second startup limit, increased to ten seconds. [F1](https://github.com/cline/cline/blob/main/apps/cli/CHANGELOG.md) | Treat timeout regressions as client/version issues before rewriting valid config. |
| Amp | `amp skills list --json` inspects skills; an existing session needs its own reload. Global same-name skills precede project skills. [D4](https://ampcode.com/docs/customize/skills) | Skill copies can mask each other; discovery in another process does not prove current-session loading. |
| Copilot CLI | Session, plugin, workspace and user MCP sources have distinct priority; workspace sources require trust. Native `copilot mcp list/get` shows sources, and VS Code migration changes the top-level key. [B1](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | Record the actual Copilot surface and origin before proposing migration. |
| Goose | Official source documentation distinguishes launcher environments from shells and describes runner shims that can require network downloads. [B2](https://github.com/aaif-goose/goose/blob/main/documentation/docs/mcp/developer-mcp.md), [B3](https://github.com/aaif-goose/goose/blob/main/documentation/docs/troubleshooting/known-issues.md) | An executable found in a shell is insufficient; preserve corporate/offline restrictions and prefer native guidance. |
| Continue IDE | Current documentation places workspace MCP definitions in `.continue/mcpServers` and limits MCP use to Agent mode. [B4](https://docs.continue.dev/customize/deep-dives/mcp) | A valid definition in another mode is a scope mismatch, not necessarily a broken server. |
| ZCode | Settings provide source, enablement, refresh and format diagnostics; built-in skills cover configuration and connection failures. [B5](https://zcode.z.ai/en/docs/skill) | Use those remedies before generating a parallel diagnostic layer. Project path support remains unestablished by this page. |
| Aider | Official conventions guidance uses explicit `--read`, `/read` or the configured `read` list. [B6](https://aider.chat/docs/usage/conventions.html) | Preserve the explicit file-reading route; this source establishes no native Agent Skills or MCP contract. |
| Roo Code | Official documentation announces extension shutdown on 15 May, without a year in the notice. [B7](https://roocodeinc.github.io/Roo-Code/) | Preserve legacy projects; no evidence here supports making a new Roo adapter a priority. |

## Gap against released 1.3

The [catalog](../../HARNESS_CAPABILITIES.md) already covers 13 profiles and
explicitly separates descriptions from write paths, native adapters and observed
loading. Uncatalogued hosts can read the complete skills explicitly. Adding Amp
or Goose to a catalog would improve wayfinding but would not itself connect a
server or prove a skill loaded.

The current [MCP module](../../../scripts/mcp/index.ts) changes local JSON records
for Claude Code and Cursor and prepares a manual Codex TOML fragment. It validates
references and takes available environment **names** plus `targetContextKnown`
from the caller. Successful structural results remain `configured-unverified`;
the module does not resolve executables, inspect other harness scopes or observe
an MCP handshake. Existing inline secrets and ambiguous formats route to manual
action. Therefore a proposed feature must add effective-scope and target-context
work, rather than relabel these existing checks as new runtime verification.

## Proposed bounded packet

This is a recommendation for a future OpenSpec change, not an implementation plan
already approved or executed.

1. For one selected harness/version and server, explain the effective local source,
   duplicate name, override/disable state, cwd and environment-reference grammar.
   Unknown versions/formats retain explicit gaps. Read sensitive configuration
   through a redacting boundary; report environment names and presence only.
2. Separate static validity, executable/cwd availability in the known target
   context, native connection/tool discovery and actual task use. A shell check
   cannot promote a GUI context to verified. Native status commands that start
   configured servers still require the existing execution/trust boundary.
3. Propose the smallest repair in the permitted configuration record, preserving
   other fields and owner decisions. An unknown launch environment yields a
   precise remaining native check, not a guessed absolute path or exported secret.
4. Use native diagnostics first and repeat the same check after an approved
   repair. Keep skill discovery, selected source/content and explicit activation
   as separate evidence. Do not infer model compliance from a skill list.

Start with Gemini CLI and OpenCode V2 fixtures covering wrong environment syntax,
missing variable names, overridden/disabled records, cwd/path differences and
unchanged valid configuration. A future authorized native observation should
show one failure becoming connected without unrelated edits; offline fixtures
alone cannot establish that outcome. Expansion to other hosts should follow
demonstrated user cases and current primary contracts.

Tibicen can repair an approved local configuration mismatch. It can diagnose and
route client regressions, enterprise policies and unknown GUI environments.
Hosted MCP provisioning, remote OAuth, vendor outages and generally poor model
tool selection do not become local stdio repair work. [D1](https://dev.opencode.ai/v2/docs/mcp-servers/),
[D2](https://geminicli.com/docs/tools/mcp-server/),
[B1](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference)

## Source ledger and access limits

All URLs below were opened during this investigation on **2026-11-05**; search
snippets alone are excluded. `NEW` means a newly investigated URL relative to the
earlier [user-problem study](../2026-11-05-user-problems/README.md) and
[technology-refresh study](../2026-11-05-technology-refresh/README.md).
`RECHECK` means an exact documentation URL already present in the released
catalog, freshly reopened here. Living documentation is not an installed-version
test. Titles below identify the original page; findings above are paraphrases.

| ID / original source | Freshness, date and status checked | Read scope / limit |
| --- | --- | --- |
| I1 — [OpenCode 1.17.16 drops mcp.&lt;name&gt;.env](https://github.com/anomalyco/opencode/issues/36434) | NEW; opened 2026-07-11; OP correction 07-13; automatically closed not planned 09-27 | OP, correction and later reports/closure; no universal diagnosis inferred. |
| I2 — [MCP servers fail to start on macOS](https://github.com/mcp-router/mcp-router/issues/189) | NEW; report 2026-06-07; issue open; repository archived 2026-09-18; app version absent | Historical symptom, proposed cause and workaround; no reproduction, current-maintenance or prevalence claim, or private-database change. |
| I3 — [environmentVariableRedaction.allowed broken](https://github.com/google-gemini/gemini-cli/issues/18302) | NEW; 2026-02-04; closed via I4; nightly version recorded above | OP and closure; model-generated cause section excluded as independent evidence. |
| I4 — [Respect global environment variable allowlist](https://github.com/google-gemini/gemini-cli/pull/24767) | NEW; merged 2026-04-06 | Author explanation and merge; first containing release not established. |
| I5 — [Registered skills not discovered by OpenCode v2.2.5](https://github.com/anomalyco/opencode/issues/61669) | NEW; 2026-11-04; open | OP plus bot attribution; bot reproduction and linked issues not independently validated. |
| D1 — [OpenCode V2 MCP servers](https://dev.opencode.ai/v2/docs/mcp-servers/) | NEW; undated current V2 documentation | Local schema, substitution, overrides and native commands; no installed V2 run. |
| D2 — [MCP servers with Gemini CLI](https://geminicli.com/docs/tools/mcp-server/) | NEW; undated current documentation | Environment, trust and connection diagnostics; no server launched. |
| D3 — [Cline MCP overview](https://github.com/cline/cline/blob/main/docs/mcp/mcp-overview.mdx) | NEW; mutable main-branch documentation | CLI/IDE configuration and native management; not a version-pinned guarantee. |
| D4 — [Amp Skills](https://ampcode.com/docs/customize/skills) | NEW; undated current documentation | Source precedence, listing and reload; no Amp run. |
| F1 — [Cline CLI changelog](https://github.com/cline/cline/blob/main/apps/cli/CHANGELOG.md) | NEW; version 3.0.69; date absent in entry | Vendor-recorded Windows startup correction; not independently retested. |
| B1 — [Copilot CLI command reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) | RECHECK; current documentation | MCP scopes, migration and native listing; no VS Code/cloud parity inferred. |
| B2 — [Goose Developer MCP documentation](https://github.com/aaif-goose/goose/blob/main/documentation/docs/mcp/developer-mcp.md) | NEW; mutable main branch | Desktop/launcher environment caveat. |
| B3 — [Goose known issues](https://github.com/aaif-goose/goose/blob/main/documentation/docs/troubleshooting/known-issues.md) | NEW; mutable main branch | Runtime/shim and restricted-network guidance; no workaround executed. |
| B4 — [MCP in Continue](https://docs.continue.dev/customize/deep-dives/mcp) | NEW; current IDE documentation | Workspace definitions and mode restriction; CLI remains a separate surface. |
| B5 — [ZCode Skill](https://zcode.z.ai/en/docs/skill) | RECHECK; current documentation | Refresh, diagnostics and built-in remedies; exact project directory remains unspecified. |
| B6 — [Aider coding conventions](https://aider.chat/docs/usage/conventions.html) | RECHECK; current documentation | Explicit reading workflow only. |
| B7 — [Roo Code documentation](https://roocodeinc.github.io/Roo-Code/) | RECHECK; shutdown notice | Notice checked; no year supplied, so none inferred. |

The [older Goose troubleshooting route](https://block.github.io/goose/docs/troubleshooting/)
returned 404; its current owner repository documentation was read instead. The
guessed [ZCode MCP route](https://zcode.z.ai/en/docs/mcp) was inaccessible and is
excluded. No native/model run, installation, authentication change, API spend or
publication was performed.
