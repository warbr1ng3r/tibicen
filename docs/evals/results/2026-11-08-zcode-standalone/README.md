# ZCode standalone observations — 8 November 2026

**Closed: the installed CLI started once, but no model request or Tibicen working cycle was observed.** Two separately approved account-readiness launchers stopped at different boundaries.

Desktop 3.14.4 bundles the unchanged CLI 0.16.9. The supported standalone entry is separate from the older SDK host; GUI is not the only route.

## Observations

| Separate stage | Actual result | Allowance |
| --- | --- | --- |
| Original system DNS | Timeout without output; cause unknown | One call, 3s deadline |
| Node startup control | Passed, 62.658ms | One call, 3s deadline |
| Public DNS-over-HTTPS metadata | Two global IPv4 addresses, 356.677ms | One call, 8s outer deadline |
| Offline isolation checks | 3/3 passed, 243.673ms; fixture removed | Three calls, 3s each / 15s whole |
| Installed offline help | Exit 0, 653.298ms; 3,334 stdout bytes, empty stderr; fixture removed | One call, 8s child deadline |
| Literal-IP policy launcher | Compiler exit 65 before Node, 373.475ms whole | One call, 55s child / 60s whole |
| Separate HTTPS policy control | Passed, 79.178ms command / 264.414ms whole; 14 baseline entries preserved | One auth-free, network-free control |
| Standalone readiness under that policy | Exit 1, 839.200ms command / 1,067.948ms whole; 1,521 stdout / 77 stderr bytes | One call, 55s child / 60s whole |

No caller retries occurred. The first launcher rejected a literal remote-IP rule during policy compilation: a private preparation defect before Node. The separately reviewed alternative allowed normal vendor HTTPS on port 443; it did not establish host/IP-specific network isolation.

The CLI then reported `turn.failed`, phase `model_creation`, `CONFIGURATION_ERROR`: “Select a model before continuing”. No `turn.started`, model-request summary or tool event was retained. Valid default-model selection and registry fallback are supported; this failure does not prove an ignored default.

## Custody and limits

Two authorized copy operations kept credentials opaque: no agent values, content hashes, parsing or decryption. Both temporary roots were removed. The second cleanup removed 556 entries. Its final inventory had stopped at a 16,001,776-byte bundled cache library exceeding the evaluator’s 8MiB cap: later checks were unreached, not evidence of changed data. Full final preservation is unverified; original credential-file metadata independently matched.

A separate presence-only read found the coding-plan namespace but lacked the required identity record. This excludes that default-store account candidate under the installed gate; it does not prove Desktop logout, invalid subscription or the sole runtime cause. No values, identifiers, credential hashes or decrypted material were retained.

Authentication, entitlement, billing and model response remain unverified. No login, personal-settings repair, API fallback, product fix or version change followed. Published [1.5.2](../2026-11-08-release-1.5.2/README.md), [earlier workflow accounting](../2026-11-08-normal-workflows/README.md) and old failures remain unchanged. These observations add no Tibicen, tool-task or memory coverage. [summary.json](summary.json) records separate counts, caps and evidence.
