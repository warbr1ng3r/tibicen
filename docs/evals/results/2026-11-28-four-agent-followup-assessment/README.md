# Four-agent follow-up assessment — 28 November 2026

All four prospective observations concluded. Retain the incoming grades: **AE-03
passed, AE-02 assisted, AE-05 failed, AE-07 assisted with qualifications**. This is
not four passes or completion of the original eight under their frozen protocol.
No CLI-runtime defect or returned product patch was demonstrated.

[Русский](README_ru.md)

## Integrity and limits

Root's independent audit matched all 171 sealed input files, the released 1.8.2
candidate, 1,568 worker source files and 2,106 protected original files. Both source
checkouts remain clean at their respective baselines. The zero-byte returned patch
is retained. The final index contains 432 matching files / 3,350,177 bytes; the
largest is 87,238 bytes, below the one-MiB cap. The input seal is
`139ce7871a3ffd57d1cf19fa4b7021041fa4ac985c107fbe7e1eeb3f7cc6f21a`.

The final request snapshot reports 121 starts (49 coordinator, 72 other actors),
with later finalization turns missing. Complete token totals and subscription cost
remain unknown; some retained per-request usage fields do not establish full-run
accounting. No new paid API was used. Native loading, clean worker context, human
approval, causal memory benefit and human usefulness remain unestablished.

## What root accepts

| Case | Retained result | Root conclusion |
| --- | --- | --- |
| AE-03 sufficient setup | passed | Useful read-only answer from actual files; no project/HOME writes or manufactured session |
| AE-02 selective adopt | assisted | Exact two-reference repair, protected owner bytes, exact synthetic grant and controller-native application/checks |
| AE-05 memory work | failed | Missing formatPrice fails the functional requirement; the worker stopped and asked questions after reading the ask-first caveat |
| AE-07 recovery | assisted, qualified | Real interruption and successful controller recovery preserve the original session/history and written file; sealed tool failures and pre-execution review deviation remain |

Original grades and failed instrument outputs are unchanged. The independent
reviewer's blocked-prerequisite interpretation of AE-05 is retained alongside the
coordinator's failed grade. Root keeps the functional failure while distinguishing
it from the worker's blocked state. The completed work does not establish that
all questions were indispensable or that removing one caveat would guarantee success.

## AE-05: improve memory drafting, not the runtime

Seven complete read bodies match the launch files. The worker read instructions
and memory before any edit; preliminary listings came first. It asked about decimal
format/grouping, negative values and invalid inputs, then changed nothing.
Negative integer cents are already covered by the owner's “integer cents / all
other values” rule. Fractional cents and NaN are outside the stated input domain;
their treatment need not block valid-input work. The separator really is unspecified.

The generated caveat combined these issues into a standing ask-first instruction.
That is a supported quality concern in the generated content and a plausible source
of friction, not an isolated causal experiment or a CLI defect. The current worker
reasonably respected the explicit note; the extra questions do not all become
necessary merely because they were asked.

The local Unreleased guidance now clarifies the existing decision-scope/provenance
and material-question rules: retain known input/output domains, keep absent details
separate from accepted rules, and review caveats that introduce unsupported stopping
obligations. Explicit owner instructions to ask and genuine material conflicts still
apply. A reversible technical choice is a correctable assumption, not an owner decision.
See the [memory guide](../../../PROJECT_MEMORY.md). Existing user memory is not
silently rewritten. No new runtime/schema, required memory path or service is added.
A fresh model observation of the clarification has not been run.

## AE-07: accept recovery facts, qualify the process

The retained ps row identifies PID/PGID 48164 and status Ts, a stopped session leader.
Marker/PID, actual SIGKILL/-9 and runtime state agree. The frozen helper's regex
recognizes T or T+ but misses Ts; its exit-one result and the final scorer's failed
guard stay in the record. Root reproduced this parser error against the exact row
and checked positive/negative status controls. This is a defect in root's evaluation
helper, not Tibicen. Future revision should inspect the first status-column character;
the sealed packet is not patched or rerun.

Independent comparisons confirm unchanged worker snapshots, the original completed
session, prior history/approval prefixes, all three protected files, and identical
AGENTS.md bytes, mode and mtime. Native resume/verify/status/report and the two project
tests returned zero. These facts support qualified assisted functional recovery.
They do not turn failed sealed preconditions into a sealed pass.

The worker recommended continuing the stored plan. The controller instead compiled
a zero-change envelope after the file was already written, then approved and executed
that new digest. A semantic review written before compilation incorrectly said the
digests matched; its correction is retained. The mechanical scope review and grant
bind the actual new envelope, but full correct pre-execution semantic review is not
established. Accept the recovery observation; do not accept full procedural compliance
or the unobserved same-plan route.

## Approval is always for the plan actually executed

For stored-plan resume without a replacement envelope, obtain fresh approval of the
stored digest. If a different envelope is supplied, its own digest requires fresh
approval; do not record approval under the old digest. Product receipts must bind
approvedDigest and proposalDigest to that actual envelope. The returned receipts
correctly bind the new digest, not the controller's earlier mistaken description.

Root checked both routes in independent owned deterministic API fixtures: old approval
with a new envelope and new approval with the saved envelope are refused without
state writes; exact approvals complete the original session. Three existing targeted
offline tests also pass. This confirms the existing runtime contract, not human
consent or a new native same-plan agent observation. No policy decision from the owner
is needed to reinterpret these receipts.

## Next work

Keep the narrow guidance clarification under Unreleased, with engineering review and
local checks. A future behavioral observation, if needed, should test only whether
newly drafted memory avoids unsupported blanket clarification requirements; it must
retain real ambiguity and must not promise autonomous success. No broad matrix or
repeat of the four cases is scheduled. No commit, push, version bump or publication
is part of this acceptance. Exact conclusions are in the [receipt](receipt.json).

Local verification: pnpm 11.21.0 full gate passes 1,224 tests, zero failures and two expected skips. Both skills pass standalone self-test outside checkout with empty PATH/isolated HOME; all 116 payload checksums match. Independent final review: Ship.
