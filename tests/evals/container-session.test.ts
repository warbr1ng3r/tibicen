import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import { EventEmitter } from 'node:events';
import { syncBuiltinESMExports } from 'node:module';
import { PassThrough } from 'node:stream';
import {
  startContainerSession,
  validateContainerInput,
} from '../../scripts/evals/container/session.ts';
import type { ContainerInput } from '../../scripts/evals/container/session.ts';

test('container inputs fix image, cwd, lifetime and bounded bytes before Docker', () => {
  const input = {
    imageId: 'sha256:' + 'a'.repeat(64),
    workspace: '/tmp/project',
    files: { 'AGENTS.md': Buffer.from('fixture') },
    deadlineMs: 10000,
  };
  validateContainerInput(input);
  const extras: Partial<ContainerInput>[] = [
    { imageId: 'node:latest' },
    ...[
      '/',
      '/opt/tibicen',
      '/usr/local',
      '/proc',
      '/dev',
      '/home/runner',
      '/tmp/../escape',
      'relative',
    ].map((workspace) => ({ workspace })),
    { deadlineMs: 0 },
    { deadlineMs: 180001 },
    { files: {} },
    { files: { '../escape': Buffer.from('no') } },
  ];
  for (const extra of extras)
    assert.throws(() => validateContainerInput({ ...input, ...extra }));
  for (const name of [
    '.codex/config.toml',
    'nested/.codex/config.toml',
    '.mcp.json',
  ])
    assert.throws(() =>
      validateContainerInput({
        ...input,
        files: { [name]: Buffer.from('untrusted config') },
      }),
    );
});

function mockDocker(
  t: TestContext,
  options: { waitStatus?: number; state?: string; removeStatus?: number },
) {
  const cid = 'a'.repeat(64),
    calls: string[] = [];
  let owner = '',
    removed = false;
  t.mock.method(
    childProcess,
    'spawn',
    (_executable: string, args: string[]) => {
      const child = Object.assign(new EventEmitter(), {
        stdin: new PassThrough(),
        stdout: new PassThrough(),
        stderr: new PassThrough(),
        kill() {
          queueMicrotask(() => child.emit('close', null));
          return true;
        },
      });
      const [command] = args;
      calls.push(command);
      queueMicrotask(() => {
        let status = 0;
        if (command === 'create') {
          owner = args[args.indexOf('--label') + 1].split('=')[1];
          child.stdout.write(cid + '\n');
        } else if (command === 'inspect') {
          if (removed) status = 1;
          else if (args[2].includes('.Config.Labels'))
            child.stdout.write(cid + ' ' + owner);
          else if (args[2] === '{{json .Config}}')
            child.stdout.write(
              JSON.stringify({
                OpenStdin: true,
                AttachStdin: true,
                StdinOnce: true,
              }),
            );
          else child.stdout.write(options.state ?? '{"Running":false,"Pid":0}');
        } else if (command === 'start') return;
        else if (command === 'wait') status = options.waitStatus ?? 0;
        else if (command === 'rm') {
          status = options.removeStatus ?? 0;
          removed = status === 0;
        }
        child.stdout.end();
        child.stderr.end();
        child.emit('close', status);
      });
      return child as unknown as ChildProcess;
    },
  );
  syncBuiltinESMExports();
  t.after(() => {
    t.mock.restoreAll();
    syncBuiltinESMExports();
  });
  return { calls, removed: () => removed };
}

for (const options of [
  { waitStatus: 1 },
  { state: 'malformed' },
  { state: '{"Running":true,"Pid":123}' },
])
  test(
    'container removal still runs after stop validation fails: ' +
      JSON.stringify(options),
    async (t) => {
      const docker = mockDocker(t, options);
      const session = await startContainerSession({
        imageId: 'sha256:' + 'b'.repeat(64),
        workspace: '/tmp/project',
        files: { file: Buffer.from('fixture') },
        deadlineMs: 10000,
      });
      await assert.rejects(
        session.stop(),
        'state' in options && options.state === 'malformed'
          ? SyntaxError
          : /container-stop-unverified/,
      );
      assert(docker.removed());
      assert.deepEqual(docker.calls.slice(-2), ['rm', 'inspect']);
    },
  );

test('a failed container removal remains visible after an earlier stop failure', async (t) => {
  const docker = mockDocker(t, { waitStatus: 1, removeStatus: 1 });
  const session = await startContainerSession({
    imageId: 'sha256:' + 'b'.repeat(64),
    workspace: '/tmp/project',
    files: { file: Buffer.from('fixture') },
    deadlineMs: 10000,
  });
  await assert.rejects(session.stop(), /container-removal-unverified/);
  assert.equal(docker.removed(), false);
  assert.equal(docker.calls.at(-1), 'rm');
});
