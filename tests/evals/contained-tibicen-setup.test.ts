import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import { containedCodexImage } from '../../scripts/evals/profiles/codex/contained.ts';
import {
  containedSetupFixtures,
  createContainedTibicenSetup,
  setupCommand,
  setupCommandKind,
  setupHome,
  setupPlan,
  setupRuntime,
  setupLayout,
  setupUsage,
  validateSetupActivity,
  validateSetupCollection,
  validateSetupReports,
  validateSetupMode,
} from '../../scripts/evals/profiles/codex/tibicen-setup.ts';
import { createProposal, isEmptyProject } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { scanProject } from '../../scripts/scan/index.ts';
import type { NativeOutput } from '../../scripts/evals/profiles/contracts.ts';
const root = '/private/tmp/test/project',
  skill = 'tibicen-init',
  approval = 'a'.repeat(64);
const proposal =
  setupCommand(root, skill, 'proposal', ['--input', '-']) +
  " <<'TIBICEN_INTENT'\n" +
  JSON.stringify({ mode: 'init', changes: [] }) +
  '\nTIBICEN_INTENT';
const item = (command: string, output = '{}') => ({
  command,
  output,
  exitCode: 0,
  toolUseId: 'synthetic',
});
const output = (commands: NativeOutput['commands']): NativeOutput => ({
  started: true,
  completed: true,
  commands,
  records: [],
  messages: ['done'],
  usage: { inputTokens: 0, outputTokens: 0 },
});

test('contained first vertical is fixed init/adopt, AGENTS-only and has no application commands', async () => {
  const fixtures = await containedSetupFixtures();
  assert.deepEqual(
    fixtures.map((fixture) => fixture.scenario.id),
    ['contained-init', 'contained-adopt'],
  );
  assert.equal(fixtures[0].scenario.files.length, 0);
  assert.equal(fixtures[1].scenario.files[0].path, 'AGENTS.md');
  for (const fixture of fixtures) {
    assert.deepEqual(fixture.scenario.setup.allowedCommands, []);
    assert.deepEqual(fixture.scenario.task.allowedPaths, []);
    assert.equal(fixture.oracle.setup.command, undefined);
    assert.equal(fixture.interaction.process, false);
  }
});

test('compiled setup mode must match its scenario before approval', () => {
  validateSetupMode('contained-init', 'init');
  validateSetupMode('contained-adopt', 'improve');
  for (const [scenarioId, mode] of [
    ['contained-init', 'improve'],
    ['contained-adopt', 'init'],
    ['contained-adopt', undefined],
    ['unknown-case', 'init'],
  ] as const)
    assert.throws(() => validateSetupMode(scenarioId, mode), {
      code: 'contained-setup-plan',
    });
});

test('only exact HOME/frozen CLI argv and one bounded literal JSON heredoc are observations', () => {
  const scan = setupCommand(root, skill, 'scan');
  assert.equal(setupCommandKind(scan, root, skill), 'scan');
  assert.equal(
    setupCommandKind('/bin/bash -c ' + JSON.stringify(scan), root, skill),
    'scan',
  );
  assert.equal(setupCommandKind(proposal, root, skill), 'proposal');
  assert.equal(
    setupCommandKind(
      "/bin/bash -c '" + proposal.replaceAll("'", "'\"'\"'") + "'",
      root,
      skill,
    ),
    'proposal',
  );
  assert.equal(
    setupCommandKind(
      '/bin/bash -c ' +
        '"' +
        proposal
          .replaceAll('\\', '\\\\')
          .replaceAll('"', '\\"')
          .replaceAll('$', '\\$')
          .replaceAll('`', '\\`') +
        '"',
      root,
      skill,
    ),
    'proposal',
  );
  assert.equal(
    setupCommandKind("cat '" + root + '/AGENTS.md' + "'", root, skill),
    'read',
  );
  for (const bad of [
    scan + '; true',
    scan + '\n',
    scan.replace(' node ', ' node -e '),
    scan.replace(setupHome, 'elsewhere'),
    proposal + '\n',
    proposal.replace("<<'TIBICEN_INTENT'", '<<TIBICEN_INTENT'),
    proposal.replace('{"mode":"init","changes":[]}', '[]'),
    proposal.replace('{"mode":"init","changes":[]}', '{}\necho hidden'),
    proposal.replace(
      '{"mode":"init","changes":[]}',
      JSON.stringify({ extra: 'x'.repeat(65536) }),
    ),
    setupCommand(root, skill, 'proposal', ['--input', '-']),
    "cat '" + root + '/' + setupRuntime + '/' + skill + "/../../outside'",
  ])
    assert.equal(setupCommandKind(bad, root, skill), null, bad.slice(0, 100));
});

test('unknown commands and native file edits fail even if final workspace bytes are restored', () => {
  const safe = output([
    item(setupCommand(root, skill, 'scan')),
    item(proposal),
  ]);
  validateSetupActivity(safe, root, skill, false);
  for (const command of [
    'node -e "writeThenRestore()"',
    'echo forged',
    setupCommand(root, skill, 'verify'),
  ])
    assert.throws(() =>
      validateSetupActivity(
        { ...safe, commands: [...safe.commands, item(command)] },
        root,
        skill,
        false,
      ),
    );
  assert.throws(() =>
    validateSetupActivity(
      {
        ...safe,
        records: [{ type: 'item.completed', item: { type: 'file_change' } }],
      },
      root,
      skill,
      false,
    ),
  );
  assert.throws(() =>
    validateSetupActivity(
      { ...safe, commands: safe.commands.slice(0, 1) },
      root,
      skill,
      false,
    ),
  );
});

test('closed proposal collection rejects writes, deletion, mode changes, extra output and changed support', () => {
  const seed = {
    'protected.txt': Buffer.from('fixed'),
    [setupRuntime + '/' + skill + '/scripts/tibicen.ts']:
      Buffer.from('trusted'),
    [setupHome + '/.keep']: Buffer.from('keep'),
  };
  const modes = Object.fromEntries(
    Object.keys(seed).map((name) => [name, 0o644]),
  );
  validateSetupCollection(seed, { ...seed }, modes);
  for (const name of Object.keys(seed)) {
    assert.throws(() =>
      validateSetupCollection(
        seed,
        { ...seed, [name]: Buffer.from('changed') },
        modes,
      ),
    );
    const missing = { ...seed };
    delete missing[name as keyof typeof missing];
    assert.throws(() => validateSetupCollection(seed, missing, modes));
    assert.throws(() =>
      validateSetupCollection(seed, seed, { ...modes, [name]: 0o600 }),
    );
  }
  assert.throws(() =>
    validateSetupCollection(
      seed,
      { ...seed, extra: Buffer.from('no') },
      { ...modes, extra: 0o644 },
    ),
  );
  assert.throws(() =>
    validateSetupCollection(
      seed,
      { ...seed, [setupUsage]: Buffer.from('{}') },
      { ...modes, [setupUsage]: 0o600 },
    ),
  );
});

test('apply collection accepts only reviewed AGENTS plus completed 0600 services and protected plan', () => {
  const seed = {
    [setupPlan]: Buffer.from('exact plan'),
    [setupHome + '/.keep']: Buffer.from('keep'),
  };
  const files = {
    ...seed,
    'project/AGENTS.md': Buffer.from('approved'),
    'project/.tibicen/manifest.yml': Buffer.from(
      JSON.stringify({
        schema: 2,
        sessions: [{ id: 'one', status: 'complete' }],
      }),
    ),
    [setupUsage]: Buffer.from(
      JSON.stringify({
        schema: 1,
        sessions: [{ id: 'one', status: 'complete' }],
      }),
    ),
  };
  const modes = Object.fromEntries(
    Object.keys(files).map((name) => [
      name,
      name === 'project/.tibicen/manifest.yml' || name === setupUsage
        ? 0o600
        : 0o644,
    ]),
  );
  const plan = {
    changes: [
      {
        path: 'AGENTS.md',
        beforeHash: null,
        afterHash: hashContent(files['project/AGENTS.md']),
      },
    ],
    commandHashes: [],
  };
  validateSetupCollection(seed, files, modes, plan);
  assert.throws(() =>
    validateSetupCollection(
      seed,
      { ...files, [setupPlan]: Buffer.from('changed') },
      modes,
      plan,
    ),
  );
  assert.throws(() =>
    validateSetupCollection(
      seed,
      files,
      { ...modes, [setupUsage]: 0o644 },
      plan,
    ),
  );
  assert.throws(() =>
    validateSetupCollection(
      seed,
      { ...files, 'project/.tibicen/state/session.json': Buffer.from('{}') },
      { ...modes, 'project/.tibicen/state/session.json': 0o600 },
      plan,
    ),
  );
  assert.throws(() =>
    validateSetupCollection(seed, files, modes, {
      changes: [],
      commandHashes: [],
    }),
  );
});

test('native report observations cannot be substituted by unrelated JSON or human claims', () => {
  const commands = [
    item(
      setupCommand(root, skill, 'apply', [
        '--plan',
        setupLayout(root).plan,
        '--approve',
        approval,
      ]),
      '{"status":"complete"}',
    ),
    ...['verify', 'status', 'report'].map((verb) =>
      item(
        setupCommand(root, skill, verb),
        JSON.stringify({ status: verb === 'verify' ? 'passed' : 'complete' }),
      ),
    ),
    item("cat '" + root + "/AGENTS.md'", '# Final rules'),
  ];
  validateSetupActivity(output(commands), root, skill, true, approval);
  validateSetupReports(commands, root, skill, approval);
  const empty = commands.map((command) =>
    command.command.includes("'report'")
      ? { ...command, output: '  \n' }
      : command,
  );
  assert.deepEqual(validateSetupReports(empty, root, skill, approval).report, [
    null,
  ]);
  for (const bad of [
    'null',
    '[]',
    '1',
    '"text"',
    '{broken',
    '{"status":"issues-found"}',
  ]) {
    const invalid = commands.map((command) =>
      command.command.includes("'report'")
        ? { ...command, output: bad }
        : command,
    );
    assert.throws(() => validateSetupReports(invalid, root, skill, approval), {
      code: 'contained-setup-observation',
    });
    assert.throws(
      () =>
        validateSetupReports(
          [
            ...invalid,
            ...empty.filter((command) => command.command.includes("'report'")),
          ],
          root,
          skill,
          approval,
        ),
      { code: 'contained-setup-observation' },
    );
  }
  const twice = validateSetupReports(
    [
      ...commands,
      ...empty.filter((command) => command.command.includes("'report'")),
    ],
    root,
    skill,
    approval,
  );
  assert.deepEqual(twice.report, [{ status: 'complete' }, null]);

  assert.throws(() =>
    validateSetupReports(
      commands.filter((command) => !command.command.includes("'report'")),
      root,
      skill,
      approval,
    ),
  );
  assert.throws(() =>
    validateSetupReports(
      commands.map((command) =>
        command.command.includes("'verify'")
          ? { ...command, output: '{"status":"issues-found"}' }
          : command,
      ),
      root,
      skill,
      approval,
    ),
  );
  assert.throws(() =>
    validateSetupReports(
      commands.map((command) => ({ ...command, command: 'echo forged' })),
      root,
      skill,
      approval,
    ),
  );
});

test('metadata-only batch freeze binds runtime/order/caps and cancellation precedes CLI/auth/container work', async (t) => {
  const directory = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'ts-')),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const binary = path.join(directory, 'synthetic-binary');
  await writeFile(binary, 'never executed');
  const driver = await createContainedTibicenSetup({
    binary,
    binaryHash: hashContent(await readFile(binary)),
    imageId: containedCodexImage,
    route: {
      kind: 'subscription',
      authPath: path.join(directory, 'must-not-read-auth'),
    },
  });
  assert.equal(Object.keys(driver.freeze.runtime).length, 86);
  assert.deepEqual(driver.freeze.order, ['contained-init', 'contained-adopt']);
  assert.equal(driver.freeze.caps.hostSessions, 4);
  assert.equal(driver.freeze.caps.retries, 0);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    driver.run({
      root: directory,
      home: path.join(directory, 'never-home'),
      skill,
      prompt: 'never',
      deadlineAt: performance.now() + 90000,
      signal: controller.signal,
      onStart() {
        throw Error('never');
      },
      async record() {
        throw Error('never');
      },
    }),
    { code: 'contained-setup-cancelled' },
  );
  await assert.rejects(
    driver.check(
      directory,
      skill,
      output([]),
      approval,
      new AbortController().signal,
      performance.now() - 1,
      0,
    ),
    { code: 'contained-setup-cancelled' },
  );
  driver.freeze.runtime['tampered'] = '0'.repeat(64);
  await assert.rejects(driver.validate(), {
    code: 'contained-setup-source-changed',
  });
});

test('fixed sibling support survives real product finalization and is absent from project scan', async (t) => {
  const directory = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tl-')),
  );
  t.after(() => rm(directory, { recursive: true, force: true }));
  const binary = path.join(directory, 'synthetic-binary');
  await writeFile(binary, 'not executed');
  const driver = await createContainedTibicenSetup({
    binary,
    binaryHash: hashContent(await readFile(binary)),
    imageId: containedCodexImage,
    route: { kind: 'synthetic', baseUrl: 'http://127.0.0.1:9/v1' },
  });
  const project = path.join(directory, 'container/project');
  await (await import('node:fs/promises')).mkdir(project, { recursive: true });
  await driver.seed(project, 'tibicen-init');
  const layout = setupLayout(project);
  assert.equal(await isEmptyProject(project), true);
  const scan = await scanProject(project);
  assert.equal(scan.mode, 'init');
  assert.deepEqual(scan.languages, []);
  assert.deepEqual(scan.commands, []);
  assert(scan.files.every((file) => file.path === '.tibicen/.keep'));
  const plan = await createProposal(
    project,
    {
      mode: 'init',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Rules\n\nKeep changes small and obtain owner review.\n',
          reason: 'One useful rule',
          fileMode: 0o644,
        },
      ],
      commands: [],
      checks: {},
      compat: { enabled: false },
    },
    { home: layout.home },
  );
  const result = await applyPlan(project, plan.proposal, {
    approvedDigest: plan.digest,
    home: layout.home,
  });
  assert.equal(result.status, 'complete');
  const cli = path.join(layout.runtime, 'tibicen-init/scripts/tibicen.ts');
  assert.equal(
    hashContent(await readFile(cli)),
    driver.freeze.runtime[setupRuntime + '/tibicen-init/scripts/tibicen.ts'],
  );
  const usage = JSON.parse(
    await readFile(path.join(layout.home, '.tibicen/usage.json'), 'utf8'),
  );
  assert.equal(usage.sessions[0].project, hashContent(project));
  assert.equal(usage.sessions[0].status, 'complete');
  assert.equal(usage.sessions.length, 1);
  assert.equal(
    (await scanProject(project)).files.some((file) =>
      file.path.startsWith('support/'),
    ),
    false,
  );
  assert.equal(digest(plan.proposal), plan.digest);
});
