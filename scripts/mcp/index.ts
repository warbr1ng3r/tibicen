import type {
  McpServer,
  McpOptions,
  McpOperation,
  McpServerResult,
  McpResult,
  ManualAction,
  ManualFragment,
  Change,
} from '../core/types.ts';
import {
  assert,
  digest,
  hashContent,
  validateData,
} from '../core/contracts.ts';

const NAME = /^[a-zA-Z0-9][a-zA-Z0-9_.-]{0,63}$/;
const ENV = /^[A-Za-z_][A-Za-z0-9_]*$/;
interface SyntaxNode {
  type?: 'object';
  start: number;
  end: number;
  entries?: SyntaxEntry[];
}
interface SyntaxEntry {
  key: string;
  keyStart: number;
  value: SyntaxNode;
}
interface SyntaxObject extends SyntaxNode {
  entries: SyntaxEntry[];
}
interface McpConfig {
  mcpServers?: Record<
    string,
    {
      url?: string;
      command?: string;
      type?: string;
      args?: string[];
      env?: Record<string, string>;
    }
  >;
}
interface McpPlan {
  agent: string;
  path?: string;
  status?: string;
  reason?: string;
  changes: Change[];
  manualActions: ManualAction[];
  results?: McpServerResult[];
}

const PATHS: Record<string, string> = {
  'claude-code': '.mcp.json',
  cursor: '.cursor/mcp.json',
};

function specification(input: unknown): McpServer {
  const server = input as McpServer;
  assert(
    server &&
      NAME.test(server.name) &&
      typeof server.command === 'string' &&
      server.command.trim() &&
      !/[\0\r\n]/.test(server.command),
    'invalid-mcp',
    'A local executable and server name are required.',
  );
  assert(
    !server.url && (!server.type || server.type === 'stdio'),
    'unsupported-mcp-transport',
    'Only local stdio MCP is supported.',
  );
  assert(
    Array.isArray(server.args ?? []) &&
      (server.args ?? []).every(
        (arg) => typeof arg === 'string' && !arg.includes('\0'),
      ),
    'invalid-mcp',
    'MCP arguments must be an argv array.',
  );
  assert(
    Array.isArray(server.envNames ?? []) &&
      (server.envNames ?? []).every((name) => ENV.test(name)),
    'invalid-mcp',
    'Specify environment names, never their values.',
  );
  assert(
    !server.env && !server.headers && !server.envFile,
    'invalid-mcp',
    'Literal environment values and credential files are not accepted.',
  );
  return server;
}

function serverConfig(agent: string, input: unknown) {
  const server = specification(input);
  assert(
    [server.command, ...(server.args ?? [])].every((value) =>
      validReferences(agent, value),
    ),
    'invalid-env-reference',
    'Command references must use the target agent syntax.',
  );
  return {
    type: 'stdio',
    command: server.command,
    args: server.args ?? [],
    ...((server.envNames ?? []).length
      ? {
          env: Object.fromEntries(
            server.envNames!.map((name) => [
              name,
              agent === 'cursor' ? `\${env:${name}}` : `\${${name}}`,
            ]),
          ),
        }
      : {}),
  };
}

function validReferences(agent: string, text: string) {
  return [...text.matchAll(/\$\{([^}]+)\}/g)].every(([, name]) =>
    agent === 'cursor'
      ? /^(?:env:[A-Za-z_][A-Za-z0-9_]*|userHome|workspaceFolder|workspaceFolderBasename|pathSeparator|\/)$/.test(
          name,
        )
      : ENV.test(name),
  );
}

// Keep source spans so changing a server does not rewrite unrelated records or settings.
function parseConfig(text: string) {
  assert(
    typeof text === 'string' && Buffer.byteLength(text) <= 1024 * 1024,
    'invalid-mcp-format',
    'MCP config exceeds its supported size.',
  );
  let data: McpConfig;
  try {
    data = JSON.parse(text) as McpConfig;
    validateData(data);
  } catch {
    assert(
      false,
      'invalid-mcp-format',
      'Only unambiguous JSON MCP configs are supported.',
    );
  }
  assert(
    data && typeof data === 'object' && !Array.isArray(data),
    'invalid-mcp-format',
    'MCP config must be an object.',
  );
  let position = 0;
  const whitespace = () => {
    while (/\s/.test(text[position] ?? '') && position < text.length)
      position++;
  };
  const quoted = () => {
    const start = position++;
    while (position < text.length) {
      if (text[position] === '\\') {
        position += 2;
        continue;
      }
      if (text[position++] === '"') break;
    }
    return JSON.parse(text.slice(start, position));
  };
  function node(depth = 0): SyntaxNode {
    assert(depth < 40, 'invalid-mcp-format', 'MCP config nesting is too deep.');
    whitespace();
    const start = position,
      entries: SyntaxEntry[] = [];
    if (text[position] === '{') {
      position++;
      whitespace();
      const keys = new Set();
      while (text[position] !== '}') {
        const keyStart = position,
          key = quoted();
        assert(
          !keys.has(key),
          'invalid-mcp-format',
          'Duplicate JSON keys require manual resolution.',
        );
        keys.add(key);
        whitespace();
        position++;
        const value = node(depth + 1);
        entries.push({ key, keyStart, value });
        whitespace();
        if (text[position] !== ',') break;
        position++;
        whitespace();
      }
      position++;
      return { type: 'object', start, end: position, entries };
    }
    if (text[position] === '[') {
      position++;
      whitespace();
      while (text[position] !== ']') {
        node(depth + 1);
        whitespace();
        if (text[position] !== ',') break;
        position++;
        whitespace();
      }
      position++;
    } else if (text[position] === '"') quoted();
    else
      while (position < text.length && !/[\s,}\]]/.test(text[position]))
        position++;
    return { start, end: position };
  }
  const ast = node();
  if (data.mcpServers !== undefined)
    assert(
      data.mcpServers &&
        typeof data.mcpServers === 'object' &&
        !Array.isArray(data.mcpServers),
      'invalid-mcp-format',
      'mcpServers must be an object.',
    );
  return { data, ast: ast as SyntaxObject };
}

function containsLiteralSecret(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  return Object.entries(value).some(
    ([key, child]) =>
      (/token|password|api[_-]?key|secret|authorization|credential/i.test(
        key,
      ) &&
        typeof child === 'string' &&
        child.trim() &&
        !/\$\{[^}]+\}/.test(child)) ||
      containsLiteralSecret(child),
  );
}

function updateServer(text: string, name: string, config: unknown) {
  const { ast } = parseConfig(text);
  const serversProperty = ast.entries.find(
    (entry) => entry.key === 'mcpServers',
  );
  if (!serversProperty) {
    if (config === null) return text;
    const position = ast.end - 1;
    return `${text.slice(0, position)}${ast.entries.length ? ',' : ''}\n  "mcpServers": ${JSON.stringify({ [name]: config }, null, 2)}\n${text.slice(position)}`;
  }
  const object = serversProperty.value as SyntaxObject,
    index = object.entries.findIndex((entry) => entry.key === name);
  if (index < 0) {
    if (config === null) return text;
    const position = object.end - 1;
    return `${text.slice(0, position)}${object.entries.length ? ',' : ''}\n    ${JSON.stringify(name)}: ${JSON.stringify(config, null, 2)}\n${text.slice(position)}`;
  }
  const entry = object.entries[index];
  if (config !== null)
    return `${text.slice(0, entry.value.start)}${JSON.stringify(config, null, 2)}${text.slice(entry.value.end)}`;
  const start =
    index === object.entries.length - 1 && index > 0
      ? object.entries[index - 1].value.end
      : entry.keyStart;
  const end =
    index < object.entries.length - 1
      ? object.entries[index + 1].keyStart
      : entry.value.end;
  return text.slice(0, start) + text.slice(end);
}

function envStatus(
  names: string[],
  { availableEnvNames = [], targetContextKnown = false }: McpOptions = {},
) {
  if (!names.length) return 'configured-unverified';
  if (!targetContextKnown) return 'env-context-unverified';
  return names.every((name) => availableEnvNames.includes(name))
    ? 'configured-unverified'
    : 'no-key';
}

function manual(agent: string, reason: string): McpPlan {
  return {
    agent,
    status: 'manual-action-required',
    reason,
    changes: [],
    manualActions: [
      {
        id: `mcp-${agent}-manual`,
        status: 'pending',
        description:
          'Resolve the existing MCP config locally; do not share secret values.',
      },
    ],
  };
}

export function planMcpChanges(
  agent: string,
  existingText: string | null,
  operations: McpOperation[],
  options: McpOptions = {},
): McpPlan {
  assert(
    PATHS[agent],
    'unsupported-agent',
    'Use the manual TOML helper for Codex.',
  );
  assert(
    Array.isArray(operations),
    'invalid-mcp',
    'MCP operations must be an array.',
  );
  const original = existingText ?? '{}\n';
  let parsed;
  try {
    parsed = parseConfig(original);
  } catch {
    return manual(agent, 'unsupported-config-format');
  }
  if (containsLiteralSecret(parsed.data))
    return manual(agent, 'existing-inline-secret');
  let content = original;
  const results: McpServerResult[] = [],
    seen = new Set<string>();
  for (const operation of operations) {
    assert(
      NAME.test(operation.name) && !seen.has(operation.name),
      'invalid-mcp',
      'Each server needs one explicit operation.',
    );
    seen.add(operation.name);
    assert(
      ['upsert', 'remove'].includes(operation.action),
      'invalid-mcp',
      'Unsupported MCP operation.',
    );
    if (operation.action === 'remove') {
      content = updateServer(content, operation.name, null);
      results.push({ name: operation.name, status: 'disabled-by-user' });
    } else {
      const server = { ...operation.server, name: operation.name };
      content = updateServer(
        content,
        operation.name,
        serverConfig(agent, server),
      );
      results.push({
        name: operation.name,
        status: envStatus(server.envNames ?? [], options),
        envNames: server.envNames ?? [],
      });
    }
  }
  parseConfig(content);
  return {
    agent,
    path: PATHS[agent],
    results,
    changes:
      content === original
        ? []
        : [
            {
              path: PATHS[agent],
              action:
                existingText === null || existingText === undefined
                  ? 'add'
                  : 'modify',
              beforeHash:
                existingText === null || existingText === undefined
                  ? null
                  : hashContent(existingText),
              content,
              reason: 'Apply only the approved local MCP server records.',
            },
          ],
    manualActions: [],
  };
}

export function validateMcpConfig(
  agent: string,
  text: string,
  options: McpOptions = {},
): McpResult {
  assert(
    PATHS[agent],
    'unsupported-agent',
    'Only supported local JSON configs use this validator.',
  );
  let data;
  try {
    ({ data } = parseConfig(text));
  } catch {
    return {
      agent,
      status: 'manual-action-required',
      reason: 'unsupported-config-format',
      servers: [],
    };
  }
  if (containsLiteralSecret(data))
    return {
      agent,
      status: 'manual-action-required',
      reason: 'existing-inline-secret',
      servers: [],
    };
  const servers: McpServerResult[] = [];
  const reference =
    agent === 'cursor'
      ? /^\$\{env:([A-Za-z_][A-Za-z0-9_]*)\}$/
      : /^\$\{([A-Za-z_][A-Za-z0-9_]*)\}$/;
  for (const [name, server] of Object.entries(data.mcpServers ?? {})) {
    if (!server || typeof server !== 'object' || Array.isArray(server)) {
      servers.push({
        name,
        status: 'manual-action-required',
        reason: 'unsupported-config-format',
      });
      continue;
    }
    if (
      server.url ||
      !server.command ||
      (server.type && server.type !== 'stdio')
    ) {
      servers.push({
        name,
        status: 'manual-action-required',
        reason: 'unsupported-mcp-transport',
      });
      continue;
    }
    const names = [];
    let invalid =
      typeof server.command !== 'string' ||
      !Array.isArray(server.args ?? []) ||
      ![server.command, ...(server.args ?? [])].every(
        (value) => typeof value === 'string' && validReferences(agent, value),
      );
    for (const value of Object.values(server.env ?? {})) {
      const match = typeof value === 'string' && reference.exec(value);
      if (!match) invalid = true;
      else names.push(match[1]);
    }
    servers.push({
      name,
      status: invalid ? 'manual-action-required' : envStatus(names, options),
      ...(invalid ? { reason: 'invalid-env-reference' } : { envNames: names }),
    });
  }
  return { agent, servers };
}

export function mcpNeedsExecutionTrust(
  agent: string,
  before: string | null,
  after: string | null,
) {
  assert(
    PATHS[agent],
    'unsupported-agent',
    'Only supported local JSON configs use this validator.',
  );
  const previous = parseConfig(before ?? '{}').data,
    next = parseConfig(after ?? '{}').data;
  assert(
    !containsLiteralSecret(previous) && !containsLiteralSecret(next),
    'invalid-mcp-format',
    'Resolve literal credentials locally before changing MCP configuration.',
  );
  let changed = false;
  for (const [name, server] of Object.entries(next.mcpServers ?? {})) {
    if (
      Object.hasOwn(previous.mcpServers ?? {}, name) &&
      digest(server) === digest(previous.mcpServers![name])
    )
      continue;
    const checked = validateMcpConfig(
      agent,
      JSON.stringify({ mcpServers: { [name]: server } }),
    );
    assert(
      NAME.test(name) &&
        !checked.status &&
        checked.servers?.every(
          (item) => item.status !== 'manual-action-required',
        ),
      'invalid-mcp-format',
      'Changed MCP servers require the supported unambiguous local format.',
    );
    specification({
      ...server,
      name,
      env: undefined,
      envNames: Object.keys(server.env ?? {}),
    });
    changed = true;
  }
  return changed;
}

export function prepareCodexMcpBlock(input: unknown): ManualFragment {
  const server = specification(input);
  const block = `[mcp_servers.${JSON.stringify(server.name)}]\ncommand = ${JSON.stringify(server.command)}\nargs = ${JSON.stringify(server.args ?? [])}\nenv_vars = ${JSON.stringify(server.envNames ?? [])}\n`;
  return {
    agent: 'codex',
    path: '~/.codex/config.toml',
    status: 'manual-action-required',
    block,
    envNames: server.envNames ?? [],
    manualActions: [
      {
        id: `mcp-codex-${server.name}`,
        status: 'pending',
        description:
          'Apply the shown TOML block to the Codex user config, without copying secret values.',
      },
    ],
  };
}

export function verifyCodexMcpBlock(
  text: string,
  input: unknown,
  options: McpOptions = {},
): McpResult {
  const server = specification(input);
  assert(
    typeof text === 'string' && Buffer.byteLength(text) <= 1024 * 1024,
    'invalid-mcp-format',
    'Codex config exceeds its supported size.',
  );
  const heading = `[mcp_servers.${JSON.stringify(server.name)}]`,
    bareHeading = `[mcp_servers.${server.name}]`;
  let active = false,
    found = 0;
  const values = new Map();
  try {
    for (const raw of text.split(/\r?\n/)) {
      const line = raw.trim();
      if (line.startsWith('[')) {
        active = line === heading || line === bareHeading;
        if (active) found++;
        continue;
      }
      if (!active || !line || line.startsWith('#')) continue;
      const match = /^(command|args|env_vars)\s*=\s*(.+)$/.exec(line);
      if (!match || values.has(match[1]))
        return {
          agent: 'codex',
          status: 'manual-action-required',
          reason: 'unsupported-config-format',
        };
      values.set(match[1], JSON.parse(match[2]));
    }
  } catch {
    return {
      agent: 'codex',
      status: 'manual-action-required',
      reason: 'unsupported-config-format',
    };
  }
  const matches =
    found === 1 &&
    values.get('command') === server.command &&
    JSON.stringify(values.get('args') ?? []) ===
      JSON.stringify(server.args ?? []) &&
    JSON.stringify(values.get('env_vars') ?? []) ===
      JSON.stringify(server.envNames ?? []);
  return {
    agent: 'codex',
    name: server.name,
    status: matches
      ? envStatus(server.envNames ?? [], options)
      : 'manual-action-required',
    ...(!matches
      ? { reason: 'manual-block-not-applied' }
      : { envNames: server.envNames ?? [] }),
  };
}
