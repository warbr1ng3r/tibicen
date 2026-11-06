# MCP formats and evidence

Any valid harness ID can use `mcp-diagnose` by explicitly selecting a known
format or the common observation route. Catalog entries, models and providers
do not restrict that choice. This behavior is included in published 1.4.0. See [the workflow](ADOPT_DIAGNOSIS.md#local-mcp-diagnosis-for-init-and-adopt--unreleased)
for command input, inspection limits and the next action.

## Common route

For an unsupported language, proprietary export or unknown dialect, select
`format: "stdio-observation"`. Every source supplies
`observation: {sourceHash, state, envNames}`: lowercase SHA-256 of its inspected UTF-8 text,
`state` of `stdio`, `disabled` or `unknown`, and required environment variable
names. All three fields are mandatory; `envNames` is empty for non-stdio states.
Supply no commands, arguments, values or settings contents. Sources remain
permitted project files; this route does not read personal settings or interpret
Python, YAML tags or shell fragments.

A matching hash binds caller-supplied facts to that text. The source reports
`reported-stdio`; explicitly selecting it as `effectiveSource` gives
`configuration.basis: "caller-observation"`. A changed or unavailable source
leaves the observation unverified. This is neither parsed
validity nor proof of safety, native loading, connection or use. Explicit target
launch facts can identify missing prerequisites; repair stays manual/native.
Without a more specific target problem its reason is
`observed-configuration-not-parsed`. No writer is granted.

## Optional native readers

Explicit formats work with any valid `agent` ID without renaming it. Existing
requests without `format` retain defaults only for Claude Code, Cursor and Gemini
CLI. Other readers require explicit selection. A request uses one format;
source order establishes no precedence and records are not merged.

| Format | Bounded input and important limit |
| --- | --- |
| `claude-code-json` | JSON `mcpServers`; Claude string-command and env-reference contract |
| `cursor-json` | JSON `mcpServers`; Cursor references use `${env:NAME}`, unlike Claude's `${NAME}` |
| `gemini-cli-json` | JSON `mcpServers`; URL transport takes priority; external enablement stays unknown |
| `opencode-v2` | JSON `mcp.servers`, command array, `environment`, `{env:NAME}`, `disabled`; explicit V2, without JSONC/file interpolation |
| `zcode-native-json` | JSON `mcp.servers`; command, args, env, `enable: false` |
| `zcode-shared-json` | JSON `mcpServers`; the same bounded ZCode record, without borrowed interpolation semantics |
| `kimi-code-json` | Current JSON `mcpServers`; local stdio, cwd, `enabled: false`; nonlocal `environment_id` stays manual |
| `mistral-vibe-toml` | TOML `[[mcp_servers]]`; named stdio record, command, args, env, cwd, `disabled: true` |

New ZCode/Kimi/Vibe readers keep nonempty literal env overlays manual rather than
handling values or borrowing another host's expansion. Unsupported fields and
ambiguous layouts remain limits. Vibe's self-contained TOML subset accepts
single-line basic/literal strings, booleans, bounded numbers, arrays, inline
tables and bare dotted headers/array tables. Duplicate definitions, quoted
headers, dotted assignments, multiline strings, dates and unsupported grammar
make the source manual; malformed unrelated regions are not skipped and shell
commands are not split.

`formatEvidence` is `caller-supplied`, `harness-default` or `unverified`. Parsed
results use `configuration.basis: "parsed-format"`; native activation and
connection/use stay unverified. Supported repair still requires the existing
matching Claude Code/Cursor host, format and explicit exact project writer path.
Another host selecting their format gains no automatic writer.

## Sources checked on 6 November 2026

These mutable documents establish no minimum released version or live native
compatibility. Local files do not prove effective native layers or target context.

- **ZCode:** workspace `.zcode/config.json` and `.agents/mcp.json`; user native
  config is `~/.zcode/cli/config.json`. Any native servers suppress the whole
  same-scope shared fallback; user same-name settings win over workspace settings.
  Disablement uses `enable: false`. Env interpolation is undocumented here.
  [Official MCP contract](https://zcode.z.ai/en/docs/mcp-services).
- **Kimi Code:** current `.kimi-code/mcp.json`, distinct from legacy `.kimi`;
  project same-name records override user records. Project trust is required;
  `environment_id` defaults to local independently of the session target.
  [MCP contract](https://www.kimi.com/code/docs/en/kimi-code-cli/customization/mcp).
  The [pinned stdio source](https://github.com/MoonshotAI/kimi-code/blob/df90d90ec0714db23dcc830acd2db6232f5c7426/packages/agent-core-v2/src/mcpCore/client-stdio.ts)
  treats env as a literal overlay.
- **Mistral Vibe:** project `.vibe/config.toml` requires folder trust; agent,
  session and admin layers can override local settings.
  [Configuration](https://docs.mistral.ai/vibe/code/cli/configuration),
  [MCP fields](https://docs.mistral.ai/vibe/code/cli/configuration-reference),
  [admin controls](https://docs.mistral.ai/vibe/code/cli/admin-config).
  [Pinned source](https://github.com/mistralai/mistral-vibe/blob/c96a6dbb34d34f8a868b3f67b279ecabbf1aa616/vibe/core/config/models.py)
  includes cwd/command arrays; `disabled` hides tools while discovery may continue.

Earlier readers retain their [dated contracts](ADOPT_DIAGNOSIS.md#host-contracts-checked-on-6-november-2026).

## Models and separate applications

Changing a model/provider in the same application does not itself require a new
format adapter or establish model behavior. Some vendors also provide a harness:

- **DeepSeek Harness** uses Cordis YAML MCP overlays, including executable `!!js`
  expressions. Its native syntax stays outside these parsers. Permitted source
  inspection can provide redacted observations; Tibicen never evaluates the YAML.
  [Official example](https://deepseek-harness.github.io/deepseek-harness/en/guide/mcp-memory).
- **GigaChat:** Sber's example configures MCP in Python using LangGraph and the
  MCP SDK; it establishes no universal GigaChat settings-file format. Use the
  actual application's supported contract or source-bound observations without
  executing Python during inspection.
  [Sber example](https://developers.sber.ru/docs/ru/gigachain/tutorials/agent-gigachat-mcp).

Unknown syntax leaves a specific evidence gap; it does not require replacing
the user's harness, model, provider or working configuration.
