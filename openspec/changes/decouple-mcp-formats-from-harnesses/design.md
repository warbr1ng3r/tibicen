# Design

## Context

See [proposal](proposal.md). The existing pure diagnostic already shares source
selection, redacted output and launch evidence across four readers. Its CLI
validates metadata before reading at most four safe project files of 1 MiB each.
The published portable instruction/memory workflow already permits unknown IDs.

## Goals / Non-Goals

Provide a useful diagnosis path for any harness without a brand/model allowlist.
Native parsers improve confidence for concrete formats; they are optional. Keep
current writers, launch trust and target-environment evidence unchanged. Native
handshakes, new write adapters, provider clients and configuration evaluation
are outside this packet.

## Decisions

1. Resolve an explicitly supplied format independently of `agent`. Preserve
   existing Claude/Cursor/Gemini defaults and explicit OpenCode V2 behavior.
   Report `formatEvidence` as `caller-supplied`, `harness-default` or `unverified`,
   and `nativeActivation: unverified`. New formats require explicit selection.
2. Share the existing source/launch/result pipeline. Supported contracts are
   `claude-code-json`, `cursor-json`, `gemini-cli-json`, `opencode-v2`,
   `zcode-native-json`, `zcode-shared-json`, `kimi-code-json`,
   `mistral-vibe-toml`, plus the general `stdio-observation` route.
   One request selects one contract; no path-based guessing or cross-format
   merging. Exact repair requires matching existing agent, format and path.
3. For `stdio-observation`, each source includes
   `observation: {sourceHash, state: stdio|disabled|unknown, envNames: string[]}`.
   Permit only this bounded metadata in this format. Match SHA-256 against the
   inspected UTF-8 source text before using the facts. Return `reported-stdio`
   rather than `valid-stdio`, with `configuration.basis: caller-observation`;
   parser results use `parsed-format`. The hash binds inspected text only; arbitrary binary content is outside this contract.
   Explicit target launch observations may diagnose missing prerequisites;
   neither writer nor native semantic verification follows. Missing/stale
   source means unverified. Never interpret Python, YAML tags or shell input.
4. Reuse unambiguous JSON parsing. ZCode native uses `mcp.servers`, shared uses
   `mcpServers`, with `enable: false`. Kimi uses `mcpServers`, `enabled: false`
   and a local/default target only; other `environment_id` remains manual.
   Vibe uses `[[mcp_servers]]` and `disabled: true`. Nonempty literal env overlays
   stay manual, including strings resembling other hosts' interpolation syntax.
5. Vibe gets a small self-contained fail-closed TOML subset reader, not a full
   new dependency: single-line basic/literal strings, booleans, bounded numbers,
   arrays, inline tables, ordinary sections and array tables. Document exact
   exclusions; duplicates, unsupported or ambiguous rest invalidate the source.
   Do not ignore malformed unrelated regions or attempt shell splitting.
6. The installed guide leads with capabilities, explicit format or general
   observation, then precise source/target gaps. Dated native examples are
   coverage cells, not the definition of supported harnesses. DeepSeek Harness
   and GigaChat SDK examples retain their actual code/YAML configuration limits.

## Risks / Trade-offs

- Caller observations can be wrong → separate basis/status; hash is not semantic
  validation, and native activation/connection/use remain unverified.
- Similar JSON differs in interpolation, trust or scope → separate contracts,
  supplied source selection and explicit external-policy limits.
- Small TOML reader covers only a subset → fail closed, document supported
  grammar, retain general observation route for all other syntax.
- New reader could accidentally grant mutation → test both unknown-ID and
  known-host/wrong-format cases against existing exact writer eligibility.

## Migration Plan

Additive Unreleased behavior with unchanged root version and legacy requests.
Refresh frozen bundle pins if a helper changes file count; rerun full checks,
standalone self-tests/checksums and independent review on final bytes. No release
operation or historical evidence relabeling.
