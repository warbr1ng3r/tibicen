import type {
  AppliedChange,
  ComponentFilePlan,
  ComponentFileState,
  ComponentPlan,
  FileRecord,
  Manifest,
} from '../core/types.ts';
import { assert, validateFileMode } from '../core/contracts.ts';
import { infrastructurePath } from '../scan/index.ts';

export interface ExpectedFile {
  path: string;
  action?: string;
  hash?: string;
  afterHash?: string | null;
  content?: string | null;
  mode?: number;
  afterMode?: number | null;
  fileMode?: number;
}

export function infrastructureScope(
  manifest: Manifest | null,
  observed: FileRecord[],
  expected: ExpectedFile[],
  components?: ComponentPlan,
): ExpectedFile[] {
  const scope = new Map<string, ExpectedFile>();
  const inScope = (relative: string) =>
    infrastructurePath(relative) && relative !== '.tibicen/manifest.yml';
  const owned = (
    relative: string,
    file: ComponentFileState,
    legacy = false,
  ) => ({
    path: relative,
    ...(legacy ? {} : { hash: file.installedHash }),
    ...(file.installedMode === undefined ? {} : { mode: file.installedMode }),
  });
  const applied = (change: AppliedChange) => {
    if (!inScope(change.path)) return;
    assert(
      ['add', 'modify', 'delete'].includes(change.action) &&
        (change.action === 'delete'
          ? change.afterHash === null
          : /^[a-f0-9]{64}$/.test(change.afterHash ?? '')),
      'invalid-manifest',
      'Recorded infrastructure needs an applied action and result hash.',
    );
    if (change.afterMode != null) validateFileMode(change.afterMode);
    scope.set(change.path, change);
  };
  for (const source of manifest?.installed ?? [])
    for (const file of source.files ?? [])
      scope.set(file.path, {
        path: file.path,
        hash: file.installedHash,
        ...(file.installedMode === undefined
          ? {}
          : { mode: file.installedMode }),
      });
  const reconcileComponents = (
    files: ComponentFilePlan[],
    changes: ExpectedFile[],
    migrating = false,
  ) => {
    const results = new Map(changes.map((change) => [change.path, change]));
    for (const file of files) {
      if (!inScope(file.path)) continue;
      if (
        file.previous &&
        (!scope.has(file.path) ||
          ['missing', 'drift'].includes(file.resolution))
      )
        scope.set(file.path, owned(file.path, file.previous, migrating));
      // Planned writes in an interrupted session are not evidence of application.
      const result = results.get(file.path);
      const completed =
        (file.beforeHash === file.afterHash &&
          (file.afterMode === undefined ||
            file.beforeMode === file.afterMode)) ||
        (result &&
          result.afterHash === file.afterHash &&
          (file.afterHash === null ||
            file.afterMode === undefined ||
            (result.afterMode ?? result.fileMode ?? result.mode) ===
              file.afterMode));
      if (
        completed &&
        (!['unchanged', 'missing', 'drift'].includes(file.resolution) ||
          (migrating && file.resolution === 'unchanged'))
      ) {
        if (file.next) scope.set(file.path, owned(file.path, file.next));
        else if (file.resolution === 'remove')
          scope.set(file.path, { path: file.path, action: 'delete' });
      }
    }
  };
  for (const session of manifest?.sessions ?? []) {
    const changes = session.changes ?? [];
    reconcileComponents(
      session.components ?? [],
      changes,
      session.manifestMigration?.from === 1,
    );
    for (const change of changes) applied(change);
  }
  for (const change of manifest?.changes ?? []) applied(change);
  reconcileComponents(
    components?.files ?? [],
    expected,
    components?.fromSchema === 1,
  );
  for (const file of observed)
    if (inScope(file.path) && !scope.has(file.path)) scope.set(file.path, file);
  for (const file of expected) scope.delete(file.path);
  return [...scope.values(), ...expected];
}
