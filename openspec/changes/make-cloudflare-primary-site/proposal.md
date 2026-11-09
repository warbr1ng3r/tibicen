# Proposal

## Why

The approved Cloudflare site already deploys automatically. Keeping a second full landing on manually deployed GitHub Pages produces inconsistent public entry points. The owner approved making Cloudflare primary while retaining the existing checksum endpoint.

## What Changes

- Use tibicen.pages.dev in current product links, package homepage and the default static build metadata.
- Replace the four GitHub Pages landing/builder routes with small static redirects, preserving language and page type, with a visible fallback link and operation without JavaScript.
- Keep maintenance/index.json at its existing GitHub Pages URL, byte-identical to the canonical source; do not migrate or rewrite its channel or release records.
- Adapt the manual GitHub Pages workflow to publish only redirects and the index. Cloudflare automatic deployment remains unchanged.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `landing-experience`: one primary public origin and continuity for legacy entry routes and the checksum endpoint.

## Impact

Landing metadata/configuration, package homepage, paired current guides, legacy static HTML, GitHub Pages workflow and focused tests. No skill/runtime, release version, paid service or account change. Publication is authorized; new commits require explicit permission because the earlier commit grant named only two automation files.
