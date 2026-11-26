# Design

`runProjectChecks` remains the sole recording point. One additional line-anchored
replacement runs inside `canonicalizeRunOutput` after the existing rules: a line
that consists solely of `=+ <summary words and counts> in <duration>s =+` keeps its
counts and words. The duration becomes `<t>`, its optional timedelta clock is
removed, and separator padding becomes a fixed `= … =` frame. Pytest varies that
padding with the displayed duration to fit terminal width; preserving it would
still misclassify digit- and minute-boundary crossings.

The rule accepts pytest's framed summaries (`========== 1 failed in 0.42s ==========`,
`==== 1 failed, 2 passed in 0.03s ====`, `= no tests ran in 0.01s =`) and nothing
else: an unframed `3 warnings in 0.42s`, assertion values like
`AssertionError: timeout after 0.42s`, test names and counts are untouched, and any
change in the summary counts themselves (`1 failed` → `2 failed`) remains a
`changed-failure`. Since pytest 6.2.0, suites longer than a minute append a
human-readable clock to the duration (`in 60.05s (0:01:00)`); the bracketed clock is
part of the volatile token and is dropped with the digits. Only a clock shaped as
`H:MM:SS`, optionally preceded by `N day, ` or `N days, `, is accepted; arbitrary
parenthesized diagnostics remain strict. Thus minute-crossing suites
compare by their stable content (review finding 1). Quiet-mode (`pytest -q`) prints
the summary without the `====` frame; unframed summaries stay strict by design
because they are indistinguishable from duration-shaped assertion values. CRLF
endings are preserved by the same `(?=\r?$)` guard the existing rules use.

Alternatives rejected: normalizing every `in <number>s` phrase (re-introduces the
false-negative class the 1.7.1 review closed — duration-shaped assertion values),
and comparing exit codes only (drops meaningful output differences). Keeping the
recognition to complete framed summary records is the narrowest rule that repairs
the demonstrated misclassification.

Regressions run through the real comparison shape (`outputHash` over canonicalized
output, `compareChecks`): two tests fail on the unchanged base and pass with the
rule; changed-count and unframed-phrase cases stay strict.

Integration review added regressions that fail on the returned code: real
80-column padding changes and arbitrary parenthesized diagnostics. The separator
shape follows [pytest 8.3.5 TerminalWriter.sep](https://raw.githubusercontent.com/pytest-dev/pytest/8.3.5/src/_pytest/_io/terminalwriter.py).
