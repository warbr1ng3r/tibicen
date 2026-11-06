import assert from 'node:assert/strict';
import {
  mkdtemp,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { digest, hashContent } from '../../scripts/core/contracts.ts';
import {
  executorScenario,
  validateScenario,
} from '../../scripts/evals/contracts.ts';
import { materializeScenario } from '../../scripts/evals/fixtures.ts';

const directory = path.dirname(fileURLToPath(import.meta.url));
const repository = path.resolve(directory, '../..');
const freeze = JSON.parse(
  await readFile(path.join(directory, 'freeze.json'), 'utf8'),
);

async function checkHashes() {
  for (const [base, entries] of [
    [repository, freeze.sources],
    [directory, freeze.inputs],
  ] as const)
    for (const [name, expected] of Object.entries(entries))
      assert.equal(
        hashContent(await readFile(path.join(base, name))),
        expected,
        name,
      );
}

async function inventory(root: string, prefix = ''): Promise<string[]> {
  const files: string[] = [];
  for (const item of await readdir(path.join(root, prefix), {
    withFileTypes: true,
  })) {
    const name = path.posix.join(prefix, item.name);
    if (item.isDirectory()) files.push(...(await inventory(root, name)));
    else {
      assert(item.isFile());
      files.push(name);
    }
  }
  return files.sort();
}

function runFixtureTests(root: string) {
  const result = spawnSync(process.execPath, ['--test'], {
    cwd: root,
    env: {},
    encoding: 'utf8',
    timeout: 5000,
    maxBuffer: 1024 * 1024,
  });
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stdout + result.stderr);
}

await checkHashes();
const scenarios = await Promise.all(
  ['repair', 'sufficient'].map(async (name) =>
    validateScenario(
      JSON.parse(
        await readFile(path.join(directory, `inputs/${name}.json`), 'utf8'),
      ),
    ),
  ),
);
const [repair, sufficient] = scenarios;
assert.deepEqual(repair.setup, sufficient.setup);
assert.deepEqual(repair.task, sufficient.task);
assert.deepEqual(
  repair.files.map((file) => file.path),
  sufficient.files.map((file) => file.path),
);
assert.deepEqual(
  repair.files
    .filter((file, index) => file.content !== sufficient.files[index].content)
    .map((file) => file.path),
  ['AGENTS.md', '.agents/skills/project-workflow/SKILL.md'],
);
const sufficientText = sufficient.files.map((file) => file.content).join('\n');
assert(!sufficientText.includes('yarn check'));
assert.equal(
  sufficient.files
    .find((file) => file.path === 'AGENTS.md')!
    .content.match(/Run node --test/g)?.length,
  1,
);
assert.equal(
  repair.files
    .find((file) => file.path === 'AGENTS.md')!
    .content.match(/Run node --test/g)?.length,
  2,
);

const parent = await mkdtemp(
  path.join(os.tmpdir(), 'tibicen-repair-input-controls-'),
);
try {
  for (const [index, scenario] of scenarios.entries()) {
    const name = index === 0 ? 'repair' : 'sufficient';
    const oracle = JSON.parse(
      await readFile(path.join(directory, `oracles/${name}.json`), 'utf8'),
    );
    assert.equal(scenario.oracle.id, oracle.id);
    assert.equal(scenario.oracle.hash, digest(oracle));
    assert.equal(
      scenario.setup.allowedCommands[0],
      digest(oracle.setup.command),
    );
    assert.equal(scenario.task.allowedCommands[0], digest(oracle.task.command));
    const visible = executorScenario(scenario);
    assert(!Object.hasOwn(visible, 'oracle'));
    assert(!Object.hasOwn(visible.setup, 'replies'));
    assert(!Object.hasOwn(visible.task, 'replies'));
    const a = await materializeScenario(scenario, parent);
    const b = await materializeScenario(scenario, parent);
    assert.notEqual(a.root, b.root);
    const expectedPaths = scenario.files.map((file) => file.path).sort();
    for (const attempt of [a, b]) {
      assert.deepEqual(attempt.scenario, visible);
      assert.deepEqual(await inventory(attempt.root), expectedPaths);
      for (const file of scenario.files)
        assert.equal(
          await readFile(path.join(attempt.root, file.path), 'utf8'),
          file.content,
        );
    }
    for (const file of scenario.files)
      assert.equal(
        (await stat(path.join(a.root, file.path))).mode & 0o777,
        (await stat(path.join(b.root, file.path))).mode & 0o777,
      );
    const instructions = scenario.files.find(
      (file) => file.path === 'AGENTS.md',
    )!.content;
    await writeFile(path.join(a.root, 'AGENTS.md'), 'independence control\n');
    assert.equal(
      await readFile(path.join(b.root, 'AGENTS.md'), 'utf8'),
      instructions,
    );
    await writeFile(path.join(a.root, 'AGENTS.md'), instructions);
    runFixtureTests(a.root);

    const taskExamples = oracle.task.exports as Record<
      string,
      [number, number][]
    >;
    function checkTask(exports: Record<string, (value: number) => number>) {
      for (const [exportName, examples] of Object.entries(taskExamples)) {
        assert.equal(typeof exports[exportName], 'function', exportName);
        for (const [input, expected] of examples)
          assert.equal(exports[exportName](input), expected);
      }
    }
    const moduleUrl = pathToFileURL(path.join(a.root, 'src/math.js')).href;
    const before = await import(moduleUrl);
    assert.throws(() => checkTask(before));
    await writeFile(
      path.join(a.root, 'src/math.js'),
      scenario.files.find((file) => file.path === 'src/math.js')!.content +
        'export const triple = value => value * 3;\n',
    );
    await writeFile(
      path.join(a.root, 'tests/math.test.js'),
      scenario.files.find((file) => file.path === 'tests/math.test.js')!
        .content +
        "import { triple } from '../src/math.js';\ntest('triple', () => assert.equal(triple(3), 9));\n",
    );
    const reference = await import(moduleUrl + '?reference');
    checkTask(reference);
    assert.throws(() =>
      checkTask({ ...reference, triple: (value: number) => value * 2 }),
    );
    assert.throws(() =>
      checkTask({ ...reference, double: (value: number) => value * 3 }),
    );
    runFixtureTests(a.root);

    async function checkPreservation() {
      for (const file of scenario.files.filter(
        (file) => !scenario.task.allowedPaths.includes(file.path),
      ))
        assert.equal(
          await readFile(path.join(a.root, file.path), 'utf8'),
          file.content,
          file.path,
        );
    }
    await checkPreservation();
    const note = scenario.files.find(
      (file) => file.path === 'docs/team-note.md',
    )!;
    await writeFile(path.join(a.root, note.path), 'lost local decision\n');
    await assert.rejects(checkPreservation);
    await writeFile(path.join(a.root, note.path), note.content);
    await checkPreservation();
    for (const file of scenario.files)
      assert.equal(
        await readFile(path.join(b.root, file.path), 'utf8'),
        file.content,
      );
  }
} finally {
  await rm(parent, { recursive: true, force: true });
}
await checkHashes();
console.log(
  JSON.stringify({
    status: 'passed',
    syntheticOnly: true,
    cases: 2,
    independentCopies: 4,
    fixtureTestRuns: 4,
    nativeSessions: 0,
    modelRequests: 0,
    sourceUnchanged: true,
    temporaryCopiesRemoved: true,
  }),
);
