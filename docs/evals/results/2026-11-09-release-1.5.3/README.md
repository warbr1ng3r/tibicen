# Tibicen 1.5.3 release report

**Local candidate checks passed; publication is pending.** Candidate 1.5.3 is frozen. Public source/platform checks, pinned public delivery, publication and deployment remain pending; none is claimed here.

This compatible patch addresses two concrete inspection defects. Structural checks now recognize a Markdown fragment on a link to the registered memory file while preserving the exact store and safe-read boundaries. Read-only project commands accept an explicit per-operation forbidden-path list, including recovery, report evidence and supported local MCP checks. The supplied scope is combined with unfinished-plan exclusions; it is not a persistent project ACL. Required internal metadata cannot be excluded while continuing that operation.

Installed guidance also distinguishes mandatory external human actions from instruction reading and future checks that an available agent can perform. Existing pending plans and finalization rules are unchanged. The separate [normal-workflow observations](../2026-11-08-normal-workflows/README.md) retain their earlier failures, corrected-checker continuation and working-build proposal; they are not new 1.5.3 native acceptance.

## Candidate checks

| Check | Current result |
| --- | --- |
| Versioned full gate and frozen distribution | 1,067 passes, one existing skip; build passed; standalone 3/3; 110 payload files and 111 archive files/modes verified |
| Local 1.5.2 → 1.5.3 installation, replacement, repeat, recovery and removal | Passed once: four installer calls and both installed self-tests; 1.62 seconds including owned cleanup |
| Both copied candidate skills: fragment and scoped-read behavior | Passed once: 12 CLI checks and four explicit-home core calls; 1.56 seconds; both setups complete |
| Source CI, six platform cells and pinned public delivery | Pending |
| Publication, returned assets and Pages | Pending |

The candidate archive SHA-256 is `1636a3acf2580137c4deb53e47d6ef481fe1201473ded169e58c0471a56faefb`. Local delivery preserved complete edited backups, application files, later memory, sibling skills and settings. Copied checks retained the registered memory fragment and explicit read scope after finalization, rejected traversal, preserved project/home/runtime bytes and modes, and removed both owned roots.

The local checks use synthetic projects and isolated owned homes. Installer permissions are not an OS sandbox. Delivery self-tests and copied CLI checks establish their declared technical behavior, not automatic instruction loading, human usefulness or compatibility with every harness/model. No new native or paid API call is part of this release-check lane. See [installation and recovery](../../../INSTALLATION.md) and [project memory](../../../PROJECT_MEMORY.md).
