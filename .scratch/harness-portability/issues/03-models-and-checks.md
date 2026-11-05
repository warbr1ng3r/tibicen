# Separate models, harnesses and verification routes

Type: task
Labels: wayfinder:task
Status: resolved
Assignee: none
Blocked by: none

## Contract

Read-only product/runtime/rules/evaluation audit. Separate the caller harness, LLM model and provider from optional automatic probes. Recommend concrete portable behavior and explicit unavailable outcomes without adding a provider/agent runtime, credentials or new paid calls.

## Answer

The ordinary product has no model/provider allowlist; developer eval profiles are excluded from installed bundles. Claude-only probes are optional methods, not ordinary setup eligibility. Common AGENTS avoids unconditional native sharedRules/version gates; missing file/Node/native operations require precise gaps. Private audit: `.evals-private/harness-portability-20261105/models-and-checks-audit.md`.
