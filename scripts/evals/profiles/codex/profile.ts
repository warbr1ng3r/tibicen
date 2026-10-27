import path from 'node:path';
import { readFile, realpath, mkdir } from 'node:fs/promises';
import { assert, hashContent } from '../../../core/contracts.ts';
import { nativeContainmentPreflight } from '../../node-check-containment.ts';
import { validatePreflight } from '../../contracts.ts';
import { codexPermissions, controlledCodexConfig, toml } from './preflight.ts';
import type {
  NativeFailureDiagnostics,
  NativePermissions,
  NativeProfile,
} from '../contracts.ts';

// Published error codes only; an unknown server string must not enter diagnostics.
const errorCodes = new Set([
  'rate_limit_exceeded',
  'insufficient_quota',
  'usage_limit_reached',
  'slow_down',
  'credit_balance_exhausted',
  'organization_spend_limit_exceeded',
  'project_spend_limit_exceeded',
  'organization_usage_limit_exceeded',
  'server_is_overloaded',
]);

function failureDiagnostics(
  records: Record<string, unknown>[],
  stderr: string,
): NativeFailureDiagnostics {
  const result: NativeFailureDiagnostics = {
    httpStatus: null,
    serverCode: null,
    retryAfterSeconds: null,
    requestIdHash: null,
    internalRetryCount: null,
  };
  const object = (value: unknown): Record<string, unknown> =>
    value && typeof value === 'object' && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};
  const number = (value: unknown, min: number, max: number) => {
    if (
      typeof value !== 'number' &&
      !(typeof value === 'string' && /^\d+(?:\.\d+)?$/.test(value))
    )
      return null;
    const numeric = Number(value);
    return Number.isFinite(numeric) && numeric >= min && numeric <= max
      ? numeric
      : null;
  };
  const read = (value: Record<string, unknown>, source: string) => {
    const status = number(value.status ?? value.status_code, 400, 599);
    if (status !== null && Number.isInteger(status))
      result.httpStatus ??= { value: status, source };
    const code = value.code ?? value.type;
    if (typeof code === 'string' && errorCodes.has(code))
      result.serverCode ??= { value: code, source };
    const seconds = number(
      value.retry_after ?? value.retry_after_seconds,
      0,
      604800,
    );
    if (seconds !== null)
      result.retryAfterSeconds ??= { value: seconds, source };
    const requestId = value.request_id;
    if (
      typeof requestId === 'string' &&
      requestId.trim().length > 0 &&
      requestId.length <= 512
    )
      result.requestIdHash ??= { value: hashContent(requestId), source };
  };
  const headers = (value: unknown, source: string) => {
    const entries = Object.entries(object(value));
    const header = (name: string) =>
      entries.find(([key]) => key.toLowerCase() === name)?.[1];
    read(
      {
        status: header(':status'),
        code: header('x-error-code'),
        retry_after: header('retry-after'),
        request_id: header('x-request-id'),
      },
      source,
    );
  };
  const message = (
    value: unknown,
    source: 'terminal-message' | 'stderr-message',
  ) => {
    if (typeof value !== 'string') return;
    const identify = (text: unknown) => {
      if (typeof text !== 'string') return;
      // A matched provider message is evidence of text, not a trusted error cause.
      if (
        /^The '[A-Za-z0-9][A-Za-z0-9._:-]{0,127}' model is not supported when using Codex with a ChatGPT account\.$/.test(
          text,
        )
      )
        result.messageId ??= { value: 'model-unsupported-chatgpt', source };
      if (source === 'stderr-message') {
        if (text.startsWith('Error loading config.toml:'))
          result.messageId ??= { value: 'config-load', source };
        if (
          /^Error: Model provider `[A-Za-z0-9][A-Za-z0-9._:-]{0,127}` not found$/.test(
            text,
          )
        )
          result.messageId ??= { value: 'provider-not-found', source };
      }
    };
    identify(value);
    try {
      const parsed = object(JSON.parse(value));
      // BadRequest can forward a JSON body. Inspect only its defined error fields.
      read(parsed, source);
      read(object(parsed.error), source);
      identify(parsed.detail);
      identify(object(parsed.error).message);
      return;
    } catch {
      // Non-JSON CLI text keeps the existing bounded hint parsing below.
    }
    read(
      {
        status:
          /\b(?:HTTP(?:\/[\d.]+)?(?:\s+status)?|(?:last\s+)?status(?:\s+code)?)\s*[:=]?\s*([^\s"',;}\]]+)/i.exec(
            value,
          )?.[1],
        code: /\b(?:error[_ -]?code|code)["']?\s*[:=]\s*["']?([^\s"',;}\]]+)/i.exec(
          value,
        )?.[1],
        retry_after:
          /\bretry[-_ ]after(?:[-_ ]seconds)?["']?\s*[:=]\s*["']?([^\s"',;}\]]+)/i.exec(
            value,
          )?.[1],
        request_id:
          /\b(?:x-request-id|request[_ -]?id)["']?\s*[:=]\s*["']?([^\s"',;}\]]+)/i.exec(
            value,
          )?.[1],
      },
      source,
    );
  };
  const errors = records.filter((record) =>
    ['error', 'turn.failed'].includes(String(record.type)),
  );
  for (const record of errors)
    for (const value of [record, object(record.error)]) {
      read(value, 'terminal-record');
      headers(value.headers, 'terminal-record');
    }
  for (const record of errors) {
    message(record.message, 'terminal-message');
    message(object(record.error).message, 'terminal-message');
  }
  const lines = stderr.split(/\r?\n/);
  for (const line of lines) {
    const status = /^HTTP\/[\d.]+\s+([45]\d{2})(?:\s|$)/i.exec(line)?.[1];
    read({ status }, 'stderr-header');
    const header =
      /^(retry-after|x-request-id|x-error-code)\s*:\s*(.*?)\s*$/i.exec(line);
    if (header) headers({ [header[1]]: header[2] }, 'stderr-header');
  }
  for (const line of lines) message(line, 'stderr-message');
  return result;
}

export function parseCodex(output: string, stderr = '') {
  const records = output
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as Record<string, unknown>);
  assert(
    records.every((record) => record && typeof record.type === 'string'),
    'invalid-native-output',
    'Expected Codex JSONL records.',
  );
  const items = records
    .filter((record) => record.type === 'item.completed')
    .map((record) => record.item as Record<string, unknown>);
  const turns = records.filter((record) => record.type === 'turn.completed'),
    usage =
      turns.length === 1
        ? (turns[0].usage as Record<string, unknown>)
        : undefined;
  const count = (key: string) =>
    usage && Number.isSafeInteger(usage[key]) && Number(usage[key]) >= 0
      ? Number(usage[key])
      : null;
  const diagnostics = failureDiagnostics(records, stderr);
  return {
    records: records
      .filter(
        (record) =>
          ['error', 'turn.failed', 'turn.completed'].includes(
            String(record.type),
          ) ||
          (record.type === 'item.completed' &&
            ['agent_message', 'command_execution', 'file_change'].includes(
              String((record.item as Record<string, unknown>)?.type),
            )),
      )
      .map((record) =>
        ['error', 'turn.failed'].includes(String(record.type))
          ? {
              type: record.type,
              detailHash: hashContent(JSON.stringify(record)),
            }
          : record,
      ),
    messages: items
      .filter((item) => item?.type === 'agent_message')
      .map((item) => String(item.text)),
    started: records.some((record) => record.type === 'turn.started'),
    completed: turns.length === 1,
    commands: items
      .filter((item) => item?.type === 'command_execution')
      .map((item) => ({
        command: item.command,
        output: String(item.aggregated_output),
        exitCode: typeof item.exit_code === 'number' ? item.exit_code : null,
        toolUseId: String(item.id),
      })),
    usage: {
      inputTokens: count('input_tokens'),
      outputTokens: count('output_tokens'),
    },
    diagnostics,
  };
}

export async function loadCodexProfile(
  filename: string,
): Promise<NativeProfile> {
  const cached = JSON.parse(await readFile(filename, 'utf8'));
  return {
    state: 'blocked',
    preflight: nativeContainmentPreflight(),
    specification: {
      id: 'codex-blocked',
      agent: 'codex',
      version: 'unavailable',
      model: 'unavailable',
      auth: 'none',
      paid: false,
      startupHash: hashContent(JSON.stringify(cached)),
      permissionsHash: hashContent('native-process-containment-unavailable'),
    },
  };
}

// Code-only test seam. Never select this loader from serialized profile/config data.
// shortcut: fixture commands are trusted and group-supervised, replace with verified
// full-tree containment before enabling any real native executable.
export async function loadTrustedCodexFixture(
  filename: string,
): Promise<NativeProfile> {
  const ready = JSON.parse(await readFile(filename, 'utf8')),
    preflight = validatePreflight(ready.preflight);
  const model = ready.candidateModel,
    profileId = typeof model === 'string' ? 'codex-0.157.0-' + model : '';
  assert(
    preflight.status === 'ready' &&
      ready.cli.version === 'codex-cli 0.157.0' &&
      typeof model === 'string' &&
      /^[a-zA-Z0-9][a-zA-Z0-9._:-]*$/.test(model) &&
      profileId.length <= 160,
    'native-preflight-required',
    'Use the observed Codex profile.',
  );
  const binary = await realpath(ready.cli.path);
  assert(
    hashContent(await readFile(binary)) === ready.cli.binaryHash,
    'native-cli-changed',
    'CLI changed after preflight.',
  );
  const specification = {
    id: profileId,
    agent: 'codex',
    version: '0.157.0',
    model,
    auth: 'none' as const,
    paid: false,
    startupHash: ready.startupHash,
    permissionsHash: ready.permissionsHash,
  };
  const environment = (home: string) => ({
    PATH: path.dirname(process.execPath) + ':/usr/bin:/bin',
    HOME: home,
    CODEX_HOME: path.join(home, '.codex'),
    TMPDIR: path.join(home, 'tmp'),
    OPENSPEC_TELEMETRY: '0',
    DO_NOT_TRACK: '1',
    CI: '1',
  });
  const policy = (input: NativePermissions) => {
    const permissions = codexPermissions(
      input.root,
      input.home,
      input.privateRoot,
    );
    for (const root of input.read) permissions.filesystem[root] = 'read';
    for (const root of input.write) permissions.filesystem[root] = 'write';
    for (const root of input.deny) permissions.filesystem[root] = 'deny';
    return permissions;
  };
  return {
    state: 'ready',
    specification,
    preflight,
    projectSkillRoots: ['.agents'],
    skillPath: (home) => path.join(home, '.agents/skills'),
    starts: (record) => record.type === 'turn.started',
    parse: parseCodex,
    prepare: async (home) => {
      await mkdir(path.join(home, '.codex'), { recursive: true });
    },
    invocation: (input) => ({
      executable: binary,
      cwd: input.root,
      env: environment(input.home),
      argv: [
        '--no-daemon',
        'exec',
        '--ignore-user-config',
        '--ignore-rules',
        '--strict-config',
        '--ephemeral',
        '--json',
        '--skip-git-repo-check',
        '--cd',
        input.root,
        '--model',
        specification.model,
        ...(input.schema ? ['--output-schema', input.schema] : []),
        ...[
          'default_permissions="evaluation"',
          'permissions.evaluation=' + toml(policy(input)),
          ...controlledCodexConfig(input.home, input.environment),
        ].flatMap((value) => ['-c', value]),
        '-',
      ],
    }),
    check: (input, executable, argv) => ({
      executable: binary,
      cwd: input.root,
      // Sandbox checks need an existing CLI home, without model authorization.
      env: { ...environment(input.home), CODEX_HOME: input.home },
      argv: [
        'sandbox',
        '--permission-profile',
        'evaluation',
        '-c',
        'permissions.evaluation=' + toml(policy(input)),
        '-C',
        input.root,
        executable,
        ...argv,
      ],
    }),
  };
}
