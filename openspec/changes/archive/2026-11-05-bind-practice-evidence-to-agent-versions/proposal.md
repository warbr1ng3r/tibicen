# Proposal

## Why

Official-practice discovery accepts agent versions internally, but the public CLI
cannot receive them. Guidance can therefore be fetched today without being bound
to the environment being assessed, and a successful fetch can be mistaken for
verified compatibility.

## What Changes

- Let the existing read-only `practices` command accept optional version data
  through its existing-style `--input FILE|-` interface; keep the current
  `--agents` invocation valid.
- Validate input before fetching and pass selected, available version observations
  to the existing helper. Missing versions remain explicit gaps.
- Clarify the agent workflow: obtain versions from available trusted environment
  observations, distinguish provided observations from mechanically established
  compatibility, explain keep/change/unknown, preserve sufficient setups and
  show relevant source/date/version limits.
- Document the input and ordinary user outcomes in paired EN/RU project guides;
  verify source and standalone delivery offline.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: version-bound read-only practice assessment
  and evidence-limited recommendation explanations in init/adopt.

## Impact

Affected areas: `scripts/tibicen.ts`, `scripts/discovery/practices.ts`, their
focused tests, existing distributed references and paired project documentation.
No new command, dependency, source host, installation, background process,
automatic agent execution or persistent schema is required. Existing consent,
protected-path, request-limit and no-change behavior remain controlling. Version
data is caller-supplied context, not independent proof of the installed binary
or semantic compatibility. Root package version stays 1.1.0; work is Unreleased.

The owner's “Поехали” authorizes the previously described requirements,
implementation, parallel agents, integration and review packet. Planning and apply
are performed within that scope; no commit, push or publication is inferred.
