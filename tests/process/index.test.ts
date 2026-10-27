import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { tmpdir } from 'node:os';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  readdir,
  rm,
  realpath,
  symlink,
  cp,
  rename,
} from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan, getStatus } from '../../scripts/core/apply.ts';
import { digest } from '../../scripts/core/contracts.ts';
import { verifyInfrastructure } from '../../scripts/verify/index.ts';
import type { ProcessInput } from '../../scripts/process/index.ts';

const processInput: ProcessInput = {
  framework: 'openspec',
  version: '1.14.3',
  agent: 'codex',
  agentVersion: '0.157.0',
};
const instructions = '.agents/skills/tibicen-openspec/SKILL.md';
async function put(root: string, relative: string, content: string) {
  await mkdir(path.dirname(path.join(root, relative)), { recursive: true });
  await writeFile(path.join(root, relative), content);
}
async function fixture(t: TestContext) {
  const base = await realpath(
    await mkdtemp(path.join(tmpdir(), 'tibicen-process-')),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'project'),
    home = path.join(base, 'home'),
    cli = path.join(base, 'external-cli');
  await Promise.all([mkdir(root), mkdir(home), mkdir(cli)]);
  await put(root, 'src/math.js', 'export const double = n => n * 2;\n');
  await put(
    root,
    'AGENTS.md',
    '# Owner rules\r\nKeep application and CI.  \r\n',
  );
  await put(
    cli,
    'package.json',
    JSON.stringify({
      name: '@fission-ai/openspec',
      version: '1.14.3',
      license: 'MIT',
    }),
  );
  await put(
    cli,
    'bin/openspec.js',
    'throw new Error("A package-resource check must never execute this file");\n',
  );
  await put(cli, 'schemas/spec-driven/schema.yaml', 'name: spec-driven\n');
  for (const name of ['proposal', 'design', 'spec', 'tasks'])
    await put(
      cli,
      'schemas/spec-driven/templates/' + name + '.md',
      '# Fixture ' + name,
    );
  const input = {
    mode: 'improve',
    process: { ...processInput, cliPackageRoot: cli },
  };
  return { base, root, home, cli, input };
}
async function apply(root: string, home: string, input: unknown) {
  const plan = await createProposal(root, input, { home });
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  return { plan, result };
}

test('bounded init is read-only before exact approval and does not execute an external CLI', async (t) => {
  const { root, home, input } = await fixture(t);
  const plan = await createProposal(root, input, { home });
  assert.equal(plan.proposal.changes.length, 4);
  assert.equal(plan.proposal.commands.length, 0);
  assert.equal(plan.summary.process!.verification.loading, 'unverified');
  assert.deepEqual(await readdir(root), ['AGENTS.md', 'src']);
  assert.deepEqual(await readdir(home), []);
  await assert.rejects(applyPlan(root, plan, { home }), {
    code: 'consent-required',
  });
  const result = await applyPlan(root, plan, {
    home,
    approvedDigest: plan.digest,
  });
  assert.equal(result.status, 'complete');
  assert.equal(
    result.checks.infrastructure.process!.cliExecution,
    'unverified',
  );
  assert.deepEqual(result.manifest!.process, plan.proposal.process);
  assert.deepEqual(result.manifest!.sessions[0].process, plan.proposal.process);
  assert.equal(
    await readFile(path.join(root, 'AGENTS.md'), 'utf8'),
    '# Owner rules\r\nKeep application and CI.  \r\n',
  );
  assert.equal(
    await readFile(path.join(root, 'src/math.js'), 'utf8'),
    'export const double = n => n * 2;\n',
  );
  assert.equal((await verifyInfrastructure(root)).status, 'passed');
  assert.deepEqual(
    (await createProposal(root, input, { home })).proposal.changes,
    [],
  );
});

test('missing external CLI remains an explicit manual action across unrelated proposals', async (t) => {
  const { root, home } = await fixture(t);
  const { result } = await apply(root, home, {
    mode: 'improve',
    process: processInput,
  });
  assert.equal(result.status, 'manual-action-required');
  const next = await createProposal(root, { mode: 'improve' }, { home });
  assert.equal(next.proposal.manualActions[0].id, 'openspec-cli');
  assert.equal(next.proposal.manualActions[0].status, 'pending');
  assert.deepEqual(next.proposal.changes, []);
  assert.equal(
    (await applyPlan(root, next, { home, approvedDigest: next.digest })).status,
    'manual-action-required',
  );
});

test('a raw plan cannot remove, complete or waive the missing CLI action', async (t) => {
  const { root, home } = await fixture(t);
  const plan = await createProposal(
    root,
    { mode: 'improve', process: processInput },
    { home },
  );
  for (const mutation of ['remove', 'done', 'optional']) {
    const raw = structuredClone(plan.proposal);
    if (mutation === 'remove') raw.manualActions = [];
    else if (mutation === 'done') raw.manualActions[0].status = 'done';
    else raw.manualActions[0].required = false;
    await assert.rejects(
      applyPlan(root, raw, { home, approvedDigest: digest(raw) }),
      { code: 'invalid-process' },
      mutation,
    );
    assert.deepEqual(await readdir(root), ['AGENTS.md', 'src']);
    assert.deepEqual(await readdir(home), []);
  }
  assert.equal(
    (await applyPlan(root, plan, { home, approvedDigest: plan.digest })).status,
    'manual-action-required',
  );
});

for (const existingCli of [true, false])
  test(
    'preserved instructions require an explicit command update when ' +
      (existingCli ? 'moving' : 'registering') +
      ' the CLI',
    async (t) => {
      const { base, root, home, input, cli } = await fixture(t);
      const original = existingCli
        ? input
        : { mode: 'improve', process: processInput };
      await apply(root, home, original);
      const local =
        (await readFile(path.join(root, instructions), 'utf8')) +
        '\nOwner process extension\n';
      await put(root, instructions, local);
      await apply(root, home, original);
      const beforeMove = await createProposal(root, original, { home });
      const moved = path.join(base, 'moved-cli');
      await rename(cli, moved);
      const next = {
        ...input,
        process: { ...input.process, cliPackageRoot: moved },
      };
      await assert.rejects(createProposal(root, next, { home }), {
        code: 'process-instructions-cli-conflict',
      });
      assert.equal(
        await readFile(path.join(root, instructions), 'utf8'),
        local,
      );

      const replacement = await createProposal(
        root,
        { ...next, process: { ...next.process, instructions: 'replace' } },
        { home },
      );
      assert.equal(replacement.proposal.changes.length, 1);
      assert(
        replacement.proposal.changes[0].content!.includes(
          path.join(moved, 'bin/openspec.js'),
        ),
      );
      const raw = structuredClone(beforeMove.proposal);
      raw.process!.cli = replacement.proposal.process!.cli;
      for (const mode of ['preserved', 'generated'] as const) {
        raw.process!.instructionMode = mode;
        await assert.rejects(
          applyPlan(root, raw, { home, approvedDigest: digest(raw) }),
          { code: 'stale-process' },
        );
      }
      assert.equal(
        await readFile(path.join(root, instructions), 'utf8'),
        local,
      );

      const newInvocation = replacement.proposal.changes[0]
        .content!.split('\n')
        .find((line) => line.startsWith('CLI invocation:'))!;
      await put(root, instructions, local + '\n' + newInvocation + '\n');
      await assert.rejects(createProposal(root, next, { home }), {
        code: 'process-instructions-cli-conflict',
      });
      const repaired = local.replace(/^CLI invocation:.*$/m, newInvocation);
      await put(root, instructions, repaired);
      const accepted = await apply(root, home, next);
      assert.equal(accepted.result.status, 'complete');
      assert.equal(
        accepted.result.manifest!.process!.instructionMode,
        'preserved',
      );
      assert.equal(
        await readFile(path.join(root, instructions), 'utf8'),
        repaired,
      );
      assert.deepEqual(
        (await createProposal(root, next, { home })).proposal.changes,
        [],
      );
    },
  );

test('Claude receives its own checked instruction path without rewriting the owner entrypoint', async (t) => {
  const { root, home, input } = await fixture(t);
  await put(root, 'CLAUDE.md', '# Existing Claude instructions\n');
  const { result } = await apply(root, home, {
    ...input,
    process: {
      ...input.process,
      agent: 'claude-code',
      agentVersion: '2.1.283',
    },
  });
  assert.equal(result.status, 'complete');
  assert.equal(
    await readFile(path.join(root, 'CLAUDE.md'), 'utf8'),
    '# Existing Claude instructions\n',
  );
  assert(
    (
      await readFile(
        path.join(root, '.claude/skills/tibicen-openspec/SKILL.md'),
        'utf8',
      )
    ).includes('instructions apply'),
  );
});

test('adoption preserves existing config, templates and changes; local instruction replacement is explicit', async (t) => {
  const { root, home, input } = await fixture(t);
  const config = 'schema: spec-driven\ncontext: |\n  Keep owner decisions.\n';
  await put(root, 'openspec/config.yml', config);
  await put(root, 'openspec/templates/proposal.md', 'Owner template\n');
  await put(root, 'openspec/changes/keep-double/tasks.md', 'Owner work\n');
  const first = await apply(root, home, input);
  assert(
    !first.plan.proposal.changes.some(
      (file) =>
        file.path.endsWith('config.yaml') || file.path.endsWith('config.yml'),
    ),
  );
  const local =
    (await readFile(path.join(root, instructions), 'utf8')) +
    '\nOwner process extension\n';
  await put(root, instructions, local);
  const preserved = await apply(root, home, input);
  assert.equal(await readFile(path.join(root, instructions), 'utf8'), local);
  assert.equal(preserved.result.status, 'complete');
  assert.equal(
    preserved.result.manifest!.process!.instructionMode,
    'preserved',
  );
  assert.deepEqual(
    (await createProposal(root, input, { home })).proposal.changes,
    [],
    'A later no-op must not undo previously preserved owner instructions.',
  );
  const replacement = await createProposal(
    root,
    { ...input, process: { ...input.process, instructions: 'replace' } },
    { home },
  );
  assert.equal(replacement.proposal.changes.length, 1);
  assert.notEqual(replacement.digest, preserved.plan.digest);
  await assert.rejects(
    applyPlan(root, replacement, {
      home,
      approvedDigest: preserved.plan.digest,
    }),
    { code: 'consent-required' },
  );
  await applyPlan(root, replacement, {
    home,
    approvedDigest: replacement.digest,
  });
  assert.equal(
    await readFile(path.join(root, 'openspec/config.yml'), 'utf8'),
    config,
  );
  assert.equal(
    await readFile(path.join(root, 'openspec/templates/proposal.md'), 'utf8'),
    'Owner template\n',
  );
  assert.equal(
    await readFile(
      path.join(root, 'openspec/changes/keep-double/tasks.md'),
      'utf8',
    ),
    'Owner work\n',
  );
  assert.equal((await getStatus(root)).manifest!.sessions.length, 3);
});

test('registered resource drift is detected independently, including a permissive custom verifier', async (t) => {
  const { root, home, input } = await fixture(t);
  await apply(root, home, input);
  await put(root, instructions, 'Stale resource\n');
  const checked = await verifyInfrastructure(root);
  assert.equal(checked.status, 'issues-found');
  assert(
    checked.issues!.some(
      (issue) => issue.reason === 'process-resource-changed',
    ),
  );
  const next = await createProposal(
    root,
    { ...input, process: { ...input.process, instructions: 'replace' } },
    { home },
  );
  const result = await applyPlan(root, next, {
    home,
    approvedDigest: next.digest,
    verify: async () => {
      await put(root, instructions, 'Unexpected change while verifying\n');
      return { infrastructure: { kind: 'infrastructure', status: 'passed' } };
    },
  });
  assert.equal(result.status, 'incomplete');
  assert(
    result.checks.infrastructure.issues!.some(
      (issue) => issue.reason === 'process-resource-changed',
    ),
  );
});

for (const [name, mutation, expected] of [
  ['unknown CLI version', { version: '99.0' }, 'unsupported-process-version'],
  [
    'unknown process framework',
    { framework: 'spec-kit' },
    'unsupported-process-version',
  ],
  [
    'unverified agent version',
    { agentVersion: '99' },
    'unsupported-process-agent',
  ],
  [
    'arbitrary initializer',
    { initializer: { executable: 'git', argv: ['commit'] } },
    'invalid-process',
  ],
] as const)
  test(name + ' is refused before writes or execution', async (t) => {
    const { root, home, input } = await fixture(t);
    await assert.rejects(
      createProposal(
        root,
        { ...input, process: { ...input.process, ...mutation } },
        { home },
      ),
      { code: expected },
    );
    assert.deepEqual(await readdir(root), ['AGENTS.md', 'src']);
    assert.deepEqual(await readdir(home), []);
  });

test('resource and configuration conflicts cannot expand the infrastructure write boundary', async (t) => {
  const { root, home, input, cli } = await fixture(t);
  await assert.rejects(
    createProposal(
      root,
      {
        ...input,
        changes: [
          {
            path: 'openspec/changes/owner/tasks.md',
            content: 'Overwrite',
            reason: 'Not a service path',
          },
        ],
      },
      { home },
    ),
    { code: 'application-protected' },
  );
  await put(root, 'openspec/config.yaml', 'schema: custom\n');
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsupported-process-config',
  });
  await put(
    root,
    'openspec/config.yaml',
    'schema: spec-driven\nstore: elsewhere\n',
  );
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsupported-process-config',
  });
  await put(
    root,
    'openspec/config.yaml',
    'schema: spec-driven\n"store": elsewhere\n',
  );
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsupported-process-config',
  });
  await put(
    root,
    'openspec/config.yaml',
    'schema: spec-driven\ndefaults: &settings\n  store: elsewhere\n<<: *settings\n',
  );
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsupported-process-config',
  });
  await put(
    root,
    'openspec/config.yaml',
    'schema: spec-driven\n---\ncontext: a second document\n',
  );
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsupported-process-config',
  });
  await rm(path.join(root, 'openspec/config.yaml'));
  await put(root, instructions, 'Foreign file\n');
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'process-path-conflict',
  });
  await rm(path.join(root, instructions));
  await symlink(path.join(root, 'src'), path.join(root, 'openspec/specs'));
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'unsafe-path',
  });
  await rm(path.join(root, 'openspec/specs'));
  await rm(path.join(cli, 'schemas/spec-driven/templates/tasks.md'));
  await assert.rejects(createProposal(root, input, { home }), {
    code: 'ENOENT',
  });
});

test('changed CLI resources, hidden process removal and forged service paths reject an approved raw plan', async (t) => {
  const { root, home, input, cli } = await fixture(t);
  const plan = await createProposal(root, input, { home });
  await put(
    cli,
    'schemas/spec-driven/templates/tasks.md',
    'Changed after review\n',
  );
  await assert.rejects(
    applyPlan(root, plan, { home, approvedDigest: plan.digest }),
    { code: 'stale-process' },
  );
  const next = await apply(root, home, input);
  const forged = structuredClone(next.plan.proposal);
  forged.process!.files[0].path = 'package.json';
  await assert.rejects(
    applyPlan(root, forged, { home, approvedDigest: digest(forged) }),
    { code: 'invalid-process' },
  );
  const omitted = structuredClone(next.plan.proposal);
  delete omitted.process;
  omitted.changes = [];
  await assert.rejects(
    applyPlan(root, omitted, { home, approvedDigest: digest(omitted) }),
    { code: 'invalid-process' },
  );
});

test('a hard interruption retains process ownership and resumes through a newly reviewed plan', async (t) => {
  const { base, root, home, input, cli } = await fixture(t);
  const plan = await createProposal(root, input, { home });
  const runner = path.join(base, 'interrupt.mjs');
  await writeFile(
    runner,
    [
      'import { applyPlan } from ' +
        JSON.stringify(
          new URL('../../scripts/core/apply.ts', import.meta.url).href,
        ) +
        ';',
      'let text = ""; for await (const part of process.stdin) text += part;',
      'const plan = JSON.parse(text);',
      'await applyPlan(process.argv[2], plan, {home: process.argv[3], approvedDigest:plan.digest, checkpoint(point) {if(point === "after-file-write") process.exit(73);}});',
    ].join('\n'),
  );
  const crashed = spawnSync(process.execPath, [runner, root, home], {
    input: JSON.stringify(plan),
    encoding: 'utf8',
    timeout: 15000,
  });
  assert.equal(crashed.status, 73, crashed.stderr);
  const replacementCli = path.join(base, 'replacement-cli');
  await cp(cli, replacementCli, { recursive: true });
  const recovered = await createProposal(
    root,
    { ...input, process: { ...input.process, cliPackageRoot: replacementCli } },
    { home },
  );
  assert(recovered.proposal.process);
  assert.equal((await getStatus(root)).status, 'incomplete');
  const result = await applyPlan(root, recovered, {
    home,
    resume: true,
    approvedDigest: recovered.digest,
  });
  assert.equal(result.status, 'complete');
  assert.deepEqual(result.manifest!.process, recovered.proposal.process);
  assert.equal(result.manifest!.sessions.length, 1);
  assert.deepEqual(
    result.manifest!.sessions[0].processHistory!.map(
      (item) => item.cli!.packageRoot,
    ),
    [cli, replacementCli],
  );
  assert.equal((await verifyInfrastructure(root)).status, 'passed');
});

test('the separately installed real CLI sees the bounded root, templates and change stages without init', async (t) => {
  const { root, home } = await fixture(t);
  const cli = await realpath(
    new URL('../../node_modules/@fission-ai/openspec', import.meta.url),
  );
  const { result } = await apply(root, home, {
    mode: 'improve',
    process: { ...processInput, cliPackageRoot: cli },
  });
  assert.equal(result.status, 'complete');
  const command = (...args: string[]) => {
    const run = spawnSync(
      process.execPath,
      [path.join(cli, 'bin/openspec.js'), ...args],
      {
        cwd: root,
        env: {
          PATH: process.env.PATH,
          HOME: home,
          XDG_CONFIG_HOME: path.join(home, '.config'),
          CI: '1',
          OPENSPEC_TELEMETRY: '0',
          DO_NOT_TRACK: '1',
        },
        encoding: 'utf8',
        timeout: 15000,
      },
    );
    assert.equal(run.status, 0, run.stderr + run.stdout);
    const offset = run.stdout.indexOf('{');
    return JSON.parse(run.stdout.slice(offset));
  };
  assert.equal(command('list', '--json').root.source, 'nearest');
  command('new', 'change', 'add-triple', '--json');
  const status = command('status', '--change', 'add-triple', '--json');
  assert.equal(status.schemaName, 'spec-driven');
  const instruction = command(
    'instructions',
    'proposal',
    '--change',
    'add-triple',
    '--json',
  );
  assert(instruction.template.includes('Why'));
  assert.equal(
    (await verifyInfrastructure(root)).process!.loading,
    'unverified',
    'Native CLI checks do not prove agent loading.',
  );
});
