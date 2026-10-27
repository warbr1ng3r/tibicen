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
  validateFileMode,
  validateProposal,
} from './contracts.ts';
import { safePath, isInfrastructurePath } from './paths.ts';
import { validateCommand } from './execute.ts';
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

export function containsSecret(content: string) {
  if (
    /(?:\b(?:sk-|gh[pousr]_|github_pat_)[a-zA-Z0-9_-]{16,}|-----BEGIN [A-Z ]*PRIVATE KEY-----)/.test(
      content,
    )
  )
    return true;
  // Start once per identifier, rather than retrying a long prefix from every character.
  for (const match of content.matchAll(
    /(?<![a-z0-9_-])["']?([a-z0-9_-]+)["']?\s*[:=]/gi,
  )) {
    if (
      /(?:api[_-]?key|token|password|secret)$/i.test(match[1]) &&
      /^\s*["'](?!\$\{|<|\[redacted\]|\*{3})[^"'\s]{4,}["']/.test(
        content.slice(match.index + match[0].length),
      )
    )
      return true;
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
    assert(
      !change.path?.startsWith('.tibicen/'),
      'forbidden-path',
      'Internal state is maintained by Tibicen, not content plans.',
    );
    assert(
      isInfrastructurePath(change.path ?? '') ||
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
        : validateFileMode(
            change.fileMode ??
              (upstream
                ? (upstream.fileMode ?? 0o644)
                : (before.mode ?? 0o600)),
          );
    const previous = registered.get(change.path);
    const expectedHash = previous?.hash ?? previous?.afterHash;
    const expectedMode = previous?.mode ?? previous?.afterMode;
    const acceptsLocalChange =
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
    const beforeLines = before.content?.split('\n') ?? [];
    const afterLines = content?.split('\n') ?? [];
    changes.push({
      path: change.path,
      action,
      beforeHash: before.hash,
      beforeMode: before.mode,
      ...(content === null ? {} : { content, fileMode }),
      reason: change.reason,
      diff: `--- ${change.path}\n+++ ${change.path}\n${fileMode !== undefined && before.mode !== fileMode ? `old mode ${before.mode === null ? 'absent' : before.mode.toString(8)}\nnew mode ${fileMode.toString(8)}\n` : ''}@@ -1,${beforeLines.length} +1,${afterLines.length} @@\n${beforeLines
        .map((line) => `-${line}`)
        .concat(afterLines.map((line) => `+${line}`))
        .join('\n')}`,
    });
  }
  const preparedChecks = prepareCheckCommands(
    input.checks ?? {},
    input.compat ?? { enabled: true },
  );
  const commands = [...(input.commands ?? []), ...preparedChecks.commands].map(
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
    schema: 1,
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
      sharedRules: sharedStatus,
      ...(proposal.process
        ? { process: { ...proposal.process, verification: processStatus } }
        : {}),
      commands: commands.map(
        ({ id, kind, executable, argv, cwd, envNames }) => ({
          id,
          kind,
          executable,
          argv,
          cwd,
          envNames,
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
