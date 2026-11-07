# Design

## Context

See [proposal](proposal.md). Every file under recognized project skill roots is correctly inventoried as infrastructure. `scanProject` currently uses that same broad flag for mode selection, so a complete project-local Tibicen install selects improve even without user setup.

## Goals / Non-Goals

Change only route selection. Preserve every scanned file, hash, mode, infrastructure flag, harness observation, memory candidate and read exclusion. Keep physical project emptiness and proposal/application permission gates independent. Do not exclude traversal, infer authenticity, add an override flag or change the distributed skill workflow.

## Decisions

Use the existing recognized shared/native skill-root semantics and exact reserved folder names `tibicen-init` and `tibicen-adopt` for the route-only exception, including nested roots. Other names and roots remain conservative. Name recognition is not trust or proof of upstream bytes: those files remain fully visible and protected. Reusing the broad infrastructure flag for write permissions remains unchanged.

## Risks / Trade-offs

- A locally customized canonical Tibicen folder still receives the route hint; its files remain inventoried and every edit still requires consent. Renamed copies conservatively select improve.
- An installed skill makes the directory physically nonempty. Initial route must not grant starter application writes or package/Git initialization; existing guards must be tested.
- Bare unregistered memory remains a candidate under current behavior; registered memory or a manifest still selects improve. This change does not broaden memory recognition.

## Outer owner correction — 8 November

A canonical-name example inside an already recognized user rules/commands/instructions/MCP directory belongs to that earlier owner. Check the earlier path prefix with the existing infrastructure classifier before applying the inner skill-name route hint. Ordinary Markdown-instruction and JSON leaves exercise the currently supported directory grammars without adding a second root catalog. This corrects a missed nested-owner case; it does not change trust or write authorization.
