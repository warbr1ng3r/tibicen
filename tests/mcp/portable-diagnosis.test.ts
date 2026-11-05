import test from 'node:test';
import assert from 'node:assert/strict';
import { hashContent } from '../../scripts/core/contracts.ts';
import {
  diagnoseMcp,
  validateMcpDiagnosisRequest,
  type McpDiagnosisRequest,
} from '../../scripts/mcp/diagnosis.ts';

const sourcePath = 'settings.txt';
const request: McpDiagnosisRequest = {
  agent: 'team-host',
  server: 'Example',
  sources: [{ path: sourcePath }],
};
const json = (record: unknown) =>
  JSON.stringify({ mcpServers: { Example: record } });
const vibe = (extra = '') =>
  `model = "devstral"\n[[mcp_servers]]\nname = "Example"\ntransport = "stdio"\ncommand = "node"\nargs = ["do-not-return-script.js"]\n${extra}`;
const inspect = (
  format: string,
  text: string,
  metadata: Partial<McpDiagnosisRequest> = {},
) =>
  diagnoseMcp(
    { ...request, format, ...metadata },
    new Map([[sourcePath, text]]),
  );
const observed = (
  text: string,
  state: 'stdio' | 'disabled' | 'unknown' = 'stdio',
  envNames: string[] = [],
) => ({
  ...request,
  format: 'stdio-observation',
  sources: [
    {
      path: sourcePath,
      observation: { sourceHash: hashContent(text), state, envNames },
    },
  ],
});

test('an unknown harness can select every concrete reader without becoming that harness', () => {
  const fixtures = [
    ['claude-code-json', json({ command: 'node', env: { KEY: '${TOKEN}' } })],
    ['cursor-json', json({ command: 'node', env: { KEY: '${env:TOKEN}' } })],
    ['gemini-cli-json', json({ command: 'node', env: { KEY: '$TOKEN' } })],
    [
      'opencode-v2',
      JSON.stringify({
        mcp: {
          servers: {
            Example: {
              type: 'local',
              command: ['node'],
              environment: { KEY: '{env:TOKEN}' },
            },
          },
        },
      }),
    ],
    [
      'zcode-native-json',
      JSON.stringify({
        mcp: { servers: { Example: { command: 'node', env: {} } } },
      }),
    ],
    ['zcode-shared-json', json({ command: 'node' })],
    [
      'kimi-code-json',
      json({ command: 'node', transport: 'stdio', environment_id: 'local' }),
    ],
    ['mistral-vibe-toml', vibe()],
  ];
  for (const [format, text] of fixtures) {
    const result = inspect(format, text);
    assert.equal(result.agent, request.agent);
    assert.equal(result.format, format);
    assert.equal(result.formatEvidence, 'caller-supplied');
    assert.equal(result.configuration.status, 'valid-stdio', format);
    assert.equal(result.configuration.basis, 'parsed-format');
    assert.equal(result.nativeActivation, 'unverified');
    assert.equal(result.connection, 'unverified');
    assert.equal(result.repair.path, undefined);
    assert.ok(!JSON.stringify(result).includes('do-not-return'));
  }
});

test('legacy defaults remain narrow and no inherited object key becomes a format', () => {
  for (const agent of ['claude-code', 'cursor', 'gemini-cli']) {
    const result = diagnoseMcp(
      { ...request, agent },
      new Map([[sourcePath, json({ command: 'node' })]]),
    );
    assert.equal(result.format, `${agent}-json`);
    assert.equal(result.formatEvidence, 'harness-default');
    assert.equal(result.configuration.status, 'valid-stdio');
  }
  for (const agent of [
    'team-host',
    'zcode',
    'kimi-code',
    'mistral-vibe',
    'opencode',
    'constructor',
    'tostring',
  ]) {
    const result = diagnoseMcp(
      { ...request, agent },
      new Map([[sourcePath, json({ command: 'node' })]]),
    );
    assert.equal(result.formatEvidence, 'unverified');
    assert.equal(result.format, 'unverified');
    assert.equal(result.configuration.reason, 'unsupported-harness-format');
    assert.equal(result.configuration.basis, 'unverified');
  }
  assert.equal(
    inspect('future-format', 'not parsed').configuration.reason,
    'unsupported-harness-format',
  );
});

test('an explicit reader never borrows a different or unknown harness writer', () => {
  for (const [agent, format, text, path] of [
    [
      'team-host',
      'cursor-json',
      json({ command: 'node', env: { KEY: '${TOKEN}' } }),
      '.cursor/mcp.json',
    ],
    [
      'cursor',
      'claude-code-json',
      json({ command: 'node', env: { KEY: '${env:TOKEN}' } }),
      '.cursor/mcp.json',
    ],
    [
      'claude-code',
      'cursor-json',
      json({ command: 'node', env: { KEY: '${TOKEN}' } }),
      '.mcp.json',
    ],
  ]) {
    const result = diagnoseMcp(
      { ...request, agent, format, sources: [{ path }], effectiveSource: path },
      new Map([[path, text]]),
    );
    assert.equal(result.configuration.reason, 'invalid-env-reference');
    assert.equal(result.repair.status, 'manual-native-action');
    assert.equal(result.repair.path, undefined);
  }
  const path = '.cursor/mcp.json';
  const result = diagnoseMcp(
    {
      ...request,
      agent: 'cursor',
      format: 'cursor-json',
      sources: [{ path }],
      effectiveSource: path,
    },
    new Map([[path, json({ command: 'node', env: { KEY: '${TOKEN}' } })]]),
  );
  assert.equal(result.repair.status, 'supported-project-writer');
});

test('ZCode native and shared layouts never infer each other or source precedence', () => {
  const native = JSON.stringify({
    mcp: { servers: { Example: { command: 'node' } } },
  });
  const shared = json({ command: 'node' });
  assert.equal(
    inspect('zcode-native-json', native).configuration.status,
    'valid-stdio',
  );
  assert.equal(
    inspect('zcode-shared-json', shared).configuration.status,
    'valid-stdio',
  );
  assert.equal(inspect('zcode-native-json', shared).source.status, 'not-found');
  assert.equal(inspect('zcode-shared-json', native).source.status, 'not-found');
  const paths = ['one.json', 'two.json'];
  const result = diagnoseMcp(
    {
      ...request,
      format: 'zcode-native-json',
      sources: paths.map((path) => ({ path })),
    },
    new Map(paths.map((path) => [path, native])),
  );
  assert.equal(result.source.status, 'source-unverified');
  assert.equal(result.configuration.basis, 'unverified');
});

test('native disable flags preserve choices without implying native nonexecution', () => {
  for (const [format, text] of [
    [
      'zcode-native-json',
      JSON.stringify({ mcp: { servers: { Example: { enable: false } } } }),
    ],
    ['zcode-shared-json', json({ enable: false })],
    ['kimi-code-json', json({ enabled: false, environment_id: 'remote' })],
    ['mistral-vibe-toml', vibe('disabled = true\n')],
  ]) {
    const result = inspect(format, text);
    assert.equal(result.configuration.status, 'disabled', format);
    assert.equal(result.repair.reason, 'preserve-disable-choice');
    assert.equal(result.nativeActivation, 'unverified');
    assert.equal(result.connection, 'unverified');
  }
  for (const [format, record] of [
    ['zcode-shared-json', { command: 'node', enabled: false }],
    ['kimi-code-json', { command: 'node', enable: false }],
    ['kimi-code-json', { command: 'node', enabled: 'false' }],
  ])
    assert.equal(
      inspect(format as string, json(record)).configuration.status,
      'manual-action-required',
    );
});

test('new native literal env overlays never acquire another format interpolation', () => {
  for (const value of [
    'do-not-return-secret',
    '${TOKEN}',
    '${env:TOKEN}',
    '{env:TOKEN}',
  ]) {
    for (const format of ['zcode-shared-json', 'kimi-code-json']) {
      const result = inspect(
        format,
        json({ command: 'node', env: { KEY: value } }),
      );
      assert.equal(result.configuration.reason, 'inline-environment-values');
      assert.deepEqual(result.configuration.envNames, []);
      assert.ok(!JSON.stringify(result).includes(value));
    }
    const result = inspect(
      'mistral-vibe-toml',
      vibe(`env = { KEY = '${value}' }\n`),
    );
    assert.equal(result.configuration.reason, 'inline-environment-values');
    assert.ok(!JSON.stringify(result).includes(value));
  }
});

test('Kimi local target and optional native fields are validated without assuming trust', () => {
  const record = {
    command: 'node',
    cwd: 'workspace',
    environment_id: 'local',
    enabled: true,
    startupTimeoutMs: 1,
    toolTimeoutMs: 2147483647,
    enabledTools: ['read'],
    disabledTools: [],
    deferred: false,
  };
  assert.equal(
    inspect('kimi-code-json', json(record)).configuration.status,
    'valid-stdio',
  );
  assert.equal(
    inspect('kimi-code-json', json({ ...record, environment_id: 'remote' }))
      .configuration.reason,
    'unsupported-launch-environment',
  );
  for (const change of [
    { startupTimeoutMs: 0 },
    { toolTimeoutMs: 2147483648 },
    { startupTimeoutMs: 1.5 },
    { deferred: 'yes' },
    { enabledTools: 'all' },
    { cwd: '' },
    { transport: 'sse' },
    { args: [false] },
  ])
    assert.equal(
      inspect('kimi-code-json', json({ ...record, ...change })).configuration
        .status,
      'manual-action-required',
    );
});

test('Vibe accepts only its bounded local contract, without splitting command strings', () => {
  const text =
    "[[models]]\nname = 'existing-model'\n[tools.shell]\nenabled = true\n" +
    vibe(
      "startup_timeout_sec = 0.5\ntool_timeout_sec = 60\ncwd = 'workspace'\ndisabled_tools = ['write']\n",
    );
  assert.equal(
    inspect('mistral-vibe-toml', text).configuration.status,
    'valid-stdio',
  );
  assert.equal(
    inspect(
      'mistral-vibe-toml',
      vibe().replace('command = "node"', 'command = ["node", "--flag"]'),
    ).configuration.status,
    'valid-stdio',
  );
  assert.equal(
    inspect(
      'mistral-vibe-toml',
      vibe().replace('command = "node"', 'command = "uvx --isolated"'),
    ).launch.executable,
    'unverified',
  );
  assert.equal(
    inspect('mistral-vibe-toml', vibe('[mcp_servers.env]\n')).configuration
      .status,
    'valid-stdio',
  );
  for (const extra of [
    'startup_timeout_sec = 0\n',
    'tool_timeout_sec = "10"\n',
    'disabled = "yes"\n',
    'disabled_tools = false\n',
    'unknown = "do-not-return-value"\n',
    '[mcp_servers.auth]\ntype = "static"\n',
  ])
    assert.equal(
      inspect('mistral-vibe-toml', vibe(extra)).configuration.status,
      'manual-action-required',
    );
});

test('Vibe accepts Unicode inside strings without treating it as TOML whitespace', () => {
  for (const whitespace of ['\u00a0', '\ufeff']) {
    for (const text of [
      vibe().replace('[[mcp_servers]]', `${whitespace}[[mcp_servers]]`),
      vibe().replace('name = "Example"', `name = "Example"${whitespace}`),
      vibe().replace(
        '[[mcp_servers]]',
        `[[mcp_servers]]${whitespace}# comment`,
      ),
    ])
      assert.equal(
        inspect('mistral-vibe-toml', text).configuration.status,
        'manual-action-required',
      );
    assert.equal(
      inspect(
        'mistral-vibe-toml',
        vibe().replace('do-not-return-script.js', `hello${whitespace}world`),
      ).configuration.status,
      'valid-stdio',
    );
  }
});

test('Vibe ambiguous names and malformed or unsupported TOML fail as whole sources', () => {
  const invalid = [
    vibe() + vibe(),
    vibe('command = "other"\n'),
    vibe('env = { A = "1", A = "2" }\n'),
    vibe('[mcp_servers.env]\nA = "1"\n[mcp_servers.env]\nB = "2"\n'),
    'unrelated = """do-not-return-multiline"""\n' + vibe(),
    'unrelated = [\n"value"\n]\n' + vibe(),
    'unrelated = "do-not-return"\nbroken rest\n' + vibe(),
    '["quoted.section"]\nkey = "value"\n' + vibe(),
    'dotted.key = "value"\n' + vibe(),
    'date = 2026-11-06\n' + vibe(),
    'x = { __proto__ = "bad" }\n' + vibe(),
    'x = "\\/"\n' + vibe(),
    'x = "\\uD800"\n' + vibe(),
    'x = 9007199254740992\n' + vibe(),
    vibe().replace('["do-not-return-script.js"]', "['hello\rworld']"),
    vibe().replace('name = "Example"', 'name = "Example."'),
    vibe() +
      '[[mcp_servers]]\nname = "Example"\ntransport = "stdio"\ncommand = "other"\n',
    '#'.repeat(1024 * 1024 + 1),
  ];
  for (const text of invalid) {
    const result = inspect('mistral-vibe-toml', text);
    assert.equal(result.configuration.status, 'manual-action-required');
    assert.ok(!JSON.stringify(result).includes('do-not-return'));
  }
});

test('general observations bind inspected text without interpreting configuration code', () => {
  const text =
    'import os\nos.system("do-not-return-command")\n!!python/object:never\n';
  const result = diagnoseMcp(
    observed(text, 'stdio', ['TOKEN', 'TOKEN', 'OTHER']),
    new Map([[sourcePath, text]]),
  );
  assert.equal(result.configuration.status, 'reported-stdio');
  assert.equal(result.configuration.basis, 'caller-observation');
  assert.deepEqual(result.configuration.envNames, ['OTHER', 'TOKEN']);
  assert.equal(result.nativeActivation, 'unverified');
  assert.equal(result.connection, 'unverified');
  assert.equal(result.repair.status, 'manual-native-action');
  assert.equal(result.repair.reason, 'observed-configuration-not-parsed');
  assert.ok(!JSON.stringify(result).includes('do-not-return'));
});

test('missing, stale and oversized observed sources never retain facts or parsed basis', () => {
  const text = 'configuration';
  for (const configs of [
    new Map<string, string>(),
    new Map([[sourcePath, `${text}\n`]]),
    new Map([[sourcePath, 'x'.repeat(1024 * 1024 + 1)]]),
  ]) {
    const result = diagnoseMcp(observed(text, 'stdio', ['TOKEN']), configs);
    assert.equal(result.configuration.status, 'unverified');
    assert.equal(result.configuration.basis, 'unverified');
    assert.deepEqual(result.configuration.envNames, []);
    assert.equal(result.repair.path, undefined);
  }
  const missing = inspect('stdio-observation', text);
  assert.equal(missing.source.candidates[0].reason, 'observation-required');
  const stale = diagnoseMcp(observed(text), new Map([[sourcePath, 'changed']]));
  assert.equal(stale.source.candidates[0].reason, 'observation-source-changed');
});

test('observed disable and unknown states do not become valid native configuration', () => {
  const text = 'configuration';
  const disabled = diagnoseMcp(
    observed(text, 'disabled'),
    new Map([[sourcePath, text]]),
  );
  assert.equal(disabled.configuration.status, 'disabled');
  assert.equal(disabled.configuration.basis, 'caller-observation');
  assert.equal(disabled.repair.reason, 'preserve-disable-choice');
  const unknown = diagnoseMcp(
    observed(text, 'unknown'),
    new Map([[sourcePath, text]]),
  );
  assert.equal(unknown.configuration.status, 'manual-action-required');
  assert.equal(unknown.configuration.reason, 'caller-observation-unknown');
});

test('observed launch facts need target context and never grant even an existing writer', () => {
  const text = 'not JSON';
  for (const targetContextKnown of [undefined, false, true]) {
    const input = {
      ...observed(text, 'stdio', ['TOKEN']),
      agent: 'cursor',
      effectiveSource: sourcePath,
      launch: {
        targetContextKnown,
        availableEnvNames: [],
        executableAvailable: false,
        cwdAvailable: true,
      },
    };
    const result = diagnoseMcp(input, new Map([[sourcePath, text]]));
    assert.equal(
      result.launch.environment,
      targetContextKnown ? 'missing' : 'unverified',
    );
    assert.equal(
      result.launch.executable,
      targetContextKnown ? 'missing' : 'unverified',
    );
    assert.equal(
      result.launch.cwd,
      targetContextKnown ? 'available' : 'unverified',
    );
    assert.equal(result.repair.status, 'manual-native-action');
    assert.equal(result.repair.path, undefined);
  }
  const path = '.cursor/mcp.json';
  const input = observed(text);
  input.sources[0].path = path;
  const result = diagnoseMcp(
    { ...input, agent: 'cursor', effectiveSource: path },
    new Map([[path, text]]),
  );
  assert.equal(result.repair.path, undefined);
});

test('observation metadata rejects commands, values, malformed hashes and cross-format facts', () => {
  const input = observed('configuration');
  const observation = input.sources[0].observation;
  const invalid = [
    { ...input, format: 'cursor-json' },
    ...[
      { ...observation, sourceHash: 'A'.repeat(64) },
      { ...observation, sourceHash: '0'.repeat(63) },
      { ...observation, state: 'remote' },
      { ...observation, state: ['stdio'] },
      { ...observation, state: Object('stdio') },
      { ...observation, state: 'disabled', envNames: ['TOKEN'] },
      { ...observation, envNames: ['TOKEN=value'] },
      { ...observation, envNames: Array(257).fill('TOKEN') },
      { ...observation, envNames: ['A'.repeat(257)] },
      { ...observation, command: 'do-not-execute' },
      { ...observation, env: { TOKEN: 'secret' } },
    ].map((changed) => ({
      ...input,
      sources: [{ path: sourcePath, observation: changed }],
    })),
  ];
  for (const metadata of invalid)
    assert.throws(() => validateMcpDiagnosisRequest(metadata), {
      code: 'invalid-mcp-diagnosis',
    });
});
