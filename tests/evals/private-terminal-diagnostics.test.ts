import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { hashContent } from '../../scripts/core/contracts.ts';
import {
  createPrivateDiagnostics,
  describePrivateDiagnostics,
  sanitizeTerminalError,
  terminalDiagnosticPolicy,
} from '../../scripts/evals/container/terminal-diagnostics.ts';

async function fixture(t: { after(fn: () => Promise<void>): void }) {
  const root = await realpath(await mkdtemp('/tmp/tibicen-private-errors-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const excluded = [path.join(root, 'home'), path.join(root, 'project')];
  await Promise.all(excluded.map((area) => mkdir(area, { mode: 0o700 })));
  return { root, excluded, directory: path.join(root, 'retained') };
}

function executorFailure() {
  return {
    type: 'executor.error',
    message: 'Permission denied',
    executor: {
      kind: 'process-exit',
      code: null as number | null,
      exitCode: 1 as number | null,
      context: {
        operation: 'process/start',
        requestIdHash: 'a'.repeat(64) as string | null,
        processIdHash: 'b'.repeat(64),
        startResponseObserved: true,
        sequence: 7 as number | null,
        sandboxDenied: true,
      },
      stderrStatus: 'complete',
      stderrBytes: 17,
    },
  };
}

test('executor policy and failure projection retain only fixed correlated fields', () => {
  assert.equal(terminalDiagnosticPolicy.version, 2);
  assert(terminalDiagnosticPolicy.events.includes('executor.error'));
  assert.deepEqual(terminalDiagnosticPolicy.executor, {
    processes: 8,
    processBytes: 16384,
    totalBytes: 65536,
  });
  assert(Object.isFrozen(terminalDiagnosticPolicy.executor));
  const expected = executorFailure();
  const record = {
    ...expected,
    argv: 'PRIVATE ARGV',
    stdout: 'PRIVATE STDOUT',
    error: { message: 'PRIVATE EXTRA ERROR' },
    executor: {
      ...expected.executor,
      stderr: 'PRIVATE EXTRA STDERR',
      context: { ...expected.executor.context, rawProcessId: 'PRIVATE ID' },
    },
  };
  const result = sanitizeTerminalError(record);
  assert.deepEqual(result.executor, expected.executor);
  assert.equal(result.message, 'Permission denied');
  assert.equal(result.detailHash, hashContent(JSON.stringify(record)));
  assert.equal(result.truncated, false);
  for (const value of [
    'PRIVATE ARGV',
    'PRIVATE STDOUT',
    'PRIVATE EXTRA ERROR',
    'PRIVATE EXTRA STDERR',
    'PRIVATE ID',
  ])
    assert(!JSON.stringify(result).includes(value));
});

test('executor gaps withhold text and matched RPC errors stay distinct from process stderr', () => {
  for (const status of [
    'empty',
    'overflow',
    'invalid',
    'uncorrelated',
    'not-process',
  ]) {
    const record = executorFailure();
    record.executor.stderrStatus = status;
    const result = sanitizeTerminalError(record);
    assert.equal(result.message, undefined, status);
    assert.equal(result.truncated, status === 'overflow');
  }
  const record = executorFailure();
  record.executor.context.startResponseObserved = false;
  assert.equal(sanitizeTerminalError(record).message, undefined);
  const rpc = executorFailure();
  rpc.executor.kind = 'rpc-error';
  rpc.executor.stderrStatus = 'not-process';
  rpc.executor.code = -32000;
  rpc.executor.exitCode = null;
  rpc.executor.context.startResponseObserved = false;
  rpc.executor.context.sequence = null;
  const result = sanitizeTerminalError(rpc);
  assert.equal(result.message, 'Permission denied');
  assert.equal(result.executor?.kind, 'rpc-error');
  assert.equal(result.executor?.stderrStatus, 'not-process');
  rpc.executor.context.requestIdHash = null;
  assert.equal(sanitizeTerminalError(rpc).message, undefined);
});

test('malformed executor metadata is rejected rather than retaining raw fields', () => {
  const invalid = [
    { kind: 'unknown' },
    { code: 2147483648 },
    { exitCode: 1.5 },
    { stderrStatus: 'anything' },
    { stderrBytes: -1 },
    { stderrBytes: Number.MAX_SAFE_INTEGER + 1 },
    { context: null },
    { context: { ...executorFailure().executor.context, operation: 'raw' } },
    {
      context: { ...executorFailure().executor.context, requestIdHash: 'raw' },
    },
    {
      context: {
        ...executorFailure().executor.context,
        processIdHash: 'B'.repeat(64),
      },
    },
    {
      context: {
        ...executorFailure().executor.context,
        startResponseObserved: 'yes',
      },
    },
    { context: { ...executorFailure().executor.context, sequence: -1 } },
    {
      context: { ...executorFailure().executor.context, sandboxDenied: 'yes' },
    },
  ];
  for (const fields of invalid) {
    const record = executorFailure();
    assert.throws(() =>
      sanitizeTerminalError({
        ...record,
        executor: { ...record.executor, ...fields },
      }),
    );
  }
});

test('complete executor text redacts overlapping credentials before UTF-8 truncation', () => {
  const secret = 'KNOWN-PRIVATE-CREDENTIAL-' + 'tail'.repeat(20);
  const auth = Buffer.from(
    JSON.stringify({
      tokens: { id_token: secret.slice(0, 30), access_token: secret },
    }),
  );
  const record = executorFailure();
  record.message = 'x'.repeat(1000) + secret;
  const result = sanitizeTerminalError(record, auth);
  assert.equal(result.message, 'x'.repeat(1000) + '<REDACTED>');
  assert.equal(result.truncated, false);
  record.message = '😀'.repeat(400) + secret;
  const cut = sanitizeTerminalError(record, auth);
  assert.equal(cut.truncated, true);
  assert(!cut.message?.includes('\uFFFD'));
  assert(
    Buffer.byteLength(cut.message!) <= terminalDiagnosticPolicy.messageBytes,
  );
  assert(!JSON.stringify(cut).includes('KNOWN-PRIVATE'));
});

test('executor records reuse exclusive storage and the shared native record budget', async (t) => {
  const f = await fixture(t);
  const recorder = await createPrivateDiagnostics(
    { directory: f.directory },
    f.excluded,
  );
  t.after(() => recorder.close());
  recorder.capture({ type: 'error', message: 'native terminal error' });
  for (let i = 0; i < terminalDiagnosticPolicy.records + 2; i++)
    recorder.capture(executorFailure());
  recorder.close();
  const file = path.join(f.directory, terminalDiagnosticPolicy.filename);
  assert.equal((await lstat(file)).mode & 0o777, 0o600);
  const saved = await readFile(file, 'utf8');
  const lines = saved
    .trim()
    .split('\n')
    .map((line) => JSON.parse(line));
  assert.equal(lines.length, terminalDiagnosticPolicy.records);
  assert.equal(lines[0].type, 'error');
  assert.equal(lines[1].type, 'executor.error');
  assert.equal(recorder.receipt().truncated, true);
  assert(Buffer.byteLength(saved) <= terminalDiagnosticPolicy.fileBytes);
  assert(!JSON.stringify(recorder.receipt()).includes('Permission denied'));
});

test('invalid executor recording fails visibly without saving raw fallback text', async (t) => {
  const f = await fixture(t);
  const recorder = await createPrivateDiagnostics(
    { directory: f.directory },
    f.excluded,
  );
  const record = executorFailure();
  record.executor.context.requestIdHash = 'raw-private-identifier';
  assert.throws(
    () => recorder.capture(record),
    /private-terminal-diagnostic-write-failed/,
  );
  recorder.close();
  assert.equal(recorder.receipt().status, 'failed');
  assert.equal(
    await readFile(
      path.join(f.directory, terminalDiagnosticPolicy.filename),
      'utf8',
    ),
    '',
  );
});

test('overlapping exact credentials redact the whole longest value', () => {
  const auth = Buffer.from(
    JSON.stringify({
      tokens: {
        id_token: 'prefix-secret',
        access_token: 'prefix-secret-private-tail',
        account_id: 'prefix-secret-private-tail-account',
      },
    }),
  );
  const result = sanitizeTerminalError(
    {
      type: 'error',
      message:
        'prefix-secret-private-tail-account prefix-secret-private-tail prefix-secret',
    },
    auth,
  );
  assert.equal(result.message, '<REDACTED> <REDACTED> <REDACTED>');
});

test('private errors retain only fixed message fields and redact known credentials before truncating', () => {
  const secrets = [
    'KNOWN-ACCESS-VALUE',
    'KNOWN-ID-VALUE',
    'KNOWN-ACCOUNT-VALUE',
    'KNOWN-API-VALUE',
  ];
  const auth = Buffer.from(
    JSON.stringify({
      tokens: {
        access_token: secrets[0],
        id_token: secrets[1],
        account_id: secrets[2],
      },
      OPENAI_API_KEY: secrets[3],
    }),
  );
  const record = {
    type: 'turn.failed',
    message: `Unknown stream error: ${secrets.join(' ')} Bearer UNRECOGNIZED-BEARER sk-live_01234567890 eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.sig password=UNKNOWNPASSWORD api_key:"UNKNOWNKEY" account_id=UNKNOWNACCOUNT`,
    error: {
      message: 'A new provider explanation',
      code: 'new_provider_code',
      type: 'unknown_error_type',
      headers: { authorization: 'header-private' },
      access_token: 'hidden-token',
    },
    request: { prompt: 'PRIVATE PROMPT', transcript: 'PRIVATE TRANSCRIPT' },
    headers: { cookie: 'PRIVATE COOKIE' },
  };
  const sanitized = sanitizeTerminalError(record, auth);
  const text = JSON.stringify(sanitized);
  for (const value of [
    ...secrets,
    'UNRECOGNIZED-BEARER',
    'sk-live_01234567890',
    'eyJhbGciOiJIUzI1NiJ9',
    'UNKNOWNPASSWORD',
    'UNKNOWNKEY',
    'UNKNOWNACCOUNT',
    'header-private',
    'hidden-token',
    'PRIVATE PROMPT',
    'PRIVATE TRANSCRIPT',
    'PRIVATE COOKIE',
  ])
    assert(!text.includes(value), value);
  assert(text.includes('Unknown stream error'));
  assert.deepEqual(sanitized.error, {
    message: 'A new provider explanation',
    code: 'new_provider_code',
    type: 'unknown_error_type',
  });
  assert.equal(sanitized.detailHash, hashContent(JSON.stringify(record)));
  assert.equal(sanitized.truncated, false);
  assert.throws(
    () =>
      sanitizeTerminalError({
        type: 'item.completed',
        message: 'not an error',
      }),
    {
      code: 'invalid-contained-private-diagnostics',
      message: 'Only terminal or executor error records may be retained.',
    },
  );
  const escaped = sanitizeTerminalError({
    type: 'error',
    message: '\0'.repeat(100000),
    error: {
      message: '😀'.repeat(100000),
      code: '\0'.repeat(10000),
      type: '\0'.repeat(10000),
    },
  });
  assert.equal(escaped.truncated, true);
  assert(
    Buffer.byteLength(JSON.stringify(escaped)) <=
      terminalDiagnosticPolicy.recordBytes,
  );
  assert(
    Buffer.byteLength(escaped.message!) <=
      terminalDiagnosticPolicy.messageBytes,
  );
  assert(
    Buffer.byteLength(String(escaped.error?.message)) <=
      terminalDiagnosticPolicy.messageBytes,
  );
});

test('private diagnostics exclusively create owner-only artifacts and expose metadata only', async (t) => {
  const f = await fixture(t);
  const description = await describePrivateDiagnostics(
    { directory: f.directory },
    f.excluded,
  );
  assert.deepEqual(description, {
    directory: f.directory,
    policy: terminalDiagnosticPolicy,
  });
  assert(Object.isFrozen(description.policy.fields));
  await assert.rejects(lstat(f.directory), { code: 'ENOENT' });
  const recorder = await createPrivateDiagnostics(
    { directory: f.directory },
    f.excluded,
  );
  t.after(async () => recorder.close());
  assert.deepEqual(recorder.receipt(), {
    status: 'no-terminal-record',
    records: 0,
    bytes: 0,
    truncated: false,
  });
  const file = path.join(f.directory, terminalDiagnosticPolicy.filename);
  assert.equal((await lstat(f.directory)).mode & 0o777, 0o700);
  assert.equal((await lstat(file)).mode & 0o777, 0o600);
  recorder.capture({
    type: 'error',
    message: 'Unknown actionable explanation',
  });
  recorder.close();
  const saved = await readFile(file, 'utf8');
  assert.equal(JSON.parse(saved).message, 'Unknown actionable explanation');
  assert.deepEqual(recorder.receipt(), {
    status: 'captured',
    records: 1,
    bytes: Buffer.byteLength(saved),
    truncated: false,
  });
  assert(!JSON.stringify(recorder.receipt()).includes(f.root));
  assert(!JSON.stringify(recorder.receipt()).includes('explanation'));
  await assert.rejects(
    createPrivateDiagnostics({ directory: f.directory }, f.excluded),
  );
  assert.equal(await readFile(file, 'utf8'), saved);
  assert.throws(
    () => recorder.capture({ type: 'error', message: 'too late' }),
    /private-terminal-diagnostic-write-failed/,
  );
  assert.equal(recorder.receipt().status, 'failed');
});

test('private diagnostics cap total bytes and record counts without invalid JSON fragments', async (t) => {
  const f = await fixture(t);
  const recorder = await createPrivateDiagnostics(
    { directory: f.directory },
    f.excluded,
  );
  t.after(async () => recorder.close());
  for (let i = 0; i < 100; i++)
    recorder.capture({
      type: 'error',
      message: '\0'.repeat(1024),
      error: {
        message: '\0'.repeat(1024),
        code: '\0'.repeat(128),
        type: '\0'.repeat(128),
      },
    });
  recorder.close();
  const saved = await readFile(
    path.join(f.directory, terminalDiagnosticPolicy.filename),
    'utf8',
  );
  assert(Buffer.byteLength(saved) <= terminalDiagnosticPolicy.fileBytes);
  const lines = saved.trim().split('\n');
  assert(lines.length > 0 && lines.length <= terminalDiagnosticPolicy.records);
  for (const line of lines) {
    assert(Buffer.byteLength(line) <= terminalDiagnosticPolicy.recordBytes);
    assert.equal(JSON.parse(line).type, 'error');
  }
  assert.equal(recorder.receipt().truncated, true);
  const small = await createPrivateDiagnostics(
    { directory: path.join(f.root, 'small') },
    f.excluded,
  );
  for (let i = 0; i < 100; i++)
    small.capture({ type: 'error', message: 'small' });
  small.close();
  assert.equal(small.receipt().records, terminalDiagnosticPolicy.records);
  assert.equal(small.receipt().truncated, true);
});

test('unsafe existing, linked, shared and disposable diagnostic paths are rejected without overwrites', async (t) => {
  const f = await fixture(t);
  const existing = path.join(f.root, 'existing');
  await writeFile(existing, 'preserve existing bytes');
  const linked = path.join(f.root, 'linked');
  await symlink(existing, linked);
  const parentLink = path.join(f.root, 'parent-link');
  await symlink(f.root, parentLink);
  const shared = path.join(f.root, 'shared');
  await mkdir(shared, { mode: 0o700 });
  await chmod(shared, 0o755);
  for (const directory of [
    existing,
    linked,
    path.join(parentLink, 'new'),
    path.join(shared, 'new'),
    ...f.excluded,
    path.join(f.excluded[0], 'new'),
    path.join(f.excluded[1], 'new'),
    f.root,
    'relative',
    f.directory + '/',
    f.directory + '\n',
  ]) {
    await assert.rejects(
      createPrivateDiagnostics({ directory }, f.excluded),
      directory,
    );
  }
  assert.equal(await readFile(existing, 'utf8'), 'preserve existing bytes');
  assert((await lstat(linked)).isSymbolicLink());
  await assert.rejects(
    describePrivateDiagnostics(
      { directory: f.directory, extra: true } as never,
      f.excluded,
    ),
  );
});
