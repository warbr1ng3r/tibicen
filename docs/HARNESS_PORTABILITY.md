# Using Tibicen across hosts and models

Tibicen runs inside your existing agent. The **host** (or harness) reads files
and invokes tools; its **model and provider** are your choices in that host.
Tibicen does not connect to model APIs, select a model from an allowlist or ask
you to create provider credentials for ordinary setup.

The common `AGENTS.md` mechanism already exists in the published 1.2 core.
The expanded stage guidance and uncatalogued preset hints in this checkout are
**Unreleased**. The [installation guide](INSTALLATION.md) keeps the published
1.2 pin; installing it does not install unreleased instructions. Earlier
[release observations](evals/results/2026-11-05-release-1.2/README.md) keep their
original versions, inputs and limits. No new native/model run is claimed here.

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
