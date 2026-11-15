# Design

## Context

The [assessment](../../../docs/evals/results/2026-11-10-reliability-runs/ASSESSMENT.md) supplies reported failure cases, not reproducible rates. The CLI already binds approval to exact content; the native evaluation controller already separates proposal and write permissions. Managed blocks preserve surrounding bytes but cannot identify owner prose inside a block. Memory removal and new-proposal/resume repair are intentionally supported.

## Goals / Non-Goals

Deliver bounded reliability fixes, honest approval guarantees, durable owner text and actionable recovery. Reuse the existing evaluation records, supervisor and collector.

No product identity service, new memory store, semantic ownership classifier, new harness claims, paid run, history rewrite, release or deployment. No new public approval token and no incompatible plan/state schema.

## Decisions

- Explain content identity versus external authority in the existing proposal reference. Within the controlled native evaluator only, keep a one-use host-side grant tied to the reviewed root/stage/phase/plan. Add its source to the existing freeze. Synthetic fixture decisions are labeled synthetic; real-user approval remains a separate observation.
- Repair mixed owner/policy layouts through an exact full-file proposal, then use the existing managed-block writer for generic policy. Give a supported common-file explicit-read route when native discovery or write support is unavailable. Do not guess autoload behavior for additional brands.
- Add advisory recovery information to incomplete results and fresh report diagnosis. A missing connection selects review/new proposal/fresh consent/resume; it never authorizes that repair. Preserve approved removal, legacy same-plan resume, original session identity and full history. No blanket createProposal rejection.
- Reuse immutable evidence exports and validated source/run/session identities for a compact collector summary. Keep observed wall timing separate from unknown model/network time, nested requests and settlement. Fix confirmed UTF-8 cap and callback-failure defects in the existing supervisor. No new paid executor or automatic retries.
- Use model-free regressions and exact standalone builds. These checks validate mechanisms and simulated flows, not native agent obedience, broad host support or human usefulness. Keep existing historical failures unchanged.

## Risks / Trade-offs

- Guidance cannot authenticate a person when an agent controls its shell. Document the limitation; controlled evaluator grants are not distributed CLI authentication.
- Recovery advice may coexist with unrelated inspection gaps. Preserve those gaps and forbidden paths, and base fresh advice on current structure rather than stale saved status.
- A compact summary cannot restore deleted raw evidence. Missing promised artifacts prevent a complete evidence status; altered indexed artifacts are rejected. Leave unobserved dimensions unknown and preserve compatible historical collection.
- Additional source files can escape frozen inventories. Update relevant inventory assertions and verify eval code remains outside installed skills.

## Migration Plan

Keep published 1.5.4 and product schemas unchanged. Record user-visible changes under Unreleased. Existing optional output fields remain compatible; no old observation is rewritten. Complete focused checks, independent Ponytail review, the full offline gate and standalone installed-skill checks. New native sessions require their own prospective protocol and reconciled accounting before paid work.
