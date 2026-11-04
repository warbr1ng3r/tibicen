# Adopt diagnosis verification

**5 November 2026 (Moscow). Implemented locally, Unreleased.** The owner authorized
parallel implementation; no commit, version change or publication was performed.
The base is `2d2628eaab0ae96a102309128155f92758c34fd8` on `main`, plus the
uncommitted research and implementation reviewed here. Published 1.1.0 remains
unchanged. The [guide](../../../../docs/ADOPT_DIAGNOSIS.md) explains the new behavior.

## Result and binding

The existing report adds current, read-only `diagnosis` while retaining saved
session fields and checks. It lists instruction candidates and their directories,
redacted inventory limits, current structural findings and a conservative next
action. Candidate paths do not establish loader precedence or compliance.
Loading/use remain unverified without a separate observation. Adopt instructions
explain starting state, concrete findings, preserved rules, minimum changes or
no change, checks and the next step.

The build-input inventory contains 48 paths with SHA-256 and file modes. Its
compact, sorted-key JSON, without the final newline, has SHA-256
`60024dd309993cae952c2bc7fce40f510abf9148b94594459cef97ad98b5cbce`.
The 92-file distribution inventory uses the same encoding and has SHA-256
`141b359bc89d518961b36d3527df66fb82c7b59d662c7a22b2112511ec7a1972`.
These identify local development inputs/artifacts, not a public release.

Local receipts are retained in `.evals-private/adopt-diagnosis-20261105/`:
`source-inventory.json`, `distribution-inventory.json`, three gate logs,
`build.log`, `standalone.json`, per-skill JSON outputs and
`review-and-attempts.json`. These private files are not distributed; the outcomes
and limits are recorded here for readers without them.

## Checks and correction history

- Node 24.15.0 and pinned pnpm 11.21.0 were used. The final `pnpm test` passed
  ESLint, formatting, core/landing types, site build, strict active/main/archived
  OpenSpec validation, distribution build and Node tests: **781 total, 780 passed,
  zero failed, one skipped**. Node tests took 73.467 seconds. The existing portable
  lifecycle test requires `TIBICEN_PORTABLE_DIST`; that test was not enabled.
- A separate `pnpm build` passed and emitted 92 payload files, 46 per skill.
  Exact bundle cardinality was updated for the one new module per skill. Required
  frozen resources now have exact built-resource-to-frozen-inventory hash assertions, including
  the diagnosis module. Pins, consent, caps, retries and old frozen evidence were
  not relaxed or rewritten. The focused contained-setup suite passed **9/9**.
- Focused current-diagnosis and CLI regressions passed **13/13**. They cover
  absent and old saved sessions, current drift, mutable memory, unfinished
  recovery, nested rules and redacted excluded paths. Existing report/save
  equality also passed. Tests check real scans and state/file preservation;
  instruction prose is not matched word for word.
- Both built skills passed `self-test`, `version` and read-only `report` on a
  temporary project outside the checkout, with an isolated home and no Git in
  PATH. All 92 payload hashes matched `SHA256SUMS`. Root and nested Cursor
  candidates were found, a sensitive exclusion stayed redacted, project bytes
  and modes were preserved, and no home/session/Git state was created. No
  application command or native/model agent was launched.
- Earlier failures remain in the logs. Gate 1 stopped at OpenSpec validation
  because Russian delta copies were inside `specs/`; they were moved to the
  established change-root translation layout. Gate 2 passed 778 tests and failed
  two exact-count fixtures still expecting 45 files per skill. The count and
  required-module hash checks were corrected before the successful third gate.

## Independent Ponytail review

Runtime, instructions/documentation and the earlier uncommitted research were
reviewed in parallel by agents other than the author of each scope. All three
lanes returned **Ship after fixes**, with no unresolved mandatory findings:

1. Policy exclusions were missing from diagnosis coverage. The report now shows
   sorted, redacted exclusion reasons and limited inventory; actual-scan
   regressions cover this without reading or disclosing excluded content.
2. Nested Cursor rule candidates were omitted. A diagnosis-specific predicate
   covers nested Cursor/Claude rule directories; memory matching is unchanged.
3. A guide claimed no commands ran. It now distinguishes read-only inspection
   from application/third-party execution.
4. A new test asserted exact Russian prose. It was removed; resource graph,
   runtime and behavior checks remain.
5. Research overstated secret filtering. Both language copies now distinguish
   forbidden configuration fields from heuristic detection of inline secrets.

The later bundle-count/hash correction also received an independent **Ship**
review. The reviewer confirmed equality guards, exact resource hashes and the
unchanged trust/consent/session limits. Source pages from the earlier research
were not revisited in this implementation review.

## Limits

This is offline engineering evidence. No fresh native session, automatic loading,
behavioral usefulness, human preference, public delivery or additional platform
was evaluated. The four guide flows are illustrative. The build still carries
1.1.0 metadata because version preparation is separate; it must not be presented
as the published 1.1.0 artifact. No landing files or dependencies were changed.

## Workflow closure and additional offline acceptance

The owner's subsequent autonomous-continuation instruction completed normal
sync/archive. Three requirements and seven scenarios were appended exactly to
the two main specs, leaving their previous bytes and Purpose sections unchanged.
All eight tasks were complete. Strict main/archived validation and independent
closure review passed; affected document links were repaired.

The previously skipped portable lifecycle was then enabled separately against
these same development bytes: **3/3 passed, zero skipped**, one run, 3.32 seconds,
darwin arm64 / Node 24.15.0. It copied both skills outside the checkout and checked
checksums, proposal, wrong-digest refusal, exact-plan apply, verify/status/report
and a no-change repeat. It executed only its own generated fixture application
test, not checkout or user applications.

One additional copied-adopt memory lifecycle passed twelve CLI invocations. The
fixture operator checked the exact AGENTS.md-only proposal digest
`839292b98174ee337b55256aa7ec4da6ce3af408ab1e6dbd54695ad07b8b2934`, with no
commands, before approval. Wrong digest and unrequested report save refused
without writes. Existing owner instructions and memory bytes/mode were preserved;
later notes remained valid. A damaged pointer retained recorded complete/checks
while current diagnosis found content mismatch and a missing memory connection;
verify failed as expected. Explicit report saving matched the current JSON.

All 198 checked source/test/resource files and the complete distribution remained
byte/mode-identical. No native/model/network agent or user application ran;
temporary projects were removed. Receipts are `lifecycle-acceptance-02.json` and
`lifecycle-command-receipts-02.json` in the same private directory. A first
receipt-wrapper error expected TAP text instead of the actual reporter glyph;
the failure remains recorded, and the successful portable test was not repeated.
These bindings identify this packet; the later
[nested-memory correction](../2026-11-05-detect-nested-memory-connections/proposal.md)
requires its own changed-byte verification.
