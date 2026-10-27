import type { Session, Manifest, ApplyOptions } from './types.ts';
import path from 'node:path';
import { readFile, rm } from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  parseData,
  serializeData,
  VERSION,
} from './contracts.ts';
import { safePath } from './paths.ts';
import { readCurrent } from './plan.ts';
import {
  installedComponents,
  MANIFEST_SCHEMA,
  readManifest,
} from './components.ts';
import { manifestRecovery } from './recovery.ts';

interface FinalizationContext {
  root: string;
  home: string;
  session: Session;
  attempt: Session['attempts'][number];
  previousManifest: Manifest | null;
  persist: () => Promise<void>;
  atomicWrite: (
    root: string,
    relative: string,
    content: string,
    options?: { expectedHash?: string | null },
  ) => Promise<void>;
  checkpoint?: ApplyOptions['checkpoint'];
}

export function mergeHistory<T>(...groups: T[][]): T[] {
  const entries = new Map<string, T>();
  for (const entry of groups.flat()) {
    const key = digest(entry);
    // Repeated transitions must keep their last position for replay.
    entries.delete(key);
    entries.set(key, entry);
  }
  return [...entries.values()];
}

async function saveUsage({ home, session, atomicWrite }: FinalizationContext) {
  const proposal = session.proposal;
  assert(
    proposal.usageFile === path.join(home, '.tibicen', 'usage.json'),
    'invalid-plan',
    'Unexpected usage counter location.',
  );
  const filename = await safePath(home, '.tibicen/usage.json');
  let current: {
    schema: number;
    sessions: { id: string; project: string; mode: string; status: string }[];
  } | null;
  try {
    current = parseData(await readFile(filename, 'utf8')) as typeof current;
  } catch (caught) {
    if ((caught as NodeJS.ErrnoException).code !== 'ENOENT') throw caught;
    current = null;
  }
  current ??= { schema: 1, sessions: [] };
  assert(
    current.schema === 1 && Array.isArray(current.sessions),
    'invalid-data',
    'Invalid local usage data.',
  );
  const previous = current.sessions.find((item) => item.id === session.id);
  const item = {
    id: session.id,
    project: hashContent(proposal.root),
    mode: proposal.mode,
    status: session.status,
  };
  if (previous) Object.assign(previous, item);
  else current.sessions.push(item);
  await atomicWrite(home, '.tibicen/usage.json', serializeData(current));
}

async function writeManifest(
  {
    root,
    session: state,
    persist,
    atomicWrite,
    checkpoint,
  }: FinalizationContext,
  oldManifest: Manifest | null,
) {
  const earlier = oldManifest?.sessions.find(
    (session) => session.id === state.id,
  );
  const sessions = Array.isArray(oldManifest?.sessions)
    ? oldManifest.sessions.filter((session) => session.id !== state.id)
    : [];
  const components = state.proposal.components;
  const componentChanges = components.files.filter(
    (file) =>
      file.resolution !== 'unchanged' ||
      digest(file.previous) !== digest(file.next),
  );
  const changes = mergeHistory(
    earlier?.changes ?? [],
    state.history.changes ?? [],
    state.applied,
  );
  const componentHistory = mergeHistory(
    earlier?.components ?? [],
    state.history.components ?? [],
    componentChanges,
  );
  const manifestMigration =
    earlier?.manifestMigration ??
    state.history.manifestMigration ??
    (components.fromSchema !== null &&
    components.fromSchema !== components.toSchema
      ? { from: components.fromSchema, to: components.toSchema }
      : null);
  const sharedHistory = mergeHistory(
    earlier?.sharedRules ?? [],
    state.history.sharedRules ?? [],
    state.proposal.sharedRules ?? [],
  );
  sessions.push({
    id: state.id,
    attempts: state.attempts,
    manualActions: state.proposal.manualActions,
    status: state.status,
    changes,
    components: componentHistory,
    sharedRules: sharedHistory,
    commandAttempts: state.commandAttempts,
    ...(state.proposal.process
      ? {
          process: state.proposal.process,
          processHistory: mergeHistory(
            earlier?.processHistory ?? [],
            state.history.processHistory ?? [],
            [state.proposal.process],
          ),
        }
      : {}),
    ...(manifestMigration ? { manifestMigration } : {}),
  });
  const installed = await installedComponents(
    state.proposal.components,
    state.proposal.sources,
    state.componentBaseline!.recoveredInstalled ??
      state.componentBaseline!.manifest?.installed ??
      [],
    (relative) =>
      readCurrent(root, relative, {
        forbiddenPaths: state.proposal.forbiddenPaths,
      }),
  );
  const manifest = {
    schema: MANIFEST_SCHEMA,
    tibicen: {
      version: VERSION,
      rulesVersion: VERSION,
      built: new Date().toISOString().slice(0, 10),
      mode: state.proposal.mode,
      status: state.status,
    },
    practices: state.proposal.practices,
    installed,
    mcpSources: state.proposal.sources.filter(
      (source) => source.kind === 'mcp',
    ),
    changes: state.applied,
    sharedRules: state.proposal.sharedRules ?? [],
    ...(state.proposal.process ? { process: state.proposal.process } : {}),
    assumptions: state.proposal.assumptions,
    gaps: state.proposal.gaps,
    checks: state.checks,
    compat: state.checks.compat ?? state.proposal.compat,
    mcp: state.checks.mcp ?? [],
    manualFragments: state.proposal.manualFragments ?? [],
    sessions,
  };
  const serialized = serializeData(manifest);
  state.pendingManifest = {
    beforeHash: state.manifestHash ?? null,
    afterHash: hashContent(serialized),
    content: serialized,
  };
  await persist();
  await checkpoint?.('before-manifest-write', state);
  await atomicWrite(root, '.tibicen/manifest.yml', serialized, {
    expectedHash: state.manifestHash,
  });
  await checkpoint?.('after-manifest-write', state);
  state.manifestHash = hashContent(serialized);
  delete state.pendingManifest;
  await persist();
  return manifest;
}

export async function finalizeSession(
  context: FinalizationContext,
  failure?: { error: NodeJS.ErrnoException },
) {
  const { root, session, attempt, previousManifest, persist, checkpoint } =
    context;
  const proposal = session.proposal;
  session.status = failure
    ? 'incomplete'
    : session.checks.infrastructure.status === 'issues-found'
      ? 'incomplete'
      : proposal.manualActions.some(
            (action) => action.required !== false && action.status !== 'done',
          )
        ? 'manual-action-required'
        : 'complete';
  if (failure) {
    session.reason = failure.error.code ?? 'internal-error';
    Object.assign(attempt, {
      outcome: 'incomplete',
      reason: session.reason,
      newRegressions: session.checks.verify.newRegressions ?? [],
    });
  } else {
    Object.assign(attempt, {
      outcome: session.checks.infrastructure.status,
      newRegressions: session.checks.verify.newRegressions ?? [],
    });
    delete attempt.reason;
  }
  await persist();

  let manifest: Manifest | undefined;
  if (failure) {
    const snapshot = await readManifest(root);
    if (manifestRecovery(session, snapshot.hash) !== 'ambiguous') {
      session.manifestHash = snapshot.hash;
      delete session.pendingManifest;
      await writeManifest(context, snapshot.manifest);
    }
  } else manifest = await writeManifest(context, previousManifest);
  await saveUsage(context);
  if (!failure && session.status !== 'incomplete') {
    await safePath(root, '.tibicen/state');
    await checkpoint?.('before-state-cleanup', session);
    await rm(path.join(root, '.tibicen/state'), {
      recursive: true,
      force: true,
    });
  }
  const applied = session.applied.map(({ path, action, evidence }) => ({
    path,
    action,
    evidence,
  }));
  if (failure)
    return {
      schema: 1,
      id: session.id,
      status: 'incomplete',
      reason: session.reason,
      applied,
      checks: session.checks,
      continuation:
        'Inspect status, verify actual files, and approve a proposal again before resume.',
    };
  return {
    schema: 1,
    id: session.id,
    status: session.status,
    applied,
    checks: session.checks,
    manualActions: proposal.manualActions,
    manualFragments: proposal.manualFragments ?? [],
    manifest: manifest!,
    firstUsefulRequest:
      'Используй инструкции проекта и выполни небольшую согласованную рабочую задачу.',
  };
}
