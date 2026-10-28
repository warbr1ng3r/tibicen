# Design

## Context

See [proposal](proposal.md) and the source/public-page audit (maintainer-local record; omitted from public source). The current single index.astro owns Russian copy and page structure. Installation, preset, illustration, Features accessibility text, app.ts feedback and preset.ts validation also contain Russian. Existing static tests inspect one page; browser navigation assumes a root URL. The Pages workflow already supplies Astro site/base.

The repository's owner-supplied English-canonical documentation convention takes precedence over the older Russian-only planning context. These artifacts have Russian translations; links in both languages point to the English canonical files. The OpenSpec validator permits only spec.md inside capability folders, so the two spec translations live beside this design as landing-experience_ru.md and landing-interactions_ru.md.

## Goals / Non-Goals

**Goals:** one shared layout, complete translation of visible/assistive/error paths, static navigation and testable behavior at both root and project bases.

**Non-Goals:** locale detection/redirects, remembered language, in-place language changes, translation dependencies, new agent targets, product/runtime changes, new live model runs or deployment. Changing language navigates to a separate static page and resets unsaved form answers; this is acceptable for an optional builder.

## Decisions

1. **Two thin routes and one page component.** Extract the existing page into a shared Landing.astro with a typed `en | ru` prop; use index.astro and ru/index.astro wrappers. Generate ordinary links from BASE_URL and put the language control outside the mobile-hidden navigation. Client-only swapping would leave Russian defaults without JavaScript; two copied layouts would drift.
2. **Keep page copy separate from client messages.** Use a small typed two-locale copy module for server-rendered content and a small client message table selected from html.lang. Pass locale/localized labels into existing components. Translate every preset rejection branch while preserving error field identity. Do not send the complete marketing catalog to the client or introduce a general translation framework.
3. **Presentation only.** Keep installationCommand and schema values stable. Page locale never becomes stack_hint.language; call the form field Programming language. Keep manager/agent choice where commands differ and show tested/experimental scope nearby. No unsupported Other target.
4. **Reorder existing blocks.** Hero → Get started (install + init/adopt prompts) → compact workflow and illustrative before/after/report → short FAQ → collapsed optional preset → source/docs/release/license footer. Remove floating explanatory duplication and the full-size manifest card. Preserve the hero graph, reduced-motion behavior, one labelled project illustration and local resources.
5. **Truthful evidence and links.** Show limited alpha, verified macOS/Node24/Codex delivery, experimental other targets and Windows execution limits. Link to existing English README/release/results rather than embedding development history. The result example is illustrative, never proof of generic acceptance. Preserve the actual pinned public release command; the older main-spec ./dist scenario is not revived.
6. **Proportionate checks.** Validate both static pages and target-page anchors, resolving directory routes to index.html relative to each current page. Keep existing interaction/geometry checks, add focused Russian/error/download/copy and no-JavaScript switching scenarios, all validation branches as pure tests, and a real project-base build/preview browser smoke. Do not multiply every browser/locale/31-width combination.

## Risks / Trade-offs

- Missing translated hidden strings → cover all validation branches, accessible labels, noscript and forced copy failure, not just headings.
- Wrong nested/base links → per-route static checks plus browser switching/assets/control checks at a non-root base.
- Longer Russian controls overflow → inspect representative RU phone/desktop sizes and retain full existing responsive checks.
- Snapshot noise → update only affected visual references after inspection; retain behavior assertions rather than deleting checks.
- Source/history privacy → future public rollout uses the established sanitized publication route; never push local development history.

## Migration Plan

Implement and verify locally, then complete independent ponytail-review and fixes. Public deployment and any new commit require their own authorized step. Future deployment keeps the current English root URL and adds ru/; rollback restores the previous static artifact. Published skill tags/assets remain immutable.
