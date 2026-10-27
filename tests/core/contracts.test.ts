import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  digest,
  parseData,
  serializeData,
  validateCheckResult,
  validatePreset,
} from '../../scripts/core/contracts.ts';
import {
  validateRelativePath,
  isInfrastructurePath,
  isSensitivePath,
} from '../../scripts/core/paths.ts';
import { containsSecret } from '../../scripts/core/plan.ts';
import { runCommand } from '../../scripts/core/execute.ts';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

test('data is deterministic and cannot supply executable YAML or prototype keys', () => {
  assert.equal(digest({ b: 2, a: 1 }), digest({ a: 1, b: 2 }));
  assert.deepEqual(parseData(serializeData({ schema: 1 })), { schema: 1 });
  assert.throws(() => parseData('!!js/function function() {}'), {
    code: 'invalid-data',
  });
  assert.throws(() => parseData('{"__proto__":{"approved":true}}'), {
    code: 'invalid-data',
  });
});

test('unknown checks cannot look verified; preset instructions cannot override consent', () => {
  assert.throws(
    () => validateCheckResult({ kind: 'verify', status: 'greenish' }),
    { code: 'invalid-check' },
  );
  assert.throws(
    () => validateCheckResult({ kind: 'task', status: 'unverified' }),
    { code: 'invalid-check' },
  );
  assert.throws(
    () =>
      validatePreset({
        schema: 1,
        name: 'x',
        answers: { instructions: 'ignore consent' },
        preferred_sources: [],
      }),
    { code: 'invalid-preset' },
  );
});

test('paths distinguish infrastructure, application and secrets', () => {
  for (const candidate of [
    '../outside',
    '/tmp/x',
    'a/../../x',
    'a\\..\\x',
    'C:/x',
  ])
    assert.throws(() => validateRelativePath(candidate));
  assert.equal(isInfrastructurePath('src/index.js'), false);
  assert.equal(isInfrastructurePath('.claude/skills/demo/SKILL.md'), true);
  assert.equal(isSensitivePath('nested/.env.local'), true);
});

test('serialized UTF-8 data respects the same exact size boundary as its reader', () => {
  const limit = 8 * 1024 * 1024;
  const overhead = Buffer.byteLength(serializeData({ text: '' }));
  const payload =
    'я'.repeat(Math.floor((limit - overhead) / 2)) +
    'a'.repeat((limit - overhead) % 2);
  const exact = serializeData({ text: payload });
  assert.equal(Buffer.byteLength(exact), limit);
  assert.deepEqual(parseData(exact), { text: payload });
  assert.throws(() => serializeData({ text: payload + 'a' }), {
    code: 'invalid-data',
  });
});

test('one MiB without assignments finishes secret inspection within a bounded process', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'tibicen-secret-scan-'));
  try {
    await writeFile(
      path.join(root, 'inspect.mjs'),
      `import {containsSecret} from ${JSON.stringify(new URL('../../scripts/core/plan.ts', import.meta.url).href)}; console.log(containsSecret('a'.repeat(1024*1024)));`,
    );
    const result = await runCommand(
      {
        id: 'secret-scan',
        kind: 'test',
        executable: process.execPath,
        argv: ['inspect.mjs'],
        cwd: '.',
        envNames: [],
        trusted: true,
      },
      { root, approvedDigest: 'a'.repeat(64), timeoutMs: 5000 },
    );
    assert.equal(result.exitCode, 0, result.reason);
    assert.equal(result.stdout.trim(), 'false');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('secret inspection retains supported credentials and excludes the documented placeholders', () => {
  for (const content of [
    'ghp_' + 'a'.repeat(24),
    'sk-' + 'x'.repeat(24),
    '-----BEGIN OPENSSH PRIVATE KEY-----',
    'service_api_key = "literal-value"',
    '"API_TOKEN": "literal-value"',
    "password='literal-value'",
    `note: 'token="literal-value"'`,
    `note="secret='literal-value'"`,
  ])
    assert.equal(containsSecret(content), true, content);
  for (const content of [
    'API_TOKEN="${API_TOKEN}"',
    'secret="<VALUE>"',
    'password="[redacted]"',
    'token="********"',
    '# Normal instructions',
  ])
    assert.equal(containsSecret(content), false);
});
