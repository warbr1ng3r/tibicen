# Proposal

## Why

The local MCP diagnostic currently chooses readers from four harness IDs, so an
uncatalogued host cannot inspect a known configuration contract. ZCode, Kimi Code
and Mistral Vibe have concrete native formats that the owner needs covered.

## What Changes

- Select a bounded MCP reader through an explicit format independently of the
  descriptive harness ID, while preserving the existing default requests.
- Accept redacted, source-hash-bound stdio observations for any other declarative
  or code-defined configuration, labeled caller observations rather than parsed
  validity. A native parser or catalog entry is not a prerequisite for diagnosis.
- Add read-only ZCode native/shared JSON, current Kimi Code JSON and a documented
  bounded Mistral Vibe TOML subset, with native disable/target limits preserved.
- Keep format selection, native activation, model/provider identity, connection
  evidence and existing write authority separate in output and both workflows.
- Publish one concise EN/RU contract matrix and exercise the distributed CLI
  outside the checkout, followed by independent Ponytail review.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `verification-and-delivery`: explicit format-based MCP diagnosis for unknown
  hosts and additional native read-only contracts with bounded parsing.

## Impact

MCP diagnosis and focused tests, installed MCP guidance, paired project guides,
contained distribution pins and the development tracker. Existing source/secret
inspection, exact consent, writers, runtime dependencies and published 1.3.0
remain unchanged. No personal configuration reads, native launches, paid API,
version bump, commit, push or publication is part of this packet.
