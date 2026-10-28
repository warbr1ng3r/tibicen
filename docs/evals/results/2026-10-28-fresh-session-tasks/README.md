# Useful tasks in fresh Codex contexts

On 28 October 2026, two new Codex subagents with `fork_turns=none` completed tasks on separate copies of the projects configured during [ZCode app acceptance](../2026-10-27-zcode-app/README.md). Neither received the earlier conversation or pasted AGENTS.md contents. Each was asked to discover local instructions, reported the file/hash before editing, and then implemented its task.

| Copied project | Task | Instruction hash | Observed checks |
|---|---|---|---|
| Task CLI | Add `list --open`, preserving normal list/add/done and read-only listing | `5eba86c6…` | Agent baseline 6/6; final 9/9; independent acceptance and root Node 24 suite 9/9 |
| Notes API | Add case-insensitive `GET /notes?q=term`, preserving existing routes and strict query validation | `4f8d4868…` | Agent baseline 6/6; final 9/9; independent acceptance and root Node 24 suite 9/9 |

Both instruction hashes match the exact AGENTS.md files installed by the prior ZCode flow. Each agent changed only one source file and one focused test file. AGENTS.md, manifests, package files and README documents stayed unchanged. All 15 files in the original completed projects retain their bytes and modes; the prior apply/history was not repeated or reset.

## Independent acceptance

Before dispatch, host checks failed on the unchanged copies for the expected missing features: unsupported `--open`, and HTTP 400 for note search. After implementation, the independent real CLI/HTTP checks passed:

- CLI: both flag orders, only unfinished tasks, unchanged unfiltered list/add/done, duplicate/unknown/non-list flags rejected, no writes/replacement while listing, empty and missing data.
- API: case-insensitive substring and encoded terms, creation order, absent/empty/no-match queries, HTTP 200 on successful reads, unknown/duplicate/write queries rejected without state changes, existing create/list/delete preserved.

Read-only design review found missing status assertions in several success branches of the API host check. They were strengthened before its first green run; the original script/freeze/red logs and explicit amendment remain preserved. The original task contract did not change and agents did not inspect host checks.

Root ran both project suites and both independent checks with Node **24.15.0**: **18/18 project tests**, plus both acceptance scripts passed. The CLI agent's own tests used Node **25.8.0** and disclosed that limitation; they are separate from root's Node 24 results. The API agent did not record its Node version, so that value remains unknown. No implementation repair by root was needed. Independent implementation review: **Ship**, no actionable findings.

## Evidence and limits

[Machine-readable results](results.json) contain full instruction hashes, changed paths, runtime distinctions and check outcomes. Raw instructions-read evidence, frozen checks, amendments, red/green logs, patches and final snapshots are maintainer-local at the maintainer-local evidence collection.

This demonstrates explicit project-instruction reads and completed useful tasks in two fresh Codex contexts, using instructions from the ZCode setup. It does not establish automatic native instruction discovery, a fresh task execution in ZCode itself, causal benefit over an unconfigured project, measured time/cost savings or a human pilot. Instruction discovery was requested; there was no isolated measurement of automatic loading.

The exercises were generated projects in a separate visible lab. Their original READMEs were intentionally retained as baseline inputs. No Tibicen product source, distributed skills, prior manifests/check outcomes or release assets changed. The exercise itself did not run the full 668-case product suite or create commits/publications. Subsequent repository review, validation and documentation commits are recorded separately.
