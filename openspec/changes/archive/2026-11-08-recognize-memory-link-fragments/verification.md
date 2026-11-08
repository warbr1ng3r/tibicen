# Memory fragment verification

## Reproduction and correction

On 8 November 2026, the actual read-only verifier accepted a canonical `docs/decisions.md` link and rejected the same destination with `#accepted` as `missing-memory-connection`. The new regression failed on that exact destination before the correction. The shared matcher now accepts `#` after the exact file path; its other prefix and suffix guards are unchanged.

The complete focused memory file passed **48/48**, with no failures or skips, in 6.782 seconds. The regression covers a plain link, a named fragment and an empty fragment; backup, prefixed, absolute, external and query-only destinations remain disconnected. Every read compares the complete fixture bytes and modes, and the isolated home remains empty.

Independent Ponytail review returned **Ship**, with no findings. It traced the verifier, supported instruction discovery and safe reads, and bound the actual red/green logs. No new live agent observation followed.

## Integrated checks

After the separate read-scope correction, the full repository gate passed lint, configured formatting, types, site build, strict specs, distribution build and **1067 tests / one existing skip / zero failures**. Node tests took 74.996 seconds. An earlier draft's gate retained one offline protocol launch error; that same test passed separately, but the original cause is unknown and its failure remains recorded.

One copied-distribution check passed for both skills: **12 actual CLI reads and four copied core API calls** in 1.641 seconds. Exact synthetic plans were checked before approval and applied using explicit isolated homes. Both memory-fragment connections passed; per-read exclusions still worked after finalization. Protected files and the read-only project/home/runtime snapshots stayed unchanged, all 110 payload hashes matched, and the owned fixture was removed.

These are offline synthetic engineering checks. Published 1.5.2, schemas and write permissions are unchanged; no new native-agent loading, useful-task, memory-use or release observation is claimed.
