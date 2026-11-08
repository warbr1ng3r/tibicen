# Design

## Context

See [proposal](proposal.md). The verifier has one shared literal-pointer matcher and already limits which instruction files it reads.

## Decisions

Treat `#` as a valid terminator after the exact canonical memory path. This recognizes same-file fragments without introducing Markdown parsing, resolving URLs, checking section existence or changing read/write permissions. Keep every existing prefix and filename-suffix guard.

## Risks / Trade-offs

The check remains lexical structural evidence. It does not prove that a heading exists or an agent loaded it. Actual-verifier tests cover same-file fragments, other destinations and read-only file/mode preservation.
