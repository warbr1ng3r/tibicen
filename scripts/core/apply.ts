import type { Proposal, Session, ApplyOptions, Runner } from './types.ts';
import path from 'node:path';
import os from 'node:os';
import { randomUUID } from 'node:crypto';
import {
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
  realpath,
  stat,
  chmod,
} from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  parseData,
  serializeData,
  validateFileMode,
} from './contracts.ts';
import { safePath, isInfrastructurePath } from './paths.ts';
import {
  containsSecret,
  isEmptyProject,
  readCurrent,
  unwrapPlan,
} from './plan.ts';
import { runCommand, validateCommand } from './execute.ts';
import { loadBlocklist } from './policy.ts';
import { parseManagedBlock, supportsManagedBlocks } from './blocks.ts';
import { planComponents, readManifest } from './components.ts';
import {
  inspectRecovery,
  recoverPlanningBaseline,
  resultHash,
  changeModes,
  STATE_SCHEMA,
} from './recovery.ts';
import { bindRunner, commandIdentity, COPY_MARKER } from './checks.ts';
import { inspectSharedRules, resolveSharedRules } from './shared-rules.ts';
import { inspectProcess, processAllows } from '../process/index.ts';
import { mcpNeedsExecutionTrust } from '../mcp/index.ts';
import { finalizeSession, mergeHistory } from './finalize.ts';

export async function atomicWrite(
  root: string,
  relative: string,
  content: string,
  {
    expectedHash,
    expectedMode,
    fileMode = 0o600,
  }: {
    expectedHash?: string | null;
    expectedMode?: number | null;
    fileMode?: number;
  } = {},
) {
  validateFileMode(fileMode);
  let filename = await safePath(root, relative);
  await mkdir(path.dirname(filename), { recursive: true });
  filename = await safePath(root, relative);
  const temporary = `${filename}.${randomUUID()}.tmp`;
  try {
    await writeFile(temporary, content, { flag: 'wx', mode: fileMode });
    await chmod(temporary, fileMode);
    await safePath(root, relative);
    if (expectedHash !== undefined) {
      let actualHash: string | null = null;
      try {
        actualHash = hashContent(await readFile(filename));
      } catch (caught) {
        const error = caught as NodeJS.ErrnoException;
        if (error.code !== 'ENOENT') throw error;
      }
      assert(
        actualHash === expectedHash,
        'stale-plan',
        'Concurrent file change detected before replacement.',
      );
    }
    if (expectedMode !== undefined) {
      const actualMode = await stat(filename).then(
        (info) => info.mode & 0o777,
        (error) => {
          if (error.code === 'ENOENT') return null;
          throw error;
        },
      );
      assert(
        actualMode === expectedMode,
        'stale-plan',
        'Concurrent permission change detected before replacement.',
      );
    }
    await rename(temporary, filename);
  } finally {
    await rm(temporary, { force: true });
  }
}

async function readInternal<T>(root: string, relative: string) {
  const filename = await safePath(root, relative);
  try {
    return parseData(await readFile(filename, 'utf8')) as T;
  } catch (caught) {
    const error = caught as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') return null;
    throw error;
  }
}

export async function getStatus(root: string) {
  root = await realpath(root);
  const state = await readInternal<Session>(
    root,
    '.tibicen/state/session.json',
  );
  const { manifest, hash: manifestHash } = await readManifest(root);
  const recovery = state
    ? await inspectRecovery(root, state, manifestHash)
    : null;
  const observedApplied = state
    ? recovery!.files
        .filter((file) => file.state === 'matches-approved-result')
        .map((file) => ({
          path: file.path,
          action:
            state.proposal.changes.find((change) => change.path === file.path)
              ?.action ??
            state.applied.find((item) => item.path === file.path)!.action,
          beforeHash: file.beforeHash,
          afterHash: file.afterHash,
          ...(file.beforeMode === undefined
            ? {}
            : { beforeMode: file.beforeMode }),
          ...(file.afterMode === undefined
            ? {}
            : { afterMode: file.afterMode }),
          evidence:
            state.applied.find((item) => item.path === file.path)?.evidence ??
            ('matches-approved-result' as const),
        }))
    : (manifest?.changes ?? []);
  return {
    schema: 1,
    status: state
      ? 'incomplete'
      : (manifest?.tibicen?.status ?? 'not-configured'),
    state,
    manifest,
    manifestHash,
    recovery,
    observedApplied,
  };
}

async function sourceGate(proposal: Proposal, options: ApplyOptions) {
  if (!proposal.sources.length) return;
  const discovery = await import('../discovery/index.ts');
  const discoveryOptions = {
    ...options.discovery,
    sourceCache: new Map<string, unknown>(),
    blocklist: options.discovery?.blocklist ?? (await loadBlocklist()),
  };
  await discovery.validateSources(proposal.sources, discoveryOptions);
  for (const source of proposal.sources) {
    if (source.kind === 'mcp' && !(source.files ?? []).length) continue;
    assert(
      Array.isArray(source.files) && source.files.length,
      'invalid-source',
      'Installed sources need exact target file hashes.',
    );
    for (const file of source.files) {
      const change = proposal.changes.find(
        (change) => change.path === file.path,
      );
      assert(
        isInfrastructurePath(file.path) && change?.action !== 'delete',
        'invalid-source',
        'Source file must name retained or installed infrastructure.',
      );
      const content = await discovery.fetchSourceFile(
        { repo: source.repo, sha: source.sha, sourcePath: file.sourcePath },
        discoveryOptions,
      );
      const expected =
        change?.content ??
        (
          await readCurrent(proposal.root, file.path, {
            forbiddenPaths: proposal.forbiddenPaths,
          })
        ).content;
      const planned = proposal.components.files.find(
        (item) => item.path === file.path,
      );
      assert(
        hashContent(content) === file.contentHash &&
          planned &&
          planned.afterHash ===
            (expected === null ? null : hashContent(expected)),
        'source-mismatch',
        'Pinned source or approved local content does not match the component plan.',
      );
      if (planned.resolution === 'replace' && planned.afterMode !== undefined)
        assert(
          planned.afterMode === (file.fileMode ?? 0o644),
          'source-mode-mismatch',
          'Replacement permissions must match the pinned source.',
        );
    }
  }
}

export async function applyPlan(
  root: string,
  input: unknown,
  options: ApplyOptions = {},
) {
  root = await realpath(root);
  const home = await realpath(options.home ?? os.homedir());
  const previous = await getStatus(root);
  const proposal = unwrapPlan(input ?? previous.state?.proposal);
  const proposalDigest = digest(proposal);
  assert(
    options.approvedDigest === proposalDigest,
    'consent-required',
    'Approve the digest of this exact proposal before writing or executing.',
  );
  assert(
    root === proposal.root,
    'invalid-plan',
    'Proposal belongs to another project.',
  );
  assert(
    proposal.usageFile === path.join(home, '.tibicen', 'usage.json'),
    'invalid-plan',
    'Proposal must show the actual local usage counter path.',
  );
  assert(
    JSON.stringify(proposal.serviceWrites) ===
      JSON.stringify(['.tibicen/manifest.yml', '.tibicen/state/session.json']),
    'invalid-plan',
    'Internal writes must be disclosed in the proposal.',
  );
  if (previous.state)
    assert(
      options.resume === true,
      'resume-required',
      'Unfinished work must be resumed with new consent.',
    );
  if (options.resume && previous.state) {
    assert(
      previous.recovery!.manifest !== 'ambiguous',
      'tamper-suspect',
      'Passport matches neither the recorded input nor the pending write.',
    );
    for (const file of previous.recovery!.files.filter(
      (file) => file.state === 'ambiguous',
    ))
      assert(
        previous.state.proposalDigest !== proposalDigest &&
          file.actualHash !== undefined &&
          proposal.changes.some(
            (change) =>
              change.path === file.path &&
              change.beforeHash === file.actualHash,
          ),
        'tamper-suspect',
        'A file matches neither the approved input nor result; show its exact repair in a newly approved proposal.',
      );
    for (const applied of previous.state.applied) {
      if (
        previous.state.proposal.changes.some(
          (change) => change.path === applied.path,
        )
      )
        continue;
      const actual = await readCurrent(root, applied.path, {
        forbiddenPaths: proposal.forbiddenPaths,
      });
      assert(
        (actual.hash === applied.afterHash &&
          (applied.afterMode === undefined ||
            actual.mode === applied.afterMode)) ||
          (previous.state.proposalDigest !== proposalDigest &&
            proposal.changes.some(
              (change) =>
                change.path === applied.path &&
                change.beforeHash === actual.hash,
            )),
        'tamper-suspect',
        'Previously applied file changed; show a new proposal instead of automatic resume.',
      );
    }
  }
  const oldState = previous.state;
  const continuingSamePlan = oldState?.proposalDigest === proposalDigest;
  const alreadyApplied = continuingSamePlan
    ? proposal.changes
        .filter((change) =>
          previous.recovery!.files.some(
            (file) =>
              file.path === change.path &&
              file.state === 'matches-approved-result',
          ),
        )
        .map((change) => ({
          path: change.path,
          action: change.action,
          beforeHash: change.beforeHash,
          afterHash: resultHash(change),
          ...changeModes(change),
          evidence:
            oldState!.applied.find((item) => item.path === change.path)
              ?.evidence ?? ('matches-approved-result' as const),
        }))
    : [];
  const componentBaseline = continuingSamePlan
    ? oldState!.componentBaseline
    : await recoverPlanningBaseline(
        root,
        { manifest: previous.manifest, hash: previous.manifestHash },
        oldState,
      );
  const registeredProcess =
    componentBaseline?.recoveredProcess ?? componentBaseline?.manifest?.process;
  assert(
    !registeredProcess ||
      (proposal.process &&
        proposal.process.agent === registeredProcess.agent &&
        proposal.process.agentVersion === registeredProcess.agentVersion),
    'invalid-process',
    'A plan must retain the registered process target.',
  );
  const processBefore = await inspectProcess(
    proposal.process,
    async (relative) => {
      const change = proposal.changes.find((item) => item.path === relative);
      return change
        ? {
            content: change.content ?? null,
            hash:
              change.content === undefined
                ? null
                : hashContent(change.content!),
          }
        : readCurrent(root, relative, {
            forbiddenPaths: proposal.forbiddenPaths,
          });
    },
    registeredProcess,
  );
  assert(
    !processBefore.issues.length,
    'stale-process',
    'Process resources changed or are unsupported; prepare a new exact proposal.',
  );
  assert(
    componentBaseline && (!oldState || oldState.manifestHash !== undefined),
    'unsupported-state-schema',
    'Older saved work needs an explicit migration; automatic continuation did not change files.',
  );
  assert(
    digest(
      resolveSharedRules(
        proposal.sharedRules ?? [],
        componentBaseline.recoveredSharedRules ??
          componentBaseline.manifest?.sharedRules ??
          [],
      ),
    ) === digest(proposal.sharedRules ?? []),
    'invalid-shared-rules',
    'A plan must retain the registered shared materials and every linked copy.',
  );
  assert(
    (proposal.sharedRules ?? []).every((rule) => !containsSecret(rule.content)),
    'secret-content',
    'Shared instructions cannot contain inline secrets.',
  );
  const components = await planComponents(
    componentBaseline,
    proposal.sources,
    proposal.componentUpdates ?? [],
    proposal.changes,
    async (relative) => {
      const current = await readCurrent(root, relative, {
        forbiddenPaths: proposal.forbiddenPaths,
      });
      const applied = alreadyApplied.find((item) => item.path === relative);
      if (!applied) return current;
      assert(
        current.hash === applied.afterHash,
        'tamper-suspect',
        'Previously applied component changed.',
      );
      const content = oldState!.planOriginals[relative];
      return {
        content,
        hash: content === null ? null : hashContent(content),
        mode: proposal.changes.find((change) => change.path === relative)
          ?.beforeMode,
      };
    },
    proposal.migrateManifest,
  );
  assert(
    digest(components) === digest(proposal.components),
    'stale-plan',
    'Component ownership, local files or passport changed; approve a new proposal.',
  );
  const { checkBlocklist } = await import('../discovery/index.ts');
  const retained = components.files.flatMap((file) =>
    file.next
      ? [
          file.next,
          ...(file.previous && file.resolution !== 'replace'
            ? [file.previous]
            : []),
        ]
      : [],
  );
  checkBlocklist(
    retained,
    options.discovery?.blocklist ?? (await loadBlocklist()),
  );
  const originalEmpty = oldState?.originalEmpty ?? (await isEmptyProject(root));
  for (const command of proposal.commands) {
    validateCommand(command);
    assert(
      !['install', 'git-init'].includes(command.kind) ||
        (proposal.mode === 'init' && originalEmpty),
      'application-protected',
      'Dependency installation and git init are limited to a new empty project.',
    );
    if (['install', 'git-init'].includes(command.kind))
      assert(
        command.trusted === true,
        'trust-required',
        'Setup execution requires explicit trust.',
      );
  }
  const retries = proposal.retryCommands ?? [];
  for (const unknown of previous.recovery?.unknownCommands ?? []) {
    if (!['install', 'git-init'].includes(unknown.kind)) continue;
    assert(
      retries.some(
        (retry) =>
          retry.id === unknown.id &&
          retry.commandDigest === unknown.commandDigest,
      ) &&
        proposal.commands.some(
          (command) =>
            command.id === unknown.id &&
            digest(command) === unknown.commandDigest,
        ),
      'command-outcome-unknown',
      'The last command outcome is unknown; show its exact retry and a separate reason in a newly approved proposal.',
    );
  }
  for (const retry of retries)
    assert(
      oldState?.commandAttempts.some(
        (attempt) =>
          attempt.id === retry.id &&
          attempt.commandDigest === retry.commandDigest &&
          (['running', 'unknown'].includes(attempt.status) ||
            attempt.retryReason === retry.reason),
      ),
      'invalid-command-retry',
      'A retry must address a recorded unknown command outcome.',
    );
  for (const change of proposal.changes) {
    assert(
      !change.path.startsWith('.tibicen/'),
      'forbidden-path',
      'Content plans cannot alter internal state.',
    );
    assert(
      isInfrastructurePath(change.path) ||
        processAllows(proposal.process, change.path) ||
        (proposal.mode === 'init' && proposal.emptyProject && originalEmpty),
      'application-protected',
      'Application files are protected.',
    );
    if (alreadyApplied.some((item) => item.path === change.path)) continue;
    const current = await readCurrent(root, change.path, {
      forbiddenPaths: proposal.forbiddenPaths,
    });
    assert(
      current.hash === change.beforeHash &&
        (change.beforeMode === undefined || current.mode === change.beforeMode),
      'stale-plan',
      'File changed since proposal; stop and request a new plan.',
    );
    assert(
      change.content === undefined || !containsSecret(change.content!),
      'secret-content',
      'Inline secrets are excluded.',
    );
    if (change.action !== 'delete' && supportsManagedBlocks(change.path))
      parseManagedBlock(change.content!, change.path);
  }
  for (const change of proposal.changes) {
    const agent =
      change.path === '.mcp.json'
        ? 'claude-code'
        : change.path === '.cursor/mcp.json'
          ? 'cursor'
          : null;
    if (!agent) continue;
    const before = alreadyApplied.some((item) => item.path === change.path)
      ? oldState!.planOriginals[change.path]
      : (
          await readCurrent(root, change.path, {
            forbiddenPaths: proposal.forbiddenPaths,
          })
        ).content;
    if (
      mcpNeedsExecutionTrust(
        agent,
        before,
        change.action === 'delete' ? null : change.content!,
      )
    ) {
      assert(
        proposal.mcp?.some(
          (connection) =>
            connection.agent === agent &&
            connection.path === change.path &&
            connection.trusted === true,
        ),
        'trust-required',
        'Changed MCP auto-start code requires explicit trust for its target config.',
      );
    }
  }
  await sourceGate(proposal, options);
  const originals = { ...oldState?.originals };
  const planOriginals = continuingSamePlan
    ? { ...oldState!.planOriginals }
    : ({} as Record<string, string | null>);
  for (const change of proposal.changes) {
    if (!(change.path in planOriginals))
      planOriginals[change.path] = (
        await readCurrent(root, change.path, {
          forbiddenPaths: proposal.forbiddenPaths,
        })
      ).content;
    if (!(change.path in originals))
      originals[change.path] = planOriginals[change.path];
  }
  const applied = [
    ...new Map(
      [
        ...(oldState?.applied ?? []),
        ...(oldState ? previous.observedApplied : []),
      ]
        .filter(
          (item) =>
            !proposal.changes.some((change) => change.path === item.path),
        )
        .map((item) => [item.path, item]),
    ).values(),
  ];
  for (const record of alreadyApplied) {
    const index = applied.findIndex((item) => item.path === record.path);
    if (index < 0) applied.push(record);
    else applied[index] = record;
  }
  const priorComponents = oldState?.proposal.components;
  const migration =
    oldState?.history.manifestMigration ??
    (priorComponents &&
    priorComponents.fromSchema !== null &&
    priorComponents.fromSchema !== priorComponents.toSchema
      ? { from: priorComponents.fromSchema, to: priorComponents.toSchema }
      : null);
  const history: Session['history'] = {
    changes: mergeHistory(
      oldState?.history.changes ?? [],
      oldState?.applied ?? [],
      oldState ? previous.observedApplied : [],
    ),
    components: mergeHistory(
      oldState?.history.components ?? [],
      !continuingSamePlan && priorComponents
        ? priorComponents.files.filter(
            (file) =>
              file.resolution !== 'unchanged' ||
              digest(file.previous) !== digest(file.next),
          )
        : [],
    ),
    sharedRules: mergeHistory(
      oldState?.history.sharedRules ?? [],
      oldState?.proposal.sharedRules ?? [],
    ),
    ...(oldState?.proposal.process
      ? {
          processHistory: mergeHistory(oldState.history.processHistory ?? [], [
            oldState.proposal.process,
          ]),
        }
      : {}),
    ...(migration ? { manifestMigration: migration } : {}),
  };
  const session: Session = {
    schema: STATE_SCHEMA,
    id:
      oldState?.id ??
      (options.resume ? previous.manifest?.sessions?.at(-1)?.id : null) ??
      randomUUID(),
    proposal,
    proposalDigest,
    originalEmpty,
    originals,
    planOriginals,
    applied,
    history,
    attempts: [
      ...(oldState?.attempts ??
        (options.resume
          ? previous.manifest?.sessions?.at(-1)?.attempts
          : null) ??
        []),
    ],
    status: 'incomplete',
    checks: {
      infrastructure: {
        kind: 'infrastructure',
        status: 'unverified',
        reason: 'not-run',
      },
      verify: {
        kind: 'verify',
        status: 'unverified',
        reason: options.resume ? 'baseline-unavailable' : 'not-run',
      },
      task: { kind: 'task', status: 'unverified', reason: 'not-requested' },
      quiz: { kind: 'quiz', status: 'unverified', reason: 'not-requested' },
    },
    baseline: oldState?.baseline ?? null,
    completedCommands: oldState?.completedCommands ?? [],
    commandAttempts: (
      oldState?.commandAttempts ??
      (options.resume
        ? previous.manifest?.sessions?.at(-1)?.commandAttempts
        : null) ??
      []
    ).map((attempt) => ({
      ...attempt,
      status: attempt.status === 'running' ? 'unknown' : attempt.status,
    })),
    componentBaseline,
    manifestHash: previous.manifestHash,
  };
  const attempt: Session['attempts'][number] = {
    number: session.attempts.length + 1,
    kind: 'infrastructure',
    outcome: 'incomplete',
    reason: 'interrupted',
  };
  session.attempts.push(attempt);
  const persist = () =>
    atomicWrite(root, '.tibicen/state/session.json', serializeData(session));
  await persist();
  const executeCheck = bindRunner(proposal, proposalDigest);
  const journaledRunner: Runner = async (command, runOptions) => {
    const setup = ['install', 'git-init'].includes(command.kind);
    const declared = proposal.commands.find((item) =>
      setup
        ? digest(item) === digest(command)
        : commandIdentity(item, COPY_MARKER) ===
          commandIdentity(command, runOptions.root),
    );
    assert(
      declared && (!setup || runOptions.root === root),
      'unapproved-command',
      'Execution must match an exact declared command and its controlled root.',
    );
    const commandDigest = digest(declared);
    const retry = retries.find(
      (retry) => retry.commandDigest === commandDigest,
    );
    const last = session.commandAttempts.findLast(
      (attempt) => attempt.commandDigest === commandDigest,
    );
    if (last && ['unknown', 'running'].includes(last.status) && !retry)
      return {
        exitCode: null,
        reason: 'command-outcome-unknown',
        stdout: '',
        stderr: '',
        timedOut: false,
      };
    assert(
      command.trusted === true,
      'trust-required',
      'The shown code must be explicitly trusted before execution.',
    );
    await safePath(runOptions.root, command.cwd, { allowDot: true });
    const commandAttempt: Session['commandAttempts'][number] = {
      id: declared.id,
      kind: declared.kind,
      commandDigest,
      status: 'running',
      ...(retry ? { retryReason: retry.reason } : {}),
    };
    session.commandAttempts.push(commandAttempt);
    await persist();
    const result = setup
      ? await runCommand(command, {
          ...runOptions,
          approvedDigest: proposalDigest,
        })
      : await executeCheck(command, runOptions);
    await options.checkpoint?.('after-command', session);
    commandAttempt.status = result.exitCode === 0 ? 'completed' : 'failed';
    if (result.reason) commandAttempt.reason = result.reason;
    if (setup && result.exitCode === 0)
      session.completedCommands.push(commandDigest);
    await persist();
    return result;
  };
  const finalization = {
    root,
    home,
    session,
    attempt,
    previousManifest: previous.manifest,
    persist,
    atomicWrite,
    checkpoint: options.checkpoint,
  };
  try {
    if (options.beforeApply && !oldState && !options.resume) {
      session.baseline = await options.beforeApply(proposal, {
        approvedDigest: proposalDigest,
        runner: journaledRunner,
      });
      await persist();
    }
    for (const change of proposal.changes) {
      if (alreadyApplied.some((item) => item.path === change.path)) continue;
      const actual = await readCurrent(root, change.path, {
        forbiddenPaths: proposal.forbiddenPaths,
      });
      assert(
        actual.hash === change.beforeHash &&
          (change.beforeMode === undefined ||
            actual.mode === change.beforeMode),
        'stale-plan',
        'Concurrent edit detected before write.',
      );
      await options.checkpoint?.('before-file-write', session, change);
      if (change.action === 'delete') {
        const beforeDelete = await readCurrent(root, change.path, {
          forbiddenPaths: proposal.forbiddenPaths,
        });
        assert(
          beforeDelete.hash === change.beforeHash &&
            (change.beforeMode === undefined ||
              beforeDelete.mode === change.beforeMode),
          'stale-plan',
          'File changed before deletion.',
        );
        await rm(
          await safePath(root, change.path, {
            forbiddenPaths: proposal.forbiddenPaths,
          }),
        );
      } else {
        await atomicWrite(root, change.path, change.content!, {
          expectedHash: change.beforeHash,
          expectedMode: change.beforeMode,
          fileMode: change.fileMode ?? actual.mode ?? 0o600,
        });
      }
      await options.checkpoint?.('after-file-write', session, change);
      const record = {
        path: change.path,
        action: change.action,
        beforeHash: change.beforeHash,
        afterHash: resultHash(change),
        ...changeModes(change),
        evidence: 'written' as const,
      };
      const index = session.applied.findIndex(
        (item) => item.path === change.path,
      );
      if (index < 0) session.applied.push(record);
      else session.applied[index] = record;
      await persist();
      await options.afterChange?.(change, session);
    }
    for (const command of proposal.commands) {
      if (session.completedCommands.includes(digest(command))) continue;
      assert(
        command.kind !== 'install' || originalEmpty,
        'application-protected',
        'Existing application dependency files are protected.',
      );
      if (
        ['build', 'test', 'lint', 'task', 'quiz', 'compat'].includes(
          command.kind,
        )
      )
        continue;
      const result = await journaledRunner(command, {
        root,
        approvedDigest: proposalDigest,
        timeoutMs: options.timeoutMs,
      });
      assert(
        result.exitCode === 0,
        result.reason ?? 'command-failed',
        'Approved setup command did not complete.',
      );
    }
    const verification =
      options.verify ??
      (async () => {
        const { verifyInfrastructure } = await import('../verify/index.ts');
        return {
          infrastructure: await verifyInfrastructure(root, {
            components: proposal.components,
            expectedFiles: session.applied.filter((item) =>
              isInfrastructurePath(item.path),
            ),
            forbiddenPaths: proposal.forbiddenPaths,
            sharedRules: proposal.sharedRules ?? [],
            process: proposal.process,
          }),
        };
      });
    Object.assign(
      session.checks,
      await verification(proposal, session, { runner: journaledRunner }),
    );
    const processStatus = await inspectProcess(proposal.process, (relative) =>
      readCurrent(root, relative, { forbiddenPaths: proposal.forbiddenPaths }),
    );
    if (proposal.process) session.checks.infrastructure.process = processStatus;
    if (processStatus.issues.length)
      session.checks.infrastructure = {
        ...session.checks.infrastructure,
        status: 'issues-found',
        issues: [
          ...(session.checks.infrastructure.issues ?? []),
          ...processStatus.issues,
        ],
      };
    const sharedStatus = await inspectSharedRules(
      proposal.sharedRules ?? [],
      (relative) =>
        readCurrent(root, relative, {
          forbiddenPaths: proposal.forbiddenPaths,
        }),
    );
    if (sharedStatus.issues.length)
      session.checks.infrastructure = {
        ...session.checks.infrastructure,
        status: 'issues-found',
        issues: [
          ...new Map(
            [
              ...(session.checks.infrastructure.issues ?? []),
              ...sharedStatus.issues,
            ].map((issue) => [digest(issue), issue]),
          ).values(),
        ],
      };
    if (session.checks.verify.status === 'unverified')
      session.checks.verify.newRegressions = [
        ...new Map(
          [
            ...session.attempts.flatMap(
              (attempt) => attempt.newRegressions ?? [],
            ),
            ...(session.checks.verify.newRegressions ?? []),
          ].map((regression) => [regression.id, regression]),
        ).values(),
      ];
    for (const file of components.files) {
      const actual = await readCurrent(root, file.path, {
        forbiddenPaths: proposal.forbiddenPaths,
      });
      assert(
        actual.hash === file.afterHash &&
          (file.afterMode === undefined || actual.mode === file.afterMode),
        'stale-plan',
        'Component bytes or permissions changed during application.',
      );
    }
    return await finalizeSession(finalization);
  } catch (caught) {
    return finalizeSession(finalization, {
      error: caught as NodeJS.ErrnoException,
    });
  }
}
