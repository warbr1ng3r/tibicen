# Harness capabilities

This guide describes the **Unreleased** catalog in the source checkout. Published
1.2.0 keeps its original scope; the catalog does not add installer targets.
A harness is the application that runs the agent, such as Gemini CLI or Cline.
Changing its model or provider does not create a different harness profile.

## Inspect your tool before changing its setup

```sh
node scripts/tibicen.ts harnesses
node scripts/tibicen.ts harnesses --agents gemini-cli,cline
node scripts/tibicen.ts harnesses --agents my-other-agent
```

These commands read the static catalog without network requests or project
writes. A known profile reports dated documentation and project paths;
`legacy` identifies a retained older setup. A valid name outside the catalog
returns an explicit unknown result. It does not inherit another tool's rules.
Installed versions and actual loading/use still need their own observations.

For relevant guidance, select the tools you actually use:

```sh
node scripts/tibicen.ts practices --agents gemini-cli,cline
```

This command checks official sources, with at most two sources per profile and
six HTTP attempts overall, including failed attempts. Larger selections retain
`source-budget-exhausted` gaps. Up to sixteen valid IDs can be selected; duplicates
are removed in caller order. Optional `agentVersions` input is caller context,
not proof of installation or compatibility. A fetched page still requires an
agent's assessment of applicability; unavailable sources remain explicit gaps.

## What the catalog documents

Additional sources below were checked on **5 November 2026**. They are mutable
current documentation, not tests of a specific installed version. The first
three profiles retain their separate [adapter matrix](../references/agent-matrix.md)
and its historical evidence limits.

| Profile ID | Project guidance and important scope | Official source |
| --- | --- | --- |
| `claude-code` | `CLAUDE.md`; native project skills. Existing adapter scope remains separate. | [Claude Code skills](https://code.claude.com/docs/en/skills) |
| `codex` | `AGENTS.md`, `.agents/skills/`. Existing adapter scope remains separate. | [Codex skills](https://developers.openai.com/codex/skills) |
| `cursor` | `AGENTS.md`, `.cursor/rules/`; existing adapter scope remains separate. | [Cursor rules](https://cursor.com/docs/context/rules) |
| `opencode` | **V2** instructions and skills; `AGENTS.md`, not an assumed V1/CLAUDE fallback. | [V2 instructions](https://dev.opencode.ai/v2/docs/instructions/), [skills](https://dev.opencode.ai/v2/docs/skills/) |
| `gemini-cli` | `GEMINI.md`; other instruction names require settings. | [Context](https://geminicli.com/docs/cli/gemini-md/), [skills](https://geminicli.com/docs/cli/skills/) |
| `copilot-cli` | `.github/copilot-instructions.md`; CLI-specific, not VS Code or cloud-agent support. Conflicting nested/import details remain unknown. | [Instructions](https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/add-custom-instructions), [CLI reference](https://docs.github.com/en/copilot/reference/copilot-cli-reference/cli-command-reference) |
| `aider` | Convention files are explicitly supplied through `--read`, `/read` or configuration; no assumed AGENTS/skills discovery. | [Conventions](https://aider.chat/docs/usage/conventions.html) |
| `zcode` | Built-in Agent reads current-workspace `AGENTS.md`; project skill destination remains unknown. | [Agent](https://zcode.z.ai/en/docs/agents), [skills](https://zcode.z.ai/en/docs/skill) |
| `cline` | `.cline/rules/` and root `AGENTS.md`; native/shared skills. | [Rules](https://docs.cline.bot/customization/cline-rules), [configuration](https://docs.cline.bot/getting-started/config) |
| `devin-local` | Root/directory guidance and `.devin/rules/`; current Devin Local is distinct from legacy Cascade. | [Customizations](https://docs.devin.ai/desktop/devin-local/customizations) |
| `continue-ide` | `.continue/rules/` for Agent/Chat/Edit, excluding autocomplete/apply. Agent Skills discovery remains unknown here. | [IDE rules](https://docs.continue.dev/customize/deep-dives/rules) |
| `roo-code` | **Legacy:** preserve `.roo` guidance; official docs announce extension shutdown. | [Notice](https://roocodeinc.github.io/Roo-Code/), [instructions](https://roocodeinc.github.io/Roo-Code/features/custom-instructions/) |
| `windsurf` | **Legacy recognition:** existing `.windsurf` paths; current Devin Local has its own profile. | [Current customization/import documentation](https://docs.devin.ai/desktop/devin-local/customizations) |

For additional profiles, native loading/use and installed-version compatibility
remain unverified. Unknown means the available evidence does not establish the
capability; it is not a claim that the tool lacks it.

## What happens in init or adopt

Tibicen can inventory permitted native instruction candidates and recognize a
structural reference to existing project memory. Shared `AGENTS.md` or
`.agents/skills/` alone cannot identify which harness is installed. A distinctive
path is still an observation, not proof that the tool read it.

A preset saves these names as **preferences**. The optional form marks legacy
entries and rejects unknown IDs; leave it empty if you want environment discovery.
Unknown tools can still be inspected through `harnesses` or `practices`.

A catalog entry grants no new automatic write path, installer choice, MCP/process
adapter or native evaluation method. When a useful native configuration lies
outside supported writes, retain it and explain the exact remaining integration
step. A vendor's MCP or memory feature does not connect Tibicen's approved memory
store or authorize a server launch. Keep one suitable existing store and verify
reading, task use and updates separately in an authorized fresh session. See the
[project memory guide](PROJECT_MEMORY.md) and [adopt diagnosis](ADOPT_DIAGNOSIS.md).
