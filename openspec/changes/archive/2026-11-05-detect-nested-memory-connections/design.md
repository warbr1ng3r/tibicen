# Design

## Context

See [proposal](proposal.md). Scanner inventory and diagnosis already include nested
native rules. `memoryInstructionPath` has one caller, the read-only connection
loop in verification. `isInfrastructurePath` separately controls proposal writes;
the reproduced nested native-rule edits are rejected as `application-protected`.

## Goals / Non-Goals

Accept the same literal canonical memory pointer in safely observed root/nested
instruction forms. Keep storage, exact pointer syntax, reading limits and all
write permissions unchanged; do not resolve relative-to-rule paths or simulate
native loading/precedence.

## Decisions

Change only the connection predicate's two root-anchored native-rule patterns to
allow their existing directory prefixes. Reuse the verifier's existing guarded
read and pointer matcher. Changing the general write allowlist would expand
permissions unnecessarily; adding a root pointer would hide the false positive
and create redundant instructions.

Add focused real-scan/verify/report regressions using existing memory fixtures,
including forbidden/symlink/unrelated controls and actual rejected nested writes.
Retain historical failing reproduction and validate the changed distribution;
old accepted bytes are not evidence for the fix.

## Risks / Trade-offs

- A nested rule may not apply to the current task → report still labels scope,
  loading and use unverified; this is structural evidence only.
- Broader recognition could accidentally expand edits → do not change the write
  predicate; regress actual proposal refusals and read-only byte preservation.
- A pointer could be interpreted relative to its rule → retain the exact
  project-root-relative matcher and its negative controls.

## Migration Plan

No data migration or schema change. Existing notes and saved sessions remain
unchanged. Keep the correction under Unreleased and validate current build bytes;
version preparation and publication are separate.
