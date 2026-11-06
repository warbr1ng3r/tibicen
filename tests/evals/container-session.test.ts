import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import childProcess from 'node:child_process';
import type { ChildProcess } from 'node:child_process';
import crypto from 'node:crypto';
import { createHmac } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { syncBuiltinESMExports } from 'node:module';
import net from 'node:net';
import type { Server } from 'node:net';
import { Duplex, PassThrough } from 'node:stream';
import {
  startContainerSession,
  validateContainerInput,
} from '../../scripts/evals/container/session.ts';
import type { ContainerInput } from '../../scripts/evals/container/session.ts';
import { createContainerOwner } from '../../scripts/evals/container/owner.ts';
import { transferLimits } from '../../scripts/evals/container/archive.ts';

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
  let attached: ChildProcess | undefined;
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
          removed = false;
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
        } else if (command === 'start') {
          attached = child as unknown as ChildProcess;
          return;
        } else if (command === 'wait') status = options.waitStatus ?? 0;
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
  return { calls, removed: () => removed, attached: () => attached };
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

function diagnosticSession() {
  return startContainerSession({
    imageId: 'sha256:' + 'b'.repeat(64),
    workspace: '/tmp/project',
    files: { file: Buffer.from('fixture') },
    deadlineMs: 10000,
  });
}

const unknownContext = {
  operation: null,
  requestIdHash: null,
  processIdHash: null,
  startResponseObserved: false,
  sequence: null,
  sandboxDenied: null,
};

test('the first tool failure survives in the receipt without arbitrary payload', async (t) => {
  const docker = mockDocker(t, {});
  const session = await diagnosticSession();
  const event =
    JSON.stringify({
      id: 'secret-id',
      error: { code: -32603, message: 'secret-message', data: 'secret-data' },
    }) + '\n';
  session.child.stdout.emit('data', Buffer.from(event.slice(0, 12)));
  session.child.stdout.emit(
    'data',
    Buffer.from(
      event.slice(12) +
        JSON.stringify({
          method: 'process/exited',
          params: { exitCode: 17, output: 'secret-output' },
        }) +
        '\n',
    ),
  );
  const receipt = await session.finished;
  assert.equal(receipt.reason, 'tool-failure');
  assert.deepEqual(receipt.toolFailure, {
    kind: 'rpc-error',
    code: -32603,
    context: unknownContext,
  });
  assert.equal(JSON.stringify(receipt).includes('secret-'), false);
  assert.deepEqual(Object.keys(receipt.files), []);
  assert.equal(docker.calls.filter((name) => name === 'kill').length, 1);
  assert(docker.removed());
});

for (const [exitCode, expected] of [
  [17, 17],
  ['secret-exit', null],
  [undefined, null],
  [Number.MAX_VALUE, null],
] as const)
  test(
    'an ignored RPC error leaves the process exit as the first failure: ' +
      String(exitCode),
    async (t) => {
      mockDocker(t, {});
      const session = await diagnosticSession();
      session.child.stdout.emit(
        'data',
        Buffer.from(
          [
            { error: { code: -32004, message: 'secret-ignored' } },
            {
              method: 'process/exited',
              params: { exitCode, command: 'secret-command' },
            },
            { error: { code: -32603, message: 'secret-later' } },
          ]
            .map((event) => JSON.stringify(event))
            .join('\n') + '\n',
        ),
      );
      const receipt = await session.finished;
      assert.equal(receipt.reason, 'tool-failure');
      assert.deepEqual(receipt.toolFailure, {
        kind: 'process-exit',
        exitCode: expected,
        context: unknownContext,
      });
      assert.equal(JSON.stringify(receipt).includes('secret-'), false);
    },
  );

test('normal protocol events do not trigger stopping or retain a failure', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.child.stdout.emit(
    'data',
    Buffer.from(
      [
        { error: { code: -32004 } },
        {
          method: 'process/exited',
          params: { processId: 'normal', seq: 1, exitCode: 0 },
        },
        { method: 'secret-method', params: { exitCode: 1 } },
      ]
        .map((event) => JSON.stringify(event))
        .join('\n') + '\n',
    ),
  );
  const receipt = await session.stop();
  assert.equal(receipt.reason, 'completed');
  assert.equal(receipt.toolFailure, null);
});

test('an earlier stop keeps its reason and excludes a later RPC payload', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  const stopped = session.stop([], 'caller-cancel');
  session.child.stdout.emit(
    'data',
    Buffer.from(
      JSON.stringify({
        error: { code: 'secret-code', message: 'secret-message' },
      }) + '\n',
    ),
  );
  const receipt = await stopped;
  assert.equal(receipt.reason, 'caller-cancel');
  assert.equal(receipt.toolFailure, null);
});

test('an RPC failure with a nonnumeric code retains only its fixed kind', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.child.stdout.emit(
    'data',
    Buffer.from(
      JSON.stringify({
        method: 'secret-method',
        error: { code: { nested: 'secret-code' }, message: 'secret-message' },
      }) + '\n',
    ),
  );
  const receipt = await session.finished;
  assert.deepEqual(receipt.toolFailure, {
    kind: 'rpc-error',
    code: null,
    context: unknownContext,
  });
  assert.equal(JSON.stringify(receipt).includes('secret-'), false);
});

type DiagnosticSession = Awaited<ReturnType<typeof diagnosticSession>>;

const wire = (...messages: unknown[]) =>
  Buffer.from(
    messages.map((message) => JSON.stringify(message)).join('\n') + '\n',
  );
const start = (id: number | string, processId: string) => ({
  id,
  method: 'process/start',
  params: {
    processId,
    argv: ['secret-command', 'секретный аргумент'],
    cwd: 'file:///secret-directory',
    env: { TOKEN: 'secret-token' },
  },
});
const accepted = (id: number | string, processId: string) => ({
  id,
  result: { processId },
});
const exited = (processId: string, exitCode = 1, sandboxDenied = true) => ({
  method: 'process/exited',
  params: { processId, exitCode, seq: 3, sandboxDenied },
});
const respond = (session: DiagnosticSession, ...messages: unknown[]) =>
  session.child.stdout.emit('data', wire(...messages));

test('interleaved accepted starts identify the failing process, not the last completed command', async (t) => {
  const docker = mockDocker(t, {});
  const key = Buffer.alloc(32, 7);
  t.mock.method(crypto, 'randomBytes', (size: number) => {
    assert.equal(size, 32);
    return Buffer.from(key);
  });
  syncBuiltinESMExports();
  const expectedHash = (
    domain: 'request' | 'process',
    value: string | number,
  ) =>
    createHmac('sha256', key)
      .update(domain + '\0' + typeof value + '\0')
      .update(String(value))
      .digest('hex');
  const session = await diagnosticSession();
  session.observeRequest(
    wire(start(11, 'secret-failed'), start(12, 'secret-ok')),
  );
  respond(
    session,
    accepted(12, 'secret-ok'),
    accepted(11, 'secret-failed'),
    exited('secret-ok', 0, false),
    exited('secret-failed'),
    { id: 12, error: { code: -32603, message: 'secret-later-failure' } },
  );
  const receipt = await session.finished;
  assert.equal(receipt.reason, 'tool-failure');
  assert.equal(receipt.toolFailure?.kind, 'process-exit');
  const expectedContext = {
    operation: 'process/start',
    requestIdHash: expectedHash('request', 11),
    processIdHash: expectedHash('process', 'secret-failed'),
    startResponseObserved: true,
    sequence: 3,
    sandboxDenied: true,
  };
  assert.deepEqual(receipt.toolFailure?.context, expectedContext);
  assert.notEqual(
    receipt.toolFailure?.context.requestIdHash,
    expectedHash('request', 12),
  );
  assert.notEqual(
    receipt.toolFailure?.context.processIdHash,
    expectedHash('process', 'secret-ok'),
  );
  respond(session, exited('secret-ok', 19));
  assert.deepEqual(receipt.toolFailure?.context, expectedContext);
  assert.equal(JSON.stringify(receipt).includes('secret-'), false);
  assert.deepEqual(Object.keys(receipt.files), []);
  assert(receipt.stopped && receipt.removed);
  assert.equal(docker.calls.filter((name) => name === 'kill').length, 1);
  assert.equal(docker.calls.filter((name) => name === 'cp').length, 1);
});

for (const response of ['missing', 'mismatched'] as const)
  test(
    'an exit with a ' +
      response +
      ' start response keeps request attribution unknown',
    async (t) => {
      mockDocker(t, {});
      const session = await diagnosticSession();
      session.observeRequest(wire(start(1, 'secret-process')));
      if (response === 'mismatched')
        respond(session, accepted(1, 'different-process'));
      respond(session, exited('secret-process'));
      const { toolFailure } = await session.finished;
      assert.equal(toolFailure?.context.operation, null);
      assert.equal(toolFailure?.context.requestIdHash, null);
      assert.equal(toolFailure?.context.startResponseObserved, false);
      assert.match(toolFailure!.context.processIdHash!, /^[a-f0-9]{64}$/);
      assert.equal(toolFailure?.context.sequence, 3);
      assert.equal(toolFailure?.context.sandboxDenied, true);
    },
  );

test('an RPC error identifies an observed request without claiming its start was accepted', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.observeRequest(wire(start('secret-request', 'secret-process')));
  respond(session, {
    id: 'secret-request',
    error: {
      code: -32603,
      message: 'secret-error',
      data: { TOKEN: 'secret-token' },
    },
  });
  const { toolFailure } = await session.finished;
  assert.equal(toolFailure?.kind, 'rpc-error');
  assert.equal(toolFailure?.context.operation, 'process/start');
  assert.equal(toolFailure?.context.startResponseObserved, false);
  assert.match(toolFailure!.context.requestIdHash!, /^[a-f0-9]{64}$/);
  assert.match(toolFailure!.context.processIdHash!, /^[a-f0-9]{64}$/);
  assert.equal(toolFailure?.context.sequence, null);
  assert.equal(toolFailure?.context.sandboxDenied, null);
  assert.equal(JSON.stringify(toolFailure).includes('secret-'), false);
});

test('numeric and string request IDs remain distinct and hash domains do not overlap', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.observeRequest(wire(start(1, 'numeric-process'), start('1', '1')));
  respond(
    session,
    accepted(1, 'numeric-process'),
    accepted('1', '1'),
    exited('1'),
  );
  const { toolFailure } = await session.finished;
  assert.equal(toolFailure?.context.operation, 'process/start');
  assert.equal(toolFailure?.context.startResponseObserved, true);
  assert.notEqual(
    toolFailure?.context.requestIdHash,
    toolFailure?.context.processIdHash,
  );
});

test('the same request and process cannot be linked across separate sessions', async (t) => {
  mockDocker(t, {});
  const contexts = [];
  for (let index = 0; index < 2; index++) {
    const session = await diagnosticSession();
    session.observeRequest(wire(start('same', 'same')));
    respond(session, accepted('same', 'same'), exited('same'));
    const { toolFailure } = await session.finished;
    assert.equal(toolFailure?.context.startResponseObserved, true);
    contexts.push(toolFailure!.context);
  }
  assert.notEqual(contexts[0].requestIdHash, contexts[1].requestIdHash);
  assert.notEqual(contexts[0].processIdHash, contexts[1].processIdHash);
});

test('fragmented request and response bytes preserve UTF-8 identity and exact correlation', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  const bytes = wire(start('запрос', 'процесс'));
  for (const byte of bytes) session.observeRequest(Buffer.from([byte]));
  const responses = wire(accepted('запрос', 'процесс'), exited('процесс'));
  for (const byte of responses)
    session.child.stdout.emit('data', Buffer.from([byte]));
  const { toolFailure } = await session.finished;
  assert.equal(toolFailure?.context.operation, 'process/start');
  assert.equal(toolFailure?.context.startResponseObserved, true);
  assert.match(toolFailure!.context.requestIdHash!, /^[a-f0-9]{64}$/);
  assert.equal(JSON.stringify(toolFailure).includes('процесс'), false);
  assert.equal(JSON.stringify(toolFailure).includes('секретный'), false);
});

for (const [name, requests] of [
  ['malformed JSON', Buffer.from('{broken}\n')],
  ['invalid UTF-8', Buffer.from([0xff, 0x0a])],
  ['oversized line', Buffer.from('x'.repeat(65537))],
  ['oversized identifier', wire(start('я'.repeat(129), 'extra-process'))],
  ['duplicate request', wire(start(1, 'different-process'))],
  ['duplicate process', wire(start(2, 'tracked-process'))],
  [
    'reused ID on another operation',
    wire({ id: 1, method: 'process/writeStdin' }),
  ],
  ['invalid request ID', wire({ ...start(2, 'extra-process'), id: {} })],
  [
    'too many requests',
    wire(
      ...Array.from({ length: 128 }, (_, id) => ({
        id: id + 2,
        method: 'process/writeStdin',
      })),
    ),
  ],
  [
    'too many total bytes',
    wire(
      ...Array.from({ length: 110 }, (_, id) => ({
        id: id + 2,
        method: 'process/writeStdin',
        params: { data: 'secret-'.repeat(1600) },
      })),
    ),
  ],
] as const)
  test(
    name +
      ' disables uncertain request tracking without changing failure stopping',
    async (t) => {
      const docker = mockDocker(t, {});
      const session = await diagnosticSession();
      session.observeRequest(wire(start(1, 'tracked-process')));
      respond(session, accepted(1, 'tracked-process'));
      session.observeRequest(requests);
      respond(session, exited('tracked-process'));
      const receipt = await session.finished;
      assert.equal(receipt.reason, 'tool-failure');
      assert.equal(receipt.toolFailure?.context.operation, null);
      assert.equal(receipt.toolFailure?.context.requestIdHash, null);
      assert.equal(receipt.toolFailure?.context.startResponseObserved, false);
      assert.equal(JSON.stringify(receipt).includes('secret-'), false);
      assert(receipt.stopped && receipt.removed && docker.removed());
      assert.deepEqual(Object.keys(receipt.files), []);
    },
  );

test('128 unique requests remain bounded but usable', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.observeRequest(
    wire(
      start(1, 'tracked-process'),
      ...Array.from({ length: 127 }, (_, id) => ({
        id: id + 2,
        method: 'process/writeStdin',
      })),
    ),
  );
  respond(session, accepted(1, 'tracked-process'), exited('tracked-process'));
  assert.equal(
    (await session.finished).toolFailure?.context.startResponseObserved,
    true,
  );
});

for (const params of [
  { processId: 'tracked-process', exitCode: 1 },
  {
    processId: 'tracked-process',
    exitCode: 1,
    seq: -1,
    sandboxDenied: 'secret-value',
  },
  {
    processId: 'tracked-process',
    exitCode: 1,
    seq: Number.MAX_VALUE,
    sandboxDenied: null,
  },
])
  test(
    'exit metadata keeps missing or invalid facts unknown: ' +
      JSON.stringify(params),
    async (t) => {
      mockDocker(t, {});
      const session = await diagnosticSession();
      session.observeRequest(wire(start(1, 'tracked-process')));
      respond(session, accepted(1, 'tracked-process'), {
        method: 'process/exited',
        params,
      });
      const { toolFailure } = await session.finished;
      assert.equal(toolFailure?.context.startResponseObserved, true);
      assert.equal(toolFailure?.context.sequence, null);
      assert.equal(toolFailure?.context.sandboxDenied, null);
    },
  );

test('duplicate responses invalidate attribution rather than accepting ambiguous history', async (t) => {
  mockDocker(t, {});
  const session = await diagnosticSession();
  session.observeRequest(wire(start(1, 'tracked-process')));
  respond(
    session,
    accepted(1, 'tracked-process'),
    accepted(1, 'tracked-process'),
    exited('tracked-process'),
  );
  assert.equal((await session.finished).toolFailure?.context.operation, null);
});

test('the actual owner observes client bytes before forwarding them unchanged without a real socket', async (t) => {
  const docker = mockDocker(t, {});
  const server = Object.assign(new EventEmitter(), {
    listening: false,
    listen(_path: string, callback: () => void) {
      this.listening = true;
      queueMicrotask(callback);
    },
    close(callback: () => void) {
      this.listening = false;
      queueMicrotask(callback);
    },
  });
  t.mock.method(net, 'createServer', () => server as unknown as Server);
  syncBuiltinESMExports();
  const owner = await createContainerOwner({
    imageId: 'sha256:' + 'b'.repeat(64),
    workspace: '/tmp/project',
    files: { file: Buffer.from('fixture') },
    deadlineMs: 10000,
  });
  try {
    const order: string[] = [],
      forwarded: Buffer[] = [];
    const originalObserver = owner.session.observeRequest;
    t.mock.method(owner.session, 'observeRequest', (chunk: Buffer) => {
      order.push('observe');
      originalObserver(chunk);
    });
    docker.attached()!.stdin!.on('data', (chunk: Buffer) => {
      order.push('forward');
      forwarded.push(Buffer.from(chunk));
    });
    const peer = new Duplex({
      read() {},
      write(_chunk, _encoding, callback) {
        callback();
      },
    });
    server.emit('connection', peer);
    const request = wire(start('owner-request', 'owner-process'));
    peer.push(request.subarray(0, 9));
    peer.push(request.subarray(9));
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.deepEqual(Buffer.concat(forwarded), request);
    assert.deepEqual(order, ['observe', 'forward', 'observe', 'forward']);
    respond(
      owner.session,
      accepted('owner-request', 'owner-process'),
      exited('owner-process'),
    );
    const receipt = await owner.finished;
    assert.equal(receipt.toolFailure?.context.operation, 'process/start');
    assert.equal(receipt.toolFailure?.context.startResponseObserved, true);
    assert.equal(receipt.reason, 'tool-failure');
    assert(receipt.stopped && receipt.removed && docker.removed());
    assert.deepEqual(Object.keys(receipt.files), []);
  } finally {
    await owner.stop([], 'test-cleanup');
  }
});

test('an ordinary command result permits a later command and preserves owner wire bytes', async (t) => {
  const docker = mockDocker(t, {});
  const server = Object.assign(new EventEmitter(), {
    listening: false,
    listen(_path: string, callback: () => void) {
      this.listening = true;
      queueMicrotask(callback);
    },
    close(callback: () => void) {
      this.listening = false;
      queueMicrotask(callback);
    },
  });
  t.mock.method(net, 'createServer', () => server as unknown as Server);
  syncBuiltinESMExports();
  const owner = await createContainerOwner({
    imageId: 'sha256:' + 'b'.repeat(64),
    workspace: '/tmp/project',
    files: { file: Buffer.from('fixture') },
    deadlineMs: 10000,
  });
  try {
    const forwarded: Buffer[] = [],
      returned: Buffer[] = [];
    docker.attached()!.stdin!.on('data', (chunk: Buffer) => {
      forwarded.push(Buffer.from(chunk));
    });
    const peer = new Duplex({
      read() {},
      write(chunk: Buffer, _encoding, callback) {
        returned.push(Buffer.from(chunk));
        callback();
      },
    });
    server.emit('connection', peer);
    const first = wire(start('first-request', 'first-process')),
      firstResult = wire(
        accepted('first-request', 'first-process'),
        exited('first-process', 1, false),
      );
    peer.push(first.subarray(0, 13));
    peer.push(first.subarray(13));
    await new Promise<void>((resolve) => setImmediate(resolve));
    owner.session.child.stdout.emit('data', firstResult);
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(docker.calls.includes('kill'), false);

    const second = wire(start('second-request', 'second-process')),
      secondResult = wire(
        accepted('second-request', 'second-process'),
        exited('second-process', 0, false),
      );
    peer.push(second);
    await new Promise<void>((resolve) => setImmediate(resolve));
    owner.session.child.stdout.emit('data', secondResult);
    assert.deepEqual(Buffer.concat(forwarded), Buffer.concat([first, second]));
    assert.deepEqual(
      Buffer.concat(returned),
      Buffer.concat([firstResult, secondResult]),
    );
    const receipt = await owner.stop([], 'completed');
    assert.equal(receipt.reason, 'completed');
    assert.equal(receipt.toolFailure, null);
    assert(receipt.stopped && receipt.removed && docker.removed());
  } finally {
    await owner.stop([], 'test-cleanup');
  }
});

for (const [name, params] of [
  [
    'explicit false',
    { processId: 'untracked', seq: 0, exitCode: 127, sandboxDenied: false },
  ],
  ['omitted denial', { processId: 'untracked', seq: 0, exitCode: 1 }],
  [
    'unknown denial',
    { processId: 'untracked', seq: 0, exitCode: 1, sandboxDenied: null },
  ],
  ['empty process ID', { processId: '', seq: 0, exitCode: 1 }],
  [
    'minimum i32 exit',
    { processId: 'untracked', seq: 0, exitCode: -2147483648 },
  ],
  [
    'maximum i32 exit',
    {
      processId: 'untracked',
      seq: Number.MAX_SAFE_INTEGER,
      exitCode: 2147483647,
    },
  ],
] as const)
  test(
    'a schema-valid ordinary result permits recovery with ' + name,
    async (t) => {
      const docker = mockDocker(t, {});
      const session = await diagnosticSession();
      respond(session, { method: 'process/exited', params });
      await new Promise<void>((resolve) => setImmediate(resolve));
      const receipt = await session.stop();
      assert.equal(receipt.reason, 'completed');
      assert.equal(receipt.toolFailure, null);
      assert(receipt.stopped && receipt.removed && docker.removed());
    },
  );

for (const [name, requests] of [
  [
    'the optional request-ID cap',
    wire(
      ...Array.from({ length: 128 }, (_, id) => ({
        id: id + 2,
        method: 'process/read',
      })),
    ),
  ],
  [
    'the optional total-request-byte cap',
    wire(
      ...Array.from({ length: 110 }, (_, id) => ({
        id: id + 2,
        method: 'process/read',
        params: { padding: 'x'.repeat(10000) },
      })),
    ),
  ],
] as const)
  test('ordinary command recovery survives ' + name, async (t) => {
    const docker = mockDocker(t, {});
    const session = await diagnosticSession();
    session.observeRequest(wire(start(1, 'first-process')));
    respond(session, accepted(1, 'first-process'));
    session.observeRequest(requests);
    respond(session, exited('first-process', 1, false));
    await new Promise<void>((resolve) => setImmediate(resolve));
    assert.equal(docker.calls.includes('kill'), false);
    session.observeRequest(wire(start('second-request', 'second-process')));
    respond(
      session,
      accepted('second-request', 'second-process'),
      exited('second-process', 0, false),
    );
    const receipt = await session.stop();
    assert.equal(receipt.reason, 'completed');
    assert.equal(receipt.toolFailure, null);
    assert(receipt.stopped && receipt.removed && docker.removed());
  });

for (const [name, params] of [
  [
    'denial even with exit zero',
    { processId: 'known', seq: 1, exitCode: 0, sandboxDenied: true },
  ],
  ['missing process ID', { seq: 1, exitCode: 0 }],
  ['nonnumeric process ID', { processId: 17, seq: 1, exitCode: 0 }],
  ['missing sequence', { processId: 'known', exitCode: 0 }],
  ['negative sequence', { processId: 'known', seq: -1, exitCode: 0 }],
  ['fractional sequence', { processId: 'known', seq: 1.5, exitCode: 0 }],
  [
    'unsafe sequence',
    { processId: 'known', seq: Number.MAX_SAFE_INTEGER + 1, exitCode: 0 },
  ],
  ['missing exit code', { processId: 'known', seq: 1 }],
  ['nonnumeric exit code', { processId: 'known', seq: 1, exitCode: '0' }],
  ['fractional exit code', { processId: 'known', seq: 1, exitCode: 0.5 }],
  [
    'exit code below i32',
    { processId: 'known', seq: 1, exitCode: -2147483649 },
  ],
  ['exit code above i32', { processId: 'known', seq: 1, exitCode: 2147483648 }],
  [
    'malformed denial',
    { processId: 'known', seq: 1, exitCode: 0, sandboxDenied: 'false' },
  ],
] as const)
  test('the executor still stops on ' + name, async (t) => {
    const docker = mockDocker(t, {});
    const session = await diagnosticSession();
    session.observeRequest(wire(start(1, 'known')));
    respond(session, accepted(1, 'known'), {
      method: 'process/exited',
      params,
    });
    await new Promise<void>((resolve) => setImmediate(resolve));
    const receipt = await session.stop();
    assert.notEqual(receipt.reason, 'completed');
    assert.deepEqual(Object.keys(receipt.files), []);
    assert(receipt.stopped && receipt.removed && docker.removed());
  });

for (const [name, reason, trigger] of [
  [
    'malformed JSON',
    'invalid-protocol',
    (session: DiagnosticSession) =>
      session.child.stdout.emit('data', Buffer.from('{broken}\n')),
  ],
  [
    'an output limit',
    'output-cap',
    (session: DiagnosticSession) =>
      session.child.stderr.emit(
        'data',
        Buffer.alloc(transferLimits.total + transferLimits.entries * 1024 + 1),
      ),
  ],
  [
    'a protocol line limit',
    'protocol-limit',
    (session: DiagnosticSession) =>
      session.child.stdout.emit(
        'data',
        Buffer.alloc(transferLimits.file + 1, 'x'),
      ),
  ],
  [
    'an attach error',
    'attach-error',
    (session: DiagnosticSession) =>
      session.child.emit('error', new Error('synthetic attach error')),
  ],
] as const)
  test('ordinary command recovery does not bypass ' + name, async (t) => {
    const docker = mockDocker(t, {});
    const session = await diagnosticSession();
    trigger(session);
    const receipt = await session.finished;
    assert.equal(receipt.reason, reason);
    assert.deepEqual(Object.keys(receipt.files), []);
    assert(receipt.stopped && receipt.removed && docker.removed());
  });

test('ordinary command recovery does not bypass the container deadline', async (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const docker = mockDocker(t, {});
  const session = await diagnosticSession();
  t.mock.timers.tick(11000);
  const receipt = await session.finished;
  assert.equal(receipt.reason, 'deadline');
  assert.deepEqual(Object.keys(receipt.files), []);
  assert(receipt.stopped && receipt.removed && docker.removed());
});
