import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  stat,
  rm,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { main } from '../../scripts/tibicen.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import type { diagnoseMcp } from '../../scripts/mcp/diagnosis.ts';

type Diagnosis = ReturnType<typeof diagnoseMcp>;

test('diagnosis guides an exact approved repair while preserving unrelated settings and project code', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, '.cursor'));
  const config =
    '{\n "setting": [ 1, 2 ],\n "mcpServers": {\n  "keep": {"command":"untouched", "args": ["keep"]},\n  "docs": {"command":"node","args":["server.js"],"env":{"SERVICE_KEY":"${SERVICE_KEY}"}}\n }\n}\n';
  await writeFile(path.join(root, '.cursor/mcp.json'), config);
  const app = 'throw new Error("Never execute this fixture server");\n';
  await writeFile(path.join(root, 'server.js'), app);
  const request = {
    agent: 'cursor',
    server: 'docs',
    sources: [{ path: '.cursor/mcp.json' }],
    effectiveSource: '.cursor/mcp.json',
    launch: {
      targetContextKnown: true,
      availableEnvNames: ['SERVICE_KEY'],
      executableAvailable: true,
      cwdAvailable: true,
    },
  };
  const before = await diagnose(root, request);
  assert.equal(before.configuration.reason, 'invalid-env-reference');
  assert.equal(before.repair.status, 'supported-project-writer');
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      mcp: [
        {
          agent: 'cursor',
          trusted: true,
          operations: [
            {
              name: 'docs',
              action: 'upsert',
              server: {
                command: 'node',
                args: ['server.js'],
                envNames: ['SERVICE_KEY'],
              },
            },
          ],
        },
      ],
    },
    { home },
  );
  assert.deepEqual(
    plan.proposal.changes.map((change) => change.path),
    ['.cursor/mcp.json'],
  );
  assert.deepEqual(plan.proposal.commands, []);
  const hooks = runtimeHooks(root, plan.proposal, plan.digest);
  try {
    await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      beforeApply: hooks.beforeApply,
      verify: hooks.verify,
    });
  } finally {
    await hooks.cleanup();
  }
  const after = await diagnose(root, request);
  assert.equal(after.configuration.status, 'valid-stdio');
  assert.equal(after.launch.environment, 'available');
  assert.equal(after.connection, 'unverified');
  assert.equal(after.repair.status, 'no-repair-indicated');
  const changed = await readFile(path.join(root, '.cursor/mcp.json'), 'utf8');
  assert.ok(changed.includes('"setting": [ 1, 2 ]'));
  assert.ok(
    changed.includes('"keep": {"command":"untouched", "args": ["keep"]}'),
  );
  assert.equal(await readFile(path.join(root, 'server.js'), 'utf8'), app);
});

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-mcp-cli-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  return { base, root, home };
}

async function diagnose(root: string, request: unknown): Promise<Diagnosis> {
  const input = path.join(path.dirname(root), 'request.json');
  await writeFile(input, JSON.stringify(request));
  return (await main([
    'mcp-diagnose',
    '--root',
    root,
    '--input',
    input,
  ])) as Diagnosis;
}

test('MCP stdin diagnosis reads settings without exposing secrets, running servers or writing state', async (t) => {
  const { root } = await fixture(t);
  const raw = JSON.stringify({
    mcpServers: {
      example: {
        command: 'command-secret-sentinel',
        args: ['argument-secret-sentinel'],
        env: { API_KEY: 'credential-secret-sentinel' },
      },
    },
  });
  await writeFile(path.join(root, '.mcp.json'), raw);
  await writeFile(
    path.join(root, 'server.js'),
    'throw new Error("Never execute");\n',
  );
  const before = await readdir(root, { recursive: true });
  const processResult = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('../../scripts/tibicen.ts', import.meta.url)),
      'mcp-diagnose',
      '--root',
      root,
      '--input',
      '-',
    ],
    {
      input: JSON.stringify({
        agent: 'claude-code',
        server: 'example',
        sources: [{ path: '.mcp.json' }],
        effectiveSource: '.mcp.json',
      }),
      encoding: 'utf8',
      timeout: 10000,
    },
  );
  assert.equal(processResult.status, 0, processResult.stderr);
  const result = JSON.parse(processResult.stdout) as Diagnosis;
  assert.equal(result.connection, 'unverified');
  assert.equal(result.configuration.status, 'manual-action-required');
  assert.ok(
    !/command-secret-sentinel|argument-secret-sentinel|credential-secret-sentinel/.test(
      processResult.stdout + processResult.stderr,
    ),
  );
  assert.deepEqual(await readdir(root, { recursive: true }), before);
  assert.equal(await readFile(path.join(root, '.mcp.json'), 'utf8'), raw);
});

test('MCP metadata is validated before malformed project state can be inspected', async (t) => {
  const { root } = await fixture(t);
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, '.tibicen/manifest.yml'), '{ malformed');
  for (const sources of [
    [{ path: '.mcp.json', text: 'not-accepted' }],
    [{ path: '../private.json' }],
    ...[
      '.npmrc',
      '.netrc',
      '.pypirc',
      '.git-credentials',
      'credentials.json',
      'nested/team-credentials-backup.json',
    ].map((path) => [{ path }]),
  ]) {
    await assert.rejects(
      diagnose(root, { agent: 'cursor', server: 'example', sources }),
      { code: 'invalid-mcp-diagnosis' },
    );
  }
  for (const extra of [
    { command: 'not-metadata' },
    { values: { SERVICE_KEY: 'not-metadata' } },
    { state: 'disabled', envNames: ['SERVICE_KEY'] },
  ]) {
    await assert.rejects(
      diagnose(root, {
        agent: 'custom-team-host',
        format: 'stdio-observation',
        server: 'example',
        sources: [
          {
            path: 'custom.py',
            observation: {
              sourceHash: 'a'.repeat(64),
              state: 'stdio',
              envNames: [],
              ...extra,
            },
          },
        ],
      }),
      { code: 'invalid-mcp-diagnosis' },
    );
  }
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
    'manifest.yml',
  ]);
});

test('MCP missing, oversized and non-regular sources stay unavailable; sensitive input is rejected', async (t) => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'large.json'), ' '.repeat(1024 * 1024 + 1));
  await writeFile(path.join(root, '.env'), 'SECRET=do-not-expose');
  await mkdir(path.join(root, 'directory.json'));
  const result = await diagnose(root, {
    agent: 'cursor',
    server: 'example',
    sources: ['missing.json', 'large.json', 'directory.json'].map((path) => ({
      path,
    })),
  });
  assert.equal(result.connection, 'unverified');
  assert.equal(result.source.candidates.length, 3);
  for (const source of result.source.candidates) {
    assert.notEqual(source.status, 'not-found');
    assert.ok(source.reason);
  }
  assert.ok(!JSON.stringify(result).includes('do-not-expose'));
  await assert.rejects(
    diagnose(root, {
      agent: 'cursor',
      server: 'example',
      sources: [{ path: '.env' }],
    }),
    { code: 'invalid-mcp-diagnosis' },
  );
  assert.deepEqual((await readdir(root)).sort(), [
    '.env',
    'directory.json',
    'large.json',
  ]);
});

test('MCP inspection does not follow a selected config symlink', async (t) => {
  const { base, root } = await fixture(t);
  const outside = path.join(base, 'external.json');
  await writeFile(
    outside,
    JSON.stringify({ mcpServers: { example: { command: 'node' } } }),
  );
  await symlink(outside, path.join(root, '.mcp.json'));
  const result = await diagnose(root, {
    agent: 'claude-code',
    server: 'example',
    sources: [{ path: '.mcp.json' }],
    effectiveSource: '.mcp.json',
  });
  assert.notEqual(result.configuration.status, 'valid-stdio');
  assert.ok(result.source.candidates[0].reason);
  assert.deepEqual(await readdir(root), ['.mcp.json']);
});

test('MCP diagnosis preserves unfinished-plan exclusions and state', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, 'private'));
  await writeFile(
    path.join(root, 'private/config.json'),
    JSON.stringify({ mcpServers: { example: { command: 'node' } } }),
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      forbiddenPaths: ['private'],
      changes: [{ path: 'AGENTS.md', content: '# Rules\n', reason: 'Fixture' }],
    },
    { home },
  );
  await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Fixture interruption');
    },
  });
  const state = path.join(root, '.tibicen/state/session.json');
  const before = await readFile(state, 'utf8');
  const result = await diagnose(root, {
    agent: 'claude-code',
    server: 'example',
    sources: [{ path: 'private/config.json' }],
    effectiveSource: 'private/config.json',
  });
  assert.notEqual(result.configuration.status, 'valid-stdio');
  assert.ok(result.source.candidates[0].reason);
  assert.equal(await readFile(state, 'utf8'), before);
});

test('MCP source choice does not merge records or turn local shell observations into target evidence', async (t) => {
  const { root } = await fixture(t);
  await writeFile(
    path.join(root, 'lower.json'),
    JSON.stringify({
      mcp: {
        servers: {
          example: {
            type: 'local',
            command: ['node'],
            environment: { KEY: '{env:KEY}' },
          },
        },
      },
    }),
  );
  await writeFile(
    path.join(root, 'higher.json'),
    JSON.stringify({
      mcp: { servers: { example: { type: 'local', command: ['node'] } } },
    }),
  );
  const result = await diagnose(root, {
    agent: 'opencode',
    format: 'opencode-v2',
    server: 'example',
    sources: [{ path: 'lower.json' }, { path: 'higher.json' }],
    effectiveSource: 'higher.json',
    launch: {
      targetContextKnown: false,
      availableEnvNames: ['KEY'],
      executableAvailable: true,
      cwdAvailable: true,
    },
  });
  assert.equal(result.source.path, 'higher.json');
  assert.deepEqual(result.configuration.envNames, []);
  assert.equal(result.launch.executable, 'unverified');
  assert.equal(result.launch.cwd, 'unverified');
  assert.equal(result.connection, 'unverified');
});

test('explicit MCP formats work for unknown hosts without expanding writer authority', async (t) => {
  const { root } = await fixture(t);
  await mkdir(path.join(root, '.cursor'));
  const source = '.cursor/mcp.json';
  const cursor = JSON.stringify({
    mcpServers: {
      example: { command: 'node', env: { KEY: '${env:SERVICE_KEY}' } },
    },
  });
  await writeFile(path.join(root, source), cursor);
  const unknown = await diagnose(root, {
    agent: 'custom-team-host',
    format: 'cursor-json',
    server: 'example',
    sources: [{ path: source }],
    effectiveSource: source,
  });
  assert.equal(unknown.agent, 'custom-team-host');
  assert.equal(unknown.configuration.status, 'valid-stdio');
  assert.equal(unknown.configuration.basis, 'parsed-format');
  assert.deepEqual(unknown.configuration.envNames, ['SERVICE_KEY']);
  assert.equal(unknown.formatEvidence, 'caller-supplied');
  assert.equal(unknown.nativeActivation, 'unverified');

  const mismatched = await diagnose(root, {
    agent: 'cursor',
    format: 'claude-code-json',
    server: 'example',
    sources: [{ path: source }],
    effectiveSource: source,
  });
  assert.equal(mismatched.configuration.reason, 'invalid-env-reference');
  assert.equal(mismatched.repair.status, 'manual-native-action');
  assert.equal(mismatched.repair.path, undefined);

  const wrongReference = cursor.replace('${env:SERVICE_KEY}', '${SERVICE_KEY}');
  await writeFile(path.join(root, source), wrongReference);
  const unknownRepair = await diagnose(root, {
    agent: 'custom-team-host',
    format: 'cursor-json',
    server: 'example',
    sources: [{ path: source }],
    effectiveSource: source,
  });
  assert.equal(unknownRepair.configuration.reason, 'invalid-env-reference');
  assert.equal(unknownRepair.repair.status, 'manual-native-action');
  assert.equal(unknownRepair.repair.path, undefined);
  assert.equal(await readFile(path.join(root, source), 'utf8'), wrongReference);
});

test('host names and config paths cannot imply an unsupported MCP format', async (t) => {
  const { root } = await fixture(t);
  await mkdir(path.join(root, '.agents'));
  const source = '.agents/mcp.json';
  const raw = JSON.stringify({
    mcpServers: { example: { command: 'node' } },
  });
  await writeFile(path.join(root, source), raw);
  for (const selection of [
    { agent: 'custom-team-host' },
    { agent: 'custom-team-host', format: 'proprietary-json' },
    { agent: 'zcode' },
    { agent: 'kimi-code' },
    { agent: 'mistral-vibe' },
  ]) {
    const result = await diagnose(root, {
      ...selection,
      server: 'example',
      sources: [{ path: source }],
      effectiveSource: source,
    });
    assert.equal(result.configuration.status, 'manual-action-required');
    assert.equal(result.nativeActivation, 'unverified');
    assert.equal(result.connection, 'unverified');
    assert.equal(result.launch.executable, 'unverified');
    assert.equal(result.repair.status, 'manual-native-action');
    assert.equal(result.repair.path, undefined);
  }
  assert.equal(await readFile(path.join(root, source), 'utf8'), raw);
});

function diagnoseFromStdin(root: string, request: unknown) {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('../../scripts/tibicen.ts', import.meta.url)),
      'mcp-diagnose',
      '--root',
      root,
      '--input',
      '-',
    ],
    { input: JSON.stringify(request), encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(result.status, 0, result.stderr);
  return {
    diagnosis: JSON.parse(result.stdout) as Diagnosis,
    output: result.stdout + result.stderr,
  };
}

async function snapshot(root: string, files: string[]) {
  return {
    tree: (await readdir(root, { recursive: true })).sort(),
    files: await Promise.all(
      files.map(async (file) => ({
        file,
        content: await readFile(path.join(root, file)),
        mode: (await stat(path.join(root, file))).mode,
      })),
    ),
  };
}

test('new native MCP contracts stay read-only and private through the real CLI', async (t) => {
  const { root } = await fixture(t);
  const server = path.join(root, 'never-run-server.mjs');
  await writeFile(
    server,
    'import { writeFileSync } from "node:fs";\nwriteFileSync(new URL("./SERVER_WAS_RUN", import.meta.url), "unexpected execution");\nthrow new Error("Never launch this fixture");\n',
  );
  const record = (withSecret: boolean) => ({
    command: process.execPath,
    args: [server, 'argument-private-sentinel'],
    ...(withSecret ? { env: { API_KEY: 'credential-private-sentinel' } } : {}),
  });
  const fixtures = [
    {
      agent: 'zcode',
      format: 'zcode-native-json',
      source: '.zcode/config.json',
      content: (secret: boolean) =>
        JSON.stringify({ mcp: { servers: { example: record(secret) } } }),
    },
    {
      agent: 'zcode',
      format: 'zcode-shared-json',
      source: '.agents/mcp.json',
      content: (secret: boolean) =>
        JSON.stringify({ mcpServers: { example: record(secret) } }),
    },
    {
      agent: 'kimi-code',
      format: 'kimi-code-json',
      source: '.kimi-code/mcp.json',
      content: (secret: boolean) =>
        JSON.stringify({
          mcpServers: {
            example: { ...record(secret), environment_id: 'local' },
          },
        }),
    },
    {
      agent: 'mistral-vibe',
      format: 'mistral-vibe-toml',
      source: '.vibe/config.toml',
      content: (secret: boolean) =>
        `[[mcp_servers]]\nname = "example"\ntransport = "stdio"\ncommand = ${JSON.stringify(process.execPath)}\nargs = [${JSON.stringify(server)}, "argument-private-sentinel"]\n${secret ? 'env = { API_KEY = "credential-private-sentinel" }\n' : ''}`,
    },
  ];
  const files = [
    'never-run-server.mjs',
    ...fixtures.map((item) => item.source),
  ];
  for (const secret of [false, true]) {
    for (const item of fixtures) {
      await mkdir(path.dirname(path.join(root, item.source)), {
        recursive: true,
      });
      await writeFile(path.join(root, item.source), item.content(secret));
    }
    const before = await snapshot(root, files);
    for (const item of fixtures) {
      const { diagnosis, output } = diagnoseFromStdin(root, {
        agent: item.agent,
        format: item.format,
        server: 'example',
        sources: [{ path: item.source }],
        effectiveSource: item.source,
      });
      assert.equal(diagnosis.format, item.format);
      assert.equal(diagnosis.formatEvidence, 'caller-supplied');
      assert.equal(diagnosis.configuration.basis, 'parsed-format');
      assert.equal(
        diagnosis.configuration.status,
        secret ? 'manual-action-required' : 'valid-stdio',
      );
      if (secret)
        assert.equal(
          diagnosis.configuration.reason,
          'inline-environment-values',
        );
      assert.equal(diagnosis.nativeActivation, 'unverified');
      assert.equal(diagnosis.connection, 'unverified');
      assert.notEqual(diagnosis.repair.status, 'supported-project-writer');
      assert.ok(!output.includes(process.execPath));
      assert.ok(!output.includes(server));
      assert.ok(
        !/argument-private-sentinel|credential-private-sentinel/.test(output),
      );
    }
    assert.deepEqual(await snapshot(root, files), before);
  }
});

test('unknown code-defined MCP uses hash-bound observations without interpreting its source', async (t) => {
  const { root } = await fixture(t);
  const source = 'custom_mcp.py';
  const raw =
    '# Пользовательская конфигурация\nfrom pathlib import Path\nPath("SERVER_WAS_RUN").write_text("never evaluate")\nAPI_KEY = "credential-observation-sentinel"\n';
  await writeFile(path.join(root, source), raw);
  const request = {
    agent: 'custom-team-host',
    format: 'stdio-observation',
    server: 'example',
    sources: [
      {
        path: source,
        observation: {
          sourceHash: createHash('sha256').update(raw).digest('hex'),
          state: 'stdio',
          envNames: ['SERVICE_KEY'],
        },
      },
    ],
    effectiveSource: source,
    launch: {
      targetContextKnown: true,
      availableEnvNames: [],
      executableAvailable: true,
      cwdAvailable: true,
    },
  };
  const before = await snapshot(root, [source]);
  const { diagnosis, output } = diagnoseFromStdin(root, request);
  assert.equal(diagnosis.configuration.status, 'reported-stdio');
  assert.equal(diagnosis.configuration.basis, 'caller-observation');
  assert.equal(diagnosis.formatEvidence, 'caller-supplied');
  assert.equal(diagnosis.launch.environment, 'missing');
  assert.deepEqual(diagnosis.launch.missingEnvNames, ['SERVICE_KEY']);
  assert.equal(diagnosis.nativeActivation, 'unverified');
  assert.equal(diagnosis.connection, 'unverified');
  assert.equal(diagnosis.repair.status, 'manual-native-action');
  assert.equal(diagnosis.repair.path, undefined);
  assert.ok(
    !/credential-observation-sentinel|Path\(|never evaluate/.test(output),
  );
  assert.deepEqual(await snapshot(root, [source]), before);

  await writeFile(
    path.join(root, source),
    `${raw}\n# Changed after observation\n`,
  );
  const changed = await snapshot(root, [source]);
  const stale = diagnoseFromStdin(root, request).diagnosis;
  assert.equal(stale.configuration.status, 'unverified');
  assert.equal(stale.configuration.basis, 'unverified');
  assert.deepEqual(stale.configuration.envNames, []);
  assert.equal(stale.launch.environment, 'unverified');
  assert.equal(stale.repair.status, 'manual-native-action');
  assert.deepEqual(await snapshot(root, [source]), changed);

  await rm(path.join(root, source));
  const missing = diagnoseFromStdin(root, request).diagnosis;
  assert.equal(missing.configuration.status, 'unverified');
  assert.equal(missing.configuration.basis, 'unverified');
  assert.deepEqual(missing.configuration.envNames, []);
  assert.deepEqual(await readdir(root), []);
});
