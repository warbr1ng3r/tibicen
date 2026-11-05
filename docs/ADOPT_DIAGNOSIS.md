# Understanding an adopt result

**In development, not yet released.** Published [1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0)
remains unchanged. The examples below describe the clearer diagnosis and
version-aware practice assessment being added to `tibicen-adopt`. They are
illustrative projects and responses, not transcripts, completed runs or evidence
of user benefit.

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

The existing `report` command gains an additive `diagnosis` field in this
development change. It collects a fresh bounded inventory and structural check,
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
