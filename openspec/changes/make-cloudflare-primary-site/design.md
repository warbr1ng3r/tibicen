# Design

## Context

See [proposal](proposal.md). Cloudflare already has verified push deployment; GitHub Pages uses a manual workflow. Both previously built the entire Astro site. The maintenance JSON declares its legacy GitHub Pages channel.

## Goals / Non-Goals

Keep one maintained landing and the existing machine-readable endpoint. Do not migrate release data, disable Pages, rewrite historical evidence, change skills or add infrastructure dependencies.

## Decisions

Four tiny checked-in HTML pages use immediate meta refresh, a canonical URL and a visible link. A fixed-target inline script preserves query/fragment when JavaScript is enabled. Do not claim HTTP 301: these are static HTML redirects. Use the existing Pages workflow, copying these four files plus the canonical JSON into a fresh runner-temp directory; compare JSON bytes before upload. Retain manual publication so future checksum updates use the same review boundary.

Set the default Astro origin and expected test origin to Cloudflare; explicit build flags still support other origins/bases. Change package homepage, add primary links to EN/RU README and update current landing guidance. Keep dated deployment receipts as history.

## Risks / Trade-offs

- HTML redirects return HTTP 200 and depend on client navigation → include immediate meta refresh, canonical and a visible link; test real browsers with and without JavaScript.
- Retiring the checksum endpoint would break published references → leave its URL, source and bytes unchanged; verify direct public response after publication.
- Concurrent dirty work → implement/test in a worktree based on published main and publish only a reviewed explicit scope.

## Migration Plan

Run the complete offline gate and isolated browser checks. After a scoped commit grant, push the migration (Cloudflare auto-deploys), then dispatch the revised Pages workflow. Verify four old routes and unchanged JSON. Roll back by deploying the previous reviewed source if verification fails; no history rewrite is needed.
