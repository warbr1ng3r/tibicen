import type {
  Proposal,
  ProposalInput,
  PathOptions,
  Change,
  ManualAction,
  ManualFragment,
  McpConnection,
} from './types.ts';
import { readFile, readdir, stat } from 'node:fs/promises';
import { realpath } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {
  assert,
  digest,
  hashContent,
  validateTargetFileMode,
  validateProposal,
} from './contracts.ts';
import {
  safePath,
  validateRelativePath,
  isInfrastructurePath,
} from './paths.ts';
import {
  executableName,
  validateCommand,
  validateExternalExecutable,
} from './execute.ts';
import { prepareCheckCommands } from './checks.ts';
import {
  parseManagedBlock,
  supportsManagedBlocks,
  updateManagedBlock,
} from './blocks.ts';
import { planComponents, readManifest } from './components.ts';
import { inspectSharedRules, resolveSharedRules } from './shared-rules.ts';
import {
  planProcess,
  processAllows,
  inspectProcess,
} from '../process/index.ts';
import { infrastructureScope } from '../verify/scope.ts';
import { inspectNodeEnvironment } from '../verify/environment.ts';
import { memoryAllows, resolveMemory } from './memory.ts';

import { isSecretKey, isSecretPlaceholder } from './policy.ts';

// Bare text keeps the existing narrow placeholder-plus-word detection.
const BARE_PARTIAL_PLACEHOLDER =
  /^\s*(?:\$\{[^}]+\}|<[a-zA-Z0-9_-]+>|\[redacted\]|\*{3,})[a-zA-Z0-9_-]+(?![^"'\s])/;

function decodeQuoted(token: string): string {
  if (token.startsWith('"')) {
    try {
      return JSON.parse(token) as string;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
    }
  }
  return token.slice(1, -1);
}

export function containsSecret(content: string) {
  if (
    /(?:\b(?:sk-|gh[pousr]_|github_pat_)[a-zA-Z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(
      content,
    )
  )
    return true;
  // Inspect every source occurrence, including duplicates; escaped quotes cannot start keys.
  for (const match of content.matchAll(
    /(?<![a-z0-9_\\-])("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|[a-z0-9_-]+)\s*[:=]/gi,
  )) {
    const rawKey = match[1];
    const key = /^["']/.test(rawKey) ? decodeQuoted(rawKey) : rawKey;
    if (!isSecretKey(key)) continue;
    const tail = content.slice(match.index + match[0].length);
    const quoted = /^\s*(["'])((?:\\[\s\S]|(?!\1)[^\\])*)\1/.exec(tail);
    if (quoted) {
      const value = decodeQuoted(quoted[0].trim());
      if (value.trim() && !isSecretPlaceholder(value)) return true;
    } else if (BARE_PARTIAL_PLACEHOLDER.test(tail)) return true;
  }
  return false;
}

export async function isEmptyProject(root: string) {
  const entries = await readdir(root);
  return entries.every((name) =>
    ['.git', '.tibicen', '.DS_Store', '.zcodeignore'].includes(name),
  );
}

export async function readCurrent(
  root: string,
  relative: string,
  options: PathOptions = {},
) {
  const filename = await safePath(root, relative, options);
  try {
    const info = await stat(filename);
    assert(
      info.isFile() && info.size <= 2 * 1024 * 1024,
      'unsupported-file',
      'Only small regular text files are supported.',
    );
    const bytes = await readFile(filename);
    const content = bytes.toString('utf8');
    assert(
      !content.includes('\0') && Buffer.from(content).equals(bytes),
      'unsupported-file',
      'Binary files require a manual step.',
    );
    assert(
      !containsSecret(content),
      'secret-content',
      'Inline secrets require a manual step outside Tibicen.',
    );
    return { content, hash: hashContent(bytes), mode: info.mode & 0o777 };
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    if (error.code === 'ENOENT')
      return { content: null, hash: null, mode: null };
    throw error;
  }
}

function proposalDiff(
  filename: string,
  before: string | null,
  after: string | null,
  beforeMode: number | null,
  afterMode: number | null,
) {
  const beforeLines = before?.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  const afterLines = after?.match(/[^\n]*\n|[^\n]+$/g) ?? [];
  let diff = `--- ${before === null ? '/dev/null' : filename}\n+++ ${after === null ? '/dev/null' : filename}\n`;
  if (beforeMode !== afterMode)
    diff += `old mode ${beforeMode === null ? 'absent' : beforeMode.toString(8)}\nnew mode ${afterMode === null ? 'absent' : afterMode.toString(8)}\n`;
  let prefix = 0;
  while (
    prefix < beforeLines.length &&
    prefix < afterLines.length &&
    beforeLines[prefix] === afterLines[prefix]
  )
    prefix++;
  if (prefix === beforeLines.length && prefix === afterLines.length)
    return diff;
  let beforeEnd = beforeLines.length,
    afterEnd = afterLines.length;
  while (
    beforeEnd > prefix &&
    afterEnd > prefix &&
    beforeLines[beforeEnd - 1] === afterLines[afterEnd - 1]
  ) {
    beforeEnd--;
    afterEnd--;
  }
  // shortcut: keep one combined changed region; split hunks only if review needs it.
  const start = Math.max(0, prefix - 3);
  const beforeCount = Math.min(beforeLines.length, beforeEnd + 3) - start;
  const afterCount = Math.min(afterLines.length, afterEnd + 3) - start;
  diff += `@@ -${beforeCount ? start + 1 : start},${beforeCount} +${afterCount ? start + 1 : start},${afterCount} @@\n`;
  const render = (lines: string[], marker: string) =>
    lines
      .map(
        (line) =>
          `${marker}${line}${line.endsWith('\n') ? '' : '\n\\ No newline at end of file\n'}`,
      )
      .join('');
  return (
    diff +
    render(beforeLines.slice(start, prefix), ' ') +
    render(beforeLines.slice(prefix, beforeEnd), '-') +
    render(afterLines.slice(prefix, afterEnd), '+') +
    render(beforeLines.slice(beforeEnd, start + beforeCount), ' ')
  );
}

export async function createProposal(
  root: string,
  data: unknown,
  { home = os.homedir() } = {},
) {
  const input = data as ProposalInput;
  root = await realpath(root);
  home = await realpath(home);
  assert(
    input && ['init', 'improve'].includes(input.mode),
    'invalid-plan',
    'Select init or improve.',
  );
  const emptyProject = await isEmptyProject(root);
  const forbiddenPaths = input.forbiddenPaths ?? [];
  assert(
    Array.isArray(forbiddenPaths) &&
      forbiddenPaths.every((item) => typeof item === 'string'),
    'invalid-plan',
    'Invalid forbidden paths.',
  );
  assert(
    Array.isArray(input.changes ?? []),
    'invalid-plan',
    'Changes must be an array.',
  );
  const requestedChanges = [...(input.changes ?? [])];
  const { recoverPlanningBaseline } = await import('./recovery.ts');
  const baseline = await recoverPlanningBaseline(
    root,
    await readManifest(root),
  );
  const memory = resolveMemory(
    input.memory,
    baseline.recoveredMemory ?? baseline.manifest?.memory,
  );
  assert(
    !memory || baseline.pendingStateSchema !== 3,
    'resume-required',
    'Complete the pending legacy session before configuring memory.',
  );
  if (memory) {
    const current = await readCurrent(root, memory.path, { forbiddenPaths });
    assert(
      current.content !== null ||
        requestedChanges.some(
          (change) =>
            change.path === memory.path &&
            change.action !== 'delete' &&
            typeof change.content === 'string',
        ),
      'invalid-memory',
      'Bind an existing memory file or include its exact creation in changes.',
    );
  }
  const processSetup = await planProcess(
    input.process,
    baseline.recoveredProcess ?? baseline.manifest?.process,
    (relative) => readCurrent(root, relative, { forbiddenPaths }),
  );
  for (const change of processSetup.changes) {
    assert(
      !requestedChanges.some((request) => request.path === change.path),
      'process-path-conflict',
      'Use the process adapter for its exact generated files.',
    );
    requestedChanges.push(change);
  }
  const sharedRules = resolveSharedRules(
    input.sharedRules === undefined ? [] : input.sharedRules,
    baseline.recoveredSharedRules ?? baseline.manifest?.sharedRules ?? [],
  );
  assert(
    sharedRules.every((rule) => !containsSecret(rule.content)),
    'secret-content',
    'Shared instructions cannot contain inline secrets.',
  );
  for (const rule of sharedRules.filter((rule) =>
    input.sharedRules?.some((update) => update.id === rule.id),
  ))
    for (const target of rule.targets) {
      assert(
        !requestedChanges.some((change) => change.path === target.path),
        'shared-rule-path-conflict',
        'Use one exact shared operation for a linked instruction file.',
      );
      requestedChanges.push({
        path: target.path,
        managedBlock: { content: rule.content },
        reason: rule.reason,
      });
    }
  const manualActions: ManualAction[] = [
      ...(input.manualActions ?? []),
      ...processSetup.manualActions,
    ],
    manualFragments: ManualFragment[] = [],
    mcp: McpConnection[] = [];
  for (const connection of input.mcp ?? []) {
    const { planMcpChanges, prepareCodexMcpBlock } =
      await import('../mcp/index.ts');
    if (connection.agent === 'codex') {
      for (const operation of connection.operations ?? []) {
        assert(
          operation.action === 'upsert',
          'unsupported-mcp',
          'Codex removals require an explicit manual step.',
        );
        const prepared = prepareCodexMcpBlock({
          ...operation.server,
          name: operation.name,
        });
        manualFragments.push(prepared);
        manualActions.push(...prepared.manualActions);
      }
      continue;
    }
    const target =
      connection.agent === 'claude-code'
        ? '.mcp.json'
        : connection.agent === 'cursor'
          ? '.cursor/mcp.json'
          : null;
    assert(target, 'unsupported-agent', 'Unknown MCP target agent.');
    let current;
    try {
      current = await readCurrent(root, target, { forbiddenPaths });
    } catch (caught) {
      const error = caught as NodeJS.ErrnoException;
      if (error.code !== 'secret-content') throw error;
      manualActions.push({
        id: `mcp-${connection.agent}-secret`,
        description:
          'Remove literal credentials from the MCP config locally; never share their values.',
        status: 'pending',
      });
      continue;
    }
    const prepared = planMcpChanges(
      connection.agent,
      current.content,
      connection.operations ?? [],
      { availableEnvNames: [], targetContextKnown: false },
    );
    requestedChanges.push(...prepared.changes);
    manualActions.push(...prepared.manualActions);
    mcp.push({
      agent: connection.agent,
      trusted: connection.trusted === true,
      requiresExecutionTrust:
        prepared.changes.length > 0 &&
        (connection.operations ?? []).some(
          (operation) => operation.action === 'upsert',
        ),
      results: prepared.results ?? [],
      path: target,
    });
  }
  const changes: Change[] = [];
  const registered = new Map(
    infrastructureScope(baseline.manifest, [], []).map((file) => [
      file.path,
      file,
    ]),
  );
  const selectedFiles = [
    ...(input.sources ?? []),
    ...(input.componentUpdates ?? []).map((update) => update.source),
  ].flatMap((source) => source.files ?? []);
  for (const requested of requestedChanges) {
    const change = { ...requested };
    // A present unsafe path is never reported as internal, protected or stale;
    // a missing path keeps the application refusal below.
    if (typeof change.path === 'string') {
      validateRelativePath(change.path);
    }
    assert(
      !change.path?.startsWith('.tibicen/'),
      'forbidden-path',
      'Internal state is maintained by Tibicen, not content plans.',
    );
    assert(
      isInfrastructurePath(change.path ?? '') ||
        memoryAllows(memory, change.path) ||
        processAllows(processSetup.process, change.path) ||
        (input.mode === 'init' && emptyProject),
      'application-protected',
      'Application files are outside the infrastructure write boundary.',
    );
    const before = await readCurrent(root, change.path, { forbiddenPaths });
    if (change.managedBlock !== undefined) {
      assert(
        supportsManagedBlocks(change.path) &&
          change.action === undefined &&
          change.content === undefined,
        'invalid-managed-block',
        'Use managedBlock only for Markdown files, without action or full-file content.',
      );
      const content = updateManagedBlock(
        before.content,
        change.managedBlock,
        change.path,
      );
      if (
        content === before.content &&
        (change.fileMode === undefined || change.fileMode === before.mode)
      )
        continue;
      change.content = content;
    }
    const action = change.action ?? (before.hash === null ? 'add' : 'modify');
    assert(
      action === 'add' ? before.hash === null : before.hash !== null,
      'stale-plan',
      'The requested action does not match the actual file.',
    );
    if (action !== 'delete')
      assert(
        typeof change.content === 'string' && !containsSecret(change.content),
        'secret-content',
        'File content is missing or contains an inline secret.',
      );
    if (action !== 'delete' && supportsManagedBlocks(change.path))
      parseManagedBlock(change.content!, change.path);
    const upstream = selectedFiles.find((file) => file.path === change.path);
    const fileMode =
      action === 'delete'
        ? undefined
        : validateTargetFileMode(
            change.fileMode ??
              (upstream
                ? (upstream.fileMode ?? 0o644)
                : (before.mode ?? undefined)),
          );
    const previous = registered.get(change.path);
    const expectedHash = previous?.hash ?? previous?.afterHash;
    const expectedMode = previous?.mode ?? previous?.afterMode;
    const acceptsLocalChange =
      (baseline.pendingStateSchema === 4 &&
        memoryAllows(memory, change.path)) ||
      (expectedHash !== undefined && expectedHash !== before.hash) ||
      (expectedMode !== undefined && expectedMode !== before.mode);
    if (
      action === 'modify' &&
      change.content === before.content &&
      fileMode === before.mode &&
      !acceptsLocalChange
    )
      continue;
    const content = action === 'delete' ? null : change.content;
    changes.push({
      path: change.path,
      action,
      beforeHash: before.hash,
      beforeMode: before.mode,
      ...(content === null ? {} : { content, fileMode }),
      reason: change.reason,
      diff: proposalDiff(
        change.path,
        before.content,
        content ?? null,
        before.mode,
        fileMode ?? null,
      ),
    });
  }
  const preparedChecks = prepareCheckCommands(
    input.checks ?? {},
    input.compat ?? { enabled: true },
  );
  // Controlled non-web profiles pin interpreters and bind script bytes before validation.
  const profile =
    typeof input.checks?.profile === 'string' ? input.checks.profile : '';
  assert(
    ['', 'web', 'python', 'bash', 'docs'].includes(profile),
    'invalid-check-command',
    'Unknown checks profile.',
  );
  const controlledProfile = ['python', 'bash', 'docs'].includes(profile);
  const PINNED_INTERPRETERS = ['node', 'python3', 'python', 'bash'];
  const resolveOnPath = async (name: string) => {
    for (const directory of (process.env.PATH ?? '').split(path.delimiter)) {
      // Relative PATH entries depend on the caller's cwd and cannot pin anything.
      if (!directory || !path.isAbsolute(directory)) continue;
      const candidate = path.join(
        directory,
        process.platform === 'win32' ? `${name}.exe` : name,
      );
      try {
        const info = await stat(candidate);
        if (
          info.isFile() &&
          (process.platform === 'win32' || info.mode & 0o111)
        )
          return candidate;
      } catch {
        // Absent PATH entries are skipped; unreadable candidates are not executables.
      }
    }
    return null;
  };
  const requestedCommands = (input.commands ?? []).map((command) => ({
    ...command,
  }));
  for (const command of requestedCommands) {
    if (command.script === undefined) continue;
    assert(
      controlledProfile,
      'invalid-check-command',
      'Script bindings belong to the controlled non-web profiles.',
    );
    assert(
      command.script !== null &&
        typeof command.script.path === 'string' &&
        command.script.path,
      'invalid-command',
      'A script binding needs its project-relative path.',
    );
    const reviewed = await readCurrent(root, command.script.path, {
      forbiddenPaths,
    });
    assert(
      reviewed.hash !== null,
      'command-script-unavailable',
      'The bound command script must exist in the project.',
    );
    if (command.script.hash !== undefined)
      assert(
        command.script.hash === reviewed.hash,
        'command-source-changed',
        'The bound script differs from the hash submitted for review.',
      );
    command.script = { path: command.script.path, hash: reviewed.hash };
    if (command.argv?.[0] === command.script.path)
      command.argv = [`./${command.script.path}`, ...command.argv.slice(1)];
  }
  if (controlledProfile) {
    assert(
      !(input.checks ?? {}).environment,
      'invalid-node-environment',
      'Dependency environments belong to the web profile.',
    );
    const resolved = new Map<string, string | null>();
    for (const command of requestedCommands.filter((command) =>
      ['build', 'test', 'lint'].includes(command.kind),
    )) {
      // The argv rule below keys on the interpreter name and covers bare and
      // absolute spellings alike; a pinned-looking path is not a freer route.
      const interpreter = PINNED_INTERPRETERS.includes(command.executable)
        ? command.executable
        : PINNED_INTERPRETERS.includes(executableName(command))
          ? executableName(command)
          : null;
      if (PINNED_INTERPRETERS.includes(command.executable)) {
        let pinned = resolved.get(command.executable);
        if (pinned === undefined) {
          pinned = await resolveOnPath(command.executable);
          resolved.set(command.executable, pinned);
        }
        assert(
          pinned,
          'interpreter-unavailable',
          'The interpreter for this controlled check was not found on PATH.',
        );
        command.executable = pinned;
      } else {
        assert(
          path.isAbsolute(command.executable) ||
            command.executable.startsWith('./'),
          'invalid-check-command',
          'Controlled checks need a pinned interpreter or an explicit project entrypoint.',
        );
        // A project entrypoint runs its own bytes; those must be the bound reviewed bytes.
        if (command.executable.startsWith('./'))
          assert(
            command.script?.path === command.executable.slice(2),
            'invalid-check-command',
            'A project entrypoint check must bind the executed file bytes.',
          );
      }
      await validateExternalExecutable(root, command.executable);
      if (interpreter !== null)
        // Interpreters run reviewed bytes or an installed module; every other
        // spelling (-p, --eval=, clustered -Ic, …) can carry inline code.
        assert(
          (command.script !== undefined &&
            command.argv?.[0] === `./${command.script.path}`) ||
            (['python3', 'python'].includes(interpreter) &&
              command.argv?.[0] === '-m' &&
              command.argv.length >= 2),
          'forbidden-command',
          'A pinned interpreter accepts only a bound ./ script argument or an installed -m module.',
        );
    }
  } else
    for (const command of requestedCommands.filter((command) =>
      ['build', 'test', 'lint'].includes(command.kind),
    ))
      assert(
        executableName(command) !== 'bash',
        'forbidden-command',
        'Bash stays limited to the controlled non-web profiles.',
      );
  const commands = [...requestedCommands, ...preparedChecks.commands].map(
    (command) => validateCommand({ cwd: '.', envNames: [], ...command }),
  );
  assert(
    input.migrateManifest === undefined ||
      typeof input.migrateManifest === 'boolean',
    'invalid-plan',
    'migrateManifest must be boolean.',
  );
  const componentUpdates = input.componentUpdates ?? [];
  assert(
    Array.isArray(componentUpdates) && Array.isArray(input.sources ?? []),
    'invalid-component-update',
    'Sources and componentUpdates must be arrays.',
  );
  const sources = [
    ...(input.sources ?? []),
    ...componentUpdates.map((update) => update.source),
  ];
  const components = await planComponents(
    baseline,
    sources,
    componentUpdates,
    changes,
    (relative) => readCurrent(root, relative, { forbiddenPaths }),
    input.migrateManifest,
    memory ? 3 : 2,
  );
  const sharedStatus = await inspectSharedRules(
    sharedRules,
    async (relative) => {
      const change = changes.find((change) => change.path === relative);
      return change
        ? { content: change.action === 'delete' ? null : change.content! }
        : readCurrent(root, relative, { forbiddenPaths });
    },
  );
  const { environment, ...requestedChecks } = input.checks ?? {};
  const checks: Proposal['checks'] = { ...requestedChecks };
  if (environment) {
    assert(
      environment.kind === 'local-node-modules',
      'invalid-node-environment',
      'Select a supported local dependency environment.',
    );
    const node = await realpath(process.execPath);
    for (const command of commands.filter((command) =>
      ['build', 'test', 'lint'].includes(command.kind),
    )) {
      if (command.executable === 'node') command.executable = process.execPath;
      assert(
        path.isAbsolute(command.executable) &&
          (await realpath(command.executable).catch(() => null)) === node,
        'invalid-node-environment',
        'Local dependency checks require an explicit entrypoint in this Node runtime.',
      );
    }
    checks.environment = await inspectNodeEnvironment(root, environment.roots, {
      forbiddenPaths,
    });
  }
  const proposal: Proposal = {
    schema: memory ? 2 : 1,
    ...(memory ? { memory } : {}),
    root,
    mode: input.mode,
    emptyProject,
    forbiddenPaths,
    changes,
    commands,
    ...(processSetup.process ? { process: processSetup.process } : {}),
    sources,
    components,
    componentUpdates,
    sharedRules,
    migrateManifest: input.migrateManifest === true,
    retryCommands: input.retryCommands ?? [],
    assumptions: input.assumptions ?? [],
    gaps: input.gaps ?? [],
    manualActions,
    manualFragments,
    mcp,
    checks,
    compat: input.compat ?? { enabled: true },
    practices: input.practices ?? [],
    unavailableChecks: preparedChecks.unavailable,
    serviceWrites: ['.tibicen/manifest.yml', '.tibicen/state/session.json'],
    usageFile: path.join(home, '.tibicen', 'usage.json'),
  };
  validateProposal(proposal);
  const processStatus = await inspectProcess(
    proposal.process,
    async (relative) => {
      const change = changes.find((item) => item.path === relative);
      return change
        ? {
            content: change.content ?? null,
            hash:
              change.content === undefined
                ? null
                : hashContent(change.content!),
          }
        : readCurrent(root, relative, { forbiddenPaths });
    },
  );
  return {
    proposal,
    digest: digest(proposal),
    summary: {
      files: changes.map(({ path, action, reason, beforeMode, fileMode }) => ({
        path,
        action,
        reason,
        beforeMode,
        ...(fileMode === undefined ? {} : { fileMode }),
      })),
      components,
      ...(memory ? { memory } : {}),
      sharedRules: sharedStatus,
      ...(proposal.process
        ? { process: { ...proposal.process, verification: processStatus } }
        : {}),
      commands: commands.map(
        ({ id, kind, executable, argv, cwd, envNames, script }) => ({
          id,
          kind,
          executable,
          argv,
          cwd,
          envNames,
          ...(script ? { script } : {}),
        }),
      ),
      retryCommands: proposal.retryCommands,
      assumptions: proposal.assumptions,
      manualActions: proposal.manualActions,
      gaps: proposal.gaps,
    },
  };
}

export function unwrapPlan(input: unknown) {
  const proposal =
    (input as { proposal?: Proposal })?.proposal ?? (input as Proposal);
  assert(
    !('approved' in proposal) &&
      !('approval' in proposal) &&
      !('approvedDigest' in proposal),
    'invalid-plan',
    'Input cannot grant its own consent.',
  );
  return validateProposal(proposal);
}
