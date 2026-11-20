# Tasks

- [x] 1.1 Record the reproduced defect and its evidence receipt (packet
  `evidence/A5-i3/a2-20261119/cli/scan-controller.json`); confirm every
  distribution build since 0.1.0-alpha.1 carries the `package.json`
  name+version identity marker.
- [x] 2.1 Collect canonical skill directories during the existing bounded scan
  read by parsing canonical-named skill `package.json` markers; malformed or
  non-matching markers stay non-canonical without inventing gaps.
- [x] 2.2 Require the collected canonical set in `installedTibicenSkill` so the
  scan mode decision uses carried identity, not the directory name; preserve
  the documentation-example guard and all other scan behavior.
- [x] 3.1 Add the lookalike regression (mimicked name/frontmatter, no marker →
  improve; with genuine marker → init) and a third-party-name control.
- [x] 3.2 Update existing scan/apply fixtures that encoded the name-only
  assumption to the genuine distribution layout.
- [x] 3.3 Prove the new regression fails on the pre-change implementation via
  a disposable old-implementation copy under the packet evidence scratch;
  retain the failure output.
- [x] 4.1 Run focused checks: scan tests, the new regression, `tests/core`, and
  affected eval fixtures; lint, typecheck and strict OpenSpec validation for
  this change; record actual counts and exits.
- [x] 4.2 Keep the honest limit in wording: name-only lookalikes are distinguished,
  verbatim marker copying remains indistinguishable offline; the frozen A5-i3
  observation is not regraded.

## Codex integration review — 20 November

- [x] 5.1 Reproduce cross-directory marker collisions, bind the canonical set to
  complete project-relative paths, and retain root/nested/sibling regressions.
- [x] 5.2 Restore a genuine marked base install in the existing negative fixture
  so each extra infrastructure path determines the improve result.
- [x] 5.3 Complete independent re-review, the merged gate and standalone checks;
  record the original packet and corrected integration separately.
