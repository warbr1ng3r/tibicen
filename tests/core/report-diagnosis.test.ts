import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { main } from '../../scripts/tibicen.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import type { CheckResult } from '../../scripts/core/types.ts';
import type { summarizeDiagnosis } from '../../scripts/core/diagnosis.ts';

type Report = {
  status: string;
  checks: { infrastructure?: CheckResult };
  diagnosis: ReturnType<typeof summarizeDiagnosis>;
};

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-current-report-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await writeFile(
    path.join(root, 'app.js'),
    'throw new Error("Do not execute");\n',
  );
  return { root, home };
}

const report = async (root: string) =>
  (await main(['report', '--root', root])) as Report;

test('report exposes additional documented profiles without creating or selecting an adapter', async (t) => {
  const { root, home } = await fixture(t);
  const files = {
    'AGENTS.md': '# Shared instructions\n',
    'GEMINI.md': '# Existing Gemini instructions\n',
    '.github/copilot-instructions.md': '# Existing Copilot instructions\n',
    '.zcode/config.json': '{}\n',
  };
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  const before = await readdir(root, { recursive: true });
  const current = await report(root);
  assert.equal(current.status, 'not-configured');
  assert.deepEqual(
    current.diagnosis.instructions.candidates.map((file) => file.path),
    ['.github/copilot-instructions.md', 'AGENTS.md', 'GEMINI.md'],
  );
  assert.deepEqual(
    current.diagnosis.instructions.harnessProfiles.map((profile) => profile.id),
    ['copilot-cli', 'gemini-cli', 'zcode'],
  );
  assert.deepEqual(
    current.diagnosis.instructions.adapterContracts.map(
      (adapter) => adapter.agent,
    ),
    ['claude-code', 'codex', 'cursor'],
  );
  assert.equal(current.diagnosis.instructions.loading.status, 'unverified');
  assert.equal(current.diagnosis.instructions.use.status, 'unverified');
  assert.deepEqual(await readdir(root, { recursive: true }), before);
  assert.deepEqual(await readdir(home), []);
  for (const [relative, content] of Object.entries(files))
    assert.equal(await readFile(path.join(root, relative), 'utf8'), content);
  assert.equal(
    await readFile(path.join(root, 'app.js'), 'utf8'),
    'throw new Error("Do not execute");\n',
  );
});

test('report inspects native root/subtree instructions without creating a session or running code', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, 'src'));
  await mkdir(path.join(root, 'packages/ui/.cursor/rules'), {
    recursive: true,
  });
  const rootRules = '# Rules\nWrite documentation in English.\n';
  const nestedRules = '# Rules\nLocal examples may use Russian.\n';
  await writeFile(path.join(root, 'AGENTS.md'), rootRules);
  await writeFile(path.join(root, 'src/AGENTS.md'), nestedRules);
  await writeFile(
    path.join(root, 'packages/ui/.cursorrules'),
    'Local UI rules\n',
  );
  await writeFile(
    path.join(root, 'packages/ui/.cursor/rules/local.mdc'),
    'Scoped UI rules\n',
  );
  await writeFile(path.join(root, '.env'), 'SECRET=private-test-value\n');
  const before = await readdir(root, { recursive: true });
  const current = await report(root);
  assert.equal(current.status, 'not-configured');
  assert.equal(current.diagnosis.recordedSession, null);
  assert.deepEqual(
    current.diagnosis.instructions.candidates.map(({ path, directory }) => ({
      path,
      directory,
    })),
    [
      { path: 'AGENTS.md', directory: '.' },
      {
        path: 'packages/ui/.cursor/rules/local.mdc',
        directory: 'packages/ui/.cursor/rules',
      },
      { path: 'packages/ui/.cursorrules', directory: 'packages/ui' },
      { path: 'src/AGENTS.md', directory: 'src' },
    ],
  );
  assert.equal(current.diagnosis.instructions.loading.status, 'unverified');
  assert.equal(current.diagnosis.instructions.use.status, 'unverified');
  assert.ok(!JSON.stringify(current).includes('private-test-value'));
  assert.deepEqual(await readdir(root, { recursive: true }), before);
  assert.deepEqual(await readdir(home), []);
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), rootRules);
  assert.equal(
    await readFile(path.join(root, 'src/AGENTS.md'), 'utf8'),
    nestedRules,
  );
});

test('a fresh report exposes current drift while preserving recorded complete checks and identity', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Rules\nKeep useful notes.\n',
          reason: 'Rules',
        },
      ],
    },
    { home },
  );
  await applyPlan(root, plan, { home, approvedDigest: plan.digest });
  const baseline = await report(root);
  assert.equal(baseline.status, 'complete');
  const manifestPath = path.join(root, '.tibicen/manifest.yml');
  const manifest = await readFile(manifestPath, 'utf8');
  await writeFile(path.join(root, 'AGENTS.md'), '# Changed owner rules\n');
  const current = await report(root);
  assert.equal(current.status, 'complete');
  assert.deepEqual(current.checks, baseline.checks);
  assert.deepEqual(
    current.diagnosis.recordedSession,
    baseline.diagnosis.recordedSession,
  );
  assert.equal(current.diagnosis.structure.status, 'issues-found');
  assert.ok(
    current.diagnosis.structure.issues.some(
      (issue) =>
        issue.path === 'AGENTS.md' && issue.reason === 'content-mismatch',
    ),
  );
  assert.equal(await readFile(manifestPath, 'utf8'), manifest);
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    '# Changed owner rules\n',
  );
});

test('report and verify share pending-memory conflict handling without restoring later notes', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      memory: { path: '.agents/memory.md' },
      changes: [
        {
          path: 'AGENTS.md',
          content: 'Read .agents/memory.md before related work.\n',
          reason: 'Connect memory',
        },
        {
          path: '.agents/memory.md',
          content: '# Decisions\nOriginal.\n',
          reason: 'Retain decisions',
        },
      ],
    },
    { home },
  );
  const applied = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange(change) {
      if (change.path === '.agents/memory.md') throw new Error('Interrupted');
    },
  });
  assert.equal(applied.status, 'incomplete');
  const later = '# Decisions\nA later owner correction.\n';
  await writeFile(path.join(root, '.agents/memory.md'), later);
  const statePath = path.join(root, '.tibicen/state/session.json');
  const before = await readFile(statePath, 'utf8');
  const checked = (await main(['verify', '--root', root])) as CheckResult;
  const current = await report(root);
  assert.equal(current.status, 'incomplete');
  assert.ok(
    checked.issues?.some((issue) => issue.reason === 'pending-memory-conflict'),
  );
  assert.deepEqual(current.diagnosis.structure.issues, checked.issues);
  assert.equal(await readFile(statePath, 'utf8'), before);
  assert.equal(
    await readFile(path.join(root, '.agents/memory.md'), 'utf8'),
    later,
  );
});

test('report respects the unfinished plan forbidden paths instead of expanding its read scope', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, 'private'));
  await writeFile(
    path.join(root, 'private/AGENTS.md'),
    'private-instruction-sentinel\n',
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      forbiddenPaths: ['private'],
      changes: [
        { path: 'AGENTS.md', content: '# Public rules\n', reason: 'Rules' },
      ],
    },
    { home },
  );
  await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Interrupted');
    },
  });
  const statePath = path.join(root, '.tibicen/state/session.json');
  const before = await readFile(statePath, 'utf8');
  const current = await report(root);
  assert.equal(current.diagnosis.inventory.complete, false);
  assert.ok(
    current.diagnosis.inventory.coverageLimits.includes('forbidden-path'),
  );
  assert.ok(!JSON.stringify(current.diagnosis).includes('private/AGENTS.md'));
  assert.ok(
    current.diagnosis.instructions.candidates.every(
      (file) => !file.path.startsWith('private/'),
    ),
  );
  assert.ok(!JSON.stringify(current).includes('private-instruction-sentinel'));
  assert.equal(await readFile(statePath, 'utf8'), before);
});
