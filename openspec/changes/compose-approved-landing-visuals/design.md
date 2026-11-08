# Design

## Context

See [proposal](proposal.md). Owner approved private combined prototype D after viewing three options and requested the previously shown folder/clock marker. Current Astro components already share locale handling and native init/adopt selection. The prototype is a visual reference, not production code.

## Goals / Non-Goals

**Goals:** static localized composition, one source of copy/icon geometry where useful, retained examples and compact mobile hero.

**Non-Goals:** new browser state, framework/dependency, skill release, installation/preset change, copied prototype scripts or parallel native evaluation.

## Decisions

- Rewrite the hero tree in ProjectPreview; remove old stage radios/CSS. Group optional concepts without fixed memory/skills paths.
- Use small Astro components for the short conversation and boundary diagram where this keeps markup cohesive. Share only the small repeated folder/clock SVG if necessary; do not import a general icon package.
- Keep existing InteractionExamples data and native controls inside a default-closed details element below the short workflow. Moving markup retains exact example content and ordinary selection; replacing it with a simplified mock would lose useful detail.
- Adapt B/C for lower sections by dropping repeated project headers and optional-component lists. Installation, FAQ and preset order stays intact.
- Build through existing pnpm scripts; cover EN/RU, no-JS details/example switching, clipboard behavior and reflow with affected existing browser cases plus one meaningful regression.

## Risks / Trade-offs

- Rich hero height → preserve the existing mobile compactness check and adjust density without shrinking interactive targets.
- Hidden detailed content → native keyboard disclosure with clear localized summary.
- Example paths mistaken for guarantees → one example label and explicit optional grouping; no universal MEMORY.md or skill-folder promise.

## Migration Plan

Source/site-only commit after independent review and checks; curated public source excludes private history. Wait for exact source CI, dispatch existing Pages once, inspect deployment and returned built files. Rollback is a later source/site revert; published 1.5.2 skills and immutable assets remain unchanged.

Russian delta translation is kept as `spec_ru.md` in the change root; the CLI accepts only canonical `spec.md` inside capability delta folders.
