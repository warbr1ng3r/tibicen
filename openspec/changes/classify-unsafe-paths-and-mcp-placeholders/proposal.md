# Proposal

## Why

Coverage review of Tibicen 1.8.1 initially reproduced two contract defects (SECURITY-001, SECURITY-008):

- `proposal` refused a backslash traversal path such as `..\outside\AGENTS.md` with `application-protected`, and `.tibicen/../x` with `forbidden-path`, because the write-boundary and internal-state checks ran before the path validator. Nothing was written, but the reported code contradicted `unsafe-path`, which `validateRelativePath` and the contract asserted for the released CLI give for every path-escape form.
- `mcp-verify` and MCP planning reported `existing-inline-secret` for the documented placeholders `<token>` and `<VALUE>`. The MCP secret check excluded only `${...}` references and did not know the placeholder rule that secret inspection and snapshot preparation already apply.
- Follow-up coverage review of `SECURITY-008` found that `proposal` accepted a raw change to the MCP config carrying `"TOKEN": "<token>SYNTH-LITERAL-7f3a9c"` and echoed the value in the compiled content and diff. The raw-text `containsSecret` scanner exempted every quoted value that merely starts with `<`, `${`, `[redacted]` or `***`, while a genuine literal in the same construction was refused with `secret-content`.

Root review of the follow-up also reproduced spaced values, missing secret-key names and escaped JSON keys. MCP apply refused them later, but approved ordinary infrastructure content could be written. The correction therefore belongs in the shared content guard.

## What Changes

- Validate a change path with `validateRelativePath` before the internal-state, write-boundary and freshness checks, both when a proposal is planned and when a plan is applied or resumed. A change without a path in a nonempty project keeps its existing `application-protected` refusal.
- Recognize complete placeholder values in structured MCP configuration inspection: a whole environment reference, `<identifier>`, `[redacted]`, or an all-asterisk mask. Partial prefixes and values mixed with references remain literal secrets in verification, planning and execution-trust comparison. A literal under a secret-like key remains refused and never echoed.
- Share the strict whole-placeholder, secret-key and structured literal checks between raw content and MCP inspection. Decode valid JSON keys/values; inspect quoted text assignments including spaces and escapes. Read-current, proposal and apply refuse literal credentials before echo or writes, including AUTHORIZATION/CREDENTIALS and ordinary infrastructure files such as AGENTS.md. Preserve the existing narrow bare non-JSON placeholder-plus-word scan.
- Leave the path validator, the MCP reference-syntax rules, native-format diagnosis and the snapshot scanner unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `agent-infrastructure-lifecycle`: unsafe change paths are classified before the other per-change refusals; Claude Code and Cursor MCP configuration inspection recognizes complete placeholder values; raw proposed content exempts a placeholder only when the whole value is one.

## Impact

Four script modules (`core/plan.ts`, `core/apply.ts`, `core/policy.ts`, `mcp/index.ts`) and three existing test files. No new dependency, persistent schema, permission or version change. The shared policy removes independent copies of the placeholder/key rule. Raw literal refusals now cover whitespace and decoded JSON; reference-format validation remains separate.
