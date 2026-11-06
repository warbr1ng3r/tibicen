# Verification

Completed locally on 6 November 2026. No commit, push, version change or release.

- Focused red captured before runtime edits; actual owner-socket red accepted a
  process, observed exit1 without denial, stopped as tool-failure and verified
  cleanup. Its top-level wait field is null; unchanged raw frames and matched
  failure context retain the exit evidence.
- Same driver ec37cd6b10daa1cc3d5232f826c1ce578ec96041b66e08026d52518a698c5afb
  passed green: exit1, a second accepted process, exit0 and exact recovery-ok.
  Each label used one pinned network-none container with a 30-second lifetime;
  no model, credentials, host mounts or original project writes.
- Only session.ts changed among 20 runtime files between controls. Its reviewed
  SHA256 is dcb0177db6dda7aacb22d82a59617581ea8628f646eb736bbe0634b7d948e14a.
- Focused 73/73; full pnpm test: 981 passed, zero failed, one existing manual
  standalone skip. Strict active/spec and archived validation passed again after
  documentation-only specification reconciliation; runtime/test hashes unchanged.
- Independent Ponytail engineering, actual evidence and final integration: Ship.
- All 74 earlier native artifacts and all 100 distributed payload bytes/modes
  plus published 1.4.1 manifest remain unchanged. The previous five reviewed
  source/test bytes are archived separately against their original hashes.
- Both changes are synced into main evaluation-results in order. The earlier
  correlation delta describes its historical source freeze; do not reapply its
  ADDED blocks over the newer MODIFIED requirements during a later archive.

The [report](../../../docs/evals/results/2026-11-06-native-memory-followup/README.md)
retains failed M1 and stopped M2/M3. No unknown argv, missing collection,
native memory use or human usefulness is upgraded. The synthetic regression
establishes ordinary command recovery only.
