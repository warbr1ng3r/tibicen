# Design

## Context

See [proposal](proposal.md). The existing scanner and structural readers already accept `forbiddenPaths`; the CLI has no fresh input for it. Report's existing task context intentionally rejects extra fields. Status recovery can read project files before report starts scanning. Completed manifests do not retain plan exclusions, and the current contract does not promise a permanent ACL.

## Goals / Non-Goals

**Goals:** carry explicit per-read limits into the existing readers, including pending recovery and report evidence, with no writes.

**Non-Goals:** persisted policy, manifest/schema migration, global filesystem sandboxing, changing apply approval or replaying old observations.

## Decisions

- Use `--forbidden-paths '["private-data"]'` as bounded literal JSON. It can coexist with report or MCP stdin; a second stdin document or pre-consent temporary file is unnecessary. Parse data, validate all paths first, normalize one trailing slash and bound raw size/count/entry length.
- Support scan/status/report/verify, MCP diagnosis and local MCP verification. Practices/discovery/presets do not discover target-project resources and retain their own input contracts. Reject the flag for explicit global Codex verification rather than imply project isolation.
- Share pure state schema/digest/root/journal validation between metadata-only scan and full recovery. Scan loads bounded metadata without hashing recovery files. State uses the same existing nonblocking regular-file reader and 8MiB byte limit as the manifest before parsing. Thread requested paths through status/recovery before current-file reads; union with active-plan paths again for scan/verification/evidence. Missing evidence stays unavailable, not healthy. Requests covering required internal state/passport fail before opening them; the disclosed internal-metadata boundary remains separate.
- Preserve default command behavior and all completed schemas. Installed stages carry known exclusions to each read, including final report; omission does not imply persistent retention.

## Risks / Trade-offs

- [A forgotten reader bypasses the limit] → test pending recovery, structural verification, report evidence and both project-local MCP surfaces.
- [A fresh request weakens pending constraints] → use union, including explicit empty arrays, without mutating saved state.
- [Literal JSON is shell-sensitive] → agents pass a literal quoted argv value; no shell code or extra user questionnaire.

## Migration Plan

No migration. Existing invocations remain supported. Updated skill guidance supplies the optional argument when constraints exist; published 1.5.2 and historical observations stay unchanged.
