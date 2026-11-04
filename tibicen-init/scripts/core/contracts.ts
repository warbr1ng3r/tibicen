import type { Proposal, CheckResult, ScanResult, Preset } from './types.ts';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { validateSharedRules } from './shared-rules.ts';
import { validateProcessChanges } from '../process/index.ts';

export const VERSION: string = JSON.parse(
  readFileSync(new URL('../../package.json', import.meta.url), 'utf8'),
).version;
export const SCHEMA_VERSION = 1;
export const MAX_DATA_BYTES = 8 * 1024 * 1024;
export const AGENTS = ['claude-code', 'codex', 'cursor'];
export const TRANSFER_STATUSES = [
  'complete',
  'manual-action-required',
  'incomplete',
];
export const CHECK_STATUSES = {
  infrastructure: ['passed', 'issues-found', 'unverified'],
  verify: ['green', 'red-fixed', 'pre-existing-red', 'unverified'],
  task: ['passed', 'failed', 'unverified'],
  quiz: ['passed', 'failed', 'unverified'],
  compat: ['verified', 'unverified'],
};

export function fail(code: string, message: string): never {
  throw Object.assign(new Error(message), { code });
}

export function assert(
  condition: unknown,
  code: string,
  message: string,
): asserts condition {
  if (!condition) fail(code, message);
}

export function hashContent(content: string | Uint8Array) {
  return createHash('sha256').update(content).digest('hex');
}

export function validateFileMode(value: unknown): number {
  assert(
    typeof value === 'number' &&
      Number.isInteger(value) &&
      value >= 0 &&
      value <= 0o777,
    'invalid-file-mode',
    'Only ordinary file permission bits are supported.',
  );
  return value;
}

export function validateTargetFileMode(
  value: unknown = process.platform === 'win32' ? 0o666 : 0o600,
): number {
  const mode = validateFileMode(value);
  assert(
    process.platform !== 'win32' || mode === 0o666,
    'unsupported-file-mode',
    'Windows writes support ordinary writable mode 0666, not exact POSIX permissions or ACL guarantees.',
  );
  return mode;
}

export function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stableStringify((value as Record<string, unknown>)[key])}`,
      )
      .join(',')}}`;
  }
  return JSON.stringify(value)!;
}

export function digest(value: unknown) {
  return hashContent(stableStringify(value));
}

export function validateData<T>(value: T, depth = 0): T {
  assert(depth < 40, 'invalid-data', 'Data nesting is too deep.');
  if (value === null || typeof value === 'boolean' || typeof value === 'string')
    return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  assert(
    value && typeof value === 'object',
    'invalid-data',
    'Expected JSON-compatible data.',
  );
  for (const [key, child] of Object.entries(value)) {
    assert(
      !['__proto__', 'constructor', 'prototype'].includes(key),
      'invalid-data',
      'Unsafe data key.',
    );
    validateData(child, depth + 1);
  }
  return value;
}

// JSON is a strict YAML subset; accepting only it avoids an incomplete general YAML parser.
export function parseData(text: string): unknown {
  assert(
    typeof text === 'string' && Buffer.byteLength(text) <= MAX_DATA_BYTES,
    'invalid-data',
    'Input is too large.',
  );
  try {
    return validateData(JSON.parse(text));
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    if (error.code) throw error;
    fail(
      'invalid-data',
      'Expected JSON or JSON-compatible YAML; YAML tags and executable expressions are unsupported.',
    );
  }
}

export function serializeData(value: unknown) {
  validateData(value);
  const text = `${JSON.stringify(value, null, 2)}\n`;
  assert(
    Buffer.byteLength(text) <= MAX_DATA_BYTES,
    'invalid-data',
    'Serialized data exceeds the supported eight MiB limit.',
  );
  return text;
}

export function validateProposal(input: unknown): Proposal {
  const plan = input as Proposal;
  validateData(plan);
  assert(
    plan?.schema === 1 && ['init', 'improve'].includes(plan.mode),
    'invalid-plan',
    'Unsupported plan schema or mode.',
  );
  assert(
    Array.isArray(plan.changes) &&
      Array.isArray(plan.commands) &&
      Array.isArray(plan.sources),
    'invalid-plan',
    'Plan needs changes, commands and sources arrays.',
  );
  assert(
    plan.components?.schema === 1 &&
      plan.components.toSchema === 2 &&
      [null, 1, 2].includes(plan.components.fromSchema) &&
      Array.isArray(plan.components.files),
    'invalid-plan',
    'Compile the component inventory with the current proposal command; older plans need a new proposal.',
  );
  validateSharedRules(plan.sharedRules === undefined ? [] : plan.sharedRules);
  validateProcessChanges(plan.process, plan.changes);
  const environment = plan.checks?.environment;
  if (environment)
    assert(
      Object.keys(environment).sort().join(',') ===
        'arch,bytes,files,hash,kind,nodeVersion,platform,roots' &&
        environment.kind === 'local-node-modules' &&
        Array.isArray(environment.roots) &&
        environment.roots.length > 0 &&
        environment.roots.every((root) => typeof root === 'string') &&
        /^[a-f0-9]{64}$/.test(environment.hash) &&
        Number.isSafeInteger(environment.files) &&
        environment.files >= 0 &&
        Number.isSafeInteger(environment.bytes) &&
        environment.bytes >= 0 &&
        typeof environment.platform === 'string' &&
        typeof environment.arch === 'string' &&
        typeof environment.nodeVersion === 'string',
      'invalid-node-environment',
      'Compile the complete dependency environment through proposal before approval.',
    );
  assert(
    Array.isArray(plan.retryCommands ?? []),
    'invalid-plan',
    'retryCommands must be an array.',
  );
  const retries = new Set();
  for (const retry of plan.retryCommands ?? []) {
    assert(
      retry &&
        typeof retry.id === 'string' &&
        /^[a-f0-9]{64}$/.test(retry.commandDigest) &&
        !retries.has(retry.commandDigest) &&
        typeof retry.reason === 'string' &&
        retry.reason.trim(),
      'invalid-plan',
      'A command retry needs its id, digest and a separate justification.',
    );
    retries.add(retry.commandDigest);
  }
  const paths = new Set();
  for (const change of plan.changes) {
    assert(
      !('managedBlock' in change),
      'invalid-plan',
      'Compile managedBlock through proposal before applying a resolved plan.',
    );
    assert(
      typeof change.path === 'string' && !paths.has(change.path),
      'invalid-plan',
      'Duplicate or missing change path.',
    );
    paths.add(change.path);
    assert(
      ['add', 'modify', 'delete'].includes(change.action),
      'invalid-plan',
      'Unknown file operation.',
    );
    assert(
      change.action === 'add'
        ? change.beforeHash === null
        : /^[a-f0-9]{64}$/.test(change.beforeHash ?? ''),
      'invalid-plan',
      'Invalid original hash.',
    );
    assert(
      change.action === 'delete'
        ? change.content === undefined || change.content === null
        : typeof change.content === 'string',
      'invalid-plan',
      'Missing file content.',
    );
    if (change.beforeMode !== undefined) {
      if (change.action === 'add')
        assert(
          change.beforeMode === null,
          'invalid-file-mode',
          'A new file cannot have original permissions.',
        );
      else validateFileMode(change.beforeMode);
    }
    if (change.fileMode !== undefined) {
      assert(
        change.action !== 'delete',
        'invalid-file-mode',
        'A deleted file has no result mode.',
      );
      validateFileMode(change.fileMode);
    }
    assert(
      typeof change.reason === 'string' && change.reason.trim(),
      'invalid-plan',
      'Every change needs a reason.',
    );
  }
  for (const source of plan.sources) {
    assert(
      typeof source.repo === 'string' && /^[a-f0-9]{40,64}$/.test(source.sha),
      'invalid-plan',
      'Sources must be pinned to full SHAs.',
    );
    assert(
      typeof source.license === 'string' && source.license,
      'invalid-plan',
      'A source needs a license or explicit exception.',
    );
  }
  assert(
    Array.isArray(plan.manualActions),
    'invalid-plan',
    'Plan needs manualActions.',
  );
  for (const action of plan.manualActions) {
    assert(
      typeof action.id === 'string' &&
        typeof action.description === 'string' &&
        ['pending', 'done'].includes(action.status),
      'invalid-plan',
      'Invalid manual action.',
    );
  }
  if (plan.process && !plan.process.cli)
    assert(
      plan.manualActions.some(
        (action) =>
          action.id === 'openspec-cli' &&
          action.status === 'pending' &&
          action.required !== false,
      ),
      'invalid-process',
      'A process without a registered CLI must retain its required pending installation action.',
    );
  return plan;
}

export function validateCheckResult<T extends CheckResult>(result: T): T {
  assert(
    (CHECK_STATUSES as Record<string, string[]>)[result?.kind]?.includes(
      result.status,
    ),
    'invalid-check',
    'Unknown check result.',
  );
  if (result.status === 'unverified')
    assert(
      typeof result.reason === 'string' && result.reason,
      'invalid-check',
      'Unverified results need a reason.',
    );
  return result;
}

export function validateScanResult(input: unknown): ScanResult {
  const scan = input as ScanResult;
  assert(
    scan?.schema === 1 &&
      typeof scan.root === 'string' &&
      ['empty', 'existing'].includes(scan.kind),
    'invalid-scan',
    'Invalid project scan.',
  );
  for (const key of ['files', 'languages', 'commands', 'agents', 'gaps'])
    assert(
      Array.isArray(scan[key as keyof ScanResult]),
      'invalid-scan',
      `Missing scan ${key}.`,
    );
  assert(
    ['init', 'improve'].includes(scan.mode),
    'invalid-scan',
    'Invalid scan route.',
  );
  return scan;
}

export function validatePreset(input: unknown): Preset {
  const preset = input as Preset;
  validateData(preset);
  assert(
    preset?.schema === 1 && /^[a-z0-9][a-z0-9-]{0,63}$/.test(preset.name),
    'invalid-preset',
    'Invalid preset name or schema.',
  );
  const allowed = [
    'schema',
    'name',
    'stack_hint',
    'answers',
    'preferred_sources',
  ];
  assert(
    Object.keys(preset).every((key) => allowed.includes(key)),
    'invalid-preset',
    'Unknown preset field.',
  );
  assert(
    preset.answers &&
      typeof preset.answers === 'object' &&
      !Array.isArray(preset.answers),
    'invalid-preset',
    'Preset needs typed answers.',
  );
  const choices = {
    process: ['minimal', 'balanced', 'structured'],
    style: ['concise', 'detailed'],
  };
  for (const [key, value] of Object.entries(preset.answers)) {
    if (key === 'forbidden_paths') {
      assert(
        Array.isArray(value) &&
          value.every(
            (path) =>
              typeof path === 'string' &&
              path &&
              !path.startsWith('/') &&
              !path.includes('..') &&
              !path.includes('\\'),
          ),
        'invalid-preset',
        'Invalid forbidden path.',
      );
    } else if (key === 'agents') {
      assert(
        Array.isArray(value) && value.every((agent) => AGENTS.includes(agent)),
        'invalid-preset',
        'Unsupported preset agent.',
      );
    } else
      assert(
        (choices as Record<string, string[]>)[key]?.includes(value as string),
        'invalid-preset',
        'Unknown answer or unsupported choice.',
      );
  }
  const hint = preset.stack_hint ?? {};
  assert(
    hint &&
      typeof hint === 'object' &&
      !Array.isArray(hint) &&
      Object.keys(hint).every((key) => ['language', 'kind'].includes(key)),
    'invalid-preset',
    'Invalid stack hint.',
  );
  for (const value of Object.values(hint))
    assert(
      typeof value === 'string' && /^[a-z0-9+#.-]{1,40}$/i.test(value),
      'invalid-preset',
      'Stack hints are labels, not instructions.',
    );
  assert(
    Array.isArray(preset.preferred_sources) &&
      preset.preferred_sources.every(
        (source) =>
          typeof source === 'string' &&
          /^[a-z0-9][a-z0-9/_.:-]{0,160}$/i.test(source),
      ),
    'invalid-preset',
    'Invalid source preference.',
  );
  return preset;
}
