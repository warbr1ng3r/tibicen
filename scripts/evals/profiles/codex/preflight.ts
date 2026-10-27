import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { digest } from '../../../core/contracts.ts';
import { writeEvalArtifact } from '../../observations.ts';
import { nativeContainmentPreflight } from '../../node-check-containment.ts';

export function codexPermissions(
  root: string,
  home: string,
  privateRoot: string,
) {
  return {
    description:
      'Controlled evaluation commands; no personal files, host oracles or command network.',
    filesystem: {
      ':minimal': 'read',
      '/opt/homebrew': 'read',
      '/System/Library/OpenSSL': 'read',
      '/private/etc/ssl': 'read',
      [path.dirname(process.execPath)]: 'read',
      [root]: 'write',
      [path.join(root, '.agents')]: 'write',
      [home]: 'deny',
      [privateRoot]: 'deny',
      [os.homedir()]: 'deny',
      [process.env.CODEX_HOME || path.join(os.homedir(), '.codex')]: 'deny',
    },
    network: { enabled: false },
  };
}
export function controlledCodexConfig(
  home: string,
  extraEnvironment: Record<string, string> = {},
) {
  return [
    'approval_policy="never"',
    'allow_login_shell=false',
    'web_search="disabled"',
    'shell_environment_policy.inherit="none"',
    `shell_environment_policy.set=${toml({ ...extraEnvironment, PATH: extraEnvironment.PATH ?? path.dirname(process.execPath) + ':/opt/homebrew/bin:/usr/bin:/bin', HOME: home, TMPDIR: path.join(home, 'tmp') })}`,
    ...[
      'apps',
      'plugins',
      'hooks',
      'shell_snapshot',
      'multi_agent',
      'memories',
      'workspace_dependencies',
      'browser_use',
      'browser_use_external',
      'computer_use',
      'image_generation',
      'remote_plugin',
      'skill_search',
      'skill_mcp_dependency_install',
    ].map((name) => 'features.' + name + '=false'),
  ];
}

// Full native tools need a containment backend that survives detached forks.
// No such backend is verified here; do not inspect login state or launch the CLI.
export async function preflightCodex(
  binary = '/opt/homebrew/bin/codex',
  _observeStartup = false,
  model = 'gpt-6.1-sol',
) {
  return {
    schema: 1,
    observedAt: new Date().toISOString(),
    cli: { path: binary, version: 'unavailable', binaryHash: null },
    candidateModel: model,
    authRoute: 'unverified',
    modelRequests: 0,
    startup: null,
    preflight: nativeContainmentPreflight(),
    startupHash: digest({ binary, model, containment: 'unavailable' }),
    permissionsHash: digest({ containment: 'unavailable' }),
    loading: 'unverified',
    note: 'Native tool execution is blocked before CLI, auth and model startup: no verified full process-tree containment backend is available. Process-group cleanup does not contain detached descendants.',
  };
}

export function toml(value: unknown): string {
  if (value && typeof value === 'object' && !Array.isArray(value))
    return (
      '{' +
      Object.entries(value)
        .map(([key, item]) => JSON.stringify(key) + ' = ' + toml(item))
        .join(', ') +
      '}'
    );
  return JSON.stringify(value);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const output = process.argv[2];
  if (!output) throw new Error('Pass a new private output JSON path.');
  const result = await preflightCodex(
    '/opt/homebrew/bin/codex',
    process.argv[3] === '--observe-startup',
    process.argv[4] || 'gpt-6.1-sol',
  );
  await writeEvalArtifact(output, result);
  process.stdout.write(JSON.stringify(result, null, 2) + '\n');
}
