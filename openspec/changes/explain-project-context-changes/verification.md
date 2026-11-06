# Verification — 7 November 2026

Implementation is complete locally and **Unreleased**. Published skills remain
1.4.1; no version, commit, push, tag, release or Pages deployment was made.
The [tasks](tasks.md) are complete. Requirements describe the optional report
behavior, not independently verified upstream guidance or native agent behavior.

## Actual checks

| Check | Result |
| --- | --- |
| `pnpm test` after correction | 1035 passed, 0 failed, 1 existing manual portable skip; lint, formatting, types, site build and strict current/archived OpenSpec checks passed |
| `TIBICEN_PORTABLE_DIST="$PWD/dist" node --test tests/skills/portable.test.ts` | 3/3, both complete skills copied outside the checkout, self-tests and approved synthetic lifecycles passed |
| Additional built-feature checks | Six fresh CLI processes across both copied skills: observed instruction hash, unchanged/changed memory source, stale version action unknown, original base context and project bytes/modes preserved |
| Browser layout | 15/15, Chromium/Firefox/WebKit: 31 widths, EN/RU phone/desktop, 200%/400% viewport reflow |
| Visual inspection | Six screenshots at 1440, 390 and 280 px across EN/RU; desktop EN and narrow RU inspected directly |
| Documentation | 349 local links across 26 changed/new Markdown files resolved; no Russian-copy instruction targets |
| Independent Ponytail engineering review | Ship; connected code, new tests and later distribution-count correction reviewed |
| Independent guidance review | Ship after the concrete date/query-format correction |

Environment: Node 24.15.0, pnpm 11.21.0, macOS arm64. The development distribution
has 55 files per skill, 110 payload files. SHA256SUMS hash:
`5cac167be02f3196a9410ecca79e45264f0e76a882b97162b4af098e7884cf4e`.
The independent follow-up verified all 110 hashes and the five added payloads
against their sources. This is a development build, not the published 1.4.1
artifact or a new released version.

## Retained failures and corrections

- The first instruction CLI privacy test wrongly expected exit 0 from an
  intentionally interrupted saved session. Its expectation now explicitly checks
  incomplete/exit 1; runtime behavior was unchanged. Nine lane tests passed.
- The first browser check found the longer instruction label clipped at 280 px.
  A single wrapping rule fixed it; targeted and three-browser checks passed.
- Guidance review found that “ISO date” and “HTTPS URL” were broader than the
  accepted schema. The installed reference now gives exact date forms, supported
  query selectors and text limits; the reviewer rechecked the correction.
- The first full gate had 1033 passes, two failures and one skip. Both failures
  were the contained evaluator's old exact 50-file guard. A separate focused red
  run reproduced 8/2. Exactly four new core modules and one reference per skill
  explain 55/110. The guard/test now retain that explicit count and add hash
  assertions for all five resources. Focused checks passed 10/10, independent
  review passed and the complete gate was repeated successfully. Hash/freeze,
  cancellation and historical receipt safeguards were retained.

## Evidence and limits

Local receipts are in the private
`project-context-review-20261107` directory (`../../../.evals-private/project-context-review-20261107/`; private development record; excluded from public source):
`full-gate.log` (initial failed gate), `full-gate-fixed.log` (successful repeat),
`contained-setup-red-01.log`, `contained-setup-green-01.log`, `standalone.log`,
`built-context.json`, `browser-layout.log`, screenshots, `document-links-final.json`,
`source-freeze.json` (22 code/runtime/test/package inputs) and both independent
review reports. These are local engineering records, not public delivery receipts.

No model/native sessions, API charges, upstream fetches, credential changes or
container launches were performed for this packet. Offline evaluator tests use
synthetic protocols; their logged model-session counters are simulated, not live
launches. Built-feature assessments use explicitly synthetic supplied source
metadata. Historical evaluation and publication records were not changed.
File/hash comparisons establish neither fact truth, genuine historical baseline
origin, installed versions, compatibility, actual native loading/use nor measured
human benefit. Application/notes/state remain unchanged in ordinary reports;
later justified edits still use the existing exact-plan approval workflow.
