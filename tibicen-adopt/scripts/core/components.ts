import type {
  Change,
  ComponentFilePlan,
  ComponentFileState,
  ComponentPlan,
  ComponentUpdate,
  Manifest,
  ManifestSnapshot,
  Source,
} from './types.ts';
import { readFile } from 'node:fs/promises';
import {
  assert,
  digest,
  hashContent,
  parseData,
  validateData,
  validateFileMode,
} from './contracts.ts';
import {
  isInfrastructurePath,
  safePath,
  validateRelativePath,
} from './paths.ts';
import { validateSharedRules } from './shared-rules.ts';
import { validateProcessPlan } from '../process/index.ts';

export const MANIFEST_SCHEMA = 2;
const hash = (value: unknown) =>
  typeof value === 'string' && /^[a-f0-9]{64}$/.test(value);
const componentKey = (source: Pick<Source, 'repo' | 'skillPath'>) =>
  JSON.stringify([source.repo.toLowerCase(), source.skillPath ?? '']);
const revisionKey = (source: Pick<Source, 'repo' | 'sha' | 'skillPath'>) =>
  JSON.stringify([componentKey(source), source.sha]);
type ReadCurrent = (relative: string) => Promise<{
  content: string | null;
  hash: string | null;
  mode?: number | null;
}>;

function owners(sources: Source[]) {
  const result = new Map<
    string,
    { source: Source; file: NonNullable<Source['files']>[number] }
  >();
  for (const source of sources) {
    assert(
      source &&
        typeof source === 'object' &&
        [undefined, 'skill', 'mcp'].includes(source.kind),
      'invalid-manifest',
      'Unsupported component record.',
    );
    if (source.kind === 'mcp') continue;
    assert(
      typeof source.repo === 'string' &&
        /^[\w.-]+\/[\w.-]+$/.test(source.repo) &&
        /^[a-f0-9]{40,64}$/.test(source.sha),
      'invalid-manifest',
      'A component needs its repository and pinned SHA.',
    );
    assert(
      typeof source.license === 'string' &&
        source.license &&
        Array.isArray(source.files) &&
        source.files.length,
      'invalid-manifest',
      'A component needs its license and explicit file list.',
    );
    assert(
      source.skillPath === undefined ||
        (typeof source.skillPath === 'string' &&
          /(?:^|\/)SKILL\.md$/.test(source.skillPath)),
      'invalid-manifest',
      'Invalid component entry path.',
    );
    for (const file of source.files) {
      validateRelativePath(file.path);
      validateRelativePath(file.sourcePath);
      assert(
        isInfrastructurePath(file.path) &&
          hash(file.contentHash) &&
          (file.installedHash === undefined || hash(file.installedHash)),
        'invalid-manifest',
        'Invalid component path or content hash.',
      );
      if (file.fileMode !== undefined) validateFileMode(file.fileMode);
      if (file.installedMode !== undefined)
        validateFileMode(file.installedMode);
      assert(
        !result.has(file.path),
        'component-path-conflict',
        `Multiple components claim ${file.path}.`,
      );
      result.set(file.path, { source, file });
    }
  }
  return result;
}

export async function readManifest(root: string): Promise<ManifestSnapshot> {
  let text;
  try {
    text = await readFile(
      await safePath(root, '.tibicen/manifest.yml'),
      'utf8',
    );
  } catch (caught) {
    if ((caught as NodeJS.ErrnoException).code === 'ENOENT')
      return { manifest: null, hash: null };
    throw caught;
  }
  const manifest = parseData(text) as Manifest;
  assert(
    manifest && [1, MANIFEST_SCHEMA].includes(manifest.schema),
    'unsupported-manifest-schema',
    'Unsupported passport schema; no files were changed.',
  );
  assert(
    Array.isArray(manifest.installed) && Array.isArray(manifest.sessions),
    'invalid-manifest',
    'Passport needs installed files and session history.',
  );
  validateSharedRules(
    manifest.sharedRules === undefined ? [] : manifest.sharedRules,
  );
  validateProcessPlan(manifest.process);
  assert(
    manifest.installed.every((source) => source && source.kind !== 'mcp'),
    'invalid-manifest',
    'MCP sources belong in mcpSources, not installed skill files.',
  );
  const files = owners(manifest.installed);
  if (manifest.schema === MANIFEST_SCHEMA)
    for (const { file } of files.values())
      assert(
        hash(file.installedHash),
        'invalid-manifest',
        'Schema 2 must distinguish upstream and installed hashes.',
      );
  return { manifest, hash: hashContent(text) };
}

function state(
  source: Source,
  file: NonNullable<Source['files']>[number],
  installedHash: string,
  installedMode = file.installedMode,
): ComponentFileState {
  return {
    repo: source.repo,
    sha: source.sha,
    license: source.license!,
    ...(source.licenseException
      ? { licenseException: source.licenseException }
      : {}),
    ...(source.skillPath ? { skillPath: source.skillPath } : {}),
    sourcePath: file.sourcePath,
    contentHash: file.contentHash,
    installedHash,
    ...(file.fileMode === undefined ? {} : { fileMode: file.fileMode }),
    ...(installedMode === undefined ? {} : { installedMode }),
  };
}

export async function planComponents(
  snapshot: ManifestSnapshot,
  sources: Source[],
  updates: ComponentUpdate[],
  changes: Change[],
  read: ReadCurrent,
  migrate = false,
): Promise<ComponentPlan> {
  validateData({ sources, updates });
  assert(
    sources.every((source) => source && typeof source === 'object'),
    'invalid-component-update',
    'Every selected source must be an object.',
  );
  assert(
    !snapshot.manifest ||
      snapshot.manifest.schema === MANIFEST_SCHEMA ||
      migrate === true,
    'manifest-migration-required',
    'Show migrateManifest: true to approve the schema 1 to 2 passport conversion.',
  );
  const previous = owners(
    snapshot.recoveredInstalled ?? snapshot.manifest?.installed ?? [],
  );
  const selected = owners(sources);
  const updating = new Map<string, ComponentUpdate>();
  const decisions = new Map<string, ComponentUpdate['decisions'][number]>();
  for (const update of updates) {
    assert(
      update?.source && Array.isArray(update.decisions),
      'invalid-component-update',
      'An update needs its new source and explicit decisions.',
    );
    assert(
      sources.some((source) => digest(source) === digest(update.source)),
      'invalid-component-update',
      'The update source must be present in the resolved source list.',
    );
    const key = componentKey(update.source);
    assert(
      !updating.has(key) &&
        [...previous.values()].some(
          (item) => componentKey(item.source) === key,
        ),
      'invalid-component-update',
      'Update must name one existing component exactly once.',
    );
    updating.set(key, update);
    for (const decision of update.decisions) {
      assert(
        typeof decision.path === 'string' &&
          !decisions.has(decision.path) &&
          ['preserve', 'merge', 'replace', 'remove'].includes(
            decision.resolution,
          ) &&
          typeof decision.reason === 'string' &&
          decision.reason.trim(),
        'invalid-component-update',
        'Every decision needs a unique path, resolution and reason.',
      );
      const owner = previous.get(decision.path);
      assert(
        owner && componentKey(owner.source) === key,
        'component-path-conflict',
        `Decision cannot claim a foreign path: ${decision.path}.`,
      );
      decisions.set(decision.path, decision);
    }
  }
  for (const source of sources.filter((source) => source.kind !== 'mcp')) {
    const prior = [...previous.values()].filter(
      (item) => componentKey(item.source) === componentKey(source),
    );
    assert(
      !prior.length ||
        updating.has(componentKey(source)) ||
        prior.some((item) => revisionKey(item.source) === revisionKey(source)),
      'component-update-required',
      'Use componentUpdates when selecting a new revision of an installed component.',
    );
  }
  const files: ComponentFilePlan[] = [];
  for (const relative of new Set([...previous.keys(), ...selected.keys()])) {
    const old = previous.get(relative),
      next = selected.get(relative);
    const actual = await read(relative);
    const change = changes.find((change) => change.path === relative);
    const afterHash = change
      ? change.action === 'delete'
        ? null
        : hashContent(change.content!)
      : actual.hash;
    const afterMode =
      afterHash === null ? null : (change?.fileMode ?? actual.mode);
    const before = old
      ? state(
          old.source,
          old.file,
          old.file.installedHash ?? old.file.contentHash,
        )
      : null;
    let desired =
      old && afterHash
        ? state(
            old.source,
            old.file,
            afterHash,
            change || old.file.installedMode !== undefined
              ? (afterMode ?? undefined)
              : undefined,
          )
        : null;
    let resolution = change
      ? change.action === 'delete'
        ? 'remove'
        : 'edit'
      : 'unchanged';
    let reason =
      change?.reason ?? 'Retain the existing component and its provenance.';
    if (
      before &&
      old &&
      !change &&
      !next &&
      !updating.has(componentKey(old.source))
    ) {
      if (actual.hash === null) {
        resolution = 'missing';
        reason = 'A recorded resource is missing without an approved removal.';
      } else if (
        (old.file.installedHash !== undefined &&
          actual.hash !== before.installedHash) ||
        (before.installedMode !== undefined &&
          actual.mode !== before.installedMode)
      ) {
        resolution = 'drift';
        reason = 'Local changes differ from the last approved resource.';
      }
    }
    if (next) {
      assert(
        !old || componentKey(old.source) === componentKey(next.source),
        'component-path-conflict',
        `New component collides with another owner: ${relative}.`,
      );
      assert(
        old || actual.hash === null,
        'component-path-conflict',
        `New resource collides with a foreign file: ${relative}.`,
      );
      const update = updating.get(componentKey(next.source));
      if (old && !update)
        assert(
          revisionKey(old.source) === revisionKey(next.source) &&
            old.file.sourcePath === next.file.sourcePath &&
            old.file.contentHash === next.file.contentHash,
          'component-update-required',
          `Use componentUpdates to update ${relative}.`,
        );
      const decision = decisions.get(relative);
      if (
        old &&
        update &&
        (actual.hash !== old.file.contentHash ||
          (old.file.fileMode !== undefined &&
            actual.mode !== old.file.fileMode))
      )
        assert(
          decision,
          'component-decision-required',
          `Local changes need preserve, merge or replace: ${relative}.`,
        );
      resolution = decision?.resolution ?? 'replace';
      reason =
        decision?.reason ??
        change?.reason ??
        'Install the selected pinned resource.';
      assert(
        ['preserve', 'merge', 'replace'].includes(resolution),
        'invalid-component-update',
        `A selected upstream file cannot be removed implicitly: ${relative}.`,
      );
      if (resolution === 'preserve') {
        assert(
          actual.hash !== null,
          'component-content-required',
          `A deleted selected resource must be restored or explicitly excluded from the new composition: ${relative}.`,
        );
        assert(
          afterHash === actual.hash,
          'component-resolution-mismatch',
          `Preserve must retain the current bytes: ${relative}.`,
        );
        assert(
          afterMode === actual.mode,
          'component-resolution-mismatch',
          `Preserve must retain the current permissions: ${relative}.`,
        );
      }
      if (resolution === 'replace')
        assert(
          afterHash === next.file.contentHash,
          'component-content-required',
          `Show the exact upstream content in changes: ${relative}.`,
        );
      if (resolution === 'replace' && next.file.fileMode !== undefined)
        assert(
          afterMode === next.file.fileMode,
          'component-mode-required',
          `Show the exact upstream permissions in changes: ${relative}.`,
        );
      if (resolution === 'merge')
        assert(
          change && change.action !== 'delete' && afterHash,
          'component-content-required',
          `Show the merged content and diff: ${relative}.`,
        );
      desired = afterHash
        ? state(next.source, next.file, afterHash, afterMode ?? undefined)
        : null;
    } else if (old && updating.has(componentKey(old.source))) {
      const decision = decisions.get(relative);
      assert(
        decision && ['preserve', 'remove'].includes(decision.resolution),
        'component-decision-required',
        `Removed upstream resource needs preserve or remove: ${relative}.`,
      );
      resolution = decision.resolution;
      reason = decision.reason;
      assert(
        resolution === 'preserve'
          ? afterHash === actual.hash
          : afterHash === null,
        'component-resolution-mismatch',
        `Show the chosen fate of the removed resource: ${relative}.`,
      );
    }
    files.push({
      path: relative,
      beforeHash: actual.hash,
      afterHash,
      ...(actual.mode === undefined ? {} : { beforeMode: actual.mode }),
      ...(afterMode === undefined ? {} : { afterMode }),
      previous: before,
      next: desired,
      resolution,
      reason,
    });
  }
  return {
    schema: 1,
    baselineDigest: digest(
      snapshot.recoveredInstalled
        ? {
            manifest: snapshot.manifest,
            recoveredInstalled: snapshot.recoveredInstalled,
          }
        : snapshot.manifest,
    ),
    manifestHash: snapshot.hash,
    fromSchema: snapshot.manifest?.schema ?? null,
    toSchema: MANIFEST_SCHEMA,
    ...(snapshot.recoveredInstalled ? { recoveredOwnership: true } : {}),
    files,
  };
}

export async function installedComponents(
  plan: ComponentPlan,
  sources: Source[],
  baseline: Source[],
  read: ReadCurrent,
) {
  const available = [...baseline, ...sources];
  const result = new Map<string, Source>();
  for (const file of plan.files) {
    const actual = await read(file.path);
    // An interrupted apply records only content actually present, retaining old provenance for pending writes.
    const desired =
      actual.hash === file.afterHash &&
      (file.afterMode === undefined || actual.mode === file.afterMode)
        ? file.next
        : file.previous;
    if (!desired || !actual.hash) continue;
    const key = revisionKey(desired);
    const matches = (source: Source) =>
      revisionKey(source) === key &&
      source.files?.some(
        (item) =>
          item.path === file.path &&
          item.sourcePath === desired.sourcePath &&
          item.contentHash === desired.contentHash,
      );
    const source = available.findLast(matches);
    assert(
      source,
      'invalid-component-plan',
      'Missing provenance for the installed resource.',
    );
    const verified =
      sources.some(matches) || source.provenance === 'provenance-verified';
    if (!result.has(key))
      result.set(key, {
        ...source,
        ref: source.sha,
        provenance: verified ? 'provenance-verified' : 'unverified',
        files: [],
      });
    if (!verified) result.get(key)!.provenance = 'unverified';
    result.get(key)!.files!.push({
      path: file.path,
      sourcePath: desired.sourcePath,
      contentHash: desired.contentHash,
      installedHash: actual.hash,
      ...(desired.fileMode === undefined ? {} : { fileMode: desired.fileMode }),
      ...(desired.installedMode === undefined
        ? {}
        : { installedMode: actual.mode ?? desired.installedMode }),
    });
  }
  return [...result.values()];
}
