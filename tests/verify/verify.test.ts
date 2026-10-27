import type { Command, RunOptions } from '../../scripts/core/types.ts';
import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  readdir,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { hashContent } from '../../scripts/core/contracts.ts';
import { scanProject } from '../../scripts/scan/index.ts';
import {
  createSnapshot,
  cleanupSnapshot,
  prepareFinalSnapshot,
  compareChecks,
  runProjectChecks,
  verifyInfrastructure,
  unavailableBehavior,
} from '../../scripts/verify/index.ts';

const approvedDigest = 'a'.repeat(64);
async function fixture(t: TestContext, files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-verify-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}
const run = (
  id: string,
  exitCode: number,
  output = '',
  commandHash = 'same-command',
) => ({
  id,
  exitCode,
  outputHash: hashContent(output),
  commandHash,
  timedOut: false,
});

test('snapshots actual dirty/untracked files without git, secrets or modifications to baseline', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Original instructions',
    'src/app.js': 'actual unstaged working content',
    'new-untracked.txt': 'untracked',
    '.env': 'MUST_NOT_COPY',
    '.git/index': 'NOT_A_REAL_INDEX',
  });
  await assert.rejects(createSnapshot(root), { code: 'approval-required' });
  await assert.rejects(
    createSnapshot(root, { approvedDigest, temporaryRoot: root }),
    { code: 'unsafe-snapshot-path' },
  );
  const baseline = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(baseline));
  assert.equal(baseline.complete, true);
  assert.equal(
    await readFile(path.join(baseline.root, 'src/app.js'), 'utf8'),
    'actual unstaged working content',
  );
  assert.equal(
    await readFile(path.join(baseline.root, 'new-untracked.txt'), 'utf8'),
    'untracked',
  );
  assert(
    !baseline.files.some(
      (file) => file.path.startsWith('.git') || file.path === '.env',
    ),
  );
  const final = await prepareFinalSnapshot(
    baseline,
    [
      {
        path: 'AGENTS.md',
        action: 'modify',
        beforeHash: hashContent('Original instructions'),
        content: 'Revised instructions',
      },
    ],
    { approvedDigest },
  );
  t.after(() => cleanupSnapshot(final));
  assert.equal(
    await readFile(path.join(final.root, 'AGENTS.md'), 'utf8'),
    'Revised instructions',
  );
  assert.equal(
    await readFile(path.join(baseline.root, 'AGENTS.md'), 'utf8'),
    'Original instructions',
  );
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'Original instructions',
  );
  assert.equal(
    await readFile(path.join(root, '.git/index'), 'utf8'),
    'NOT_A_REAL_INDEX',
  );
  await assert.rejects(cleanupSnapshot({ root, id: baseline.id }), {
    code: 'unknown-snapshot',
  });
});

test('snapshot exclusions and changed originals prevent false comparable coverage', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'rules',
    'data/raw/value': 'important',
    'large.bin': 'x'.repeat(50),
  });
  await symlink(path.join(root, 'AGENTS.md'), path.join(root, 'alias'));
  const snapshot = await createSnapshot(root, {
    approvedDigest,
    forbiddenPaths: ['data/raw'],
    maxFileBytes: 20,
  });
  t.after(() => cleanupSnapshot(snapshot));
  assert.equal(snapshot.complete, false);
  assert(
    snapshot.gaps.some((gap) => gap.reason === 'forbidden-content-excluded'),
  );
  assert(snapshot.gaps.some((gap) => gap.reason === 'file-too-large'));
  await assert.rejects(
    prepareFinalSnapshot(
      snapshot,
      [
        {
          path: 'AGENTS.md',
          action: 'modify',
          beforeHash: 'b'.repeat(64),
          content: 'changed',
        },
      ],
      { approvedDigest },
    ),
    { code: 'snapshot-hash-mismatch' },
  );
  await assert.rejects(
    prepareFinalSnapshot(
      snapshot,
      [
        {
          path: '../escape',
          action: 'add',
          beforeHash: null,
          content: 'changed',
        },
      ],
      { approvedDigest },
    ),
    { code: 'unsafe-path' },
  );
  await writeFile(path.join(snapshot.root, 'AGENTS.md'), 'mutated baseline');
  await assert.rejects(prepareFinalSnapshot(snapshot, [], { approvedDigest }), {
    code: 'baseline-changed',
  });
});

test('checks without a dependency environment preserve snapshot preparation errors', async (t) => {
  const root = await fixture(t, { 'AGENTS.md': 'owner rules' });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  await writeFile(path.join(snapshot.root, 'AGENTS.md'), 'damaged baseline');
  let calls = 0;
  await assert.rejects(
    runProjectChecks(
      snapshot,
      [
        {
          id: 'test',
          kind: 'test',
          executable: 'node',
          argv: ['--version'],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
      ],
      {
        approvedDigest,
        environmentReady: true,
        runner: async () => {
          calls++;
          return { exitCode: 0 };
        },
      },
    ),
    { code: 'baseline-changed' },
  );
  assert.equal(calls, 0);
});

test('literal credentials in otherwise ordinary configs are not copied or exposed', async (t) => {
  const root = await fixture(t, {
    '.mcp.json':
      '{"mcpServers":{"service":{"env":{"API_KEY":"private-credential-value"}}}}',
    'AGENTS.md': 'Use the project commands.',
  });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  assert.equal(snapshot.complete, false);
  assert(
    snapshot.excluded.some(
      (item) =>
        item.path === '.mcp.json' && item.reason === 'sensitive-content',
    ),
  );
  assert(!JSON.stringify(snapshot).includes('private-credential-value'));
  await assert.rejects(readFile(path.join(snapshot.root, '.mcp.json')), {
    code: 'ENOENT',
  });
});

test('comparison separates old errors, fixed failures and new regressions without resetting history', () => {
  assert.equal(
    compareChecks([run('test', 0)], [run('test', 0)]).status,
    'green',
  );
  assert.equal(
    compareChecks([run('test', 1, 'old error')], [run('test', 1, 'old error')])
      .status,
    'pre-existing-red',
  );
  assert.equal(
    compareChecks([run('test', 1)], [run('test', 0)]).status,
    'red-fixed',
  );
  const regression = compareChecks(
    [run('test', 1, 'old error')],
    [run('test', 1, 'new error')],
  );
  assert.equal(regression.status, 'unverified');
  assert.equal(regression.reason, 'new-regression');
  const repaired = compareChecks([run('test', 0)], [run('test', 0)], {
    knownRegressions: regression.newRegressions,
  });
  assert.equal(repaired.status, 'red-fixed');
  assert.equal(repaired.firstAttempt, false);
  assert.equal(
    compareChecks(null, [run('test', 0)]).reason,
    'baseline-unavailable',
  );
  assert.equal(compareChecks([], []).reason, 'no-project-checks');
  assert.equal(
    compareChecks([run('test', 0)], [run('build', 0)]).reason,
    'checks-not-comparable',
  );
  assert.equal(
    compareChecks([run('test', 0)], [{ ...run('test', 0), timedOut: true }])
      .reason,
    'command-incomplete',
  );
  assert.equal(
    compareChecks(null, [run('test', 0)], { newProject: true }).status,
    'green',
  );
  assert.equal(
    compareChecks(null, [run('test', 1)], { newProject: true }).reason,
    'new-project-check-failed',
  );
});

test('checks use only the shared runner on complete snapshots with explicit environment and approval', async (t) => {
  const root = await fixture(t, { 'package.json': '{}' });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const command = {
    id: 'test',
    kind: 'test',
    executable: 'npm',
    argv: ['test'],
    cwd: '.',
    envNames: [],
    trusted: true,
  };
  let calls = 0;
  const runner = async (given: Command, options: RunOptions) => {
    calls++;
    assert.deepEqual(given, command);
    assert.notEqual(options.root, snapshot.root);
    assert.equal(options.approvedDigest, approvedDigest);
    await writeFile(
      path.join(options.root, 'package.json'),
      '{"changed-by-test":true}',
    );
    return { exitCode: 0, stdout: 'okay', stderr: '', timedOut: false };
  };
  assert.equal(
    (await runProjectChecks(snapshot, [command], { runner })).reason,
    'environment-unverified',
  );
  assert.equal(
    (await runProjectChecks(snapshot, [command], { runner, profile: 'python' }))
      .reason,
    'unsupported-profile',
  );
  await assert.rejects(
    runProjectChecks(snapshot, [command], { runner, environmentReady: true }),
    { code: 'approval-required' },
  );
  assert.equal(calls, 0);
  const unknown = await runProjectChecks(snapshot, [command], {
    environmentReady: true,
    approvedDigest,
    runner: async () => ({
      exitCode: null,
      reason: 'command-outcome-unknown',
      timedOut: false,
    }),
  });
  assert.equal(unknown.status, 'unverified');
  assert.equal(unknown.reason, 'command-outcome-unknown');
  const result = await runProjectChecks(snapshot, [command], {
    runner,
    environmentReady: true,
    approvedDigest,
  });
  assert.equal(calls, 1);
  assert.equal(result.reason, 'comparison-required');
  assert.equal(result.runs[0].exitCode, 0);
  assert(!Object.hasOwn(result.runs[0], 'stdout'));
  assert.equal(
    await readFile(path.join(snapshot.root, 'package.json'), 'utf8'),
    '{}',
  );
  assert.equal(await readFile(path.join(root, 'package.json'), 'utf8'), '{}');
});

test('structural checks find content mismatch, missing/deleted files and invalid MCP without claiming behavior', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Instructions',
    '.mcp.json': '{broken',
    'src/app.js': 'code',
  });
  assert.equal((await verifyInfrastructure(root)).status, 'unverified');
  const okay = await verifyInfrastructure(root, {
    expectedFiles: [{ path: 'AGENTS.md', hash: hashContent('Instructions') }],
  });
  assert.equal(okay.status, 'passed');
  assert.equal(okay.scope, 'structure-only');
  const bad = await verifyInfrastructure(root, {
    expectedFiles: [
      { path: 'AGENTS.md', hash: hashContent('different') },
      { path: 'CLAUDE.md' },
      { path: '.mcp.json' },
      { path: 'AGENTS.md', action: 'delete' },
      { path: 'src/app.js' },
    ],
  });
  assert.equal(bad.status, 'issues-found');
  assert.deepEqual(
    bad.issues!.map((issue) => issue.reason),
    [
      'content-mismatch',
      'missing-file',
      'invalid-mcp-config',
      'not-deleted',
      'outside-infrastructure',
    ],
  );
  assert.equal(unavailableBehavior('task').status, 'unverified');
  assert.equal(unavailableBehavior('quiz').reason, 'startup-uncontrolled');
  assert.deepEqual((await readdir(root)).sort(), [
    '.mcp.json',
    'AGENTS.md',
    'src',
  ]);
});

test('shared runner compares a real fixture baseline and final without changing retained inputs', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Before setup',
    'check.cjs':
      "const fs=require('node:fs'); const good=fs.readFileSync('AGENTS.md','utf8').includes('Allow local checks'); fs.writeFileSync('runner-output.txt','generated'); if(!good){console.error(process.cwd()+': instructions missing');process.exitCode=1;} else {console.log('instructions okay');}",
  });
  const baseline = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(baseline));
  const final = await prepareFinalSnapshot(
    baseline,
    [
      {
        path: 'AGENTS.md',
        action: 'modify',
        beforeHash: hashContent('Before setup'),
        content: 'Allow local checks',
      },
    ],
    { approvedDigest },
  );
  t.after(() => cleanupSnapshot(final));
  const commands = [
    {
      id: 'local-check',
      kind: 'test',
      executable: process.execPath,
      argv: ['check.cjs'],
      cwd: '.',
      envNames: [],
      trusted: true,
    },
  ];
  const options = { approvedDigest, environmentReady: true };
  const before = await runProjectChecks(baseline, commands, options);
  const unchanged = await runProjectChecks(baseline, commands, options);
  const after = await runProjectChecks(final, commands, options);
  assert.equal(before.runs[0].exitCode, 1);
  assert.equal(after.runs[0].exitCode, 0);
  assert.equal(compareChecks(before.runs, after.runs).status, 'red-fixed');
  assert.equal(
    compareChecks(before.runs, unchanged.runs).status,
    'pre-existing-red',
  );
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'Before setup',
  );
  await assert.rejects(
    readFile(path.join(baseline.root, 'runner-output.txt')),
    { code: 'ENOENT' },
  );
  await assert.rejects(readFile(path.join(final.root, 'runner-output.txt')), {
    code: 'ENOENT',
  });
});

test('a changed npm script cannot inherit trust merely because its launch argv stayed the same', async (t) => {
  const root = await fixture(t, {
    'package.json': JSON.stringify({ scripts: { test: 'node safe-test.js' } }),
  });
  const reviewed = await scanProject(root);
  await writeFile(
    path.join(root, 'package.json'),
    JSON.stringify({ scripts: { test: 'node different-code.js' } }),
  );
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const runner = () => assert.fail('Changed script must not execute');
  const result = await runProjectChecks(
    snapshot,
    reviewed.commands.map((command) => ({ ...command, trusted: true })),
    { approvedDigest, environmentReady: true, runner },
  );
  assert.equal(result.reason, 'command-source-changed');
  assert.deepEqual(result.runs, []);
});
