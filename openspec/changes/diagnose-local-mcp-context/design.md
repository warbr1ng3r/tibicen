# Design

## Context

See [proposal](proposal.md). Existing `validateMcpConfig`/`planMcpChanges` already
validate Claude/Cursor project JSON, environment reference names and exact trust.
The CLI does not currently supply target-env options. Codex remains a manual
TOML helper. The dated research identified source/context/format mismatches;
fresh official Gemini/OpenCode docs confirm distinct layouts and native commands
that can start servers.

## Goals / Non-Goals

**Goals:** One bounded single-server diagnosis, safe file boundary and actionable
init/adopt recommendation. Reuse existing parsing/read/writer safeguards.

**Non-Goals:** Universal source discovery, new automatic writers, executable
launch/handshake, shell expansion, secret/file interpolation, global home reads,
new memory/runtime service or another long-running evaluation harness.

## Decisions

1. Add `mcp-diagnose --root ROOT --input FILE_OR_STDIN_DASH`. Direct metadata
   request: `{agent, agentVersion?, server, format?, sources:[{path}],
   effectiveSource?, launch?}`. At most four unique canonical root-relative paths;
   no text/values are accepted in request. `format: opencode-v2` is required for
   OpenCode; no V2 contract is inferred from an unknown version. Other recognized
   profiles select their documented reader; unknown identities remain manual.
2. Core exports a strict request validator and pure
   `diagnoseMcp(request, configs: Map<string,string>)`. CLI validates before
   inspection, reads permitted sources using the existing `readProjectFile` with
   1 MiB limit and unfinished-plan forbidden paths, then passes text internally.
   Unavailable map entries remain unverified; no error contents are returned.
   Raw settings never need to enter an agent's context to form stdin.
3. Diagnose one selected name across sources. `effectiveSource` is a caller-
   supplied selection for this server, not observed native authority. Preserve
   all candidate statuses, do not guess source order, merge records or claim
   that project inputs cover global/managed/session sources. Output contains
   source/path/status, env names and fixed reasons only; no command/args/values.
4. Claude/Cursor reuse existing validation; the unambiguous JSON parser gains a
   minimal export for Gemini/OpenCode. Gemini uses `mcpServers`, string command,
   args/env and optional cwd; URL fields take precedence and remain unsupported.
   Its external enablement remains unknown, while supplied allowed/excluded
   policy is retained. OpenCode V2 uses `mcp.servers`, type local, command array,
   environment, optional cwd and disabled. Unsupported/ambiguous layouts are
   manual, never translated by guessing. No file or env value is resolved.
5. `launch` accepts only `targetContextKnown`, `availableEnvNames`,
   `executableAvailable`, `cwdAvailable`. Names/booleans are supplied evidence;
   false/true values cannot establish the target when targetContextKnown is not
   true. Missing fields remain unverified. No inference from process.env/PATH.
   Connection/use remain unverified regardless of these observations.
6. Repair output identifies existing supported project writer only for its
   exact path; other targets retain manual native action. Installed guidance
   explains one result and the same post-repair check, preserving exact consent.
   `gemini mcp list`/`opencode mcp list` are potential execution, not preapproval
   reads. Maintain one concise EN/RU guide section and consolidated verification.

## Risks / Trade-offs

- Untrusted settings may contain secrets → Node-only bounded redacting boundary,
  fixed output vocabulary, no raw parser errors or command/args/env values.
- Supplied source/launch facts may be wrong → basis remains caller-supplied,
  native connection/use and unobserved scopes stay unverified.
- Permitted file is unreadable or excluded → preserve unavailable-source result,
  not a missing-server diagnosis; never broaden access or follow file references.
- New readers could imply new mutation support → existing writer paths and trust
  checks remain unchanged, with explicit manual outcomes for other formats.

## Migration Plan

Additive command only; preserve old `mcp-verify`, stored schemas and task-aware
report. Keep work Unreleased and the root version unchanged until candidate
preparation. No dependency or release operation is needed for implementation.
