import test from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../../', import.meta.url));

test('both skill entrypoints resolve their progressive resources in the packaged layout', async () => {
  const queue = [];
  for (const name of ['tibicen-init', 'tibicen-adopt']) {
    const file = path.join(root, 'skills', name, 'SKILL.md');
    const text = await readFile(file, 'utf8');
    assert.match(
      text,
      new RegExp(`^---\\nname: ${name}\\ndescription: .+\\n---\\n`),
    );
    queue.push({ virtual: 'SKILL.md', text });
  }
  const visited = new Set();
  while (queue.length) {
    const { virtual, text } = queue.shift()!;
    for (const match of text.matchAll(/\]\(([^)]+\.md)(?:#[^)]+)?\)/g)) {
      const link = path.posix.normalize(
        path.posix.join(path.posix.dirname(virtual), match[1]),
      );
      assert.ok(
        link.startsWith('references/'),
        `Resource escapes packaged references: ${link}`,
      );
      if (visited.has(link)) continue;
      visited.add(link);
      const physical = path.join(root, link);
      // The matrix is delivered by the agent adapter task and checked by the distribution build.
      if (link === 'references/agent-matrix.md') continue;
      assert.ok(
        (await stat(physical)).isFile(),
        `Missing packaged resource ${link}`,
      );
      queue.push({ virtual: link, text: await readFile(physical, 'utf8') });
    }
  }
  assert.ok(
    visited.size >= 10,
    'Both entrypoints must reach the complete workflow.',
  );
});

test('both entry flows reach one task-context instruction and carry it through handoff', async () => {
  const read = (name: string) =>
    readFile(path.join(root, 'references', `${name}.md`), 'utf8');
  const context = await read('stage-scan');
  assert.match(context, /^## Контекст задачи$/m);
  assert.match(context, /report --root ROOT --input -/);
  for (const field of ['agent', 'cwd', 'agentVersion', 'targetPath'])
    assert(context.includes(`\`${field}\``) || context.includes(`"${field}"`));
  assert.match(context, /обычный `report --root ROOT`/);
  assert.match(context, /не активный набор инструкций/);

  for (const [skill, stage] of [
    ['tibicen-init', 'stage-scan'],
    ['tibicen-adopt', 'stage-inventory'],
  ]) {
    const entrypoint = await readFile(
      path.join(root, 'skills', skill, 'SKILL.md'),
      'utf8',
    );
    assert(entrypoint.includes(`(references/${stage}.md)`));
  }
  for (const stage of [
    'stage-inventory',
    'stage-agent-arch',
    'stage-verify',
    'stage-handoff',
  ])
    assert(
      (await read(stage)).includes('(stage-scan.md#контекст-задачи)'),
      `${stage} must reach the shared context guidance`,
    );
});

test('both entry flows reach one MCP recipe with a valid metadata-only CLI example', async () => {
  const read = (name: string) =>
    readFile(path.join(root, 'references', `${name}.md`), 'utf8');
  for (const stage of [
    'stage-inventory',
    'stage-agent-arch',
    'stage-verify',
    'stage-handoff',
  ])
    assert(
      (await read(stage)).includes('(mcp-diagnosis.md)'),
      `${stage} must reach the shared MCP recipe`,
    );

  const recipe = await read('mcp-diagnosis');
  assert.match(recipe, /mcp-diagnose --root ROOT --input -/);
  const example = recipe.match(/```json\n([\s\S]*?)\n```/);
  assert(example, 'The recipe must give an executable stdin metadata example.');
  const { validateMcpDiagnosisRequest } =
    await import('../../scripts/mcp/diagnosis.ts');
  const request = validateMcpDiagnosisRequest(JSON.parse(example[1]));
  assert.equal(request.agent, 'cursor');
  assert.equal(request.server, 'docs');
  assert.deepEqual(request.sources, [{ path: '.cursor/mcp.json' }]);
  assert.equal(request.effectiveSource, undefined);
  assert.equal(request.launch, undefined);
});
