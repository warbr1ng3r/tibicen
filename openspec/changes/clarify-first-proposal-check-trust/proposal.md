# Proposal

## Why

Several returned ZCode sessions compiled executable-check proposals without command trust or verified environment readiness. Adding a missing flag after approval changes the digest and creates an avoidable new approval cycle. The existing execution gates correctly refused those plans.

The returned wording also told generic callers to select `web`, which would reject an otherwise supported Bash check. Separately, five recorded cases applied without the required external approval. Useful outputs from those cases do not erase the consent-invariant failures. The reported later improvement after a prompt clause lacks complete dispatch records and is not treated as a demonstrated cure.

## What Changes

- Include proposed command trust in the first exact plan that shows the code and commands requested for execution. The flag expresses the proposed scope; later external approval of the unchanged digest is still required.
- Select the actual supported `web`, `python`, `bash` or `docs` profile and declare readiness only after checking the relevant environment. Unknown readiness remains unknown.
- Clarify the existing approval boundary: a worker-created questionnaire, its own or simulated answer, a default selection or tool permission is not a separate external user/controller reply. Unknown approval provenance keeps the executor read-only.

## Capabilities

`verification-and-delivery`: clear first-proposal trust/readiness and an explicit external approval-channel distinction.

## Impact

Only shared distributed guidance in `references/proposal-format.md` changes. Existing CLI flags, validation and schema stay unchanged. The CLI matches digests; it does not authenticate a human. Independent hosts can retain write/execute authority until an external grant. Text alone cannot enforce that boundary. Returned RET1 evidence is retained as a reported first-proposal observation, not proof of the corrected wording's effect across harnesses.
