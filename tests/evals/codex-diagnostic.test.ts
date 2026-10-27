import test from 'node:test';
import assert from 'node:assert/strict';
import os from 'node:os';
import path from 'node:path';
import {
  mkdtemp,
  rm,
  cp,
  writeFile,
  readFile,
  realpath,
} from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import {
  parseNative,
  reviewNativeProposal,
  isNativeNodeTest,
} from '../../scripts/evals/codex-diagnostic.ts';
import {
  loadDiagnostic,
  materializeScenario,
} from '../../scripts/evals/fixtures.ts';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import {
  codexPermissions,
  controlledCodexConfig,
  preflightCodex,
} from '../../scripts/evals/codex-preflight.ts';

test('native readiness requires an observed turn; an agent message or process spawn cannot invent it', () => {
  assert.equal(
    parseNative(
      '{"type":"thread.started"}\n{"type":"item.completed","item":{"type":"agent_message","text":"ready"}}\n',
    ).started,
    false,
  );
  const observed = parseNative(
    '{"type":"turn.started"}\n{"type":"item.completed","item":{"type":"agent_message","text":"done"}}\n{"type":"turn.completed"}\n',
  );
  assert(observed.started && observed.completed);
  assert.deepEqual(observed.messages, ['done']);
  assert.throws(() => parseNative('not-json\n'));
});

test('a test command in proposal data is not a project execution event', () => {
  for (const command of [
    'node --test',
    "/bin/zsh -c 'node --test'",
    '/bin/sh -lc "node --test"',
  ])
    assert(isNativeNodeTest(command), command);
  for (const command of [
    '/bin/zsh -c \'node --input-type=module <<EOF\nconst plan={commands:["node --test"]};\nEOF\'',
    'cat package.json',
    'echo node --test',
    'node --test-not-a-command',
    null,
  ])
    assert(!isNativeNodeTest(command), String(command));
});

test('native review binds exact ordinary changes, rejects protected/duplicate paths and arbitrary execution', async (t) => {
  const { scenario } = await loadDiagnostic('diagnostic-bare');
  const parent = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-native-review-'),
  );
  t.after(() => rm(parent, { recursive: true, force: true }));
  const { root } = await materializeScenario(scenario, parent);
  const proposal = {
    summary: 'One sufficient rule.',
    changes: [{ path: 'AGENTS.md', content: 'Keep double.\n' }],
    commands: ['node --test'],
    kernelPlan: null,
  };
  const reviewed = await reviewNativeProposal(
    proposal,
    scenario,
    'setup',
    root,
  );
  assert.deepEqual(reviewed.plan.changes, [
    {
      path: 'AGENTS.md',
      beforeHash: null,
      afterHash: hashContent('Keep double.\n'),
    },
  ]);
  proposal.changes[0].content = 'Mutated later';
  assert.equal(reviewed.input.changes[0].content, 'Keep double.\n');
  for (const invalid of [
    { ...proposal, changes: [{ path: 'src/math.js', content: 'replace' }] },
    {
      ...proposal,
      changes: [{ path: '.tibicen/manifest.yml', content: 'fake' }],
    },
    { ...proposal, changes: [{ path: '../outside', content: 'escape' }] },
    { ...proposal, changes: [proposal.changes[0], proposal.changes[0]] },
    { ...proposal, commands: ['curl something'] },
    { ...proposal, unexpected: 'field' },
  ])
    await assert.rejects(
      reviewNativeProposal(invalid, scenario, 'setup', root),
      { code: 'native-proposal-rejected' },
    );
});

test('native kernel approval cannot smuggle different edits, execution, sources or an application stage', async (t) => {
  const { scenario } = await loadDiagnostic('diagnostic-bare'),
    parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-native-kernel-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  const { root } = await materializeScenario(scenario, parent);
  const plan = {
    root,
    changes: [
      {
        path: 'AGENTS.md',
        action: 'add',
        beforeHash: null,
        content: 'Owner rules\n',
      },
    ],
    commands: [],
    sources: [],
    componentUpdates: [],
    mcp: [],
    manualActions: [],
    serviceWrites: ['.tibicen/manifest.yml', '.tibicen/state/session.json'],
  };
  const proposal = {
    summary: 'Reviewed',
    changes: [{ path: 'AGENTS.md', content: 'Owner rules\n' }],
    commands: [],
    kernelPlan: JSON.stringify({ proposal: plan, digest: digest(plan) }),
  };
  assert(
    (await reviewNativeProposal(proposal, scenario, 'setup', root)).kernel,
  );
  for (const mutation of [
    { ...plan, root: '/another-project' },
    { ...plan, commands: [{ executable: 'sh', argv: ['-c', 'bad'] }] },
    { ...plan, sources: [{}] },
    { ...plan, serviceWrites: ['/outside'] },
    { ...plan, changes: [{ ...plan.changes[0], content: 'different' }] },
  ])
    await assert.rejects(
      reviewNativeProposal(
        {
          ...proposal,
          kernelPlan: JSON.stringify({
            proposal: mutation,
            digest: digest(mutation),
          }),
        },
        scenario,
        'setup',
        root,
      ),
      { code: 'native-proposal-rejected' },
    );
  await assert.rejects(
    reviewNativeProposal(
      { ...proposal, changes: [], kernelPlan: proposal.kernelPlan },
      scenario,
      'task',
      root,
    ),
    { code: 'native-proposal-rejected' },
  );
});

test('native command startup has no inherited credentials, login hooks, plugins, extra agents or command network', () => {
  const permissions = codexPermissions(
    '/fixture/project',
    '/fixture/home',
    '/fixture',
  );
  assert.equal(permissions.filesystem['/fixture/home'], 'deny');
  assert.equal(permissions.filesystem['/fixture'], 'deny');
  assert.equal(permissions.network.enabled, false);
  const config = controlledCodexConfig('/fixture/home');
  for (const literal of [
    'approval_policy="never"',
    'allow_login_shell=false',
    'web_search="disabled"',
    'shell_environment_policy.inherit="none"',
    'features.plugins=false',
    'features.hooks=false',
    'features.multi_agent=false',
  ])
    assert(config.includes(literal), literal);
  assert(!config.some((value) => value.includes('danger-full-access')));
});

for (const failure of ['check-crash', 'unsafe-tree', 'partial-with-violation'])
  test(
    'native ' +
      failure +
      ' retains every attempt and cannot start task after invalid setup',
    { skip: process.platform === 'win32' },
    async (t) => {
      const root = await realpath(
        await mkdtemp(path.join(os.tmpdir(), 'tibicen-native-offline-')),
      );
      t.after(() => rm(root, { recursive: true, force: true }));
      for (const name of [
        'scripts',
        'references',
        'skills',
        'LICENSE',
        'package.json',
      ])
        await cp(
          new URL('../../' + name, import.meta.url),
          path.join(root, name),
          { recursive: true },
        );
      const { buildSkills } = (await import(
        pathToFileURL(path.join(root, 'scripts/build.ts')).href
      )) as typeof import('../../scripts/build.ts');
      await buildSkills();
      const binary = path.join(root, 'fake-codex');
      await writeFile(
        binary,
        `#!${process.execPath}
import {symlinkSync,writeFileSync} from 'node:fs';
const args=process.argv.slice(2),failure=${JSON.stringify(failure)};
if(args[0]==='sandbox')process.kill(process.pid,'SIGKILL');
console.log(JSON.stringify({type:'turn.started'}));
const proposal=args.includes('--output-schema');
if(!proposal&&failure!=='check-crash')symlinkSync('/missing-target','.unobservable');
if(!proposal&&failure==='partial-with-violation')writeFileSync('package.json','unapproved');
console.log(JSON.stringify({type:'item.completed',item:{type:'agent_message',text:proposal?JSON.stringify({summary:'Offline protocol control',changes:[],commands:['node --test'],kernelPlan:null}):'Done'}}));
console.log(JSON.stringify({type:'turn.completed'}));
`,
        { mode: 0o755 },
      );
      const preflightPath = path.join(root, 'ready.json');
      await writeFile(
        preflightPath,
        JSON.stringify({
          preflight: {
            status: 'ready',
            startupControlled: true,
            authProtected: true,
            processTreeControlled: true,
            isolation: 'controlled',
          },
          cli: {
            path: binary,
            version: 'codex-cli 0.157.0',
            binaryHash: hashContent(await readFile(binary)),
          },
          candidateModel: 'gpt-6-sol',
          startupHash: digest('offline-startup'),
          permissionsHash: digest('offline-permissions'),
        }),
      );
      const { runTrustedCodexFixtureDiagnostics } = (await import(
        pathToFileURL(path.join(root, 'scripts/evals/codex-diagnostic.ts')).href
      )) as typeof import('../../scripts/evals/codex-diagnostic.ts');
      const result = await runTrustedCodexFixtureDiagnostics({
        preflightPath,
        artifactDirectory: path.join(root, 'observed'),
        sourceSha: 'a'.repeat(40),
      });
      const runs = result.experiments[0].runs;
      assert.equal(runs.length, 4);
      for (const { run } of runs) {
        assert.equal(
          run.result.setup.status,
          failure === 'unsafe-tree' ? 'error' : 'fail',
        );
        assert.equal(run.result.task.status, 'skip');
        assert.equal(
          run.result.setup.reason,
          failure === 'check-crash'
            ? 'independent-check-failed'
            : failure === 'unsafe-tree'
              ? 'native-unsafe-tree'
              : 'native-plan-mismatch',
        );
        if (failure !== 'check-crash')
          assert(
            run.events.some(
              (event) => event.kind === 'checkpoint' && !event.data.complete,
            ),
          );
        if (failure === 'partial-with-violation')
          assert(
            run.grades.some(
              (grade) =>
                grade.scope === 'invariants' && grade.verdict === 'fail',
            ),
          );
        assert(
          JSON.parse(
            await readFile(
              path.join(root, 'observed', run.result.id + '-run.json'),
              'utf8',
            ),
          ).result.task.status === 'skip',
        );
      }
    },
  );

test('native preflight blocks before CLI, auth, model or private scope startup', async (t) => {
  const root = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-preflight-block-'),
  );
  t.after(() => rm(root, { recursive: true, force: true }));
  const marker = path.join(root, 'must-not-launch');
  const binary = path.join(root, 'fake-codex');
  await writeFile(
    binary,
    `#!${process.execPath}\nrequire('node:fs').writeFileSync(${JSON.stringify(marker)},'bad');\n`,
    { mode: 0o755 },
  );
  const result = await preflightCodex(binary, true);
  assert.equal(
    result.preflight.reason,
    'native-process-containment-unavailable',
  );
  assert.equal(result.preflight.processTreeControlled, false);
  assert.equal(result.modelRequests, 0);
  assert.equal(result.startup, null);
  await assert.rejects(readFile(marker), { code: 'ENOENT' });
});
