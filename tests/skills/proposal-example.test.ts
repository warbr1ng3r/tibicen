import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, realpath, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createProposal } from '../../scripts/core/plan.ts';

test('installed skill proposal example produces a reviewable digest without writes', async (t) => {
  const folder = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-skill-example-')),
  );
  t.after(() => rm(folder, { recursive: true, force: true }));
  const document = await readFile(
    new URL('../../references/proposal-format.md', import.meta.url),
    'utf8',
  );
  const example = JSON.parse(document.match(/```json\n([\s\S]*?)\n```/)![1]);
  const result = await createProposal(folder, example, { home: folder });
  assert.equal(result.proposal.mode, 'init');
  assert.equal(result.proposal.changes[0].beforeHash, null);
  assert.equal(result.proposal.changes[0].path, 'AGENTS.md');
  assert.match(result.digest, /^[a-f0-9]{64}$/);
  assert.deepEqual(await readdir(folder), []);
});
