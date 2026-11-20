# Tibicen 1.8.0

This compatible minor adds retained approval receipts and corrects how installed
Tibicen skills are distinguished from similarly named third-party infrastructure.

- Inspect the exact plan consumed by apply/resume in the result, status, report
  and saved session summary. A refusal returns attempted/required digests without
  writing to the project. Journals retain at most eight receipts.
- Keep older receipt-free sessions readable; validate new journals, preserve
  copied-project history and avoid inheriting receipts from another session.
- Scope canonical name/version markers to their own full project-relative
  directory. A similarly named third-party skill remains visible as existing
  infrastructure with unknown provenance.

## Install or update

Requires Node 22.20 or newer and Git. Back up both complete installed skills,
including local edits, before updating:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/a748ba3932e85f5194a3ea450c003f83bf8dcd9f -g --agent universal --skill tibicen-init tibicen-adopt --copy
```

No dependency or persisted schema migration is introduced. Project setup and
memory remain separate from installed skills; replacing/removing the utility
does not remove project files. Older-runtime writeback may omit new receipt
fields. Re-running the pinned installer can restore a partial skill copy;
restoring a skill backup does not rewind project changes.

## Verification

Source: `ab509eccca659ac7a273540661974c882fb8908c`.
Distribution: `a748ba3932e85f5194a3ea450c003f83bf8dcd9f`.

[Offline CI](https://github.com/warbr1ng3r/tibicen/actions/runs/44672175401)
and [all six platform cells](https://github.com/warbr1ng3r/tibicen/actions/runs/44672177483)
passed, including actual Windows commands on Node 22 and 24. The local gate
passed 1,207 tests with zero failures and two existing skips. Standalone,
installation/update/recovery/removal and compatibility checks retain their
controller assistance and limits in the candidate report.

Archive SHA-256: `2aad29f3a57bc2d93855fdc918eecd4daad478f595bac2673e4ef4705b4c672d`.
Payload manifest SHA-256: `86b5876b5c0c5cf5e61d1f598f3552e7447d3993fc45c83be1a6c833d30e7e29`.
All 116 payloads and 117 archive files/modes match the frozen candidate.

Receipts identify content and a caller-controlled channel, not who approved it;
they cannot authenticate consent or prevent an executor with shared tools from
self-consenting. Markers are not cryptographic authenticity. Native harness
loading, Windows policy restrictions and measured human benefit remain unverified.
Existing failed behavioral observations are not regraded by these release checks.

[Candidate report and release notes](https://github.com/warbr1ng3r/tibicen/blob/ab509eccca659ac7a273540661974c882fb8908c/docs/evals/results/2026-11-20-release-1.8.0-preparation/README.md).
