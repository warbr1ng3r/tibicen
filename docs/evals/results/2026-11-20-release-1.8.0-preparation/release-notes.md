# Tibicen 1.8.0 — draft release notes

**Unpublished local candidate.** Intended tag: `v1.8.0`; no tag or public 1.8.0
installation reference exists yet. Current published installation remains 1.7.1.

## Changes

- See which exact plan apply/resume consumed in retained approval receipts in
  the result, status, report and session summary. Refused consent returns its
  attempted/required digest in the error without writing to the project.
- Keep legacy receipt-free sessions readable; validate new journals and prevent
  receipts from another session being inherited during recovery. Copied projects
  retain historical roots while the latest active receipt matches the current plan.
- Recognize installed Tibicen skills by their carried name/version marker scoped
  to their own directory. A similarly named third-party skill is no longer
  mistaken for canonical Tibicen; it remains visible as existing infrastructure
  with unknown provenance. Parent/sibling markers do not identify a separate
  lookalike.

## Update and recovery

This compatible minor introduces no schema migration or dependency. Back up both
complete installed skills, including local edits, before replacing them through
our [installation procedure](../../../INSTALLATION.md). Project setup and memory
are separate from the installed utility; replacing/removing Tibicen does not
remove those files. Re-running the pinned installer can restore a partial skill
copy; restoring an edited skill backup does not rewind project changes.

Retained journals keep the latest eight receipts. Older runtime writeback may
omit these additive fields; keep a backup before downgrading. A damaged receipt
journal fails as `tamper-suspect`; retain the evidence for review rather than
silently removing records to force application.

## Verification limits

Receipts identify content and a caller-controlled channel, not the human who
approved it. Marker presence is not cryptographic authenticity. Synthetic local
checks do not prove native harness loading or measured usefulness. New candidate
public CI, all six platform cells and real public delivery remain pending.
See the [candidate report](README.md) and [changelog](../../../../CHANGELOG.md).
