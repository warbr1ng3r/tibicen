# Stabilize pinned image identity

## Why

A separately reviewed contained-run attempt stopped because Docker returned a different inspect envelope for the same pinned image. Captured responses have identical image ID, platform, full configuration and ordered filesystem layers; auxiliary `GraphDriver`, `Descriptor` and `Identity` fields differ. Hashing the entire response adds an API-envelope condition unrelated to the pinned execution image.

## What Changes

Fingerprint a fixed, versioned projection of the immutable execution identity with deterministic object keys and ordered arrays. Reject missing identity fields and retain all existing pinned-image and isolation checks. Preserve the stopped observation and require a new reviewed freeze before further live work.

## Capabilities

### Modified Capabilities

- `contained-codex-profile`: stable image identity across equivalent inspect envelopes.

## Impact

Evaluation metadata profile, offline tests and evidence records only. No new executor route, distributed payload, authentication, dependency, commit or publication is included.
