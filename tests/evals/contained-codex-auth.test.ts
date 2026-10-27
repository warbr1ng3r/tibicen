import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  realpath,
  rm,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  accessOnlySubscriptionAuth,
  readAccessOnlySubscriptionAuth,
} from '../../scripts/evals/container/subscription.ts';
import { generateContainerCodexHome } from '../../scripts/evals/container/codex-config.ts';
import { runContainedCodexSession } from '../../scripts/evals/native-runner.ts';
import { containedCodexFailure } from '../../scripts/evals/contained-codex.ts';
import { parseCodex } from '../../scripts/evals/profiles/codex/profile.ts';

function credential(exp = 2000000000) {
  return {
    auth_mode: 'chatgpt',
    OPENAI_API_KEY: null,
    tokens: {
      id_token:
        'synthetic.' +
        Buffer.from(
          JSON.stringify({
            'https://api.openai.com/auth': { chatgpt_plan_type: 'plus' },
          }),
        ).toString('base64url') +
        '.signature',
      access_token:
        'synthetic.' +
        Buffer.from(JSON.stringify({ exp })).toString('base64url') +
        '.signature',
      refresh_token: 'REFRESH-MUST-NOT-LEAVE-SOURCE',
      account_id: 'synthetic-account',
    },
    last_refresh: '2026-10-26T00:00:00Z',
  };
}

test('subscription projection removes refresh authority and rejects API and expiring inputs', () => {
  const source = Buffer.from(JSON.stringify(credential()));
  const projected = accessOnlySubscriptionAuth(source, 90000, 1800000000000);
  const parsed = JSON.parse(projected.toString());
  assert.equal(parsed.auth_mode, 'chatgptAuthTokens');
  assert.equal(parsed.tokens.refresh_token, '');
  assert(!projected.includes('REFRESH-MUST-NOT-LEAVE-SOURCE'));
  assert(source.includes('REFRESH-MUST-NOT-LEAVE-SOURCE'));
  for (const value of [
    { ...credential(), auth_mode: 'apikey' },
    { ...credential(), OPENAI_API_KEY: 'synthetic-api-key' },
    credential(1800000100),
    {
      ...credential(),
      tokens: { ...credential().tokens, access_token: 'invalid' },
    },
  ])
    assert.throws(
      () =>
        accessOnlySubscriptionAuth(
          Buffer.from(JSON.stringify(value)),
          90000,
          1800000000000,
        ),
      { code: 'invalid-contained-subscription-auth' },
    );
});

test('access-only file and generated subscription config keep source login unchanged', async (t) => {
  const root = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-subscription-')),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const source = Buffer.from(JSON.stringify(credential()));
  const filename = path.join(root, 'source-auth.json');
  await writeFile(filename, source);
  const auth = await readAccessOnlySubscriptionAuth(filename, 90000);
  const workspace = path.join(root, 'workspace');
  await mkdir(workspace);
  const config = await generateContainerCodexHome({
    home: path.join(root, 'host-home'),
    workspace,
    launcher: process.execPath,
    launcherArgs: ['bridge.mjs', 'manifest.json'],
    subscription: { auth, model: 'gpt-6-astra' },
  });
  await config.validate();
  const text = await readFile(config.configPath, 'utf8');
  assert.match(text, /model_provider="tibicen_subscription"/);
  assert.match(text, /forced_login_method="chatgpt"/);
  assert.match(text, /"name" = "OpenAI"/);
  assert.match(
    text,
    /"base_url" = "https:\/\/chatgpt.com\/backend-api\/codex"/,
  );
  assert.match(text, /"request_max_retries" = 0/);
  assert.match(text, /"stream_max_retries" = 0/);
  assert.match(text, /"supports_websockets" = false/);
  assert.match(text, /cli_auth_credentials_store="file"/);
  assert(!Object.keys(config.env).some((key) => /API|TOKEN|PROXY/.test(key)));
  assert((await readFile(filename)).equals(source));
  await writeFile(path.join(config.codexHome, 'runtime-log'), 'runtime');
  await assert.rejects(config.validate());
  await config.validate(true);
  await writeFile(path.join(config.codexHome, 'auth.json'), source);
  await assert.rejects(config.validate(true));
  assert((await readFile(filename)).equals(source));
});

test('subscription refuses workspace/FedRAMP routing and rechecks lifetime after setup', () => {
  const make = (claims: object) => ({
    ...credential(),
    tokens: {
      ...credential().tokens,
      id_token:
        'synthetic.' +
        Buffer.from(
          JSON.stringify({ 'https://api.openai.com/auth': claims }),
        ).toString('base64url') +
        '.signature',
    },
  });
  for (const claims of [
    { chatgpt_plan_type: 'business' },
    { chatgpt_plan_type: 'team' },
    { chatgpt_plan_type: 'future-plan' },
    { chatgpt_plan_type: 'plus', chatgpt_account_is_fedramp: true },
    {},
  ])
    assert.throws(
      () =>
        accessOnlySubscriptionAuth(
          Buffer.from(JSON.stringify(make(claims))),
          90000,
          1800000000000,
        ),
      { code: 'invalid-contained-subscription-auth' },
    );
  const nearExpiry = Buffer.from(JSON.stringify(credential(1800000160)));
  const projected = accessOnlySubscriptionAuth(
    nearExpiry,
    90000,
    1800000000000,
  );
  assert.throws(
    () => accessOnlySubscriptionAuth(projected, 90000, 1800000020000),
    { code: 'invalid-contained-subscription-auth' },
  );
});

test('native caller refuses unsupported seed before credential access or Docker', async () => {
  await assert.rejects(
    runContainedCodexSession({
      binary: '/missing-binary',
      binaryHash: '0'.repeat(64),
      imageId: 'sha256:' + '0'.repeat(64),
      workspace: '/tmp/closed-workspace',
      files: { '.codex/config.toml': Buffer.from('unsafe') },
      resultPaths: ['out.txt'],
      deadlineMs: 1000,
      model: 'gpt-6-astra',
      home: '/tmp/closed-home',
      prompt: 'synthetic',
      route: { kind: 'subscription', authPath: '/never-read-this-auth' },
      expectedFreezeHash: 'not-ready',
    }),
    /unsupported-container-project-config/,
  );
});

test('parent cancellation prevents credential reads and metadata launch', async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    readAccessOnlySubscriptionAuth(
      '/never-read-this-auth',
      90000,
      controller.signal,
    ),
    { name: 'AbortError' },
  );
  await assert.rejects(
    runContainedCodexSession({
      binary: '/missing-binary',
      binaryHash: '0'.repeat(64),
      imageId: 'sha256:' + '0'.repeat(64),
      workspace: '/tmp/closed-workspace',
      files: { 'seed.txt': Buffer.from('seed') },
      resultPaths: ['seed.txt'],
      deadlineMs: 1000,
      model: 'gpt-6-astra',
      home: '/tmp/closed-home',
      prompt: 'synthetic',
      route: { kind: 'subscription', authPath: '/never-read-this-auth' },
      signal: controller.signal,
    }),
    { code: 'contained-codex-cancelled' },
  );
});

test('a failed native patch remains a failure despite a later completed turn', () => {
  const output = parseCodex(
    [
      { type: 'turn.started' },
      {
        type: 'item.completed',
        item: { type: 'file_change', status: 'failed', changes: [] },
      },
      { type: 'turn.completed', usage: { input_tokens: 0, output_tokens: 0 } },
    ]
      .map((value) => JSON.stringify(value))
      .join('\n'),
  );
  assert.equal(output.completed, true);
  assert.equal(output.records.some(containedCodexFailure), true);
  assert.equal(
    containedCodexFailure({
      type: 'item.completed',
      item: { type: 'command_execution', status: 'completed', exit_code: 1 },
    }),
    true,
  );
  assert.equal(
    containedCodexFailure({
      type: 'item.completed',
      item: { type: 'file_change', status: 'completed' },
    }),
    false,
  );
});
