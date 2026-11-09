# Tibicen 1.5.4

Two focused guidance changes:

- Preserve supplied operation names, the subject of a remembered decision and the boundary of an accepted exception. Apply a clearly matching exception together with the remaining defaults; clarify unknown name relationships or genuine conflicts for the same operation.
- When project documentation, implementation and tests disagree, distinguish observed behavior from an accepted owner requirement before turning either into an instruction. Preserve application code and record an unresolved gap or ask a focused question.

There is no automatic code-over-documentation priority, new memory schema or inferred alias. Existing approval, write boundaries and memory-store choices remain unchanged.

Development-only native diagnostics retain allowlisted clues per event and recognize four pinned terminal-message forms. Raw error text is not exposed; aggregate precedence and stopping remain unchanged. This does not recover or regrade prior failed turns.

Candidate validation: 1,075 passing tests and one existing skip; three standalone checks; both copied CLI self-tests; local update from 1.5.3, repeated installation, edited-backup restoration and removal. In one fresh candidate-bound stock case, the agent generated working policy and compiled it with the actual CLI; exact operator application and a fresh useful task passed, including nine tests and an independent behavior oracle. This does not establish native application, automatic loading, causal improvement or wider harness support. The [release report](https://github.com/warbr1ng3r/tibicen/blob/main/docs/evals/results/2026-11-09-release-1.5.4/README.md) records subsequent delivery, native-observation and publication results with their limits.

Install the exact distribution:

```sh
npx skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/381c5d53972b53d60e9a134ec7f620bb7c35e6be -g --agent universal --skill tibicen-init tibicen-adopt --copy
```
