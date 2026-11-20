import type { TestContext } from 'node:test';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { scanProject } from '../../scripts/scan/index.ts';

async function fixture(t: TestContext, files: Record<string, string> = {}) {
  const root = await mkdtemp(path.join(tmpdir(), 'tibicen-provenance-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  for (const [name, content] of Object.entries(files)) {
    await mkdir(path.dirname(path.join(root, name)), { recursive: true });
    await writeFile(path.join(root, name), content);
  }
  return root;
}

const canonicalMarker = (name: string, version = '1.7.1') =>
  JSON.stringify({ name, version, private: true, type: 'module' });

// The A5-i3 reproduction: a mimicked name and frontmatter explicitly disclaims
// canonical origin; the directory carries no distribution identity marker.
const lookalikeSkill = `---
name: tibicen-init
description: Quick-start agent bootstrap for repositories. Community quick-start variant maintained by the platform-tools team; independent re-implementation, not affiliated with or distributed by the Tibicen project.
---

# tibicen-init (quick-start variant)

Fast agent bootstrap used by some platform-tools repositories.
`;

test('a name-only tibicen-init lookalike is foreign infrastructure, not an installed canonical skill', async (t) => {
  const root = await fixture(t, {
    '.agents/skills/tibicen-init/SKILL.md': lookalikeSkill,
    '.agents/skills/tibicen-init/references/template.md': '# Quick start\n',
    'package.json': JSON.stringify({
      name: 'app',
      scripts: { test: 'node --test' },
    }),
    'README.md': '# Application\n',
  });
  const scan = await scanProject(root);
  // Names are not provenance: without the distribution identity marker the
  // lookalike files count as foreign infrastructure and the improve hint is
  // retained instead of the defective init classification.
  assert.equal(scan.mode, 'improve');
  assert.equal(scan.kind, 'existing');
  assert(
    scan.files
      .filter((file) => file.path.startsWith('.agents/skills/'))
      .every((file) => file.infrastructure),
  );
  // No gap is invented for ordinary third-party content.
  assert.deepEqual(
    scan.gaps.filter((gap) => gap.path?.startsWith('.agents/skills/')),
    [],
  );
});

test('the same lookalike becomes canonical routing only when it carries the distribution identity marker', async (t) => {
  const root = await fixture(t, {
    '.agents/skills/tibicen-init/SKILL.md': lookalikeSkill,
    '.agents/skills/tibicen-init/package.json': canonicalMarker(
      'tibicen-init',
      '0.1.0-alpha.1',
    ),
  });
  // A marker-bearing install of any published version keeps init routing; the
  // version is carried identity, not a pinned exact release.
  assert.equal((await scanProject(root)).mode, 'init');
});

test('damaged, foreign or version-less identity markers do not establish canonical presence', async (t) => {
  for (const marker of [
    '{ not json',
    JSON.stringify({ name: 'quick-start', version: '1.0.0' }),
    JSON.stringify({ name: 'tibicen-init' }),
    JSON.stringify({ name: 'tibicen-init', version: '' }),
    JSON.stringify({ name: 'tibicen-init', version: 3 }),
  ]) {
    const root = await fixture(t, {
      '.agents/skills/tibicen-init/SKILL.md': lookalikeSkill,
      '.agents/skills/tibicen-init/package.json': marker,
    });
    const scan = await scanProject(root);
    assert.equal(scan.mode, 'improve', marker);
    assert.deepEqual(
      scan.gaps.filter((gap) => gap.path?.startsWith('.agents/skills/')),
      [],
      marker,
    );
  }
});

test('a genuine canonical-only install keeps the init and not-configured routing', async (t) => {
  const root = await fixture(t, {
    '.agents/skills/tibicen-init/SKILL.md': '# Tibicen\n',
    '.agents/skills/tibicen-init/package.json': canonicalMarker('tibicen-init'),
    '.agents/skills/tibicen-adopt/SKILL.md': '# Tibicen\n',
    '.agents/skills/tibicen-adopt/package.json':
      canonicalMarker('tibicen-adopt'),
  });
  const scan = await scanProject(root);
  assert.equal(scan.mode, 'init');
  assert.equal(scan.kind, 'existing');
  assert(scan.files.every((file) => file.infrastructure));
});

test('a third-party skill under an unrelated name retains improve', async (t) => {
  const root = await fixture(t, {
    '.agents/skills/code-review/SKILL.md':
      '---\nname: code-review\n---\n# Third party\n',
    '.agents/skills/code-review/package.json': canonicalMarker('code-review'),
  });
  assert.equal((await scanProject(root)).mode, 'improve');
});

test('a canonical marker applies only to its exact project-relative skill directory', async (t) => {
  for (const [canonical, lookalike] of [
    ['packages/ui/', ''],
    ['packages/ui/', 'packages/api/'],
    ['', 'packages/api/'],
  ]) {
    const root = await fixture(t, {
      [`${canonical}.agents/skills/tibicen-init/SKILL.md`]: '# Tibicen\n',
      [`${canonical}.agents/skills/tibicen-init/package.json`]:
        canonicalMarker('tibicen-init'),
      [`${lookalike}.agents/skills/tibicen-init/SKILL.md`]: lookalikeSkill,
    });
    const scan = await scanProject(root);
    assert.equal(scan.complete, true);
    assert.equal(
      scan.mode,
      'improve',
      `${canonical} must not identify ${lookalike}`,
    );
  }
});
