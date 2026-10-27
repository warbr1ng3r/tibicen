import test from 'node:test';
import type { TestContext } from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  mkdtemp,
  mkdir,
  readFile,
  writeFile,
  realpath,
  rm,
  symlink,
  lstat,
} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { hashContent } from '../../scripts/core/contracts.ts';

async function fixture(t: TestContext, version?: string) {
  const base = await realpath(
    await mkdtemp(path.join(os.tmpdir(), 'tibicen-build-safety-')),
  );
  const root = path.join(base, 'checkout');
  await mkdir(root);
  for (const name of [
    'scripts',
    'references',
    'skills',
    'LICENSE',
    'package.json',
  ])
    await cp(new URL(`../../${name}`, import.meta.url), path.join(root, name), {
      recursive: true,
    });
  t.after(() => rm(base, { recursive: true, force: true }));
  if (version) {
    const filename = path.join(root, 'package.json');
    const metadata = JSON.parse(await readFile(filename, 'utf8'));
    await writeFile(filename, JSON.stringify({ ...metadata, version }));
  }
  const { buildSkills } = (await import(
    pathToFileURL(path.join(root, 'scripts/build.ts')).href
  )) as typeof import('../../scripts/build.ts');
  const sourceHashes = async () =>
    Promise.all(
      ['tibicen-init', 'tibicen-adopt'].map(async (name) =>
        hashContent(
          await readFile(path.join(root, 'skills', name, 'SKILL.md')),
        ),
      ),
    );
  return { root, base, buildSkills, sourceHashes };
}

for (const kind of [
  'output-link',
  'parent-link',
  'direct-overlap',
  'ancestor',
  'second-target-link',
  'other-source',
  'checksums-link',
]) {
  test(`build rejects ${kind} before deleting either source or output tree`, async (t) => {
    const { root, base, buildSkills, sourceHashes } = await fixture(t);
    const before = await sourceHashes();
    let output = path.join(root, 'dist');
    if (kind === 'output-link')
      await symlink(path.join(root, 'skills'), output);
    if (kind === 'parent-link') {
      await symlink(root, path.join(base, 'alias'));
      output = path.join(base, 'alias', 'skills');
    }
    if (kind === 'direct-overlap') output = path.join(root, 'skills');
    if (kind === 'ancestor') output = base;
    if (kind === 'other-source') {
      output = path.join(root, 'landing');
      await mkdir(path.join(output, 'tibicen-init'), { recursive: true });
      await writeFile(
        path.join(output, 'tibicen-init/source'),
        'Application source.',
      );
    }
    if (kind === 'second-target-link' || kind === 'checksums-link') {
      await mkdir(path.join(output, 'tibicen-init'), { recursive: true });
      await writeFile(
        path.join(output, 'tibicen-init/keep'),
        'Existing first output.',
      );
      if (kind === 'second-target-link')
        await symlink(
          path.join(root, 'skills/tibicen-adopt'),
          path.join(output, 'tibicen-adopt'),
        );
      else
        await symlink(
          path.join(root, 'skills/tibicen-adopt/SKILL.md'),
          path.join(output, 'SHA256SUMS'),
        );
    }
    await assert.rejects(buildSkills(output), { code: 'unsafe-build-path' });
    assert.deepEqual(await sourceHashes(), before);
    if (kind === 'second-target-link' || kind === 'checksums-link')
      assert.equal(
        await readFile(path.join(output, 'tibicen-init/keep'), 'utf8'),
        'Existing first output.',
      );
    if (kind === 'other-source')
      assert.equal(
        await readFile(path.join(output, 'tibicen-init/source'), 'utf8'),
        'Application source.',
      );
  });
}

test('ordinary default and external outputs rebuild with verified checksums', async (t) => {
  const { root, base, buildSkills, sourceHashes } = await fixture(t);
  const before = await sourceHashes();
  for (const output of [undefined, path.join(base, 'external')]) {
    await buildSkills(output);
    const result = await buildSkills(output);
    for (const line of (
      await readFile(path.join(result.output, 'SHA256SUMS'), 'utf8')
    )
      .trim()
      .split('\n')) {
      const [hash, relative] = line.split('  ');
      const filename = path.join(result.output, relative),
        bytes = await readFile(filename);
      assert.equal(hashContent(bytes), hash);
      if (relative.endsWith('.md'))
        for (const [, href] of bytes
          .toString('utf8')
          .matchAll(/\]\(([^)\s]+)\)/g)) {
          if (/^[a-z][a-z0-9+.-]*:|^#/i.test(href)) continue;
          await lstat(
            path.resolve(
              path.dirname(filename),
              decodeURIComponent(href.split('#')[0]),
            ),
          );
        }
    }
    assert(result.files > 50);
    for (const skill of ['tibicen-init', 'tibicen-adopt'])
      for (const excluded of [
        'scripts/evals',
        'tests',
        'docs',
        'openspec',
        '.agents',
        'landing',
        'node_modules',
      ])
        await assert.rejects(lstat(path.join(result.output, skill, excluded)), {
          code: 'ENOENT',
        });
  }
  assert.deepEqual(await sourceHashes(), before);
  assert.equal(
    (
      await readFile(path.join(root, 'dist/tibicen-init/package.json'), 'utf8')
    ).includes('devDependencies'),
    false,
  );
});

test('each standalone skill uses its own package version for CLI and passport independently of schemas', async (t) => {
  const version = '0.2.0-rc.7';
  const { root, base, buildSkills } = await fixture(t, version);
  const output = path.join(base, 'installed');
  await buildSkills(output);
  await rm(root, { recursive: true });
  for (const skill of ['tibicen-init', 'tibicen-adopt']) {
    const installed = path.join(output, skill);
    const metadata = JSON.parse(
      await readFile(path.join(installed, 'package.json'), 'utf8'),
    );
    assert.equal(metadata.version, version);
    const project = path.join(base, `${skill}-project`);
    const home = path.join(base, `${skill}-home`);
    await mkdir(project);
    await mkdir(home);
    const cli = (args: string[], input?: unknown) => {
      const result = spawnSync(
        process.execPath,
        [path.join(installed, 'scripts/tibicen.ts'), ...args],
        {
          cwd: project,
          env: { HOME: home, PATH: '' },
          encoding: 'utf8',
          input: input === undefined ? undefined : JSON.stringify(input),
          timeout: 10000,
        },
      );
      assert.equal(result.status, 0, result.stderr || result.stdout);
      return JSON.parse(result.stdout);
    };
    assert.deepEqual(cli(['version']), { version, schema: 1 });
    assert.equal(cli(['self-test']).version, version);
    const proposal = cli(['proposal', '--input', '-'], {
      mode: 'init',
      changes: [
        {
          path: 'AGENTS.md',
          content: '# Rules\nRead the project before changing it.\n',
          reason: 'Project instructions',
        },
      ],
    });
    cli(['apply', '--plan', '-', '--approve', proposal.digest], proposal);
    const manifest = JSON.parse(
      await readFile(path.join(project, '.tibicen/manifest.yml'), 'utf8'),
    );
    assert.equal(manifest.tibicen.version, version);
    assert.equal(manifest.schema, 2);
  }
});
