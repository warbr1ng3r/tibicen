import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import {
  mkdtemp,
  readFile,
  writeFile,
  mkdir,
  stat,
  rm,
  symlink,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { diagnosticMain } from '../../scripts/evals/diagnostic.ts';
import { nativeCheckout } from './native-control.ts';

const entry = fileURLToPath(
  new URL('../../scripts/evals/diagnostic.ts', import.meta.url),
);
async function fixture(t: TestContext) {
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-diagnostic-entry-'),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const marker = path.join(root, 'spawned'),
    guard = path.join(root, 'guard.mjs');
  await writeFile(
    guard,
    `import child from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {writeFileSync} from 'node:fs';
child.spawn=()=>{writeFileSync(${JSON.stringify(marker)},'called');throw new Error('sk-synthetic-private-value-1234567890');};
syncBuiltinESMExports();\n`,
  );
  const env = {
    HOME: path.join(root, 'home'),
    CODEX_HOME: path.join(root, 'credentials-unavailable'),
  };
  const invoke = (args: string[], guarded = true) =>
    spawnSync(
      process.execPath,
      [...(guarded ? ['--import', guard] : []), entry, ...args],
      { env, encoding: 'utf8', timeout: 30000 },
    );
  const config = async (value: unknown, name = 'request') => {
    const filename = path.join(root, name + '.json');
    await writeFile(filename, JSON.stringify(value));
    return filename;
  };
  const ready = async () => {
    const binary = path.join(root, 'fake-cli');
    await writeFile(
      binary,
      `#!${process.execPath}\nthrow new Error('Never execute during dry-run.');\n`,
      { mode: 0o755 },
    );
    return config(
      {
        cli: {
          path: binary,
          version: 'codex-cli 0.157.0',
          binaryHash: hashContent(await readFile(binary)),
        },
        candidateModel: 'gpt-6-sol',
        startupHash: digest('synthetic-startup'),
        permissionsHash: digest('synthetic-permissions'),
        preflight: {
          status: 'ready',
          startupControlled: true,
          authProtected: true,
          processTreeControlled: true,
          isolation: 'controlled',
        },
      },
      'preflight',
    );
  };
  return { root, marker, guard, env, invoke, config, ready };
}
function nativeConfig(preflightPath: string) {
  return {
    schema: 1,
    profile: 'codex',
    provider: 'openai',
    model: 'gpt-6-sol',
    auth: 'subscription',
    sourceSha: 'a'.repeat(40),
    experimentId: 'diagnostic-control',
    preflightPath,
    repeats: 1,
    maxModelSessions: 16,
    limits: {
      launchMs: 45000,
      setupMs: 180000,
      taskMs: 120000,
      maxCostUsd: null,
    },
  };
}

test('import/help/default dry-run cannot spawn or reflect arbitrary options', async (t) => {
  const f = await fixture(t);
  assert.equal((await diagnosticMain([])).status, 'help');
  const imported = spawnSync(
    process.execPath,
    [
      '--import',
      f.guard,
      '--input-type=module',
      '-e',
      `await import(${JSON.stringify(new URL('../../scripts/evals/diagnostic.ts', import.meta.url).href)});`,
    ],
    { env: f.env, encoding: 'utf8' },
  );
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(imported.stdout, '');
  for (const args of [[], ['--help'], ['help']]) {
    const result = f.invoke(args);
    assert.equal(result.status, 0, result.stdout);
    assert.equal(JSON.parse(result.stdout).status, 'help');
  }
  const output = path.join(f.root, 'default');
  const result = f.invoke(['--output', output]);
  assert.equal(result.status, 0, result.stdout);
  const record = JSON.parse(
    await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
  );
  assert.equal(record.mode, 'dry-run');
  assert.equal(record.status, 'blocked');
  assert.equal(record.modelRequests, 0);
  for (const args of [
    ['--output'],
    [
      '--output',
      path.join(f.root, 'invalid'),
      '--api-key',
      'sk-synthetic-private-value-1234567890',
    ],
    ['--output', path.join(f.root, 'invalid'), '--mode', 'live'],
    [
      '--output',
      path.join(f.root, 'invalid'),
      '--mode',
      'offline',
      '--mode',
      'native',
    ],
  ]) {
    const invalid = f.invoke(args);
    assert.equal(invalid.status, 1);
    assert.equal(invalid.stderr, '');
    assert(!invalid.stdout.includes('private-value'));
  }
  await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
});

test('offline command runs only the built-in fake and records calibration with private permissions', async (t) => {
  const f = await fixture(t),
    output = path.join(f.root, 'offline');
  const result = f.invoke(['--mode', 'offline', '--output', output], false);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  assert.equal(result.stderr, '');
  assert.equal(JSON.parse(result.stdout).status, 'recorded');
  const diagnostic = JSON.parse(
    await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
  );
  assert.equal(diagnostic.modelRequests, 0);
  assert.equal(diagnostic.conditions.profile, 'fake');
  assert.equal(diagnostic.conditions.provider, 'none');
  assert.equal(diagnostic.conditions.model, 'none');
  assert.equal(diagnostic.conditions.auth, 'none');
  assert.equal(diagnostic.conditions.maxModelSessions, 0);
  const report = JSON.parse(
    await readFile(path.join(output, 'paired-report.json'), 'utf8'),
  );
  assert.equal(report.cohorts[0].mode, 'calibration');
  assert.equal(report.cohorts[0].pairs.length, 1);
  assert.equal(report.cohorts[0].scenarioId, 'offline-protocol');
  for (const variant of ['tibicen', 'baseline'])
    assert.equal(
      report.cohorts[0].variants[variant].observed.endToEndSuccess.numerator,
      process.platform === 'win32' ? 0 : 1,
    );
  assert.equal((await stat(output)).mode & 0o777, 0o700);
  assert.equal(
    (await stat(path.join(output, 'diagnostic.json'))).mode & 0o777,
    0o600,
  );
  assert.equal(
    (await stat(path.join(output, 'paired-report.json'))).mode & 0o777,
    0o600,
  );
});

test('complete dry-run checks saved synthetic preflight without executing the native CLI', async (t) => {
  const f = await fixture(t),
    request = nativeConfig(await f.ready()),
    output = path.join(f.root, 'planned');
  const config = await f.config(request);
  const result = f.invoke(['--output', output, '--config', config]);
  assert.equal(result.status, 0, result.stdout + result.stderr);
  const record = JSON.parse(
    await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
  );
  assert.equal(record.reason, 'native-process-containment-unavailable');
  assert.equal(record.modelRequests, 0);
  assert.equal(record.conditions.preflightPath, undefined);
  assert.deepEqual(record.conditions.limits, request.limits);
  await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
});

test('missing fields, unsupported routes and unready preflight persist blocked without fallback', async (t) => {
  const f = await fixture(t),
    request = nativeConfig(await f.ready());
  const blockedPreflight = await f.config(
    {
      preflight: {
        status: 'blocked',
        startupControlled: false,
        authProtected: false,
        processTreeControlled: false,
        isolation: 'controlled',
        reason: 'auth-unavailable',
      },
    },
    'blocked-preflight',
  );
  const cases: unknown[] = [
    null,
    {},
    { ...request, provider: 'other' },
    { ...request, profile: 'claude-code' },
    { ...request, auth: 'api' },
    { ...request, model: 'other-model' },
    { ...request, preflightPath: blockedPreflight },
    { ...request, maxModelSessions: 17 },
    { ...request, preflightPath: '/missing/private-preflight.json' },
    { ...request, limits: { ...request.limits, maxCostUsd: 1 } },
  ];
  for (const field of [
    'profile',
    'provider',
    'model',
    'auth',
    'maxModelSessions',
    'limits',
    'preflightPath',
  ]) {
    const missing: Record<string, unknown> = { ...request };
    delete missing[field];
    cases.push(missing);
  }
  for (const [index, value] of cases.entries()) {
    const output = path.join(f.root, 'blocked-' + index);
    const result = f.invoke([
      '--mode',
      'native',
      '--output',
      output,
      '--config',
      await f.config(value, 'case-' + index),
    ]);
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const record = JSON.parse(
      await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
    );
    assert.equal(record.status, 'blocked');
    assert.equal(record.modelRequests, 0);
    await assert.rejects(readFile(path.join(output, 'paired-report.json')), {
      code: 'ENOENT',
    });
  }
  await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
});

test('a report publication failure preserves existing bytes and records a command error with exit 1', async (t) => {
  const f = await fixture(t),
    output = path.join(f.root, 'publication-error');
  const retained = path.join(output, 'paired-report.json'),
    hook = path.join(f.root, 'collision.mjs');
  await writeFile(
    hook,
    `import child from 'node:child_process';
import {syncBuiltinESMExports} from 'node:module';
import {existsSync,writeFileSync} from 'node:fs';
const original=child.spawn;
child.spawn=(...args)=>{if(!existsSync(${JSON.stringify(retained)}))writeFileSync(${JSON.stringify(retained)},'Retained report.');return original(...args);};
syncBuiltinESMExports();\n`,
  );
  const result = spawnSync(
    process.execPath,
    ['--import', hook, entry, '--mode', 'offline', '--output', output],
    { env: f.env, encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(result.status, 1);
  assert.equal(result.stderr, '');
  assert.equal(JSON.parse(result.stdout).reason, 'diagnostic-run-failed');
  const diagnostic = JSON.parse(
    await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
  );
  assert.equal(diagnostic.status, 'error');
  assert.equal(diagnostic.modelRequests, 0);
  assert.equal(await readFile(retained, 'utf8'), 'Retained report.');
});

test('invalid configuration, synthetic secrets and driver errors never enter artifacts or CLI errors', async (t) => {
  const f = await fixture(t),
    request = nativeConfig(await f.ready());
  const secret = 'sk-synthetic-private-value-1234567890';
  for (const [index, value] of [
    { ...request, apiKey: secret },
    { ...request, experimentId: secret },
  ].entries()) {
    const output = path.join(f.root, 'secret-' + index);
    const result = f.invoke([
      '--mode',
      'native',
      '--output',
      output,
      '--config',
      await f.config(value, 'secret-' + index),
    ]);
    assert.equal(result.status, 0);
    assert(!result.stdout.includes(secret));
    const record = await readFile(path.join(output, 'diagnostic.json'), 'utf8');
    assert(!record.includes(secret));
    assert(!record.includes('apiKey'));
  }
  const output = path.join(f.root, 'fake-error');
  const result = f.invoke(['--mode', 'offline', '--output', output]);
  assert(!result.stdout.includes(secret));
  assert.equal(result.stderr, '');
  const record = await readFile(path.join(output, 'diagnostic.json'), 'utf8');
  assert(!record.includes(secret));
});

test('existing output and aliases reject before any driver is executed', async (t) => {
  const f = await fixture(t),
    output = path.join(f.root, 'retained');
  await mkdir(output);
  await writeFile(path.join(output, 'diagnostic.json'), 'Retained bytes.');
  const alias = path.join(f.root, 'alias');
  await symlink(output, alias);
  for (const target of [output, alias]) {
    const result = f.invoke(['--mode', 'offline', '--output', target]);
    assert.equal(result.status, 1);
    assert.equal(result.stderr, '');
  }
  assert.equal(
    await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
    'Retained bytes.',
  );
  await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
});

test('concurrent commands reserve a single new output before running the fake', async (t) => {
  const f = await fixture(t),
    output = path.join(f.root, 'race');
  const invoke = () =>
    new Promise<{ code: number | null; stdout: string }>((resolve) => {
      const child = spawn(
        process.execPath,
        [entry, '--mode', 'offline', '--output', output],
        { env: f.env, stdio: ['ignore', 'pipe', 'pipe'] },
      );
      let stdout = '';
      child.stdout.on('data', (value) => (stdout += String(value)));
      child.on('close', (code) => resolve({ code, stdout }));
    });
  const results = await Promise.all([invoke(), invoke()]);
  assert.deepEqual(results.map((result) => result.code).sort(), [0, 1]);
  assert.deepEqual(
    results.map((result) => JSON.parse(result.stdout).status).sort(),
    ['error', 'recorded'],
  );
  assert.equal(
    JSON.parse(await readFile(path.join(output, 'paired-report.json'), 'utf8'))
      .cohorts.length,
    1,
  );
});

test(
  'production native mode rejects cached fixture readiness before any CLI launch',
  { skip: process.platform === 'win32' },
  async (t) => {
    const f = await fixture(t),
      control = await nativeCheckout();
    t.after(() => rm(control.root, { recursive: true, force: true }));
    const config = await f.config(nativeConfig(control.preflightPath)),
      output = path.join(f.root, 'native');
    const result = spawnSync(
      process.execPath,
      [
        path.join(control.root, 'scripts/evals/diagnostic.ts'),
        '--mode',
        'native',
        '--output',
        output,
        '--config',
        config,
      ],
      { env: f.env, encoding: 'utf8', timeout: 60000 },
    );
    assert.equal(result.status, 0, result.stdout + result.stderr);
    const lines = result.stdout
      .trim()
      .split('\n')
      .map((line) => JSON.parse(line));
    assert.equal(lines.at(-1).status, 'blocked');
    assert.equal(lines.filter((line) => line.attempt).length, 0);
    const diagnostic = JSON.parse(
      await readFile(path.join(output, 'diagnostic.json'), 'utf8'),
    );
    assert.equal(diagnostic.reason, 'native-process-containment-unavailable');
    assert.equal(diagnostic.modelRequests, 0);
    await assert.rejects(readFile(path.join(output, 'native/frozen.json')), {
      code: 'ENOENT',
    });
    await assert.rejects(readFile(f.marker), { code: 'ENOENT' });
  },
);
