import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import {
  checkMathExports,
  checkOpenSpecArtifacts,
  nativeProcessValidation,
} from '../../scripts/evals/native-checks.ts';
import { createProcessSupervisor } from '../../scripts/evals/process-supervisor.ts';

test('math check detects a wrong export despite passing project tests and leaves the source untouched', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-math-check-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = path.join(root, 'project'),
    copy = path.join(root, 'check');
  await mkdir(path.join(source, 'src'), { recursive: true });
  await mkdir(path.join(source, 'tests'));
  await writeFile(path.join(source, 'package.json'), '{"type":"module"}');
  await writeFile(
    path.join(source, 'src/math.js'),
    'export const double=x=>x*2;export const triple=x=>x*2;',
  );
  await writeFile(
    path.join(source, 'tests/math.test.js'),
    "import test from 'node:test';import assert from 'node:assert/strict';import {double} from '../src/math.js';test('double',()=>assert.equal(double(3),6));",
  );
  const supervisor = createProcessSupervisor();
  t.after(() => supervisor.dispose());
  const run = (cwd: string, argv: string[], timeoutMs: number) =>
    supervisor.run({
      executable: process.execPath,
      argv,
      cwd,
      env: {},
      timeoutMs,
      stdoutLimit: 65536,
    });
  assert.equal((await run(source, ['--test'], 2000)).status, 0);
  const status = await checkMathExports(source, copy, 'task', () => 2000, run);
  assert.notEqual(status, 0);
  assert.notEqual(status, null);
  await assert.rejects(readFile(path.join(source, 'independent.test.cjs')), {
    code: 'ENOENT',
  });
  assert(
    (await readFile(path.join(copy, 'independent.test.cjs'), 'utf8')).includes(
      'm.triple(x),x*3',
    ),
  );
});

test('independent checks refuse an exhausted budget before invoking the runner', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-check-budget-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const project = path.join(root, 'project');
  await mkdir(project);
  let launches = 0;
  const run = async () => {
    launches++;
    return { status: 0, timedOut: false };
  };
  await assert.rejects(
    checkMathExports(project, path.join(root, 'check'), 'setup', () => 0, run),
    { code: 'native-stage-timeout' },
  );
  await assert.rejects(
    checkOpenSpecArtifacts(project, '/frozen/openspec', () => -1, run),
    { code: 'native-stage-timeout' },
  );
  assert.equal(launches, 0);
});

test('OpenSpec check preserves the frozen CLI, exact validation arguments and timeout failure', async () => {
  const calls: unknown[] = [];
  const status = await checkOpenSpecArtifacts(
    '/copy',
    '/frozen/openspec',
    () => 17000,
    async (...args) => {
      calls.push(args);
      return { status: 0, timedOut: true };
    },
  );
  assert.equal(status, null);
  assert.deepEqual(calls, [
    [
      '/copy',
      [
        path.join('/frozen/openspec', 'bin/openspec.js'),
        ...nativeProcessValidation.argv,
      ],
      15000,
    ],
  ]);
});
