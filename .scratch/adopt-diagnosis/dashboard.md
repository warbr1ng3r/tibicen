# Adopt diagnosis — implementation dashboard

5 November 2026 (Moscow). Both changes implemented, independently reviewed,
verified and archived. All tickets resolved. Unreleased.

| Scope                                          | Owner | Status   | Evidence                                                                                        |
| ---------------------------------------------- | ----- | -------- | ----------------------------------------------------------------------------------------------- |
| [Contract/integration](issues/00-integrate.md) | none  | Resolved | Additive read-only diagnosis, shared verify scope, four CLI regressions                         |
| [Core](issues/01-core.md)                      | none  | Resolved | Pure projection, nine tests; exact frozen bundle/hash checks updated                            |
| [Rules](issues/02-rules.md)                    | none  | Resolved | Four instruction files; existing resource and behavior checks retained                          |
| [Documentation](issues/03-docs.md)             | none  | Resolved | Four paired illustrative flows and Unreleased pointers                                          |
| [Independent review](issues/04-review.md)      | none  | Resolved | Five findings fixed; re-review Ship; 780 passed, zero failed, one skip; build/standalone passed |

Detailed tasks: [OpenSpec](../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/tasks.md).

| Follow-up                                                               | Owner | Status   | Evidence                                                                              |
| ----------------------------------------------------------------------- | ----- | -------- | ------------------------------------------------------------------------------------- |
| [Workflow closure](issues/05-close-workflow.md)                         | none  | Resolved | Exact additive spec sync, 8/8 tasks archived, independent Ship                        |
| [Standalone lifecycle](issues/06-standalone-lifecycle.md)               | none  | Resolved | Portable 3/3 and twelve copied-CLI memory invocations passed                          |
| [Nested connection core](issues/07-nested-memory-connections.md)        | none  | Resolved | Two predicate edits; before 5 pass/3 fail, after 45/45 focused                        |
| [Nested connection docs](issues/08-nested-memory-docs.md)               | none  | Resolved | Six paired paths, format/parity/links passed                                          |
| [Nested connection integration](issues/09-nested-memory-integration.md) | none  | Resolved | Independent Ship; 798/798, zero skips; build and six copied-distribution cases passed |

Correction tasks: [OpenSpec](../../openspec/changes/archive/2026-11-05-detect-nested-memory-connections/tasks.md).

Actual outcomes, retained failures and limits: [verification](../../openspec/changes/archive/2026-11-05-clarify-adopt-diagnosis/verification.md).
No version change, commit, publication or new native-agent observation was performed.
