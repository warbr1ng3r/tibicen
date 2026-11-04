# Design

## Context

See [proposal](proposal.md) and [dated review](../../../../docs/research/2026-11-04-landing-review/README.md). Astro renders both languages through shared components and `localize`; installation already has accessible selectors and a SHA-pinned published command. Tests cover built HTML and browser interactions. No new framework or dependency is needed.

## Goals / Non-Goals

Keep the visual system and existing installation/preset behavior. Implement L1–L6 without L7–L10, memory marketing, new support promises or an interactive simulator. The owner already authorized implementation; this record makes that work reviewable.

## Decisions

- Reword the hero in the shared component so two skills and new/existing projects are explicit in both languages. Preserve approval before changes.
- Replace the abstract result with short semantic HTML init/adopt illustrations. Show starting files and meaningful relevant snippets, natural prompts, inspection, a justified question or no question, a small exact diff, approval and final report. Label the entire section illustrative and keep unverified next-session behavior honest. Static examples avoid invented live success and unnecessary state/JavaScript.
- Present a short ordered start route next to the existing command/controls. Keep npm/pnpm/Yarn choices and agent IDs unchanged. Keep one concise visible compatibility warning and move repeated release-engineering explanation to an accessible disclosure/link, retaining update/removal/checksum guidance.
- Add a compact “skill not found” path based on the current installation guide; label manual loading as assisted and do not execute installation during UI verification.
- Reduce mobile illustration footprint through existing responsive styles, preserving content at 320px and reduced motion. Compare the mobile hero and command positions with the recorded baseline, rather than claiming conversion improvements.

## Risks / Trade-offs

- Simpler copy could hide limits → retain one visible material warning before use and keep full compatibility details reachable.
- Illustration could look like evidence → visible illustrative labeling, realistic inputs and explicit unverified outcomes.
- Moving controls could break copying/accessibility → retain IDs and installation generator; verify all nine manager/agent commands and keyboard/mobile routes.
- A new memory candidate is under development → keep landing pinned to published 1.0 until a separately authorized release updates it.

## Migration Plan

One landing subagent owns `landing/src` and affected `tests/site`/`landing/e2e`; root owns this change, tracker and final integration. Run site unit/build and browser tests, inspect EN/RU desktop/mobile, then independent Ponytail review and fix findings. Record actual results, preserve review screenshots as baseline, and do not deploy, commit or publish without a later instruction.
