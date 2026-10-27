import path from 'node:path';
import {
  lstat,
  mkdir,
  readFile,
  readdir,
  realpath,
  writeFile,
} from 'node:fs/promises';
import { assert } from '../../core/contracts.ts';
import { controlledCodexConfig, toml } from '../profiles/codex/preflight.ts';

export interface ContainerCodexHomeOptions {
  home: string;
  workspace: string;
  launcher: string;
  launcherArgs: string[];
  outputSchema?: string;
  modelProvider?: { baseUrl: string; model: string };
  subscription?: { auth: Buffer; model: 'gpt-6-astra' };
}

const errorCode = 'invalid-container-codex-config';

export function validateContainerOutputSchema(value: unknown) {
  if (value === undefined) return;
  let object: unknown;
  if (typeof value === 'string' && Buffer.byteLength(value) <= 65536)
    try {
      object = JSON.parse(value);
    } catch {
      /* Invalid schema input is rejected without echoing its contents. */
    }
  assert(
    object !== null && typeof object === 'object' && !Array.isArray(object),
    'invalid-container-codex-schema',
    'Expected a JSON object schema within 64 KiB.',
  );
  return value as string;
}

function absolute(value: string) {
  assert(
    typeof value === 'string' &&
      value.length <= 4096 &&
      !/[\0\r\n]/.test(value) &&
      path.isAbsolute(value) &&
      path.resolve(value) === value &&
      value !== path.parse(value).root,
    errorCode,
    'Expected a normalized absolute path.',
  );
}

function within(parent: string, child: string) {
  const relative = path.relative(parent, child);
  return (
    !relative ||
    (relative !== '..' &&
      !relative.startsWith('..' + path.sep) &&
      !path.isAbsolute(relative))
  );
}

/** Generates a fresh host home; the container mirrors workspace exactly. */
export async function generateContainerCodexHome(
  options: ContainerCodexHomeOptions,
) {
  const { home, workspace, launcher, launcherArgs } = options;
  const outputSchema = validateContainerOutputSchema(options.outputSchema);
  const codeMode =
    (options.subscription?.model ?? options.modelProvider?.model) ===
    'gpt-6-astra';
  assert(
    !(options.modelProvider && options.subscription),
    errorCode,
    'Choose one explicit transport.',
  );
  if (options.subscription) {
    const auth = JSON.parse(options.subscription.auth.toString());
    assert(
      options.subscription.model === 'gpt-6-astra' &&
        auth.auth_mode === 'chatgptAuthTokens' &&
        !auth.OPENAI_API_KEY &&
        auth.tokens?.refresh_token === '',
      errorCode,
      'Only access-only subscription credentials are supported.',
    );
  }
  for (const value of [home, workspace, launcher]) absolute(value);
  assert(
    !within(home, workspace) && !within(workspace, home),
    errorCode,
    'Host home and workspace must be separate directories.',
  );
  assert(
    Array.isArray(launcherArgs) &&
      launcherArgs.length <= 16 &&
      launcherArgs.every(
        (value) =>
          typeof value === 'string' &&
          value.length <= 8192 &&
          !/[\0\r\n]/.test(value),
      ),
    errorCode,
    'Invalid stdio launcher arguments.',
  );
  const provider = options.modelProvider ?? {
    baseUrl: 'http://127.0.0.1:9/v1',
    model: 'tibicen-offline',
  };
  assert(
    /^http:\/\/127\.0\.0\.1:[1-9]\d{0,4}\/v1$/.test(provider.baseUrl) &&
      Number(provider.baseUrl.match(/:(\d+)\/v1$/)?.[1]) <= 65535 &&
      /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/.test(provider.model),
    errorCode,
    'Only a literal loopback synthetic Responses provider is allowed.',
  );
  assert(
    (await realpath(workspace)) === workspace &&
      (await lstat(workspace)).isDirectory() &&
      (await lstat(launcher)).isFile() &&
      (await realpath(path.dirname(home))) === path.dirname(home),
    errorCode,
    'Use real workspace/home paths and a regular launcher file.',
  );
  await mkdir(home, { recursive: true, mode: 0o700 });
  assert(
    (await realpath(home)) === home && (await readdir(home)).length === 0,
    errorCode,
    'Use a fresh empty host home without links or existing configuration.',
  );
  const codexHome = path.join(home, '.codex');
  await mkdir(codexHome, { mode: 0o700 });
  await mkdir(path.join(home, 'tmp'), { mode: 0o700 });
  const configPath = path.join(codexHome, 'config.toml');
  const environmentsPath = path.join(codexHome, 'environments.toml');
  const schemaPath = path.join(codexHome, 'proposal.schema.json');
  const configText =
    [
      ...controlledCodexConfig('/home/runner', {
        PATH: '/usr/local/bin:/usr/bin:/bin',
      }).filter((entry) => !entry.startsWith('shell_environment_policy.set=')),
      'shell_environment_policy.set=' +
        toml({
          PATH: '/usr/local/bin:/usr/bin:/bin',
          HOME: '/home/runner',
          TMPDIR: '/tmp',
        }),
      ...[
        'daemon_auto_start',
        'code_mode',
        'code_mode_host',
        'shell_snapshot_v2',
        'shell_zsh_fork',
        'unified_exec_zsh_fork',
        'remote_models',
        'api_key_model_discovery',
        'enable_request_compression',
        'unbounded_connection_retries',
        'executor_capability_discovery',
        'plugin_hooks',
        'recommended_plugins',
        'multi_agent_v2',
      ]
        .filter((name) => !codeMode || name !== 'code_mode_host')
        .map((name) => 'features.' + name + '=false'),
      'features.code_mode_only=false',
      ...(codeMode
        ? [
            'features.code_mode_host=' +
              toml({ enabled: true, disable_in_process_fallback: true }),
            'model_reasoning_effort="low"',
          ]
        : []),
      'default_permissions="container"',
      'permissions.container=' +
        toml({
          // Docker owns filesystem isolation; Codex still restricts command networking.
          description: 'Filesystem access only inside the owned container.',
          filesystem: { ':root': 'write' },
          network: { enabled: false },
        }),
      'mcp_servers={}',
      // Prevent automatic host project trust writes and loading host project config.
      'projects=' + toml({ [workspace]: { trust_level: 'untrusted' } }),
      'analytics.enabled=false',
      'feedback.enabled=false',
      'otel.exporter="none"',
      'otel.metrics_exporter="none"',
      'otel.trace_exporter="none"',
      'cli_auth_credentials_store="file"',
      'features.use_agent_identity=false',
      'model_catalog_json=' + toml(path.join(codexHome, 'models.json')),
      ...(options.subscription
        ? [
            'forced_login_method="chatgpt"',
            'chatgpt_base_url="https://chatgpt.com/backend-api"',
            'model_provider="tibicen_subscription"',
            'model=' + toml(options.subscription.model),
            'model_providers.tibicen_subscription=' +
              toml({
                name: 'OpenAI',
                base_url: 'https://chatgpt.com/backend-api/codex',
                wire_api: 'responses',
                requires_openai_auth: true,
                request_max_retries: 0,
                stream_max_retries: 0,
                stream_idle_timeout_ms: 10000,
                supports_websockets: false,
              }),
          ]
        : [
            'model_provider="tibicen_offline"',
            'model=' + toml(provider.model),
            'model_providers.tibicen_offline=' +
              toml({
                name: 'Tibicen synthetic local transport',
                base_url: provider.baseUrl,
                wire_api: 'responses',
                requires_openai_auth: false,
                request_max_retries: 0,
                stream_max_retries: 0,
                stream_idle_timeout_ms: 10000,
              }),
          ]),
    ].join('\n') + '\n';
  const environmentsText =
    [
      'default="eval-linux"',
      'include_local=false',
      '[[environments]]',
      'id="eval-linux"',
      'program=' + toml(launcher),
      'args=' + toml(launcherArgs),
      'cwd=' + toml(workspace),
      'initialize_timeout_sec=10.0',
    ].join('\n') + '\n';
  const generatedFiles: [string, string | Buffer][] = [
    [configPath, configText],
    [environmentsPath, environmentsText],
    ...(outputSchema === undefined
      ? []
      : ([[schemaPath, outputSchema]] as [string, string][])),
    [
      path.join(codexHome, 'models.json'),
      await readFile(
        new URL(
          codeMode ? './codex-code-mode-model.json' : './codex-model.json',
          import.meta.url,
        ),
      ),
    ],
    ...(options.subscription
      ? [
          [
            path.join(codexHome, 'auth.json'),
            Buffer.from(options.subscription.auth),
          ] as [string, Buffer],
        ]
      : []),
  ];
  for (const [filename, contents] of generatedFiles)
    await writeFile(filename, contents, { flag: 'wx', mode: 0o600 });

  async function validate(afterRun = false) {
    assert(
      (await realpath(home)) === home &&
        (await lstat(codexHome)).isDirectory() &&
        !(await lstat(codexHome)).isSymbolicLink(),
      errorCode,
      'Generated home changed before launch.',
    );
    for (const [filename, contents] of generatedFiles) {
      assert(
        (await lstat(filename)).isFile() &&
          (await readFile(filename)).equals(Buffer.from(contents)),
        errorCode,
        'Generated Codex configuration changed before launch.',
      );
    }
    assert(
      afterRun ||
        (await readdir(codexHome)).every((name) =>
          generatedFiles.some(([filename]) => path.basename(filename) === name),
        ),
      errorCode,
      'Unexpected files in the generated Codex home.',
    );
  }

  return {
    home,
    codexHome,
    workspace,
    configPath,
    environmentsPath,
    env: {
      PATH: path.dirname(process.execPath) + ':/usr/bin:/bin',
      HOME: home,
      CODEX_HOME: codexHome,
      // Missing environments.toml must disable tools, never recreate local access.
      CODEX_EXEC_SERVER_URL: 'none',
      TMPDIR: path.join(home, 'tmp'),
      DO_NOT_TRACK: '1',
      CI: '1',
    },
    argv: [
      '--no-daemon',
      'exec',
      '--ignore-rules',
      '--strict-config',
      '--ephemeral',
      '--json',
      '--skip-git-repo-check',
      '--cd',
      workspace,
      '-c',
      options.subscription
        ? 'model_provider="tibicen_subscription"'
        : 'model_provider="tibicen_offline"',
      ...(outputSchema === undefined ? [] : ['--output-schema', schemaPath]),
      '-',
    ],
    validate,
  };
}
