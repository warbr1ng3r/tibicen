# Retain safe executor failure correlation

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: root
Blocked by: none

## Contract

Fix the demonstrated development-harness evidence gap offline under
[correlate-contained-tool-failures](../../../openspec/changes/correlate-contained-tool-failures/tasks.md).
Observe bounded metadata at the existing request/response seam; preserve private
payloads, containment, first-failure stopping and cleanup. Existing receipts and
failed/native/unverified outcomes remain unchanged. Source and tests use separate
agent lanes followed by independent Ponytail review and the repository gate.
No live executor, auth/model/API calls, retries, skill changes, commits or release.

## Answer

Implemented safe internal request/start-response/exit matching and forwarding
through the standard setup collection artifact. Exact-pair, bounds, privacy and
transport tests passed. Independent Ponytail Ship; final gate 954 passed/one
existing skip; all 100 distributed payloads and 74 original native records are
unchanged. Command text/cause remain unknown; no live retry or release. See
[verification](../../../openspec/changes/correlate-contained-tool-failures/verification.md).
This also answers the older
offline correlation question (`../../codex-zcode-acceptance/issues/93-correlate-stopping-executor-event.md`; private development record; excluded from public source).
