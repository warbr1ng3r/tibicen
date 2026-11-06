# Tibicen 1.5.0 release report

**Published at `2026-11-06T22:43:22Z` (7 November 2026, Moscow).**
[Release 1.5.0](https://github.com/warbr1ng3r/tibicen/releases/tag/v1.5.0), ID
`437135839`, passed source CI, all six platform cells, exact public full-SHA
delivery and returned-asset comparison. Candidate-02 and three scoped fresh
observations were accepted. Separate Pages metadata deployment and official-artifact
comparison passed for all 20 returned bodies.

## Scope and authorization

1.5.0 is a compatible minor release: optional caller-selected instruction evidence,
remembered-fact source comparisons and supplied version-impact assessments in the
existing read-only report, plus clearer EN/RU landing illustration labels. See the
[context-review guide](../../../PROJECT_CONTEXT_REVIEW.md) and
[implemented change](../../../../openspec/changes/explain-project-context-changes/tasks.md).
Persisted schemas, exact-plan approval, write boundaries and the one selected
memory store remain unchanged. Existing reports without the optional inputs keep
their previous shape. No project migration or automatic update is introduced.

The owner replied “Поехали” on 7 November to the concrete plan: prepare 1.5.0,
observe the new guidance in fresh agent sessions, check installation/update/
recovery/removal, then commit, push, pass public CI, publish and update Pages.
That explicit release authorization remains valid within this scope and its gates;
routine steps need no new approval. It does not authorize paid API charges,
credential changes or unrelated project modifications. The
release effort (`../../../../.scratch/release-1.5/map.md`; private development record; excluded from public source) owns finite work;
its dashboard (`../../../../.scratch/release-1.5/dashboard.md`; private development record; excluded from public source) owns current status.

## Frozen candidate and actual gates

`1.5.0-candidate-02` was frozen at `2026-11-06T22:07:35.621566Z`
(7 November Moscow), from a working tree based on local commit
`c7acb17afb6272909eef0b36e3b8e8d92cec5a03`: 1,460 source files,
55 files per skill, 110 payloads and 111 archive files. Its independent review
rehashed all source/distribution sizes, modes and bytes against the inventories.
This local source identity is not a public source commit.

| Identity | SHA-256 |
| --- | --- |
| Candidate-02 receipt | `cdd59fa30082cd31973e6a287198846799b5da055b45a9b60c3ca6d1f013845f` |
| Source inventory | `9cab5452c84744fcf621b9492a28ba269f703d8ef1c8d116bf26e263bbd8df63` |
| Distribution files/modes inventory | `3a33a05f7fea4274a198eaf345c96c3ae650cf61a768aac42fcdf6ba8b54381f` |
| Distribution SHA256SUMS | `58632f3a3505257768be7fd3219fd67357fccd1abc9d81efface633ce559587c` |
| `tibicen-1.5.0.tar.gz`, 277,991 bytes | `f6d5aa6f8dda0aef5f51ded9e711f534490d27ebdc289505fed73eef18fc2b46` |

| Item | Actual status |
| --- | --- |
| Version/tag | 1.5.0 published; verified annotated `v1.5.0` points to exact distribution |
| Frozen-lock install, versioned gate and build | Passed; gate-02: 1035 passed, zero failed, one existing manual portable skip |
| Exact built standalone checks | 3/3 passed separately |
| Browser layout | 15/15 passed |
| Late landing-only overlay | Site 59/59 and first-use/copy browser checks 6/6; distribution byte-identical |
| Independent candidate code review | Ship, no open P1/P2; behavioral/public acceptance remains separate |
| Local delivery D01 | Passed: four installer calls, two installed self-tests, complete edited-backup restoration/removal and preservation; independent Ship |
| Fresh B1 / B2 / B3 | Passed deterministic and independent semantic review; root accepted all three; B3 ordinary-command failure retained |
| Distribution branch | `0706d7caf6a93b79a117379c1cd5f8cd95effb04`; all 111 public blob bytes/modes matched candidate-02 |
| Curated public source commit, CI and six platform cells | Source `1d0f8a0e65ee966cb3fbddef1bc0c128ed54d441`; [CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42305982054) and [all six cells](https://github.com/warbr1ng3r/tibicen/actions/runs/42306168341) passed first attempts |
| Public full-SHA installation/update and preservation | P01 passed: four installer calls/two self-tests, full edited-backup restoration/removal and preservation; independent Ship |
| Release publication and returned-asset comparison | [Publication](https://github.com/warbr1ng3r/tibicen/actions/runs/42306803755) passed first attempt; all three returned assets and 111 archive files/modes match; root accepted bytes |
| Separate Pages deployment and returned-body comparison | [Metadata CI](https://github.com/warbr1ng3r/tibicen/actions/runs/42308227689), [Pages](https://github.com/warbr1ng3r/tibicen/actions/runs/42308799044) and [20-body audit](https://github.com/warbr1ng3r/tibicen/actions/runs/42309686805) passed |

The separate late landing overlay retains the three footer links and uses the
Russian first-use labels “Как это работает”, “Настроить с нуля” and “Навести
порядок”. Its focused checks are separate from the frozen candidate source gate;
it changes no skill-distribution bytes. Public source `1d0f8a0…` retains that
separate binding; its 62 projected files matched reviewed bytes/modes without
pushing private root history.

## Fresh guidance observations

The prospectively frozen packet allows three sequential fresh sessions, at most
150 seconds each/450 seconds total, with no automatic retry or model fallback.
The requested route is Codex CLI 0.157.0 / `gpt-6-astra`, using the existing
ChatGPT subscription and owned container/code-mode bridge. Paid API budget is
zero. Actual backend model build, HTTP and auth-recovery request counts remain
unverified; provider request/stream retry settings are zero.

| Case | Actual result |
| --- | --- |
| B1 — caller-selected instructions | Accepted. Full staged skill/reference read, real scan and hash-bound report for `RULES.md`; preserves unknown `team-agent` status and unverified native loading/use. 58.394 seconds native / 62.191 whole. |
| B2 — remembered-fact source | Accepted. Real earlier scan supplies the baseline; package-version edit yields changed/review while the unchanged Node requirement remains valid. Unbound token policy receives no invented history. 65.547 seconds native / 67.761 whole. |
| B3 — version-impact explanation | Accepted. Read frozen official Node 22.18.0 type-stripping guidance and current local decision; kept direct Node ≥22.20 with erasable annotations, no extra runner or upgrade. Supplied-source/semantic assessment and local byte comparison remain distinct. 79.383 seconds native / 81.552 whole. |

All three allowed host-session slots are consumed, with no extra session or
model retry. B1/B2 each preserved 59 returned files; B3 preserved 60. All modes
and cleanup/source/config/code-mode checks passed. B3 had 12 of 13 ordinary
commands exit zero: missing `shasum` exited 127, then `sha256sum` succeeded in the
same session before the real report. This is not an all-command clean pass. The
prompt explicitly required full staged-skill reading and constrained real CLI
capture forms. Fixtures are synthetic, B2 history is deliberately retained
fixture history, and B3 receives a frozen official source rather than browsing.
These are assisted observations of one requested route, not ordinary installation,
implicit loading, all-harness coverage, a reliability rate or a human-benefit study.

## Delivery, retained failures and receipts

Local D01 replaced frozen published 1.4.1 with candidate-02 using the pinned
universal installer, repeated the installation, restored the complete edited
backups into actual installed paths, then removed those restored skills. Both
installed 1.5.0 self-tests passed. Exact payloads, application/later owner memory,
sibling skills, external settings and original inputs were preserved. Trusted
installer reads had ambient capability; writes were owned-only. The network hook
was not an OS firewall. No application lifecycle/tests were rerun by D01, and
local-path delivery does not prove public full-SHA delivery.

- Candidate-01's gate remains 1034 passed, one failed and one existing skip. Its
  obsolete maintenance-footer href assertion was removed while the exact
  maintenance-byte check remained. Candidate-02 passed; distribution bytes,
  modes and archive hash were identical between candidates.
- Before any native freeze/launch, review found the grader accepted forged JSON
  with CLI-looking comments. Finite direct-command/input checks and genuine B2
  baseline binding fixed it. Independent controls passed six positive and
  24 negative cases. Original findings and controls remain recorded.
- Model-free preparation P01 failed on missing `readdir` import before the packet
  freeze; corrected preparation retained the partial runtime/earlier scan. It
  consumed no native slot.
- B3 event 20 retained the missing `shasum`/exit 127; event 27 successfully
  recomputed the supplied-source checksum with `sha256sum` before report event 29.
  The frozen runner distinguishes valid ordinary nonzero command results from
  native/tool/RPC transport faults. Generic plan wording “tool failure” could be
  read more broadly; that ambiguity is disclosed, not silently amended. The
  unchanged grader, independent reviewer and root accepted this exact scoped
  result. No extra model attempt or changed grading occurred.

Private receipts are under `.evals-private/release-1.5-20261107/`:
`candidate-02/receipt.json`, `candidate-transition.json`, `checks/*`,
`behavior/B1-*`, `behavior/B2-*`, `behavior/B3-*`, per-case protocols and
review/acceptance records.
Candidate review SHA-256 is
`238980eeb99afeacabb30fdbb4ae286d5626edd598fcb49ede3d32794125d37d`.
D01 receipt SHA-256 is
`7f9695c8a520225a9f5575155ce12453cd6ea8cbb62790b3bb61b4d2c9dacecf`;
its independent review is
`2ae7772d19df717b5afb0b3033c294a0c42f4924e38379119c936a28e4346cf3`.
B3 independent review SHA-256 is
`30edc827a89833f7143476ccb73b741b8cb82bdd3374ec6ff07eb933e947b173`;
root acceptance is
`d11ba8119ca98c176e5a0fc93c8479be93c6414e77f7885657be353c44a05e6a`.
No public acceptance follows from prepared operational drafts.

## Public delivery and returned assets

Public source `1d0f8a0e65ee966cb3fbddef1bc0c128ed54d441` binds distribution
`0706d7caf6a93b79a117379c1cd5f8cd95effb04`. Verified annotated tag object
`fb43c8969cc1d384dc6204b1faa68d992ae09323` resolves to that distribution.
The platform run passed macOS 15, Ubuntu 24.04 and Windows 2022 with Node
22.20.0/24.15.0 in all six cells. This is portable package/runtime coverage,
not project-command support or every host/model combination.

P01 separately installed public 1.4.1, replaced it from actual full-SHA 1.5.0,
repeated, restored complete edited backups into actual installed directories and
removed them. Four installer calls/two installed self-tests passed in 10.669
seconds; old 100/new 110 payload bytes/modes, exact fetch/checkout/lock refs,
project/later memory/sibling/settings and original inputs matched. Independent
review: Ship. Trusted Git children had ordinary OS capabilities, without child
network/OS sandboxing. `skills update`, lock-byte stability, application lifecycle/
tests and native loading were not checked by P01.

| Returned asset | Bytes | SHA-256 |
| --- | ---: | --- |
| [tibicen-1.5.0.tar.gz](https://github.com/warbr1ng3r/tibicen/releases/download/v1.5.0/tibicen-1.5.0.tar.gz) | 277991 | `f6d5aa6f8dda0aef5f51ded9e711f534490d27ebdc289505fed73eef18fc2b46` |
| [distribution-SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.5.0/distribution-SHA256SUMS) | 11559 | `58632f3a3505257768be7fd3219fd67357fccd1abc9d81efface633ce559587c` |
| [SHA256SUMS](https://github.com/warbr1ng3r/tibicen/releases/download/v1.5.0/SHA256SUMS) | 177 | `2b854e4ae31622ec55a20879489bc62b93ed69c261861973f23be65da0efa920` |

Root accepted all returned assets, 111 archive files/modes and tag binding.
Published 1.4.1 stable metadata, assets and tag were unchanged; mutable download
counters were explicitly ignored. Public P01 review SHA-256:
`9c667f8edefca3c1100cfa08e90392b1ec1f85372227ea6f2e8358cb410aea6d`.
Root returned-release acceptance SHA-256:
`30069b33ff85c2b1130a7e69d547bb78e292e0a76ebe3e1dbb82097d351592e6`.
Independent returned-asset review: Ship, no open P1/P2; review SHA-256:
`6b1e00ee99b17475d272bb119aa891dcb12ac3eb2d3c7f8b50398bf6ad243a77`. The tag is unsigned and GitHub reports
`immutable: false`: observed preservation is not signing or server-enforced
immutability. The separate Pages observations below have their own source,
deployment and body bindings.

## Pages deployment and returned bytes

Metadata source `49b41f02fd2cbe8a8fadf2b23cafade97f99739f` passed
[CI 42308227689](https://github.com/warbr1ng3r/tibicen/actions/runs/42308227689) and
[Pages 42308799044](https://github.com/warbr1ng3r/tibicen/actions/runs/42308799044)
on their first attempts; deployment `7612782384` succeeded. Official artifact
`13547711254` has 20 regular files; its 77,813-byte ZIP SHA-256 is
`f96196dfe296b5d6a0be6843ff47fce09cb0a6ed141085a691f5ab77bfd60664`.
[Audit 42309686805](https://github.com/warbr1ng3r/tibicen/actions/runs/42309686805),
job `128207751601`, used operations source
`b7f7b588096b3d1d75648dc3f859179e150b4bac` and compared all 20 HTTP 200 response
bodies against that exact official artifact without rebuilding. Expected/actual
sizes and hashes matched. All seven earlier maintenance objects/warnings were
preserved alongside the exact eighth 1.5.0 record. Returned index SHA-256:
`bdb1b864823f51870d369a4dd9cce5dd4e14677a96061ad294e08aadaf10b789`.

Root retained the full 10,905-byte structured summary, reconstructed from five
public annotation parts and their manifest; SHA-256:
`82df71290ac5eaf0f55167c81d5edbf7ab19664ff8828c1ffa964a6f2b524ce5`.
It includes all 20 comparison rows. Raw artifact ZIP/body downloads and the
full body bundle remain in Actions, not a locally downloaded audit bundle.
Separate H01 retains seven actual direct bodies locally: four EN/RU home/preset
HTML pages, both notices and the maintenance index. Its independent review:
Ship. New labels, three-link footers, exact pins and retained notices passed;
all seven H01 sizes/hashes also match the corresponding full-audit rows.
Independent final audit review: Ship, no open P1/P2; SHA-256
`1da32cb885e3d185720bdef49b3a4094fa898ce1f4eb402553da5d6ef59c0e21`.
Root accepted the Pages closure; acceptance SHA-256
`ec4994e0d2f1b847a14c0e4b50b59963ccc8676e30f5077f98618fca8121abc3`.

The first audit MCP push had a transport send failure; the observed branch stayed
at `f9a84bcd841b316d11bfd35542e6d97c78bb390b` and no new audit run was observed.
The retained `publication/audit-push-attempt-01.json` records that limit. A later
controlled send produced `b7f7b5…` and the successful audit. This was neither a
failed audit workflow nor a model retry. No second deployment is needed for the
following documentation-only closeout.

## Earlier evidence and remaining limits

The [pre-version verification](../../../../openspec/changes/explain-project-context-changes/verification.md)
retains its own 1035-test gate, standalone, CLI and layout observations; it is not
a second versioned/native/public run. Published
[1.4.1](../2026-11-06-release-1.4.1/README.md) tags, assets, checksums and earlier
native results remain unchanged. Follow [installation](../../../INSTALLATION.md)
and [release procedure](../../../RELEASING.md) for replacement and recovery.

File/hash comparisons do not establish fact truth, supplied historical baseline
origin, installed versions, compatibility or actual native loading/use. Supplied
upstream assessments remain caller-supplied; the report fetches no upstream
content and installs nothing. Broad harness/model compatibility, MCP connection
and measured human usefulness remain unverified. Pages success is established by its separate deployment/body observations, not
by release publication. These checks establish no model/native/application
behavior or measured human usefulness.
