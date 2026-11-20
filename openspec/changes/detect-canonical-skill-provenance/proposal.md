# Proposal

## Why

Worker-2's reproduced A5-i3 defect: `scan` decides "installed canonical Tibicen
skill" from the skill directory name only
(`scripts/scan/index.ts`, `installedTibicenSkill`). A noncanonical lookalike
placed at `proj/.agents/skills/tibicen-init/` (mimicked name and frontmatter,
different content, no distribution identity) is lexically treated as an
installed canonical skill, so the project's foreign skill files do not count as
foreign infrastructure and scan returns `mode: "init"`, losing the documented
improve/unknown-provenance hint. This diverges from the frozen catalogue A5
oracle: "A separate similarly named or third-party skill control retains its
documented improve hint. Names are not treated as provenance." Repro receipt:
packet `evidence/A5-i3/a2-20261119/cli/scan-controller.json`.

Every Tibicen distribution build since the first committed release
(0.1.0-alpha.1) writes `<skill>/package.json` carrying `{ "name":
"tibicen-init" | "tibicen-adopt", "version": <string> }` (`scripts/build.ts`);
the frozen 1.7.1 candidate contains the same marker in both skills. The
distribution therefore already carries a content identity that a name-only
lookalike does not.

## What Changes

- Scan establishes an installed canonical Tibicen skill by the identity the
  distribution itself carries: a `package.json` inside the skill directory
  whose `name` equals the canonical skill name and whose `version` is a
  nonempty string. The directory name alone no longer suffices.
- A lookalike directory named `tibicen-init`/`tibicen-adopt` without that
  marker is foreign infrastructure: its files count like any other user or
  third-party skill, so the documented improve hint is retained.
- Genuine canonical installs of every published version keep the previous
  behavior (their layout always includes the marker).
- Existing scan fixtures that encoded the name-only assumption (bare
  `SKILL.md` under a canonical name) are updated to the genuine distribution
  layout; no runtime contract for saved sessions, manifests or presets changes.

## Capabilities

`agent-infrastructure-lifecycle`: canonical installed skills are identified by
carried identity, not directory names.

## Impact

Source change in `scripts/scan/index.ts` only (detection helper plus marker
read during the existing bounded file read); tests in `tests/scan/scan.test.ts`
fixture updates plus a new regression. The scan result shape is unchanged; only
`mode` classification for marker-less lookalike directories changes (init →
improve for those directories alone). Projects with a real Tibicen install, a
manifest, or no Tibicen-named directories are unaffected. A lookalike that
copies the full identity marker verbatim remains indistinguishable offline from
canonical content; this change fixes name-only spoofing, not byte-level
impersonation (that would require pinning known-version content hashes, a
separate decision). The A5-i3 executor observation against the frozen 1.7.1
candidate is not regraded by this Unreleased fix.
