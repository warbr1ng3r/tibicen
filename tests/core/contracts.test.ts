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
import { containsSecret, createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { runCommand } from '../../scripts/core/execute.ts';
import {
  mkdir,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

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

test('proposal reports an unsafe change path as unsafe-path before any other classification', async (t) => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'tibicen-unsafe-path-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const outside = path.join(base, 'outside', 'AGENTS.md');
  await mkdir(root);
  await mkdir(path.dirname(outside));
  await writeFile(path.join(root, 'AGENTS.md'), 'Owner rules\n');
  await writeFile(path.join(root, 'app.txt'), 'Keep app\n');
  await writeFile(outside, 'Outside sentinel\n');
  const cli = fileURLToPath(
    new URL('../../scripts/tibicen.ts', import.meta.url),
  );
  const proposal = (mode: string, changePath: string) =>
    JSON.stringify({
      mode,
      changes: [
        {
          path: changePath,
          content: 'Escaping content\n',
          reason: 'Controller path-escape probe',
        },
      ],
    });
  const code = (input: string) => {
    const result = spawnSync(
      process.execPath,
      [cli, 'proposal', '--root', root, '--input', '-'],
      { input, encoding: 'utf8', timeout: 10000 },
    );
    assert.equal(result.status, 1, result.stdout + result.stderr);
    return (JSON.parse(result.stdout) as { error: { code: string } }).error
      .code;
  };
  for (const mode of ['init', 'improve'])
    for (const changePath of [
      '..\\outside\\AGENTS.md',
      '..\\..\\x',
      '.\\..\\x',
      'src\\..\\..\\outside\\AGENTS.md',
      'src\\..\\..\\.cursor\\rules\\x.mdc',
      '.tibicen/../x',
      '../outside/AGENTS.md',
      outside,
    ])
      assert.equal(
        code(proposal(mode, changePath)),
        'unsafe-path',
        `${mode}: ${changePath}`,
      );
  // A valid application path keeps its own classification.
  assert.equal(code(proposal('improve', 'app.txt')), 'application-protected');
  assert.equal(await readFile(outside, 'utf8'), 'Outside sentinel\n');
  assert.deepEqual(
    (await readdir(root)).filter((name) => name !== '.DS_Store').sort(),
    ['AGENTS.md', 'app.txt'],
  );
});

test('apply reports an unsafe planned change path as unsafe-path before any other classification', async (t) => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'tibicen-unsafe-apply-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await writeFile(path.join(root, 'AGENTS.md'), 'Owner rules\n');
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: 'Owner rules\nApproved addition\n',
          reason: 'Approved addition',
        },
      ],
    },
    { home },
  );
  for (const unsafe of [
    'AGENTS.md\\..\\..\\x',
    'app.txt\\x',
    'AGENTS.md/',
    '.tibicen/../x',
  ]) {
    // Only a state file edited outside Tibicen can still carry such a path.
    const mutated = structuredClone(plan);
    mutated.proposal.changes[0].path = unsafe;
    await assert.rejects(
      applyPlan(root, mutated, {
        home,
        approvedDigest: digest(mutated.proposal),
      }),
      { code: 'unsafe-path' },
      unsafe,
    );
  }
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'Owner rules\n',
  );
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

test('secret inspection exempts a placeholder only when the whole value is one', () => {
  for (const content of [
    // A placeholder prefix does not exempt a literal, quoted or bare.
    '"TOKEN": "<token>SYNTH-LITERAL-7f3a9c"',
    'API_KEY=${DOCS_API_KEY}abc',
    '"API_KEY": "${DOCS_API_KEY}abc"',
    "password='<token>abc'",
    'token="***abc"',
    'secret="[redacted]abc"',
  ])
    assert.equal(containsSecret(content), true, content);
  for (const content of [
    // Complete placeholders keep their exemption.
    'TOKEN="<token>"',
    'secret="<VALUE>"',
    'API_KEY="${DOCS_API_KEY}"',
    'API_KEY="${env:DOCS_API_KEY}"',
    'password="[redacted]"',
    'token="***"',
    'API_KEY=${DOCS_API_KEY}',
    'API_KEY=${env:DOCS_API_KEY}',
    'TOKEN=<token>',
    // A bare value is inspected only in the shape above.
    'API_KEY=literal-value',
    'API_KEY=${ENV}_${NAME}',
    'https://host/?token=${DOCS_API_KEY}&v=1',
    '`TOKEN=<token>`',
  ])
    assert.equal(containsSecret(content), false, content);
});

test('secret inspection covers spaced values, shared key names and decoded JSON keys', () => {
  for (const content of [
    'TOKEN="<token> SYNTH-VALUE"',
    "password='literal value with spaces'",
    'AUTHORIZATION="Bearer SYNTH-VALUE"',
    'client_credentials="SYNTH-VALUE"',
    'TOKEN="<token>\\"SYNTH-VALUE"',
    '{"env":{"API_TO\\u004bEN":"SYNTH-VALUE"}}',
    '{"env":{"CREDENTIALS":"x"}}',
    '{"env":{"TO\\u004bEN":"SYNTH-VALUE","TOKEN":""}}',
    '{"env":{"TO\\u004bEN":"SYNTH-VALUE"},"env":{}}',
    '{"env":{"TOKEN":"<token>\\u0020SYNTH-VALUE"}}',
  ])
    assert.equal(containsSecret(content), true, content);
  for (const content of [
    '{"TOKEN":"\\u003ctoken>"}',
    '{"TOKEN":"\\u0024{TOKEN}"}',
  ]) {
    assert.equal(containsSecret(content), false, content);
  }
  for (const value of [
    '${DOCS_TOKEN}',
    '${env:DOCS_TOKEN}',
    '<token>',
    '[redacted]',
    '***',
    '',
  ]) {
    assert.equal(
      containsSecret(JSON.stringify({ env: { AUTHORIZATION: value } })),
      false,
      value,
    );
  }
});

test('raw proposal, current-file reading and approved apply refuse secret reflection and writes', async (t) => {
  const base = await mkdtemp(path.join(os.tmpdir(), 'tibicen-raw-secret-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const cli = fileURLToPath(
    new URL('../../scripts/tibicen.ts', import.meta.url),
  );
  for (const [i, relative] of [
    'AGENTS.md',
    '.mcp.json',
    '.cursor/mcp.json',
  ].entries()) {
    const root = path.join(base, `project-${i}`),
      home = path.join(base, `home-${i}`);
    await mkdir(root);
    await mkdir(home);
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    const original =
      relative === 'AGENTS.md' ? '# Owner instructions\n' : '{}\n';
    await writeFile(path.join(root, relative), original);
    const snapshot = await readdir(root, { recursive: true });
    const safe = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: relative,
            content:
              relative === 'AGENTS.md'
                ? '# Updated owner instructions\n'
                : '{"mcpServers":{}}\n',
            reason: 'Safe control',
          },
        ],
      },
      { home },
    );
    const literal = 'SYNTH-RAW-7f3a9c';
    for (const content of [
      `{"env":{"TOKEN":"<token> ${literal}"}}`,
      `{"env":{"AUTHORIZATION":"Bearer ${literal}"}}`,
      `{"env":{"API_TO\\u004bEN":"${literal}"}}`,
      `{"env":{"TO\\u004bEN":"${literal}","TOKEN":""}}`,
      `{"env":{"TO\\u004bEN":"${literal}"},"env":{}}`,
    ]) {
      const request = {
        mode: 'improve',
        changes: [
          { path: relative, content, reason: 'Synthetic secret probe' },
        ],
      };
      const proposal = spawnSync(
        process.execPath,
        [cli, 'proposal', '--root', root, '--input', '-'],
        {
          input: JSON.stringify(request),
          encoding: 'utf8',
          env: { HOME: home, PATH: '' },
          timeout: 10000,
        },
      );
      assert.equal(proposal.status, 1, `${relative}: ${content}`);
      assert.equal(JSON.parse(proposal.stdout).error.code, 'secret-content');
      assert.ok(!(proposal.stdout + proposal.stderr).includes(literal));
      const forged = structuredClone(safe);
      forged.proposal.changes[0].content = content;
      forged.digest = digest(forged.proposal);
      await assert.rejects(
        () => applyPlan(root, forged, { home, approvedDigest: forged.digest }),
        { code: 'secret-content' },
      );
      assert.equal(await readFile(path.join(root, relative), 'utf8'), original);
      assert.deepEqual(await readdir(root, { recursive: true }), snapshot);
      assert.deepEqual(await readdir(home), []);
      await writeFile(path.join(root, relative), content);
      await assert.rejects(() => createProposal(root, request, { home }), {
        code: 'secret-content',
      });
      await writeFile(path.join(root, relative), original);
    }
    const encoded = '{"env":{"TOKEN":"\\u003ctoken>"}}';
    const control = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: relative,
            content: encoded,
            reason: 'Encoded placeholder control',
          },
        ],
      },
      { home },
    );
    assert.equal(control.proposal.changes[0].content, encoded);
    assert.equal(await readFile(path.join(root, relative), 'utf8'), original);
  }
});

test('one MiB of escaped quotes finishes secret inspection within a bounded process', () => {
  const source = new URL('../../scripts/core/plan.ts', import.meta.url).href;
  const code = `import {containsSecret} from ${JSON.stringify(source)}; if (containsSecret(JSON.stringify({note:'"'.repeat(512*1024)}))) process.exit(1);`;
  const result = spawnSync(
    process.execPath,
    ['--input-type=module', '-e', code],
    { encoding: 'utf8', timeout: 5000 },
  );
  assert.equal(result.status, 0, result.error?.message ?? result.stderr);
});
