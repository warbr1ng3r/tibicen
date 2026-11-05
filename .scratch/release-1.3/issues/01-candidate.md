# Freeze and check the versioned candidate

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Own package version, immutable private source/distribution inventory, pinned frozen-lock install, full gate/build, generated versions/checksums/archive and outside-checkout/Git-absent checks. Preserve attempts. No public publication or credential changes.

## Answer

Candidate-01 freezes 1,144 source files. Pinned frozen-lock installation, full gate (835/835, no skips) and build passed. The two generated skills each have 47 files; 94 payload checksums and the 95-file archive match. Six separate commands on an exact external unpack passed with Git absent and a Node read grant limited to the external owned tree. The earlier six isolated commands inside the checkout remain separate; the correction is retained. Private evidence: `.evals-private/release-1.3-20261105/candidate-01/receipt.json` and `standalone-outside-receipt.json`. No publication.
