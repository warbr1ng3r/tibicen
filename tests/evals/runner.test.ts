import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { digest } from '../../scripts/core/contracts.ts';
import {
  loadDiagnostic,
  materializeScenario,
} from '../../scripts/evals/fixtures.ts';
import { runProcessAttempt } from '../../scripts/evals/runner.ts';
import type { ProcessRunInput } from '../../scripts/evals/runner.ts';
import { summarizeAttempts } from '../../scripts/evals/results.ts';
import type { Experiment } from '../../scripts/evals/contracts.ts';
import {
  observationGuard,
  saveObservedRun,
} from '../../scripts/evals/observations.ts';
import { stat, symlink } from 'node:fs/promises';

const posix = {
  skip:
    process.platform === 'win32' ? 'POSIX process-group driver only' : false,
};

test(
  'storage and host observations keep detached validated data across async work',
  posix,
  async (t) => {
    const { input, root, parent } = await fixture(t);
    const checkpoint = { point: 'end', complete: true, files: [] } as const;
    input.afterStage = async (_, observe) => {
      observe('checkpoint', checkpoint);
    };
    const run = await runProcessAttempt(input);
    Object.assign(checkpoint, { complete: false });
    assert(
      run.events
        .filter((event) => event.kind === 'checkpoint')
        .every((event) => event.data.complete),
    );
    const secret = 'synthetic-review-value',
      originalId = run.result.id;
    const pending = saveObservedRun(
      path.join(parent, 'observations'),
      root,
      run,
      [secret],
    );
    run.result.id = 'changed-attempt';
    run.events.find((event) => event.kind === 'checkpoint')!.attemptId = secret;
    const saved = await pending;
    const content = await readFile(saved.path, 'utf8');
    assert.equal(path.basename(saved.path), originalId + '.json');
    assert(!content.includes(secret));
    assert.equal(JSON.parse(content).result.id, originalId);
  },
);

test('the sensitive-value registry cannot be cleared after guard creation', () => {
  const values = ['synthetic-review-value'],
    guard = observationGuard(values);
  values.length = 0;
  assert.throws(() => guard({ reason: 'synthetic-review-value' }), {
    code: 'unsafe-eval-observation',
  });
});

test(
  'observation storage retains only linked safe records and refuses replacement or executor paths',
  posix,
  async (t) => {
    const { input, root, parent } = await fixture(t);
    const run = await runProcessAttempt(input);
    const directory = path.join(parent, 'observations');
    const saved = await saveObservedRun(directory, root, run);
    const text = await readFile(saved.path, 'utf8');
    assert.equal((await stat(saved.path)).mode & 0o777, 0o600);
    assert.equal(JSON.parse(text).experimentHash, digest(input.experiment));
    assert.equal(JSON.parse(text).result.id, input.attemptId);
    for (const field of [
      'oracle',
      'prompt',
      'argv',
      'env',
      'stdout',
      'stderr',
      'replies',
    ])
      assert(!text.includes(`"${field}"`));
    await assert.rejects(saveObservedRun(directory, root, run), {
      code: 'eval-attempt-exists',
    });
    assert.equal(await readFile(saved.path, 'utf8'), text);
    await assert.rejects(
      saveObservedRun(path.join(root, 'observations'), root, run),
      { code: 'invalid-eval-storage' },
    );
    await symlink(root, path.join(parent, 'alias'));
    await assert.rejects(
      saveObservedRun(path.join(parent, 'alias/new'), root, run),
      { code: 'invalid-eval-storage' },
    );
    await assert.rejects(readFile(path.join(root, 'new')), { code: 'ENOENT' });
    const wrong = structuredClone(run);
    wrong.events[0].attemptId = 'another-attempt';
    await assert.rejects(
      saveObservedRun(path.join(parent, 'wrong'), root, wrong),
      { code: 'invalid-eval-contract' },
    );
    const simultaneous = await Promise.allSettled([
      saveObservedRun(path.join(parent, 'concurrent'), root, run),
      saveObservedRun(path.join(parent, 'concurrent'), root, run),
    ]);
    assert.equal(
      simultaneous.filter((result) => result.status === 'fulfilled').length,
      1,
    );
    assert.deepEqual(await readdir(path.join(parent, 'concurrent')), [
      'attempt-0.json',
    ]);
  },
);

test(
  'synthetic authorization stays outside argv, project code, context and saved observations',
  posix,
  async (t) => {
    const secret = 'synthetic-auth-value-123';
    const { input, probes, root, parent } = await fixture(t, 'auth-probe');
    const previous = process.env.TIBICEN_TEST_AUTH_TOKEN;
    process.env.TIBICEN_TEST_AUTH_TOKEN = secret;
    t.after(() => {
      if (previous === undefined) delete process.env.TIBICEN_TEST_AUTH_TOKEN;
      else process.env.TIBICEN_TEST_AUTH_TOKEN = previous;
    });
    input.sensitiveValues = [secret];
    const run = await runProcessAttempt(input);
    const saved = await saveObservedRun(
      path.join(parent, 'observations'),
      root,
      run,
      [secret],
    );
    assert.equal(run.result.task.status, 'pass');
    for (const phase of ['setup', 'task'])
      for (const probe of ['input', 'project'])
        assert(
          !(
            await readFile(
              path.join(probes, phase + '.' + probe + '.json'),
              'utf8',
            )
          ).includes(secret),
        );
    assert(!(await readFile(saved.path, 'utf8')).includes(secret));
    const unsafe = { ...input, scenario: structuredClone(input.scenario) };
    unsafe.scenario.setup.prompt += secret;
    await assert.rejects(runProcessAttempt(unsafe), {
      code: 'unsafe-eval-observation',
    });
    const command = input.profile.command;
    input.profile.command = (stage) => ({ ...command(stage), argv: [secret] });
    assert.equal(
      (await runProcessAttempt(input)).result.launch.status,
      'error',
    );
    input.profile.command = (stage) => ({
      ...command(stage),
      env: { API_TOKEN: 'unknown-credential-value' },
    });
    assert.equal(
      (await runProcessAttempt(input)).result.launch.status,
      'error',
    );
    const raw = await fixture(t, 'secret-output');
    raw.input.sensitiveValues = [secret];
    const rejected = await runProcessAttempt(raw.input);
    assert.equal(rejected.result.setup.reason, 'invalid-output');
    const rejectedRecord = await saveObservedRun(
      path.join(raw.parent, 'observations'),
      raw.root,
      rejected,
      [secret],
    );
    assert(!(await readFile(rejectedRecord.path, 'utf8')).includes(secret));
    // Refuse forbidden values even in syntactically valid reason codes.
    const unsafeRun = await runProcessAttempt(
      (await fixture(t, 'auth-before')).input,
    );
    unsafeRun.result.launch.reason = secret;
    const finish = unsafeRun.events.find(
      (event) => event.kind === 'stage-finished',
    )!;
    if (finish.kind === 'stage-finished') finish.data = unsafeRun.result.launch;
    await assert.rejects(
      saveObservedRun(path.join(parent, 'unsafe'), root, unsafeRun, [secret]),
      { code: 'unsafe-eval-observation' },
    );
  },
);
async function fixture(t: TestContext, mode = 'pass') {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-runner-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const probes = path.join(parent, 'probes');
  await mkdir(probes);
  const { scenario } = await loadDiagnostic('diagnostic-bare');
  const { root } = await materializeScenario(scenario, parent);
  const specification = {
    id: 'offline-node',
    agent: 'stub',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: digest({ env: {} }),
    permissionsHash: digest('controlled-test-process'),
  };
  const experiment: Experiment = {
    schema: 1,
    id: 'offline-experiment',
    sourceSha: 'b'.repeat(40),
    conditionsHash: digest('offline-self-test'),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [specification],
    repeats: 1,
    limits: { launchMs: 3000, setupMs: 3000, taskMs: 3000, maxCostUsd: null },
    order: ['tibicen', 'baseline'].map((variant, i) => ({
      id: 'attempt-' + i,
      scenarioId: scenario.id,
      profileId: specification.id,
      variant: variant as 'tibicen' | 'baseline',
      repeat: 1,
    })),
  };
  const input: ProcessRunInput = {
    experiment,
    scenario,
    attemptId: 'attempt-0',
    profile: {
      specification,
      async preflight() {
        return {
          status: 'ready',
          startupControlled: true,
          authProtected: true,
          processTreeControlled: true,
          isolation: 'controlled',
        };
      },
      command(stage) {
        return {
          executable: process.execPath,
          argv: [
            fileURLToPath(
              new URL('./helpers/process-driver.mjs', import.meta.url),
            ),
            mode,
            stage,
            probes,
          ],
          cwd: root,
          env: {},
        };
      },
    },
  };
  return { input, probes, root, parent };
}
async function waitFile(filename: string) {
  for (let i = 0; i < 200; i++) {
    try {
      return await readFile(filename, 'utf8');
    } catch {
      await delay(10);
    }
  }
  throw new Error('Expected driver probe was not written.');
}
function running(pid: number) {
  try {
    process.kill(pid, 0);
  } catch {
    return false;
  }
  const state = spawnSync('ps', ['-o', 'stat=', '-p', String(pid)], {
    encoding: 'utf8',
  });
  return !state.stdout.trim().startsWith('Z');
}
async function assertTreeStopped(probes: string) {
  for (const name of ['leaf', 'grandchild']) {
    const pid = Number(await waitFile(path.join(probes, name + '.pid')));
    for (let i = 0; i < 100 && running(pid); i++) await delay(10);
    assert(!running(pid), `${name} is still executing after runner returned`);
    const before = await readFile(
      path.join(probes, name + '.heartbeat'),
      'utf8',
    ).catch(() => null);
    await delay(50);
    assert.equal(
      await readFile(path.join(probes, name + '.heartbeat'), 'utf8').catch(
        () => null,
      ),
      before,
    );
  }
}

test(
  'observed startup and fresh sessions bind Tibicen/baseline attempts to frozen metadata',
  posix,
  async (t) => {
    const f = await fixture(t);
    const first = await runProcessAttempt(f.input);
    assert.deepEqual(
      [
        first.result.launch.status,
        first.result.setup.status,
        first.result.task.status,
      ],
      ['pass', 'pass', 'pass'],
    );
    assert(first.result.started);
    assert.equal(
      first.events.filter((event) => event.kind === 'scenario-started').length,
      1,
    );
    assert.notEqual(
      await readFile(path.join(f.probes, 'setup.pid'), 'utf8'),
      await readFile(path.join(f.probes, 'task.pid'), 'utf8'),
    );
    for (const phase of ['setup', 'task']) {
      const raw = await readFile(
        path.join(f.probes, phase + '.input.json'),
        'utf8',
      );
      assert(!raw.includes('oracle'));
      for (const staged of [
        ...f.input.scenario.setup.replies,
        ...f.input.scenario.task.replies,
      ])
        assert(!raw.includes(staged.text));
      const message = JSON.parse(raw);
      assert.equal(message.stage, phase);
      assert.deepEqual(
        message.scenario.allowedPaths,
        f.input.scenario[phase as 'setup' | 'task'].allowedPaths,
      );
      assert(
        !raw.includes(
          phase === 'setup'
            ? f.input.scenario.task.prompt
            : f.input.scenario.setup.prompt,
        ),
      );
    }
    const independent = await fixture(t);
    const second = await runProcessAttempt({
      ...independent.input,
      attemptId: 'attempt-1',
    });
    assert.equal(second.result.variant, 'baseline');
    assert.equal(
      summarizeAttempts([first.result, second.result]).endToEndSuccess.rate,
      1,
    );
  },
);

for (const [mode, setup, task, started] of [
  ['fail', 'fail', 'skip', true],
  ['skip', 'skip', 'skip', true],
  ['task-fail', 'pass', 'fail', true],
  ['bad-before', 'skip', 'skip', false],
  ['bad-after', 'error', 'skip', true],
  ['auth-before', 'skip', 'skip', false],
  ['auth-task', 'pass', 'error', true],
  ['exit-before', 'skip', 'skip', false],
  ['exit-after-pass', 'error', 'skip', true],
  ['truncated', 'error', 'skip', true],
  ['oversized', 'error', 'skip', true],
  ['empty-exit', 'skip', 'skip', false],
  ['no-finish', 'error', 'skip', true],
  ['duplicate-ready', 'error', 'skip', true],
  ['bad-observation', 'error', 'skip', true],
  ['after-finish', 'error', 'skip', true],
] as const)
  test('runner retains outcomes for ' + mode, posix, async (t) => {
    const { input } = await fixture(t, mode);
    const run = await runProcessAttempt(input);
    assert.equal(run.result.started, started);
    assert.equal(run.result.setup.status, setup);
    assert.equal(run.result.task.status, task);
    if (!started) assert.equal(run.result.launch.status, 'error');
    assert(!JSON.stringify(run.events).includes('{invalid'));
    assert(!JSON.stringify(run).includes('synthetic-raw-value'));
    if (mode.startsWith('auth'))
      assert.equal(
        mode === 'auth-before'
          ? run.result.launch.reason
          : run.result.task.reason,
        'auth-unavailable',
      );
  });

test(
  'allowed structured observations retain unknown usage and receive host identity/order',
  posix,
  async (t) => {
    const { input } = await fixture(t, 'observations');
    const run = await runProcessAttempt(input);
    const usage = run.events.filter((event) => event.kind === 'usage');
    assert.equal(usage.length, 2);
    assert.deepEqual(
      usage.map((event) => event.stage),
      ['setup', 'task'],
    );
    for (const event of usage) {
      assert.deepEqual(event.data, {
        costUsd: null,
        inputTokens: null,
        outputTokens: null,
      });
      assert.equal(event.attemptId, input.attemptId);
      assert.equal(event.experimentId, input.experiment.id);
      assert.equal(run.events[event.seq], event);
    }
  },
);

for (const mode of ['silent', 'setup-timeout', 'task-timeout', 'finished-hang'])
  test('bounded execution handles ' + mode, posix, async (t) => {
    const { input } = await fixture(t, mode);
    if (mode === 'silent') input.experiment.limits.launchMs = 150;
    else if (mode === 'task-timeout') input.experiment.limits.taskMs = 150;
    else input.experiment.limits.setupMs = 150;
    const run = await runProcessAttempt(input);
    assert.equal(run.result.started, mode !== 'silent');
    const stage =
      mode === 'silent'
        ? run.result.launch
        : mode === 'task-timeout'
          ? run.result.task
          : run.result.setup;
    assert.equal(stage.status, 'error');
    assert.match(stage.reason!, /timeout/);
    if (mode === 'task-timeout') {
      assert.equal(run.result.setup.status, 'pass');
      assert.equal(summarizeAttempts([run.result]).setupSuccess.rate, 1);
      assert.equal(summarizeAttempts([run.result]).endToEndSuccess.rate, 0);
    }
  });

test(
  'blocked and invalid preflight, deadlines and cancellation cannot spawn a scenario',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t);
    input.profile.command = () => {
      throw new Error('must not launch');
    };
    input.profile.preflight = async () => ({
      status: 'blocked',
      startupControlled: false,
      authProtected: true,
      processTreeControlled: true,
      isolation: 'controlled',
      reason: 'startup-uncontrolled',
    });
    assert.equal((await runProcessAttempt(input)).result.launch.status, 'skip');
    input.profile.preflight = async () => {
      throw new Error('raw native auth detail');
    };
    assert.equal(
      (await runProcessAttempt(input)).result.launch.reason,
      'preflight-unavailable',
    );
    input.experiment.limits.launchMs = 30;
    input.profile.preflight = () => new Promise(() => {});
    assert.equal(
      (await runProcessAttempt(input)).result.launch.reason,
      'preflight-timeout',
    );
    const controller = new AbortController();
    input.signal = controller.signal;
    const cancelled = runProcessAttempt(input);
    controller.abort();
    assert.equal((await cancelled).result.launch.reason, 'aborted');
    assert.deepEqual(await readdir(probes), []);
  },
);

test(
  'non-Error preflight rejections retain an unstarted attempt without leaking details',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t);
    input.profile.command = () => {
      throw new Error('must not launch');
    };
    for (const rejected of [
      null,
      undefined,
      'synthetic-secret-detail',
      { reason: 'synthetic-secret-detail' },
    ]) {
      input.profile.preflight = async () => {
        throw rejected;
      };
      const run = await runProcessAttempt(input);
      assert.equal(run.result.started, false);
      assert.equal(run.result.launch.status, 'error');
      assert.equal(run.result.launch.reason, 'preflight-unavailable');
      assert.equal(run.result.setup.status, 'skip');
      assert.equal(run.result.task.status, 'skip');
      assert.equal(run.events.length, 1);
      assert(!JSON.stringify(run).includes('synthetic-secret-detail'));
    }
    assert.deepEqual(await readdir(probes), []);
  },
);

test(
  'a fixture reply never grants consent without exact host review',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t, 'reply');
    const noReview = await runProcessAttempt(input);
    assert.equal(noReview.result.setup.status, 'fail');
    assert.equal(
      JSON.parse(await readFile(path.join(probes, 'setup.reply.json'), 'utf8'))
        .data,
      null,
    );
    const seen: string[] = [];
    input.reviewReply = async (request, scripted) => {
      seen.push(request.stage);
      assert.equal(request.proposalDigest, 'c'.repeat(64));
      assert.equal(
        scripted,
        input.scenario[request.stage].replies.find(
          (item) => item.when === 'proposal',
        )!.text,
      );
      return {
        text: 'Reviewed and approved in this controlled test.',
        approvedDigest: request.proposalDigest,
      };
    };
    const reviewed = await runProcessAttempt(input);
    assert.equal(reviewed.result.task.status, 'pass');
    assert.deepEqual(seen, ['setup', 'task']);
    input.reviewReply = async () => ({
      text: 'approve a different digest',
      approvedDigest: 'd'.repeat(64),
    });
    assert.equal(
      (await runProcessAttempt(input)).result.setup.reason,
      'reply-rejected',
    );
  },
);

test(
  'clarification cannot approve a digest and an unresponsive reviewer is bounded',
  posix,
  async (t) => {
    const { input } = await fixture(t, 'clarification');
    input.reviewReply = async (request) => ({
      text: 'Not approval.',
      approvedDigest: request.proposalDigest,
    });
    assert.equal(
      (await runProcessAttempt(input)).result.setup.reason,
      'reply-rejected',
    );
    input.reviewReply = () => new Promise(() => {});
    input.experiment.limits.setupMs = 100;
    assert.match(
      (await runProcessAttempt(input)).result.setup.reason!,
      /timeout/,
    );
  },
);

test(
  'a task timeout kills children and grandchildren even after the leader terminates',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t, 'tree-task');
    input.experiment.limits.taskMs = 2000;
    const run = await runProcessAttempt(input);
    assert.equal(run.result.setup.status, 'pass');
    assert.equal(run.result.task.status, 'error');
    await assertTreeStopped(probes);
  },
);

test(
  'task startup consumes its deadline instead of resetting the task budget at ready',
  posix,
  async (t) => {
    const { input } = await fixture(t, 'slow-task');
    input.experiment.limits.taskMs = 300;
    const run = await runProcessAttempt(input);
    assert.equal(run.result.setup.status, 'pass');
    assert.equal(run.result.task.reason, 'task-timeout');
    assert(
      run.result.task.durationMs < 500,
      'Task startup must not grant a second full execution budget.',
    );
  },
);

test(
  'cancellation kills the active process group and preserves earlier stage results',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t, 'tree-task');
    const controller = new AbortController();
    input.signal = controller.signal;
    const pending = runProcessAttempt(input);
    await waitFile(path.join(probes, 'grandchild.pid'));
    controller.abort();
    const run = await pending;
    assert.equal(run.result.setup.status, 'pass');
    assert.equal(run.result.task.reason, 'aborted');
    await assertTreeStopped(probes);
  },
);

test(
  'successful leader exit also cleans up orphan descendants without hanging on inherited pipes',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t, 'orphan');
    const run = await runProcessAttempt(input);
    assert.equal(run.result.task.status, 'pass');
    await assertTreeStopped(probes);
  },
);

test(
  'frozen inputs, unavailable executables and unsupported execution boundaries remain explicit',
  posix,
  async (t) => {
    const { input, probes } = await fixture(t);
    await assert.rejects(
      runProcessAttempt({
        ...input,
        scenario: {
          ...input.scenario,
          dialogue: [{ role: 'user', text: 'changed condition' }],
        },
      }),
      { code: 'invalid-eval-run' },
    );
    input.profile.command = () => ({
      executable: path.join(probes, 'missing'),
      argv: [],
      cwd: probes,
      env: {},
    });
    assert.equal(
      (await runProcessAttempt(input)).result.launch.status,
      'error',
    );
    input.profile.specification.auth = 'subscription';
    input.experiment.profiles[0] = input.profile.specification;
    assert.equal(
      (await runProcessAttempt(input)).result.launch.reason,
      'external-profile-unavailable',
    );
    input.scenario.isolation = 'hostile';
    input.experiment.scenarios[0].hash = digest(input.scenario);
    assert.equal(
      (await runProcessAttempt(input)).result.launch.reason,
      'isolation-unavailable',
    );
  },
);
