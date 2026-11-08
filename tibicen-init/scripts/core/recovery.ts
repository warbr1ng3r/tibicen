import type {
  Change,
  FileRecovery,
  ManifestSnapshot,
  Session,
} from './types.ts';
import { readFile } from 'node:fs/promises';
import { assert, digest, hashContent, parseData } from './contracts.ts';
import { readCurrent, unwrapPlan } from './plan.ts';
import { safePath, validateRelativePath } from './paths.ts';
import { installedComponents } from './components.ts';

export const STATE_SCHEMA = 3;
export const resultHash = (change: Change) =>
  change.action === 'delete' ? null : hashContent(change.content!);
export const changeModes = (
  change: Change,
): Pick<FileRecovery, 'beforeMode' | 'afterMode'> => ({
  ...(change.beforeMode === undefined ? {} : { beforeMode: change.beforeMode }),
  ...(change.action === 'delete'
    ? { afterMode: null }
    : change.fileMode === undefined
      ? {}
      : { afterMode: change.fileMode }),
});

export async function recoverPlanningBaseline(
  root: string,
  snapshot: ManifestSnapshot,
  state?: Session | null,
): Promise<ManifestSnapshot> {
  if (state === undefined) {
    try {
      state = parseData(
        await readFile(
          await safePath(root, '.tibicen/state/session.json'),
          'utf8',
        ),
      ) as Session;
    } catch (caught) {
      if ((caught as NodeJS.ErrnoException).code === 'ENOENT') return snapshot;
      throw caught;
    }
  }
  if (!state) return snapshot;
  const recovery = await inspectRecovery(root, state, snapshot.hash);
  assert(
    recovery.manifest !== 'ambiguous',
    'tamper-suspect',
    'Passport matches neither the recorded input nor the pending write.',
  );
  assert(
    state.componentBaseline,
    'unsupported-state-schema',
    'Saved work is missing its component baseline.',
  );
  const installed = await installedComponents(
    state.proposal.components,
    state.proposal.sources,
    state.componentBaseline.recoveredInstalled ??
      state.componentBaseline.manifest?.installed ??
      [],
    (relative) =>
      readCurrent(root, relative, {
        forbiddenPaths: state.proposal.forbiddenPaths,
      }),
  );
  return {
    ...snapshot,
    pendingStateSchema: state.schema,
    ...(digest(installed) === digest(snapshot.manifest?.installed ?? [])
      ? {}
      : { recoveredInstalled: installed }),
    recoveredSharedRules:
      state.proposal.sharedRules ?? snapshot.manifest?.sharedRules ?? [],
    ...(state.proposal.process
      ? { recoveredProcess: state.proposal.process }
      : {}),
    ...(state.proposal.memory
      ? { recoveredMemory: state.proposal.memory }
      : {}),
  };
}

export function manifestRecovery(state: Session, actualHash: string | null) {
  const pending = state.pendingManifest;
  if (!pending)
    return actualHash === state.manifestHash ? 'unchanged' : 'ambiguous';
  assert(
    pending.beforeHash === state.manifestHash &&
      typeof pending.content === 'string' &&
      hashContent(pending.content) === pending.afterHash,
    'tamper-suspect',
    'Saved passport write intent does not match its content.',
  );
  return actualHash === pending.afterHash
    ? 'matches-approved-result'
    : actualHash === pending.beforeHash
      ? 'pending'
      : 'ambiguous';
}

export function validateRecoveryState(root: string, state: Session) {
  assert(
    state.schema === (state.proposal?.schema === 2 ? 4 : STATE_SCHEMA),
    'unsupported-state-schema',
    'Saved work needs state schema 3 (legacy) or 4 (memory), with file originals and execution/write journals; inspect older state explicitly.',
  );
  assert(
    Array.isArray(state.proposal?.forbiddenPaths) &&
      state.proposal.forbiddenPaths.every((item) => typeof item === 'string'),
    'unsupported-state-schema',
    'Saved work needs an explicit project-read scope.',
  );
  for (const relative of state.proposal.forbiddenPaths)
    validateRelativePath(relative.replace(/\/$/, ''));
  assert(
    state.proposalDigest === digest(unwrapPlan(state.proposal)) &&
      state.proposal.root === root,
    'tamper-suspect',
    'Saved proposal does not match its digest or project.',
  );
  assert(
    state.planOriginals &&
      state.originals &&
      Array.isArray(state.applied) &&
      Array.isArray(state.history?.changes) &&
      Array.isArray(state.history?.components) &&
      Array.isArray(state.attempts) &&
      Array.isArray(state.completedCommands) &&
      Array.isArray(state.commandAttempts),
    'unsupported-state-schema',
    'Saved work is missing the recovery journal.',
  );
  for (const attempt of state.commandAttempts) {
    assert(
      attempt &&
        typeof attempt.id === 'string' &&
        typeof attempt.kind === 'string' &&
        /^[a-f0-9]{64}$/.test(attempt.commandDigest) &&
        ['running', 'unknown', 'completed', 'failed'].includes(attempt.status),
      'tamper-suspect',
      'Invalid command attempt journal.',
    );
    const declared = state.proposal.commands.find(
      (command) => digest(command) === attempt.commandDigest,
    );
    if (declared)
      assert(
        declared.id === attempt.id && declared.kind === attempt.kind,
        'tamper-suspect',
        'Command attempt identity differs from its approved command.',
      );
  }
}

export async function inspectRecovery(
  root: string,
  state: Session,
  actualManifestHash: string | null,
  requestedForbiddenPaths: string[] = [],
) {
  validateRecoveryState(root, state);
  const files: FileRecovery[] = [];
  const forbiddenPaths = [
    ...new Set([
      ...(state.proposal.forbiddenPaths ?? []),
      ...requestedForbiddenPaths,
    ]),
  ];
  for (const change of state.proposal.changes) {
    const original = state.planOriginals[change.path];
    assert(
      (original === null || typeof original === 'string') &&
        (original === null ? null : hashContent(original)) ===
          change.beforeHash,
      'tamper-suspect',
      `Saved original does not match the approved input: ${change.path}.`,
    );
    const afterHash = resultHash(change);
    const modes = changeModes(change);
    try {
      const actual = await readCurrent(root, change.path, {
        forbiddenPaths,
      });
      files.push({
        path: change.path,
        beforeHash: change.beforeHash,
        afterHash,
        ...modes,
        actualHash: actual.hash,
        actualMode: actual.mode,
        state:
          actual.hash === afterHash &&
          (modes.afterMode === undefined || actual.mode === modes.afterMode)
            ? 'matches-approved-result'
            : actual.hash === change.beforeHash &&
                (modes.beforeMode === undefined ||
                  actual.mode === modes.beforeMode)
              ? 'pending'
              : 'ambiguous',
      });
    } catch (caught) {
      files.push({
        path: change.path,
        beforeHash: change.beforeHash,
        afterHash,
        state: 'ambiguous',
        reason: (caught as NodeJS.ErrnoException).code ?? 'unreadable-file',
      });
    }
  }
  for (const applied of state.applied.filter(
    (item) =>
      !state.proposal.changes.some((change) => change.path === item.path),
  )) {
    try {
      const actual = await readCurrent(root, applied.path, {
        forbiddenPaths,
      });
      files.push({
        path: applied.path,
        beforeHash: applied.beforeHash,
        afterHash: applied.afterHash,
        ...(applied.beforeMode === undefined
          ? {}
          : { beforeMode: applied.beforeMode }),
        ...(applied.afterMode === undefined
          ? {}
          : { afterMode: applied.afterMode }),
        actualHash: actual.hash,
        actualMode: actual.mode,
        state:
          actual.hash === applied.afterHash &&
          (applied.afterMode === undefined || applied.afterMode === actual.mode)
            ? 'matches-approved-result'
            : 'ambiguous',
      });
    } catch (caught) {
      files.push({
        path: applied.path,
        beforeHash: applied.beforeHash,
        afterHash: applied.afterHash,
        state: 'ambiguous',
        reason: (caught as NodeJS.ErrnoException).code ?? 'unreadable-file',
      });
    }
  }
  const lastAttempts = new Map(
    state.commandAttempts.map((attempt) => [attempt.commandDigest, attempt]),
  );
  const unknownCommands = [...lastAttempts.values()]
    .filter((attempt) => ['running', 'unknown'].includes(attempt.status))
    .map((attempt) => ({
      id: attempt.id,
      kind: attempt.kind,
      commandDigest: attempt.commandDigest,
      reason: 'command-outcome-unknown',
    }));
  return {
    files,
    unknownCommands,
    manifest: manifestRecovery(state, actualManifestHash),
  };
}
