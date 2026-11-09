# What Tibicen does today

**Published skills: 1.5.4 · 2026-11-09 UTC.** Tibicen helps your existing coding
agent inspect, set up or repair project instructions and integrations, apply the
changes you approve, and report what was checked. The
[release report](evals/results/2026-11-09-release-1.5.4/README.md) defines the exact
published bytes and delivery evidence; the [product vision](PRODUCT_VISION.md)
defines wider goals, not extra shipped capabilities.

Tibicen consists of two standalone skills with local Node scripts:
`tibicen-init` for initial setup and `tibicen-adopt` for existing infrastructure.
Both can select the appropriate route from the actual project. A sufficient
setup can stay unchanged, without creating a new session merely to record work.
There is no Tibicen server, account, separate model or background service.

## Memory scope and conflicting evidence — available in 1.5.4

Installed guidance retains supplied operation names and accepted exception boundaries; unknown name relationships and genuine same-operation conflicts need clarification. Before writing a rule, the agent separates observed behavior from owner decisions when documentation and code disagree. This adds no automatic code priority, alias inference or memory schema. See the [release report](evals/results/2026-11-09-release-1.5.4/README.md).

## Project inspection fixes — available in 1.5.3

Structural checks recognize Markdown fragments in registered-memory links. Read-only project commands accept `--forbidden-paths` for that operation while preserving active-plan exclusions; they create no persistent ACL. Installed guidance separates mandatory external human actions from agent reading and future checks. See the [release report](evals/results/2026-11-09-release-1.5.3/README.md).

## First setup after project-local installation — available in 1.5.2

The [local change](../openspec/changes/distinguish-self-installed-tibicen/proposal.md)
selects initial setup when exact canonical Tibicen skill folders are the only
infrastructure. Other instructions, skills or a recorded setup still select
improvement. All files remain inventoried; folder names prove neither trust nor
upstream provenance. An installed skill still makes the directory nonempty, so
initial routing grants no application-scaffolding permission. This correction is included in published 1.5.2.

## Optional project context evidence — available in 1.5.0

The existing read-only report can compare caller-selected instruction files,
identify byte changes in explicitly bound sources of remembered facts, and retain
supplied version-impact assessments against current local evidence. The
[context-review guide](PROJECT_CONTEXT_REVIEW.md) gives inputs and limits.
Comparisons use the permitted scan and supplied metadata; they add no memory
store, source fetching, background service or automatic update. Byte agreement
proves neither note truth nor native loading.

The [release report](evals/results/2026-11-07-release-1.5/README.md) records exact
public delivery, six platform cells and three assisted fresh sessions on one
requested Codex subscription route. The sessions explicitly read the staged
skill and use its real CLI in synthetic fixtures. B3's missing checksum utility
and successful same-session fallback are retained. These results establish no
implicit loading, all-harness compatibility or measured human benefit. The
separate Pages metadata deployment and official-artifact comparison passed for
all 20 returned bodies; exact identities and collection limits are in that report.

## Jobs it can handle

Examples describe available workflows, not guaranteed outcomes on every project.

| Your request | What the released workflow provides |
| --- | --- |
| “Set this project up for agents.” | Inspect permitted files, existing commands and constraints; recommend one sufficient setup and apply approved infrastructure changes. Existing application code, package manifests, CI and data are preserved. An empty directory can receive an approved initial scaffold. |
| “Our rules are outdated or scattered.” | Explain what exists, what to keep and what needs changing; propose exact edits or no change. Nested instruction files are retained with their scope. Semantic conflicts and native precedence require agent assessment, not just a filename match. See [adopt diagnosis](ADOPT_DIAGNOSIS.md). |
| “Help the next agent start this task.” | Carry the selected host, working directory and task path into diagnosis and handoff. Explain relevant instruction candidates and the first explicit reading step; do not claim that the next agent automatically loads them. |
| “Remember our decisions.” | Connect one optional project-memory file and rules for reading, updating and correcting accepted decisions while preserving unrelated notes. Working agents maintain it afterward; Tibicen does not watch chats or enforce compliance. See [project memory](PROJECT_MEMORY.md). |
| “Check this MCP setup.” | Diagnose permitted local stdio configuration through a selected format or redacted, source-hash-bound observations. Explain missing prerequisites, supported exact repairs or a precise native/manual follow-up. Parsing does not establish a connection. See [MCP formats](MCP_FORMATS.md). |
| “Use this skill or process if it helps.” | Discover and inspect components, retain source/provenance and pinned content, and propose approved installation, replacement or removal. One bounded OpenSpec adapter is optional; OpenSpec is not required to run Tibicen or produce its report. |
| “Review after an update, or resume unfinished work.” | Rescan, consult applicable official guidance and retain session/component history. Resume checks current files and requires fresh approval; it does not blindly restore an old template or undo later user work. |
| “Reuse my preferences.” | Load an explicitly saved preset and recheck it against the next project. The bilingual static site can generate an optional preset in the browser. Preferences are input, not installation approval, and exclude memory bodies. |

## A normal run

1. **Inspect:** read the permitted project and skill resources. Before approval,
   discovery and proposal do not write setup files or execute project/third-party code.
2. **Recommend and review:** explain one sufficient result, exact paths/changes,
   component sources, commands, trust, costs and manual steps. “All defaults”
   skips interview questions; it does not approve writes or execution.
3. **Apply:** bind explicit approval to the exact plan digest, recheck original
   content and safe paths, then apply supported changes. Conflicting current
   files require reconciliation rather than a silent overwrite.
4. **Check and hand over:** distinguish current structural checks, recorded
   application/behavior results and unavailable checks; explain what changed and
   what to do next. Saving a separate report file needs an explicit request.

A changed setup can leave applicable agent instructions, selected skills or MCP
settings, optional memory and `.tibicen/manifest.yml` for setup/history. The
working agent then uses those files; Tibicen can be called again on request.
`complete` means integration has no known mandatory defect, not that every
behavior check passed. Pending required external work is `manual-action-required`;
an unresolved mandatory internal defect is `incomplete`.

## Hosts, models and configuration formats

A host that can read the complete skills/project and run Node **≥22.20** can use
the [common explicit-reading route](HARNESS_PORTABILITY.md), including a host
outside the catalog. The model and provider stay in that host. A descriptive
[harness profile](HARNESS_CAPABILITIES.md) is not a model allowlist, installer
target or proof of native loading. Read-only hosts retain their missing operations
as explicit gaps.

Native writes, process adapters and automatic probes keep their own
[adapter/version limits](../references/agent-matrix.md); the common-file route
does not grant those capabilities.

[MCP readers](MCP_FORMATS.md) cover specific JSON/TOML contracts; other languages
can supply redacted observations tied to the inspected source hash. These routes
are separate from writers: automatic project JSON edits remain limited to the
matching Claude Code/Cursor adapters; Codex has a manual TOML helper. Another
host selecting their format gains no writer. Diagnosis starts no server, reads
no personal settings, provisions no secrets, and proves no MCP handshake or tool use.

Use the [installation guide](INSTALLATION.md) for the pinned universal-folder
installer or complete manual archive. The installer needs Git; the archive route
and installed CLI do not. Installed skills need no repository development
packages or site build. Windows project-command launch remains unavailable;
read-only inspection still works. Repository/site development has separate
requirements in [CONTRIBUTING](../CONTRIBUTING.md).

## What the checks mean

| Evidence | What you can conclude |
| --- | --- |
| [1.5.0 release checks](evals/results/2026-11-07-release-1.5/README.md) | Exact candidate delivery, installation/update/recovery/removal and recorded platform cells passed within their stated scope. This is not every host/model combination. |
| Structural checks and MCP format diagnosis | Inspected files/connections or parsed/caller-observed facts meet the reported checks. Native activation, connection and useful behavior remain separate. |
| [Assisted fresh Codex observations](evals/results/2026-11-06-native-memory-recovery/README.md) | Some fixture sessions read, used and corrected memory. Explicit reading help, failed original grading and its separate after-observation assessment remain disclosed; automatic discovery and general behavior are unproven. |
| [Repair comparison](evals/results/2026-11-06-repair-comparison/README.md) | Tibicen and direct Codex reached the same repair/task result and sufficient-setup no-op in one assisted case. Extra functional benefit, saved human work, ordinary installation effort and monetary cost were not established. |

Project checks use supported profiles and approved commands; unavailable checks
stay `unverified` with a reason. A fetched practice source, heuristic component
scan or correct-looking answer does not prove safety, native compatibility or
human usefulness.

## Boundaries

No silent updater, agent orchestrator, model router, marketplace or permanent
monitoring is included. Project memory has no database, embeddings, chat-log
import or cross-project synchronization. Third-party execution needs its own
disclosed trust. More rules, components or files are not a success criterion.

The earlier dated 1.1 inventory remains in
[the preceding public source](https://github.com/warbr1ng3r/tibicen/blob/542743cde5a133f3a2a23a10d38daebab85ac5bf/docs/CURRENT_CAPABILITIES.md).
Its historical checks retain their original scope.
