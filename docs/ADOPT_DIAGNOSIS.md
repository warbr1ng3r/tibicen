# Understanding an adopt result

**Available in [1.2.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.2.0).**
The examples below describe clearer diagnosis and version-aware practice
assessment in `tibicen-adopt`. Published 1.1 bytes remain unchanged. These are
illustrative projects and responses, not transcripts, completed runs or evidence
of user benefit. Actual candidate observations and their assistance/limits are
recorded in the [release report](evals/results/2026-11-05-release-1.2/README.md).

Ask in ordinary words:

> Use tibicen-adopt. Check the agent setup and fix what needs fixing.

The agent reads the permitted project files first. It explains **what is there,
what the problem is, what to keep or change, what was checked, and the next
step**. It asks only about an important choice the project and your request do
not answer. A repair still needs your approval of the exact plan; a useful
review can end without changing anything.

## 1. The setup already fits

**Starting project:** `invoice-cli`, a command-line application. You use Codex
from the project root. The relevant files contain:

```text
package.json       test script: node --test
AGENTS.md          Use the existing test script. Read docs/decisions.md for related work.
docs/decisions.md  Ask before adding dependencies: keep this CLI easy to distribute.
```

**You:** “Is this setup okay? I don't want extra stuff.”

**Agent actions:** read the applicable instructions and decisions, check that
the referenced file and test script exist, and look for a concrete missing
connection or conflicting decision. Inspecting a script does not execute it.
Nothing here calls for another tool or another memory file. No interview
question is necessary if the selected agent and task are already known.

**Result:** “Keep the current instructions and decisions. I found no necessary
change within the files I inspected. No files were changed. Read-only inspection ran; no project or third-party
commands were executed. I have not observed a fresh agent using the instructions. Your next step is
to give the agent an ordinary coding task.”

There is no diff, approval request for invented work, or new setup session just
to record activity. Unreadable files or inspection limits must still be named;
“nothing found” does not mean the entire project has been proved healthy.

## 2. Decisions exist, but the instructions do not point to them

**Starting project:** `booking-api`, an existing API. Its selected agent uses
`AGENTS.md`; that file has no memory policy or managed block yet:

```text
AGENTS.md          Use the existing package scripts.
docs/decisions.md  Keep timestamps in UTC: clients convert them for display.
                   Ask before adding a runtime dependency.
```

**You:** “I'm tired of repeating our decisions. Sort this out.”

**Agent actions:** read both files and the permitted instruction connections.
Explain that the decisions are already useful, but no inspected instruction
points to them. Recommend using this one existing file. No question about a new
memory technology or storage location is needed.

**Proposal:** preserve `docs/decisions.md` and add this block to `AGENTS.md`:

```diff
 Use the existing package scripts.
+
+<!-- tibicen:begin v1 -->
+Before related work, read the relevant decisions in `docs/decisions.md`.
+Within authorized work, retain lasting user decisions and verified facts with useful reasons or sources. Distinguish assumptions from accepted decisions; leave out temporary progress, secrets and full conversations.
+When a decision changes, correct its current meaning and preserve unrelated notes. Follow the current request and write boundaries; ask about consequential uncertainty.
+<!-- tibicen:end v1 -->
```

This example shows the instruction diff. The real proposal also discloses
Tibicen's own manifest/state writes, checks and any required migration. Approval
binds the complete plan, including those details. With several conflicting
decision files, the agent instead asks which decision is current; “use your
judgment” leaves unresolved intent visible rather than choosing by file age.

**After approval:** apply the approved connection and structurally check it;
check that the existing decisions stayed unchanged. Report: “Connected the
existing decisions file; kept its notes. The connection is checked. Use by a
fresh agent is still unverified.” A useful next request is: “Add date filtering
to bookings; use the relevant project decisions.” See the [memory guide](PROJECT_MEMORY.md)
for reading, updating and correcting those notes.

## 3. Two instruction files serve different parts of the project

**Starting project:** `help-site`, with English guides and Russian translations:

```text
AGENTS.md          Write guides in English; docs/ru/ contains Russian translations.
docs/ru/AGENTS.md  Write translations here in Russian.
docs/ru/install.md The Russian installation guide.
```

**You:** “There are two rules files. Is that a mess?”

**Agent actions:** retain both paths and their directories in the inventory.
Read the actual passages and explain their different purpose. For work on
`docs/ru/install.md`, check the selected agent/version and its applicable
instruction rules when that evidence is available. File location alone does
not establish the active instruction chain or a semantic conflict.

**Result:** “These files describe an intentional translation exception. Keep
both; no diff is needed for this finding.” If the installed version or active
scope cannot be checked, add that limitation. If the passages actually disagree
and the current decision is unclear, show both and ask one meaningful question
before proposing a replacement. A useful next request is: “Update the Russian
installation guide to match the English one.”

## 4. Files look correct, but loading has not been observed

**Starting project:** `support-dashboard`, previously configured by Tibicen.
`AGENTS.md` points to `.agents/memory.md`; the safe file and registered connection
pass the current structural checks. A saved session also contains older checks.

**You:** “The agent still forgets our rules. Can you check?”

**Agent actions:** inspect the current files and connection. Read older session
results as recorded history. Do not call an earlier successful check a new
observation, rewrite valid files merely to show progress, or start a native
agent without the required execution approval.

**Result:** “The files and memory connection pass structural checks now. I have
not observed your next agent loading or following them, so I cannot confirm why
it missed the rule. I recommend no configuration change from this evidence.”

**Next step:** in a fresh session, ask for a small relevant task and observe
whether the decision is read and used. Explicitly naming the memory file is
help with reading it; that does not demonstrate automatic startup loading.
An unperformed behavior check stays `unverified`, with its reason.

## Version context and official guidance

The agent uses trusted host metadata or an already authorized observation to
obtain available agent versions. A repository file, preset or historical manifest
does not establish the current installation. Without a reliable observation, the
version stays unknown. The `practices` command does not detect or execute agent
binaries; it receives supplied version context and reads allowed official sources.
Successful retrieval retains the source, check date and content hash, with
`requires-agent-assessment`: applicability and native compatibility still need
separate evidence.

These short outputs are illustrative too. The version, date and source assessment
are assumed for the examples, not results of native runs:

- **Keep, observed version available:** “Host metadata reports Codex 0.157.0.
  The relevant official guidance read on 5 November 2026 supports keeping the
  inspected instruction layout. No configuration change is needed within this
  scope. Fresh-session loading is unverified.”
- **Change, applicable evidence:** “For that observed version, the inspected
  files and relevant guidance support connecting the existing decisions file as
  shown above. I propose that one connection; it makes the decisions reachable
  without another tool. The exact plan needs approval, then a structural check;
  fresh-session use remains to be observed.”
- **Unknown version:** “I could not obtain a reliable agent version. I found no
  necessary structural change in the inspected files, so I would keep them.
  Version-specific applicability remains unknown.” The output retains an
  `agent-version-unverified` gap.
- **Unavailable or inapplicable source:** “The official source could not be read,
  or its guidance describes a different release. I cannot justify applying it
  here. I would keep the current setup pending relevant evidence.” Report the
  actual read failure or version mismatch; old evidence or a fix on a source's
  main branch does not establish behavior in the installed release. Uncertainty
  alone does not call for an upgrade or a rewrite.

The optional CLI input is JSON. Replace `SKILL_DIR` with the absolute directory
containing the installed skill's `SKILL.md`; the example token is illustrative:

```sh
printf '%s\n' '{"agentVersions":{"codex":"0.157.0"}}' |
  node "SKILL_DIR/scripts/tibicen.ts" practices --agents codex --input -
```

`--agents` selects the agents. Only their supported keys may appear in
`agentVersions`; malformed input is rejected before source reads. Omitting
`--input` or a selected version remains valid and leaves that version unverified.
An already existing JSON file can be read with `--input EXISTING_FILE` instead.
Before plan approval, keep prepared input in memory and pass it through stdin;
do not create a temporary project file. This read-only command creates no state,
cache or project edits. A supplied version is context, not independent proof of
the installed binary or compatible behavior. See the [evidence rules](../references/rules.md).

## Current evidence and saved history

The existing `report` command includes a `diagnosis` field. It collects a fresh
bounded inventory and structural check,
instruction candidates with their directories, gaps, and an explicit loading
limit. The candidates are files found, not proof that a particular agent loaded
them. Checked adapter formats and versions describe Tibicen's bounded contracts,
not the versions installed on your machine. A partial scan or unregistered setup
is not a clean bill of health.

Permitted existing nested `.cursorrules` and rule files under `.cursor/rules/`
or `.claude/rules/` found by the bounded scan can satisfy the structural memory
connection when they contain the exact selected memory path relative to the
project root, such as `docs/memory.md`. This does not establish task applicability
or native loading, or authorize editing protected nested rules.

The existing status, checks and applied-change fields still describe the saved
session. A historical `complete` can coexist with a current broken connection.
Without a saved session, the diagnosis does not create one or claim a new
integration is complete. A no-change recommendation is the working agent's
reasoned conclusion, not an automatic guarantee from file presence.

Default reporting writes no project files and runs no project commands. Saving
a report file still requires an explicit request. Check scope, supported
versions and native execution limits remain in the [agent matrix](../references/agent-matrix.md)
and the [current published capabilities](CURRENT_CAPABILITIES.md).

<a id="task-context-for-init-and-adopt--unreleased"></a>

## Task context for init and adopt

Tibicen 1.4.0 can attach the selected host, working directory and
intended task path to the same read-only report used by both skills. The agent derives available context
from the session; you do not need to fill in another questionnaire.

Replace `SKILL_DIR` with the absolute directory of the complete installed
skill and `/actual/project` with the project root:

```sh
printf '%s\n' '{"agent":"team-agent","cwd":"docs","targetPath":"docs/ru/install.md"}' |
  node "SKILL_DIR/scripts/tibicen.ts" report --root "/actual/project" --input -
```

`--input EXISTING_FILE` reads an existing JSON file instead. Before approval,
pass prepared context through stdin rather than writing a project file. The
object requires `agent` and `cwd`; `agentVersion` and `targetPath` are optional.
`agent` accepts a valid known or uncatalogued harness ID. Paths use forward
slashes relative to the project root, including `targetPath`; `cwd` may be `.`.
Absolute paths, traversal, backslashes, control characters, unknown fields and
invalid types are rejected before project inspection or saving a report. A call
without `--input` keeps its existing behavior.

The additional `diagnosis.instructions.taskScope` separates supplied context,
documented profile facts and lexical relationships between candidate directories
and the working/target paths. For the translation example above, root
`AGENTS.md` is above both paths; `docs/ru/AGENTS.md` is above the target but not
the working directory. These relationships help explain the intentional
exception; they do not prove either file is active. Conditional native rules
still require host-specific assessment and cannot be excluded by directory
position alone. No extra path is inspected because it appears in context; scan
exclusions remain.

In **init**, a project without instruction candidates can still receive one
sufficient setup and an exact first reading step. In **adopt**, preserve useful
root/subtree differences and correct only a demonstrated defect; no change is
a valid result. A supplied version is not an observed installation, an unknown
host stays unknown, and neither case turns applicability, loading or task use
into a passed check. Reuse the reviewed context for verification and the first
task, or disclose what changed. See [portable activation](HARNESS_PORTABILITY.md)
and the [later memory check](PROJECT_MEMORY.md#check-the-first-task-and-later-memory-use--unreleased).

## Optional project context review — Unreleased

The development source also offers optional [project context review](PROJECT_CONTEXT_REVIEW.md)
for explicitly selected instruction files, remembered-fact source changes and
version-impact explanations. These additions are Unreleased, separate from the
published 1.4.1 behavior described here.

<a id="local-mcp-diagnosis-for-init-and-adopt--unreleased"></a>

## Local MCP diagnosis for init and adopt

Tibicen 1.4.0 includes `mcp-diagnose` for one named server. It reads explicitly selected project settings
without starting a server, writing state or returning settings contents. The
existing `mcp-verify` command and supported write paths remain unchanged.

**You:** “Connect our local tool” in init, or “The tool is configured, but the
agent cannot see it” in adopt. The agent identifies the selected host, relevant
project source and available launch evidence. You do not need another technical
questionnaire or a different model.

Any valid harness ID can explicitly select a supported `format`; no catalog
profile is needed. For another syntax, `format: "stdio-observation"` accepts
redacted facts tied to the inspected source text by SHA-256. The agent obtains
those facts from permitted inspection without executing the configuration.
Each source then includes `observation: {sourceHash, state, envNames}`; state is
`stdio`, `disabled` or `unknown`, and env names are empty for non-stdio states.
A matching stdio observation produces a `reported-stdio` source; its explicit
selection as `effectiveSource` gives `configuration.basis: "caller-observation"`,
not parsed validity. Stale or
unavailable sources leave it unverified. See [formats and evidence](MCP_FORMATS.md)
for exact bounds and native source differences.

For a project whose selected OpenCode V2 source is `opencode.json`, pass metadata
through stdin. Replace `SKILL_DIR` and `/actual/project` as in the earlier example:

```sh
printf '%s\n' '{"agent":"opencode","server":"local-tools","format":"opencode-v2","sources":[{"path":"opencode.json"}],"effectiveSource":"opencode.json"}' |
  node "SKILL_DIR/scripts/tibicen.ts" mcp-diagnose --root "/actual/project" --input -
```

`--input EXISTING_FILE` reads an existing metadata file instead. The request names
the host and server, up to four unique project-relative source paths, and an
optional selected source, format and host version. Only existing Claude Code,
Cursor and Gemini CLI requests retain defaults without a format; other readers
require explicit selection. Source order does not determine precedence. A supplied
`effectiveSource` records the caller's selection; it does not prove which file
the running host uses or cover global, managed or session settings.

The reader accepts permitted regular files of at most 1 MiB each. Unsafe or
sensitive source paths are rejected as invalid metadata before inspection.
Forbidden, symlinked or unreadable sources remain unavailable rather than becoming
"server missing." It does not follow credential/file references. Results contain
names and fixed status/reason fields, without settings text, command/argument
values, environment values or raw errors. Do not paste a settings file or secret
into the request.

Optional `launch` observations contain only `targetContextKnown`,
`availableEnvNames`, `executableAvailable` and `cwdAvailable`. Environment entries
are variable **names**, never values. Availability booleans and names matter only
when `targetContextKnown` is true; omitted observations remain unverified. A tool
working in your shell does not establish availability in a GUI or remote host.
Neither these observations nor valid configuration prove connection or tool use.
`formatEvidence` records caller selection, a harness default or an unverified
format. Parsed results use `configuration.basis: "parsed-format"`; supplied
observations retain their distinct basis. `nativeActivation` stays `unverified`.

### One result and one next step

These are illustrative outcomes, not recorded connection tests:

- **A supported record needs a correction.** The confirmed effective source is
  Cursor's `.cursor/mcp.json`; its selected server uses the wrong env-reference
  grammar. The necessary correction is:

  ```diff
  - "env": {"TOOL_TOKEN": "${TOOL_TOKEN}"}
  + "env": {"TOOL_TOKEN": "${env:TOOL_TOKEN}"}
  ```

  This uses the documented [Cursor interpolation syntax](https://cursor.com/docs/mcp#config-interpolation),
  freshly checked on 6 November 2026.
  Show the exact proposed record through the existing approved writer, preserve
  other records/settings, then repeat the same diagnosis. This bounded repair
  does not cover inline credentials, ambiguous JSON or unsupported fields.
  Applying the edit does not prove that the server connected.
- **The target needs a native action.** Other native settings need a correction,
  or the effective source/launch context is unknown. Explain the precise missing
  fact and the manual/native step. Their new readers do not add automatic writers;
  Codex retains its manual TOML fragment. Do not guess a path, export secrets,
  enable a disabled server or weaken trust/filtering to make a check pass.
  A missing target environment variable, executable or cwd in otherwise valid
  settings calls for that environment/launch follow-up; it does not establish
  a file defect or justify rewriting the record.
- **The format is not parsed.** For a DeepSeek Harness overlay, a GigaChat-based
  application or another host, preserve the actual configuration language and
  provide only source-bound stdio facts. The hash does not establish their
  correctness or file safety. Explicit target facts may identify a missing env
  variable or executable. Repair remains native/manual; without a more specific
  target problem its reason is `observed-configuration-not-parsed`. It does not
  qualify for a writer.
- **No correction is established.** Preserve the inspected setup and state what
  remains unverified. A valid local record may still need a connection check in
  the selected host. Do not create a session, component or replacement file merely
  to record a no-change result.

Native `gemini mcp list` and `opencode mcp list` can start configured servers to
check connections. They are follow-up executions with the existing approval and
trust boundary, not preapproval file inspection. Reuse an applicable existing
native observation when available, and disclose its version and context.

### Host contracts checked on 6 November 2026

The [format matrix](MCP_FORMATS.md) adds ZCode native/shared, current Kimi Code
and bounded Vibe contracts, with their source dates and policy limits. These
optional readers complement the common observation route; they define no host
or model allowlist. The earlier reader sources remain:

| Reader | Relevant current contract and limit |
| --- | --- |
| Gemini JSON | `mcpServers`, string `command`, `args`, `env`; URL transport takes priority over a local command. Explicit env references and host sanitization differ from a shell. See [MCP settings](https://geminicli.com/docs/tools/mcp-server/) and [configuration layers](https://geminicli.com/docs/reference/configuration/). |
| OpenCode V2 JSON | `mcp.servers`, command array, `environment`, `{env:NAME}`, `disabled`; an overriding same-name source replaces the complete record. Relative `cwd` uses the workspace. See [MCP settings](https://dev.opencode.ai/v2/docs/mcp-servers/) and [configuration locations](https://dev.opencode.ai/v2/docs/config/). |

The bounded reader supports unambiguous JSON, not every format the native host
accepts: JSONC, unsupported fields and ambiguous layouts retain manual limits.
Gemini's MCP page is dated 6 October and its configuration page 15 October 2026;
OpenCode links describe the living V2 contract. These readings do not establish a
minimum released version or compatibility with an installed host. Gemini's
external enablement and unobserved host policies remain unknown. The documentation
does not establish how Gemini resolves a relative `cwd`; retain that launch gap
unless the target context is supplied. See the [capability boundary](HARNESS_CAPABILITIES.md#local-mcp-readers--unreleased).
