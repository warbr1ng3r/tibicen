import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  writeFile,
  stat,
  rm,
  readdir,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { externalMain } from '../../scripts/evals/external.ts';

const entry = fileURLToPath(
  new URL('../../scripts/evals/external.ts', import.meta.url),
);
const driver = fileURLToPath(
  new URL('./helpers/external-driver.mjs', import.meta.url),
);
async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-external-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const report = path.join(root, 'reports', 'paired.json'),
    marker = path.join(root, 'called');
  const invoke = (args: string[], mode = '') =>
    spawnSync(process.execPath, [entry, ...args], {
      env: { TIBICEN_EVAL_MARKER: marker, TIBICEN_EVAL_CASE: mode },
      encoding: 'utf8',
      timeout: 10000,
    });
  return { root, report, marker, invoke };
}

test('import/help/invalid invocation do not load a driver, write artifacts or call a model', async (t) => {
  const f = await fixture(t);
  assert.equal((await externalMain([])).status, 'help');
  for (const args of [
    [],
    ['--help'],
    ['run'],
    ['run', driver, f.report, 'extra'],
  ]) {
    const result = f.invoke(args);
    assert.equal(result.status, args.length <= 1 && args[0] !== 'run' ? 0 : 1);
    assert.equal(result.stderr, '');
  }
  assert.deepEqual(await readdir(f.root), []);
  const pkg = JSON.parse(
    await readFile(new URL('../../package.json', import.meta.url), 'utf8'),
  );
  assert.equal(pkg.scripts['eval:external'], 'node scripts/evals/external.ts');
  assert(!pkg.scripts.test.includes('eval:external'));
});

test('explicit run saves a validated paired report with private permissions and no hidden context', async (t) => {
  const f = await fixture(t),
    result = f.invoke(['run', driver, f.report]);
  assert.equal(result.status, 0, result.stdout);
  assert.equal(result.stderr, '');
  assert.equal(await readFile(f.marker, 'utf8'), 'explicit-run');
  const response = JSON.parse(result.stdout),
    text = await readFile(response.path, 'utf8'),
    report = JSON.parse(text);
  assert.equal(response.cohorts, 1);
  assert.equal(report.cohorts[0].mode, 'calibration');
  assert.equal(report.cohorts[0].pairs.length, 1);
  assert.equal(
    report.cohorts[0].variants.tibicen.evaluated.endToEndSuccess.numerator,
    1,
  );
  for (const hidden of [
    'sensitiveValues',
    'synthetic-external-value',
    'private-reference',
    'Use the agreed rules.',
  ])
    assert(!text.includes(hidden));
  assert.equal((await stat(f.report)).mode & 0o777, 0o600);
  assert.equal((await stat(path.dirname(f.report))).mode & 0o777, 0o700);
  assert.deepEqual(await readdir(path.dirname(f.report)), ['paired.json']);
});

test('an existing report prevents driver execution and remains unchanged', async (t) => {
  const f = await fixture(t),
    report = path.join(f.root, 'existing.json');
  await writeFile(report, 'Retained result.');
  const result = f.invoke(['run', driver, report]);
  assert.equal(result.status, 1);
  assert.equal(await readFile(report, 'utf8'), 'Retained result.');
  await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
});

for (const mode of ['throw', 'malformed', 'secret'])
  test(
    'driver ' + mode + ' cannot publish a report or leak native error text',
    async (t) => {
      const f = await fixture(t),
        result = f.invoke(['run', driver, f.report], mode);
      assert.equal(result.status, 1);
      assert.deepEqual(JSON.parse(result.stdout), {
        schema: 1,
        status: 'error',
        reason: 'external-experiment-failed',
      });
      assert.equal(result.stderr, '');
      assert(!result.stdout.includes('synthetic-external-value'));
      await assert.rejects(readFile(f.report), { code: 'ENOENT' });
    },
  );

test('a local module without run is rejected without a report', async (t) => {
  const f = await fixture(t),
    module = path.join(f.root, 'invalid.mjs');
  await writeFile(module, 'export const value=1;\n');
  const result = f.invoke(['run', module, f.report]);
  assert.equal(result.status, 1);
  await assert.rejects(readFile(f.report), { code: 'ENOENT' });
});
