# Maintenance source review — 3 November 2026

Ticket 141 exercised the [maintenance procedure](../../../MAINTENANCE.md): read current primary sources, compare their scope with the pinned repository contracts, inspect reporting options and run bounded local CLI metadata checks. This is documentation/metadata evidence, not a model run or accepted current-candidate loading/use. The confirmed maintainer remains [@warbr1ng3r](https://github.com/warbr1ng3r); no recipient was newly appointed. Independent integration review remains root's separate step.

## Sources actually read

All pages below were opened on **2026-11-03**. The first six rows cover all six current `OFFICIAL_SOURCES` entries in `scripts/discovery/practices.ts`. Pages are mutable; no raw HTTP body hash or installed-agent replay is claimed. Former OpenAI/Cursor paths redirected to their official canonical URLs shown here.

| Official source | Material read / direct finding | Recommendation and next check |
| --- | --- | --- |
| [Codex instructions](https://learn.chatgpt.com/docs/agent-configuration/agents-md) | Root-to-working-directory discovery, override precedence and default 32 KiB combined limit | Retain scoped guidance; exact deployed CLI/config/loading still needs its own evidence |
| [Codex skills](https://learn.chatgpt.com/docs/build-skills) | Metadata-first discovery, later body loading, skill-list budget and repository/user locations | Keep descriptions focused; discovery is not positive selected-body loading/use |
| [Claude best practices](https://code.claude.com/docs/en/best-practices) | Concise project knowledge; prose guidance versus harness enforcement; native init/audit alternatives | Assess actual need before adding instructions/tools; no universal compliance or comparative-benefit claim |
| [Claude skills](https://code.claude.com/docs/en/skills) | Skill locations, same-name precedence and local/cloud differences | Check the selected session/version; newer documented behavior does not transfer to the pinned adapter |
| [Cursor rules](https://cursor.com/docs/rules) | `.mdc` rule structure, ignored plain `.md` rules, root/nested AGENTS and precedence | Preserve the format distinction; no Cursor binary or behavior was checked here |
| [Cursor skills](https://cursor.com/docs/skills) | `.agents/skills` / `.cursor/skills`, on-demand resources and local/cloud differences | Retain selected-agent scope; a documented location is not an observed invocation |
| [Claude memory](https://code.claude.com/docs/en/memory) | Native AGENTS requires v2.1.277+ and depends on CLAUDE-file precedence/settings | Evaluate the existing bridge against the actual supported session before any removal; no distributed matrix change |
| [Agent Skills specification](https://agentskills.io/specification) | Required `SKILL.md` frontmatter/name/description and optional resources | Continue format/resource checks; format conformance does not establish agent compatibility |
| [OpenSpec 1.14.3 release](https://github.com/Fission-AI/OpenSpec/releases/tag/v1.14.3) | Release identity and notes covering glob/path safety and validation behavior | Local version agrees; keep package/version effects distinct from process loading/use |
| [skills 1.7.4 release](https://github.com/vercel-labs/skills/releases/tag/v1.7.4) | Upstream release/tag and changelog, not an installer run | Retain the existing pinned installer and prior byte/preservation evidence; no upgrade or installation performed |

Direct `/tree/v1.14.3` and `/tree/v1.7.4` requests were unavailable in the web tool. Their original upstream release pages were accessible and read instead. A release page is not a newly verified package archive or immutable candidate binding.

## Actual local checks and bindings

- `node --version`: **v24.15.0**.
- Installed repository OpenSpec package metadata: **1.14.3**. Its inspected entry/CLI source keeps `--version` and `--help` separate from command actions.
- `node node_modules/@fission-ai/openspec/bin/openspec.js --version`: **1.14.3**, exit 0, 0.074 seconds.
- The same entry with `--help`: exit 0, 0.067 seconds; help lists init, update, validate and archive. These commands were not executed.

Each OpenSpec metadata call ran once, with a five-second timeout, in the owned maintenance lab, a minimal environment without inherited auth variables, telemetry disabled and empty owned XDG/TMP locations. Commands above use repository-relative display notation; the actual invocation passed absolute Node/entry paths from that lab. No package-manager launcher, install, project initializer or update ran. No OS-enforced network-isolation claim is made.

Private receipts and stdout/stderr hashes are in `.evals-private/delegated-acceptance-20261103/maintenance/local-cli-evidence.json`. As-read bindings include `references/agent-matrix.md` SHA256 `52a66900fb47f1f0c4ef3da886c41be1e79299a3f8a303b95f99e05ead5f8889` and `scripts/discovery/practices.ts` SHA256 `93588b8996dee4991f796724e6707ef8d87fa53729e768fca89b267786517b1d`. The matrix's Codex 0.157.0 / Claude 2.1.283 contracts and unverified Cursor version retain their existing scope; no installed agent's version or model behavior was measured here.

## Reporting and advisory options

| Read-only inspection | Observed result / exact remaining input |
| --- | --- |
| [Public repository advisories](https://github.com/warbr1ng3r/tibicen/security/advisories) | The page exposes “Report a vulnerability” and no published advisories. The report form was blocked by robots in the web tool; no report or notification was sent. This does not reverify recipient delivery/preferences |
| [GitHub private reporting](https://docs.github.com/en/code-security/how-tos/report-and-fix-vulnerabilities/configure-vulnerability-reporting/configure-for-a-repository) and [repository advisories](https://docs.github.com/en/code-security/concepts/vulnerability-reporting-and-management/repository-security-advisories) | Documented private vulnerability intake and later advisory publication exist; notification depends on recipient preferences. They do not designate a conduct recipient or independent checksum channel |
| [Code-of-conduct guidance](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-code-of-conduct-to-your-project) and local [conduct policy](../../../../CODE_OF_CONDUCT.md) | An enforcement/reporting procedure needs an actual responsible route. The project's private conduct recipient/address remains undesignated; the security appointment cannot substitute |
| [Immutable releases](https://docs.github.com/en/code-security/concepts/supply-chain-security/immutable-releases) | Locked release tags/assets are an integrity option, not a separately established advisory/checksum channel. A specific independent destination, responsibility and verifiable publication/recovery procedure remain unconfirmed |

## Result and remaining work

The monthly/event review procedure and this first official-source/CLI metadata pass are concrete. No distributed rule, matrix, dependency or runtime recommendation was applied; maintain the existing pins while exact-version compatibility is checked under its own scope. Next source review: **by 2026-12-03**, earlier on a material change.

The private conduct route and independent advisory/checksum channel remain genuine external release inputs. Current-candidate behavioral evidence and exact public delivery remain separate in the [engineering assessment](../../ENGINEERING_ACCEPTANCE.md) and [readiness ledger](../../V1_READINESS.md). No human grade, model/evaluation call, login, setting change, message, commit or publication was produced by this review; it does not declare 1.0 ready.
