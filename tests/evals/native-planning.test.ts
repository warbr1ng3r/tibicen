import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { loadAcceptanceMatrix } from '../../scripts/evals/matrix.ts';
import { materializeScenario } from '../../scripts/evals/fixtures.ts';
import {
  reviewNativePlanning,
  reviewNativeProposal,
} from '../../scripts/evals/native-workflow.ts';
import { checkOpenSpecPlanning } from '../../scripts/evals/native-checks.ts';
import type { NativeProposal } from '../../scripts/evals/native-workflow.ts';

const prefix = 'openspec/changes/add-triple/';

test('projected planning preserves existing requirements and rejects missing, blank or deleted artifacts', async (t) => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-planning-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const fixture = (await loadAcceptanceMatrix()).find(
    (f) => f.scenario.id === 'proc-01',
  )!;
  const { root } = await materializeScenario(fixture.scenario, parent);
  const policy = fixture.interaction.planning!;
  const proposal: NativeProposal = {
    summary: 'A simple pure export needs no architectural document.',
    changes: [],
    commands: [],
    kernelPlan: null,
    skipDesignReason: 'No cross-cutting decisions or new dependencies.',
  };
  await mkdir(path.join(root, prefix, 'specs/triple'), { recursive: true });
  for (const file of policy.specification)
    await writeFile(
      path.join(root, file),
      'Existing reviewed specification.\n',
    );
  proposal.changes = [
    { path: prefix + 'tasks.md', content: '- [ ] Add and verify triple.\n' },
  ];
  assert.deepEqual(await reviewNativePlanning(root, policy, 'plan', proposal), {
    required: [...policy.specification, ...policy.plan],
    skipDesignReason: proposal.skipDesignReason,
  });
  for (const content of [null, '', ' \n']) {
    for (const file of [...policy.specification, ...policy.plan]) {
      const changed = structuredClone(proposal);
      changed.changes = [
        ...proposal.changes.filter((edit) => edit.path !== file),
        { path: file, content },
      ];
      await assert.rejects(
        reviewNativePlanning(root, policy, 'plan', changed),
        { code: 'native-process-artifacts-missing' },
      );
    }
  }
  await assert.rejects(
    reviewNativePlanning(root, policy, 'plan', { ...proposal, changes: [] }),
    { code: 'native-process-artifacts-missing' },
  );
  for (const skipDesignReason of [undefined, null, ' \n'])
    await assert.rejects(
      reviewNativePlanning(root, policy, 'plan', {
        ...proposal,
        skipDesignReason,
      }),
      { code: 'native-process-design-skip-invalid' },
    );
  await writeFile(path.join(root, prefix, 'design.md'), 'A retained design.');
  await assert.rejects(reviewNativePlanning(root, policy, 'plan', proposal), {
    code: 'native-process-design-skip-invalid',
  });
  assert.equal(
    (
      await reviewNativePlanning(root, policy, 'plan', {
        ...proposal,
        skipDesignReason: null,
      })
    ).skipDesignReason,
    null,
  );
  await writeFile(path.join(root, prefix, 'design.md'), ' ');
  await assert.rejects(
    reviewNativePlanning(root, policy, 'plan', {
      ...proposal,
      skipDesignReason: null,
    }),
    { code: 'native-process-artifacts-missing' },
  );
  await assert.rejects(readFile(path.join(root, prefix, 'tasks.md')), {
    code: 'ENOENT',
  });
});

test('skip field is bounded to optional PROC-01 plan and cannot replace explicit PROC-02 design', async (t) => {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-design-skip-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const fixtures = await loadAcceptanceMatrix();
  const proposal: NativeProposal = {
    summary: 'Skip design',
    changes: [],
    commands: [],
    kernelPlan: null,
    skipDesignReason: 'Simple local change.',
  };
  for (const id of ['proc-01', 'proc-02-adopt', 'proc-02-update']) {
    const fixture = fixtures.find((f) => f.scenario.id === id)!;
    const { root } = await materializeScenario(fixture.scenario, parent);
    const planning = fixture.interaction.planning!;
    const review = (phase: 'plan' | 'specification', value = proposal) =>
      reviewNativeProposal(
        value,
        fixture.scenario,
        'task',
        root,
        undefined,
        phase,
        [],
        planning,
      );
    await assert.rejects(review('specification'), {
      code: 'native-proposal-rejected',
    });
    if (id === 'proc-01') {
      await review('plan');
      for (const skipDesignReason of ['', ' ', 'x'.repeat(4001)])
        await assert.rejects(
          review('plan', { ...proposal, skipDesignReason }),
          { code: 'native-proposal-rejected' },
        );
    } else {
      await assert.rejects(review('plan'), {
        code: 'native-proposal-rejected',
      });
      const changes = [...planning.specification, prefix + 'tasks.md'].map(
        (file) => ({ path: file, content: 'A nonempty artifact.' }),
      );
      await assert.rejects(
        reviewNativePlanning(root, planning, 'plan', {
          ...proposal,
          changes,
          skipDesignReason: null,
        }),
        { code: 'native-process-artifacts-missing' },
      );
    }
  }
});

test('prospective CLI checks use exact overlaid bytes, record readiness separately and clean up without writing the project', async (t) => {
  const parent = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-planning-preview-'),
  );
  t.after(() => rm(parent, { recursive: true, force: true }));
  const root = path.join(parent, 'project'),
    copy = path.join(parent, 'preview');
  await mkdir(root);
  await writeFile(path.join(root, 'owner.md'), 'Preserved');
  const calls: string[][] = [];
  const result = await checkOpenSpecPlanning(
    root,
    copy,
    '/pinned/openspec',
    [{ path: prefix + 'tasks.md', content: '- [ ] Pending' }],
    () => 17000,
    async (cwd, argv, budget) => {
      assert.equal(cwd, copy);
      assert.equal(budget, 15000);
      assert.equal(
        await readFile(path.join(copy, prefix, 'tasks.md'), 'utf8'),
        '- [ ] Pending',
      );
      calls.push(argv);
      return {
        status: 0,
        timedOut: false,
        stdout: JSON.stringify({
          changeName: 'add-triple',
          schemaName: 'spec-driven',
          ...(argv[1] === 'status'
            ? { isPlanningComplete: false }
            : { state: 'ready' }),
        }),
      };
    },
  );
  assert.deepEqual(result, { applyState: 'ready', isPlanningComplete: false });
  assert.deepEqual(
    calls.map((argv) => argv.slice(1)),
    [
      ['status', '--change', 'add-triple', '--json'],
      ['instructions', 'apply', '--change', 'add-triple', '--json'],
    ],
  );
  await assert.rejects(readFile(path.join(root, prefix, 'tasks.md')), {
    code: 'ENOENT',
  });
  assert.equal(
    await readFile(path.join(root, 'owner.md'), 'utf8'),
    'Preserved',
  );
  await assert.rejects(readFile(path.join(copy, 'owner.md')), {
    code: 'ENOENT',
  });
});

test('missing, malformed, blocked, failed or timed-out CLI evidence never grants readiness', async (t) => {
  const parent = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-planning-errors-'),
  );
  t.after(() => rm(parent, { recursive: true, force: true }));
  const root = path.join(parent, 'project'),
    copy = path.join(parent, 'preview');
  await mkdir(root);
  const valid = {
    changeName: 'add-triple',
    schemaName: 'spec-driven',
    isPlanningComplete: true,
    state: 'ready',
  };
  await writeFile(path.join(root, 'owner.md'), 'Preserved');
  for (const failedCall of [0, 1]) {
    const wrongFields =
      failedCall === 0
        ? [{ ...valid, isPlanningComplete: null }]
        : [{ ...valid, state: 'blocked' }];
    const failures = [
      { status: 1, timedOut: false, stdout: JSON.stringify(valid) },
      { status: 0, timedOut: true, stdout: JSON.stringify(valid) },
      { status: 0, timedOut: false, stdout: '{broken' },
      ...[
        null,
        {},
        { ...valid, changeName: 'other' },
        { ...valid, schemaName: 'other' },
        ...wrongFields,
      ].map((value) => ({
        status: 0,
        timedOut: false,
        stdout: JSON.stringify(value),
      })),
    ];
    for (const broken of failures) {
      let calls = 0;
      await assert.rejects(
        checkOpenSpecPlanning(
          root,
          copy,
          '/pinned/openspec',
          [],
          () => 2000,
          async () =>
            calls++ === failedCall
              ? broken
              : { status: 0, timedOut: false, stdout: JSON.stringify(valid) },
        ),
        { code: 'native-process-planning-unverified' },
      );
      await assert.rejects(readFile(path.join(copy, 'owner.md')), {
        code: 'ENOENT',
      });
    }
  }
  let calls = 0;
  await assert.rejects(
    checkOpenSpecPlanning(
      root,
      copy,
      '/pinned/openspec',
      [],
      () => 0,
      async () => {
        calls++;
        return { status: 0, timedOut: false, stdout: '' };
      },
    ),
    { code: 'native-stage-timeout' },
  );
  assert.equal(calls, 0);
});
