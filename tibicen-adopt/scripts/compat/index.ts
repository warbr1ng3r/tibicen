import type {
  CommandResult,
  ClaudeOptions,
  CompatOptions,
  CompatPair,
  CompatResult,
  Launch,
  ProbeReady,
} from '../core/types.ts';
import path from 'node:path';
import { readFile, readdir } from 'node:fs/promises';
import { assert, hashContent, validateCheckResult } from '../core/contracts.ts';
import { safePath } from '../core/paths.ts';
import { AGENT_MATRIX, agentSupport } from './matrix.ts';

interface ProtocolItem {
  type: string;
  id?: string;
  name?: string;
  input?: { skill?: string };
  tool_use_id?: string;
  is_error?: boolean;
  content?: string | { type: string; text?: string }[];
}
interface ProtocolRecord {
  type: string;
  subtype?: string;
  skills?: string[];
  message?: { content?: ProtocolItem[] };
}

const SAFE_TOOLS = new Set(['Read', 'Glob', 'Grep', 'Edit', 'Write', 'Skill']);
const unverified = (
  reason: string,
  extra: Partial<CompatResult> = {},
): CompatResult => ({
  kind: 'compat',
  status: 'unverified',
  loading: 'unverified',
  reason,
  ...extra,
});

// This only prepares a command. The common executor must bind it to an approved plan.
export function prepareClaudeRun({
  id = 'claude-probe',
  kind = 'compat',
  agentVersion,
  copyRoot,
  prompt,
  tools = ['Read', 'Glob', 'Grep'],
  context = '',
  envNames = [],
  availableEnvNames = [],
  maxBudgetUsd,
  startupControlled = false,
}: ClaudeOptions = {}): Launch {
  if (!agentSupport('claude-code', agentVersion).supported)
    return { status: 'unverified', reason: 'unsupported-agent-version' };
  if (!startupControlled)
    return { status: 'unverified', reason: 'startup-uncontrolled' };
  if (
    !envNames.includes('ANTHROPIC_API_KEY') ||
    !availableEnvNames.includes('ANTHROPIC_API_KEY')
  )
    return { status: 'unverified', reason: 'auth-unavailable' };
  if (!tools.length || tools.some((tool) => !SAFE_TOOLS.has(tool)))
    return { status: 'unverified', reason: 'unsupported-task-tools' };
  assert(
    path.isAbsolute(copyRoot ?? '') &&
      typeof prompt === 'string' &&
      prompt.trim(),
    'invalid-probe',
    'A controlled copy and explicit prompt are required.',
  );
  assert(
    ['task', 'quiz', 'compat'].includes(kind) && typeof context === 'string',
    'invalid-probe',
    'Invalid probe kind or context.',
  );
  assert(
    typeof maxBudgetUsd === 'number' &&
      Number.isFinite(maxBudgetUsd) &&
      maxBudgetUsd > 0,
    'invalid-probe',
    'A positive, approved budget is required.',
  );
  assert(
    envNames.every((name) => name === 'ANTHROPIC_API_KEY'),
    'invalid-probe',
    'This adapter supports only its explicit authentication variable.',
  );
  const argv = [
    '--bare',
    '--setting-sources',
    'project',
    '--strict-mcp-config',
    '--mcp-config',
    '{"mcpServers":{}}',
    '--settings',
    '{"disableAllHooks":true,"autoMemoryEnabled":false,"syncClaudeAiSkills":false}',
    '--no-session-persistence',
    '--no-chrome',
    '--permission-mode',
    'dontAsk',
    '--output-format',
    'stream-json',
    '--verbose',
    '--add-dir',
    copyRoot!,
    '--tools',
    tools.join(','),
    '--max-budget-usd',
    String(maxBudgetUsd),
  ];
  if (context) argv.push('--append-system-prompt', context);
  argv.push('-p', prompt);
  return {
    status: 'ready',
    command: {
      id,
      kind,
      executable: 'claude',
      argv,
      cwd: '.',
      envNames: [...envNames],
      trusted: true,
    },
  };
}

function bodyOf(text: string) {
  return text.replace(/^---\r?\n[\s\S]*?\r?\n---(?:\r?\n|$)/, '').trim();
}

export function hasSkillStartupCode(text: string) {
  return /!`|^\s*(?:hooks|context|agent|allowed-tools)\s*:/m.test(text);
}

export async function inspectSkillStartup(copyRoot: string) {
  let count = 0;
  async function inspect(relative: string): Promise<boolean> {
    let entries;
    try {
      entries = await readdir(await safePath(copyRoot, relative), {
        withFileTypes: true,
      });
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') return true;
      throw error;
    }
    for (const entry of entries) {
      if (
        ++count > 1000 ||
        entry.isSymbolicLink() ||
        entry.name === '.claude-plugin'
      )
        return false;
      const child = `${relative}/${entry.name}`;
      if (entry.isDirectory()) {
        if (!(await inspect(child))) return false;
      } else if (
        entry.name === 'SKILL.md' &&
        hasSkillStartupCode(
          await readFile(await safePath(copyRoot, child), 'utf8'),
        )
      )
        return false;
    }
    return true;
  }
  try {
    return { safe: await inspect('.claude/skills') };
  } catch {
    return { safe: false };
  }
}

export function prepareCompatCommand(
  pair: CompatPair,
  options: CompatOptions = {},
): Launch {
  if (options.enabled === false)
    return { status: 'unverified', reason: 'skipped-by-user' };
  if (pair.agent !== 'claude-code')
    return {
      status: 'unverified',
      reason: AGENT_MATRIX[pair.agent as keyof typeof AGENT_MATRIX]
        ? 'headless-method-unverified'
        : 'unsupported-agent',
    };
  assert(
    /^[a-z0-9][a-z0-9-]{0,63}$/.test(pair.skill ?? ''),
    'invalid-probe',
    'Skill name is not supported by this adapter.',
  );
  return prepareClaudeRun({
    ...options,
    agentVersion: pair.agentVersion,
    kind: 'compat',
    id: options.id ?? `compat-${pair.skill}`,
    tools: ['Skill'],
    prompt: `Load the project skill ${JSON.stringify(pair.skill)} with the Skill tool once. Do not perform its workflow. After loading, report that the instructions are available. Do not run commands, change files or invoke another agent.`,
  });
}

export async function prepareCompatProbe(
  pair: CompatPair,
  options: CompatOptions = {},
): Promise<ProbeReady | CompatResult> {
  const extra = {
    skill: pair.skill,
    ref: pair.ref,
    agent: pair.agent,
    agentVersion: pair.agentVersion,
    date: options.date ?? new Date().toISOString(),
  };
  if (options.enabled === false) return unverified('skipped-by-user', extra);
  if (!AGENT_MATRIX[pair.agent as keyof typeof AGENT_MATRIX])
    return unverified('unsupported-agent', extra);
  if (pair.agent !== 'claude-code')
    return unverified('headless-method-unverified', extra);
  if (!agentSupport(pair.agent, pair.agentVersion).supported)
    return unverified('unsupported-agent-version', extra);
  assert(
    /^[a-z0-9][a-z0-9-]{0,63}$/.test(pair.skill ?? ''),
    'invalid-probe',
    'Skill name is not supported by this adapter.',
  );
  assert(
    /^(?:[a-f0-9]{40}|[a-f0-9]{64})$/.test(pair.ref ?? '') &&
      /^[a-f0-9]{64}$/.test(pair.contentHash ?? ''),
    'invalid-probe',
    'A pinned skill identity and content hash are required.',
  );
  assert(
    pair.path === `.claude/skills/${pair.skill}/SKILL.md`,
    'invalid-probe',
    'This adapter needs the native project skill path.',
  );
  const text = await readFile(
    await safePath(options.copyRoot!, pair.path),
    'utf8',
  );
  assert(
    hashContent(text) === pair.contentHash,
    'skill-hash-mismatch',
    'Installed skill differs from the pinned proposal.',
  );
  // A native loader can expand commands or spawn a fork before ordinary tools run.
  if (
    hasSkillStartupCode(text) ||
    !(await inspectSkillStartup(options.copyRoot!)).safe
  )
    return unverified('skill-command-execution-required', extra);
  const expectedBody = bodyOf(text);
  if (!expectedBody) return unverified('empty-skill-instructions', extra);
  const launch = prepareCompatCommand(pair, options);
  if (launch.status !== 'ready') return unverified(launch.reason, extra);
  return {
    ...extra,
    status: 'ready',
    command: launch.command,
    expected: {
      skill: pair.skill,
      ref: pair.ref,
      contentHash: pair.contentHash!,
      instructionsHash: hashContent(expectedBody),
      instructions: expectedBody,
    },
    method: 'headless-native-skill-tool',
  };
}

// Parse only actual protocol tool-use/tool-result records, never a model's prose claim.
export function evaluateCompatEvidence(
  probe: ProbeReady | CompatResult,
  execution?: CommandResult,
): CompatResult {
  if (probe.status !== 'ready') return validateCheckResult(probe);
  const { skill, ref, agent, agentVersion, date, method } = probe;
  const extra = { skill, ref, agent, agentVersion, date, method };
  if (execution?.exitCode !== 0)
    return unverified(execution?.reason ?? 'probe-failed', extra);
  const records: ProtocolRecord[] = [];
  try {
    for (const line of (execution.stdout ?? '').split('\n').filter(Boolean))
      records.push(JSON.parse(line));
  } catch {
    return unverified('invalid-probe-output', extra);
  }
  const invocations = new Map<string | undefined, ProtocolItem>();
  for (const record of records) {
    if (record.type === 'assistant')
      for (const item of record.message?.content ?? []) {
        if (
          item.type === 'tool_use' &&
          item.name === 'Skill' &&
          item.input?.skill === skill
        )
          invocations.set(item.id, item);
      }
    if (record.type === 'user')
      for (const item of record.message?.content ?? []) {
        if (
          item.type !== 'tool_result' ||
          item.is_error ||
          !invocations.has(item.tool_use_id)
        )
          continue;
        const content =
          typeof item.content === 'string'
            ? item.content
            : (item.content ?? [])
                .filter((part) => part.type === 'text')
                .map((part) => part.text)
                .join('\n');
        if (content.includes(probe.expected.instructions))
          return validateCheckResult({
            kind: 'compat',
            status: 'verified',
            loading: 'verified',
            ...extra,
            evidence: {
              type: 'native-skill-tool-result',
              toolUseId: item.tool_use_id!,
              contentHash: probe.expected.contentHash,
              instructionsHash: probe.expected.instructionsHash,
            },
          });
      }
  }
  return unverified(
    records.some(
      (record) =>
        record.type === 'system' &&
        record.subtype === 'init' &&
        record.skills?.includes(skill),
    )
      ? 'discovered-only'
      : 'loading-evidence-unavailable',
    extra,
  );
}

export async function runCompatProbe(
  pair: CompatPair,
  options: CompatOptions = {},
) {
  const probe = await prepareCompatProbe(pair, options);
  if (probe.status !== 'ready') return probe;
  if (!options.runner)
    return unverified('executor-unavailable', {
      skill: pair.skill,
      ref: pair.ref,
      agent: pair.agent,
      agentVersion: pair.agentVersion,
    });
  return evaluateCompatEvidence(probe, await options.runner(probe.command));
}
