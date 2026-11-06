import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  readlink,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '../../scripts/tibicen.ts';
import { hashContent } from '../../scripts/core/contracts.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import type { summarizeDiagnosis } from '../../scripts/core/diagnosis.ts';

type Report = {
  status: string;
  diagnosis: ReturnType<typeof summarizeDiagnosis>;
};

async function fixture(t: TestContext) {
  const base = await mkdtemp(
    path.join(tmpdir(), 'tibicen-instruction-sources-'),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  const home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await writeFile(
    path.join(root, 'app.js'),
    'throw new Error("Do not run");\n',
  );
  return { base, root, home };
}

async function snapshot(root: string) {
  const files = [];
  for (const relative of (await readdir(root, { recursive: true })).sort()) {
    const filename = path.join(root, relative);
    const stat = await lstat(filename);
    files.push({
      path: relative,
      mode: stat.mode,
      ...(stat.isSymbolicLink()
        ? { link: await readlink(filename) }
        : stat.isFile()
          ? { hash: hashContent(await readFile(filename)) }
          : {}),
    });
  }
  return files;
}

function stdinReport(root: string, context: unknown, expectedExit = 0) {
  const result = spawnSync(
    process.execPath,
    [
      fileURLToPath(new URL('../../scripts/tibicen.ts', import.meta.url)),
      'report',
      '--root',
      root,
      '--input',
      '-',
    ],
    { input: JSON.stringify(context), encoding: 'utf8', timeout: 10000 },
  );
  assert.equal(result.status, expectedExit, result.stderr || result.stdout);
  return JSON.parse(result.stdout) as Report;
}

test('stdin custom instructions retain legacy context, discovery and bytes for an uncatalogued host', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, 'docs'));
  await writeFile(path.join(root, 'AGENTS.md'), '# Existing shared rules\n');
  const rules = '# Rules\nKeep dependency approval.\n';
  const jan = '# Local rules\nPreserve named exports.\n';
  await writeFile(path.join(root, 'RULES.md'), rules, { mode: 0o600 });
  await writeFile(path.join(root, 'docs/JAN.md'), jan, { mode: 0o640 });
  const context = {
    agent: 'team-agent',
    agentVersion: 'local-2',
    cwd: 'docs',
    targetPath: 'docs/task.md',
  };
  const before = await snapshot(root);
  const baseline = stdinReport(root, context);
  assert(!Object.hasOwn(baseline.diagnosis.instructions, 'sources'));
  const current = stdinReport(root, {
    ...context,
    instructionSources: [
      { path: 'RULES.md', hash: hashContent(rules) },
      { path: 'docs/JAN.md', hash: hashContent('Earlier instructions') },
    ],
  });
  const { sources, ...instructions } = current.diagnosis.instructions;
  assert.deepEqual(instructions, baseline.diagnosis.instructions);
  assert.deepEqual(instructions.taskScope?.context, context);
  assert.equal(instructions.taskScope?.host.status, 'unknown');
  assert.deepEqual(instructions.candidates, [
    { path: 'AGENTS.md', directory: '.' },
  ]);
  assert.equal(instructions.loading.status, 'unverified');
  assert.equal(instructions.use.status, 'unverified');
  assert.deepEqual(sources, [
    {
      path: 'docs/JAN.md',
      basis: 'caller-supplied',
      status: 'stale',
      hash: hashContent(jan),
      reason: 'source-hash-mismatch',
    },
    {
      path: 'RULES.md',
      basis: 'caller-supplied',
      status: 'matched-current-file',
      hash: hashContent(rules),
    },
  ]);
  assert.deepEqual(await snapshot(root), before);
  assert.deepEqual(await readdir(home), []);
  await assert.rejects(
    createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          { path: 'RULES.md', content: 'Replacement', reason: 'Source' },
        ],
      },
      { home },
    ),
    { code: 'application-protected' },
  );
  assert.deepEqual(await snapshot(root), before);
});

test('source reports retain forbidden, sensitive and symlink gaps without exposing supplied hashes', async (t) => {
  const { base, root, home } = await fixture(t);
  await mkdir(path.join(root, 'private'));
  const privateBody = 'Private source sentinel\n';
  const sensitiveBody = 'Sensitive source sentinel\n';
  await writeFile(path.join(root, 'private/RULES.md'), privateBody);
  await writeFile(path.join(root, '.env'), sensitiveBody);
  const outside = path.join(base, 'outside');
  await mkdir(outside);
  await writeFile(path.join(outside, 'RULES.md'), 'Outside source sentinel\n');
  await symlink(outside, path.join(root, 'alias'), 'dir');
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      forbiddenPaths: ['private'],
      changes: [
        { path: 'AGENTS.md', content: '# Approved rules\n', reason: 'Rules' },
      ],
    },
    { home },
  );
  await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    afterChange() {
      throw new Error('Interrupted fixture setup');
    },
  });
  const before = await snapshot(root);
  const inputs = [
    { path: 'private/RULES.md', hash: hashContent(privateBody) },
    { path: '.env', hash: hashContent(sensitiveBody) },
    { path: 'alias/RULES.md', hash: hashContent('Outside source sentinel\n') },
    { path: 'absent.md', hash: hashContent('Absent source sentinel\n') },
  ];
  const current = stdinReport(
    root,
    { agent: 'future-tool', cwd: '.', instructionSources: inputs },
    1,
  );
  assert.equal(current.status, 'incomplete');
  const sources = current.diagnosis.instructions.sources!;
  assert.equal(sources.length, 4);
  for (const [path, reason] of [
    ['private/RULES.md', 'forbidden-path'],
    ['.env', 'sensitive-path'],
    ['alias/RULES.md', 'symlink'],
    ['absent.md', 'scan-incomplete'],
  ]) {
    assert.deepEqual(
      sources.find((source) => source.path === path),
      {
        path,
        basis: 'caller-supplied',
        status: 'unavailable',
        reason,
      },
    );
  }
  const output = JSON.stringify(current);
  for (const input of inputs) assert(!output.includes(input.hash));
  for (const sentinel of [
    privateBody.trim(),
    sensitiveBody.trim(),
    'Outside source sentinel',
  ])
    assert(!output.includes(sentinel));
  assert.deepEqual(current.diagnosis.instructions.taskScope?.context, {
    agent: 'future-tool',
    cwd: '.',
  });
  assert.equal(current.diagnosis.inventory.complete, false);
  assert.deepEqual(await snapshot(root), before);
});

test('malformed source input fails before state inspection or explicit report save', async (t) => {
  const { base, root } = await fixture(t);
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, '.tibicen/manifest.yml'), '{ malformed');
  const before = await snapshot(root);
  const input = path.join(base, 'context.json');
  const source = { path: 'RULES.md', hash: hashContent('rules') };
  for (const instructionSources of [
    [{ ...source, loading: 'observed' }],
    [source, source],
    [{ ...source, path: '../outside' }],
    Array.from({ length: 17 }, (_, index) => ({
      ...source,
      path: `${index}.md`,
    })),
  ]) {
    await writeFile(
      input,
      JSON.stringify({ agent: 'future-tool', cwd: '.', instructionSources }),
    );
    await assert.rejects(
      main([
        'report',
        '--root',
        root,
        '--input',
        input,
        '--save',
        '--requested',
      ]),
      { code: 'invalid-task-context' },
    );
  }
  assert.deepEqual(await snapshot(root), before);
});
