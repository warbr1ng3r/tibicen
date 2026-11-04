# Project-memory candidate checks — 4 November 2026

**Historical local checks; 1.1.0 subsequently published.** See the [publication follow-up](#publication-follow-up). This record covers optional project memory,
two controlled Codex flows and mechanical delivery. Published 1.0.0 remains
unchanged. It does not measure human usefulness or establish every agent's native
loading behavior. See the [memory guide](../../../PROJECT_MEMORY.md),
work dashboard (`../../../../.scratch/project-memory/dashboard.md`; private development record; excluded from public source) and
release packet (`../../../../.scratch/project-memory/release-draft.md`; private development record; excluded from public source).

## Candidate binding

| Binding                                          | Value                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| Local source base; uncommitted changes follow it | `f76f185214e560084baeac57cfe614fe58f9e49c`                         |
| Product build-input inventory SHA256             | `dda94fb5b4d6ed45ea3faea954d77f5832e87a5b6d93649308fb69c514992fa5` |
| Distribution inventory SHA256                    | `7e69ef226fdcd282c40060efc02f30cd7d672a7da520745715d81e6756e63395` |
| SHA256SUMS file SHA256                           | `bf6d76cfddf7c41f071bb1f9c9f3633ab69070aeac38cd0fc246b583ad33ec0f` |
| Archive SHA256                                   | `e285fbac490f586c277e7b037a9f193197e2a8ae1b84aeb196f8a85d465339ee` |
| Payload / regular archive files                  | 90 / 91, including SHA256SUMS                                      |

The source inventory covers `package.json`, `LICENSE`, and product build inputs
under `scripts/`, `references/` and `skills/`, excluding development
`scripts/evals/`. Documentation, evaluation tooling, tracking and the landing
page are outside that inventory. This is not a whole-repository commit binding.
Private receipts retain inventories, exact inputs, events, approvals and failures;
credentials and raw local paths are not published here.

## Integration and independent review

The final source gate passed **767 tests, zero failures and one intentional skip**,
including lint, formatting, types, site build and strict OpenSpec validation. This
gate ran before the metadata-only version bump; the subsequent pinned 1.1.0 build
passed. Four unpacked, outside-checkout skill self-tests passed on local Node
24.15.0 and 22.23.4 without Git in PATH.

Failures are retained: the first gate had four failures from old bundle counts
and incomplete mechanical-fixture passports; those fixtures/counts were corrected
without weakening production validation. An earlier type error was fixed.
Independent Ponytail review also found a FIFO manifest read that could block a
scan. The reader now uses the existing bounded regular-file reader; FIFO,
directory, oversized and malformed-file regressions passed. The runtime/rules
reviewer rechecked the fix and returned **Ship**. A final targeted Ponytail
review also accepted the bundle-count/fixture corrections, nullable test guard
and unused CSS cleanup, with no actionable findings.

The separately approved [landing batch L1–L6](../../../../openspec/changes/archive/2026-11-05-clarify-landing-first-use/verification.md)
passed 41 site checks and 86 browser checks with one existing skip, plus independent
Ponytail review. It keeps the published 1.0 installation pin and is not deployed.

## What happened in the fresh sessions

Four primary contexts were consumed, with no retries or reserve contexts. The
separate protocol allowed at most six contexts; the actual route used one turn,
180 seconds maximum per context and one context at a time. No paid API, auth
changes or real-project edits were used. Native CLI 0.157.0 requested
`gpt-6-astra` through the existing Codex subscription; the server model build is
unknown. The controlled Linux arm64 image was pinned to
`sha256:ba23f5c65d7d77b8aaac15fb53cdda90ecd25acff2738fd6d40fc762519dc6bd`.

| Context                          | Observed action and result                                                                                                                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| P01: initial setup               | Read the staged init skill and its memory guidance; proposed `AGENTS.md` and `.agents/memory.md`, retaining integer kopecks/RUB and read/update/correction rules. No files were changed by the native setup session.           |
| P02: separate working session    | Given an ordinary formatting task without a memory filename hint, explicitly read the memory body before choosing RUB, implemented formatting, retained the accepted zero-as-«Бесплатно» decision, and preserved `orderCount`. |
| P03: existing notes              | Read existing instructions and `MEMORY.md`; proposed replacing the USD rule with RUB and adding maintenance guidance while preserving Review/CSV notes and existing instructions. No native setup writes.                      |
| P04: separate correction session | Explicitly read the current memory before changing the USD implementation, used integer kopecks/RUB, replaced the old numeric-zero decision with «Бесплатно», and preserved the unrelated Review/CSV sections byte-for-byte.   |

**Setup assistance:** root compiled and reviewed the displayed changes on separate
owned fixtures, approved the actual concrete digests and applied them through the
frozen candidate CLI. Those digests were
`1b943368eee87bcc89d57cade319a77c55b09cc759b3cdcdedecd5717ad49f24`
(initial setup) and
`984b5d3bddfc0ccdf1550e8513dfc1bc33a7e9e8966b92220b320a0e23022f48`
(existing notes). Both lifecycle flows completed and structural verification
passed. This was assisted setup, not autonomous agent consent.

P01 entered through the init skill but selected engine mode `improve` because the
staged skill was existing infrastructure. Its last native proposal command had
empty recorded stdout, so its claimed native digest remains unverified. P03's
recorded native proposal and digest were internally verified, but were not the
root-approved/applied plan. Neither native digest was substituted for approval.
Mechanical core tests cover engine `init` separately.

Both fresh sessions issued `node --test` after their file-change events; native
output reported one test-file pass each. That output alone does not prove the
number of individual final tests. Independent checks of the returned final bytes
passed: **P02 4/4 application tests; P04 3/3; seven frozen held-out assertions
each**. Each ran in a separate network-disabled container without host mounts,
as a non-root user, with a 60-second limit. Inputs remained unchanged and the
containers were stopped and removed. First-party verification, status and report
passed on separate copies: updated memory bodies were accepted, stable instructions
and manifest remained unchanged.

Transport returned exactly the allowed three changed files per task, with no
protected-byte changes or added/missing paths. Original host fixtures remained
unchanged; temporary HOME directories and owned containers were removed. Transport
modes were normalized to 0644. Host verification copies preserve original setup
modes, including 0600 managed files; these are different checks.

## Delivery, migration and recovery

Cached `skills@1.7.4` local-source installation/update/backup restoration/removal
passed for synthetic Codex, Claude Code and Cursor homes: 12 initial installer
calls and 24 standalone version/resource checks. The registered-memory supplement
below adds three installer calls: **15 total**. All 91 archive files matched the unpacked
bytes and modes. Local-source update's explicit skip is retained. This does not
prove public Git installation or native memory behavior in the other agents.

A separate registered-memory fixture was interrupted after the first approved
write through a first-party checkpoint (hard exit 73). Real CLI resume refused a
changed pending memory file with `tamper-suspect` and no writes. After restoring
the exact pending bytes/modes and explicit root reapproval of the same digest,
real CLI resume completed: recovery schema 4 was removed, manifest schema 3 was
complete, prior session history and 49 protected files remained unchanged.
Appending a later note still passed structural verification. A further local
Codex install → update → remove cycle preserved the whole registered project,
including memory, later note and manifest/history, byte-for-byte and mode-for-mode.

Actual published 1.0 readers refused memory-aware proposal 2, manifest 3 and
pending-state 4 before writes. Existing non-memory formats remain available;
memory-enabled projects require a compatible runtime. This controlled injected
interruption is a recovery observation, not a spontaneous failure or application
task execution.

## Independent behavior acceptance

Verdict: **Ship for the candidate-bound local memory flows**. The independent
reviewer checked all four actual outcomes, approved setup bindings, memory reads
before decisions, final-byte test receipts, unrelated-note preservation, cleanup
and first-party verification. Setup assistance and unverified startup loading are
part of the accepted scope. The [summary](summary.json) binds candidate identities,
context outcomes, final-byte checks and the independent review by SHA256.
No further native contexts were required.

## Boundary at the local acceptance checkpoint

Public CI, the existing six OS/Node cells, public Git delivery, immutable tag and
returned release bytes remain for a separately authorized release. Local Node
22.23.4 checks do not substitute for the workflow's Node 22.20 cells. There is no
new 1.1 tag, release, push or Pages deployment. Human usefulness and broad native
agent compatibility remain unmeasured.

## Publication follow-up

Published at **2026-11-04T21:02:42Z** (5 November in Moscow):
[1.1.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.1.0).
Source `3166be50a1a3979e600ea08b65694c9255dcb89a`; distribution
`7bbd953a020ac4ac4c7dfb99efa59f6e4b195026`; annotated tag
`cb9ffdddd20cee84d0b15685ec92fd5c2b8e6ec3` peels to that distribution.

- [Automatic CI](https://github.com/warbr1ng3r/tibicen/actions/runs/41911531361): success on the exact source.
- [Platform workflow](https://github.com/warbr1ng3r/tibicen/actions/runs/41911587517): all six macOS/Ubuntu/Windows × Node 22.20.0/24.15.0 cells passed.
- Public full-SHA installation, 1.0 → 1.1 replacement, pinned update, edited backup restoration and removal passed for Codex, Claude Code and Cursor: 12 installer commands and 24 standalone version/resource checks. All three 52-file registered projects and later notes were preserved byte-for-byte and mode-for-mode. Six retained internal Git clone-by-SHA failures used the installer's existing exact-fetch fallback; there were no manual retries.
- Three actual public asset downloads returned HTTP 200 and matched every expected byte, size and SHA256. The archive's 91 regular files/90 payloads matched the accepted candidate, including modes. Outer/payload manifests verified.
- The 1.0 release body, stable metadata, asset IDs/digests and annotated tag remained unchanged. GitHub reports release `immutable: false`; observed bindings and the project's no-replacement policy do not claim server-enforced immutability.

The acceptance sections above retain their original local scope and assistance.
Pages is a separate deployment from source
`7c1146d5aa0eea7a82087deb75210cf68ad8d2fa`; returned-byte checks are recorded
in the following completed record. No new native contexts or paid API requests were used.

### Pages verification

[Deployment run 41912950614](https://github.com/warbr1ng3r/tibicen/actions/runs/41912950614)
succeeded on source `7c1146d5aa0eea7a82087deb75210cf68ad8d2fa`;
GitHub deployment `7557893579`, status `21377891482`, was successful.
The exact official `github-pages` artifact (ID `13364380482`, SHA256
`ae83b698805311ea076b34677bd4dcef3e126d9956ca28736c4a8808f21e00d9`)
was downloaded through the authenticated UI. All **18 actual HTTP 200 bodies**
matched that artifact byte-for-byte, including English/Russian pages, assets,
licenses and the index. Index SHA256:
`585a154277569a155d82fe0ec1ba294d5c9ffddd81550a66cd91ea5bf2a73173`.
The historical version/warning objects remained unchanged; the real 1.1 record
matches the published date, source, distribution and asset hashes.

The attempted independent local build was unavailable: synthetic offline pnpm
metadata and automatic dependency checks prevented a complete baseline. Those
failures were retained; policies were not disabled, processes were stopped and
all 709 source files remained unchanged. The successful official build artifact,
its API/deployment binding and direct HTTP comparison provide the final baseline.
An initial verifier assumption about external-only scripts was corrected to check
Astro's inline scripts too, with positive/negative self-checks before the GET pass.
This does not establish physical accessibility, conversion or human usefulness.
