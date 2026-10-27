import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { digest } from '../../scripts/core/contracts.ts';
import { executorScenario } from '../../scripts/evals/contracts.ts';
import {
  diagnosticScenarios,
  loadDiagnostic,
  materializeScenario,
} from '../../scripts/evals/fixtures.ts';

for (const id of diagnosticScenarios)
  test(
    id +
      ' has identical independent inputs for both variants without hidden material',
    async (t) => {
      const { scenario, oracle } = await loadDiagnostic(id);
      assert.equal(scenario.oracle.hash, digest(oracle));
      const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-fixtures-'));
      t.after(() => rm(parent, { recursive: true, force: true }));
      const tibicen = await materializeScenario(scenario, parent);
      const baseline = await materializeScenario(scenario, parent);
      assert.notEqual(tibicen.root, baseline.root);
      assert.deepEqual(tibicen.scenario, baseline.scenario);
      async function list(root: string, prefix = ''): Promise<string[]> {
        const result: string[] = [];
        for (const item of await readdir(path.join(root, prefix), {
          withFileTypes: true,
        })) {
          const name = path.posix.join(prefix, item.name);
          if (item.isDirectory()) result.push(...(await list(root, name)));
          else result.push(name);
        }
        return result.sort();
      }
      assert.deepEqual(
        await list(tibicen.root),
        scenario.files.map((file) => file.path).sort(),
      );
      for (const file of scenario.files) {
        assert.equal(
          await readFile(path.join(tibicen.root, file.path), 'utf8'),
          file.content,
        );
        assert.equal(
          await readFile(path.join(baseline.root, file.path), 'utf8'),
          file.content,
        );
      }
      const publicText = JSON.stringify(tibicen.scenario);
      assert(!publicText.includes('oracle'));
      for (const phase of ['setup', 'task'] as const)
        for (const reply of scenario[phase].replies)
          assert(!publicText.includes(reply.text));
      assert(!scenario.setup.allowedPaths.includes('src/math.js'));
      assert(!scenario.setup.allowedPaths.includes('package.json'));
      assert.deepEqual(scenario.task.allowedPaths, [
        'src/math.js',
        'tests/math.test.js',
      ]);
      assert.equal(
        scenario.setup.allowedCommands[0],
        digest({ executable: 'node', argv: ['--test'], cwd: '.' }),
      );
      await writeFile(
        path.join(tibicen.root, 'src/math.js'),
        'changed in one attempt',
      );
      assert.equal(
        await readFile(path.join(baseline.root, 'src/math.js'), 'utf8'),
        scenario.files.find((file) => file.path === 'src/math.js')!.content,
      );
      assert.equal(
        digest((await loadDiagnostic(id)).scenario),
        digest(scenario),
      );
    },
  );

test('diagnostics distinguish missing infrastructure from contradictory project rules', async () => {
  const bare = (await loadDiagnostic('diagnostic-bare')).scenario;
  const conflicts = (await loadDiagnostic('diagnostic-conflicts')).scenario;
  assert(!bare.files.some((file) => file.path === 'AGENTS.md'));
  assert(
    conflicts.files
      .find((file) => file.path === 'AGENTS.md')!
      .content.includes('Owner review'),
  );
  assert(
    conflicts.files
      .find((file) => file.path.endsWith('SKILL.md'))!
      .content.includes('yarn check'),
  );
  for (const file of bare.files)
    assert.deepEqual(
      conflicts.files.find((item) => item.path === file.path),
      file,
    );
  assert.notEqual(digest(bare), digest(conflicts));
});

test('materialization refuses escapes and cleans up an impossible input tree', async (t) => {
  const { scenario } = await loadDiagnostic('diagnostic-bare');
  const parent = await mkdtemp(path.join(os.tmpdir(), 'tibicen-fixtures-'));
  t.after(() => rm(parent, { recursive: true, force: true }));
  await assert.rejects(
    materializeScenario(
      { ...scenario, files: [{ path: '../outside', content: 'no' }] },
      parent,
    ),
    { code: 'unsafe-path' },
  );
  await assert.rejects(
    materializeScenario(
      {
        ...scenario,
        files: [
          { path: 'file', content: 'no' },
          { path: 'file/child', content: 'no' },
        ],
      },
      parent,
    ),
  );
  assert.deepEqual(await readdir(parent), []);
  const projected = executorScenario(scenario);
  projected.files[0].content = 'mutated projection';
  assert.notEqual(projected.files[0].content, scenario.files[0].content);
});
