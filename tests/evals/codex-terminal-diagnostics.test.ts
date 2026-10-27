import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCodex } from '../../scripts/evals/profiles/codex/profile.ts';
import { observationGuard } from '../../scripts/evals/observations.ts';

const unsupported =
  "The 'retired-model' model is not supported when using Codex with a ChatGPT account.";
const parse = (message: unknown, extra = {}) =>
  parseCodex(JSON.stringify({ type: 'error', message, ...extra }));

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
