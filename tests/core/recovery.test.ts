import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  readFile,
  readdir,
  realpath,
  rm,
  stat,
  writeFile,
  chmod,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import type { Proposal } from '../../scripts/core/types.ts';

const baseline = {
  id: 'original-baseline',
  complete: true,
  runs: [{ id: 'test', exitCode: 1 }],
};
const original = '# Owner instructions\r\nKeep the application.  \r\n';
const desired = '# Updated instructions\r\nKeep the application.  \r\n';
const regression = { id: 'test', reason: 'known-new-regression' };

test('a changed mode after an unrecorded write requires a newly approved repair', async (t) => {
  const { root, home, execute } = await fixture(t);
  await chmod(path.join(root, 'AGENTS.md'), 0o755);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-file-write' });
  const id = (await getStatus(root)).state!.id;
  await chmod(path.join(root, 'AGENTS.md'), 0o700);
  assert.equal((await getStatus(root)).recovery!.files[0].state, 'ambiguous');
  await assert.rejects(
    applyPlan(root, plan, { home, resume: true, approvedDigest: plan.digest }),
    { code: 'tamper-suspect' },
  );
  const repair = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          fileMode: 0o755,
          reason: 'Restore the explicitly reviewed permission.',
        },
      ],
    },
    { home },
  );
  assert.equal(repair.proposal.changes.length, 1);
  const result = await applyPlan(root, repair, {
    home,
    resume: true,
    approvedDigest: repair.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.id, id);
  assert.equal(result.applied[0].path, 'AGENTS.md');
  assert.equal((await stat(path.join(root, 'AGENTS.md'))).mode & 0o777, 0o755);
});

test('legacy schema 3 without permission fields remains readable and resumable', async (t) => {
  const { root, home, execute } = await fixture(t);
  await chmod(path.join(root, 'AGENTS.md'), 0o755);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          reason: 'Legacy content-only update.',
        },
      ],
    },
    { home },
  );
  delete plan.proposal.changes[0].beforeMode;
  delete plan.proposal.changes[0].fileMode;
  plan.digest = digest(plan.proposal);
  await execute(plan, { point: 'after-file-write' });
  const status = await getStatus(root);
  assert.equal(status.state!.schema, 3);
  assert.equal(status.recovery!.files[0].afterMode, undefined);
  assert.equal(
    (
      await applyPlan(root, plan, {
        home,
        resume: true,
        approvedDigest: plan.digest,
      })
    ).status,
    'complete',
  );
  assert.equal((await stat(path.join(root, 'AGENTS.md'))).mode & 0o777, 0o755);
});

test('journal growth beyond the size limit preserves its last readable state and original session', async (t) => {
  const { root, home } = await fixture(t);
  const initial = await createProposal(root, { mode: 'improve' }, { home });
  await applyPlan(root, initial, { home, approvedDigest: initial.digest });
  const passport = await readFile(
    path.join(root, '.tibicen/manifest.yml'),
    'utf8',
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          reason: 'Apply before oversized observation.',
        },
      ],
    },
    { home },
  );
  await assert.rejects(
    applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      afterChange(_change, state) {
        state.attempts.push({
          number: 2,
          kind: 'infrastructure',
          outcome: 'incomplete',
          reason: 'x'.repeat(8 * 1024 * 1024),
        });
      },
    }),
    { code: 'invalid-data' },
  );
  const saved = await getStatus(root);
  assert.equal(saved.status, 'incomplete');
  assert.equal(saved.state!.originals['AGENTS.md'], original);
  assert.equal(saved.recovery!.files[0].state, 'matches-approved-result');
  assert.equal(
    await readFile(path.join(root, '.tibicen/manifest.yml'), 'utf8'),
    passport,
  );
  assert.equal(
    (await stat(path.join(root, '.tibicen/state/session.json'))).size <
      8 * 1024 * 1024,
    true,
  );
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
    resume: true,
  });
  assert.equal(result.status, 'complete');
  assert.equal(result.id, saved.state!.id);
});

async function fixture(t: TestContext, empty = false) {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-recovery-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home'),
    templates = path.join(base, 'templates');
  await Promise.all([mkdir(root), mkdir(home), mkdir(templates)]);
  if (!empty) {
    await writeFile(path.join(root, 'AGENTS.md'), original);
    await writeFile(path.join(root, 'app.ts'), 'Existing application\n');
    await mkdir(path.join(root, '.cursor/rules'), { recursive: true });
    await writeFile(path.join(root, '.cursor/rules/old.mdc'), 'Old rule\n');
  }
  const counter = path.join(base, 'baseline-count');
  const runner = path.join(base, 'runner.mjs');
  await writeFile(
    runner,
    `
import { readFile, writeFile } from 'node:fs/promises';
import { applyPlan } from ${JSON.stringify(new URL('../../scripts/core/apply.ts', import.meta.url).href)};
const config = JSON.parse(process.argv[2]);
const plan = JSON.parse(await readFile(config.planFile, 'utf8'));
const result = await applyPlan(config.root, plan, {
  home: config.home, approvedDigest: plan.digest, resume: config.resume === true,
  async beforeApply() {
    const count = await readFile(config.counter, 'utf8').catch(() => '0');
    await writeFile(config.counter, String(Number(count) + 1));
    return config.nullBaseline ? null : ${JSON.stringify(baseline)};
  },
  async verify(_plan, _session, execution) {
    if (config.journalCheck) {
      const command = plan.proposal.commands.find(command => command.kind === 'test');
      const result = await execution.runner(command, { root: config.root, approvedDigest: plan.digest });
      return { infrastructure: { kind: 'infrastructure', status: 'passed' }, verify: { kind: 'verify', status: 'unverified', reason: result.reason || 'comparison-required' } };
    }
    return { infrastructure: { kind: 'infrastructure', status: 'passed' }, verify: { kind: 'verify', status: 'unverified', reason: 'new-regression', newRegressions: [${JSON.stringify(regression)}] } };
  },
  checkpoint(point) { if (point === config.point) process.exit(73); },
});
process.stdout.write(JSON.stringify(result));
`,
  );
  const execute = async (
    plan: { proposal: Proposal; digest: string },
    options: {
      point?: string;
      resume?: boolean;
      nullBaseline?: boolean;
      journalCheck?: boolean;
    } = {},
  ) => {
    const planFile = path.join(base, 'approved-plan.json');
    await writeFile(planFile, JSON.stringify(plan));
    const result = spawnSync(
      process.execPath,
      [runner, JSON.stringify({ root, home, counter, planFile, ...options })],
      {
        encoding: 'utf8',
        timeout: 15000,
        env: {
          PATH: process.env.PATH,
          SystemRoot: process.env.SystemRoot,
          TMPDIR: process.env.TMPDIR,
          GIT_CONFIG_GLOBAL: path.join(base, 'absent-gitconfig'),
          GIT_CONFIG_NOSYSTEM: '1',
          GIT_TEMPLATE_DIR: templates,
        },
      },
    );
    assert(!result.error, result.error?.message);
    assert.equal(result.stderr, '', result.stderr);
    assert.equal(result.status, options.point ? 73 : 0, result.stdout);
    return result.stdout ? JSON.parse(result.stdout) : null;
  };
  return { root, home, base, counter, execute };
}

for (const action of ['add', 'modify', 'delete'] as const) {
  for (const point of ['before-file-write', 'after-file-write'] as const) {
    test(`hard exit ${point} recovers an approved ${action} without rewriting an already matching result`, async (t) => {
      const { root, home, execute, counter } = await fixture(t);
      const relative =
        action === 'add'
          ? 'CLAUDE.md'
          : action === 'delete'
            ? '.cursor/rules/old.mdc'
            : 'AGENTS.md';
      const input = {
        mode: 'improve',
        changes: [
          {
            path: relative,
            action,
            ...(action === 'delete' ? {} : { content: desired }),
            reason: 'Approved recovery fixture.',
          },
        ],
      };
      const plan = await createProposal(root, input, { home });
      await execute(plan, { point });
      const stateFile = path.join(root, '.tibicen/state/session.json');
      const bytes = await readFile(stateFile, 'utf8');
      const status = await getStatus(root);
      assert.equal(status.status, 'incomplete');
      assert.equal(status.state!.schema, 3);
      assert.deepEqual(status.state!.baseline, baseline);
      assert.deepEqual(
        status.state!.applied,
        [],
        'The process exited before the operation record was persisted.',
      );
      const fact = status.recovery!.files.find(
        (file) => file.path === relative,
      )!;
      assert.equal(
        fact.state,
        point === 'after-file-write' ? 'matches-approved-result' : 'pending',
      );
      assert.equal(
        await readFile(stateFile, 'utf8'),
        bytes,
        'Status must not repair saved state without consent.',
      );
      await assert.rejects(applyPlan(root, plan, { home, resume: true }), {
        code: 'consent-required',
      });
      assert.equal(await readFile(stateFile, 'utf8'), bytes);
      const identity = await stat(path.join(root, relative)).catch(() => null);
      let writes = 0;
      const result = await applyPlan(root, plan, {
        home,
        resume: true,
        approvedDigest: plan.digest,
        beforeApply: async () =>
          assert.fail(
            'A resumed session must not replace its original baseline.',
          ),
        checkpoint(stage) {
          if (stage === 'before-file-write') writes++;
        },
      });
      assert.equal(result.status, 'complete');
      assert.equal(result.id, status.state!.id);
      assert.equal(result.manifest!.sessions[0].attempts.length, 2);
      assert.equal(
        result.manifest!.sessions[0].attempts[0].outcome,
        'incomplete',
      );
      assert.equal(writes, point === 'after-file-write' ? 0 : 1);
      assert.equal(
        result.applied[0].evidence,
        point === 'after-file-write' ? 'matches-approved-result' : 'written',
      );
      if (action === 'delete')
        await assert.rejects(readFile(path.join(root, relative)), {
          code: 'ENOENT',
        });
      else {
        assert.equal(
          await readFile(path.join(root, relative), 'utf8'),
          desired,
        );
        if (point === 'after-file-write') {
          const after = await stat(path.join(root, relative));
          assert.equal(after.ino, identity!.ino);
          assert.equal(after.mtimeMs, identity!.mtimeMs);
        }
      }
      assert.equal(
        await readFile(path.join(root, 'app.ts'), 'utf8'),
        'Existing application\n',
      );
      assert.equal(await readFile(counter, 'utf8'), '1');
      assert.equal((await getStatus(root)).state, null);
    });
  }
}

for (const point of [
  'before-manifest-write',
  'after-manifest-write',
  'before-state-cleanup',
] as const) {
  test(`hard exit ${point} preserves the original session, history and known regressions`, async (t) => {
    const { root, home, execute, counter } = await fixture(t);
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: desired,
            reason: 'Clarify instructions.',
          },
        ],
      },
      { home },
    );
    await execute(plan, { point });
    const status = await getStatus(root),
      saved = status.state!;
    assert.equal(status.status, 'incomplete');
    assert.equal(
      status.recovery!.manifest,
      point === 'before-manifest-write'
        ? 'pending'
        : point === 'after-manifest-write'
          ? 'matches-approved-result'
          : 'unchanged',
    );
    assert.equal(saved.originals['AGENTS.md'], original);
    assert.deepEqual(saved.baseline, baseline);
    assert.equal(saved.attempts.length, 1);
    assert.deepEqual(saved.attempts[0].newRegressions, [regression]);
    const result = await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      resume: true,
      beforeApply: async () => assert.fail('Do not recapture the baseline.'),
      checkpoint(stage) {
        if (stage === 'before-file-write')
          assert.fail('Do not rewrite the applied file.');
      },
    });
    assert.equal(result.status, 'complete');
    assert.equal(result.id, saved.id);
    assert.equal(result.manifest!.sessions.length, 1);
    assert.equal(result.manifest!.sessions[0].attempts.length, 2);
    assert.deepEqual(result.manifest!.sessions[0].attempts[0].newRegressions, [
      regression,
    ]);
    assert.equal(result.checks.verify.reason, 'baseline-unavailable');
    assert.deepEqual(result.checks.verify.newRegressions, [regression]);
    assert.equal(await readFile(counter, 'utf8'), '1');
    const usage = JSON.parse(
      await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'),
    );
    assert.equal(usage.sessions.length, 1);
    assert.equal(usage.sessions[0].id, saved.id);
  });
}

test('an ambiguous file stops automatic resume; an explicitly approved repair keeps both original snapshots', async (t) => {
  const { root, home, execute } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-file-write' });
  const id = (await getStatus(root)).state!.id;
  await writeFile(path.join(root, 'AGENTS.md'), 'A concurrent user edit.\n');
  const before = await readFile(
    path.join(root, '.tibicen/state/session.json'),
    'utf8',
  );
  const status = await getStatus(root);
  assert.equal(status.recovery!.files[0].state, 'ambiguous');
  assert.deepEqual(status.observedApplied, []);
  await assert.rejects(
    applyPlan(root, plan, { home, resume: true, approvedDigest: plan.digest }),
    { code: 'tamper-suspect' },
  );
  assert.equal(
    await readFile(path.join(root, '.tibicen/state/session.json'), 'utf8'),
    before,
  );
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    'A concurrent user edit.\n',
  );
  const repair = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          reason: 'Explicitly reviewed repair of the concurrent edit.',
        },
      ],
    },
    { home },
  );
  await execute(repair, { resume: true, point: 'after-file-write' });
  const repaired = (await getStatus(root)).state!;
  assert.equal(repaired.id, id);
  assert.equal(repaired.originals['AGENTS.md'], original);
  assert.equal(
    repaired.planOriginals['AGENTS.md'],
    'A concurrent user edit.\n',
  );
  const finished = await applyPlan(root, repair, {
    home,
    resume: true,
    approvedDigest: repair.digest,
  });
  assert.equal(finished.status, 'complete');
  assert.equal(finished.id, id);
});

test('a matching file without a result record does not prove that this process wrote it', async (t) => {
  const { root, home, execute } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'before-file-write' });
  await writeFile(path.join(root, 'AGENTS.md'), desired);
  const status = await getStatus(root);
  assert.equal(status.observedApplied[0].evidence, 'matches-approved-result');
  const result = await applyPlan(root, plan, {
    home,
    resume: true,
    approvedDigest: plan.digest,
  });
  assert.equal(result.applied[0].evidence, 'matches-approved-result');
  assert.equal(result.manifest!.changes[0].evidence, 'matches-approved-result');
});

test('a missing retained baseline never causes resume to capture the already changed project', async (t) => {
  const { root, home, execute, counter } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
      commands: [
        {
          id: 'check',
          kind: 'test',
          executable: process.execPath,
          argv: ['app.ts'],
          trusted: true,
        },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-file-write', nullBaseline: true });
  const hooks = runtimeHooks(root, plan.proposal, plan.digest);
  try {
    const result = await applyPlan(root, plan, {
      home,
      resume: true,
      approvedDigest: plan.digest,
      beforeApply: hooks.beforeApply,
      verify: hooks.verify,
    });
    assert.equal(result.checks.verify.status, 'unverified');
    assert.equal(result.checks.verify.reason, 'baseline-unavailable');
  } finally {
    await hooks.cleanup();
  }
  assert.equal(await readFile(counter, 'utf8'), '1');
});

test('an unknown command requires a separately justified retry, regardless of matching files', async (t) => {
  const { root, home, execute } = await fixture(t, true);
  const command = {
    id: 'initialize-git',
    kind: 'git-init',
    executable: 'git',
    argv: ['init'],
    cwd: '.',
    envNames: ['GIT_CONFIG_GLOBAL', 'GIT_CONFIG_NOSYSTEM', 'GIT_TEMPLATE_DIR'],
    trusted: true,
  };
  const plan = await createProposal(
    root,
    {
      mode: 'init',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          reason: 'Initial instructions.',
        },
      ],
      commands: [command],
    },
    { home },
  );
  await execute(plan, { point: 'after-command' });
  const status = await getStatus(root);
  assert.equal(status.recovery!.files[0].state, 'matches-approved-result');
  assert.equal(status.recovery!.unknownCommands[0].id, command.id);
  assert.deepEqual(status.state!.completedCommands, []);
  assert(
    (await readdir(root)).includes('.git'),
    'The real command finished, but its outcome was not recorded.',
  );
  await assert.rejects(
    applyPlan(root, plan, { home, resume: true, approvedDigest: plan.digest }),
    { code: 'command-outcome-unknown' },
  );
  const omitted = await createProposal(root, { mode: 'init' }, { home });
  await assert.rejects(
    applyPlan(root, omitted, {
      home,
      resume: true,
      approvedDigest: omitted.digest,
    }),
    { code: 'command-outcome-unknown' },
  );
  const retry = await createProposal(
    root,
    {
      mode: 'init',
      commands: [command],
      retryCommands: [
        {
          id: command.id,
          commandDigest: digest(command),
          reason:
            'Reviewed unknown outcome; rerun the same idempotent git init command.',
        },
      ],
    },
    { home },
  );
  assert.notEqual(retry.digest, plan.digest);
  await assert.rejects(
    applyPlan(root, retry, { home, resume: true, approvedDigest: plan.digest }),
    { code: 'consent-required' },
  );
  const result = await execute(retry, {
    resume: true,
    point: 'before-state-cleanup',
  });
  assert.equal(result, null);
  const retried = await getStatus(root);
  assert.deepEqual(retried.recovery!.unknownCommands, []);
  assert.deepEqual(
    retried.state!.commandAttempts.map((attempt) => attempt.status),
    ['unknown', 'completed'],
  );
  assert(retried.state!.commandAttempts[1].retryReason!.includes('idempotent'));
  const finished = await execute(retry, { resume: true });
  assert.equal(finished.status, 'complete');
  assert.equal(finished.id, status.state!.id);
  assert.deepEqual(
    finished.manifest.sessions[0].commandAttempts.map(
      (attempt: { status: string }) => attempt.status,
    ),
    ['unknown', 'completed'],
  );
});

for (const schema of [1, 2, 4, 999]) {
  test(`saved state schema ${schema} refuses migration or restart without changing its data`, async (t) => {
    const { root, home, execute } = await fixture(t);
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: desired,
            reason: 'Update instructions.',
          },
        ],
      },
      { home },
    );
    await execute(plan, { point: 'before-file-write' });
    const filename = path.join(root, '.tibicen/state/session.json');
    const state = JSON.parse(await readFile(filename, 'utf8'));
    state.schema = schema;
    const bytes = JSON.stringify(state);
    await writeFile(filename, bytes);
    await assert.rejects(
      applyPlan(root, plan, {
        home,
        resume: true,
        approvedDigest: plan.digest,
      }),
      { code: 'unsupported-state-schema' },
    );
    assert.equal(await readFile(filename, 'utf8'), bytes);
    assert.equal(
      await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
      original,
    );
    assert.deepEqual(await readdir(home), []);
  });
}

test('a passport outside both write-intent states stops resume without overwriting foreign history', async (t) => {
  const { root, home, execute } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-manifest-write' });
  const filename = path.join(root, '.tibicen/manifest.yml');
  const manifest = JSON.parse(await readFile(filename, 'utf8'));
  manifest.sessions.push({ id: 'foreign-session' });
  const bytes = JSON.stringify(manifest);
  await writeFile(filename, bytes);
  assert.equal((await getStatus(root)).recovery!.manifest, 'ambiguous');
  await assert.rejects(
    applyPlan(root, plan, { home, resume: true, approvedDigest: plan.digest }),
    { code: 'tamper-suspect' },
  );
  assert.equal(await readFile(filename, 'utf8'), bytes);
});

test('recovery of an owned component uses current-plan originals and retains its upstream hash', async (t) => {
  const { root, home, execute } = await fixture(t);
  const relative = '.agents/skills/example/SKILL.md';
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, relative), original);
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify({
      schema: 2,
      installed: [
        {
          repo: 'owner/example',
          sha: 'a'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: relative,
              sourcePath: 'SKILL.md',
              contentHash: hashContent(original),
              installedHash: hashContent(original),
            },
          ],
        },
      ],
      sessions: [],
    }),
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: relative,
          content: desired,
          reason: 'Approved local adaptation.',
        },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-file-write' });
  const result = await applyPlan(root, plan, {
    home,
    resume: true,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(
    result.manifest!.installed[0].files![0].contentHash,
    hashContent(original),
  );
  assert.equal(
    result.manifest!.installed[0].files![0].installedHash,
    hashContent(desired),
  );
});

test('a known completed setup command is not executed again after a passport interruption', async (t) => {
  const { root, home, execute } = await fixture(t, true);
  const command = {
    id: 'initialize-git',
    kind: 'git-init',
    executable: 'git',
    argv: ['init'],
    cwd: '.',
    envNames: ['GIT_CONFIG_GLOBAL', 'GIT_CONFIG_NOSYSTEM', 'GIT_TEMPLATE_DIR'],
    trusted: true,
  };
  const plan = await createProposal(
    root,
    {
      mode: 'init',
      changes: [
        {
          path: 'AGENTS.md',
          content: desired,
          reason: 'Initial instructions.',
        },
      ],
      commands: [command],
    },
    { home },
  );
  await execute(plan, { point: 'after-manifest-write' });
  const status = await getStatus(root);
  assert.deepEqual(status.recovery!.unknownCommands, []);
  assert.equal(status.state!.commandAttempts.length, 1);
  const finished = await execute(plan, { resume: true });
  assert.equal(finished.status, 'complete');
  assert.equal(finished.manifest.sessions[0].commandAttempts.length, 1);
});

test('optional check executions use the same journal and do not repeat an unknown outcome without justification', async (t) => {
  const { root, home, base, execute } = await fixture(t);
  const script = path.join(base, 'trusted-check.cjs'),
    count = path.join(base, 'check-count');
  await writeFile(
    script,
    `const fs = require('node:fs'); const file = ${JSON.stringify(count)}; fs.writeFileSync(file, String(Number(fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : 0) + 1));`,
  );
  const command = {
    id: 'test',
    kind: 'test',
    executable: process.execPath,
    argv: [script],
    cwd: '.',
    envNames: [],
    trusted: true,
  };
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      commands: [command],
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-command', journalCheck: true });
  assert.equal(
    (await getStatus(root)).recovery!.unknownCommands[0].kind,
    'test',
  );
  const skipped = await applyPlan(root, plan, {
    home,
    resume: true,
    approvedDigest: plan.digest,
    async verify(_plan, _session, execution) {
      const result = await execution!.runner(command, {
        root,
        approvedDigest: plan.digest,
      });
      assert.equal(result.reason, 'command-outcome-unknown');
      return {
        infrastructure: { kind: 'infrastructure', status: 'issues-found' },
        verify: { kind: 'verify', status: 'unverified', reason: result.reason },
      };
    },
  });
  assert.equal(skipped.status, 'incomplete');
  assert.equal(await readFile(count, 'utf8'), '1');
  const retry = await createProposal(
    root,
    {
      mode: 'improve',
      commands: [command],
      retryCommands: [
        {
          id: command.id,
          commandDigest: digest(command),
          reason: 'Review completed; explicitly repeat this isolated check.',
        },
      ],
    },
    { home },
  );
  const finished = await execute(retry, { resume: true, journalCheck: true });
  assert.equal(finished.status, 'complete');
  assert.equal(await readFile(count, 'utf8'), '2');
  assert.deepEqual(
    finished.manifest.sessions[0].commandAttempts.map(
      (attempt: { status: string }) => attempt.status,
    ),
    ['unknown', 'completed'],
  );
});

for (const point of [
  'before-manifest-write',
  'after-manifest-write',
  'before-state-cleanup',
] as const)
  test(`a recoverable ${point} error keeps one failed attempt and resumes without replacing the baseline`, async (t) => {
    const { root, home } = await fixture(t);
    const plan = await createProposal(
      root,
      {
        mode: 'improve',
        changes: [
          {
            path: 'AGENTS.md',
            content: desired,
            reason: 'Update instructions.',
          },
        ],
      },
      { home },
    );
    let fail = true;
    const failed = await applyPlan(root, plan, {
      home,
      approvedDigest: plan.digest,
      beforeApply: async () => baseline,
      checkpoint(current) {
        if (current === point && fail) {
          fail = false;
          throw Object.assign(new Error('Write failed'), { code: 'EIO' });
        }
      },
    });
    assert.equal(failed.status, 'incomplete');
    assert.equal(failed.reason, 'EIO');
    const interrupted = await getStatus(root);
    assert.equal(interrupted.state!.attempts.length, 1);
    assert.deepEqual(interrupted.state!.baseline, baseline);
    assert.deepEqual(
      JSON.parse(await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'))
        .sessions,
      [
        {
          id: failed.id,
          project: hashContent(root),
          mode: 'improve',
          status: 'incomplete',
        },
      ],
    );
    const finished = await applyPlan(root, plan, {
      home,
      resume: true,
      approvedDigest: plan.digest,
      beforeApply: async () => assert.fail('Never replace the baseline.'),
    });
    assert.equal(finished.status, 'complete');
    assert.equal(finished.id, failed.id);
    assert.deepEqual(
      JSON.parse(await readFile(path.join(home, '.tibicen/usage.json'), 'utf8'))
        .sessions,
      [
        {
          id: failed.id,
          project: hashContent(root),
          mode: 'improve',
          status: 'complete',
        },
      ],
    );
    assert.deepEqual(
      finished.manifest!.sessions[0].attempts.map((attempt) => attempt.outcome),
      ['incomplete', 'passed'],
    );
  });

test('a corrupted passport intent or missing original refuses recovery before any write', async (t) => {
  const { root, home, execute } = await fixture(t);
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'Update instructions.' },
      ],
    },
    { home },
  );
  await execute(plan, { point: 'after-manifest-write' });
  const filename = path.join(root, '.tibicen/state/session.json');
  const good = JSON.parse(await readFile(filename, 'utf8'));
  for (const corrupt of ['intent', 'original']) {
    const state = structuredClone(good);
    if (corrupt === 'intent') state.pendingManifest.content = '{}';
    else delete state.planOriginals['AGENTS.md'];
    const bytes = JSON.stringify(state);
    await writeFile(filename, bytes);
    await assert.rejects(
      applyPlan(root, plan, {
        home,
        resume: true,
        approvedDigest: plan.digest,
      }),
      { code: 'tamper-suspect' },
    );
    assert.equal(await readFile(filename, 'utf8'), bytes);
    assert.equal(await readFile(path.join(root, 'AGENTS.md'), 'utf8'), desired);
  }
});

test('a newly approved remaining plan preserves earlier operations and component provenance in the same session', async (t) => {
  const { root, home, execute } = await fixture(t);
  const relative = '.agents/skills/example/SKILL.md';
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, relative), original);
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify({
      schema: 1,
      installed: [
        {
          repo: 'owner/example',
          sha: 'a'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: relative,
              sourcePath: 'SKILL.md',
              contentHash: hashContent(original),
            },
          ],
        },
      ],
      sessions: [],
    }),
  );
  const firstPlan = await createProposal(
    root,
    {
      mode: 'improve',
      migrateManifest: true,
      changes: [
        {
          path: relative,
          content: 'Step one\n',
          reason: 'First approved adaptation.',
        },
      ],
    },
    { home },
  );
  const first = await applyPlan(root, firstPlan, {
    home,
    approvedDigest: firstPlan.digest,
    beforeApply: async () => baseline,
    afterChange() {
      throw new Error('Interrupted');
    },
  });
  const secondPlan = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: relative,
          content: 'Step two\n',
          reason: 'Separately approved adaptation.',
        },
      ],
    },
    { home },
  );
  await execute(secondPlan, { resume: true, point: 'after-manifest-write' });
  const saved = (await getStatus(root)).state!;
  assert.equal(saved.originals[relative], original);
  assert.equal(saved.planOriginals[relative], 'Step one\n');
  const final = await applyPlan(root, secondPlan, {
    home,
    resume: true,
    approvedDigest: secondPlan.digest,
  });
  assert.equal(final.id, first.id);
  const history = final.manifest!.sessions[0];
  assert.deepEqual(history.manifestMigration, { from: 1, to: 2 });
  assert.equal(history.attempts.length, 3);
  assert.equal(history.components!.length, 2);
  assert.equal(history.changes!.length, 2);
  assert.equal(
    history.components![0].next!.installedHash,
    hashContent('Step one\n'),
  );
  assert.equal(
    history.components![1].next!.installedHash,
    hashContent('Step two\n'),
  );
});

test('a new plan retains an unrecorded earlier operation and provenance across another hard exit', async (t) => {
  const { root, home, execute } = await fixture(t);
  const relative = '.agents/skills/example/SKILL.md';
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await mkdir(path.join(root, '.tibicen'));
  await writeFile(path.join(root, relative), original);
  await writeFile(
    path.join(root, '.tibicen/manifest.yml'),
    JSON.stringify({
      schema: 1,
      installed: [
        {
          repo: 'owner/example',
          sha: 'a'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: relative,
              sourcePath: 'SKILL.md',
              contentHash: hashContent(original),
            },
          ],
        },
      ],
      sessions: [],
    }),
  );
  const first = await createProposal(
    root,
    {
      mode: 'improve',
      migrateManifest: true,
      changes: [
        {
          path: relative,
          content: 'Step one\n',
          reason: 'First approved edit.',
        },
      ],
    },
    { home },
  );
  await execute(first, { point: 'after-file-write' });
  const initial = (await getStatus(root)).state!;
  assert.deepEqual(initial.applied, []);
  const next = await createProposal(
    root,
    {
      mode: 'improve',
      migrateManifest: true,
      changes: [
        {
          path: relative,
          content: 'Step two\n',
          reason: 'Separately approved second edit.',
        },
      ],
    },
    { home },
  );
  await execute(next, { resume: true, point: 'after-file-write' });
  const final = await applyPlan(root, next, {
    home,
    resume: true,
    approvedDigest: next.digest,
  });
  assert.equal(final.id, initial.id);
  const history = final.manifest!.sessions[0];
  assert.deepEqual(history.manifestMigration, { from: 1, to: 2 });
  assert.equal(history.attempts.length, 3);
  assert.deepEqual(
    history.changes!.map((change) => change.afterHash),
    [hashContent('Step one\n'), hashContent('Step two\n')],
  );
  assert(
    history.changes!.every(
      (change) => change.evidence === 'matches-approved-result',
    ),
  );
  assert.deepEqual(
    history.components!.map((file) => file.next!.installedHash),
    [hashContent('Step one\n'), hashContent('Step two\n')],
  );
});

test('a remaining plan keeps already matching files in its applied scope even when it omits their edits', async (t) => {
  const { root, home, execute } = await fixture(t);
  const first = await createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        { path: 'AGENTS.md', content: desired, reason: 'First approved edit.' },
      ],
    },
    { home },
  );
  await execute(first, { point: 'after-file-write' });
  const remaining = await createProposal(root, { mode: 'improve' }, { home });
  const final = await applyPlan(root, remaining, {
    home,
    resume: true,
    approvedDigest: remaining.digest,
  });
  assert.equal(final.status, 'complete');
  assert.deepEqual(final.applied, [
    {
      path: 'AGENTS.md',
      action: 'modify',
      evidence: 'matches-approved-result',
    },
  ]);
  assert.equal(final.manifest!.sessions[0].changes!.length, 1);
  assert.equal(final.manifest!.changes![0].afterHash, hashContent(desired));
});
