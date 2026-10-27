import test from 'node:test';
import assert from 'node:assert/strict';
import {
  planMcpChanges,
  validateMcpConfig,
  prepareCodexMcpBlock,
  verifyCodexMcpBlock,
  mcpNeedsExecutionTrust,
} from '../../scripts/mcp/index.ts';

const server = {
  name: 'example',
  command: 'node',
  args: ['server.js'],
  envNames: ['SERVICE_TOKEN'],
};

test('execution trust follows server command, args and environment changes, not JSON formatting', () => {
  const entry = {
    command: 'existing',
    args: ['one'],
    env: { SERVICE_TOKEN: '${SERVICE_TOKEN}' },
  };
  const config = (entry: unknown) =>
    JSON.stringify({ mcpServers: { kept: entry }, metadata: true });
  const before = config(entry);
  assert.equal(
    mcpNeedsExecutionTrust(
      'claude-code',
      before,
      JSON.stringify(JSON.parse(before), null, 2),
    ),
    false,
  );
  assert.equal(mcpNeedsExecutionTrust('claude-code', before, null), false);
  for (const changed of [
    { ...entry, command: 'new' },
    { ...entry, args: ['two'] },
    { ...entry, env: { SERVICE_TOKEN: '${OTHER_TOKEN}' } },
  ]) {
    assert.equal(
      mcpNeedsExecutionTrust('claude-code', before, config(changed)),
      true,
    );
  }
  assert.throws(
    () =>
      mcpNeedsExecutionTrust(
        'claude-code',
        '{"mcpServers":{},"mcpServers":{}}',
        null,
      ),
    { code: 'invalid-mcp-format' },
  );
});

for (const [agent, expected, configPath] of [
  ['claude-code', '${SERVICE_TOKEN}', '.mcp.json'],
  ['cursor', '${env:SERVICE_TOKEN}', '.cursor/mcp.json'],
]) {
  test(`${agent} generates only the target env-reference syntax`, () => {
    const plan = planMcpChanges(
      agent,
      null,
      [{ name: server.name, action: 'upsert', server }],
      { targetContextKnown: true, availableEnvNames: ['SERVICE_TOKEN'] },
    );
    assert.equal(plan.changes[0].path, configPath);
    assert.equal(plan.changes[0].action, 'add');
    assert.equal(
      JSON.parse(plan.changes[0].content!).mcpServers.example.env.SERVICE_TOKEN,
      expected,
    );
    assert.equal(plan.results![0].status, 'configured-unverified');
  });
}

test('updates and deletes selected entries without rewriting unrelated bytes', () => {
  const original =
    '{\n "otherSetting": [ 1, 2 ],\n "mcpServers": {\n  "keep": {"command":"node", "args": ["keep.js"]},\n  "old": { "command": "old" },\n  "remove": {"command":"remove"}\n }\n}\n';
  const result = planMcpChanges('cursor', original, [
    { name: 'old', action: 'upsert', server: { ...server, envNames: [] } },
    { name: 'remove', action: 'remove' },
  ]);
  const changed = result.changes[0].content;
  assert.ok(changed!.includes('"otherSetting": [ 1, 2 ]'));
  assert.ok(
    changed!.includes('"keep": {"command":"node", "args": ["keep.js"]}'),
  );
  assert.equal(JSON.parse(changed!).mcpServers.remove, undefined);
  assert.equal(JSON.parse(changed!).mcpServers.old.command, 'node');
  for (const name of ['first', 'middle', 'last']) {
    const text =
      '{"mcpServers":{"first":{"command":"a"},"middle":{"command":"b"},"last":{"command":"c"}}}';
    const removed = planMcpChanges('cursor', text, [
      { name, action: 'remove' },
    ]);
    assert.equal(
      Object.keys(JSON.parse(removed.changes[0].content!).mcpServers).length,
      2,
    );
  }
});

test('ambiguous JSON, literal secrets and unknown formats give a manual step without content', () => {
  for (const text of [
    '{"mcpServers":{},"mcpServers":{}}',
    '{ // commented\n}',
    '{"mcpServers":{"old":{"command":"node","env":{"API_KEY":"do-not-return"}}}}',
  ]) {
    const result = planMcpChanges('claude-code', text, [
      { name: server.name, action: 'upsert', server },
    ]);
    assert.equal(result.status, 'manual-action-required');
    assert.deepEqual(result.changes, []);
    assert.ok(!JSON.stringify(result).includes('do-not-return'));
  }
});

test('env availability is specific to the target launch context', () => {
  const text =
    '{"mcpServers":{"example":{"command":"node","env":{"KEY":"${env:KEY}"}}}}';
  assert.equal(
    validateMcpConfig('cursor', text, { availableEnvNames: ['KEY'] })
      .servers![0].status,
    'env-context-unverified',
  );
  assert.equal(
    validateMcpConfig('cursor', text, {
      targetContextKnown: true,
      availableEnvNames: [],
    }).servers![0].status,
    'no-key',
  );
  assert.equal(
    validateMcpConfig('cursor', text, {
      targetContextKnown: true,
      availableEnvNames: ['KEY'],
    }).servers![0].status,
    'configured-unverified',
  );
  assert.equal(
    validateMcpConfig('claude-code', text).servers![0].reason,
    'invalid-env-reference',
  );
});

test('Codex gets a manual env_vars block and can verify its subsequent application', () => {
  const result = prepareCodexMcpBlock(server);
  assert.equal(result.status, 'manual-action-required');
  assert.ok(result.block.includes('env_vars = ["SERVICE_TOKEN"]'));
  assert.equal(
    verifyCodexMcpBlock('', server).status,
    'manual-action-required',
  );
  assert.equal(
    verifyCodexMcpBlock(result.block, server, {
      targetContextKnown: true,
      availableEnvNames: ['SERVICE_TOKEN'],
    }).status,
    'configured-unverified',
  );
  assert.equal(
    verifyCodexMcpBlock(result.block + result.block, server).status,
    'manual-action-required',
  );
});

test('MCP planning rejects remote transport and literal new env values', () => {
  assert.throws(
    () =>
      planMcpChanges('cursor', null, [
        {
          name: 'remote',
          action: 'upsert',
          server: { command: 'node', url: 'https://example.com' },
        },
      ]),
    { code: 'unsupported-mcp-transport' },
  );
  assert.throws(
    () => prepareCodexMcpBlock({ ...server, env: { SERVICE_TOKEN: 'secret' } }),
    { code: 'invalid-mcp' },
  );
});
