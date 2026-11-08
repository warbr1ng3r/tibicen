import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  rm,
  writeFile,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { hashContent } from '../../scripts/core/contracts.ts';

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(tmpdir(), 'tibicen-read-scope-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  await mkdir(path.join(root, 'private-data'));
  await writeFile(path.join(root, 'app.txt'), 'synthetic application\n');
  await writeFile(
    path.join(root, 'private-data/AGENTS.md'),
    '# Excluded instructions\n',
  );
  await writeFile(
    path.join(root, 'private-data/records.csv'),
    'synthetic,value\n',
  );
  const execute = (args: string[], input?: unknown) => {
    const child = spawnSync(
      process.execPath,
      [path.resolve('scripts/tibicen.ts'), ...args, '--root', root],
      {
        env: { PATH: process.env.PATH, HOME: home },
        input: input === undefined ? undefined : JSON.stringify(input),
        encoding: 'utf8',
        timeout: 10000,
      },
    );
    assert.equal(child.error, undefined);
    assert.equal(child.signal, null);
    assert.equal(child.stderr, '');
    return { exitCode: child.status, result: JSON.parse(child.stdout) };
  };
  return { root, home, execute };
}

test('fresh CLI exclusions work before and after completion without changing report stdin or retaining an ACL', async (t) => {
  const { root, home, execute } = await fixture(t);
  const scope = ['--forbidden-paths', '["private-data/"]'];
  const before = execute(['scan', ...scope]);
  assert.equal(before.exitCode, 0);
  assert(
    !before.result.files.some((file: { path: string }) =>
      file.path.startsWith('private-data/'),
    ),
  );
  assert(
    before.result.excluded.some(
      (item: { path: string; reason: string }) =>
        item.path === 'private-data' && item.reason === 'forbidden-path',
    ),
  );
  assert.equal(execute(['status', ...scope]).result.status, 'not-configured');
  assert.deepEqual(await readdir(home), []);
  const proposal = execute(['proposal', '--input', '-'], {
    mode: 'init',
    forbiddenPaths: ['private-data'],
    changes: [
      {
        path: 'AGENTS.md',
        content: '# Project instructions\nUse app.txt.\n',
        reason: 'Connect instructions',
      },
    ],
  }).result;
  assert.equal(
    execute(['apply', '--plan', '-', '--approve', proposal.digest], proposal)
      .result.status,
    'complete',
  );
  const manifestBefore = await readFile(
    path.join(root, '.tibicen/manifest.yml'),
    'utf8',
  );
  assert.equal(
    Object.hasOwn(JSON.parse(manifestBefore), 'forbiddenPaths'),
    false,
  );
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
    'manifest.yml',
  ]);
  const report = execute(['report', ...scope, '--input', '-'], {
    agent: 'unknown-host',
    cwd: '.',
    instructionSources: [
      {
        path: 'private-data/AGENTS.md',
        hash: hashContent('# Excluded instructions\n'),
      },
    ],
  });
  assert.equal(report.exitCode, 0);
  assert.equal(
    report.result.diagnosis.instructions.taskScope.context.agent,
    'unknown-host',
  );
  assert(
    !report.result.diagnosis.instructions.candidates.some(
      (file: { path: string }) => file.path.startsWith('private-data/'),
    ),
  );
  assert(
    report.result.diagnosis.inventory.coverageLimits.includes('forbidden-path'),
  );
  assert.deepEqual(report.result.diagnosis.instructions.sources, [
    {
      path: 'private-data/AGENTS.md',
      basis: 'caller-supplied',
      status: 'unavailable',
      reason: 'forbidden-path',
    },
  ]);
  assert.equal(execute(['verify', ...scope]).exitCode, 0);
  assert.equal(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    manifestBefore,
  );
  const noSave = execute([
    'report',
    '--save',
    '--requested',
    '--forbidden-paths',
    '[".tibicen/report.md"]',
  ]);
  assert.equal(noSave.result.error.code, 'forbidden-path');
  assert.deepEqual(await readdir(path.join(root, '.tibicen')), [
    'manifest.yml',
  ]);
  assert(
    execute(['report']).result.diagnosis.instructions.candidates.some(
      (file: { path: string }) => file.path === 'private-data/AGENTS.md',
    ),
  );
});

test('fresh exclusions narrow pending recovery and cannot weaken active-plan exclusions', async (t) => {
  const { root, home, execute } = await fixture(t);
  await writeFile(
    path.join(root, '.mcp.json'),
    '{"mcpServers":{"Example":{"command":"node","args":[]}}}',
  );
  const plan = await createProposal(
    root,
    {
      mode: 'init',
      forbiddenPaths: ['private-data', '.mcp.json'],
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Project instructions\n',
          reason: 'Connect instructions',
        },
      ],
    },
    { home },
  );
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    checkpoint(point) {
      if (point === 'after-file-write')
        throw new Error('Synthetic interruption');
    },
  });
  assert.equal(result.status, 'incomplete');
  const saved = await readFile(
    path.join(root, '.tibicen/state/session.json'),
    'utf8',
  );
  const status = execute(['status', '--forbidden-paths', '["AGENTS.md"]']);
  assert.equal(status.exitCode, 1);
  assert.equal(status.result.status, 'incomplete');
  const recovery = status.result.recovery.files.find(
    (file: { path: string }) => file.path === 'AGENTS.md',
  );
  assert.equal(recovery.reason, 'forbidden-path');
  assert.equal(recovery.actualHash, undefined);
  assert.equal(
    execute(['mcp-verify', '--agent', 'claude-code']).result.error.code,
    'forbidden-path',
  );
  for (const scope of ['[]', '["AGENTS.md"]']) {
    const scan = execute(['scan', '--forbidden-paths', scope]);
    assert.equal(scan.exitCode, 0);
    assert(
      !scan.result.files.some((file: { path: string }) =>
        file.path.startsWith('private-data/'),
      ),
    );
  }
  const report = execute(['report', '--forbidden-paths', '["AGENTS.md"]']);
  assert.equal(report.exitCode, 1);
  assert.equal(report.result.status, 'incomplete');
  assert(!report.result.diagnosis.instructions.candidates.length);
  assert.equal(
    await readFile(path.join(root, '.tibicen/state/session.json'), 'utf8'),
    saved,
  );
});

test('malformed or metadata-covering inspection scopes refuse before reading a missing project', async (t) => {
  const { root, execute } = await fixture(t);
  assert.equal(
    execute([
      'scan',
      '--forbidden-paths',
      JSON.stringify(['private-data', ...Array(127).fill('unknown')]),
    ]).exitCode,
    0,
  );
  await rm(root, { recursive: true });
  for (const scope of [
    'not-json',
    '{}',
    '[42]',
    '[""]',
    '["../outside"]',
    '["/absolute"]',
    '["a\\\\b"]',
    '["a//"]',
    '["line\\nfeed"]',
    JSON.stringify(['a'.repeat(4097)]),
    JSON.stringify(Array(129).fill('private')),
    JSON.stringify(['a'.repeat(65536)]),
    '[".tibicen"]',
    '[".tibicen/state"]',
  ]) {
    const response = execute(['report', '--forbidden-paths', scope]);
    assert.equal(response.exitCode, 1, scope);
    assert.notEqual(response.result.error.code, 'ENOENT', scope);
  }
});

test('local MCP inspection reuses bounded regular-file reads', async (t) => {
  const { root, execute } = await fixture(t);
  const config = path.join(root, '.mcp.json');
  await writeFile(config, ' '.repeat(1024 * 1024 + 1));
  assert.equal(
    execute(['mcp-verify', '--agent', 'claude-code']).result.error.code,
    'file-too-large',
  );
  await rm(config);
  await mkdir(config);
  assert.equal(
    execute(['mcp-verify', '--agent', 'claude-code']).result.error.code,
    'unsupported-file',
  );
  await rm(config, { recursive: true });
  await symlink(path.join(root, 'app.txt'), config);
  assert.equal(
    execute(['mcp-verify', '--agent', 'claude-code']).result.error.code,
    'unsafe-path',
  );
});

test('malformed interrupted metadata keeps the established validation error', async (t) => {
  const { root, execute } = await fixture(t);
  await mkdir(path.join(root, '.tibicen/state'), { recursive: true });
  await writeFile(
    path.join(root, '.tibicen/state/session.json'),
    '{"schema":3}',
  );
  for (const command of ['scan', 'status', 'report'])
    assert.equal(
      execute([command, '--forbidden-paths', '[]']).result.error.code,
      'unsupported-state-schema',
    );
});

for (const kind of ['FIFO', 'directory', 'oversized', 'malformed'] as const) {
  test(
    `scan and status reject ${kind} state through a bounded metadata reader`,
    { skip: kind === 'FIFO' && process.platform === 'win32' },
    async (t) => {
      const { root, home } = await fixture(t);
      const filename = path.join(root, '.tibicen/state/session.json');
      await mkdir(path.dirname(filename), { recursive: true });
      if (kind === 'FIFO') {
        const created = spawnSync('mkfifo', [filename], {
          encoding: 'utf8',
          env: { PATH: process.env.PATH },
          timeout: 1000,
        });
        assert.equal(created.status, 0);
      } else if (kind === 'directory') await mkdir(filename);
      else
        await writeFile(
          filename,
          kind === 'oversized'
            ? Buffer.alloc(8 * 1024 * 1024 + 1, 32)
            : '{invalid',
        );
      for (const command of ['scan', 'status']) {
        const child = spawnSync(
          process.execPath,
          [path.resolve('scripts/tibicen.ts'), command, '--root', root],
          {
            env: { PATH: process.env.PATH, HOME: home },
            encoding: 'utf8',
            timeout: 1500,
          },
        );
        assert.equal(child.error, undefined);
        assert.equal(child.signal, null);
        assert.equal(child.status, 1);
        assert.equal(child.stderr, '');
        const response = JSON.parse(child.stdout);
        assert.equal(
          response.error.code,
          kind === 'FIFO' || kind === 'directory'
            ? 'unsupported-file'
            : kind === 'oversized'
              ? 'file-too-large'
              : 'invalid-data',
        );
        assert.equal(response.files, undefined);
      }
    },
  );
}

test('scan rejects weakened active exclusions whose saved proposal digest no longer matches', async (t) => {
  const { root, home, execute } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'init',
      forbiddenPaths: ['private-data'],
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Project instructions\n',
          reason: 'Connect instructions',
        },
      ],
    },
    { home },
  );
  await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    checkpoint(point) {
      if (point === 'after-file-write')
        throw new Error('Synthetic interruption');
    },
  });
  const filename = path.join(root, '.tibicen/state/session.json');
  const state = JSON.parse(await readFile(filename, 'utf8'));
  state.proposal.forbiddenPaths = [];
  const tampered = JSON.stringify(state);
  await writeFile(filename, tampered);
  assert.equal(execute(['status']).result.error.code, 'tamper-suspect');
  const scan = execute(['scan', '--forbidden-paths', '[]']);
  assert.equal(scan.exitCode, 1);
  assert.equal(scan.result.error?.code, 'tamper-suspect');
  assert.equal(scan.result.files, undefined);
  assert.equal(await readFile(filename, 'utf8'), tampered);
});

test('project-local MCP diagnosis and verification honor explicit exclusions; global config never silently accepts them', async (t) => {
  const { root, execute } = await fixture(t);
  await mkdir(path.join(root, '.cursor'));
  const config = JSON.stringify({
    mcpServers: { Example: { command: 'node', args: ['synthetic.js'] } },
  });
  await writeFile(path.join(root, '.mcp.json'), config);
  await writeFile(path.join(root, '.cursor/mcp.json'), config);
  const request = {
    agent: 'claude-code',
    server: 'Example',
    sources: [{ path: '.mcp.json' }],
  };
  assert.equal(
    execute(['mcp-diagnose', '--input', '-'], request).result.configuration
      .status,
    'valid-stdio',
  );
  const scoped = execute(
    ['mcp-diagnose', '--input', '-', '--forbidden-paths', '[".mcp.json"]'],
    request,
  );
  assert.equal(scoped.exitCode, 0);
  assert.equal(scoped.result.configuration.status, 'unverified');
  assert.equal(scoped.result.source.candidates[0].status, 'unverified');
  for (const [agent, scope] of [
    ['claude-code', '.mcp.json'],
    ['cursor', '.cursor'],
  ]) {
    assert.equal(execute(['mcp-verify', '--agent', agent]).exitCode, 0);
    assert.equal(
      execute([
        'mcp-verify',
        '--agent',
        agent,
        '--forbidden-paths',
        JSON.stringify([scope]),
      ]).result.error.code,
      'forbidden-path',
    );
  }
  assert.equal(
    execute(
      [
        'mcp-verify',
        '--agent',
        'codex',
        '--config',
        path.join(root, 'absent-global.toml'),
        '--input',
        '-',
        '--forbidden-paths',
        '[]',
      ],
      {},
    ).result.error.code,
    'invalid-arguments',
  );
});
