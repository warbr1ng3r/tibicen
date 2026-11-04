# Current product and public user problems

Labels: wayfinder:map
Status: resolved
Assignee: none

## Destination

Record what published Tibicen 1.1.0 actually does and investigate public first-person problems it could address while remaining a small utility. The owner requested documentation and internet research, not implementation, a new release or a commit.

## Decisions so far

- Research date: 5 November 2026 (Moscow). Preserve the released product and earlier evidence; no new model evaluation, paid API, authentication or publication scope.
- Three parallel research lanes own separate EN/RU files. Root owns the current-capability snapshot, integration and source/claim checks.
- Reuse the [earlier investigation](../../docs/research/PUBLIC_AGENT_SETUP_EVIDENCE.md) as history, verify current source access, and distinguish new findings from repeated anecdotes.

## Tickets

- [Record current capabilities and synthesize priorities](issues/00-capabilities-and-synthesis.md)
- [Investigate instruction loading and context problems](issues/01-instructions.md)
- [Investigate memory and decision continuity](issues/02-memory.md)
- [Investigate setup, integrations and safe maintenance](issues/03-setup.md)

## Boundaries

Public read-only research and repository documentation only. First-person reports establish reported experiences; vendor docs establish documented behavior. Neither proves prevalence, causality, willingness to pay or Tibicen benefit. Proposals remain proposals.

## Completed results

- [Capabilities and synthesis](issues/00-capabilities-and-synthesis.md): published 1.1 snapshot, 30-page study, bounded priorities and independent review complete.
- [Instruction scope](issues/01-instructions.md): separate configuration, expected/observed loading and actual compliance.
- [Memory continuity](issues/02-memory.md): preserve one project decision file, explain corrections; no new store justified.
- [Setup maintenance](issues/03-setup.md): explain ownership/environment; avoid cross-client deletion or managed-cache writes.
- Research proposes clearer existing init/adopt diagnosis first; implementation requires its own change. Checks passed; product remains unchanged.
