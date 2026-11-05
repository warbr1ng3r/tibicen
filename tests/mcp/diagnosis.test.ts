import test from 'node:test';
import assert from 'node:assert/strict';
import {
  diagnoseMcp,
  validateMcpDiagnosisRequest,
  type McpDiagnosisRequest,
} from '../../scripts/mcp/diagnosis.ts';
import { planMcpChanges, validateMcpConfig } from '../../scripts/mcp/index.ts';

const request: McpDiagnosisRequest = {
  agent: 'claude-code',
  server: 'Example',
  sources: [{ path: '.mcp.json' }],
};
const json = (record: unknown) =>
  JSON.stringify({ mcpServers: { Example: record } });
const config = json({
  command: 'node',
  args: ['private-server.js'],
  env: { API_KEY: '${SERVICE_TOKEN}' },
});
const diagnosis = (input: McpDiagnosisRequest = request, text = config) =>
  diagnoseMcp(input, new Map([[input.sources[0].path, text]]));

test('a single supplied file establishes only project-input scope, never native connection or launch', () => {
  const result = diagnosis({ ...request, agentVersion: '2.1.283' });
  assert.equal(result.source.status, 'selected');
  assert.equal(result.source.basis, 'project-input-only');
  assert.equal(result.configuration.status, 'valid-stdio');
  assert.deepEqual(result.configuration.envNames, ['SERVICE_TOKEN']);
  assert.equal(result.versionEvidence, 'supplied-unverified');
  assert.equal(result.connection, 'unverified');
  assert.equal(result.launch.executable, 'unverified');
  assert.equal(result.launch.cwd, 'unverified');
  assert.equal(result.launch.environment, 'unverified');
  assert.equal(result.repair.status, 'no-repair-indicated');
  assert.ok(!JSON.stringify(result).includes('private-server.js'));
});

test('multiple definitions never infer order, and explicit source selection never merges records', () => {
  const input = {
    ...request,
    sources: [{ path: 'first.json' }, { path: 'second.json' }],
  };
  const configs = new Map([
    ['first.json', config],
    ['second.json', json({ command: 'python', args: ['other.py'] })],
  ]);
  for (const sources of [input.sources, input.sources.toReversed()]) {
    const uncertain = diagnoseMcp({ ...input, sources }, configs);
    assert.equal(uncertain.source.status, 'source-unverified');
    assert.equal(uncertain.configuration.status, 'unverified');
    assert.equal(uncertain.source.path, undefined);
  }
  const selected = diagnoseMcp(
    { ...input, effectiveSource: 'second.json' },
    configs,
  );
  assert.equal(selected.source.basis, 'caller-supplied');
  assert.equal(selected.source.path, 'second.json');
  assert.deepEqual(selected.configuration.envNames, []);
  assert.deepEqual(selected.source.overriddenPaths, ['first.json']);
  assert.ok(!JSON.stringify(selected).includes('other.py'));
});

test('unavailable sources cannot become missing servers or be ignored beside one valid candidate', () => {
  const input = {
    ...request,
    sources: [{ path: '.mcp.json' }, { path: 'unreadable.json' }],
  };
  const configs = new Map([['.mcp.json', config]]);
  assert.equal(diagnoseMcp(input, configs).source.status, 'source-unverified');
  const missing = diagnoseMcp(
    { ...input, effectiveSource: 'unreadable.json' },
    configs,
  );
  assert.equal(missing.source.status, 'source-unverified');
  assert.equal(missing.configuration.reason, 'source-unavailable');
  assert.equal(missing.source.candidates[1].status, 'unverified');
  assert.equal(diagnosis(request, '{}').source.status, 'not-found');
});

test('launch observations apply only to an explicitly known target, and never imply connection', () => {
  for (const targetContextKnown of [undefined, false, true]) {
    const result = diagnosis({
      ...request,
      launch: {
        targetContextKnown,
        availableEnvNames: [],
        executableAvailable: false,
        cwdAvailable: true,
      },
    });
    assert.equal(
      result.launch.executable,
      targetContextKnown ? 'missing' : 'unverified',
    );
    assert.equal(
      result.launch.cwd,
      targetContextKnown ? 'available' : 'unverified',
    );
    assert.equal(
      result.launch.environment,
      targetContextKnown ? 'missing' : 'unverified',
    );
    assert.deepEqual(
      result.launch.missingEnvNames,
      targetContextKnown ? ['SERVICE_TOKEN'] : [],
    );
    assert.equal(result.connection, 'unverified');
    assert.equal(
      result.repair.status,
      targetContextKnown ? 'manual-native-action' : 'no-repair-indicated',
    );
    if (targetContextKnown)
      assert.equal(result.repair.reason, 'target-environment-missing');
  }
  const incomplete = diagnosis({
    ...request,
    launch: { targetContextKnown: true, availableEnvNames: ['SERVICE_TOKEN'] },
  });
  assert.equal(incomplete.launch.executable, 'unverified');
  assert.equal(incomplete.launch.cwd, 'unverified');
  assert.equal(incomplete.launch.environment, 'available');
});

test('only a caller-selected exact existing writer gets a supported syntax repair', () => {
  const wrongReference = json({
    command: 'node',
    env: { KEY: '${env:TOKEN}' },
  });
  const selected = diagnosis(
    { ...request, effectiveSource: '.mcp.json' },
    wrongReference,
  );
  assert.equal(selected.repair.status, 'supported-project-writer');
  assert.equal(selected.repair.path, '.mcp.json');
  assert.equal(
    diagnosis(request, wrongReference).repair.status,
    'manual-native-action',
  );
  const outside = diagnosis(
    {
      ...request,
      sources: [{ path: 'nested/settings.json' }],
      effectiveSource: 'nested/settings.json',
    },
    wrongReference,
  );
  assert.equal(outside.repair.status, 'manual-native-action');
  assert.equal(outside.repair.path, undefined);
  for (const [launch, reason] of [
    [
      { targetContextKnown: true, executableAvailable: false },
      'target-executable-unavailable',
    ],
    [
      { targetContextKnown: true, cwdAvailable: false },
      'target-cwd-unavailable',
    ],
  ] as const) {
    const result = diagnosis({
      ...request,
      effectiveSource: '.mcp.json',
      launch,
    });
    assert.equal(result.repair.status, 'manual-native-action');
    assert.equal(result.repair.reason, reason);
    assert.equal(result.repair.path, undefined);
  }
});

test('existing Claude and Cursor validation and writer preservation remain authoritative', () => {
  const original =
    '{ "keep": [ 1, 2 ], "mcpServers": { "untouched": {"command":"keep"} } }';
  for (const agent of ['claude-code', 'cursor']) {
    const planned = planMcpChanges(agent, original, [
      {
        name: 'Example',
        action: 'upsert',
        server: { command: 'node', envNames: ['SERVICE_TOKEN'] },
      },
    ]);
    const content = planned.changes[0].content!;
    const input = { ...request, agent, sources: [{ path: planned.path! }] };
    assert.deepEqual(
      diagnosis(input, content).configuration.envNames,
      validateMcpConfig(agent, content).servers!.find(
        (item) => item.name === 'Example',
      )!.envNames,
    );
    assert.ok(content.includes('"keep": [ 1, 2 ]'));
    assert.ok(content.includes('"untouched": {"command":"keep"}'));
  }
});

test('Gemini expands only supported env references and retains supplied allow/exclude policy', () => {
  const input = {
    ...request,
    agent: 'gemini-cli',
    sources: [{ path: '.gemini/settings.json' }],
  };
  const record = {
    command: '$NOT_EXPANDED',
    args: ['${ALSO_LITERAL}'],
    env: { KEY: '$ONE${TWO}' },
    cwd: 'server',
  };
  assert.deepEqual(diagnosis(input, json(record)).configuration.envNames, [
    'ONE',
    'TWO',
  ]);
  for (const mcp of [{ allowed: ['other'] }, { excluded: ['Example'] }]) {
    const result = diagnosis(
      input,
      JSON.stringify({ mcp, mcpServers: { Example: record } }),
    );
    assert.equal(result.configuration.status, 'disabled');
    assert.equal(result.configuration.reason, 'excluded-by-supplied-policy');
    assert.equal(result.repair.status, 'manual-native-action');
  }
  assert.equal(
    diagnosis(input, json({ ...record, disabled: true })).configuration.reason,
    'unsupported-server-fields',
  );
  assert.equal(
    diagnosis(
      input,
      JSON.stringify({
        mcp: { serverCommand: 'other' },
        mcpServers: { Example: record },
      }),
    ).configuration.reason,
    'unsupported-server-command',
  );
});

test('Gemini remote URL wins over an otherwise valid local command', () => {
  for (const field of ['url', 'httpUrl']) {
    const result = diagnosis(
      { ...request, agent: 'gemini-cli' },
      json({ command: 'node', [field]: 'https://private.invalid/token' }),
    );
    assert.equal(result.configuration.reason, 'unsupported-mcp-transport');
    assert.ok(!JSON.stringify(result).includes('private.invalid'));
  }
});

test('OpenCode requires an explicitly selected V2 layout and keeps disabled overrides whole', () => {
  const input = {
    ...request,
    agent: 'opencode',
    format: 'opencode-v2',
    sources: [{ path: 'opencode.json' }, { path: 'override.json' }],
  };
  const configs = new Map([
    [
      'opencode.json',
      JSON.stringify({
        mcp: {
          servers: {
            Example: {
              type: 'local',
              command: ['node', '{env:SCRIPT}'],
              environment: { KEY: '{env:TOKEN}' },
              cwd: '{env:WORKDIR}',
            },
          },
        },
      }),
    ],
    [
      'override.json',
      JSON.stringify({ mcp: { servers: { Example: { disabled: true } } } }),
    ],
  ]);
  const chosen = diagnoseMcp(
    { ...input, effectiveSource: 'opencode.json' },
    configs,
  );
  assert.deepEqual(chosen.configuration.envNames, [
    'SCRIPT',
    'TOKEN',
    'WORKDIR',
  ]);
  const disabled = diagnoseMcp(
    { ...input, effectiveSource: 'override.json' },
    configs,
  );
  assert.equal(disabled.configuration.status, 'disabled');
  assert.deepEqual(disabled.configuration.envNames, []);
  assert.equal(disabled.repair.reason, 'preserve-disable-choice');
  for (const format of [undefined, 'opencode-v1']) {
    const unsupported = diagnoseMcp(
      { ...input, format, effectiveSource: 'opencode.json' },
      configs,
    );
    assert.equal(
      unsupported.configuration.reason,
      'unsupported-harness-format',
    );
  }
  const oldLayout = diagnosis(
    { ...input, sources: [input.sources[0]] },
    JSON.stringify({ mcp: { Example: { type: 'local', command: ['node'] } } }),
  );
  assert.equal(oldLayout.configuration.reason, 'unsupported-config-format');
});

test('unsupported fields, malformed records and ambiguous JSON return fixed reasons without data', () => {
  for (const text of [
    '{"mcpServers":{},"mcpServers":{}}',
    '{ // do-not-return-comment\n}',
    json({ command: 'node', args: 42 }),
    json({ command: 'node', env: [] }),
    json({ command: 'node', env: null }),
    json({ command: '', args: [] }),
    json({ command: 'node\nprivate-command' }),
    json({ command: 'node', unknown: 'do-not-return-unknown' }),
  ]) {
    const result = diagnosis(request, text);
    assert.equal(result.configuration.status, 'manual-action-required');
    assert.ok(!JSON.stringify(result).includes('do-not-return'));
    assert.ok(!JSON.stringify(result).includes('private-command'));
    assert.equal(result.repair.status, 'manual-native-action');
  }
});

test('inline credentials and file references never enter the result or resolve', () => {
  for (const [agent, record, format] of [
    [
      'claude-code',
      { command: 'node', env: { API_KEY: 'do-not-return-secret' } },
      undefined,
    ],
    [
      'cursor',
      { command: 'node', env: { KEY: 'do-not-return-secret' } },
      undefined,
    ],
    [
      'gemini-cli',
      { command: 'node', env: { KEY: 'do-not-return-secret' } },
      undefined,
    ],
    [
      'gemini-cli',
      { command: 'node', env: { KEY: '${TOKEN:-do-not-return-secret}' } },
      undefined,
    ],
    [
      'opencode',
      {
        type: 'local',
        command: ['node'],
        environment: { KEY: 'do-not-return-secret' },
      },
      'opencode-v2',
    ],
    [
      'opencode',
      { type: 'local', command: ['node', '{file:do-not-return-file}'] },
      'opencode-v2',
    ],
  ] as const) {
    const text =
      agent === 'opencode'
        ? JSON.stringify({ mcp: { servers: { Example: record } } })
        : json(record);
    const result = diagnosis({ ...request, agent, format }, text);
    assert.equal(result.configuration.status, 'manual-action-required');
    assert.ok(!JSON.stringify(result).includes('do-not-return'));
  }
});

test('whole-config inline secrets retain the existing writer guard even outside the selected record', () => {
  const text = JSON.stringify({
    settings: { API_TOKEN: 'do-not-return-unrelated-secret' },
    mcpServers: {
      Example: { command: 'node', env: { KEY: '${KEY}' } },
      other: { command: 'unrelated' },
    },
  });
  const result = diagnosis(
    {
      ...request,
      agent: 'cursor',
      sources: [{ path: '.cursor/mcp.json' }],
      effectiveSource: '.cursor/mcp.json',
    },
    text,
  );
  assert.equal(result.configuration.reason, 'existing-inline-secret');
  assert.equal(result.repair.status, 'manual-native-action');
  assert.ok(!JSON.stringify(result).includes('do-not-return-unrelated-secret'));
  assert.ok(!JSON.stringify(result).includes('unrelated'));
});

test('unknown harnesses and formats never parse or launch configuration', () => {
  const result = diagnosis(
    { ...request, agent: 'my-harness', effectiveSource: '.mcp.json' },
    'private-invalid-json',
  );
  assert.equal(result.configuration.reason, 'unsupported-harness-format');
  assert.equal(result.connection, 'unverified');
  assert.ok(!JSON.stringify(result).includes('private-invalid-json'));
});

test('recognized optional native fields still require their supported value types', () => {
  for (const record of [
    { command: 'node', trust: 'yes' },
    { command: 'node', timeout: -1 },
    { command: 'node', includeTools: 'all' },
  ])
    assert.equal(
      diagnosis({ ...request, agent: 'gemini-cli' }, json(record)).configuration
        .reason,
      'unsupported-config-format',
    );
  for (const options of [
    { codemode: 'false' },
    { pool: 1 },
    { timeout: 100 },
    { timeout: { startup: 0 } },
    { protocol: 'future' },
  ]) {
    const text = JSON.stringify({
      mcp: {
        servers: { Example: { type: 'local', command: ['node'], ...options } },
      },
    });
    assert.equal(
      diagnosis({ ...request, agent: 'opencode', format: 'opencode-v2' }, text)
        .configuration.reason,
      'unsupported-config-format',
    );
  }
});

test('metadata validation rejects secrets, raw config, unsafe paths and unsupported properties', () => {
  const invalid: unknown[] = [
    null,
    [],
    { ...request, agent: 'Claude-Code' },
    { ...request, agent: 'bad_agent' },
    { ...request, server: 'bad/server' },
    { ...request, agentVersion: '\nprivate' },
    { ...request, sources: [] },
    { ...request, sources: Array(5).fill({ path: 'a' }) },
    { ...request, sources: [{ path: 'a' }, { path: 'a' }] },
    ...[
      '../outside',
      '/absolute',
      'a/../b',
      './a',
      'a//b',
      'a\\b',
      '.env',
      '.git/config',
      'a\nb',
    ].map((path) => ({ ...request, sources: [{ path }] })),
    { ...request, sources: [{ path: 'a', text: 'secret' }] },
    { ...request, effectiveSource: 'not-supplied' },
    { ...request, launch: { env: { KEY: 'secret' } } },
    { ...request, launch: { targetContextKnown: 'true' } },
    { ...request, launch: { executableAvailable: 1 } },
    { ...request, launch: { availableEnvNames: ['KEY=value'] } },
    { ...request, command: 'node' },
  ];
  for (const input of invalid)
    assert.throws(() => validateMcpDiagnosisRequest(input), {
      code: 'invalid-mcp-diagnosis',
    });
  assert.deepEqual(validateMcpDiagnosisRequest(request), request);
});
