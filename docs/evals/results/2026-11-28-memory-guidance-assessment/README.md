# Memory-guidance observation — 28 November 2026

The Unreleased memory-guidance change has **one positive, assisted behavioral
observation**: generation preserves the owner rule, and a separate worker completes
the formatting task without waiting for answers. A later independent raw-evidence
audit supports this qualified conclusion. The original packet still correctly says
its own independent review did not run; that record is not rewritten.

[Русский](README_ru.md)

## Candidate and integrity

Tested source: `05047502fc6eea39cc8f6f768878eb3fbea63ed7`, containing memory guidance
commit `7f2fc3d`. This is a local Unreleased build based on 1.8.2, not the published
1.8.2 payload. Its manifest SHA-256 is
`6f93c1be2888f0ac24205eee6750017f8d97215f9bf38c353ec56098ccdf6a06`.
Root matched 125 sealed inputs, all 116 payload checksum entries and the exact
117-file candidate inventory. The input seal is
`63460d3110fac278e731c31b83f8cbf805263b87f0ae0120f5cc4b01f2f4a8a1`.
Root additionally hashed 90 retained work/report files, 3,010,240 bytes, at acceptance;
this new inventory does not prove historical capture completeness.

## What happened

The setup request specified integer cents, Free at zero, two decimal places without
currency for all other values, and no new dependencies. The ordinary task only asked
to implement the README's formatPrice API, with an explicit instruction to read the
entry point and linked memory; its prompt contained no price rule or scorer values.

| Stage | Supported result |
| --- | --- |
| Memory drafting | Only AGENTS.md and .agents/memory.md proposed; owner scope/source retained; negatives included; separator unspecified; reversible choices remain inferred |
| Before approval | Recorded generator commands and endpoint inventories show the protected project unchanged and owned HOME empty; this is not syscall-level host monitoring |
| Application | Synthetic AI-controller grant matches the actual compiled digest; native apply completes; original source and owner notes survive |
| Ordinary task | Worker reads instructions/memory before implementation, adds formatPrice and keeps existing export and dependencies unchanged |
| Finite functionality | Before-work scorer fails for the missing export; after-work scorer passes nine signed integer-cent inputs, including zero |
| Memory maintenance | Owner-decision section remains byte-identical; obsolete implementation fact corrected and new verified facts kept separate |

Grant digest:
`93c8a302c409aa4cf49c74f4c807f10494c6cb0c44e836f122d859d22e1c3d7e`.
Root recomputed it using the frozen product digest function and matched the native
consumed receipt. The recorded controller review precedes the grant, which precedes
application. This is declared fixture assistance, not human consent. Structural
verify passes; project checks at setup remain unverified because none exist.

The implemented function returns Free at zero and otherwise uses
`(cents / 100).toFixed(2)`. The sealed scorer passes
`[0, 1, -1, 123, -123, 2500, -2500, 9999, -9999]`; root reproduced baseline failure and
final success on removed temporary copies. No full-domain or invalid-input claim follows.

## Questions and presentation

Generation left two nonblocking questions: separator choice and whether to keep or
move the existing analytics note. The worker completed implementation and checks,
then asked whether a point separator was acceptable and how to handle fractional
or NaN inputs. Those questions did not block valid-input work; out-of-domain behavior
remains unspecified. The separator choice is recorded as an agent implementation
choice, not an accepted owner decision.

One presentation weakness remains: the generator's final JSON block is CLI input,
not the returned compiled envelope. The actual compiled envelope is retained in its
tool trace and matches the controller's saved/applied envelope. Do not claim the
final answer itself displayed the full compiled envelope as requested.

## Review, timing and limits

The original author used coordinator adjudication because the provider delays left
insufficient time for its planned review. A retained worker request failed with an
idle timeout after about 977 seconds, then work continued. Reported closure is
01:40:02 UTC, 53m49s after the declared start. The reported 42 started events are not
a complete all-attempt ledger: exports include a failed worker attempt and retries,
and later turns/accounting are incomplete. Full subscription cost and token totals
remain unknown; no new paid API use is reported.

Root's later reviewer received raw criteria, prompts, traces, files and outputs
without the author's grades or controller review. Its verdict is qualified pass for
observed behavior. This independent audit happened after packet closure and cannot
retroactively satisfy its contemporaneous review step. Root's integrity, scorer and
grant checks are separate from that blinded behavioral review.

Explicit reading assistance, inherited upstream workspace instructions and the
worker's additional read of rule-bearing service-manifest metadata prevent native
loading, clean-context or unique memory-causality claims. The guidance contains a
closely matching integer-cents example. These runs are not a controlled before/after
study; old AE-05 and all other historical grades remain unchanged. Other hosts,
versions, general autonomous success and human benefit are untested.

## Disposition

Close this narrow observation. No reproduced product defect or source fix follows,
and no broad model rerun is scheduled. The guidance remains Unreleased; published
1.8.2 is unchanged. Root acceptance adds documentation only, using the existing
checked source/build evidence rather than repeating the full product gate.
[Receipt](receipt.json) retains exact outcomes and limits.
