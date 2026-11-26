import test from 'node:test';
import assert from 'node:assert/strict';
import {
  compareChecks,
  canonicalizeRunOutput,
} from '../../scripts/verify/index.ts';
import { hashContent } from '../../scripts/core/contracts.ts';

const run = (
  id: string,
  exitCode: number,
  output: string,
  commandHash = 'same-command',
) => ({
  id,
  exitCode,
  outputHash: hashContent(canonicalizeRunOutput(output)),
  commandHash,
  timedOut: false,
});

const nodeFailure = (testDuration: string, totalDuration: string) =>
  `✖ adds (${testDuration}ms)\n` +
  `  AssertionError [ERR_ASSERTION]: expected 5\n` +
  `ℹ tests 1\nℹ pass 0\nℹ fail 1\nℹ duration_ms ${totalDuration}`;

test('canonicalizeRunOutput replaces volatile duration tokens only', () => {
  assert.equal(
    canonicalizeRunOutput('ℹ duration_ms 60.366875'),
    'ℹ duration_ms <t>',
  );
  assert.equal(
    canonicalizeRunOutput('duration_ms: 60.366875'),
    'duration_ms: 60.366875',
  );
  assert.equal(canonicalizeRunOutput('✔ adds (0.2985ms)'), '✔ adds (<t>)');
  assert.equal(
    canonicalizeRunOutput('Ran 2 tests in 0.001s'),
    'Ran 2 tests in <t>s',
  );
  assert.equal(
    canonicalizeRunOutput('elapsed 12ms after 1.5s took 3s'),
    'elapsed 12ms after 1.5s took 3s',
  );
  assert.equal(
    canonicalizeRunOutput('error at src/app.mjs:12:5'),
    'error at src/app.mjs:12:5',
  );
  assert.equal(
    canonicalizeRunOutput('expected value 5ms but got 7ms of payload'),
    'expected value 5ms but got 7ms of payload',
  );
});

test('identical failing node --test runs compare as pre-existing-red despite differing durations', () => {
  const result = compareChecks(
    [run('node-test', 1, nodeFailure('0.703459', '61.447167'))],
    [run('node-test', 1, nodeFailure('0.526375', '55.298041'))],
  );
  assert.equal(result.status, 'pre-existing-red');
  assert.deepEqual(result.newRegressions, []);
});

test('a real output change between failing runs still reports changed-failure', () => {
  const result = compareChecks(
    [
      run(
        'node-test',
        1,
        nodeFailure('0.703459', '61.447') + '\nfirst failure',
      ),
    ],
    [
      run(
        'node-test',
        1,
        nodeFailure('0.526375', '55.298') + '\nother failure',
      ),
    ],
  );
  assert.equal(result.status, 'unverified');
  assert.equal(result.reason, 'new-regression');
  assert.equal(result.newRegressions?.[0]?.reason, 'changed-failure');
});

test('identical failing python unittest runs compare as pre-existing-red despite timing line', () => {
  const failure = (t: string) =>
    `FF\n======================================================================\nFAIL: test_nonempty\n----------------------------------------------------------------------\nAssertionError: mismatch\n\nRan 2 tests in ${t}s\n\nFAILED (failures=1)`;
  const result = compareChecks(
    [run('unittest', 1, failure('0.002'))],
    [run('unittest', 1, failure('0.004'))],
  );
  assert.equal(result.status, 'pre-existing-red');
});

test('a different nonzero exit code remains a changed failure despite matching output', () => {
  const result = compareChecks(
    [run('check', 1, 'same diagnostic')],
    [run('check', 2, 'same diagnostic')],
  );
  assert.equal(result.status, 'unverified');
  assert.equal(result.reason, 'new-regression');
  assert.equal(result.newRegressions?.[0]?.reason, 'changed-failure');
});

test('duration-shaped assertion values remain meaningful failure differences', () => {
  for (const [before, after] of [
    [
      'AssertionError: retry deadline expected (1s)',
      'AssertionError: retry deadline expected (5s)',
    ],
    ['AssertionError: expected took 1s', 'AssertionError: expected took 5s'],
    ['AssertionError: duration_ms: 10', 'AssertionError: duration_ms: 20'],
  ]) {
    assert.equal(canonicalizeRunOutput(before), before);
    assert.equal(canonicalizeRunOutput(after), after);
    const result = compareChecks(
      [run('assertion', 1, before)],
      [run('assertion', 1, after)],
    );
    assert.equal(result.reason, 'new-regression');
    assert.equal(result.newRegressions?.[0]?.reason, 'changed-failure');
  }
});

test('TAP timing records normalize while test names and assertion durations survive', () => {
  const tap = (time: string, expected: string) =>
    `TAP version 13\r\nnot ok 1 - deadline (${expected}s)\r\n  ---\r\n  duration_ms: ${time}\r\n  error: 'expected (${expected}s)'\r\n  ...\r\n# duration_ms ${time}\r\n`;
  assert.equal(
    canonicalizeRunOutput(tap('1.25', '5')),
    canonicalizeRunOutput(tap('2.50', '5')),
  );
  assert.notEqual(
    canonicalizeRunOutput(tap('1.25', '5')),
    canonicalizeRunOutput(tap('2.50', '10')),
  );
  assert.equal(canonicalizeRunOutput('  duration_ms: 10'), '  duration_ms: 10');
  assert.notEqual(
    canonicalizeRunOutput('✖ timeout (1s) (1.25ms)'),
    canonicalizeRunOutput('✖ timeout (5s) (2.50ms)'),
  );
});

const pytestSummary = (counts: string, t: string) =>
  `FAIL tests/test_x.py::test_a - assert 1 == 2\n========== ${counts} in ${t}s ==========\n`;

test('canonicalizeRunOutput replaces only complete pytest summary timing records', () => {
  assert.equal(
    canonicalizeRunOutput(
      '================== 1 failed in 0.42s ==================',
    ),
    '= 1 failed in <t>s =',
  );
  assert.equal(
    canonicalizeRunOutput('==== 1 failed, 2 passed in 0.03s ===='),
    '= 1 failed, 2 passed in <t>s =',
  );
  assert.equal(
    canonicalizeRunOutput('= no tests ran in 0.01s ='),
    '= no tests ran in <t>s =',
  );
  assert.equal(
    canonicalizeRunOutput('==== 2 failed in 92.00s (0:01:32) ===='),
    '= 2 failed in <t>s =',
  );
  assert.equal(canonicalizeRunOutput('1 failed in 0.42s'), '1 failed in 0.42s');
  assert.equal(
    canonicalizeRunOutput('3 warnings in 0.42s'),
    '3 warnings in 0.42s',
  );
  assert.equal(
    canonicalizeRunOutput('AssertionError: timeout after 0.42s'),
    'AssertionError: timeout after 0.42s',
  );
});

test('identical failing pytest suites over a minute compare as pre-existing-red', () => {
  const slow = (t: string, clock: string) =>
    `FF\n============ 1 failed, 1 warning in ${t}s (${clock}) ============\n`;
  const result = compareChecks(
    [run('pytest-slow', 1, slow('60.05', '0:01:00'))],
    [run('pytest-slow', 1, slow('61.28', '0:01:01'))],
  );
  assert.equal(result.status, 'pre-existing-red');
  assert.deepEqual(result.newRegressions, []);
});

test('identical failing pytest runs compare as pre-existing-red despite summary timing', () => {
  const result = compareChecks(
    [run('pytest', 1, pytestSummary('1 failed', '0.42'))],
    [run('pytest', 1, pytestSummary('1 failed', '0.43'))],
  );
  assert.equal(result.status, 'pre-existing-red');
  assert.deepEqual(result.newRegressions, []);
});

test('a real pytest output change still reports changed-failure', () => {
  const result = compareChecks(
    [run('pytest', 1, pytestSummary('1 failed', '0.42'))],
    [run('pytest', 1, pytestSummary('2 failed', '0.42'))],
  );
  assert.equal(result.status, 'unverified');
  assert.equal(result.reason, 'new-regression');
  assert.equal(result.newRegressions?.[0]?.reason, 'changed-failure');
});

// Pytest redistributes its separator padding to keep a fixed terminal width.
const framedPytestSummary = (duration: string) => {
  const text = `1 failed in ${duration}`;
  const fill = '='.repeat(Math.floor((80 - text.length - 2) / 2));
  const line = `${fill} ${text} ${fill}`;
  return line + (line.length < 80 ? '=' : '');
};

test('pytest timing width changes do not change a failing result', () => {
  for (const [before, after] of [
    ['9.99s', '10.00s'],
    ['59.99s', '60.05s (0:01:00)'],
    ['86399.99s (23:59:59)', '86400.05s (1 day, 0:00:00)'],
  ]) {
    const result = compareChecks(
      [run('pytest', 1, framedPytestSummary(before) + '\r\n')],
      [run('pytest', 1, framedPytestSummary(after) + '\r\n')],
    );
    assert.equal(result.status, 'pre-existing-red');
    assert.deepEqual(result.newRegressions, []);
  }
});

test('non-clock text after pytest-like timing remains a meaningful difference', () => {
  const before = '==== 1 failed in 0.42s (expected 1, got 2) ====';
  const after = '==== 1 failed in 0.42s (expected 1, got 3) ====';
  assert.equal(canonicalizeRunOutput(before), before);
  assert.equal(canonicalizeRunOutput(after), after);
  const result = compareChecks(
    [run('pytest', 1, before)],
    [run('pytest', 1, after)],
  );
  assert.equal(result.newRegressions?.[0]?.reason, 'changed-failure');
});
