import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import {
  loadDiagnostic,
  materializeScenario,
} from '../../scripts/evals/fixtures.ts';
import {
  runMechanicalAttempt,
  gradeMechanicalRun,
} from '../../scripts/evals/mechanical.ts';
import type {
  MechanicalOracle,
  ReviewedPlan,
} from '../../scripts/evals/mechanical.ts';
import type { ProcessRunInput } from '../../scripts/evals/runner.ts';
import type { Experiment } from '../../scripts/evals/contracts.ts';
import { saveObservedRun } from '../../scripts/evals/observations.ts';
import { setTimeout as delay } from 'node:timers/promises';

const posix = { skip: process.platform === 'win32' };
const agents = '# Project\nUse node --test.\n';
const source =
  'export const double = value => value * 2;\nexport const triple = value => value * 3;\n';
const tests =
  "import test from 'node:test';\nimport assert from 'node:assert/strict';\nimport { double, triple } from '../src/math.js';\ntest('double', () => assert.equal(double(3), 6));\ntest('triple', () => assert.equal(triple(3), 9));\n";
async function fixture(t: TestContext, mode = 'pass') {
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-grader-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const loaded = await loadDiagnostic('diagnostic-bare'),
    scenario = structuredClone(loaded.scenario),
    oracle = structuredClone(loaded.oracle) as MechanicalOracle;
  const files: Record<string, string | null> = { 'AGENTS.md': agents };
  if (
    [
      'component',
      'metadata-only',
      'loading-only',
      'wrong-sha',
      'wrong-license',
      'update',
      'foreign',
    ].includes(mode)
  ) {
    files['.agents/skills/demo/SKILL.md'] =
      '# Demo\nRead references/rule.md.\n';
    files['.agents/skills/demo/references/rule.md'] =
      'Keep the owner constraint.\n';
    files['.tibicen/manifest.yml'] = JSON.stringify({
      installed: [
        {
          repo: 'owner/demo',
          sha: 'a'.repeat(40),
          license: 'MIT',
          files: [
            {
              path: '.agents/skills/demo/SKILL.md',
              contentHash: hashContent(files['.agents/skills/demo/SKILL.md']!),
            },
            {
              path: '.agents/skills/demo/references/rule.md',
              contentHash: hashContent(
                files['.agents/skills/demo/references/rule.md']!,
              ),
            },
          ],
        },
      ],
    });
    if (mode === 'wrong-license')
      files['.tibicen/manifest.yml'] = files['.tibicen/manifest.yml'].replace(
        'MIT',
        'Apache-2.0',
      );
    oracle.setup.json = [
      {
        id: 'source-sha',
        path: '.tibicen/manifest.yml',
        pointer: ['installed', '0', 'sha'],
        value: 'a'.repeat(40),
      },
      {
        id: 'source-license',
        path: '.tibicen/manifest.yml',
        pointer: ['installed', '0', 'license'],
        value: 'MIT',
      },
      {
        id: 'source-repo',
        path: '.tibicen/manifest.yml',
        pointer: ['installed', '0', 'repo'],
        value: 'owner/demo',
      },
    ];
    if (['metadata-only', 'loading-only'].includes(mode))
      oracle.setup.loading = [
        {
          path: '.agents/skills/demo/SKILL.md',
          contentHash: hashContent(files['.agents/skills/demo/SKILL.md']!),
        },
      ];
  }
  if (['update', 'foreign'].includes(mode)) {
    scenario.files.push(
      { path: '.agents/skills/demo/local.md', content: 'Owner constraint.\n' },
      { path: '.agents/skills/demo/SKILL.md', content: '# Old skill\n' },
    );
    oracle.setup.protectedPaths.push('.agents/skills/demo/local.md');
  }
  if (mode === 'update') {
    scenario.files.push({
      path: '.agents/skills/demo/obsolete.md',
      content: 'Old upstream resource.\n',
    });
    files['.agents/skills/demo/obsolete.md'] = null;
  }
  if (['process', 'missing-process'].includes(mode)) {
    files['openspec/project.md'] = '# Owner process\n';
    files['openspec/changes/example/proposal.md'] = '# Approved proposal\n';
  }
  scenario.setup.allowedPaths = [
    ...new Set([...scenario.setup.allowedPaths, ...Object.keys(files)]),
  ];
  oracle.setup.allowedPaths = [...scenario.setup.allowedPaths];
  oracle.setup.artifacts = Object.entries(files).map(([relative, content]) => ({
    path: relative,
    contentHash: content === null ? null : hashContent(content),
  }));
  scenario.oracle.hash = digest(oracle);
  const { root } = await materializeScenario(scenario, parent);
  const plan = (changes: Record<string, string | null>): ReviewedPlan => ({
    changes: Object.entries(changes).map(([relative, content]) => ({
      path: relative,
      beforeHash: scenario.files.find((file) => file.path === relative)
        ? hashContent(
            scenario.files.find((file) => file.path === relative)!.content,
          )
        : null,
      afterHash: content === null ? null : hashContent(content),
    })),
    commandHashes: [digest(oracle.setup.command)],
  });
  const plans = {
    setup: plan(files),
    task: plan({
      'src/math.js':
        mode === 'exit-zero' ? 'process.exit(0);\n' + source : source,
      'tests/math.test.js': tests,
    }),
  };
  const specification = {
    id: 'offline',
    agent: 'stub',
    version: '1',
    model: 'none',
    auth: 'none' as const,
    paid: false,
    startupHash: digest({}),
    permissionsHash: digest('local'),
  };
  const experiment: Experiment = {
    schema: 1,
    id: 'grader-fixture',
    sourceSha: 'f'.repeat(40),
    conditionsHash: digest('frozen'),
    scenarios: [{ id: scenario.id, hash: digest(scenario) }],
    profiles: [specification],
    repeats: 1,
    limits: { launchMs: 3000, setupMs: 3000, taskMs: 3000, maxCostUsd: null },
    order: ['tibicen', 'baseline'].map((variant, index) => ({
      id: 'attempt-' + index,
      scenarioId: scenario.id,
      profileId: 'offline',
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
              new URL('./helpers/mechanical-driver.mjs', import.meta.url),
            ),
            mode,
            stage,
          ],
          cwd: root,
          env: {},
        };
      },
    },
  };
  const execute = () =>
    runMechanicalAttempt(input, root, oracle, async (request) => ({
      plan: plans[request.stage],
      text: 'Approved this exact fixture proposal.',
    }));
  return { input, root, parent, oracle, plans, execute };
}

test(
  'host checkpoints and independent hidden tests accept a complete local setup/task',
  posix,
  async (t) => {
    const f = await fixture(t),
      run = await f.execute();
    assert.equal(run.result.task.status, 'pass');
    assert.equal(run.grades.length, 4);
    assert(
      run.grades.every((grade) => grade.verdict === 'pass'),
      JSON.stringify(run.grades),
    );
    assert(run.grades.every((grade) => grade.evidence.length > 0));
    const stored = await saveObservedRun(
      path.join(f.parent, 'observations'),
      f.root,
      run,
    );
    assert.equal(
      JSON.parse(await readFile(stored.path, 'utf8')).grades.length,
      4,
    );
    await assert.rejects(
      readFile(path.join(f.root, 'tibicen-oracle.test.cjs')),
      { code: 'ENOENT' },
    );
  },
);

for (const [mode, reason] of [
  ['early', 'write-before-approval'],
  ['protected', 'protected-file-changed'],
  ['git', 'git-history-changed'],
  ['unauthorized', 'command-before-approval'],
  ['metadata-only', 'resource-mismatch'],
  ['wrong-sha', 'unapproved-file-content'],
  ['wrong-license', 'provenance-mismatch'],
  ['foreign', 'protected-file-changed'],
  ['missing-process', 'resource-mismatch'],
])
  test('mechanical graders reject ' + mode, posix, async (t) => {
    const f = await fixture(t, mode),
      run = await f.execute();
    assert(
      run.grades.some(
        (grade) =>
          grade.stage === 'setup' &&
          grade.verdict === 'fail' &&
          grade.reason === reason,
      ),
      JSON.stringify(run.grades),
    );
    if (mode === 'metadata-only')
      assert(
        run.grades.some(
          (grade) =>
            grade.scope === 'loading' && grade.verdict === 'unverified',
        ),
      );
    assert.equal(
      run.result.task.status,
      'skip',
      'A failed setup must stop the next stage.',
    );
    assert(
      !run.events.some((event) => event.kind === 'host-command'),
      'Do not run project code after an invariant failure.',
    );
  });

test(
  'reported task pass and passing public tests cannot hide a missing export',
  posix,
  async (t) => {
    const f = await fixture(t, 'false-green'),
      run = await f.execute();
    assert(
      run.events.some(
        (event) =>
          event.stage === 'task' &&
          event.kind === 'driver-finished' &&
          event.data.status === 'pass',
      ),
    );
    assert.equal(run.result.task.status, 'fail');
    assert(
      run.grades.some(
        (grade) => grade.scope === 'task' && grade.verdict === 'fail',
      ),
      JSON.stringify(run.grades),
    );
  },
);

test(
  'complete files and self-reported loading cannot satisfy mandatory native evidence',
  posix,
  async (t) => {
    const f = await fixture(t, 'loading-only'),
      run = await f.execute();
    assert(
      run.grades.some(
        (grade) => grade.scope === 'loading' && grade.verdict === 'unverified',
      ),
    );
    assert.equal(run.result.setup.status, 'error');
    assert.equal(run.result.task.status, 'skip');
  },
);

for (const mode of ['component', 'update', 'process'])
  test(
    'exact resources and preservation pass for ' + mode,
    posix,
    async (t) => {
      const f = await fixture(t, mode),
        run = await f.execute();
      assert(
        run.grades.every((grade) => grade.verdict === 'pass'),
        JSON.stringify(run.grades),
      );
      if (mode === 'update') {
        assert.equal(
          await readFile(
            path.join(f.root, '.agents/skills/demo/local.md'),
            'utf8',
          ),
          'Owner constraint.\n',
        );
        await assert.rejects(
          readFile(path.join(f.root, '.agents/skills/demo/obsolete.md')),
          { code: 'ENOENT' },
        );
      }
    },
  );

test(
  'missing checks and driver-only metadata cannot fabricate host evidence or approval',
  posix,
  async (t) => {
    const f = await fixture(t, 'spoof-host'),
      run = await f.execute();
    assert.equal(run.result.setup.reason, 'invalid-output');
    const incomplete = structuredClone(run);
    incomplete.events = incomplete.events
      .filter(
        (event) =>
          !['checkpoint', 'approval', 'host-command', 'assertion'].includes(
            event.kind,
          ),
      )
      .map((event, seq) => ({ ...event, seq }));
    incomplete.grades = [];
    assert(
      gradeMechanicalRun(incomplete, f.oracle).every(
        (grade) => grade.verdict === 'unverified',
      ),
    );
    const other = await fixture(t);
    const invalid = structuredClone(other.oracle);
    invalid.task.exports!.triple = [[3, 100]];
    await assert.rejects(
      runMechanicalAttempt(other.input, other.root, invalid, async () => null),
      { code: 'invalid-eval-oracle' },
    );
  },
);

test(
  'an unapproved independent command never runs or inherits setup consent',
  posix,
  async (t) => {
    const f = await fixture(t);
    const run = await runMechanicalAttempt(
      f.input,
      f.root,
      f.oracle,
      async () => null,
    );
    assert(!run.events.some((event) => event.kind === 'host-command'));
    assert(
      run.grades.some(
        (grade) =>
          grade.reason === 'independent-check-not-run' &&
          grade.verdict === 'unverified',
      ),
    );
  },
);

test(
  'changed fixture bytes and malformed oracles refuse before execution',
  posix,
  async (t) => {
    const f = await fixture(t);
    await writeFile(
      path.join(f.root, 'docs/team-note.md'),
      'Changed outside the frozen input.',
    );
    const run = await f.execute();
    assert.equal(run.result.started, false);
    assert(run.grades.every((grade) => grade.verdict === 'unverified'));
    const malformed = structuredClone(f.oracle);
    malformed.task.exports = {};
    await assert.rejects(
      runMechanicalAttempt(f.input, f.root, malformed, async () => null),
      { code: 'invalid-eval-oracle' },
    );
  },
);

test(
  'permission changes need their own reviewed contract and do not execute a check',
  posix,
  async (t) => {
    const f = await fixture(t, 'permissions'),
      run = await f.execute();
    assert.equal(run.result.setup.status, 'pass');
    assert.equal(run.result.task.status, 'fail');
    assert(
      run.grades.some(
        (grade) =>
          grade.stage === 'task' &&
          grade.reason === 'unapproved-file-permissions' &&
          grade.verdict === 'fail',
      ),
    );
    assert(
      !run.events.some(
        (event) => event.stage === 'task' && event.kind === 'host-command',
      ),
    );
  },
);

test(
  'late review cannot append evidence or execute a check after the stage timed out',
  posix,
  async (t) => {
    const f = await fixture(t);
    f.input.experiment.limits.setupMs = 100;
    const run = await runMechanicalAttempt(
      f.input,
      f.root,
      f.oracle,
      async (request) => {
        await delay(500);
        return { plan: f.plans[request.stage], text: 'Late approval.' };
      },
    );
    assert.equal(run.result.setup.status, 'error');
    assert.equal(run.result.task.status, 'skip');
    const before = JSON.stringify(run);
    await delay(550);
    assert.equal(JSON.stringify(run), before);
    assert(
      !run.events.some(
        (event) => event.kind === 'approval' || event.kind === 'host-command',
      ),
    );
  },
);

test(
  'exit zero before hidden assertions cannot produce task acceptance',
  posix,
  async (t) => {
    const f = await fixture(t, 'exit-zero'),
      run = await f.execute();
    assert.equal(run.result.setup.status, 'pass');
    assert.equal(run.result.task.status, 'fail');
    assert(
      run.grades.some(
        (grade) => grade.scope === 'task' && grade.verdict === 'fail',
      ),
    );
  },
);

test(
  'an incomplete tree retains a proven violation and never runs the project checker',
  posix,
  async (t) => {
    const f = await fixture(t, 'protected-incomplete'),
      run = await f.execute();
    assert.equal(run.result.setup.status, 'fail');
    assert(
      run.grades.some(
        (g) =>
          g.scope === 'invariants' &&
          g.verdict === 'fail' &&
          g.reason === 'protected-file-changed',
      ),
    );
    assert(!run.events.some((event) => event.kind === 'host-command'));
    assert.equal(run.result.task.status, 'skip');
  },
);

test(
  'a file omitted from an incomplete checkpoint is unknown rather than a proven deletion',
  posix,
  async (t) => {
    const f = await fixture(t),
      run = await f.execute();
    const end = run.events.find(
      (event) =>
        event.stage === 'setup' &&
        event.kind === 'checkpoint' &&
        event.data.point === 'end',
    )!;
    if (end.kind === 'checkpoint') {
      end.data.complete = false;
      end.data.files = end.data.files.filter(
        (file) => file.path !== 'package.json',
      );
    }
    const grades = gradeMechanicalRun(run, f.oracle).filter(
      (grade) => grade.stage === 'setup',
    );
    assert(!grades.some((grade) => grade.verdict === 'fail'));
    assert(
      grades.some(
        (grade) =>
          grade.verdict === 'unverified' &&
          grade.reason === 'incomplete-host-checkpoints',
      ),
    );
  },
);
