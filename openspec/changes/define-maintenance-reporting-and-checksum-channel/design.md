# Design

## Context

See [proposal](proposal.md) and [requirements](specs/maintenance-channels/spec.md). The current [CoC](../../../CODE_OF_CONDUCT.md) promises an undesignated general private contact; [SECURITY](../../../SECURITY.md) already names the confirmed vulnerability recipient and enabled reporting route. The same-day research and reviewed proposal are recorded in 165 (`../../../.scratch/codex-zcode-acceptance/issues/165-review-maintenance-route-requirements.md`; private development record; excluded from public source) and 175 (`../../../.scratch/codex-zcode-acceptance/issues/175-propose-minimal-working-maintenance-routes.md`; private development record; excluded from public source). They did not verify Support-form delivery or a live checksum index.

The existing site is static Astro. Its public directory already carries assets/licenses; the shared Landing component supplies both languages and derives local URLs from BASE_URL. The manual Pages workflow builds and deploys the site separately from skill releases. Reuse these surfaces.

## Goals / Non-Goals

**Goals:** replace an unfulfilled later promise with a usable, honestly scoped policy; define what the original independent channel protects; make released bytes and warnings cross-checkable.

**Non-Goals:** a new private conduct recipient, alternate appointment, service/account/provider, notification test message, administrative independence, signature system or new release checklist. No technical feature/evidence requirement, historical result or execution budget changes.

## Decisions

### Keep one small operational change

The main inventory has no release-process spec: it is introduced in the active [release change](../prepare-first-public-release/specs/release-process/spec.md). A new maintenance-channels capability owns the concrete reporting/publication behavior, leaving that change's public-participation and immutable-byte requirements intact. This avoids a MODIFIED delta against an absent main requirement and a rewrite of the release change's dated history.

On implementation, add concise current cross-references in the release proposal/design and both translations, pointing tasks 3.1–3.2 to this operational definition without copying their checklist or checking them complete. Preserve monthly/event review, changed-recommendation init/adopt checks, privacy/license review and all full-MVP evidence/delivery obligations. The later general conduct-inbox promise is explicitly changed; it is not retrospectively called fulfilled. Current status guides must distinguish adoption from an actually working channel. Retrospective archives remain records, not approval.

### Use exact recipients and keep the CoC short

Keep the CoC's opening respect/prohibitions, moderation powers, practical private explanations and reporter-identity protection. Replace only its recusal sentence and Reporting section. The following is the intended concise English replacement, with root-relative SECURITY link when applied:

```markdown
A maintainer involved in a report must not decide a complaint about their own conduct.

## Reporting

Use repository [issues](https://github.com/warbr1ng3r/tibicen/issues) and
[pull requests](https://github.com/warbr1ng3r/tibicen/pulls) for ordinary
contributions and nonsensitive public moderation questions. These are public
conversations visible to the confirmed maintainer
[@warbr1ng3r](https://github.com/warbr1ng3r). Do not post sensitive allegations,
private information or vulnerability details.

For violations of GitHub's platform rules on GitHub, use
[GitHub's abuse-reporting route](https://docs.github.com/en/communities/maintaining-your-safety-on-github/reporting-abuse-or-spam).
Private reports go to GitHub Support, not Tibicen's maintainer. Support handles
platform rules, not every project rule or conduct outside GitHub.

The project has no general private conduct inbox or appointed alternate, and
cannot provide independent project handling of a complaint about its sole
confirmed maintainer. Do not disclose sensitive details publicly to compensate.

Report vulnerabilities privately through [SECURITY.md](SECURITY.md) and
[Report a vulnerability](https://github.com/warbr1ng3r/tibicen/security/advisories/new),
to the confirmed security recipient [@warbr1ng3r](https://github.com/warbr1ng3r).
```

GitHub Support is an existing platform recipient, not a newly appointed project handler. Keep threat-model/approval discussion in this design and maintenance guide rather than expanding the CoC. Retaining the old general private promise instead would require a real willing recipient and conflict procedure; neither exists in the evidence. Do not infer an email, organization-only reported-content feature, or private conduct role from the security appointment.

### Define publication independence precisely

Source: landing/public/maintenance/index.json. Public destination after authorized deployment: https://warbr1ng3r.github.io/tibicen/maintenance/index.json. Use one canonical data file with short EN/RU guide/footer labels, not duplicate hash records by language. Add a base-aware link in the existing Landing component; retain static/no-account access.

The index is separately committed source and a Pages publication on a different HTTP origin from release attachments. Record the exact site/source revision, index-byte hash and deployment receipt outside the index, avoiding a self-referential commit/hash field. GitHub/repository administration is shared. This covers an altered release attachment or distribution when the separately retained Pages record remains trustworthy; it does not cover compromise of both by the shared administrator/provider, an initially compromised source, or replace a code audit. Another provider/account is not mandated by the authored requirement. A second URL for the same release attachment is insufficient.

### Publish facts, preserve old records

Use a small JSON object with schema version, channel/independence description, versions and warnings arrays. Each version has its version, actual publication date, full source/distribution commits, release notes, exact payload-manifest URL/SHA-256 and versioned archive name/URL/SHA-256; the manifest carries per-file payload sums. Full commits pin source and distribution trees; SHA-256 binds exact downloaded manifest/archive bytes. No moving latest/main URL substitutes for those bindings.

The [published alpha record](../../../docs/evals/results/2026-10-27-alpha-release/results.json) supports a truthful initial 0.1.0-alpha.1 entry: source e0f59a55c7ce7581e402c3e270aa162fa1e0dc52, distribution db03ebc988af1e38ea9f62c02027945ba40660fc, payload-manifest SHA-256 35f743a56b47e4f25743da5d6b6a1e606fb719b3382372384124094711e1b2dc and archive SHA-256 95d62ec9b8a2fdf78a47122a9fd8c16d58bbb8a6d2a2af564db4b3006e6bb606. Verify those actual asset bytes/URLs and publication date before publishing the entry; do not substitute current local alpha-version bytes or the conditional 1.0 draft. A factual release date is sufficient; do not invent a more precise timestamp.

Use an empty warnings array if no notice is evidenced. Future version entries are added only after actual publication with exact candidate/source/distribution/assets and limits. Unavailable facts remain in private preparation notes, never angle-bracket/TODO/dummy hashes, fake warnings or a public 1.0 row in publishable data. Preserve prior version/warning objects; add stable dated warning IDs, affected versions, concrete safe action and optional superseding version/warning. Correct a wrong published entry by appending a warning, not silently rewriting it. Retain old tags and released bytes.

## Risks / Trade-offs

- A valid local file can still be undeployed or stale → keep local preparation and actual public byte verification separate; an existing Pages home page is insufficient.
- Same-admin compromise can alter both publications → state the limited independence guarantee beside the channel, without claiming a stronger trust root.
- A reporting link can require sign-in or be tool-inaccessible → record actual accessibility and official recipient/scope; do not claim form rendering or notification delivery from a documentation page. Do not submit a test report or expose private details.
- Inconsistent guides can retain the old private-inbox promise → update current EN/RU CoC, SECURITY, CONTRIBUTING, README, RELEASING, MAINTENANCE and current readiness references together. Preserve dated reports/history; explain the prospective change in current text.

## Migration Plan

Implement only after independent proposal review and a new apply instruction. First align policy/guides and add the index with real alpha facts; run focused data, link, immutability and project-base static checks. Keep existing manual deployment and release procedures.

Actual Pages publication requires separate explicit authority. After it, compare returned index bytes with the reviewed source/build, bind deployment/source revision, verify each named manifest/archive and record route accessibility/untested delivery. Failure leaves the affected route/channel criterion open. Update maintenance evidence only to the observed scope; release tasks 3.1–3.2 and full acceptance close only when all their own obligations are met. If publication is unavailable, retain the local result without a working-channel claim. Corrections use new source/site revisions and appended warnings; old release records are not erased.
