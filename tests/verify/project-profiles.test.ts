import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  chmod,
  symlink,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { hashContent } from '../../scripts/core/contracts.ts';
import { validateCommand } from '../../scripts/core/execute.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { bindRunner } from '../../scripts/core/checks.ts';
import {
  createSnapshot,
  cleanupSnapshot,
  prepareFinalSnapshot,
  compareChecks,
  runProjectChecks,
} from '../../scripts/verify/index.ts';

const approvedDigest = 'a'.repeat(64);
const smoke =
  '#!/usr/bin/env bash\ntest -f AGENTS.md || exit 1\ngrep -q "Allow checks" AGENTS.md || exit 1\nexit 0\n';

// The runner contract itself is interpreter-independent; locate real ones only for live runs.
function onPath(name: string) {
  const found = spawnSync('/usr/bin/which', [name], { encoding: 'utf8' });
  const resolved = found.status === 0 ? found.stdout.trim().split('\n')[0] : '';
  return resolved || null;
}
const python3 = process.platform === 'win32' ? null : onPath('python3');
const bash =
  process.platform === 'win32' ? null : (onPath('bash') ?? '/bin/bash');

async function fixture(t: TestContext, files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-profiles-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

const bound = (
  overrides: Partial<Parameters<typeof validateCommand>[0]> = {},
) =>
  ({
    id: 'smoke',
    kind: 'test',
    executable: '/bin/bash',
    argv: ['./scripts/smoke.sh'],
    cwd: '.',
    envNames: [],
    trusted: true,
    script: { path: 'scripts/smoke.sh', hash: 'b'.repeat(64) },
    ...overrides,
  }) as Parameters<typeof validateCommand>[0];

test('bash runs only as one byte-bound script with a check kind', () => {
  validateCommand(bound());
  for (const invalid of [
    { executable: 'sh' },
    { executable: 'zsh' },
    { executable: 'bash' },
    { kind: 'task' },
    { kind: 'install' },
    { cwd: 'sub' },
    { script: undefined, argv: [] },
    { script: null },
    { argv: ['./scripts/smoke.sh', '--flag'] },
    { argv: ['-e', 'scripts/smoke.sh'] },
    { argv: ['-c', 'echo hi'] },
    { argv: ['scripts/other.sh'] },
    { script: { path: '/abs/smoke.sh', hash: 'b'.repeat(64) } },
    { script: { path: '../smoke.sh', hash: 'b'.repeat(64) } },
    { script: { path: 'scripts\\smoke.sh', hash: 'b'.repeat(64) } },
    { script: { path: 'scripts/smoke.sh', hash: 'short' } },
  ])
    assert.throws(
      () => validateCommand(bound(invalid)),
      JSON.stringify(invalid),
    );
  assert.throws(
    () =>
      validateCommand(
        bound({ script: { path: 'scripts/other.sh', hash: 'b'.repeat(64) } }),
      ),
    { code: 'forbidden-command' },
  );
});

test('runProjectChecks keeps unknown profiles and web environments unsupported', async (t) => {
  const root = await fixture(t, { 'AGENTS.md': 'rules' });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const command = {
    id: 'check',
    kind: 'test',
    executable: bash ?? '/bin/bash',
    argv: ['./scripts/smoke.sh'],
    cwd: '.',
    envNames: [],
    trusted: true,
    script: { path: 'scripts/smoke.sh', hash: 'b'.repeat(64) },
  };
  assert.equal(
    (
      await runProjectChecks(snapshot, [command], {
        approvedDigest,
        environmentReady: true,
        profile: 'unity',
        runner: async () => ({ exitCode: 0 }),
      })
    ).reason,
    'unsupported-profile',
  );
  const withEnvironment = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(withEnvironment));
  // A copied dependency environment belongs to web only; attach one to prove the guard.
  withEnvironment.environment = {
    kind: 'local-node-modules',
    roots: ['node_modules'],
    hash: 'c'.repeat(64),
    files: 0,
    bytes: 0,
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.version,
  };
  assert.equal(
    (
      await runProjectChecks(withEnvironment, [command], {
        approvedDigest,
        environmentReady: true,
        profile: 'python',
        runner: async () => ({ exitCode: 0 }),
      })
    ).reason,
    'unsupported-profile',
  );
  // Even a fully bound bash command stays outside the web profile at run time.
  assert.equal(
    (
      await runProjectChecks(snapshot, [command], {
        approvedDigest,
        environmentReady: true,
        profile: 'web',
        runner: async () => ({ exitCode: 0 }),
      })
    ).reason,
    'forbidden-command',
  );
});

test('a bound script with drifted or absent bytes never executes', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Allow checks',
    'scripts/smoke.sh': smoke,
  });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const command = {
    id: 'smoke',
    kind: 'test',
    executable: bash ?? '/bin/bash',
    argv: ['./scripts/smoke.sh'],
    cwd: '.',
    envNames: [],
    trusted: true,
    script: { path: 'scripts/smoke.sh', hash: hashContent('changed bytes') },
  };
  const drifted = await runProjectChecks(snapshot, [command], {
    approvedDigest,
    environmentReady: true,
    profile: 'bash',
  });
  assert.equal(drifted.status, 'unverified');
  assert.equal(drifted.reason, 'command-source-changed');
  const absent = await runProjectChecks(
    snapshot,
    [
      {
        ...command,
        script: { path: 'scripts/gone.sh', hash: command.script.hash },
      },
    ],
    { approvedDigest, environmentReady: true, profile: 'bash' },
  );
  assert.equal(absent.reason, 'command-source-changed');
});

test(
  'bash profile compares a real smoke script baseline and final',
  { skip: !bash },
  async (t) => {
    const root = await fixture(t, {
      'AGENTS.md': 'Plain rules',
      'scripts/smoke.sh': smoke,
    });
    const baseline = await createSnapshot(root, { approvedDigest });
    t.after(() => cleanupSnapshot(baseline));
    const final = await prepareFinalSnapshot(
      baseline,
      [
        {
          path: 'AGENTS.md',
          action: 'modify',
          beforeHash: hashContent('Plain rules'),
          content: 'Allow checks',
        },
      ],
      { approvedDigest },
    );
    t.after(() => cleanupSnapshot(final));
    const command = {
      id: 'smoke',
      kind: 'test',
      executable: bash!,
      argv: ['./scripts/smoke.sh'],
      cwd: '.',
      envNames: [],
      trusted: true,
      script: { path: 'scripts/smoke.sh', hash: hashContent(smoke) },
    };
    const options = {
      approvedDigest,
      environmentReady: true,
      profile: 'bash',
    } as const;
    const before = await runProjectChecks(baseline, [command], options);
    const after = await runProjectChecks(final, [command], options);
    assert.equal(before.runs[0].exitCode, 1);
    assert.equal(after.runs[0].exitCode, 0);
    assert.equal(compareChecks(before.runs, after.runs).status, 'red-fixed');
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      'Plain rules',
    );
  },
);

test(
  'python profile runs the existing unittest entrypoint with real exit codes',
  { skip: !python3 },
  async (t) => {
    const root = await fixture(t, {
      'AGENTS.md': 'Stub instructions',
      'tests/test_docs_gate.py': `import pathlib, unittest
class Gate(unittest.TestCase):
    def test_instructions_allow_checks(self):
        text = pathlib.Path('AGENTS.md').read_text(encoding='utf-8')
        self.assertIn('Allow checks', text)
`,
    });
    const baseline = await createSnapshot(root, { approvedDigest });
    t.after(() => cleanupSnapshot(baseline));
    const final = await prepareFinalSnapshot(
      baseline,
      [
        {
          path: 'AGENTS.md',
          action: 'modify',
          beforeHash: hashContent('Stub instructions'),
          content: 'Allow checks',
        },
      ],
      { approvedDigest },
    );
    t.after(() => cleanupSnapshot(final));
    const command = {
      id: 'unittest',
      kind: 'test',
      executable: python3!,
      argv: ['-m', 'unittest', 'discover', '-s', 'tests'],
      cwd: '.',
      envNames: [],
      trusted: true,
    };
    const options = {
      approvedDigest,
      environmentReady: true,
      profile: 'python',
    } as const;
    const before = await runProjectChecks(baseline, [command], options);
    const after = await runProjectChecks(final, [command], options);
    assert.equal(before.runs[0].exitCode, 1);
    assert.equal(after.runs[0].exitCode, 0);
    assert.equal(compareChecks(before.runs, after.runs).status, 'red-fixed');
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      'Stub instructions',
    );
  },
);

test(
  'a timed-out controlled command reports no success and keeps prior runs',
  { skip: !bash },
  async (t) => {
    const root = await fixture(t, {
      'AGENTS.md': 'Allow checks',
      'scripts/smoke.sh': '#!/usr/bin/env bash\nsleep 5\n',
    });
    const snapshot = await createSnapshot(root, { approvedDigest });
    t.after(() => cleanupSnapshot(snapshot));
    const script = '#!/usr/bin/env bash\nsleep 5\n';
    const result = await runProjectChecks(
      snapshot,
      [
        {
          id: 'fast',
          kind: 'test',
          executable: bash!,
          argv: ['./scripts/smoke.sh'],
          cwd: '.',
          envNames: [],
          trusted: true,
          script: { path: 'scripts/smoke.sh', hash: hashContent(script) },
        },
      ],
      {
        approvedDigest,
        environmentReady: true,
        profile: 'bash',
        timeoutMs: 250,
      },
    );
    assert.equal(result.status, 'unverified');
    assert.equal(result.reason, 'timeout');
  },
);

test('untrusted or missing commands stay unverified instead of green', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Allow checks',
    'scripts/smoke.sh': smoke,
  });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  assert.equal(
    (
      await runProjectChecks(snapshot, [], {
        approvedDigest,
        environmentReady: true,
        profile: 'docs',
      })
    ).reason,
    'no-project-checks',
  );
  assert.equal(
    (
      await runProjectChecks(
        snapshot,
        [
          {
            id: 'smoke',
            kind: 'test',
            executable: bash ?? '/bin/bash',
            argv: ['./scripts/smoke.sh'],
            cwd: '.',
            envNames: [],
            script: { path: 'scripts/smoke.sh', hash: hashContent(smoke) },
          },
        ],
        { approvedDigest, environmentReady: true, profile: 'bash' },
      )
    ).reason,
    'trust-required',
  );
});

test(
  'proposal pins interpreters, binds script bytes and refuses honestly',
  { skip: process.platform === 'win32' },
  async (t) => {
    const home = await mkdtemp(path.join(tmpdir(), 'tibicen-profiles-home-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const root = await fixture(t, {
      'AGENTS.md': 'Owner rules',
      'scripts/smoke.sh': smoke,
    });
    const command = {
      id: 'smoke',
      kind: 'test',
      executable: 'bash',
      argv: ['./scripts/smoke.sh'],
      trusted: true,
      script: { path: 'scripts/smoke.sh' },
    };
    const envelope = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [],
        commands: [command],
        checks: { profile: 'bash', environmentReady: true },
      },
      { home },
    );
    assert.match(envelope.proposal.commands[0].executable, /^\/.+\/bash$/);
    assert.equal(
      envelope.proposal.commands[0].script?.hash,
      hashContent(smoke),
    );
    assert.notEqual(
      (
        await createProposal(
          root,
          {
            mode: 'improve',
            changes: [],
            commands: [command],
            checks: { profile: 'docs', environmentReady: true },
          },
          { home },
        )
      ).digest,
      envelope.digest,
    );
    // The bash contract stays outside the web profile, bound or not: a bound
    // command hits the non-web script-binding gate, an unbound one the bash ban.
    for (const [executable, code] of [
      ['bash', 'invalid-check-command'],
      ['/bin/bash', 'invalid-check-command'],
      ['bash', 'forbidden-command'],
      ['/bin/bash', 'forbidden-command'],
    ] as const)
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [],
            commands: [
              code === 'invalid-check-command'
                ? { ...command, executable }
                : { ...command, executable, script: undefined },
            ],
            checks: { profile: 'web', environmentReady: true },
          },
          { home },
        ),
        { code },
      );
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [{ ...command, script: { path: 'scripts/gone.sh' } }],
          checks: { profile: 'bash', environmentReady: true },
        },
        { home },
      ),
      { code: 'command-script-unavailable' },
    );
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [
            {
              ...command,
              script: {
                path: 'scripts/smoke.sh',
                hash: hashContent('drifted'),
              },
            },
          ],
          checks: { profile: 'bash', environmentReady: true },
        },
        { home },
      ),
      { code: 'command-source-changed' },
    );
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [
            {
              ...command,
              id: 'pytest',
              executable: 'pytest',
              argv: [],
              script: undefined,
            },
          ],
          checks: { profile: 'python', environmentReady: true },
        },
        { home },
      ),
      { code: 'invalid-check-command' },
    );
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [command],
          checks: {
            profile: 'bash',
            environmentReady: true,
            environment: {
              kind: 'local-node-modules',
              roots: ['node_modules'],
            },
          },
        },
        { home },
      ),
      { code: 'invalid-node-environment' },
    );
    const savedPath = process.env.PATH;
    process.env.PATH = '';
    try {
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [],
            commands: [
              { ...command, executable: 'python3', argv: ['-m', 'unittest'] },
            ],
            checks: { profile: 'python', environmentReady: true },
          },
          { home },
        ),
        { code: 'interpreter-unavailable' },
      );
      // A relative PATH entry cannot pin anything: it depends on the caller's cwd.
      process.env.PATH = '.';
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [],
            commands: [
              { ...command, executable: 'python3', argv: ['-m', 'unittest'] },
            ],
            checks: { profile: 'python', environmentReady: true },
          },
          { home },
        ),
        { code: 'interpreter-unavailable' },
      );
    } finally {
      process.env.PATH = savedPath;
    }
    // A bound script must be the executed file: same-named files elsewhere cannot run.
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [{ ...command, cwd: 'sub' }],
          checks: { profile: 'bash', environmentReady: true },
        },
        { home },
      ),
      { code: 'forbidden-command' },
    );
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [
            {
              id: 'docs-gate',
              kind: 'lint',
              executable: process.execPath,
              argv: ['scripts/other.sh'],
              cwd: '.',
              trusted: true,
              script: { path: 'scripts/smoke.sh' },
            },
          ],
          checks: { profile: 'docs', environmentReady: true },
        },
        { home },
      ),
      { code: 'forbidden-command' },
    );
    // A ./-relative entrypoint runs its own bytes, so those bytes must be bound.
    await assert.rejects(
      createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [
            {
              ...command,
              id: 'entry',
              executable: './scripts/smoke.sh',
              argv: [],
              script: undefined,
            },
          ],
          checks: { profile: 'bash', environmentReady: true },
        },
        { home },
      ),
      { code: 'invalid-check-command' },
    );
    const entrypoint = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [],
        commands: [
          {
            id: 'entry',
            kind: 'test',
            executable: './scripts/smoke.sh',
            argv: ['./scripts/smoke.sh'],
            trusted: true,
            script: { path: 'scripts/smoke.sh' },
          },
        ],
        checks: { profile: 'bash', environmentReady: true },
      },
      { home },
    );
    assert.equal(
      entrypoint.proposal.commands[0].script?.hash,
      hashContent(smoke),
    );
    const web = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [],
        commands: [
          {
            id: 'test',
            kind: 'test',
            executable: 'npm',
            argv: ['test'],
            trusted: true,
          },
        ],
        checks: { profile: 'web', environmentReady: true },
      },
      { home },
    );
    assert.equal(web.proposal.commands[0].executable, 'npm');
  },
);

test(
  'docs profile uses the local check script through the same runner',
  { skip: process.platform === 'win32' },
  async (t) => {
    const root = await fixture(t, {
      'AGENTS.md': 'No marker yet',
      'docs/index.md': '# Guide\n',
      'tools/check-docs.cjs':
        "const fs = require('node:fs');\nconst rules = fs.readFileSync('AGENTS.md', 'utf8');\nif (!rules.includes('Allow checks') || !fs.existsSync('docs/index.md')) { console.error('docs gate failed'); process.exit(1); }\nconsole.log('docs okay');\n",
    });
    const baseline = await createSnapshot(root, { approvedDigest });
    t.after(() => cleanupSnapshot(baseline));
    const final = await prepareFinalSnapshot(
      baseline,
      [
        {
          path: 'AGENTS.md',
          action: 'modify',
          beforeHash: hashContent('No marker yet'),
          content: 'Allow checks',
        },
      ],
      { approvedDigest },
    );
    t.after(() => cleanupSnapshot(final));
    const command = {
      id: 'docs-gate',
      kind: 'lint',
      executable: process.execPath,
      argv: ['./tools/check-docs.cjs'],
      cwd: '.',
      envNames: [],
      trusted: true,
      script: { path: 'tools/check-docs.cjs', hash: '' },
    };
    command.script!.hash = hashContent(
      await readFile(path.join(root, 'tools/check-docs.cjs')),
    );
    const options = {
      approvedDigest,
      environmentReady: true,
      profile: 'docs',
    } as const;
    const before = await runProjectChecks(baseline, [command], options);
    const after = await runProjectChecks(final, [command], options);
    assert.equal(before.runs[0].exitCode, 1);
    assert.equal(after.runs[0].exitCode, 0);
    assert.equal(compareChecks(before.runs, after.runs).status, 'red-fixed');
    assert.equal(
      await readFile(path.join(root, 'docs/index.md'), 'utf8'),
      '# Guide\n',
    );
  },
);

test(
  'bound filenames cannot become interpreter options or subcommands',
  { skip: !bash },
  async (t) => {
    for (const [filename, executable, content] of [
      ['--version', bash!, 'exit 73\n'],
      ['inspect', process.execPath, 'process.exit(73);\n'],
    ]) {
      const root = await fixture(t, {
        'AGENTS.md': 'Owner rules',
        [filename]: content,
      });
      const home = await mkdtemp(path.join(tmpdir(), 'tibicen-option-home-'));
      t.after(() => rm(home, { recursive: true, force: true }));
      const envelope = await createProposal(
        root,
        {
          mode: 'improve',
          changes: [],
          commands: [
            {
              id: 'file',
              kind: 'test',
              executable,
              argv: [filename],
              trusted: true,
              script: { path: filename },
            },
          ],
          checks: { profile: 'docs', environmentReady: true },
        },
        { home },
      );
      assert.deepEqual(envelope.proposal.commands[0].argv, [`./${filename}`]);
      const snapshot = await createSnapshot(root, {
        approvedDigest: envelope.digest,
      });
      t.after(() => cleanupSnapshot(snapshot));
      const options = {
        profile: 'docs',
        environmentReady: true,
        approvedDigest: envelope.digest,
        runner: bindRunner(envelope.proposal, envelope.digest),
      };
      const before = await runProjectChecks(
        snapshot,
        envelope.proposal.commands,
        options,
      );
      const after = await runProjectChecks(
        snapshot,
        envelope.proposal.commands,
        options,
      );
      assert.equal(before.runs[0].exitCode, 73);
      assert.equal(after.runs[0].exitCode, 73);
      assert.equal(
        compareChecks(before.runs, after.runs).status,
        'pre-existing-red',
      );
      assert.throws(
        () =>
          validateCommand({
            ...envelope.proposal.commands[0],
            argv: [filename],
          }),
        { code: 'forbidden-command' },
      );
    }
  },
);

test(
  'project executables run only through bound entrypoints in the copy',
  { skip: !bash },
  async (t) => {
    const root = await fixture(t, {
      'AGENTS.md': 'Owner rules',
      'check.sh': '#!/bin/bash\nprintf copied > "${0%/*}/SCRIPT_RAN"\n',
    });
    await chmod(path.join(root, 'check.sh'), 0o755);
    const home = await mkdtemp(path.join(tmpdir(), 'tibicen-entry-home-'));
    t.after(() => rm(home, { recursive: true, force: true }));
    const alias = path.join(home, 'external-alias');
    await symlink(path.join(root, 'check.sh'), alias);
    for (const executable of [path.join(root, 'check.sh'), alias]) {
      await assert.rejects(
        createProposal(
          root,
          {
            mode: 'improve',
            changes: [],
            commands: [
              { id: 'file', kind: 'test', executable, argv: [], trusted: true },
            ],
            checks: { profile: 'docs', environmentReady: true },
          },
          { home },
        ),
        { code: 'invalid-check-command' },
      );
    }
    const envelope = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [],
        commands: [
          {
            id: 'file',
            kind: 'test',
            executable: './check.sh',
            argv: [],
            trusted: true,
            script: { path: 'check.sh' },
          },
        ],
        checks: { profile: 'docs', environmentReady: true },
      },
      { home },
    );
    const snapshot = await createSnapshot(root, {
      approvedDigest: envelope.digest,
    });
    t.after(() => cleanupSnapshot(snapshot));
    const refused = await runProjectChecks(
      snapshot,
      [
        {
          id: 'original',
          kind: 'test',
          executable: path.join(root, 'check.sh'),
          argv: [],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
      ],
      {
        profile: 'docs',
        environmentReady: true,
        approvedDigest: envelope.digest,
      },
    );
    assert.equal(refused.reason, 'invalid-check-command');
    assert.deepEqual(refused.runs, []);
    const result = await runProjectChecks(
      snapshot,
      envelope.proposal.commands,
      {
        profile: 'docs',
        environmentReady: true,
        approvedDigest: envelope.digest,
        runner: bindRunner(envelope.proposal, envelope.digest),
      },
    );
    assert.equal(result.runs[0].exitCode, 0);
    await assert.rejects(readFile(path.join(root, 'SCRIPT_RAN')), {
      code: 'ENOENT',
    });
  },
);

test('controlled profiles keep Windows process execution unavailable', async (t) => {
  const root = await fixture(t, {
    'AGENTS.md': 'Owner rules',
    'check.cjs': 'process.exit(73);\n',
  });
  const snapshot = await createSnapshot(root, { approvedDigest });
  t.after(() => cleanupSnapshot(snapshot));
  const platform = Object.getOwnPropertyDescriptor(process, 'platform')!;
  Object.defineProperty(process, 'platform', { value: 'win32' });
  try {
    for (const profile of ['python', 'bash', 'docs']) {
      const result = await runProjectChecks(
        snapshot,
        [
          {
            id: 'file',
            kind: 'test',
            executable: process.execPath,
            argv: ['./check.cjs'],
            cwd: '.',
            envNames: [],
            trusted: true,
            script: {
              path: 'check.cjs',
              hash: hashContent('process.exit(73);\n'),
            },
          },
        ],
        { profile, environmentReady: true, approvedDigest },
      );
      assert.equal(result.status, 'unverified');
      assert.equal(result.reason, 'process-tree-unavailable');
      assert.deepEqual(result.runs, []);
    }
  } finally {
    Object.defineProperty(process, 'platform', platform);
  }
});
