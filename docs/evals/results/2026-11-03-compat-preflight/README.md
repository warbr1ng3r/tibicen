# Compatibility preflight — 3 November 2026

Ticket 148 checked the current host's CLI metadata and executed only the conditional `1.0.0` candidate's first-party startup inspection and compatibility preparation functions. **No model, task, quiz, compatibility runner, installer or project application was started.** Approved auth variables: **none**; approved model budget: **$0**.

## Exact scope and binding

The conditional distribution archive SHA256 is `7fed7ad4d3e27cf169ac29384f0807b9beae5689e6df0dbd1b11bac499ec7e55`; inventory SHA256 is `37b384c03e7ea0b83a82960ec6512771d391c694ed312b60ac6b50ef26fa88a3`. The owned copy matched all **86 payload files plus inventory**. No archive link or special file was accepted. The original archive was read, not rewritten.

The imported candidate `scripts/compat/index.ts` hashes to `7bbabeff0a370678246776ef3e3a354e080d175a1a30b4bb32515a3125056e0a`; its matrix hashes to `97979c7c3a56fc8e4e2a4aef863e7cf11c88ecf214d9e88eaff6c4ab1e6e2cbd`. The selected first-party skill was copied to an owned project's `.claude/skills/tibicen-init/`. Its `SKILL.md` SHA256 is `9d0c81dfb488f64e27f97250d15722f5588a730c915a8852041707b0c26e692a`. The preparation request used the candidate inventory hash as its 64-character identity ref and the actual skill-file hash as `contentHash`; it is not an additional third-party skill trial.

## Current host observations

| Check | Actual result and limit |
| --- | --- |
| `claude --version` | **2.1.283 (Claude Code)**, exit 0, 0.072 seconds; candidate `agentSupport` accepts this exact version |
| `claude --help` | Exit 0, 0.083 seconds; all 13 startup/output/tool/budget flags named by the candidate preparation function are present |
| CLI execution conditions | Each metadata call ran once with a five-second timeout, its own initially empty HOME/config/cache/TMP and cwd, minimal environment, telemetry/nonessential traffic and automatic updating disabled, no auth variable passed |
| Host `ANTHROPIC_API_KEY` | Presence **false**, nonempty availability **false**; only these booleans were inspected |
| Permission | `envNames=[]`, available key names `[]`, `maxBudgetUsd=0`; availability would not itself authorize passing a key |
| Copied project | 43 files, no symlinks; actual candidate `inspectSkillStartup` returned `{ "safe": true }`; hashes before/after preparation matched |

Credential files, subscription login and keychain state were not inspected. No authentication was changed. Metadata checks do not establish model access or instruction loading. No OS-enforced network-isolation claim is made.

## Actual preparation outputs

Both calls below used the observed version, actual pinned skill path/hash and owned copy. `startupControlled` was deliberately **false**: the first-party inspector checks the project skill tree, while help and documentation do not establish a complete unexecuted native startup or the absence/effect of host-managed policy. The safe project-tree result is recorded separately rather than promoted to full startup control.

| Candidate function | Observed output |
| --- | --- |
| `prepareCompatCommand` for Claude | `status: unverified`, `reason: startup-uncontrolled`; no command |
| `prepareCompatProbe` for Claude | `kind: compat`, `status: unverified`, `loading: unverified`, `reason: startup-uncontrolled`; pinned identity/version retained; no command |
| `prepareCompatCommand` for Codex | `status: unverified`, `reason: headless-method-unverified`; candidate policy only, no Codex executable/version check |
| `prepareCompatCommand` for Cursor | `status: unverified`, `reason: headless-method-unverified`; candidate policy only, no Cursor executable/version check |

The candidate checks startup before auth. Therefore this pass did **not** return `auth-unavailable`; the independently observed absent/unapproved API key remains a separate condition. No positive budget or auth variable was fabricated to force a ready command. No runner was supplied or called.

The current official [headless documentation](https://code.claude.com/docs/en/headless) and [CLI reference](https://code.claude.com/docs/en/cli-reference) were read on 2026-11-03. They distinguish bare mode, explicit added-directory skill loading and auth/startup flags. The headless page also qualifies some bare behavior before v2.1.286; current documentation was not substituted for observed behavior on local 2.1.283. These source reads and help flag names are metadata, not a live startup trace.

## Evidence and remaining work

Private source/copy bindings, two CLI stdout/stderr receipts, exact preparation inputs/outputs and preservation records are in `.evals-private/delegated-acceptance-20261103/compat-preflight/`. The preparation wrapper finished once with exit 0 in 0.117 seconds. It imports the copied candidate's functions; it does not use a mocked CLI, fake key or model-response fixture.

This substantiates an actual permitted **unverified compatibility outcome** under the stated conditions. It does not verify loading, a representative task, a quiz, all-agent compatibility or full MVP readiness. Positive skill/process use and current-candidate/profile evidence remain separate in the [engineering assessment](../../ENGINEERING_ACCEPTANCE.md). Native startup control would need its own sufficient evidence before any separately authorized execution; this pass grants no follow-up run, auth, spend or publication permission. Shared runtime, matrix, tracker, tasks and personal auth were unchanged by this work.
