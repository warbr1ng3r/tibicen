import path from 'node:path';
import { realpath } from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  parseData,
  serializeData,
} from '../core/contracts.ts';
import { readProjectFile } from '../scan/index.ts';
import { agentSupport } from '../compat/matrix.ts';
import type { Change, PathReason } from '../core/types.ts';

export interface ProcessInput {
  framework: 'openspec';
  version: '1.14.3';
  agent: string;
  agentVersion: string;
  cliPackageRoot?: string;
  instructions?: 'preserve' | 'replace';
}
export interface ProcessPlan {
  schema: 1;
  framework: 'openspec';
  version: '1.14.3';
  adapterRevision: 1;
  instructionMode: 'generated' | 'preserved';
  agent: string;
  agentVersion: string;
  files: {
    path: string;
    hash: string;
    role: 'config' | 'anchor' | 'instructions';
  }[];
  cli?: { packageRoot: string; resources: { path: string; hash: string }[] };
}
export interface ProcessCheck {
  status: string;
  scope: string;
  loading: string;
  task: string;
  cliExecution: string;
  issues: PathReason[];
}
type Reader = (
  relative: string,
) => Promise<{ content: string | null; hash: string | null }>;
const version = '1.14.3';
const anchors = [
  'openspec/specs/.gitkeep',
  'openspec/changes/archive/.gitkeep',
];
const resources = [
  'package.json',
  'bin/openspec.js',
  'schemas/spec-driven/schema.yaml',
  ...['proposal', 'design', 'spec', 'tasks'].map(
    (name) => 'schemas/spec-driven/templates/' + name + '.md',
  ),
];
const hash = (value: unknown) =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
function keys(
  value: unknown,
  required: string[],
  optional: string[] = [],
): asserts value is Record<string, unknown> {
  assert(
    value &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      required.every((key) => Object.hasOwn(value, key)) &&
      Object.keys(value).every((key) =>
        [...required, ...optional].includes(key),
      ),
    'invalid-process',
    'Unknown or missing process field.',
  );
}
function instructionPath(agent: string, agentVersion: string) {
  const support = agentSupport(agent, agentVersion);
  assert(
    support.supported && ['codex', 'claude-code'].includes(agent),
    'unsupported-process-agent',
    'The process adapter needs a checked Codex or Claude Code version.',
  );
  return (
    (agent === 'codex' ? '.agents' : '.claude') +
    '/skills/tibicen-openspec/SKILL.md'
  );
}
function checkConfig(content: string) {
  if (content.trim().startsWith('{')) {
    const config = parseData(content) as Record<string, unknown>;
    assert(
      config &&
        config.schema === 'spec-driven' &&
        !Object.hasOwn(config, 'store'),
      'unsupported-process-config',
      'Only local spec-driven planning is supported; external stores need a separate adapter.',
    );
  } else {
    // shortcut: inspect only an unambiguous top-level schema; richer YAML needs a reviewed adapter.
    const rootLines = content
      .split(/\r?\n/)
      .filter((line) => line.trim() && !/^\s|^#/.test(line));
    assert(
      rootLines.every((line) =>
        /^[A-Za-z][A-Za-z0-9_-]*:(?:\s|$)/.test(line),
      ) &&
        !/^store\s*:/m.test(content) &&
        /^schema:\s+(?:spec-driven|'spec-driven'|"spec-driven")\s*(?:#.*)?$/m.test(
          content,
        ) &&
        (content.match(/^schema\s*:/gm) ?? []).length === 1,
      'unsupported-process-config',
      'Keep the existing config; unsupported schema/store/YAML needs a manual step.',
    );
  }
}

export function validateProcessPlan(input: unknown): ProcessPlan | undefined {
  if (input === undefined) return;
  keys(
    input,
    [
      'schema',
      'framework',
      'version',
      'adapterRevision',
      'instructionMode',
      'agent',
      'agentVersion',
      'files',
    ],
    ['cli'],
  );
  const plan = input as unknown as ProcessPlan;
  assert(
    plan.schema === 1 &&
      plan.framework === 'openspec' &&
      plan.version === version &&
      plan.adapterRevision === 1,
    'unsupported-process-version',
    'Unsupported process schema, framework or version.',
  );
  assert(
    ['generated', 'preserved'].includes(plan.instructionMode),
    'invalid-process',
    'Unknown instruction ownership mode.',
  );
  const instructions = instructionPath(plan.agent, plan.agentVersion);
  assert(
    Array.isArray(plan.files) && plan.files.length === 4,
    'invalid-process',
    'The bounded process needs config, two anchors and one instruction file.',
  );
  const seen = new Set();
  for (const file of plan.files) {
    keys(file, ['path', 'hash', 'role']);
    const allowed =
      file.role === 'config'
        ? ['openspec/config.yaml', 'openspec/config.yml']
        : file.role === 'anchor'
          ? anchors
          : file.role === 'instructions'
            ? [instructions]
            : [];
    assert(
      allowed.includes(file.path) && hash(file.hash) && !seen.has(file.path),
      'invalid-process',
      'Unknown or duplicate process resource.',
    );
    seen.add(file.path);
  }
  assert(
    plan.files.filter((file) => file.role === 'config').length === 1 &&
      plan.files.some((file) => file.path === instructions) &&
      anchors.every((name) => seen.has(name)),
    'invalid-process',
    'Incomplete process resource set.',
  );
  if (plan.cli) {
    keys(plan.cli, ['packageRoot', 'resources']);
    assert(
      typeof plan.cli.packageRoot === 'string' &&
        path.isAbsolute(plan.cli.packageRoot),
      'invalid-process',
      'The external CLI location must be explicit.',
    );
    assert(
      Array.isArray(plan.cli.resources) &&
        plan.cli.resources.length === resources.length &&
        new Set(plan.cli.resources.map((file) => file.path)).size ===
          resources.length,
      'invalid-process',
      'Incomplete CLI resource set.',
    );
    for (const file of plan.cli.resources) {
      keys(file, ['path', 'hash']);
      assert(
        resources.includes(file.path) && hash(file.hash),
        'invalid-process',
        'Unsupported CLI resource.',
      );
    }
  }
  return plan;
}

async function inspectCli(packageRoot: string) {
  assert(
    typeof packageRoot === 'string' && path.isAbsolute(packageRoot),
    'invalid-process',
    'Select an explicit external CLI package directory.',
  );
  packageRoot = await realpath(packageRoot);
  const files = [];
  for (const relative of resources) {
    const { content } = await readProjectFile(packageRoot, relative, {
      maxFileBytes: 2 * 1024 * 1024,
    });
    if (relative === 'package.json') {
      const pkg = parseData(content.toString('utf8')) as Record<
        string,
        unknown
      >;
      assert(
        pkg.name === '@fission-ai/openspec' &&
          pkg.version === version &&
          pkg.license === 'MIT',
        'unsupported-process-version',
        'Install the separately approved OpenSpec 1.14.3 package.',
      );
    }
    files.push({ path: relative, hash: hashContent(content) });
  }
  return { packageRoot, resources: files };
}

function cliInvocation(cli?: ProcessPlan['cli']) {
  const invocation = cli
    ? JSON.stringify({
        executable: 'node',
        argv: [path.join(cli.packageRoot, 'bin/openspec.js')],
      })
    : 'openspec (separately installed version 1.14.3)';
  return (
    'CLI invocation: ' +
    invocation +
    '. Treat executable and argv as literal arguments, never shell text.'
  );
}
function validateCliBinding(
  previous: ProcessPlan | undefined,
  next: ProcessPlan,
  content: string | null,
) {
  if (!previous || cliInvocation(previous.cli) === cliInvocation(next.cli))
    return;
  const invocations = content
    ?.split(/\r?\n/)
    .filter((line) => line.startsWith('CLI invocation:'));
  assert(
    invocations?.length === 1 && invocations[0] === cliInvocation(next.cli),
    'process-instructions-cli-conflict',
    'The CLI command changed. Explicitly update the single preserved invocation or review instructions: replace before registering the new CLI.',
  );
}
function instructions(cli?: ProcessPlan['cli']) {
  return [
    '---',
    'name: tibicen-openspec',
    'description: Use the configured OpenSpec specification, planning, implementation and verification workflow for substantial project changes.',
    'license: MIT',
    '---',
    '',
    '# Project OpenSpec workflow',
    '',
    'First-party Tibicen process adapter revision 1, OpenSpec 1.14.3. This is a project instruction, not an upstream generated OpenSpec skill.',
    cliInvocation(cli),
    'Check the installed CLI version before use. Unknown versions or unavailable resources are a gap, not verified support.',
    'Preserve application, dependencies, CI, existing specifications, local templates and owner instructions. Never commit automatically.',
    '1. Inspect: list --json. Use the returned root and paths; external stores are outside this adapter.',
    '2. Propose: obtain consent for the exact new change paths, then new change NAME. Read status --change NAME --json.',
    '3. Plan: get instructions ARTIFACT --change NAME --json in dependency order; use its templates and write requirements/scenarios, design and tasks. Read project context. Show the finished plan for review.',
    '4. Apply only after separate consent for the exact application files/commands: instructions apply --change NAME --json. Read contextFiles, perform the agreed tasks, run checks, and mark only verified tasks complete.',
    '5. Verify: validate NAME --strict plus agreed project checks; report evidence, loading and task outcomes separately. Fixes outside the agreed scope require a new plan.',
    '6. Archive/sync only on explicit request after completed verification; show the exact effects first. Do not run init/update as a shortcut over local files.',
    'The native spec-driven schema/templates are supplied by the separate CLI. Missing CLI, template or evidence must be reported explicitly.',
    '',
    'Tibicen setup does not prove that a fresh agent loaded these instructions or completed useful work.',
    '',
  ].join('\n');
}

export async function planProcess(
  input: ProcessInput | undefined,
  previous: ProcessPlan | undefined,
  read: Reader,
) {
  validateProcessPlan(previous);
  const manual = {
    id: 'openspec-cli',
    status: 'pending',
    required: true,
    description:
      'Separately approve and install @fission-ai/openspec@1.14.3 outside application dependencies. Re-propose with process.cliPackageRoot set to its explicit package directory; Tibicen does not install or execute it during setup.',
  };
  if (input === undefined)
    return {
      process: previous,
      changes: [],
      manualActions: previous && !previous.cli ? [manual] : [],
    };
  keys(
    input,
    ['framework', 'version', 'agent', 'agentVersion'],
    ['cliPackageRoot', 'instructions'],
  );
  assert(
    input.framework === 'openspec' && input.version === version,
    'unsupported-process-version',
    'Only the bounded OpenSpec 1.14.3 adapter is supported.',
  );
  assert(
    input.instructions === undefined ||
      ['preserve', 'replace'].includes(input.instructions),
    'invalid-process',
    'Choose preserve or replace for local instructions.',
  );
  const target = instructionPath(input.agent, input.agentVersion);
  assert(
    !previous ||
      (previous.agent === input.agent &&
        previous.agentVersion === input.agentVersion),
    'unsupported-process-agent',
    'Changing a registered process target requires a separate migration.',
  );
  const cli = input.cliPackageRoot
    ? await inspectCli(input.cliPackageRoot)
    : previous?.cli;
  const existingConfigs = await Promise.all(
    ['openspec/config.yaml', 'openspec/config.yml'].map(read),
  );
  assert(
    !existingConfigs.every((file) => file.content !== null),
    'unsupported-process-config',
    'Resolve competing config.yaml/config.yml files explicitly.',
  );
  const configPath =
    existingConfigs[1].content !== null
      ? 'openspec/config.yml'
      : 'openspec/config.yaml';
  const currentConfig = existingConfigs[configPath.endsWith('.yml') ? 1 : 0];
  const config =
    currentConfig.content ?? serializeData({ schema: 'spec-driven' });
  checkConfig(config);
  const desired = instructions(cli);
  const currentInstructions = await read(target);
  assert(
    currentInstructions.content === null ||
      previous?.files.some((file) => file.path === target),
    'process-path-conflict',
    'An unregistered instruction file cannot be claimed by the process adapter.',
  );
  const local = previous?.files.find((file) => file.path === target);
  assert(
    !(
      previous?.instructionMode === 'preserved' &&
      currentInstructions.content === null &&
      input.instructions !== 'replace'
    ),
    'process-local-instructions-missing',
    'The preserved local instructions are missing; explicitly review replacement instead of reconstructing unknown bytes.',
  );
  const preserve =
    currentInstructions.content !== null &&
    local &&
    (input.instructions === 'preserve' ||
      (input.instructions !== 'replace' &&
        (previous?.instructionMode === 'preserved' ||
          currentInstructions.hash !== local.hash)));
  const contents = new Map([
    [configPath, config],
    ...anchors.map((name) => [name, ''] as const),
    [target, preserve ? currentInstructions.content! : desired],
  ]);
  const files: ProcessPlan['files'] = [],
    changes: NonNullable<import('../core/types.ts').ProposalInput['changes']> =
      [];
  for (const [relative, desiredContent] of contents) {
    const before = await read(relative);
    const content =
      anchors.includes(relative) && before.content !== null
        ? before.content
        : desiredContent;
    files.push({
      path: relative,
      hash: hashContent(content),
      role:
        relative === configPath
          ? 'config'
          : relative === target
            ? 'instructions'
            : 'anchor',
    });
    if (before.content !== content)
      changes.push({
        path: relative,
        content,
        reason:
          'Configure the bounded OpenSpec workflow; preserve existing planning artifacts.',
      });
  }
  const process: ProcessPlan = {
    schema: 1,
    framework: 'openspec',
    version,
    adapterRevision: 1,
    instructionMode: preserve ? 'preserved' : 'generated',
    agent: input.agent,
    agentVersion: input.agentVersion,
    files,
    ...(cli ? { cli } : {}),
  };
  validateProcessPlan(process);
  validateCliBinding(previous, process, contents.get(target)!);
  return { process, changes, manualActions: cli ? [] : [manual] };
}

export function processAllows(plan: ProcessPlan | undefined, relative: string) {
  return Boolean(
    validateProcessPlan(plan)?.files.some((file) => file.path === relative),
  );
}

export function validateProcessChanges(
  plan: ProcessPlan | undefined,
  changes: Change[],
) {
  validateProcessPlan(plan);
  for (const file of plan?.files ?? []) {
    const change = changes.find((change) => change.path === file.path);
    if (!change) continue;
    assert(
      change.action !== 'delete' && hashContent(change.content!) === file.hash,
      'invalid-process',
      'Process changes must match the exact retained resource hashes.',
    );
    if (file.role === 'config') {
      assert(
        change.action === 'add',
        'process-config-protected',
        'Existing OpenSpec configuration is preserved by this adapter.',
      );
      checkConfig(change.content!);
    }
    if (file.role === 'anchor')
      assert(
        change.action === 'add' && change.content === '',
        'process-path-conflict',
        'Existing anchors are preserved.',
      );
  }
}

export async function inspectProcess(
  plan: ProcessPlan | undefined,
  read: Reader,
  previous?: ProcessPlan,
): Promise<ProcessCheck> {
  validateProcessPlan(plan);
  const issues: PathReason[] = [];
  for (const file of plan?.files ?? []) {
    try {
      const actual = await read(file.path);
      if (actual.hash !== file.hash)
        issues.push({
          path: file.path,
          reason:
            actual.hash === null
              ? 'process-resource-missing'
              : 'process-resource-changed',
        });
      if (file.role === 'config' && actual.content !== null)
        checkConfig(actual.content);
      if (file.role === 'instructions' && plan)
        validateCliBinding(previous, plan, actual.content);
    } catch {
      issues.push({
        path: file.path,
        reason: 'process-resource-unreadable-or-unsupported',
      });
    }
  }
  if (plan?.cli) {
    try {
      if (digest(await inspectCli(plan.cli.packageRoot)) !== digest(plan.cli))
        issues.push({ reason: 'process-cli-resources-changed' });
    } catch {
      issues.push({ reason: 'process-cli-unavailable-or-unsupported' });
    }
  }
  return {
    status: issues.length ? 'issues-found' : 'passed',
    scope: 'structure-and-package-resources',
    loading: 'unverified',
    task: 'unverified',
    cliExecution: 'unverified',
    issues,
  };
}
