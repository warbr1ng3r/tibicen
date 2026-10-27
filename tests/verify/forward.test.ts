import type { TestContext } from 'node:test';
import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import {
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  readdir,
  rm,
  stat,
  chmod,
} from 'node:fs/promises';
import { buildSkills } from '../../scripts/build.ts';
import { hashContent } from '../../scripts/core/contracts.ts';

// These fixtures exercise the installed skills' documented proposal/apply path.
// Only explicitly approved local fixture commands may run; network and paid agents are forbidden.
async function setup(
  t: TestContext,
  skill: string,
  files: Record<string, string>,
) {
  const temporary = await mkdtemp(path.join(tmpdir(), 'tibicen-forward-'));
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
  const shippedScripts = await readdir(path.join(skillRoot, 'scripts'));
  assert(
    !(await readdir(skillRoot)).includes('docs'),
    'Development scenario materials must stay outside installed skills.',
  );
  assert(
    !shippedScripts.includes('evals'),
    'Development eval tooling must stay outside installed skills.',
  );
  assert(
    !shippedScripts.includes('build.ts'),
    'The installed skill must not contain its source build script.',
  );
  const command = (name: string, args: string[] = [], data?: unknown) => {
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
        env,
        input: data === undefined ? undefined : JSON.stringify(data),
        encoding: 'utf8',
        timeout: 15000,
      },
    );
    assert(!result.error, result.error?.message);
    assert.equal(result.stderr, '', result.stderr);
    return { exitCode: result.status, data: JSON.parse(result.stdout) };
  };
  const interrupt = async (plan: unknown) => {
    const runner = path.join(temporary, 'interrupt.mjs');
    await writeFile(
      runner,
      `
import { applyPlan } from ${JSON.stringify(pathToFileURL(path.join(skillRoot, 'scripts/core/apply.ts')).href)};
let input = ''; for await (const chunk of process.stdin) input += chunk;
const plan = JSON.parse(input);
await applyPlan(process.argv[2], plan, { home: process.argv[3], approvedDigest: plan.digest,
  checkpoint(point) { if (point === 'after-file-write') process.exit(73); }
});
`,
    );
    const result = spawnSync(
      process.execPath,
      ['--import', preload, runner, root, home],
      { env, input: JSON.stringify(plan), encoding: 'utf8', timeout: 15000 },
    );
    assert(!result.error, result.error?.message);
    assert.equal(result.status, 73, result.stderr);
  };
  return { root, home, skillRoot, command, interrupt };
}

async function inventory(
  root: string,
  relative = '',
): Promise<[string, string][]> {
  const files: [string, string][] = [];
  for (const entry of await readdir(path.join(root, relative), {
    withFileTypes: true,
  })) {
    const filename = path.posix.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...(await inventory(root, filename)));
    else
      files.push([filename, await readFile(path.join(root, filename), 'utf8')]);
  }
  return files.sort(([left], [right]) => left.localeCompare(right));
}

const manifest = JSON.stringify(
  {
    name: 'small-project',
    private: true,
    scripts: { test: 'node fixture-test.cjs' },
  },
  null,
  2,
);
const application = 'export function double(value) { return value * 2; }\n';
const fixtureTest =
  "require('node:fs').writeFileSync('APP_CODE_EXECUTED', 'This project command must not execute during the forward test.');\n";
const gap = {
  reason: 'network-disabled-for-session',
  detail:
    'No live sources or component search requested in this isolated session; no third-party component is needed.',
};

for (const skill of ['tibicen-init', 'tibicen-adopt']) {
  test(`forward: ${skill} refuses raw MCP and never approves a partial successful check set`, async (t) => {
    const { root, home, command } = await setup(t, skill, {
      'AGENTS.md': '# Owner rules\n',
      'pass.cjs': 'process.exit(0);\n',
      'package.json': JSON.stringify({ scripts: { test: 'old script' } }),
    });
    const initial = await inventory(root);
    for (const target of ['.mcp.json', '.cursor/mcp.json']) {
      const plan = command('proposal', ['--input', '-'], {
        mode: 'improve',
        changes: [
          {
            path: target,
            content: JSON.stringify({
              mcpServers: { example: { command: 'fixture-server', args: [] } },
            }),
            reason: 'Show a raw integration change.',
          },
        ],
      }).data;
      assert.equal(
        command('apply', ['--plan', '-', '--approve', plan.digest], plan).data
          .error.code,
        'trust-required',
      );
      assert.deepEqual(await inventory(root), initial);
      assert.deepEqual(await readdir(home), []);
    }
    const check = {
      kind: 'test',
      executable: process.execPath,
      argv: ['pass.cjs'],
      cwd: '.',
      envNames: [],
      trusted: true,
    };
    const plan = command('proposal', ['--input', '-'], {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Approved rules\n',
          reason: 'Update instructions.',
        },
      ],
      commands: [
        { ...check, id: 'first' },
        {
          ...check,
          id: 'second',
          source: {
            path: 'package.json',
            script: 'test',
            scriptHash: hashContent('old script'),
          },
        },
      ],
      checks: { profile: 'web', environmentReady: true },
    }).data;
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({ scripts: { test: 'changed script' } }),
    );
    const result = command(
      'apply',
      ['--plan', '-', '--approve', plan.digest],
      plan,
    ).data;
    assert.equal(result.status, 'complete', JSON.stringify(result));
    assert.equal(result.checks.verify.status, 'unverified');
    assert.equal(result.checks.verify.reason, 'command-source-changed');
    const attempts = result.manifest.sessions.at(-1).commandAttempts;
    assert.equal(attempts.length, 2);
    assert(
      attempts.every(
        (attempt: { id: string; status: string }) =>
          attempt.id === 'first' && attempt.status === 'completed',
      ),
    );
  });

  test(`forward: ${skill} recovers executable permissions with explicit approval and runs the helper`, async (t) => {
    const target = '.agents/skills/local/run.sh';
    const helper = '#!/bin/sh\n# Updated approved helper\nexit 0\n';
    const { root, command, interrupt } = await setup(t, skill, {
      'AGENTS.md': '# Owner rules\n',
      [target]: '#!/bin/sh\nexit 0\n',
    });
    const filename = path.join(root, target);
    await chmod(filename, 0o755);
    const plan = command('proposal', ['--input', '-'], {
      mode: 'improve',
      changes: [
        {
          path: target,
          content: helper,
          reason: 'Update the existing executable helper.',
        },
      ],
    }).data;
    assert.equal(plan.proposal.changes[0].fileMode, 0o755);
    await interrupt(plan);
    const status = command('status').data;
    assert.equal(status.recovery.files[0].state, 'matches-approved-result');
    assert.equal(status.recovery.files[0].afterMode, 0o755);
    await chmod(filename, 0o700);
    assert.equal(command('status').data.recovery.files[0].state, 'ambiguous');
    assert.equal(
      command('resume', ['--approve', plan.digest]).data.error.code,
      'tamper-suspect',
    );
    const repair = command('proposal', ['--input', '-'], {
      mode: 'improve',
      changes: [
        {
          path: target,
          content: helper,
          fileMode: 0o755,
          reason: 'Approve restoration of executable permissions.',
        },
      ],
    }).data;
    assert.notEqual(repair.digest, plan.digest);
    assert.equal(repair.proposal.changes.length, 1);
    assert.equal(
      command('resume', ['--plan', '-', '--approve', plan.digest], repair).data
        .error.code,
      'consent-required',
    );
    const resumed = command(
      'resume',
      ['--plan', '-', '--approve', repair.digest],
      repair,
    ).data;
    assert.equal(resumed.status, 'complete', JSON.stringify(resumed));
    assert.equal(resumed.id, status.sessionId);
    assert.equal((await stat(filename)).mode & 0o777, 0o755);
    assert.equal(
      (await stat(path.join(root, '.tibicen/manifest.yml'))).mode & 0o777,
      0o600,
    );
    const checked = command('proposal', ['--input', '-'], {
      mode: 'improve',
      commands: [
        {
          id: 'helper',
          kind: 'test',
          executable: `./${target}`,
          argv: [],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
      ],
      checks: { profile: 'web', environmentReady: true },
    }).data;
    const result = command(
      'apply',
      ['--plan', '-', '--approve', checked.digest],
      checked,
    ).data;
    assert.equal(result.status, 'complete', JSON.stringify(result));
    assert.equal(result.checks.verify.status, 'green');
    const attempts = result.manifest.sessions.at(-1).commandAttempts;
    assert.equal(attempts.length, 2);
    assert(
      attempts.every(
        (attempt: { id: string; status: string }) =>
          attempt.id === 'helper' && attempt.status === 'completed',
      ),
    );
  });

  test(
    'forward: ' +
      skill +
      ' configures the bounded OpenSpec adapter without shipping its CLI',
    async (t) => {
      const { root, skillRoot, command, interrupt } = await setup(t, skill, {
        'AGENTS.md': '# Owner rules\n',
        'src/index.js': application,
      });
      const input = {
        mode: 'improve',
        process: {
          framework: 'openspec',
          version: '1.14.3',
          agent: 'codex',
          agentVersion: '0.157.0',
        },
      };
      const plan = command('proposal', ['--input', '-'], input).data;
      assert.equal(plan.proposal.changes.length, 4);
      assert.equal(
        command('apply', ['--plan', '-'], plan).data.error.code,
        'consent-required',
      );
      await interrupt(plan);
      assert.equal(command('status').data.status, 'incomplete');
      const applied = command('resume', ['--approve', plan.digest]).data;
      assert.equal(applied.status, 'manual-action-required');
      assert.equal(command('verify').data.status, 'passed');
      assert.equal(command('report').data.process.framework, 'openspec');
      assert.equal(command('verify').data.process.loading, 'unverified');
      assert.deepEqual(
        command('proposal', ['--input', '-'], input).data.proposal.changes,
        [],
      );
      assert.equal(
        await readFile(path.join(root, 'src/index.js'), 'utf8'),
        application,
      );
      const files = await inventory(skillRoot);
      assert(
        !files.some(
          ([name]) =>
            name.includes('node_modules') ||
            name.includes('openspec-propose/SKILL.md') ||
            name.includes('evals/'),
        ),
      );
      assert(files.some(([name]) => name === 'scripts/process/index.ts'));
    },
  );

  test(`forward: ${skill} exposes evidence assumptions without treating them as approval`, async (t) => {
    const owner =
      '# Project rules\nKeep responses concise and state necessary limits.\n';
    const { root, home, command, interrupt } = await setup(t, skill, {
      'AGENTS.md': owner,
      'src/index.js': application,
    });
    const initial = await inventory(root);
    assert.deepEqual(command('report').data.assumptions, []);
    const assumptions = [
      {
        id: 'response-detail',
        preference: 'concise-answers',
        status: 'inferred',
        basis: [
          {
            source: 'project-instructions',
            reference: 'AGENTS.md:2',
            observation: 'Keep responses concise and state necessary limits.',
          },
        ],
        approved: true,
      },
      'A legacy free-text assumption remains supported.',
      { text: 'Legacy project decision', status: 'user-confirmed' },
    ];
    const draft = {
      mode: 'improve',
      assumptions,
      changes: [
        {
          path: 'AGENTS.md',
          managedBlock: {
            content:
              'Use actual project commands and preserve the owner rules.',
          },
          reason: 'Add a scoped project entrypoint without another component.',
        },
      ],
    };
    const first = command('proposal', ['--input', '-'], draft).data;
    assert.deepEqual(first.summary.assumptions, assumptions);
    assert.deepEqual(first.proposal.assumptions, assumptions);
    assert.deepEqual(first.proposal.sources, []);
    assert.deepEqual(first.proposal.commands, []);
    assert.equal(
      command('apply', ['--plan', '-'], first).data.error.code,
      'consent-required',
    );
    const revised = {
      ...draft,
      assumptions: [
        {
          id: 'response-detail',
          status: 'user-confirmed',
          preference: 'detailed-explanations',
          basis: [
            {
              source: 'dialogue',
              reference: 'current-message',
              observation:
                'For this project explain the important decisions in detail.',
            },
          ],
        },
        ...assumptions.slice(1),
      ],
    };
    const second = command('proposal', ['--input', '-'], revised).data;
    assert.notEqual(second.digest, first.digest);
    assert.equal(
      command('apply', ['--plan', '-', '--approve', first.digest], second).data
        .error.code,
      'consent-required',
    );
    assert.deepEqual(await inventory(root), initial);
    assert.deepEqual(await readdir(home), []);
    await interrupt(second);
    const interrupted = await inventory(root);
    assert.deepEqual(
      command('report').data.assumptions,
      second.proposal.assumptions,
    );
    assert.deepEqual(await inventory(root), interrupted);
    assert.deepEqual(await readdir(home), []);
    const applied = command('resume', ['--approve', second.digest]);
    assert.equal(applied.data.status, 'complete', JSON.stringify(applied.data));
    const beforeReport = await inventory(root);
    assert.deepEqual(
      command('report').data.assumptions,
      second.proposal.assumptions,
    );
    assert.deepEqual(await inventory(root), beforeReport);
    const passport = JSON.parse(
      await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    );
    assert.deepEqual(passport.assumptions, second.proposal.assumptions);
    assert.deepEqual(passport.installed, []);
    assert.deepEqual(await readdir(path.join(home, '.tibicen')), [
      'usage.json',
    ]);
    assert.equal(
      await readFile(path.join(root, 'src/index.js'), 'utf8'),
      application,
    );
    assert(
      (await readFile(path.join(root, 'AGENTS.md'), 'utf8')).startsWith(owner),
    );
  });
  test(`forward: ${skill} links two tool revisions and detects an old copy from its installed CLI`, async (t) => {
    const { root, skillRoot, command } = await setup(t, skill, {
      'AGENTS.md': '# Owner rules\r\n',
      'CLAUDE.md': '# Owner Claude\n',
      'src/index.js': application,
    });
    assert(
      (
        await readFile(
          path.join(skillRoot, 'references/proposal-format.md'),
          'utf8',
        )
      ).includes('sharedRules'),
    );
    const initial = await inventory(root);
    const body = '# Common process\nRead, implement, verify.\n';
    const draft = {
      mode: 'improve',
      sharedRules: [
        {
          id: 'project-process',
          content: body,
          reason: 'One agreed process for both tools.',
          targets: [
            { agent: 'codex', agentVersion: '0.157.0', path: 'AGENTS.md' },
            {
              agent: 'claude-code',
              agentVersion: '2.1.283',
              path: 'CLAUDE.md',
            },
          ],
        },
      ],
    };
    const first = command('proposal', ['--input', '-'], draft).data;
    assert.equal(first.summary.sharedRules.copies.length, 2);
    assert.deepEqual(await inventory(root), initial);
    assert.equal(
      command('apply', ['--plan', '-'], first).data.error.code,
      'consent-required',
    );
    assert.equal(
      command('apply', ['--plan', '-', '--approve', first.digest], first).data
        .status,
      'complete',
    );
    const oldCopy = await readFile(path.join(root, 'CLAUDE.md'), 'utf8');
    const updated = command('proposal', ['--input', '-'], {
      mode: 'improve',
      sharedRules: [
        {
          id: 'project-process',
          content: body + 'Review the focused change.\n',
          reason: 'Update both adapters together.',
        },
      ],
    }).data;
    assert.equal(updated.proposal.changes.length, 2);
    assert.equal(
      command('apply', ['--plan', '-', '--approve', updated.digest], updated)
        .data.status,
      'complete',
    );
    assert.equal(command('verify').data.status, 'passed');
    await writeFile(path.join(root, 'CLAUDE.md'), oldCopy);
    const beforeInspection = await inventory(root);
    const checked = command('verify').data;
    assert.equal(checked.status, 'issues-found');
    assert(
      checked.issues.some(
        (issue: { path: string; reason: string }) =>
          issue.path === 'CLAUDE.md' &&
          issue.reason === 'shared-rule-copy-outdated',
      ),
    );
    assert.equal(
      command('proposal', ['--input', '-'], { mode: 'improve' }).data.summary
        .sharedRules.status,
      'issues-found',
    );
    assert.deepEqual(await inventory(root), beforeInspection);
    assert.equal(
      await readFile(path.join(root, 'src/index.js'), 'utf8'),
      application,
    );
    const passport = JSON.parse(
      await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    );
    assert.equal(
      passport.sharedRules[0].revision,
      updated.proposal.sharedRules[0].revision,
    );
    assert.equal(
      passport.sessions[0].sharedRules[0].revision,
      first.proposal.sharedRules[0].revision,
    );
  });
  test(`forward: ${skill} resumes an unrecorded write through its installed CLI`, async (t) => {
    const { root, home, command, interrupt } = await setup(t, skill, {
      'AGENTS.md': '# Original instructions\n',
      'src/index.js': application,
    });
    const plan = command('proposal', ['--input', '-'], {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          action: 'modify',
          content: '# Approved instructions\n',
          reason: 'Recover this exact edit.',
        },
      ],
    }).data;
    await interrupt(plan);
    const initial = await inventory(root);
    const before = await stat(path.join(root, 'AGENTS.md'));
    const status = command('status').data;
    assert.equal(status.status, 'incomplete');
    assert.equal(status.recovery.files[0].state, 'matches-approved-result');
    assert.equal(status.recovery.manifest, 'unchanged');
    assert.deepEqual(status.commandAttempts, []);
    assert.equal(
      command('report').data.recovery.files[0].state,
      'matches-approved-result',
    );
    assert.equal(command('resume').data.error.code, 'consent-required');
    assert.deepEqual(await inventory(root), initial);
    const resumed = command('resume', ['--approve', plan.digest]);
    assert.equal(resumed.exitCode, 0, JSON.stringify(resumed.data));
    assert.equal(resumed.data.id, status.sessionId);
    assert.equal(resumed.data.status, 'complete');
    assert.equal(resumed.data.applied[0].evidence, 'matches-approved-result');
    const after = await stat(path.join(root, 'AGENTS.md'));
    assert.equal(after.ino, before.ino);
    assert.equal(after.mtimeMs, before.mtimeMs);
    assert.equal(
      await readFile(path.join(root, 'src/index.js'), 'utf8'),
      application,
    );
    assert.equal(command('status').data.continuationAvailable, false);
    const passport = JSON.parse(
      await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    );
    assert.equal(passport.sessions[0].attempts.length, 2);
    assert.equal(passport.sessions[0].attempts[0].reason, 'interrupted');
    assert.equal(
      JSON.parse(await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'))
        .sessions.length,
      1,
    );
  });
  test(`forward: ${skill} migrates a passport only through the approved installed CLI`, async (t) => {
    const relative = '.agents/skills/example/SKILL.md';
    const originalHash = 'a'.repeat(64);
    const passport = {
      schema: 1,
      installed: [
        {
          repo: 'owner/example',
          sha: 'b'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: relative,
              sourcePath: 'SKILL.md',
              contentHash: originalHash,
            },
          ],
        },
      ],
      sessions: [
        {
          id: 'earlier-session',
          attempts: [],
          status: 'complete',
          manualActions: [],
        },
      ],
    };
    const initialFiles = {
      'AGENTS.md': '# Project instructions\n',
      [relative]: '# Locally adapted workflow\n',
      '.tibicen/manifest.yml': JSON.stringify(passport),
    };
    const { root, skillRoot, command } = await setup(t, skill, initialFiles);
    assert(
      (
        await readFile(
          path.join(skillRoot, 'references/proposal-format.md'),
          'utf8',
        )
      ).includes('componentUpdates'),
    );
    const initial = await inventory(root);
    assert.equal(
      command('proposal', ['--input', '-'], { mode: 'improve' }).data.error
        .code,
      'manifest-migration-required',
    );
    assert.deepEqual(await inventory(root), initial);
    const proposed = command('proposal', ['--input', '-'], {
      mode: 'improve',
      migrateManifest: true,
    });
    assert.equal(proposed.exitCode, 0, JSON.stringify(proposed.data));
    assert.equal(proposed.data.summary.components.fromSchema, 1);
    assert.equal(proposed.data.summary.components.toSchema, 2);
    assert.deepEqual(await inventory(root), initial);
    assert.equal(
      command('apply', ['--plan', '-'], proposed.data).data.error.code,
      'consent-required',
    );
    const applied = command(
      'apply',
      ['--plan', '-', '--approve', proposed.data.digest],
      proposed.data,
    );
    assert.equal(applied.exitCode, 0, JSON.stringify(applied.data));
    assert.equal(applied.data.status, 'complete');
    const result = JSON.parse(
      await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    );
    assert.equal(result.schema, 2);
    assert.equal(result.installed[0].files[0].contentHash, originalHash);
    assert.notEqual(result.installed[0].files[0].installedHash, originalHash);
    assert.equal(result.installed[0].provenance, 'unverified');
    assert.deepEqual(result.sessions[0], passport.sessions[0]);
    assert.equal(
      await readFile(path.join(root, relative), 'utf8'),
      initialFiles[relative],
    );
  });
  test(`forward: ${skill} handles managed blocks from its installed CLI`, async (t) => {
    const owner = '# Owner rules\r\nKeep local decisions.  \r\n';
    const { root, skillRoot, command } = await setup(t, skill, {
      'AGENTS.md': owner,
      'src/index.js': application,
    });
    assert(
      (
        await readFile(
          path.join(skillRoot, 'references/proposal-format.md'),
          'utf8',
        )
      ).includes('managedBlock'),
    );
    const initial = await inventory(root);
    const draft = {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          managedBlock: {
            content: 'Use the project commands.' as string | null,
          },
          reason: 'Only the managed block',
        },
      ],
    };
    const proposed = command('proposal', ['--input', '-'], draft);
    assert.equal(proposed.exitCode, 0, JSON.stringify(proposed.data));
    assert.deepEqual(await inventory(root), initial);
    assert.equal(
      command('apply', ['--plan', '-'], proposed.data).data.error.code,
      'consent-required',
    );
    assert.equal(
      command(
        'apply',
        ['--plan', '-', '--approve', proposed.data.digest],
        proposed.data,
      ).data.status,
      'complete',
    );
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      owner +
        '\r\n<!-- tibicen:begin v1 -->\r\nUse the project commands.\r\n<!-- tibicen:end v1 -->\r\n',
    );
    assert.equal(command('verify').data.status, 'passed');
    assert.deepEqual(
      command('proposal', ['--input', '-'], draft).data.proposal.changes,
      [],
    );
    draft.changes[0].managedBlock.content = null;
    const removed = command('proposal', ['--input', '-'], draft).data;
    assert.equal(
      command('apply', ['--plan', '-', '--approve', removed.digest], removed)
        .data.status,
      'complete',
    );
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      owner + '\r\n',
    );
    await writeFile(
      path.join(root, 'AGENTS.md'),
      owner + '<!-- tibicen:begin v1 -->\r\n',
    );
    const damaged = command('verify').data;
    assert.equal(damaged.status, 'issues-found');
    assert(
      damaged.issues.some(
        (issue: { reason: string; line: number }) =>
          issue.reason === 'invalid-managed-block' && issue.line === 3,
      ),
    );
    const refused = command('proposal', ['--input', '-'], draft);
    assert.equal(refused.data.error.code, 'invalid-managed-block');
    assert.match(refused.data.error.message, /AGENTS\.md:3:/);
    assert.equal(
      await readFile(path.join(root, 'src/index.js'), 'utf8'),
      application,
    );
  });
}

test('forward: first setup of a small Node project for Codex with minimal process', async (t) => {
  const context = await setup(t, 'tibicen-init', {
    'package.json': manifest,
    'src/index.js': application,
    'fixture-test.cjs': fixtureTest,
    'README.md': '# Small project\nUses npm test.\n',
  });
  const { root, skillRoot, command } = context;
  // Follow the installed router and resources, rather than paths in its source checkout.
  const entry = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  assert(entry.includes('references/stage-scan.md'));
  for (const stage of [
    'scan',
    'interview',
    'agent-arch',
    'proposal',
    'build',
    'verify',
    'handoff',
  ])
    await readFile(
      path.join(skillRoot, 'references', `stage-${stage}.md`),
      'utf8',
    );
  const before = await inventory(root);
  const scanned = command('scan');
  assert.equal(scanned.data.mode, 'init');
  assert.equal(scanned.data.kind, 'existing');
  assert(
    scanned.data.commands.some(
      (item: { kind: string; trusted: boolean }) =>
        item.kind === 'test' && item.trusted === false,
    ),
  );
  const agents =
    '# Работа с проектом\n\nНебольшой Node-проект. Исходники находятся в src/. Сохраняй минимальный процесс.\n\nКоманда проверки: npm test. Читай документы, относящиеся к текущей задаче.\n';
  const draft = {
    mode: 'init',
    changes: [
      {
        path: 'AGENTS.md',
        action: 'add',
        content: agents,
        reason:
          'Короткая точка входа Codex с фактической командой проекта и минимумом процесса.',
      },
    ],
    commands: [],
    sources: [],
    forbiddenPaths: [],
    manualActions: [],
    assumptions: [
      {
        text: 'Для этого небольшого проекта достаточно AGENTS.md, дополнительные скиллы и MCP не нужны.',
      },
    ],
    gaps: [gap],
    checks: {},
    compat: { enabled: true },
    practices: [],
  };
  const proposed = command('proposal', ['--input', '-'], draft);
  assert.equal(proposed.exitCode, 0);
  assert.equal(proposed.data.proposal.changes.length, 1);
  assert.deepEqual(
    await inventory(root),
    before,
    'Scan and proposal must remain read-only.',
  );
  const refused = command('apply', ['--plan', '-'], proposed.data);
  assert.notEqual(refused.exitCode, 0);
  assert.deepEqual(
    await inventory(root),
    before,
    'An unapproved fixture plan must not write.',
  );
  const applied = command(
    'apply',
    ['--plan', '-', '--approve', proposed.data.digest],
    proposed.data,
  );
  assert.equal(applied.exitCode, 0, JSON.stringify(applied.data));
  assert.equal(applied.data.status, 'complete');
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), agents);
  for (const [filename, content] of before)
    assert.equal(await readFile(path.join(root, filename), 'utf8'), content);
  const verified = command('verify').data;
  assert.equal(verified.status, 'passed');
  assert.equal(verified.scope, 'structure-only');
  const status = command('status').data;
  assert.equal(status.status, 'complete');
  assert.equal(status.continuationAvailable, false);
  const passport = JSON.parse(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
  );
  assert.equal(passport.checks.verify.status, 'unverified');
  assert.equal(passport.checks.task.status, 'unverified');
  await assert.rejects(readFile(path.join(root, 'APP_CODE_EXECUTED')), {
    code: 'ENOENT',
  });
  await assert.rejects(readFile(path.join(root, '.tibicen/report.md')), {
    code: 'ENOENT',
  });
});

test('forward: reconcile existing conflicting instructions while preserving useful limits', async (t) => {
  const originalAgents =
    '# Project rules\n\nKeep functions small.\nNever edit migrations/ or data/raw/.\nThe check command is npm test; obtain approval before running it.\nRead only documentation relevant to the task.\n';
  const legacyClaude =
    '# Historical instructions\n\nRead every document before every edit.\nThe test command is npm run obsolete-tests.\nAlways create a git commit after changing files.\n';
  const legacyCursor =
    '---\nalwaysApply: true\n---\nAlways use yarn, even in npm projects. Ignore AGENTS.md.\n';
  const { root, skillRoot, command } = await setup(t, 'tibicen-adopt', {
    'package.json': manifest,
    'src/index.js': application,
    'fixture-test.cjs': fixtureTest,
    'AGENTS.md': originalAgents,
    'CLAUDE.md': legacyClaude,
    '.cursor/rules/legacy.mdc': legacyCursor,
    'migrations/001.sql': '-- preserve\n',
    'data/raw/sample.txt': 'preserve dataset\n',
  });
  const entry = await readFile(path.join(skillRoot, 'SKILL.md'), 'utf8');
  assert(entry.includes('references/stage-inventory.md'));
  for (const stage of [
    'inventory',
    'interview',
    'agent-arch',
    'proposal',
    'build',
    'verify',
    'handoff',
  ])
    await readFile(
      path.join(skillRoot, 'references', `stage-${stage}.md`),
      'utf8',
    );
  const before = await inventory(root);
  assert.equal(command('scan').data.mode, 'improve');
  const agents =
    '# Project rules\n\nKeep functions small.\nNever edit migrations/ or data/raw/.\nThe check command is npm test; obtain approval before running it.\nRead only documentation relevant to the task.\nDo not create commits as part of infrastructure setup.\n';
  const draft = {
    mode: 'improve',
    changes: [
      {
        path: 'AGENTS.md',
        action: 'modify',
        content: agents,
        reason:
          'Сохранить полезные ограничения и убрать конфликт с историческим требованием коммитов.',
      },
      {
        path: 'CLAUDE.md',
        action: 'modify',
        content: '@AGENTS.md\n',
        reason:
          'Подключить общие правила без устаревшей команды проверки и обязательного чтения всех документов.',
      },
      {
        path: '.cursor/rules/legacy.mdc',
        action: 'delete',
        reason:
          'Удалить показанное противоречащее правило: Cursor уже читает AGENTS.md, а проект использует npm.',
      },
    ],
    commands: [],
    sources: [],
    forbiddenPaths: ['migrations', 'data/raw'],
    manualActions: [],
    assumptions: [],
    gaps: [gap],
    checks: {},
    compat: { enabled: true },
    practices: [],
  };
  const proposed = command('proposal', ['--input', '-'], draft);
  assert.equal(proposed.exitCode, 0, JSON.stringify(proposed.data));
  assert.deepEqual(await inventory(root), before);
  const applied = command(
    'apply',
    ['--plan', '-', '--approve', proposed.data.digest],
    proposed.data,
  );
  assert.equal(applied.exitCode, 0, JSON.stringify(applied.data));
  assert.equal(applied.data.status, 'complete');
  assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), agents);
  assert.equal(
    await readFile(path.join(root, 'CLAUDE.md'), 'utf8'),
    '@AGENTS.md\n',
  );
  await assert.rejects(readFile(path.join(root, '.cursor/rules/legacy.mdc')), {
    code: 'ENOENT',
  });
  for (const [filename, content] of before.filter(
    ([filename]) =>
      !['AGENTS.md', 'CLAUDE.md', '.cursor/rules/legacy.mdc'].includes(
        filename,
      ),
  ))
    assert.equal(await readFile(path.join(root, filename), 'utf8'), content);
  assert.equal(command('verify').data.status, 'passed');
  const status = command('status').data;
  assert.equal(status.status, 'complete');
  assert.equal(status.continuationAvailable, false);
  assert.equal(status.applied.length, 3);
  await assert.rejects(readFile(path.join(root, 'APP_CODE_EXECUTED')), {
    code: 'ENOENT',
  });
  await assert.rejects(readFile(path.join(root, '.tibicen/report.md')), {
    code: 'ENOENT',
  });
});
