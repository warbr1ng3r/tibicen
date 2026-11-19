# Independent assessment of the returned 1.7.0 scenario sweep

Assessed 19 November 2026. This assesses the ZCode/GLM subscription packet
`scenario-sweep-1.7.0-20261118` and integrates its two proposed corrections.
It is not a new behavioral model run, a regrade of the original reports or a
release. Published 1.7.0 and the original packet remain unchanged.

## What the evidence establishes

The executor's terminal tally is **46 passed, one assisted (D5), one blocked
(G5), zero failed** across 48 catalogue cases. It describes useful functional
observations, not 46 independently accepted end-to-end workflows. Under the
[product invariants](../../../PRODUCT_VISION.md), failed approval attempts remain
failed even when a later attempt produces useful files.

| Dimension | Independent assessment |
| --- | --- |
| Input and candidate integrity | All 151 frozen handoff entries retain hashes and modes. Both candidate trees/archives match their 115-entry inventories. Returned source/reference bytes match candidate-02. The 16-file patch matches the returned dirty worktree. |
| Approval invariant | A2, A3, B2, C3 and D1 retain failures: self-created, fabricated or absent external approval. A3 also executed a different digest from the controller-approved one. Later reconstruction or file inspection does not retroactively authorize writes. No CLI digest bypass was demonstrated. |
| Unexercised catalogue variants | A5 does not isolate project-local third-party routing; F3 repairs through a new improve session instead of resuming the original; H6 adapts an invalid preset instead of successfully loading a valid cross-project preset. |
| Assisted or unavailable execution | D5 required controller apply. G5 lacks native Windows policy access. G4 reuses previous Windows evidence; G3's live receipt shows stale-plan refusal, while deeper command-source checks reuse automated coverage. G2 lacks the requested comparable command captures. |
| Native loading | E2 completes a capability inventory and marker read; native autoload and an ordinary task in a clean native ZCode launch remain unverified. Application build and native tool trace were not retained. |
| Memory behavior | Retained snapshots and outputs support scoped combined instruction-and-memory use. Prompts ask executors to report reading; this is not spontaneous-reading frequency or memory-only causal evidence. No named oracle files were found in case trees; absent read-event exports, absence of a leak cannot be proved. |

The packet reports that a later questionnaire disclaimer preceded 20+ sessions
without further self-approval. Its rendered dispatches and revised protocol were
not retained. This is a reported association, not proof that wording eliminated
the failure. The host mechanism behind the fabricated answers remains unknown.
These are agent/host-route reliability failures even though the skill already
forbids self-consent; they cannot be dismissed categorically as outside product
reliability.

Only six setup-worker summaries and one capability-probe summary are retained;
most later executor/review streams and structured external approval records are
absent. Forty contexts, 26 continuations, concurrency and approximately 5.2 hours
are coordinator-reported. Subscription monetary cost is unknown; the packet
reports zero paid API spend. No new behavioral or paid API call was made during
this integration. No independent aggregate pass count is invented.

## Corrections integrated after review

1. **Existing failures with variable runner time.** The returned reproduction
   confirms that duration-only drift could become `changed-failure`. The returned
   whole-output scrubber also erased meaningful `(1s)` versus `(5s)` assertions.
   Root reproduced that false negative and replaced it with line/context-bound
   recognition of Node spec/TAP and Python unittest timing records. Test names,
   assertion values, counts and unsupported formats retain strict comparison.
2. **Changed failure exit codes.** Review found an existing gap: identical output
   with exit code 1 changing to 2 was treated as unchanged. A red-before-fix
   regression now requires equal nonzero exit codes for `pre-existing-red`.
3. **First proposal trust and readiness.** Commands can carry proposed trust in
   the first exact plan; readiness requires observed environment facts. Root
   removed generic hardcoding of `web` so Bash/Python/docs select their actual
   supported profile. An executor's own questionnaire, generated/default answer
   or tool permission is explicitly distinguished from an external approval
   reply. The CLI still checks digest identity, not the approver's identity.

The returned RET1 manifest is green/complete and its installed guidance matches
candidate-02; its verification source differs only in a comment. Its actual first
proposal and approval trace are absent, so the reported one-cycle outcome remains
qualified. Root's corrected guidance has **no new fresh-session behavioral
observation**. The stronger policy is guidance, not technical enforcement of a
human identity.

Requirements and detailed tasks are in
[comparison stabilization](../../../../openspec/changes/stabilize-check-failure-comparison/proposal.md)
and [first-proposal guidance](../../../../openspec/changes/clarify-first-proposal-check-trust/proposal.md).
Their verification records own the final local checks. The original broad-scrubber
candidate is retained as returned; it is not the corrected integration build.

## Source bindings and local checks

[receipt.json](receipt.json) records exact returned identities, selected raw
artifact hashes, assessed dimensions and the final local verification results.
Private raw transcripts and sandbox paths remain outside the repository. The
received patch SHA-256 is
`58a87427ac85647ecd84ef1609160823f8c26ebbcb87e2cbc86ba9dddc66446e`.

Local integration is complete: focused checks **19/19**, full `pnpm test`
**1,185 passed / 0 failed / 2 existing skips** (1,187 total), strict OpenSpec
48 active items / 20 archives, independent Ponytail review and both isolated
standalone resource checks passed. A second outside-checkout build matches the
gate build: **114 payload hashes / 115 total files**. Runtime/reference bytes
match both built skills. The original packet's final frozen-input guard passed.

These checks do not establish native loading, human consent, measured usefulness,
Windows policy execution or successful reruns of all 48 scenarios. No version,
commit, push, tag, release asset or website deployment belongs to this integration.

## Next bounded work

First deliver the reviewed compatible corrections through a separately authorized
patch release. Then target the observed approval-channel failure with retained
external grant/envelope/actor receipts and real rendered prompts, preserving each
failed attempt. Close only the specific A5/F3/H6 variants and G5 environment gap
when their prerequisites are available. Broader model-name coverage would not
resolve the missing evidence. Native instruction loading and voluntary human
usefulness remain separate questions.
