# Harness observability — 27 November 2026

**Research, local version/help inspection and two no-model Codex renderer controls.**
No live agent task, paid API request, credential inspection, personal transcript export,
harness installation or host-setting change was performed. The ongoing 47-case packet
is separate and untouched. This note updates, rather than regrades, the
[20 November observation](2026-11-20-native-loading-observation.md).

The practical next step is to run the eight bounded **functional** cases in the existing
ZCode subscription. Missing trace export limits a loading/freshness claim; it does not
prevent checking actual output, consent-bound changes and preservation. Native loading
needs a separate observation route. A model/provider name does not identify that route:
GLM, DeepSeek, Mistral and GigaChat may be used through different harnesses.

## What was observed locally

| Surface | Metadata observed | Limit |
| --- | --- | --- |
| Codex CLI | 0.157.0; binary SHA-256 `ad0be20d04e2ba6146ecdb51d7f8b7b0fe15420a15dc9b0057518d858f1f3714`; `exec --json`, `--ephemeral`, `--ignore-user-config`, `--ignore-rules`, and `debug prompt-input` in help | Help establishes options, not successful live execution |
| Claude Code CLI | 2.1.283; print/stream-JSON, session, hook-event and settings-source options in help | No login, plan entitlement or live stream checked |
| ZCode desktop | 4.0.0, build 4.0.0.10870 from application metadata | No `zcode` command resolved on this process's PATH; desktop tools need their own capability inventory |
| VS Code desktop | 1.148.0 from application metadata | Extension, Copilot entitlement and diagnostic capture not inspected |

Gemini, OpenCode, Kimi, Vibe, Cursor Agent and Copilot commands did not resolve on
this process's PATH. This does not prove they are absent elsewhere. No user config,
registered projects, installed personal skills or old conversations were enumerated.
Private preparation receipts retain the exact help argv/output and metadata probes.

### Codex startup input: newly observed, without a model

Root ran two `codex debug prompt-input` controls under an isolated allowlisted
HOME/CODEX_HOME and preflighted macOS network denial. The owned network control
connected; the sandboxed control received EPERM. Both renderer calls exited 0,
in 0.30 s and 0.10 s, with synthetic catalogue/provider configuration and no auth.

| Control | Owner instruction body marker | Fixture skill metadata | Skill body-only marker |
| --- | --- | --- | --- |
| Files present | Present in rendered input | Present | Absent |
| Files absent | Absent | Absent | Absent |

This establishes startup input construction for that binary/configuration, not
an ordinary task, implicit skill activation or rule use. An absent skill body is
compatible with progressive disclosure. The configuration used the synthetic
`gpt-5.5` catalogue, disabled plugins/hooks and a local non-auth provider. It does
not establish the current `gpt-6-astra` session's input or behavior. Exact inputs,
configuration hashes, bounded stdout and denial preflight are retained separately.

## Documented capture routes, not local acceptance

| Harness | Current primary-source route | What still needs a controlled run |
| --- | --- | --- |
| Codex | `exec --json` gives thread/turn/items and usage; app-server gives structured items and request/approval APIs. Deferred or bounded outputs must be retrieved and checked, rather than assumed complete. [Non-interactive](https://learn.chatgpt.com/docs/non-interactive-mode), [app-server source](https://github.com/openai/codex/blob/main/codex-rs/app-server/README.md) | Actual command/read output completeness, initial context and approval chronology for the chosen live configuration |
| ZCode | Reviewed hooks expose tool input/result, call/session IDs and startup/resume source. [Hooks](https://zcode.z.ai/en/docs/hooks) | Enable only in a separately reviewed owned fixture; verify real event fields and complete read bodies |
| Claude Code | Print mode supports streaming JSON and continuation; hooks include tool and instruction-loading events. [Programmatic mode](https://code.claude.com/docs/en/headless), [hooks](https://code.claude.com/docs/en/hooks) | Validate stream completeness, exact instruction body, permissions and authentication route. Bare mode skips discovery and uses API/provider credentials; it is unsuitable as an automatic substitution for subscription/native-loading tests |
| Gemini CLI | `--output-format stream-json`: init, message, tool_use, tool_result, error and result with usage. [Headless](https://geminicli.com/docs/cli/headless/) | Installed version, session isolation, output bounds, approvals and owned cancellation |
| OpenCode | Current CLI documents `run --format json`, named-session continuation and `session export`; private/standalone servers avoid its default shared background service. [CLI](https://opencode.ai/docs/cli/), [commands](https://opencode.ai/docs/cli/commands/) | Version-specific event schema, tool bodies and cancellation; do not copy flags from an older CLI version |
| Kimi Code | Print JSONL, Wire mode, explicit session control and session ZIP export containing context/wire/state are documented. Print mode implicitly enables AFK tool approval. [CLI reference](https://moonshotai.github.io/kimi-cli/en/reference/kimi-command.html) | Check actual Wire/read events and isolation; automatic tool approval never supplies Tibicen's exact-plan consent |
| Cursor Agent | Stream JSON includes call/session IDs and completed read content with `exceededLimit`; final JSON alone omits tool events. [Output format](https://cursor.com/docs/cli/reference/output-format) | Pin installed version, obtain complete non-truncated read output and independently retain commands/approval records |
| VS Code/Copilot | Preview Agent Debug Logs exports OTLP JSON; Chat Debug shows model prompt/context and tool inputs/results. Capture is prospective and must be enabled before the activity. [Diagnostic guide](https://code.visualstudio.com/docs/agents/agent-troubleshooting/chat-debug-view) | Verify actual selected harness/extension and enable diagnostics only in an approved fixture; app version alone proves no capture |
| Mistral Vibe | Official repository points to the current Vibe documentation and account/API routes. [Repository](https://github.com/mistralai/mistral-vibe) | Exact event/export contract was not verified; the attempted old CLI-doc URL returned 404 and the current overview fetch hit a DNS error. Do not select it for an evidence-dependent run yet |

These routes are candidates, not a promise of support for every release. Switching
models inside one harness does not establish another harness's native discovery.

## ZCode 4.0 changes the next experiment

The earlier observation used ZCode 3.14.4. Current documentation offers a useful
prospective route: `PostToolUse` carries `tool_response`; `transcript_path` is temporary
and disappears after the hook finishes. Workspace hooks require review. A hook's
`timeoutMs` limits the hook, **not the agent's whole phase**. No hook was enabled here.
[Hooks](https://zcode.z.ai/en/docs/hooks)

ZCode's documented instructions are global plus workspace-root AGENTS.md, with no
subdirectory merge. Subagents have isolated contexts, but cannot dispatch subagents;
Explore does not inject AGENTS.md. The coordinator must inspect the actual selected
worker/tools instead of assuming nested execution or identical instruction injection.
[Agent](https://zcode.z.ai/en/docs/agents), [subagents](https://zcode.z.ai/en/docs/subagents)

App usage is an estimate from local session records; Coding Plan statistics come
from the plan service. Neither alone is a reconciled all-role model-request ledger.
No documented automatic per-worker wall timeout was established by this inspection.
[Usage statistics](https://zcode.z.ai/en/docs/usage-stats)

## Evidence contract and recommended execution

Freeze fixture bytes/modes, prompt, candidate, harness binary/configuration and the
controller's permitted follow-ups **before** launch. Record a case/phase/session ID,
monotonic ordering and wall timestamps. Distinguish these observations:

| Dimension | Required observation |
| --- | --- |
| Initial context | Captured constructed input or host request; a new session ID alone is insufficient |
| Actual reading | Host tool input/result with exact owned file body/hash and event ordering; a model's assertion is insufficient |
| Rule use | A distinguishing executable check plus retained final diff; a read alone proves no compliance |
| Approval | Separate controller message bound to the retained compiled plan/digest before apply; tool auto-approval is different |
| Freshness | New session/context controls and known carried inputs, not just a statement that the worker is fresh |
| Timing/usage | Whole-phase owned clock and cancellation receipt; retain unknown fields when the host cannot export them |

1. **Eight-case ZCode packet:** use a coordinator and direct workers, with no nested
   dispatch requirement. Preserve actual proposals and perform authorized controller
   follow-ups in the same worker session. Admit routes per case; one missing event
   export must not block independent functional cases. Retain read/loading/freshness
   as unverified where needed. A failed provider-readiness check still stops its
   dependent live launches; missing event export alone is a different limitation.
   A collector, explicit read hint or controller reset is disclosed assistance.
2. **Six pending read/use cases:** begin with one owned fresh-task/read trace. Codex
   is the locally installed candidate with both a renderer control and documented
   JSON events; a bounded live run still needs separate admission. For the second
   host, test a reviewed ZCode fixture hook on one tiny synthetic read before a full
   native claim. Initial-context capture and read/use remain separate dimensions.
3. **Do not build a universal logger now.** Retain only bounded events for the owned
   new session; never scrape personal history or copy credentials. Keep raw event
   provenance, truncation and independent grading. Missing evidence is recorded as
   missing, while ordinary functional work continues.

No new model route or paid API allowance follows from this research. Provider/plan
credentials must be provisioned through an authorized route, not moved from another
host. General human usefulness and causal benefit remain outside these observations.

## Subsequent owned ZCode return: explicit body reads

The separately executed [eight-case packet](../evals/results/2026-11-27-agent-eight-assessment/README.md)
returned partially later on 27 November. This is an assessment of retained owned-session
exports, not a live task run by the initial researcher and not validation of the hook route.
Six actual tool-result bodies match their files at read time across AE-05/06/08; memory
correction/work and selected-skill review have useful explicit-reading evidence.
The capture came from scoped host model-I/O projections, with rolling-window losses and
two oversized event files; hooks remained disabled. Clean initial-context and native
autoload claims remain unverified. Keep actual body reading, functional use and automatic
loading separate; the earlier absence of a locally validated hook is not proof that
ZCode cannot export any tool evidence.
