import { assert, hashContent } from '../core/contracts.ts';
import {
  isSensitiveInspectionPath,
  validateRelativePath,
} from '../core/paths.ts';
import { parseMcpJson, validateMcpConfig } from './index.ts';
import { isHarnessId } from '../agents/profiles.ts';
import { parseVibeToml } from './vibe-toml.ts';

const NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/;
const ENV = /^[A-Za-z_][A-Za-z0-9_]*$/;
type Data = Record<string, unknown>;
type Availability = 'available' | 'missing' | 'unverified';
const FORMATS = [
  'claude-code-json',
  'cursor-json',
  'gemini-cli-json',
  'opencode-v2',
  'zcode-native-json',
  'zcode-shared-json',
  'kimi-code-json',
  'mistral-vibe-toml',
  'stdio-observation',
] as const;
type Format = (typeof FORMATS)[number];
const DEFAULT_FORMATS: Record<string, Format> = {
  'claude-code': 'claude-code-json',
  cursor: 'cursor-json',
  'gemini-cli': 'gemini-cli-json',
};
interface Observation {
  sourceHash: string;
  state: 'stdio' | 'disabled' | 'unknown';
  envNames: string[];
}

export interface McpDiagnosisRequest {
  agent: string;
  agentVersion?: string;
  server: string;
  format?: string;
  sources: { path: string; observation?: Observation }[];
  effectiveSource?: string;
  launch?: {
    targetContextKnown?: boolean;
    availableEnvNames?: string[];
    executableAvailable?: boolean;
    cwdAvailable?: boolean;
  };
}

function object(value: unknown): value is Data {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function check(condition: unknown): asserts condition {
  assert(condition, 'invalid-mcp-diagnosis', 'Invalid MCP diagnosis metadata.');
}

function keys(value: Data, allowed: string[]) {
  check(Object.keys(value).every((key) => allowed.includes(key)));
}

function printable(value: string) {
  return (
    value.length > 0 &&
    [...value].every((character) => {
      const code = character.codePointAt(0)!;
      return code >= 32 && (code < 127 || code > 159);
    })
  );
}

export function validateMcpDiagnosisRequest(
  input: unknown,
): McpDiagnosisRequest {
  check(object(input));
  keys(input, [
    'agent',
    'agentVersion',
    'server',
    'format',
    'sources',
    'effectiveSource',
    'launch',
  ]);
  check(isHarnessId(input.agent));
  check(typeof input.server === 'string' && NAME.test(input.server));
  for (const key of ['agentVersion', 'format'] as const)
    if (input[key] !== undefined)
      check(
        typeof input[key] === 'string' &&
          input[key].length <= 80 &&
          printable(input[key]) &&
          input[key].trim() === input[key],
      );
  check(
    Array.isArray(input.sources) &&
      input.sources.length > 0 &&
      input.sources.length <= 4,
  );
  const paths = new Set<string>();
  for (const source of input.sources) {
    check(object(source));
    keys(source, ['path', 'observation']);
    check(
      typeof source.path === 'string' &&
        source.path.length <= 4096 &&
        printable(source.path),
    );
    try {
      validateRelativePath(source.path);
      check(!isSensitiveInspectionPath(source.path));
    } catch {
      check(false);
    }
    check(!paths.has(source.path));
    paths.add(source.path);
    if (source.observation !== undefined) {
      check(input.format === 'stdio-observation' && object(source.observation));
      keys(source.observation, ['sourceHash', 'state', 'envNames']);
      check(
        typeof source.observation.sourceHash === 'string' &&
          /^[a-f0-9]{64}$/.test(source.observation.sourceHash) &&
          typeof source.observation.state === 'string' &&
          ['stdio', 'disabled', 'unknown'].includes(source.observation.state),
      );
      check(
        Array.isArray(source.observation.envNames) &&
          source.observation.envNames.length <= 256 &&
          source.observation.envNames.every(
            (name) =>
              typeof name === 'string' && name.length <= 256 && ENV.test(name),
          ) &&
          (source.observation.state === 'stdio' ||
            source.observation.envNames.length === 0),
      );
    }
  }
  if (input.effectiveSource !== undefined)
    check(
      typeof input.effectiveSource === 'string' &&
        paths.has(input.effectiveSource),
    );
  if (input.launch !== undefined) {
    check(object(input.launch));
    keys(input.launch, [
      'targetContextKnown',
      'availableEnvNames',
      'executableAvailable',
      'cwdAvailable',
    ]);
    for (const key of [
      'targetContextKnown',
      'executableAvailable',
      'cwdAvailable',
    ])
      check(
        input.launch[key] === undefined ||
          typeof input.launch[key] === 'boolean',
      );
    if (input.launch.availableEnvNames !== undefined)
      check(
        Array.isArray(input.launch.availableEnvNames) &&
          input.launch.availableEnvNames.length <= 256 &&
          input.launch.availableEnvNames.every(
            (name) => typeof name === 'string' && ENV.test(name),
          ),
      );
  }
  return input as unknown as McpDiagnosisRequest;
}

interface Candidate {
  path: string;
  status:
    | 'valid-stdio'
    | 'reported-stdio'
    | 'disabled'
    | 'not-found'
    | 'unverified'
    | 'manual-action-required';
  reason?: string;
  envNames: string[];
  basis: 'parsed-format' | 'caller-observation' | 'unverified';
}

function observe(
  source: McpDiagnosisRequest['sources'][number],
  text?: string,
): Candidate {
  const result: Candidate = {
    path: source.path,
    status: 'unverified',
    envNames: [],
    basis: 'unverified',
  };
  if (text === undefined) return { ...result, reason: 'source-unavailable' };
  if (typeof text !== 'string' || Buffer.byteLength(text) > 1024 * 1024)
    return { ...result, reason: 'unsupported-config-format' };
  if (!source.observation) return { ...result, reason: 'observation-required' };
  if (hashContent(text) !== source.observation.sourceHash)
    return { ...result, reason: 'observation-source-changed' };
  const observed = { ...result, basis: 'caller-observation' as const };
  if (source.observation.state === 'disabled')
    return {
      ...observed,
      status: 'disabled',
      reason: 'disabled-in-supplied-observation',
    };
  if (source.observation.state === 'unknown')
    return {
      ...observed,
      status: 'manual-action-required',
      reason: 'caller-observation-unknown',
    };
  return {
    ...observed,
    status: 'reported-stdio',
    envNames: [...new Set(source.observation.envNames)].sort(),
  };
}

function references(agent: string, value: string): string[] | null {
  if (/\{file:|\$\{file:/.test(value)) return null;
  const pattern =
    agent === 'opencode'
      ? /\{env:([A-Za-z_][A-Za-z0-9_]*)\}/g
      : /\$(?:\{([A-Za-z_][A-Za-z0-9_]*)\}|([A-Za-z_][A-Za-z0-9_]*))/g;
  const matches = [...value.matchAll(pattern)];
  const remaining = value.replace(pattern, '');
  if (
    agent === 'opencode'
      ? remaining.includes('{env:')
      : remaining.includes('${')
  )
    return null;
  if (agent === 'gemini-cli' && /%[A-Za-z_][A-Za-z0-9_]*%/.test(value))
    return null;
  return matches.map((match) => match[1] ?? match[2]);
}

function timeout(value: unknown) {
  return (
    object(value) &&
    Object.entries(value).every(
      ([key, milliseconds]) =>
        ['startup', 'catalog', 'execution'].includes(key) &&
        typeof milliseconds === 'number' &&
        Number.isSafeInteger(milliseconds) &&
        milliseconds > 0,
    )
  );
}

function inspectNative(
  request: McpDiagnosisRequest,
  format: Format,
  data: Data,
  result: Candidate,
): Candidate {
  const manual = (reason: string) => ({ ...result, reason });
  const vibe = format === 'mistral-vibe-toml';
  const kimi = format === 'kimi-code-json';
  let records: unknown = data.mcpServers;
  if (format === 'zcode-native-json') {
    if (data.mcp !== undefined && !object(data.mcp))
      return manual('unsupported-config-format');
    records = (data.mcp as Data | undefined)?.servers;
  }
  let server: unknown;
  if (vibe) {
    records = data.mcp_servers;
    if (records !== undefined && !Array.isArray(records))
      return manual('unsupported-config-format');
    if (Array.isArray(records)) {
      if (
        records.some((item) => !object(item) || typeof item.name !== 'string')
      )
        return manual('unsupported-config-format');
      const named = (records as Data[]).filter(
        (item) =>
          String(item.name)
            .replace(/[^A-Za-z0-9_-]/g, '_')
            .replace(/^[_-]+|[_-]+$/g, '')
            .slice(0, 256) === request.server,
      );
      if (
        named.length > 1 ||
        (named.length === 1 && named[0].name !== request.server)
      )
        return manual('unsupported-server-name');
      server = named[0];
    }
  } else {
    if (records !== undefined && !object(records))
      return manual('unsupported-config-format');
    if (object(records) && Object.hasOwn(records, request.server))
      server = records[request.server];
  }
  if (server === undefined) return { ...result, status: 'not-found' };
  if (!object(server)) return manual('unsupported-config-format');
  if (
    server.url !== undefined ||
    server.httpUrl !== undefined ||
    (server.transport !== undefined && server.transport !== 'stdio') ||
    (server.type !== undefined && server.type !== 'stdio')
  )
    return manual('unsupported-mcp-transport');
  const allowed = vibe
    ? [
        'name',
        'transport',
        'command',
        'args',
        'env',
        'cwd',
        'disabled',
        'disabled_tools',
        'startup_timeout_sec',
        'tool_timeout_sec',
      ]
    : kimi
      ? [
          'command',
          'args',
          'env',
          'cwd',
          'transport',
          'enabled',
          'environment_id',
          'startupTimeoutMs',
          'toolTimeoutMs',
          'enabledTools',
          'disabledTools',
          'deferred',
        ]
      : ['command', 'args', 'env', 'enable'];
  if (Object.keys(server).some((key) => !allowed.includes(key)))
    return manual('unsupported-server-fields');
  const disableKey = vibe ? 'disabled' : kimi ? 'enabled' : 'enable';
  if (
    server[disableKey] !== undefined &&
    typeof server[disableKey] !== 'boolean'
  )
    return manual('unsupported-config-format');
  for (const key of ['deferred'])
    if (server[key] !== undefined && typeof server[key] !== 'boolean')
      return manual('unsupported-config-format');
  for (const key of ['disabled_tools', 'enabledTools', 'disabledTools'])
    if (
      server[key] !== undefined &&
      (!Array.isArray(server[key]) ||
        !(server[key] as unknown[]).every((item) => typeof item === 'string'))
    )
      return manual('unsupported-config-format');
  for (const key of [
    'startupTimeoutMs',
    'toolTimeoutMs',
    'startup_timeout_sec',
    'tool_timeout_sec',
  ]) {
    const value = server[key];
    if (
      value !== undefined &&
      (typeof value !== 'number' ||
        !Number.isFinite(value) ||
        value <= 0 ||
        (kimi && (!Number.isInteger(value) || value > 2147483647)))
    )
      return manual('unsupported-config-format');
  }
  if (
    server.environment_id !== undefined &&
    (typeof server.environment_id !== 'string' || !server.environment_id.trim())
  )
    return manual('unsupported-config-format');
  if (
    server.env !== undefined &&
    (!object(server.env) ||
      Object.entries(server.env).some(
        ([name, value]) => !ENV.test(name) || typeof value !== 'string',
      ))
  )
    return manual('unsupported-config-format');
  if (
    (vibe && server.disabled === true) ||
    (!vibe && server[disableKey] === false)
  )
    return {
      ...result,
      status: 'disabled',
      reason: 'disabled-in-supplied-source',
    };
  if (
    kimi &&
    server.environment_id !== undefined &&
    server.environment_id !== 'local'
  )
    return manual('unsupported-launch-environment');
  const command =
    vibe && Array.isArray(server.command) ? server.command : [server.command];
  if (
    !command.length ||
    command.some((item) => typeof item !== 'string' || /[\0\r\n]/.test(item)) ||
    !(command[0] as string).trim() ||
    (server.args !== undefined &&
      (!Array.isArray(server.args) ||
        !server.args.every(
          (item) => typeof item === 'string' && !/\0/.test(item),
        ))) ||
    (server.cwd !== undefined &&
      (typeof server.cwd !== 'string' ||
        !server.cwd.trim() ||
        /[\0\r\n]/.test(server.cwd))) ||
    (vibe && server.transport !== 'stdio')
  )
    return manual('unsupported-config-format');
  if (object(server.env) && Object.keys(server.env).length > 0)
    return manual('inline-environment-values');
  return { ...result, status: 'valid-stdio' };
}

function inspect(
  request: McpDiagnosisRequest,
  format: Format,
  sourcePath: string,
  text?: string,
): Candidate {
  const result: Candidate = {
    path: sourcePath,
    status: 'manual-action-required',
    envNames: [],
    basis: 'unverified',
  };
  const manual = (reason: string) => ({ ...result, reason });
  if (text === undefined)
    return { ...result, status: 'unverified', reason: 'source-unavailable' };
  let data: Data;
  try {
    data =
      format === 'mistral-vibe-toml'
        ? parseVibeToml(text)
        : (parseMcpJson(text).data as unknown as Data);
  } catch {
    return manual('unsupported-config-format');
  }
  result.basis = 'parsed-format';
  if (
    [
      'zcode-native-json',
      'zcode-shared-json',
      'kimi-code-json',
      'mistral-vibe-toml',
    ].includes(format)
  )
    return inspectNative(request, format, data, result);
  const reader =
    format === 'opencode-v2'
      ? 'opencode'
      : format === 'gemini-cli-json'
        ? 'gemini-cli'
        : format === 'cursor-json'
          ? 'cursor'
          : 'claude-code';
  let records = data.mcpServers;
  if (reader === 'opencode') {
    if (data.mcp !== undefined && !object(data.mcp))
      return manual('unsupported-config-format');
    records = (data.mcp as Data | undefined)?.servers;
    if (
      object(data.mcp) &&
      Object.keys(data.mcp).some((key) => !['servers', 'timeout'].includes(key))
    )
      return manual('unsupported-config-format');
    if (
      object(data.mcp) &&
      data.mcp.timeout !== undefined &&
      !timeout(data.mcp.timeout)
    )
      return manual('unsupported-config-format');
  }
  if (records !== undefined && !object(records))
    return manual('unsupported-config-format');
  if (!records || !Object.hasOwn(records, request.server))
    return { ...result, status: 'not-found' };
  const server = records[request.server];
  if (!object(server)) return manual('unsupported-config-format');
  if (
    server.url !== undefined ||
    server.httpUrl !== undefined ||
    server.type === 'remote' ||
    (server.type !== undefined &&
      !['stdio', 'local'].includes(String(server.type)))
  )
    return manual('unsupported-mcp-transport');
  if (reader === 'opencode' && server.disabled === true)
    return {
      ...result,
      status: 'disabled',
      reason: 'disabled-in-supplied-source',
    };
  if (reader === 'gemini-cli' && data.mcp !== undefined) {
    if (!object(data.mcp)) return manual('unsupported-config-format');
    for (const key of ['allowed', 'excluded'])
      if (
        data.mcp[key] !== undefined &&
        (!Array.isArray(data.mcp[key]) ||
          !(data.mcp[key] as unknown[]).every(
            (name) => typeof name === 'string' && NAME.test(name),
          ))
      )
        return manual('unsupported-config-format');
    if (data.mcp.serverCommand !== undefined)
      return manual('unsupported-server-command');
    if (
      (data.mcp.excluded as string[] | undefined)?.includes(request.server) ||
      (Array.isArray(data.mcp.allowed) &&
        !data.mcp.allowed.includes(request.server))
    )
      return {
        ...result,
        status: 'disabled',
        reason: 'excluded-by-supplied-policy',
      };
  }
  const legacy = reader === 'claude-code' || reader === 'cursor';
  const allowed = legacy
    ? ['type', 'command', 'args', 'env']
    : reader === 'gemini-cli'
      ? [
          'command',
          'args',
          'env',
          'cwd',
          'timeout',
          'trust',
          'includeTools',
          'excludeTools',
        ]
      : [
          'type',
          'command',
          'environment',
          'cwd',
          'disabled',
          'codemode',
          'timeout',
          'protocol',
          'pool',
        ];
  if (Object.keys(server).some((key) => !allowed.includes(key)))
    return manual('unsupported-server-fields');
  for (const key of ['trust', 'codemode', 'pool'])
    if (server[key] !== undefined && typeof server[key] !== 'boolean')
      return manual('unsupported-config-format');
  for (const key of ['includeTools', 'excludeTools'])
    if (
      server[key] !== undefined &&
      (!Array.isArray(server[key]) ||
        !(server[key] as unknown[]).every((tool) => typeof tool === 'string'))
    )
      return manual('unsupported-config-format');
  if (
    server.timeout !== undefined &&
    (reader === 'opencode'
      ? !timeout(server.timeout)
      : typeof server.timeout !== 'number' ||
        !Number.isSafeInteger(server.timeout) ||
        server.timeout <= 0)
  )
    return manual('unsupported-config-format');
  if (
    server.protocol !== undefined &&
    !['legacy', 'auto', '2026-07-28'].includes(String(server.protocol))
  )
    return manual('unsupported-config-format');
  const command =
    reader === 'opencode'
      ? server.command
      : [server.command, ...(Array.isArray(server.args) ? server.args : [])];
  if (
    !Array.isArray(command) ||
    !command.length ||
    command.some((value) => typeof value !== 'string' || /\0/.test(value)) ||
    !(command[0] as string).trim() ||
    /[\r\n]/.test(command[0] as string) ||
    (reader === 'opencode'
      ? server.type !== 'local' ||
        (server.disabled !== undefined && typeof server.disabled !== 'boolean')
      : server.args !== undefined && !Array.isArray(server.args))
  )
    return manual('unsupported-config-format');
  if (
    server.cwd !== undefined &&
    (typeof server.cwd !== 'string' ||
      !server.cwd.trim() ||
      /[\0\r\n]/.test(server.cwd))
  )
    return manual('unsupported-config-format');
  if (
    [...command, ...(server.cwd === undefined ? [] : [server.cwd])].some(
      (value) => /\{file:|\$\{file:/.test(value as string),
    )
  )
    return manual('unsupported-file-reference');
  const environment = reader === 'opencode' ? server.environment : server.env;
  if (environment !== undefined && !object(environment))
    return manual('unsupported-config-format');
  if (legacy) {
    if (
      Object.entries(environment ?? {}).some(
        ([name, value]) =>
          !ENV.test(name) ||
          typeof value !== 'string' ||
          !/^\$\{(?:env:)?[A-Za-z_][A-Za-z0-9_]*\}$/.test(value),
      )
    )
      return manual('inline-environment-values');
    const checked = validateMcpConfig(reader, text);
    const entry = checked.servers?.find((item) => item.name === request.server);
    if (checked.status || !entry || entry.status === 'manual-action-required')
      return manual(
        checked.reason ?? entry?.reason ?? 'unsupported-config-format',
      );
    return { ...result, status: 'valid-stdio', envNames: entry.envNames ?? [] };
  }
  const names = new Set<string>();
  for (const [name, value] of Object.entries(environment ?? {})) {
    if (!ENV.test(name) || typeof value !== 'string')
      return manual('unsupported-config-format');
    const found = references(reader, value);
    if (found === null) return manual('unsupported-env-reference');
    // Literal environment values stay outside the supported diagnostic contract.
    if (
      !found.length ||
      value.replace(
        reader === 'opencode'
          ? /\{env:[A-Za-z_][A-Za-z0-9_]*\}/g
          : /\$(?:\{[A-Za-z_][A-Za-z0-9_]*\}|[A-Za-z_][A-Za-z0-9_]*)/g,
        '',
      ).length
    )
      return manual('inline-environment-values');
    found.forEach((name) => names.add(name));
  }
  if (reader === 'opencode') {
    for (const value of [
      ...command,
      ...(server.cwd === undefined ? [] : [server.cwd]),
    ]) {
      const found = references(reader, value as string);
      if (found === null) return manual('unsupported-env-reference');
      found.forEach((name) => names.add(name));
    }
  }
  return { ...result, status: 'valid-stdio', envNames: [...names].sort() };
}

export function diagnoseMcp(input: unknown, configs: Map<string, string>) {
  const request = validateMcpDiagnosisRequest(input);
  check(configs instanceof Map);
  const format =
    request.format ??
    (Object.hasOwn(DEFAULT_FORMATS, request.agent)
      ? DEFAULT_FORMATS[request.agent]
      : undefined);
  const supported = FORMATS.includes(format as Format);
  const candidates = request.sources.map((source) =>
    format === 'stdio-observation'
      ? observe(source, configs.get(source.path))
      : supported
        ? inspect(
            request,
            format as Format,
            source.path,
            configs.get(source.path),
          )
        : {
            path: source.path,
            status: 'manual-action-required' as const,
            reason: 'unsupported-harness-format',
            envNames: [],
            basis: 'unverified' as const,
          },
  );
  const found = candidates.filter((candidate) =>
    [
      'valid-stdio',
      'reported-stdio',
      'disabled',
      'manual-action-required',
    ].includes(candidate.status),
  );
  const selected = request.effectiveSource
    ? candidates.find((candidate) => candidate.path === request.effectiveSource)
    : found.length === 1 &&
        candidates.every((candidate) => candidate.status !== 'unverified')
      ? found[0]
      : undefined;
  const sourceStatus = selected
    ? selected.status === 'not-found'
      ? 'not-found'
      : selected.status === 'unverified'
        ? 'source-unverified'
        : 'selected'
    : candidates.every((candidate) => candidate.status === 'not-found')
      ? 'not-found'
      : 'source-unverified';
  const configuration = selected ?? {
    status: 'unverified',
    reason: 'source-unverified',
    envNames: [],
    basis: 'unverified',
  };
  const known =
    request.launch?.targetContextKnown === true &&
    ['valid-stdio', 'reported-stdio'].includes(selected?.status ?? '');
  const availability = (value?: boolean): Availability =>
    known && value !== undefined
      ? value
        ? 'available'
        : 'missing'
      : 'unverified';
  const environmentKnown =
    known && request.launch?.availableEnvNames !== undefined;
  const missingEnvNames = environmentKnown
    ? configuration.envNames.filter(
        (name) => !request.launch!.availableEnvNames!.includes(name),
      )
    : [];
  const writerPath =
    request.agent === 'claude-code' && format === 'claude-code-json'
      ? '.mcp.json'
      : request.agent === 'cursor' && format === 'cursor-json'
        ? '.cursor/mcp.json'
        : undefined;
  const repairable =
    request.effectiveSource &&
    selected &&
    selected.path === writerPath &&
    selected.reason === 'invalid-env-reference';
  const demonstratedProblem =
    known &&
    (request.launch?.executableAvailable === false ||
      request.launch?.cwdAvailable === false ||
      missingEnvNames.length > 0);
  return {
    schema: 1,
    agent: request.agent,
    ...(request.agentVersion ? { agentVersion: request.agentVersion } : {}),
    versionEvidence: request.agentVersion
      ? 'supplied-unverified'
      : 'not-supplied',
    server: request.server,
    format: format ?? 'unverified',
    formatEvidence: request.format
      ? 'caller-supplied'
      : format
        ? 'harness-default'
        : 'unverified',
    nativeActivation: 'unverified',
    source: {
      status: sourceStatus,
      basis: request.effectiveSource ? 'caller-supplied' : 'project-input-only',
      ...(selected ? { path: selected.path } : {}),
      candidates,
      overriddenPaths:
        request.effectiveSource &&
        selected &&
        !['not-found', 'unverified'].includes(selected.status)
          ? found
              .filter(
                (candidate) =>
                  candidate.path !== selected.path &&
                  ['valid-stdio', 'reported-stdio', 'disabled'].includes(
                    candidate.status,
                  ),
              )
              .map((candidate) => candidate.path)
          : [],
    },
    configuration: {
      status: configuration.status,
      basis: configuration.basis,
      ...(configuration.reason ? { reason: configuration.reason } : {}),
      envNames: configuration.envNames,
    },
    launch: {
      basis: known ? 'target-context-supplied' : 'unverified',
      executable: availability(request.launch?.executableAvailable),
      cwd: availability(request.launch?.cwdAvailable),
      environment: environmentKnown
        ? missingEnvNames.length
          ? 'missing'
          : 'available'
        : 'unverified',
      missingEnvNames,
    },
    connection: 'unverified',
    repair: {
      status: repairable
        ? 'supported-project-writer'
        : selected?.status === 'valid-stdio' && !demonstratedProblem
          ? 'no-repair-indicated'
          : 'manual-native-action',
      ...(repairable ? { path: writerPath } : {}),
      reason: repairable
        ? 'exact-approved-change-required'
        : demonstratedProblem
          ? missingEnvNames.length > 0
            ? 'target-environment-missing'
            : request.launch?.executableAvailable === false
              ? 'target-executable-unavailable'
              : 'target-cwd-unavailable'
          : selected?.status === 'disabled'
            ? 'preserve-disable-choice'
            : selected?.status === 'reported-stdio'
              ? 'observed-configuration-not-parsed'
              : 'native-source-and-connection-unverified',
    },
    followUp: [
      'Confirm the effective source and target launch context in the selected harness without exposing values.',
      'Native connection checks may launch the server and require execution trust.',
    ],
  };
}
