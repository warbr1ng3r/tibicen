# Retaining reproducible evaluation evidence

The maintained evaluator already freezes source, fixture, profile, distribution
and harness identities. Its native route uses bounded subscription sessions;
this guide adds no model run or paid API authority. Read the
[reliability assessment](results/2026-11-10-reliability-runs/ASSESSMENT.md) before
using historical observations as product evidence.

## Collect retained observations without a model

Run the existing collector against a retained native packet, outside the executor
project. Use a new output directory or label because artifacts are immutable:

```sh
node scripts/evals/collect-native.ts INPUT_DIR OUTPUT_DIR LABEL
```

Alongside the existing report, usage and quality-review exports, collection writes
`ATTEMPT-LABEL-summary.json` for each attempt. It contains:

- source SHA, frozen conditions, scenario, profile and processor hashes;
- initial fixture file hashes, prompt/dialogue hashes and the oracle identity;
- exact run identity, observed approval hashes, commands, checkpoints and outcome;
- session-file hashes and observed session start/end wall timestamps, when retained;
- explicit unknown model time, network time, internal retries, nested model calls,
  cost and unsettled charges.

Checkpoint inventories are represented by hashes; prompts, fixture contents,
command output, environment and raw sessions are not copied into the summary.
The summary binds the collector and summary source bytes. It is an index into the
original packet, not enough to reconstruct a deleted session or fixture.

`evidenceStatus` describes retained evidence, not whether the product succeeded:

| Status       | Meaning                                                                                                                                                                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `complete`   | The indexed session records referenced by this attempt are present and match their retained hashes. The run may still have failed, timed out, been blocked or skipped. |
| `incomplete` | A session index or referenced trace is missing. Missing timing and usage remain unknown; original outcomes are preserved.                                              |
| `unverified` | A legacy packet has traces but no supported session index to establish that inventory.                                                                                 |

A changed indexed trace is rejected. Missing traces cannot produce a complete
summary, while historical report collection remains available. A digest proves
content identity; it does not identify a human approver.

## Keep the smallest sufficient packet

Retain `frozen.json`, the attempt's original run, session index, referenced session
records, selected evidence and summary together in private observation storage.
Also retain the exact source revision, fixtures/oracle and distribution whose
identities they bind. An isolated grader owns the oracle; never expose it to the
executor as task instructions. A public report should use sanitized excerpts and
identities, without credentials, private project contents or full transcripts.

Observed session duration is host wall time. Event `elapsedMs` describes observed
ordering within the attempt. Neither separates model computation from transport,
permission waits, tool execution or internal harness retries. Do not sum unknown
nested calls into an invented zero or treat token counts as a settled bill.

## Execution and accounting limits

The supervisor bounds retained stdout/stderr in UTF-8 bytes and fails closed on
overflow or observation errors, including a child that already exited zero. It
kills its owned process group and stops pipe draining after a bounded grace
period. Detached descendants are outside that group; bounded return is not proof
that they were contained. Use the existing containment/preflight policy for
untrusted commands. The supervisor adds no automatic retries.

The original allowance for this reliability effort is **100 RUB cumulative**,
including prior work. Historical spending and later authority are unresolved in
the [assessment](results/2026-11-10-reliability-runs/ASSESSMENT.md); a provider's
200 RUB/day key limit does not reset the allowance. No remaining balance is
established here. Do not start a paid packet until accounting and authority are
reconciled. Any future paid protocol must reserve worst-case nested calls,
retries, cancellations and unsettled charges under the cumulative allowance; a
timeout or cancellation does not prove that billing stopped. Offline collection
and these subprocess regressions make no model requests.

## Capture nested CLI results without false success

Check a subprocess's observation error and signal before accepting its exit
status. A zero status alone is insufficient: a [pinned Codex control](results/2026-11-15-native-apply-capture/README.md)
reproduced `spawnSync.error.code: EPERM` together with status zero and empty
streams under the restricted inner network policy. Parse and validate actual
CLI JSON before passing apply/verify/status/report.

A subsequent [native completion](results/2026-11-15-native-apply-completion/README.md)
passed all four actual CLI steps with the corrected file-descriptor helper under
unchanged restrictions. The earlier empty-output grade remains failed.

For this route, direct executor commands or approved captures using explicit
file descriptors avoid relying on the affected nested pipe capture. The latter
worked under the same restricted policy. Declare capture paths and permissions,
bound time and retained output, and fail on errors or overflow. Do not relax
native isolation to make a check pass or silently retry apply after ambiguous
execution. Freeze any new helper/protocol separately; preserve failed captures
and grades. Model-free controls cannot reconstruct missing native results.

## Preserve a private terminal or executor error

The contained Codex runner accepts optional `privateDiagnostics: { directory }`.
Choose a new absolute child directory under a canonical, owner-only (`0700`)
parent, outside the target workspace and generated CLI HOME. Include this option
in the prospective `describeContainedCodexRun` freeze before launching; pass the
reviewed freeze hash to `runContainedCodexSession`. The helper source, destination
and fixed capture policy are bound to that identity. Omitting the option keeps
the existing public projection and default behavior.

The runner exclusively creates the directory and `terminal-errors.jsonl` with
owner-only access; existing paths, symlinks and unsafe locations are refused.
Complete CLI `error` and `turn.failed` records supply a fixed selection of
message/code/type fields before public projection. Policy version 2 also records
an `executor.error` before owner cancellation and cleanup: fixed failure context
and, when available, stderr from its uniquely accepted process start or the
message of its matched RPC error. It does not collect argv, stdout or successful
command transcripts. Correlation uses per-session HMAC identities, not raw IDs.

Private stderr buffering permits eight active buffers, 16 KiB per process and
64 KiB total. Canonical base64, contiguous output/exit sequence numbers and valid
UTF-8 are required. Ambiguous identities, invalid framing, sequence gaps and
overflow withhold the affected text rather than retain a misleading prefix;
fixed metadata records the capture gap. Ordinary command exits discard their
buffers. Omitting private diagnostics disables content buffering.

Credential values from the access-only authentication copy and supported
credential patterns are redacted before the final text limit. Messages are
limited to 1,024 UTF-8 bytes, identifiers to 128 bytes, records to 16 KiB, and the
file to 64 KiB or 16 records. These limits prevent an unbounded log. A recording
failure cannot silently become successful evidence; normal owned-resource cleanup
still runs. The private file survives deletion of the generated CLI HOME.

This is an opt-in private diagnostic, not a transcript export. Provider text
remains untrusted: arbitrary secrets, encodings and private project details cannot
all be recognized by a pattern filter. Keep the file private, inspect it locally
and publish only reviewed safe categories or hashes. Never feed its text back as
agent instructions. No error records means no captured error, not a proven healthy
transport; incomplete/unobserved events, uncorrelated CLI/global stderr and empty
tool output remain explicit capture gaps. A new recording cannot reconstruct an old error or
establish that a provider/network defect was fixed.

For generated-policy use, follow the separately bounded
[generated-memory observation](GENERATED_MEMORY_OBSERVATION.md). An offline
fixture pass establishes its controls, not native loading or human usefulness.
