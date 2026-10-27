import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import {
  mkdir,
  mkdtemp,
  readFile,
  realpath,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import {
  digest,
  hashContent,
  validatePreset,
} from '../../scripts/core/contracts.ts';
import {
  updateManagedBlock,
  parseManagedBlock,
} from '../../scripts/core/blocks.ts';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import {
  loadAcceptanceMatrix,
  bindAcceptanceFixture,
} from '../../scripts/evals/matrix.ts';
import { materializeScenario } from '../../scripts/evals/fixtures.ts';
import { executorScenario } from '../../scripts/evals/contracts.ts';
import { validateQualityPlan } from '../../scripts/evals/quality.ts';
import {
  inspectOpenSpec,
  inspectOpenSpecPackage,
} from '../../scripts/evals/openspec-source.ts';
import { runProcessAttempt } from '../../scripts/evals/runner.ts';
import { gradeMechanicalRun } from '../../scripts/evals/mechanical.ts';
import { validateRun } from '../../scripts/evals/contracts.ts';

const fixtures = await loadAcceptanceMatrix();
const byId = (id: string) => {
  const fixture = fixtures.find((item) => item.scenario.id === id);
  assert(fixture, id);
  return fixture;
};
const readJSON = async (name: string) =>
  JSON.parse(
    await readFile(
      new URL('../../scripts/evals/fixtures/' + name, import.meta.url),
      'utf8',
    ),
  );

test('the frozen matrix covers each required context independently', async () => {
  assert.equal(fixtures.length, 67);
  const lock = await readJSON('matrix-lock.json');
  assert.deepEqual(
    fixtures.map((item) => ({
      id: item.scenario.id,
      hash: digest(item),
      coverage: item.coverage,
    })),
    lock.cases,
    'Review and explicitly refreeze changed inputs/expectations before a series.',
  );
  const covered = new Set(fixtures.flatMap((item) => item.coverage));
  for (const key of [
    'product:A',
    'product:B',
    'product:C',
    'product:Г',
    'product:Д',
    'product:Е',
    'profile:ML',
    'addendum:1',
    'addendum:2',
    'addendum:3',
    'addendum:7',
    'trio:codex',
    'trio:claude-code',
    'trio:cursor',
    ...['01', '02', '03', '04', '05', '06', '07'].map((n) => 'PREF-' + n),
    'PREF-06:no-questions',
    ...['A', 'B', 'C', 'D'].map((n) => 'PREF-08:' + n),
    'SKILL-01:install',
    'SKILL-01:refusal',
    'SKILL-02',
    'SKILL-03',
    'SKILL-04:update',
    'PROC-01:init+workflow',
    'PROC-02:adopt',
    'PROC-02:update',
    'PROC-03:unsafe-init',
    'PROC-04:team',
    'PROC-04:openspec',
  ])
    assert(covered.has(key), key);
  assert.equal(
    fixtures
      .filter((item) => item.scenario.isolation === 'hostile')
      .map((item) => item.scenario.id)
      .join(','),
    'proc-03-unsafe-init',
  );
});

test('preserving sufficient rules passes setup without executing a forbidden check', () => {
  for (const fixture of fixtures)
    for (const stage of ['setup', 'task'] as const) {
      const command = fixture.oracle[stage].command;
      assert(
        !command ||
          fixture.scenario[stage].allowedCommands.includes(digest(command)),
        fixture.scenario.id + ' ' + stage,
      );
    }
  const { scenario, oracle } = byId('pref-05');
  const profile = {
    id: 'offline',
    agent: 'stub',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: digest('empty'),
    permissionsHash: digest('controlled'),
  };
  const experiment = {
    schema: 1 as const,
    id: 'preserve-sufficient',
    sourceSha: 'a'.repeat(40),
    conditionsHash: digest('no-auth'),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [profile],
    repeats: 1,
    limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
    order: (['tibicen', 'baseline'] as const).map((variant) => ({
      id: variant,
      scenarioId: scenario.id,
      profileId: profile.id,
      variant,
      repeat: 1,
    })),
  };
  const pass = { status: 'pass' as const, durationMs: 1 };
  const files = scenario.files.map((file) => ({
    path: file.path,
    contentHash: hashContent(file.content),
    fileMode: 0o644,
  }));
  const events = [
    { stage: 'launch', kind: 'scenario-started', data: {} },
    { stage: 'launch', kind: 'stage-finished', data: pass },
    {
      stage: 'setup',
      kind: 'checkpoint',
      data: { point: 'start', complete: true, files },
    },
    {
      stage: 'setup',
      kind: 'checkpoint',
      data: { point: 'end', complete: true, files },
    },
    { stage: 'setup', kind: 'stage-finished', data: pass },
  ].map((event, seq) => ({
    schema: 1,
    experimentId: experiment.id,
    attemptId: 'tibicen',
    seq,
    elapsedMs: seq,
    ...event,
  }));
  const run = validateRun(
    experiment,
    scenario,
    {
      schema: 1,
      id: 'tibicen',
      scenarioId: scenario.id,
      profileId: profile.id,
      variant: 'tibicen',
      started: true,
      launch: pass,
      setup: pass,
      task: { status: 'skip', durationMs: 0, reason: 'recorded-setup-only' },
    },
    events,
  );
  assert(
    gradeMechanicalRun(run, oracle)
      .filter((grade) => grade.stage === 'setup')
      .every((grade) => grade.verdict === 'pass'),
  );
});

for (const fixture of fixtures)
  test(
    fixture.scenario.id +
      ' keeps common public inputs apart from private expectations/replies',
    async (t) => {
      const { scenario, oracle } = fixture;
      assert.equal(scenario.oracle.hash, digest(oracle));
      assert.equal(scenario.oracle.id, oracle.id);
      validateQualityPlan(fixture.quality);
      assert(fixture.controls.sufficient !== fixture.controls.violation);
      assert(oracle.setup.criteria.includes(fixture.controls.sufficient));
      assert.deepEqual(scenario.setup.allowedPaths, oracle.setup.allowedPaths);
      assert.deepEqual(scenario.task.allowedPaths, oracle.task.allowedPaths);
      assert.equal(
        scenario.setup.allowedPaths.includes('package.json'),
        scenario.id === 'product-a-new',
      );
      const visible = JSON.stringify(executorScenario(scenario));
      assert(!visible.includes(fixture.controls.sufficient));
      assert(!visible.includes(fixture.controls.violation));
      for (const phase of ['setup', 'task'] as const)
        for (const reply of scenario[phase].replies)
          assert(!visible.includes(reply.text));
      const parent = await mkdtemp(
        path.join(os.tmpdir(), 'tibicen-matrix-test-'),
      );
      t.after(() => rm(parent, { recursive: true, force: true }));
      const first = await materializeScenario(scenario, parent),
        second = await materializeScenario(scenario, parent);
      assert.notEqual(first.root, second.root);
      assert.deepEqual(first.scenario, second.scenario);
      for (const file of scenario.files) {
        assert.equal(
          await readFile(path.join(first.root, file.path), 'utf8'),
          file.content,
        );
        assert.equal(
          await readFile(path.join(second.root, file.path), 'utf8'),
          file.content,
        );
      }
    },
  );

test('managed-block cases have independent exact-byte outcomes, including CRLF and refusal to guess', () => {
  for (const fixture of fixtures.filter((item) =>
    item.scenario.id.startsWith('blocks-'),
  )) {
    const name = fixture.scenario.id.slice(7),
      original = fixture.scenario.files.find(
        (file) => file.path === 'AGENTS.md',
      )!.content;
    if (
      ['duplicate', 'nested', 'reversed', 'unclosed', 'unknown'].includes(name)
    ) {
      assert.throws(() => parseManagedBlock(original));
      assert.throws(() =>
        updateManagedBlock(original, {
          content: 'Use node --test after consent.',
        }),
      );
    } else if (name === 'legacy')
      assert.throws(
        () =>
          updateManagedBlock(original, {
            content: 'Use node --test after consent.',
          }),
        { code: 'managed-block-migration-required' },
      );
    else {
      const actual = updateManagedBlock(original, {
        content: name === 'remove' ? null : 'Use node --test after consent.',
      });
      assert.equal(
        hashContent(actual!),
        fixture.oracle.setup.artifacts![0].contentHash,
        name,
      );
      const damaged = actual! + '\nUnapproved byte';
      assert.notEqual(
        hashContent(damaged),
        fixture.oracle.setup.artifacts![0].contentHash,
      );
    }
  }
});

const lifecycle = await readJSON('lifecycle.json');
for (const frozen of lifecycle.cases)
  test(
    frozen.id + ' is a real recoverable kernel state with separate consent',
    async (t) => {
      const fixture = byId(frozen.id),
        parent = await mkdtemp(
          path.join(os.tmpdir(), 'tibicen-resume-fixture-'),
        );
      t.after(() => rm(parent, { recursive: true, force: true }));
      const { root } = await materializeScenario(fixture.scenario, parent);
      await assert.rejects(
        getStatus(root),
        { code: 'tamper-suspect' },
        'Unbound templates must never be mistaken for ready live inputs.',
      );
      const bound = bindAcceptanceFixture(
        fixture,
        await realpath(root),
        await realpath(parent),
      );
      for (const file of bound.scenario.files.filter((file) =>
        [
          '.tibicen/state/session.json',
          'docs/previously-reviewed-plan.json',
        ].includes(file.path),
      ))
        await writeFile(path.join(root, file.path), file.content);
      const before = await getStatus(root);
      assert.equal(before.state!.id, frozen.expected.sessionId);
      assert.deepEqual(
        before.recovery!.files.map((file) => ({
          path: file.path,
          state: file.state,
        })),
        frozen.expected.files,
      );
      assert.equal(before.recovery!.manifest, frozen.expected.manifest);
      assert.deepEqual(
        before.recovery!.unknownCommands,
        frozen.expected.unknownCommands,
      );
      const plan = JSON.parse(
        await readFile(
          path.join(root, 'docs/previously-reviewed-plan.json'),
          'utf8',
        ),
      );
      await assert.rejects(
        applyPlan(root, plan, { home: parent, resume: true }),
        { code: 'consent-required' },
      );
      if (frozen.id === 'resume-command-unknown') {
        assert.equal(before.recovery!.unknownCommands.length, 1);
        const resumed = await applyPlan(root, plan, {
          home: parent,
          resume: true,
          approvedDigest: plan.digest,
          verify: async (_plan, _session, execution) => {
            const outcome = await execution!.runner(plan.proposal.commands[0], {
              root,
              approvedDigest: plan.digest,
            });
            assert.equal(outcome.reason, 'command-outcome-unknown');
            assert.equal(outcome.exitCode, null);
            return {
              infrastructure: { kind: 'infrastructure', status: 'passed' },
              verify: {
                kind: 'verify',
                status: 'unverified',
                reason: 'command-outcome-unknown',
              },
            };
          },
        });
        assert.equal(resumed.id, frozen.expected.sessionId);
        assert.equal(resumed.checks.verify.status, 'unverified');
        assert.equal(
          resumed.manifest!.sessions.at(-1)!.commandAttempts![0].status,
          'unknown',
        );
      } else if (frozen.id === 'resume-ambiguous') {
        await assert.rejects(
          applyPlan(root, plan, {
            home: parent,
            resume: true,
            approvedDigest: plan.digest,
          }),
          { code: 'tamper-suspect' },
        );
        assert(
          (await readFile(path.join(root, 'AGENTS.md'), 'utf8')).includes(
            'Concurrent owner edit',
          ),
        );
      } else {
        let writes = 0;
        const result = await applyPlan(root, plan, {
          home: parent,
          resume: true,
          approvedDigest: plan.digest,
          checkpoint(point) {
            if (point === 'before-file-write') writes++;
          },
        });
        assert.equal(result.id, frozen.expected.sessionId);
        assert.equal(result.status, 'complete');
        assert.equal((await getStatus(root)).state, null);
        if (
          before.recovery!.files.every(
            (file) => file.state === 'matches-approved-result',
          )
        )
          assert.equal(writes, 0);
        for (const artifact of fixture.oracle.setup.artifacts!) {
          const actual = await readFile(path.join(root, artifact.path)).catch(
            () => null,
          );
          assert.equal(
            actual === null ? null : hashContent(actual),
            artifact.contentHash,
          );
        }
      }
    },
  );

test('upstream sources retain exact Git blobs, SHA256, complete selected resources and MIT licenses', async () => {
  const manifest = await readJSON('sources/upstream.json');
  for (const file of manifest.files) {
    const bytes = await readFile(
      new URL('../../' + file.local, import.meta.url),
    );
    assert.equal(bytes.length, file.bytes);
    assert.equal(hashContent(bytes), file.sha256);
    assert.equal(
      createHash('sha1')
        .update(`blob ${bytes.length}\0`)
        .update(bytes)
        .digest('hex'),
      file.gitBlob,
    );
    assert.match(file.commit, /^[a-f0-9]{40}$/);
    assert.equal(file.license, 'MIT');
  }
  const skill = byId('skill-01');
  assert.equal(
    skill.scenario.files.filter((file) =>
      file.path.startsWith('available-sources/ponytail/'),
    ).length,
    2,
  );
  assert(
    skill.scenario.files
      .find((file) => file.path.endsWith('/LICENSE'))!
      .content.includes('MIT License'),
  );
  const old = byId('skill-04');
  assert(
    old.scenario.files.some(
      (file) =>
        file.path ===
        'available-sources/ponytail-previous/examples/web-platform-lookup.md',
    ),
  );
  assert(
    !old.scenario.files.some(
      (file) =>
        file.path ===
        'available-sources/ponytail/examples/web-platform-lookup.md',
    ),
  );
});

test('the selected update detects local edits and preserves the old canonical source link', async (t) => {
  const fixture = byId('skill-04'),
    parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-real-skill-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const { root } = await materializeScenario(fixture.scenario, parent);
  const existing = (await getStatus(root)).manifest!;
  assert.equal(
    existing.installed[0].sha,
    'fe963cae99d986dae3199fe56403f99e87db7c6c',
  );
  const skillPath = '.agents/skills/ponytail/SKILL.md';
  assert.notEqual(
    existing.installed[0].files![0].installedHash,
    hashContent(await readFile(path.join(root, skillPath))),
  );
  const content = fixture.scenario.files.find(
    (file) =>
      file.path === 'available-sources/ponytail/skills/ponytail/SKILL.md',
  )!.content;
  const source = {
    repo: 'DietrichGebert/ponytail',
    sha: '09c434ab73ca43761c5d8b0c5d341926c2fba710',
    license: 'MIT',
    skillPath: 'skills/ponytail/SKILL.md',
    files: [
      {
        path: skillPath,
        sourcePath: 'skills/ponytail/SKILL.md',
        contentHash: hashContent(content),
      },
    ],
  };
  await assert.rejects(
    createProposal(
      root,
      { mode: 'improve', componentUpdates: [{ source, decisions: [] }] },
      { home: parent },
    ),
    { code: 'component-decision-required' },
  );
  const plan = await createProposal(
    root,
    {
      mode: 'improve',
      componentUpdates: [
        {
          source,
          decisions: [
            {
              path: skillPath,
              resolution: 'preserve',
              reason: 'Keep the visible owner extension.',
            },
            {
              path: '.agents/skills/ponytail/references/web-platform-lookup.md',
              resolution: 'preserve',
              reason: 'Keep useful historical reference with its original SHA.',
            },
          ],
        },
      ],
    },
    { home: parent },
  );
  assert.equal(plan.proposal.changes.length, 0);
  assert(
    plan.proposal.components.files.some(
      (file) => file.path === skillPath && file.resolution === 'preserve',
    ),
  );
  assert(
    !plan.proposal.components.files.some((file) =>
      file.path.endsWith('owner-note.md'),
    ),
  );
});

test('negative source fixtures contain actual missing/changed materials rather than only labels', () => {
  for (const kind of [
    'license',
    'changed-bytes',
    'missing-resource',
    'foreign-path',
  ]) {
    const fixture = byId('skill-04-' + kind);
    const files = new Map(
      fixture.scenario.files.map((file) => [file.path, file.content]),
    );
    const selection = JSON.parse(files.get('requested-source/selection.json')!);
    if (kind === 'license') {
      assert.equal(selection.license, null);
      assert(!files.has('requested-source/LICENSE'));
    }
    if (kind === 'changed-bytes')
      assert.notEqual(
        hashContent(files.get('requested-source/SKILL.md')!),
        selection.files[0].sha256,
      );
    if (kind === 'missing-resource')
      assert(!files.has('requested-source/' + selection.files[1].path));
    if (kind === 'foreign-path')
      assert.notEqual(
        files.get('requested-source/new-reference.md'),
        files.get('.agents/skills/ponytail/new-reference.md'),
      );
    assert.deepEqual(fixture.scenario.setup.allowedPaths, []);
  }
});

test('OpenSpec package fingerprints survive relocation and still bind real files', async (t) => {
  const scope = await mkdtemp(path.join(os.tmpdir(), 'tibicen-openspec-pin-'));
  t.after(() => rm(scope, { recursive: true, force: true }));
  const roots = [path.join(scope, 'first'), path.join(scope, 'second')];
  for (const root of roots) {
    await mkdir(path.join(root, 'node_modules/.bin'), { recursive: true });
    await mkdir(path.join(root, 'bin'));
    await writeFile(
      path.join(root, 'package.json'),
      JSON.stringify({
        name: '@fission-ai/openspec',
        version: '1.14.3',
        license: 'MIT',
      }),
    );
    await writeFile(
      path.join(root, 'bin/openspec.js'),
      'reviewed CLI payload\n',
    );
    await writeFile(
      path.join(root, 'node_modules/payload.txt'),
      'ordinary package content remains pinned\n',
    );
    await writeFile(
      path.join(root, 'node_modules/.bin/yaml'),
      `#!/bin/sh\nexec node ${root}/dependency/yaml/bin.mjs "$@"\n`,
    );
  }
  const first = await inspectOpenSpecPackage(roots[0]);
  const second = await inspectOpenSpecPackage(roots[1]);
  assert(
    !first.resources.some((file) => file.path.startsWith('node_modules/.bin/')),
    'Generated dependency launchers are not upstream package payload.',
  );
  assert.deepEqual(first.resources, second.resources);
  assert.equal(first.integrity, second.integrity);
  assert(
    first.resources.some((file) => file.path === 'node_modules/payload.txt'),
  );
  await writeFile(
    path.join(roots[1], 'bin/openspec.js'),
    'changed CLI payload\n',
  );
  assert.notEqual(
    digest(first.resources),
    digest((await inspectOpenSpecPackage(roots[1])).resources),
  );
  await symlink(
    path.join(roots[1], 'bin/openspec.js'),
    path.join(roots[1], 'bin/unexpected-link'),
  );
  await assert.rejects(inspectOpenSpecPackage(roots[1]), {
    code: 'unexpected-eval-cli',
  });
});

test('OpenSpec inventory and native effects match the pinned package; bounded setup remains distinct', async () => {
  const frozen = await readJSON('sources/openspec.json');
  assert.deepEqual(await inspectOpenSpec(), frozen);
  assert.equal(frozen.version, '1.14.3');
  assert.equal(frozen.native.effects[0].changed.length, 10);
  assert.deepEqual(
    frozen.native.effects[1].changed.map((file: { path: string }) => file.path),
    ['home/.config/openspec/config.json'],
  );
  assert.deepEqual(frozen.native.effects[2].changed, []);
  assert.equal(frozen.bounded.files.length, 4);
  assert.deepEqual(frozen.bounded.commands, []);
  const proc = byId('proc-01');
  const prefix = 'openspec/changes/add-triple/';
  assert.deepEqual(proc.interaction.planning, {
    specification: [prefix + 'proposal.md', prefix + 'specs/triple/spec.md'],
    plan: [prefix + 'tasks.md'],
    optionalDesign: prefix + 'design.md',
  });
  assert(
    proc.scenario.task.prompt.includes(
      JSON.stringify(proc.interaction.planning),
    ),
  );
  for (const id of ['proc-02-adopt', 'proc-02-update']) {
    const fixture = byId(id);
    assert.deepEqual(fixture.interaction.planning, {
      specification: proc.interaction.planning!.specification,
      plan: [prefix + 'design.md', prefix + 'tasks.md'],
      optionalDesign: null,
    });
    assert(
      fixture.scenario.task.prompt.includes(
        JSON.stringify(fixture.interaction.planning),
      ),
    );
  }
  assert(proc.scenario.task.replies.some((reply) => reply.when === 'review'));
  assert(
    proc.scenario.task.allowedCommands.includes(
      digest({
        executable: 'openspec',
        argv: ['validate', 'add-triple', '--strict'],
        cwd: '.',
      }),
    ),
  );
  assert(
    !proc.scenario.setup.allowedPaths.some((file) =>
      file.startsWith('openspec/changes/add-triple/'),
    ),
  );
});

test('PREF contexts use real evidence without declaring a universally correct component', () => {
  assert.notDeepEqual(
    byId('pref-08a').scenario.files,
    byId('pref-08b').scenario.files,
  );
  assert(
    byId('pref-08b').scenario.files.some(
      (file) =>
        file.path === '.specify/templates/spec-template.md' &&
        file.content.includes('User Scenarios'),
    ),
  );
  assert(
    byId('pref-08b').scenario.files.some(
      (file) =>
        file.path === 'specs/keep-double/tasks.md' &&
        file.content.includes('- [ ]'),
    ),
  );
  assert(
    byId('pref-08c').scenario.files.some(
      (file) => file.path === 'docs/local-process.md',
    ),
  );
  assert(
    byId('pref-08d').scenario.files.some(
      (file) => file.path === 'docs/team-constraint.md',
    ),
  );
  assert.equal(
    byId('pref-06-no-questions').scenario.setup.replies.filter(
      (reply) => reply.when === 'clarification',
    ).length,
    0,
  );
  assert(byId('pref-03').scenario.setup.replies[0].text.includes('подробно'));
  assert.equal(byId('pref-04').scenario.dialogue.length, 0);
  validatePreset(
    JSON.parse(
      byId('product-e-preset').scenario.files.find(
        (file) => file.path === 'team-preset.json',
      )!.content,
    ),
  );
  assert.equal(byId('ml-infrastructure').oracle.task.exports, undefined);
  assert.deepEqual(byId('ml-infrastructure').scenario.task.allowedCommands, []);
  const empty = byId('product-a-new');
  assert(!empty.scenario.files.length);
  assert(empty.scenario.task.allowedPaths.includes('src/App.jsx'));
  assert(
    !empty.oracle.setup.command &&
      !empty.oracle.task.exports &&
      !empty.oracle.task.command,
  );
  assert(!JSON.stringify(empty.oracle).includes('Preserve the double export'));
});

test('the concrete unsafe initializer remains inert behind the hostile isolation gate', async () => {
  const { scenario } = byId('proc-03-unsafe-init');
  const payload = scenario.files.find(
    (file) => file.path === 'available-process/unsafe-init.mjs',
  )!.content;
  assert(payload.includes('os.homedir()') && payload.includes("'commit'"));
  const profile = {
    id: 'offline',
    agent: 'stub',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: digest('empty'),
    permissionsHash: digest('controlled'),
  };
  const experiment = {
    schema: 1 as const,
    id: 'unsafe-gate',
    sourceSha: 'a'.repeat(40),
    conditionsHash: digest('no-auth'),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [profile],
    repeats: 1,
    limits: { launchMs: 1000, setupMs: 1000, taskMs: 1000, maxCostUsd: null },
    order: (['tibicen', 'baseline'] as const).map((variant) => ({
      id: variant,
      scenarioId: scenario.id,
      profileId: profile.id,
      variant,
      repeat: 1,
    })),
  };
  const run = await runProcessAttempt({
    experiment,
    scenario,
    attemptId: 'tibicen',
    profile: {
      specification: profile,
      preflight: async () =>
        assert.fail('Hostile preflight must not run in the controlled driver.'),
      command: () => assert.fail('Unsafe initializer must not be executed.'),
    },
  });
  assert.equal(run.result.started, false);
  assert.equal(run.result.launch.reason, 'isolation-unavailable');
});
