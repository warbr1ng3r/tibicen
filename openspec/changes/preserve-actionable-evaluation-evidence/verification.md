# Verification

Date: 15 November 2026, Europe/Moscow. Base revision:
`31f87d993e76bbf546643211980c628c365500f0` plus the pre-existing reviewed
Unreleased reliability changes and this change. Published 1.5.4 is unchanged.

## Implementation checks

- Existing architecture/resource and memory guidance checks: 7 passed.
- Generated-memory fixture controls: 6 passed, independently repeated; separate
  Ponytail review accepted the pure helper, projection and paired protocol.
- Private diagnostics: actual callback red regressions reproduced missing retained
  messages, overlapping-secret suffix leakage and complete-EOF/write-failure gaps.
  Fixed tests cover fixed-field selection, credential redaction before truncation,
  exclusive owner-only storage, unsafe destinations, bounds, source/destination
  freezes, default projection, valid EOF and genuinely truncated events.
- Final required `pnpm test`: **1119 total, 1118 passed, 0 failed, 1 existing skip**.
  This includes lint, formatting, types, site build, strict OpenSpec validation,
  distribution build and offline tests. Browser tests were not rerun: no site
  behavior changed in this package.
- Outside-checkout standalone copies: all **110 payload hashes** matched;
  both skill resource self-tests passed with isolated HOME and empty tool PATH.
  Evaluation/private-capture/generated-fixture/OpenSpec development tooling was
  absent from the distributed skills.
- Payload inventory SHA-256:
  `7d2b52de840072b08f8983106611257b5211c96d57a3a41afe49b63138665f90`.

Private local check records are in `.scratch/actionable-evidence-20261115/`.
They are not required to read the public requirements or conclusions.

Independent Ponytail/security review accepted the final diagnostic implementation,
including longest-first secret matching and complete terminal JSON at EOF.

Final independent Ponytail/evidence review accepted both paired result reports,
the protocol adjustment, roadmap and tracker without material findings. Root
rechecked **98 private artifact hashes and 146 rendered local links across
20 documentation files**, plus public-path privacy and explicit formatting.
Strict active and archived OpenSpec validation passed. No runtime source changed
after the full offline gate.

## Native observation

Exact phase inputs, candidate, controller sources, private capture policy and
limits were frozen before launch and independently reviewed.

- The [original generated-memory packet](../../../docs/evals/results/2026-11-15-generated-memory-observation/README.md)
  stopped after two native calls. Generation produced a suitable two-file plan
  in 94.5 seconds: unchanged starter code, generated `AGENTS.md`, selected
  `.agents/memory.md`, and no init-only editor restriction. Native application
  stopped after 19.9 seconds with an executor `sandboxDenied: true` result.
  Its failing command and final container contents are unverified; usage is
  missing. No later phase of that packet ran, and the cause is not established.
- A separate frozen, model-free real-RPC control passed in 3.7 seconds. UID/GID
  1000 could read/write `0600` and `0644` files, including through a Node child.
  Exact-plan `apply → verify → status → report` all returned exit 0; both generated
  files matched approved bytes/modes and four starter files were unchanged.
  Cleanup passed. This is controller application, not native-agent apply success.
- A separately reviewed [three-task follow-up](../../../docs/evals/results/2026-11-15-generated-memory-task-followup/README.md)
  used those actual generated files after controller application. All three
  fresh native sessions completed: initial work 52.1 seconds, ordinary correction
  34.1 seconds and fresh corrected work 41.6 seconds. Each passed **4/4 independent
  functional checks and 4 project tests** in a separate model-free owned executor.
  Captured tool output includes actual policy/memory reads. The current decision
  changed from “On the house” to “Included”, retaining its reason, explicitly
  superseded history and the exact unrelated account-number restriction.
- First and final fresh tasks received only six allowlisted files, an identical
  ordinary prompt without a memory hint and no installed Tibicen, history,
  controller or oracle. The final task reset application source and tests to
  the approved unfinished starter; the distinguishing decision occurred only
  in actual corrected memory. This is a declared controlled fork, not proof
  of uninterrupted worktree behavior, automatic loading or causal human benefit.
- The first task legitimately updated observed implementation facts in memory.
  The frozen preparation helper's unchanged-memory assertion was too strict
  for correction input. A separately reviewed projection copied its actual
  accepted six-file output unchanged; the preparation deviation, source hash
  and exact input inventory were bound before correction GO. The frozen helper
  was not rewritten and is not claimed to have prepared that phase.
- Across the two native packets: **5 calls, 242,262 ms caller time**, no retries
  or new paid API calls. The new three-task packet reported **184,884 input /
  2,831 output tokens**. The old failed-call usage and full subscription cost
  remain unknown; no cross-packet token quota is claimed. All native containers,
  grade containers and owned generated homes were cleaned up. Earlier evidence
  and the frozen controllers retained their hashes.

The original sandbox cause remains open. Bounded executor-boundary diagnostics
are the next evidence seam to improve before expanding native apply coverage;
the successful controls do not justify a speculative product fix. Native
interrupted repair, wider harness behavior and human usefulness remain separate
follow-ups. No further native session is part of this closed observation.

## Boundaries

Original Codex and ZCode observations remain unchanged. The old unknown failure
is not explained by this implementation. Private provider text remains untrusted;
known-value/pattern redaction cannot guarantee arbitrary-secret detection.
Missing, malformed or unobserved events and stderr-only errors remain explicit
capture gaps. No automatic retries, new paid API calls, version bump, commit,
push or publication are included.
