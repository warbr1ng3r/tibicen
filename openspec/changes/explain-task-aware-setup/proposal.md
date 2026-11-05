# Proposal

## Why

Published 1.3 reports instruction candidates but cannot attach the selected host,
working directory and target task path to that inventory. Init and adopt therefore
leave the working agent to reconstruct the same scope explanation separately;
the init scan does not request this context as explicitly as adopt.

## What Changes

- Add optional, validated caller-supplied task context to the existing read-only
  report and a bounded projection of candidate directory relationships.
- Keep spatial relationships, documented host facts, expected applicability and
  observed loading/use distinct. Do not invent an active-instruction resolver.
- Connect both entry skills to the same report context and plain-language
  explanation, with one minimal recommendation and concrete activation step.
- Check fresh init/adopt reasoning and later use/correction of the existing
  single memory store; retain assistance and unavailable native observations.
- Update paired guides, Unreleased notes and the local work dashboard.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `verification-and-delivery`: validated task-context diagnosis and explicit
  separation of candidate topology, applicability and loading/use.
- `agent-infrastructure-lifecycle`: both init and adopt use the same task context
  in recommendation, verification and handoff without a mandatory questionnaire.

## Impact

Touches the existing report CLI, shared diagnosis, installed stage references,
focused tests and project guides. Existing report fields and no-input behavior
remain compatible. No new dependencies, adapters, memory schema, permission,
automatic update, paid API, credential change, commit or publication. Native
host/model compatibility is not inferred from source-assisted observations.
