import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import {
  parseManagedBlock,
  updateManagedBlock,
} from '../../scripts/core/blocks.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { verifyInfrastructure } from '../../scripts/verify/index.ts';

const begin = '<!-- tibicen:begin v1 -->';
const end = '<!-- tibicen:end v1 -->';
const block = (body = '', eol = '\n') =>
  `${begin}${eol}${body}${body ? eol : ''}${end}${eol}`;

async function fixture(t: TestContext) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-blocks-'));
  const home = await mkdtemp(path.join(tmpdir(), 'tibicen-blocks-home-'));
  t.after(async () => {
    await rm(root, { recursive: true, force: true });
    await rm(home, { recursive: true, force: true });
  });
  return { root, home };
}

test('adding a block discloses its separator and preserves the original prefix', () => {
  assert.equal(updateManagedBlock(null, { content: 'Rules' }), block('Rules'));
  for (const original of ['Owner rules', 'Owner rules\n', 'Owner rules\r\n']) {
    const updated = updateManagedBlock(original, { content: 'Rules' })!;
    assert.deepEqual(
      Buffer.from(updated.slice(0, original.length)),
      Buffer.from(original),
    );
    assert.equal(
      updated,
      original +
        (original.endsWith('\r\n')
          ? '\r\n'
          : original.endsWith('\n')
            ? '\n'
            : '\n\n') +
        block('Rules', original.endsWith('\r\n') ? '\r\n' : '\n'),
    );
  }
  assert.equal(updateManagedBlock(null, { content: null }), null);
  assert.equal(
    updateManagedBlock('Owner rules', { content: null }),
    'Owner rules',
  );
});

test('empty and moved blocks update or disappear in place without changing surrounding bytes', () => {
  const prefix = '\uFEFF# Правила пользователя\r\nНе менять данные.  \r\n\r\n';
  const suffix = '\r\n## Пользовательский раздел\r\nСохранить пробелы.  ';
  for (const oldBlock of [block('', '\r\n'), block('Old rules', '\r\n')]) {
    const original = prefix + oldBlock + suffix;
    const updated = updateManagedBlock(original, {
      content: 'New rules\nSecond line',
    })!;
    assert.equal(
      updated,
      prefix + block('New rules\r\nSecond line', '\r\n') + suffix,
    );
    assert.deepEqual(
      Buffer.from(updated.slice(0, prefix.length)),
      Buffer.from(prefix),
    );
    assert.deepEqual(
      Buffer.from(updated.slice(-suffix.length)),
      Buffer.from(suffix),
    );
    assert.equal(
      updateManagedBlock(original, { content: null }),
      prefix + suffix,
    );
  }
  const noFinalNewline = block('Rules').trimEnd();
  assert.equal(
    updateManagedBlock(noFinalNewline, { content: 'Changed' }),
    block('Changed').trimEnd(),
  );
  assert.equal(
    updateManagedBlock('\uFEFF' + block('Rules'), { content: null }),
    '\uFEFF',
  );
});

test('equal blocks are idempotent, including CRLF and empty content', () => {
  for (const body of ['', 'Rules', 'Line one\r\nLine two']) {
    const original = 'Owner\r\n' + block(body, '\r\n') + 'Tail';
    assert.equal(updateManagedBlock(original, { content: body }), original);
  }
});

test('legacy markers require an explicit conversion; unknown versions never migrate by guesswork', () => {
  const legacy =
    'Owner\n<!-- tibicen:begin -->\nRules\n<!-- tibicen:end -->\nTail';
  assert.equal(parseManagedBlock(legacy)!.version, 'legacy');
  assert.throws(() => updateManagedBlock(legacy, { content: 'Rules' }), {
    code: 'managed-block-migration-required',
  });
  assert.equal(
    updateManagedBlock(legacy, { content: 'Rules', migrate: true }),
    'Owner\n' + block('Rules') + 'Tail',
  );
  assert.equal(updateManagedBlock(legacy, { content: null }), 'Owner\nTail');
  assert.throws(
    () =>
      updateManagedBlock(block('Rules').replaceAll('v1', 'v2'), {
        content: 'Rules',
        migrate: true,
      }),
    { code: 'unsupported-managed-block-version' },
  );
});

const malformed = {
  duplicate: block() + block(),
  nested: `${begin}\n${begin}\n${end}\n${end}\n`,
  reversed: `${end}\n${begin}\n`,
  unclosed: `${begin}\nRules\n`,
  orphaned: `${end}\n`,
  mismatched: `${begin}\n<!-- tibicen:end -->\n`,
  damaged: `${begin}\n<!-- tibicen:end v1 --\n`,
};
for (const [name, text] of Object.entries(malformed)) {
  test(`${name} markers refuse automatic changes and fail verification even with a matching hash`, async (t) => {
    const { root, home } = await fixture(t);
    await writeFile(path.join(root, 'AGENTS.md'), text);
    for (const content of ['New rules', null]) {
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [
              {
                path: 'AGENTS.md',
                managedBlock: { content },
                reason: 'Change block',
              },
            ],
          },
          { home },
        ),
        { code: 'invalid-managed-block' },
      );
    }
    const result = await verifyInfrastructure(root, {
      expectedFiles: [{ path: 'AGENTS.md', hash: hashContent(text) }],
    });
    assert.equal(result.status, 'issues-found');
    assert(
      result.issues!.some(
        (issue) =>
          issue.reason === 'invalid-managed-block' &&
          issue.path === 'AGENTS.md' &&
          Number.isInteger(issue.line),
      ),
    );
    assert(
      !result.issues!.some((issue) => issue.reason === 'content-mismatch'),
    );
    assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), text);
    assert.deepEqual(await readdir(root), ['AGENTS.md']);
    assert.deepEqual(await readdir(home), []);
  });
}

test('Markdown marker examples are ignored in fenced and indented code, not mistaken for active blocks', () => {
  const examples =
    '```md\n' +
    block() +
    block() +
    '```\n~~~~md\n' +
    block() +
    '~~~~\n    ' +
    begin +
    '\n    ' +
    end +
    '\n';
  assert.equal(parseManagedBlock(examples), null);
  assert.equal(
    updateManagedBlock(examples, { content: 'Rules' }),
    examples + '\n' + block('Rules'),
  );
  assert.throws(() => updateManagedBlock('```md\n', { content: 'Rules' }), {
    code: 'invalid-managed-block',
  });
  assert.throws(() => updateManagedBlock(null, { content: block() }), {
    code: 'invalid-managed-block',
  });
  assert.throws(() => updateManagedBlock(null, { content: '```md' }), {
    code: 'invalid-managed-block',
  });
});

test('proposal/apply preserve user instructions through block addition, replacement, no-op and removal', async (t) => {
  const { root, home } = await fixture(t);
  const filename = path.join(root, 'AGENTS.md');
  const owner = '# Пользователь\r\nНе трогать приложение.  \r\n';
  await writeFile(filename, owner);
  await writeFile(path.join(root, 'app.ts'), 'untouched application');
  const change = {
    path: 'AGENTS.md',
    managedBlock: { content: 'Rules' as string | null },
    reason: 'Only the Tibicen block',
  };
  const input = { mode: 'improve', changes: [change] };
  const added = await createProposal(root, input, { home });
  assert.deepEqual(
    await createProposal(root, input, { home }),
    added,
    'proposal must not mutate its input',
  );
  assert(added.proposal.changes[0].diff!.includes('+\r'));
  await assert.rejects(applyPlan(root, added, { home }), {
    code: 'consent-required',
  });
  assert.equal(
    (await applyPlan(root, added, { home, approvedDigest: added.digest }))
      .status,
    'complete',
  );
  assert.equal(
    await readFile(filename, 'utf8'),
    owner + '\r\n' + block('Rules', '\r\n'),
  );
  const noop = await createProposal(root, input, { home });
  assert.deepEqual(noop.proposal.changes, []);
  assert.deepEqual(noop.summary.files, []);
  change.managedBlock.content = 'Updated rules';
  const updated = await createProposal(root, input, { home });
  await applyPlan(root, updated, { home, approvedDigest: updated.digest });
  assert.equal(
    await readFile(filename, 'utf8'),
    owner + '\r\n' + block('Updated rules', '\r\n'),
  );
  change.managedBlock.content = null;
  const removed = await createProposal(root, input, { home });
  assert.equal(removed.proposal.changes[0].action, 'modify');
  assert(removed.proposal.changes[0].diff!.includes('-' + begin));
  await applyPlan(root, removed, { home, approvedDigest: removed.digest });
  assert.equal(await readFile(filename, 'utf8'), owner + '\r\n');
  assert.equal(
    await readFile(path.join(root, 'app.ts'), 'utf8'),
    'untouched application',
  );
});

test('block input cannot smuggle a full file replacement, unsupported format or malformed operation', async (t) => {
  const { root, home } = await fixture(t);
  for (const change of [
    {
      path: 'AGENTS.md',
      content: 'Outside change',
      managedBlock: { content: 'Rules' },
    },
    { path: 'AGENTS.md', action: 'delete', managedBlock: { content: null } },
    { path: '.mcp.json', managedBlock: { content: 'Rules' } },
    { path: 'AGENTS.md', managedBlock: { content: 'Rules', migrate: 'yes' } },
    { path: 'AGENTS.md', managedBlock: { content: 'Rules', extra: true } },
    { path: 'AGENTS.md', managedBlock: {} },
    { path: 'AGENTS.md', managedBlock: null },
  ]) {
    await assert.rejects(
      createProposal(root, { mode: 'init', changes: [change] }, { home }),
      { code: 'invalid-managed-block' },
    );
  }
  assert.deepEqual(await readdir(root), []);
  assert.deepEqual(await readdir(home), []);
});

test('explicit repair and migration have full reviewable diffs; malformed raw plans fail before writes', async (t) => {
  const { root, home } = await fixture(t);
  const original = 'Owner\n' + block('Rules').replaceAll('v1', 'v9');
  await writeFile(path.join(root, 'AGENTS.md'), original);
  const invalid = await verifyInfrastructure(root, {
    expectedFiles: [{ path: 'AGENTS.md', hash: hashContent(original) }],
  });
  assert.equal(invalid.issues![0].reason, 'unsupported-managed-block-version');
  const repaired = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: 'Owner\n' + block('Rules'),
          reason: 'Explicit v9 to v1 repair',
        },
      ],
    },
    { home },
  );
  assert(
    repaired.proposal.changes[0].diff!.includes('-<!-- tibicen:begin v9 -->'),
  );
  assert(repaired.proposal.changes[0].diff!.includes('+' + begin));
  const raw = {
    ...repaired.proposal,
    changes: [{ ...repaired.proposal.changes[0], content: malformed.unclosed }],
  };
  await assert.rejects(
    applyPlan(root, raw, { home, approvedDigest: digest(raw) }),
    { code: 'invalid-managed-block' },
  );
  const unresolved = {
    ...repaired.proposal,
    changes: [
      { ...repaired.proposal.changes[0], managedBlock: { content: 'Rules' } },
    ],
  };
  await assert.rejects(
    applyPlan(root, unresolved, { home, approvedDigest: digest(unresolved) }),
    { code: 'invalid-plan' },
  );
  assert.deepEqual(await readdir(root), ['AGENTS.md']);
  assert.deepEqual(await readdir(home), []);
  assert.equal(
    (await applyPlan(root, repaired, { home, approvedDigest: repaired.digest }))
      .status,
    'complete',
  );
  const legacy =
    'Owner\r\n<!-- tibicen:begin -->\r\nRules\r\n<!-- tibicen:end -->\r\n';
  await writeFile(path.join(root, 'AGENTS.md'), legacy);
  const migrated = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          managedBlock: { content: 'Rules', migrate: true },
          reason: 'Explicit legacy conversion',
        },
      ],
    },
    { home },
  );
  assert(
    migrated.proposal.changes[0].diff!.includes('-<!-- tibicen:begin -->'),
  );
  assert(migrated.proposal.changes[0].diff!.includes('+' + begin));
  await applyPlan(root, migrated, { home, approvedDigest: migrated.digest });
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'Owner\r\n' + block('Rules', '\r\n'),
  );
});
