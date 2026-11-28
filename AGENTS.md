# Development instructions

- Use pnpm 11.21.0, pinned in package.json, with the repository's pnpm-lock.yaml and scripts.
- Read docs/PRODUCT_VISION.md for product scope and MVP boundaries.
- Use OpenSpec for substantial behavior changes: keep requirements, scenarios and tasks with the change. Small copy and CSS edits can proceed directly.
- Keep the roadmap in docs/DEVELOPMENT_PLAN.md when it exists; do not duplicate detailed change tasks there.
- Treat archived changes marked retrospective as reconstructed records, not proof of prior approval or execution.
- Do not create commits or rewrite history unless the user explicitly requests it.
- Carry authorized tasks through implementation, review and required checks; progress updates are not stopping points. Resolve routine steps independently and continue available work when another part is blocked. Ask only for a necessary missing decision or action outside the user's authorization.
- OpenSpec and its generated development skills must not become dependencies of the distributed Tibicen skills.
- For ticket selection, parallel work, and integration, read docs/agents/issue-tracker.md and the current effort it links.
- For project documentation changes, follow the language and translation convention in CONTRIBUTING.md.

<!-- tibicen:begin v1 -->
Before preparing a release or making a change that depends on a prior project decision, read the relevant entries in `.agents/memory.md`.
During authorized work, record standing decisions with their scope and source. Keep verified implementation facts separate and update the decision only when the owner changes it. Keep task progress in the issue tracker.
<!-- tibicen:end v1 -->
