# Verification

6 November 2026, Europe/Moscow. Local Unreleased implementation, integrated with
the [task-aware init/adopt packet](../explain-task-aware-setup/verification.md).
No package version change, commit, push or publication.

## Completed behavior

- `mcp-diagnose` accepts only selected host/version/server metadata, up to four
  project source paths and optional supplied effective-source/launch observations.
- Bounded regular-file reads preserve project exclusions. Source text stays
  inside the first-party Node boundary; outputs contain no config, command,
  argument or env values, raw exception text or resolved file references.
- Four bounded readers cover Claude/Cursor JSON, Gemini CLI JSON and explicit
  OpenCode V2 JSON. Source order never merges definitions; selected source and
  launch availability remain caller-supplied rather than native proof.
- Both skills share one symptom-to-action recipe. Only a demonstrated supported
  reference-syntax defect at the exact current writer path receives that repair
  route. Missing env/executable/cwd has a precise native/environment follow-up.
  Existing writers, disable choices and execution trust remain unchanged.

## Review corrections

Independent Ponytail review reproduced a read-boundary gap: MCP validation used
the basic sensitive-path check while scanning also excluded .npmrc/.netrc/
.pypirc/.git-credentials and credentials JSON names. The shared
`isSensitiveInspectionPath` now owns exactly that previous scan predicate and
both callers reuse it. A six-path CLI regression rejects metadata before a
malformed manifest can be read. General write policy is unchanged.

The first full gate also found two contained-profile integration failures from
the old 47-files-per-skill pin. The new module and reference make 49 per skill /
98 payloads. The pin and test now retain that explicit size and verify hashes
of both added resources. Closed execution/argv/session caps remain unchanged.
The original gate (870 passed / 2 failed / 1 manual skip) is retained, not relabeled.
Focused follow-up: MCP/CLI/scanning 52/52 and contained-profile 9/9 passed.

Final independent code review found no remaining actionable findings and reran
66 combined MCP/CLI/report/scanner/contained checks without skips: **Ship**.

## Consolidated standalone acceptance

Candidate-02 contains 98 payloads plus SHA256SUMS. Manifest SHA-256:
`6d9119db371f55f59662fe448a57c53de017dc9a13e0d6ffb5f5120c1a5cb3cb`.
It was built outside the checkout and uses explicit Node 24.15.0 on macOS arm64.
Both self-tests and redacted CLI fixtures passed. The earlier candidate-01 is
retained as superseded before apply; it is not final-byte acceptance.

| Check | Actual result |
| --- | --- |
| Four readers and source/target uncertainty | Ten offline CLI fixtures passed: Gemini references/policy/URL precedence, OpenCode duplicate/explicit/disabled records, redaction, unavailable source and unknown target context. |
| Protected source names | Five candidate-02 CLI rejection cases passed; the sixth variant is covered by the pre-inspection regression. |
| Exact supported repair | Reviewed proposal changes only the Cursor docs record from `${SERVICE_KEY}` to `${env:SERVICE_KEY}`, with the writer's standard type/format. Root separately approved digest 44fac6db…; one apply completed. Same scoped diagnosis became valid-stdio/no-repair-indicated; structural verify passed and status/report are complete. Unrelated 14 baseline files and modes stayed unchanged; no server sentinel or command attempts. |
| Portable lifecycle | Candidate-02 passed 3/3, no skips; candidate-01 remains pre-fix evidence only. |
| Full repository gate | Final pnpm test passed: 872 tests / 1 manual standalone skip, zero failures; includes lint, format, types, site build, strict specs and build. The skipped standalone gate ran separately above. |

The exact operator approval is fixture-only, including the disclosed isolated
service/usage paths. Dummy server code is never launched; its sentinel detects
accidental execution. API-assisted apply uses the frozen runtime's same hooks
as CLI and an owned explicit home. No real user-home/authentication changes.
Raw evidence is one consolidated local `standalone/acceptance.json`, portable
log and full gate logs under `.evals-private/mcp-diagnosis-20261106/`.

## Limits and documentation

These are offline configuration/repair checks. No MCP handshake, tool discovery,
native client launch, model evaluation or human usefulness was observed. Names
and booleans supplied for a target are not independently observed installation
or launch evidence. Native status/list commands can start servers and retain the
normal trust/approval boundary. No paid API, credentials or network execution.

Paired guides include executed stdin examples and dated primary-source links;
the installed recipe stays independent of development OpenSpec. Markdown is
excluded by Prettier: link, translation and whitespace checks are recorded at
closure. No site behavior changed, so a fresh browser matrix is outside this packet.

## Closure

The independent reviewer checked final logs and consolidated acceptance: 98 exact
payloads/modes, self-tests, 15 CLI cases, portable 3/3, separately approved single
apply, 14 unrelated files/modes, isolated usage only and no server sentinel or
command attempts. Final evidence verdict: **Ship**. All six tasks and four local
tickets are complete. Root independently matched all 99 frozen files (including
manifest) with the receipt and current distribution. Strict specs and whitespace
passed; 635 local Markdown destinations across 75 affected/new/research documents
were checked with none missing, with six adjacent OpenSpec translation pairs.
