# Proposal

## Why

The contained evaluator kills the entire session when an ordinary command returns a nonzero exit code. Codex 0.157.0 normally returns that result to the agent, allowing it to fix a failing test or choose another command. The current evaluator prevents that recovery before the native task can finish.

## What Changes

- Forward valid process results, including nonzero exits, without terminating the owned container.
- Keep explicit sandbox denials, malformed process exits, RPC faults and all existing transport, deadline and cleanup failures terminal.
- Keep optional failure correlation independent of execution policy and preserve ordinary command results in the CLI event stream.
- Demonstrate the defect and repair through focused offline tests and a bounded, model-free owner-socket regression.
- Preserve both failed native attempts and stop their remaining phases. Any future native observation needs a separate prospective freeze.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `evaluation-results`: distinguish ordinary command results from terminal evaluator failures without changing strict attempt records or containment.

## Impact

Development-only container session policy, its tests and paired evaluation documentation. No dependency, image, distributed skill, version, credential, model-route or permission change. The owner explicitly authorized autonomous diagnosis and implementation without small-step approval pauses; this overrides the planning skill's default pause. No commit, push or publication is included.
