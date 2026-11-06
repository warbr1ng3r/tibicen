import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';

async function proposal(
  t: TestContext,
  before: string | null,
  after: string | null,
  { beforeMode = 0o644, fileMode = 0o644 } = {},
) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'tibicen-diff-'));
  const root = path.join(base, 'app'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  t.after(() => rm(base, { recursive: true, force: true }));
  if (before !== null) {
    await writeFile(path.join(root, 'AGENTS.md'), before);
    await chmod(path.join(root, 'AGENTS.md'), beforeMode);
  }
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          action:
            after === null ? 'delete' : before === null ? 'add' : 'modify',
          ...(after === null ? {} : { content: after, fileMode }),
          reason: 'Show the exact instruction edit.',
        },
      ],
    },
    { home },
  );
  return { root, home, ...plan };
}

test('a one-line edit in a long file shows only three unchanged lines on each side', async (t) => {
  const before = Array.from(
    { length: 80 },
    (_, index) => `Instruction ${index + 1}.\n`,
  ).join('');
  const after = before.replace('Instruction 40.\n', 'Run pnpm test.\n');
  const plan = await proposal(t, before, after);
  assert.equal(
    plan.proposal.changes[0].diff,
    `--- AGENTS.md
+++ AGENTS.md
@@ -37,7 +37,7 @@
 Instruction 37.
 Instruction 38.
 Instruction 39.
-Instruction 40.
+Run pnpm test.
 Instruction 41.
 Instruction 42.
 Instruction 43.
`,
  );
});

test('context and line ranges stay correct at both ends and across separated edits', async (t) => {
  const original = 'a\nb\nc\nd\ne\nf\ng\n';
  const cases = [
    {
      name: 'replace the first line',
      after: 'A\nb\nc\nd\ne\nf\ng\n',
      hunk: '@@ -1,4 +1,4 @@\n-a\n+A\n b\n c\n d\n',
    },
    {
      name: 'replace the last line',
      after: 'a\nb\nc\nd\ne\nf\nG\n',
      hunk: '@@ -4,4 +4,4 @@\n d\n e\n f\n-g\n+G\n',
    },
    {
      name: 'insert at the beginning',
      after: 'new\na\nb\nc\nd\ne\nf\ng\n',
      hunk: '@@ -1,3 +1,4 @@\n+new\n a\n b\n c\n',
    },
    {
      name: 'insert at the end',
      after: original + 'new\n',
      hunk: '@@ -5,3 +5,4 @@\n e\n f\n g\n+new\n',
    },
    {
      name: 'delete at the beginning',
      after: 'b\nc\nd\ne\nf\ng\n',
      hunk: '@@ -1,4 +1,3 @@\n-a\n b\n c\n d\n',
    },
    {
      name: 'delete at the end',
      after: 'a\nb\nc\nd\ne\nf\n',
      hunk: '@@ -4,4 +4,3 @@\n d\n e\n f\n-g\n',
    },
    {
      name: 'insert in the middle',
      after: 'a\nb\nc\nnew\nd\ne\nf\ng\n',
      hunk: '@@ -1,6 +1,7 @@\n a\n b\n c\n+new\n d\n e\n f\n',
    },
    {
      name: 'delete in the middle',
      after: 'a\nb\nc\ne\nf\ng\n',
      hunk: '@@ -1,7 +1,6 @@\n a\n b\n c\n-d\n e\n f\n g\n',
    },
    {
      name: 'retain both separated changes in one combined hunk',
      before: 'a\nb\nc\nd\ne\nf\ng\nh\ni\nj\nk\nl\n',
      after: 'a\nb\nc\nd\nE\nf\ng\nH\ni\nj\nk\nl\n',
      hunk: '@@ -2,10 +2,10 @@\n b\n c\n d\n-e\n-f\n-g\n-h\n+E\n+f\n+g\n+H\n i\n j\n k\n',
    },
  ];
  for (const entry of cases)
    await t.test(entry.name, async (t) => {
      const plan = await proposal(t, entry.before ?? original, entry.after);
      assert.equal(
        plan.proposal.changes[0].diff,
        '--- AGENTS.md\n+++ AGENTS.md\n' + entry.hunk,
      );
    });
});

test('file addition, deletion and empty content remain distinct', async (t) => {
  const cases = [
    {
      name: 'add an empty file',
      before: null,
      after: '',
      diff: '--- /dev/null\n+++ AGENTS.md\nold mode absent\nnew mode 644\n',
    },
    {
      name: 'delete an empty file',
      before: '',
      after: null,
      diff: '--- AGENTS.md\n+++ /dev/null\nold mode 644\nnew mode absent\n',
    },
    {
      name: 'add a nonempty file',
      before: null,
      after: 'new\n',
      diff: '--- /dev/null\n+++ AGENTS.md\nold mode absent\nnew mode 644\n@@ -0,0 +1,1 @@\n+new\n',
    },
    {
      name: 'delete a nonempty file without a final newline',
      before: 'old',
      after: null,
      diff: '--- AGENTS.md\n+++ /dev/null\nold mode 644\nnew mode absent\n@@ -1,1 +0,0 @@\n-old\n\\ No newline at end of file\n',
    },
    {
      name: 'fill an existing empty file',
      before: '',
      after: 'new\n',
      diff: '--- AGENTS.md\n+++ AGENTS.md\n@@ -0,0 +1,1 @@\n+new\n',
    },
    {
      name: 'empty a file without deleting it',
      before: 'old\n',
      after: '',
      diff: '--- AGENTS.md\n+++ AGENTS.md\n@@ -1,1 +0,0 @@\n-old\n',
    },
    {
      name: 'add one blank line to an empty file',
      before: '',
      after: '\n',
      diff: '--- AGENTS.md\n+++ AGENTS.md\n@@ -0,0 +1,1 @@\n+\n',
    },
    {
      name: 'remove the only blank line',
      before: '\n',
      after: '',
      diff: '--- AGENTS.md\n+++ AGENTS.md\n@@ -1,1 +0,0 @@\n-\n',
    },
  ];
  for (const entry of cases)
    await t.test(entry.name, async (t) => {
      const plan = await proposal(t, entry.before, entry.after);
      assert.equal(plan.proposal.changes[0].diff, entry.diff);
    });
});

test('line endings and final-newline state are rendered without normalization', async (t) => {
  const cases = [
    {
      name: 'add a final newline',
      before: 'same',
      after: 'same\n',
      hunk: '@@ -1,1 +1,1 @@\n-same\n\\ No newline at end of file\n+same\n',
    },
    {
      name: 'remove a final newline',
      before: 'same\n',
      after: 'same',
      hunk: '@@ -1,1 +1,1 @@\n-same\n+same\n\\ No newline at end of file\n',
    },
    {
      name: 'change two unterminated lines',
      before: 'old',
      after: 'new',
      hunk: '@@ -1,1 +1,1 @@\n-old\n\\ No newline at end of file\n+new\n\\ No newline at end of file\n',
    },
    {
      name: 'show an unterminated context line',
      before: 'old\nkept',
      after: 'new\nkept',
      hunk: '@@ -1,2 +1,2 @@\n-old\n+new\n kept\n\\ No newline at end of file\n',
    },
    {
      name: 'retain CRLF in changed and context lines',
      before: 'first\r\nold\r\nlast\r\n',
      after: 'first\r\nnew\r\nlast\r\n',
      hunk: '@@ -1,3 +1,3 @@\n first\r\n-old\r\n+new\r\n last\r\n',
    },
    {
      name: 'show a CRLF-to-LF change',
      before: 'same\r\n',
      after: 'same\n',
      hunk: '@@ -1,1 +1,1 @@\n-same\r\n+same\n',
    },
  ];
  for (const entry of cases)
    await t.test(entry.name, async (t) => {
      const plan = await proposal(t, entry.before, entry.after);
      assert.equal(
        plan.proposal.changes[0].diff,
        '--- AGENTS.md\n+++ AGENTS.md\n' + entry.hunk,
      );
      assert.equal(plan.proposal.changes[0].content, entry.after);
      assert.equal(
        plan.proposal.changes[0].beforeHash,
        hashContent(entry.before),
      );
    });
});

test('a mode-only change shows permissions without inventing content edits', async (t) => {
  const plan = await proposal(
    t,
    'Keep every instruction.\n',
    'Keep every instruction.\n',
    {
      fileMode: 0o755,
    },
  );
  assert.equal(
    plan.proposal.changes[0].diff,
    '--- AGENTS.md\n+++ AGENTS.md\nold mode 644\nnew mode 755\n',
  );
  assert.equal(plan.proposal.changes[0].beforeMode, 0o644);
  assert.equal(plan.proposal.changes[0].fileMode, 0o755);
});

test('a focused preview keeps full bytes, hashes and modes bound to consent and apply', async (t) => {
  const before = Array.from(
    { length: 80 },
    (_, index) => `Instruction ${index + 1}.`,
  ).join('\r\n');
  const after = before.replace('Instruction 40.', 'Run node --test.');
  const plan = await proposal(t, before, after, { fileMode: 0o600 });
  const change = plan.proposal.changes[0];
  assert.equal(change.content, after);
  assert.equal(change.beforeHash, hashContent(before));
  assert.equal(change.beforeMode, 0o644);
  assert.equal(change.fileMode, 0o600);
  assert.equal(plan.digest, digest(plan.proposal));
  assert(!change.diff!.includes('Instruction 1.'));
  for (const replacement of [
    {
      content: after.replace('Instruction 1.', 'An edit outside the preview.'),
    },
    { beforeHash: hashContent('different original bytes') },
    { beforeMode: 0o600 },
    { fileMode: 0o755 },
    { diff: change.diff + 'A different preview\n' },
  ]) {
    const altered = structuredClone(plan.proposal);
    Object.assign(altered.changes[0], replacement);
    assert.notEqual(digest(altered), plan.digest);
    await assert.rejects(
      applyPlan(plan.root, altered, {
        home: plan.home,
        approvedDigest: plan.digest,
      }),
      { code: 'consent-required' },
    );
  }
  assert.deepEqual(await readdir(plan.root), ['AGENTS.md']);
  assert.deepEqual(await readdir(plan.home), []);
  const filename = path.join(plan.root, 'AGENTS.md');
  assert.deepEqual(await readFile(filename), Buffer.from(before));
  assert.equal((await stat(filename)).mode & 0o777, 0o644);
  await writeFile(
    filename,
    before.replace('Instruction 1.', 'Concurrent edit.'),
  );
  await assert.rejects(
    applyPlan(plan.root, plan, {
      home: plan.home,
      approvedDigest: plan.digest,
    }),
    { code: 'stale-plan' },
  );
  await writeFile(filename, before);
  const result = await applyPlan(plan.root, plan, {
    home: plan.home,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.deepEqual(await readFile(filename), Buffer.from(after));
  assert.equal((await stat(filename)).mode & 0o777, 0o600);
  const applied = (await getStatus(plan.root)).manifest!.changes[0];
  assert.equal(applied.beforeHash, hashContent(before));
  assert.equal(applied.afterHash, hashContent(after));
});

test('an approved legacy whole-file preview retains its digest through apply', async (t) => {
  const plan = await proposal(t, 'old\n', 'new\n');
  plan.proposal.changes[0].diff =
    '--- AGENTS.md\n+++ AGENTS.md\n@@ -1,2 +1,2 @@\n-old\n-\n+new\n+';
  plan.digest = digest(plan.proposal);
  const approved = structuredClone(plan);
  const result = await applyPlan(plan.root, plan, {
    home: plan.home,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.deepEqual(plan, approved);
  assert.equal(
    await readFile(path.join(plan.root, 'AGENTS.md'), 'utf8'),
    'new\n',
  );
});
