import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import {
  loadCodexProfile,
  loadTrustedCodexFixture,
  parseCodex,
} from '../../scripts/evals/profiles/codex/profile.ts';
import { preflightCodex } from '../../scripts/evals/codex-preflight.ts';

const noFailureHints = {
  httpStatus: null,
  serverCode: null,
  retryAfterSeconds: null,
  requestIdHash: null,
  internalRetryCount: null,
};
const jsonl = (...records: unknown[]) =>
  records.map((record) => JSON.stringify(record)).join('\n');

test('generic Codex 429 binds terminal details without inventing a cause or retry count', () => {
  const message = 'exceeded retry limit, last status: 429 Too Many Requests';
  const errors = [
    { type: 'error', message },
    { type: 'turn.failed', error: { message } },
  ];
  const parsed = parseCodex(jsonl({ type: 'turn.started' }, ...errors));
  assert.deepEqual(
    parsed.records,
    errors.map((record) => ({
      type: record.type,
      detailHash: hashContent(JSON.stringify(record)),
    })),
  );
  assert.deepEqual(parsed.diagnostics, {
    ...noFailureHints,
    httpStatus: { value: 429, source: 'terminal-message' },
  });
  assert.equal(parsed.started, true);
  assert.equal(parsed.completed, false);
  assert.deepEqual(parsed.usage, { inputTokens: null, outputTokens: null });
});

test('structured Codex hints take precedence and retain only safe scalar diagnostics', () => {
  const error = {
    type: 'error',
    status_code: 429,
    error: {
      code: 'rate_limit_exceeded',
      message: 'last status: 503',
      headers: { 'Retry-After': '12.5', 'X-Request-ID': 'terminal-request' },
    },
  };
  const parsed = parseCodex(
    jsonl(error),
    'HTTP/2 500\nRetry-After: 7\nX-Request-ID: stderr-request\ncode=insufficient_quota',
  );
  assert.deepEqual(parsed.records, [
    { type: error.type, detailHash: hashContent(JSON.stringify(error)) },
  ]);
  assert.deepEqual(parsed.diagnostics, {
    httpStatus: { value: 429, source: 'terminal-record' },
    serverCode: { value: 'rate_limit_exceeded', source: 'terminal-record' },
    retryAfterSeconds: { value: 12.5, source: 'terminal-record' },
    requestIdHash: {
      value: hashContent('terminal-request'),
      source: 'terminal-record',
    },
    internalRetryCount: null,
  });
});

test('terminal failure projection excludes structured private details and arbitrary messages', () => {
  const requestId = 'req-synthetic-private-id';
  const prompt = 'A confidential synthetic prompt';
  const identity = 'synthetic-person@example.invalid';
  const credential = 'Bearer synthetic-private-credential';
  const failures = [
    {
      type: 'error',
      status: 429,
      error: {
        code: 'rate_limit_exceeded',
        headers: {
          'Retry-After': '7',
          'X-Request-ID': requestId,
          Authorization: credential,
        },
        request_id: requestId,
        message: prompt,
        identity,
      },
    },
    {
      type: 'turn.failed',
      error: { message: 'Unexpected private provider response: ' + prompt },
      identity,
    },
  ];
  const parsed = parseCodex(jsonl(...failures));
  assert.deepEqual(
    parsed.records,
    failures.map((record) => ({
      type: record.type,
      detailHash: hashContent(JSON.stringify(record)),
    })),
  );
  assert.deepEqual(parsed.diagnostics, {
    httpStatus: { value: 429, source: 'terminal-record' },
    serverCode: { value: 'rate_limit_exceeded', source: 'terminal-record' },
    retryAfterSeconds: { value: 7, source: 'terminal-record' },
    requestIdHash: { value: hashContent(requestId), source: 'terminal-record' },
    internalRetryCount: null,
  });
  for (const text of [requestId, prompt, identity, credential])
    assert(!JSON.stringify(parsed).includes(text));
  const unknown = { type: 'error', message: prompt, provider: identity };
  const projected = parseCodex(jsonl(unknown));
  assert.deepEqual(projected.records, [
    { type: 'error', detailHash: hashContent(JSON.stringify(unknown)) },
  ]);
  assert.deepEqual(projected.diagnostics, noFailureHints);
  assert(!JSON.stringify(projected).includes(prompt));
  assert(!JSON.stringify(projected).includes(identity));
});

test('bounded stderr headers supplement a generic terminal failure without leaking sensitive text', () => {
  const secret = 'sk-synthetic-key-that-must-stay-private';
  const prompt = 'A synthetic private prompt must stay private';
  const requestId = 'synthetic-request-id';
  const parsed = parseCodex(
    jsonl({ type: 'error', message: 'last status: 429' }),
    [
      'Authorization: Bearer ' + secret,
      'Prompt: ' + prompt,
      'X-Owner: private@example.invalid',
      'Retry-After: 7',
      'X-Request-Id: ' + requestId,
      'X-Error-Code: ' + secret,
    ].join('\n'),
  );
  assert.deepEqual(parsed.diagnostics, {
    ...noFailureHints,
    httpStatus: { value: 429, source: 'terminal-message' },
    retryAfterSeconds: { value: 7, source: 'stderr-header' },
    requestIdHash: { value: hashContent(requestId), source: 'stderr-header' },
  });
  for (const privateText of [
    secret,
    prompt,
    requestId,
    'private@example.invalid',
  ])
    assert(!JSON.stringify(parsed).includes(privateText));
});

test('explicit failure messages and stderr headers report their fixed sources', () => {
  const message = parseCodex(
    jsonl({
      type: 'turn.failed',
      error: {
        message:
          'HTTP status 429; code=usage_limit_reached; retry_after=0; request_id=message-request',
      },
    }),
  );
  assert.deepEqual(message.diagnostics, {
    httpStatus: { value: 429, source: 'terminal-message' },
    serverCode: { value: 'usage_limit_reached', source: 'terminal-message' },
    retryAfterSeconds: { value: 0, source: 'terminal-message' },
    requestIdHash: {
      value: hashContent('message-request'),
      source: 'terminal-message',
    },
    internalRetryCount: null,
  });
  assert.deepEqual(
    parseCodex('', 'HTTP/2 503\nRetry-After: 604800\ncode=server_is_overloaded')
      .diagnostics,
    {
      ...noFailureHints,
      httpStatus: { value: 503, source: 'stderr-header' },
      serverCode: { value: 'server_is_overloaded', source: 'stderr-message' },
      retryAfterSeconds: { value: 604800, source: 'stderr-header' },
    },
  );
});

test('Codex diagnostics reject unknown codes, invalid bounds and oversized request ids', () => {
  for (const error of [
    {
      status: 399,
      code: 'a-private-identifier',
      retry_after: -1,
      request_id: '',
    },
    { status: 600, code: 'rate_limit_exceeded-secret', retry_after: 604801 },
    { status: 429.5, code: 'unknown', retry_after: 'tomorrow' },
    {
      status: '429 secret',
      retry_after: 'Infinity',
      request_id: 'x'.repeat(513),
    },
    { request_id: '   ' },
  ]) {
    assert.deepEqual(
      parseCodex(jsonl({ type: 'error', ...error })).diagnostics,
      noFailureHints,
    );
  }
  assert.deepEqual(
    parseCodex(
      '',
      'HTTP/2 600\nRetry-After: -1\nX-Request-ID: ' +
        'x'.repeat(513) +
        '\ncode=unknown',
    ).diagnostics,
    noFailureHints,
  );
  const requestId = 'x'.repeat(512);
  assert.deepEqual(
    parseCodex(jsonl({ type: 'error', request_id: requestId })).diagnostics
      ?.requestIdHash,
    { value: hashContent(requestId), source: 'terminal-record' },
  );
});

test('malformed text hints cannot turn partial values into valid diagnostics', () => {
  for (const message of [
    'HTTP status 429.5',
    'last status: 600',
    'last status: 399',
    'code=rate_limit_exceeded-secret; retry_after=604801',
    'retry_after=-1; code=unknown',
  ])
    assert.deepEqual(
      parseCodex(jsonl({ type: 'error', message })).diagnostics,
      noFailureHints,
    );
  assert.deepEqual(
    parseCodex(
      jsonl({ type: 'error', message: '{"code":"slow_down","retry_after":7}' }),
    ).diagnostics,
    {
      ...noFailureHints,
      serverCode: { value: 'slow_down', source: 'terminal-message' },
      retryAfterSeconds: { value: 7, source: 'terminal-message' },
    },
  );
});

test('published Codex error codes are fixed and successful one-argument parsing preserves usage', () => {
  for (const code of [
    'rate_limit_exceeded',
    'insufficient_quota',
    'usage_limit_reached',
    'slow_down',
    'credit_balance_exhausted',
    'organization_spend_limit_exceeded',
    'project_spend_limit_exceeded',
    'organization_usage_limit_exceeded',
    'server_is_overloaded',
  ])
    assert.deepEqual(
      parseCodex(jsonl({ type: 'error', code })).diagnostics?.serverCode,
      { value: code, source: 'terminal-record' },
    );
  const completed = {
    type: 'turn.completed',
    usage: { input_tokens: 14, output_tokens: 3 },
  };
  const items = [
    { type: 'item.completed', item: { type: 'agent_message', text: 'Done' } },
    {
      type: 'item.completed',
      item: {
        type: 'command_execution',
        id: 'synthetic-command',
        command: 'node --test',
        aggregated_output: 'passed',
        exit_code: 0,
      },
    },
    { type: 'item.completed', item: { type: 'file_change', changes: [] } },
  ];
  const parsed = parseCodex(
    jsonl({ type: 'turn.started' }, ...items, completed),
  );
  assert.deepEqual(parsed.records, [...items, completed]);
  assert.deepEqual(parsed.messages, ['Done']);
  assert.deepEqual(parsed.commands, [
    {
      command: 'node --test',
      output: 'passed',
      exitCode: 0,
      toolUseId: 'synthetic-command',
    },
  ]);
  assert.deepEqual(parsed.usage, { inputTokens: 14, outputTokens: 3 });
  assert.equal(parsed.completed, true);
  assert.deepEqual(parsed.diagnostics, noFailureHints);
});

async function fixture() {
  const scope = await mkdtemp(path.join(os.tmpdir(), 'tibicen-codex-profile-'));
  const binary = path.join(scope, 'codex'),
    filename = path.join(scope, 'ready.json');
  await writeFile(binary, 'Offline profile metadata only; never execute.\n', {
    mode: 0o755,
  });
  const ready = {
    preflight: {
      status: 'ready',
      startupControlled: true,
      authProtected: true,
      processTreeControlled: true,
      isolation: 'controlled',
    },
    cli: {
      path: binary,
      version: 'codex-cli 0.157.0',
      binaryHash: hashContent(await readFile(binary)),
    },
    candidateModel: 'gpt-6-sol',
    startupHash: digest('offline-startup'),
    permissionsHash: digest('offline-permissions'),
  };
  const save = () => writeFile(filename, JSON.stringify(ready));
  return { scope, filename, ready, save };
}

for (const model of ['gpt-6-sol', 'gpt-6.1-sol'])
  test(
    'Codex profile preserves the observed preflight model without substitution: ' +
      model,
    async (t) => {
      const f = await fixture();
      t.after(() => rm(f.scope, { recursive: true, force: true }));
      f.ready.candidateModel = model;
      await f.save();
      const profile = await loadTrustedCodexFixture(f.filename);
      assert.equal(profile.state, 'ready');
      if (profile.state !== 'ready')
        throw new Error('Expected ready offline profile.');
      assert.equal(profile.specification.model, model);
      assert.equal(profile.specification.id, 'codex-0.157.0-' + model);
      assert.equal(profile.specification.auth, 'none');
      assert.equal(profile.specification.paid, false);
      const invocation = profile.invocation({
        root: path.join(f.scope, 'project'),
        home: path.join(f.scope, 'home'),
        privateRoot: f.scope,
        read: [],
        write: [],
        deny: [],
        environment: {},
      });
      assert.equal(
        invocation.argv[invocation.argv.indexOf('--model') + 1],
        model,
      );
      assert(invocation.argv.includes('--ignore-user-config'));
      assert(invocation.argv.includes('--ignore-rules'));
      assert(invocation.argv.includes('--no-daemon'));
      assert.equal(invocation.env.OPENAI_API_KEY, undefined);
    },
  );

test('Codex still refuses an unobserved CLI version, a blocked preflight and invalid model ids', async (t) => {
  const f = await fixture();
  t.after(() => rm(f.scope, { recursive: true, force: true }));
  f.ready.cli.version = 'codex-cli 0.158.0';
  await f.save();
  await assert.rejects(loadTrustedCodexFixture(f.filename), {
    code: 'native-preflight-required',
  });
  f.ready.cli.version = 'codex-cli 0.157.0';
  await writeFile(
    f.filename,
    JSON.stringify({
      ...f.ready,
      preflight: {
        ...f.ready.preflight,
        status: 'blocked',
        reason: 'offline-blocked',
      },
    }),
  );
  await assert.rejects(loadTrustedCodexFixture(f.filename), {
    code: 'native-preflight-required',
  });
  for (const model of [
    '',
    null,
    42,
    { toString: 'invalid' },
    '--model=other',
    'gpt-6-sol\nother',
    'gpt/other',
    'x'.repeat(160),
  ]) {
    await writeFile(
      f.filename,
      JSON.stringify({ ...f.ready, candidateModel: model }),
    );
    await assert.rejects(loadTrustedCodexFixture(f.filename), {
      code: 'native-preflight-required',
    });
  }
});

test('the existing preflight default remains gpt-6.1-sol without a startup or model request', async (t) => {
  const scope = await mkdtemp(path.join(os.tmpdir(), 'tibicen-codex-default-'));
  t.after(() => rm(scope, { recursive: true, force: true }));
  const binary = path.join(scope, 'codex');
  await writeFile(
    binary,
    `#!${process.execPath}\nif(process.argv.includes('--version'))console.log('codex-cli 0.157.0');else process.exit(1);\n`,
    { mode: 0o755 },
  );
  const result = await preflightCodex(binary);
  assert.equal(result.candidateModel, 'gpt-6.1-sol');
  assert.equal(result.modelRequests, 0);
  assert.equal(result.startup, null);
  assert.equal(result.preflight.status, 'blocked');
});

test('production profile rejects a cached ready claim and serialized fixture bypasses before reading a CLI', async (t) => {
  const f = await fixture();
  t.after(() => rm(f.scope, { recursive: true, force: true }));
  f.ready.cli.path = '/nonexistent/do-not-read-or-launch';
  await writeFile(
    f.filename,
    JSON.stringify({
      ...f.ready,
      trustedFixture: true,
      processTreeControlled: true,
    }),
  );
  const result = await loadCodexProfile(f.filename);
  assert.equal(result.state, 'blocked');
  assert.equal(
    result.preflight.reason,
    'native-process-containment-unavailable',
  );
  assert.equal(result.specification.auth, 'none');
});
