import path from 'node:path';
import { mkdir, realpath, writeFile, chmod, link, rm } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { assert, digest, serializeData } from '../core/contracts.ts';
import { containsSecret } from '../core/plan.ts';
import { validateRun } from './contracts.ts';

// Reject credentials rather than rewriting evidence into a different observation.
export function observationGuard(forbiddenValues: readonly string[] = []) {
  assert(
    Array.isArray(forbiddenValues) &&
      forbiddenValues.every(
        (value) => typeof value === 'string' && value.length > 0,
      ),
    'invalid-eval-secrets',
    'Register nonempty sensitive values on the host only.',
  );
  const secrets = [...forbiddenValues];
  return (value: unknown) => {
    const text = serializeData(value);
    assert(
      !containsSecret(text) &&
        !secrets.some((secret) =>
          text.includes(JSON.stringify(secret).slice(1, -1)),
        ),
      'unsafe-eval-observation',
      'Sensitive data cannot enter evaluation inputs or observations.',
    );
  };
}

export async function writeEvalArtifact(
  filename: string,
  record: unknown,
  forbiddenValues: readonly string[] = [],
) {
  observationGuard(forbiddenValues)(record);
  const contents = serializeData(record),
    target = path.resolve(filename);
  await mkdir(path.dirname(target), { recursive: true, mode: 0o700 });
  const temporary = target + '.' + randomUUID() + '.tmp';
  try {
    await writeFile(temporary, contents, { flag: 'wx', mode: 0o600 });
    await chmod(temporary, 0o600);
    await link(temporary, target);
  } finally {
    await rm(temporary, { force: true });
  }
  return target;
}

export async function saveObservedRun(
  directory: string,
  projectRoot: string,
  input: ReturnType<typeof validateRun>,
  forbiddenValues: readonly string[] = [],
) {
  const run = validateRun(
    input.experiment,
    input.scenario,
    input.result,
    input.events,
    input.grades,
  );
  // Persist references and allowed observations, never prompts, oracle, argv, environment or raw output.
  const record = structuredClone({
    schema: 1,
    experimentId: run.experiment.id,
    experimentHash: digest(run.experiment),
    sourceSha: run.experiment.sourceSha,
    scenarioId: run.scenario.id,
    scenarioHash: digest(run.scenario),
    profileHash: digest(
      run.experiment.profiles.find(
        (profile) => profile.id === run.result.profileId,
      ),
    ),
    result: run.result,
    events: run.events,
    grades: run.grades,
  });
  observationGuard(forbiddenValues)(record);
  const project = await realpath(projectRoot);
  const destination = path.resolve(directory);
  // Canonicalize existing parents before mkdir, including aliases into the executor's tree.
  let existing = destination;
  const suffix: string[] = [];
  let resolved: string;
  while (true) {
    try {
      resolved = path.join(await realpath(existing), ...suffix);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
      suffix.unshift(path.basename(existing));
      existing = path.dirname(existing);
    }
  }
  const inside = (root: string, target: string) =>
    target === root || target.startsWith(root + path.sep);
  assert(
    !inside(project, resolved),
    'invalid-eval-storage',
    'Observation storage must be outside the executor project.',
  );
  await mkdir(resolved, { recursive: true, mode: 0o700 });
  resolved = await realpath(resolved);
  assert(
    !inside(project, resolved),
    'invalid-eval-storage',
    'Observation storage must be outside the executor project.',
  );
  const filename = path.join(resolved, `${record.result.id}.json`);
  try {
    await writeEvalArtifact(filename, record, forbiddenValues);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'EEXIST')
      assert(
        false,
        'eval-attempt-exists',
        'An observation record already exists for this attempt.',
      );
    throw error;
  }
  return { path: filename, record };
}
