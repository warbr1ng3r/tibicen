import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { generateContainerCodexHome } from '../../scripts/evals/container/codex-config.ts';

async function fixture(t: test.TestContext) {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-container-config-')),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const workspace = path.join(root, 'workspace');
  await mkdir(workspace);
  return {
    home: path.join(root, 'home'),
    workspace,
    launcher: process.execPath,
    launcherArgs: [
      path.join(root, 'bridge.mjs'),
      path.join(root, 'manifest.json'),
    ],
  };
}

test('generated Codex home selects only stdio and preserves the mirrored cwd', async (t) => {
  const input = await fixture(t);
  const generated = await generateContainerCodexHome(input);
  await generated.validate();
  const environments = await readFile(generated.environmentsPath, 'utf8');
  assert.match(environments, /default="eval-linux"\ninclude_local=false/);
  assert(environments.includes('program=' + JSON.stringify(process.execPath)));
  assert(environments.includes('args=' + JSON.stringify(input.launcherArgs)));
  assert(environments.includes('cwd=' + JSON.stringify(input.workspace)));
  const config = await readFile(generated.configPath, 'utf8');
  for (const feature of [
    'apps',
    'plugins',
    'hooks',
    'shell_snapshot',
    'shell_snapshot_v2',
    'multi_agent',
    'browser_use',
    'computer_use',
    'code_mode_host',
    'remote_models',
    'api_key_model_discovery',
  ])
    assert(config.includes('features.' + feature + '=false'));
  assert.match(config, /shell_environment_policy.inherit="none"/);
  assert.match(config, /web_search="disabled"/);
  assert.match(config, /mcp_servers=\{\}/);
  assert(
    config.includes(
      'projects={' +
        JSON.stringify(input.workspace) +
        ' = {"trust_level" = "untrusted"}}',
    ),
  );
  assert.match(config, /analytics.enabled=false/);
  assert.match(config, /otel.trace_exporter="none"/);
  assert.match(config, /"requires_openai_auth" = false/);
  assert.match(config, /"filesystem" = \{":root" = "write"\}/);
  assert.match(config, /"network" = \{"enabled" = false\}/);
  assert(!config.includes('danger-full-access'));
  assert.equal(generated.env.CODEX_EXEC_SERVER_URL, 'none');
  assert.equal(generated.env.HOME, input.home);
  assert.equal(generated.env.CODEX_HOME, path.join(input.home, '.codex'));
  assert(!generated.argv.includes('--ignore-user-config'));
  assert.equal(
    generated.argv[generated.argv.indexOf('--cd') + 1],
    input.workspace,
  );
  assert.equal((await lstat(generated.configPath)).mode & 0o777, 0o600);
  assert.equal((await lstat(generated.codexHome)).mode & 0o777, 0o700);
});

test('missing, malformed, linked or unexpected Codex config fails before launch', async (t) => {
  for (const damage of ['missing', 'malformed', 'linked', 'extra'] as const) {
    const input = await fixture(t);
    const generated = await generateContainerCodexHome(input);
    if (damage === 'missing') await rm(generated.environmentsPath);
    if (damage === 'malformed')
      await writeFile(generated.environmentsPath, 'include_local=true\n[');
    if (damage === 'linked') {
      const target = path.join(input.home, 'target');
      await writeFile(target, await readFile(generated.configPath));
      await rm(generated.configPath);
      await symlink(target, generated.configPath);
    }
    if (damage === 'extra')
      await writeFile(path.join(generated.codexHome, 'auth.json'), '{}');
    await assert.rejects(generated.validate());
  }
});

test('config accepts only a synthetic literal loopback Responses transport', async (t) => {
  for (const baseUrl of [
    'https://example.invalid/v1',
    'http://localhost:7777/v1',
    'http://2130706433:7777/v1',
    'http://127.0.0.1:65536/v1',
    'http://127.0.0.1:7777/v1?token=bad',
    'http://user@127.0.0.1:7777/v1',
    'http://127.0.0.1:7777/other',
  ]) {
    const input = await fixture(t);
    await assert.rejects(
      generateContainerCodexHome({
        ...input,
        modelProvider: { baseUrl, model: 'offline-test' },
      }),
      { code: 'invalid-container-codex-config' },
    );
    await assert.rejects(lstat(input.home), { code: 'ENOENT' });
  }
  const generated = await generateContainerCodexHome({
    ...(await fixture(t)),
    modelProvider: {
      baseUrl: 'http://127.0.0.1:7777/v1',
      model: 'offline-test',
    },
  });
  assert.match(await readFile(generated.configPath, 'utf8'), /offline-test/);
  await generated.validate();
});

test('config refuses existing homes, workspace links and nested host configuration', async (t) => {
  const existing = await fixture(t);
  await mkdir(existing.home);
  await writeFile(path.join(existing.home, 'keep'), 'unchanged');
  await assert.rejects(generateContainerCodexHome(existing), {
    code: 'invalid-container-codex-config',
  });
  assert.equal(
    await readFile(path.join(existing.home, 'keep'), 'utf8'),
    'unchanged',
  );
  const linked = await fixture(t);
  const link = linked.workspace + '-link';
  await symlink(linked.workspace, link);
  await assert.rejects(
    generateContainerCodexHome({ ...linked, workspace: link }),
    { code: 'invalid-container-codex-config' },
  );
  const nested = await fixture(t);
  await assert.rejects(
    generateContainerCodexHome({
      ...nested,
      home: path.join(nested.workspace, 'home'),
    }),
    { code: 'invalid-container-codex-config' },
  );
});

test('Code Mode preserves official tool mode and requires the external companion without fallback', async (t) => {
  const generated = await generateContainerCodexHome({
    ...(await fixture(t)),
    modelProvider: {
      baseUrl: 'http://127.0.0.1:7777/v1',
      model: 'gpt-6-astra',
    },
  });
  await generated.validate();
  const config = await readFile(generated.configPath, 'utf8');
  assert(
    config.includes(
      'features.code_mode_host={"enabled" = true, "disable_in_process_fallback" = true}',
    ),
  );
  assert(!config.includes('features.code_mode_host=false'));
  assert(config.includes('model_reasoning_effort="low"'));
  const metadata = JSON.parse(
    await readFile(path.join(generated.codexHome, 'models.json'), 'utf8'),
  );
  assert.equal(metadata.models.length, 1);
  assert.equal(metadata.models[0].slug, 'gpt-6-astra');
  assert.equal(metadata.models[0].tool_mode, 'code_mode_only');
});

test('proposal schema stays in the frozen host home and drift is rejected', async (t) => {
  const outputSchema = JSON.stringify({
    type: 'object',
    properties: { status: { type: 'string' } },
    required: ['status'],
    additionalProperties: false,
  });
  const generated = await generateContainerCodexHome({
    ...(await fixture(t)),
    outputSchema,
  });
  const schemaPath =
    generated.argv[generated.argv.indexOf('--output-schema') + 1];
  assert.equal(
    schemaPath,
    path.join(generated.codexHome, 'proposal.schema.json'),
  );
  assert.equal(await readFile(schemaPath, 'utf8'), outputSchema);
  assert.equal((await lstat(schemaPath)).mode & 0o777, 0o600);
  await generated.validate();
  await writeFile(schemaPath, '{}');
  await assert.rejects(generated.validate(), {
    code: 'invalid-container-codex-config',
  });
});

test('unbounded or non-object schema fails before creating a generated home', async (t) => {
  for (const outputSchema of [
    '',
    '[',
    'null',
    '[]',
    'false',
    '0',
    '{"x":"' + 'x'.repeat(65536) + '"}',
  ]) {
    const input = await fixture(t);
    await assert.rejects(
      generateContainerCodexHome({ ...input, outputSchema }),
      {
        code: 'invalid-container-codex-schema',
      },
    );
    await assert.rejects(lstat(input.home), { code: 'ENOENT' });
  }
});
