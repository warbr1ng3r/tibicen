import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  chmod,
  lstat,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { main } from '../../scripts/tibicen.ts';
import { scanProject } from '../../scripts/scan/index.ts';
import type {
  summarizeDiagnosis,
  TaskContext,
} from '../../scripts/core/diagnosis.ts';

type Report = {
  status: string;
  diagnosis: ReturnType<typeof summarizeDiagnosis>;
};

const baseContext = {
  agent: 'team-agent',
  agentVersion: 'supplied-version',
  cwd: '.',
  targetPath: 'src/app.js',
};

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-context-review-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project');
  await mkdir(path.join(root, '.agents'), { recursive: true });
  await mkdir(path.join(root, 'src'));
  const files = {
    'AGENTS.md': '# Rules\nRead .agents/memory.md before related work.\n',
    '.agents/memory.md': '# Decisions\nUse the configured runner.\n',
    'config.json': '{"runner":"node"}\n',
    'src/app.js': 'throw new Error("Do not execute the project");\n',
  };
  for (const [relative, content] of Object.entries(files)) {
    await writeFile(path.join(root, relative), content);
    await chmod(path.join(root, relative), 0o640);
  }
  const scan = await scanProject(root);
  const hash = (relative: string) => {
    const file = scan.files.find((entry) => entry.path === relative);
    assert.ok(file, `Fixture source must be in the actual scan: ${relative}`);
    return file.hash;
  };
  const context: TaskContext = {
    ...baseContext,
    instructionSources: [{ path: 'AGENTS.md', hash: hash('AGENTS.md') }],
    memorySources: [
      {
        id: 'runner',
        memoryPath: '.agents/memory.md',
        noteReference: 'Configured runner',
        sourcePath: 'config.json',
        baselineHash: hash('config.json'),
      },
    ],
    versionImpacts: [
      {
        source: {
          url: 'https://docs.example.test/release?version=current',
          checkedAt: '2026-11-07',
          contentHash: 'b'.repeat(64),
        },
        versions: { from: 'prior-supplied', to: 'current-supplied' },
        upstreamChange: 'The host preserves accepted local configuration.',
        local: {
          path: 'config.json',
          contentHash: hash('config.json'),
          decision: 'Retain the accepted runner configuration.',
        },
        applicability: 'The supplied note concerns this configured host.',
        action: 'keep',
        reason: 'The local decision can stay.',
      },
    ],
  };
  return { base, root, context };
}

async function treeState(root: string) {
  return Promise.all(
    (await readdir(root, { recursive: true })).sort().map(async (relative) => {
      const filename = path.join(root, relative);
      const info = await lstat(filename);
      return {
        path: relative,
        mode: info.mode & 0o777,
        ...(info.isFile() ? { bytes: await readFile(filename) } : {}),
      };
    }),
  );
}

function stdinReport(root: string, context: TaskContext): Report {
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
    {
      input: JSON.stringify(context),
      encoding: 'utf8',
      timeout: 10000,
      maxBuffer: 1024 * 1024,
    },
  );
  assert.equal(result.error, undefined);
  assert.equal(result.signal, null);
  assert.equal(result.status, 0, result.stderr);
  return JSON.parse(result.stdout) as Report;
}

function withoutEvidence(report: Report): Report {
  const result = structuredClone(report);
  delete result.diagnosis.instructions.sources;
  delete result.diagnosis.memorySources;
  delete result.diagnosis.versionImpacts;
  return result;
}

test('all report evidence lists work together on stdin while legacy fields and project bytes stay unchanged', async (t) => {
  const { base, root, context } = await fixture(t);
  const input = path.join(base, 'base-context.json');
  await writeFile(input, JSON.stringify(baseContext));
  const before = await treeState(root);
  const legacy = (await main([
    'report',
    '--root',
    root,
    '--input',
    input,
  ])) as Report;
  const current = stdinReport(root, context);
  assert.deepEqual(
    withoutEvidence(current),
    JSON.parse(JSON.stringify(legacy)),
  );
  assert.deepEqual(
    current.diagnosis.instructions.taskScope?.context,
    baseContext,
  );
  assert.equal(
    current.diagnosis.instructions.sources?.[0].status,
    'matched-current-file',
  );
  assert.equal(current.diagnosis.instructions.loading.status, 'unverified');
  assert.equal(current.diagnosis.instructions.use.status, 'unverified');
  assert.equal(current.diagnosis.memorySources?.entries[0].status, 'unchanged');
  assert.equal(current.diagnosis.memorySources?.entries[0].action, 'keep');
  assert.equal(current.diagnosis.memorySources?.notePresence, 'unverified');
  assert.equal(current.diagnosis.versionImpacts?.[0].local.status, 'matched');
  assert.equal(
    current.diagnosis.versionImpacts?.[0].assessment.suggestedAction,
    'keep',
  );
  assert.equal(
    current.diagnosis.versionImpacts?.[0].versions.installedVersion,
    'unverified',
  );
  assert.equal(current.status, 'not-configured');
  assert.deepEqual(await treeState(root), before);
});

test('a changed source requires memory review and invalidates the prior version action without writing notes or state', async (t) => {
  const { base, root, context } = await fixture(t);
  await writeFile(path.join(root, 'config.json'), '{"runner":"pnpm"}\n');
  await writeFile(path.join(root, 'AGENTS.md'), '# Owner-corrected rules\n');
  const input = path.join(base, 'review-context.json');
  await writeFile(input, JSON.stringify(context));
  const before = await treeState(root);
  const current = (await main([
    'report',
    '--root',
    root,
    '--input',
    input,
  ])) as Report;
  assert.equal(current.diagnosis.instructions.sources?.[0].status, 'stale');
  assert.equal(current.diagnosis.memorySources?.entries[0].status, 'changed');
  assert.equal(current.diagnosis.memorySources?.entries[0].action, 'review');
  const impact = current.diagnosis.versionImpacts?.[0];
  assert.ok(impact);
  assert.equal(impact.local.status, 'changed');
  assert.equal(impact.assessment.suggestedAction, 'unknown');
  assert.equal(impact.assessment.reason, 'local-source-changed');
  assert.equal(impact.local.hash, undefined);
  assert.equal(impact.local.decision, undefined);
  assert.equal(impact.source.contentHash, undefined);
  assert.equal(impact.assessment.upstreamChange, undefined);
  assert.deepEqual(
    current.diagnosis.instructions.taskScope?.context,
    baseContext,
  );
  assert.deepEqual(await treeState(root), before);
});

test('invalid evidence is rejected with its own error before malformed state or requested report saving', async (t) => {
  const { base, root, context } = await fixture(t);
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, '.tibicen/manifest.yml'), '{ malformed\n');
  await chmod(path.join(root, '.tibicen/manifest.yml'), 0o600);
  const before = await treeState(root);
  const invalid = [
    {
      value: {
        ...context,
        instructionSources: [{ path: '../outside', hash: 'a'.repeat(64) }],
      },
      code: 'invalid-task-context',
    },
    {
      value: {
        ...context,
        memorySources: [{ ...context.memorySources![0], id: '' }],
      },
      code: 'invalid-memory-sources',
    },
    {
      value: {
        ...context,
        versionImpacts: [
          { ...context.versionImpacts![0], action: 'upgrade-now' },
        ],
      },
      code: 'invalid-version-impact',
    },
  ];
  const input = path.join(base, 'invalid-context.json');
  for (const { value, code } of invalid) {
    await writeFile(input, JSON.stringify(value));
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
      { code },
    );
    assert.deepEqual(await treeState(root), before);
  }
});
