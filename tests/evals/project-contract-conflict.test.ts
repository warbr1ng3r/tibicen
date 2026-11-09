import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const fixture = JSON.parse(
  await readFile(
    new URL(
      '../../scripts/evals/fixtures/project-contract-conflict.json',
      import.meta.url,
    ),
    'utf8',
  ),
) as {
  files: { path: string; content: string }[];
  allowedPaths: { setup: string[] };
  expected: {
    currentOpenIds: string[];
    strictOpenIds: string[];
    currentHighOpenIds: string[];
    strictHighOpenIds: string[];
  };
  ownerDecisionContrast: {
    file: { path: string; content: string };
    acceptedTarget: string;
    expectedTargetOpenIds: string[];
    applicationMigrationApproved: boolean;
  };
};
type Job = {
  id: string;
  priority: string;
  done?: boolean | number | string | null;
};
const files = Object.fromEntries(
  fixture.files.map(({ path, content }) => [path, content]),
);
const rows: Job[] = JSON.parse(files['data/jobs.json']);
const source = files['src/jobs.js'];
async function load(source: string) {
  return (await import(
    'data:text/javascript;base64,' + Buffer.from(source).toString('base64')
  )) as {
    listJobs: (rows: Job[], options?: { openOnly?: boolean }) => Job[];
  };
}
const legacy = await load(source);
const mutatedSource = source.replace('!job.done', 'job.done === false');
const strict = await load(mutatedSource);
const ids = (rows: Job[]) => rows.map(({ id }) => id);

test('the authored application preserves supported imported values and caller order', () => {
  const before = structuredClone(rows);
  const all = legacy.listJobs(rows);
  assert.deepEqual(all, rows);
  assert.notEqual(all, rows);
  assert.deepEqual(
    ids(legacy.listJobs(rows, { openOnly: true })),
    fixture.expected.currentOpenIds,
  );
  assert.deepEqual(rows, before);
  assert.equal(rows.find(({ id }) => id === 'zero')!.done, 0);
  assert.equal(rows.find(({ id }) => id === 'null')!.done, null);
  assert(
    !Object.hasOwn(
      rows.find(({ id }) => id === 'missing')!,
      'done',
    ),
  );
});

test('the strict-false mutation violates the declared legacy behavior', () => {
  assert.notEqual(mutatedSource, source);
  const changed = strict.listJobs(rows, { openOnly: true });
  assert.deepEqual(ids(changed), fixture.expected.strictOpenIds);
  assert.throws(() =>
    assert.deepEqual(ids(changed), fixture.expected.currentOpenIds),
  );
});

test('boolean-only records hide the conflict that supported imports expose', () => {
  const booleans = rows.filter(({ done }) => typeof done === 'boolean');
  assert.deepEqual(
    legacy.listJobs(booleans, { openOnly: true }),
    strict.listJobs(booleans, { openOnly: true }),
  );
  const high = (rows: Job[]) =>
    rows.filter(({ priority }) => priority === 'high');
  assert.deepEqual(
    ids(high(legacy.listJobs(rows, { openOnly: true }))),
    fixture.expected.currentHighOpenIds,
  );
  assert.deepEqual(
    ids(high(strict.listJobs(rows, { openOnly: true }))),
    fixture.expected.strictHighOpenIds,
  );
});

test('the accepted owner target leaves a migration gap without changing application inputs', () => {
  const decision = fixture.ownerDecisionContrast;
  assert.equal(decision.acceptedTarget, 'strict-boolean');
  assert.equal(decision.applicationMigrationApproved, false);
  const contrast = { ...files, [decision.file.path]: decision.file.content };
  assert.deepEqual(
    Object.keys(contrast).filter((name) => !(name in files)),
    ['docs/decisions.md'],
  );
  for (const [name, content] of Object.entries(files))
    assert.equal(contrast[name], content);
  assert.deepEqual(
    ids(strict.listJobs(rows, { openOnly: true })),
    decision.expectedTargetOpenIds,
  );
  assert.notDeepEqual(
    ids(legacy.listJobs(rows, { openOnly: true })),
    decision.expectedTargetOpenIds,
  );
  assert.deepEqual(fixture.allowedPaths.setup, ['AGENTS.md']);
});
