# Native working and memory cycle after recovery repair

| Work | Status | Owner |
| --- | --- | --- |
| [Freeze the prospective caller](issues/01-caller.md) | resolved | none |
| [Review and run independent controls](issues/02-controls.md) | resolved | none |
| [Observe and grade the native cycle](issues/03-observations.md) | resolved | none |
| [Integrate results and review](issues/04-integration.md) | resolved | none |
| [Preserve native CLI command recovery](issues/05-cli-recovery.md) | resolved | none |
| [Correct the memory-read measurement proxy](issues/06-read-evidence.md) | resolved | none |
| [Observe the two remaining memory actions](issues/07-remaining-cycle.md) | resolved | none |

| Phase | Requested behavior | Status |
| --- | --- | --- |
| R1 | Read project memory, add batching and tests under the existing decision | native passed; original automated grade rejected a complete compound-command read |
| R2 | Correct the accepted limit, code, tests and memory; retain unrelated decisions | stopped under original grading protocol |
| R3 | Read the corrected memory in a fresh session and explain the result | stopped under original grading protocol |

| Explicit amendment | Status |
| --- | --- |
| Same R1 candidate after observed instrument correction | 8 tests + 14 cases passed; independent exact-read review Ship; original frozen grade still failed |
| C1: remaining correction, 150 seconds | completed once in about 50 seconds; four replaces seven, unrelated notes preserved; grade and independent semantic review passed |
| C2: remaining fresh read, 90 seconds | completed once in about 36 seconds; current memory read, [4, 4, 4, 1] answer verified; all seven files unchanged; grade and independent review passed |

The bounded effort is complete. Three native observations used once within the
original 420-second cap; none remain and no retry occurred. The current combined
source freeze passed independent Ponytail review and 1002 tests/one existing
manual skip. The read-evidence amendment passed 32 model-free controls. Original
R1 grading remains failed; its corrected assessment is explicitly after
observation on the same bytes. Published skills remain unchanged at 1.4.1.
