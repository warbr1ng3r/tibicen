# Landing verification — 4 November 2026

Implemented locally; not committed, pushed or deployed. The public site and installation pin still describe published 1.0.0. This record covers L1–L6 only; [review recommendations](../../../../docs/research/2026-11-04-landing-review/README.md) L7–L10 remain outside the batch.

## Observed checks

- Site build and 41 site unit checks passed. Astro reported no errors and two existing `execCommand` hints; targeted ESLint/Prettier passed.
- The browser suite passed 86 checks with one pre-existing Firefox mobile skip. It covered the nine manager/agent command combinations, EN/RU routes, keyboard controls, no-JavaScript content, optional presets/privacy, reduced motion and narrow reflow.
- The new first-use cases passed across Chromium, Firefox and WebKit. At 390×844, the installation section moved from approximately y=954 to y=777 and the card from y=1423 to y=1093. EN/RU widths 320 and 390 had no horizontal overflow. At 320, section/card positions were approximately 817/1133 for EN and 909/1248 for RU; these positions are not a conversion or performance measurement.
- Six affected Chromium baselines were inspected and updated for the intentional layout change. Test tolerances were not relaxed. Root additionally inspected the English 390px hero and installation images.

## Independent Ponytail review

Verdict: **Ship**. Connected components, install generation/copy/preset handlers, EN/RU examples, tests and desktop/mobile images were reviewed. The published SHA and 1.0 labels, visible loading/Windows warning, illustrative labeling and unverified future-session outcome were retained. No new JavaScript state, account, analytics, network submission or memory-feature claim was introduced.

The only cleanup was unused `.requirements` CSS after removing its markup. Root deleted those rules and the unused font selector. The final repository gate checks that cleanup with the integrated source; no rendered element used those selectors.

## Limits

No installation command was executed, preset data submitted or public deployment performed. Physical assistive technology, a formal accessibility certification and human comprehension/conversion were not evaluated. The native disclosures and existing semantics remain; browser checks do not establish real-agent loading. Root's global integration and separate project-memory acceptance are recorded with their own outcomes.
