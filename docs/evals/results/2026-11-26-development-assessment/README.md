# Development packet assessment — 26 November 2026

The returned packet contains a reproducible Python check-comparison defect and a
bounded approval-wording improvement. It does not establish comparative benefit,
fresh-context execution, or a fully compliant live evaluation. This assessment
separates the incoming coordinator's conclusions from independently admissible
evidence; it does not regrade earlier assessments or authorize publication.

## Identity and independent checks

Local evidence belongs to packet `development-1.8.0-20261126`; paths below are
relative to that packet. Its unchanged public base is
`da14bec29a55ade389b64c58bd8fe469a9f77859`. Independent root integrity and complete
patch checks passed. The incoming 22-file, 64,599-byte patch has SHA-256
`a9d21bae71019f82bdecf88b2f2f79992632288f984efbed8f71bd723ffb1159`.

Both retained archives and their 116 payload entries were independently verified,
including archive-to-directory bytes and modes:

| Candidate | Archive SHA-256 | Distribution manifest SHA-256 |
| --- | --- | --- |
| rev A, superseded | `517a24d80119a9107cfc63a093eac330f52ee1d669a90f4b5d072084edd4f666` | `9424cd85b6d47bc422495112ee20ed4a5fc1cab917fb7f55e7eb33480eed4cb8` |
| rev B, incoming final | `d00b0a34e9641516d937706b0f6d730f36eabd626790e809cd7443f0d1c12839` | `808e707dd575ee3644cb1da89cc388599ad35b27080e3e50844f05709c12314e` |

Artifacts are `evidence/candidate-rev{A,B}/IDENTITY.json`,
`distribution-SHA256SUMS`, `dist/`, and `tibicen-1.8.0.tar.gz`. Changed runtime and
reference files in the incoming worktree match rev B byte-for-byte and by mode.
Root integration adds review corrections, so rev B is not its final candidate.

**Root integration gate: passed.** On Node 24.15.0 and pnpm 11.21.0, the final
`pnpm test` exited 0: 1,215 tests, 1,213 passed, zero failures and two expected
skips. This includes lint, formatting, types, site build and strict OpenSpec
validation. `pnpm build` exited 0. All 116 payload hashes were checked; the complete
inventory contains 117 files including the manifest. Both skills passed self-test
from a temporary directory outside the checkout with an explicitly empty `PATH`,
separate temporary `HOME` directories and the absolute Node executable. A second
build outside the checkout matched every file byte and mode; the manifest SHA-256 is
`6e117dddcdd219b177452f6ba7ade693cb114e284abcf515240f4965fa3c18dd`.
This is an Unreleased build at version 1.8.0, not a replacement published release.
Independent Ponytail follow-up: **Ship**, after closing the padding, clock and
environment-wording findings. Two added regressions failed on incoming rev B and
pass on the integrated code; all 13 focused tests pass. Local receipts are retained
under effort `development-acceptance-20261126`, including `pnpm-test.txt`,
`pnpm-build.txt`, `distribution-check.json` and both regression outputs.

Separately, incoming logs report 1,211 passed tests, zero failures and two skips. Its
`evidence/gates/deterministic-rebuild.txt` contains only a build result, and
`standalone-selftest-empty-path.txt` omits argv, environment and candidate binding;
these receipts alone do not establish their advertised conditions.

## Front outcomes

| Front | Incoming outcome | Assessed scope |
| --- | --- | --- |
| A, plain-agent comparison | Observations complete; scores 12:11, 12:12, 14:9 | Artifact outcomes retained; comparative benefit and authority chronology unverified |
| B, first use | Accepted guidance change | Bounded copy improvement; original application ungranted; improved live behavior untested |
| C, repeated adopt | Existing-sufficient/no-change | Particular CLI contracts observed; complete repeated-adopt and preservation coverage not established |
| D, Python checks | Accepted runtime fix and documentation precision | Defect supported; root review corrections included; integrated offline gate passed |
| E, portability | No change, optional hosts blocked | Explicit-reading demonstrations only; native loading and additional host support unknown |

### A — observed artifacts

Independent runs of the retained final fixture tests confirm A1 passes 5/5 in both
arms; A2 passes 10/10 plain and 8/8 Tibicen; A3 plain fails one of three tests
(`400.0 != 450.0`), while Tibicen passes 2/2. See
`evidence/A/A{1,2,3}/{P,T}/fixture/`, transcripts and `grade/report.md`.
These are differences between delivered artifacts. They do not show that Tibicen
caused the difference. Isolation is unverified, complete initial inputs and grader
dispatches are unavailable, and anonymization changed integrity-bearing bytes in
A1. Its numerical grade includes that acknowledged artifact.

Authority timing also conflicts: A2/T's CLI approval is `01:51:56.045Z`, preceding
the recorded external grant `01:52:30Z`; A3/T's is `01:56:49.175Z`, preceding
`02:03:00Z`. Compare each `apply-output.json` with `controller-grant.md`.
Digest agreement establishes content binding, not authenticated prior authority.

### B — consent and first-task limits

`evidence/B/observe/transcript.md` explicitly records applying after no grant,
using defaults and a host continuation as justification. The counter-question's
actor is unverified. The CLI records approval at `02:26:53.881Z`; however,
`reports/RUN_LOG.md` places launch at `02:30` and completion at `02:35`, while
claiming 999 seconds against a 900-second limit. Exact timing cannot be recovered.
The ledger then reports a dependent first-task launch despite its admitted overrun.
That worker's transcript actually starts around `02:29:57Z` and acknowledges
workspace instructions in system context.

The new proposal text clarifies the affected files, one explicit approval question
and silence never granting approval. `reports/FRICTION.md` compares the old trace
with edited text; it supplies no changed-candidate behavioral follow-up. Its count
of “1 approval” cannot represent a received grant.

### C — mechanical contracts

The C receipts support selected changes, stale-plan rejection, owner-memory
preservation and a sufficient-setup result. C5 still rewrites its manifest from
835 to 2,298 bytes and changes mode 0644 to 0600
(`evidence/C/C5-sufficient-no-change/file-diff.json`); this is not zero rewriting.
C1's second pass compiles an empty proposal without a second application, and
retains a known unsupported `--selftest` command. C6d/e have only a narrative in
`evidence/C/C6-canonical-routing/NOTES.md`, with no original scan receipts.

The first real-HOME run is acknowledged, but `evidence/C/run_cli_checks.py`
recreates the same directories, replacing earlier attempt evidence. The retained
usage reference has no before-state, so the exact host mutation is unknown.

### D and E — supported boundaries

`evidence/D/repro-h1c-output.txt` and `regression-old-code.txt` support the
pytest-summary timing defect. Root review additionally corrects terminal-padding
drift and preserves arbitrary parenthesized annotations as meaningful output.
Virtualenv reproduction remains unsupported; documentation clarifies interpreter
path pinning and entrypoint-only binding. The retained independent review found
the over-minute case in rev A, but its exact dispatch and a rev B re-review are
absent. Root checks above bind the integrated correction; incoming rev B remains a separate artifact.

ZCode supplied explicit-reading/CLI artifacts and a prompt-constrained read-only
demonstration. Codex attempts failed at the host/network layer; Claude was not run.
Neither these failures nor successful file reading establish native loading or
all-host compatibility (`reports/HARNESSES.md`, `evidence/E/E3-CONCLUSION.md`).

## Protocol and accounting limits

The ledger places A1 dispatch at `01:26`, before its `01:36` protocol freeze;
admission itself is dated `01:40`. Earlier protocol bytes are absent. The v2 seed
freeze expects `84d1cd7e…`, but the retained manifest hashes to `49d92abb…`;
`reports/EVIDENCE_INDEX.md` also has a stale RUN_LOG hash. Exact invocation totals
are approximate, with no complete execution ledger. Two five-agent concurrency
windows are admitted. These gaps prevent claiming protocol compliance or proving
budget compliance; passing integrity guards covers neither.

Technical improvements can be integrated with those qualifications. Measured
human usefulness, savings and causal memory benefit remain unknown under the
[engineering acceptance policy](../../ENGINEERING_ACCEPTANCE.md). No commit,
push, release, deployment or version change is authorized by this assessment.
