import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  installationCommand,
  type Manager,
} from '../../landing/src/scripts/install.ts';

test('all command runners keep the exact published distribution and universal target', () => {
  for (const [manager, runner] of [
    ['npm', 'npx'],
    ['pnpm', 'pnpm dlx'],
    ['yarn', 'yarn dlx'],
  ] as const) {
    assert.equal(
      installationCommand(manager as Manager),
      `${runner} skills@1.7.4 add https://github.com/warbr1ng3r/tibicen/tree/381c5d53972b53d60e9a134ec7f620bb7c35e6be -g --agent universal --skill tibicen-init tibicen-adopt --copy`,
    );
  }
});

for (const [locale, filename, summary] of [
  ['en', 'index.html', 'Other installation methods'],
  ['ru', 'ru/index.html', 'Другие способы установки'],
] as const) {
  test(`${locale}: one recommended command and complete optional methods are readable without JavaScript`, async () => {
    const html = await readFile(
      new URL(`../../landing/dist/${filename}`, import.meta.url),
      'utf8',
    );
    const disclosure = html.match(
      /<details\b[^>]*class="installation-alternatives"[^>]*>([\s\S]*?)<\/details>/,
    );
    assert.ok(disclosure, 'Alternative methods use a native disclosure.');
    assert.doesNotMatch(
      disclosure[0].slice(0, disclosure[0].indexOf('>')),
      /\bopen\b/,
    );
    assert.match(
      disclosure[1],
      new RegExp(`<summary\\b[^>]*>\\s*${summary}\\s*<\\/summary>`),
    );
    for (const manager of ['npm', 'pnpm', 'yarn'] as const) {
      const id =
        manager === 'npm' ? 'install-command' : `install-command-${manager}`;
      const command = html.match(
        new RegExp(`<code\\b[^>]*id="${id}"[^>]*>([\\s\\S]*?)<\\/code>`),
      )?.[1];
      assert.equal(command, installationCommand(manager));
      assert.match(html, new RegExp(`data-copy-target="${id}"`));
      assert.equal(disclosure[1].includes(`id="${id}"`), manager !== 'npm');
    }
    assert.match(disclosure[1], /INSTALLATION\.md#manual-archive-installation/);
    assert.doesNotMatch(html, /id="install-(?:controls|manager)/);
  });
}
