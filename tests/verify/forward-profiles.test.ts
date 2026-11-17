import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  rm,
  readdir,
} from 'node:fs/promises';
import { buildSkills } from '../../scripts/build.ts';

// These fixtures drive the distributed skills' public CLI for the controlled
// python/docs/bash profiles. Synthetic fixture trust is controller-granted on a
// disposable copy; no network, package installation or paid agent is involved.
function interpreter(name: string) {
  const found = spawnSync('/usr/bin/which', [name], { encoding: 'utf8' });
  const resolved = found.status === 0 ? found.stdout.trim().split('\n')[0] : '';
  return resolved || null;
}
const python3 = process.platform === 'win32' ? null : interpreter('python3');

async function setup(
  t: TestContext,
  skill: string,
  files: Record<string, string>,
) {
  const temporary = await mkdtemp(
    path.join(tmpdir(), 'tibicen-forward-profiles-'),
  );
  t.after(() => rm(temporary, { recursive: true, force: true }));
  const home = path.join(temporary, 'home');
  const root = path.join(temporary, 'project');
  const output = path.join(temporary, 'installed');
  const templates = path.join(temporary, 'git-templates');
  await Promise.all([mkdir(home), mkdir(root), mkdir(templates)]);
  for (const [relative, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
    await writeFile(path.join(root, relative), content);
  }
  const preload = path.join(temporary, 'offline.mjs');
  await writeFile(
    preload,
    "globalThis.fetch = async () => { throw Object.assign(new Error('Forward test forbids network access'), { code: 'NETWORK_FORBIDDEN' }); };\n",
  );
  const env = {
    ...process.env,
    HOME: home,
    USERPROFILE: home,
    CODEX_HOME: path.join(home, '.codex'),
    XDG_CONFIG_HOME: path.join(home, '.config'),
    GIT_CONFIG_GLOBAL: path.join(home, '.gitconfig'),
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_TEMPLATE_DIR: templates,
  };
  const initialized = spawnSync('git', ['init', '--quiet', root], {
    env,
    encoding: 'utf8',
  });
  assert.equal(initialized.status, 0, initialized.stderr);
  await buildSkills(output);
  const skillRoot = path.join(output, skill);
  const command = (
    name: string,
    args: string[] = [],
    data?: unknown,
    extraEnv: Record<string, string> = {},
  ) => {
    const result = spawnSync(
      process.execPath,
      [
        '--import',
        preload,
        path.join(skillRoot, 'scripts/tibicen.ts'),
        name,
        '--root',
        root,
        ...args,
      ],
      {
        env: { ...env, ...extraEnv },
        input: data === undefined ? undefined : JSON.stringify(data),
        encoding: 'utf8',
        timeout: 30000,
      },
    );
    assert(!result.error, result.error?.message);
    assert.equal(result.stderr, '', result.stderr);
    return { exitCode: result.status, data: JSON.parse(result.stdout) };
  };
  return { root, home, skillRoot, command };
}

const smoke =
  '#!/usr/bin/env bash\nset -u\ngrep -q "Allow checks" AGENTS.md || exit 1\ntouch SMOKE_RAN\nexit 0\n';
const docsGate =
  "const fs = require('node:fs');\nif (!fs.readFileSync('AGENTS.md', 'utf8').includes('Allow checks')) { console.error('gate failed'); process.exit(1); }\nconsole.log('gate okay');\n";

for (const skill of ['tibicen-init', 'tibicen-adopt']) {
  test(
    `forward profiles: ${skill} runs a python unittest baseline/final through the CLI`,
    { skip: !python3 },
    async (t) => {
      const { root, command } = await setup(t, skill, {
        'AGENTS.md': 'Stub instructions',
        'tests/test_gate.py':
          "import pathlib, unittest\nclass Gate(unittest.TestCase):\n    def test_marker(self):\n        self.assertIn('Allow checks', pathlib.Path('AGENTS.md').read_text(encoding='utf-8'))\n",
      });
      const plan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: 'Allow checks',
            reason: 'Approve the gate marker.',
          },
        ],
        commands: [
          {
            id: 'unittest',
            kind: 'test',
            executable: 'python3',
            argv: ['-m', 'unittest', 'discover', '-s', 'tests'],
            trusted: true,
          },
        ],
        checks: { profile: 'python', environmentReady: true },
      }).data;
      assert.match(plan.proposal.commands[0].executable, /^\/.+\/python3$/);
      const result = command(
        'apply',
        ['--plan', '-', '--approve', plan.digest],
        plan,
      ).data;
      assert.equal(result.status, 'complete', JSON.stringify(result));
      assert.equal(result.checks.verify.status, 'red-fixed');
      const attempts = result.manifest.sessions.at(-1).commandAttempts;
      assert.equal(attempts.length, 2);
      assert.deepEqual(
        attempts.map((attempt: { id: string; status: string }) => ({
          id: attempt.id,
          status: attempt.status,
        })),
        [
          { id: 'unittest', status: 'failed' },
          { id: 'unittest', status: 'completed' },
        ],
      );
      assert.equal(
        await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
        'Allow checks',
      );
    },
  );

  test(
    `forward profiles: ${skill} docs and bash gates run bound local scripts`,
    { skip: process.platform === 'win32' },
    async (t) => {
      const { root, command } = await setup(t, skill, {
        'AGENTS.md': 'Stub instructions',
        'docs/index.md': '# Guide\n',
        'tools/check-docs.cjs': docsGate,
        'scripts/smoke.sh': smoke,
      });
      const docsPlan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: 'Allow checks',
            reason: 'Approve the gate marker.',
          },
        ],
        commands: [
          {
            id: 'docs-gate',
            kind: 'lint',
            executable: 'node',
            argv: ['tools/check-docs.cjs'],
            trusted: true,
            script: { path: 'tools/check-docs.cjs' },
          },
        ],
        checks: { profile: 'docs', environmentReady: true },
      }).data;
      assert(path.isAbsolute(docsPlan.proposal.commands[0].executable));
      const docs = command(
        'apply',
        ['--plan', '-', '--approve', docsPlan.digest],
        docsPlan,
      ).data;
      assert.equal(docs.status, 'complete', JSON.stringify(docs));
      assert.equal(docs.checks.verify.status, 'red-fixed');
      // The same session cannot replay under a changed marker without a new plan.
      const bare = command('proposal', ['--input', '-'], {
        mode: 'improve',
        changes: [],
      }).data;
      assert.equal(
        command('apply', ['--plan', '-', '--approve', bare.digest], bare).data
          .checks.verify.reason,
        'no-project-checks',
      );
      const bashPlan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        commands: [
          {
            id: 'smoke',
            kind: 'test',
            executable: 'bash',
            argv: ['scripts/smoke.sh'],
            trusted: true,
            script: { path: 'scripts/smoke.sh' },
          },
        ],
        checks: { profile: 'bash', environmentReady: true },
      }).data;
      assert.match(bashPlan.proposal.commands[0].executable, /\/bash$/);
      const bashRun = command(
        'apply',
        ['--plan', '-', '--approve', bashPlan.digest],
        bashPlan,
      ).data;
      assert.equal(bashRun.status, 'complete', JSON.stringify(bashRun));
      assert.equal(bashRun.checks.verify.status, 'green');
      assert.deepEqual((await readdir(root)).sort(), [
        '.git',
        '.tibicen',
        'AGENTS.md',
        'docs',
        'scripts',
        'tools',
      ]);
    },
  );

  test(
    `forward profiles: ${skill} refuses drifted bash bytes, missing trust and absent interpreters`,
    { skip: process.platform === 'win32' },
    async (t) => {
      const { root, command } = await setup(t, skill, {
        'AGENTS.md': 'Allow checks',
        'scripts/smoke.sh': smoke,
      });
      const plan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        commands: [
          {
            id: 'smoke',
            kind: 'test',
            executable: 'bash',
            argv: ['scripts/smoke.sh'],
            trusted: true,
            script: { path: 'scripts/smoke.sh' },
          },
        ],
        checks: { profile: 'bash', environmentReady: true },
      }).data;
      await writeFile(
        path.join(root, 'scripts/smoke.sh'),
        smoke.replace('set -u', 'set -x'),
      );
      const drifted = command(
        'apply',
        ['--plan', '-', '--approve', plan.digest],
        plan,
      ).data;
      assert.equal(drifted.status, 'complete', JSON.stringify(drifted));
      assert.equal(drifted.checks.verify.status, 'unverified');
      assert.equal(drifted.checks.verify.reason, 'command-source-changed');
      const untrusted = command('proposal', ['--input', '-'], {
        mode: 'improve',
        commands: [
          {
            id: 'smoke',
            kind: 'test',
            executable: 'bash',
            argv: ['scripts/smoke.sh'],
            script: { path: 'scripts/smoke.sh' },
          },
        ],
        checks: { profile: 'bash', environmentReady: true },
      }).data;
      const refused = command(
        'apply',
        ['--plan', '-', '--approve', untrusted.digest],
        untrusted,
      ).data;
      assert.equal(refused.checks.verify.reason, 'trust-required');
      assert.equal(
        command(
          'proposal',
          ['--input', '-'],
          {
            mode: 'improve',
            commands: [
              {
                id: 'unittest',
                kind: 'test',
                executable: 'python3',
                argv: ['-m', 'unittest'],
                trusted: true,
              },
            ],
            checks: { profile: 'python', environmentReady: true },
          },
          { PATH: '' },
        ).data.error.code,
        'interpreter-unavailable',
      );
    },
  );

  test(
    `forward profiles: ${skill} refuses inline spellings, foreign script bindings and unknown profiles`,
    { skip: process.platform === 'win32' },
    async (t) => {
      const { command } = await setup(t, skill, {
        'AGENTS.md': 'Allow checks',
        'tools/check-docs.cjs': docsGate,
        'run.sh': '#!/bin/sh\nexit 0\n',
      });
      // Inline interpreter spellings stay forbidden even with a pinned executable.
      for (const argv of [
        ['-p', '1+1'],
        ['--eval=console.log(1)'],
        ['--print=console.log(1)'],
        ['scripts/check-docs.cjs'],
      ])
        assert.equal(
          command('proposal', ['--input', '-'], {
            mode: 'improve',
            commands: [
              {
                id: 'docs-gate',
                kind: 'lint',
                executable: 'node',
                argv,
                trusted: true,
              },
            ],
            checks: { profile: 'docs', environmentReady: true },
          }).data.error.code,
          'forbidden-command',
          JSON.stringify(argv),
        );
      // Absolute spellings of the same interpreters are not a freer route.
      for (const executable of [process.execPath, python3].filter(
        (name): name is string => name !== null,
      ))
        for (const argv of [
          ['-p', '1+1'],
          ['-Ic', 'print(1)'],
        ])
          assert.equal(
            command('proposal', ['--input', '-'], {
              mode: 'improve',
              commands: [
                {
                  id: 'absolute-inline',
                  kind: 'test',
                  executable,
                  argv,
                  trusted: true,
                },
              ],
              checks: { profile: 'docs', environmentReady: true },
            }).data.error.code,
            'forbidden-command',
            JSON.stringify([path.basename(executable), argv]),
          );
      // An absolute interpreter still runs installed modules by name.
      if (python3)
        assert.match(
          command('proposal', ['--input', '-'], {
            mode: 'improve',
            commands: [
              {
                id: 'absolute-module',
                kind: 'test',
                executable: python3,
                argv: ['-m', 'unittest'],
                trusted: true,
              },
            ],
            checks: { profile: 'python', environmentReady: true },
          }).data.proposal.commands[0].executable,
          /\/python3$/,
        );
      // Script bindings belong to the controlled non-web profiles only.
      assert.equal(
        command('proposal', ['--input', '-'], {
          mode: 'improve',
          commands: [
            {
              id: 'web-script',
              kind: 'test',
              executable: 'run.sh',
              argv: ['run.sh'],
              trusted: true,
              script: { path: 'run.sh' },
            },
          ],
          checks: { profile: 'web', environmentReady: true },
        }).data.error.code,
        'invalid-check-command',
      );
      // A script file argument binds only to a pinned interpreter executable,
      // not to an arbitrary absolute wrapper whose bytes escape review.
      assert.equal(
        command('proposal', ['--input', '-'], {
          mode: 'improve',
          commands: [
            {
              id: 'wrapper',
              kind: 'test',
              executable: '/bin/echo',
              argv: ['./run.sh'],
              trusted: true,
              script: { path: 'run.sh' },
            },
          ],
          checks: { profile: 'python', environmentReady: true },
        }).data.error.code,
        'forbidden-command',
      );
      // Unknown profile names fail at proposal time, not after apply.
      assert.equal(
        command('proposal', ['--input', '-'], {
          mode: 'improve',
          commands: [],
          checks: { profile: 'Python' },
        }).data.error.code,
        'invalid-check-command',
      );
      // The reviewed script binding stays visible in the consent summary.
      const plan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        commands: [
          {
            id: 'docs-gate',
            kind: 'lint',
            executable: 'node',
            argv: ['tools/check-docs.cjs'],
            trusted: true,
            script: { path: 'tools/check-docs.cjs' },
          },
        ],
        checks: { profile: 'docs', environmentReady: true },
      }).data;
      assert.equal(
        plan.summary.commands[0].script.path,
        'tools/check-docs.cjs',
      );
      assert.match(plan.summary.commands[0].script.hash, /^[a-f0-9]{64}$/);
    },
  );
}
