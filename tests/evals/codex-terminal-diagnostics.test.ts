import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCodex } from '../../scripts/evals/profiles/codex/profile.ts';
import { observationGuard } from '../../scripts/evals/observations.ts';

const unsupported =
  "The 'retired-model' model is not supported when using Codex with a ChatGPT account.";
const parse = (message: unknown, extra = {}) =>
  parseCodex(JSON.stringify({ type: 'error', message, ...extra }));

const contextLimit =
  "Codex ran out of room in the model's context window. Start a new thread or clear earlier history before retrying.";

test('pinned terminal formats retain fixed identities without private variable tails', () => {
  const privateValue = 'synthetic-private-terminal-value';
  for (const [message, value] of [
    [contextLimit, 'context-window-exceeded'],
    ['request timed out', 'request-timeout'],
    [
      'stream disconnected before completion: ' + privateValue,
      'stream-disconnected',
    ],
    [
      'exceeded retry limit, last status: 503 Service Unavailable, request id: ' +
        privateValue,
      'retry-limit-exhausted',
    ],
  ]) {
    const result = parseCodex(
      JSON.stringify({ type: 'turn.failed', error: { message, privateValue } }),
    );
    assert.deepEqual(result.diagnostics?.messageId, {
      value,
      source: 'terminal-message',
    });
    assert.deepEqual(
      (result.records[0].diagnostics as Record<string, unknown>).messageId,
      result.diagnostics?.messageId,
    );
    observationGuard([message, privateValue])(result);
  }
});

test('new terminal formats reject misleading text, controls and UTF-8 overflow', () => {
  const prefix = 'stream disconnected before completion: ';
  const fitting =
    prefix + 'é'.repeat(Math.floor((2048 - Buffer.byteLength(prefix)) / 2));
  assert(Buffer.byteLength(fitting) <= 2048);
  assert.equal(
    parse(fitting).diagnostics?.messageId?.value,
    'stream-disconnected',
  );
  for (const message of [
    'prefix ' + contextLimit,
    contextLimit + ' extra',
    'request timed out later',
    'Request timed out',
    'quoted: ' + prefix + 'details',
    'stream disconnected before completion! details',
    'exceeded retry limit, last status: wrong',
    'exceeded retry limit, last status: 429.5',
    'exceeded retry limit, last status: 503 Service Unavailable, other: private',
    prefix + 'private\nmore',
    prefix + 'private\u0000more',
    prefix + 'private\u007fmore',
    prefix + 'private\u2028more',
    fitting + 'é',
  ])
    assert.equal(parse(message).diagnostics?.messageId, undefined, message);
  assert.equal(
    parse(JSON.stringify({ note: contextLimit })).diagnostics?.messageId,
    undefined,
  );
});

test('event-local clues preserve terminal identity without replacing aggregate precedence or adding identifiers', () => {
  const privateValue = 'synthetic-private-event-value';
  const first = {
    type: 'error',
    status_code: 429,
    code: 'rate_limit_exceeded',
    retry_after: 7,
    request_id: privateValue,
    message: 'request timed out',
  };
  const last = {
    type: 'turn.failed',
    error: {
      status: 503,
      code: 'server_is_overloaded',
      message: 'stream disconnected before completion: ' + privateValue,
    },
  };
  const result = parseCodex(
    [first, last].map((record) => JSON.stringify(record)).join('\n'),
  );
  assert.deepEqual(result.diagnostics?.messageId, {
    value: 'request-timeout',
    source: 'terminal-message',
  });
  assert.deepEqual(result.diagnostics?.httpStatus, {
    value: 429,
    source: 'terminal-record',
  });
  assert.deepEqual(result.diagnostics?.serverCode, {
    value: 'rate_limit_exceeded',
    source: 'terminal-record',
  });
  assert.deepEqual(
    result.records.map((record) => record.diagnostics),
    [
      {
        httpStatus: { value: 429, source: 'terminal-record' },
        serverCode: { value: 'rate_limit_exceeded', source: 'terminal-record' },
        messageId: { value: 'request-timeout', source: 'terminal-message' },
      },
      {
        httpStatus: { value: 503, source: 'terminal-record' },
        serverCode: {
          value: 'server_is_overloaded',
          source: 'terminal-record',
        },
        messageId: { value: 'stream-disconnected', source: 'terminal-message' },
      },
    ],
  );
  for (const record of result.records)
    assert.deepEqual(Object.keys(record).sort(), [
      'detailHash',
      'diagnostics',
      'type',
    ]);
  const unknown = parse(privateValue, {
    request_id: privateValue,
    retry_after: 7,
  });
  assert.deepEqual(Object.keys(unknown.records[0]).sort(), [
    'detailHash',
    'type',
  ]);
  assert.equal(unknown.diagnostics?.retryAfterSeconds?.value, 7);
  observationGuard([privateValue])(result);
});

test('subscription model template survives terminal JSON without inventing HTTP status or retaining text', () => {
  for (const message of [
    unsupported,
    JSON.stringify({ detail: unsupported }),
    JSON.stringify({ error: { message: unsupported } }),
  ]) {
    const result = parse(message);
    assert.deepEqual(result.diagnostics?.messageId, {
      value: 'model-unsupported-chatgpt',
      source: 'terminal-message',
    });
    assert.equal(result.diagnostics?.httpStatus, null);
    assert.equal(result.diagnostics?.serverCode, null);
    assert.equal(JSON.stringify(result).includes('retired-model'), false);
    assert.equal(result.records.length, 1);
    assert.equal(typeof result.records[0].detailHash, 'string');
  }
});

test('strict error fields preserve structured precedence and exclude embedded secrets', () => {
  const secret = 'synthetic-private-value-47';
  const result = parse(
    JSON.stringify({
      error: {
        message: unsupported,
        code: 'rate_limit_exceeded',
        private: secret,
      },
      private: secret,
    }),
    { code: 'insufficient_quota', status: 429 },
  );
  assert.deepEqual(result.diagnostics?.serverCode, {
    value: 'insufficient_quota',
    source: 'terminal-record',
  });
  assert.deepEqual(result.diagnostics?.httpStatus, {
    value: 429,
    source: 'terminal-record',
  });
  assert.equal(
    result.diagnostics?.messageId?.value,
    'model-unsupported-chatgpt',
  );
  observationGuard([secret, unsupported])(result);
  const nested = parse(
    JSON.stringify({ error: { code: 'rate_limit_exceeded' } }),
  );
  assert.deepEqual(nested.diagnostics?.serverCode, {
    value: 'rate_limit_exceeded',
    source: 'terminal-message',
  });
});

test('misleading fragments, unknown JSON and arbitrary nested fields remain unclassified', () => {
  for (const message of [
    'context: ' + unsupported,
    unsupported + ' untrusted extra text',
    unsupported.replace('retired-model', 'private\nmodel'),
    JSON.stringify({
      note: unsupported,
      metadata: { code: 'rate_limit_exceeded' },
    }),
    JSON.stringify({ error: { detail: unsupported } }),
    JSON.stringify([{ detail: unsupported }]),
    JSON.stringify({ error: { code: 'arbitrary-private-code' } }),
    '{not-json}',
  ]) {
    const result = parse(message);
    assert.equal(result.diagnostics?.messageId, undefined);
    assert.equal(result.diagnostics?.serverCode, null);
    assert.equal(result.diagnostics?.httpStatus, null);
  }
});

test('local configuration errors get only fixed stderr identities', () => {
  for (const [stderr, value] of [
    ['Error loading config.toml: private parse details', 'config-load'],
    [
      'Error: Model provider `private-provider` not found',
      'provider-not-found',
    ],
  ]) {
    const result = parseCodex('', stderr);
    assert.deepEqual(result.diagnostics?.messageId, {
      value,
      source: 'stderr-message',
    });
    assert(!JSON.stringify(result).includes('private'));
  }
  assert.equal(
    parseCodex('', 'prefix Error loading config.toml: nope').diagnostics
      .messageId,
    undefined,
  );
  assert.equal(
    parse('Error: Model provider `private-provider` not found').diagnostics
      ?.messageId,
    undefined,
  );
});
