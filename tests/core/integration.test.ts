import type { Proposal } from '../../scripts/core/types.ts';
import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  writeFile,
  readFile,
  readdir,
  mkdir,
  rm,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import { bindRunner, COPY_MARKER } from '../../scripts/core/checks.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';

async function fixture(t: TestContext) {
  const base = await mkdtemp(path.join(os.tmpdir(), 'tibicen-integrate-'));
  const root = path.join(base, 'app'),
    home = path.join(base, 'home');
  await mkdir(root);
  await mkdir(home);
  t.after(() => rm(base, { recursive: true, force: true }));
  return { root, home };
}
async function execute(
  root: string,
  home: string,
  envelope: { proposal: Proposal; digest: string },
) {
  const hooks = runtimeHooks(root, envelope.proposal, envelope.digest);
  try {
    return await applyPlan(root, envelope, {
      home,
      approvedDigest: envelope.digest,
      beforeApply: hooks.beforeApply,
      verify: hooks.verify,
    });
  } finally {
    await hooks.cleanup();
  }
}

test('MCP uses the same consent and writer while preserving unrelated config text', async (t) => {
  const { root, home } = await fixture(t);
  const original =
    '{\n "mcpServers": { "kept": {"command":"existing","args":[]} }, "other": 42\n}\n';
  await writeFile(path.join(root, '.mcp.json'), original);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      mcp: [
        {
          agent: 'claude-code',
          trusted: true,
          operations: [
            {
              name: 'example',
              action: 'upsert',
              server: {
                command: 'example-server',
                args: ['--stdio'],
                envNames: ['EXAMPLE_TOKEN'],
              },
            },
          ],
        },
      ],
    },
    { home },
  );
  assert.equal(await readFile(path.join(root, '.mcp.json'), 'utf8'), original);
  assert.equal(plan.proposal.changes.length, 1);
  const result = await execute(root, home, plan);
  assert.equal(result.status, 'complete');
  assert.equal(
    result.checks.mcp![0].servers!.find((server) => server.name === 'example')!
      .status,
    'env-context-unverified',
  );
  const content = await readFile(path.join(root, '.mcp.json'), 'utf8');
  assert.ok(content.includes('"kept": {"command":"existing","args":[]}'));
  assert.equal(JSON.parse(content).other, 42);
  const untrusted = await createProposal(
    root,
    {
      mode: 'improve',
      mcp: [
        {
          agent: 'cursor',
          operations: [
            {
              name: 'example',
              action: 'upsert',
              server: { command: 'example', args: [] },
            },
          ],
        },
      ],
    },
    { home },
  );
  await assert.rejects(
    applyPlan(root, untrusted, { home, approvedDigest: untrusted.digest }),
    { code: 'trust-required' },
  );
});

test('Codex MCP is a durable manual outcome, never a global config write', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'init',
      mcp: [
        {
          agent: 'codex',
          operations: [
            {
              name: 'example',
              action: 'upsert',
              server: { command: 'example-server', args: [] },
            },
          ],
        },
      ],
    },
    { home },
  );
  const result = await execute(root, home, plan);
  assert.equal(result.status, 'manual-action-required');
  assert.ok(result.manualFragments![0].block.includes('mcp_servers'));
  assert.equal((await getStatus(root)).manifest!.manualFragments.length, 1);
  await assert.rejects(readFile(path.join(home, '.codex/config.toml')), {
    code: 'ENOENT',
  });
});

test('blocklisted installed SHA cannot be resumed after an interruption', async (t) => {
  const { root, home } = await fixture(t);
  await mkdir(path.join(root, '.tibicen'));
  await mkdir(path.join(root, '.claude/skills/example'), { recursive: true });
  await writeFile(
    path.join(root, '.claude/skills/example/SKILL.md'),
    'old skill',
  );
  const source = {
    repo: 'owner/old',
    sha: 'a'.repeat(40),
    license: 'MIT',
    files: [
      {
        path: '.claude/skills/example/SKILL.md',
        sourcePath: 'SKILL.md',
        contentHash: hashContent('old skill'),
      },
    ],
  };
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify({ schema: 1, installed: [source], sessions: [] }),
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      migrateManifest: true,
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Instructions\n',
          reason: 'Entry point',
        },
      ],
    },
    { home },
  );
  const first = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    discovery: { blocklist: [] },
    afterChange() {
      throw new Error('interrupt');
    },
  });
  assert.equal(first.status, 'incomplete');
  await assert.rejects(
    applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      resume: true,
      discovery: { blocklist: ['owner/old'] },
    }),
    { code: 'source-blocked' },
  );
});

test('runner binds literal startup and argv to plan, allowing only owned copy-root substitution', async () => {
  const command = {
    id: 'probe',
    kind: 'quiz',
    executable: 'claude',
    argv: ['--add-dir', COPY_MARKER, '-p', 'Question'],
    cwd: '.',
    envNames: [],
    trusted: true,
  };
  const proposal = { commands: [command] };
  let calls = 0;
  const runner = bindRunner(proposal, digest(proposal), async () => {
    calls++;
    return { exitCode: 0 };
  });
  await runner(
    { ...command, argv: ['--add-dir', '/owned/copy', '-p', 'Question'] },
    { root: '/owned/copy' },
  );
  await assert.rejects(
    runner(
      {
        ...command,
        argv: ['--add-dir', '/owned/copy', '-p', 'Different task'],
      },
      { root: '/owned/copy' },
    ),
    { code: 'unapproved-command' },
  );
  assert.equal(calls, 1);
});

test('a no-change check verifies existing infrastructure and cannot complete an empty setup', async (t) => {
  const { root, home } = await fixture(t);
  await writeFile(path.join(root, 'AGENTS.md'), '# Existing instructions\n');
  const noChange = await createProposal(
    root,
    { mode: 'improve', changes: [] },
    { home },
  );
  const result = await execute(root, home, noChange);
  assert.equal(result.status, 'complete');
  assert.equal(result.checks.infrastructure.status, 'passed');
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    '# Existing instructions\n',
  );
  const empty = path.join(home, 'new-project');
  await mkdir(empty);
  const missing = await createProposal(
    empty,
    { mode: 'init', changes: [] },
    { home },
  );
  assert.equal((await execute(empty, home, missing)).status, 'incomplete');
});

for (const reason of [
  'command-source-changed',
  'trust-required',
  'command-outcome-unknown',
]) {
  test(`a partial comparison retains ${reason} instead of approving its successful prefix`, async (t) => {
    const { root, home } = await fixture(t);
    await writeFile(path.join(root, 'pass.cjs'), 'process.exit(0);\n');
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ scripts: { test: 'old script' } }),
    );
    const command = {
      kind: 'test',
      executable: process.execPath,
      argv: ['pass.cjs'],
      cwd: '.',
      envNames: [],
      trusted: true,
    };
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: '# Rules\n',
            reason: 'Add instructions.',
          },
        ],
        commands: [
          { ...command, id: 'first' },
          {
            ...command,
            id: 'second',
            trusted: reason !== 'trust-required',
            ...(reason === 'command-source-changed'
              ? {
                  source: {
                    path: 'package.json',
                    script: 'test',
                    scriptHash: hashContent('old script'),
                  },
                }
              : {}),
          },
        ],
        checks: { profile: 'web', environmentReady: true },
      },
      { home },
    );
    if (reason === 'command-source-changed')
      await writeFile(
        path.join(root, 'package.json'),
        JSON.stringify({ scripts: { test: 'changed script' } }),
      );
    const hooks = runtimeHooks(root, plan.proposal, plan.digest);
    const intercept = (runner: import('../../scripts/core/types.ts').Runner) =>
      reason === 'command-outcome-unknown'
        ? (((command, options) =>
            command.id === 'second'
              ? Promise.resolve({ exitCode: null, reason })
              : runner(command, options)) as typeof runner)
        : runner;
    try {
      const result = await applyPlan(root, plan, {
        home,
        approvedDigest: plan.digest,
        beforeApply: (proposal, execution) =>
          hooks.beforeApply(proposal, {
            runner: intercept(execution!.runner!),
          }),
        verify: (proposal, session, execution) =>
          hooks.verify(proposal, session, {
            runner: intercept(execution!.runner),
          }),
        afterChange(_change, session) {
          session.attempts[0].newRegressions = [
            { id: 'known', reason: 'new-failure' },
          ];
        },
      });
      assert.equal(
        result.status,
        'complete',
        'Transfer and project verification are independent.',
      );
      assert.equal(result.checks.verify.status, 'unverified');
      assert.equal(result.checks.verify.reason, reason);
      assert.deepEqual(result.checks.verify.newRegressions, [
        { id: 'known', reason: 'new-failure' },
      ]);
      if (reason === 'trust-required')
        assert(
          !result
            .manifest!.sessions.at(-1)!
            .commandAttempts!.some((attempt) => attempt.status === 'running'),
        );
    } finally {
      await hooks.cleanup();
    }
  });
}

test('a new project needs its entire final command set, while a complete set needs no baseline run', async (t) => {
  const { root, home } = await fixture(t);
  const command = {
    kind: 'test',
    executable: process.execPath,
    argv: ['pass.cjs'],
    cwd: '.',
    envNames: [],
    trusted: true,
  };
  const input = {
    mode: 'init',
    changes: [
      { path: 'AGENTS.md', content: '# Rules\n', reason: 'Add instructions.' },
      {
        path: 'pass.cjs',
        content: 'process.exit(0);\n',
        reason: 'Create the agreed starter.',
      },
    ],
    commands: [
      { ...command, id: 'first' },
      { ...command, id: 'second', trusted: false },
    ],
    checks: { profile: 'web', environmentReady: true },
  };
  const incomplete = await createProposal(root, input, { home });
  const partial = await execute(root, home, incomplete);
  assert.equal(partial.checks.verify.status, 'unverified');
  assert.equal(partial.checks.verify.reason, 'trust-required');
  const fresh = path.join(home, 'fresh');
  await mkdir(fresh);
  const complete = await createProposal(
    fresh,
    {
      ...input,
      commands: input.commands.map((command) => ({
        ...command,
        trusted: true,
      })),
    },
    { home },
  );
  assert.equal(
    (await execute(fresh, home, complete)).checks.verify.status,
    'green',
  );
});

for (const [agent, target] of [
  ['claude-code', '.mcp.json'],
  ['cursor', '.cursor/mcp.json'],
]) {
  for (const input of ['raw', 'forged', 'wrong-target'])
    test(`MCP trust is derived from actual ${agent} bytes for ${input} plans`, async (t) => {
      const { root, home } = await fixture(t);
      const content = JSON.stringify({
        mcpServers: { example: { command: 'example-server', args: [] } },
      });
      const plan = await createProposal(
        root,
        {
          mode: 'improve',
          changes: [
            { path: target, content, reason: 'Configure the local server.' },
          ],
        },
        { home },
      );
      if (input !== 'raw') {
        plan.proposal.mcp = [
          {
            agent: input === 'wrong-target' ? 'codex' : agent,
            path: target,
            trusted: input === 'wrong-target',
            requiresExecutionTrust: false,
          },
        ];
        plan.digest = digest(plan.proposal);
      }
      await assert.rejects(
        applyPlan(root, plan, { home, approvedDigest: plan.digest }),
        { code: 'trust-required' },
      );
      await assert.rejects(readFile(path.join(root, target)), {
        code: 'ENOENT',
      });
      await assert.rejects(readdir(path.join(root, '.tibicen')), {
        code: 'ENOENT',
      });
      assert.deepEqual(await readdir(home), []);
    });
}

test('raw MCP edits can retain a server or remove it without granting new execution trust', async (t) => {
  const { root, home } = await fixture(t);
  const server = { command: 'existing', args: [] };
  await writeFile(
    path.join(root, '.mcp.json'),
    JSON.stringify({ mcpServers: { kept: server }, metadata: 1 }),
  );
  const retained = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: '.mcp.json',
          content: JSON.stringify({
            metadata: 2,
            mcpServers: { kept: server },
          }),
          reason: 'Update non-executable metadata.',
        },
      ],
    },
    { home },
  );
  assert.equal(
    (await applyPlan(root, retained, { home, approvedDigest: retained.digest }))
      .status,
    'complete',
  );
  const removed = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: '.mcp.json',
          action: 'delete',
          reason: 'Remove the integration.',
        },
      ],
    },
    { home },
  );
  assert.equal(
    (await applyPlan(root, removed, { home, approvedDigest: removed.digest }))
      .status,
    'complete',
  );
});

test('explicitly trusted raw MCP changes still require the supported unambiguous format', async (t) => {
  const { root, home } = await fixture(t);
  for (const content of [
    '{"mcpServers":{},"mcpServers":{"x":{"command":"x"}}}',
    JSON.stringify({
      mcpServers: { remote: { url: 'https://example.invalid/mcp' } },
    }),
  ]) {
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        mcp: [{ agent: 'claude-code', trusted: true, operations: [] }],
        changes: [
          { path: '.mcp.json', content, reason: 'Show the raw config.' },
        ],
      },
      { home },
    );
    await assert.rejects(
      applyPlan(root, plan, { home, approvedDigest: plan.digest }),
      { code: 'invalid-mcp-format' },
    );
    await assert.rejects(readdir(path.join(root, '.tibicen')), {
      code: 'ENOENT',
    });
  }
});
