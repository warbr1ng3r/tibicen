# Release1.2 dashboard

5 November2026(Moscow). Preparing local1.2.0candidate; not published.

| Lane | Owner | Status |
| --- | --- | --- |
| [Requirement/evidence audit](issues/01-audit.md) | /root/release12_audit | Claimed |
| [Changed-behavior acceptance](issues/02-acceptance.md) | /root/release12_acceptance | Claimed |
| [Candidate/publication](issues/03-release.md) | /root | Claimed |

Target1.2.0; existing1.1.0 remains published and immutable. GitHub MCP/systemDNS/browser unavailable; per-request freshDNS with normal
SSHkey/TLSchecks restores SSH and anonymous REST. No new credential or
paid API scope. The latest reviewed packet had801/801 offline tests at1.1.0;
that is not yet version1.2candidate acceptance. Implementation commit300ef76
exists locally. Cached controlledCodexmetadata passed; two new observations
are prepared but unconsumed.
