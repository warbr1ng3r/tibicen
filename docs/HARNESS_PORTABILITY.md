# Using Tibicen across hosts and models

Tibicen runs inside your existing agent. The **host** (or harness) reads files
and invokes tools; its **model and provider** are your choices in that host.
Tibicen does not connect to model APIs, select a model from an allowlist or ask
you to create provider credentials for ordinary setup.

The [installation guide](INSTALLATION.md) pins published **1.4.1**. Its
[release report](evals/results/2026-11-06-release-1.4.1/README.md) records delivery
checks and their limits; earlier working-session observations keep their original
version bindings. The common `AGENTS.md` mechanism has been available since 1.2;
1.3 added expanded stage guidance, uncatalogued preset hints and the explicit
common installation route. None of these establishes native loading or model
compatibility in every host.

## Start in your project

Install both complete skills through the explicit `--agent universal` route in
the [installation guide](INSTALLATION.md). This selects `~/.agents/skills/`, not
native discovery in every host. Keep the flag explicit; omitting `--agent` can
select other installer targets. The guide also covers a complete archive/manual
route when you need a chosen folder instead.

In your project session, ask:

> Read `~/.agents/skills/tibicen-init/SKILL.md` and follow its instructions. Set up agent infrastructure for this project. Preserve the application and show the exact plan before applying it.

For existing infrastructure, substitute
`~/.agents/skills/tibicen-adopt/SKILL.md` and ask for a review and improvement.
Expand `~` to your actual home path if needed. For manual placement, use the
exact `SKILL.md` path under your chosen complete skill folder. Its scripts and
references must stay together; copying only `SKILL.md` is insufficient.

The agent investigates the project, recommends a sufficient setup and shows the
exact changes and executions for approval. An uncatalogued host can use the
common-file route without pretending to be Codex, Claude Code or Cursor.
Optional preset hints describe preferences; they grant no installation, native
configuration or execution rights. Older validators refuse new unknown IDs;
remove only those optional hints when downgrading.

## What the host needs

| Operation | If it is available | If it is unavailable |
| --- | --- | --- |
| Read permitted project and skill files | Inspect the actual setup and required resources | Discuss supplied material only; do not claim a project scan |
| Run Node ≥22.20 | Run Tibicen's local scripts | Use a local file/Node-capable session or carry out the identified manual step; do not claim script results |
| Write within the approved plan | Apply supported infrastructure changes while preserving application files and useful decisions | Keep the exact proposed changes unapplied and identify the external action |
| Explicitly read the approved project instructions | Activate the common-file route for the current session | Keep required activation as `manual-action-required` until observed |

Node execution does not grant permission to run arbitrary project code. Project
checks still require the displayed commands, trust and approval. Windows command
execution currently stops with `process-tree-unavailable`; read-only operations
remain available. A temporary copy does not by itself isolate a command's OS
permissions.

The installed skills require Node ≥22.20. Developing the whole repository and
landing uses the higher tooling requirement in [package.json](../package.json)
and the pinned environment in [CONTRIBUTING](../CONTRIBUTING.md).

## One shared instruction file can be sufficient

Several hosts can explicitly read the same approved `AGENTS.md` and, when chosen,
one [project memory file](PROJECT_MEMORY.md). Preserve useful existing rules and
notes. Ask each host, using the actual absolute project path:

> Read `/actual/project/AGENTS.md` and follow the instructions relevant to this task. Then [your first useful task].

This route needs no native version gate or `sharedRules` copy adapter. Additional
native copies, MCP configuration and process integrations require their own
supported contracts and approval. Existing registered copy links remain intact;
choosing the common route does not silently remove them. Explicit reading is an
activation step, not evidence of automatic discovery or later task behavior.

<a id="diagnose-mcp-without-changing-hosts--unreleased"></a>

## Diagnose MCP without changing hosts

The MCP workflow in 1.4.0 accepts any valid harness ID: choose an explicit
supported format, or supply hash-bound redacted `stdio-observation` facts for
another language or application. For example, an agent inspecting DeepSeek
Harness YAML or a GigaChat application's Python can report the observed server
state and required env names without evaluating that code. The hash identifies
the inspected text; it does not prove that the reported facts are correct.
Caller observations, parsed configuration, target launch facts and native
connection/use stay separate. A missing native parser therefore does not force
a model/provider switch, a new configuration file or a copied vendor setup.
See [formats and evidence](MCP_FORMATS.md) and the [init/adopt workflow](ADOPT_DIAGNOSIS.md#local-mcp-diagnosis-for-init-and-adopt--unreleased).

<a id="carry-the-same-context-into-the-first-task--unreleased"></a>

## Carry the same context into the first task

Tibicen 1.4.0 adds optional [task context in the report](ADOPT_DIAGNOSIS.md#task-context-for-init-and-adopt--unreleased).
It records the selected host, working directory and intended task path without
making a catalog entry or native adapter mandatory. Published 1.3 retains the
common-file workflow above; it does not include this new report input.

- **Init:** “Set up agents for this project.” For a dependency-free Node app
  without instructions, the agent derives its command from `package.json`,
  proposes sufficient instructions and optional memory, and gives the first
  explicit reading step. Application files stay intact during setup.
- **Adopt:** “Check our rules before updating the Russian installation guide.”
  The agent retains the project root, working directory and `docs/ru/install.md`
  target, explains the root and translation-specific instructions, and preserves
  intentional differences. A genuine defect receives an exact proposed fix;
  finding multiple files does not itself require a change.

For an uncatalogued `team-agent`, a first-task handoff can say: “From
`/actual/project`, read `/actual/project/AGENTS.md` and the retained
`/actual/project/docs/ru/AGENTS.md`; then update `docs/ru/install.md` to match the
English guide.” This is an explicit reading instruction for that task, with
ordinary write approval still required. It does not promise automatic loading
or native precedence. If the next session uses a different host, working
directory or target, disclose the change and reassess the scope. Record actual
reading, task behavior and unavailable checks separately, including any supplied
file hints. The [memory guide](PROJECT_MEMORY.md#check-the-first-task-and-later-memory-use--unreleased)
covers checking later decisions without creating another store.

## Three ordinary cases

| Your situation | What can proceed | What the handoff must retain |
| --- | --- | --- |
| An uncatalogued team host uses a local Qwen model rather than an OpenAI or Anthropic model | With file/Node operations and consent, inspect and propose/apply the common `AGENTS.md` route; keep the chosen model/provider | Actual operations and explicit reading only; native discovery, unobserved model identity/version and later behavior remain unverified |
| A read-only chat host cannot run Node or read local files | Review the material you supply and explain the missing local operation and next step | No claimed scan, application or passed verification; required external application/activation stays manual |
| A known host has no supported automatic loading, task or quiz probe | Continue the available approved setup and structural checks | The missing probe stays `unverified` with a reason; no forced model switch or new key |

Built-in automatic task/quiz/loading probes have a conditional method for the
checked Claude Code version, with separate consent, startup, trust, credential
and budget controls. Missing that method is not a blanket rejection of setup.
The [adapter matrix](../references/agent-matrix.md) and developer evaluation
profiles do not restrict your model choice. A structural pass, explicit reading
and observed use in a fresh task remain different results. Required activation
still pending is `manual-action-required`; an unresolved mandatory integration
defect is `incomplete`, not a completed setup with an optional probe gap.
