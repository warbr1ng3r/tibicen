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
    for (const match of text.matchAll(/\]\(([^)]+\.md)\)/g)) {
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
