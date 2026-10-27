import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { createProcessSupervisor } from '../../scripts/evals/process-supervisor.ts';

const command = (source: string) => ({
  executable: process.execPath,
  argv: ['-e', source],
  cwd: os.tmpdir(),
  env: { CONTROL: 'explicit' },
  timeoutMs: 2000,
  stdoutLimit: 65536,
});

test('supervisor preserves explicit environment, piped input and split UTF-8 output', async (t) => {
  const supervisor = createProcessSupervisor();
  t.after(() => supervisor.dispose());
  const result = await supervisor.run({
    ...command(
      `let input='';process.stdin.on('data',chunk=>input+=chunk);process.stdin.on('end',()=>{const text=Buffer.from(process.env.CONTROL+':'+input);process.stdout.write(text.subarray(0,text.length-1));setTimeout(()=>process.stdout.end(text.subarray(text.length-1)),20);});`,
    ),
    stdin: { text: 'Привет' },
  });
  assert.equal(result.status, 0);
  assert.equal(result.stdout, 'explicit:Привет');
  assert.equal(result.timedOut, false);
});

for (const stream of ['stdout', 'stderr'] as const)
  test(
    'supervisor bounds ' + stream + ' and stops before its timeout',
    { skip: process.platform === 'win32' },
    async (t) => {
      const supervisor = createProcessSupervisor();
      t.after(() => supervisor.dispose());
      const result = await supervisor.run({
        ...command(
          `process.${stream}.write('x'.repeat(200000));setInterval(()=>{},1000);`,
        ),
        stderrLimit: 65536,
      });
      assert.equal(result.status, null);
      assert.equal(result[stream].length, 65536);
      assert.equal(result.timedOut, false);
    },
  );

test(
  'a protocol observation can replace the launch deadline without losing timeout cleanup',
  { skip: process.platform === 'win32' },
  async (t) => {
    const supervisor = createProcessSupervisor();
    t.after(() => supervisor.dispose());
    let observed = false;
    const result = await supervisor.run({
      ...command("console.log('started');setInterval(()=>{},1000);"),
      timeoutMs: 1500,
      onStdout(chunk, controls) {
        if (chunk.includes('started')) {
          observed = true;
          controls.deadlineIn(30);
        }
      },
    });
    assert(observed);
    assert.equal(result.status, null);
    assert.equal(result.timedOut, true);
  },
);

test('a failed spawn resolves without output and disposal forbids later starts', async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-supervisor-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const supervisor = createProcessSupervisor();
  t.after(() => supervisor.dispose());
  const failed = await supervisor.run({
    ...command(''),
    executable: path.join(root, 'missing'),
  });
  assert.equal(failed.spawnError, true);
  assert.equal(failed.status, null);
  assert.equal(failed.stdout, '');
  supervisor.dispose();
  const marker = path.join(root, 'started');
  const cancelled = await supervisor.run(
    command(
      `require('node:fs').writeFileSync(${JSON.stringify(marker)},'bad')`,
    ),
  );
  assert.equal(cancelled.status, null);
  assert.equal(cancelled.spawnError, false);
  assert(supervisor.signal.aborted);
  await assert.rejects(readFile(marker), { code: 'ENOENT' });
});

test('a successful exit cannot validate an oversized stream with a valid JSON prefix', async (t) => {
  const supervisor = createProcessSupervisor();
  t.after(() => supervisor.dispose());
  const prefix = '{"safe":true}';
  const running = supervisor.run({
    ...command(
      `require('node:fs').writeSync(1,${JSON.stringify(prefix + ' '.repeat(100))});process.exit(0);`,
    ),
    stdoutLimit: prefix.length,
  });
  // Let the child exit before the parent handles its buffered output.
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 200);
  const result = await running;
  assert.equal(result.stdout, prefix);
  assert.deepEqual(JSON.parse(result.stdout), { safe: true });
  assert.equal(result.status, null);
  assert.equal(result.timedOut, false);
});

test('cancellation stops execution while retaining signal handlers through outer cleanup', async (t) => {
  const before = process.listenerCount('SIGINT');
  const supervisor = createProcessSupervisor();
  t.after(() => supervisor.dispose());
  let cancelled = false;
  const result = await supervisor.run({
    ...command("console.log('started');setInterval(()=>{},1000);"),
    onStdout() {
      supervisor.cancel();
      cancelled = true;
    },
  });
  assert(cancelled);
  assert.equal(result.status, null);
  assert(supervisor.signal.aborted);
  assert.equal(process.listenerCount('SIGINT'), before + 1);
  process.emit('SIGINT');
  assert.equal(process.listenerCount('SIGINT'), before + 1);
  supervisor.dispose();
  assert.equal(process.listenerCount('SIGINT'), before);
});
