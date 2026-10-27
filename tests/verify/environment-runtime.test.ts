import type { TestContext } from 'node:test';
import type { Proposal } from '../../scripts/core/types.ts';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  mkdtemp,
  mkdir,
  writeFile,
  readFile,
  rm,
  symlink,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createProposal } from '../../scripts/core/plan.ts';
import { applyPlan } from '../../scripts/core/apply.ts';
import { runtimeHooks } from '../../scripts/core/runtime.ts';
import { digest, validateProposal } from '../../scripts/core/contracts.ts';

async function fixture(t: TestContext) {
  const base = await mkdtemp(
    path.join(os.tmpdir(), 'tibicen-environment-runtime-'),
  );
  t.after(() => rm(base, { recursive: true, force: true }));
  const root = path.join(base, 'app'),
    home = path.join(base, 'home');
  await mkdir(path.join(root, 'node_modules/tiny'), { recursive: true });
  await mkdir(home);
  await writeFile(path.join(root, 'package.json'), '{"type":"module"}\n');
  await writeFile(
    path.join(root, 'node_modules/tiny/package.json'),
    '{"type":"module","exports":"./index.js"}\n',
  );
  await writeFile(
    path.join(root, 'node_modules/tiny/index.js'),
    'export default 2;\n',
  );
  // A second execution on a reused dependency tree would fail before mutating it again.
  await writeFile(
    path.join(root, 'check.js'),
    `import value from 'tiny';
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
assert.equal(value, 2);
await writeFile('node_modules/tiny/index.js', 'export default 999;\\n');
await writeFile('generated-cache', 'execution only');
console.log('passed');
`,
  );
  return { root, home };
}

async function plan(root: string, home: string, withEnvironment = true) {
  return createProposal(
    root,
    {
      mode: 'improve',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Project instructions\n',
          reason: 'Add entrypoint.',
        },
      ],
      commands: [
        {
          id: 'test',
          kind: 'test',
          executable: 'node',
          argv: ['check.js'],
          cwd: '.',
          envNames: [],
          trusted: true,
        },
      ],
      checks: {
        profile: 'web',
        environmentReady: true,
        ...(withEnvironment
          ? {
              environment: {
                kind: 'local-node-modules' as const,
                roots: ['node_modules'],
              },
            }
          : {}),
      },
    },
    { home },
  );
}

async function execute(
  root: string,
  home: string,
  envelope: { proposal: Proposal; digest: string },
) {
  const hooks = runtimeHooks(root, envelope.proposal, envelope.digest);
  let baseline: Awaited<ReturnType<typeof hooks.beforeApply>> = null;
  try {
    const result = await applyPlan(root, envelope, {
      home,
      approvedDigest: envelope.digest,
      async beforeApply(proposal, execution) {
        baseline = await hooks.beforeApply(proposal, execution);
        return baseline;
      },
      verify: hooks.verify,
    });
    return {
      ...result,
      baseline: baseline as Awaited<ReturnType<typeof hooks.beforeApply>>,
    };
  } finally {
    await hooks.cleanup();
  }
}

test('approved dependencies are fresh for baseline/final and never mutate the source', async (t) => {
  const { root, home } = await fixture(t);
  const envelope = await plan(root, home);
  assert.equal(envelope.proposal.commands[0].executable, process.execPath);
  const originalPath = process.env.PATH;
  let result;
  try {
    process.env.PATH = path.join(home, 'no-node-here');
    result = await execute(root, home, envelope);
  } finally {
    process.env.PATH = originalPath;
  }
  assert.equal(result.status, 'complete');
  assert.equal(result.checks.verify.status, 'green');
  assert.equal(result.baseline?.runs.length, 1);
  assert.equal(result.baseline?.runs[0].exitCode, 0);
  assert.equal(
    await readFile(path.join(root, 'node_modules/tiny/index.js'), 'utf8'),
    'export default 2;\n',
  );
  await assert.rejects(readFile(path.join(root, 'generated-cache')), {
    code: 'ENOENT',
  });
});

test('a compiled dependency check cannot use a PATH-selected runtime', async (t) => {
  const { root, home } = await fixture(t);
  const envelope = await plan(root, home);
  envelope.proposal.commands[0].executable = 'node';
  envelope.digest = digest(envelope.proposal);
  const result = await execute(root, home, envelope);
  assert.equal(result.checks.verify.status, 'unverified');
  assert.equal(
    result.checks.verify.reason,
    'node-environment-runtime-mismatch',
  );
  assert.equal(result.baseline?.runs.length, 0);
});

test('dependency environments reject a package manager as the check runtime', async (t) => {
  const { root, home } = await fixture(t);
  await assert.rejects(
    createProposal(
      root,
      {
        mode: 'improve',
        changes: [],
        commands: [
          {
            id: 'test',
            kind: 'test',
            executable: 'pnpm',
            argv: ['test'],
            cwd: '.',
            envNames: [],
            trusted: true,
          },
        ],
        checks: {
          profile: 'web',
          environmentReady: true,
          environment: { kind: 'local-node-modules', roots: ['node_modules'] },
        },
      },
      { home },
    ),
    { code: 'invalid-node-environment' },
  );
});

test('environment bytes are bound to proposal digest; earlier plans remain compatible', async (t) => {
  const { root, home } = await fixture(t);
  const first = await plan(root, home);
  const legacy = await plan(root, home, false);
  assert.equal(legacy.proposal.checks.environment, undefined);
  await writeFile(
    path.join(root, 'node_modules/tiny/index.js'),
    'export default 3;\n',
  );
  const second = await plan(root, home);
  assert.notEqual(
    first.proposal.checks.environment!.hash,
    second.proposal.checks.environment!.hash,
  );
  assert.notEqual(first.digest, second.digest);
  assert.equal(validateProposal(legacy.proposal).checks.environment, undefined);
  assert.throws(
    () =>
      validateProposal({
        ...first.proposal,
        checks: {
          ...first.proposal.checks,
          environment: { kind: 'local-node-modules', roots: ['node_modules'] },
        },
      }),
    { code: 'invalid-node-environment' },
  );
});

for (const unavailable of ['changed', 'missing']) {
  test(`${unavailable} approved dependencies leave project checks unverified`, async (t) => {
    const { root, home } = await fixture(t);
    const envelope = await plan(root, home);
    if (unavailable === 'changed')
      await writeFile(
        path.join(root, 'node_modules/tiny/index.js'),
        'export default 3;\n',
      );
    else await rm(path.join(root, 'node_modules'), { recursive: true });
    const result = await execute(root, home, envelope);
    assert.equal(result.status, 'complete');
    assert.equal(result.checks.verify.status, 'unverified');
    assert.equal(
      result.checks.verify.reason,
      unavailable === 'changed'
        ? 'node-environment-changed'
        : 'node-environment-unavailable',
    );
    assert.equal(result.baseline?.runs.length, 0);
    await assert.rejects(readFile(path.join(root, 'generated-cache')), {
      code: 'ENOENT',
    });
  });
}

test('a workspace link absent from the copied source cannot produce green checks', async (t) => {
  const { root, home } = await fixture(t);
  await symlink(
    '../missing-workspace',
    path.join(root, 'node_modules/workspace'),
  );
  const result = await execute(root, home, await plan(root, home));
  assert.equal(result.checks.verify.status, 'unverified');
  assert.equal(
    result.checks.verify.reason,
    'node-environment-link-unavailable',
  );
  assert.equal(result.baseline?.runs.length, 0);
});
