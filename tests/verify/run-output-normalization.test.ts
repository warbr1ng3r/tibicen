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
