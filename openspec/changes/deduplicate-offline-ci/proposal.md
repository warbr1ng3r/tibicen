# Proposal

## Why

An update to an open feature PR runs the same offline gate for both push and pull_request. Each run then repeats type checks and site/skill builds through pnpm build after pnpm test already completed them.

## What Changes

- Run automatic push checks on main; retain pull_request and workflow_dispatch.
- Cancel outdated runs of this workflow for the same ref.
- Use pnpm test as the single complete build/test gate, followed by the existing external-directory distribution smoke check.
- Update English/Russian CI guides and the roadmap; retain every existing test and safety check.
- Keep the descendant-timeout fixture's normal startup allowance so it reaches the intended timed stage under suite load.

## Capabilities

### New Capabilities

- `offline-ci`: trigger selection and complete offline validation of development changes without repeated build stages.

### Modified Capabilities

None. Existing release-process safety requirements remain in force.

## Impact

Changes .github/workflows/ci.yml, one test fixture's startup limit and project documentation. No package scripts, dependencies, test-case selection, runtime or published release bytes change. The fixture's 800ms stage deadline and assertions stay intact. Feature branches without a PR use local checks or manual dispatch. Remote timing remains unverified until a published workflow run.
