# Design

`runProjectChecks` remains the sole recording point. It normalizes the temporary project path, canonicalizes recognized runner timing records, then hashes the resulting output. Existing hashes are retained; baseline and final comparisons use the same current recording path.

Line-anchored replacements cover Node spec final timing suffixes, Node spec/TAP summaries and Python unittest summaries. TAP per-test timing is recognized only immediately after an `ok`/`not ok` result and its diagnostic opening. Replacements preserve CRLF, test names, counts and the rest of the output. Generic numeric, parenthesized or elapsed-time phrases remain untouched.

The returned whole-output token scrubber was rejected: `AssertionError: expected (1s)` and `(5s)` collapsed to the same failure, and both durations in a test name plus timing suffix were erased. Comparing exit codes alone and a general log parser are also unnecessary. Narrow record recognition keeps unsupported formats conservative instead of claiming all test runners are covered.

Review also found an existing comparison gap: identical output with exit code 1 changing to 2 was accepted as an unchanged failure. Require the same nonzero exit code as well as matching output; a red-before-fix regression covers this independently of normalization.

Tests cover a deterministic timing-only comparison through the recording site, changed duration-shaped assertion values, changed test names, CRLF TAP diagnostics, changed exit codes, and actual failing Node checks under both TAP and spec reporters. Previously saved hashes are neither rewritten nor claimed to use the new normalization.
