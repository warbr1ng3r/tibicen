# Generated memory: a bounded observation protocol

**Prepared 15 November 2026, Europe/Moscow; prospective, not an execution result.**
Offline fixture checks do not establish native policy generation, loading,
memory use or human benefit. Published 1.5.4 and earlier observations retain
their own identities and limits. This protocol belongs to the
[actionable-evidence change](../../openspec/changes/preserve-actionable-evaluation-evidence/proposal.md).

## Question and distinguishing decision

Can Tibicen generate a useful memory policy from an ordinary need, apply the
reviewed setup, then leave ordinary agents able to use and correct its memory
without an installed Tibicen?

The small `receipt-lines` project has a working ordinary-price formatter and
an unfinished receipt-line function. The natural setup request asks to remember
that a zero-price item is shown as **“On the house”**, not a numeric amount, and
that receipts must not include customer account numbers. There is initially no
instruction file or memory store. The agent must generate those through an
actual Tibicen proposal; the controller must not supply a finished policy or
manually seed memory to rescue the observation.

A later ordinary request changes the zero-price wording to **“Included”** with
its reason. The fresh-task prompts, starter source and visible tests contain neither
answer. The approved instruction entrypoint may explain reading/updating memory
and its path, but must not repeat the distinguishing decision itself.

## Reuse the existing execution boundary

Root owns any native launch. Reuse the maintained subscription Codex profile,
contained-session runner, process supervisor, controlled inputs and exact
controller approval. Do not add a runner, model provider, installer or paid API
route. A local controller grant is synthetic consent, not a human approval
observation; tool access and a matching digest alone do not identify an approver.

Before launch, freeze the actual source base plus uncommitted input inventory,
built payload hashes/modes, helper/test hashes, CLI binary/version, configured
model, profile/startup/permissions, every phase prompt and its file/mode
inventory. Bind the reviewed proposal digest and before/after hashes before
apply. Use the newly built candidate; do not reuse an older observation's hash
as if it covered current changes. A missing identity or unsupported controlled
route blocks execution.

The scorer, original setup dialogue, correction dialogue, prior model replies,
proposal records, manifests/state, command captures and evaluation helper source
stay controller-only. No worker receives the whole fixture or controller object.
In particular, an executor scenario can still contain setup dialogue after
oracle removal; do not reuse that object as fresh-task input.

## Five phases, no reserve attempts

| Phase                   | Worker input and permitted work                                                                                                                                                                                     | Required evidence before continuing                                                                                                                                                                                                                           |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Generate             | Four starter files, the natural setup request and the current standalone `tibicen-init`. Read/project inspection and proposal; no application writes or setup apply.                                                | Actual CLI proposal, exact diff and generated policy/memory. Root independently checks the memory criterion, selected connection, unrelated decision, owner authority and application preservation. No silent controller rewrite of the policy.               |
| 2. Apply                | The same candidate and starting project, the reviewed exact plan and a separately issued synthetic controller approval.                                                                                             | Actual native `apply`, structure-only `verify`, `status` and `report` JSON with exit codes, session identity and returned files. Check exact approved bytes/modes and expected service writes; generated memory and its instruction connection must be valid. |
| 3. Fresh work           | Only allowlisted approved project outputs and one generated `AGENTS.md` entrypoint, in a fresh skill-free context. The prompt asks to finish receipt lines and add basic tests; no memory hint or setup transcript. | Controller functional outputs distinguish the memory decision from the plausible numeric default. Retain a direct memory-read path/hash/tool event when observable. Missing direct-read evidence remains unverified.                                          |
| 4. Ordinary correction  | A fresh skill-free context with the actual returned working project. The user changes the wording to “Included”, gives the reason and asks to keep it for later work.                                               | Ordinary work updates the formatter and selected memory without Tibicen. Independently inspect current decision semantics and preserve a frozen unrelated memory passage byte for byte; retain actual functional results and read/write observations.         |
| 5. Fresh corrected work | A fresh skill-free context with the approved pre-task source, original generated entrypoint and actual returned corrected memory. Use the same ordinary task prompt as phase 3.                                     | The scorer rejects both numeric defaults and the old “On the house” behavior. Retain the corrected memory identity, unrelated passage and available direct-read evidence.                                                                                     |

**Controlled reset:** phase 5 deliberately restores source, README and visible
tests from the approved setup snapshot while retaining the actual phase-4
memory. Phase 3 uses that same pre-task snapshot. Earlier implementations are
not forwarded: otherwise the corrected answer could already be present in code.
This is a controlled fixture fork, not uninterrupted same-worktree execution or
a claim of causal effect on arbitrary projects. Freeze the reset inventory and
disclose it in the result. Keep phase 4's actual outputs separately.

Fresh work has no installed Tibicen, skill directories, parent transcript,
controller tests or original proposal. Preserve only the approved generated
entrypoint and selected project memory alongside application files. Do not
modify its policy manually to manufacture a positive result. If native setup
does not produce the required connection/decision, record that outcome and stop.

## Finite resources and stopping

- Maximum **5 fresh subscription sessions**, concurrency **1**, no reserved or
  automatic caller retries. Each launched phase counts, including failure.
- **180 seconds per phase; 900 seconds cumulative caller time.** Enforce through
  the existing supervisor/deadline and clean up owned resources on stop.
- Stop admitting phases at **600,000 reported input tokens** or **40,000 reported
  output tokens** cumulatively. Missing usage prevents the next phase; unknown
  is not zero. Record the CLI's actual usage fields and accounting scope.
- Those token thresholds are admission stops, **not a verified hard provider
  token quota**: current in-flight usage may overshoot before it is observable.
  No unsupported token-cap flag or monetary guarantee is implied. A requirement
  for a hard token quota blocks this route until supported enforcement exists.
- Zero new paid API calls. Missing required receipts, invalid approval, failed
  mandatory preservation/function checks, deadline or unsupported isolation
  stops the packet; do not repair through hidden extra sessions or a fallback
  provider. Optional read-event absence stays an explicit evidence gap.

## Small controller-only fixture API

The pure [fixture helper](../../scripts/evals/generated-memory-fixture.ts) has no
execution, file writes or model calls:

```ts
const setup = generatedMemorySetup(); // four files + natural request; no policy
const task = prepareGeneratedMemoryTask(approvedSetupFiles, selectedMemoryPath);
const correctionPrompt = generatedMemoryCorrection();
const fresh = prepareGeneratedMemoryTask(
  approvedSetupFiles,
  selectedMemoryPath,
  actualReturnedCorrectedMemory,
);
const verdict = scoreGeneratedMemoryTask('corrected', observed);
```

`approvedSetupFiles` is the exact returned approved setup, frozen before ordinary
work. The optional third argument must be the actual returned memory text, not
controller-authored notes. Root must bind `selectedMemoryPath` to the reviewed
`proposal.memory.path` and freeze both snapshots against the native session;
supported-path membership alone cannot authenticate that choice or its origin.
The projection validates the unchanged starter,
requires a generated instruction connection to a supported selected memory path,
allows only those files, and rejects either answer literal outside memory after
case, NFKC and whitespace normalization. This is a conservative literal check, not general semantic
information-flow analysis; root still reviews the policy and all staged inputs.

After the worker ends, collect these actual outputs through the existing
controlled functional-check boundary, without giving expected values to a model:

```ts
const observed = {
  zero: formatPrice(0),
  ordinary: formatPrice(1250),
  refund: formatPrice(-250),
  line: receiptLine({ title: 'Notebook', cents: 0 }),
};
```

The ordinary task explicitly keeps `formatPrice` as the shared formatting
entrypoint, so the zero-price probe checks that requested contract rather than
requiring an unasked receipt-only implementation choice.

The controller-only scorer checks all four outputs; it does not grade memory
preservation, correction semantics or read events. Synthetic offline controls
must pass the initial and corrected behaviors, fail the numeric default and
fail the old behavior against corrected memory. Tests also reject answer-bearing
entrypoints/source and demonstrate that the task projection omits oracle,
transcript, captures, installed skills and prior implementations. Synthetic
policy strings in those tests are not native-generated policy evidence.

## Record the outcome without upgrading the claim

Keep source/payload/fixture identities, exact approval, actual CLI outputs,
before/after file and mode inventories, permitted service effects, functional
outputs, available read events, usage, failed attempts, stop reasons and cleanup.
Freeze the unrelated memory passage after native generation; root reviews the
correction's meaning separately from literal preservation. A past decision may
remain explicitly historical; two contradicting current rules do not pass.

Initial explicit SKILL reading is assisted loading. Later prompts contain no
memory hint, but file presence and successful output alone do not prove automatic
startup loading, a particular native read or model compliance in other sessions.
Report generation, approved application, functional task behavior, observed
reads, correction and reuse as separate outcomes. Missing captures are missing
evidence. This packet has no ordinary-agent baseline, human usefulness result,
product reliability rate or all-agent support claim. Follow the
[retention rules](REPRODUCIBLE_RUNS.md) and retain failed historical packets.

## Separate controller-applied task observation

On 15 November, the original packet stopped after generation and an executor
denial during native application. It stays stopped; its three unused phases
are not resumed. A separately frozen model-free real-executor control applied
the exact generated proposal successfully. See the
[dated observation](results/2026-11-15-generated-memory-observation/README.md).

A distinct prospective question may now use those actual controller-applied
files: can fresh ordinary agents use the generated memory, correct it and reuse
the correction without Tibicen? This does not supply native-agent application
evidence. The generated policy and memory must remain byte-for-byte unchanged
at admission; no controller-authored memory or policy repairs are allowed.

The separate packet has exactly three task sessions, no retries or replacement
packet, with the same declared source reset and isolated scoring controls above.
Across both packets, retain the two earlier calls and their caller time: at most
**five native calls and 900 caller seconds**, concurrency one, at most 180 seconds
per new call. Three separately admitted model-free grades have a 20-second
container deadline each. New paid API calls remain zero.

The earlier failed call has unknown usage. Therefore the original 600,000/40,000
admission policy remains an unmet condition of that stopped packet, and no
cross-packet token cap or complete cost is claimed. The new packet has its own
reported-usage admission stops of 200,000 input and 20,000 output tokens; they
are not hard quotas and an in-flight call can overshoot. A new failure or missing
usage stops the new packet. Freeze this changed question, provenance, resource
scope, controller sources and actual phase inputs before launch, and report its
outcomes separately from the stopped native workflow.
