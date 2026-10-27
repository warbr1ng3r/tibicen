import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
  stat,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import type { ComponentUpdate, Source } from '../../scripts/core/types.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { runCommand } from '../../scripts/core/execute.ts';
import { fetchSourceFile } from '../../scripts/discovery/index.ts';

const oldSha = 'a'.repeat(40),
  newSha = 'b'.repeat(40);
const target = '.agents/skills/example/';
const oldFiles = {
  'SKILL.md': '# Original workflow\n',
  'reference.md': 'Keep useful context.\n',
  'obsolete.md': 'Obsolete context.\n',
};
const newFiles = {
  'SKILL.md': '# Updated workflow\n',
  'fresh.md': 'New reference.\n',
};
const local = '# Original workflow\nLocal project constraint.\n';
const source = (sha: string, files: Record<string, string>): Source => ({
  repo: 'owner/example',
  sha,
  license: 'MIT',
  skillPath: 'SKILL.md',
  files: Object.entries(files).map(([name, content]) => ({
    path: target + name,
    sourcePath: name,
    contentHash: hashContent(content),
  })),
});
const decision = (
  name: string,
  resolution: ComponentUpdate['decisions'][number]['resolution'],
) => ({
  path: target + name,
  resolution,
  reason: `Explicitly ${resolution} ${name} for this project.`,
});

function registry(
  additions: Record<string, string> = {},
  modes: Record<string, string> = {},
) {
  const blobs = new Map<string, unknown>(),
    trees = new Map<
      string,
      { path: string; sha: string; mode: string; size: number; type: string }[]
    >();
  for (const [sha, files] of [
    [oldSha, oldFiles],
    [newSha, newFiles],
  ] as const) {
    trees.set(
      sha,
      Object.entries({
        ...files,
        ...(sha === newSha ? additions : {}),
        LICENSE: 'MIT License\nCopyright example',
      }).map(([relative, content]) => {
        const bytes = Buffer.from(content),
          blobSha = createHash('sha1')
            .update(`blob ${bytes.length}\0`)
            .update(bytes)
            .digest('hex');
        blobs.set(blobSha, {
          sha: blobSha,
          encoding: 'base64',
          content: bytes.toString('base64'),
        });
        return {
          path: relative,
          sha: blobSha,
          size: bytes.length,
          mode: modes[relative] ?? '100644',
          type: 'blob',
        };
      }),
    );
  }
  let calls = 0;
  const routes = new Map<string, number>();
  const fetch = async (url: string) => {
    calls++;
    const parsed = new URL(url),
      route = parsed.pathname;
    routes.set(route, (routes.get(route) ?? 0) + 1);
    let data: unknown;
    if (route === '/repos/owner/example')
      data = {
        full_name: 'owner/example',
        archived: false,
        fork: false,
        created_at: '2025-01-01T00:00:00Z',
      };
    else if (route.includes('/commits/')) {
      const sha = route.split('/').at(-1)!;
      data = { sha, commit: { tree: { sha } } };
    } else if (route.includes('/git/trees/'))
      data = { tree: trees.get(route.split('/').at(-1)!), truncated: false };
    else if (route.includes('/git/blobs/'))
      data = blobs.get(route.split('/').at(-1)!);
    else if (route.endsWith('/license')) {
      const license = trees
        .get(parsed.searchParams.get('ref')!)!
        .find((item) => item.path === 'LICENSE')!;
      data = { ...license, license: { spdx_id: 'MIT' } };
    }
    return new Response(JSON.stringify(data ?? {}), {
      status: data ? 200 : 404,
    });
  };
  return {
    fetch,
    now: '2026-10-22T00:00:00Z',
    blocklist: [],
    calls: () => calls,
    routes,
  };
}

async function fixture(t: TestContext, schema = 2) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-components-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home');
  await mkdir(home);
  await mkdir(path.join(root, target), { recursive: true });
  await mkdir(path.join(root, '.tibicen'));
  for (const [name, content] of Object.entries(oldFiles))
    await writeFile(path.join(root, target, name), content);
  await writeFile(
    path.join(root, target, 'user-note.md'),
    'A foreign neighboring file.\r\n',
  );
  await writeFile(
    path.join(root, 'app.ts'),
    'Existing application, unchanged.\n',
  );
  const installed = source(oldSha, oldFiles);
  if (schema === 2)
    for (const file of installed.files!) file.installedHash = file.contentHash;
  const manifest = {
    schema,
    tibicen: { status: 'complete' },
    installed: [installed],
    sessions: [
      {
        id: 'prior-session',
        attempts: [],
        status: 'complete',
        manualActions: [],
      },
    ],
    changes: [],
  };
  const passport = path.join(root, '.tibicen/manifest.yml');
  await writeFile(passport, JSON.stringify(manifest));
  return { root, home, passport, manifest, discovery: registry() };
}

const update = (resolution: 'preserve' | 'merge' | 'replace' = 'preserve') => ({
  mode: 'improve',
  componentUpdates: [
    {
      source: source(newSha, newFiles),
      decisions: [
        decision('SKILL.md', resolution),
        decision('reference.md', 'preserve'),
        decision('obsolete.md', 'remove'),
      ],
    },
  ],
  changes: [
    {
      path: target + 'fresh.md',
      content: newFiles['fresh.md'],
      reason: 'Install the new pinned reference.',
    },
    {
      path: target + 'obsolete.md',
      action: 'delete',
      reason: 'Remove the obsolete resource explicitly.',
    },
  ],
});

test('three-state update preserves local bytes, tracks old resources and excludes foreign neighbors', async (t) => {
  const { root, home, discovery, manifest } = await fixture(t);
  await writeFile(path.join(root, target, 'SKILL.md'), local);
  const plan = await createProposal(root, update(), { home });
  assert.equal(
    discovery.calls(),
    0,
    'Proposal does not execute or fetch a source.',
  );
  assert.equal(plan.summary.components.fromSchema, 2);
  const result = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.manifest!.schema, 2);
  assert.equal(
    await readFile(path.join(root, target, 'SKILL.md'), 'utf8'),
    local,
  );
  assert.equal(
    await readFile(path.join(root, target, 'reference.md'), 'utf8'),
    oldFiles['reference.md'],
  );
  assert.equal(
    await readFile(path.join(root, target, 'user-note.md'), 'utf8'),
    'A foreign neighboring file.\r\n',
  );
  await assert.rejects(readFile(path.join(root, target, 'obsolete.md')), {
    code: 'ENOENT',
  });
  const installed = result.manifest!.installed;
  const changed = installed
    .find((item) => item.sha === newSha)!
    .files!.find((file) => file.path.endsWith('SKILL.md'))!;
  assert.equal(changed.contentHash, hashContent(newFiles['SKILL.md']));
  assert.equal(changed.installedHash, hashContent(local));
  assert.notEqual(changed.contentHash, changed.installedHash);
  assert.deepEqual(
    installed
      .find((item) => item.sha === oldSha)!
      .files!.map((file) => file.path),
    [target + 'reference.md'],
  );
  assert(
    !installed.some((item) =>
      item.files!.some((file) => /user-note|obsolete/.test(file.path)),
    ),
  );
  assert.deepEqual(result.manifest!.sessions[0], manifest.sessions[0]);
  const history = result.manifest!.sessions.at(-1)!;
  assert.equal(
    history.components!.find((file) => file.path.endsWith('obsolete.md'))!
      .previous!.sha,
    oldSha,
  );
  assert.equal(
    history.components!.find((file) => file.path.endsWith('obsolete.md'))!.next,
    null,
  );
  assert.equal(
    history.components!.find((file) => file.path.endsWith('SKILL.md'))!
      .resolution,
    'preserve',
  );
  assert.equal(
    await readFile(path.join(root, 'app.ts'), 'utf8'),
    'Existing application, unchanged.\n',
  );
  assert.equal((await getStatus(root)).state, null);
});

for (const resolution of ['merge', 'replace'] as const) {
  test(`local update requires and records an explicit ${resolution} decision`, async (t) => {
    const { root, home, discovery } = await fixture(t);
    await writeFile(path.join(root, target, 'SKILL.md'), local);
    const input = update(resolution),
      content =
        resolution === 'merge'
          ? newFiles['SKILL.md'] + 'Local project constraint.\n'
          : newFiles['SKILL.md'];
    input.changes.push({
      path: target + 'SKILL.md',
      content,
      reason: `Show the exact ${resolution} diff.`,
    });
    const plan = await createProposal(root, input, { home });
    assert(
      plan.proposal.changes
        .find((change) => change.path.endsWith('SKILL.md'))!
        .diff!.includes('-Local project constraint.'),
    );
    const result = await applyPlan(root, plan, {
      home,
      discovery,
      approvedDigest: plan.digest,
    });
    assert.equal(result.status, 'complete');
    const file = result
      .manifest!.installed.find((item) => item.sha === newSha)!
      .files!.find((file) => file.path.endsWith('SKILL.md'))!;
    assert.equal(file.contentHash, hashContent(newFiles['SKILL.md']));
    assert.equal(file.installedHash, hashContent(content));
    assert.equal(
      await readFile(path.join(root, target, 'SKILL.md'), 'utf8'),
      content,
    );
  });
}

test('local changes and removed upstream resources cannot receive an implicit decision', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, target, 'SKILL.md'), local);
  const noLocalChoice = update();
  noLocalChoice.componentUpdates[0].decisions =
    noLocalChoice.componentUpdates[0].decisions.filter(
      (item) => !item.path.endsWith('SKILL.md'),
    );
  await assert.rejects(createProposal(root, noLocalChoice, { home }), {
    code: 'component-decision-required',
  });
  const noRemovedChoice = update();
  noRemovedChoice.componentUpdates[0].decisions = [
    decision('SKILL.md', 'preserve'),
  ];
  await assert.rejects(createProposal(root, noRemovedChoice, { home }), {
    code: 'component-decision-required',
  });
  assert.equal(
    await readFile(path.join(root, target, 'obsolete.md'), 'utf8'),
    oldFiles['obsolete.md'],
  );
  assert.deepEqual(await readdir(home), []);
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
    'manifest.yml',
  ]);
});

test('clean files update without a local override, while still showing the full diff', async (t) => {
  const { root, home, discovery } = await fixture(t);
  const input = update('replace');
  input.componentUpdates[0].decisions =
    input.componentUpdates[0].decisions.filter(
      (item) => !item.path.endsWith('SKILL.md'),
    );
  input.changes.push({
    path: target + 'SKILL.md',
    content: newFiles['SKILL.md'],
    reason: 'Replace the clean old resource with the new pinned bytes.',
  });
  const plan = await createProposal(root, input, { home });
  const result = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(
    await readFile(path.join(root, target, 'SKILL.md'), 'utf8'),
    newFiles['SKILL.md'],
  );
});

test('new upstream resources cannot claim a foreign path even when bytes already match', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, target, 'fresh.md'), newFiles['fresh.md']);
  await assert.rejects(createProposal(root, update(), { home }), {
    code: 'component-path-conflict',
  });
  const initial = {
    mode: 'improve',
    sources: [{ ...source(newSha, newFiles), repo: 'other/example' }],
    changes: [],
  };
  await assert.rejects(createProposal(root, initial, { home }), {
    code: 'component-path-conflict',
  });
  assert.deepEqual(await readdir(home), []);
});

test('resolutions must match the actual file operation and cannot target foreign neighbors', async (t) => {
  const { root, home } = await fixture(t);
  const preserveWithEdit = update();
  preserveWithEdit.changes.push({
    path: target + 'SKILL.md',
    content: 'Unexpected edit',
    reason: 'Contradicts preserve.',
  });
  await assert.rejects(createProposal(root, preserveWithEdit, { home }), {
    code: 'component-resolution-mismatch',
  });
  const removeWithoutDelete = update();
  removeWithoutDelete.changes.pop();
  await assert.rejects(createProposal(root, removeWithoutDelete, { home }), {
    code: 'component-resolution-mismatch',
  });
  await assert.rejects(createProposal(root, update('merge'), { home }), {
    code: 'component-content-required',
  });
  const foreignChoice = update();
  foreignChoice.componentUpdates[0].decisions.push(
    decision('user-note.md', 'replace'),
  );
  await assert.rejects(createProposal(root, foreignChoice, { home }), {
    code: 'component-path-conflict',
  });
});

test('a source update cannot bypass reconciliation by using the initial-install sources field', async (t) => {
  const { root, home } = await fixture(t);
  await assert.rejects(
    createProposal(
      root,
      { mode: 'improve', sources: [source(newSha, newFiles)] },
      { home },
    ),
    { code: 'component-update-required' },
  );
});

test('deleted resources are not listed as installed and selected missing files cannot pretend to be preserved', async (t) => {
  const { root, home, discovery } = await fixture(t);
  await rm(path.join(root, target, 'SKILL.md'));
  await assert.rejects(createProposal(root, update(), { home }), {
    code: 'component-content-required',
  });
  await writeFile(path.join(root, target, 'SKILL.md'), oldFiles['SKILL.md']);
  await rm(path.join(root, target, 'obsolete.md'));
  const input = update();
  input.changes.pop();
  const plan = await createProposal(root, input, { home });
  const result = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert(
    !result.manifest!.installed.some((item) =>
      item.files!.some((file) => file.path.endsWith('obsolete.md')),
    ),
  );
  await assert.rejects(readFile(path.join(root, target, 'obsolete.md')), {
    code: 'ENOENT',
  });
});

test('passport migration is explicit and preserves the original history and provenance', async (t) => {
  const { root, home, passport, manifest } = await fixture(t, 1);
  const before = await readFile(passport, 'utf8');
  await assert.rejects(createProposal(root, { mode: 'improve' }, { home }), {
    code: 'manifest-migration-required',
  });
  assert.equal(await readFile(passport, 'utf8'), before);
  const plan = await createProposal(
    root,
    { mode: 'improve', migrateManifest: true },
    { home },
  );
  assert.equal(plan.summary.components.fromSchema, 1);
  assert.equal(plan.summary.components.toSchema, 2);
  assert.deepEqual(await readdir(home), []);
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  assert.equal(result.manifest!.schema, 2);
  assert.deepEqual(result.manifest!.sessions[0], manifest.sessions[0]);
  assert.deepEqual(result.manifest!.sessions.at(-1)!.manifestMigration, {
    from: 1,
    to: 2,
  });
  for (const file of result.manifest!.installed[0].files!)
    assert.equal(file.installedHash, file.contentHash);
  assert.equal(
    result.manifest!.installed[0].provenance,
    'unverified',
    'Migration cannot invent a previously unverified origin.',
  );
});

test('initial source installation still checks pinned bytes and records upstream and installed hashes', async (t) => {
  const { root, home, passport, discovery } = await fixture(t);
  await rm(passport);
  await rm(path.join(root, target), { recursive: true });
  const input = {
    mode: 'improve',
    sources: [source(newSha, newFiles)],
    changes: Object.entries(newFiles).map(([name, content]) => ({
      path: target + name,
      content,
      reason: 'Install the pinned component for the first time.',
    })),
  };
  const plan = await createProposal(root, input, { home });
  const result = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.manifest!.installed[0].provenance, 'provenance-verified');
  for (const file of result.manifest!.installed[0].files!)
    assert.equal(file.installedHash, file.contentHash);
});

test('older saved state and incomplete schema 2 passports refuse continuation without rewriting data', async (t) => {
  const { root, home, passport, manifest } = await fixture(t);
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  await mkdir(path.join(root, '.tibicen/state'));
  const filename = path.join(root, '.tibicen/state/session.json');
  const legacy = JSON.stringify({
    schema: 1,
    proposal: plan.proposal,
    proposalDigest: plan.digest,
  });
  await writeFile(filename, legacy);
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest, resume: true }),
    { code: 'unsupported-state-schema' },
  );
  assert.equal(await readFile(filename, 'utf8'), legacy);
  await rm(path.join(root, '.tibicen/state'), { recursive: true });
  delete manifest.installed[0].files![0].installedHash;
  await writeFile(passport, JSON.stringify(manifest));
  await assert.rejects(createProposal(root, { mode: 'improve' }, { home }), {
    code: 'invalid-manifest',
  });
  assert.deepEqual(await readdir(home), []);
});

for (const schema of [0, 3, 999]) {
  test(`unsupported passport schema ${schema} refuses all writes`, async (t) => {
    const { root, home, passport, manifest } = await fixture(t);
    const plan = await createProposal(root, { mode: 'improve' }, { home });
    await writeFile(passport, JSON.stringify({ ...manifest, schema }));
    const before = await readFile(passport, 'utf8');
    await assert.rejects(
      createProposal(
        root,
        { mode: 'improve', migrateManifest: true },
        { home },
      ),
      { code: 'unsupported-manifest-schema' },
    );
    await assert.rejects(
      applyPlan(root, plan, { home, approvedDigest: plan.digest }),
      { code: 'unsupported-manifest-schema' },
    );
    assert.equal(await readFile(passport, 'utf8'), before);
    assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
      'manifest.yml',
    ]);
    assert.deepEqual(await readdir(home), []);
  });
}

test('changes to a preserved file or the passport invalidate consent before any write', async (t) => {
  const { root, home, passport, manifest } = await fixture(t);
  const plan = await createProposal(root, update(), { home });
  await writeFile(path.join(root, target, 'SKILL.md'), local);
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-plan' },
  );
  await writeFile(path.join(root, target, 'SKILL.md'), oldFiles['SKILL.md']);
  await writeFile(
    passport,
    JSON.stringify({ ...manifest, gaps: ['Changed after review'] }),
  );
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-plan' },
  );
  assert.deepEqual(await readdir(home), []);
});

test('a modified resolved inventory or wrong upstream hash cannot grant ownership or provenance', async (t) => {
  const { root, home, discovery } = await fixture(t);
  const plan = await createProposal(root, update(), { home });
  const forged = structuredClone(plan.proposal);
  forged.components.files[0].next!.contentHash = 'f'.repeat(64);
  await assert.rejects(
    applyPlan(root, forged, {
      home,
      discovery,
      approvedDigest: digest(forged),
    }),
    { code: 'stale-plan' },
  );
  const wrong = update();
  wrong.componentUpdates[0].source.files![0].contentHash = 'f'.repeat(64);
  const wrongPlan = await createProposal(root, wrong, { home });
  await assert.rejects(
    applyPlan(root, wrongPlan, {
      home,
      discovery,
      approvedDigest: wrongPlan.digest,
    }),
    { code: 'source-hash-mismatch' },
  );
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
    'manifest.yml',
  ]);
  assert.deepEqual(await readdir(home), []);
});

test('partial update records only actual files and resumes with its original component baseline', async (t) => {
  const { root, home, discovery } = await fixture(t);
  await writeFile(path.join(root, target, 'SKILL.md'), local);
  const plan = await createProposal(root, update(), { home });
  const first = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Interrupted after first file.');
    },
  });
  assert.equal(first.status, 'incomplete');
  const partial = (await getStatus(root)).manifest!;
  assert(
    partial.installed.some(
      (item) =>
        item.sha === newSha &&
        item.files!.some((file) => file.path.endsWith('fresh.md')),
    ),
  );
  assert(
    partial.installed.some(
      (item) =>
        item.sha === oldSha &&
        item.files!.some((file) => file.path.endsWith('obsolete.md')),
    ),
  );
  const resumed = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
    resume: true,
  });
  assert.equal(resumed.status, 'complete');
  assert.equal(resumed.id, first.id);
  assert.equal(resumed.manifest!.sessions.length, 2);
  assert.equal(resumed.manifest!.sessions.at(-1)!.attempts.length, 2);
  assert(
    !resumed.manifest!.installed.some((item) =>
      item.files!.some((file) => file.path.endsWith('obsolete.md')),
    ),
  );
});

test('a remaining proposal recovers ownership written before the interrupted passport update', async (t) => {
  const { root, home, discovery, passport } = await fixture(t);
  const originalPassport = await readFile(passport, 'utf8');
  const first = await createProposal(root, update(), { home });
  await assert.rejects(
    applyPlan(root, first, {
      home,
      discovery,
      approvedDigest: first.digest,
      checkpoint(point) {
        if (point === 'after-file-write' || point === 'before-manifest-write')
          throw new Error('Interrupted before recording the new passport.');
      },
    }),
  );
  assert.equal(await readFile(passport, 'utf8'), originalPassport);
  assert.equal(
    await readFile(path.join(root, target, 'fresh.md'), 'utf8'),
    newFiles['fresh.md'],
  );
  const remaining = await createProposal(root, update(), { home });
  assert.equal(
    remaining.proposal.components.files.find((file) =>
      file.path.endsWith('fresh.md'),
    )!.previous!.sha,
    newSha,
  );
  const result = await applyPlan(root, remaining, {
    home,
    discovery,
    resume: true,
    approvedDigest: remaining.digest,
  });
  assert.equal(result.status, 'complete');
  const installed = result.manifest!.installed.find(
    (source) => source.sha === newSha,
  )!;
  assert(installed.files!.some((file) => file.path === target + 'fresh.md'));
  assert(
    !result.manifest!.installed.some((source) =>
      source.files!.some((file) => file.path.endsWith('user-note.md')),
    ),
  );
  assert(
    result
      .manifest!.sessions.at(-1)!
      .changes!.some(
        (change) =>
          change.path === target + 'fresh.md' &&
          change.evidence === 'matches-approved-result',
      ),
  );
});

test('resume cannot promote unverified provenance or rewrite old history by editing its saved baseline', async (t) => {
  const { root, home, discovery } = await fixture(t);
  const plan = await createProposal(root, update(), { home });
  await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Interrupt');
    },
  });
  const filename = path.join(root, '.tibicen/state/session.json');
  const saved = JSON.parse(await readFile(filename, 'utf8'));
  saved.componentBaseline.manifest.installed[0].provenance =
    'provenance-verified';
  saved.componentBaseline.manifest.sessions[0].status = 'rewritten';
  await writeFile(filename, JSON.stringify(saved));
  await assert.rejects(
    applyPlan(root, plan, {
      home,
      discovery,
      approvedDigest: plan.digest,
      resume: true,
    }),
    { code: 'stale-plan' },
  );
  assert.equal(
    (await getStatus(root)).manifest!.sessions[0].status,
    'complete',
  );
});

test('a new SHA cannot hide preserved bytes from a blocked old revision; exact replacement can remove it', async (t) => {
  const { root, home, discovery } = await fixture(t);
  const blocked = { ...discovery, blocklist: [oldSha] };
  const preserved = await createProposal(root, update(), { home });
  await assert.rejects(
    applyPlan(root, preserved, {
      home,
      discovery: blocked,
      approvedDigest: preserved.digest,
    }),
    { code: 'source-blocked' },
  );
  assert.deepEqual(await readdir(home), []);
  const replaced = update('replace');
  replaced.componentUpdates[0].decisions = [
    decision('SKILL.md', 'replace'),
    decision('reference.md', 'remove'),
    decision('obsolete.md', 'remove'),
  ];
  replaced.changes.push({
    path: target + 'SKILL.md',
    content: newFiles['SKILL.md'],
    reason: 'Replace the blocked revision with verified new bytes.',
  });
  replaced.changes.push({
    path: target + 'reference.md',
    action: 'delete',
    reason: 'Remove the last retained old resource explicitly.',
  });
  const plan = await createProposal(root, replaced, { home });
  const result = await applyPlan(root, plan, {
    home,
    discovery: blocked,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert(result.manifest!.installed.every((source) => source.sha === newSha));
  assert.equal(
    result
      .manifest!.sessions.at(-1)!
      .components!.find((file) => file.path.endsWith('reference.md'))!.previous!
      .sha,
    oldSha,
  );
});

test('an unchanged verification session does not duplicate the entire installed inventory in history', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(root, { mode: 'improve' }, { home });
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  assert.equal(
    result.manifest!.installed[0].files!.length,
    Object.keys(oldFiles).length,
  );
  assert.deepEqual(result.manifest!.sessions.at(-1)!.components, []);
});

test('new upstream executables carry verified permissions into their plan and installed passport', async (t) => {
  const { home } = await fixture(t);
  const root = path.join(home, 'fresh-project');
  await mkdir(root);
  const helper = '#!/bin/sh\nexit 0\n',
    files = { ...newFiles, 'run.sh': helper };
  const selected = source(newSha, files);
  selected.files = selected.files!.map((file) => ({
    ...file,
    fileMode: file.sourcePath === 'run.sh' ? 0o755 : 0o644,
  }));
  const discovery = registry({ 'run.sh': helper }, { 'run.sh': '100755' });
  const input = {
    mode: 'init',
    sources: [selected],
    changes: Object.entries(files).map(([name, content]) => ({
      path: target + name,
      content,
      reason: 'Install the pinned resource.',
    })),
  };
  const plan = await createProposal(root, input, { home });
  assert.equal(
    plan.proposal.changes.find((file) => file.path.endsWith('run.sh'))!
      .fileMode,
    0o755,
  );
  const forged = structuredClone(input);
  forged.sources[0].files!.find(
    (file) => file.sourcePath === 'run.sh',
  )!.fileMode = 0o644;
  const invalid = await createProposal(root, forged, { home });
  await assert.rejects(
    applyPlan(root, invalid, {
      home,
      discovery,
      approvedDigest: invalid.digest,
    }),
    { code: 'source-mode-mismatch' },
  );
  await assert.rejects(readdir(path.join(root, '.tibicen')), {
    code: 'ENOENT',
  });
  const result = await applyPlan(root, plan, {
    home,
    discovery,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  const installed = result.manifest!.installed[0].files!.find(
    (file) => file.sourcePath === 'run.sh',
  )!;
  assert.equal(installed.fileMode, 0o755);
  assert.equal(installed.installedMode, 0o755);
  assert.equal(
    (await stat(path.join(root, target + 'run.sh'))).mode & 0o777,
    0o755,
  );
  assert.equal(
    (
      await runCommand(
        {
          id: 'helper',
          kind: 'test',
          executable: path.join(root, target + 'run.sh'),
          argv: [],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
        { root, approvedDigest: plan.digest },
      )
    ).exitCode,
    0,
  );
});

test('twenty-file apply reuses immutable reads but a later apply rechecks eligibility', async (t) => {
  const { home } = await fixture(t);
  const root = path.join(home, 'many-files');
  await mkdir(root);
  const additions = Object.fromEntries(
    Array.from({ length: 18 }, (_, index) => [
      `references/${index}.md`,
      `Reference ${index}\n`,
    ]),
  );
  const files = { ...newFiles, ...additions },
    selected = source(newSha, files);
  const discovery = registry(additions);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      sources: [selected],
      changes: Object.entries(files).map(([name, content]) => ({
        path: target + name,
        content,
        reason: 'Install the twenty-file component.',
      })),
    },
    { home },
  );
  assert.equal(
    (
      await applyPlan(root, plan, {
        home,
        discovery,
        approvedDigest: plan.digest,
      })
    ).status,
    'complete',
  );
  assert.equal(
    discovery.routes.get(`/repos/owner/example/commits/${newSha}`),
    2,
  );
  assert.equal(
    discovery.routes.get(`/repos/owner/example/git/trees/${newSha}`),
    2,
  );
  assert.equal(discovery.calls(), 47);
  const again = await createProposal(
    root,
    { mode: 'improve', sources: [selected] },
    { home },
  );
  const withCache = { ...discovery, sourceCache: new Map<string, unknown>() };
  await applyPlan(root, again, {
    home,
    discovery: withCache,
    approvedDigest: again.digest,
  });
  assert.equal(discovery.routes.get('/repos/owner/example'), 2);
  assert.equal(
    discovery.routes.get(`/repos/owner/example/git/trees/${newSha}`),
    4,
  );
  const repeated = await createProposal(
    root,
    { mode: 'improve', sources: [selected] },
    { home },
  );
  await applyPlan(root, repeated, {
    home,
    discovery: withCache,
    approvedDigest: repeated.digest,
  });
  assert.equal(
    discovery.routes.get(`/repos/owner/example/git/trees/${newSha}`),
    6,
  );
  const changed = {
    ...discovery,
    fetch: async (url: string) =>
      new URL(url).pathname === '/repos/owner/example'
        ? new Response(
            JSON.stringify({ full_name: 'owner/example', archived: true }),
          )
        : discovery.fetch(url),
  };
  const before = await readFile(
    path.join(root, '.tibicen/manifest.yml'),
    'utf8',
  );
  const blocked = await createProposal(
    root,
    { mode: 'improve', sources: [selected] },
    { home },
  );
  await assert.rejects(
    applyPlan(root, blocked, {
      home,
      discovery: changed,
      approvedDigest: blocked.digest,
    }),
    { code: 'archived-source' },
  );
  await assert.rejects(
    applyPlan(root, blocked, {
      home,
      discovery: { ...discovery, blocklist: [newSha] },
      approvedDigest: blocked.digest,
    }),
    { code: 'source-blocked' },
  );
  assert.equal(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    before,
  );
});

test('an immutable cache distinguishes revisions and still verifies every source blob', async (t) => {
  const { home } = await fixture(t);
  const discovery = { ...registry(), sourceCache: new Map<string, unknown>() };
  assert.equal(
    await fetchSourceFile(
      { repo: 'owner/example', sha: oldSha, sourcePath: 'SKILL.md' },
      discovery,
    ),
    oldFiles['SKILL.md'],
  );
  assert.equal(
    await fetchSourceFile(
      { repo: 'owner/example', sha: newSha, sourcePath: 'SKILL.md' },
      discovery,
    ),
    newFiles['SKILL.md'],
  );
  const root = path.join(home, 'corrupt-files');
  await mkdir(root);
  const additions = Object.fromEntries(
    Array.from({ length: 18 }, (_, index) => [
      `references/${index}.md`,
      `Reference ${index}\n`,
    ]),
  );
  const files = { ...newFiles, ...additions },
    remote = registry(additions);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      sources: [source(newSha, files)],
      changes: Object.entries(files).map(([name, content]) => ({
        path: target + name,
        content,
        reason: 'Verify every resource.',
      })),
    },
    { home },
  );
  for (const content of Object.values(files)) {
    const bytes = Buffer.from(content),
      sha = createHash('sha1')
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest('hex');
    const fetch = async (url: string) =>
      url.endsWith('/git/blobs/' + sha)
        ? new Response(
            JSON.stringify({
              sha,
              encoding: 'base64',
              content: Buffer.from('tampered').toString('base64'),
            }),
          )
        : remote.fetch(url);
    await assert.rejects(
      applyPlan(root, plan, {
        home,
        discovery: { ...remote, fetch },
        approvedDigest: plan.digest,
      }),
      { code: 'source-hash-mismatch' },
    );
    await assert.rejects(readdir(path.join(root, '.tibicen')), {
      code: 'ENOENT',
    });
  }
});
