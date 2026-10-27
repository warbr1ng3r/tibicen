# Design

## Context

See [proposal](proposal.md). package.json already makes pnpm test build the site and both skills before running all Node tests. The following pnpm build repeats those stages and type checks.

## Goals / Non-Goals

Keep the full existing gate. Fixture caching, selective test gates and package-script refactoring are outside this bounded change.

## Decisions

- Filter push to main, keep all pull_request events and manual dispatch. This avoids querying PR state or expanding token permissions.
- Use concurrency group `${{ github.workflow }}-${{ github.ref }}` with cancel-in-progress. PR merge refs, main and manually selected branches have independent groups; the workflow name separates Pages.
- Remove only the workflow's pnpm build step. The existing unpack/checksum/empty-PATH self-tests consume the output produced by pnpm test.
- The first full gate reached 667/668: the descendant-timeout test skipped its model stages after the shared boundary probe failed under a 600ms launch budget. A controlled 700ms startup delay reproduces that skip. Inherit the fixture's normal 3000ms startup budget while retaining the 800ms stage limit and all exit/timeout assertions.

## Risks / Trade-offs

Feature branches without a PR lose automatic push checks; local pnpm test and manual dispatch remain available. Changes to package.json's full gate must keep the documented build prerequisites. Local success does not confirm GitHub event delivery or a remote timing improvement.

## Migration Plan

Publish through the ordinary review workflow when authorized, then inspect PR and main runs. Reverting the workflow restores the previous triggers and repeated build. Product and release artifacts remain unchanged.
