Tibicen 1.5.6 keeps implementation facts from silently changing the user's decisions.

- Generated memory-maintenance policies preserve the user's intended meaning and scope until the user explicitly changes them.
- If code disagrees with a decision, agents are instructed to record that discrepancy separately as an implementation fact, rather than invent an accepted exception.
- The clarification covers the surviving policy and both init/adopt examples, with a regression test.

Compatible guidance patch: no runtime/schema migration, new permission, dependency or background process. Existing project instructions are not rewritten automatically; review updates with tibicen-adopt. Back up local skill edits before replacing installed copies.

Verification: local gate 1,149 passed / 0 failed / 1 existing skip; 110 payload hashes and both standalone resource checks passed. Exact local update 1.5.5 → 1.5.6, repeat, edited-backup restoration and removal preserved project data and later memory notes.

A separate ZCode combined instruction/memory observation produced the intended behavior through ordinary work, correction and fresh reuse. Its next-call timing rule was breached and its original task snapshot was overwritten; the result is qualified behavioral evidence, not full protocol acceptance or proof of causality. Reading was assisted, consent synthetic, and worker traces unavailable. Autoload, human benefit and other-harness success are not claimed. All 108 nonmetadata payload files match that observed candidate; only generated versions and checksums changed for 1.5.6.

Source: 1dc382d2f92a438ec69877134ecc5c821b20928c
Distribution: 2c7cb6f50a36d5fc3ca29a127e83b194d1e2a169
