# Observing native instruction and skill loading

**20 November 2026. Research only; no model, renderer, app-server session or
credential access was run.** The next useful Codex check is a bounded startup
input inspection, followed separately by ordinary task evidence. GLM API task
results cannot establish what the ZCode desktop host loaded.

## What counts as evidence

| Observation | Supported conclusion | Remaining limit |
| --- | --- | --- |
| File exists, inventory or skill selector lists it | Installation/discovery | Full instruction body may never reach the model. |
| Native startup input contains the frozen `AGENTS.md` body | Input construction injected those bytes for that configuration | Does not prove a later request used the same context or followed it. |
| Skill name/description/path occurs in startup input or `skills/list` | Skill metadata discovered | Body activation/use remains unverified. |
| Captured tool output contains the actual instruction/skill body | Observed read | A prompt asking for that read is assistance. A read alone does not prove compliance. |
| `$skill`, a skill input item or a supplied file path selects it | Explicit activation | Does not test implicit selection from an ordinary request. |
| Task output matches a distinguishing rule | Observed behavior | Requires a separate grader and answer-isolated inputs; not an automatic-loading receipt. |

OpenAI distinguishes initial skill metadata from later body loading, and explicit
from implicit activation. App-server documents `skills/list` and explicit skill
input separately. These are living contracts, not version-bound local test
results. [Skills](https://learn.chatgpt.com/docs/build-skills),
[app-server](https://learn.chatgpt.com/docs/app-server#skills).

## Current local Codex: what is available

Read-only `--version` and help inspection found **Codex CLI 0.157.0**, binary
SHA-256 `ad0be20d04e2ba6146ecdb51d7f8b7b0fe15420a15dc9b0057518d858f1f3714`.
Its help exposes:

```text
codex debug prompt-input [OPTIONS] [PROMPT]
```

The command advertises JSON rendering of the model-visible input list. Its own
help permits config overrides and feature toggles, but does not expose exec's
`--json`, `--ephemeral`, `--ignore-user-config` or `--ignore-rules`. **Only help
was executed.** No claim is made yet that rendering is offline or succeeds with
the controlled configuration.

Official documentation describes root-to-working-directory `AGENTS.md` discovery,
including global instructions, overrides and size limits. It suggests instruction
logs for auditing loading. A model's answer naming files is weaker than inspecting
the constructed input itself. [AGENTS.md](https://learn.chatgpt.com/docs/agent-configuration/agents-md).

`exec --json` exposes execution items and turn status. The retained local
[generated-memory follow-up](../evals/results/2026-11-15-generated-memory-task-followup/README.md)
contains actual instruction/memory read outputs and separate functional results;
its recorded stream has no startup-injection receipt. Absence of a `cat` event
would not establish absence of native startup injection. JSON schema output from
the model is an answer format, not a loading attestation.
[Non-interactive output](https://learn.chatgpt.com/docs/non-interactive-mode#make-output-machine-readable).

## A bounded next check, not executed here

Root can prospectively admit **two no-model renderer invocations**, presence and
absence controls, each at most **10 seconds and 1 MiB output**. Use an outer
network-denial profile only after its denial preflight succeeds; stop on any
uncontrolled startup, credential requirement or unsupported configuration.

Use separate neutral workspaces and fresh allowlisted `HOME`, `CODEX_HOME` and
`TMPDIR`, outside this checkout. No auth file or API/token environment belongs
there. Inventory ancestor/admin instructions and skill/config roots; do not read
personal configuration. Freeze the binary, inputs/modes, prompt and exact config.
Disable hooks, plugins, MCP, remote catalogue fetching and telemetry using the
actual maintained keys in [controlledCodexConfig](../../scripts/evals/profiles/codex/preflight.ts)
and [generated configuration](../../scripts/evals/container/codex-config.ts).
Container permission/environment entries belong to the contained execution route;
omitting them for a renderer is a distinct configuration that needs its own review.

Existing sanitized catalogues are:

- [codex-model.json](../../scripts/evals/container/codex-model.json): `gpt-5.5`,
  SHA-256 `c0948f5e809f1d7236b8fa51cae88cecc2524c0b010f95abb122916d7bf87457`.
- [codex-code-mode-model.json](../../scripts/evals/container/codex-code-mode-model.json):
  `gpt-6-astra`, SHA-256 `6885e65423bb632be27ddf448fd6aa0ff3f7ba09e6915b29bd57f2762ff8e375`.
  Its code-mode and skill-usage metadata differ. A renderer using the first model
  does not establish the second model's startup shape; the metadata flag alone
  does not establish that skill discovery is disabled.

The reviewed synthetic configuration supplies `model_catalog_json`,
`model_provider="tibicen_offline"` and a local Responses provider with
`requires_openai_auth=false` and zero provider retries. Preserve those exact
contracts rather than borrowing personal defaults. Use process `cwd` for the
fixture and argv `debug`, `prompt-input`, reviewed `-c` overrides, then the ordinary
task prompt. Do not invent additional debug flags.

Put one harmless distinguishing instruction only in `AGENTS.md` and a different
body-only marker only in a native `.agents/skills/<name>/SKILL.md`; neither marker
belongs in the prompt, description, source or grader input visible to a model.
Compare structured rendered inputs with a separate fixture lacking those files.
Report instruction-body injection and skill-metadata discovery independently.
An absent skill body at startup is compatible with progressive disclosure.

Only a separately admitted native task can then test implicit selection: ordinary
request, no `$skill` or file-reading hint, captured actual body reads/native
injection evidence, plus independent behavior grading. If the version cannot
provide the required trace, label that evidence unavailable; do not turn a final
answer or explicit read into an unassisted-loading result.

## ZCode and the GLM boundary

Local application metadata reports **ZCode 3.14.4, build 3.14.4.7912**; no ZCode
session was launched. Current official docs describe global plus workspace
`AGENTS.md`, rather than Codex's directory hierarchy, and optional automatic
project memory. Those living docs do not prove the installed build's behavior or
that its background memory is controlled. [ZCode Agent](https://zcode.z.ai/en/docs/agents).

The current FAQ names workspace `.zcode/skills/<name>/SKILL.md`; skill settings
and metadata discovery are distinct from on-demand body invocation. The exact
installed path, enabled state and exported tool evidence must be checked before
a native claim. [Skill](https://zcode.z.ai/en/docs/skill),
[FAQ](https://zcode.z.ai/en/docs/qa).

The [returned ZCode observation](../evals/results/2026-11-15-zcode-observation/README.md)
has independently checked files but self-reported native commands/freshness and
explicit reading assistance, without an exported tool trace. Five GLM API cases
can assess Tibicen's content/workflow under that API harness. They cannot by
themselves establish ZCode desktop discovery, injection, subscription behavior or
memory isolation. Keep any future native ZCode result qualified until those
host-specific prerequisites and actual read evidence are available.
