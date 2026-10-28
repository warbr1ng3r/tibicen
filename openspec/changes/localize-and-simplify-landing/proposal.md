# Proposal

## Why

The published landing is Russian-only, repeats the same workflow across sections and separates installation from first use. Visitors lack direct project/documentation links and a concrete example of the final result. The owner requested English by default with Russian available and a simpler explanation.

## What Changes

- Serve English at the configured base route and Russian at `ru/`, with an ordinary language link visible on mobile and without JavaScript.
- Translate all page/component text, metadata, accessible names, validation and copy/download feedback. Preserve command arguments, agent IDs and preset data.
- Put installation and both first prompts together after the hero. Merge repeated explanations and show one clearly illustrative before/after and final report.
- Add source, release and canonical English guide links; explain tested/experimental installation targets and practical platform limitations beside installation.
- Keep the optional local preset, existing dark/green identity, graph behavior and license notices. No new dependencies or distributed-skill changes.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing-experience`: bilingual static routes and simpler, evidence-scoped first use with project exits.
- `landing-interactions`: localized accessible feedback while installation/preset behavior remains equivalent across locales.

## Impact

Astro pages/components, client copy/preset feedback, site unit/browser checks and adjacent English/Russian landing guides. Existing release tags/assets and the product CLI are unchanged. The old local-source installer scenario in the main specification is historical; the current public-delivery delta remains authoritative. This change preserves that actual pinned release command. Public deployment is a separate step.
